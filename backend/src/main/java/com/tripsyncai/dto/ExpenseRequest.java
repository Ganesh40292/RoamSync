package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequest {
    private Double amount;
    private String description;
    private String category;
    private Long payerId;

    @Builder.Default
    private List<String> sharedWithUsernames = new ArrayList<>();
}
