package com.tripsyncai.service;

import com.tripsyncai.dto.*;
import com.tripsyncai.entity.*;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.*;
import com.tripsyncai.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;
    private final TripAuthorizationService tripAuthorizationService;
    private final SecurityAuditService securityAuditService;
    private final TripMapper tripMapper;

    @Transactional
    public TripDetailResponse createTrip(TripRequest request, User owner) {
        LocalDate startDate = DateUtils.parseDate(request.getStartDate());
        LocalDate endDate = DateUtils.parseDate(request.getEndDate());

        if (!DateUtils.isValidRange(startDate, endDate)) {
            throw new IllegalArgumentException("Invalid date range: Start date must be before or equal to end date");
        }

        String tripName = request.getName();
        if (tripName == null || tripName.trim().isEmpty()) {
            throw new IllegalArgumentException("Trip name cannot be blank");
        }

        String baseCurrency = request.getBaseCurrency();
        if (baseCurrency == null || baseCurrency.isBlank()) {
            baseCurrency = "USD";
        }

        Trip trip = Trip.builder()
                .name(tripName.trim())
                .description(request.getDescription())
                .startDate(startDate)
                .endDate(endDate)
                .baseCurrency(baseCurrency.trim().toUpperCase())
                .owner(owner)
                .build();

        final Trip savedTrip = tripRepository.save(trip);

        // Explicitly create OWNER membership record
        TripMember ownerMember = TripMember.builder()
                .trip(savedTrip)
                .user(owner)
                .role(TripRole.OWNER)
                .joinedAt(LocalDateTime.now())
                .build();
        tripMemberRepository.save(ownerMember);

        List<TripMember> membersList = new ArrayList<>();
        membersList.add(ownerMember);

        if (request.getMemberUsernames() != null) {
            for (String username : request.getMemberUsernames()) {
                if (username == null || username.isBlank() || username.equalsIgnoreCase(owner.getUsername())) {
                    continue;
                }
                userRepository.findByUsername(username.trim()).ifPresent(user -> {
                    if (!tripMemberRepository.existsByTripIdAndUserId(savedTrip.getId(), user.getId())) {
                        TripMember member = TripMember.builder()
                                .trip(savedTrip)
                                .user(user)
                                .role(TripRole.MEMBER)
                                .joinedAt(LocalDateTime.now())
                                .build();
                        membersList.add(tripMemberRepository.save(member));
                    }
                });
            }
        }

        Trip finalTrip = savedTrip;
        if (request.getDestinations() != null) {
            List<Destination> destinations = request.getDestinations().stream()
                    .map(dInfo -> Destination.builder()
                            .name(dInfo.getName())
                            .latitude(dInfo.getLatitude())
                            .longitude(dInfo.getLongitude())
                            .description(dInfo.getDescription())
                            .trip(savedTrip)
                            .build())
                    .collect(Collectors.toList());
            savedTrip.setDestinations(destinations);
            finalTrip = tripRepository.save(savedTrip);
        }

        return tripMapper.toTripDetailResponse(finalTrip, membersList);
    }

    @Transactional(readOnly = true)
    public TripDetailResponse getTripById(Long id, User caller) {
        tripAuthorizationService.verifyRole(id, caller, TripRole.VIEWER);
        Trip trip = getTripEntity(id);
        List<TripMember> members = tripMemberRepository.findByTripId(id);
        return tripMapper.toTripDetailResponse(trip, members);
    }

    @Transactional(readOnly = true)
    public Trip getTripEntity(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getAllTripsForUser(User user) {
        List<Trip> owned = tripRepository.findByOwner(user);
        List<Trip> memberOf = tripRepository.findTripsByMemberUser(user);

        Map<Long, Trip> tripMap = new LinkedHashMap<>();
        for (Trip trip : owned) {
            tripMap.put(trip.getId(), trip);
        }
        for (Trip trip : memberOf) {
            tripMap.put(trip.getId(), trip);
        }

        List<TripResponse> responses = new ArrayList<>();
        for (Trip trip : tripMap.values()) {
            List<TripMember> members = tripMemberRepository.findByTripId(trip.getId());
            List<UserSummaryResponse> memberSummaries = members.stream()
                    .map(TripMember::getUser)
                    .filter(Objects::nonNull)
                    .map(tripMapper::toUserSummary)
                    .collect(Collectors.toList());
            responses.add(tripMapper.toTripResponse(trip, members.size(), memberSummaries));
        }
        return responses;
    }

    @Transactional
    public TripDetailResponse updateTrip(Long id, TripRequest request, User caller) {
        tripAuthorizationService.verifyOwner(id, caller);
        Trip trip = getTripEntity(id);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            trip.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            trip.setDescription(request.getDescription());
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = DateUtils.parseDate(request.getStartDate());
            LocalDate endDate = DateUtils.parseDate(request.getEndDate());
            if (DateUtils.isValidRange(startDate, endDate)) {
                trip.setStartDate(startDate);
                trip.setEndDate(endDate);
            }
        }

        if (request.getBaseCurrency() != null && !request.getBaseCurrency().isBlank()) {
            trip.setBaseCurrency(request.getBaseCurrency().trim().toUpperCase());
        }

        Trip updatedTrip = tripRepository.save(trip);
        List<TripMember> members = tripMemberRepository.findByTripId(id);
        return tripMapper.toTripDetailResponse(updatedTrip, members);
    }

    @Transactional
    public void deleteTrip(Long id, User caller) {
        tripAuthorizationService.verifyOwner(id, caller);
        Trip trip = getTripEntity(id);

        // Service-level cascading cleanup
        List<TripMember> members = tripMemberRepository.findByTripId(id);
        tripMemberRepository.deleteAll(members);

        tripRepository.delete(trip);
        securityAuditService.recordEvent(id, caller.getId(), "TRIP_DELETED", "Trip deleted by owner " + caller.getUsername(), null);
    }

    @Transactional
    public TripDetailResponse transferOwnership(Long tripId, Long targetUserId, User currentOwner) {
        tripAuthorizationService.verifyOwner(tripId, currentOwner);
        Trip trip = getTripEntity(tripId);

        if (currentOwner.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("User is already the trip owner");
        }

        TripMember targetMember = tripMemberRepository.findByTripIdAndUserId(tripId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user is not a member of this trip"));

        if (targetMember.getRole() == TripRole.VIEWER) {
            throw new IllegalArgumentException("Cannot transfer ownership to a VIEWER. Promote user to MEMBER first.");
        }

        TripMember ownerMember = tripMemberRepository.findByTripIdAndUserId(tripId, currentOwner.getId())
                .orElseThrow(() -> new IllegalStateException("Current owner membership not found"));

        // Demote current owner to ORGANIZER
        ownerMember.setRole(TripRole.ORGANIZER);
        tripMemberRepository.save(ownerMember);

        // Promote target to OWNER
        targetMember.setRole(TripRole.OWNER);
        tripMemberRepository.save(targetMember);

        trip.setOwner(targetMember.getUser());
        Trip updatedTrip = tripRepository.save(trip);

        securityAuditService.recordEvent(
                tripId,
                currentOwner.getId(),
                "OWNER_TRANSFER",
                String.format("Ownership transferred from %s to %s", currentOwner.getUsername(), targetMember.getUser().getUsername()),
                null
        );

        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        return tripMapper.toTripDetailResponse(updatedTrip, members);
    }

    @Transactional
    public TripDetailResponse addMemberToTrip(Long tripId, String username, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.ORGANIZER);
        Trip trip = getTripEntity(tripId);

        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!tripMemberRepository.existsByTripIdAndUserId(tripId, user.getId())) {
            TripMember member = TripMember.builder()
                    .trip(trip)
                    .user(user)
                    .role(TripRole.MEMBER)
                    .joinedAt(LocalDateTime.now())
                    .build();
            tripMemberRepository.save(member);
        }

        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        return tripMapper.toTripDetailResponse(trip, members);
    }

    @Transactional
    public TripDetailResponse removeMemberFromTrip(Long tripId, String username, User caller) {
        Trip trip = getTripEntity(tripId);
        User userToRemove = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        boolean isSelf = caller.getId().equals(userToRemove.getId());

        if (isSelf) {
            // Self-leave: caller must be a member
            tripAuthorizationService.verifyMembership(tripId, caller);
            if (trip.getOwner().getId().equals(caller.getId())) {
                throw new IllegalStateException("Trip owner cannot leave the trip without transferring ownership first.");
            }
        } else {
            // Removing someone else: caller must be OWNER
            tripAuthorizationService.verifyOwner(tripId, caller);
        }

        tripMemberRepository.findByTripIdAndUserId(tripId, userToRemove.getId())
                .ifPresent(tripMemberRepository::delete);

        securityAuditService.recordEvent(
                tripId,
                caller.getId(),
                "MEMBER_REMOVED",
                String.format("Member @%s removed by @%s", username, caller.getUsername()),
                null
        );

        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        return tripMapper.toTripDetailResponse(trip, members);
    }

    @Transactional
    public TripDetailResponse addItinerary(Long tripId, Itinerary itinerary, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.ORGANIZER);
        Trip trip = getTripEntity(tripId);
        itinerary.setTrip(trip);
        trip.getItineraries().add(itinerary);
        Trip updatedTrip = tripRepository.save(trip);
        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        return tripMapper.toTripDetailResponse(updatedTrip, members);
    }
}
