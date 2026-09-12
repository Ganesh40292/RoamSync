package com.tripsyncai.mapper;

import com.tripsyncai.dto.*;
import com.tripsyncai.entity.Expense;
import com.tripsyncai.entity.ExpenseSplit;
import com.tripsyncai.entity.Settlement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExpenseMapper {

    private final TripMapper tripMapper;

    public ExpenseSplitResponse toExpenseSplitResponse(ExpenseSplit split) {
        if (split == null) return null;
        return ExpenseSplitResponse.builder()
                .id(split.getId())
                .user(tripMapper.toUserSummary(split.getUser()))
                .amountOwed(split.getAmountOwed())
                .build();
    }

    public ExpenseResponse toExpenseResponse(Expense expense) {
        if (expense == null) return null;

        List<ExpenseSplitResponse> splitResponses = expense.getSplits() != null
                ? expense.getSplits().stream().map(this::toExpenseSplitResponse).collect(Collectors.toList())
                : Collections.emptyList();

        List<UserSummaryResponse> sharerResponses = expense.getSharedWith() != null
                ? expense.getSharedWith().stream().map(tripMapper::toUserSummary).collect(Collectors.toList())
                : Collections.emptyList();

        return ExpenseResponse.builder()
                .id(expense.getId())
                .tripId(expense.getTrip() != null ? expense.getTrip().getId() : null)
                .amount(expense.getAmount())
                .currency(expense.getCurrency())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .expenseDate(expense.getExpenseDate())
                .payer(tripMapper.toUserSummary(expense.getPayer()))
                .splits(splitResponses)
                .sharedWith(sharerResponses)
                .createdAt(expense.getCreatedAt())
                .build();
    }

    public SettlementResponse toSettlementResponse(Settlement settlement) {
        if (settlement == null) return null;
        return SettlementResponse.builder()
                .id(settlement.getId())
                .tripId(settlement.getTrip() != null ? settlement.getTrip().getId() : null)
                .fromUser(settlement.getDebtor() != null ? settlement.getDebtor().getUsername() : null)
                .toUser(settlement.getCreditor() != null ? settlement.getCreditor().getUsername() : null)
                .debtor(tripMapper.toUserSummary(settlement.getDebtor()))
                .creditor(tripMapper.toUserSummary(settlement.getCreditor()))
                .amount(settlement.getAmount())
                .currency(settlement.getCurrency())
                .status(settlement.getStatus())
                .settledAt(settlement.getSettledAt())
                .createdAt(settlement.getCreatedAt())
                .build();
    }
}
