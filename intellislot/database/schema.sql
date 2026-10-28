-- ====================================================================
-- IntelliSlot – Smart Event & Environment Notification System
-- Database Schema for MySQL 8.x / MariaDB
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS intellislot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intellislot_db;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'New Delhi',
    state VARCHAR(100) DEFAULT 'Delhi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Events Table
-- Supports campus schedules, corporate events, personal reminders, exams, etc.
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('campus', 'corporate', 'holiday', 'festival', 'exam', 'personal') DEFAULT 'personal',
    event_date DATE NOT NULL,
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '10:00:00',
    location VARCHAR(200) DEFAULT 'Campus / Office',
    reminder_days_before INT DEFAULT 1, -- e.g., 14, 7, 3, 1 day before
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, event_date)
) ENGINE=InnoDB;

-- 4. National & State Holidays / Indian Festivals Reference Table
CREATE TABLE IF NOT EXISTS holidays_festivals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category ENUM('national_holiday', 'state_holiday', 'indian_festival') NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    state VARCHAR(100) DEFAULT 'All India'
) ENGINE=InnoDB;

-- 5. Notifications & Reminders Log Table
-- Tracks sent notifications to prevent spam and duplicate alerts
CREATE TABLE IF NOT EXISTS notifications_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('event_reminder', 'weather_alert', 'festival_alert', 'system') DEFAULT 'event_reminder',
    scheduled_for DATE NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    INDEX idx_user_scheduled (user_id, scheduled_for, type)
) ENGINE=InnoDB;

-- 6. User Profile & Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    enable_browser_notifications BOOLEAN DEFAULT TRUE,
    enable_weather_alerts BOOLEAN DEFAULT TRUE,
    enable_festival_alerts BOOLEAN DEFAULT TRUE,
    reminder_lead_days INT DEFAULT 14, -- Supports reminders up to 14 days in advance
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- Sample Seed Data: Indian Festivals & Holidays (2025 - 2026)
-- ====================================================================
INSERT INTO holidays_festivals (title, category, date, description, state) VALUES
('Republic Day', 'national_holiday', '2026-01-26', 'Honoring the Constitution of India', 'All India'),
('Maha Shivratri', 'indian_festival', '2026-02-15', 'Celebration of Lord Shiva', 'All India'),
('Holi (Festival of Colors)', 'indian_festival', '2026-03-04', 'Festival of colors and spring', 'All India'),
('Eid-ul-Fitr', 'indian_festival', '2026-03-21', 'End of Holy Month of Ramadan', 'All India'),
('Mahavir Jayanti', 'indian_festival', '2026-03-31', 'Birth of Lord Mahavira', 'All India'),
('Good Friday', 'national_holiday', '2026-04-03', 'Christian observance of crucifixion', 'All India'),
('Independence Day', 'national_holiday', '2026-08-15', 'Indian Independence from British Rule', 'All India'),
('Raksha Bandhan', 'indian_festival', '2026-08-28', 'Celebration of bond between siblings', 'All India'),
('Janmashtami', 'indian_festival', '2026-09-04', 'Birth of Lord Krishna', 'All India'),
('Mahatma Gandhi Jayanti', 'national_holiday', '2026-10-02', 'Birth anniversary of Father of the Nation', 'All India'),
('Dussehra (Vijayadashami)', 'indian_festival', '2026-10-20', 'Victory of Good over Evil', 'All India'),
('Diwali (Deepavali)', 'indian_festival', '2026-11-08', 'Festival of Lights and Prosperity', 'All India'),
('Guru Nanak Jayanti', 'indian_festival', '2026-11-24', 'Gurpurab celebration', 'All India'),
('Christmas', 'national_holiday', '2026-12-25', 'Celebration of Jesus Christ birth', 'All India')
ON DUPLICATE KEY UPDATE title=VALUES(title);
