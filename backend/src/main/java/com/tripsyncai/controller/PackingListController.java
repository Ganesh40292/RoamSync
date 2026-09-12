package com.tripsyncai.controller;

import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.service.PackingListService;
import com.tripsyncai.service.TripAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/packing-list")
@RequiredArgsConstructor
public class PackingListController {

    private final PackingListService packingListService;
    private final TripAuthorizationService tripAuthorizationService;
    private final UserRepository userRepository;

    private User resolveUser(User authUser, Principal principal) {
        if (authUser != null) return authUser;
        if (principal != null) {
            return userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPackingList(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User authUser,
            Principal principal
    ) {
        User user = resolveUser(authUser, principal);
        tripAuthorizationService.verifyRole(tripId, user, TripRole.VIEWER);
        return ResponseEntity.ok(packingListService.generatePackingList(tripId));
    }
}
