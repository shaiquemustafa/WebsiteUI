import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import MobileList from './components/MobileList';
import LoginPage from './components/LoginPage';
import { fetchUIData } from './services/api';
import { isLoggedIn, fetchCurrentUser, getStoredUser, logout } from './services/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

function App() {
  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

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

      // We have a token — verify it's still valid
      const stored = getStoredUser();
      if (stored) setUser(stored); // show stored user immediately

      try {
        const freshUser = await fetchCurrentUser();
        if (freshUser) {
          setUser(freshUser);
        } else {
          // Token was invalid/expired
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
    // Refresh every 2 minutes
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

  // ── Not logged in → show login ────────────────────────────────────
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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

  // ── Main app (logged-in view) ─────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop: sidebar + detail */}
      {!isMobile && (
        <>
          <Sidebar data={data} activeIndex={selectedIndex} onSelect={handleSelect} user={user} onLogout={logout} />
          <main className="flex-1 p-6 overflow-y-auto">
            <DetailPanel item={data[selectedIndex]} />
          </main>
        </>
      )}

      {/* Mobile: list or detail */}
      {isMobile && !showDetail && (
        <main className="flex-1 overflow-y-auto">
          {/* Mobile header */}
          <div className="sticky top-0 bg-[#0a0a0a] z-10 px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-100">StockHub</h1>
              <p className="text-[10px] text-gray-500">
                {user.name ? `Hi, ${user.name}` : `+91 ${user.phone?.slice(-10)}`}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-red-400 transition px-2 py-1"
            >
              Logout
            </button>
          </div>
          <div className="p-4">
            <MobileList data={data} onSelect={handleSelect} />
          </div>
        </main>
      )}
      {isMobile && showDetail && (
        <main className="flex-1 p-4 overflow-y-auto">
          <DetailPanel item={data[selectedIndex]} onBack={() => setShowDetail(false)} isMobile />
        </main>
      )}
    </div>
  );
}

export default App;
