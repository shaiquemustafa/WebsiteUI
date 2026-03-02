import { useState, useEffect, useRef, useCallback } from 'react';
import { searchStocks, getWatchlist, saveWatchlist } from '../services/api';

const MIN_STOCKS = 3;
const MAX_STOCKS = 15;

export default function StockSelectionPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState([]);
  const [receiveAll, setReceiveAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  // Load existing watchlist on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getWatchlist();
        if (data.stocks?.length) setSelected(data.stocks);
        setReceiveAll(data.receive_all_updates || false);
      } catch {
        // Fresh start
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debounced search
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
      setError(`Please select at least ${MIN_STOCKS} stocks.`);
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await saveWatchlist(
        selected.map((s) => s.bse_scrip_code),
        receiveAll
      );
      setSaved(true);
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
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-100">My Watchlist</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select {MIN_STOCKS}–{MAX_STOCKS} companies to get personalized WhatsApp alerts
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <div className="flex items-center bg-[#18181b] rounded-lg border border-white/[0.06] focus-within:border-blue-500 transition">
          <svg className="w-4 h-4 text-gray-500 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e22] border border-white/[0.08] rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
            {searchResults.map((stock) => (
              <button
                key={stock.bse_scrip_code}
                onClick={() => addStock(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#27272a] transition text-left border-b border-white/[0.03] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200 font-medium truncate">{stock.company_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {stock.nse_symbol ? `NSE: ${stock.nse_symbol}` : `BSE: ${stock.bse_scrip_code}`}
                    {stock.mkt_cap_cr ? ` · ${formatMcap(stock.mkt_cap_cr)}` : ''}
                  </p>
                </div>
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {query.trim().length > 1 && !searching && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e22] border border-white/[0.08] rounded-xl shadow-2xl z-20 px-4 py-3">
            <p className="text-xs text-gray-500 text-center">No companies found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">
          Selected: <span className={`font-semibold ${selected.length >= MIN_STOCKS ? 'text-green-400' : 'text-yellow-400'}`}>
            {selected.length}
          </span> / {MAX_STOCKS}
        </span>
        {selected.length > 0 && selected.length < MIN_STOCKS && (
          <span className="text-[10px] text-yellow-500">
            Need {MIN_STOCKS - selected.length} more
          </span>
        )}
      </div>

      {/* Selected Stocks */}
      <div className="space-y-1.5 mb-5">
        {selected.length === 0 ? (
          <div className="bg-[#18181b] rounded-xl border border-white/[0.04] flex items-center justify-center py-10">
            <p className="text-xs text-gray-600 text-center">
              Search and add stocks above to build your watchlist
            </p>
          </div>
        ) : (
          selected.map((stock) => (
            <div
              key={stock.bse_scrip_code}
              className="flex items-center justify-between bg-[#18181b] border border-white/[0.04] rounded-lg px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-200 font-medium truncate">{stock.company_name}</p>
                <p className="text-[10px] text-gray-500">
                  {stock.nse_symbol ? `NSE: ${stock.nse_symbol}` : `BSE: ${stock.bse_scrip_code}`}
                </p>
              </div>
              <button
                onClick={() => removeStock(stock.bse_scrip_code)}
                className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition flex-shrink-0 ml-2"
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
      <div className="border-t border-white/[0.06] my-5" />

      {/* Receive all updates toggle */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => { setReceiveAll(!receiveAll); setSaved(false); }}
          className={`mt-0.5 w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
            receiveAll ? 'bg-blue-600' : 'bg-[#3a3a3d]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              receiveAll ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <div>
          <p className="text-sm text-gray-200 font-medium">Get updates from all companies</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
            Receive WhatsApp alerts for all companies, not just your selected stocks
          </p>
        </div>
      </div>

      {/* Error / Success */}
      {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
      {saved && <p className="text-green-400 text-xs mb-3 text-center">✓ Watchlist saved successfully!</p>}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || selected.length < MIN_STOCKS}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
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
