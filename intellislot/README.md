# IntelliSlot – Smart Event & Environment Notification System

> A full-stack smart scheduling and environmental notification platform designed for campus calendars, corporate recruitment drives, Indian festivals, real-time weather & AQI monitoring, and automated 14-day advance reminders.

---

## 🚀 Features

- **Event Management**: Create, edit, and organize Campus Schedules, Corporate Placement Drives, Exams, and Personal slots.
- **14-Day Automated Reminders**: Background scheduler (`node-cron`) automatically scans for upcoming deadlines up to 2 weeks in advance and dispatches in-app and browser notifications with deduplication.
- **Weather & Air Quality (AQI)**: Real-time environmental tracking (Temperature, Humidity, Wind, PM2.5, AQI classification) using Open-Meteo.
- **Indian Festivals & National Holidays**: Pre-seeded calendar of Indian gazetted holidays and cultural festivals.
- **Deduplication Engine**: Ensures reminder notifications are never sent twice on the same day for the same event.
- **Dual Database Support**: Ready for **MySQL** (Local XAMPP, Aiven, TiDB Cloud, Railway) or **Supabase / PostgreSQL**.
- **Configurable API Architecture**: Clean separation between Vanilla Frontend and Express Backend with CORS and environment variable isolation.

---

## 📁 Project Structure

```text
IntelliSlot/
├── frontend/                     # Pure HTML5, CSS3, Vanilla JavaScript
│   ├── index.html                # Main application interface
│   ├── css/
│   │   └── style.css             # Responsive styling
│   └── js/
│       ├── config.js             # Production / Localhost API URL configuration
│       └── app.js                # Event CRUD, 14-day scheduler checks, weather & AQI
├── backend/                      # Node.js & Express.js REST API
│   ├── server.js                 # Express server, routes, and node-cron background job
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables template (safe for GitHub)
│   └── .gitignore                # Excludes node_modules & .env
└── database/
    ├── schema.sql                # Complete MySQL DDL & Seed Script
    └── supabase_schema.sql       # Supabase / PostgreSQL DDL Script
```

---

## 🛠️ Local Development Setup

### 1. Database Setup (MySQL)
1. Open phpMyAdmin or your MySQL client.
2. Create a database or run the SQL script:
   ```sql
   SOURCE database/schema.sql;
   ```

### 2. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your MySQL credentials in `.env`.
4. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   Server will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open `frontend/index.html` directly in your browser or with VS Code **Live Server** extension.
2. In `frontend/js/config.js`, verify `DEFAULT_API_BASE` points to `http://localhost:5000/api`.

---

## 🌐 Production Deployment Guide

| Component | Recommended Free Host | Notes |
| :--- | :--- | :--- |
| **Frontend** | **GitHub Pages** or **Vercel** | Free, fast static hosting with HTTPS |
| **Backend** | **Render.com** or **Railway** | Supports Node.js, Express, and background cron |
| **Database** | **Supabase** or **Aiven MySQL** | Managed cloud database with free tier |
| **Scheduler** | **Render Background Worker** or **cron-job.org** | Pings `/api/reminders/check` every hour to wake up sleeping free instances |
