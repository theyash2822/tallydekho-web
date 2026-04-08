import { useState, useEffect } from 'react';
import { Landmark, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Link2 } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const fmt  = n => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fmtL = n => {
  if (!n || n === 0) return '—';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  return fmt(n);
};
const statusVariant = { Receipt: 'green', Payment: 'red', Contra: 'blue' };
const TABS = ['Cash Register', 'Bank Accounts'];

const txnCols = [
  { key: 'date',        label: 'Date' },
  { key: 'ref',         label: 'Reference', render: v => <span className="font-mono text-xs text-[#AEACA8]">{v || '—'}</span> },
  { key: 'description', label: 'Party / Description' },
  { key: 'dr',   label: 'Receipt (₹)',  render: v => v > 0 ? <span className="text-[#2D7D46] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'cr',   label: 'Payment (₹)', render: v => v > 0 ? <span className="text-[#C0392B] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'voucher_type', label: 'Type', render: v => <Badge label={v} variant={statusVariant[v] || 'gray'} /> },
];

const bankCols = [
  { key: 'name',    label: 'Bank / Account' },
  { key: 'balance', label: 'Balance', render: (v, row) => (
    <span className={`font-semibold ${v >= 0 ? 'text-[#2D7D46]' : 'text-[#C0392B]'}`}>{fmt(v)}</span>
  )},
  { key: 'type', label: 'Type', render: v => <Badge label={v === 'Dr' ? 'Debit' : 'Credit'} variant={v === 'Dr' ? 'blue' : 'green'} /> },
];

export default function CashBank() {
  const { selectedCompany, selectedFY, isPaired } = useAuth();
  const [tab, setTab]       = useState(0);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = () => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.fetchCashBank({
      companyGuid: selectedCompany.guid,
      fromDate: selectedFY?.startDate,
      toDate:   selectedFY?.endDate,
    })
      .then(res => { if (res?.data) setData(res.data); else setError('No data returned'); })
      .catch(err => setError(err?.response?.data?.message || err?.message || 'Failed to load cash & bank data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setData(null); load(); }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const fyLabel = selectedFY?.name ? `FY ${selectedFY.name}` : 'FY 2025-26';
  const txns    = data?.transactions || [];
  const banks   = data?.bankAccounts || [];
  const summary = data?.summary || {};

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
          <span>Pair your Desktop App to see real cash & bank data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Connect →</a></span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Cash & Bank</h1>
          <p className="page-subtitle">{selectedCompany?.name || '—'} · {fyLabel}</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#1A1A1A] transition-colors disabled:opacity-40">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Receipts"  value={loading ? '—' : fmtL(summary.totalReceipts)}  icon={TrendingUp}   accent="#2D7D46" />
        <KPICard title="Total Payments"  value={loading ? '—' : fmtL(summary.totalPayments)}  icon={TrendingDown} accent="#C0392B" />
        <KPICard title="Bank Balance"    value={loading ? '—' : fmtL(summary.bankBalance)}    icon={Landmark}     accent="#2563EB" />
        <KPICard title="Net Cash Flow"   value={loading ? '—' : fmtL(summary.netCash)}        icon={RefreshCw}    accent="#1A1A1A" />
      </div>

      <div className="bg-white border border-[#D4D3CE] rounded-xl">
        <div className="flex gap-1 p-1 border-b border-[#D4D3CE]">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-[#F5F4EF] text-[#1A1A1A]' : 'text-[#787774] hover:text-[#1A1A1A]'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#AEACA8]">Loading…</div>
          ) : tab === 0 ? (
            txns.length === 0
              ? <div className="h-40 flex items-center justify-center text-xs text-[#AEACA8]">{isPaired ? 'No transactions found for this period' : 'Pair desktop app to see transactions'}</div>
              : <Table columns={txnCols} data={txns} />
          ) : (
            banks.length === 0
              ? <div className="h-40 flex items-center justify-center text-xs text-[#AEACA8]">{isPaired ? 'No bank accounts found' : 'Pair desktop app to see bank accounts'}</div>
              : <Table columns={bankCols} data={banks} />
          )}
        </div>
      </div>
    </div>
  );
}
