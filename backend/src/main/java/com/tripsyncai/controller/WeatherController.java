package com.tripsyncai.controller;

import com.tripsyncai.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(
            @RequestParam Double lat,
            @RequestParam Double lon
    ) {
        return ResponseEntity.ok(weatherService.getWeatherForecast(lat, lon));
    }
}
