package com.tripsyncai.controller;

import com.tripsyncai.dto.TripDetailResponse;
import com.tripsyncai.dto.TripRequest;
import com.tripsyncai.dto.TripResponse;
import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.User;
import com.tripsyncai.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripDetailResponse> createTrip(
            @RequestBody TripRequest request,
            @AuthenticationPrincipal User owner
    ) {
        return ResponseEntity.ok(tripService.createTrip(request, owner));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tripService.getAllTripsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDetailResponse> getTripById(
            @PathVariable Long id,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.getTripById(id, caller));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDetailResponse> updateTrip(
            @PathVariable Long id,
            @RequestBody TripRequest request,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.updateTrip(id, request, caller));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long id,
            @AuthenticationPrincipal User caller
    ) {
        tripService.deleteTrip(id, caller);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/owner/transfer")
    public ResponseEntity<TripDetailResponse> transferOwnership(
            @PathVariable Long id,
            @RequestParam Long targetUserId,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.transferOwnership(id, targetUserId, caller));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<TripDetailResponse> addMember(
            @PathVariable Long id,
            @RequestParam String username,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.addMemberToTrip(id, username, caller));
    }

    @DeleteMapping("/{id}/members")
    public ResponseEntity<TripDetailResponse> removeMember(
            @PathVariable Long id,
            @RequestParam String username,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.removeMemberFromTrip(id, username, caller));
    }

    @PostMapping("/{id}/itineraries")
    public ResponseEntity<TripDetailResponse> addItinerary(
            @PathVariable Long id,
            @RequestBody Itinerary itinerary,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripService.addItinerary(id, itinerary, caller));
    }
}
