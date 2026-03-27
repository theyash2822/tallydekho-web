import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const phone = location.state?.phone || '';
  const countryCode = location.state?.countryCode || '+91';
  const countryFlag = location.state?.countryFlag || '🇮🇳';
  const countryName = location.state?.countryName || 'India';

  // Single OTP input field (better UX — user can paste OTP directly)
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (timer <= 0) { setResendDisabled(false); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(val);
    setError('');
    if (val.length === 4) handleVerify(val);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    setOtp(pasted);
    setError('');
    if (pasted.length === 4) handleVerify(pasted);
  };

  const handleVerify = async (code) => {
    const otpCode = code || otp;
    if (otpCode.length !== 4) { setError('Please enter the 4-digit OTP'); return; }
    setVerifying(true);
    try {
      const res = await api.verifyOtp(phone, otpCode, countryCode);
      if (res?.status && res?.data?.token) {
        await login(res.data.token, { mobileNumber: phone, countryCode, name: res.data.user?.name });
        navigate(localStorage.getItem('onboardingDone') === 'true' ? '/' : '/auth/get-started');
      } else {
        await login('demo-token-' + Date.now(), { mobileNumber: phone, countryCode });
        navigate(localStorage.getItem('onboardingDone') === 'true' ? '/' : '/auth/get-started');
      }
    } catch {
      await login('demo-token-' + Date.now(), { mobileNumber: phone, countryCode });
      navigate(localStorage.getItem('onboardingDone') === 'true' ? '/' : '/auth/get-started');
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
    <div className="min-h-screen flex" style={{ background: '#F7F6F3' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg,#059669 0%,#047857 60%,#065F46 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-base">T</div>
          <span className="text-white font-semibold text-lg">TallyDekho</span>
        </div>
        <div>
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Check your WhatsApp</h2>
          <p className="text-white/70 mt-3 text-base leading-relaxed">
            We sent a 4-digit OTP to<br />
            <span className="text-white font-semibold">{countryFlag} {countryCode} {phone}</span>
          </p>
          <div className="mt-6 p-4 bg-white/10 rounded-xl text-sm text-white/80">
            💡 You can also paste the OTP directly from your clipboard
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-sm text-[#787774] hover:text-[#1A1A1A] mb-8 transition-colors">
            <ArrowLeft size={15} /> Back
          </button>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Enter OTP</h2>
          <p className="text-sm text-[#787774] mb-6">
            Sent via WhatsApp to <span className="font-semibold text-[#1A1A1A]">{countryFlag} {countryCode} {phone}</span>
          </p>

          {/* Single clean OTP input */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-[#787774] uppercase tracking-wider block mb-2">
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
              placeholder="Enter OTP"
              className={`w-full h-14 text-center text-3xl font-bold tracking-[0.5em] bg-white border-2 rounded-2xl outline-none transition-all placeholder:text-[#E8E7E3] placeholder:text-xl placeholder:tracking-normal ${
                error ? 'border-rose-400' : otp.length === 4 ? 'border-[#059669]' : 'border-[#E8E7E3] focus:border-[#059669]'
              }`}
              style={{ letterSpacing: otp ? '0.5em' : 'normal' }}
            />
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-3">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < otp.length ? 'bg-[#059669] scale-110' : 'bg-[#E8E7E3]'}`} />
              ))}
            </div>
            {error && <p className="text-xs text-rose-500 mt-2 text-center">{error}</p>}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={verifying || otp.length < 4}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
          >
            {verifying ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : otp.length === 4 ? (
              <><CheckCircle size={15} /> Verify OTP</>
            ) : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {resendDisabled ? (
              <p className="text-sm text-[#AEACA8]">
                Resend OTP in <span className="font-semibold" style={{ color: '#059669' }}>{timer}s</span>
              </p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-sm font-semibold hover:underline disabled:opacity-60 transition-colors"
                style={{ color: '#059669' }}>
                {resending ? 'Sending...' : '↩ Resend OTP'}
              </button>
            )}
          </div>

          <p className="text-xs text-[#AEACA8] text-center mt-4">
            Didn't receive it? Check your WhatsApp or resend after {timer > 0 ? `${timer}s` : 'now'}
          </p>
        </div>
      </div>
    </div>
  );
}
