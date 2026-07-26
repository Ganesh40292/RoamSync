package com.tripsyncai.service;

import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User updateUserProfile(Long id, User updateDetails) {
        User user = getUserById(id);

        if (updateDetails.getFullName() != null) {
            user.setFullName(updateDetails.getFullName());
        }
        if (updateDetails.getAvatarUrl() != null) {
            user.setAvatarUrl(updateDetails.getAvatarUrl());
        }
        if (updateDetails.getPhone() != null) {
            user.setPhone(updateDetails.getPhone());
        }
        if (updateDetails.getEmail() != null && !updateDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateDetails.getEmail())) {
                throw new IllegalArgumentException("Email already taken");
            }
            user.setEmail(updateDetails.getEmail());
        }

        return userRepository.save(user);
    }
}
