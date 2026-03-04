import { useState, useEffect, useRef, useCallback } from 'react';
import { searchStocks, getWatchlist, saveWatchlist } from '../services/api';

const MIN_STOCKS = 3;
const MAX_STOCKS = 15;

export default function StockSelectionPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState([]);
  const [receiveAll, setReceiveAll] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasExisting, setHasExisting] = useState(false);

  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getWatchlist();
        if (data.stocks?.length) {
          setSelected(data.stocks);
          setHasExisting(true);
        }
        if (data.stocks?.length || data.onboarding_complete) {
          setReceiveAll(data.receive_all_updates ?? true);
        }
      } catch {
        // Fresh start
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    setError('');
    setSaved(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchStocks(value);
        const selectedCodes = new Set(selected.map((s) => s.bse_scrip_code));
        setSearchResults(results.filter((r) => !selectedCodes.has(r.bse_scrip_code)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [selected]);

  const addStock = (stock) => {
    if (selected.length >= MAX_STOCKS) {
      setError(`Maximum ${MAX_STOCKS} stocks allowed.`);
      return;
    }
    if (selected.some((s) => s.bse_scrip_code === stock.bse_scrip_code)) return;
    setSelected((prev) => [...prev, stock]);
    setQuery('');
    setSearchResults([]);
    setError('');
    setSaved(false);
    inputRef.current?.focus();
  };

  const removeStock = (code) => {
    setSelected((prev) => prev.filter((s) => s.bse_scrip_code !== code));
    setError('');
    setSaved(false);
  };

  const handleSave = async () => {
    if (selected.length < MIN_STOCKS) {
      setError(`Please select at least ${MIN_STOCKS} stocks to save your watchlist.`);
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await saveWatchlist(selected.map((s) => s.bse_scrip_code), receiveAll);
      setSaved(true);
      setHasExisting(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatMcap = (val) => {
    if (!val) return '';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`;
    return `₹${val.toFixed(0)} Cr`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-100 tracking-tight">My Watchlist</h2>
        <p className="text-xs text-gray-500 mt-1.5 font-light">
          Choose companies to get personalized WhatsApp alerts when news breaks
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-blue-400/70 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-300/80 leading-relaxed">
          Add at least <span className="font-semibold text-blue-300">{MIN_STOCKS} stocks</span> to save your watchlist. You can select up to {MAX_STOCKS}.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="flex items-center bg-[#0d1117] rounded-xl border border-white/[0.06] focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all">
          <svg className="w-4 h-4 text-gray-600 ml-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by company name or NSE symbol..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 h-11 px-3 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none"
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3" />
          )}
        </div>

        {/* Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-20 max-h-60 overflow-y-auto">
            {searchResults.map((stock) => (
              <button
                key={stock.bse_scrip_code}
                onClick={() => addStock(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors text-left border-b border-white/[0.03] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200 font-medium truncate">{stock.company_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {stock.nse_symbol ? `NSE: ${stock.nse_symbol}` : `BSE: ${stock.bse_scrip_code}`}
                    {stock.mkt_cap_cr ? ` · ${formatMcap(stock.mkt_cap_cr)}` : ''}
                  </p>
                </div>
                <svg className="w-4 h-4 text-blue-400/60 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {query.trim().length > 1 && !searching && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-20 px-4 py-3">
            <p className="text-xs text-gray-500 text-center">No companies found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">
          Selected: <span className={`font-semibold ${selected.length >= MIN_STOCKS ? 'text-green-400/80' : 'text-yellow-400/80'}`}>
            {selected.length}
          </span> / {MAX_STOCKS}
        </span>
        {selected.length > 0 && selected.length < MIN_STOCKS && (
          <span className="text-[10px] text-yellow-500/70">
            Need {MIN_STOCKS - selected.length} more to save
          </span>
        )}
      </div>

      {/* Selected Stocks */}
      <div className="space-y-1 mb-6">
        {selected.length === 0 ? (
          <div className="bg-[#0d1117] rounded-xl border border-white/[0.04] flex items-center justify-center py-10">
            <p className="text-xs text-gray-600 text-center">
              Search and add stocks above to build your watchlist
            </p>
          </div>
        ) : (
          selected.map((stock) => (
            <div
              key={stock.bse_scrip_code}
              className="flex items-center justify-between bg-[#0d1117] border border-white/[0.04] rounded-lg px-4 py-3 hover:border-white/[0.06] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-200 font-medium truncate">{stock.company_name}</p>
                <p className="text-[10px] text-gray-600">
                  {stock.nse_symbol ? `NSE: ${stock.nse_symbol}` : `BSE: ${stock.bse_scrip_code}`}
                </p>
              </div>
              <button
                onClick={() => removeStock(stock.bse_scrip_code)}
                className="p-1.5 rounded-md text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0 ml-2"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.04] my-6" />

      {/* Toggle */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={receiveAll}
          onChange={(e) => { setReceiveAll(e.target.checked); setSaved(false); }}
          className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#161b22] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
        />
        <div>
          <p className="text-sm text-gray-200 font-medium">Get updates from all companies</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
            Receive WhatsApp alerts for all companies, not just your selected stocks
          </p>
        </div>
      </label>

      {/* Error / Success */}
      {error && <p className="text-red-400/90 text-xs mb-3 text-center font-medium">{error}</p>}
      {saved && <p className="text-green-400/80 text-xs mb-3 text-center font-medium">✓ Watchlist saved successfully!</p>}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || selected.length < MIN_STOCKS}
        className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:shadow-none"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          'Save Watchlist'
        )}
      </button>
    </div>
  );
}
