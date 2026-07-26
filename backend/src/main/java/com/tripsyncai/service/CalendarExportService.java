package com.tripsyncai.service;

import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CalendarExportService {

    private final TripRepository tripRepository;

    public String generateICalendarForTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + tripId));

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//TripSync AI//Travel Itinerary Calendar 1.0//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("X-WR-CALNAME:").append(sanitize(trip.getName())).append("\r\n");

        DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        DateTimeFormatter dFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");

        for (Itinerary item : trip.getItineraries()) {
            ics.append("BEGIN:VEVENT\r\n");
            ics.append("UID:tripsync-itinerary-").append(item.getId()).append("@tripsync.ai\r\n");
            
            if (item.getActivityDate() != null) {
                ics.append("DTSTART;VALUE=DATE:").append(item.getActivityDate().format(dFormatter)).append("\r\n");
                ics.append("DTEND;VALUE=DATE:").append(item.getActivityDate().format(dFormatter)).append("\r\n");
            }

            ics.append("SUMMARY:").append(sanitize(item.getTitle())).append("\r\n");
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                ics.append("DESCRIPTION:").append(sanitize(item.getDescription())).append("\r\n");
            }
            ics.append("LOCATION:").append(sanitize(trip.getName())).append("\r\n");
            ics.append("STATUS:CONFIRMED\r\n");
            ics.append("END:VEVENT\r\n");
        }

        ics.append("END:VCALENDAR\r\n");
        return ics.toString();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replace("\r", "").replace("\n", " ").replace(",", "\\,").replace(";", "\\;");
    }
}
