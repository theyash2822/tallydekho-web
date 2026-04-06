import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import wsService from '../services/websocket';
import {
  TrendingUp, TrendingDown, ChevronRight, ExternalLink,
  AlertCircle, AlertTriangle, Info, Link2, ShoppingCart, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  ComposedChart, Line, ReferenceLine
} from 'recharts';
import { alerts } from '../data/mockData';
import api from '../services/api';

// ─── Chart data ───────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Feb', revenue: 3200, purchase: 2100, expenses: 820 },
  { month: 'Mar', revenue: 3800, purchase: 2450, expenses: 940 },
  { month: 'Apr', revenue: 4100, purchase: 2600, expenses: 1020 },
  { month: 'May', revenue: 3750, purchase: 2300, expenses: 890 },
  { month: 'Jun', revenue: 4300, purchase: 2700, expenses: 1050 },
  { month: 'Jul', revenue: 4580, purchase: 2840, expenses: 1120 },
];
const cashFlowData = [
  { month: 'Feb', inflow: 2208, outflow: -1500 },
  { month: 'Mar', inflow: 3100, outflow: -2000 },
  { month: 'Apr', inflow: 1600, outflow: -1800 },
  { month: 'May', inflow: 3312, outflow: -2200 },
  { month: 'Jun', inflow: 2900, outflow: -1950 },
  { month: 'Jul', inflow: 3450, outflow: -2100 },
];
const gstData = [
  { name: 'CGST', value: 125000, color: '#3F5263' },
  { name: 'SGST', value: 98000,  color: '#0D9488' },
  { name: 'IGST', value: 45000,  color: '#D97706' },
];

// Customer avatar colors — distinct per rank
const CUSTOMER_COLORS = ['#3F5263','#0D9488','#D97706','#E5484D','#798692'];
const plData = [
  { month: 'Feb', gross: 8.2,  net: 4.1 },
  { month: 'Mar', gross: 9.5,  net: 5.2 },
  { month: 'Apr', gross: 7.8,  net: 3.9 },
  { month: 'May', gross: 11.2, net: 6.1 },
  { month: 'Jun', gross: 10.4, net: 5.8 },
  { month: 'Jul', gross: 12.8, net: 7.2 },
];
const topCustomers = [
  { name: 'Reliance Retail', amount: '₹9.8L', pct: 100 },
  { name: 'ABC Traders',     amount: '₹7.6L', pct: 77  },
  { name: 'Tata Consumer',   amount: '₹6.4L', pct: 65  },
  { name: 'Metro Cash',      amount: '₹5.2L', pct: 53  },
  { name: 'D-Mart Ltd.',     amount: '₹4.8L', pct: 49  },
];
const recentActivity = [
  { label: 'SI-2025-0782 created',      sub: 'Reliance Retail · ₹11,59,000', time: '2m ago',  type: 'positive' },
  { label: 'Payment received',           sub: 'ABC Traders · ₹2,50,000',      time: '18m ago', type: 'positive' },
  { label: 'PI-2025-0456 recorded',      sub: 'Shree Polymers · ₹3,30,400',   time: '1h ago',  type: 'caution' },
  { label: 'GSTR-2A mismatch detected',  sub: '2 entries need review',         time: '3h ago',  type: 'negative' },
  { label: 'E-Way Bill expiring',        sub: 'EWB-271234567892 · Tata',      time: '5h ago',  type: 'caution' },
];
const alertConfig = {
  error:   { icon: AlertCircle,   cls: 'bg-[#FDECEA] border-[#EDBBB8] text-[#C0392B]' },
  warning: { icon: AlertTriangle, cls: 'bg-[#FEF6E4] border-[#F0D49A] text-[#B45309]' },
  info:    { icon: Info,          cls: 'bg-[#EBF2FF] border-[#BAD0F8] text-[#2563EB]' },
};
const activityDot = { positive: '#2D7D46', negative: '#C0392B', caution: '#B45309', neutral: '#6B7280' };

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, prefix = '₹', suffix = 'K' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C2B3A] rounded-xl px-4 py-3 shadow-xl text-xs min-w-[140px]">
      <p className="text-[#9FA9B1] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[#9FA9B1] capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-white">{prefix}{Math.abs(p.value)}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, up, color }) {
  return (
    <div className="bg-white border border-[#D9DCE0] rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{label}</p>
        <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: color }} />
      </div>
      <p className="text-2xl font-bold text-[#1C2B3A] tracking-tight">{value}</p>
      <p className="text-xs text-[#9CA3AF] mt-1.5">{sub}</p>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, sub, action, children }) {
  return (
    <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#1C2B3A]">{title}</p>
          {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
        </div>
        {action && (
          <button className="flex items-center gap-1 text-xs text-[#3F5263] hover:text-[#526373] font-medium transition-colors">
            {action} <ExternalLink size={11} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { isPaired, selectedCompany, selectedFY, loadCompanies } = useAuth();
  const fyLabel = selectedFY?.name ? `FY ${selectedFY.name}` : '{fyLabel}';
  const [dashData, setDashData]   = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [tallyPaired, setTallyPaired] = useState(isPaired);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const fmtL = n => n >= 100000 ? '₹' + (n/100000).toFixed(1) + 'L' : n > 0 ? '₹' + n.toLocaleString('en-IN') : '—';

  useEffect(() => {
    setDashData(null);
    if (!selectedCompany?.guid) { setDashLoading(false); return; }
    setDashLoading(true);
    api.fetchDashboard({ companyGuid: selectedCompany.guid, fromDate: selectedFY?.startDate, toDate: selectedFY?.endDate })
      .then(res => { if (res?.data) setDashData(res.data); })
      .catch(() => {})
      .finally(() => setDashLoading(false));
  }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  useEffect(() => {
    const unsub = wsService.on('synced', () => {
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      loadCompanies();
    });
    return unsub;
  }, []);

  const L = dashLoading;
  const D = dashData;
  const kpis = [
    { label: 'Total Revenue',  value: L ? '—' : fmtL(D?.totalSales || 0),     sub: selectedCompany?.name || '{fyLabel}', color: '#2D7D46' },
    { label: 'Net Profit',     value: L ? '—' : fmtL(D?.netProfit || 0),       sub: 'This FY',        color: '#3F5263' },
    { label: 'Receivables',    value: L ? '—' : fmtL(D?.receivables || 0),     sub: 'Outstanding',    color: '#B45309' },
    { label: 'Payables',       value: L ? '—' : fmtL(D?.payables || 0),        sub: 'Outstanding',    color: '#C0392B' },
    { label: 'Cash & Bank',    value: L ? '—' : fmtL((D?.cashBalance||0)+(D?.bankBalance||0)), sub: 'Available', color: '#2563EB' },
    { label: 'Total Purchase', value: L ? '—' : fmtL(D?.totalPurchase || 0),   sub: 'This FY',        color: '#798692' },
  ];

  const totalGST = gstData.reduce((s, g) => s + g.value, 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{selectedCompany?.name || 'Select a company'} · {fyLabel}</p>
      </div>

      {/* Tally connect banner */}
      {!tallyPaired ? (
        <div className="flex items-center gap-4 px-5 py-4 rounded-xl primary-gradient">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Link2 size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Connect Tally Prime to sync your data</p>
            <p className="text-xs text-white/60 mt-0.5">Settings → Tally ERP Sync → enter the pairing code from your desktop app</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#3F5263] hover:bg-white/90 transition-colors flex-shrink-0"
          >
            Connect →
          </button>
          <button onClick={() => setTallyPaired(true)} className="text-white/50 hover:text-white text-xs underline">Skip</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#A8D5BC] bg-[#E8F5ED]">
          <div className="w-2 h-2 rounded-full bg-[#2D7D46] animate-pulse" />
          <p className="text-xs font-medium text-[#1A5C32]">
            Tally Prime connected · Last sync: {lastSyncTime || '—'}
          </p>
          <button onClick={() => setTallyPaired(false)} className="ml-auto text-xs text-[#2D7D46]/70 hover:text-[#2D7D46] underline underline-offset-2">
            Disconnect
          </button>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {alerts.map((a, i) => {
            const { icon: Icon, cls } = alertConfig[a.type] || alertConfig.info;
            return (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap flex-shrink-0 ${cls}`}>
                <Icon size={12} className="flex-shrink-0" />{a.message}
              </div>
            );
          })}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Revenue + GST */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartCard title="Revenue Overview" sub="Sales · Purchase · Expenses — {fyLabel} (₹K)" action="Full report">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  {[['r','#3F5263'],['p','#D97706'],['e','#E5484D']].map(([id,c]) => (
                    <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={c} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.01} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#ECEEEF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="K" />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#3F5263" strokeWidth={2.5} fill="url(#gr)" dot={false} activeDot={{ r: 4, fill: '#3F5263', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="purchase" name="Purchase" stroke="#D97706" strokeWidth={2}   fill="url(#gp)" dot={false} activeDot={{ r: 3, fill: '#D97706', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#E5484D" strokeWidth={2}   fill="url(#ge)" dot={false} activeDot={{ r: 3, fill: '#E5484D', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3 pt-3 border-t border-[#ECEEEF]">
              {[['Revenue','#3F5263','₹45.8L'],['Purchase','#D97706','₹28.4L'],['Expenses','#E5484D','₹11.2L']].map(([l,c,v]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-1.5 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-[#9CA3AF]">{l}</span>
                  <span className="text-xs font-semibold text-[#1C2B3A]">{v}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <ChartCard title="GST Liability" sub="CGST · SGST · IGST" action="View GST">
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={175}>
                <PieChart>
                  <Pie data={gstData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                    {gstData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={v => ['₹' + v.toLocaleString('en-IN')]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #D9DCE0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-[#1C2B3A]">₹2.68L</p>
                <p className="text-[10px] text-[#9CA3AF]">payable</p>
              </div>
            </div>
            <div className="w-full space-y-2 mt-2">
              {gstData.map(g => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                    <span className="text-xs text-[#6B7280] font-medium">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#ECEEEF] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(g.value/totalGST)*100}%`, background: g.color }} />
                    </div>
                    <span className="text-xs font-semibold text-[#1C2B3A] w-12 text-right">₹{(g.value/1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Cash Flow + P&L + Top Customers */}
      <div className="grid grid-cols-3 gap-4">
        <ChartCard title="Cash Flow" sub="Inflows vs Outflows (₹K)">
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={cashFlowData} barSize={13} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#ECEEEF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => Math.abs(v) + 'K'} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0} stroke="#D9DCE0" strokeWidth={1} />
              <Bar dataKey="inflow"  name="Inflow"  fill="#0D9488" radius={[3,3,0,0]} />
              <Bar dataKey="outflow" name="Outflow" fill="#ECEEEF" radius={[0,0,3,3]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 pt-2 border-t border-[#ECEEEF]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#0D9488]" /><span className="text-xs text-[#9CA3AF]">Inflow</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#C5CBD0]" /><span className="text-xs text-[#9CA3AF]">Outflow</span></div>
          </div>
        </ChartCard>

        <ChartCard title="P&L Trend" sub="Gross & Net margin %">
          <ResponsiveContainer width="100%" height={185}>
            <ComposedChart data={plData} barSize={9} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#ECEEEF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #D9DCE0' }} formatter={v => [v + '%']} />
              <Bar yAxisId="l" dataKey="gross" name="Gross %" fill="#D9DCE0" radius={[3,3,0,0]} />
              <Bar yAxisId="l" dataKey="net"   name="Net %"   fill="#3F5263" radius={[3,3,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="net" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3, fill: '#0D9488', strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 pt-2 border-t border-[#ECEEEF]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-sm bg-[#D9DCE0]" /><span className="text-xs text-[#9CA3AF]">Gross %</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-sm bg-[#3F5263]" /><span className="text-xs text-[#9CA3AF]">Net %</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#0D9488]" /><span className="text-xs text-[#9CA3AF]">Trend</span></div>
          </div>
        </ChartCard>

        <ChartCard title="Top Customers" sub="By revenue · July 2025">
          <div className="space-y-3 mt-1">
            {topCustomers.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: CUSTOMER_COLORS[i] }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-[#1C2B3A] truncate">{c.name}</span>
                    <span className="text-xs font-semibold text-[#1C2B3A] ml-2 flex-shrink-0">{c.amount}</span>
                  </div>
                  <div className="w-full bg-[#ECEEEF] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.pct}%`, background: CUSTOMER_COLORS[i] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity" sub="Latest transactions and events" action="Audit Trail">
        <div className="divide-y divide-[#F4F5F6]">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 hover:bg-[#F4F5F6] -mx-5 px-5 transition-colors cursor-pointer first:pt-1 last:pb-1">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activityDot[item.type] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1C2B3A]">{item.label}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{item.sub}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-[#9CA3AF]">{item.time}</span>
                <ChevronRight size={13} className="text-[#D9DCE0]" />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
