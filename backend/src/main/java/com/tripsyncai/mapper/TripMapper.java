package com.tripsyncai.mapper;

import com.tripsyncai.dto.*;
import com.tripsyncai.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TripMapper {

    public UserSummaryResponse toUserSummary(User user) {
        if (user == null) return null;
        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public TripMemberResponse toTripMemberResponse(TripMember member) {
        if (member == null) return null;
        User user = member.getUser();
        return TripMemberResponse.builder()
                .id(member.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .fullName(user != null ? user.getFullName() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    public DestinationResponse toDestinationResponse(Destination dest) {
        if (dest == null) return null;
        return DestinationResponse.builder()
                .id(dest.getId())
                .name(dest.getName())
                .latitude(dest.getLatitude())
                .longitude(dest.getLongitude())
                .description(dest.getDescription())
                .build();
    }

    public ItineraryResponse toItineraryResponse(Itinerary it) {
        if (it == null) return null;
        return ItineraryResponse.builder()
                .id(it.getId())
                .dayNumber(it.getDayNumber())
                .activityDate(it.getActivityDate())
                .title(it.getTitle())
                .description(it.getDescription())
                .locationName(it.getLocationName())
                .timeSlot(it.getTimeSlot())
                .sortOrder(it.getSortOrder())
                .build();
    }

    public TripResponse toTripResponse(Trip trip, int memberCount, List<UserSummaryResponse> members) {
        if (trip == null) return null;
        return TripResponse.builder()
                .id(trip.getId())
                .name(trip.getName())
                .description(trip.getDescription())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .baseCurrency(trip.getBaseCurrency())
                .ownerUsername(trip.getOwner() != null ? trip.getOwner().getUsername() : null)
                .ownerId(trip.getOwner() != null ? trip.getOwner().getId() : null)
                .memberCount(memberCount)
                .members(members != null ? members : Collections.emptyList())
                .createdAt(trip.getCreatedAt())
                .build();
    }

    public TripDetailResponse toTripDetailResponse(Trip trip, List<TripMember> members) {
        if (trip == null) return null;

        List<TripMemberResponse> memberResponses = members != null
                ? members.stream().map(this::toTripMemberResponse).collect(Collectors.toList())
                : Collections.emptyList();

        List<DestinationResponse> destinationResponses = trip.getDestinations() != null
                ? trip.getDestinations().stream().map(this::toDestinationResponse).collect(Collectors.toList())
                : Collections.emptyList();

        List<ItineraryResponse> itineraryResponses = trip.getItineraries() != null
                ? trip.getItineraries().stream().map(this::toItineraryResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return TripDetailResponse.builder()
                .id(trip.getId())
                .name(trip.getName())
                .description(trip.getDescription())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .baseCurrency(trip.getBaseCurrency())
                .owner(toUserSummary(trip.getOwner()))
                .members(memberResponses)
                .destinations(destinationResponses)
                .itineraries(itineraryResponses)
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }
}
