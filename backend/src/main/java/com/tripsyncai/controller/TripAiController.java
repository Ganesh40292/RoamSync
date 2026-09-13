package com.tripsyncai.controller;

import com.tripsyncai.entity.User;
import com.tripsyncai.service.TripAiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}")
@RequiredArgsConstructor
public class TripAiController {

    private final TripAiService tripAiService;

    @Data
    public static class AiChatRequest {
        private String prompt;
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<Map<String, Object>> chatWithRoamBot(
            @PathVariable Long tripId,
            @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripAiService.askRoamBot(tripId, request.getPrompt(), caller));
    }

    @PostMapping("/packing/ai-suggest")
    public ResponseEntity<Map<String, Object>> getAiPackingSuggestions(
            @PathVariable Long tripId,
            @AuthenticationPrincipal User caller
    ) {
        return ResponseEntity.ok(tripAiService.getAiPackingSuggestions(tripId, caller));
    }
}
