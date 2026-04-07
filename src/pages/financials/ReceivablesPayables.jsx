import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Link2, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Table from '../../components/Table';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const fmtL = n => {
  if (!n || n === 0) return '—';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
};
const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

const recCols = [
  { key: 'name',          label: 'Party Name' },
  { key: 'total_amount',  label: 'Amount',   render: v => <span className="font-semibold text-[#2D7D46]">{fmt(v)}</span> },
  { key: 'invoice_count', label: 'Invoices', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'last_date',     label: 'Last Invoice', render: v => <span className="text-[#6B7280]">{v || '—'}</span> },
];

const payCols = [
  { key: 'name',          label: 'Vendor Name' },
  { key: 'total_amount',  label: 'Amount',   render: v => <span className="font-semibold text-[#C0392B]">{fmt(v)}</span> },
  { key: 'invoice_count', label: 'Invoices', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'last_date',     label: 'Last Invoice', render: v => <span className="text-[#6B7280]">{v || '—'}</span> },
];

const TABS = ['Receivables', 'Payables'];

export default function ReceivablesPayables() {
  const { selectedCompany, selectedFY, isPaired } = useAuth();
  const [tab, setTab]       = useState(0);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = () => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.fetchReceivablesPayables({
      companyGuid: selectedCompany.guid,
      fromDate: selectedFY?.startDate,
      toDate:   selectedFY?.endDate,
    })
      .then(res => { if (res?.data) setData(res.data); else setError('No data returned'); })
      .catch(err => setError(err?.response?.data?.message || err?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setData(null); load(); }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const fyLabel      = selectedFY?.name ? `FY ${selectedFY.name}` : 'FY 2025-26';
  const receivables  = data?.receivables || [];
  const payables     = data?.payables    || [];
  const summary      = data?.summary     || {};

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
          <span>Pair your Desktop App to see real data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Connect →</a></span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Receivables & Payables</h1>
          <p className="page-subtitle">{selectedCompany?.name || '—'} · {fyLabel}</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C2B3A] transition-colors disabled:opacity-40">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Total Receivables" value={loading ? '—' : fmtL(summary.totalReceivables)} icon={TrendingUp}   accent="#2D7D46" />
        <KPICard title="Total Payables"    value={loading ? '—' : fmtL(summary.totalPayables)}    icon={TrendingDown} accent="#C0392B" />
        <KPICard title="Net Position"      value={loading ? '—' : fmtL(summary.net)}              icon={Scale}        accent="#3F5263" />
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-xl">
        <div className="flex gap-1 p-1 border-b border-[#D9DCE0]">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-[#F4F5F6] text-[#1C2B3A]' : 'text-[#6B7280] hover:text-[#1C2B3A]'}`}>
              {t} {!loading && <span className="text-xs text-[#9CA3AF] ml-1">({i === 0 ? receivables.length : payables.length})</span>}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#9CA3AF]">Loading…</div>
          ) : tab === 0 ? (
            receivables.length === 0
              ? <div className="h-40 flex items-center justify-center text-xs text-[#9CA3AF]">{isPaired ? 'No receivables for this period' : 'Pair desktop app to see data'}</div>
              : <Table columns={recCols} data={receivables} />
          ) : (
            payables.length === 0
              ? <div className="h-40 flex items-center justify-center text-xs text-[#9CA3AF]">{isPaired ? 'No payables for this period' : 'Pair desktop app to see data'}</div>
              : <Table columns={payCols} data={payables} />
          )}
        </div>
      </div>
    </div>
  );
}
