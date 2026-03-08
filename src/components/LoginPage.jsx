import { useState, useRef, useEffect } from 'react';
import { sendOTP, verifyOTP, updateUserName } from '../services/auth';
import { searchStocks, saveWatchlist } from '../services/api';
import Footer from './Footer';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const OTP_LENGTH = 4;

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [step, setStep] = useState('phone');   // 'phone' | 'otp' | 'name' | 'watchlist'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [verifyResult, setVerifyResult] = useState(null); // holds the result from verify-otp
  
  // Watchlist onboarding state
  const [watchlistQuery, setWatchlistQuery] = useState('');
  const [watchlistResults, setWatchlistResults] = useState([]);
  const [watchlistSearching, setWatchlistSearching] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [receiveAllUpdates, setReceiveAllUpdates] = useState(true);
  const [relianceStock, setRelianceStock] = useState(null);

  const otpRefs = useRef([]);
  const nameRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
    if (step === 'name' && nameRef.current) {
      nameRef.current.focus();
    }
  }, [step]);

  // ── Step 1: Send OTP ──
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

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    await handleSendOTP();
  };

  // ── Step 2: OTP input helpers ──
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

  // ── Step 2: Verify OTP ──
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
      if (result.is_new_user) {
        // New user → ask for name before proceeding
        setVerifyResult(result);
        setStep('name');
      } else {
        // Existing user → go straight to dashboard
        onLoginSuccess(result);
      }
    } catch (err) {
      setError(err.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Save name (new users only) ──
  const handleSaveName = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateUserName(name.trim());
      // Update the stored result with the name and proceed to watchlist onboarding
      const updatedResult = {
        ...verifyResult,
        user: { ...verifyResult.user, name: name.trim() },
      };
      setVerifyResult(updatedResult);
      setStep('watchlist'); // Go to watchlist onboarding step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Watchlist onboarding (new users only) ──
  useEffect(() => {
    if (step === 'watchlist' && !relianceStock && verifyResult?.token) {
      // Search for Reliance Industries Limited and auto-select it
      const searchReliance = async () => {
        try {
          const results = await searchStocks('Reliance Industries');
          // Find Reliance Industries Limited
          const reliance = results.find(
            (s) => s.company_name && 
            (s.company_name.toLowerCase().includes('reliance industries') || 
             s.company_name.toLowerCase().includes('reliance limited'))
          );
          if (reliance) {
            setRelianceStock(reliance);
            setSelectedStocks([reliance]);
          }
        } catch (err) {
          console.error('Failed to search Reliance:', err);
        }
      };
      searchReliance();
    }
  }, [step, relianceStock, verifyResult]);

  const handleWatchlistSearch = async (value) => {
    setWatchlistQuery(value);
    setError('');
    if (!value.trim()) {
      setWatchlistResults([]);
      setWatchlistSearching(false);
      return;
    }
    setWatchlistSearching(true);
    try {
      const results = await searchStocks(value);
      const selectedCodes = new Set(selectedStocks.map((s) => s.bse_scrip_code));
      setWatchlistResults(results.filter((r) => !selectedCodes.has(r.bse_scrip_code)));
    } catch {
      setWatchlistResults([]);
    } finally {
      setWatchlistSearching(false);
    }
  };

  const addStock = (stock) => {
    if (selectedStocks.length >= 15) {
      setError('Maximum 15 stocks allowed.');
      return;
    }
    if (selectedStocks.some((s) => s.bse_scrip_code === stock.bse_scrip_code)) return;
    setSelectedStocks((prev) => [...prev, stock]);
    setWatchlistQuery('');
    setWatchlistResults([]);
    setError('');
  };

  const removeStock = (code) => {
    setSelectedStocks((prev) => prev.filter((s) => s.bse_scrip_code !== code));
    setError('');
  };

  const handleSaveWatchlist = async () => {
    if (selectedStocks.length < 4) {
      setError('Please select at least 4 stocks to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveWatchlist(
        selectedStocks.map((s) => s.bse_scrip_code),
        receiveAllUpdates
      );
      // Proceed to dashboard
      const updatedResult = {
        ...verifyResult,
        user: { ...verifyResult.user, name: name.trim() },
      };
      onLoginSuccess(updatedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipWatchlist = () => {
    // Skip watchlist and proceed to dashboard
    const updatedResult = {
      ...verifyResult,
      user: { ...verifyResult.user, name: name.trim() },
    };
    onLoginSuccess(updatedResult);
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex flex-col">
      {/* Main login area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 mb-5 shadow-lg shadow-blue-500/20">
              <span className="text-xl font-black text-white">R</span>
            </div>
            <h1 className="text-[22px] font-bold text-gray-100 tracking-tight">Welcome to RITO</h1>
            <p className="text-sm text-gray-500 mt-1.5 font-light">AI Powered Live Market Updates</p>
          </div>

          {/* Card */}
          <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] p-7 shadow-2xl shadow-black/40">

            {/* ── Phone Step ── */}
            {step === 'phone' && (
              <form onSubmit={handleSendOTP}>
                <h2 className="text-[17px] font-semibold text-gray-200 mb-1 tracking-tight">Login with WhatsApp</h2>
                <p className="text-xs text-gray-500 mb-6 font-light">We'll send a verification code to your WhatsApp</p>

                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center h-11 px-3.5 bg-[#161b22] rounded-lg text-sm text-gray-400 border border-white/[0.06] font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="flex-1 h-11 px-3.5 bg-[#161b22] rounded-lg text-sm text-gray-100 placeholder-gray-600 border border-white/[0.06] outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {error && <p className="text-red-400/90 text-xs mb-3 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:shadow-none"
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

            {/* ── OTP Step ── */}
            {step === 'otp' && (
              <div>
                <button
                  onClick={() => { setStep('phone'); setOtp(Array(OTP_LENGTH).fill('')); setError(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Change number
                </button>

                <h2 className="text-[17px] font-semibold text-gray-200 mb-1 tracking-tight">Enter OTP</h2>
                <p className="text-xs text-gray-500 mb-6 font-light">
                  Code sent to <span className="text-gray-300 font-medium">+91 {phone}</span> on WhatsApp
                </p>

                <div className="flex justify-center gap-3 mb-5" onPaste={handleOtpPaste}>
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
                      className="w-12 h-14 text-center text-xl font-bold bg-[#161b22] text-gray-100 border border-white/[0.06] rounded-xl outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    />
                  ))}
                </div>

                {error && <p className="text-red-400/90 text-xs mb-3 text-center font-medium">{error}</p>}

                <button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:shadow-none"
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

                <div className="text-center mt-5">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-600">
                      Resend OTP in <span className="text-gray-400 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Didn't receive it? Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Name Step (new users only) ── */}
            {step === 'name' && (
              <form onSubmit={handleSaveName}>
                <h2 className="text-[17px] font-semibold text-gray-200 mb-1 tracking-tight">One last thing!</h2>
                <p className="text-xs text-gray-500 mb-6 font-light">Tell us your name so we can personalize your experience</p>

                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="w-full h-11 px-3.5 mb-5 bg-[#161b22] rounded-lg text-sm text-gray-100 placeholder-gray-600 border border-white/[0.06] outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  disabled={loading}
                  maxLength={100}
                />

                {error && <p className="text-red-400/90 text-xs mb-3 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue →'
                  )}
                </button>
              </form>
            )}

            {/* ── Watchlist Step (new users only, skippable) ── */}
            {step === 'watchlist' && (
              <div>
                <h2 className="text-[17px] font-semibold text-gray-200 mb-6 tracking-tight">Build Your Watchlist</h2>

                {/* Info box */}
                <div className="bg-blue-500/[0.08] border border-blue-500/20 rounded-xl px-4 py-3.5 mb-4 flex items-start gap-3 shadow-lg shadow-blue-500/5">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-200/90 leading-relaxed font-medium">
                    Select at least <span className="font-bold text-blue-300">4 stocks</span> for us to send personalized updates to you. <span className="font-semibold text-blue-300">Reliance Industries Limited</span> is pre-selected for you.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <div className="flex items-center bg-[#161b22] rounded-xl border border-white/[0.06] focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all">
                    <svg className="w-4 h-4 text-gray-600 ml-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by company name or NSE symbol..."
                      value={watchlistQuery}
                      onChange={(e) => handleWatchlistSearch(e.target.value)}
                      className="flex-1 h-11 px-3 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none"
                    />
                    {watchlistSearching && (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3" />
                    )}
                  </div>

                  {/* Dropdown */}
                  {watchlistResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-20 max-h-60 overflow-y-auto">
                      {watchlistResults.map((stock) => (
                        <button
                          key={stock.bse_scrip_code}
                          onClick={() => addStock(stock)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors text-left border-b border-white/[0.03] last:border-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-200 font-medium truncate">{stock.company_name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {stock.nse_symbol ? `NSE: ${stock.nse_symbol}` : `BSE: ${stock.bse_scrip_code}`}
                            </p>
                          </div>
                          <svg className="w-4 h-4 text-blue-400/60 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Counter */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">
                    Selected: <span className={`font-semibold ${selectedStocks.length >= 4 ? 'text-green-400/80' : 'text-yellow-400/80'}`}>
                      {selectedStocks.length}
                    </span> / 15
                  </span>
                  {selectedStocks.length > 0 && selectedStocks.length < 4 && (
                    <span className="text-[10px] text-yellow-500/70">
                      Need {4 - selectedStocks.length} more
                    </span>
                  )}
                </div>

                {/* Selected Stocks */}
                <div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
                  {selectedStocks.length === 0 ? (
                    <div className="bg-[#0d1117] rounded-xl border border-white/[0.04] flex items-center justify-center py-8">
                      <p className="text-xs text-gray-600 text-center">
                        Reliance Industries Limited will be added automatically...
                      </p>
                    </div>
                  ) : (
                    selectedStocks.map((stock) => (
                      <div
                        key={stock.bse_scrip_code}
                        className="flex items-center justify-between bg-[#0d1117] border border-white/[0.04] rounded-lg px-4 py-2.5 hover:border-white/[0.06] transition-colors"
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

                {/* Toggle */}
                <label className="flex items-start gap-3 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={receiveAllUpdates}
                    onChange={(e) => setReceiveAllUpdates(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#161b22] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
                  />
                  <div>
                    <p className="text-sm text-gray-200 font-medium">Get updates from all companies</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Receive WhatsApp alerts for all companies, not just your selected stocks
                    </p>
                  </div>
                </label>

                {error && <p className="text-red-400/90 text-xs mb-3 text-center font-medium">{error}</p>}

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleSaveWatchlist}
                    disabled={loading || selectedStocks.length < 4}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Continue to RITO →'
                    )}
                  </button>
                  <button
                    onClick={handleSkipWatchlist}
                    disabled={loading}
                    className="w-full h-10 text-gray-400 hover:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Skip this for now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-[10px] text-gray-600 mt-5">
            By logging in, you agree to RITO's{' '}
            <button onClick={() => onNavigate?.('terms')} className="text-gray-500 hover:text-gray-400 underline transition-colors">
              Terms of Service
            </button>{' '}
            &{' '}
            <button onClick={() => onNavigate?.('privacy')} className="text-gray-500 hover:text-gray-400 underline transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {/* About RITO Section */}
      <div className="border-t border-white/[0.03] bg-[#06080a]">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h2 className="text-base font-semibold text-gray-300 mb-4 text-center tracking-tight">About RITO</h2>
          <div className="text-sm text-gray-500 leading-relaxed space-y-4">
            <p>
              RITO levels the playing field for everyday investors by turning fast, complex market noise into clear,
              timely insight. We track real-time announcements and evolving narratives, then translate them into
              plain-English takeaways and news-driven news suggestions — so you don't surrender your edge to
              institutional timelines and tools.
            </p>
            <p>
              Instead of scattered headlines, you get the <span className="text-gray-400 font-medium">'story of the stock'</span>:
              what changed, why it matters, and where to dig deeper. Our approach centers on{' '}
              <span className="text-green-400/70 font-medium">Speed</span>,{' '}
              <span className="text-yellow-400/70 font-medium">Clarity</span> and{' '}
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

        <div className="px-6 pb-8">
          <Footer onNavigate={onNavigate} compact />
        </div>
      </div>
    </div>
  );
}
