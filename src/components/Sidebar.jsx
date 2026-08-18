import FeedList from './FeedList';

const PERSONAL_TABS = [
  { id: 'bse', label: 'BSE / NSE' },
  { id: 'general', label: 'General News' },
  { id: 'industry', label: 'Industry' },
  { id: 'watchlist', label: 'Watchlist' },
];

const CUSTOMER_TABS = [
  { id: 'bse', label: 'Live Updates' },
  { id: 'watchlist', label: 'My Watchlist' },
];

export default function Sidebar({
  data,
  activeIndex,
  onSelect,
  user,
  subscription,
  onLogout,
  onEditWatchlist,
  feedSection,
  onFeedSectionChange,
  personalMode,
  onManageSubscription,
}) {
  const tabs = personalMode ? PERSONAL_TABS : CUSTOMER_TABS;
  const isWatchlistActive = feedSection === 'watchlist';

  return (
    <aside className="w-[400px] border-r border-white/[0.04] overflow-y-auto bg-[#06080a] flex-shrink-0 flex flex-col">
      <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-5 pt-5 pb-0 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-base font-black text-white">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">RITO</h1>
            {personalMode && (
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Personal</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const active = feedSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'watchlist') {
                    onEditWatchlist?.();
                  } else {
                    onFeedSectionChange?.(tab.id);
                  }
                }}
                className={`pb-3.5 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                  active
                    ? 'text-gray-100 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!isWatchlistActive && (
        <FeedList data={data} section={feedSection} onSelect={onSelect} />
      )}

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
                {!personalMode && subscription?.is_paid && subscription.current_period_end && (
                  <p className="text-[10px] text-emerald-500/80 truncate">
                    Active until {new Date(subscription.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              {!personalMode && onManageSubscription && (
                <button
                  type="button"
                  onClick={onManageSubscription}
                  className="text-[10px] font-medium text-blue-400/90 hover:text-blue-400 transition"
                >
                  Billing
                </button>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="text-[10px] font-medium text-red-400/80 hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
