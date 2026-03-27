import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, ChevronDown, X } from 'lucide-react';
import api from '../../services/api';
import COUNTRIES, { COUNTRY_GROUPS } from '../../data/countries';

// ── Country Picker Dropdown ───────────────────────────────────────────────────
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
        className="flex items-center gap-2 px-3 h-12 bg-white border border-[#E8E7E3] rounded-xl font-medium text-[#1A1A1A] hover:border-[#059669] transition-colors whitespace-nowrap text-sm"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-[#787774]">{selected.code}</span>
        <ChevronDown size={13} className={`text-[#AEACA8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#E8E7E3] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
          style={{ width: 320, maxHeight: 420 }}>
          {/* Search */}
          <div className="p-3 border-b border-[#E8E7E3]">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F7F6F3] rounded-lg border border-[#E8E7E3] outline-none focus:border-[#059669] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AEACA8]">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 330 }}>
            {filtered ? (
              filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#AEACA8]">No results for "{search}"</div>
              ) : (
                <div className="py-1">
                  {filtered.map(c => (
                    <CountryRow key={c.iso + c.code} country={c} selected={selected}
                      onSelect={() => { onSelect(c); setOpen(false); setSearch(''); }} />
                  ))}
                </div>
              )
            ) : (
              COUNTRY_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-[#AEACA8] uppercase tracking-widest">
                    {group.label}
                  </div>
                  {group.countries.map(c => (
                    <CountryRow key={c.iso + c.code} country={c} selected={selected}
                      onSelect={() => { onSelect(c); setOpen(false); }} />
                  ))}
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
    <button onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${isSelected ? 'bg-[#ECFDF5] text-[#059669]' : 'hover:bg-[#F7F6F3] text-[#1A1A1A]'}`}>
      <span className="text-base leading-none w-6 flex-shrink-0">{country.flag}</span>
      <span className="flex-1 font-medium">{country.name}</span>
      <span className={`text-xs flex-shrink-0 ${isSelected ? 'text-[#059669] font-semibold' : 'text-[#787774]'}`}>{country.code}</span>
    </button>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]); // India default
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
    } catch (err) {
      // Demo fallback
      const cleanPhone = phone.replace(/\D/g, '');
      navigate('/auth/otp', { state: { phone: cleanPhone, countryCode: country.code, countryFlag: country.flag, countryName: country.name } });
    } finally {
      setLoading(false);
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
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your business,<br />always in sync.
            </h1>
            <p className="text-white/70 mt-4 text-base leading-relaxed">
              Connect Tally Prime with your web portal and mobile app.<br />
              Real-time data, anywhere you are — India, UAE, or worldwide.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['🇮🇳 India', '🇦🇪 UAE', '🇸🇦 KSA', '🇶🇦 Qatar', '🇸🇬 Singapore', '🇬🇧 UK', '🌍 Worldwide'].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/15 rounded-full text-white/90 text-xs font-medium">{f}</span>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2025 TallyDekho. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base" style={{ background: '#059669' }}>T</div>
            <span className="font-semibold text-lg text-[#1A1A1A]">TallyDekho</span>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Welcome back</h2>
          <p className="text-sm text-[#787774] mb-8">Enter your WhatsApp number to get OTP</p>

          <div className="space-y-4">
            {/* Phone input with country picker */}
            <div>
              <label className="text-xs font-semibold text-[#787774] uppercase tracking-wider block mb-2">
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
                  className="flex-1 h-12 px-4 bg-white border border-[#E8E7E3] rounded-xl text-sm outline-none focus:border-[#059669] transition-all placeholder:text-[#AEACA8]"
                />
              </div>
              {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}

              {/* Show selected country */}
              {country && (
                <p className="text-xs text-[#AEACA8] mt-1.5">
                  {country.flag} {country.name} · {country.code}
                </p>
              )}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Phone size={15} /> Send OTP via WhatsApp</>
              )}
            </button>
          </div>

          <p className="text-xs text-[#AEACA8] text-center mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[#059669] cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#059669] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
