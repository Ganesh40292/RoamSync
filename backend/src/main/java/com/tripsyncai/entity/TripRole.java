package com.tripsyncai.entity;

public enum TripRole {
    OWNER,
    ORGANIZER,
    MEMBER,
    VIEWER;

    public boolean isAtLeast(TripRole requiredRole) {
        if (this == OWNER) return true;
        if (requiredRole == OWNER) return false;

        if (this == ORGANIZER) return true;
        if (requiredRole == ORGANIZER) return false;

        if (this == MEMBER) return requiredRole == MEMBER || requiredRole == VIEWER;
        return requiredRole == VIEWER;
    }
}
