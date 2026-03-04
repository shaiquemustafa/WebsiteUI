import { getImpactTextClass, getCategoryTextClass } from '../utils/format';

export default function MobileList({ data, onSelect }) {
  return (
    <div>
      <div className="space-y-2.5">
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
              {/* Row 1: Company name + chevron */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[14px] text-gray-100 leading-snug flex-1">
                  {item.company_name || 'Unknown'}
                </h3>
                <svg className="card-chevron w-4 h-4 flex-shrink-0 mt-0.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Row 2: Impact + Category */}
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium">
                <span className={getImpactTextClass(impact)}>{impact}</span>
                {item.category && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className={getCategoryTextClass(item.category)}>{item.category}</span>
                  </>
                )}
              </div>

              {/* Row 3: Summary */}
              <p className="text-[12.5px] text-gray-400 mt-2 news-summary leading-relaxed">
                {item.summary || 'No summary.'}
              </p>

              {/* Row 4: Time */}
              <div className="mt-2.5">
                <span className="text-[11px] text-gray-600">{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
