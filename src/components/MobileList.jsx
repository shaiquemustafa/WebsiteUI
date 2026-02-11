import { getImpactBadgeClass } from '../utils/format';

export default function MobileList({ data, onSelect }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-4">Live Market Predictions</h1>
      <div className="space-y-3">
        {data.map((item, index) => {
          const impact = item.impact || 'UNKNOWN';
          const time = new Date(item.news_time).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          });

          return (
            <div key={`${item.scrip_cd}-${index}`} className="news-item-card" onClick={() => onSelect(index)}>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm text-gray-200 flex-1">{item.company_name || 'Unknown'}</h3>
                <span className={`impact-badge ${getImpactBadgeClass(impact)} flex-shrink-0`}>{impact}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 news-summary">{item.summary || 'No summary.'}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[11px] text-gray-600">{time}</span>
                <div className="flex items-center gap-3 text-xs">
                  {item.current_price_bse && <span className="text-gray-400">₹{item.current_price_bse}</span>}
                  {item.mid_percentage != null && (
                    <span className={`font-semibold ${parseFloat(item.mid_percentage) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(item.mid_percentage) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(item.mid_percentage)).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
