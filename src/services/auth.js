// services/auth.js – Auth API calls & token management

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe-9s1j.onrender.com';
const TOKEN_KEY = 'rito_auth_token';
const USER_KEY = 'rito_user';
const SUBSCRIPTION_KEY = 'rito_subscription';

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
  localStorage.removeItem(SUBSCRIPTION_KEY);
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

export function setStoredSubscription(subscription) {
  if (subscription) {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  } else {
    localStorage.removeItem(SUBSCRIPTION_KEY);
  }
}

export function getStoredSubscription() {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Dashboard / comms access (paid or odd grace day). Personal mode = always open. */
export function subscriptionHasAccess(subscription) {
  if (import.meta.env.VITE_PERSONAL_MODE === 'true') return true;
  if (subscription?.personal_mode) return true;
  if (!subscription) return false;
  if (subscription.has_access != null) return Boolean(subscription.has_access);
  return Boolean(subscription.is_paid);
}

export function isPersonalModeEnv() {
  return import.meta.env.VITE_PERSONAL_MODE === 'true';
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

const FBCLID_STORAGE_KEY = 'rito_fbclid';

export async function trackMetaConversionEvent({ eventName, phone, eventId, eventSourceUrl }) {
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');
  if (!fbc) {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
      || (() => {
        try {
          return localStorage.getItem(FBCLID_STORAGE_KEY);
        } catch {
          return null;
        }
      })();
    if (fbclid) {
      // Meta format when _fbc cookie missing; fbclid from URL or saved from first landing
      fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
  }
  const storedUser = getStoredUser();
  const externalId = storedUser?.id
    ? `user_${storedUser.id}`
    : (phone ? `phone_${String(phone).replace(/\D/g, '')}` : null);

  const body = {
    event_name: eventName,
    phone,
    event_id: eventId,
    event_source_url: eventSourceUrl || window.location.href,
    action_source: 'website',
    external_id: externalId,
  };
  if (fbc) body.fbc = fbc;
  if (fbp) body.fbp = fbp;

  try {
    await fetch(`${API_BASE}/api/meta/conversions-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent fail — should never block user actions
  }
}

export async function personalLogin(phone, name) {
  const res = await fetch(`${API_BASE}/api/auth/personal-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name: name || undefined }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  setToken(data.token);
  setStoredUser(data.user);
  if (data.subscription) setStoredSubscription(data.subscription);

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

  setToken(data.token);
  setStoredUser(data.user);
  if (data.subscription) setStoredSubscription(data.subscription);

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
    removeToken();
    return null;
  }

  const data = await res.json();
  setStoredUser(data.user);
  if (data.subscription) setStoredSubscription(data.subscription);
  return { user: data.user, subscription: data.subscription };
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

export async function recordVisit() {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE}/api/events/visit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Silent fail — don't block the user experience
  }
}

export function logout() {
  removeToken();
  window.location.reload();
}
