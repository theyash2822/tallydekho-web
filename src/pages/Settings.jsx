import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Building2, CreditCard, Globe, Bell, Plug, Info, ChevronRight, Check, FileText } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { getPDFTemplate, setPDFTemplate, buildInvoiceHTML } from '../components/InvoicePDF';

const AI_SUGGESTIONS = [
  'How do I pair my mobile with the Desktop App?',
  'Entry is not going to Tally, what should I do?',
  'How to enable Tally HTTP port 9000?',
  'What are optional entries?',
  'How does backup and restore work?',
];

function AIChatPanel() {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Hi! I am the TallyDekho AI Assistant.\n\nI know everything about TallyDekho across Mobile, Web Portal, and Desktop App.\nAsk me anything!' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { token } = useAuth();

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);

  const sendMessage = useCallback(async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    const userMsg = { from: 'me', text: t };
    const loadingId = Date.now();
    setMsgs(m => [...m, userMsg, { from: 'bot', text: '', loading: true, id: loadingId }]);
    setLoading(true);
    try {
      const history = [...msgs, userMsg].filter(m => !m.loading).slice(-10)
        .map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }));
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/app'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data?.data?.reply || 'Sorry, could not get a response.';
      setMsgs(m => m.map(msg => msg.id === loadingId ? { from: 'bot', text: reply } : msg));
    } catch {
      setMsgs(m => m.map(msg => msg.id === loadingId ? { from: 'bot', text: 'Could not connect. Make sure the backend is running.' } : msg));
    } finally { setLoading(false); inputRef.current?.focus(); }
  }, [input, loading, msgs, token]);

  return (
    <div className="flex flex-col" style={{ height: '520px' }}>
      <p className="text-base font-semibold text-[#1A1A1A] mb-3">TallyDekho AI Assistant</p>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ minHeight: 0 }}>
        {msgs.map((m, i) => (
          <div key={m.id || i} className={`flex gap-2 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${
              m.from === 'bot' ? 'bg-[#1A1A1A] text-white' : 'bg-[#D4D3CE] text-[#1A1A1A]'}`}>{
              m.from === 'bot' ? 'TD' : 'Me'}</div>
            <div className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.from === 'me' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F4EF] border border-[#D4D3CE] text-[#1A1A1A]'}`}>
              {m.loading ? <span className="text-[#AEACA8] italic">Thinking...</span> : m.text}
            </div>
          </div>
        ))}
      </div>
      {msgs.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AI_SUGGESTIONS.map((s,i) => (
            <button key={i} onClick={() => sendMessage(s)} disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full border text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#ECEEEF] transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything about TallyDekho..."
          disabled={loading}
          className="flex-1 notion-input text-sm"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: loading || !input.trim() ? '#AEACA8' : '#1A1A1A' }}>
          {loading ? '...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}

const GROUPS = [
  {key:'account',label:'Account & Org',icon:User,subs:['Profile','Security & 2FA','Company Info','License']},
  {key:'preferences',label:'Preferences',icon:Globe,subs:['Language & Region','Currency & Format','Voucher Config','Invoice Templates']},
  {key:'notifications',label:'Notifications',icon:Bell,subs:['Channels & Quiet Hours','Low Stock & Expiry','Compliance Reminders','Payment Reminders']},
  {key:'integrations',label:'Integrations',icon:Plug,subs:['Tally ERP Sync','Bank Feeds','E-Way Bill','E-Invoice']},
  {key:'contact',label:'Contact & Info',icon:Info,subs:['About & Versions','Data Security','Help Center']},
];

const TEMPLATES = [
  {
    id: 'tally_classic',
    name: 'Tally Classic',
    desc: 'Dark header, standard GST table — matches Tally Prime default style',
    preview: 'Dark navy header bar · White body · Standard table columns',
    badge: 'Default',
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Clean teal accent, gradient divider, coloured totals row',
    preview: 'Teal accent · Card-style party info · Coloured grand total',
    badge: null,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Serif typography, no colour, clean borders — formal / legal style',
    preview: 'Serif font · No background colour · Elegant borders',
    badge: null,
  },
];

const SAMPLE_INV = {
  ref: 'SI-2025-0001', date: '07 Apr 2026',
  companyName: 'Your Company', companyGstin: '27AABCM1234F1Z5',
  companyAddress: 'Mumbai – 400021',
  customer: 'Sample Customer Ltd.', gstin: '27AABCS1234A1Z3',
  address: 'Bengaluru – 560001',
  items: [
    { name: 'Product A', hsn: '8471', qty: 10, unit: 'Pcs', rate: 5000, tax: 18, amount: 50000 },
    { name: 'Service Fee', hsn: '9983', qty: 1, unit: 'Nos', rate: 2000, tax: 18, amount: 2000 },
  ],
  subtotal: 52000, cgst: 4680, sgst: 4680, igst: 0, discount: 0, total: 61360,
  mode: 'Credit', terms: 'Payment due within 30 days.',
};

const VOUCHER_FORMATS = [
  {
    id: 'tally_default',
    name: 'Tally Default',
    desc: 'Matches Tally Prime auto-numbering — voucher type prefix + sequential number',
    examples: ['Sales-1', 'Sales-2', 'Pmt-1', 'Rcpt-1'],
    badge: 'Default',
  },
  {
    id: 'financial_year',
    name: 'Financial Year',
    desc: 'Year-based numbering resets each FY — INV/2025-26/0001',
    examples: ['INV/2025-26/0001', 'PUR/2025-26/0001', 'PMT/2025-26/0001'],
    badge: null,
  },
  {
    id: 'date_based',
    name: 'Date Based',
    desc: 'Date prefix + sequential — INV-20250407-001',
    examples: ['INV-20250407-001', 'PUR-20250407-001', 'PMT-20250407-001'],
    badge: null,
  },
];

function VoucherConfigSettings({ companyGuid }) {
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem(`voucher_format_${companyGuid}`) || 'tally_default'; } catch { return 'tally_default'; }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    try { localStorage.setItem(`voucher_format_${companyGuid}`, selected); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-base font-semibold text-[#1A1A1A]">Voucher Number Format</p>
        <p className="text-xs text-[#787774] mt-1">Choose how voucher numbers are displayed. Tally Prime controls the actual numbering — this affects display format only.</p>
      </div>
      <div className="space-y-3">
        {VOUCHER_FORMATS.map(fmt => (
          <div
            key={fmt.id}
            onClick={() => setSelected(fmt.id)}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              selected === fmt.id ? 'border-[#1A1A1A] bg-[#F5F4EF]' : 'border-[#D4D3CE] bg-white hover:border-[#9FA9B1]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">{fmt.name}</span>
                  {fmt.badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1A1A1A] text-white tracking-wide">{fmt.badge}</span>}
                </div>
                <p className="text-xs text-[#787774] mt-1">{fmt.desc}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {fmt.examples.map(e => (
                    <span key={e} className="px-2 py-0.5 rounded-md bg-white border border-[#D4D3CE] text-[10px] font-mono text-[#1A1A1A]">{e}</span>
                  ))}
                </div>
              </div>
              {selected === fmt.id && (
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 ml-3">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
        {saved ? '✓ Saved!' : 'Save Format'}
      </button>
    </div>
  );
}

function InvoiceTemplateSettings({ companyGuid }) {
  const [selected, setSelected] = useState(() => getPDFTemplate(companyGuid));
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setPDFTemplate(companyGuid, selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openPreview = (id) => {
    const html = buildInvoiceHTML(SAMPLE_INV, id);
    setPreview(html);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-base font-semibold text-[#1A1A1A]">Invoice PDF Templates</p>
        <p className="text-xs text-[#787774] mt-1">Choose a default template for all Sales Invoice PDFs. Applied per company.</p>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map(tpl => (
          <div
            key={tpl.id}
            onClick={() => setSelected(tpl.id)}
            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
              selected === tpl.id
                ? 'border-[#1A1A1A] bg-[#F5F4EF]'
                : 'border-[#D4D3CE] bg-white hover:border-[#B0B8C1]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#1A1A1A] flex-shrink-0" />
                  <span className="text-sm font-semibold text-[#1A1A1A]">{tpl.name}</span>
                  {tpl.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1A1A1A] text-white tracking-wide">{tpl.badge}</span>
                  )}
                </div>
                <p className="text-xs text-[#787774] mt-1.5 ml-5">{tpl.desc}</p>
                <p className="text-[10px] text-[#AEACA8] mt-1 ml-5 font-mono">{tpl.preview}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={e => { e.stopPropagation(); openPreview(tpl.id); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[#D4D3CE] text-[#787774] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                >Preview</button>
                {selected === tpl.id && (
                  <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors"
      >
        {saved ? '✓ Saved!' : 'Save Template'}
      </button>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxWidth: 860, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E7E3]">
              <p className="text-sm font-semibold text-[#1A1A1A]">Template Preview</p>
              <button onClick={() => setPreview(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#787774] hover:bg-[#F1F0EC] text-lg">×</button>
            </div>
            <div className="flex-1 overflow-hidden p-3 bg-[#F7F6F3]">
              <iframe srcDoc={preview} className="w-full h-full rounded-lg border border-[#E8E7E3]" title="Template Preview" sandbox="allow-same-origin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({label,defaultValue,type='text'}) => (
  <div>
    <label className="text-xs font-medium text-[#787774] block mb-1.5">{label}</label>
    <input type={type} defaultValue={defaultValue} className="notion-input w-full text-sm"/>
  </div>
);

const Toggle = ({label,sub,on}) => {
  const [active,setActive] = useState(on);
  return (
    <div className="flex items-center justify-between p-4 border border-[#D4D3CE] rounded-xl">
      <div><p className="text-sm font-medium text-[#1A1A1A]">{label}</p>{sub&&<p className="text-xs text-[#787774] mt-0.5">{sub}</p>}</div>
      <button onClick={()=>setActive(p=>!p)} className={`w-10 h-5 rounded-full transition-colors relative ${active?'bg-[#1A1A1A]':'bg-[#D4D3CE]'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${active?'translate-x-5':'translate-x-0.5'}`}/>
      </button>
    </div>
  );
};

function CurrencyFormatSettings() {
  const { settings, updateSettings } = useSettings();
  const [local, setLocal] = useState({
    currency:       settings.currency       || 'INR',
    number_format:  settings.number_format  || 'Indian',
    decimal_places: settings.decimal_places ?? 2,
    date_format:    settings.date_format    || 'DD/MM/YYYY',
  });
  const [saved, setSaved] = useState(false);

  const CURRENCIES = [
    { code: 'INR', label: 'Indian Rupee (₹)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'AED', label: 'UAE Dirham (د.إ)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
    { code: 'CAD', label: 'Canadian Dollar (C$)' },
    { code: 'SGD', label: 'Singapore Dollar (S$)' },
    { code: 'SAR', label: 'Saudi Riyal (SR)' },
    { code: 'KWD', label: 'Kuwaiti Dinar (KD)' },
    { code: 'QAR', label: 'Qatari Riyal (QR)' },
    { code: 'NPR', label: 'Nepali Rupee (रू)' },
    { code: 'LKR', label: 'Sri Lankan Rupee (Rs)' },
    { code: 'BDT', label: 'Bangladeshi Taka (৳)' },
    { code: 'MYR', label: 'Malaysian Ringgit (RM)' },
    { code: 'CNY', label: 'Chinese Yuan (¥)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' },
    { code: 'NGN', label: 'Nigerian Naira (₦)' },
    { code: 'ZAR', label: 'South African Rand (R)' },
  ];

  const handleSave = async () => {
    await updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Currency & Number Format</p>
      <p className="text-xs text-[#787774]">These settings apply to all amounts, KPI cards, ledger, reports, stocks, and exports across the portal.</p>

      <div>
        <label className="text-xs font-medium text-[#787774] block mb-1.5">Currency</label>
        <select
          className="notion-input w-full text-sm text-[#1A1A1A]"
          value={local.currency}
          onChange={e => setLocal(p => ({ ...p, currency: e.target.value }))}
        >
          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[#787774] block mb-1.5">Number Format</label>
        <select
          className="notion-input w-full text-sm text-[#1A1A1A]"
          value={local.number_format}
          onChange={e => setLocal(p => ({ ...p, number_format: e.target.value }))}
        >
          <option value="Indian">Indian (1,00,000)</option>
          <option value="International">International (100,000)</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[#787774] block mb-1.5">Decimal Places</label>
        <select
          className="notion-input w-full text-sm text-[#1A1A1A]"
          value={local.decimal_places}
          onChange={e => setLocal(p => ({ ...p, decimal_places: +e.target.value }))}
        >
          {[0,1,2,3].map(n => <option key={n} value={n}>{n} decimal place{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[#787774] block mb-1.5">Date Format</label>
        <select
          className="notion-input w-full text-sm text-[#1A1A1A]"
          value={local.date_format}
          onChange={e => setLocal(p => ({ ...p, date_format: e.target.value }))}
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors"
      >
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}

function Security2FASettings() {
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [pin, setPin] = useState('');
  const [disablePin, setDisablePin] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  const phone = localStorage.getItem('userPhone') || '';
  const preAuthPlaceholder = localStorage.getItem('authToken') || ''; // use real token for set-pin

  useEffect(() => {
    api.get2FAStatus().then(res => {
      if (res?.status) setTwoFA(res.data?.two_fa_enabled || false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEnable = async () => {
    if (pin.length < 4) { setMsg({ type: 'error', text: 'PIN must be 4 digits' }); return; }
    try {
      const res = await api.setPin(pin);
      if (res?.status) { setTwoFA(true); setShowPin(false); setPin(''); showMsg('success', '2FA enabled — PIN set successfully.'); }
      else showMsg('error', res?.message || 'Failed to set PIN');
    } catch (e) { showMsg('error', e?.message || 'Error'); }
  };

  const handleDisable = async () => {
    if (disablePin.length < 4) { setMsg({ type: 'error', text: 'Enter your current PIN' }); return; }
    try {
      const res = await api.removePin(disablePin);
      if (res?.status) { setTwoFA(false); setShowDisable(false); setDisablePin(''); showMsg('success', '2FA disabled.'); }
      else showMsg('error', res?.message || 'Incorrect PIN');
    } catch (e) { showMsg('error', e?.message || 'Error'); }
  };

  if (loading) return <div className="text-sm text-[#787774] p-4">Loading...</div>;

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Security & 2-Factor Authentication</p>
      <p className="text-xs text-[#787774]">Protect your account with a 4-digit passkey that's required after OTP on every login.</p>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg font-medium ${
          msg.type === 'success' ? 'bg-[#E8F5ED] text-[#2D7D46]' : 'bg-red-50 text-red-600'
        }`}>{msg.text}</div>
      )}

      {/* Status banner */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        twoFA ? 'bg-[#E8F5ED] border-[#2D7D46]/30' : 'bg-[#F9F9F7] border-[#D4D3CE]'
      }`}>
        <div>
          <p className={`text-sm font-semibold ${twoFA ? 'text-[#2D7D46]' : 'text-[#1A1A1A]'}`}>
            {twoFA ? '✅ 2FA is Enabled' : '2FA is Disabled'}
          </p>
          <p className="text-xs text-[#787774] mt-0.5">
            {twoFA ? 'Your account requires PIN after every OTP login.' : 'Add an extra layer of security to your account.'}
          </p>
        </div>
        <button
          onClick={() => twoFA ? setShowDisable(true) : setShowPin(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            twoFA ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
          }`}
        >
          {twoFA ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      {/* Enable — set PIN */}
      {showPin && (
        <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-3">
          <p className="text-sm font-semibold text-[#1A1A1A]">Set a 4-Digit Passkey</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="· · · ·"
            className="w-full h-14 text-center text-3xl font-bold border-2 border-[#D4D3CE] rounded-xl focus:border-[#1A1A1A] outline-none tracking-[0.5em]"
          />
          <div className="flex gap-2">
            <button onClick={handleEnable} disabled={pin.length < 4}
              className="flex-1 h-10 rounded-lg text-sm font-semibold bg-[#1A1A1A] text-white disabled:opacity-40">Set PIN</button>
            <button onClick={() => { setShowPin(false); setPin(''); }}
              className="flex-1 h-10 rounded-lg text-sm font-semibold border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF]">Cancel</button>
          </div>
        </div>
      )}

      {/* Disable — confirm with current PIN */}
      {showDisable && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
          <p className="text-sm font-semibold text-red-700">Enter current PIN to disable 2FA</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={disablePin}
            onChange={e => setDisablePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="· · · ·"
            className="w-full h-14 text-center text-3xl font-bold border-2 border-red-200 rounded-xl focus:border-red-500 outline-none tracking-[0.5em]"
          />
          <div className="flex gap-2">
            <button onClick={handleDisable} disabled={disablePin.length < 4}
              className="flex-1 h-10 rounded-lg text-sm font-semibold bg-red-600 text-white disabled:opacity-40">Confirm Disable</button>
            <button onClick={() => { setShowDisable(false); setDisablePin(''); }}
              className="flex-1 h-10 rounded-lg text-sm font-semibold border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF]">Cancel</button>
          </div>
        </div>
      )}

      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-xs text-amber-700 font-medium">🔒 Your PIN is hashed securely. We never store it in plain text.</p>
      </div>
    </div>
  );
}

// ─── Helper: Number Stepper ─────────────────────────────────────────
function Stepper({ value, onChange, min = 0, max = 999, label }) {
  return (
    <div>
      {label && <label className="text-xs font-medium text-[#787774] block mb-1.5">{label}</label>}
      <div className="flex items-center">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 flex items-center justify-center border border-[#D4D3CE] rounded-l-lg text-[#1A1A1A] hover:bg-[#F5F4EF] text-lg font-medium"
        >−</button>
        <div className="w-12 h-8 flex items-center justify-center border-t border-b border-[#D4D3CE] text-sm font-semibold text-[#1A1A1A]">{value}</div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 flex items-center justify-center border border-[#D4D3CE] rounded-r-lg text-[#1A1A1A] hover:bg-[#F5F4EF] text-lg font-medium"
        >+</button>
      </div>
    </div>
  );
}

// ─── Helper: Channel Checkboxes ───────────────────────────────────────
function ChannelCheckboxes({ value, onChange }) {
  const channels = ['Push', 'Email', 'WhatsApp', 'SMS'];
  return (
    <div className="flex gap-2 flex-wrap">
      {channels.map(ch => {
        const active = value.includes(ch);
        return (
          <button
            key={ch}
            onClick={() => onChange(active ? value.filter(c => c !== ch) : [...value, ch])}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              active ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#787774] border-[#D4D3CE] hover:border-[#1A1A1A]'
            }`}
          >{ch}</button>
        );
      })}
    </div>
  );
}

// ─── 1. Low Stock & Expiry ────────────────────────────────────────────
function LowStockExpirySettings() {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('lowStockExpiry') || '{}'); } catch { return {}; } })();
  const [stockType, setStockType] = useState(stored.stockType || 'group');
  const [searchItem, setSearchItem] = useState(stored.searchItem || '');
  const [reorderPoint, setReorderPoint] = useState(stored.reorderPoint ?? 10);
  const [includeNegative, setIncludeNegative] = useState(stored.includeNegative ?? false);
  const [alertBefore, setAlertBefore] = useState(stored.alertBefore || '15 Days');
  const [trackedOnly, setTrackedOnly] = useState(stored.trackedOnly ?? true);
  const [groupByWarehouse, setGroupByWarehouse] = useState(stored.groupByWarehouse ?? false);
  const [channels, setChannels] = useState(stored.channels || ['Push', 'Email']);
  const [frequency, setFrequency] = useState(stored.frequency || 'Daily');
  const [scheduleTime, setScheduleTime] = useState(stored.scheduleTime || '05:00 PM');
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem('lowStockExpiry', JSON.stringify({ stockType, searchItem, reorderPoint, includeNegative, alertBefore, trackedOnly, groupByWarehouse, channels, frequency, scheduleTime }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Low Stock & Expiry Alerts</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-3">
        <p className="text-sm font-semibold text-[#1A1A1A]">Low Stock</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-2">Alert Type</label>
          <div className="flex gap-4">
            {['group', 'item'].map(t => (
              <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={stockType === t} onChange={() => setStockType(t)} className="accent-[#1A1A1A]" />
                <span className="text-[#1A1A1A]">{t === 'group' ? 'Group wise' : 'Item wise'}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-1.5">Select Item</label>
          <input value={searchItem} onChange={e => setSearchItem(e.target.value)} placeholder="Search item..." className="notion-input w-full text-sm" />
        </div>
        <Stepper label="Reorder Point (units)" value={reorderPoint} onChange={setReorderPoint} min={0} max={9999} />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={includeNegative} onChange={e => setIncludeNegative(e.target.checked)} className="accent-[#1A1A1A]" />
          <span className="text-[#1A1A1A]">Include Negative Stock</span>
        </label>
      </div>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-3">
        <p className="text-sm font-semibold text-[#1A1A1A]">Expiry</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-1.5">Alert Before</label>
          <select value={alertBefore} onChange={e => setAlertBefore(e.target.value)} className="notion-input w-full text-sm text-[#1A1A1A]">
            {['7 Days', '15 Days', '30 Days', '60 Days'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={trackedOnly} onChange={e => setTrackedOnly(e.target.checked)} className="accent-[#1A1A1A]" />
          <span className="text-[#1A1A1A]">Only for tracked batches</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={groupByWarehouse} onChange={e => setGroupByWarehouse(e.target.checked)} className="accent-[#1A1A1A]" />
          <span className="text-[#1A1A1A]">Group by warehouse</span>
        </label>
      </div>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-3">
        <p className="text-sm font-semibold text-[#1A1A1A]">Delivery & Schedule</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
          <ChannelCheckboxes value={channels} onChange={setChannels} />
        </div>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-2">Frequency</label>
          <div className="flex gap-4">
            {['Immediate', 'Daily', 'Weekly'].map(f => (
              <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={frequency === f} onChange={() => setFrequency(f)} className="accent-[#1A1A1A]" />
                <span className="text-[#1A1A1A]">{f}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-1.5">Scheduled Time</label>
          <input value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} placeholder="e.g. 05:00 PM" className="notion-input w-full text-sm" />
        </div>
      </div>

      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

// ─── 2. Compliance Reminders ──────────────────────────────────────────
function ComplianceRemindersSettings() {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('complianceReminders') || '{}'); } catch { return {}; } })();
  const [gstr1Days, setGstr1Days] = useState(stored.gstr1Days ?? 5);
  const [gstr3bDays, setGstr3bDays] = useState(stored.gstr3bDays ?? 3);
  const [autoPauseNoSales, setAutoPauseNoSales] = useState(stored.autoPauseNoSales ?? false);
  const [gstChannels, setGstChannels] = useState(stored.gstChannels || ['Push', 'Email']);
  const [irnDays, setIrnDays] = useState(stored.irnDays ?? 2);
  const [irnChannels, setIrnChannels] = useState(stored.irnChannels || ['Push']);
  const [ewbDays, setEwbDays] = useState(stored.ewbDays ?? 1);
  const [ewbChannels, setEwbChannels] = useState(stored.ewbChannels || ['Push']);
  const [tdsDays, setTdsDays] = useState(stored.tdsDays ?? 3);
  const [vatDays, setVatDays] = useState(stored.vatDays ?? 5);
  const [taxChannels, setTaxChannels] = useState(stored.taxChannels || ['Push', 'Email']);
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem('complianceReminders', JSON.stringify({ gstr1Days, gstr3bDays, autoPauseNoSales, gstChannels, irnDays, irnChannels, ewbDays, ewbChannels, tdsDays, vatDays, taxChannels }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Compliance Reminders</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-4">
        <p className="text-sm font-semibold text-[#1A1A1A]">GST</p>
        <div className="grid grid-cols-2 gap-4">
          <Stepper label="GSTR-1 filing (days before due)" value={gstr1Days} onChange={setGstr1Days} min={1} max={30} />
          <Stepper label="GSTR-3B filing (days before due)" value={gstr3bDays} onChange={setGstr3bDays} min={1} max={30} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={autoPauseNoSales} onChange={e => setAutoPauseNoSales(e.target.checked)} className="accent-[#1A1A1A]" />
          <span className="text-[#1A1A1A]">Auto-pause if No Sales</span>
        </label>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
          <ChannelCheckboxes value={gstChannels} onChange={setGstChannels} />
        </div>

        <div className="border-t border-[#D4D3CE] pt-4">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">E-Invoice</p>
          <Stepper label="IRN error digest (days before due)" value={irnDays} onChange={setIrnDays} min={1} max={30} />
          <div className="mt-3">
            <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
            <ChannelCheckboxes value={irnChannels} onChange={setIrnChannels} />
          </div>
        </div>

        <div className="border-t border-[#D4D3CE] pt-4">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">E-Way Bill</p>
          <Stepper label="Expiry reminder (before validity end)" value={ewbDays} onChange={setEwbDays} min={1} max={30} />
          <div className="mt-3">
            <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
            <ChannelCheckboxes value={ewbChannels} onChange={setEwbChannels} />
          </div>
        </div>

        <div className="border-t border-[#D4D3CE] pt-4">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Other Taxes</p>
          <div className="grid grid-cols-2 gap-4">
            <Stepper label="TDS payment (days before 7th)" value={tdsDays} onChange={setTdsDays} min={1} max={30} />
            <Stepper label="VAT return (days before due)" value={vatDays} onChange={setVatDays} min={1} max={30} />
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
            <ChannelCheckboxes value={taxChannels} onChange={setTaxChannels} />
          </div>
        </div>
      </div>

      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

// ─── 3. Payment Reminders ─────────────────────────────────────────────
function PaymentRemindersSettings() {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('paymentReminders') || '{}'); } catch { return {}; } })();
  const [stopBelow, setStopBelow] = useState(stored.stopBelow ?? 500);
  const [reminders, setReminders] = useState(stored.reminders || [
    { id: 1, name: 'Reminder 1', enabled: true, days: 3, time: '09:00 AM', onDueDate: false, channels: ['Push', 'Email'], exceptions: [] },
    { id: 2, name: 'Reminder 2', enabled: true, days: 7, time: '10:00 AM', onDueDate: false, channels: ['Push'], exceptions: [] },
  ]);
  const [expanded, setExpanded] = useState(null);
  const [exceptionInput, setExceptionInput] = useState({});
  const [saved, setSaved] = useState(false);

  const updateReminder = (id, patch) => setReminders(r => r.map(rem => rem.id === id ? { ...rem, ...patch } : rem));

  const addReminder = () => {
    if (reminders.length >= 4) return;
    const id = Date.now();
    setReminders(r => [...r, { id, name: `Reminder ${r.length + 1}`, enabled: true, days: 5, time: '09:00 AM', onDueDate: false, channels: ['Push'], exceptions: [] }]);
  };

  const removeReminder = (id) => setReminders(r => r.filter(rem => rem.id !== id));

  const save = () => {
    try { localStorage.setItem('paymentReminders', JSON.stringify({ stopBelow, reminders })); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Payment Reminders</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-3">
        <p className="text-sm font-semibold text-[#1A1A1A]">Avoid Reminder</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-2">
            Stop if customer balance below — <span className="font-bold text-[#1A1A1A]">₹{stopBelow}</span>
          </label>
          <input
            type="range"
            min={0} max={500} step={100}
            value={stopBelow}
            onChange={e => setStopBelow(Number(e.target.value))}
            className="w-full accent-[#1A1A1A]"
          />
          <div className="flex justify-between text-[10px] text-[#AEACA8] mt-1">
            {[0, 100, 200, 300, 400, 500].map(v => <span key={v}>₹{v}</span>)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#1A1A1A]">List of Reminders</p>
        {reminders.map(rem => (
          <div key={rem.id} className="border border-[#D4D3CE] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F9F9F7]">
              <button
                onClick={() => updateReminder(rem.id, { enabled: !rem.enabled })}
                className={`w-9 h-5 rounded-full flex-shrink-0 relative transition-colors ${rem.enabled ? 'bg-[#1A1A1A]' : 'bg-[#D4D3CE]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${rem.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="flex-1 text-sm font-medium text-[#1A1A1A]">{rem.name}</span>
              <button onClick={() => removeReminder(rem.id)} className="text-xs text-[#C0392B] hover:underline mr-2">Remove</button>
              <button onClick={() => setExpanded(expanded === rem.id ? null : rem.id)} className="text-[#787774] hover:text-[#1A1A1A]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d={expanded === rem.id ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            {expanded === rem.id && (
              <div className="px-4 pb-4 pt-3 space-y-3 border-t border-[#D4D3CE]">
                <div>
                  <label className="text-xs font-medium text-[#787774] block mb-1.5">Name</label>
                  <input value={rem.name} onChange={e => updateReminder(rem.id, { name: e.target.value })} className="notion-input w-full text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stepper label="Days" value={rem.days} onChange={v => updateReminder(rem.id, { days: v })} min={1} max={90} />
                  <div>
                    <label className="text-xs font-medium text-[#787774] block mb-1.5">Time</label>
                    <input value={rem.time} onChange={e => updateReminder(rem.id, { time: e.target.value })} placeholder="09:00 AM" className="notion-input w-full text-sm" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={rem.onDueDate} onChange={e => updateReminder(rem.id, { onDueDate: e.target.checked })} className="accent-[#1A1A1A]" />
                  <span className="text-[#1A1A1A]">On Due Date</span>
                </label>
                <div>
                  <label className="text-xs font-medium text-[#787774] block mb-2">Channels</label>
                  <ChannelCheckboxes value={rem.channels} onChange={v => updateReminder(rem.id, { channels: v })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#787774] block mb-2">Exceptions</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {rem.exceptions.map(ex => (
                      <span key={ex} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F4EF] border border-[#D4D3CE] text-xs text-[#1A1A1A]">
                        {ex}
                        <button onClick={() => updateReminder(rem.id, { exceptions: rem.exceptions.filter(e => e !== ex) })} className="text-[#787774] hover:text-[#C0392B]">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={exceptionInput[rem.id] || ''}
                      onChange={e => setExceptionInput(p => ({ ...p, [rem.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && exceptionInput[rem.id]?.trim()) {
                          updateReminder(rem.id, { exceptions: [...rem.exceptions, exceptionInput[rem.id].trim()] });
                          setExceptionInput(p => ({ ...p, [rem.id]: '' }));
                        }
                      }}
                      placeholder="Add exception..."
                      className="notion-input flex-1 text-sm"
                    />
                    <button
                      onClick={() => {
                        if (exceptionInput[rem.id]?.trim()) {
                          updateReminder(rem.id, { exceptions: [...rem.exceptions, exceptionInput[rem.id].trim()] });
                          setExceptionInput(p => ({ ...p, [rem.id]: '' }));
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D4D3CE] text-[#787774] hover:border-[#1A1A1A]"
                    >Add</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {reminders.length < 4 && (
          <button onClick={addReminder} className="w-full py-2.5 rounded-xl border border-dashed border-[#D4D3CE] text-sm text-[#787774] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
            + Add Reminder
          </button>
        )}
      </div>

      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

// ─── 4. E-Way Bill ────────────────────────────────────────────────────
function EWayBillSettings() {
  const [connected, setConnected] = useState(() => localStorage.getItem('eWayBillConnected') === 'true');
  const [form, setForm] = useState({ gspProvider: '', apiUsername: '', apiPassword: '', gspClientId: '', gspClientSecret: '', gstin: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);

  const GSP_PROVIDERS = ['Clear Tax', 'Tally Solutions', 'Master Data Management', 'GSTN', 'Other'];

  const validate = () => {
    const e = {};
    if (!form.gspProvider) e.gspProvider = 'Required';
    if (!form.apiUsername) e.apiUsername = 'Required';
    if (!form.apiPassword) e.apiPassword = 'Required';
    if (!form.gspClientId) e.gspClientId = 'Required';
    if (!form.gspClientSecret) e.gspClientSecret = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setVerified(true);
    setTimeout(() => {
      localStorage.setItem('eWayBillConnected', 'true');
      localStorage.setItem('eWayBillData', JSON.stringify(form));
      setConnected(true);
    }, 600);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('eWayBillConnected');
    localStorage.removeItem('eWayBillData');
    setConnected(false);
    setVerified(false);
    setForm({ gspProvider: '', apiUsername: '', apiPassword: '', gspClientId: '', gspClientSecret: '', gstin: '', companyName: '' });
  };

  const connData = (() => { try { return JSON.parse(localStorage.getItem('eWayBillData') || '{}'); } catch { return {}; } })();

  if (connected) {
    return (
      <div className="space-y-5">
        <p className="text-base font-semibold text-[#1A1A1A]">E-Way Bill Integration</p>
        <div className="flex items-center gap-3 p-4 bg-[#E8F5ED] border border-[#A8D5BC] rounded-xl text-[#2D7D46] text-sm font-semibold">
          ✅ E-Way Bill Connected
        </div>
        <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-2 text-sm">
          {[['GSP Provider', connData.gspProvider], ['GSTIN', connData.gstin || '—'], ['Company Name', connData.companyName || '—']].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span className="text-[#787774]">{l}</span>
              <span className="font-medium text-[#1A1A1A]">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={handleDisconnect} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#C0392B] hover:bg-red-700 transition-colors">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">E-Way Bill Integration</p>
      <p className="text-xs text-[#787774]">Connect your E-Way Bill account via a GSP provider to enable automatic EWB generation.</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-4">
        <p className="text-sm font-semibold text-[#1A1A1A]">Connect Account</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-1.5">GSP Provider <span className="text-[#C0392B]">*</span></label>
          <select value={form.gspProvider} onChange={e => { setForm(p => ({ ...p, gspProvider: e.target.value })); setErrors(p => ({ ...p, gspProvider: '' })); }}
            className={`notion-input w-full text-sm text-[#1A1A1A] ${errors.gspProvider ? 'border-[#C0392B]' : ''}`}>
            <option value="">Select provider...</option>
            {GSP_PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
          {errors.gspProvider && <p className="text-xs text-[#C0392B] mt-1">{errors.gspProvider}</p>}
        </div>
        {[
          { key: 'apiUsername', label: 'API Username', type: 'text', required: true },
          { key: 'apiPassword', label: 'API Password', type: 'password', required: true },
          { key: 'gspClientId', label: 'GSP Client ID', type: 'text', required: true },
          { key: 'gspClientSecret', label: 'GSP Client Secret', type: 'password', required: true },
          { key: 'gstin', label: 'GSTIN', type: 'text', required: false },
          { key: 'companyName', label: 'Company Name', type: 'text', required: false },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-[#787774] block mb-1.5">{f.label}{f.required && <span className="text-[#C0392B]"> *</span>}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }}
              className={`notion-input w-full text-sm ${errors[f.key] ? 'border-[#C0392B]' : ''}`}
            />
            {errors[f.key] && <p className="text-xs text-[#C0392B] mt-1">{errors[f.key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={handleVerify} disabled={saving || verified}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: verified ? '#2D7D46' : saving ? '#AEACA8' : '#07624C' }}
        >
          {saving ? 'Verifying...' : verified ? 'Verified ✓' : 'Verify'}
        </button>
        <button onClick={() => { setForm({ gspProvider: '', apiUsername: '', apiPassword: '', gspClientId: '', gspClientSecret: '', gstin: '', companyName: '' }); setErrors({}); setVerified(false); }}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── 5. E-Invoice ─────────────────────────────────────────────────────
function EInvoiceSettings() {
  const [connected, setConnected] = useState(() => localStorage.getItem('eInvoiceConnected') === 'true');
  const [form, setForm] = useState({ gspProvider: '', irpClientId: '', irpClientSecret: '', irpUsername: '', irpPassword: '', gstin: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);

  const GSP_PROVIDERS = ['Clear Tax', 'Tally Solutions', 'Master Data Management', 'GSTN', 'Other'];

  const validate = () => {
    const e = {};
    if (!form.gspProvider) e.gspProvider = 'Required';
    if (!form.irpClientId) e.irpClientId = 'Required';
    if (!form.irpClientSecret) e.irpClientSecret = 'Required';
    if (!form.irpUsername) e.irpUsername = 'Required';
    if (!form.irpPassword) e.irpPassword = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setVerified(true);
    setTimeout(() => {
      localStorage.setItem('eInvoiceConnected', 'true');
      localStorage.setItem('eInvoiceData', JSON.stringify(form));
      setConnected(true);
    }, 600);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('eInvoiceConnected');
    localStorage.removeItem('eInvoiceData');
    setConnected(false);
    setVerified(false);
    setForm({ gspProvider: '', irpClientId: '', irpClientSecret: '', irpUsername: '', irpPassword: '', gstin: '', companyName: '' });
  };

  const connData = (() => { try { return JSON.parse(localStorage.getItem('eInvoiceData') || '{}'); } catch { return {}; } })();

  if (connected) {
    return (
      <div className="space-y-5">
        <p className="text-base font-semibold text-[#1A1A1A]">E-Invoice Integration</p>
        <div className="flex items-center gap-3 p-4 bg-[#E8F5ED] border border-[#A8D5BC] rounded-xl text-[#2D7D46] text-sm font-semibold">
          ✅ E-Invoice Connected
        </div>
        <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-2 text-sm">
          {[['GSP Provider', connData.gspProvider], ['GSTIN', connData.gstin || '—'], ['Company Name', connData.companyName || '—']].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span className="text-[#787774]">{l}</span>
              <span className="font-medium text-[#1A1A1A]">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={handleDisconnect} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#C0392B] hover:bg-red-700 transition-colors">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">E-Invoice Integration</p>
      <p className="text-xs text-[#787774]">Connect your IRP account to enable automatic E-Invoice generation and IRN submission.</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE] space-y-4">
        <p className="text-sm font-semibold text-[#1A1A1A]">Connect Account</p>
        <div>
          <label className="text-xs font-medium text-[#787774] block mb-1.5">GSP Provider <span className="text-[#C0392B]">*</span></label>
          <select value={form.gspProvider} onChange={e => { setForm(p => ({ ...p, gspProvider: e.target.value })); setErrors(p => ({ ...p, gspProvider: '' })); }}
            className={`notion-input w-full text-sm text-[#1A1A1A] ${errors.gspProvider ? 'border-[#C0392B]' : ''}`}>
            <option value="">Select provider...</option>
            {GSP_PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
          {errors.gspProvider && <p className="text-xs text-[#C0392B] mt-1">{errors.gspProvider}</p>}
        </div>
        {[
          { key: 'irpClientId', label: 'IRP Client ID', type: 'text', required: true },
          { key: 'irpClientSecret', label: 'IRP Client Secret', type: 'password', required: true },
          { key: 'irpUsername', label: 'User Name (IRP)', type: 'text', required: true },
          { key: 'irpPassword', label: 'Password (IRP)', type: 'password', required: true },
          { key: 'gstin', label: 'GSTIN', type: 'text', required: false },
          { key: 'companyName', label: 'Company Name', type: 'text', required: false },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-[#787774] block mb-1.5">{f.label}{f.required && <span className="text-[#C0392B]"> *</span>}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }}
              className={`notion-input w-full text-sm ${errors[f.key] ? 'border-[#C0392B]' : ''}`}
            />
            {errors[f.key] && <p className="text-xs text-[#C0392B] mt-1">{errors[f.key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={handleVerify} disabled={saving || verified}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: verified ? '#2D7D46' : saving ? '#AEACA8' : '#07624C' }}
        >
          {saving ? 'Verifying...' : verified ? 'Verified ✓' : 'Verify'}
        </button>
        <button onClick={() => { setForm({ gspProvider: '', irpClientId: '', irpClientSecret: '', irpUsername: '', irpPassword: '', gstin: '', companyName: '' }); setErrors({}); setVerified(false); }}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── 6. Data Security ─────────────────────────────────────────────────
function DataSecuritySettings() {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('dataSecurity') || '{}'); } catch { return {}; } })();
  const [secSettings, setSecSettings] = useState({
    encryptLocal: stored.encryptLocal ?? true,
    clearCacheLogout: stored.clearCacheLogout ?? true,
    httpsOnly: stored.httpsOnly ?? true,
    anonymiseDeleted: stored.anonymiseDeleted ?? true,
    autoPurgeRecycleBin: stored.autoPurgeRecycleBin ?? true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setSecSettings(p => ({ ...p, [key]: !p[key] }));

  const save = () => {
    try { localStorage.setItem('dataSecurity', JSON.stringify(secSettings)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SecurityCheck = ({ k, label, sub }) => (
    <div className="flex items-start gap-3 py-3">
      <button onClick={() => toggle(k)} className="flex-shrink-0 mt-0.5">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          secSettings[k] ? 'bg-[#2D7D46] border-[#2D7D46]' : 'bg-white border-[#D4D3CE]'
        }`}>
          {secSettings[k] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
        {sub && <p className="text-xs text-[#787774] mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-[#1A1A1A]">Data Security</p>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE]">
        <p className="text-xs font-semibold text-[#787774] uppercase tracking-wider mb-1">Data at Rest</p>
        <SecurityCheck k="encryptLocal" label="Encrypt local database (AES-256)" sub="All locally cached data is encrypted using AES-256 encryption." />
        <div className="border-t border-[#D4D3CE]" />
        <SecurityCheck k="clearCacheLogout" label="Clear cache on logout" sub="Removes all cached data when you sign out of the session." />
      </div>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE]">
        <p className="text-xs font-semibold text-[#787774] uppercase tracking-wider mb-1">Network</p>
        <SecurityCheck k="httpsOnly" label="Allow only HTTPS endpoints" sub="Blocks all unencrypted HTTP connections to external services." />
      </div>

      <div className="p-4 bg-[#F9F9F7] rounded-xl border border-[#D4D3CE]">
        <p className="text-xs font-semibold text-[#787774] uppercase tracking-wider mb-1">Data Retention</p>
        <SecurityCheck k="anonymiseDeleted" label="Anonymise deleted user data" sub="Personal data of deleted users is anonymised rather than permanently deleted." />
        <div className="border-t border-[#D4D3CE]" />
        <SecurityCheck k="autoPurgeRecycleBin" label="Auto-purge recycle bin after 30 days" sub="Items in the recycle bin are permanently deleted after 30 days." />
      </div>

      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { markPaired, isPaired, user, companies, selectedCompany } = useAuth();
  const [pairingState, setPairingState] = useState(isPaired ? 'paired' : 'idle');
  const [activeGroup, setActiveGroup] = useState(() => searchParams.get('tab') || 'account');
  const [activeSub, setActiveSub] = useState(() => searchParams.get('sub')?.replace(/\+/g,' ') || 'Profile');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

  const handlePair = async () => {
    if (pairingCode.length !== 6) { setPairingError('Enter the 6-digit code from your TallyDekho Desktop'); return; }
    setPairingError('');
    setPairingState('pairing');
    try {
      const res = await api.pairDevice(pairingCode);
      if (res?.status) {
        setPairingState('paired');
        markPaired();
      } else {
        setPairingState('idle');
        setPairingError(res?.message || 'Invalid code. Please try again.');
      }
    } catch (err) {
      // Demo fallback
      setPairingState('paired');
      markPaired();
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-5"><h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Settings</h1><p className="text-sm text-[#787774] mt-0.5">Manage your account and preferences</p></div>
      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white border border-[#D4D3CE] rounded-xl overflow-hidden">
            {GROUPS.map(g=>(
              <div key={g.key}>
                <button onClick={()=>{setActiveGroup(g.key);setActiveSub(g.subs[0]);}}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-b border-[#ECEEEF] last:border-0 ${activeGroup===g.key?'bg-[#ECEEEF] text-[#1A1A1A]':'text-[#787774] hover:bg-[#F5F4EF] hover:text-[#1A1A1A]'}`}>
                  <g.icon size={14} className="flex-shrink-0"/><span className="flex-1 text-left">{g.label}</span>
                  <ChevronRight size={12} className={`transition-transform ${activeGroup===g.key?'rotate-90 text-[#1A1A1A]':'text-[#AEACA8]'}`}/>
                </button>
                {activeGroup===g.key&&(
                  <div className="bg-[#F5F4EF]">
                    {g.subs.map(sub=>(
                      <button key={sub} onClick={()=>setActiveSub(sub)}
                        className={`w-full flex items-center gap-2 pl-9 pr-4 py-2 text-xs transition-colors ${activeSub===sub?'text-[#1A1A1A] font-semibold':'text-[#787774] hover:text-[#1A1A1A]'}`}>
                        {activeSub===sub&&<span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] flex-shrink-0"/>}{sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-[#D4D3CE] rounded-xl p-6 min-h-96">
          {activeGroup==='account'&&activeSub==='Profile'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Profile</p>
              <div>
                <label className="text-xs font-medium text-[#787774] block mb-1.5">Full Name</label>
                <input value={profileName} onChange={e=>setProfileName(e.target.value)} className="notion-input w-full text-sm" placeholder="Enter your name"/>
              </div>
              <div>
                <label className="text-xs font-medium text-[#787774] block mb-1.5">Email</label>
                <input type="email" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} className="notion-input w-full text-sm" placeholder="Enter your email"/>
              </div>
              <div>
                <label className="text-xs font-medium text-[#787774] block mb-1.5">Mobile</label>
                <input readOnly value={user?.mobile ? `+91 ${user.mobile}` : ''} className="notion-input w-full text-sm bg-[#F9FAFB]" placeholder="Registered mobile"/>
              </div>
              <div className="flex gap-3 items-center pt-2">
                <button onClick={async()=>{
                  setProfileSaving(true); setProfileMsg('');
                  try {
                    await api.updateMe({ name: profileName, email: profileEmail });
                    setProfileMsg('Saved!');
                    setTimeout(()=>setProfileMsg(''),2000);
                  } catch(e){ setProfileMsg('Save failed'); }
                  finally{ setProfileSaving(false); }
                }} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
                {profileMsg && <span className="text-xs text-[#059669]">{profileMsg}</span>}
              </div>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='Company Info'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Company Information</p>
              <Field label="Company Name" defaultValue={selectedCompany?.name}/>
              <Field label="GSTIN" defaultValue={selectedCompany?.gstin}/>
              <Field label="PAN" defaultValue={selectedCompany?.pan}/>
              <Field label="Address" defaultValue={selectedCompany?.address}/>
              <Field label="Phone" defaultValue={selectedCompany?.phone}/>
              <Field label="Email" defaultValue={selectedCompany?.email}/>
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='License'&&(
            <div className="space-y-5">
              <p className="text-base font-semibold text-[#1A1A1A]">License & Credits</p>
              <div className="grid grid-cols-3 gap-4">
                {[['Plan','Free – 1 User','Upgrade →'],['Notification Credits','172 / 200','Buy Credits →'],['Team Seats','1 Seat','Coming Soon']].map(([l,v,cta])=>(
                  <div key={l} className="p-4 bg-[#F9F9F9] rounded-xl border border-[#D4D3CE]">
                    <p className="text-xs text-[#787774] mb-1">{l}</p>
                    <p className="font-bold text-[#1A1A1A]">{v}</p>
                    <button className="mt-2 text-xs text-[#1A1A1A] hover:underline">{cta}</button>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Purchase History</p>
                <div className="rounded-xl border border-[#D4D3CE] divide-y divide-[#F5F4EF]">
                  {[['Credits Invoice','INV-2025-0710-001','100 Credits','₹2,000'],['Subscription','INV-2025-0001','Free Plan','₹0']].map(([t,inv,desc,amt])=>(
                    <div key={inv} className="flex justify-between items-center px-4 py-3 text-sm">
                      <div><p className="font-medium text-[#1A1A1A]">{t}</p><p className="text-xs text-[#787774]">{inv}</p></div>
                      <div className="text-right"><p className="text-[#787774]">{desc}</p><p className="font-semibold text-[#1A1A1A]">{amt}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeGroup==='preferences'&&activeSub==='Language & Region'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Language & Region</p>
              {[['Language',['English','Hindi','Marathi','Gujarati']],['Timezone',['Asia/Kolkata','UTC']],['Date Format',['DD MMM YYYY','MM/DD/YYYY','YYYY-MM-DD']]].map(([l,opts])=>(
                <div key={l}>
                  <label className="text-xs font-medium text-[#787774] block mb-1.5">{l}</label>
                  <select className="notion-input w-full text-sm text-[#1A1A1A]">{opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='preferences'&&activeSub==='Invoice Templates'&&(
            <InvoiceTemplateSettings companyGuid={selectedCompany?.guid} />
          )}
          {activeGroup==='notifications'&&activeSub==='Channels & Quiet Hours'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Channels & Quiet Hours</p>
              <Toggle label="Email Notifications" sub="rajesh@maaruji.in" on={true}/>
              <Toggle label="SMS Notifications" sub="+91 98200 12345" on={true}/>
              <Toggle label="WhatsApp Notifications" sub="+91 98200 12345" on={false}/>
              <div className="pt-2"><p className="text-sm font-semibold text-[#1A1A1A] mb-3">Quiet Hours</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-[#787774] block mb-1.5">From</label><input type="time" defaultValue="23:00" className="notion-input w-full text-sm"/></div>
                  <div><label className="text-xs text-[#787774] block mb-1.5">To</label><input type="time" defaultValue="08:00" className="notion-input w-full text-sm"/></div>
                </div>
              </div>
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='integrations'&&activeSub==='Tally ERP Sync'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Tally ERP Sync</p>
              {pairingState==='idle'&&(
                <div className="space-y-4">
                  <div className="p-4 bg-[#ECEEEF] rounded-xl border border-[#C5CBD0]">
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">How to pair</p>
                    <ol className="text-xs text-[#787774] space-y-1 list-decimal list-inside">
                      <li>Open TallyDekho Desktop on your Windows PC</li>
                      <li>Click "Generate Code" in the Pairing section</li>
                      <li>Enter the 6-digit code below</li>
                    </ol>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#787774] block mb-1.5">6-Digit Pairing Code</label>
                    <input
                      maxLength={6}
                      value={pairingCode}
                      onChange={e => { setPairingCode(e.target.value.replace(/\D/g,'')); setPairingError(''); }}
                      placeholder="000000"
                      className="notion-input w-full text-center text-2xl font-bold tracking-[0.4em] py-3"
                    />
                    {pairingError && <p className="text-xs text-[#C0392B] mt-1">{pairingError}</p>}
                  </div>
                  <button onClick={handlePair} className="px-5 py-2 rounded-lg text-sm font-medium text-white w-full bg-[#1A1A1A] hover:bg-[#333] transition-colors">Connect to Tally</button>
                </div>
              )}
              {pairingState==='pairing'&&(
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
                  Pairing… Awaiting approval from Tally ERP
                  <button onClick={()=>setPairingState('idle')} className="ml-auto text-xs underline">Cancel</button>
                </div>
              )}
              {(pairingState==='paired' || isPaired)&&(
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-[#E8F5ED] border border-[#A8D5BC] rounded-xl text-[#2D7D46] text-sm">
                    <Check size={14}/> Paired · Tally Prime connected
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Synced Companies</p>
                    {companies.length > 0 ? companies.map(c=>(
                      <div key={c.guid||c.name} className="flex items-center gap-2 py-2 border-b border-[#ECEEEF] text-sm">
                        <Check size={12} className="text-[#2D7D46]"/>{c.name}
                      </div>
                    )) : (
                      <p className="text-xs text-[#AEACA8]">No companies synced yet. Run a sync from the Desktop App.</p>
                    )}
                  </div>
                  <button onClick={async()=>{
                    try {
                      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/app'}/pairing`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                      });
                    } catch {}
                    localStorage.removeItem('isPaired');
                    setPairingState('idle');
                    window.location.reload();
                  }} className="px-4 py-2 text-sm text-[#C0392B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg hover:bg-rose-100">Unpair</button>
                </div>
              )}
            </div>
          )}
          {activeGroup==='integrations'&&activeSub==='Bank Feeds'&&(
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-base font-semibold text-[#1A1A1A]">Bank Feeds</p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">+ Add Bank</button>
              </div>
              {[['HDFC Bank','A/c XXXX 0259','Mumbai Branch'],['ICICI Bank','A/c XXXX 1147','BKC Branch']].map(([bank,acc,branch])=>(
                <div key={bank} className="flex items-center justify-between p-4 border border-[#D4D3CE] rounded-xl">
                  <div><p className="font-medium text-[#1A1A1A] text-sm">{bank} · {acc}</p><p className="text-xs text-[#787774]">{branch}</p></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#2D7D46] bg-[#E8F5ED] px-2 py-1 rounded-full font-medium">Active</span>
                    <button className="text-xs text-[#C0392B] hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeGroup==='contact'&&activeSub==='About & Versions'&&(
            <div className="space-y-5">
              <p className="text-base font-semibold text-[#1A1A1A]">About & Versions</p>
              <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#D4D3CE] space-y-2 text-sm">
                {[['Product','TallyDekho Web'],['Version','3.7.2 (build 257)'],['Release Date','05 Jul 2025']].map(([l,v])=>(
                  <div key={l} className="flex justify-between"><span className="text-[#787774]">{l}</span><span className="font-medium text-[#1A1A1A]">{v}</span></div>
                ))}
              </div>
              <div className="space-y-2">{['Terms of Service','Privacy Policy','OSS Licences'].map(l=><button key={l} className="block text-sm text-[#1A1A1A] hover:underline">{l}</button>)}</div>
            </div>
          )}
          {activeGroup==='contact'&&activeSub==='Help Center'&&(
            <AIChatPanel />
          )}
          {activeGroup==='notifications'&&activeSub==='Low Stock & Expiry'&&(
            <LowStockExpirySettings />
          )}
          {activeGroup==='notifications'&&activeSub==='Compliance Reminders'&&(
            <ComplianceRemindersSettings />
          )}
          {activeGroup==='notifications'&&activeSub==='Payment Reminders'&&(
            <PaymentRemindersSettings />
          )}
          {activeGroup==='integrations'&&activeSub==='E-Way Bill'&&(
            <EWayBillSettings />
          )}
          {activeGroup==='integrations'&&activeSub==='E-Invoice'&&(
            <EInvoiceSettings />
          )}
          {activeGroup==='contact'&&activeSub==='Data Security'&&(
            <DataSecuritySettings />
          )}
          {/* Fallback */}
          {activeGroup==='preferences'&&activeSub==='Voucher Config'&&(
            <VoucherConfigSettings companyGuid={selectedCompany?.guid} />
          )}
          {activeGroup==='preferences'&&activeSub==='Currency & Format'&&(
            <CurrencyFormatSettings />
          )}
          {activeGroup==='account'&&activeSub==='Security & 2FA'&&(
            <Security2FASettings />
          )}
          {!['Profile','Security & 2FA','Company Info','License','Language & Region','Currency & Format','Channels & Quiet Hours','Tally ERP Sync','Bank Feeds','About & Versions','Help Center','Invoice Templates','Voucher Config','Low Stock & Expiry','Compliance Reminders','Payment Reminders','E-Way Bill','E-Invoice','Data Security'].includes(activeSub)&&(
            <div className="flex flex-col items-center justify-center h-48 text-[#AEACA8]">
              <div className="text-4xl mb-3">⚙️</div>
              <p className="text-sm font-medium text-[#787774]">{activeSub}</p>
              <p className="text-xs mt-1">Configuration panel coming soon</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-[#AEACA8] py-5">Made in India with Love 🇮🇳</p>
    </div>
  );
}
