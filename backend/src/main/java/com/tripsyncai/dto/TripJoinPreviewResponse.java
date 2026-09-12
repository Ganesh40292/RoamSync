package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripJoinPreviewResponse {
    private Long tripId;
    private String tripName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String baseCurrency;
    private String inviterUsername;
    private String inviterFullName;
    private int memberCount;

    @Builder.Default
    private List<String> memberNames = new ArrayList<>();

    private boolean valid;
}
