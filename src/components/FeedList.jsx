import { getImpactTextClass, getCategoryTextClass } from '../utils/format';

function itemTitle(item, section) {
  if (section === 'general') {
    return item.affected_stocks || item.title || 'Stock news';
  }
  if (section === 'industry') {
    return item.industry || 'Industry';
  }
  return item.company_name || 'Unknown';
}

function itemSubtitle(item, section) {
  if (section === 'general') {
    return item.direction || item.category || item.source || '';
  }
  if (section === 'industry') {
    return item.direction || '';
  }
  return item.impact || 'UNKNOWN';
}

function itemSummary(item, section) {
  if (section === 'general') {
    return item.ai_summary || item.implication || item.title || 'No summary.';
  }
  if (section === 'industry') {
    return item.headline || (item.bullets ? String(item.bullets).slice(0, 200) : 'No headline.');
  }
  return item.summary || 'No summary available.';
}

function itemTime(item, section) {
  const raw =
    section === 'general'
      ? item.published_at_ist
      : section === 'industry'
        ? item.run_at_ist
        : item.news_time;
  if (!raw) return '';
  return new Date(raw).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function itemKey(item, section, index) {
  if (section === 'general') return `gn-${item.id || index}`;
  if (section === 'industry') return `ii-${item.id || index}`;
  return `${item.scrip_cd}-${index}`;
}

export default function FeedList({ data, section = 'bse', onSelect }) {
  return (
    <div className="px-3 py-3 space-y-2 flex-1 overflow-y-auto">
      {data.map((item, index) => {
        const title = itemTitle(item, section);
        const subtitle = itemSubtitle(item, section);
        const isBse = section === 'bse';

        return (
          <div
            key={itemKey(item, section, index)}
            className="news-item-card"
            onClick={() => onSelect(index)}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[14px] text-gray-100 leading-snug flex-1">
                {title}
              </h3>
              <svg className="card-chevron w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium flex-wrap">
              <span className={getImpactTextClass(subtitle)}>{subtitle}</span>
              {isBse && item.category && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className={getCategoryTextClass(item.category)}>{item.category}</span>
                </>
              )}
              {section === 'general' && item.source && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-500">{item.source}</span>
                </>
              )}
              {section === 'industry' && item.cycle && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-500">{item.cycle.replace('_', ' ')}</span>
                </>
              )}
              {item.low_impact && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-500">low impact</span>
                </>
              )}
              {item.stale_feed && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-amber-500/80">previous cycle</span>
                </>
              )}
            </div>

            <p className="text-[12.5px] text-gray-400 mt-2 news-summary leading-relaxed">
              {itemSummary(item, section)}
            </p>

            <div className="mt-2.5">
              <span className="text-[11px] text-gray-600">{itemTime(item, section)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { itemTitle, itemSummary, itemTime };
