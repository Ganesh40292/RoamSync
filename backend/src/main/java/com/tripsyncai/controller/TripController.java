package com.tripsyncai.controller;

import com.tripsyncai.dto.TripRequest;
import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.Trip;
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
    public ResponseEntity<Trip> createTrip(@RequestBody TripRequest request, @AuthenticationPrincipal User owner) {
        return ResponseEntity.ok(tripService.createTrip(request, owner));
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tripService.getAllTripsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.updateTrip(id, request));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Trip> addMember(@PathVariable Long id, @RequestParam String username) {
        return ResponseEntity.ok(tripService.addMemberToTrip(id, username));
    }

    @DeleteMapping("/{id}/members")
    public ResponseEntity<Trip> removeMember(@PathVariable Long id, @RequestParam String username) {
        return ResponseEntity.ok(tripService.removeMemberFromTrip(id, username));
    }

    @PostMapping("/{id}/itineraries")
    public ResponseEntity<Trip> addItinerary(@PathVariable Long id, @RequestBody Itinerary itinerary) {
        return ResponseEntity.ok(tripService.addItinerary(id, itinerary));
    }
}
