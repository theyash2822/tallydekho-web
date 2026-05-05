/**
 * PinModal — 2FA PIN entry for web portal
 * Used after OTP verification when 2FA is enabled.
 * Also supports 3-step Reset PIN flow (OTP → New PIN → Confirm).
 */
import { useState, useRef, useEffect } from 'react';
import { Lock, RotateCcw, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../services/api';

// ── Single PIN box ─────────────────────────────────────────────────────────
function PinBox({ value, focused, hasError }) {
  return (
    <div className={`
      w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all
      ${hasError    ? 'border-red-400 bg-red-50'
       : focused    ? 'border-[#1A1A1A] bg-white shadow-sm'
       : value      ? 'border-[#1A1A1A] bg-white'
       : 'border-[#D4D3CE] bg-[#F9F9F7]'}
    `}>
      {value
        ? <div className="w-3 h-3 rounded-full bg-[#1A1A1A]" />
        : focused
        ? <div className="w-0.5 h-5 bg-[#1A1A1A] animate-pulse" />
        : null
      }
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function PinModal({ visible, phone, preAuthToken, onSuccess, onCancel }) {
  const [mode, setMode]           = useState('verify'); // 'verify' | 'reset_otp' | 'new_pin' | 'confirm_pin'
  const [pin, setPin]             = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetOtp, setResetOtp]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resetPreAuth, setResetPreAuth] = useState('');
  const [show, setShow]           = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMode('verify'); setPin(''); setConfirmPin(''); setResetOtp('');
      setError(''); setLoading(false); setResetPreAuth(''); setShow(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

  useEffect(() => { if (visible) setTimeout(() => inputRef.current?.focus(), 100); }, [mode, visible]);

  if (!visible) return null;

  const current = mode === 'reset_otp' ? resetOtp
                : mode === 'confirm_pin' ? confirmPin
                : pin;

  const setCurrent = mode === 'reset_otp' ? setResetOtp
                   : mode === 'confirm_pin' ? setConfirmPin
                   : setPin;

  const isOtpMode   = mode === 'reset_otp';
  const isSecure    = !isOtpMode;
  const maxLen      = 4;

  const handleInput = e => {
    const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setCurrent(val);
    setError('');
    if (val.length === maxLen) setTimeout(() => handleNext(val), 50);
  };

  const handleNext = async (val) => {
    const code = val || current;
    if (code.length < maxLen) { setError(`Enter all ${maxLen} digits`); return; }
    setLoading(true); setError('');

    try {
      if (mode === 'verify') {
        const res = await api.verifyPin(code, preAuthToken);
        if (res?.status && res?.data?.token) {
          onSuccess(res.data);
        } else {
          setPin('');
          setError(res?.message || 'Incorrect PIN. Try again.');
          setTimeout(() => inputRef.current?.focus(), 100);
        }

      } else if (mode === 'reset_otp') {
        // Verify OTP with reset_pin=true
        const res = await api.verifyOtp(phone, code, '+91', { reset_pin: true });
        if (res?.status) {
          const token = res.data?.pre_auth_token || res.data?.token || '';
          if (!token) throw new Error('Could not verify OTP');
          setResetPreAuth(token);
          setResetOtp('');
          setMode('new_pin');
        } else {
          setResetOtp('');
          setError(res?.message || 'Invalid OTP');
        }

      } else if (mode === 'new_pin') {
        setMode('confirm_pin');

      } else if (mode === 'confirm_pin') {
        if (pin !== code) {
          setConfirmPin('');
          setError("PINs don't match. Try again.");
          setTimeout(() => inputRef.current?.focus(), 100);
          return;
        }
        const res = await api.resetPin(pin, resetPreAuth);
        if (res?.status && res?.data?.token) {
          onSuccess(res.data);
        } else {
          throw new Error(res?.message || 'Reset failed');
        }
      }
    } catch (err) {
      setCurrent('');
      setError(err?.message || 'Something went wrong. Try again.');
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally { setLoading(false); }
  };

  const startForgotPin = async () => {
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setMode('reset_otp');
      setPin(''); setConfirmPin(''); setResetOtp(''); setError('');
    } catch { setError('Could not send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const titles = {
    verify:      { icon: Lock,       heading: 'Enter your Passkey',    sub: `4-digit security PIN` },
    reset_otp:   { icon: RotateCcw,  heading: 'Verify Identity',        sub: `OTP sent to WhatsApp: ${phone}` },
    new_pin:     { icon: Lock,       heading: 'Set New Passkey',        sub: 'Enter a new 4-digit PIN' },
    confirm_pin: { icon: Lock,       heading: 'Confirm New Passkey',    sub: 'Re-enter your new PIN' },
  };
  const { icon: Icon, heading, sub } = titles[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={mode === 'verify' ? onCancel : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 z-10">

        {/* Back button (reset flow) */}
        {mode !== 'verify' && (
          <button
            onClick={() => { setMode('verify'); setPin(''); setResetOtp(''); setConfirmPin(''); setError(''); }}
            className="absolute top-4 left-4 p-2 text-[#787774] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F4EF] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-3">
            <Icon size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] text-center">{heading}</h2>
          <p className="text-sm text-[#787774] text-center mt-1">{sub}</p>
        </div>

        {/* PIN boxes (visual) */}
        <div className="flex justify-center gap-3 mb-4">
          {Array.from({ length: maxLen }).map((_, i) => (
            <PinBox
              key={i}
              value={current.length > i ? current[i] : ''}
              focused={current.length === i}
              hasError={!!error}
            />
          ))}
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type={isSecure && !show ? 'password' : 'tel'}
          inputMode="numeric"
          maxLength={maxLen}
          value={current}
          onChange={handleInput}
          className="opacity-0 absolute w-0 h-0"
          autoFocus
        />

        {/* Tap-to-focus */}
        <button
          className="w-full h-12 rounded-xl border-2 border-dashed border-[#D4D3CE] text-sm text-[#787774] mb-4 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          Tap here to enter PIN
        </button>

        {error && (
          <p className="text-xs text-red-500 text-center mb-3 font-medium">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={() => handleNext()}
          disabled={current.length < maxLen || loading}
          className="w-full h-11 rounded-xl text-sm font-semibold bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mb-3"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : mode === 'verify' ? 'Verify PIN'
            : mode === 'reset_otp' ? 'Verify OTP'
            : mode === 'new_pin' ? 'Continue'
            : 'Set New PIN'
          }
        </button>

        {/* Forgot PIN */}
        {mode === 'verify' && (
          <button
            onClick={startForgotPin}
            disabled={loading}
            className="w-full text-sm text-[#787774] hover:text-[#1A1A1A] text-center py-1 transition-colors"
          >
            Forgot PIN? Reset via WhatsApp OTP
          </button>
        )}

        {/* Step indicator (reset flow) */}
        {mode !== 'verify' && (
          <div className="flex justify-center gap-2 mt-3">
            {['reset_otp', 'new_pin', 'confirm_pin'].map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${
                s === mode ? 'w-6 bg-[#1A1A1A]'
                : ['reset_otp','new_pin','confirm_pin'].indexOf(mode) > i ? 'w-3 bg-[#2D7D46]'
                : 'w-3 bg-[#D4D3CE]'
              }`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
