package com.tripsyncai.websocket;

import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.security.CustomUserDetailsService;
import com.tripsyncai.security.JwtService;
import com.tripsyncai.service.TripAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final TripAuthorizationService tripAuthorizationService;

    private static final Pattern TOPIC_TRIP_PATTERN = Pattern.compile("/topic/(?:trips?/)?(\\d+)(?:/chat)?");
    private static final Pattern APP_CHAT_PATTERN = Pattern.compile("/app/chat/(\\d+)");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                try {
                    String username = jwtService.extractUsername(jwt);
                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(auth);
                            log.debug("WebSocket authenticated for user: {}", username);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Invalid JWT in WebSocket CONNECT header: {}", e.getMessage());
                }
            }
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = TOPIC_TRIP_PATTERN.matcher(destination);
                if (matcher.find()) {
                    Long tripId = Long.parseLong(matcher.group(1));
                    Principal principal = accessor.getUser();
                    if (principal instanceof UsernamePasswordAuthenticationToken token
                            && token.getPrincipal() instanceof User user) {
                        tripAuthorizationService.verifyRole(tripId, user, TripRole.VIEWER);
                    }
                }
            }
        } else if (StompCommand.SEND.equals(command)) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = APP_CHAT_PATTERN.matcher(destination);
                if (matcher.find()) {
                    Long tripId = Long.parseLong(matcher.group(1));
                    Principal principal = accessor.getUser();
                    if (principal instanceof UsernamePasswordAuthenticationToken token
                            && token.getPrincipal() instanceof User user) {
                        tripAuthorizationService.verifyRole(tripId, user, TripRole.MEMBER);
                    }
                }
            }
        }

        return message;
    }
}
