package com.tripsyncai.service;

import com.tripsyncai.dto.NotificationResponse;
import com.tripsyncai.entity.Notification;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User user) {
        if (user == null) return List.of();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        if (user == null) return 0;
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public Notification createNotification(User recipient, String type, String title, String message, Long relatedTripId) {
        Notification notification = Notification.builder()
                .user(recipient)
                .type(type != null ? type : "SYSTEM")
                .title(title)
                .message(message)
                .relatedTripId(relatedTripId)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .relatedTripId(n.getRelatedTripId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
