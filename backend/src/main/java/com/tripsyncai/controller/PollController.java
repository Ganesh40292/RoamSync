package com.tripsyncai.controller;

import com.tripsyncai.entity.Poll;
import com.tripsyncai.entity.User;
import com.tripsyncai.service.PollService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @GetMapping
    public ResponseEntity<List<Poll>> getPolls(@PathVariable Long tripId) {
        return ResponseEntity.ok(pollService.getPollsForTrip(tripId));
    }

    @PostMapping
    public ResponseEntity<Poll> createPoll(
            @PathVariable Long tripId,
            @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(pollService.createPoll(tripId, request.getQuestion(), request.getOptions(), user));
    }

    @PostMapping("/vote/{optionId}")
    public ResponseEntity<Poll> vote(
            @PathVariable Long tripId,
            @PathVariable Long optionId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(pollService.voteInPoll(optionId, user));
    }

    @Data
    public static class CreatePollRequest {
        private String question;
        private List<String> options;
    }
}
