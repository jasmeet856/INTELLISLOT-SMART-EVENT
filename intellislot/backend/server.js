/**
 * IntelliSlot – Smart Event & Environment Notification System
 * Production Node.js & Express Backend Server
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const https = require('https');
const mysql = require('mysql2/promise');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Middleware
app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection Pool
let dbPool = null;

async function initDatabase() {
  if (process.env.DB_HOST && process.env.DB_USER) {
    try {
      dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'intellislot_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      });
      const [rows] = await dbPool.query('SELECT 1 as connected');
      console.log('✅ Connected to MySQL Database successfully');
    } catch (err) {
      console.warn('⚠️ MySQL connection failed:', err.message);
      console.warn('Falling back to local in-memory storage mode for demo.');
      dbPool = null;
    }
  } else {
    console.log('ℹ️ No MySQL credentials found in .env; operating in memory-safe store mode.');
  }
}

// -------------------------------------------------------------
// Fallback In-Memory Storage (Ensures server runs even without DB configured)
// -------------------------------------------------------------
let memUsers = [
  { id: 1, name: 'Student Admin', email: 'demo@intellislot.local', password_hash: 'demo123', city: 'New Delhi', state: 'Delhi' }
];

let memEvents = [
  {
    id: 1,
    user_id: 1,
    title: 'Semester End Project Evaluation',
    description: 'Final submission and panel review for IntelliSlot system',
    category: 'campus',
    event_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '13:00',
    location: 'Lab 4B, CS Block',
    reminder_days_before: 7,
    is_completed: false
  },
  {
    id: 2,
    user_id: 1,
    title: 'Corporate Placement Drive - Tech Corp',
    description: 'Technical interview and coding rounds',
    category: 'corporate',
    event_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    location: 'Auditorium Hall 2',
    reminder_days_before: 14,
    is_completed: false
  }
];

const indianFestivals = [
  { id: 1, title: 'Republic Day', category: 'national_holiday', date: '2026-01-26', description: 'Honoring Constitution of India' },
  { id: 2, title: 'Holi (Festival of Colors)', category: 'indian_festival', date: '2026-03-04', description: 'Spring festival of colors and joy' },
  { id: 3, title: 'Eid-ul-Fitr', category: 'indian_festival', date: '2026-03-21', description: 'Celebration marking end of Ramadan' },
  { id: 4, title: 'Independence Day', category: 'national_holiday', date: '2026-08-15', description: 'Indian Independence Day' },
  { id: 5, title: 'Gandhi Jayanti', category: 'national_holiday', date: '2026-10-02', description: 'Mahatma Gandhi Jayanti' },
  { id: 6, title: 'Diwali (Deepavali)', category: 'indian_festival', date: '2026-11-08', description: 'Festival of Lights' }
];

let memNotifications = [
  {
    id: 1,
    user_id: 1,
    title: 'Reminder: Semester Project in 3 Days',
    message: 'Your project evaluation is scheduled for 10:00 AM at Lab 4B. Weather forecast is Clear (24°C).',
    type: 'event_reminder',
    scheduled_for: new Date().toISOString().split('T')[0],
    sent_at: new Date().toISOString(),
    is_read: false
  }
];

let memSettings = {
  enable_browser_notifications: true,
  enable_weather_alerts: true,
  enable_festival_alerts: true,
  reminder_lead_days: 14,
  theme: 'light'
};

// -------------------------------------------------------------
// Helper: Fetch Weather & AQI from Open-Meteo (No API key needed)
// -------------------------------------------------------------
const CITY_COORDINATES = {
  'New Delhi': { lat: 28.6139, lon: 77.2090 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Chandigarh': { lat: 30.7333, lon: 76.7794 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 }
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'IntelliSlot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getWeatherAndAqi(cityName = 'New Delhi') {
  const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES['New Delhi'];
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,european_aqi,us_aqi&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetchJson(weatherUrl),
      fetchJson(aqiUrl)
    ]);

    const pm25 = aqiRes.current ? aqiRes.current.pm2_5 : 45;
    let aqiCategory = 'Good';
    if (pm25 > 150) aqiCategory = 'Severe';
    else if (pm25 > 90) aqiCategory = 'Very Poor';
    else if (pm25 > 60) aqiCategory = 'Poor';
    else if (pm25 > 30) aqiCategory = 'Moderate';

    return {
      city: cityName,
      temperature: weatherRes.current ? weatherRes.current.temperature_2m : 26,
      humidity: weatherRes.current ? weatherRes.current.relative_humidity_2m : 55,
      windSpeed: weatherRes.current ? weatherRes.current.wind_speed_10m : 12,
      weatherCode: weatherRes.current ? weatherRes.current.weather_code : 0,
      pm25: pm25,
      aqiUS: aqiRes.current ? aqiRes.current.us_aqi : 85,
      aqiCategory: aqiCategory,
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      city: cityName,
      temperature: 25.5,
      humidity: 50,
      windSpeed: 10,
      weatherCode: 0,
      pm25: 42,
      aqiUS: 80,
      aqiCategory: 'Moderate',
      updatedAt: new Date().toISOString(),
      fallback: true
    };
  }
}

// -------------------------------------------------------------
// 14-Day Automatic Reminder Engine
// -------------------------------------------------------------
async function checkAndSendReminders() {
  console.log(`[${new Date().toISOString()}] 🔍 Running automated 14-day upcoming event reminder check...`);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);

  const todayStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  let upcomingEvents = [];

  if (dbPool) {
    try {
      const [rows] = await dbPool.query(
        `SELECT * FROM events WHERE event_date BETWEEN ? AND ? AND is_completed = FALSE`,
        [todayStr, maxDateStr]
      );
      upcomingEvents = rows;
    } catch (e) {
      console.error('DB query error in reminder check:', e.message);
      upcomingEvents = memEvents;
    }
  } else {
    upcomingEvents = memEvents.filter(ev => ev.event_date >= todayStr && ev.event_date <= maxDateStr && !ev.is_completed);
  }

  let newNotificationsCount = 0;

  for (const ev of upcomingEvents) {
    const evDate = new Date(ev.event_date);
    const diffTime = evDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Deduplication check: Has a notification already been sent for this event today?
    let alreadySent = false;
    if (dbPool) {
      try {
        const [existing] = await dbPool.query(
          `SELECT id FROM notifications_log WHERE event_id = ? AND scheduled_for = ?`,
          [ev.id, todayStr]
        );
        alreadySent = existing.length > 0;
      } catch (e) {
        alreadySent = false;
      }
    } else {
      alreadySent = memNotifications.some(n => n.event_id === ev.id && n.scheduled_for === todayStr);
    }

    if (!alreadySent && diffDays >= 0 && diffDays <= 14) {
      const dayText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `in ${diffDays} days`;
      const notifTitle = `Reminder: ${ev.title} (${dayText})`;
      const notifMsg = `${ev.title} is scheduled for ${ev.event_date} at ${ev.start_time || '09:00'}. Location: ${ev.location || 'Campus / Office'}.`;

      if (dbPool) {
        try {
          await dbPool.query(
            `INSERT INTO notifications_log (user_id, event_id, title, message, type, scheduled_for) VALUES (?, ?, ?, ?, 'event_reminder', ?)`,
            [ev.user_id || 1, ev.id, notifTitle, notifMsg, todayStr]
          );
          newNotificationsCount++;
        } catch (e) {
          console.error('Failed to insert notification into DB:', e.message);
        }
      } else {
        memNotifications.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          user_id: ev.user_id || 1,
          event_id: ev.id,
          title: notifTitle,
          message: notifMsg,
          type: 'event_reminder',
          scheduled_for: todayStr,
          sent_at: new Date().toISOString(),
          is_read: false
        });
        newNotificationsCount++;
      }
    }
  }

  console.log(`✅ Reminder job completed. Dispatched ${newNotificationsCount} new reminder notification(s).`);
  return { dispatched: newNotificationsCount, totalUpcoming: upcomingEvents.length };
}

// Scheduled Cron Job: Runs at the top of every hour
// For free-tier hosts that sleep, the frontend also calls /api/reminders/check on startup
cron.schedule('0 * * * *', () => {
  checkAndSendReminders().catch(err => console.error('Cron job error:', err));
});

// =============================================================
// API Routes
// =============================================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'IntelliSlot – Smart Event & Environment Notification System',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbPool ? 'MySQL Connected' : 'In-Memory Safe Mode',
    features: {
      calendarManagement: true,
      upcomingReminders14Days: true,
      weatherAndAqiIntegration: true,
      indianFestivals: true,
      automaticCronScheduler: true
    }
  });
});

// 2. Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, city, state } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (dbPool) {
    try {
      const [existing] = await dbPool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      const [result] = await dbPool.query(
        'INSERT INTO users (name, email, password_hash, city, state) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, city || 'New Delhi', state || 'Delhi']
      );
      return res.status(201).json({
        message: 'Account created successfully',
        user: { id: result.insertId, name, email, city: city || 'New Delhi', state: state || 'Delhi' }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Database signup error: ' + err.message });
    }
  } else {
    const existing = memUsers.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    const newUser = {
      id: memUsers.length + 1,
      name,
      email,
      password_hash: password,
      city: city || 'New Delhi',
      state: state || 'Delhi'
    };
    memUsers.push(newUser);
    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, city: newUser.city, state: newUser.state }
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0 || rows[0].password_hash !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const user = rows[0];
      return res.json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, city: user.city, state: user.state }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
  } else {
    const user = memUsers.find(u => u.email === email && u.password_hash === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, city: user.city, state: user.state }
    });
  }
});

// 3. Events Routes
app.get('/api/events', async (req, res) => {
  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM events ORDER BY event_date ASC, start_time ASC');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.json(memEvents);
  }
});

app.post('/api/events', async (req, res) => {
  const { title, description, category, event_date, start_time, end_time, location, reminder_days_before } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required' });
  }

  if (dbPool) {
    try {
      const [result] = await dbPool.query(
        `INSERT INTO events (user_id, title, description, category, event_date, start_time, end_time, location, reminder_days_before)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, title, description || '', category || 'campus', event_date, start_time || '09:00:00', end_time || '10:00:00', location || 'Campus', reminder_days_before || 14]
      );
      // Immediately check reminders
      checkAndSendReminders().catch(() => {});
      return res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const newEvent = {
      id: Date.now(),
      user_id: 1,
      title,
      description: description || '',
      category: category || 'campus',
      event_date,
      start_time: start_time || '09:00',
      end_time: end_time || '10:00',
      location: location || 'Campus / Office',
      reminder_days_before: reminder_days_before || 14,
      is_completed: false
    };
    memEvents.push(newEvent);
    checkAndSendReminders().catch(() => {});
    return res.status(201).json(newEvent);
  }
});

app.put('/api/events/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { title, description, category, event_date, start_time, end_time, location, reminder_days_before, is_completed } = req.body;

  if (dbPool) {
    try {
      await dbPool.query(
        `UPDATE events SET title=?, description=?, category=?, event_date=?, start_time=?, end_time=?, location=?, reminder_days_before=?, is_completed=? WHERE id=?`,
        [title, description, category, event_date, start_time, end_time, location, reminder_days_before, is_completed ? 1 : 0, eventId]
      );
      return res.json({ message: 'Event updated successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const idx = memEvents.findIndex(e => e.id === eventId);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    memEvents[idx] = { ...memEvents[idx], ...req.body };
    return res.json(memEvents[idx]);
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  if (dbPool) {
    try {
      await dbPool.query('DELETE FROM events WHERE id = ?', [eventId]);
      return res.json({ message: 'Event deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    memEvents = memEvents.filter(e => e.id !== eventId);
    return res.json({ message: 'Event deleted' });
  }
});

// 4. Festivals & Holidays
app.get('/api/holidays', async (req, res) => {
  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM holidays_festivals ORDER BY date ASC');
      return res.json(rows.length > 0 ? rows : indianFestivals);
    } catch (err) {
      return res.json(indianFestivals);
    }
  } else {
    return res.json(indianFestivals);
  }
});

// 5. Weather & AQI
app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'New Delhi';
  const data = await getWeatherAndAqi(city);
  res.json(data);
});

// 6. Notifications Log
app.get('/api/notifications', (req, res) => {
  res.json(memNotifications);
});

app.post('/api/notifications/mark-read', (req, res) => {
  memNotifications.forEach(n => n.is_read = true);
  res.json({ message: 'Notifications marked as read' });
});

// 7. Manual reminder check endpoint (useful for webhooks, cron-job.org, or client startup)
app.post('/api/reminders/check', async (req, res) => {
  const result = await checkAndSendReminders();
  res.json({
    status: 'success',
    summary: result,
    timestamp: new Date().toISOString()
  });
});

// 8. Settings
app.get('/api/settings', (req, res) => {
  res.json(memSettings);
});

app.post('/api/settings', (req, res) => {
  memSettings = { ...memSettings, ...req.body };
  res.json({ message: 'Settings saved', settings: memSettings });
});

// Start Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 IntelliSlot backend running on port ${PORT}`);
    console.log(`🌐 Configured CORS Allowed Origin: ${FRONTEND_URL}`);
    console.log(`⏰ 14-Day Automated Reminder Scheduler initialized`);
  });
});
