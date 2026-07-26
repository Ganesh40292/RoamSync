package com.tripsyncai.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {

    private static final Map<String, Double> RATES_TO_USD = new HashMap<>();

    static {
        RATES_TO_USD.put("USD", 1.0);
        RATES_TO_USD.put("EUR", 1.09);
        RATES_TO_USD.put("GBP", 1.28);
        RATES_TO_USD.put("INR", 0.012);
        RATES_TO_USD.put("JPY", 0.0065);
        RATES_TO_USD.put("CAD", 0.73);
        RATES_TO_USD.put("AUD", 0.66);
        RATES_TO_USD.put("CHF", 1.13);
        RATES_TO_USD.put("CNY", 0.14);
        RATES_TO_USD.put("SGD", 0.74);
    }

    public Map<String, Object> getExchangeRates(String baseCurrency) {
        String base = baseCurrency != null ? baseCurrency.toUpperCase() : "USD";
        Double baseToUsd = RATES_TO_USD.getOrDefault(base, 1.0);

        Map<String, Double> convertedRates = new HashMap<>();
        for (Map.Entry<String, Double> entry : RATES_TO_USD.entrySet()) {
            Double targetToUsd = entry.getValue();
            convertedRates.put(entry.getKey(), Math.round((baseToUsd / targetToUsd) * 10000.0) / 10000.0);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("baseCurrency", base);
        response.put("rates", convertedRates);
        return response;
    }

    public Double convertCurrency(Double amount, String fromCurrency, String toCurrency) {
        if (amount == null) return 0.0;
        String from = fromCurrency != null ? fromCurrency.toUpperCase() : "USD";
        String to = toCurrency != null ? toCurrency.toUpperCase() : "USD";

        Double fromUsd = RATES_TO_USD.getOrDefault(from, 1.0);
        Double toUsd = RATES_TO_USD.getOrDefault(to, 1.0);

        Double inUsd = amount * fromUsd;
        Double converted = inUsd / toUsd;
        return Math.round(converted * 100.0) / 100.0;
    }
}
