package com.tripsyncai.service;

import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CalendarExportService {

    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public String generateICalendarForTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + tripId));

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//RoamSync//Travel Itinerary Calendar 1.0//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("X-WR-CALNAME:").append(sanitize(trip.getName())).append("\r\n");

        DateTimeFormatter dFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");

        if (trip.getItineraries() != null) {
            for (Itinerary item : trip.getItineraries()) {
                ics.append("BEGIN:VEVENT\r\n");
                ics.append("UID:roamsync-itinerary-").append(item.getId()).append("@roamsync.ai\r\n");

                LocalDate eventDate = item.getActivityDate();
                if (eventDate == null && trip.getStartDate() != null && item.getDayNumber() != null) {
                    eventDate = trip.getStartDate().plusDays(Math.max(0, item.getDayNumber() - 1));
                }

                if (eventDate != null) {
                    ics.append("DTSTART;VALUE=DATE:").append(eventDate.format(dFormatter)).append("\r\n");
                    ics.append("DTEND;VALUE=DATE:").append(eventDate.plusDays(1).format(dFormatter)).append("\r\n");
                }

                ics.append("SUMMARY:").append(sanitize(item.getTitle())).append("\r\n");
                if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                    ics.append("DESCRIPTION:").append(sanitize(item.getDescription())).append("\r\n");
                }
                ics.append("LOCATION:").append(sanitize(trip.getName())).append("\r\n");
                ics.append("STATUS:CONFIRMED\r\n");
                ics.append("END:VEVENT\r\n");
            }
        }

        ics.append("END:VCALENDAR\r\n");
        return ics.toString();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replace("\r", "").replace("\n", " ").replace(",", "\\,").replace(";", "\\;");
    }
}
