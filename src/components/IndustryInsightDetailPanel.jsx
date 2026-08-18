import { getImpactBadgeClass, formatDate } from '../utils/format';

export default function IndustryInsightDetailPanel({ item, onBack, isMobile }) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-base">Select an industry insight</p>
      </div>
    );
  }

  const direction = item.direction || 'NEUTRAL';

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
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {item.industry || 'Industry insight'}
          </h1>
          <span className={`impact-badge ${getImpactBadgeClass(direction)}`}>{direction}</span>
        </div>
        <div className="flex items-center gap-3 mt-2.5 flex-wrap text-sm text-gray-500">
          {item.n_items != null && <span>{item.n_items} items</span>}
          {item.run_at_ist && (
            <>
              <span className="text-gray-700">·</span>
              <span>{formatDate(item.run_at_ist)}</span>
            </>
          )}
          {item.cycle && (
            <>
              <span className="text-gray-700">·</span>
              <span>{item.cycle.replace('_', ' ')}</span>
            </>
          )}
        </div>
      </div>

      {item.headline && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Headline</h2>
          <p className="text-gray-200 text-lg leading-relaxed">{item.headline}</p>
        </section>
      )}

      {item.bullets && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Details</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.bullets}</div>
        </section>
      )}

      {item.key_numbers && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key numbers</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.key_numbers}</p>
        </section>
      )}

      {item.key_stocks && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key stocks</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.key_stocks}</p>
        </section>
      )}

      {item.key_themes && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key themes</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.key_themes}</p>
        </section>
      )}
    </>
  );
}
