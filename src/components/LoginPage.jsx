import { useState, useRef, useEffect } from 'react';
import { sendOTP, verifyOTP } from '../services/auth';
import Footer from './Footer';

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile
const OTP_LENGTH = 4;

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first OTP box when switching to OTP step
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // ── Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');

    const cleaned = phone.replace(/\s|-/g, '');
    if (!PHONE_REGEX.test(cleaned)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(cleaned);
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    await handleSendOTP();
  };

  // ── OTP input handling ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value && index === OTP_LENGTH - 1 && newOtp.every(d => d)) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerifyOTP(pasted);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 4-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await verifyOTP(phone.replace(/\s|-/g, ''), code);
      onLoginSuccess(result);
    } catch (err) {
      setError(err.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Main login area */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-4">
              <span className="text-2xl font-black text-white">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100">Welcome to RITO</h1>
            <p className="text-sm text-gray-500 mt-1">Live Market Predictions & Insights</p>
          </div>

          {/* Card */}
          <div className="bg-[#18181b] rounded-2xl border border-white/[0.06] p-6 shadow-xl">

            {/* ──── Phone Step ──── */}
            {step === 'phone' && (
              <form onSubmit={handleSendOTP}>
                <h2 className="text-lg font-semibold text-gray-200 mb-1">Login with WhatsApp</h2>
                <p className="text-xs text-gray-500 mb-5">We'll send a verification code to your WhatsApp</p>

                <label className="block text-xs font-medium text-gray-400 mb-1.5">Mobile Number</label>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center h-11 px-3 bg-[#27272a] rounded-lg text-sm text-gray-400 border border-white/[0.06]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="flex-1 h-11 px-3 bg-[#27272a] rounded-lg text-sm text-gray-100 placeholder-gray-600 border border-white/[0.06] outline-none focus:border-blue-500 transition"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Send OTP via WhatsApp
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ──── OTP Step ──── */}
            {step === 'otp' && (
              <div>
                <button
                  onClick={() => { setStep('phone'); setOtp(Array(OTP_LENGTH).fill('')); setError(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 mb-3 flex items-center gap-1 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Change number
                </button>

                <h2 className="text-lg font-semibold text-gray-200 mb-1">Enter OTP</h2>
                <p className="text-xs text-gray-500 mb-5">
                  Code sent to <span className="text-gray-300 font-medium">+91 {phone}</span> on WhatsApp
                </p>

                {/* OTP Boxes */}
                <div className="flex justify-center gap-2.5 mb-4" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      className="w-11 h-13 text-center text-xl font-bold bg-[#27272a] text-gray-100 border border-white/[0.06] rounded-lg outline-none focus:border-blue-500 transition disabled:opacity-50"
                    />
                  ))}
                </div>

                {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

                <button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </button>

                {/* Resend */}
                <div className="text-center mt-4">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-600">
                      Resend OTP in <span className="text-gray-400 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                      Didn't receive it? Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Terms text */}
          <p className="text-center text-[10px] text-gray-700 mt-4">
            By logging in, you agree to RITO's{' '}
            <button onClick={() => onNavigate?.('terms')} className="text-gray-500 hover:text-gray-400 underline transition">
              Terms of Service
            </button>{' '}
            &{' '}
            <button onClick={() => onNavigate?.('privacy')} className="text-gray-500 hover:text-gray-400 underline transition">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {/* ── About RITO Section ─────────────────────────────────────── */}
      <div className="border-t border-white/[0.04] bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-lg font-bold text-gray-200 mb-3 text-center">About RITO</h2>
          <div className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              RITO levels the playing field for everyday investors by turning fast, complex market noise into clear,
              timely insight. We track real-time announcements and evolving narratives, then translate them into
              plain-English takeaways and news-driven stock suggestions — so you don't surrender your edge to
              institutional timelines and tools.
            </p>
            <p>
              Instead of scattered headlines, you get the <span className="text-gray-400 font-medium">'story of the stock'</span>:
              what changed, why it matters, and where to dig deeper. Our approach centers on{' '}
              <span className="text-green-400/80 font-medium">Speed</span>,{' '}
              <span className="text-yellow-400/80 font-medium">Clarity</span> and{' '}
              <span className="text-gray-300 font-medium">Transparency</span> — helping you separate signal from
              chatter and act with confidence.
            </p>
            <p>
              Whether today's update is positive, negative, or simply important to watch, RITO puts it in context so
              decisions feel informed rather than rushed. No jargon walls, no paywalled complexity — just accessible
              intelligence designed for real investors.
            </p>
          </div>
        </div>

        {/* Compact footer on login page */}
        <div className="px-6 pb-6">
          <Footer onNavigate={onNavigate} compact />
        </div>
      </div>
    </div>
  );
}
