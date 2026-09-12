package com.tripsyncai.controller;

import com.tripsyncai.dto.ChatMessageResponse;
import com.tripsyncai.entity.ChatMessage;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.ChatRepository;
import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.service.TripAuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatWebSocketTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripAuthorizationService tripAuthorizationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatController chatController;

    private User sender;
    private Trip trip;
    private Principal principal;

    @BeforeEach
    void setUp() {
        sender = User.builder().id(1L).username("traveler").fullName("Alice Smith").build();
        trip = Trip.builder().id(100L).name("Goa Trip").build();
        principal = () -> "traveler";
    }

    @Test
    void testSendMessageDerivesSenderFromPrincipalAndBroadcasts() {
        when(userRepository.findByUsername("traveler")).thenReturn(Optional.of(sender));
        when(tripRepository.findById(100L)).thenReturn(Optional.of(trip));
        when(chatRepository.save(any(ChatMessage.class))).thenAnswer(i -> {
            ChatMessage msg = i.getArgument(0);
            msg.setId(10L);
            return msg;
        });

        ChatController.ChatMessageInput input = new ChatController.ChatMessageInput();
        input.setContent("Hello fellow travelers!");

        chatController.sendMessage(100L, input, principal);

        // Verify role authorization
        verify(tripAuthorizationService).verifyRole(100L, sender, TripRole.MEMBER);

        // Verify DB persistence occurred
        verify(chatRepository).save(argThat(msg ->
                msg.getContent().equals("Hello fellow travelers!") &&
                msg.getSender().equals(sender) &&
                msg.getTrip().equals(trip)
        ));

        // Verify broadcast to canonical topic
        verify(messagingTemplate).convertAndSend(eq("/topic/trips/100/chat"), any(ChatMessageResponse.class));
    }

    @Test
    void testSendMessageDeniedForViewer() {
        when(userRepository.findByUsername("traveler")).thenReturn(Optional.of(sender));
        doThrow(new AccessDeniedException("Insufficient role: VIEWER cannot send messages"))
                .when(tripAuthorizationService).verifyRole(100L, sender, TripRole.MEMBER);

        ChatController.ChatMessageInput input = new ChatController.ChatMessageInput();
        input.setContent("Can I speak?");

        assertThrows(AccessDeniedException.class, () ->
                chatController.sendMessage(100L, input, principal)
        );

        verify(chatRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void testUnauthenticatedSendMessageFails() {
        ChatController.ChatMessageInput input = new ChatController.ChatMessageInput();
        input.setContent("Sneaky message");

        assertThrows(IllegalArgumentException.class, () ->
                chatController.sendMessage(100L, input, null)
        );
    }
}
