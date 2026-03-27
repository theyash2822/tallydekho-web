import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { profitTrend, topCustomers } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const capsules = [
  {text:'Sales up 14% vs last month',sub:'Based on July vs June',color:'#10B981',bg:'#ECFDF5',border:'#A7F3D0',icon:TrendingUp},
  {text:'Expenses rose 9% unexpectedly',sub:'Indirect expenses spike',color:'#F43F5E',bg:'#FFF1F2',border:'#FECDD3',icon:TrendingDown},
  {text:'₹1,20,000 stuck in overdue receivables',sub:'D-Mart Ltd., ABC Traders',color:'#F59E0B',bg:'#FFFBEB',border:'#FDE68A',icon:AlertTriangle},
  {text:'Net profit trending upward',sub:'6-month high this month',color:'#059669',bg:'#ECFDF5',border:'#6EE7B7',icon:TrendingUp},
  {text:'GSTR-2A: 2 mismatches detected',sub:'Action needed before filing',color:'#F97316',bg:'#FFF7ED',border:'#FED7AA',icon:AlertTriangle},
  {text:'Inventory turnover slowed 1.3x',sub:'3 slow-moving items',color:'#787774',bg:'#F7F6F3',border:'#E8E7E3',icon:Info},
];

const actions = [
  {action:'Send reminders to 5 overdue customers',reason:'Total overdue: ₹3,40,000',path:'/financials/receivables-payables',urgency:'high'},
  {action:'Fix 2 GST mismatch entries',reason:'GSTR-3B filing due in 3 days',path:'/compliance/gst',urgency:'high'},
  {action:'Review 3 E-Way Bills expiring today',reason:'Validity ends at midnight',path:'/compliance/eway-bill',urgency:'high'},
  {action:'Check expense spike in Indirect Expenses',reason:'9% MoM increase',path:'/financials/reports',urgency:'medium'},
];

const COLORS = ['#059669','#8B5CF6','#10B981','#F59E0B','#F43F5E'];
const vendorSpend = [{name:'Shree Polymers',value:280000},{name:'Bharat Chemicals',value:190000},{name:'National Packaging',value:145000},{name:'Excel Logistics',value:85000},{name:'Others',value:60000}];
const salesForecast = [{month:'Jul',actual:4580000,forecast:null},{month:'Aug',actual:null,forecast:5100000},{month:'Sep',actual:null,forecast:5400000}];

export default function AIInsights() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#059669,#8B5CF6)'}}>
          <Sparkles size={16} className="text-white"/>
        </div>
        <div><h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">AI Insights</h1><p className="text-sm text-[#787774] mt-0.5">Powered by TallyDekho Intelligence · July 2025</p></div>
      </div>

      {/* Capsules */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {capsules.map((c,i)=>{
          const Icon=c.icon;
          return (
            <div key={i} className="flex-shrink-0 flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm cursor-pointer hover:shadow-notion-md transition-shadow" style={{background:c.bg,borderColor:c.border,minWidth:220}}>
              <Icon size={14} style={{color:c.color}} className="mt-0.5 flex-shrink-0"/>
              <div><p className="font-medium text-[#1A1A1A] text-xs">{c.text}</p><p className="text-[10px] text-[#787774] mt-0.5">{c.sub}</p></div>
            </div>
          );
        })}
      </div>

      {/* 6 sections */}
      <div className="grid grid-cols-2 gap-4">
        {/* Financial */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#059669'}}/>Financial Insights</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#6EE7B7]"><p className="text-xs text-[#787774]">Cashflow Score</p><p className="text-2xl font-bold text-[#059669]">72<span className="text-sm font-normal text-[#787774]">/100</span></p></div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200"><p className="text-xs text-[#787774]">Profit vs Last Year</p><p className="text-xl font-bold text-emerald-600">+21%</p></div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={profitTrend}>
              <defs><linearGradient id="fi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.15}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:'#787774'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={v=>'₹'+v.toLocaleString()} contentStyle={{fontSize:11,border:'1px solid #E8E7E3',borderRadius:8}}/>
              <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#fi)" dot={{r:2,fill:'#059669',strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#10B981'}}/>Sales Insights</p>
          <div className="space-y-2 mb-4">
            {[['Fastest growing','Reliance Retail (+18%)','#10B981'],['Most declining','BigBasket (-12%)','#F43F5E'],['AI Forecast (Aug)','₹51.0L','#059669']].map(([l,v,c])=>(
              <div key={l} className="flex justify-between text-sm py-1.5 border-b border-[#F1F0EC] last:border-0">
                <span className="text-[#787774]">{l}</span><span className="font-semibold" style={{color:c}}>{v}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={salesForecast} barSize={20}>
              <XAxis dataKey="month" tick={{fontSize:10,fill:'#787774'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={v=>'₹'+(v/100000).toFixed(1)+'L'} contentStyle={{fontSize:11,border:'1px solid #E8E7E3',borderRadius:8}}/>
              <Bar dataKey="actual" fill="#059669" radius={[4,4,0,0]} name="Actual"/>
              <Bar dataKey="forecast" fill="#6EE7B7" radius={[4,4,0,0]} name="Forecast"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Purchase */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#F97316'}}/>Purchase Insights</p>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="p-2.5 bg-orange-50 rounded-lg text-xs text-orange-700 border border-orange-200">⚠️ 48% purchases from Shree Polymers — vendor risk</div>
              <div className="p-2.5 bg-[#ECFDF5] rounded-lg text-xs text-[#059669] border border-[#059669] 200">💡 Bulk purchase Item X this week — price up 5% next month</div>
            </div>
            <ResponsiveContainer width={100} height={100}>
              <PieChart><Pie data={vendorSpend} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                {vendorSpend.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
              </Pie><Tooltip formatter={v=>'₹'+v.toLocaleString()} contentStyle={{fontSize:11,border:'1px solid #E8E7E3',borderRadius:8}}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#F43F5E'}}/>Receivables Insights</p>
          <div className="space-y-2 mb-3">
            {[['D-Mart Ltd.','High','145 days overdue'],['ABC Traders','Medium','45 days overdue'],['Metro Cash','Medium','38 days overdue']].map(([n,r,d])=>(
              <div key={n} className="flex items-center justify-between text-sm py-1.5 border-b border-[#F1F0EC] last:border-0">
                <span className="font-medium text-[#1A1A1A]">{n}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r==='High'?'bg-rose-50 text-rose-600':'bg-amber-50 text-amber-600'}`}>{r}</span>
                <span className="text-[#787774] text-xs">{d}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[#ECFDF5] rounded-lg text-xs text-[#059669] font-medium">Expected collection this week: <strong>₹2,40,000</strong></div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#10B981'}}/>Inventory Insights</p>
          <div className="space-y-2">
            {[['Product A – Polymer Grade','Over-stocked','red'],['Product B – Chemical Mix','Reorder Soon','yellow'],['Product C – Packaging Box','Out of Stock Risk','red'],['Product D – Label Print','Normal','green']].map(([n,s,c])=>(
              <div key={n} className="flex justify-between items-center py-2 border-b border-[#F1F0EC] last:border-0">
                <span className="text-sm text-[#1A1A1A] truncate mr-2">{n}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c==='red'?'bg-rose-50 text-rose-600':c==='yellow'?'bg-amber-50 text-amber-600':'bg-emerald-50 text-emerald-600'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={13} style={{color:'#F59E0B'}}/>Compliance Insights</p>
          <div className="space-y-2">
            {[['GSTR-3B due in 3 days — 2 mismatches','rose-50','rose-200','rose-700'],['3 E-Way Bills expiring today','amber-50','amber-200','amber-700'],['TDS payment due on 7th — ₹12,750 pending','blue-50','blue-200','blue-700'],['GSTR-1 filed on time for July','emerald-50','emerald-200','emerald-700']].map(([msg,bg,border,text])=>(
              <div key={msg} className={`p-2.5 rounded-lg text-xs font-medium bg-${bg} border border-${border} text-${text}`}>{msg}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
        <p className="text-base font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2"><Sparkles size={16} style={{color:'#059669'}}/>AI Recommended Actions</p>
        <div className="space-y-2">
          {actions.map((a,i)=>(
            <div key={i} className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${a.urgency==='high'?'bg-rose-50 border-rose-200':'bg-amber-50 border-amber-200'}`}>
              <div>
                <p className={`text-sm font-semibold ${a.urgency==='high'?'text-rose-700':'text-amber-700'}`}>{a.action}</p>
                <p className="text-xs text-[#787774] mt-0.5">{a.reason}</p>
              </div>
              <button onClick={()=>navigate(a.path)} className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-xs font-medium hover:shadow-notion transition-shadow flex-shrink-0 ${a.urgency==='high'?'border-rose-200 text-rose-600':'border-amber-200 text-amber-600'}`}>
                Go <ArrowRight size={11}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
