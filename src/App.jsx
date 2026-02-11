import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import MobileList from './components/MobileList';
import { fetchUIData } from './services/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

function App() {
  const [data, setData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop: sidebar + detail */}
      {!isMobile && (
        <>
          <Sidebar data={data} activeIndex={selectedIndex} onSelect={handleSelect} />
          <main className="flex-1 p-6 overflow-y-auto">
            <DetailPanel item={data[selectedIndex]} />
          </main>
        </>
      )}

      {/* Mobile: list or detail */}
      {isMobile && !showDetail && (
        <main className="flex-1 p-4 overflow-y-auto">
          <MobileList data={data} onSelect={handleSelect} />
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
