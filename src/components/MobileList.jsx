import { getImpactBadgeClass, getCategoryClass } from '../utils/format';

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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[15px] text-gray-100 leading-snug">
                  {item.company_name || 'Unknown'}
                </h3>
                <span className={`impact-badge ${getImpactBadgeClass(impact)} flex-shrink-0`}>
                  {impact}
                </span>
              </div>
              {item.category && (
                <span className={`category-tag ${getCategoryClass(item.category)} mt-1.5 inline-flex`}>
                  {item.category}
                </span>
              )}
              <p className="text-[13px] text-gray-400 mt-2 news-summary leading-relaxed">
                {item.summary || 'No summary.'}
              </p>
              <div className="mt-3">
                <span className="text-xs text-gray-500">{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
