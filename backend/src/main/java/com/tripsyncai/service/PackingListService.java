package com.tripsyncai.service;

import com.tripsyncai.entity.Trip;
import com.tripsyncai.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PackingListService {

    private final TripRepository tripRepository;
    private final WeatherService weatherService;

    public Map<String, Object> generatePackingList(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + tripId));

        String destination = !trip.getDestinations().isEmpty() ? trip.getDestinations().get(0).getName() : trip.getName();
        Map<String, Object> weather = weatherService.getWeatherForDestination(destination);

        List<String> essentials = new ArrayList<>(List.of(
                "Passport / National ID & Copies",
                "Travel Insurance Documents",
                "Phone Charger & Portable Power Bank",
                "Universal Outlet Adapter",
                "Prescription Medications & First Aid Kit",
                "Credit Cards & Local Cash"
        ));

        List<String> clothing = new ArrayList<>(List.of(
                "Comfortable Walking Shoes",
                "Underwear & Socks (Daily Set)",
                "Casual Tops & T-Shirts",
                "Jeans or Lightweight Pants"
        ));

        List<String> weatherGear = new ArrayList<>();

        if (weather != null && weather.containsKey("weather")) {
            String desc = weather.get("weather").toString().toLowerCase();
            if (desc.contains("rain") || desc.contains("drizzle") || desc.contains("thunderstorm")) {
                weatherGear.add("Compact Umbrella");
                weatherGear.add("Waterproof Jacket / Raincoat");
                weatherGear.add("Water-resistant Shoes");
            }
            if (desc.contains("snow") || desc.contains("cold") || desc.contains("freezing")) {
                weatherGear.add("Heavy Thermal Coat / Parka");
                weatherGear.add("Warm Beanie, Gloves & Scarf");
                weatherGear.add("Thermal Inner Layer");
            }
            if (desc.contains("sun") || desc.contains("clear") || desc.contains("heat")) {
                weatherGear.add("UV Sunglasses");
                weatherGear.add("Broad Spectrum Sunscreen SPF 50+");
                weatherGear.add("Sun Hat / Cap");
                weatherGear.add("Reusable Refillable Water Bottle");
            }
        }

        if (weatherGear.isEmpty()) {
            weatherGear.add("All-weather Layered Jacket");
            weatherGear.add("Sunglasses & Sunscreen");
            weatherGear.add("Refillable Water Bottle");
        }

        List<String> techAndExtras = List.of(
                "Noise-canceling Headphones",
                "Offline Maps & Travel Guide",
                "Toiletry Bag & Travel Toothbrush",
                "Reusable Tote Bag for Shopping"
        );

        Map<String, Object> result = new HashMap<>();
        result.put("tripId", tripId);
        result.put("tripName", trip.getName());
        result.put("destination", destination);
        result.put("weatherCondition", weather != null ? weather.get("weather") : "Moderate");
        result.put("temperature", weather != null ? weather.get("temperature") : "22°C");
        result.put("essentials", essentials);
        result.put("clothing", clothing);
        result.put("weatherGear", weatherGear);
        result.put("techAndExtras", techAndExtras);

        return result;
    }
}
