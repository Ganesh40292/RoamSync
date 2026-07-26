package com.tripsyncai.util;

public final class AppConstants {

    private AppConstants() {
        // Restrict instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";

    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    public static final String DATE_PATTERN = "yyyy-MM-dd";
    public static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    public static final String WS_TOPIC_CHAT = "/topic/chat/";
    public static final String WS_TOPIC_TRIP = "/topic/trip/";
}
