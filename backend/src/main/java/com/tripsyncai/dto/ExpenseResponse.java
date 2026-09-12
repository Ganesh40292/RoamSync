package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private Long tripId;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String category;
    private LocalDate expenseDate;
    private UserSummaryResponse payer;
    @Builder.Default
    private List<ExpenseSplitResponse> splits = new ArrayList<>();
    @Builder.Default
    private List<UserSummaryResponse> sharedWith = new ArrayList<>();
    private LocalDateTime createdAt;
}
