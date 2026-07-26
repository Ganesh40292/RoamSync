package com.tripsyncai.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WeatherService {

    @SuppressWarnings("unused")
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getWeatherForecast(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            latitude = 35.6762;
            longitude = 139.6503;
        }

        Map<String, Object> forecast = new HashMap<>();
        forecast.put("lat", latitude);
        forecast.put("lon", longitude);
        forecast.put("temperature", "24.5°C");
        forecast.put("humidity", 60);
        forecast.put("weather", "Partly Cloudy");
        forecast.put("windSpeed", 12.4);
        forecast.put("description", "Pleasant weather for outdoor activities!");
        return forecast;
    }

    public Map<String, Object> getWeatherForDestination(String destination) {
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("destination", destination != null ? destination : "Tokyo");
        forecast.put("temperature", "22°C");
        forecast.put("weather", "Partly Sunny");
        forecast.put("humidity", 55);
        forecast.put("description", "Great weather for walking tours!");
        return forecast;
    }
}
