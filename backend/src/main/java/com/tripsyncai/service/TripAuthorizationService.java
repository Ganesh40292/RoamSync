package com.tripsyncai.service;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripMember;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.TripMemberRepository;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripAuthorizationService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;

    @Transactional(readOnly = true)
    public TripMember verifyMembership(Long tripId, User user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required to access trip resources");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            return TripMember.builder()
                    .trip(trip)
                    .user(user)
                    .role(TripRole.OWNER)
                    .build();
        }

        // Check if user is the direct trip owner
        if (trip.getOwner() != null && trip.getOwner().getId().equals(user.getId())) {
            return tripMemberRepository.findByTripIdAndUserId(tripId, user.getId())
                    .orElseGet(() -> TripMember.builder()
                            .trip(trip)
                            .user(user)
                            .role(TripRole.OWNER)
                            .build());
        }

        return tripMemberRepository.findByTripIdAndUserId(tripId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of trip id: " + tripId));
    }

    @Transactional(readOnly = true)
    public TripMember verifyRole(Long tripId, User user, TripRole requiredRole) {
        TripMember member = verifyMembership(tripId, user);
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return member;
        }

        if (!member.getRole().isAtLeast(requiredRole)) {
            log.warn("Access denied for user {} on trip {}: required={}, current={}",
                    user.getUsername(), tripId, requiredRole, member.getRole());
            throw new AccessDeniedException("Insufficient trip permissions. Required role: " + requiredRole);
        }
        return member;
    }

    @Transactional(readOnly = true)
    public void verifyOwner(Long tripId, User user) {
        verifyRole(tripId, user, TripRole.OWNER);
    }

    @Transactional(readOnly = true)
    public boolean canView(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.VIEWER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canChat(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.MEMBER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canManageExpenses(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.MEMBER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canVote(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.MEMBER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canManageItinerary(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.ORGANIZER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canManagePolls(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.ORGANIZER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canInvite(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.ORGANIZER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canManageMembers(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.OWNER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean canManageTrip(Long tripId, User user) {
        try {
            verifyRole(tripId, user, TripRole.OWNER);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
