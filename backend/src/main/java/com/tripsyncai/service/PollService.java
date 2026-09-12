package com.tripsyncai.service;

import com.tripsyncai.dto.PollOptionResponse;
import com.tripsyncai.dto.PollResponse;
import com.tripsyncai.entity.*;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.PollOptionRepository;
import com.tripsyncai.repository.PollRepository;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final TripRepository tripRepository;
    private final TripAuthorizationService tripAuthorizationService;
    private final TripMapper tripMapper;

    @Transactional(readOnly = true)
    public List<PollResponse> getPollsForTrip(Long tripId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        return pollRepository.findByTrip(trip).stream()
                .map(p -> toResponse(p, caller))
                .collect(Collectors.toList());
    }

    @Transactional
    public PollResponse createPoll(Long tripId, String question, List<String> optionTexts, User creator) {
        tripAuthorizationService.verifyRole(tripId, creator, TripRole.MEMBER);

        if (question == null || question.trim().isBlank()) {
            throw new IllegalArgumentException("Poll question cannot be empty");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Poll poll = Poll.builder()
                .question(question.trim())
                .trip(trip)
                .creator(creator)
                .build();

        List<PollOption> options = new ArrayList<>();
        if (optionTexts != null) {
            for (String optText : optionTexts) {
                if (optText != null && !optText.trim().isEmpty()) {
                    options.add(PollOption.builder()
                            .optionText(optText.trim())
                            .poll(poll)
                            .voters(new ArrayList<>())
                            .build());
                }
            }
        }

        if (options.size() < 2) {
            throw new IllegalArgumentException("A poll must have at least 2 options");
        }

        poll.setOptions(options);
        Poll saved = pollRepository.save(poll);
        return toResponse(saved, creator);
    }

    @Transactional
    public PollResponse voteInPoll(Long tripId, Long optionId, User user) {
        tripAuthorizationService.verifyRole(tripId, user, TripRole.MEMBER);

        PollOption selectedOption = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found with id: " + optionId));

        Poll poll = selectedOption.getPoll();
        if (!poll.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Poll option does not belong to the specified trip");
        }

        // Concurrency-safe vote shift: remove user vote from any existing option in this poll
        for (PollOption opt : poll.getOptions()) {
            opt.getVoters().removeIf(u -> u.getId().equals(user.getId()));
            pollOptionRepository.save(opt);
        }

        // Add user vote to the selected option
        selectedOption.getVoters().add(user);
        pollOptionRepository.save(selectedOption);

        Poll updated = pollRepository.findById(poll.getId()).orElse(poll);
        return toResponse(updated, user);
    }

    public PollResponse toResponse(Poll poll, User currentUser) {
        int totalVotes = 0;
        List<PollOptionResponse> optionResponses = new ArrayList<>();

        if (poll.getOptions() != null) {
            for (PollOption opt : poll.getOptions()) {
                int votes = opt.getVoters() != null ? opt.getVoters().size() : 0;
                totalVotes += votes;

                List<String> usernames = opt.getVoters() != null
                        ? opt.getVoters().stream().map(User::getUsername).collect(Collectors.toList())
                        : List.of();

                boolean hasVoted = currentUser != null && opt.getVoters() != null
                        && opt.getVoters().stream().anyMatch(u -> u.getId().equals(currentUser.getId()));

                optionResponses.add(PollOptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .voteCount(votes)
                        .voterUsernames(usernames)
                        .votedByCurrentUser(hasVoted)
                        .build());
            }
        }

        return PollResponse.builder()
                .id(poll.getId())
                .tripId(poll.getTrip() != null ? poll.getTrip().getId() : null)
                .question(poll.getQuestion())
                .creator(tripMapper.toUserSummary(poll.getCreator()))
                .options(optionResponses)
                .totalVotes(totalVotes)
                .createdAt(poll.getCreatedAt())
                .build();
    }
}
