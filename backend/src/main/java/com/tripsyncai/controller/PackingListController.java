package com.tripsyncai.controller;

import com.tripsyncai.service.PackingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/packing-list")
@RequiredArgsConstructor
public class PackingListController {

    private final PackingListService packingListService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPackingList(@PathVariable Long tripId) {
        return ResponseEntity.ok(packingListService.generatePackingList(tripId));
    }
}
