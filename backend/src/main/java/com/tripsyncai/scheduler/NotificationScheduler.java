package com.tripsyncai.scheduler;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.service.NotificationService;
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
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 0 * * *")
    public void sendUpcomingTripNotifications() {
        log.info("Running Notification Scheduler for upcoming trips...");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Trip> trips = tripRepository.findAll();

        for (Trip trip : trips) {
            if (trip.getStartDate() != null && trip.getStartDate().equals(tomorrow)) {
                for (User member : trip.getMembers()) {
                    try {
                        notificationService.createNotification(
                                member,
                                "UPCOMING_TRIP",
                                "Trip Starting Tomorrow!",
                                String.format("Pack your bags! Your trip '%s' begins tomorrow.", trip.getName()),
                                trip.getId()
                        );
                    } catch (Exception e) {
                        log.warn("Failed to create upcoming trip notification for user {}: {}", member.getUsername(), e.getMessage());
                    }
                }
            }
        }
    }
}
