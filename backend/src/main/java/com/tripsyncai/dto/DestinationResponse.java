package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String description;
}
