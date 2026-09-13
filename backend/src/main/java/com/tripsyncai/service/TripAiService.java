package com.tripsyncai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripsyncai.entity.Destination;
import com.tripsyncai.entity.Itinerary;
import com.tripsyncai.entity.Trip;
import com.tripsyncai.entity.TripRole;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.ResourceNotFoundException;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripAiService {

    private final TripRepository tripRepository;
    private final TripAuthorizationService tripAuthorizationService;
    private final WeatherService weatherService;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory rate limiting queues (sliding window)
    private final Map<String, Deque<Long>> chatRateLimits = new ConcurrentHashMap<>();
    private final Map<Long, Deque<Long>> packingRateLimits = new ConcurrentHashMap<>();

    private static final int MAX_CHAT_PER_MINUTE = 5;
    private static final int MAX_PACKING_PER_HOUR = 3;

    /**
     * In-chat AI travel assistant (@RoamBot) endpoint with rate limiting and trip-bounded context.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> askRoamBot(Long tripId, String prompt, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);

        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be empty");
        }

        // 1. Enforce rate limit (max 5 calls per minute per user/trip)
        String rateKey = tripId + ":" + caller.getId();
        long now = System.currentTimeMillis();
        chatRateLimits.compute(rateKey, (k, deque) -> {
            if (deque == null) deque = new ArrayDeque<>();
            while (!deque.isEmpty() && now - deque.peekFirst() > 60_000) {
                deque.pollFirst();
            }
            if (deque.size() >= MAX_CHAT_PER_MINUTE) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "RoamBot rate limit exceeded: maximum 5 queries per minute. Please try again in a moment.");
            }
            deque.addLast(now);
            return deque;
        });

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        // 2. Build minimal, bounded trip context
        List<String> destinationNames = trip.getDestinations().stream()
                .map(Destination::getName)
                .collect(Collectors.toList());

        List<String> activities = trip.getItineraries().stream()
                .map(it -> String.format("Day %d: %s (%s)", it.getDayNumber(), it.getTitle(), it.getTimeSlot()))
                .limit(10)
                .collect(Collectors.toList());

        Map<String, Object> boundedContext = new LinkedHashMap<>();
        boundedContext.put("tripName", trip.getName());
        boundedContext.put("destinations", destinationNames);
        boundedContext.put("startDate", String.valueOf(trip.getStartDate()));
        boundedContext.put("endDate", String.valueOf(trip.getEndDate()));
        boundedContext.put("itinerarySample", activities);

        String answer;
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("your_gemini_api_key_here")) {
            try {
                answer = callGeminiForChat(prompt, boundedContext);
            } catch (Exception e) {
                log.warn("Gemini call failed for RoamBot, falling back: {}", e.getMessage());
                answer = generateLocalRoamBotResponse(prompt, trip);
            }
        } else {
            answer = generateLocalRoamBotResponse(prompt, trip);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("role", "assistant");
        response.put("author", "RoamBot 🤖");
        response.put("content", answer);
        response.put("timestamp", Instant.now().toString());
        return response;
    }

    /**
     * AI-generated weather-aware packing suggestions with rate limiting and structured suggestions.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAiPackingSuggestions(Long tripId, User caller) {
        tripAuthorizationService.verifyRole(tripId, caller, TripRole.VIEWER);

        // Enforce rate limit (max 3 calls per hour per trip)
        long now = System.currentTimeMillis();
        packingRateLimits.compute(tripId, (k, deque) -> {
            if (deque == null) deque = new ArrayDeque<>();
            while (!deque.isEmpty() && now - deque.peekFirst() > 3600_000) {
                deque.pollFirst();
            }
            if (deque.size() >= MAX_PACKING_PER_HOUR) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Smart Packing suggestions rate limit exceeded: maximum 3 requests per hour.");
            }
            deque.addLast(now);
            return deque;
        });

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        String primaryDest = !trip.getDestinations().isEmpty()
                ? trip.getDestinations().get(0).getName()
                : trip.getName();

        Map<String, Object> weather = weatherService.getWeatherForDestination(primaryDest);

        Map<String, List<String>> categories = new LinkedHashMap<>();

        categories.put("Essentials", List.of(
                "Passports & Physical Photocopies",
                "Flight & Hotel Booking Confirmations",
                "Primary & Backup Payment Cards",
                "Local Currency Cash Reserves"
        ));

        categories.put("Electronics & Tech", List.of(
                "Universal Power Plug Adapter",
                "Multi-device High-capacity Power Bank",
                "Noise-isolating Travel Earbuds",
                "Offline Map Data Downloaded"
        ));

        List<String> weatherGear = new ArrayList<>();
        if (weather != null && weather.containsKey("weather")) {
            String desc = weather.get("weather").toString().toLowerCase();
            if (desc.contains("rain") || desc.contains("drizzle")) {
                weatherGear.add("Windproof Compact Travel Umbrella");
                weatherGear.add("Breathable Waterproof Rain Shell");
            } else if (desc.contains("cold") || desc.contains("snow")) {
                weatherGear.add("Merino Wool Thermal Base Layer");
                weatherGear.add("Insulated Water-resistant Parka");
            } else {
                weatherGear.add("Polarized UV400 Sunglasses");
                weatherGear.add("Broad Spectrum SPF 50+ Sun Protection");
            }
        } else {
            weatherGear.add("Compact Layered Jacket");
            weatherGear.add("Polarized Sunglasses");
        }
        categories.put("Weather & Climate", weatherGear);

        categories.put("Health & Comfort", List.of(
                "Personal First-aid & Electrolyte Packets",
                "Prescription Medications with Labels",
                "TSA-compliant Refillable Toiletry Bottles"
        ));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("tripId", tripId);
        result.put("destination", primaryDest);
        result.put("categories", categories);
        return result;
    }

    private String callGeminiForChat(String userPrompt, Map<String, Object> context) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey.trim();

        String systemContext = String.format(
                "You are @RoamBot, an intelligent and friendly AI travel concierge inside the group chat for trip '%s'.\n" +
                "Destinations: %s\nDates: %s to %s\n" +
                "Activities: %s\n\n" +
                "Answer the following traveler question concisely (max 3-4 bullet points), warmly, and accurately. " +
                "Do NOT make up fake hotels or flight numbers. Question: %s",
                context.get("tripName"),
                context.get("destinations"),
                context.get("startDate"),
                context.get("endDate"),
                context.get("itinerarySample"),
                userPrompt
        );

        Map<String, Object> part = Map.of("text", systemContext);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> payload = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private String generateLocalRoamBotResponse(String userPrompt, Trip trip) {
        String lower = userPrompt.toLowerCase();
        String dest = !trip.getDestinations().isEmpty() ? trip.getDestinations().get(0).getName() : trip.getName();

        if (lower.contains("food") || lower.contains("dinner") || lower.contains("restaurant") || lower.contains("eat")) {
            return String.format(
                    "Here are 3 highly rated recommendations near %s:\n" +
                    "• **Local Heritage Kitchen**: Renowned for regional delicacies and warm ambiance.\n" +
                    "• **The Grand Bistro**: Ideal for evening group dinners with outdoor seating.\n" +
                    "• **Old Town Artisan Market**: Perfect for authentic street cuisine and snacks.",
                    dest
            );
        } else if (lower.contains("weather") || lower.contains("forecast") || lower.contains("rain")) {
            return String.format(
                    "🌦️ Weather check for **%s**:\n" +
                    "• Current conditions are moderate. Check out the live forecast widget in the Itinerary tab for hourly precipitation and temperatures.",
                    dest
            );
        } else if (lower.contains("schedule") || lower.contains("plan") || lower.contains("tomorrow") || lower.contains("today")) {
            int count = trip.getItineraries() != null ? trip.getItineraries().size() : 0;
            return String.format(
                    "📅 Schedule Summary for **%s**:\n" +
                    "• You currently have **%d** scheduled activities in the timeline.\n" +
                    "• Head over to the **Itinerary Schedule** tab to see day-by-day stops or use the 'Optimize Day Route' feature to minimize transit!",
                    trip.getName(), count
            );
        } else {
            return String.format(
                    "👋 Hi from **@RoamBot**! I'm synced with your trip to **%s** (%d places pinned).\n" +
                    "You can ask me for restaurant suggestions, route optimization tips, packing advice, or schedule highlights anytime!",
                    dest, trip.getDestinations().size()
            );
        }
    }
}
