package com.tripsyncai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripsyncai.dto.PlannerRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class PlannerService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> generateSmartItinerary(PlannerRequest request) {
        String dest = request.getDestinationName() != null ? request.getDestinationName() : request.getDestination();
        Integer daysCount = request.getDaysCount() != null ? request.getDaysCount() : request.getDays();

        if (dest == null || daysCount == null) {
            throw new IllegalArgumentException("Destination and days count are required");
        }

        String travelStyle = request.getTravelStyle() != null ? request.getTravelStyle() : "Balanced";
        List<String> interests = request.getInterests() != null ? request.getInterests() : List.of();

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                log.info("Calling Google Gemini AI ({}) for destination: {}", geminiModel, dest);
                return callGeminiApi(dest, daysCount, travelStyle, interests);
            } catch (Exception e) {
                log.error("Google Gemini AI request failed, falling back to local planner: {}", e.getMessage());
            }
        } else {
            log.info("No GEMINI_API_KEY provided. Using local AI smart planner for {}", dest);
        }

        return generateFallbackItinerary(dest, daysCount, travelStyle, interests);
    }

    private Map<String, Object> callGeminiApi(String destination, int days, String travelStyle, List<String> interests) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey.trim();

        String prompt = String.format(
                "You are TripSync AI, an expert travel concierge. Create a detailed %d-day itinerary for %s.\n" +
                "Travel Style: %s\n" +
                "Interests: %s\n\n" +
                "Respond ONLY with a valid raw JSON object (no markdown, no ```json formatting, no explanation). The JSON must follow this exact structure:\n" +
                "{\n" +
                "  \"destination\": \"%s\",\n" +
                "  \"travelStyle\": \"%s\",\n" +
                "  \"aiEngine\": \"Google Gemini AI\",\n" +
                "  \"days\": {\n" +
                "    \"1\": [\n" +
                "      {\"activity\": \"Activity description\", \"venue\": \"Specific venue/place name\", \"time\": \"09:00 AM\"},\n" +
                "      {\"activity\": \"Activity description\", \"venue\": \"Specific venue/place name\", \"time\": \"01:00 PM\"},\n" +
                "      {\"activity\": \"Activity description\", \"venue\": \"Specific venue/place name\", \"time\": \"07:00 PM\"}\n" +
                "    ]\n" +
                "  },\n" +
                "  \"tips\": [\"Local tip 1\", \"Local tip 2\", \"Local tip 3\"]\n" +
                "}",
                days, destination, travelStyle, String.join(", ", interests), destination, travelStyle
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            String rawJson = textNode.asText().trim();

            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.substring(7);
            }
            if (rawJson.startsWith("```")) {
                rawJson = rawJson.substring(3);
            }
            if (rawJson.endsWith("```")) {
                rawJson = rawJson.substring(0, rawJson.length() - 3);
            }
            rawJson = rawJson.trim();

            Map<String, Object> parsedMap = objectMapper.readValue(rawJson, new TypeReference<Map<String, Object>>() {});
            parsedMap.put("aiEngine", "Google Gemini AI");
            return parsedMap;
        }

        throw new RuntimeException("Unexpected response status from Gemini API: " + response.getStatusCode());
    }

    private Map<String, Object> generateFallbackItinerary(String destination, int daysCount, String travelStyle, List<String> interests) {
        Map<String, Object> itinerary = new HashMap<>();
        itinerary.put("destination", destination);
        itinerary.put("daysCount", daysCount);
        itinerary.put("travelStyle", travelStyle);
        itinerary.put("aiEngine", "TripSync Smart Planner (Offline Fallback)");

        Map<String, List<Map<String, String>>> daysMap = new HashMap<>();
        int maxDays = Math.min(daysCount, 14);
        String interestName = !interests.isEmpty() ? interests.get(0) : "scenic spots";

        for (int i = 1; i <= maxDays; i++) {
            List<Map<String, String>> dayActivities = new ArrayList<>();
            if (i == 1) {
                dayActivities.add(Map.of("activity", "Arrival & Hotel Check-in", "venue", destination + " Central Hotel", "time", "10:00 AM"));
                dayActivities.add(Map.of("activity", "Historic Center Walking Tour", "venue", destination + " Old Town", "time", "02:00 PM"));
                dayActivities.add(Map.of("activity", "Welcome Dinner at Local Bistro", "venue", destination + " Gourmet Quarter", "time", "07:30 PM"));
            } else if (i == maxDays) {
                dayActivities.add(Map.of("activity", "Souvenir & Local Market Tour", "venue", destination + " Central Market", "time", "09:30 AM"));
                dayActivities.add(Map.of("activity", "Scenic Park & Garden Walk", "venue", destination + " City Botanical Park", "time", "01:30 PM"));
                dayActivities.add(Map.of("activity", "Farewell Dinner & Departure Prep", "venue", destination + " Skyline Lounge", "time", "06:30 PM"));
            } else {
                dayActivities.add(Map.of("activity", "Guided Tour: Exploring " + interestName, "venue", destination + " Cultural District", "time", "09:00 AM"));
                dayActivities.add(Map.of("activity", "Lunch & Local Food Tasting", "venue", destination + " Food Market", "time", "01:00 PM"));
                dayActivities.add(Map.of("activity", travelStyle + " Excursion & Outdoor Experience", "venue", destination + " Landmark Area", "time", "03:30 PM"));
                dayActivities.add(Map.of("activity", "Evening Sunset View & Relaxation", "venue", destination + " Observation Point", "time", "07:00 PM"));
            }
            daysMap.put(String.valueOf(i), dayActivities);
        }

        itinerary.put("days", daysMap);
        itinerary.put("tips", List.of(
                "Keep offline maps downloaded before exploring.",
                "Carry local currency or contactless payment cards.",
                "Check local attraction operating hours in advance."
        ));

        return itinerary;
    }
}
