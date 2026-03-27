import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam',
];

export default function GetStarted() {
  const navigate = useNavigate();
  const { login, user, token } = useAuth();
  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState('English');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Please enter your full name';
    if (!language) e.language = 'Please select a language';
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
      // Mark onboarding done
      localStorage.setItem('onboardingDone', 'true');
      localStorage.setItem('authUser', JSON.stringify({ ...user, name: fullName.trim(), language }));
      navigate('/');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F3' }}>
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'linear-gradient(160deg,#059669 0%,#047857 60%,#065F46 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-base">T</div>
          <span className="text-white font-semibold text-lg">TallyDekho</span>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">One last step.</h1>
            <p className="text-white/70 mt-4 text-base leading-relaxed">
              Tell us your name and preferred language so we can personalise your experience.
            </p>
          </div>
          <div className="space-y-4">
            {['Your data stays private', 'Works with Tally Prime', 'Access from anywhere'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-white/80 flex-shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Welcome to TallyDekho</h2>
            <p className="text-sm text-[#787774] mt-1">Complete your profile to get started</p>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-[#787774] uppercase tracking-wider block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
                <input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
                  placeholder="Enter your full name"
                  className="w-full h-12 pl-9 pr-4 bg-white border border-[#E8E7E3] rounded-xl text-sm outline-none focus:border-[#059669] transition-all placeholder:text-[#AEACA8]"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-semibold text-[#787774] uppercase tracking-wider block mb-1.5">Preferred Language</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8] pointer-events-none" />
                <select
                  value={language}
                  onChange={e => { setLanguage(e.target.value); setErrors(p => ({ ...p, language: '' })); }}
                  className="w-full h-12 pl-9 pr-4 bg-white border border-[#E8E7E3] rounded-xl text-sm outline-none focus:border-[#059669] transition-all appearance-none text-[#1A1A1A]">
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              {errors.language && <p className="text-xs text-rose-500 mt-1">{errors.language}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => { setAgreed(p => !p); setErrors(prev => ({ ...prev, agreed: '' })); }}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${agreed ? 'border-[#059669]' : 'border-[#E8E7E3]'}`}
                  style={{ background: agreed ? '#059669' : 'white' }}>
                  {agreed && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className="text-xs text-[#787774] leading-relaxed">
                  I agree to the{' '}
                  <span className="text-[#059669] cursor-pointer hover:underline">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#059669] cursor-pointer hover:underline">Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-rose-500 mt-1">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Get Started <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
