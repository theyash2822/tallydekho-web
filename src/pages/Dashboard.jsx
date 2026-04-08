import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import wsService from '../services/websocket';
import {
  TrendingUp, TrendingDown, ExternalLink,
  AlertCircle, Link2, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const CUSTOMER_COLORS = ['#37352F', '#0D9488', '#D9730D', '#E5484D', '#798692'];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#37352F] rounded-xl px-4 py-3 shadow-xl text-xs min-w-[140px]">
      <p className="text-[#9FA9B1] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[#9FA9B1] capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-white">₹{Math.abs(p.value).toFixed(1)}K</span>
        </div>
      ))}
    </div>
  );
};

function KPICard({ label, value, sub, color, loading }) {
  return (
    <div className="bg-white border border-[#D3D1CB] rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#9A9A97] uppercase tracking-widest">{label}</p>
        <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: color }} />
      </div>
      {loading
        ? <div className="h-7 w-24 bg-[#F7F7F5] rounded-lg animate-pulse" />
        : <p className="text-2xl font-bold text-[#37352F] tracking-tight">{value}</p>
      }
      <p className="text-xs text-[#9A9A97] mt-1.5 truncate">{sub}</p>
    </div>
  );
}

function ChartCard({ title, sub, action, onAction, children }) {
  return (
    <div className="bg-white border border-[#D3D1CB] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#37352F]">{title}</p>
          {sub && <p className="text-xs text-[#9A9A97] mt-0.5">{sub}</p>}
        </div>
        {action && (
          <button onClick={onAction} className="flex items-center gap-1 text-xs text-[#37352F] hover:text-[#787774] font-medium transition-colors">
            {action} <ExternalLink size={11} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ paired, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10">
      <div className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center">
        <AlertCircle size={14} className="text-[#9A9A97]" />
      </div>
      <p className="text-xs text-[#9A9A97] text-center max-w-[160px]">
        {message || (paired ? 'No data for this period' : 'Pair desktop app to see real data')}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isPaired, selectedCompany, selectedFY, loadCompanies } = useAuth();
  const fyLabel = selectedFY?.name ? `FY ${selectedFY.name}` : 'FY 2025-26';

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fmtL = n => {
    if (!n || isNaN(n) || Number(n) === 0) return '—';
    const num = Number(n);
    if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000)   return '₹' + (num / 100000).toFixed(2) + ' L';
    return '₹' + num.toLocaleString('en-IN');
  };

  const load = () => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.fetchDashboard({
      companyGuid: selectedCompany.guid,
      fromDate: selectedFY?.startDate,
      toDate:   selectedFY?.endDate,
    })
      .then(res => {
        if (res?.data) setDashData(res.data);
        else setError('Server returned no data. Please try again.');
      })
      .catch(err => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { setDashData(null); load(); }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  useEffect(() => {
    const unsub = wsService.on('synced', () => {
      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      loadCompanies();
      load();
    });
    return unsub;
  }, []);

  const revenueData = useMemo(() => {
    if (!Array.isArray(dashData?.monthlySales) || dashData.monthlySales.length === 0) return [];
    return dashData.monthlySales.map(r => ({
      month:    r.month,
      Revenue:  Math.round((r.sales    || 0) / 1000),
      Purchase: Math.round((r.purchase || 0) / 1000),
    }));
  }, [dashData]);

  const topCustomers = useMemo(() => {
    if (!Array.isArray(dashData?.topCustomers) || dashData.topCustomers.length === 0) return [];
    const max = dashData.topCustomers[0]?.revenue || 1;
    return dashData.topCustomers.slice(0, 5).map(c => ({
      name:   c.name || '—',
      amount: fmtL(c.revenue),
      pct:    Math.round(((c.revenue || 0) / max) * 100),
    }));
  }, [dashData]);

  const totalRevK = revenueData.reduce((s, r) => s + r.Revenue,  0);
  const totalPurK = revenueData.reduce((s, r) => s + r.Purchase, 0);

  const kpis = [
    { label: 'Total Revenue',  value: fmtL(dashData?.totalSales),    sub: fyLabel,       color: '#0F7B6C' },
    { label: 'Net Profit',     value: fmtL(dashData?.netProfit),      sub: 'This FY',     color: '#37352F' },
    { label: 'Receivables',    value: fmtL(dashData?.receivables),    sub: 'Outstanding', color: '#D9730D' },
    { label: 'Payables',       value: fmtL(dashData?.payables),       sub: 'Outstanding', color: '#EB5757' },
    { label: 'Cash & Bank',    value: fmtL((dashData?.cashBalance||0)+(dashData?.bankBalance||0)), sub: 'Available', color: '#2383E2' },
    { label: 'Total Purchase', value: fmtL(dashData?.totalPurchase),  sub: 'This FY',     color: '#798692' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{selectedCompany?.name || 'Select a company'} · {fyLabel}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span><strong>Error:</strong> {error}</span>
          <button onClick={load} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}

      {/* Not paired */}
      {!isPaired && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-xl primary-gradient">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Link2 size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Connect Tally Prime to sync your data</p>
            <p className="text-xs text-white/60 mt-0.5">Settings → Tally ERP Sync → enter the pairing code from your desktop app</p>
          </div>
          <button
            onClick={() => navigate('/settings?tab=integrations&sub=Tally+ERP+Sync')}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#37352F] hover:bg-white/90 transition-colors flex-shrink-0"
          >
            Connect →
          </button>
        </div>
      )}

      {/* Paired */}
      {isPaired && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#B7D4B2] bg-[#EDF3EC]">
          <div className="w-2 h-2 rounded-full bg-[#0F7B6C] animate-pulse" />
          <p className="text-xs font-medium text-[#0F6B5E]">
            Tally Prime connected{lastSync ? ` · Last sync: ${lastSync}` : ''}
          </p>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((k, i) => <KPICard key={i} {...k} loading={loading} />)}
      </div>

      {/* Revenue chart + Top Customers */}
      <div className="grid grid-cols-3 gap-4">

        <div className="col-span-2">
          <ChartCard
            title="Revenue Overview"
            sub={`Sales vs Purchase — ${fyLabel} (₹K)`}
            action="Full report"
            onAction={() => navigate('/reports')}
          >
            {loading ? (
              <div className="h-[220px] bg-[#F7F7F5] rounded-lg animate-pulse" />
            ) : revenueData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <EmptyState paired={isPaired} message={isPaired ? 'No monthly data for this period' : 'Pair desktop app to see chart'} />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                    <defs>
                      {[['r','#37352F'],['p','#D9730D']].map(([id,c]) => (
                        <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={c} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={c} stopOpacity={0.01} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#EFEFEF" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9A9A97' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9A9A97' }} axisLine={false} tickLine={false} unit="K" />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="Revenue"  stroke="#37352F" strokeWidth={2.5} fill="url(#gr)" dot={false} activeDot={{ r: 4, fill: '#37352F', strokeWidth: 2, stroke: '#fff' }} />
                    <Area type="monotone" dataKey="Purchase" stroke="#D9730D" strokeWidth={2}   fill="url(#gp)" dot={false} activeDot={{ r: 3, fill: '#D9730D', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-5 mt-3 pt-3 border-t border-[#EFEFEF]">
                  {[['Revenue','#37352F',totalRevK],['Purchase','#D9730D',totalPurK]].map(([l,c,v]) => (
                    <div key={l} className="flex items-center gap-2">
                      <div className="w-3 h-1.5 rounded-full" style={{ background: c }} />
                      <span className="text-xs text-[#9A9A97]">{l}</span>
                      <span className="text-xs font-semibold text-[#37352F]">{v > 0 ? `₹${v.toFixed(0)}K` : '—'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Top Customers" sub={`By revenue · ${fyLabel}`}>
          {loading ? (
            <div className="space-y-3 mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F7F7F5] animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-[#F7F7F5] rounded animate-pulse w-3/4" />
                    <div className="h-1.5 bg-[#F7F7F5] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : topCustomers.length === 0 ? (
            <EmptyState paired={isPaired} />
          ) : (
            <div className="space-y-3 mt-1">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: CUSTOMER_COLORS[i] }}
                  >
                    {(c.name[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-[#37352F] truncate">{c.name}</span>
                      <span className="text-xs font-semibold text-[#37352F] ml-2 flex-shrink-0">{c.amount}</span>
                    </div>
                    <div className="w-full bg-[#EFEFEF] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: CUSTOMER_COLORS[i] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

      </div>

    </div>
  );
}
