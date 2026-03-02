import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

export async function fetchUIData(apiBase) {
  const response = await fetch(`${apiBase || API_BASE}/ui-data/today`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Sort by news_time descending (most recent first)
  if (Array.isArray(data)) {
    data.sort((a, b) => new Date(b.news_time || 0) - new Date(a.news_time || 0));
  }

  return Array.isArray(data) ? data : [];
}


// ── Stock search ─────────────────────────────────────────────────────

export async function searchStocks(query) {
  if (!query || query.trim().length < 1) return [];

  const token = getToken();
  const res = await fetch(
    `${API_BASE}/api/stocks/search?q=${encodeURIComponent(query.trim())}&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.results || [];
}


// ── Watchlist ────────────────────────────────────────────────────────

export async function getWatchlist() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/user/watchlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch watchlist');

  return await res.json();
}

export async function saveWatchlist(scripCodes, receiveAllUpdates) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/user/watchlist`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      scrip_codes: scripCodes,
      receive_all_updates: receiveAllUpdates,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to save watchlist');
  }

  return data;
}
