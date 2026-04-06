import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Building2, CreditCard, Globe, Bell, Plug, Info, ChevronRight, Check } from 'lucide-react';
import { company } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
      <p className="text-base font-semibold text-[#1C2B3A] mb-3">TallyDekho AI Assistant</p>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ minHeight: 0 }}>
        {msgs.map((m, i) => (
          <div key={m.id || i} className={`flex gap-2 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${
              m.from === 'bot' ? 'bg-[#3F5263] text-white' : 'bg-[#D9DCE0] text-[#1C2B3A]'}`}>{
              m.from === 'bot' ? 'TD' : 'Me'}</div>
            <div className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.from === 'me' ? 'bg-[#3F5263] text-white' : 'bg-[#F4F5F6] border border-[#D9DCE0] text-[#1C2B3A]'}`}>
              {m.loading ? <span className="text-[#9CA3AF] italic">Thinking...</span> : m.text}
            </div>
          </div>
        ))}
      </div>
      {msgs.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AI_SUGGESTIONS.map((s,i) => (
            <button key={i} onClick={() => sendMessage(s)} disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full border text-[#3F5263] border-[#3F5263] hover:bg-[#ECEEEF] transition-colors">
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
          style={{ background: loading || !input.trim() ? '#9CA3AF' : '#3F5263' }}>
          {loading ? '...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}

const GROUPS = [
  {key:'account',label:'Account & Org',icon:User,subs:['Profile','Company Info','License']},
  {key:'preferences',label:'Preferences',icon:Globe,subs:['Language & Region','Currency & Format','Voucher Config']},
  {key:'notifications',label:'Notifications',icon:Bell,subs:['Channels & Quiet Hours','Low Stock & Expiry','Compliance Reminders','Payment Reminders']},
  {key:'integrations',label:'Integrations',icon:Plug,subs:['Tally ERP Sync','Bank Feeds','E-Way Bill','E-Invoice']},
  {key:'contact',label:'Contact & Info',icon:Info,subs:['About & Versions','Data Security','Help Center']},
];

const Field = ({label,defaultValue,type='text'}) => (
  <div>
    <label className="text-xs font-medium text-[#6B7280] block mb-1.5">{label}</label>
    <input type={type} defaultValue={defaultValue} className="notion-input w-full text-sm"/>
  </div>
);

const Toggle = ({label,sub,on}) => {
  const [active,setActive] = useState(on);
  return (
    <div className="flex items-center justify-between p-4 border border-[#D9DCE0] rounded-xl">
      <div><p className="text-sm font-medium text-[#1C2B3A]">{label}</p>{sub&&<p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}</div>
      <button onClick={()=>setActive(p=>!p)} className={`w-10 h-5 rounded-full transition-colors relative ${active?'bg-[#3F5263]':'bg-[#D9DCE0]'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${active?'translate-x-5':'translate-x-0.5'}`}/>
      </button>
    </div>
  );
};

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { markPaired, isPaired, user, setUser, companies } = useAuth();
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
      <div className="mb-5"><h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Settings</h1><p className="text-sm text-[#6B7280] mt-0.5">Manage your account and preferences</p></div>
      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden">
            {GROUPS.map(g=>(
              <div key={g.key}>
                <button onClick={()=>{setActiveGroup(g.key);setActiveSub(g.subs[0]);}}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-b border-[#ECEEEF] last:border-0 ${activeGroup===g.key?'bg-[#ECEEEF] text-[#3F5263]':'text-[#6B7280] hover:bg-[#F4F5F6] hover:text-[#1C2B3A]'}`}>
                  <g.icon size={14} className="flex-shrink-0"/><span className="flex-1 text-left">{g.label}</span>
                  <ChevronRight size={12} className={`transition-transform ${activeGroup===g.key?'rotate-90 text-[#3F5263]':'text-[#9CA3AF]'}`}/>
                </button>
                {activeGroup===g.key&&(
                  <div className="bg-[#F4F5F6]">
                    {g.subs.map(sub=>(
                      <button key={sub} onClick={()=>setActiveSub(sub)}
                        className={`w-full flex items-center gap-2 pl-9 pr-4 py-2 text-xs transition-colors ${activeSub===sub?'text-[#3F5263] font-semibold':'text-[#6B7280] hover:text-[#1C2B3A]'}`}>
                        {activeSub===sub&&<span className="w-1.5 h-1.5 rounded-full bg-[#3F5263] flex-shrink-0"/>}{sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-[#D9DCE0] rounded-xl p-6 min-h-96">
          {activeGroup==='account'&&activeSub==='Profile'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1C2B3A]">Profile</p>
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Full Name</label>
                <input value={profileName} onChange={e=>setProfileName(e.target.value)} className="notion-input w-full text-sm" placeholder="Enter your name"/>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Email</label>
                <input type="email" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} className="notion-input w-full text-sm" placeholder="Enter your email"/>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Mobile</label>
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
                }} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
                {profileMsg && <span className="text-xs text-[#059669]">{profileMsg}</span>}
              </div>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='Company Info'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1C2B3A]">Company Information</p>
              <Field label="Company Name" defaultValue={company.name}/>
              <Field label="GSTIN" defaultValue={company.gstin}/>
              <Field label="PAN" defaultValue={company.pan}/>
              <Field label="Address" defaultValue={company.address}/>
              <Field label="Phone" defaultValue={company.phone}/>
              <Field label="Email" defaultValue={company.email}/>
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='License'&&(
            <div className="space-y-5">
              <p className="text-base font-semibold text-[#1C2B3A]">License & Credits</p>
              <div className="grid grid-cols-3 gap-4">
                {[['Plan','Free – 1 User','Upgrade →'],['Notification Credits','172 / 200','Buy Credits →'],['Team Seats','1 Seat','Coming Soon']].map(([l,v,cta])=>(
                  <div key={l} className="p-4 bg-[#F9F9F9] rounded-xl border border-[#D9DCE0]">
                    <p className="text-xs text-[#6B7280] mb-1">{l}</p>
                    <p className="font-bold text-[#1C2B3A]">{v}</p>
                    <button className="mt-2 text-xs text-[#3F5263] hover:underline">{cta}</button>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Purchase History</p>
                <div className="rounded-xl border border-[#D9DCE0] divide-y divide-[#F0EFE9]">
                  {[['Credits Invoice','INV-2025-0710-001','100 Credits','₹2,000'],['Subscription','INV-2025-0001','Free Plan','₹0']].map(([t,inv,desc,amt])=>(
                    <div key={inv} className="flex justify-between items-center px-4 py-3 text-sm">
                      <div><p className="font-medium text-[#1C2B3A]">{t}</p><p className="text-xs text-[#6B7280]">{inv}</p></div>
                      <div className="text-right"><p className="text-[#6B7280]">{desc}</p><p className="font-semibold text-[#1C2B3A]">{amt}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeGroup==='preferences'&&activeSub==='Language & Region'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1C2B3A]">Language & Region</p>
              {[['Language',['English','Hindi','Marathi','Gujarati']],['Timezone',['Asia/Kolkata','UTC']],['Date Format',['DD MMM YYYY','MM/DD/YYYY','YYYY-MM-DD']]].map(([l,opts])=>(
                <div key={l}>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1.5">{l}</label>
                  <select className="notion-input w-full text-sm text-[#1C2B3A]">{opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='notifications'&&activeSub==='Channels & Quiet Hours'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1C2B3A]">Channels & Quiet Hours</p>
              <Toggle label="Email Notifications" sub="rajesh@maaruji.in" on={true}/>
              <Toggle label="SMS Notifications" sub="+91 98200 12345" on={true}/>
              <Toggle label="WhatsApp Notifications" sub="+91 98200 12345" on={false}/>
              <div className="pt-2"><p className="text-sm font-semibold text-[#1C2B3A] mb-3">Quiet Hours</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-[#6B7280] block mb-1.5">From</label><input type="time" defaultValue="23:00" className="notion-input w-full text-sm"/></div>
                  <div><label className="text-xs text-[#6B7280] block mb-1.5">To</label><input type="time" defaultValue="08:00" className="notion-input w-full text-sm"/></div>
                </div>
              </div>
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">Save</button>
            </div>
          )}
          {activeGroup==='integrations'&&activeSub==='Tally ERP Sync'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1C2B3A]">Tally ERP Sync</p>
              {pairingState==='idle'&&(
                <div className="space-y-4">
                  <div className="p-4 bg-[#ECEEEF] rounded-xl border border-[#C5CBD0]">
                    <p className="text-sm font-semibold text-[#3F5263] mb-1">How to pair</p>
                    <ol className="text-xs text-[#526373] space-y-1 list-decimal list-inside">
                      <li>Open TallyDekho Desktop on your Windows PC</li>
                      <li>Click "Generate Code" in the Pairing section</li>
                      <li>Enter the 6-digit code below</li>
                    </ol>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">6-Digit Pairing Code</label>
                    <input
                      maxLength={6}
                      value={pairingCode}
                      onChange={e => { setPairingCode(e.target.value.replace(/\D/g,'')); setPairingError(''); }}
                      placeholder="000000"
                      className="notion-input w-full text-center text-2xl font-bold tracking-[0.4em] py-3"
                    />
                    {pairingError && <p className="text-xs text-[#C0392B] mt-1">{pairingError}</p>}
                  </div>
                  <button onClick={handlePair} className="px-5 py-2 rounded-lg text-sm font-medium text-white w-full bg-[#3F5263] hover:bg-[#526373] transition-colors">Connect to Tally</button>
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
                    <p className="text-sm font-semibold text-[#1C2B3A] mb-2">Synced Companies</p>
                    {companies.length > 0 ? companies.map(c=>(
                      <div key={c.guid||c.name} className="flex items-center gap-2 py-2 border-b border-[#ECEEEF] text-sm">
                        <Check size={12} className="text-[#2D7D46]"/>{c.name}
                      </div>
                    )) : (
                      <p className="text-xs text-[#9CA3AF]">No companies synced yet. Run a sync from the Desktop App.</p>
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
                <p className="text-base font-semibold text-[#1C2B3A]">Bank Feeds</p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">+ Add Bank</button>
              </div>
              {[['HDFC Bank','A/c XXXX 0259','Mumbai Branch'],['ICICI Bank','A/c XXXX 1147','BKC Branch']].map(([bank,acc,branch])=>(
                <div key={bank} className="flex items-center justify-between p-4 border border-[#D9DCE0] rounded-xl">
                  <div><p className="font-medium text-[#1C2B3A] text-sm">{bank} · {acc}</p><p className="text-xs text-[#6B7280]">{branch}</p></div>
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
              <p className="text-base font-semibold text-[#1C2B3A]">About & Versions</p>
              <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#D9DCE0] space-y-2 text-sm">
                {[['Product','TallyDekho Web'],['Version','3.7.2 (build 257)'],['Release Date','05 Jul 2025']].map(([l,v])=>(
                  <div key={l} className="flex justify-between"><span className="text-[#6B7280]">{l}</span><span className="font-medium text-[#1C2B3A]">{v}</span></div>
                ))}
              </div>
              <div className="space-y-2">{['Terms of Service','Privacy Policy','OSS Licences'].map(l=><button key={l} className="block text-sm text-[#3F5263] hover:underline">{l}</button>)}</div>
            </div>
          )}
          {activeGroup==='contact'&&activeSub==='Help Center'&&(
            <AIChatPanel />
          )}
          {/* Fallback */}
          {!['Profile','Company Info','License','Language & Region','Channels & Quiet Hours','Tally ERP Sync','Bank Feeds','About & Versions','Help Center'].includes(activeSub)&&(
            <div className="flex flex-col items-center justify-center h-48 text-[#9CA3AF]">
              <div className="text-4xl mb-3">⚙️</div>
              <p className="text-sm font-medium text-[#6B7280]">{activeSub}</p>
              <p className="text-xs mt-1">Configuration panel coming soon</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-[#9CA3AF] py-5">Made in India with Love 🇮🇳</p>
    </div>
  );
}
