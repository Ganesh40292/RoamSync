package com.tripsyncai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOptionResponse {
    private Long id;
    private String optionText;
    private int voteCount;
    @Builder.Default
    private List<String> voterUsernames = new ArrayList<>();
    private boolean votedByCurrentUser;
}
