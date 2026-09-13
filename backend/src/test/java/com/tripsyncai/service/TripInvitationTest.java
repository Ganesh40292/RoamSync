package com.tripsyncai.service;

import com.tripsyncai.dto.CreateInvitationRequest;
import com.tripsyncai.dto.InvitationResponse;
import com.tripsyncai.dto.JoinTripRequest;
import com.tripsyncai.dto.TripJoinPreviewResponse;
import com.tripsyncai.entity.*;
import com.tripsyncai.repository.TripInvitationRepository;
import com.tripsyncai.repository.TripMemberRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.util.TokenUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripInvitationTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripInvitationRepository tripInvitationRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @Mock
    private TripAuthorizationService tripAuthorizationService;

    @Mock
    private SecurityAuditService securityAuditService;

    @InjectMocks
    private TripInvitationService tripInvitationService;

    private User owner;
    private User joiningUser;
    private Trip trip;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).username("owner").build();
        joiningUser = User.builder().id(2L).username("traveler").build();

        trip = Trip.builder()
                .id(100L)
                .name("Goa Beach Trip")
                .description("Sunny vibes")
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .baseCurrency("USD")
                .owner(owner)
                .build();
    }

    @Test
    void testCreateInvitationSuccess() {
        when(tripAuthorizationService.verifyRole(100L, owner, TripRole.ORGANIZER))
                .thenReturn(TripMember.builder().trip(trip).user(owner).role(TripRole.OWNER).build());
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(tripInvitationRepository.save(any(TripInvitation.class))).thenAnswer(i -> {
            TripInvitation inv = i.getArgument(0);
            inv.setId(50L);
            return inv;
        });

        InvitationResponse response = tripInvitationService.createInvitation(100L, new CreateInvitationRequest(), owner);

        assertNotNull(response);
        assertEquals(100L, response.getTripId());
        assertEquals("Goa Beach Trip", response.getTripName());
        assertNotNull(response.getInviteToken());
        assertTrue(response.getJoinUrl().contains(response.getInviteToken()));
        assertEquals("ACTIVE", response.getStatus());

        verify(securityAuditService).recordEvent(eq(100L), eq(1L), eq("INVITE_CREATED"), anyString(), isNull());
    }

    @Test
    void testCreateInvitationDeniedForNonOrganizer() {
        doThrow(new AccessDeniedException("Insufficient permissions"))
                .when(tripAuthorizationService).verifyRole(100L, joiningUser, TripRole.ORGANIZER);

        assertThrows(AccessDeniedException.class, () ->
                tripInvitationService.createInvitation(100L, new CreateInvitationRequest(), joiningUser)
        );
    }

    @Test
    void testPreviewInvitationSuccess() {
        String rawToken = "sample-secure-token-123456789012345";
        String tokenHash = TokenUtils.hashToken(rawToken);

        TripInvitation invitation = TripInvitation.builder()
                .id(50L)
                .trip(trip)
                .inviter(owner)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .status("ACTIVE")
                .build();

        when(tripInvitationRepository.findByTokenHashAndStatus(tokenHash, "ACTIVE")).thenReturn(Optional.of(invitation));
        when(tripMemberRepository.findByTripId(100L)).thenReturn(List.of(
                TripMember.builder().trip(trip).user(owner).role(TripRole.OWNER).build()
        ));

        TripJoinPreviewResponse preview = tripInvitationService.previewInvitation(rawToken);

        assertNotNull(preview);
        assertEquals("Goa Beach Trip", preview.getTripName());
        assertEquals("owner", preview.getInviterUsername());
        assertEquals(1, preview.getMemberCount());
        assertTrue(preview.isValid());
    }

    @Test
    void testJoinTripSuccess() {
        String rawToken = "valid-token-xyz";
        String tokenHash = TokenUtils.hashToken(rawToken);

        TripInvitation invitation = TripInvitation.builder()
                .id(50L)
                .trip(trip)
                .inviter(owner)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .status("ACTIVE")
                .build();

        when(tripInvitationRepository.findByTokenHashAndStatus(tokenHash, "ACTIVE")).thenReturn(Optional.of(invitation));
        when(tripMemberRepository.existsByTripIdAndUserId(100L, 2L)).thenReturn(false);

        Map<String, Object> result = tripInvitationService.joinTrip(JoinTripRequest.builder().code(rawToken).build(), joiningUser);

        assertNotNull(result);
        assertEquals("Successfully joined the trip!", result.get("message"));
        assertEquals(false, result.get("alreadyMember"));
        assertEquals(100L, result.get("tripId"));

        verify(tripMemberRepository).save(argThat(member ->
                member.getTrip().equals(trip) &&
                member.getUser().equals(joiningUser) &&
                member.getRole() == TripRole.MEMBER
        ));

        verify(securityAuditService).recordEvent(eq(100L), eq(2L), eq("INVITE_REDEEMED"), anyString(), isNull());
    }
}
