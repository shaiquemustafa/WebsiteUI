import { getImpactBadgeClass, getCategoryClass, formatNumber, formatDate, sortQuarters } from '../utils/format';

export default function DetailPanel({ item, onBack, isMobile }) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-40">📊</div>
          <p className="text-gray-500 text-base">Select a company to view details</p>
        </div>
      </div>
    );
  }

  const impact = item.impact || 'UNKNOWN';

  // Quarterly data
  const quarterSet = new Set();
  const financialFields = [
    { key: 'sales', label: 'Sales' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'operating_profit', label: 'Operating Profit' },
    { key: 'opm_percent', label: 'OPM %' },
    { key: 'other_income', label: 'Other Income' },
    { key: 'interest', label: 'Interest' },
    { key: 'depreciation', label: 'Depreciation' },
    { key: 'profit_before_tax', label: 'Profit Before Tax' },
    { key: 'tax_percent', label: 'Tax %' },
    { key: 'net_profit', label: 'Net Profit' },
    { key: 'eps_in_rs', label: 'EPS (₹)' },
  ];

  financialFields.forEach(({ key }) => {
    if (item[key] && typeof item[key] === 'object') {
      Object.keys(item[key]).forEach(q => quarterSet.add(q));
    }
  });

  const quarters = sortQuarters(Array.from(quarterSet));
  const hasQuarterly = quarters.length > 0;

  const consensus = item.analyst_consensus || {};
  const hasConsensus = Object.keys(consensus).length > 0;

  return (
    <>
      {/* Mobile back button */}
      {isMobile && onBack && (
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {item.company_name}
              </h1>
              <span className={`impact-badge ${getImpactBadgeClass(impact)}`}>{impact}</span>
            </div>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className="text-sm text-gray-500 font-mono">SCRIP {item.scrip_cd}</span>
              {item.category && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className={`category-tag ${getCategoryClass(item.category)}`}>{item.category}</span>
                </>
              )}
              <span className="text-gray-700">·</span>
              <span className="text-sm text-gray-500">{formatDate(item.news_time)}</span>
            </div>
          </div>
          {item.pdf_link && (
            <a
              href={item.pdf_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 text-sm font-semibold px-5 py-2.5 rounded-xl border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/30 transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View PDF Report
            </a>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-[#0d1117] rounded-xl border border-white/[0.04] p-6">
          <p className="text-base text-gray-300 leading-[1.75]">{item.summary}</p>
          {item.rationale && (
            <p className="text-sm text-gray-500 mt-4 leading-relaxed italic border-t border-white/[0.04] pt-4">{item.rationale}</p>
          )}
        </div>
      </div>

      {/* ── Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {item.mkt_cap_cr && (
          <div className="card">
            <p className="metric-label">Market Cap</p>
            <p className="metric-value">
              {item.mkt_cap_cr >= 100000 
                ? `₹${(item.mkt_cap_cr / 100000).toFixed(1)}L Cr`
                : item.mkt_cap_cr >= 1000
                ? `₹${(item.mkt_cap_cr / 1000).toFixed(1)}K Cr`
                : `₹${formatNumber(item.mkt_cap_cr)} Cr`}
            </p>
          </div>
        )}

        {item.current_price_bse && (
          <div className="card">
            <p className="metric-label">BSE Price</p>
            <p className="metric-value">₹{item.current_price_bse}</p>
          </div>
        )}

        {item.current_price_nse && (
          <div className="card">
            <p className="metric-label">NSE Price</p>
            <p className="metric-value">₹{item.current_price_nse}</p>
          </div>
        )}

        {item.target_price_mean && (
          <div className="card">
            <p className="metric-label">Target Price</p>
            <p className="metric-value">₹{formatNumber(item.target_price_mean)}</p>
            {item.number_of_estimates && (
              <p className="text-xs text-gray-500 mt-2">{item.number_of_estimates} analyst estimates</p>
            )}
          </div>
        )}

        {item.year_high && (
          <div className="card">
            <p className="metric-label">52W High</p>
            <p className="metric-value">₹{item.year_high}</p>
          </div>
        )}

        {item.year_low && (
          <div className="card">
            <p className="metric-label">52W Low</p>
            <p className="metric-value">₹{item.year_low}</p>
          </div>
        )}
      </div>

      {/* ── Analyst Consensus ───────────────────────────────────────── */}
      {hasConsensus && (() => {
        // Order: Strong Buy → Buy → Hold → Sell → Strong Sell
        const ratingOrder = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
        const ratingLabels = {
          'strong_buy': 'Strong Buy',
          'buy': 'Buy',
          'hold': 'Hold',
          'sell': 'Sell',
          'strong_sell': 'Strong Sell',
        };
        const ratingColors = {
          'strong_buy': 'bg-green-500',
          'buy': 'bg-green-400',
          'hold': 'bg-yellow-500',
          'sell': 'bg-orange-500',
          'strong_sell': 'bg-red-500',
        };
        
        const sortedRatings = ratingOrder
          .filter(rating => consensus[rating] !== undefined)
          .map(rating => ({
            rating,
            label: ratingLabels[rating],
            count: consensus[rating],
            color: ratingColors[rating],
          }));
        
        const maxCount = Math.max(...sortedRatings.map(r => r.count), 1);
        const total = sortedRatings.reduce((sum, r) => sum + r.count, 0);

        return (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 tracking-tight">Analyst Consensus</h2>
            <div className="bg-[#0d1117] rounded-xl border border-white/[0.04] p-6">
              <div className="space-y-4">
                {sortedRatings.map(({ rating, label, count, color }) => {
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="w-24 flex-shrink-0">
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-8 bg-white/[0.03] rounded-lg overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-lg transition-all duration-300 flex items-center justify-end pr-3`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-xs font-bold text-white">{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-12 text-right flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-300">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.04]">
                <p className="text-xs text-gray-500 text-center">
                  Total: <span className="text-gray-400 font-semibold">{total} analysts</span>
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Quarterly Financials Table ──────────────────────────────── */}
      {hasQuarterly && (
        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-4 tracking-tight">Quarterly Financials (₹ Cr)</h2>
          <div className="bg-[#0d1117] rounded-xl border border-white/[0.04] overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric</th>
                  {quarters.map(q => (
                    <th key={q} className="px-5 py-3.5 text-xs font-semibold text-gray-500 text-right uppercase tracking-wider">{q}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financialFields.map(({ key, label }) => {
                  const rowData = item[key];
                  if (!rowData || typeof rowData !== 'object') return null;
                  return (
                    <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-300">{label}</td>
                      {quarters.map(q => {
                        const val = rowData[q];
                        const isNeg = val != null && parseFloat(val) < 0;
                        return (
                          <td key={q} className={`px-5 py-3.5 text-sm text-right font-mono tabular-nums ${isNeg ? 'text-red-400/80' : 'text-gray-400'}`}>
                            {val != null ? formatNumber(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
