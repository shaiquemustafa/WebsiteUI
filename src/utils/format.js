export function getCategoryClass(category) {
  if (!category) return '';
  const c = category.toLowerCase();
  if (c.includes('financial'))    return 'cat-financial';
  if (c.includes('leadership'))   return 'cat-leadership';
  if (c.includes('raising') || c.includes('changing shares')) return 'cat-capital';
  if (c.includes('dividend') || c.includes('shareholder'))    return 'cat-dividends';
  if (c.includes('merger') || c.includes('acquisition') || c.includes('partnership')) return 'cat-mergers';
  if (c.includes('order') || c.includes('business wins'))     return 'cat-orders';
  if (c.includes('operation') || c.includes('expansion'))     return 'cat-operations';
  if (c.includes('legal') || c.includes('compliance') || c.includes('credit')) return 'cat-legal';
  return 'cat-general';
}

export function getCategoryTextClass(category) {
  if (!category) return 'cat-text-general';
  const c = category.toLowerCase();
  if (c.includes('financial'))    return 'cat-text-financial';
  if (c.includes('leadership'))   return 'cat-text-leadership';
  if (c.includes('raising') || c.includes('changing shares')) return 'cat-text-capital';
  if (c.includes('dividend') || c.includes('shareholder'))    return 'cat-text-dividends';
  if (c.includes('merger') || c.includes('acquisition') || c.includes('partnership')) return 'cat-text-mergers';
  if (c.includes('order') || c.includes('business wins'))     return 'cat-text-orders';
  if (c.includes('operation') || c.includes('expansion'))     return 'cat-text-operations';
  if (c.includes('legal') || c.includes('compliance') || c.includes('credit')) return 'cat-text-legal';
  return 'cat-text-general';
}

export function getImpactTextClass(impact) {
  if (!impact) return 'impact-text-neutral';
  const lower = impact.toLowerCase();
  if (lower === 'beat' || lower === 'strongly positive') return 'impact-text-strongly-positive';
  if (lower === 'positive') return 'impact-text-positive';
  if (lower === 'negative') return 'impact-text-negative';
  if (lower === 'missed' || lower === 'strongly negative') return 'impact-text-strongly-negative';
  if (lower === 'matched') return 'impact-text-matched';
  return 'impact-text-neutral';
}

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
