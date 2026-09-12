package com.tripsyncai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> geocode(String query) {
        if (query == null || query.trim().isBlank()) {
            throw new IllegalArgumentException("Location query cannot be empty");
        }

        String location = query.trim();

        // 1. Try Open-Meteo Geocoding API (Fast, reliable, free, zero keys required)
        try {
            String encoded = URLEncoder.encode(location, StandardCharsets.UTF_8);
            String url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encoded + "&count=1&language=en&format=json";

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode results = root.path("results");
                if (results.isArray() && results.size() > 0) {
                    JsonNode first = results.get(0);
                    double lat = first.path("latitude").asDouble();
                    double lon = first.path("longitude").asDouble();
                    String name = first.path("name").asText();
                    String country = first.path("country").asText("");
                    String admin1 = first.path("admin1").asText("");

                    StringBuilder formatted = new StringBuilder(name);
                    if (!admin1.isBlank()) formatted.append(", ").append(admin1);
                    if (!country.isBlank()) formatted.append(", ").append(country);

                    Map<String, Object> result = new HashMap<>();
                    result.put("lat", lat);
                    result.put("lng", lon);
                    result.put("latitude", lat);
                    result.put("longitude", lon);
                    result.put("formattedAddress", formatted.toString());
                    result.put("found", true);
                    return result;
                }
            }
        } catch (Exception e) {
            log.warn("Open-Meteo geocoding error for '{}': {}", location, e.getMessage());
        }

        // 2. Fallback to OpenStreetMap Nominatim
        try {
            String encoded = URLEncoder.encode(location, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + encoded + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TripSync-AI/1.0 (travel-planner)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode array = objectMapper.readTree(response.getBody());
                if (array.isArray() && array.size() > 0) {
                    JsonNode first = array.get(0);
                    double lat = Double.parseDouble(first.path("lat").asText());
                    double lon = Double.parseDouble(first.path("lon").asText());
                    String displayName = first.path("display_name").asText();

                    Map<String, Object> result = new HashMap<>();
                    result.put("lat", lat);
                    result.put("lng", lon);
                    result.put("latitude", lat);
                    result.put("longitude", lon);
                    result.put("formattedAddress", displayName);
                    result.put("found", true);
                    return result;
                }
            }
        } catch (Exception e) {
            log.warn("Nominatim geocoding error for '{}': {}", location, e.getMessage());
        }

        Map<String, Object> notFound = new HashMap<>();
        notFound.put("found", false);
        notFound.put("formattedAddress", location);
        notFound.put("lat", null);
        notFound.put("lng", null);
        return notFound;
    }
}
