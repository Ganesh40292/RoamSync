package com.tripsyncai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ReceiptOcrService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parseReceipt(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Receipt file cannot be empty");
        }

        if (geminiApiKey == null || geminiApiKey.trim().isBlank()) {
            throw new IllegalStateException("Receipt OCR service unavailable: GEMINI_API_KEY is not configured.");
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            return callGeminiVisionApi(base64Image, mimeType);
        } catch (Exception e) {
            log.error("Gemini OCR parsing failed for file {}: {}", file.getOriginalFilename(), e.getMessage());
            throw new IllegalArgumentException("Failed to scan receipt image: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> callGeminiVisionApi(String base64Data, String mimeType) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey.trim();

        String prompt = "Analyze this receipt image. Extract the total expense amount, short itemized description or merchant name, date (YYYY-MM-DD), and suggested category (Food, Stay, Transit, Entertainment, Shopping, Other).\n" +
                "Respond ONLY with a valid raw JSON object matching this structure (no markdown, no ```json):\n" +
                "{\n" +
                "  \"amount\": 45.50,\n" +
                "  \"description\": \"Dinner at Bistro Central\",\n" +
                "  \"category\": \"Food\",\n" +
                "  \"date\": \"2026-07-25\",\n" +
                "  \"confidence\": \"High\"\n" +
                "}";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt),
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType,
                                        "data", base64Data
                                ))
                        ))
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

            if (rawJson.startsWith("```json")) rawJson = rawJson.substring(7);
            if (rawJson.startsWith("```")) rawJson = rawJson.substring(3);
            if (rawJson.endsWith("```")) rawJson = rawJson.substring(0, rawJson.length() - 3);
            rawJson = rawJson.trim();

            Map<String, Object> parsed = objectMapper.readValue(rawJson, Map.class);
            if (parsed.containsKey("amount")) {
                try {
                    BigDecimal amt = new BigDecimal(parsed.get("amount").toString()).setScale(2, RoundingMode.HALF_UP);
                    parsed.put("amount", amt);
                } catch (Exception ignored) {}
            }
            return parsed;
        }

        throw new RuntimeException("Gemini Vision API returned non-success HTTP status: " + response.getStatusCode());
    }
}
