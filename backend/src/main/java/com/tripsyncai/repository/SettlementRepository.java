package com.tripsyncai.repository;

import com.tripsyncai.entity.Settlement;
import com.tripsyncai.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByTripOrderByCreatedAtDesc(Trip trip);
    Optional<Settlement> findByIdAndTrip(Long id, Trip trip);
    void deleteByTripAndStatus(Trip trip, String status);
}
