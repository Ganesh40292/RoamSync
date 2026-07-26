package com.tripsyncai.service;

import com.tripsyncai.dto.ExpenseRequest;
import com.tripsyncai.entity.Expense;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.ExpenseRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public Expense addExpense(Long tripId, ExpenseRequest request, User defaultPayer) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User payer = defaultPayer;
        if (request.getPayerId() != null) {
            payer = userRepository.findById(request.getPayerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payer not found with id: " + request.getPayerId()));
        }

        List<User> sharers = new ArrayList<>();
        if (request.getSharedWithUsernames() != null && !request.getSharedWithUsernames().isEmpty()) {
            for (String username : request.getSharedWithUsernames()) {
                userRepository.findByUsername(username).ifPresent(sharers::add);
            }
        } else {
            sharers.addAll(trip.getMembers());
        }

        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .category(request.getCategory())
                .payer(payer)
                .trip(trip)
                .sharedWith(sharers)
                .build();

        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesForTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return expenseRepository.findByTrip(trip);
    }

    public Map<String, Double> calculateBalances(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        List<Expense> expenses = expenseRepository.findByTrip(trip);
        Map<String, Double> balances = new HashMap<>();

        for (User member : trip.getMembers()) {
            balances.put(member.getUsername(), 0.0);
        }

        for (Expense expense : expenses) {
            String payerUsername = expense.getPayer().getUsername();
            double amount = expense.getAmount();

            balances.put(payerUsername, balances.getOrDefault(payerUsername, 0.0) + amount);

            List<User> sharers = expense.getSharedWith();
            if (sharers != null && !sharers.isEmpty()) {
                double splitShare = amount / sharers.size();
                for (User sharer : sharers) {
                    String sharerUsername = sharer.getUsername();
                    balances.put(sharerUsername, balances.getOrDefault(sharerUsername, 0.0) - splitShare);
                }
            }
        }

        return balances;
    }

    public List<Map<String, Object>> calculateSimplifiedSettlements(Long tripId) {
        Map<String, Double> netBalances = calculateBalances(tripId);

        PriorityQueue<Map.Entry<String, Double>> debtors = new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));
        PriorityQueue<Map.Entry<String, Double>> creditors = new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue()));

        for (Map.Entry<String, Double> entry : netBalances.entrySet()) {
            double bal = Math.round(entry.getValue() * 100.0) / 100.0;
            if (bal < -0.01) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), bal));
            } else if (bal > 0.01) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), bal));
            }
        }

        List<Map<String, Object>> settlements = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            Map.Entry<String, Double> debtor = debtors.poll();
            Map.Entry<String, Double> creditor = creditors.poll();

            double debtAmount = -debtor.getValue();
            double creditAmount = creditor.getValue();

            double settledAmount = Math.min(debtAmount, creditAmount);
            settledAmount = Math.round(settledAmount * 100.0) / 100.0;

            if (settledAmount > 0) {
                Map<String, Object> settlement = new HashMap<>();
                settlement.put("fromUser", debtor.getKey());
                settlement.put("toUser", creditor.getKey());
                settlement.put("amount", settledAmount);
                settlements.add(settlement);
            }

            double remainingDebt = debtAmount - settledAmount;
            double remainingCredit = creditAmount - settledAmount;

            if (remainingDebt > 0.01) {
                debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), -remainingDebt));
            }

            if (remainingCredit > 0.01) {
                creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remainingCredit));
            }
        }

        return settlements;
    }
}
