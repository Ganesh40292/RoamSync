package com.tripsyncai.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class PlannerRequest {

    @JsonAlias({"destination", "destinationName"})
    private String destinationName;

    @JsonAlias({"days", "daysCount"})
    private Integer daysCount;

    @JsonAlias({"style", "travelStyle"})
    private String travelStyle;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private List<String> interests = new ArrayList<>();

    public String getDestination() {
        return destinationName;
    }

    public Integer getDays() {
        return daysCount;
    }

    public String getStyle() {
        return travelStyle;
    }
}
