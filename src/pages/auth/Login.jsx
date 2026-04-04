import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, ChevronDown, X, Check } from 'lucide-react';
import api from '../../services/api';
import COUNTRIES, { COUNTRY_GROUPS } from '../../data/countries';

// ── Country Picker ─────────────────────────────────────────────────────────────
function CountryPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 h-11 bg-white border border-[#D9DCE0] rounded-xl text-sm text-[#1C2B3A] hover:border-[#9FA9B1] transition-colors whitespace-nowrap"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-[#6B7280]">{selected.code}</span>
        <ChevronDown size={12} className={`text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#D9DCE0] rounded-2xl shadow-notion-lg z-50 overflow-hidden" style={{ width: 300, maxHeight: 400 }}>
          <div className="p-2.5 border-b border-[#ECEEEF]">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F4F5F6] rounded-lg border border-[#ECEEEF] outline-none focus:border-[#3F5263] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {filtered ? (
              filtered.length === 0
                ? <div className="text-center py-8 text-sm text-[#9CA3AF]">No results for "{search}"</div>
                : <div className="py-1">{filtered.map(c => <CountryRow key={c.iso+c.code} country={c} selected={selected} onSelect={() => { onSelect(c); setOpen(false); setSearch(''); }} />)}</div>
            ) : (
              COUNTRY_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{group.label}</div>
                  {group.countries.map(c => <CountryRow key={c.iso+c.code} country={c} selected={selected} onSelect={() => { onSelect(c); setOpen(false); }} />)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CountryRow({ country, selected, onSelect }) {
  const isSelected = selected.iso === country.iso && selected.code === country.code;
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
        isSelected ? 'bg-[#ECEEEF] text-[#3F5263] font-medium' : 'hover:bg-[#F4F5F6] text-[#1C2B3A]'
      }`}
    >
      <span className="text-base leading-none w-6 flex-shrink-0">{country.flag}</span>
      <span className="flex-1">{country.name}</span>
      <span className={`text-xs ${isSelected ? 'text-[#3F5263] font-semibold' : 'text-[#9CA3AF]'}`}>{country.code}</span>
      {isSelected && <Check size={12} className="text-[#3F5263] flex-shrink-0" />}
    </button>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phone.trim()) { setError('Please enter your WhatsApp number'); return; }
    if (phone.replace(/\D/g, '').length < country.digits) {
      setError(`Enter a valid ${country.digits}-digit number for ${country.name}`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await api.sendOtp(cleanPhone, country.code);
      navigate('/auth/otp', { state: { phone: cleanPhone, countryCode: country.code, countryFlag: country.flag, countryName: country.name } });
    } catch {
      const cleanPhone = phone.replace(/\D/g, '');
      navigate('/auth/otp', { state: { phone: cleanPhone, countryCode: country.code, countryFlag: country.flag, countryName: country.name } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F4EF' }}>

      {/* ── Left — brand panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 brand-gradient">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="text-white font-semibold tracking-tight">TallyDekho</span>
        </div>

        <div className="space-y-7">
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Business Intelligence Platform</p>
            <h1 className="text-[38px] font-bold text-white leading-tight tracking-tight">
              Your business,<br />always in sync.
            </h1>
            <p className="text-white/55 mt-4 text-sm leading-relaxed max-w-xs">
              Connect Tally Prime to your web portal and mobile app. Real-time data, anywhere you are.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Live sync from Tally Prime',
              'Sales, purchase & financial KPIs',
              'Web, mobile & desktop access',
              'India, UAE, KSA & worldwide',
            ].map(f => (
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

      {/* ── Right — form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#F5F4EF' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#3F5263] flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-semibold text-[#1C2B3A] tracking-tight">TallyDekho</span>
          </div>

          <h2 className="text-[22px] font-bold text-[#1C2B3A] mb-1 tracking-tight">Welcome back</h2>
          <p className="text-sm text-[#6B7280] mb-8">Enter your WhatsApp number to sign in</p>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">
                WhatsApp Number
              </label>
              <div className="flex gap-2">
                <CountryPicker selected={country} onSelect={c => { setCountry(c); setError(''); }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  placeholder={`${country.digits}-digit number`}
                  maxLength={country.digits}
                  className="flex-1 h-11 px-4 bg-white border border-[#D9DCE0] rounded-xl text-sm text-[#1C2B3A] outline-none focus:border-[#3F5263] focus:ring-2 focus:ring-[#3F5263]/10 transition-all placeholder:text-[#9CA3AF]"
                />
              </div>
              {error && <p className="text-xs text-[#C0392B] mt-1.5">{error}</p>}
              {country && (
                <p className="text-xs text-[#9CA3AF] mt-1.5">
                  {country.flag} {country.name} · {country.code}
                </p>
              )}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-[#1C2B3A] text-white hover:bg-[#333] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Phone size={14} /> Send OTP via WhatsApp</>
              }
            </button>
          </div>

          <p className="text-xs text-[#9CA3AF] text-center mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[#3F5263] cursor-pointer hover:underline underline-offset-2">Terms</span>
            {' '}and{' '}
            <span className="text-[#3F5263] cursor-pointer hover:underline underline-offset-2">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
