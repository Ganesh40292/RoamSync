package com.tripsyncai.controller;

import com.tripsyncai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(adminService.getSystemMetrics());
    }

    @DeleteMapping("/trips/{tripId}")
    public ResponseEntity<Void> forceDeleteTrip(@PathVariable Long tripId) {
        adminService.deleteTripAdmin(tripId);
        return ResponseEntity.noContent().build();
    }
}
