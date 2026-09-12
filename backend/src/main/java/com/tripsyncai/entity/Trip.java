package com.tripsyncai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"owner", "tripMembers", "destinations", "itineraries"})
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "base_currency", nullable = false, length = 3)
    @Builder.Default
    private String baseCurrency = "USD";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TripMember> tripMembers = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Destination> destinations = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Itinerary> itineraries = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (baseCurrency == null || baseCurrency.isBlank()) {
            baseCurrency = "USD";
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public List<User> getMembers() {
        if (tripMembers == null) {
            return Collections.emptyList();
        }
        return tripMembers.stream()
                .map(TripMember::getUser)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public void addTripMember(TripMember member) {
        if (tripMembers == null) {
            tripMembers = new ArrayList<>();
        }
        tripMembers.add(member);
        member.setTrip(this);
    }

    public void removeTripMember(TripMember member) {
        if (tripMembers != null) {
            tripMembers.remove(member);
            member.setTrip(null);
        }
    }
}
