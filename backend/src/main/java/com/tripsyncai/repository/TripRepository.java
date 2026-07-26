package com.tripsyncai.repository;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOwner(User owner);
    List<Trip> findByMembersContaining(User member);
}
