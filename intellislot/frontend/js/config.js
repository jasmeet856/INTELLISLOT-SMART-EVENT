/**
 * IntelliSlot Frontend Configuration
 * Configure your deployed backend API URL here.
 */

// If your backend is deployed on Render/Railway, replace this with your live URL:
// Example: 'https://intellislot-backend.onrender.com/api'
const DEFAULT_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://intellislot-backend.onrender.com/api'; // <-- REPLACE WITH YOUR DEPLOYED BACKEND URL

// Allow runtime override via localStorage for quick testing without rebuilding
const API_BASE_URL = localStorage.getItem('INTELLISLOT_API_URL') || DEFAULT_API_BASE;

window.INTELLISLOT_CONFIG = {
  API_BASE_URL,
  DEFAULT_API_BASE,
  setApiUrl: function (url) {
    if (url) {
      localStorage.setItem('INTELLISLOT_API_URL', url.trim().replace(/\/$/, ''));
      location.reload();
    } else {
      localStorage.removeItem('INTELLISLOT_API_URL');
      location.reload();
    }
  }
};
