import { getImpactBadgeClass } from '../utils/format';

export default function Sidebar({ data, activeIndex, onSelect, user, onLogout, onEditWatchlist, isWatchlistActive }) {
  return (
    <aside className="w-[370px] border-r border-white/[0.04] overflow-y-auto bg-[#06080a] flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-5 pt-5 pb-0 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-sm font-black text-white">R</span>
          </div>
          <h1 className="text-lg font-bold text-gray-100 tracking-tight">RITO</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => { if (isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-3 text-[13px] font-medium transition border-b-2 ${
              !isWatchlistActive
                ? 'text-gray-100 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Live Updates
          </button>
          <button
            onClick={() => { if (!isWatchlistActive && onEditWatchlist) onEditWatchlist(); }}
            className={`pb-3 text-[13px] font-medium transition border-b-2 ${
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
      <div className="px-3 py-2 space-y-0.5 flex-1 overflow-y-auto">
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
              <div className="flex justify-between items-start gap-2.5">
                <h3 className="font-semibold text-[13px] text-gray-200 flex-1 leading-snug tracking-tight">
                  {item.company_name || 'Unknown'}
                </h3>
                <span className={`impact-badge ${getImpactBadgeClass(impact)} flex-shrink-0`}>
                  {impact}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 news-summary leading-relaxed">
                {item.summary || 'No summary available.'}
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

      {/* User footer */}
      {user && (
        <div className="border-t border-white/[0.04] px-5 py-3.5 bg-[#06080a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-400/10 flex items-center justify-center flex-shrink-0 ring-1 ring-blue-500/20">
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
              className="text-[11px] text-gray-600 hover:text-red-400 transition-colors px-2 py-1 rounded"
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
