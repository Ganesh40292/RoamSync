package com.tripsyncai.repository;

import com.tripsyncai.entity.Notification;
import com.tripsyncai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
    Optional<Notification> findByIdAndUser(Long id, User user);
    List<Notification> findByUserAndIsReadFalse(User user);
}
