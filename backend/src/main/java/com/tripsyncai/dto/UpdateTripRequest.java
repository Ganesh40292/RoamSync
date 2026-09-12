package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTripRequest {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String baseCurrency;
}
