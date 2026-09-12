package com.tripsyncai.service;

import com.tripsyncai.dto.*;
import com.tripsyncai.entity.*;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.mapper.ExpenseMapper;
import com.tripsyncai.repository.ExpenseRepository;
import com.tripsyncai.repository.SettlementRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripAuthorizationService tripAuthorizationService;
    private final ExpenseMapper expenseMapper;

    @Transactional
    public ExpenseResponse addExpense(Long tripId, ExpenseRequest request, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.MEMBER);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User payer = caller;
        if (request.getPayerId() != null) {
            payer = userRepository.findById(request.getPayerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payer not found with id: " + request.getPayerId()));
        } else if (request.getPayerUsername() != null && !request.getPayerUsername().isBlank()) {
            payer = userRepository.findByUsername(request.getPayerUsername().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Payer not found with username: " + request.getPayerUsername()));
        }

        BigDecimal totalAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be greater than zero");
        }

        Expense expense = Expense.builder()
                .trip(trip)
                .payer(payer)
                .amount(totalAmount)
                .currency(request.getCurrency() != null && !request.getCurrency().isBlank()
                        ? request.getCurrency().trim().toUpperCase()
                        : trip.getBaseCurrency())
                .description(request.getDescription().trim())
                .category(request.getCategory() != null ? request.getCategory().trim() : "OTHER")
                .build();

        List<ExpenseSplit> splits = new ArrayList<>();
        List<User> sharers = new ArrayList<>();

        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            BigDecimal splitSum = BigDecimal.ZERO;
            for (ExpenseSplitRequest splitReq : request.getSplits()) {
                User splitUser = null;
                if (splitReq.getUserId() != null) {
                    splitUser = userRepository.findById(splitReq.getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + splitReq.getUserId()));
                } else if (splitReq.getUsername() != null && !splitReq.getUsername().isBlank()) {
                    splitUser = userRepository.findByUsername(splitReq.getUsername().trim())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + splitReq.getUsername()));
                }
                if (splitUser == null) {
                    throw new IllegalArgumentException("Each split must specify a valid user");
                }

                BigDecimal splitAmount = splitReq.getAmountOwed().setScale(2, RoundingMode.HALF_UP);
                if (splitAmount.compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("Split amount cannot be negative");
                }

                splitSum = splitSum.add(splitAmount);
                sharers.add(splitUser);

                splits.add(ExpenseSplit.builder()
                        .expense(expense)
                        .user(splitUser)
                        .amountOwed(splitAmount)
                        .build());
            }

            if (splitSum.compareTo(totalAmount) != 0) {
                throw new IllegalArgumentException(
                        String.format("Split amounts sum to %s, which does not equal the expense total of %s", splitSum, totalAmount)
                );
            }
        } else {
            // Default equal division
            if (request.getSharedWithUsernames() != null && !request.getSharedWithUsernames().isEmpty()) {
                for (String username : request.getSharedWithUsernames()) {
                    userRepository.findByUsername(username.trim()).ifPresent(sharers::add);
                }
            } else {
                sharers.addAll(trip.getMembers());
            }

            if (sharers.isEmpty()) {
                sharers.add(payer);
            }

            // Exact penny preservation algorithm using integer cents
            int count = sharers.size();
            long totalCents = totalAmount.movePointRight(2).longValueExact();
            long baseCents = totalCents / count;
            long remainderCents = totalCents % count;

            for (int i = 0; i < count; i++) {
                User sharer = sharers.get(i);
                long shareInCents = baseCents + (i < remainderCents ? 1 : 0);
                BigDecimal share = BigDecimal.valueOf(shareInCents, 2);
                splits.add(ExpenseSplit.builder()
                        .expense(expense)
                        .user(sharer)
                        .amountOwed(share)
                        .build());
            }
        }

        expense.setSharedWith(sharers);
        expense.setSplits(splits);

        Expense savedExpense = expenseRepository.save(expense);
        syncSimplifiedSettlements(tripId);

        return expenseMapper.toExpenseResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesForTrip(Long tripId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return expenseRepository.findByTrip(trip).stream()
                .map(expenseMapper::toExpenseResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> calculateBalances(Long tripId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);
        return computeNetBalances(tripId);
    }

    private Map<String, BigDecimal> computeNetBalances(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Map<String, BigDecimal> netBalances = new HashMap<>();
        for (User member : trip.getMembers()) {
            netBalances.put(member.getUsername(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        List<Expense> expenses = expenseRepository.findByTrip(trip);
        for (Expense expense : expenses) {
            String payerUsername = expense.getPayer().getUsername();
            BigDecimal expenseAmount = expense.getAmount().setScale(2, RoundingMode.HALF_UP);

            netBalances.put(payerUsername, netBalances.getOrDefault(payerUsername, BigDecimal.ZERO).add(expenseAmount));

            if (expense.getSplits() != null && !expense.getSplits().isEmpty()) {
                for (ExpenseSplit split : expense.getSplits()) {
                    String splitUsername = split.getUser().getUsername();
                    BigDecimal owed = split.getAmountOwed().setScale(2, RoundingMode.HALF_UP);
                    netBalances.put(splitUsername, netBalances.getOrDefault(splitUsername, BigDecimal.ZERO).subtract(owed));
                }
            } else if (expense.getSharedWith() != null && !expense.getSharedWith().isEmpty()) {
                int size = expense.getSharedWith().size();
                long totalCents = expenseAmount.movePointRight(2).longValueExact();
                long baseCents = totalCents / size;
                long remainderCents = totalCents % size;

                for (int i = 0; i < size; i++) {
                    User sharer = expense.getSharedWith().get(i);
                    long shareInCents = baseCents + (i < remainderCents ? 1 : 0);
                    BigDecimal share = BigDecimal.valueOf(shareInCents, 2);
                    netBalances.put(sharer.getUsername(), netBalances.getOrDefault(sharer.getUsername(), BigDecimal.ZERO).subtract(share));
                }
            }
        }

        // Account for already SETTLED settlements
        List<Settlement> existingSettlements = settlementRepository.findByTripOrderByCreatedAtDesc(trip);
        for (Settlement s : existingSettlements) {
            if ("SETTLED".equalsIgnoreCase(s.getStatus())) {
                String debtorUsername = s.getDebtor().getUsername();
                String creditorUsername = s.getCreditor().getUsername();
                BigDecimal amount = s.getAmount().setScale(2, RoundingMode.HALF_UP);

                // Debtor paid, so their net balance increases by amount (moves toward zero or positive)
                netBalances.put(debtorUsername, netBalances.getOrDefault(debtorUsername, BigDecimal.ZERO).add(amount));
                // Creditor was reimbursed, so their net balance decreases by amount
                netBalances.put(creditorUsername, netBalances.getOrDefault(creditorUsername, BigDecimal.ZERO).subtract(amount));
            }
        }

        return netBalances;
    }

    @Transactional
    public List<SettlementResponse> getSettlements(Long tripId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);
        syncSimplifiedSettlements(tripId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        return settlementRepository.findByTripOrderByCreatedAtDesc(trip).stream()
                .map(expenseMapper::toSettlementResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void syncSimplifiedSettlements(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Map<String, BigDecimal> netBalances = computeNetBalances(tripId);

        // Min-debt and max-credit priority queues for debt simplification
        PriorityQueue<Map.Entry<String, BigDecimal>> debtors = new PriorityQueue<>(
                Comparator.comparing(Map.Entry::getValue)
        );
        PriorityQueue<Map.Entry<String, BigDecimal>> creditors = new PriorityQueue<>(
                (a, b) -> b.getValue().compareTo(a.getValue())
        );

        BigDecimal threshold = new BigDecimal("0.01");
        for (Map.Entry<String, BigDecimal> entry : netBalances.entrySet()) {
            BigDecimal val = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (val.compareTo(threshold.negate()) <= 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), val));
            } else if (val.compareTo(threshold) >= 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), val));
            }
        }

        // Remove old PENDING settlements
        settlementRepository.deleteByTripAndStatus(trip, "PENDING");

        List<Settlement> newPendingSettlements = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            Map.Entry<String, BigDecimal> debtorEntry = debtors.poll();
            Map.Entry<String, BigDecimal> creditorEntry = creditors.poll();

            BigDecimal debtAmount = debtorEntry.getValue().abs();
            BigDecimal creditAmount = creditorEntry.getValue();

            BigDecimal settledAmount = debtAmount.min(creditAmount).setScale(2, RoundingMode.HALF_UP);

            if (settledAmount.compareTo(BigDecimal.ZERO) > 0) {
                User debtor = userRepository.findByUsername(debtorEntry.getKey()).orElse(null);
                User creditor = userRepository.findByUsername(creditorEntry.getKey()).orElse(null);

                if (debtor != null && creditor != null) {
                    newPendingSettlements.add(Settlement.builder()
                            .trip(trip)
                            .debtor(debtor)
                            .creditor(creditor)
                            .amount(settledAmount)
                            .currency(trip.getBaseCurrency())
                            .status("PENDING")
                            .build());
                }
            }

            BigDecimal remainingDebt = debtAmount.subtract(settledAmount).setScale(2, RoundingMode.HALF_UP);
            BigDecimal remainingCredit = creditAmount.subtract(settledAmount).setScale(2, RoundingMode.HALF_UP);

            if (remainingDebt.compareTo(threshold) >= 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(debtorEntry.getKey(), remainingDebt.negate()));
            }
            if (remainingCredit.compareTo(threshold) >= 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(creditorEntry.getKey(), remainingCredit));
            }
        }

        if (!newPendingSettlements.isEmpty()) {
            settlementRepository.saveAll(newPendingSettlements);
        }
    }

    @Transactional
    public SettlementResponse settleSettlement(Long tripId, Long settlementId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.MEMBER);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Settlement settlement = settlementRepository.findByIdAndTrip(settlementId, trip)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found with id: " + settlementId));

        boolean isDebtor = caller.getId().equals(settlement.getDebtor().getId());
        boolean isCreditor = caller.getId().equals(settlement.getCreditor().getId());
        boolean isOwner = caller.getId().equals(trip.getOwner().getId());

        if (!isDebtor && !isCreditor && !isOwner) {
            throw new AccessDeniedException("Only the debtor, creditor, or trip owner can mark this settlement as settled.");
        }

        if (!"SETTLED".equalsIgnoreCase(settlement.getStatus())) {
            settlement.setStatus("SETTLED");
            settlement.setSettledAt(LocalDateTime.now());
            settlementRepository.save(settlement);
            syncSimplifiedSettlements(tripId);
        }

        return expenseMapper.toSettlementResponse(settlement);
    }
}
