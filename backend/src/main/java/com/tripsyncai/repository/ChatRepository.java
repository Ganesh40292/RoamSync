package com.tripsyncai.repository;

import com.tripsyncai.entity.ChatMessage;
import com.tripsyncai.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTripOrderByTimestampAsc(Trip trip);
}
