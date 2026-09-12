package com.tripsyncai.repository;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOwner(User owner);

    @Query("SELECT DISTINCT tm.trip FROM TripMember tm WHERE tm.user = :user")
    List<Trip> findTripsByMemberUser(@Param("user") User user);
}
