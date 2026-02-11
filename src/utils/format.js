export function getImpactBadgeClass(impact) {
  if (!impact) return '';
  const lower = impact.toLowerCase();
  if (lower === 'beat' || lower === 'strongly positive') return 'impact-beat';
  if (lower === 'positive') return 'impact-positive';
  if (lower === 'negative') return 'impact-negative';
  if (lower === 'missed' || lower === 'strongly negative') return 'impact-missed';
  return '';
}

export function formatNumber(num) {
  if (num === null || num === undefined || num === 'N/A') return 'N/A';
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return 'N/A';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(parsed);
}

export function formatDate(dt) {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function sortQuarters(quarters) {
  const monthOrder = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  return quarters.sort((a, b) => {
    const [monA, yearA] = a.split(' ');
    const [monB, yearB] = b.split(' ');
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    return (monthOrder[monA] || 0) - (monthOrder[monB] || 0);
  });
}
