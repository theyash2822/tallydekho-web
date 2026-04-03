import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, RefreshCw, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const fmt = n => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const LEDGER_TABS = ['Details', 'Balance Trend', 'GST Info'];

const movementData = [
  { month: 'Feb', balance: 320000 },
  { month: 'Mar', balance: 480000 },
  { month: 'Apr', balance: 560000 },
  { month: 'May', balance: 420000 },
  { month: 'Jun', balance: 680000 },
  { month: 'Jul', balance: 1159000 },
];

function SkeletonRow() {
  return (
    <tr className="border-b border-[#ECEEEF]">
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-[#ECEEEF] rounded animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// Helper accessors
const getName  = l => l.name  || l.NAME  || l.ledgerName || '—';
const getGroup = l => l.parent || l.group || l.PARENT    || '—';
const getClose = l => l.closing_balance  || l.closing  || l.closingBalance  || l.CLOSINGBALANCE  || 0;
const getOpen  = l => l.opening_balance  || l.opening  || l.openingBalance  || l.OPENINGBALANCE  || 0;
const getGstin = l => l.gstin || l.GSTIN || '';
const getBalType = l => {
  if (l.balance_type) return l.balance_type;
  const c = getClose(l);
  return c < 0 ? 'Cr' : 'Dr';
};

export default function Ledgers() {
  const { selectedCompany, token } = useAuth();
  const [ledgers, setLedgers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);
  const [search,  setSearch]          = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [typeFilter, setTypeFilter]   = useState('All');
  const [page,    setPage]            = useState(1);
  const [pageSize]                    = useState(25);
  const [total,   setTotal]           = useState(0);
  const [drawer,  setDrawer]          = useState(null);
  const [ledgerTab, setLedgerTab]     = useState(0);

  const companyGuid = selectedCompany?.guid;

  const load = useCallback(async (searchText = '', pg = 1) => {
    if (!companyGuid) { setLedgers([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.fetchLedgers({ companyGuid, page: pg, pageSize, searchText });
      const list = res?.data?.ledgers || res?.data || [];
      setLedgers(Array.isArray(list) ? list : []);
      if (res?.data?.total) setTotal(res.data.total);
    } catch (err) {
      setError(err.message);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  }, [companyGuid, pageSize]);

  // Initial load + company change
  useEffect(() => { load('', 1); setPage(1); }, [companyGuid]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { load(search, 1); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Derived data
  const groups = ['All', ...Array.from(new Set(ledgers.map(l => getGroup(l)).filter(g => g !== '—')))].sort();
  const filtered = ledgers.filter(l => {
    const groupMatch = groupFilter === 'All' || getGroup(l) === groupFilter;
    const typeMatch  = typeFilter  === 'All' || getBalType(l) === typeFilter;
    return groupMatch && typeMatch;
  });

  const totalDr = ledgers.filter(l => getBalType(l) === 'Dr').length;
  const totalCr = ledgers.filter(l => getBalType(l) === 'Cr').length;
  const withGstin = ledgers.filter(l => getGstin(l)).length;

  const totalPages = Math.ceil(total / pageSize) || Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Ledgers</h1>
          <p className="page-subtitle">
            {selectedCompany?.name || 'No company selected'} ·{' '}
            {loading ? 'Loading...' : `${total || ledgers.length} ledgers`}
          </p>
        </div>
        <button
          onClick={() => load(search, page)}
          className="flex items-center gap-1.5 text-xs font-medium text-[#3F5263] hover:text-[#526373] transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Ledgers"   value={loading ? '—' : ledgers.length} icon={BookOpen}     accent="#3F5263" />
        <KPICard title="Debit Balance"   value={loading ? '—' : totalDr}        icon={TrendingUp}   accent="#2D7D46" />
        <KPICard title="Credit Balance"  value={loading ? '—' : totalCr}        icon={TrendingDown} accent="#C0392B" />
        <KPICard title="With GSTIN"      value={loading ? '—' : withGstin}      icon={BookOpen}     accent="#798692" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF6E4] border border-[#F0D49A] rounded-xl text-xs text-[#B45309]">
          ⚠️ {error}
        </div>
      )}

      {/* No company */}
      {!companyGuid && !loading && (
        <div className="bg-white border border-[#D9DCE0] rounded-xl p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-[#C5CBD0]" />
          <p className="text-sm font-medium text-[#6B7280]">Select a company to view ledgers</p>
        </div>
      )}

      {/* Table */}
      {(companyGuid || loading) && (
        <div className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden">

          {/* Filters */}
          <div className="p-4 border-b border-[#ECEEEF] flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ledger name or GSTIN..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F4F5F6] border border-[#ECEEEF] rounded-lg outline-none focus:border-[#3F5263] focus:bg-white transition-all placeholder:text-[#9CA3AF]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#9CA3AF]" />
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-white border border-[#D9DCE0] rounded-lg outline-none focus:border-[#3F5263] text-[#1C2B3A] cursor-pointer"
              >
                {groups.map(g => <option key={g}>{g}</option>)}
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-white border border-[#D9DCE0] rounded-lg outline-none focus:border-[#3F5263] text-[#1C2B3A] cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Dr">Debit (Dr)</option>
                <option value="Cr">Credit (Cr)</option>
              </select>
            </div>
            <span className="text-xs text-[#9CA3AF] ml-auto">
              {filtered.length} shown
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F5F6] border-b border-[#D9DCE0]">
                  {['Ledger Name', 'Group', 'Opening', 'Closing', 'Type', 'GSTIN', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <BookOpen size={28} className="mx-auto mb-2 text-[#D9DCE0]" />
                      <p className="text-sm text-[#9CA3AF]">No ledgers found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((l, i) => {
                    const type = getBalType(l);
                    const close = getClose(l);
                    return (
                      <tr
                        key={l.guid || l.GUID || i}
                        className="border-b border-[#ECEEEF] hover:bg-[#F4F5F6] cursor-pointer transition-colors"
                        onClick={() => { setDrawer(l); setLedgerTab(0); }}
                      >
                        <td className="px-4 py-3 font-medium text-[#1C2B3A]">{getName(l)}</td>
                        <td className="px-4 py-3 text-[#6B7280] text-xs">{getGroup(l)}</td>
                        <td className="px-4 py-3 text-[#6B7280]">{fmt(getOpen(l))}</td>
                        <td className="px-4 py-3 font-semibold text-[#1C2B3A]">{fmt(close)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            type === 'Dr'
                              ? 'bg-[#E8F5ED] text-[#2D7D46]'
                              : 'bg-[#FDECEA] text-[#C0392B]'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">
                          {getGstin(l) || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={l.status === 'Inactive' ? 'Inactive' : 'Active'} variant={l.status === 'Inactive' ? 'gray' : 'green'} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(total > pageSize || filtered.length > 0) && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#ECEEEF]">
              <p className="text-xs text-[#9CA3AF]">
                {total > 0
                  ? <>Showing <span className="font-semibold text-[#1C2B3A]">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold text-[#1C2B3A]">{total}</span></>
                  : <>{filtered.length} ledgers</>
                }
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { const pg = page - 1; setPage(pg); load(search, pg); }}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6] transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pg;
                    if (totalPages <= 5) pg = i + 1;
                    else if (page <= 3) pg = i + 1;
                    else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                    else pg = page - 2 + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => { setPage(pg); load(search, pg); }}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          pg === page
                            ? 'bg-[#3F5263] text-white'
                            : 'border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { const pg = page + 1; setPage(pg); load(search, pg); }}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-xs font-medium border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6] transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drawer — Ledger Detail */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={getName(drawer || {})}>
        {drawer && (
          <div className="space-y-4">

            {/* Balance summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
                <p className="text-xs text-[#9CA3AF] mb-1">Opening Balance</p>
                <p className="text-lg font-bold text-[#1C2B3A]">{fmt(getOpen(drawer))}</p>
              </div>
              <div className={`p-4 rounded-xl border ${
                getBalType(drawer) === 'Dr'
                  ? 'bg-[#E8F5ED] border-[#A8D5BC]'
                  : 'bg-[#FDECEA] border-[#EDBBB8]'
              }`}>
                <p className="text-xs text-[#9CA3AF] mb-1">Closing Balance</p>
                <p className={`text-lg font-bold ${getBalType(drawer) === 'Dr' ? 'text-[#2D7D46]' : 'text-[#C0392B]'}`}>
                  {fmt(Math.abs(getClose(drawer)))} {getBalType(drawer)}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#ECEEEF]">
              {LEDGER_TABS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setLedgerTab(i)}
                  className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                    ledgerTab === i
                      ? 'text-[#3F5263] border-b-2 border-[#3F5263] font-semibold'
                      : 'text-[#6B7280] hover:text-[#1C2B3A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab: Details */}
            {ledgerTab === 0 && (
              <div className="space-y-0">
                {[
                  ['Ledger Name', getName(drawer)],
                  ['Group', getGroup(drawer)],
                  ['Balance Type', getBalType(drawer)],
                  ['GSTIN', getGstin(drawer) || '—'],
                  ['PAN', drawer.pan || drawer.PAN || '—'],
                  ['Phone', drawer.phone || drawer.PHONE || '—'],
                  ['Email', drawer.email || drawer.EMAIL || '—'],
                  ['Alter ID', drawer.alter_id || drawer.ALTERID || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#F4F5F6]">
                    <span className="text-xs text-[#9CA3AF]">{label}</span>
                    <span className="text-sm font-medium text-[#1C2B3A] max-w-[60%] text-right truncate">{value}</span>
                  </div>
                ))}
                <p className="text-xs text-[#B0B7BF] text-center pt-3">
                  Full transaction history available after Tally sync
                </p>
              </div>
            )}

            {/* Tab: Balance Trend */}
            {ledgerTab === 1 && (
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Balance Movement</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={movementData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="ledgerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3F5263" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3F5263" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#ECEEEF" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={v => [fmt(v), 'Balance']}
                      contentStyle={{ fontSize: 11, border: '1px solid #D9DCE0', borderRadius: 8 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#3F5263"
                      strokeWidth={2}
                      fill="url(#ledgerGrad)"
                      dot={{ r: 2, fill: '#3F5263', strokeWidth: 0 }}
                      activeDot={{ r: 4, fill: '#3F5263' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-[#B0B7BF] text-center mt-2">Sample data · updates after sync</p>
              </div>
            )}

            {/* Tab: GST Info */}
            {ledgerTab === 2 && (
              <div className="space-y-0">
                {getGstin(drawer) ? (
                  [
                    ['GSTIN', getGstin(drawer)],
                    ['Registration Type', 'Regular'],
                    ['Place of Supply', 'Maharashtra (27)'],
                    ['Classification', 'B2B'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#F4F5F6]">
                      <span className="text-xs text-[#9CA3AF]">{label}</span>
                      <span className="text-sm font-mono font-medium text-[#1C2B3A]">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">No GSTIN linked to this ledger</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
