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
public class TripRequest {
    private String name;
    private String description;
    private String startDate;
    private String endDate;

    @Builder.Default
    private List<String> memberUsernames = new ArrayList<>();

    @Builder.Default
    private List<DestinationInfo> destinations = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DestinationInfo {
        private String name;
        private Double latitude;
        private Double longitude;
        private String description;
    }
}
