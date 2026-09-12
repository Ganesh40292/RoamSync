package com.tripsyncai.scheduler;

import com.tripsyncai.entity.Expense;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.ExpenseRepository;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertScheduler {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;

    @Scheduled(cron = "0 0 * * * *")
    public void checkBudgets() {
        log.info("Running Budget Alert Scheduler...");
        List<Trip> activeTrips = tripRepository.findAll();

        for (Trip trip : activeTrips) {
            List<Expense> expenses = expenseRepository.findByTrip(trip);
            java.math.BigDecimal totalSpent = expenses.stream()
                    .map(Expense::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal budgetLimit = new java.math.BigDecimal("2000.00");
            if (totalSpent.compareTo(budgetLimit) > 0) {
                log.warn("ALERT: Trip '{}' (ID: {}) has exceeded its budget limit! Total Spent: ${}, Limit: ${}",
                        trip.getName(), trip.getId(), totalSpent, budgetLimit);
            }
        }
    }
}
