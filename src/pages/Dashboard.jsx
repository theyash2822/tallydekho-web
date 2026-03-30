import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import wsService from '../services/websocket';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronRight, ChevronDown, Plus, Zap, AlertCircle,
  AlertTriangle, Info, MoreHorizontal, ExternalLink,
  Link2, ShoppingCart, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  ComposedChart, Line, ReferenceLine
} from 'recharts';
import { alerts } from '../data/mockData';
import { useCompanyData } from '../hooks/useCompanyData';
import api from '../services/api';

// ─── Data ─────────────────────────────────────────────────────────────────────
// kpis defined dynamically in component using real API data

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
  { name: 'CGST',  value: 125000, color: '#059669' },
  { name: 'SGST',  value: 98000,  color: '#8B5CF6' },
  { name: 'IGST',  value: 45000,  color: '#A78BFA' },
];

const plData = [
  { month: 'Feb', gross: 8.2, net: 4.1 },
  { month: 'Mar', gross: 9.5, net: 5.2 },
  { month: 'Apr', gross: 7.8, net: 3.9 },
  { month: 'May', gross: 11.2, net: 6.1 },
  { month: 'Jun', gross: 10.4, net: 5.8 },
  { month: 'Jul', gross: 12.8, net: 7.2 },
];

const topCustomers = [
  { name: 'Reliance Retail', amount: '₹9.8L', pct: 100, color: '#059669' },
  { name: 'ABC Traders',     amount: '₹7.6L', pct: 77,  color: '#8B5CF6' },
  { name: 'Tata Consumer',   amount: '₹6.4L', pct: 65,  color: '#06B6D4' },
  { name: 'Metro Cash',      amount: '₹5.2L', pct: 53,  color: '#10B981' },
  { name: 'D-Mart Ltd.',     amount: '₹4.8L', pct: 49,  color: '#F59E0B' },
];

const recentActivity = [
  { type: 'invoice',  label: 'SI-2025-0782 created',        sub: 'Reliance Retail · ₹11,59,000', time: '2m ago',  dot: '#059669' },
  { type: 'payment',  label: 'Payment received',             sub: 'ABC Traders · ₹2,50,000',      time: '18m ago', dot: '#10B981' },
  { type: 'purchase', label: 'PI-2025-0456 recorded',        sub: 'Shree Polymers · ₹3,30,400',   time: '1h ago',  dot: '#F59E0B' },
  { type: 'gst',      label: 'GSTR-2A mismatch detected',   sub: '2 entries need review',         time: '3h ago',  dot: '#F43F5E' },
  { type: 'ewb',      label: 'E-Way Bill expiring',          sub: 'EWB-271234567892 · Tata',      time: '5h ago',  dot: '#F97316' },
];

// ─── Create+ Menu ─────────────────────────────────────────────────────────────
const createMenu = [
  {
    group: 'Sales',
    icon: '📄',
    color: '#059669',
    items: [
      { label: 'Sales Invoice',   sub: 'Create & share invoice',    key: 'Create Invoice' },
      { label: 'Sales Order',     sub: 'Track customer orders',     key: 'Sales Order' },
      { label: 'Quotation',       sub: 'Send price quote',          key: 'Create Quotation' },
      { label: 'Delivery Note',   sub: 'Dispatch confirmation',     key: 'Delivery Note' },
      { label: 'Credit Note',     sub: 'Sales return',              key: 'Credit Note' },
    ],
  },
  {
    group: 'Purchase',
    icon: '🛒',
    color: '#8B5CF6',
    items: [
      { label: 'Purchase Invoice', sub: 'Record vendor bill',        key: 'Purchase Invoice' },
      { label: 'Purchase Order',   sub: 'Order from vendor',         key: 'Purchase Order' },
      { label: 'Debit Note',       sub: 'Purchase return',           key: 'Debit Note' },
    ],
  },
  {
    group: 'Vouchers',
    icon: '🧾',
    color: '#10B981',
    items: [
      { label: 'Payment Voucher',  sub: 'Record outgoing payment',  key: 'Payment Voucher' },
      { label: 'Receipt Voucher',  sub: 'Record incoming payment',  key: 'Receipt Voucher' },
      { label: 'Journal Entry',    sub: 'Manual accounting entry',  key: 'Journal Voucher' },
      { label: 'Contra Entry',     sub: 'Cash ↔ bank transfer',     key: 'Contra Voucher' },
    ],
  },
  {
    group: 'Inventory',
    icon: '📦',
    color: '#F59E0B',
    items: [
      { label: 'Stock Adjustment', sub: 'Correct stock levels',      key: 'Stock Adjustment' },
      { label: 'Stock Transfer',   sub: 'Between warehouses',        key: 'Stock Transfer' },
      { label: 'Add Item',         sub: 'New product / service',     key: 'Add Item' },
    ],
  },
];

const alertConfig = {
  error:   { icon: AlertCircle,   cls: 'bg-rose-50 border-rose-200 text-rose-700' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  info:    { icon: Info,          cls: 'bg-[#ECFDF5] border-[#059669] 200 text-[#059669]' },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, prefix = '₹', suffix = 'K' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] rounded-xl px-4 py-3 shadow-xl text-xs min-w-[140px]">
      <p className="text-[#787774] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[#AEACA8] capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-white">{prefix}{Math.abs(p.value)}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Create+ Dropdown ─────────────────────────────────────────────────────────
function CreateDropdown({ onSelect }) {
  const [activeGroup, setActiveGroup] = useState(createMenu[0]);

  return (
    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E8E7E3] overflow-hidden flex"
      style={{ width: 520 }}>
      {/* Left: groups */}
      <div className="w-44 bg-[#FBFAF8] border-r border-[#E8E7E3] py-2 flex-shrink-0">
        <p className="px-4 pt-1 pb-2 text-[9px] font-bold text-[#AEACA8] uppercase tracking-[0.1em]">Quick Actions</p>
        {createMenu.map(g => (
          <button key={g.group} onMouseEnter={() => setActiveGroup(g)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${activeGroup.group === g.group ? 'bg-white text-[#1A1A1A] font-semibold shadow-sm border-l-2' : 'text-[#787774] hover:text-[#1A1A1A]'}`}
            style={activeGroup.group === g.group ? { borderLeftColor: '#059669' } : {}}>
            <span className="text-base leading-none">{g.icon}</span>
            <span>{g.group}</span>
            {activeGroup.group === g.group && <ChevronRight size={12} className="ml-auto" style={{ color: '#059669' }} />}
          </button>
        ))}
        <div className="mx-4 mt-2 pt-2 border-t border-[#E8E7E3]">
          <p className="text-[9px] font-bold text-[#AEACA8] uppercase tracking-[0.1em] mb-1">Coming Soon</p>
          <p className="text-xs text-[#AEACA8] py-1">Expense Entry</p>
          <p className="text-xs text-[#AEACA8] py-1">Add Ledger</p>
        </div>
      </div>

      {/* Right: items */}
      <div className="flex-1 py-2 px-1">
        <p className="px-3 pt-1 pb-2 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: '#059669' }}>
          {activeGroup.group}
        </p>
        {activeGroup.items.map(item => (
          <button key={item.key} onClick={() => onSelect(item.key)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[#F0FAF7] transition-colors group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
              style={{ background: '#ECFDF5' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#059669' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#059669] transition-colors">{item.label}</p>
              <p className="text-xs text-[#AEACA8] mt-0.5">{item.sub}</p>
            </div>
            <ArrowUpRight size={13} className="ml-auto mt-1 text-[#AEACA8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ kpi }) {
  return (
    <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-[#787774] uppercase tracking-wider">{kpi.label}</p>
        <div className={`w-2 h-2 rounded-full`} style={{ background: kpi.color }} />
      </div>
      <p className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-1">{kpi.value}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[#AEACA8]">{kpi.sub}</p>
        {kpi.change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {kpi.change}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, sub, action, children }) {
  return (
    <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
          {sub && <p className="text-xs text-[#AEACA8] mt-0.5">{sub}</p>}
        </div>
        {action && (
          <button className="flex items-center gap-1 text-xs text-[#059669] hover:text-[#047857] font-medium transition-colors">
            {action} <ExternalLink size={11} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Trend cards data ─────────────────────────────────────────────────────────
const trendCards = [
  { label: 'Sales',     value: '₹45.8L', change: '+14.2%', up: true,  sub: 'vs June 2025',  icon: TrendingUp,    color: '#059669', bg: '#ECFDF5' },
  { label: 'Purchases', value: '₹28.4L', change: '+3.1%',  up: false, sub: 'vs June 2025',  icon: ShoppingCart,  color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Expenses',  value: '₹11.2L', change: '-2.3%',  up: true,  sub: 'Lower this month', icon: Receipt,    color: '#F43F5E', bg: '#FFF1F2' },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const createRef = useRef(null);
  const navigate = useNavigate();
  const { isPaired, selectedCompany, companies, loadCompanies } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  const fmtL = n => n >= 100000 ? '₹' + (n/100000).toFixed(1) + 'L' : n > 0 ? '₹' + n.toLocaleString('en-IN') : '—';

  useEffect(() => {
    if (!selectedCompany?.guid) { setDashLoading(false); return; }
    setDashLoading(true);
    api.fetchDashboard({ companyGuid: selectedCompany.guid })
      .then(res => { if (res?.data) setDashData(res.data); })
      .catch(() => {})
      .finally(() => setDashLoading(false));
  }, [selectedCompany?.guid]);

  const kpis = [
    { label: 'Total Revenue',  value: dashLoading ? '...' : fmtL(dashData?.totalSales || 0),     change: '', up: true,  sub: selectedCompany?.name || 'FY 2025-26', color: '#059669' },
    { label: 'Net Profit',     value: dashLoading ? '...' : fmtL(dashData?.netProfit || 0),      change: '', up: true,  sub: 'This FY', color: '#10B981' },
    { label: 'Receivables',    value: dashLoading ? '...' : fmtL(dashData?.receivables || 0),    change: '', up: false, sub: 'Outstanding', color: '#F59E0B' },
    { label: 'Payables',       value: dashLoading ? '...' : fmtL(dashData?.payables || 0),       change: '', up: false, sub: 'Outstanding', color: '#F43F5E' },
    { label: 'Cash & Bank',    value: dashLoading ? '...' : fmtL((dashData?.cashBalance || 0) + (dashData?.bankBalance || 0)), change: '', up: true, sub: 'Balance', color: '#06B6D4' },
    { label: 'Total Purchase', value: dashLoading ? '...' : fmtL(dashData?.totalPurchase || 0),  change: '', up: null, sub: 'This FY', color: '#8B5CF6' },
  ];
  const [tallyPaired, setTallyPaired] = useState(isPaired);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Auto-refresh companies + show last sync time when desktop syncs
  useEffect(() => {
    const unsub = wsService.on('synced', () => {
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      loadCompanies();
    });
    return unsub;
  }, []);

  useEffect(() => {
    const h = e => { if (createRef.current && !createRef.current.contains(e.target)) setShowCreate(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const totalGST = gstData.reduce((s, g) => s + g.value, 0);

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#787774] mt-0.5">Maaruji Industries Pvt. Ltd. · July 2025 · FY 2025–26</p>
        </div>
      </div>


      {/* ── Tally Pairing Banner ── */}
      {!tallyPaired ? (
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,#059669 0%,#047857 100%)' }}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Link2 size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Connect Tally Prime to sync your data</p>
            <p className="text-xs text-white/70 mt-0.5">Go to Settings → Integrations → Tally ERP Sync and enter the 4-digit code from your desktop</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-white/90 transition-colors"
              style={{ color: '#059669' }}>
              Connect Now →
            </button>
            <button onClick={() => setTallyPaired(true)} className="text-white/60 hover:text-white text-xs underline px-2">Skip</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#6EE7B7] bg-[#ECFDF5]">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#059669' }} />
          <p className="text-xs font-medium" style={{ color: '#059669' }}>
            Tally Prime connected · Last sync: {lastSyncTime || '10 Jul 2025 06:10 AM'}
          </p>
          <button onClick={() => setTallyPaired(false)} className="ml-auto text-xs opacity-60 hover:opacity-100 underline" style={{ color: '#059669' }}>Disconnect</button>
        </div>
      )}

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {alerts.map((a, i) => {
            const { icon: Icon, cls } = alertConfig[a.type];
            return (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium whitespace-nowrap flex-shrink-0 ${cls}`}>
                <Icon size={12} className="flex-shrink-0" />{a.message}
              </div>
            );
          })}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-6 gap-4">
        {kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>

      {/* ── Sales / Purchase / Expenses Trend Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {trendCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-[#E8E7E3] rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#AEACA8] uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-bold text-[#1A1A1A] tracking-tight mt-0.5">{card.value}</p>
                <p className="text-xs text-[#AEACA8] mt-0.5">{card.sub}</p>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${card.up ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-rose-50 text-rose-500'}`}>
                {card.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {card.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Row 1: Revenue chart (wide) + GST Donut ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue Area Chart — 2/3 */}
        <div className="col-span-2">
          <ChartCard title="Revenue Overview" sub="Sales · Purchase · Expenses — FY 2025–26 (₹K)" action="Full report">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  {[['r','#059669'],['p','#8B5CF6'],['e','#F43F5E']].map(([id,c]) => (
                    <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={c} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#AEACA8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} unit="K" />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#059669" strokeWidth={2.5} fill="url(#gr)" dot={false} activeDot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="purchase" name="Purchase" stroke="#8B5CF6" strokeWidth={2} fill="url(#gp)" dot={false} activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F43F5E" strokeWidth={2} fill="url(#ge)" dot={false} activeDot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3 border-t border-[#F1F0EC] pt-3">
              {[['Revenue','#059669','₹45.8L'],['Purchase','#8B5CF6','₹28.4L'],['Expenses','#F43F5E','₹11.2L']].map(([l,c,v]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-1.5 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-[#AEACA8]">{l}</span>
                  <span className="text-xs font-semibold text-[#1A1A1A]">{v}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* GST Liability Donut — 1/3 */}
        <ChartCard title="GST Liability" sub="CGST · SGST · IGST — July 2025" action="View GST">
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={gstData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                    {gstData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={v => ['₹' + v.toLocaleString('en-IN')]} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] font-semibold text-[#AEACA8] uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-[#1A1A1A]">₹2.68L</p>
                <p className="text-[10px] text-[#AEACA8]">GST payable</p>
              </div>
            </div>
            <div className="w-full space-y-2 mt-1">
              {gstData.map(g => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                    <span className="text-xs text-[#787774] font-medium">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-[#F1F0EC] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(g.value / totalGST) * 100}%`, background: g.color }} />
                    </div>
                    <span className="text-xs font-semibold text-[#1A1A1A] w-14 text-right">₹{(g.value / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Cash Flow + P&L Trend + Top Customers ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Cash Flow — diverging bars */}
        <ChartCard title="Cash Flow" sub="Inflows vs Outflows (₹K)" action="Cash & Bank">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={cashFlowData} barSize={14} barGap={3} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => Math.abs(v) + 'K'} tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0} stroke="#E8E7E3" strokeWidth={1.5} />
              <Bar dataKey="inflow"  name="Inflow"  fill="#059669" radius={[4,4,0,0]} />
              <Bar dataKey="outflow" name="Outflow" fill="#FDA4AF" radius={[0,0,4,4]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 pt-2 border-t border-[#F1F0EC]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#059669]" /><span className="text-xs text-[#AEACA8]">Inflow</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#FDA4AF]" /><span className="text-xs text-[#AEACA8]">Outflow</span></div>
          </div>
        </ChartCard>

        {/* P&L Trend — composed bars + line */}
        <ChartCard title="P&L Trend" sub="Gross & Net margin % by month" action="Reports">
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={plData} barSize={10} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} formatter={v => [v + '%']} />
              <Bar yAxisId="l" dataKey="gross" name="Gross %" fill="#D1FAE5" radius={[3,3,0,0]} />
              <Bar yAxisId="l" dataKey="net"   name="Net %"   fill="#059669" radius={[3,3,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="net" name="Net Trend" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 pt-2 border-t border-[#F1F0EC]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-sm bg-[#D1FAE5]" /><span className="text-xs text-[#AEACA8]">Gross %</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-sm bg-[#059669]" /><span className="text-xs text-[#AEACA8]">Net %</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full bg-[#10B981]" /><span className="text-xs text-[#AEACA8]">Net Trend</span></div>
          </div>
        </ChartCard>

        {/* Top Customers */}
        <ChartCard title="Top Customers" sub="By revenue · July 2025" action="Receivables">
          <div className="space-y-3 mt-1">
            {topCustomers.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: c.color }}>{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-[#1A1A1A] truncate">{c.name}</span>
                    <span className="text-xs font-bold text-[#1A1A1A] ml-2 flex-shrink-0">{c.amount}</span>
                  </div>
                  <div className="w-full bg-[#F1F0EC] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Recent Activity ── */}
      <ChartCard title="Recent Activity" sub="Latest transactions and events" action="Audit Trail">
        <div className="divide-y divide-[#F7F6F3]">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 hover:bg-[#FBFAF8] -mx-5 px-5 transition-colors cursor-pointer first:pt-0 last:pb-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p>
                <p className="text-xs text-[#AEACA8] mt-0.5">{item.sub}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-[#AEACA8]">{item.time}</span>
                <ChevronRight size={14} className="text-[#E8E7E3]" />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

    </div>
  );
}
