package com.tripsyncai.controller;

import com.tripsyncai.dto.NotificationResponse;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User resolveUser(User authUser, Principal principal) {
        if (authUser != null) return authUser;
        if (principal != null) {
            return userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        return ResponseEntity.ok(notificationService.markAsRead(id, user));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
