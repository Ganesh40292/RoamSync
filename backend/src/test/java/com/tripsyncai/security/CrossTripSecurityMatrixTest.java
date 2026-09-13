package com.tripsyncai.security;

import com.tripsyncai.dto.ExpenseRequest;
import com.tripsyncai.entity.*;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.mapper.ExpenseMapper;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.*;
import com.tripsyncai.service.ExpenseService;
import com.tripsyncai.service.PollService;
import com.tripsyncai.service.SecurityAuditService;
import com.tripsyncai.service.TripAuthorizationService;
import com.tripsyncai.service.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CrossTripSecurityMatrixTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityAuditService securityAuditService;

    @Spy
    private TripMapper tripMapper = new TripMapper();

    private TripAuthorizationService tripAuthorizationService;
    private ExpenseService expenseService;
    private PollService pollService;
    private TripService tripService;

    private User aliceOwner;
    private User bobMember;
    private User charlieViewer;
    private User malloryAttacker;

    private Trip tripAlpha;
    private Trip tripBeta;

    @BeforeEach
    void setUp() {
        tripAuthorizationService = new TripAuthorizationService(tripRepository, tripMemberRepository);

        ExpenseMapper expenseMapper = new ExpenseMapper(tripMapper);
        expenseService = new ExpenseService(
                expenseRepository,
                settlementRepository,
                tripRepository,
                userRepository,
                tripAuthorizationService,
                expenseMapper,
                securityAuditService
        );

        pollService = new PollService(
                pollRepository,
                pollOptionRepository,
                tripRepository,
                tripAuthorizationService,
                tripMapper
        );

        tripService = new TripService(
                tripRepository,
                userRepository,
                tripMemberRepository,
                tripAuthorizationService,
                securityAuditService,
                tripMapper
        );

        aliceOwner = User.builder().id(1L).username("alice").fullName("Alice Owner").build();
        bobMember = User.builder().id(2L).username("bob").fullName("Bob Member").build();
        charlieViewer = User.builder().id(3L).username("charlie").fullName("Charlie Viewer").build();
        malloryAttacker = User.builder().id(4L).username("mallory").fullName("Mallory Attacker").build();

        tripAlpha = Trip.builder().id(100L).name("Trip Alpha").owner(aliceOwner).build();
        tripBeta = Trip.builder().id(200L).name("Trip Beta").owner(malloryAttacker).build();

        TripMember tmAlice = TripMember.builder().id(10L).trip(tripAlpha).user(aliceOwner).role(TripRole.OWNER).build();
        TripMember tmBob = TripMember.builder().id(11L).trip(tripAlpha).user(bobMember).role(TripRole.MEMBER).build();
        TripMember tmCharlie = TripMember.builder().id(12L).trip(tripAlpha).user(charlieViewer).role(TripRole.VIEWER).build();
        tripAlpha.setTripMembers(new ArrayList<>(List.of(tmAlice, tmBob, tmCharlie)));

        lenient().when(tripRepository.findById(100L)).thenReturn(Optional.of(tripAlpha));
    }

    @Test
    void nonMember_attemptingToAccessTripExpenses_isDenied() {
        when(tripMemberRepository.findByTripIdAndUserId(100L, 4L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () ->
                expenseService.getExpensesForTrip(100L, malloryAttacker)
        );
    }

    @Test
    void viewer_attemptingToCreateExpense_isDenied() {
        TripMember viewerMembership = TripMember.builder().trip(tripAlpha).user(charlieViewer).role(TripRole.VIEWER).build();
        when(tripMemberRepository.findByTripIdAndUserId(100L, 3L)).thenReturn(Optional.of(viewerMembership));

        ExpenseRequest request = ExpenseRequest.builder()
                .amount(new BigDecimal("25.00"))
                .description("Snacks")
                .build();

        assertThrows(AccessDeniedException.class, () ->
                expenseService.addExpense(100L, request, charlieViewer)
        );
    }

    @Test
    void viewer_attemptingToCreatePoll_isDenied() {
        TripMember viewerMembership = TripMember.builder().trip(tripAlpha).user(charlieViewer).role(TripRole.VIEWER).build();
        when(tripMemberRepository.findByTripIdAndUserId(100L, 3L)).thenReturn(Optional.of(viewerMembership));

        assertThrows(AccessDeniedException.class, () ->
                pollService.createPoll(100L, "New Poll?", List.of("Option A", "Option B"), charlieViewer)
        );
    }

    @Test
    void nonMember_attemptingToVoteInPoll_isDenied() {
        when(tripMemberRepository.findByTripIdAndUserId(100L, 4L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () ->
                pollService.voteInPoll(100L, 501L, malloryAttacker)
        );
    }

    @Test
    void member_attemptingToDeleteTrip_isDenied() {
        TripMember memberMembership = TripMember.builder().trip(tripAlpha).user(bobMember).role(TripRole.MEMBER).build();
        when(tripMemberRepository.findByTripIdAndUserId(100L, 2L)).thenReturn(Optional.of(memberMembership));

        assertThrows(AccessDeniedException.class, () ->
                tripService.deleteTrip(100L, bobMember)
        );
    }

    @Test
    void nonMember_attemptingToAddItinerary_isDenied() {
        when(tripMemberRepository.findByTripIdAndUserId(100L, 4L)).thenReturn(Optional.empty());

        Itinerary itinerary = Itinerary.builder().title("Attacker Event").dayNumber(1).build();

        assertThrows(AccessDeniedException.class, () ->
                tripService.addItinerary(100L, itinerary, malloryAttacker)
        );
    }

    @Test
    void unauthorizedUser_attemptingToSettleOtherUsersDebt_isDenied() {
        TripMember memberMembership = TripMember.builder().trip(tripAlpha).user(bobMember).role(TripRole.MEMBER).build();
        when(tripMemberRepository.findByTripIdAndUserId(100L, 2L)).thenReturn(Optional.of(memberMembership));
        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripAlpha));

        // Settlement is between Charlie (debtor) and Alice (creditor). Bob is neither, nor owner!
        Settlement settlement = Settlement.builder()
                .id(777L)
                .trip(tripAlpha)
                .debtor(charlieViewer)
                .creditor(aliceOwner)
                .amount(new BigDecimal("50.00"))
                .currency("USD")
                .status("PENDING")
                .build();

        when(settlementRepository.findByIdAndTrip(777L, tripAlpha)).thenReturn(Optional.of(settlement));

        assertThrows(AccessDeniedException.class, () ->
                expenseService.settleSettlement(100L, 777L, bobMember)
        );
    }
}
