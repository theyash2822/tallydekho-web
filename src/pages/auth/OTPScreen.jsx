import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, markPaired } = useAuth();

  const phone       = location.state?.phone       || '';
  const countryCode = location.state?.countryCode || '+91';
  const countryFlag = location.state?.countryFlag || '🇮🇳';
  const countryName = location.state?.countryName || 'India';

  const [otp, setOtp]                   = useState('');
  const [error, setError]               = useState('');
  const [verifying, setVerifying]       = useState(false);
  const [resending, setResending]       = useState(false);
  const [timer, setTimer]               = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (timer <= 0) { setResendDisabled(false); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleChange = e => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(val);
    setError('');
    if (val.length === 4) handleVerify(val);
  };

  const handlePaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    setOtp(pasted);
    setError('');
    if (pasted.length === 4) handleVerify(pasted);
  };

  const handleVerify = async code => {
    const otpCode = code || otp;
    if (otpCode.length !== 4) { setError('Please enter the 4-digit OTP'); return; }
    setVerifying(true);
    setError('');
    try {
      const res = await api.verifyOtp(phone, otpCode, countryCode);
      if (res?.status && res?.data?.token) {
        await login(res.data.token, { mobileNumber: phone, countryCode, name: res.data.user?.name });
        if (res.data.isPaired) markPaired();
        // Simple rule: backend says isNewUser (name not set) -> onboarding, else -> dashboard
        navigate(res.data.isNewUser ? '/auth/get-started' : '/');
      } else {
        // Wrong OTP - show error, do NOT login
        setError(res?.message || 'Invalid OTP. Please try again.');
        setOtp('');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      // API throws on non-2xx — extract the actual error message
      const msg = err?.data?.message || err?.message || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('expired')) {
        setError(msg);
        setOtp('');
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setError('Could not connect to server. Please check your internet connection.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled || resending) return;
    setResending(true);
    setOtp('');
    setError('');
    try { await api.sendOtp(phone, countryCode).catch(() => {}); } finally {
      setResending(false);
      setTimer(30);
      setResendDisabled(true);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F5F6]">

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 primary-gradient">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="text-white font-semibold tracking-tight">TallyDekho</span>
        </div>

        <div className="space-y-6">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
            <MessageCircle size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Check your<br />WhatsApp</h2>
            <p className="text-white/55 mt-3 text-sm leading-relaxed">
              We sent a 4-digit code to<br />
              <span className="text-white font-semibold">{countryFlag} {countryCode} {phone}</span>
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl border border-white/10">
            <p className="text-white/70 text-sm">💡 You can paste the OTP directly from your clipboard</p>
          </div>
        </div>

        <p className="text-white/25 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* ── Right — form ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C2B3A] mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h2 className="text-[22px] font-bold text-[#1C2B3A] mb-1 tracking-tight">Enter OTP</h2>
          <p className="text-sm text-[#6B7280] mb-7">
            Sent via WhatsApp to{' '}
            <span className="font-semibold text-[#1C2B3A]">{countryFlag} {countryCode} {phone}</span>
          </p>

          {/* OTP input */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest block mb-2">
              4-Digit OTP
            </label>
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder="· · · ·"
              className={`w-full h-16 text-center text-4xl font-bold bg-white border-2 rounded-2xl outline-none transition-all placeholder:text-[#D9DCE0] placeholder:text-3xl ${
                error
                  ? 'border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/10'
                  : otp.length === 4
                  ? 'border-[#3F5263]'
                  : 'border-[#D9DCE0] focus:border-[#3F5263] focus:ring-2 focus:ring-[#3F5263]/10'
              }`}
              style={{ letterSpacing: otp ? '0.6em' : 'normal' }}
            />
            {/* Progress */}
            <div className="flex justify-center gap-2 mt-3">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    i < otp.length ? 'w-8 bg-[#3F5263]' : 'w-4 bg-[#ECEEEF]'
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-[#C0392B] mt-2 text-center">{error}</p>}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={verifying || otp.length < 4}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-[#3F5263] text-white hover:bg-[#526373] active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {verifying
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : otp.length === 4
              ? <><ShieldCheck size={15} /> Verify & Sign In</>
              : 'Verify OTP'
            }
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {resendDisabled ? (
              <p className="text-sm text-[#9CA3AF]">
                Resend in <span className="font-semibold text-[#3F5263]">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-semibold text-[#3F5263] hover:underline underline-offset-2 disabled:opacity-50 transition-colors"
              >
                {resending ? 'Sending...' : '↩ Resend OTP'}
              </button>
            )}
          </div>

          <p className="text-xs text-[#9CA3AF] text-center mt-4">
            Didn't receive it? Check your WhatsApp or resend after {timer > 0 ? `${timer}s` : 'now'}
          </p>
        </div>
      </div>
    </div>
  );
}
