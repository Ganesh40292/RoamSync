package com.tripsyncai.service;

import com.tripsyncai.entity.SecurityAuditLog;
import com.tripsyncai.repository.SecurityAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityAuditService {

    private final SecurityAuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(Long tripId, Long userId, String action, String details, String ipAddress) {
        try {
            SecurityAuditLog auditLog = SecurityAuditLog.builder()
                    .tripId(tripId)
                    .userId(userId)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
            log.info("SECURITY AUDIT: action={}, tripId={}, userId={}, details={}", action, tripId, userId, details);
        } catch (Exception e) {
            log.error("Failed to persist security audit event: {}", e.getMessage(), e);
        }
    }
}
