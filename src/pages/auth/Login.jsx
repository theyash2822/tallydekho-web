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
        className="flex items-center gap-2 px-3 h-11 bg-white border border-[#E8E7E3] rounded-xl text-sm font-medium text-[#1A1A1A] hover:border-[#AEACA8] transition-colors whitespace-nowrap"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-[#787774]">{selected.code}</span>
        <ChevronDown size={12} className={`text-[#AEACA8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#E8E7E3] rounded-2xl shadow-notion-lg z-50 overflow-hidden" style={{ width: 300, maxHeight: 400 }}>
          <div className="p-2.5 border-b border-[#EDEDEC]">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F7F6F3] rounded-lg border border-[#E8E7E3] outline-none focus:border-[#059669] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AEACA8] hover:text-[#787774]">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {filtered ? (
              filtered.length === 0
                ? <div className="text-center py-8 text-sm text-[#AEACA8]">No results for "{search}"</div>
                : <div className="py-1">{filtered.map(c => <CountryRow key={c.iso+c.code} country={c} selected={selected} onSelect={() => { onSelect(c); setOpen(false); setSearch(''); }} />)}</div>
            ) : (
              COUNTRY_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-[#AEACA8] uppercase tracking-widest">{group.label}</div>
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
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${isSelected ? 'bg-[#ECFDF5] text-[#059669] font-medium' : 'hover:bg-[#F7F6F3] text-[#1A1A1A]'}`}
    >
      <span className="text-base leading-none w-6 flex-shrink-0">{country.flag}</span>
      <span className="flex-1">{country.name}</span>
      <span className={`text-xs ${isSelected ? 'text-[#059669] font-semibold' : 'text-[#AEACA8]'}`}>{country.code}</span>
      {isSelected && <Check size={12} className="text-[#059669] flex-shrink-0" />}
    </button>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen flex" style={{ background: '#F7F6F3' }}>

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 brand-gradient">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="text-white font-semibold text-base tracking-tight">TallyDekho</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Your business,<br />always in sync.
            </h1>
            <p className="text-white/65 mt-4 text-sm leading-relaxed max-w-xs">
              Connect Tally Prime with your web portal and mobile app.
              Real-time data, anywhere you are.
            </p>
          </div>

          <div className="space-y-3">
            {['Live sync from Tally Prime', 'Sales, purchase & financial KPIs', 'Web, mobile & desktop access'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={9} className="text-white" />
                </div>
                <span className="text-white/65 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['🇮🇳 India', '🇦🇪 UAE', '🇸🇦 KSA', '🇸🇬 Singapore', '🌍 Worldwide'].map(f => (
              <span key={f} className="px-3 py-1 bg-white/15 rounded-full text-white/80 text-xs font-medium">{f}</span>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#059669] flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-semibold text-base text-[#1A1A1A] tracking-tight">TallyDekho</span>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1 tracking-tight">Welcome back</h2>
          <p className="text-sm text-[#787774] mb-8">Enter your WhatsApp number to sign in</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#787774] uppercase tracking-wider block mb-1.5">
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
                  className="flex-1 h-11 px-4 bg-white border border-[#E8E7E3] rounded-xl text-sm text-[#1A1A1A] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all placeholder:text-[#AEACA8]"
                />
              </div>
              {error && <p className="text-xs text-[#E5484D] mt-1.5">{error}</p>}
              {country && (
                <p className="text-xs text-[#AEACA8] mt-1.5">
                  {country.flag} {country.name} · {country.code}
                </p>
              )}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-[#059669] text-white hover:bg-[#047857] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Phone size={14} /> Send OTP via WhatsApp</>
              }
            </button>
          </div>

          <p className="text-xs text-[#AEACA8] text-center mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[#059669] cursor-pointer hover:underline underline-offset-2">Terms</span>
            {' '}and{' '}
            <span className="text-[#059669] cursor-pointer hover:underline underline-offset-2">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
