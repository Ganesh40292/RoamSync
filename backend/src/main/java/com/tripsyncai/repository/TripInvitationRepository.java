package com.tripsyncai.repository;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripInvitationRepository extends JpaRepository<TripInvitation, Long> {
    Optional<TripInvitation> findByTokenHashAndStatus(String tokenHash, String status);
    Optional<TripInvitation> findByTokenHash(String tokenHash);
    List<TripInvitation> findByTrip(Trip trip);
}
