package com.tripsyncai.repository;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripMember;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    Optional<TripMember> findByTripAndUser(Trip trip, User user);
    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);
    Optional<TripMember> findByTripIdAndRole(Long tripId, TripRole role);
    List<TripMember> findByTripId(Long tripId);
    List<TripMember> findByUserId(Long userId);
    boolean existsByTripIdAndUserId(Long tripId, Long userId);
    void deleteByTripIdAndUserId(Long tripId, Long userId);
}
