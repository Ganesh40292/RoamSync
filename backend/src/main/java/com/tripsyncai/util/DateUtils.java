package com.tripsyncai.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private DateUtils() {
        // Restrict instantiation
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(AppConstants.DATE_PATTERN);
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern(AppConstants.DATETIME_PATTERN);

    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(DATE_FORMATTER);
    }

    public static LocalDate parseDate(String dateStr) {
        return dateStr == null ? null : LocalDate.parse(dateStr, DATE_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DATETIME_FORMATTER);
    }

    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr == null ? null : LocalDateTime.parse(dateTimeStr, DATETIME_FORMATTER);
    }

    public static boolean isValidRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return false;
        }
        return !startDate.isAfter(endDate);
    }
}
