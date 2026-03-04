import { getImpactBadgeClass } from '../utils/format';

export default function MobileList({ data, onSelect }) {
  return (
    <div>
      <div className="space-y-2">
        {data.map((item, index) => {
          const impact = item.impact || 'UNKNOWN';
          const time = new Date(item.news_time).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          });

          return (
            <div
              key={`${item.scrip_cd}-${index}`}
              className="news-item-card"
              onClick={() => onSelect(index)}
            >
              <div className="flex justify-between items-start gap-2.5">
                <h3 className="font-semibold text-[13px] text-gray-200 flex-1 tracking-tight">
                  {item.company_name || 'Unknown'}
                </h3>
                <span className={`impact-badge ${getImpactBadgeClass(impact)} flex-shrink-0`}>
                  {impact}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 news-summary leading-relaxed">
                {item.summary || 'No summary.'}
              </p>
              <div className="flex justify-between items-center mt-2.5">
                <span className="text-[11px] text-gray-600">{time}</span>
                {item.category && (
                  <span className="text-[10px] text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
