import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info, ArrowRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const fmt = n => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fmtL = n => '₹' + (Math.abs(n) / 100000).toFixed(1) + 'L';

export default function AIInsights() {
  const navigate = useNavigate();
  const { selectedCompany } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    api.fetchDashboard({ companyGuid: selectedCompany.guid })
      .then(r => setDashData(r?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCompany?.guid]);

  const capsules = [
    {
      text: dashData ? `Sales: ${fmtL(dashData.totalSales)} this FY` : 'Sales data loading...',
      sub: selectedCompany?.name || 'Select a company',
      color: '#2D7D46', bg: '#F0FDF4', border: '#BBF7D0', icon: TrendingUp
    },
    {
      text: dashData ? `Purchase: ${fmtL(dashData.totalPurchase)} this FY` : 'Purchase data loading...',
      sub: 'Total procurement spend',
      color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: TrendingDown
    },
    {
      text: dashData ? `Receivables: ${fmtL(dashData.receivables)} outstanding` : 'Receivables loading...',
      sub: 'Sundry debtors balance',
      color: '#C0392B', bg: '#FEF2F2', border: '#FECACA', icon: AlertTriangle
    },
    {
      text: dashData ? `Cash & Bank: ${fmtL((dashData.cashBalance||0)+(dashData.bankBalance||0))}` : 'Cash loading...',
      sub: 'Available balance',
      color: '#3F5263', bg: '#ECEEEF', border: '#C5CBD0', icon: Info
    },
    {
      text: dashData ? `Net Profit: ${fmtL(dashData.netProfit)}` : 'Net profit loading...',
      sub: 'Sales minus purchases',
      color: (dashData?.netProfit || 0) >= 0 ? '#2D7D46' : '#C0392B',
      bg: (dashData?.netProfit || 0) >= 0 ? '#F0FDF4' : '#FEF2F2',
      border: (dashData?.netProfit || 0) >= 0 ? '#BBF7D0' : '#FECACA',
      icon: (dashData?.netProfit || 0) >= 0 ? TrendingUp : TrendingDown
    },
    {
      text: dashData ? `Payables: ${fmtL(dashData.payables)} owed` : 'Payables loading...',
      sub: 'Sundry creditors balance',
      color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: AlertTriangle
    },
  ];

  const actions = [
    { action: 'Review overdue receivables', reason: dashData ? `${fmtL(dashData.receivables)} outstanding` : 'Check receivables', path: '/financials/receivables-payables', urgency: 'high' },
    { action: 'Check payables before month end', reason: dashData ? `${fmtL(dashData.payables)} owed to vendors` : 'Review payables', path: '/financials/receivables-payables', urgency: 'high' },
    { action: 'Review sales performance', reason: 'Check sales vs purchase ratio', path: '/sales', urgency: 'medium' },
    { action: 'Verify cash & bank balance', reason: 'Reconcile with Tally', path: '/financials/cash-bank', urgency: 'low' },
  ];

  const urgencyStyles = {
    high:   { dot: '#C0392B', bg: '#FEF2F2', border: '#FECACA', label: 'High', labelColor: '#C0392B' },
    medium: { dot: '#B45309', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium', labelColor: '#B45309' },
    low:    { dot: '#3F5263', bg: '#ECEEEF', border: '#C5CBD0', label: 'Low', labelColor: '#3F5263' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles size={20} className="text-[#3F5263]" /> AI Insights
          </h1>
          <p className="page-subtitle">{selectedCompany?.name || 'Select a company'} · Powered by Tally data</p>
        </div>
        <button onClick={() => { setLoading(true); api.fetchDashboard({ companyGuid: selectedCompany?.guid }).then(r => setDashData(r?.data)).catch(()=>{}).finally(()=>setLoading(false)); }}
          className="flex items-center gap-1.5 text-xs text-[#3F5263] font-medium hover:text-[#526373]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Insight capsules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {capsules.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: c.bg, borderColor: c.border }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/60">
                <Icon size={16} style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: c.color }}>{c.text}</p>
                <p className="text-xs mt-0.5 opacity-70" style={{ color: c.color }}>{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended actions */}
      <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
        <p className="text-sm font-semibold text-[#1C2B3A] mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-[#3F5263]" /> Recommended Actions
        </p>
        <div className="space-y-2">
          {actions.map((a, i) => {
            const s = urgencyStyles[a.urgency];
            return (
              <div key={i}
                className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: s.bg, borderColor: s.border }}
                onClick={() => navigate(a.path)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                  <div>
                    <p className="text-sm font-medium text-[#1C2B3A]">{a.action}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{a.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/60" style={{ color: s.labelColor }}>
                    {s.label}
                  </span>
                  <ArrowRight size={14} style={{ color: s.labelColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key metrics summary */}
      {dashData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#1C2B3A] mb-4">Financial Summary</p>
            <div className="space-y-3">
              {[
                ['Total Sales',    fmt(dashData.totalSales),    '#2D7D46'],
                ['Total Purchase', fmt(dashData.totalPurchase), '#B45309'],
                ['Net Profit',     fmt(dashData.netProfit),     dashData.netProfit >= 0 ? '#2D7D46' : '#C0392B'],
                ['Receivables',    fmt(dashData.receivables),   '#C0392B'],
                ['Payables',       fmt(dashData.payables),      '#B45309'],
                ['Cash & Bank',    fmt((dashData.cashBalance||0)+(dashData.bankBalance||0)), '#3F5263'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex justify-between items-center py-1.5 border-b border-[#F4F5F6] last:border-0">
                  <span className="text-xs text-[#6B7280]">{l}</span>
                  <span className="text-sm font-semibold" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#1C2B3A] mb-4">Quick Navigate</p>
            <div className="space-y-2">
              {[
                ['Sales Register',         '/sales'],
                ['Purchase Register',      '/purchase'],
                ['Ledgers',                '/ledgers'],
                ['Cash & Bank',            '/financials/cash-bank'],
                ['Receivables & Payables', '/financials/receivables-payables'],
                ['GST Compliance',         '/compliance/gst'],
              ].map(([l, p]) => (
                <button key={l} onClick={() => navigate(p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#F4F5F6] transition-colors text-left">
                  <span className="text-sm text-[#1C2B3A]">{l}</span>
                  <ArrowRight size={13} className="text-[#9CA3AF]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#9CA3AF] text-center pb-2">
        Insights are generated from your synced Tally data · Last updated on sync
      </p>
    </div>
  );
}
