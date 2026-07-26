# TripSync AI Database Schema Script (MySQL Workbench Compliant)

This document details the complete MySQL DDL schema definition script for the **TripSync AI** database. It is optimized for **MySQL Workbench** using the **InnoDB** storage engine to support robust transactional integrity and foreign key constraints.

---

## 💾 MySQL SQL Schema

```sql
-- -------------------------------------------------------------
-- 1. Users Table
-- -------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER'
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 2. Trips Table
-- -------------------------------------------------------------
CREATE TABLE trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 3. Trip Members Join Table (Many-to-Many mapping)
-- -------------------------------------------------------------
CREATE TABLE trip_members (
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (trip_id, user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 4. Destinations Table
-- -------------------------------------------------------------
CREATE TABLE destinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    description TEXT,
    trip_id BIGINT NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 5. Itineraries Table (Day-wise activities schedule)
-- -------------------------------------------------------------
CREATE TABLE itineraries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_number INT NOT NULL,
    activity_date DATE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trip_id BIGINT NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 6. Expenses Table (Financial ledger entries)
-- -------------------------------------------------------------
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DOUBLE NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    payer_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 7. Expense Sharers Join Table (Who splits the specific expense)
-- -------------------------------------------------------------
CREATE TABLE expense_sharers (
    expense_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (expense_id, user_id),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 8. Chat Messages Table (WebSocket real-time group feed logs)
-- -------------------------------------------------------------
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    sender_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 9. Reviews Table (Destination & Attraction ratings)
-- -------------------------------------------------------------
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_id BIGINT NOT NULL,
    attraction_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Indexes for Performance Optimization
-- -------------------------------------------------------------
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_destinations_trip ON destinations(trip_id);
CREATE INDEX idx_itineraries_trip ON itineraries(trip_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_chat_messages_trip ON chat_messages(trip_id);
```
