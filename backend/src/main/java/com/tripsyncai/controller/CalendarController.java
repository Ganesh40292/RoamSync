package com.tripsyncai.controller;

import com.tripsyncai.service.CalendarExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips/{tripId}/export")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarExportService calendarExportService;

    @GetMapping("/ical")
    public ResponseEntity<String> exportICalendar(@PathVariable Long tripId) {
        String icsContent = calendarExportService.generateICalendarForTrip(tripId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"trip-itinerary-" + tripId + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar;charset=UTF-8"))
                .body(icsContent);
    }
}
