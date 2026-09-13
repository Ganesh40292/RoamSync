package com.tripsyncai.controller;

import com.tripsyncai.dto.ExpenseRequest;
import com.tripsyncai.dto.ExpenseResponse;
import com.tripsyncai.dto.SettlementResponse;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.service.ExpenseService;
import com.tripsyncai.service.ReceiptOcrService;
import com.tripsyncai.service.TripAuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ReceiptOcrService receiptOcrService;
    private final UserRepository userRepository;
    private final TripAuthorizationService tripAuthorizationService;

    private User resolveUser(User authUser, Principal principal) {
        if (authUser != null) return authUser;
        if (principal != null) {
            return userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(expenseService.addExpense(tripId, request, user));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(expenseService.getExpensesForTrip(tripId, user));
    }

    @GetMapping("/balances")
    public ResponseEntity<Map<String, BigDecimal>> getBalances(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(expenseService.calculateBalances(tripId, user));
    }

    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementResponse>> getSettlements(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(expenseService.getSettlements(tripId, user));
    }

    @PostMapping("/settlements/{settlementId}/settle")
    public ResponseEntity<SettlementResponse> settleSettlement(
            @PathVariable Long tripId,
            @PathVariable Long settlementId,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(expenseService.settleSettlement(tripId, settlementId, user));
    }

    @PostMapping("/ocr")
    public ResponseEntity<Map<String, Object>> scanReceipt(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        tripAuthorizationService.verifyRole(tripId, user, TripRole.MEMBER);
        return ResponseEntity.ok(receiptOcrService.parseReceipt(file));
    }
}
