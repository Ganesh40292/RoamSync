package com.tripsyncai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TripSyncAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripSyncAiApplication.class, args);
    }
}
