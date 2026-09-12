package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollResponse {
    private Long id;
    private Long tripId;
    private String question;
    private UserSummaryResponse creator;
    @Builder.Default
    private List<PollOptionResponse> options = new ArrayList<>();
    private int totalVotes;
    private LocalDateTime createdAt;
}
