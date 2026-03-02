import { getImpactBadgeClass } from '../utils/format';

export default function Sidebar({ data, activeIndex, onSelect, user, onLogout, onEditWatchlist, isWatchlistActive }) {
  return (
    <aside className="w-[380px] border-r border-white/5 overflow-y-auto bg-[#0a0a0a] flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a] z-10 px-5 pt-4 border-b border-white/5">
        <h1 className="text-xl font-bold text-gray-100">StockHub</h1>

        {/* Tabs */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => { if (isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-2.5 text-xs font-semibold transition border-b-2 ${
              !isWatchlistActive
                ? 'text-gray-200 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Live Updates
          </button>
          <button
            onClick={() => { if (!isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-2.5 text-xs font-semibold transition border-b-2 ${
              isWatchlistActive
                ? 'text-gray-200 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            My Watchlist
          </button>
        </div>
      </div>

      {/* Stock list */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
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

      {/* User footer */}
      {user && (
        <div className="border-t border-white/5 px-5 py-3 bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-400">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-[10px] text-gray-600 truncate">
                  +91 {user.phone?.slice(-10)}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-[11px] text-gray-600 hover:text-red-400 transition px-2 py-1 rounded"
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
