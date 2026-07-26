package com.tripsyncai.controller;

import com.tripsyncai.entity.ChatMessage;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.ChatRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatRepository chatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/{tripId}")
    @SendTo("/topic/chat/{tripId}")
    public ChatMessage sendMessage(
            @DestinationVariable Long tripId,
            @Payload ChatMessageInput messageInput
    ) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        User sender = userRepository.findByUsername(messageInput.getSenderUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatMessage message = ChatMessage.builder()
                .content(messageInput.getContent())
                .sender(sender)
                .trip(trip)
                .timestamp(LocalDateTime.now())
                .build();

        return chatRepository.save(message);
    }

    @org.springframework.web.bind.annotation.GetMapping("/api/chat/history/{tripId}")
    @org.springframework.web.bind.annotation.ResponseBody
    public java.util.List<ChatMessage> getChatHistory(@org.springframework.web.bind.annotation.PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        return chatRepository.findByTripOrderByTimestampAsc(trip);
    }

    @lombok.Data
    public static class ChatMessageInput {
        private String content;
        private String senderUsername;
    }
}
