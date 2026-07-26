package com.tripsyncai.controller;

import com.tripsyncai.dto.ExpenseRequest;
import com.tripsyncai.entity.Expense;
import com.tripsyncai.entity.User;
import com.tripsyncai.service.ExpenseService;
import com.tripsyncai.service.ReceiptOcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ReceiptOcrService receiptOcrService;

    @PostMapping
    public ResponseEntity<Expense> addExpense(
            @PathVariable Long tripId,
            @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(expenseService.addExpense(tripId, request, user));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@PathVariable Long tripId) {
        return ResponseEntity.ok(expenseService.getExpensesForTrip(tripId));
    }

    @GetMapping("/balances")
    public ResponseEntity<Map<String, Double>> getBalances(@PathVariable Long tripId) {
        return ResponseEntity.ok(expenseService.calculateBalances(tripId));
    }

    @GetMapping("/settlements")
    public ResponseEntity<List<Map<String, Object>>> getSimplifiedSettlements(@PathVariable Long tripId) {
        return ResponseEntity.ok(expenseService.calculateSimplifiedSettlements(tripId));
    }

    @PostMapping("/ocr")
    public ResponseEntity<Map<String, Object>> scanReceipt(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(receiptOcrService.parseReceipt(file));
    }
}
