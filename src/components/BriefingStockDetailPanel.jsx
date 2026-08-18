import { getImpactBadgeClass, formatDate } from '../utils/format';

export default function BriefingStockDetailPanel({ item, onBack, isMobile }) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-base">Select a story to view details</p>
      </div>
    );
  }

  const direction = item.direction || 'NEUTRAL';
  const stocks = item.affected_stocks || '—';

  return (
    <>
      {isMobile && onBack && (
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Back
        </button>
      )}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {stocks}
              </h1>
              <span className={`impact-badge ${getImpactBadgeClass(direction)}`}>{direction}</span>
            </div>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap text-sm text-gray-500">
              {item.bse_scrip_code && <span className="font-mono">BSE {item.bse_scrip_code}</span>}
              {item.nse_symbol && <span className="font-mono">NSE {item.nse_symbol}</span>}
              {item.industry_primary && (
                <>
                  <span className="text-gray-700">·</span>
                  <span>{item.industry_primary}</span>
                </>
              )}
              {item.published_at_ist && (
                <>
                  <span className="text-gray-700">·</span>
                  <span>{formatDate(item.published_at_ist)}</span>
                </>
              )}
            </div>
          </div>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
            >
              Open source
            </a>
          )}
        </div>
      </div>

      {item.title && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Headline</h2>
          <p className="text-gray-200 leading-relaxed">{item.title}</p>
        </section>
      )}

      {item.ai_summary && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">AI summary</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.ai_summary}</p>
        </section>
      )}

      {item.implication && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Implication</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.implication}</p>
        </section>
      )}

      {item.key_numbers && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key numbers</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.key_numbers}</p>
        </section>
      )}

      <section className="text-xs text-gray-600">
        {item.source && <span>Source: {item.source}</span>}
        {item.category && <span className="ml-3">Category: {item.category}</span>}
        {item.cycle && <span className="ml-3">Cycle: {item.cycle.replace('_', ' ')}</span>}
      </section>
    </>
  );
}
