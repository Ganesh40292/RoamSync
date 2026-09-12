package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationResponse {
    private Long id;
    private Long tripId;
    private String tripName;
    private String inviterUsername;
    private String inviteToken;
    private String joinUrl;
    private LocalDateTime expiresAt;
    private String status;
}
