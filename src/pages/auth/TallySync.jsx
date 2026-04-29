import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, SkipForward, CheckCircle2, Loader2, Monitor, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const STEPS = ['prompt', 'input', 'syncing', 'done'];

export default function TallySyncScreen() {
  const navigate = useNavigate();
  const { markPaired, loadCompanies } = useAuth();

  const [step, setStep] = useState('prompt'); // prompt | input | syncing | done
  const [pairingCode, setPairingCode] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // ── Skip — go to dashboard without pairing ───────────────────────────────
  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  // ── Submit pairing code ───────────────────────────────────────────────────
  const handlePair = async () => {
    const code = pairingCode.trim();
    if (!code) { setError('Please enter your pairing code'); return; }

    setStep('syncing');
    setError('');
    setProgress(20);

    try {
      const res = await api.pairDevice(code);
      setProgress(70);

      if (res?.status && res?.data?.is_paired) {
        markPaired();
        await loadCompanies();
        setProgress(100);
        setStep('done');
        setTimeout(() => navigate('/', { replace: true }), 1200);
      } else {
        setError('Pairing failed. Check the code and try again.');
        setStep('input');
      }
    } catch (err) {
      setError(err?.message || 'Could not connect. Check your code and try again.');
      setStep('input');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePair();
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F4EF' }}>

      {/* ── Left panel (desktop only) ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 brand-gradient sticky top-0 h-screen">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="text-white font-semibold tracking-tight">TallyDekho</span>
        </div>

        <div className="space-y-8">
          {/* How it works */}
          <div className="space-y-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">How pairing works</p>
            {[
              { icon: Monitor, step: '1', text: 'Open the TallyDekho Desktop App on the same PC as Tally' },
              { icon: Zap, step: '2', text: 'Find the 6-digit pairing code in the app's Pairing Panel' },
              { icon: Smartphone, step: '3', text: 'Enter the code here — your data will sync automatically' },
            ].map(({ icon: Icon, step: s, text }) => (
              <div key={s} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-white" />
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-xs mb-1">Don't have the desktop app?</p>
            <p className="text-white text-sm font-medium">You can skip for now and pair later from <span className="underline underline-offset-2">Settings → Integrations</span></p>
          </div>
        </div>

        <p className="text-white/25 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-semibold text-[#1A1A1A]">TallyDekho</span>
          </div>

          {/* ── Prompt step ── */}
          {step === 'prompt' && (
            <div className="space-y-6 animate-fade-in">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#F0FBF4] flex items-center justify-center">
                <Zap size={26} className="text-[#2D7D46]" />
              </div>

              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight mb-2">
                  Sync with Tally?
                </h2>
                <p className="text-sm text-[#787774] leading-relaxed">
                  Connect TallyDekho to your Tally desktop to sync real financial data — invoices, ledgers, vouchers and more.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {['Real-time sync', 'Multi-company', 'Auto-refresh', 'Write-back to Tally'].map(f => (
                  <span key={f} className="px-3 py-1 bg-[#F5F4EF] rounded-full text-xs font-medium text-[#1A1A1A] border border-[#E9E8E3]">
                    {f}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('input')}
                  className="w-full h-12 rounded-xl text-sm font-semibold bg-[#1A1A1A] text-white hover:bg-[#333] active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
                >
                  <Zap size={16} />
                  Yes, sync with Tally
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full h-12 rounded-xl text-sm font-medium border border-[#E9E8E3] text-[#787774] hover:bg-[#F5F4EF] hover:text-[#1A1A1A] flex items-center justify-center gap-2 transition-all"
                >
                  <SkipForward size={15} />
                  Skip for now
                </button>
              </div>

              <p className="text-xs text-[#AEACA8] text-center">
                You can always connect Tally later from <strong className="text-[#787774]">Settings → Integrations</strong>
              </p>
            </div>
          )}

          {/* ── Input step ── */}
          {step === 'input' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight mb-2">
                  Enter your pairing code
                </h2>
                <p className="text-sm text-[#787774] leading-relaxed">
                  Open the TallyDekho Desktop App and find the 6-digit code in the Pairing Panel.
                </p>
              </div>

              {/* Code input */}
              <div>
                <label className="text-[11px] font-semibold text-[#AEACA8] uppercase tracking-widest block mb-1.5">
                  6-Digit Pairing Code
                </label>
                <input
                  autoFocus
                  value={pairingCode}
                  onChange={e => { setPairingCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`w-full h-14 px-4 bg-white border-2 rounded-xl text-xl font-mono font-bold tracking-[0.4em] text-center text-[#1A1A1A] outline-none transition-all placeholder:text-[#D4D3CE] placeholder:tracking-normal placeholder:text-base placeholder:font-normal ${
                    error
                      ? 'border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/10'
                      : pairingCode.length === 6
                      ? 'border-[#1A1A1A]'
                      : 'border-[#D4D3CE] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10'
                  }`}
                />
                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-200 ${i < pairingCode.length ? 'bg-[#1A1A1A]' : 'bg-[#E9E8E3]'}`} />
                  ))}
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-[#C0392B]">
                    <AlertCircle size={13} />
                    <p className="text-xs">{error}</p>
                  </div>
                )}
              </div>

              {/* Where to find code hint */}
              <div className="bg-[#F5F4EF] rounded-xl p-4 border border-[#E9E8E3] flex items-start gap-3">
                <Monitor size={16} className="text-[#787774] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A] mb-1">Where to find the code</p>
                  <p className="text-xs text-[#787774]">Open <strong>TallyDekho Desktop App</strong> → Look for the pairing code in the <strong>Devices</strong> or <strong>Pairing Panel</strong> section.</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePair}
                  disabled={pairingCode.length < 4}
                  className="w-full h-12 rounded-xl text-sm font-semibold bg-[#1A1A1A] text-white hover:bg-[#333] active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <Zap size={16} />
                  Connect to Tally
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => { setStep('prompt'); setError(''); setPairingCode(''); }}
                  className="w-full h-11 rounded-xl text-sm font-medium text-[#787774] hover:bg-[#F5F4EF] transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* ── Syncing step ── */}
          {step === 'syncing' && (
            <div className="space-y-8 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F0FBF4] flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-[#2D7D46] animate-spin" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight mb-2">Connecting to Tally...</h2>
                <p className="text-sm text-[#787774]">Verifying code and establishing connection</p>
              </div>
              {/* Progress bar */}
              <div>
                <div className="w-full h-2 bg-[#E9E8E3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A1A1A] rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-[#AEACA8] mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {/* ── Done step ── */}
          {step === 'done' && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F0FBF4] flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-[#2D7D46]" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight mb-2">
                  Tally Connected! 🎉
                </h2>
                <p className="text-sm text-[#787774]">Your Tally data is being synced. Taking you to your dashboard...</p>
              </div>
              <div className="flex justify-center">
                <div className="w-5 h-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
