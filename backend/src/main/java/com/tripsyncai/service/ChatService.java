package com.tripsyncai.service;

import com.tripsyncai.entity.ChatMessage;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.ChatRepository;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final TripRepository tripRepository;

    public List<ChatMessage> getChatHistory(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        return chatRepository.findByTripOrderByTimestampAsc(trip);
    }
}
