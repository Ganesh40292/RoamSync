package com.tripsyncai.controller;

import com.tripsyncai.dto.PlannerRequest;
import com.tripsyncai.service.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class PlannerController {

    private final PlannerService plannerService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateItinerary(@RequestBody PlannerRequest request) {
        return ResponseEntity.ok(plannerService.generateSmartItinerary(request));
    }
}
