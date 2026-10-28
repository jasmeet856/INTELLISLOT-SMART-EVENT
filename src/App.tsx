/**
 * IntelliSlot – Smart Event & Environment Notification System
 * Faithful reproduction of the IntelliSlot UI and Features
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  CloudSun,
  Wind,
  Settings as SettingsIcon,
  Home,
  GraduationCap,
  Building2,
  PartyPopper,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  User as UserIcon,
  LogOut,
  LogIn,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  ChevronLeft
} from 'lucide-react';

// Types
interface EventItem {
  id: string;
  title: string;
  category: 'campus' | 'corporate' | 'personal' | 'other' | 'exam';
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  description?: string;
  reminderDays: number;
}

interface HolidayFestivalItem {
  id: string;
  title: string;
  category: 'National' | 'Festival' | 'Religious' | 'State';
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  description: string;
  iconType: 'flag' | 'diya' | 'tree' | 'sun';
}

interface NotificationItem {
  id: string;
  eventId?: string;
  title: string;
  message: string;
  type: 'reminder' | 'weather' | 'system';
  timestamp: string;
  unread: boolean;
  isPoppedOut?: boolean;
}

// Initial Seed Data matching user's screenshot
const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    title: 'Project Submission',
    category: 'campus',
    date: '2026-11-02',
    time: '11:30:00',
    venue: 'Board Room',
    description: 'Final submission of Capstone documentation and project code repository.',
    reminderDays: 7
  },
  {
    id: 'ev-2',
    title: 'Engagement',
    category: 'other',
    date: '2026-11-05',
    time: '07:00:00',
    venue: 'Ambar Garden',
    description: 'Family social celebration and evening banquet.',
    reminderDays: 3
  },
  {
    id: 'ev-3',
    title: 'Diwali Part',
    category: 'campus',
    date: '2026-11-07',
    time: '06:30:00',
    venue: 'Crimson Hall',
    description: 'Campus cultural celebration and rangoli lighting festival.',
    reminderDays: 7
  },
  {
    id: 'ev-4',
    title: 'Birthday Part',
    category: 'personal',
    date: '2026-11-07',
    time: '07:00:00',
    venue: 'Royal Blue Palace',
    description: 'Evening get-together celebration with close friends.',
    reminderDays: 3
  },
  {
    id: 'ev-5',
    title: 'Infosys Placement Assessment',
    category: 'corporate',
    date: '2026-11-12',
    time: '09:00:00',
    venue: 'Online Proctor Portal',
    description: 'Technical Aptitude, Analytical Coding & Soft Skills evaluation.',
    reminderDays: 14
  }
];

const INITIAL_HOLIDAYS: HolidayFestivalItem[] = [
  {
    id: 'hol-1',
    title: 'Gandhi Jayanti',
    category: 'National',
    date: '2026-10-02',
    dayOfWeek: 'Friday',
    description: 'National holiday observed to commemorate the birth anniversary of Mahatma Gandhi.',
    iconType: 'flag'
  },
  {
    id: 'hol-2',
    title: 'Dussehra',
    category: 'Festival',
    date: '2026-10-20',
    dayOfWeek: 'Tuesday',
    description: 'A major Indian festival celebrating the victory of good over evil.',
    iconType: 'diya'
  },
  {
    id: 'hol-3',
    title: 'Diwali',
    category: 'Religious',
    date: '2026-11-08',
    dayOfWeek: 'Sunday',
    description: 'The festival of lights celebrated with lamps, decorations and sweets.',
    iconType: 'diya'
  },
  {
    id: 'hol-4',
    title: 'Christmas',
    category: 'Religious',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    description: 'Christmas is celebrated with decorations, gatherings and festivities.',
    iconType: 'tree'
  },
  {
    id: 'hol-5',
    title: 'Republic Day',
    category: 'National',
    date: '2027-01-26',
    dayOfWeek: 'Tuesday',
    description: 'Commemorating the enactment of the Constitution of India.',
    iconType: 'flag'
  },
  {
    id: 'hol-6',
    title: 'Holi (Festival of Colors)',
    category: 'Festival',
    date: '2027-03-24',
    dayOfWeek: 'Wednesday',
    description: 'Spring celebration of vibrant colors, love, and seasonal renewal.',
    iconType: 'sun'
  }
];

// Auth User Record Interface
interface StoredUser {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const STORAGE_KEY_USERS = 'INTELLISLOT_USERS';
const STORAGE_KEY_SESSION = 'INTELLISLOT_CURRENT_USER';

const DEFAULT_DEMO_USER: StoredUser = {
  name: 'User',
  email: 'user@intellislot.ac.in',
  password: 'password123',
  createdAt: '2026-01-01T00:00:00.000Z'
};

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

function getStoredSession(): { name: string; email: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) return JSON.parse(raw);
    // Default active session for quick start
    return { name: DEFAULT_DEMO_USER.name, email: DEFAULT_DEMO_USER.email };
  } catch {
    return null;
  }
}

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<
    'landing' | 'dashboard' | 'calendar' | 'campus' | 'corporate' | 'holidays' | 'weather' | 'airquality' | 'notifications' | 'settings'
  >('dashboard');

  // Auth State
  const initialSession = getStoredSession();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialSession !== null);
  const [userName, setUserName] = useState<string>(initialSession?.name || DEFAULT_DEMO_USER.name);
  const [userEmail, setUserEmail] = useState<string>(initialSession?.email || DEFAULT_DEMO_USER.email);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authInputEmail, setAuthInputEmail] = useState('');
  const [authInputPassword, setAuthInputPassword] = useState('');
  const [authInputName, setAuthInputName] = useState('');
  const [authErrors, setAuthErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Core Data State
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('INTELLISLOT_APP_EVENTS');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [holidays, setHolidays] = useState<HolidayFestivalItem[]>(INITIAL_HOLIDAYS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Project Submission in 5 Days',
      message: 'Project Submission at Board Room (11:30:00). Ensure slides and reports are ready.',
      type: 'reminder',
      timestamp: '10 mins ago',
      unread: true,
      isPoppedOut: true
    },
    {
      id: 'notif-2',
      title: 'Engagement Reminder',
      message: 'Engagement scheduled at Ambar Garden on 05 Nov 2026.',
      type: 'reminder',
      timestamp: '2 hours ago',
      unread: true,
      isPoppedOut: true
    },
    {
      id: 'notif-3',
      title: 'Weather Advisory: Clear & Pleasant',
      message: 'Temperature in New Delhi is 26°C. Favorable environment for campus events.',
      type: 'weather',
      timestamp: '5 hours ago',
      unread: true,
      isPoppedOut: false
    },
    {
      id: 'notif-4',
      title: 'Air Quality Notice',
      message: 'AQI index is currently Moderate (PM2.5: 48 µg/m³). Outdoor activities are acceptable.',
      type: 'system',
      timestamp: 'Yesterday',
      unread: true,
      isPoppedOut: false
    }
  ]);

  // Modals & Popups
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Event creation
  const [eventForm, setEventForm] = useState<{
    title: string;
    category: 'campus' | 'corporate' | 'personal' | 'other' | 'exam';
    date: string;
    time: string;
    venue: string;
    description: string;
    reminderDays: number;
  }>({
    title: '',
    category: 'campus',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00:00',
    venue: '',
    description: '',
    reminderDays: 7
  });

  // Search & Filter State in Holidays
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [holidayCategoryFilter, setHolidayCategoryFilter] = useState('All Categories');

  // Weather & AQI Live Data
  const [currentCity, setCurrentCity] = useState('New Delhi');
  const [weatherData, setWeatherData] = useState<{
    temp: number | null;
    condition: string;
    humidity: number | null;
    windSpeed: number | null;
    pm25: number | null;
    aqiCategory: string;
  }>({
    temp: 26,
    condition: 'Clear Sky',
    humidity: 52,
    windSpeed: 11,
    pm25: 44,
    aqiCategory: 'Moderate'
  });

  // Calendar View Month/Year State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 9, 28)); // Oct 2026 to match screenshot

  // Sync events to localStorage
  useEffect(() => {
    localStorage.setItem('INTELLISLOT_APP_EVENTS', JSON.stringify(events));
  }, [events]);

  // Fetch Live Weather & AQI
  useEffect(() => {
    fetchWeatherInfo(currentCity);
  }, [currentCity]);

  const fetchWeatherInfo = async (city: string) => {
    try {
      const coords: Record<string, { lat: number; lon: number }> = {
        'New Delhi': { lat: 28.6139, lon: 77.2090 },
        'Mumbai': { lat: 19.0760, lon: 72.8777 },
        'Bengaluru': { lat: 12.9716, lon: 77.5946 },
        'Chandigarh': { lat: 30.7333, lon: 76.7794 },
        'Pune': { lat: 18.5204, lon: 73.8567 }
      };
      const c = coords[city] || coords['New Delhi'];

      const [wRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&current=pm2_5,us_aqi`)
      ]);

      const w = await wRes.json();
      const a = await aqiRes.json();

      const pm = a.current ? Math.round(a.current.pm2_5) : 45;
      let aqiCat = 'Moderate';
      if (pm <= 30) aqiCat = 'Good';
      else if (pm > 90) aqiCat = 'Poor';

      setWeatherData({
        temp: w.current ? Math.round(w.current.temperature_2m) : 26,
        condition: 'Clear Skies',
        humidity: w.current ? Math.round(w.current.relative_humidity_2m) : 52,
        windSpeed: w.current ? Math.round(w.current.wind_speed_10m) : 11,
        pm25: pm,
        aqiCategory: aqiCat
      });
    } catch {
      // Keep sensible default values
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    const newEv: EventItem = {
      id: `ev-${Date.now()}`,
      title: eventForm.title,
      category: eventForm.category,
      date: eventForm.date,
      time: eventForm.time,
      venue: eventForm.venue || 'Main Campus',
      description: eventForm.description,
      reminderDays: eventForm.reminderDays
    };

    setEvents(prev => [...prev, newEv]);

    // Also push a notification that pops out in the notification column!
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      eventId: newEv.id,
      title: `Event Scheduled: ${newEv.title}`,
      message: `Slot booked for ${newEv.date} at ${newEv.time} (${newEv.venue}). Reminder set for ${newEv.reminderDays} days prior.`,
      type: 'reminder',
      timestamp: 'Just now',
      unread: true,
      isPoppedOut: true
    };
    setNotifications(prev => [newNotif, ...prev]);

    setIsAddEventModalOpen(false);
    setEventForm({
      title: '',
      category: 'campus',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '10:00:00',
      venue: '',
      description: '',
      reminderDays: 7
    });

    showToast(`Event "${newEv.title}" added to your calendar!`);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Event removed from calendar.');
  };

  const handleAddHolidayToCalendar = (holiday: HolidayFestivalItem) => {
    const exists = events.some(e => e.title === holiday.title && e.date === holiday.date);
    if (exists) {
      showToast(`"${holiday.title}" is already on your calendar.`);
      return;
    }

    const newEv: EventItem = {
      id: `ev-hol-${Date.now()}`,
      title: holiday.title,
      category: holiday.category === 'National' ? 'other' : 'campus',
      date: holiday.date,
      time: '00:00:00',
      venue: 'National / All India',
      description: holiday.description,
      reminderDays: 7
    };

    setEvents(prev => [...prev, newEv]);

    // Push notification popout
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        eventId: newEv.id,
        title: `Festival Added: ${holiday.title}`,
        message: `${holiday.title} on ${holiday.date} added to your active schedule.`,
        type: 'reminder',
        timestamp: 'Just now',
        unread: true,
        isPoppedOut: true
      },
      ...prev
    ]);

    showToast(`Added "${holiday.title}" to your calendar!`);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, isPoppedOut: false })));
    showToast('All notifications marked as read.');
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filtered Holidays for Holidays page
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => {
      const matchSearch =
        h.title.toLowerCase().includes(holidaySearchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(holidaySearchQuery.toLowerCase());
      const matchCat =
        holidayCategoryFilter === 'All Categories' ||
        h.category === holidayCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [holidays, holidaySearchQuery, holidayCategoryFilter]);

  // Auth Validation Helpers
  const validateAuthForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; general?: string } = {};
    const trimmedEmail = authInputEmail.trim();
    const trimmedName = authInputName.trim();

    // Email validation
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. user@domain.com).';
    }

    // Password validation
    if (!authInputPassword) {
      errors.password = 'Password is required.';
    } else if (authInputPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // Name validation for signup
    if (authMode === 'signup') {
      if (!trimmedName) {
        errors.name = 'Full name is required.';
      } else if (trimmedName.length < 2) {
        errors.name = 'Full name must be at least 2 characters.';
      }
    }

    setAuthErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auth Submit with LocalStorage Persistence & Validation
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAuthForm()) return;

    const trimmedEmail = authInputEmail.trim().toLowerCase();
    const trimmedName = authInputName.trim();
    const storedUsers = getStoredUsers();

    if (authMode === 'signup') {
      // Check for duplicate email
      const existingUser = storedUsers.find(u => u.email.toLowerCase() === trimmedEmail);
      if (existingUser) {
        setAuthErrors({
          general: 'An account with this email already exists. Please sign in instead.'
        });
        return;
      }

      // Create new user record
      const newUser: StoredUser = {
        name: trimmedName,
        email: trimmedEmail,
        password: authInputPassword,
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ name: newUser.name, email: newUser.email }));

      setIsLoggedIn(true);
      setUserName(newUser.name);
      setUserEmail(newUser.email);
      setIsAuthModalOpen(false);
      setAuthErrors({});
      setAuthInputEmail('');
      setAuthInputPassword('');
      setAuthInputName('');
      setCurrentView('dashboard');
      showToast(`Account created! Welcome to IntelliSlot, ${newUser.name}.`);
    } else {
      // Login check
      const matchedUser = storedUsers.find(u => u.email.toLowerCase() === trimmedEmail);
      if (!matchedUser) {
        setAuthErrors({
          general: 'No account found with this email. Please check your spelling or sign up.'
        });
        return;
      }

      if (matchedUser.password !== authInputPassword) {
        setAuthErrors({
          password: 'Incorrect password. Please verify and try again.'
        });
        return;
      }

      // Successful login
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ name: matchedUser.name, email: matchedUser.email }));
      setIsLoggedIn(true);
      setUserName(matchedUser.name);
      setUserEmail(matchedUser.email);
      setIsAuthModalOpen(false);
      setAuthErrors({});
      setAuthInputEmail('');
      setAuthInputPassword('');
      setAuthInputName('');
      setCurrentView('dashboard');
      showToast(`Welcome back, ${matchedUser.name}!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setCurrentView('landing');
    setAuthErrors({});
    showToast('You have been logged out.');
  };

  const handleFillDemoCredentials = () => {
    setAuthMode('login');
    setAuthInputEmail('user@intellislot.ac.in');
    setAuthInputPassword('password123');
    setAuthErrors({});
  };

  // Dedicated Auth Modal with validation feedback
  const renderAuthModal = () => {
    if (!isAuthModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setAuthErrors({});
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#133e33] text-white flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {authMode === 'login' ? 'Sign In to IntelliSlot' : 'Create IntelliSlot Account'}
            </h2>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {authMode === 'login'
              ? 'Enter your credentials stored in browser localStorage.'
              : 'Register your account to manage campus slots and reminders.'}
          </p>

          {/* General Error Banner */}
          {authErrors.general && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{authErrors.general}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manjot Singh"
                  value={authInputName}
                  onChange={(e) => {
                    setAuthInputName(e.target.value);
                    if (authErrors.name) setAuthErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl text-xs outline-none transition-colors ${
                    authErrors.name
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#133e33] focus:ring-2 focus:ring-[#133e33]/10'
                  }`}
                />
                {authErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{authErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="user@college.edu"
                value={authInputEmail}
                onChange={(e) => {
                  setAuthInputEmail(e.target.value);
                  if (authErrors.email || authErrors.general) {
                    setAuthErrors(prev => ({ ...prev, email: undefined, general: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs outline-none transition-colors ${
                  authErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#133e33] focus:ring-2 focus:ring-[#133e33]/10'
                }`}
              />
              {authErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{authErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password *</label>
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={authInputPassword}
                onChange={(e) => {
                  setAuthInputPassword(e.target.value);
                  if (authErrors.password || authErrors.general) {
                    setAuthErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs outline-none transition-colors ${
                  authErrors.password
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#133e33] focus:ring-2 focus:ring-[#133e33]/10'
                }`}
              />
              {authErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{authErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#133e33] hover:bg-[#0e2f26] text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              {authMode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span>⚡ Use Demo Account (user@intellislot.ac.in)</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthErrors({});
                }}
                className="text-xs text-[#133e33] font-semibold hover:underline"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If user is not logged in or in landing view, show the Landing Page
  if (currentView === 'landing' || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7faf9] text-slate-800 flex flex-col font-sans selection:bg-[#133e33] selection:text-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
              <div className="w-9 h-9 rounded-xl bg-[#133e33] flex items-center justify-center text-white font-bold text-lg shadow-md">
                ⚡
              </div>
              <span className="text-xl font-bold tracking-tight text-[#133e33]">
                Intelli<span className="text-[#3b8c75]">Slot</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="text-sm font-semibold text-slate-600 hover:text-[#133e33] px-3 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="bg-[#133e33] hover:bg-[#0e2f26] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 max-w-5xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f4ef] text-[#133e33] text-xs font-bold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-[#208466] animate-pulse"></span>
            Smart Event & Environment Notification System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
            Never miss a campus slot, corporate drive, or festival alert.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            IntelliSlot unifies your academic deadlines, placement schedules, Indian gazetted holidays, and real-time weather & air quality (AQI) forecasts with automated 14-day advance reminders.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentView('dashboard');
              }}
              className="bg-[#133e33] hover:bg-[#0d2e25] text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-[#133e33]/15 transition-all flex items-center gap-2"
            >
              Enter Smart Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentView('holidays');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              🎉 View 2026 Festivals
            </button>
          </div>

          {/* Quick Feature Grid */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#133e33] flex items-center justify-center font-bold text-lg mb-4">
                ⏰
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">14-Day Advance Reminders</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated scheduler notifies you well in advance for university submissions, project reviews, and interviews.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
                🌤️
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Live Weather & AQI Impact</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time temperature and PM2.5 monitoring ensure outdoor events and commutes are planned safely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg mb-4">
                🇮🇳
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Indian Festivals & Holidays</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse all national holidays and cultural festivals and add them directly into your personal calendar with 1 click.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          IntelliSlot – Smart Event & Environment Notification System
        </footer>

        {/* Auth Modal */}
        {renderAuthModal()}
      </div>
    );
  }

  // =========================================================================
  // MAIN APPLICATION LAYOUT (Matches the user's screenshots exactly)
  // Sidebar Color: Dark Forest Green (#133e33 or #0f3328)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-800 flex font-sans">

      {/* =====================================================================
          LEFT SIDEBAR (Faithfully replicates screenshot 1 & 2)
          ===================================================================== */}
      <aside className="w-64 bg-[#11382d] text-[#b6d0c6] flex flex-col justify-between flex-shrink-0 min-h-screen select-none border-r border-[#0d2a22]">
        <div>
          {/* Logo Brand */}
          <div className="px-6 py-6 border-b border-[#1b463a]">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1">
              Intelli<span className="text-[#6ee7b7]">Slot</span>
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-sm font-medium">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🗂️</span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'calendar'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">📅</span>
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setCurrentView('campus')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'campus'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🎓</span>
              <span>Campus Events</span>
            </button>

            <button
              onClick={() => setCurrentView('corporate')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'corporate'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🏢</span>
              <span>Corporate Events</span>
            </button>

            <button
              onClick={() => setCurrentView('holidays')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'holidays'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🎉</span>
              <span>Holidays & Festivals</span>
            </button>

            <button
              onClick={() => setCurrentView('weather')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'weather'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🌤️</span>
              <span>Weather</span>
            </button>

            <button
              onClick={() => setCurrentView('airquality')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'airquality'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">🌫️</span>
              <span>Air Quality</span>
            </button>

            <button
              onClick={() => setCurrentView('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'notifications'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🔔</span>
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'settings'
                  ? 'bg-[#1b4b3d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#164134] hover:text-white'
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Home Action */}
        <div className="p-4 border-t border-[#1b463a]">
          <button
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-[#164134] hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Home</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN VIEW CONTAINER
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Top Header Bar with Bell & User Profile */}
        <header className="px-8 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-xs sticky top-0 z-20">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e614f]">
              {currentView === 'dashboard' ? 'SMART DASHBOARD' :
               currentView === 'holidays' ? 'HOLIDAYS & FESTIVALS' :
               currentView === 'calendar' ? 'ACADEMIC & PERSONAL CALENDAR' :
               currentView === 'campus' ? 'CAMPUS EVENTS & LAB REVIEWS' :
               currentView === 'corporate' ? 'CORPORATE PLACEMENT PORTAL' :
               currentView === 'weather' ? 'LIVE METEOROLOGICAL MONITOR' :
               currentView === 'airquality' ? 'AIR POLLUTION & PM2.5 MONITOR' :
               currentView === 'notifications' ? 'AUTOMATED EVENT ALERTS' : 'SYSTEM PREFERENCES'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {currentView === 'dashboard' && <>Good Morning 👋</>}
              {currentView === 'holidays' && <>Holidays & Festivals 🎉</>}
              {currentView === 'calendar' && <>My Schedule & Slots</>}
              {currentView === 'campus' && <>Campus Schedules</>}
              {currentView === 'corporate' && <>Corporate & Placement Drives</>}
              {currentView === 'weather' && <>Weather Overview</>}
              {currentView === 'airquality' && <>Air Quality Index</>}
              {currentView === 'notifications' && <>Notification Center</>}
              {currentView === 'settings' && <>Settings & Profile</>}
            </h2>
            {currentView === 'dashboard' && (
              <p className="text-xs text-slate-500 mt-0.5">
                Wednesday, 28 October 2026
              </p>
            )}
          </div>

          {/* Right Header: Bell with Unread Badge + User Profile Dropdown */}
          <div className="flex items-center gap-4 relative">
            {/* Bell Icon with Badge */}
            <button
              onClick={() => setCurrentView('notifications')}
              className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1b4b3d] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{userName}</div>
                  <div className="text-xs text-slate-500">My Profile</div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsAddEventModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    Add Event
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthErrors({});
                      setIsAuthModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    Switch / Sign In
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =====================================================================
            VIEW 1: DASHBOARD (Matches image_4aa049f7.png)
            ===================================================================== */}
        {currentView === 'dashboard' && (
          <div className="p-8 space-y-6">

            {/* Dashboard Top 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: Current Weather */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-48">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Weather
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {weatherData.temp !== null ? `${weatherData.temp}°C` : '..°C'}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl">
                      🌤️
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{currentCity}</span>
                  <span className="font-semibold text-emerald-600">Live Forecast</span>
                </div>
              </div>

              {/* Card 2: Air Quality */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-48">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Air Quality
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {weatherData.aqiCategory}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl">
                      🌫️
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>PM2.5: {weatherData.pm25} µg/m³</span>
                  <span className="font-semibold text-amber-600">Acceptable</span>
                </div>
              </div>

              {/* Card 3: Upcoming Events Column (Matches screenshot date badges) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Upcoming Events
                  </h3>
                  <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="text-xs font-bold text-[#133e33] hover:underline"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-56 pr-1">
                  {events.slice(0, 4).map(ev => {
                    const parsedDate = new Date(ev.date);
                    const dayNum = parsedDate.getDate();
                    const monthStr = parsedDate.toLocaleString('default', { month: 'short' }).toUpperCase();

                    return (
                      <div key={ev.id} className="flex items-start gap-3 text-xs">
                        {/* Date Block Badge like 2 NOV, 5 NOV, 7 NOV in image */}
                        <div className="w-11 h-11 rounded-xl bg-[#eef2f6] flex flex-col items-center justify-center flex-shrink-0 font-bold leading-none text-slate-700">
                          <span className="text-sm font-extrabold">{dayNum}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">{monthStr}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{ev.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {ev.time} • {ev.venue}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 lowercase">
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: NOTIFICATIONS COLUMN WITH POP OUT EVENT MESSAGES */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-bold text-[#133e33] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="text-3xl font-extrabold text-slate-900 tracking-tight my-1">
                  {unreadCount}
                </div>
                <p className="text-xs text-slate-500 mb-3">Unread notifications</p>

                {/* Pop out messages list */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-48 pr-1">
                  {notifications.slice(0, 3).map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                        n.unread
                          ? 'bg-[#f0fdf4] border-emerald-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200/70 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="truncate">{n.title}</span>
                        </span>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-slate-400 hover:text-slate-700 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {n.message}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {n.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Weather Alerts Section (Matches bottom of image 2) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🌤️</span> Weather & Environment Alerts
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Normal Environmental Conditions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800">Forecast for Campus Events</div>
                  <p className="text-slate-600 leading-relaxed">
                    Sunny to partly cloudy in {currentCity}. Ideal temperatures around {weatherData.temp}°C for outdoor presentations and corporate gatherings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800">Air Pollution Health Advisory</div>
                  <p className="text-slate-600 leading-relaxed">
                    PM2.5 levels are stable ({weatherData.pm25} µg/m³). Ventilation in project evaluation labs and lecture theaters is safe.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800">14-Day Automated Lookout</div>
                  <p className="text-slate-600 leading-relaxed">
                    IntelliSlot background monitor is checking events happening up to 14 days ahead. Reminders will pop out in your Notifications column!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            VIEW 2: HOLIDAYS & FESTIVALS (Matches image_4b41fada.png)
            ===================================================================== */}
        {currentView === 'holidays' && (
          <div className="p-8 space-y-6">

            {/* Search Bar & Category Dropdown */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search holiday or festival..."
                  value={holidaySearchQuery}
                  onChange={(e) => setHolidaySearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#133e33] focus:ring-2 focus:ring-[#133e33]/10 shadow-xs"
                />
              </div>

              <select
                value={holidayCategoryFilter}
                onChange={(e) => setHolidayCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer focus:border-[#133e33] shadow-xs text-slate-700 font-medium"
              >
                <option value="All Categories">All Categories</option>
                <option value="National">National</option>
                <option value="Festival">Festival</option>
                <option value="Religious">Religious</option>
              </select>
            </div>

            {/* Cards Grid: Matches the 2-column layout in image 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHolidays.map(hol => (
                <div
                  key={hol.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Custom icon matching screenshot */}
                        {hol.iconType === 'flag' ? (
                          <div className="w-12 h-12 rounded-2xl bg-[#eef4f1] text-[#133e33] flex items-center justify-center font-bold text-sm tracking-wider">
                            IN
                          </div>
                        ) : hol.iconType === 'tree' ? (
                          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] flex items-center justify-center text-2xl">
                            🎄
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] flex items-center justify-center text-2xl">
                            🪔
                          </div>
                        )}

                        <div>
                          <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-slate-600 mb-1">
                            {hol.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            {hol.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>📅</span>
                        <span>{hol.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span>🗓️</span>
                        <span>{hol.dayOfWeek}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {hol.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleAddHolidayToCalendar(hol)}
                      className="bg-[#1a4d3e] hover:bg-[#133e33] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>+ Add to My Calendar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =====================================================================
            VIEW 3: CALENDAR VIEW
            ===================================================================== */}
        {currentView === 'calendar' && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    October / November 2026
                  </h3>
                  <span className="text-xs bg-[#eef4f1] text-[#133e33] px-2.5 py-0.5 rounded-full font-bold">
                    Active Semester
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="bg-[#1a4d3e] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Event
                  </button>
                </div>
              </div>

              {/* Monthly calendar list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {events.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-[#fbfdfc] space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {ev.category}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                    <p className="text-xs text-slate-500">📅 {ev.date} • ⏰ {ev.time}</p>
                    <p className="text-xs text-slate-500">📍 {ev.venue}</p>
                    {ev.description && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed border-t border-slate-100 mt-2">
                        {ev.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 4: CAMPUS EVENTS VIEW
            ===================================================================== */}
        {currentView === 'campus' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campus Schedules & Lab Reviews</h3>
                <p className="text-xs text-slate-500">University evaluations, submissions, and student committee meetings.</p>
              </div>
              <button
                onClick={() => {
                  setEventForm(prev => ({ ...prev, category: 'campus' }));
                  setIsAddEventModalOpen(true);
                }}
                className="bg-[#1a4d3e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
              >
                + Add Campus Slot
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.filter(e => e.category === 'campus').map(ev => (
                <div key={ev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                      Campus
                    </span>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>📅 Date: {ev.date}</div>
                    <div>⏰ Time: {ev.time}</div>
                    <div>📍 Venue: {ev.venue}</div>
                  </div>
                  {ev.description && <p className="text-xs text-slate-600 pt-1">{ev.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 5: CORPORATE EVENTS VIEW
            ===================================================================== */}
        {currentView === 'corporate' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Corporate & Recruitment Drives</h3>
                <p className="text-xs text-slate-500">Company presentations, technical interviews, and placement tests.</p>
              </div>
              <button
                onClick={() => {
                  setEventForm(prev => ({ ...prev, category: 'corporate' }));
                  setIsAddEventModalOpen(true);
                }}
                className="bg-[#1a4d3e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
              >
                + Add Corporate Drive
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.filter(e => e.category === 'corporate').map(ev => (
                <div key={ev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                      Corporate
                    </span>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>📅 Date: {ev.date}</div>
                    <div>⏰ Time: {ev.time}</div>
                    <div>📍 Venue: {ev.venue}</div>
                  </div>
                  {ev.description && <p className="text-xs text-slate-600 pt-1">{ev.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 6: WEATHER VIEW
            ===================================================================== */}
        {currentView === 'weather' && (
          <div className="p-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Live Weather Forecast</h3>
                  <p className="text-xs text-slate-500">Real-time Open-Meteo weather integration for Indian cities</p>
                </div>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-slate-50 text-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">Temperature</span>
                  <div className="text-4xl font-extrabold text-slate-900 mt-2">{weatherData.temp}°C</div>
                  <span className="text-xs text-emerald-600 font-semibold">{weatherData.condition}</span>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 text-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">Humidity</span>
                  <div className="text-4xl font-extrabold text-slate-900 mt-2">{weatherData.humidity}%</div>
                  <span className="text-xs text-slate-500">Comfortable</span>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 text-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">Wind Speed</span>
                  <div className="text-4xl font-extrabold text-slate-900 mt-2">{weatherData.windSpeed} km/h</div>
                  <span className="text-xs text-slate-500">Gentle Breeze</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 7: AIR QUALITY VIEW
            ===================================================================== */}
        {currentView === 'airquality' && (
          <div className="p-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Air Quality Index (AQI) & PM2.5</h3>
                <p className="text-xs text-slate-500">Real-time air pollution levels to safeguard outdoor academic and athletic events.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-amber-100 font-bold">Current AQI Category</div>
                  <div className="text-3xl font-extrabold mt-1">{weatherData.aqiCategory}</div>
                  <p className="text-xs text-amber-100 mt-2">PM2.5 Concentration: {weatherData.pm25} µg/m³</p>
                </div>
                <div className="text-5xl">🌫️</div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 8: NOTIFICATIONS CENTER
            ===================================================================== */}
        {currentView === 'notifications' && (
          <div className="p-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Notification & Reminder Center</h3>
                  <p className="text-xs text-slate-500">Pop out notifications generated for your events up to 14 days ahead.</p>
                </div>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="bg-[#1a4d3e] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Mark All Read
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <div key={n.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{n.title}</span>
                        {n.unread && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{n.message}</p>
                      <span className="text-[11px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="text-slate-300 hover:text-rose-600 text-sm font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 9: SETTINGS VIEW
            ===================================================================== */}
        {currentView === 'settings' && (
          <div className="p-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900">User Profile & System Settings</h3>

              <div className="space-y-5 text-xs">
                {/* Active Session Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active Local Session
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      Authenticated
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-900">{userName}</span> ({userEmail})
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthErrors({});
                        setIsAuthModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold text-[11px]"
                    >
                      Switch / Sign In Another User
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-100 font-semibold text-[11px]"
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default City for Environment Alerts</label>
                  <select
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                  >
                    <option value="New Delhi">New Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800">Local Authentication Persistence</div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Credentials and registered accounts are safely validated and saved in your browser's <code>localStorage</code> under <code>INTELLISLOT_USERS</code> and <code>INTELLISLOT_CURRENT_USER</code>.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ name: userName, email: userEmail }));
                      showToast('Settings & profile updated successfully!');
                    }}
                    className="bg-[#1a4d3e] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =====================================================================
          MODAL: ADD NEW EVENT
          ===================================================================== */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Add Calendar Event / Slot</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add upcoming campus or corporate events. IntelliSlot will generate automated pop out notifications.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Submission / Placement Interview"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                >
                  <option value="campus">Campus</option>
                  <option value="corporate">Corporate</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="11:30:00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Board Room / Auditorium Hall"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reminder Lead Time</label>
                <select
                  value={eventForm.reminderDays}
                  onChange={(e) => setEventForm({ ...eventForm, reminderDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                >
                  <option value={14}>14 Days Before (2 Weeks)</option>
                  <option value={7}>7 Days Before (1 Week)</option>
                  <option value={3}>3 Days Before</option>
                  <option value={1}>1 Day Before</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes, deliverables, instructions..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#133e33]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1a4d3e] hover:bg-[#133e33] text-white font-bold rounded-xl shadow-xs"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {renderAuthModal()}

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#133e33] text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
