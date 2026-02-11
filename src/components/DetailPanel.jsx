import { getImpactBadgeClass, formatNumber, formatDate, sortQuarters } from '../utils/format';

export default function DetailPanel({ item, onBack, isMobile }) {
  if (!item) {
    return <p className="text-center text-gray-500 mt-20">Select a company to view details.</p>;
  }

  const impact = item.impact || 'UNKNOWN';
  const pctChange = parseFloat(item.percent_change || 0);
  const pctColor = pctChange >= 0 ? 'positive' : 'negative';
  const pctSymbol = pctChange >= 0 ? '▲' : '▼';

  // Quarterly data — build quarter headers from all financial fields
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

  // Analyst consensus
  const consensus = item.analyst_consensus || {};
  const hasConsensus = Object.keys(consensus).length > 0;

  return (
    <>
      {/* Mobile back button */}
      {isMobile && onBack && (
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 transition">
          ← Back
        </button>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{item.company_name}</h1>
              <span className={`impact-badge ${getImpactBadgeClass(impact)}`}>{impact}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">SCRIP: {item.scrip_cd}</p>
          </div>
          {item.pdf_link && (
            <a href={item.pdf_link} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0">
              View PDF Report
            </a>
          )}
        </div>
        <p className="text-sm text-gray-300 mt-3 leading-relaxed">{item.summary}</p>
        <p className="text-xs text-gray-500 mt-2 italic">{item.rationale}</p>
        <div className="text-xs text-gray-600 mt-2">
          {item.category && <span className="mr-3">📁 {item.category}</span>}
          <span>🕐 {formatDate(item.news_time)}</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="metric-label">Prediction</p>
          <p className={`metric-value ${parseFloat(item.mid_percentage) >= 0 ? 'positive' : 'negative'}`}>
            {parseFloat(item.mid_percentage) >= 0 ? '▲' : '▼'} {item.price_range}
          </p>
        </div>

        {item.current_price_bse && (
          <div className="card">
            <p className="metric-label">BSE Price</p>
            <p className="metric-value">₹{item.current_price_bse}</p>
            <p className={`text-sm font-semibold ${pctColor}`}>{pctSymbol} {Math.abs(pctChange).toFixed(2)}%</p>
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
            {item.number_of_estimates && <p className="text-xs text-gray-500 mt-1">{item.number_of_estimates} estimates</p>}
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

      {/* Analyst Consensus */}
      {hasConsensus && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-200 mb-3">Analyst Consensus</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(consensus).map(([rating, count]) => (
              <div key={rating} className="text-center px-4 py-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 capitalize">{rating.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-gray-200">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quarterly Financials Table */}
      {hasQuarterly && (
        <div className="card overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-200 mb-3">Quarterly Financials (₹ Cr)</h2>
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-2.5 text-xs font-semibold text-gray-400">Metric</th>
                {quarters.map(q => (
                  <th key={q} className="p-2.5 text-xs font-semibold text-gray-400 text-right">{q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financialFields.map(({ key, label }) => {
                const rowData = item[key];
                if (!rowData || typeof rowData !== 'object') return null;
                return (
                  <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-2.5 text-sm font-medium text-gray-300">{label}</td>
                    {quarters.map(q => {
                      const val = rowData[q];
                      const isNeg = val != null && parseFloat(val) < 0;
                      return (
                        <td key={q} className={`p-2.5 text-sm text-right font-mono ${isNeg ? 'text-red-400' : 'text-gray-300'}`}>
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
      )}
    </>
  );
}
