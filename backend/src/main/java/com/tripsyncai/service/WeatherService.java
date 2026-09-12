package com.tripsyncai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getWeatherForecast(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            latitude = 48.8566;
            longitude = 2.3522;
        }

        try {
            String url = String.format(Locale.US,
                    "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current_weather=true",
                    latitude, longitude);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode current = root.path("current_weather");
                double temp = current.path("temperature").asDouble();
                double wind = current.path("windspeed").asDouble();
                int code = current.path("weathercode").asInt();

                String condition = decodeWeatherCode(code);

                Map<String, Object> forecast = new HashMap<>();
                forecast.put("lat", latitude);
                forecast.put("lon", longitude);
                forecast.put("temperature", String.format(Locale.US, "%.1f°C", temp));
                forecast.put("tempValue", temp);
                forecast.put("humidity", 60);
                forecast.put("weather", condition);
                forecast.put("windSpeed", wind);
                forecast.put("description", String.format("Current weather: %s with winds at %.1f km/h", condition, wind));
                return forecast;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch live weather from Open-Meteo for ({}, {}): {}", latitude, longitude, e.getMessage());
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("lat", latitude);
        fallback.put("lon", longitude);
        fallback.put("temperature", "22.0°C");
        fallback.put("weather", "Partly Cloudy");
        fallback.put("windSpeed", 10.0);
        fallback.put("description", "Live weather update temporarily unavailable");
        return fallback;
    }

    public Map<String, Object> getWeatherForDestination(String destination) {
        return getWeatherForecast(48.8566, 2.3522);
    }

    private String decodeWeatherCode(int code) {
        return switch (code) {
            case 0 -> "Clear Sky";
            case 1 -> "Mainly Clear";
            case 2 -> "Partly Cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Foggy";
            case 51, 53, 55 -> "Drizzle";
            case 61, 63, 65 -> "Rain";
            case 71, 73, 75 -> "Snowfall";
            case 80, 81, 82 -> "Rain Showers";
            case 95, 96, 99 -> "Thunderstorm";
            default -> "Clear";
        };
    }
}
