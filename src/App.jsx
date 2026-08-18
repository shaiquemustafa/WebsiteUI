import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import BriefingStockDetailPanel from './components/BriefingStockDetailPanel';
import IndustryInsightDetailPanel from './components/IndustryInsightDetailPanel';
import FeedList from './components/FeedList';
import LoginPage from './components/LoginPage';
import StockSelectionPage from './components/StockSelectionPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import SubscribePage from './components/SubscribePage';
import Footer from './components/Footer';
import {
  fetchUIData,
  fetchGeneralStockNews,
  fetchIndustryInsights,
  fetchPublicConfig,
} from './services/api';
import {
  isLoggedIn,
  fetchCurrentUser,
  getStoredUser,
  getStoredSubscription,
  setStoredSubscription,
  logout,
  recordVisit,
  subscriptionHasAccess,
  isPersonalModeEnv,
} from './services/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

function parseHashView() {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash === 'billing' || hash === 'subscribe') return 'billing';
  if (hash === 'watchlist') return 'watchlist';
  if (hash === 'general') return 'general';
  if (hash === 'industry') return 'industry';
  if (hash === 'privacy') return 'privacy';
  if (hash === 'terms') return 'terms';
  return 'bse';
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [personalMode, setPersonalMode] = useState(isPersonalModeEnv());
  const [feedSection, setFeedSection] = useState(parseHashView);

  const [bseData, setBseData] = useState([]);
  const [generalData, setGeneralData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDetail, setShowDetail] = useState(false);

  const activeData = useMemo(() => {
    if (feedSection === 'general') return generalData;
    if (feedSection === 'industry') return industryData;
    return bseData;
  }, [feedSection, bseData, generalData, industryData]);

  useEffect(() => {
    fetchPublicConfig(API_BASE)
      .then((cfg) => {
        if (cfg?.personal_mode) setPersonalMode(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onHashChange = () => setFeedSection(parseHashView());
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
          if (result.subscription?.personal_mode) setPersonalMode(true);
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
      if (result.subscription.personal_mode) setPersonalMode(true);
    }
  };

  const handleSubscriptionUpdated = useCallback((updated) => {
    setSubscription(updated);
    setStoredSubscription(updated);
    window.location.hash = '';
    setFeedSection('bse');
  }, []);

  const handleNavigate = (page) => {
    if (page === 'privacy' || page === 'terms') {
      setFeedSection(page);
      window.location.hash = page;
      return;
    }
    setFeedSection(page === 'news' ? 'bse' : page);
  };

  const hasAccess = subscriptionHasAccess(subscription);
  const showSubscribePage =
    !personalMode && user && (feedSection === 'billing' || !hasAccess);

  const loadFeeds = useCallback(async () => {
    if (!user || !hasAccess) return;
    try {
      setLoading(true);
      const loaders = [fetchUIData(API_BASE).then(setBseData)];
      if (personalMode) {
        loaders.push(fetchGeneralStockNews(API_BASE).then(setGeneralData));
        loaders.push(fetchIndustryInsights(API_BASE).then(setIndustryData));
      }
      await Promise.all(loaders);
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
  }, [user, hasAccess, personalMode]);

  useEffect(() => {
    loadFeeds();
    const interval = setInterval(loadFeeds, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadFeeds]);

  useEffect(() => {
    setSelectedIndex(0);
    setShowDetail(false);
  }, [feedSection]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowDetail(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFeedSectionChange = (section) => {
    setFeedSection(section);
    window.location.hash = section === 'bse' ? '' : section;
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    if (feedSection !== 'watchlist') {
      window.location.hash = feedSection === 'bse' ? '' : feedSection;
    }
    if (isMobile) setShowDetail(true);
  };

  const renderDetail = () => {
    const item = activeData[selectedIndex];
    if (feedSection === 'general') {
      return <BriefingStockDetailPanel item={item} />;
    }
    if (feedSection === 'industry') {
      return <IndustryInsightDetailPanel item={item} />;
    }
    return <DetailPanel item={item} />;
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
    if (feedSection === 'privacy') {
      return (
        <div className="min-h-screen bg-[#06080a]">
          <PrivacyPolicyPage onBack={() => setFeedSection(parseHashView())} />
        </div>
      );
    }
    if (feedSection === 'terms') {
      return (
        <div className="min-h-screen bg-[#06080a]">
          <TermsPage onBack={() => setFeedSection(parseHashView())} />
        </div>
      );
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  if (showSubscribePage && feedSection !== 'privacy' && feedSection !== 'terms') {
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

  if (feedSection === 'privacy') {
    return (
      <div className="min-h-screen bg-[#06080a]">
        <PrivacyPolicyPage onBack={() => setFeedSection('bse')} />
      </div>
    );
  }
  if (feedSection === 'terms') {
    return (
      <div className="min-h-screen bg-[#06080a]">
        <TermsPage onBack={() => setFeedSection('bse')} />
      </div>
    );
  }

  if (feedSection === 'watchlist') {
    return (
      <div className="flex h-screen bg-[#06080a] overflow-hidden">
        {!isMobile && (
          <>
            <Sidebar
              data={activeData}
              activeIndex={selectedIndex}
              onSelect={handleSelect}
              user={user}
              subscription={subscription}
              onLogout={logout}
              onEditWatchlist={() => handleFeedSectionChange('bse')}
              feedSection={feedSection}
              onFeedSectionChange={handleFeedSectionChange}
              personalMode={personalMode}
            />
            <main className="flex-1 p-8 overflow-y-auto">
              <StockSelectionPage />
              <Footer onNavigate={handleNavigate} />
            </main>
          </>
        )}
        {isMobile && (
          <main className="flex-1 overflow-y-auto p-4">
            <StockSelectionPage />
            <Footer onNavigate={handleNavigate} />
          </main>
        )}
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
          <h2 className="text-lg font-semibold text-gray-200 mb-1.5 tracking-tight">Could not load feed</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeData.length) {
    const emptyLabels = {
      bse: 'No BSE/NSE updates yet',
      general: 'No general stock news yet',
      industry: 'No industry insights yet',
    };
    return (
      <div className="flex h-screen bg-[#06080a] overflow-hidden">
        {!isMobile && (
          <>
            <Sidebar
              data={[]}
              activeIndex={0}
              onSelect={() => {}}
              user={user}
              subscription={subscription}
              onLogout={logout}
              onEditWatchlist={() => handleFeedSectionChange('watchlist')}
              feedSection={feedSection}
              onFeedSectionChange={handleFeedSectionChange}
              personalMode={personalMode}
            />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-200 mb-1.5">{emptyLabels[feedSection] || 'No data'}</h2>
                <p className="text-gray-500 text-sm">Check another tab or wait for the next pipeline run.</p>
              </div>
            </main>
          </>
        )}
        {isMobile && (
          <main className="flex-1 overflow-y-auto">
            <div className="sticky top-0 bg-[#06080a]/95 backdrop-blur-md z-10 px-4 border-b border-white/[0.04] pt-4 pb-0">
              <p className="text-gray-500 text-sm pb-4">{emptyLabels[feedSection]}</p>
            </div>
          </main>
        )}
      </div>
    );
  }

  const goBilling = () => {
    window.location.hash = 'billing';
    setFeedSection('billing');
  };

  const mainContent = (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">{renderDetail()}</div>
      <Footer onNavigate={handleNavigate} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#06080a] overflow-hidden">
      {!isMobile && (
        <>
          <Sidebar
            data={activeData}
            activeIndex={selectedIndex}
            onSelect={handleSelect}
            user={user}
            subscription={subscription}
            onLogout={logout}
            onEditWatchlist={() => handleFeedSectionChange('watchlist')}
            feedSection={feedSection}
            onFeedSectionChange={handleFeedSectionChange}
            personalMode={personalMode}
            onManageSubscription={personalMode ? undefined : goBilling}
          />
          <main className="flex-1 p-8 overflow-y-auto">{mainContent}</main>
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
              <button
                onClick={logout}
                className="text-xs font-medium text-red-400/80 bg-red-400/10 px-3 py-1.5 rounded-lg"
              >
                Logout
              </button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-0">
              {(personalMode
                ? [
                    { id: 'bse', label: 'BSE/NSE' },
                    { id: 'general', label: 'General' },
                    { id: 'industry', label: 'Industry' },
                    { id: 'watchlist', label: 'Watchlist' },
                  ]
                : [
                    { id: 'bse', label: 'Live Updates' },
                    { id: 'watchlist', label: 'Watchlist' },
                  ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'watchlist') handleFeedSectionChange('watchlist');
                    else handleFeedSectionChange(tab.id);
                  }}
                  className={`pb-3.5 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                    feedSection === tab.id
                      ? 'text-gray-100 border-blue-500'
                      : 'text-gray-500 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <FeedList
            data={activeData}
            section={feedSection}
            onSelect={handleSelect}
          />
          <Footer onNavigate={handleNavigate} />
        </main>
      )}

      {isMobile && showDetail && (
        <main className="flex-1 p-4 overflow-y-auto">
          {feedSection === 'general' && (
            <BriefingStockDetailPanel
              item={activeData[selectedIndex]}
              onBack={() => setShowDetail(false)}
              isMobile
            />
          )}
          {feedSection === 'industry' && (
            <IndustryInsightDetailPanel
              item={activeData[selectedIndex]}
              onBack={() => setShowDetail(false)}
              isMobile
            />
          )}
          {feedSection === 'bse' && (
            <DetailPanel
              item={activeData[selectedIndex]}
              onBack={() => setShowDetail(false)}
              isMobile
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
