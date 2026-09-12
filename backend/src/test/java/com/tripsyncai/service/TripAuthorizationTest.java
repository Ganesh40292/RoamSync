package com.tripsyncai.service;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripMember;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.TripMemberRepository;
import com.tripsyncai.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripAuthorizationTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @InjectMocks
    private TripAuthorizationService authorizationService;

    private User owner;
    private User memberUser;
    private User viewerUser;
    private User outsiderUser;
    private Trip trip;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).username("owner").role("ROLE_USER").build();
        memberUser = User.builder().id(2L).username("member").role("ROLE_USER").build();
        viewerUser = User.builder().id(3L).username("viewer").role("ROLE_USER").build();
        outsiderUser = User.builder().id(4L).username("outsider").role("ROLE_USER").build();

        trip = Trip.builder()
                .id(100L)
                .name("Karnataka Adventure")
                .owner(owner)
                .build();
    }

    @Test
    void testOwnerCanAccessTrip() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 1L)).thenReturn(Optional.of(
                TripMember.builder().trip(trip).user(owner).role(TripRole.OWNER).build()
        ));

        TripMember member = authorizationService.verifyMembership(100L, owner);
        assertNotNull(member);
        assertEquals(TripRole.OWNER, member.getRole());
        assertTrue(authorizationService.canManageTrip(100L, owner));
    }

    @Test
    void testOutsiderAccessDenied() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 4L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () ->
                authorizationService.verifyMembership(100L, outsiderUser)
        );
        assertFalse(authorizationService.canView(100L, outsiderUser));
    }

    @Test
    void testMemberCannotManageTrip() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 2L)).thenReturn(Optional.of(
                TripMember.builder().trip(trip).user(memberUser).role(TripRole.MEMBER).build()
        ));

        assertFalse(authorizationService.canManageTrip(100L, memberUser));
        assertThrows(AccessDeniedException.class, () ->
                authorizationService.verifyOwner(100L, memberUser)
        );
    }

    @Test
    void testViewerCannotManageExpenses() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 3L)).thenReturn(Optional.of(
                TripMember.builder().trip(trip).user(viewerUser).role(TripRole.VIEWER).build()
        ));

        assertTrue(authorizationService.canView(100L, viewerUser));
        assertFalse(authorizationService.canManageExpenses(100L, viewerUser));
        assertFalse(authorizationService.canChat(100L, viewerUser));
    }
}
