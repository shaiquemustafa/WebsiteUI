export async function fetchUIData(apiBase) {
  const response = await fetch(`${apiBase}/ui-data/today`, {
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
