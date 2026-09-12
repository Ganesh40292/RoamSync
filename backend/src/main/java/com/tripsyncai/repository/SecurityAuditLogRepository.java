package com.tripsyncai.repository;

import com.tripsyncai.entity.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {
    List<SecurityAuditLog> findByTripIdOrderByCreatedAtDesc(Long tripId);
    List<SecurityAuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
