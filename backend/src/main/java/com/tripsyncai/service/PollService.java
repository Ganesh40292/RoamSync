package com.tripsyncai.service;

import com.tripsyncai.entity.Poll;
import com.tripsyncai.entity.PollOption;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.PollOptionRepository;
import com.tripsyncai.repository.PollRepository;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final TripRepository tripRepository;

    public List<Poll> getPollsForTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return pollRepository.findByTrip(trip);
    }

    @Transactional
    public Poll createPoll(Long tripId, String question, List<String> optionTexts, User creator) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        Poll poll = Poll.builder()
                .question(question)
                .trip(trip)
                .creator(creator)
                .build();

        List<PollOption> options = new ArrayList<>();
        for (String optText : optionTexts) {
            if (optText != null && !optText.trim().isEmpty()) {
                options.add(PollOption.builder()
                        .optionText(optText.trim())
                        .poll(poll)
                        .voters(new ArrayList<>())
                        .build());
            }
        }
        poll.setOptions(options);
        return pollRepository.save(poll);
    }

    @Transactional
    public Poll voteInPoll(Long optionId, User user) {
        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found with id: " + optionId));

        Poll poll = option.getPoll();

        for (PollOption opt : poll.getOptions()) {
            opt.getVoters().removeIf(u -> u.getId().equals(user.getId()));
            pollOptionRepository.save(opt);
        }

        option.getVoters().add(user);
        pollOptionRepository.save(option);

        return pollRepository.findById(poll.getId()).orElse(poll);
    }
}
