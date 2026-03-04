import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import MobileList from './components/MobileList';
import LoginPage from './components/LoginPage';
import StockSelectionPage from './components/StockSelectionPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import Footer from './components/Footer';
import { fetchUIData } from './services/api';
import { isLoggedIn, fetchCurrentUser, getStoredUser, logout } from './services/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

function App() {
  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  // View state: 'news' | 'watchlist' | 'privacy' | 'terms'
  const [view, setView] = useState('news');

  // Data state
  const [data, setData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDetail, setShowDetail] = useState(false);

  // ── Auth check on mount ───────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        setAuthChecked(true);
        return;
      }

      const stored = getStoredUser();
      if (stored) setUser(stored);

      try {
        const freshUser = await fetchCurrentUser();
        if (freshUser) {
          setUser(freshUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // ── Handle login success from LoginPage ───────────────────────────
  const handleLoginSuccess = (result) => {
    setUser(result.user);
  };

  // ── Navigation helper ─────────────────────────────────────────────
  const handleNavigate = (page) => {
    setView(page); // 'privacy', 'terms', 'news', 'watchlist'
  };

  // ── Fetch market data (only when logged in) ───────────────────────
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchUIData(API_BASE);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Responsive breakpoint ─────────────────────────────────────────
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
    if (isMobile) setShowDetail(true);
  };

  // ── Auth loading state ────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────
  if (!user) {
    // Show Privacy Policy or Terms as standalone pages (no login required)
    if (view === 'privacy') {
      return (
        <div className="min-h-screen bg-[#0a0a0a]">
          <PrivacyPolicyPage onBack={() => setView('news')} />
        </div>
      );
    }
    if (view === 'terms') {
      return (
        <div className="min-h-screen bg-[#0a0a0a]">
          <TermsPage onBack={() => setView('news')} />
        </div>
      );
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  // ── Logged in: Privacy / Terms pages ──────────────────────────────
  if (view === 'privacy') {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <PrivacyPolicyPage onBack={() => setView('news')} />
      </div>
    );
  }
  if (view === 'terms') {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <TermsPage onBack={() => setView('news')} />
      </div>
    );
  }

  // ── Loading market data ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">No Data Available</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">No Predictions Yet</h2>
          <p className="text-gray-500">Waiting for market announcements to be analyzed...</p>
        </div>
      </div>
    );
  }

  // ── Decide what the main content area shows ────────────────────────
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

  // ── Main app (logged-in view) ─────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop: sidebar + main content */}
      {!isMobile && (
        <>
          <Sidebar
            data={data}
            activeIndex={selectedIndex}
            onSelect={handleSelect}
            user={user}
            onLogout={logout}
            onEditWatchlist={() => setView(view === 'watchlist' ? 'news' : 'watchlist')}
            isWatchlistActive={view === 'watchlist'}
          />
          <main className="flex-1 p-6 overflow-y-auto">
            {mainContent}
          </main>
        </>
      )}

      {/* Mobile: tabs or detail */}
      {isMobile && !showDetail && (
        <main className="flex-1 overflow-y-auto">
          {/* Mobile header with tabs */}
          <div className="sticky top-0 bg-[#0a0a0a] z-10 px-4 border-b border-white/5">
            <div className="flex items-center justify-between pt-3 pb-2">
              <h1 className="text-lg font-bold text-gray-100">RITO</h1>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-400 transition px-2 py-1"
              >
                Logout
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('news')}
                className={`pb-2.5 text-xs font-semibold transition border-b-2 ${
                  view === 'news'
                    ? 'text-gray-200 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                Live Updates
              </button>
              <button
                onClick={() => setView('watchlist')}
                className={`pb-2.5 text-xs font-semibold transition border-b-2 ${
                  view === 'watchlist'
                    ? 'text-gray-200 border-blue-500'
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
