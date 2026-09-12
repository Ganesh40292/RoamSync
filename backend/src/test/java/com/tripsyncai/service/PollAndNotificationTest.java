package com.tripsyncai.service;

import com.tripsyncai.dto.NotificationResponse;
import com.tripsyncai.dto.PollResponse;
import com.tripsyncai.entity.*;
import com.tripsyncai.mapper.TripMapper;
import com.tripsyncai.repository.NotificationRepository;
import com.tripsyncai.repository.PollOptionRepository;
import com.tripsyncai.repository.PollRepository;
import com.tripsyncai.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PollAndNotificationTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private TripAuthorizationService tripAuthorizationService;

    @Spy
    private TripMapper tripMapper = new TripMapper();

    private PollService pollService;
    private NotificationService notificationService;

    private User alice;
    private User bob;
    private Trip trip;
    private Poll poll;
    private PollOption opt1;
    private PollOption opt2;

    @BeforeEach
    void setUp() {
        pollService = new PollService(pollRepository, pollOptionRepository, tripRepository, tripAuthorizationService, tripMapper);
        notificationService = new NotificationService(notificationRepository);

        alice = User.builder().id(1L).username("alice").fullName("Alice").build();
        bob = User.builder().id(2L).username("bob").fullName("Bob").build();

        trip = Trip.builder().id(100L).name("Tokyo Trip").owner(alice).build();

        poll = Poll.builder().id(50L).question("Where to eat?").trip(trip).creator(alice).build();

        opt1 = PollOption.builder().id(501L).poll(poll).optionText("Ramen").voters(new ArrayList<>()).build();
        opt2 = PollOption.builder().id(502L).poll(poll).optionText("Sushi").voters(new ArrayList<>()).build();
        poll.setOptions(new ArrayList<>(List.of(opt1, opt2)));
    }

    @Test
    void voteInPoll_shiftsVoteAtomicallyBetweenOptions() {
        when(tripAuthorizationService.verifyRole(eq(100L), eq(bob), eq(TripRole.MEMBER)))
                .thenReturn(TripMember.builder().role(TripRole.MEMBER).build());
        when(pollOptionRepository.findById(501L)).thenReturn(Optional.of(opt1));
        when(pollRepository.findById(50L)).thenReturn(Optional.of(poll));

        // Bob votes for option 1
        PollResponse res1 = pollService.voteInPoll(100L, 501L, bob);
        assertEquals(1, opt1.getVoters().size());
        assertTrue(opt1.getVoters().contains(bob));

        // Bob shifts vote to option 2
        when(pollOptionRepository.findById(502L)).thenReturn(Optional.of(opt2));
        PollResponse res2 = pollService.voteInPoll(100L, 502L, bob);

        assertFalse(opt1.getVoters().contains(bob), "Option 1 should no longer contain Bob's vote");
        assertTrue(opt2.getVoters().contains(bob), "Option 2 should now contain Bob's vote");
    }

    @Test
    void voteInPoll_throwsWhenOptionBelongsToDifferentTrip() {
        when(tripAuthorizationService.verifyRole(eq(999L), eq(bob), eq(TripRole.MEMBER)))
                .thenReturn(TripMember.builder().role(TripRole.MEMBER).build());
        when(pollOptionRepository.findById(501L)).thenReturn(Optional.of(opt1));

        // Target trip is 999, but poll belongs to trip 100
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                pollService.voteInPoll(999L, 501L, bob)
        );

        assertTrue(ex.getMessage().contains("does not belong to the specified trip"));
    }

    @Test
    void notificationService_createsAndMarksRead() {
        Notification notification = Notification.builder()
                .id(10L)
                .user(alice)
                .type("TRIP_INVITE")
                .title("Trip Invitation")
                .message("You were invited to Tokyo Trip")
                .isRead(false)
                .build();

        when(notificationRepository.findByIdAndUser(10L, alice)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(10L, alice);
        assertTrue(response.isRead());
        verify(notificationRepository).save(notification);
    }
}
