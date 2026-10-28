/**
 * IntelliSlot – Smart Event & Environment Notification System
 * Pure Vanilla JavaScript Client Application
 */

(function () {
  'use strict';

  // State
  let events = [];
  let festivals = [];
  let notifications = [];
  let activeFilter = 'all';
  let currentCity = localStorage.getItem('INTELLISLOT_CITY') || 'New Delhi';
  let currentUser = JSON.parse(localStorage.getItem('INTELLISLOT_USER') || 'null') || {
    id: 1,
    name: 'Student Admin',
    email: 'student@intellislot.local'
  };

  const API_BASE = (window.INTELLISLOT_CONFIG && window.INTELLISLOT_CONFIG.API_BASE_URL) || 'http://localhost:5000/api';

  // DOM Elements
  const eventsContainer = document.getElementById('events-container');
  const holidaysContainer = document.getElementById('holidays-container');
  const notifList = document.getElementById('notif-list');
  const notifCountBadge = document.getElementById('notif-count');
  const toastContainer = document.getElementById('toast-container');
  const currentCityLabel = document.getElementById('current-city-label');
  const statusApiUrl = document.getElementById('status-api-url');
  const reminderSummaryText = document.getElementById('reminder-summary-text');
  const browserNotifPrompt = document.getElementById('browser-notif-prompt');

  // Modals
  const modalEvent = document.getElementById('modal-event');
  const modalNotif = document.getElementById('modal-notif');
  const modalSettings = document.getElementById('modal-settings');

  // Initialize App
  document.addEventListener('DOMContentLoaded', () => {
    initUI();
    setupEventListeners();
    checkNotificationPermission();
    loadDashboardData();
  });

  function initUI() {
    if (statusApiUrl) statusApiUrl.textContent = API_BASE;
    if (currentCityLabel) currentCityLabel.textContent = currentCity;

    const inputApiUrl = document.getElementById('input-api-url');
    if (inputApiUrl) {
      inputApiUrl.value = localStorage.getItem('INTELLISLOT_API_URL') || '';
    }

    const selectCity = document.getElementById('select-user-city');
    if (selectCity) {
      selectCity.value = currentCity;
    }
  }

  // Check Notification API permission
  function checkNotificationPermission() {
    if (!('Notification' in window)) {
      if (browserNotifPrompt) browserNotifPrompt.style.display = 'none';
      return;
    }

    if (Notification.permission === 'default' && browserNotifPrompt) {
      browserNotifPrompt.style.display = 'flex';
    } else if (browserNotifPrompt) {
      browserNotifPrompt.style.display = 'none';
    }
  }

  function setupEventListeners() {
    // Request permission button
    const btnPerm = document.getElementById('btn-request-permission');
    if (btnPerm) {
      btnPerm.addEventListener('click', async () => {
        if ('Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            showToast('✅ Browser notifications enabled!');
            if (browserNotifPrompt) browserNotifPrompt.style.display = 'none';
            sendBrowserNotification('IntelliSlot Alerts Active', 'You will receive reminders up to 14 days before your campus & corporate events!');
          } else {
            showToast('⚠️ Notification permission denied');
          }
        }
      });
    }

    // Refresh weather
    const btnWeather = document.getElementById('btn-refresh-weather');
    if (btnWeather) {
      btnWeather.addEventListener('click', () => {
        fetchWeatherAndAqi(currentCity);
        showToast(`🔄 Refreshed weather for ${currentCity}`);
      });
    }

    // Trigger upcoming reminder check manually
    const btnReminders = document.getElementById('btn-trigger-reminders');
    if (btnReminders) {
      btnReminders.addEventListener('click', run14DayReminderCheck);
    }

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFilter = e.target.getAttribute('data-filter');
        renderEvents();
      });
    });

    // Modals Open/Close
    const btnOpenAdd = document.getElementById('btn-open-add-event');
    if (btnOpenAdd) {
      btnOpenAdd.addEventListener('click', () => {
        document.getElementById('form-event').reset();
        document.getElementById('event-id').value = '';
        document.getElementById('modal-event-title').textContent = 'Add New Event';
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('event-date').value = tomorrow.toISOString().split('T')[0];
        modalEvent.classList.add('active');
      });
    }

    const btnEventClose = document.getElementById('modal-event-close');
    const btnEventCancel = document.getElementById('btn-event-cancel');
    if (btnEventClose) btnEventClose.addEventListener('click', () => modalEvent.classList.remove('active'));
    if (btnEventCancel) btnEventCancel.addEventListener('click', () => modalEvent.classList.remove('active'));

    // Event Form Submit
    const formEvent = document.getElementById('form-event');
    if (formEvent) {
      formEvent.addEventListener('submit', handleEventSubmit);
    }

    // Notification Drawer
    const btnNotif = document.getElementById('btn-notifications');
    if (btnNotif) {
      btnNotif.addEventListener('click', () => {
        renderNotifications();
        modalNotif.classList.add('active');
      });
    }
    const btnNotifClose = document.getElementById('modal-notif-close');
    if (btnNotifClose) btnNotifClose.addEventListener('click', () => modalNotif.classList.remove('active'));

    const btnMarkAll = document.getElementById('btn-mark-all-read');
    if (btnMarkAll) {
      btnMarkAll.addEventListener('click', () => {
        notifications.forEach(n => n.is_read = true);
        updateNotifBadge();
        renderNotifications();
        showToast('All notifications marked as read');
      });
    }

    // Settings Modal
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => modalSettings.classList.add('active'));
    }
    const btnSettingsClose = document.getElementById('modal-settings-close');
    const btnSettingsCancel = document.getElementById('btn-settings-close');
    if (btnSettingsClose) btnSettingsClose.addEventListener('click', () => modalSettings.classList.remove('active'));

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        const inputUrl = document.getElementById('input-api-url').value.trim();
        const selectCity = document.getElementById('select-user-city').value;

        currentCity = selectCity;
        localStorage.setItem('INTELLISLOT_CITY', currentCity);
        if (currentCityLabel) currentCityLabel.textContent = currentCity;

        if (inputUrl) {
          localStorage.setItem('INTELLISLOT_API_URL', inputUrl);
        } else {
          localStorage.removeItem('INTELLISLOT_API_URL');
        }

        modalSettings.classList.remove('active');
        showToast('⚙️ Settings updated! Reloading data...');
        setTimeout(() => location.reload(), 600);
      });
    }
  }

  // Load Dashboard Data
  async function loadDashboardData() {
    await Promise.all([
      fetchEvents(),
      fetchFestivals(),
      fetchWeatherAndAqi(currentCity),
      fetchNotifications()
    ]);

    // Check reminders automatically on dashboard load
    run14DayReminderCheck();
  }

  // 1. Fetch Events
  async function fetchEvents() {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error('API server unreachable');
      events = await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local offline storage for events:', err.message);
      events = JSON.parse(localStorage.getItem('INTELLISLOT_LOCAL_EVENTS') || 'null');
      if (!events || events.length === 0) {
        // Seed default sample events
        const today = new Date();
        const d3 = new Date(today); d3.setDate(today.getDate() + 3);
        const d7 = new Date(today); d7.setDate(today.getDate() + 7);
        const d12 = new Date(today); d12.setDate(today.getDate() + 12);

        events = [
          {
            id: 101,
            title: 'Campus Hackathon 2026 - Finale',
            category: 'campus',
            event_date: d3.toISOString().split('T')[0],
            start_time: '09:30',
            location: 'Tech Seminar Hall, Block C',
            description: 'Final presentation & project prototype review',
            reminder_days_before: 7
          },
          {
            id: 102,
            title: 'Infosys / TCS Placement Aptitude Round',
            category: 'corporate',
            event_date: d7.toISOString().split('T')[0],
            start_time: '11:00',
            location: 'Online Proctor Portal',
            description: 'Online test. Ensure stable Wi-Fi connection and webcam.',
            reminder_days_before: 14
          },
          {
            id: 103,
            title: 'End-Term Cloud Computing Exam',
            category: 'exam',
            event_date: d12.toISOString().split('T')[0],
            start_time: '14:00',
            location: 'Examination Hall 1',
            description: 'Bring ID card and examination admit card.',
            reminder_days_before: 14
          }
        ];
        localStorage.setItem('INTELLISLOT_LOCAL_EVENTS', JSON.stringify(events));
      }
    }
    renderEvents();
  }

  // 2. Fetch Festivals & Holidays
  async function fetchFestivals() {
    try {
      const res = await fetch(`${API_BASE}/holidays`);
      if (!res.ok) throw new Error();
      festivals = await res.json();
    } catch (err) {
      festivals = [
        { id: 1, title: 'Holi (Festival of Colors)', category: 'indian_festival', date: '2026-03-04', description: 'Spring festival of colors' },
        { id: 2, title: 'Eid-ul-Fitr', category: 'indian_festival', date: '2026-03-21', description: 'End of Ramadan celebration' },
        { id: 3, title: 'Independence Day', category: 'national_holiday', date: '2026-08-15', description: 'National Holiday' },
        { id: 4, title: 'Dussehra', category: 'indian_festival', date: '2026-10-20', description: 'Vijayadashami celebration' },
        { id: 5, title: 'Diwali (Deepavali)', category: 'indian_festival', date: '2026-11-08', description: 'Grand Festival of Lights' }
      ];
    }
    renderFestivals();
  }

  // 3. Fetch Weather & AQI
  async function fetchWeatherAndAqi(cityName) {
    try {
      const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(cityName)}`);
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('Backend weather route failed');
      }
      updateWeatherUI(data);
    } catch (err) {
      // Direct Open-Meteo fallback
      const coords = { lat: 28.6139, lon: 77.2090 };
      try {
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        const aRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm2_5,us_aqi`);
        const wData = await wRes.json();
        const aData = await aRes.json();

        const pm25 = aData.current ? aData.current.pm2_5 : 42;
        let cat = 'Moderate';
        if (pm25 <= 30) cat = 'Good';
        else if (pm25 > 90) cat = 'Poor';

        updateWeatherUI({
          city: cityName,
          temperature: wData.current ? wData.current.temperature_2m : 25,
          humidity: wData.current ? wData.current.relative_humidity_2m : 48,
          windSpeed: wData.current ? wData.current.wind_speed_10m : 11,
          pm25: pm25,
          aqiCategory: cat
        });
      } catch (e) {
        console.error('All weather fetches failed:', e);
      }
    }
  }

  function updateWeatherUI(data) {
    document.getElementById('weather-city').textContent = `${data.city}, IN`;
    document.getElementById('weather-temp').textContent = `${Math.round(data.temperature)}°C`;
    document.getElementById('weather-humidity').textContent = `${data.humidity}% | ${data.windSpeed} km/h`;

    const aqiBadge = document.getElementById('aqi-badge');
    aqiBadge.textContent = data.aqiCategory;
    aqiBadge.className = 'aqi-pill ' + (
      data.aqiCategory === 'Good' ? 'aqi-good' :
      data.aqiCategory === 'Moderate' ? 'aqi-moderate' : 'aqi-poor'
    );

    document.getElementById('aqi-pm25').textContent = `PM2.5: ${Math.round(data.pm25)} µg/m³`;
  }

  // 4. 14-Day Automated Reminder Check
  function run14DayReminderCheck() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingWithin14 = events.filter(ev => {
      const evDate = new Date(ev.event_date);
      evDate.setHours(0, 0, 0, 0);
      const diffTime = evDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    });

    if (reminderSummaryText) {
      if (upcomingWithin14.length === 0) {
        reminderSummaryText.textContent = 'No events scheduled in the next 14 days.';
      } else {
        reminderSummaryText.textContent = `${upcomingWithin14.length} event(s) coming up within 14 days! Automated alerts ready.`;
      }
    }

    // Process reminders & deduplicate
    let addedCount = 0;
    upcomingWithin14.forEach(ev => {
      const evDate = new Date(ev.event_date);
      evDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((evDate - today) / (1000 * 60 * 60 * 24));
      const todayStr = today.toISOString().split('T')[0];

      // Deduplication check
      const alreadyLogged = notifications.some(n => n.event_id === ev.id && n.scheduled_for === todayStr);

      if (!alreadyLogged) {
        const timeText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `in ${diffDays} days`;
        const notifTitle = `[${ev.category.toUpperCase()}] ${ev.title} (${timeText})`;
        const notifMsg = `Starts at ${ev.start_time || '09:00'} at ${ev.location || 'Campus'}. Check preparation notes.`;

        notifications.unshift({
          id: Date.now() + Math.random(),
          event_id: ev.id,
          title: notifTitle,
          message: notifMsg,
          type: 'event_reminder',
          scheduled_for: todayStr,
          sent_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_read: false
        });

        addedCount++;

        // Send browser notification if enabled
        sendBrowserNotification(notifTitle, notifMsg);
      }
    });

    updateNotifBadge();
    if (addedCount > 0) {
      showToast(`⏰ Generated ${addedCount} upcoming event reminder(s)!`);
    }
  }

  function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
      } catch (e) {
        console.warn('Web Notification failed to trigger:', e);
      }
    }
  }

  // Render Events List
  function renderEvents() {
    if (!eventsContainer) return;

    let filtered = events;
    if (activeFilter !== 'all') {
      filtered = events.filter(e => e.category === activeFilter);
    }

    if (filtered.length === 0) {
      eventsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No ${activeFilter === 'all' ? '' : activeFilter} events found.</p>
          <p style="font-size: 0.85rem;">Click "+ Add Event" above to add your first campus or corporate slot.</p>
        </div>
      `;
      return;
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    eventsContainer.innerHTML = filtered.map(ev => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(ev.event_date);
      evDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((evDate - today) / (1000 * 60 * 60 * 24));

      let badgeHtml = '';
      if (diffDays === 0) {
        badgeHtml = '<span style="background: #ef4444; color:#fff; font-size:0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight:700;">TODAY</span>';
      } else if (diffDays > 0 && diffDays <= 14) {
        badgeHtml = `<span style="background: #f59e0b; color:#fff; font-size:0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight:700;">IN ${diffDays} DAYS</span>`;
      }

      return `
        <div class="event-item">
          <div class="event-details">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="event-category-tag tag-${ev.category}">${ev.category}</span>
              ${badgeHtml}
            </div>
            <h4>${escapeHtml(ev.title)}</h4>
            <div class="event-meta">
              <span>📅 ${ev.event_date}</span>
              <span>⏰ ${ev.start_time || '09:00'}</span>
              <span>📍 ${escapeHtml(ev.location || 'Main Campus')}</span>
            </div>
            ${ev.description ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${escapeHtml(ev.description)}</p>` : ''}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.editEvent(${ev.id})">✏️</button>
            <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.deleteEvent(${ev.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Festivals
  function renderFestivals() {
    if (!holidaysContainer) return;
    if (festivals.length === 0) {
      holidaysContainer.innerHTML = '<p style="color:var(--text-muted);">No holidays loaded.</p>';
      return;
    }

    holidaysContainer.innerHTML = festivals.slice(0, 5).map(f => `
      <div style="padding: 0.6rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(f.title)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${f.description || 'Indian Observance'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${f.date}</div>
          <span style="font-size: 0.65rem; background: #fef3c7; color: #92400e; padding: 0.1rem 0.4rem; border-radius: 4px;">${f.category === 'national_holiday' ? 'National' : 'Festival'}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Notifications Drawer
  function renderNotifications() {
    if (!notifList) return;
    if (notifications.length === 0) {
      notifList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No notifications found.</p>';
      return;
    }

    notifList.innerHTML = notifications.map(n => `
      <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border); ${n.is_read ? 'opacity: 0.7;' : 'background: #f8fafc; padding-left: 0.5rem; border-left: 3px solid var(--primary);'}">
        <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.15rem;">${escapeHtml(n.title)}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(n.message)}</div>
        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.25rem;">${n.sent_at}</div>
      </div>
    `).join('');
  }

  function updateNotifBadge() {
    const unread = notifications.filter(n => !n.is_read).length;
    if (notifCountBadge) {
      if (unread > 0) {
        notifCountBadge.style.display = 'flex';
        notifCountBadge.textContent = unread > 9 ? '9+' : unread;
      } else {
        notifCountBadge.style.display = 'none';
      }
    }
  }

  // Handle Event Submit
  async function handleEventSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById('event-id').value;
    const title = document.getElementById('event-title').value.trim();
    const category = document.getElementById('event-category').value;
    const event_date = document.getElementById('event-date').value;
    const start_time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value.trim();
    const reminder_days = parseInt(document.getElementById('event-reminder-days').value);
    const description = document.getElementById('event-description').value.trim();

    const payload = {
      title,
      category,
      event_date,
      start_time,
      location: location || 'Campus / Office',
      reminder_days_before: reminder_days,
      description
    };

    try {
      if (eventId) {
        // Edit existing
        await fetch(`${API_BASE}/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const idx = events.findIndex(ev => ev.id == eventId);
        if (idx !== -1) events[idx] = { ...events[idx], ...payload };
        showToast('✅ Event updated successfully!');
      } else {
        // Create new
        const res = await fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          events.push({ id: created.id || Date.now(), ...payload });
        } else {
          // Local fallback
          events.push({ id: Date.now(), ...payload });
        }
        showToast('✅ Event created successfully!');
      }
    } catch (err) {
      // Offline fallback
      if (eventId) {
        const idx = events.findIndex(ev => ev.id == eventId);
        if (idx !== -1) events[idx] = { ...events[idx], ...payload };
      } else {
        events.push({ id: Date.now(), ...payload });
      }
      localStorage.setItem('INTELLISLOT_LOCAL_EVENTS', JSON.stringify(events));
      showToast('✅ Event saved locally (Offline mode)');
    }

    modalEvent.classList.remove('active');
    renderEvents();
    run14DayReminderCheck();
  }

  // Global actions for inline buttons
  window.deleteEvent = async function (id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API delete failed, proceeding with local delete');
    }
    events = events.filter(e => e.id !== id);
    localStorage.setItem('INTELLISLOT_LOCAL_EVENTS', JSON.stringify(events));
    renderEvents();
    run14DayReminderCheck();
    showToast('🗑️ Event deleted');
  };

  window.editEvent = function (id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    document.getElementById('event-id').value = ev.id;
    document.getElementById('event-title').value = ev.title;
    document.getElementById('event-category').value = ev.category || 'campus';
    document.getElementById('event-date').value = ev.event_date;
    document.getElementById('event-time').value = ev.start_time || '09:00';
    document.getElementById('event-location').value = ev.location || '';
    document.getElementById('event-reminder-days').value = ev.reminder_days_before || 14;
    document.getElementById('event-description').value = ev.description || '';
    document.getElementById('modal-event-title').textContent = 'Edit Event';
    modalEvent.classList.add('active');
  };

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        notifications = await res.json();
        updateNotifBadge();
      }
    } catch (e) {
      // Use in-memory
    }
  }

  function showToast(msg) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
