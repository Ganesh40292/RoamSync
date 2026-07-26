package com.tripsyncai.service;

import com.tripsyncai.dto.TripRequest;
import com.tripsyncai.entity.Destination;
import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public Trip createTrip(TripRequest request, User owner) {
        LocalDate startDate = DateUtils.parseDate(request.getStartDate());
        LocalDate endDate = DateUtils.parseDate(request.getEndDate());

        if (!DateUtils.isValidRange(startDate, endDate)) {
            throw new IllegalArgumentException("Invalid date range: Start date must be before or equal to end date");
        }

        Trip trip = Trip.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startDate(startDate)
                .endDate(endDate)
                .owner(owner)
                .members(new ArrayList<>())
                .build();

        trip.getMembers().add(owner);

        if (request.getMemberUsernames() != null) {
            for (String username : request.getMemberUsernames()) {
                userRepository.findByUsername(username).ifPresent(user -> {
                    if (!trip.getMembers().contains(user)) {
                        trip.getMembers().add(user);
                    }
                });
            }
        }

        if (request.getDestinations() != null) {
            List<Destination> destinations = request.getDestinations().stream()
                    .map(dInfo -> Destination.builder()
                            .name(dInfo.getName())
                            .latitude(dInfo.getLatitude())
                            .longitude(dInfo.getLongitude())
                            .description(dInfo.getDescription())
                            .trip(trip)
                            .build())
                    .collect(Collectors.toList());
            trip.setDestinations(destinations);
        }

        return tripRepository.save(trip);
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    public List<Trip> getAllTripsForUser(User user) {
        List<Trip> owned = tripRepository.findByOwner(user);
        List<Trip> memberOf = tripRepository.findByMembersContaining(user);

        List<Trip> allTrips = new ArrayList<>(owned);
        for (Trip trip : memberOf) {
            if (!allTrips.contains(trip)) {
                allTrips.add(trip);
            }
        }
        return allTrips;
    }

    @Transactional
    public Trip updateTrip(Long id, TripRequest request) {
        Trip trip = getTripById(id);
        trip.setName(request.getName());
        trip.setDescription(request.getDescription());

        LocalDate startDate = DateUtils.parseDate(request.getStartDate());
        LocalDate endDate = DateUtils.parseDate(request.getEndDate());
        if (DateUtils.isValidRange(startDate, endDate)) {
            trip.setStartDate(startDate);
            trip.setEndDate(endDate);
        }

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip addMemberToTrip(Long tripId, String username) {
        Trip trip = getTripById(tripId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!trip.getMembers().contains(user)) {
            trip.getMembers().add(user);
        }
        return tripRepository.save(trip);
    }

    @Transactional
    public Trip removeMemberFromTrip(Long tripId, String username) {
        Trip trip = getTripById(tripId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        trip.getMembers().remove(user);
        return tripRepository.save(trip);
    }

    @Transactional
    public Trip addItinerary(Long tripId, Itinerary itinerary) {
        Trip trip = getTripById(tripId);
        itinerary.setTrip(trip);
        trip.getItineraries().add(itinerary);
        return tripRepository.save(trip);
    }
}
