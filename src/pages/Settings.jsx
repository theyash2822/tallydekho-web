import { useState, useRef } from 'react';
import { User, Building2, CreditCard, Globe, Bell, Plug, Info, ChevronRight, Check } from 'lucide-react';
import { company } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const GROUPS = [
  {key:'account',label:'Account & Org',icon:User,subs:['Profile','Company Info','License']},
  {key:'preferences',label:'Preferences',icon:Globe,subs:['Language & Region','Currency & Format','Voucher Config']},
  {key:'notifications',label:'Notifications',icon:Bell,subs:['Channels & Quiet Hours','Low Stock & Expiry','Compliance Reminders','Payment Reminders']},
  {key:'integrations',label:'Integrations',icon:Plug,subs:['Tally ERP Sync','Bank Feeds','E-Way Bill','E-Invoice']},
  {key:'contact',label:'Contact & Info',icon:Info,subs:['About & Versions','Data Security','Help Center']},
];

const Field = ({label,defaultValue,type='text'}) => (
  <div>
    <label className="text-xs font-medium text-[#787774] block mb-1.5">{label}</label>
    <input type={type} defaultValue={defaultValue} className="notion-input w-full text-sm"/>
  </div>
);

const Toggle = ({label,sub,on}) => {
  const [active,setActive] = useState(on);
  return (
    <div className="flex items-center justify-between p-4 border border-[#E8E7E3] rounded-xl">
      <div><p className="text-sm font-medium text-[#1A1A1A]">{label}</p>{sub&&<p className="text-xs text-[#787774] mt-0.5">{sub}</p>}</div>
      <button onClick={()=>setActive(p=>!p)} className={`w-10 h-5 rounded-full transition-colors relative ${active?'bg-[#059669]':'bg-[#E8E7E3]'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${active?'translate-x-5':'translate-x-0.5'}`}/>
      </button>
    </div>
  );
};

export default function Settings() {
  const [activeGroup, setActiveGroup] = useState('account');
  const [activeSub, setActiveSub] = useState('Profile');
  const [pairingState, setPairingState] = useState('idle');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const { markPaired, isPaired } = useAuth();

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
          <div className="bg-white border border-[#E8E7E3] rounded-xl overflow-hidden">
            {GROUPS.map(g=>(
              <div key={g.key}>
                <button onClick={()=>{setActiveGroup(g.key);setActiveSub(g.subs[0]);}}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-b border-[#F1F0EC] last:border-0 ${activeGroup===g.key?'bg-[#ECFDF5] text-[#059669]':'text-[#787774] hover:bg-[#F7F6F3] hover:text-[#1A1A1A]'}`}>
                  <g.icon size={14} className="flex-shrink-0"/><span className="flex-1 text-left">{g.label}</span>
                  <ChevronRight size={12} className={`transition-transform ${activeGroup===g.key?'rotate-90 text-[#059669]':'text-[#AEACA8]'}`}/>
                </button>
                {activeGroup===g.key&&(
                  <div className="bg-[#F7F6F3]">
                    {g.subs.map(sub=>(
                      <button key={sub} onClick={()=>setActiveSub(sub)}
                        className={`w-full flex items-center gap-2 pl-9 pr-4 py-2 text-xs transition-colors ${activeSub===sub?'text-[#059669] font-semibold':'text-[#787774] hover:text-[#1A1A1A]'}`}>
                        {activeSub===sub&&<span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0"/>}{sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-[#E8E7E3] rounded-xl p-6 min-h-96">
          {activeGroup==='account'&&activeSub==='Profile'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Profile</p>
              <Field label="Full Name" defaultValue="Rajesh Kumar"/>
              <Field label="Email" defaultValue="rajesh@maaruji.in" type="email"/>
              <Field label="Phone" defaultValue="+91 98200 12345"/>
              <Field label="Role" defaultValue="Admin"/>
              <div className="flex gap-3 pt-2">
                <button className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>Save</button>
                <button className="px-5 py-2 rounded-lg text-sm font-medium text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Cancel</button>
              </div>
              <div className="pt-4 border-t border-[#E8E7E3]">
                <button className="px-4 py-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100">Delete Account</button>
              </div>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='Company Info'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Company Information</p>
              <Field label="Company Name" defaultValue={company.name}/>
              <Field label="GSTIN" defaultValue={company.gstin}/>
              <Field label="PAN" defaultValue={company.pan}/>
              <Field label="Address" defaultValue={company.address}/>
              <Field label="Phone" defaultValue={company.phone}/>
              <Field label="Email" defaultValue={company.email}/>
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>Save</button>
            </div>
          )}
          {activeGroup==='account'&&activeSub==='License'&&(
            <div className="space-y-5">
              <p className="text-base font-semibold text-[#1A1A1A]">License & Credits</p>
              <div className="grid grid-cols-3 gap-4">
                {[['Plan','Free – 1 User','Upgrade →'],['Notification Credits','172 / 200','Buy Credits →'],['Team Seats','1 Seat','Coming Soon']].map(([l,v,cta])=>(
                  <div key={l} className="p-4 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                    <p className="text-xs text-[#787774] mb-1">{l}</p>
                    <p className="font-bold text-[#1A1A1A]">{v}</p>
                    <button className="mt-2 text-xs text-[#059669] hover:underline">{cta}</button>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Purchase History</p>
                <div className="rounded-xl border border-[#E8E7E3] divide-y divide-[#F1F0EC]">
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
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>Save</button>
            </div>
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
              <button className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>Save</button>
            </div>
          )}
          {activeGroup==='integrations'&&activeSub==='Tally ERP Sync'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Tally ERP Sync</p>
              {pairingState==='idle'&&(
                <div className="space-y-4">
                  <div className="p-4 bg-[#ECFDF5] rounded-xl border border-[#6EE7B7]">
                    <p className="text-sm font-semibold text-[#059669] mb-1">How to pair</p>
                    <ol className="text-xs text-[#047857] space-y-1 list-decimal list-inside">
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
                    {pairingError && <p className="text-xs text-rose-500 mt-1">{pairingError}</p>}
                  </div>
                  <button onClick={handlePair} className="px-5 py-2 rounded-lg text-sm font-medium text-white w-full" style={{background:'#059669'}}>Connect to Tally</button>
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
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <Check size={14}/> Paired · Tally Prime connected
                  </div>
                  <div><p className="text-sm font-semibold text-[#1A1A1A] mb-2">Synced Companies</p>
                    {['Maaruji Tech','Demo India'].map(c=>(
                      <div key={c} className="flex items-center gap-2 py-2 border-b border-[#F1F0EC] text-sm"><Check size={12} className="text-emerald-500"/>{c}</div>
                    ))}
                  </div>
                  <button onClick={()=>setPairingState('idle')} className="px-4 py-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100">Unpair</button>
                </div>
              )}
            </div>
          )}
          {activeGroup==='integrations'&&activeSub==='Bank Feeds'&&(
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-base font-semibold text-[#1A1A1A]">Bank Feeds</p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>+ Add Bank</button>
              </div>
              {[['HDFC Bank','A/c XXXX 0259','Mumbai Branch'],['ICICI Bank','A/c XXXX 1147','BKC Branch']].map(([bank,acc,branch])=>(
                <div key={bank} className="flex items-center justify-between p-4 border border-[#E8E7E3] rounded-xl">
                  <div><p className="font-medium text-[#1A1A1A] text-sm">{bank} · {acc}</p><p className="text-xs text-[#787774]">{branch}</p></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Active</span>
                    <button className="text-xs text-rose-500 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeGroup==='contact'&&activeSub==='About & Versions'&&(
            <div className="space-y-5">
              <p className="text-base font-semibold text-[#1A1A1A]">About & Versions</p>
              <div className="bg-[#FBFAF8] rounded-xl p-4 border border-[#E8E7E3] space-y-2 text-sm">
                {[['Product','TallyDekho Web'],['Version','3.7.2 (build 257)'],['Release Date','05 Jul 2025']].map(([l,v])=>(
                  <div key={l} className="flex justify-between"><span className="text-[#787774]">{l}</span><span className="font-medium text-[#1A1A1A]">{v}</span></div>
                ))}
              </div>
              <div className="space-y-2">{['Terms of Service','Privacy Policy','OSS Licences'].map(l=><button key={l} className="block text-sm text-[#059669] hover:underline">{l}</button>)}</div>
            </div>
          )}
          {activeGroup==='contact'&&activeSub==='Help Center'&&(
            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1A1A1A]">Help Center</p>
              <div className="p-4 rounded-xl text-center" style={{background:'linear-gradient(135deg,#ECFDF5,#F5F3FF)'}}>
                <p className="text-sm font-medium text-[#059669]">Ask me anything about TallyDekho in your own language.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['How to pair with Tally?','Purchase credits?','How to change GSTIN?','Export my data'].map(q=>(
                  <button key={q} className="px-3 py-1.5 bg-[#F1F0EC] text-[#787774] text-xs rounded-lg hover:bg-[#E8E7E3] transition-colors">{q}</button>
                ))}
              </div>
              <div className="border border-[#E8E7E3] rounded-xl p-4 h-44 bg-[#FBFAF8] flex items-center justify-center text-[#AEACA8] text-sm">Chat interface — type your question</div>
            </div>
          )}
          {/* Fallback */}
          {!['Profile','Company Info','License','Language & Region','Channels & Quiet Hours','Tally ERP Sync','Bank Feeds','About & Versions','Help Center'].includes(activeSub)&&(
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
