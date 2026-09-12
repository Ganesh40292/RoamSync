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
public class TripDetailResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String baseCurrency;
    private UserSummaryResponse owner;

    @Builder.Default
    private List<TripMemberResponse> members = new ArrayList<>();

    @Builder.Default
    private List<DestinationResponse> destinations = new ArrayList<>();

    @Builder.Default
    private List<ItineraryResponse> itineraries = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
