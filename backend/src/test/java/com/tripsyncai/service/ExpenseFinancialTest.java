package com.tripsyncai.service;

import com.tripsyncai.dto.*;
import com.tripsyncai.entity.*;
import com.tripsyncai.mapper.ExpenseMapper;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.ExpenseRepository;
import com.tripsyncai.repository.SettlementRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseFinancialTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripAuthorizationService tripAuthorizationService;

    @Mock
    private SecurityAuditService securityAuditService;

    @Spy
    private TripMapper tripMapper = new TripMapper();

    private ExpenseMapper expenseMapper;
    private ExpenseService expenseService;

    private User alice;
    private User bob;
    private User charlie;
    private Trip trip;

    @BeforeEach
    void setUp() {
        expenseMapper = new ExpenseMapper(tripMapper);
        expenseService = new ExpenseService(
                expenseRepository,
                settlementRepository,
                tripRepository,
                userRepository,
                tripAuthorizationService,
                expenseMapper,
                securityAuditService
        );

        alice = User.builder().id(1L).username("alice").fullName("Alice Smith").build();
        bob = User.builder().id(2L).username("bob").fullName("Bob Jones").build();
        charlie = User.builder().id(3L).username("charlie").fullName("Charlie Brown").build();

        trip = Trip.builder()
                .id(100L)
                .name("Euro Trip")
                .baseCurrency("EUR")
                .owner(alice)
                .build();

        TripMember memberAlice = TripMember.builder().id(11L).trip(trip).user(alice).role(TripRole.OWNER).build();
        TripMember memberBob = TripMember.builder().id(12L).trip(trip).user(bob).role(TripRole.MEMBER).build();
        TripMember memberCharlie = TripMember.builder().id(13L).trip(trip).user(charlie).role(TripRole.MEMBER).build();
        trip.setTripMembers(new ArrayList<>(List.of(memberAlice, memberBob, memberCharlie)));
    }

    @Test
    void addExpense_preservesExactPenniesOnUnevenSplits() {
        when(tripAuthorizationService.verifyRole(eq(100L), eq(alice), eq(TripRole.MEMBER)))
                .thenReturn(TripMember.builder().role(TripRole.OWNER).build());
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));

        ExpenseRequest request = ExpenseRequest.builder()
                .amount(new BigDecimal("100.00"))
                .description("Group Dinner")
                .category("FOOD")
                .sharedWithUsernames(List.of("alice", "bob", "charlie"))
                .build();

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(userRepository.findByUsername("charlie")).thenReturn(Optional.of(charlie));

        ArgumentCaptor<Expense> expenseCaptor = ArgumentCaptor.forClass(Expense.class);
        when(expenseRepository.save(expenseCaptor.capture())).thenAnswer(invocation -> {
            Expense e = invocation.getArgument(0);
            e.setId(500L);
            return e;
        });

        expenseService.addExpense(100L, request, alice);

        Expense saved = expenseCaptor.getValue();
        assertNotNull(saved);
        assertEquals(new BigDecimal("100.00"), saved.getAmount());
        assertEquals(3, saved.getSplits().size());

        BigDecimal sumOfSplits = saved.getSplits().stream()
                .map(ExpenseSplit::getAmountOwed)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(new BigDecimal("100.00"), sumOfSplits, "Sum of all split shares must exactly equal 100.00");
        assertEquals(new BigDecimal("33.34"), saved.getSplits().get(0).getAmountOwed(), "First participant absorbs remainder penny");
        assertEquals(new BigDecimal("33.33"), saved.getSplits().get(1).getAmountOwed());
        assertEquals(new BigDecimal("33.33"), saved.getSplits().get(2).getAmountOwed());
    }

    @Test
    void addExpense_throwsWhenCustomSplitsDoNotSumToTotal() {
        when(tripAuthorizationService.verifyRole(eq(100L), eq(alice), eq(TripRole.MEMBER)))
                .thenReturn(TripMember.builder().role(TripRole.OWNER).build());
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));

        ExpenseRequest request = ExpenseRequest.builder()
                .amount(new BigDecimal("50.00"))
                .description("Taxi")
                .splits(List.of(
                        ExpenseSplitRequest.builder().username("alice").amountOwed(new BigDecimal("20.00")).build(),
                        ExpenseSplitRequest.builder().username("bob").amountOwed(new BigDecimal("20.00")).build()
                ))
                .build();

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                expenseService.addExpense(100L, request, alice)
        );

        assertTrue(ex.getMessage().contains("Split amounts sum to 40.00, which does not equal the expense total of 50.00"));
    }

    @Test
    void debtSimplification_calculatesAndPersistsSimplifiedSettlements() {
        when(tripAuthorizationService.verifyRole(eq(100L), eq(alice), eq(TripRole.VIEWER)))
                .thenReturn(TripMember.builder().role(TripRole.OWNER).build());
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));

        // Alice paid 90.00 split 3 ways (30 each) -> Alice net: +60, Bob net: -30, Charlie net: -30
        Expense exp = Expense.builder()
                .id(1L)
                .trip(trip)
                .payer(alice)
                .amount(new BigDecimal("90.00"))
                .splits(List.of(
                        ExpenseSplit.builder().user(alice).amountOwed(new BigDecimal("30.00")).build(),
                        ExpenseSplit.builder().user(bob).amountOwed(new BigDecimal("30.00")).build(),
                        ExpenseSplit.builder().user(charlie).amountOwed(new BigDecimal("30.00")).build()
                ))
                .build();

        when(expenseRepository.findByTrip(trip)).thenReturn(List.of(exp));
        when(settlementRepository.findByTripOrderByCreatedAtDesc(trip)).thenReturn(Collections.emptyList());
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(userRepository.findByUsername("charlie")).thenReturn(Optional.of(charlie));
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        expenseService.getSettlements(100L, alice);

        verify(settlementRepository).deleteByTripAndStatus(trip, "PENDING");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Settlement>> captor = ArgumentCaptor.forClass(List.class);
        verify(settlementRepository).saveAll(captor.capture());

        List<Settlement> persisted = captor.getValue();
        assertEquals(2, persisted.size(), "Two transfers needed: Bob -> Alice (30) and Charlie -> Alice (30)");
        assertTrue(persisted.stream().allMatch(s -> "PENDING".equals(s.getStatus())));
        assertTrue(persisted.stream().allMatch(s -> s.getCreditor().getUsername().equals("alice")));
    }

    @Test
    void settleSettlement_marksSettledSuccessfully() {
        when(tripAuthorizationService.verifyRole(eq(100L), eq(bob), eq(TripRole.MEMBER)))
                .thenReturn(TripMember.builder().role(TripRole.MEMBER).build());
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));

        Settlement settlement = Settlement.builder()
                .id(200L)
                .trip(trip)
                .debtor(bob)
                .creditor(alice)
                .amount(new BigDecimal("30.00"))
                .currency("EUR")
                .status("PENDING")
                .build();

        when(settlementRepository.findByIdAndTrip(200L, trip)).thenReturn(Optional.of(settlement));

        SettlementResponse response = expenseService.settleSettlement(100L, 200L, bob);

        assertEquals("SETTLED", response.getStatus());
        assertNotNull(response.getSettledAt());
        verify(settlementRepository).save(settlement);
    }

    @Test
    void receiptOcr_throwsWhenApiKeyMissing() {
        ReceiptOcrService ocrService = new ReceiptOcrService();
        MockMultipartFile file = new MockMultipartFile(
                "file", "receipt.jpg", "image/jpeg", "fake content".getBytes()
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                ocrService.parseReceipt(file)
        );

        assertTrue(ex.getMessage().contains("GEMINI_API_KEY is not configured"));
    }
}
