import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import MobileList from './components/MobileList';
import LoginPage from './components/LoginPage';
import StockSelectionPage from './components/StockSelectionPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import SubscribePage from './components/SubscribePage';
import Footer from './components/Footer';
import { fetchUIData } from './services/api';
import {
  isLoggedIn,
  fetchCurrentUser,
  getStoredUser,
  getStoredSubscription,
  setStoredSubscription,
  logout,
  recordVisit,
  subscriptionHasAccess,
} from './services/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

function parseHashView() {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash === 'billing' || hash === 'subscribe') return 'billing';
  if (hash === 'watchlist') return 'watchlist';
  return 'news';
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [view, setView] = useState(parseHashView);

  const [data, setData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const onHashChange = () => setView(parseHashView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        setAuthChecked(true);
        return;
      }
      const stored = getStoredUser();
      const storedSub = getStoredSubscription();
      if (stored) setUser(stored);
      if (storedSub) setSubscription(storedSub);
      try {
        const result = await fetchCurrentUser();
        if (result?.user) {
          setUser(result.user);
          setSubscription(result.subscription || null);
          recordVisit();
        } else {
          setUser(null);
          setSubscription(null);
        }
      } catch {
        setUser(null);
        setSubscription(null);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (result) => {
    setUser(result.user);
    if (result.subscription) {
      setSubscription(result.subscription);
    }
  };

  const handleSubscriptionUpdated = useCallback((updated) => {
    setSubscription(updated);
    setStoredSubscription(updated);
    window.location.hash = '';
    setView('news');
  }, []);

  const handleNavigate = (page) => {
    setView(page);
  };

  const hasAccess = subscriptionHasAccess(subscription);
  const isPaid = subscription?.is_paid;
  const showSubscribePage =
    user && (view === 'billing' || !hasAccess);

  useEffect(() => {
    if (!user || !hasAccess) return;
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchUIData(API_BASE);
        setData(result);
        setError(null);
      } catch (err) {
        if (err.code === 'SUBSCRIPTION_REQUIRED') {
          setSubscription((s) => (s ? { ...s, is_paid: false, has_access: false } : s));
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, hasAccess]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowDetail(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setView('news');
    window.location.hash = '';
    if (isMobile) setShowDetail(true);
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#06080a]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (view === 'privacy') {
      return (
        <div className="min-h-screen bg-[#06080a]">
          <PrivacyPolicyPage onBack={() => setView(parseHashView())} />
        </div>
      );
    }
    if (view === 'terms') {
      return (
        <div className="min-h-screen bg-[#06080a]">
          <TermsPage onBack={() => setView(parseHashView())} />
        </div>
      );
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  if (showSubscribePage && view !== 'privacy' && view !== 'terms') {
    return (
      <SubscribePage
        user={user}
        subscription={subscription}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        onLogout={logout}
        onNavigate={handleNavigate}
        forcePaywall={!hasAccess}
      />
    );
  }

  if (view === 'privacy') {
    return (
      <div className="min-h-screen bg-[#06080a]">
        <PrivacyPolicyPage onBack={() => setView('news')} />
      </div>
    );
  }
  if (view === 'terms') {
    return (
      <div className="min-h-screen bg-[#06080a]">
        <TermsPage onBack={() => setView('news')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#06080a]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#06080a]">
        <div className="text-center max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-200 mb-1.5 tracking-tight">No Data Available</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#06080a]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-200 mb-1.5 tracking-tight">No Updates Yet</h2>
          <p className="text-gray-500 text-sm">Waiting for market announcements to be analyzed...</p>
        </div>
      </div>
    );
  }

  const goBilling = () => {
    window.location.hash = 'billing';
    setView('billing');
  };

  const mainContent = view === 'watchlist' ? (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <StockSelectionPage />
      </div>
      <Footer onNavigate={handleNavigate} />
    </div>
  ) : (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <DetailPanel item={data[selectedIndex]} />
      </div>
      <Footer onNavigate={handleNavigate} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#06080a] overflow-hidden">
      {!isMobile && (
        <>
          <Sidebar
            data={data}
            activeIndex={selectedIndex}
            onSelect={handleSelect}
            user={user}
            subscription={subscription}
            onLogout={logout}
            onEditWatchlist={() => setView(view === 'watchlist' ? 'news' : 'watchlist')}
            isWatchlistActive={view === 'watchlist'}
            onManageSubscription={goBilling}
          />
          <main className="flex-1 p-8 overflow-y-auto">
            {mainContent}
          </main>
        </>
      )}

      {isMobile && !showDetail && (
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-4 border-b border-white/[0.04]">
            <div className="flex items-center justify-between pt-4 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-sm font-black text-white">R</span>
                </div>
                <h1 className="text-lg font-bold text-gray-100 tracking-tight">RITO</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goBilling}
                  className="text-xs font-medium text-blue-400/90 bg-blue-400/10 hover:bg-blue-400/20 px-2.5 py-1.5 rounded-lg transition"
                >
                  Billing
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-400/80 bg-red-400/10 hover:bg-red-400/20 hover:text-red-400 border border-red-400/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="flex items-center gap-7">
              <button
                onClick={() => { setView('news'); window.location.hash = ''; }}
                className={`pb-3.5 text-sm font-semibold transition border-b-2 ${
                  view === 'news'
                    ? 'text-gray-100 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                Live Updates
              </button>
              <button
                onClick={() => setView('watchlist')}
                className={`pb-3.5 text-sm font-semibold transition border-b-2 ${
                  view === 'watchlist'
                    ? 'text-gray-100 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                My Watchlist
              </button>
            </div>
          </div>
          <div className="p-4">
            {view === 'news' ? (
              <>
                <MobileList data={data} onSelect={handleSelect} />
                <Footer onNavigate={handleNavigate} />
              </>
            ) : (
              <>
                <StockSelectionPage />
                <Footer onNavigate={handleNavigate} />
              </>
            )}
          </div>
        </main>
      )}

      {isMobile && view === 'news' && showDetail && (
        <main className="flex-1 p-4 overflow-y-auto">
          <DetailPanel item={data[selectedIndex]} onBack={() => setShowDetail(false)} isMobile />
        </main>
      )}
    </div>
  );
}

export default App;
