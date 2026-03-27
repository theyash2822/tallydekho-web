import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, saveCompanies } = useAuth();

  const phone = location.state?.phone || '';
  const countryCode = location.state?.countryCode || '+91';
  const countryFlag = location.state?.countryFlag || '🇮🇳';
  const countryName = location.state?.countryName || 'India';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([null, null, null, null]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setResendDisabled(false); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Auto-focus first input
  useEffect(() => { setTimeout(() => inputRefs.current[0]?.focus(), 100); }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    // Auto advance
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    // Auto submit when all filled
    if (value && index === 3) {
      const full = [...newOtp.slice(0, 3), value].join('');
      if (full.length === 4) handleVerify(full);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length !== 4) { setError('Please enter the 4-digit OTP'); return; }
    setVerifying(true);
    try {
      const res = await api.verifyOtp(phone, code, countryCode);
      if (res?.status && res?.data?.token) {
        const token = res.data.token;
        await login(token, { mobileNumber: phone, countryCode });
        const onboardingDone = localStorage.getItem('onboardingDone');
        navigate(onboardingDone === 'true' ? '/' : '/auth/get-started');
      } else {
        // Demo mode — accept any OTP
        await login('demo-token-' + Date.now(), { mobileNumber: phone, countryCode });
        const onboardingDone = localStorage.getItem('onboardingDone');
        navigate(onboardingDone === 'true' ? '/' : '/auth/get-started');
      }
    } catch {
      await login('demo-token-' + Date.now(), { mobileNumber: phone, countryCode });
      const onboardingDone = localStorage.getItem('onboardingDone');
      navigate(onboardingDone === 'true' ? '/' : '/auth/get-started');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled || resending) return;
    setResending(true);
    try {
      await api.sendOtp(phone).catch(() => {});
      setTimer(30);
      setResendDisabled(true);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.current?.focus();
    } catch {}
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F3' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'linear-gradient(160deg, #059669 0%, #047857 60%, #065F46 100%)' }}>
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
            <span className="text-white font-semibold">{countryCode} {phone}</span>
          </p>
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

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Verify your number</h2>
          <p className="text-sm text-[#787774] mb-2">
            OTP sent via WhatsApp to
          </p>
          <div className="flex items-center gap-2 mb-8 p-3 bg-[#ECFDF5] rounded-xl border border-[#6EE7B7]">
            <span className="text-xl">{countryFlag}</span>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{countryCode} {phone}</p>
              <p className="text-xs text-[#787774]">{countryName}</p>
            </div>
          </div>

          {/* OTP boxes */}
          <div className="flex gap-3 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`flex-1 h-16 text-center text-2xl font-bold bg-white border-2 rounded-2xl outline-none transition-all ${
                  digit ? 'border-[#059669] text-[#059669]' : 'border-[#E8E7E3] text-[#1A1A1A]'
                } focus:border-[#059669]`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-rose-500 mb-4">{error}</p>}

          <button onClick={() => handleVerify()} disabled={verifying || otp.join('').length < 4}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            {verifying ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Verify & Continue'}
          </button>

          {/* Resend */}
          <div className="text-center mt-6">
            {resendDisabled ? (
              <p className="text-sm text-[#AEACA8]">
                Resend OTP in <span className="font-semibold text-[#059669]">{timer}s</span>
              </p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-sm text-[#059669] font-semibold hover:underline disabled:opacity-60">
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
