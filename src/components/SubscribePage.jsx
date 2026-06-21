import { useState } from 'react';
import { startSubscriptionPayment, getBillingUrl } from '../services/payment';
import Footer from './Footer';

function formatExpiry(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SubscribePage({
  user,
  subscription,
  onSubscriptionUpdated,
  onLogout,
  onNavigate,
  forcePaywall = false,
}) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isPaid = subscription?.is_paid;
  const amount = subscription?.amount_inr ?? 99;
  const billingUrl = getBillingUrl();
  const checkoutActive = loading || confirming;

  const handlePay = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    await startSubscriptionPayment({
      user,
      onConfirming: () => {
        setLoading(false);
        setConfirming(true);
      },
      onSuccess: (updated) => {
        setConfirming(false);
        setSuccess('Payment successful! Your access is now active.');
        onSubscriptionUpdated?.(updated);
      },
      onError: (msg) => {
        setLoading(false);
        setConfirming(false);
        if (msg && msg !== 'Payment cancelled.') setError(msg);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-base font-black text-white">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">RITO</h1>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl">
            {isPaid && !forcePaywall ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-100 text-center mb-2">Subscription active</h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Your access is valid until{' '}
                  <span className="text-gray-200 font-medium">{formatExpiry(subscription.current_period_end)}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => { window.location.hash = ''; window.location.reload(); }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                >
                  Go to dashboard
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full mt-3 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/[0.04] font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Opening checkout…' : 'Renew early'}
                </button>
              </>
            ) : checkoutActive ? (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-100 text-center mb-2">
                  {loading ? 'Opening checkout…' : 'Confirming payment…'}
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                  {confirming
                    ? 'Complete payment in your UPI app, then return here. We will activate your access automatically.'
                    : 'Please wait while we connect to Razorpay.'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-100 text-center mb-2">
                  {isPaid ? 'Renew subscription' : 'Subscribe to RITO'}
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                  Get live market updates, watchlist alerts on WhatsApp, and full dashboard access.
                </p>

                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-5 py-4 mb-6 text-center">
                  <p className="text-3xl font-bold text-gray-100">₹{amount}<span className="text-base font-normal text-gray-400">/month</span></p>
                  <p className="text-xs text-gray-500 mt-1">30 days access from payment date · manual renewal each month</p>
                </div>

                {success && (
                  <p className="text-emerald-400 text-sm text-center mb-4">{success}</p>
                )}
                {error && (
                  <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={checkoutActive}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? 'Opening checkout…' : `Pay ₹${amount} now`}
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  Secure payment via Razorpay · UPI, cards &amp; netbanking
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-gray-600 text-center mt-6 break-all">
            Share this link: <span className="text-gray-500">{billingUrl}</span>
          </p>

          <div className="flex justify-center gap-4 mt-6">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-sm text-gray-500 hover:text-gray-300 transition"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
