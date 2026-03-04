// services/auth.js – Auth API calls & token management

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';
const TOKEN_KEY = 'rito_auth_token';
const USER_KEY = 'rito_user';

// ── Token helpers ───────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isLoggedIn() {
  return !!getToken();
}

// ── API calls ───────────────────────────────────────────────────────

export async function sendOTP(phone) {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to send OTP');
  }

  return data;
}

export async function verifyOTP(phone, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to verify OTP');
  }

  // Store token and user
  setToken(data.token);
  setStoredUser(data.user);

  return data;
}

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    // Token expired or invalid — clean up
    removeToken();
    return null;
  }

  const data = await res.json();
  setStoredUser(data.user);
  return data.user;
}

export async function updateUserName(name) {
  const token = getToken();
  if (!token) throw new Error('Not logged in');

  const res = await fetch(`${API_BASE}/api/auth/me/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update name');
  }

  // Update stored user
  const user = getStoredUser();
  if (user) {
    user.name = name;
    setStoredUser(user);
  }

  return data;
}

export function logout() {
  removeToken();
  window.location.reload();
}
