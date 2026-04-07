import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, User, Globe, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam',
];

const ROLES = [
  { id: 'owner', icon: '🏢', label: 'Business Owner', desc: 'I own or manage a business' },
  { id: 'accountant', icon: '📊', label: 'Accountant / CA', desc: 'I manage accounts for clients' },
  { id: 'manager', icon: '👔', label: 'Manager / Staff', desc: 'I work in operations or finance' },
  { id: 'other', icon: '✨', label: 'Other', desc: 'Something else' },
];

const TOTAL_STEPS = 4;

export default function GetStarted() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.name || '');
  const [language, setLanguage] = useState('English');
  const [role, setRole] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const validate = () => {
    const e = {};
    if (step === 1 && !fullName.trim()) e.fullName = 'Please enter your full name';
    if (step === 3 && !role) e.role = 'Please select your role';
    if (step === 4 && !agreed) e.agreed = 'Please accept the Terms of Service';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) { setStep(s => s + 1); setErrors({}); }
    else handleSubmit();
  };

  const back = () => { if (step > 1) { setStep(s => s - 1); setErrors({}); } };

  const handleSubmit = async () => {
    if (!agreed) { setErrors({ agreed: 'Please accept Terms of Service' }); return; }
    setSubmitting(true);
    try {
      await api.submitOnboarding({ name: fullName.trim(), language });
    } catch { /* continue even if fails */ } finally {
      localStorage.setItem('onboardingDone', 'true');
      localStorage.setItem('authUser', JSON.stringify({ ...user, name: fullName.trim(), language }));
      navigate('/');
      setSubmitting(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen flex bg-[#F5F4EF]">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 primary-gradient sticky top-0 h-screen">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="text-white font-semibold tracking-tight">TallyDekho</span>
        </div>

        <div className="space-y-8">
          {/* Step indicators */}
          <div className="space-y-4">
            {[
              { n: 1, label: 'Your Name', icon: User },
              { n: 2, label: 'Language', icon: Globe },
              { n: 3, label: 'Your Role', icon: Briefcase },
              { n: 4, label: 'Get Started', icon: ShieldCheck },
            ].map(({ n, label, icon: Icon }) => (
              <div key={n} className={`flex items-center gap-3 transition-all duration-300 ${step >= n ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  step > n ? 'bg-white' : step === n ? 'bg-white/25 ring-2 ring-white' : 'bg-white/10'
                }`}>
                  {step > n
                    ? <Check size={14} className="text-[#3F5263]" />
                    : <Icon size={14} className="text-white" />
                  }
                </div>
                <span className={`text-sm font-medium ${step === n ? 'text-white' : 'text-white/70'}`}>{label}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-white/40 text-xs mb-2">Progress</p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/50 text-xs mt-1.5">Step {step} of {TOTAL_STEPS}</p>
          </div>
        </div>

        <p className="text-white/25 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#3F5263] flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-semibold text-[#1C2B3A]">TallyDekho</span>
          </div>

          {/* Mobile progress */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${i < step ? 'bg-[#3F5263]' : 'bg-[#E9E8E3]'}`} />
            ))}
          </div>

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Step 1 of {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">What's your name?</h2>
                <p className="text-sm text-[#6B7280] mt-1">We'll personalise TallyDekho for you</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    autoFocus
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setErrors({}); }}
                    onKeyDown={e => e.key === 'Enter' && next()}
                    placeholder="Enter your full name"
                    className="w-full h-12 pl-9 pr-4 bg-white border border-[#D9DCE0] rounded-xl text-sm text-[#1C2B3A] outline-none focus:border-[#3F5263] focus:ring-2 focus:ring-[#3F5263]/10 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-[#C0392B] mt-1.5">{errors.fullName}</p>}
              </div>
            </div>
          )}

          {/* ── Step 2: Language ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Step 2 of {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">Preferred language?</h2>
                <p className="text-sm text-[#6B7280] mt-1">Choose the language you're most comfortable with</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all border ${
                      language === l
                        ? 'bg-[#3F5263] text-white border-[#3F5263] shadow-sm'
                        : 'bg-white text-[#1C2B3A] border-[#D9DCE0] hover:border-[#3F5263] hover:bg-[#F5F4EF]'
                    }`}
                  >
                    {l}
                    {language === l && <Check size={12} className="inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Role ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Step 3 of {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">What's your role?</h2>
                <p className="text-sm text-[#6B7280] mt-1">Help us customise your experience</p>
              </div>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setErrors({}); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border ${
                      role === r.id
                        ? 'bg-[#F5F4EF] border-[#3F5263] ring-1 ring-[#3F5263]'
                        : 'bg-white border-[#D9DCE0] hover:border-[#3F5263] hover:bg-[#F9F9F7]'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C2B3A]">{r.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{r.desc}</p>
                    </div>
                    {role === r.id && (
                      <div className="w-5 h-5 rounded-full bg-[#3F5263] flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
                {errors.role && <p className="text-xs text-[#C0392B]">{errors.role}</p>}
              </div>
            </div>
          )}

          {/* ── Step 4: Terms ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Step 4 of {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">Almost there!</h2>
                <p className="text-sm text-[#6B7280] mt-1">Review and accept to start using TallyDekho</p>
              </div>

              {/* Summary card */}
              <div className="bg-[#F5F4EF] rounded-xl p-4 space-y-3 border border-[#E9E8E3]">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">Your Setup</p>
                {[
                  { label: 'Name', value: fullName },
                  { label: 'Language', value: language },
                  { label: 'Role', value: ROLES.find(r => r.id === role)?.label || 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-[#6B7280]">{label}</span>
                    <span className="text-sm font-medium text-[#1C2B3A]">{value}</span>
                  </div>
                ))}
              </div>

              {/* What's included */}
              <div className="space-y-2.5">
                {[
                  '✅ Real-time sync with Tally Prime',
                  '✅ Multi-company, multi-year support',
                  '✅ Data entry from web, mobile & desktop',
                  '✅ Your data never leaves your Tally',
                ].map(f => (
                  <p key={f} className="text-sm text-[#6B7280]">{f}</p>
                ))}
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => { setAgreed(p => !p); setErrors({}); }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      agreed ? 'bg-[#3F5263] border-[#3F5263]' : 'bg-white border-[#D9DCE0]'
                    }`}
                  >
                    {agreed && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-xs text-[#6B7280] leading-relaxed">
                    I agree to the{' '}
                    <span onClick={() => setShowTerms(true)} className="text-[#3F5263] cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span onClick={() => setShowPrivacy(true)} className="text-[#3F5263] cursor-pointer hover:underline">Privacy Policy</span>
                  </span>
                </label>
                {errors.agreed && <p className="text-xs text-[#C0392B] mt-1.5">{errors.agreed}</p>}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F5F4EF] transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={next}
              disabled={submitting}
              className="flex-1 h-11 rounded-xl text-sm font-semibold bg-[#3F5263] text-white hover:bg-[#526373] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : step === TOTAL_STEPS
                ? <><ShieldCheck size={15} /> Start Using TallyDekho</>
                : <>Continue <ArrowRight size={14} /></>
              }
            </button>
          </div>

          {/* Skip for returning users */}
          {step === 1 && user?.name && (
            <p className="text-center mt-4">
              <button onClick={() => navigate('/')} className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                Skip setup →
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1C2B3A] mb-4">Terms of Service</h3>
            <div className="text-sm text-[#6B7280] space-y-3">
              <p>By using TallyDekho, you agree to the following terms:</p>
              <p><strong className="text-[#1C2B3A]">1. Data Ownership:</strong> Your Tally data remains on your systems. TallyDekho only syncs data for display and entry purposes.</p>
              <p><strong className="text-[#1C2B3A]">2. Usage:</strong> TallyDekho is for legitimate business accounting purposes only.</p>
              <p><strong className="text-[#1C2B3A]">3. Account Security:</strong> You are responsible for maintaining the security of your account credentials.</p>
              <p><strong className="text-[#1C2B3A]">4. Service Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service.</p>
              <p><strong className="text-[#1C2B3A]">5. Updates:</strong> We may update these terms with notice to users.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="mt-6 w-full py-2.5 bg-[#3F5263] text-white rounded-xl text-sm font-semibold">Got it</button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1C2B3A] mb-4">Privacy Policy</h3>
            <div className="text-sm text-[#6B7280] space-y-3">
              <p>TallyDekho respects your privacy and is committed to protecting your data.</p>
              <p><strong className="text-[#1C2B3A]">Data We Collect:</strong> Mobile number (for authentication), name, language preference, and Tally data you sync.</p>
              <p><strong className="text-[#1C2B3A]">How We Use It:</strong> To provide the TallyDekho service — syncing, displaying, and allowing data entry for your Tally companies.</p>
              <p><strong className="text-[#1C2B3A]">Data Storage:</strong> Data is stored securely on encrypted servers. Your Tally data is never shared with third parties.</p>
              <p><strong className="text-[#1C2B3A]">Data Deletion:</strong> You can request deletion of your account and all associated data at any time.</p>
              <p><strong className="text-[#1C2B3A]">Contact:</strong> privacy@tallydekho.com</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="mt-6 w-full py-2.5 bg-[#3F5263] text-white rounded-xl text-sm font-semibold">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
