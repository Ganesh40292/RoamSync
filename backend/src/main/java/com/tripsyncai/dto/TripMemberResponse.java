package com.tripsyncai.dto;

import com.tripsyncai.entity.TripRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMemberResponse {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private TripRole role;
    private LocalDateTime joinedAt;
}
