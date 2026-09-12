package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementResponse {
    private Long id;
    private Long tripId;
    private String fromUser;
    private String toUser;
    private UserSummaryResponse debtor;
    private UserSummaryResponse creditor;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
