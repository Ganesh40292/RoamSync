package com.tripsyncai.service;

import com.tripsyncai.dto.TripDetailResponse;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripMember;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.TripMemberRepository;
import com.tripsyncai.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripOwnershipTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @Mock
    private TripAuthorizationService authorizationService;

    @Mock
    private SecurityAuditService securityAuditService;

    @Spy
    private TripMapper tripMapper = new TripMapper();

    @InjectMocks
    private TripService tripService;

    private User currentOwner;
    private User targetMember;
    private User viewerMember;
    private Trip trip;
    private TripMember ownerMemberRecord;
    private TripMember targetMemberRecord;
    private TripMember viewerMemberRecord;

    @BeforeEach
    void setUp() {
        currentOwner = User.builder().id(1L).username("owner").build();
        targetMember = User.builder().id(2L).username("target").build();
        viewerMember = User.builder().id(3L).username("viewer").build();

        trip = Trip.builder()
                .id(100L)
                .name("Karnataka Roadtrip")
                .owner(currentOwner)
                .baseCurrency("USD")
                .build();

        ownerMemberRecord = TripMember.builder().id(10L).trip(trip).user(currentOwner).role(TripRole.OWNER).build();
        targetMemberRecord = TripMember.builder().id(20L).trip(trip).user(targetMember).role(TripRole.MEMBER).build();
        viewerMemberRecord = TripMember.builder().id(30L).trip(trip).user(viewerMember).role(TripRole.VIEWER).build();
    }

    @Test
    void testSuccessfulOwnershipTransfer() {
        doNothing().when(authorizationService).verifyOwner(100L, currentOwner);
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 2L)).thenReturn(Optional.of(targetMemberRecord));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 1L)).thenReturn(Optional.of(ownerMemberRecord));
        when(tripRepository.save(any(Trip.class))).thenAnswer(i -> i.getArgument(0));
        when(tripMemberRepository.findByTripId(100L)).thenReturn(List.of(ownerMemberRecord, targetMemberRecord));

        TripDetailResponse result = tripService.transferOwnership(100L, 2L, currentOwner);

        assertNotNull(result);
        assertEquals(targetMember.getId(), result.getOwner().getId());
        assertEquals("target", result.getOwner().getUsername());
        assertEquals(TripRole.OWNER, targetMemberRecord.getRole());
        assertEquals(TripRole.ORGANIZER, ownerMemberRecord.getRole());

        verify(securityAuditService).recordEvent(
                eq(100L),
                eq(1L),
                eq("OWNER_TRANSFER"),
                contains("Ownership transferred from owner to target"),
                isNull()
        );
    }

    @Test
    void testCannotTransferOwnershipToViewer() {
        doNothing().when(authorizationService).verifyOwner(100L, currentOwner);
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripIdAndUserId(100L, 3L)).thenReturn(Optional.of(viewerMemberRecord));

        assertThrows(IllegalArgumentException.class, () ->
                tripService.transferOwnership(100L, 3L, currentOwner)
        );
    }

    @Test
    void testCannotTransferOwnershipToSelf() {
        doNothing().when(authorizationService).verifyOwner(100L, currentOwner);
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));

        assertThrows(IllegalArgumentException.class, () ->
                tripService.transferOwnership(100L, 1L, currentOwner)
        );
    }

    @Test
    void testUnauthorizedUserCannotTransferOwnership() {
        doThrow(new AccessDeniedException("Insufficient trip permissions")).when(authorizationService).verifyOwner(100L, targetMember);

        assertThrows(AccessDeniedException.class, () ->
                tripService.transferOwnership(100L, 2L, targetMember)
        );
    }
}
