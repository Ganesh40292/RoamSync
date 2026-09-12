package com.tripsyncai.controller;

import com.tripsyncai.dto.CreateInvitationRequest;
import com.tripsyncai.dto.InvitationResponse;
import com.tripsyncai.dto.JoinTripRequest;
import com.tripsyncai.dto.TripJoinPreviewResponse;
import com.tripsyncai.entity.User;
import com.tripsyncai.service.TripInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripInvitationController {

    private final TripInvitationService tripInvitationService;

    @PostMapping("/{tripId}/invitations")
    public ResponseEntity<InvitationResponse> createInvitation(
            @PathVariable Long tripId,
            @RequestBody(required = false) CreateInvitationRequest request,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripInvitationService.createInvitation(tripId, request, caller));
    }

    @GetMapping("/join/preview")
    public ResponseEntity<TripJoinPreviewResponse> previewInvitation(@RequestParam("token") String token) {
        return ResponseEntity.ok(tripInvitationService.previewInvitation(token));
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinTrip(
            @Valid @RequestBody JoinTripRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(tripInvitationService.joinTrip(request, user));
    }
}
