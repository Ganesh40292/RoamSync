package com.tripsyncai.repository;

import com.tripsyncai.entity.Poll;
import com.tripsyncai.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByTrip(Trip trip);
}
