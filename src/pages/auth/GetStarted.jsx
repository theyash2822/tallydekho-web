import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam',
];

export default function GetStarted() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName]   = useState('');
  const [language, setLanguage]   = useState('English');
  const [agreed, setAgreed]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Please enter your full name';
    if (!agreed) e.agreed = 'Please accept the Terms of Service';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.submitOnboarding({ name: fullName.trim(), language });
    } catch { /* fallback */ } finally {
      localStorage.setItem('onboardingDone', 'true');
      localStorage.setItem('authUser', JSON.stringify({ ...user, name: fullName.trim(), language }));
      navigate('/');
      setSubmitting(false);
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

        <div className="space-y-7">
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Almost there</p>
            <h1 className="text-[38px] font-bold text-white leading-tight tracking-tight">One last step.</h1>
            <p className="text-white/55 mt-4 text-sm leading-relaxed max-w-xs">
              Tell us your name and preferred language so we can personalise your TallyDekho experience.
            </p>
          </div>

          <div className="space-y-3">
            {['Your data stays private', 'Works with Tally Prime', 'Access from web, mobile & desktop'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Check size={9} className="text-white" />
                </div>
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* ── Right — form ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#3F5263] flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-semibold text-[#1C2B3A] tracking-tight">TallyDekho</span>
          </div>

          <h2 className="text-[22px] font-bold text-[#1C2B3A] mb-1 tracking-tight">Complete your profile</h2>
          <p className="text-sm text-[#6B7280] mb-8">Just two things and you're ready to go</p>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
                  placeholder="Enter your full name"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full h-11 pl-9 pr-4 bg-white border border-[#D9DCE0] rounded-xl text-sm text-[#1C2B3A] outline-none focus:border-[#3F5263] focus:ring-2 focus:ring-[#3F5263]/10 transition-all placeholder:text-[#9CA3AF]"
                />
              </div>
              {errors.fullName && <p className="text-xs text-[#C0392B] mt-1">{errors.fullName}</p>}
            </div>

            {/* Language */}
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">
                Preferred Language
              </label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 bg-white border border-[#D9DCE0] rounded-xl text-sm text-[#1C2B3A] outline-none focus:border-[#3F5263] focus:ring-2 focus:ring-[#3F5263]/10 transition-all appearance-none cursor-pointer"
                >
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div
                  onClick={() => { setAgreed(p => !p); setErrors(prev => ({ ...prev, agreed: '' })); }}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    agreed ? 'bg-[#3F5263] border-[#3F5263]' : 'bg-white border-[#D9DCE0]'
                  }`}
                >
                  {agreed && <Check size={11} className="text-white" />}
                </div>
                <span className="text-xs text-[#6B7280] leading-relaxed">
                  I agree to the{' '}
                  <span className="text-[#3F5263] cursor-pointer hover:underline underline-offset-2">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#3F5263] cursor-pointer hover:underline underline-offset-2">Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-[#C0392B] mt-1">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-[#3F5263] text-white hover:bg-[#526373] active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Get Started <ArrowRight size={15} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
