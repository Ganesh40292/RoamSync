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
public class ItineraryResponse {
    private Long id;
    private Integer dayNumber;
    private LocalDate activityDate;
    private String title;
    private String description;
    private String locationName;
    private String timeSlot;
    private Integer sortOrder;
}
