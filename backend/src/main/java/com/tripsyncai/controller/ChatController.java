package com.tripsyncai.controller;

import com.tripsyncai.dto.ChatMessageResponse;
import com.tripsyncai.dto.UserSummaryResponse;
import com.tripsyncai.entity.ChatMessage;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.ChatRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.service.TripAuthorizationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatRepository chatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripAuthorizationService tripAuthorizationService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{tripId}")
    public void sendMessage(
            @DestinationVariable Long tripId,
            @Payload ChatMessageInput messageInput,
            Principal principal
    ) {
        if (principal == null) {
            throw new IllegalArgumentException("Unauthenticated WebSocket session cannot send chat messages");
        }

        String username = principal.getName();
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Sender user not found: " + username));

        tripAuthorizationService.verifyRole(tripId, sender, TripRole.MEMBER);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        String content = messageInput != null && messageInput.getContent() != null ? messageInput.getContent().trim() : "";
        if (content.isEmpty()) {
            return;
        }

        // 1. Persistence-First Invariant: Save to database before broadcast
        ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(sender)
                .trip(trip)
                .messageType("TEXT")
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage saved = chatRepository.save(message);

        ChatMessageResponse response = toResponse(saved);

        // 2. Broadcast to canonical STOMP destination and backwards-compatible aliases
        messagingTemplate.convertAndSend("/topic/trips/" + tripId + "/chat", response);
        messagingTemplate.convertAndSend("/topic/chat/" + tripId, response);
        messagingTemplate.convertAndSend("/topic/trip/" + tripId, response);
    }

    @GetMapping("/api/chat/history/{tripId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User caller
    ) {
        if (caller != null) {
            tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + tripId));

        List<ChatMessage> messages = chatRepository.findByTripOrderByTimestampAsc(trip);
        List<ChatMessageResponse> responses = messages.stream().map(this::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        User sender = message.getSender();
        UserSummaryResponse senderSummary = sender != null ? UserSummaryResponse.builder()
                .id(sender.getId())
                .username(sender.getUsername())
                .fullName(sender.getFullName())
                .avatarUrl(sender.getAvatarUrl())
                .build() : null;

        return ChatMessageResponse.builder()
                .id(message.getId())
                .tripId(message.getTrip() != null ? message.getTrip().getId() : null)
                .content(message.getContent())
                .messageType(message.getMessageType())
                .sender(senderSummary)
                .timestamp(message.getCreatedAt())
                .build();
    }

    @Data
    public static class ChatMessageInput {
        private String content;
    }
}
