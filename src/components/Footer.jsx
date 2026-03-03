/**
 * Groww-style footer for RITO.
 * Used on both login page (compact) and dashboard.
 *
 * Props:
 *   onNavigate(page) – 'privacy' | 'terms'   (opens the respective page)
 *   compact          – boolean                (smaller version for login)
 */
export default function Footer({ onNavigate, compact = false }) {
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="mt-10 border-t border-white/[0.04] pt-5 pb-6 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
          <button onClick={() => onNavigate?.('privacy')} className="hover:text-gray-400 transition">
            Privacy Policy
          </button>
          <span className="text-gray-800">·</span>
          <button onClick={() => onNavigate?.('terms')} className="hover:text-gray-400 transition">
            Terms & Conditions
          </button>
          <span className="text-gray-800">·</span>
          <a href="mailto:elrond389@gmail.com" className="hover:text-gray-400 transition">
            Contact Us
          </a>
        </div>
        <p className="text-[10px] text-gray-700 mt-2">© {currentYear} RITO. All rights reserved.</p>
      </footer>
    );
  }

  // Full footer (dashboard / main app)
  return (
    <footer className="border-t border-white/[0.06] mt-8 pt-6 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gray-200">RITO</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs leading-relaxed">
              Real-time market insights and stock analysis for everyday investors.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-3">
              <a
                href="https://www.facebook.com/share/1DLj3Ac3ta/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-400 transition"
                title="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.598 0 0 .598 0 1.344v21.312C0 23.402.598 24 1.344 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.746 0 1.344-.598 1.344-1.344V1.344C24 .598 23.402 0 22.675 0z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rito_insights/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-400 transition"
                title="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-gray-500">
            <button onClick={() => onNavigate?.('privacy')} className="hover:text-gray-300 transition">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate?.('terms')} className="hover:text-gray-300 transition">
              Terms & Conditions
            </button>
            <a href="mailto:elrond389@gmail.com" className="hover:text-gray-300 transition">
              Contact: elrond389@gmail.com
            </a>
          </div>
        </div>

        <p className="text-[10px] text-gray-700 mt-6">© {currentYear} RITO. All rights reserved.</p>
      </div>
    </footer>
  );
}
