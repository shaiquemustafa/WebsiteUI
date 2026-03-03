/**
 * Terms & Conditions page for RITO — adapted from old site, updated for current branding.
 */
export default function TermsPage({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-6 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-100 mb-2">Terms & Conditions</h1>
      <p className="text-xs text-gray-600 mb-6">Last updated: March 2026</p>

      <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
        <p>
          Welcome to RITO. These terms and conditions outline the rules and regulations for the use of our application
          and website (<span className="text-gray-300">rito.co.in</span>). By accessing this application, we assume
          you accept these terms and conditions. Do not continue to use the service if you do not agree to all of the
          terms and conditions stated on this page.
        </p>

        <Section title="Use of Service">
          <p>
            The service and its features are provided on an "as is" and "as available" basis without any warranties of
            any kind. We grant you a limited, non-exclusive, non-transferable, and revocable license to use our service
            for your personal, non-commercial purposes. You agree not to use the service for any unlawful purpose.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            The information provided by our service is for general informational purposes only. All information on the
            site is provided in good faith, however, we make no representation or warranty of any kind, express or
            implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any
            information.
          </p>
          <p className="mt-2">
            RITO provides market analysis and insights based on publicly available data. <strong className="text-gray-300">This
            does not constitute financial advice.</strong> The firm will not be held liable for any investment decisions
            made based on the information provided, and the user bears the full burden of risk. Always consult a
            qualified financial advisor before making investment decisions.
          </p>
        </Section>

        <Section title="Market Data Disclaimer">
          <p>
            Stock prices, market data, and analysis shown on RITO are sourced from publicly available information and
            may be subject to delays. We do not guarantee the accuracy or timeliness of the data. Past performance does
            not guarantee future results. Investing in the stock market involves risk, including the potential loss of
            principal.
          </p>
        </Section>

        <Section title="User Accounts">
          <p>
            By creating an account, you agree to provide accurate and complete information. You are responsible for
            maintaining the confidentiality of your account and for any activities that occur under your account. You
            agree to notify us immediately of any unauthorized use of your account.
          </p>
        </Section>

        <Section title="WhatsApp Notifications">
          <p>
            By opting in to WhatsApp notifications, you consent to receiving market alerts, updates, and OTP messages
            from RITO via WhatsApp. You can manage your notification preferences from the My Watchlist section or by
            contacting us. Standard messaging rates may apply.
          </p>
        </Section>

        <Section title="Changes to Terms">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide
            notice of any changes by posting the new Terms and Conditions on this page. Your continued use of the
            service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </Section>

        <Section title="Contact Information">
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:elrond389@gmail.com" className="text-blue-400 hover:underline">
              elrond389@gmail.com
            </a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-200 mb-2">{title}</h2>
      {children}
    </div>
  );
}
