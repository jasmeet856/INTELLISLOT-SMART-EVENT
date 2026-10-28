-- ====================================================================
-- IntelliSlot – Smart Event & Environment Notification System
-- Supabase / PostgreSQL Database Schema
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'New Delhi',
    state VARCHAR(100) DEFAULT 'Delhi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'personal', -- campus, corporate, holiday, festival, exam, personal
    event_date DATE NOT NULL,
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '10:00:00',
    location VARCHAR(200) DEFAULT 'Campus / Office',
    reminder_days_before INT DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(user_id, event_date);

-- 3. Holidays & Indian Festivals
CREATE TABLE IF NOT EXISTS holidays_festivals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    state VARCHAR(100) DEFAULT 'All India'
);

-- 4. Notifications Log (Deduplication)
CREATE TABLE IF NOT EXISTS notifications_log (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT REFERENCES events(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'event_reminder',
    scheduled_for DATE NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_notif_user_date ON notifications_log(user_id, scheduled_for, type);

-- 5. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enable_browser_notifications BOOLEAN DEFAULT TRUE,
    enable_weather_alerts BOOLEAN DEFAULT TRUE,
    enable_festival_alerts BOOLEAN DEFAULT TRUE,
    reminder_lead_days INT DEFAULT 14,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Festivals (2026)
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
ON CONFLICT DO NOTHING;
