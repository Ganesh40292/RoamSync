package com.tripsyncai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Pattern(regexp = "^[A-Z]{3}$", message = "Base currency must be a 3-letter ISO code")
    @Builder.Default
    private String baseCurrency = "USD";

    @Builder.Default
    private List<String> memberUsernames = new ArrayList<>();

    @Builder.Default
    private List<TripRequest.DestinationInfo> destinations = new ArrayList<>();
}
