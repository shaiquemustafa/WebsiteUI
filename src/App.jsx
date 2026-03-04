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

  // Auth check on mount
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

  const handleLoginSuccess = (result) => {
    setUser(result.user);
  };

  const handleNavigate = (page) => {
    setView(page);
  };

  // Fetch market data
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

  // Responsive
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

  // Auth loading
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

  // Not logged in
  if (!user) {
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
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  // Logged in: standalone pages
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

  // Loading market data
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

  // Main content area
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

  // Main app
  return (
    <div className="flex h-screen bg-[#06080a] overflow-hidden">
      {/* Desktop */}
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
          <main className="flex-1 p-8 overflow-y-auto">
            {mainContent}
          </main>
        </>
      )}

      {/* Mobile: list view */}
      {isMobile && !showDetail && (
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-4 border-b border-white/[0.04]">
            <div className="flex items-center justify-between pt-3.5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-xs font-black text-white">R</span>
                </div>
                <h1 className="text-base font-bold text-gray-100 tracking-tight">RITO</h1>
              </div>
              <button
                onClick={logout}
                className="text-[11px] text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setView('news')}
                className={`pb-3 text-[13px] font-medium transition border-b-2 ${
                  view === 'news'
                    ? 'text-gray-100 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                Live Updates
              </button>
              <button
                onClick={() => setView('watchlist')}
                className={`pb-3 text-[13px] font-medium transition border-b-2 ${
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

      {/* Mobile: detail view */}
      {isMobile && view === 'news' && showDetail && (
        <main className="flex-1 p-4 overflow-y-auto">
          <DetailPanel item={data[selectedIndex]} onBack={() => setShowDetail(false)} isMobile />
        </main>
      )}
    </div>
  );
}

export default App;
