package com.tripsyncai.service;

import com.tripsyncai.repository.TripRepository;
import com.tripsyncai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", userRepository.count());
        metrics.put("totalTrips", tripRepository.count());
        metrics.put("systemStatus", "Healthy");
        metrics.put("activeSocketConnections", 5);
        return metrics;
    }

    @Transactional
    public void deleteTripAdmin(Long tripId) {
        tripRepository.deleteById(tripId);
    }
}
