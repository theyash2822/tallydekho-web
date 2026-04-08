import { useState, useEffect } from 'react';
import { Receipt, Search, AlertCircle, RefreshCw, Link2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const fmt  = n => '₹' + (n || 0).toLocaleString('en-IN');
const fmtL = n => {
  if (!n || n === 0) return '—';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  return fmt(n);
};

const COLORS = ['#37352F','#0D9488','#D9730D','#E5484D','#798692','#2383E2','#7C3AED','#059669','#EB5757','#9A9A97'];

const cols = [
  { key: 'ref',      label: 'Reference', render: v => <span className="font-mono text-xs text-[#37352F]">{v || '—'}</span> },
  { key: 'vendor',   label: 'Party' },
  { key: 'category', label: 'Category', render: v => <span className="text-xs text-[#787774]">{v || '—'}</span> },
  { key: 'date',     label: 'Date',     render: v => <span className="text-[#787774]">{v || '—'}</span> },
  { key: 'amount',   label: 'Amount',   render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'voucher_type', label: 'Type', render: v => <Badge label={v} variant="gray" /> },
];

export default function ExpensesModule() {
  const { selectedCompany, selectedFY, isPaired } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');

  const load = () => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.fetchExpenses({
      companyGuid: selectedCompany.guid,
      fromDate: selectedFY?.startDate,
      toDate:   selectedFY?.endDate,
    })
      .then(res => { if (res?.data) setData(res.data); else setError('No data returned'); })
      .catch(err => setError(err?.response?.data?.message || err?.message || 'Failed to load expenses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setData(null); load(); }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const fyLabel    = selectedFY?.name ? `FY ${selectedFY.name}` : 'FY 2025-26';
  const expenses   = data?.expenses   || [];
  const categories = data?.categories || [];
  const summary    = data?.summary    || {};

  const filtered = search
    ? expenses.filter(e => (e.vendor || '').toLowerCase().includes(search.toLowerCase()) || (e.ref || '').toLowerCase().includes(search.toLowerCase()) || (e.category || '').toLowerCase().includes(search.toLowerCase()))
    : expenses;

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span><strong>Error:</strong> {error}</span>
          <button onClick={load} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}
      {!isPaired && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <Link2 size={13} />
          <span>Pair your Desktop App to see real expense data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Connect →</a></span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{selectedCompany?.name || '—'} · {fyLabel}</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] transition-colors disabled:opacity-40">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Total Expenses" value={loading ? '—' : fmtL(summary.totalExpenses)} icon={Receipt} accent="#EB5757" />
        <KPICard title="Transactions"   value={loading ? '—' : summary.count || 0}           icon={Receipt} accent="#37352F" />
        <KPICard title="Categories"     value={loading ? '—' : categories.length || 0}       icon={Receipt} accent="#D9730D" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D3D1CB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#37352F]">Expense Transactions</p>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A9A97]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-3 py-1.5 text-xs bg-[#F7F7F5] border border-[#EFEFEF] rounded-lg outline-none focus:border-[#37352F]" />
            </div>
          </div>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#9A9A97]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#9A9A97]">{isPaired ? 'No expense data for this period' : 'Pair desktop app to see expenses'}</div>
          ) : (
            <Table columns={cols} data={filtered} />
          )}
        </div>

        <div className="bg-white border border-[#D3D1CB] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#37352F] mb-4">By Category</p>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#9A9A97]">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#9A9A97]">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={v => ['₹' + v.toLocaleString('en-IN')]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categories.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[#787774] truncate max-w-[100px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-[#37352F]">{fmtL(c.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
