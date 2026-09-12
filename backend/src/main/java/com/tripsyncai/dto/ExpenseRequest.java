package com.tripsyncai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequest {

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.01", message = "Expense amount must be greater than zero")
    private BigDecimal amount;

    private String currency;

    @NotBlank(message = "Expense description is required")
    private String description;

    private String category;

    private Long payerId;

    private String payerUsername;

    @Builder.Default
    private List<String> sharedWithUsernames = new ArrayList<>();

    @Builder.Default
    private List<ExpenseSplitRequest> splits = new ArrayList<>();
}
