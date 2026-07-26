package com.tripsyncai.scheduler;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final TripRepository tripRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void sendUpcomingTripNotifications() {
        log.info("Running Notification Scheduler for upcoming trips...");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Trip> trips = tripRepository.findAll();

        for (Trip trip : trips) {
            if (trip.getStartDate() != null && trip.getStartDate().equals(tomorrow)) {
                log.info("NOTIFICATION: Hey {}! Your trip '{}' (ID: {}) is starting tomorrow! Get your bags ready!",
                        trip.getOwner().getFullName() != null ? trip.getOwner().getFullName() : trip.getOwner().getUsername(),
                        trip.getName(),
                        trip.getId());
            }
        }
    }
}
