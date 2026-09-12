package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String baseCurrency;
    private String ownerUsername;
    private Long ownerId;
    private int memberCount;

    @Builder.Default
    private List<UserSummaryResponse> members = new ArrayList<>();

    private LocalDateTime createdAt;
}
