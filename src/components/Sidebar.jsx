import { getImpactTextClass, getCategoryTextClass } from '../utils/format';

export default function Sidebar({ data, activeIndex, onSelect, user, onLogout, onEditWatchlist, isWatchlistActive }) {
  return (
    <aside className="w-[400px] border-r border-white/[0.04] overflow-y-auto bg-[#06080a] flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-5 pt-5 pb-0 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-base font-black text-white">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100 tracking-tight">RITO</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-7">
          <button
            onClick={() => { if (isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 ${
              !isWatchlistActive
                ? 'text-gray-100 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Live Updates
          </button>
          <button
            onClick={() => { if (!isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 ${
              isWatchlistActive
                ? 'text-gray-100 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            My Watchlist
          </button>
        </div>
      </div>

      {/* Stock list */}
      <div className="px-3 py-3 space-y-2 flex-1 overflow-y-auto">
        {data.map((item, index) => {
          const isActive = index === activeIndex && !isWatchlistActive;
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
              {/* Row 1: Company name + chevron */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[14px] text-gray-100 leading-snug flex-1">
                  {item.company_name || 'Unknown'}
                </h3>
                <svg className="card-chevron w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Row 2: Impact + Category on one line */}
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
                {item.summary || 'No summary available.'}
              </p>

              {/* Row 4: Time */}
              <div className="mt-2.5">
                <span className="text-[11px] text-gray-600">{time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* User footer */}
      {user && (
        <div className="border-t border-white/[0.04] px-5 py-4 bg-[#06080a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-400/10 flex items-center justify-center flex-shrink-0 ring-1 ring-blue-500/20">
                <span className="text-sm font-bold text-blue-400">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  +91 {user.phone?.slice(-10)}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-400/10"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
