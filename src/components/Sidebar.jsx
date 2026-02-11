import { getImpactBadgeClass } from '../utils/format';

export default function Sidebar({ data, activeIndex, onSelect }) {
  return (
    <aside className="w-[380px] border-r border-white/5 overflow-y-auto bg-[#0a0a0a] flex-shrink-0">
      <div className="sticky top-0 bg-[#0a0a0a] z-10 px-5 py-4 border-b border-white/5">
        <h1 className="text-xl font-bold text-gray-100">StockHub</h1>
        <p className="text-xs text-gray-500 mt-1">Live Market Predictions</p>
      </div>

      <div className="p-3 space-y-2">
        {data.map((item, index) => {
          const isActive = index === activeIndex;
          const impact = item.impact || 'UNKNOWN';
          const time = new Date(item.news_time).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          });

          return (
            <div
              key={`${item.scrip_cd}-${index}`}
              className={`news-item-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm text-gray-200 flex-1 leading-snug">
                  {item.company_name || 'Unknown'}
                </h3>
                <span className={`impact-badge ${getImpactBadgeClass(impact)} flex-shrink-0`}>
                  {impact}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 news-summary">
                {item.summary || 'No summary available.'}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[11px] text-gray-600">{time}</span>
                {item.mid_percentage != null && (
                  <span className={`text-xs font-semibold ${parseFloat(item.mid_percentage) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(item.mid_percentage) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(item.mid_percentage)).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
