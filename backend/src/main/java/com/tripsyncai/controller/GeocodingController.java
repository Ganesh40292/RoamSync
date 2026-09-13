package com.tripsyncai.controller;

import com.tripsyncai.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/geocode", "/api/geocoding"})
@RequiredArgsConstructor
public class GeocodingController {

    private final GeocodingService geocodingService;

    @GetMapping({"", "/search"})
    public ResponseEntity<Map<String, Object>> geocode(@RequestParam String query) {
        return ResponseEntity.ok(geocodingService.geocode(query));
    }
}
