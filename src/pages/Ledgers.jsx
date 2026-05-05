import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Search, RefreshCw, TrendingUp, TrendingDown, Filter, FileText, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import VoucherDetail from '../components/VoucherDetail';
import { useSettings } from '../contexts/SettingsContext';

const LEDGER_TABS = ['Details', 'Vouchers', 'Balance Trend', 'GST Info'];

const PAGE_SIZE_V = 15;
const typeChip = (type) => {
  if (!type) return 'bg-[#ECEEEF] text-[#1A1A1A]';
  if (type.includes('Sales'))    return 'bg-[#E8F5ED] text-[#2D7D46]';
  if (type.includes('Purchase')) return 'bg-[#FFFBEB] text-[#D97706]';
  if (type.includes('Payment'))  return 'bg-[#FEF2F2] text-[#C0392B]';
  if (type.includes('Receipt'))  return 'bg-[#E8F5ED] text-[#2D7D46]';
  if (type.includes('Journal'))  return 'bg-[#EFF6FF] text-[#2563EB]';
  if (type.includes('Contra'))   return 'bg-[#FFFBEB] text-[#D97706]';
  return 'bg-[#ECEEEF] text-[#1A1A1A]';
};

// Vouchers linked to a ledger — paginated, deduped, with drill-down
function LedgerVouchers({ ledger, companyGuid }) {
  const [vouchers, setVouchers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [typeFilter, setTypeFilter]     = useState('All');
  const [search, setSearch]             = useState('');

  const loadVouchers = useCallback(async (pg = 1) => {
    if (!ledger || !companyGuid) return;
    setLoading(true);
    const name = (ledger.name || ledger.NAME || '').trim();
    try {
      const r = await api.fetchLedgerVouchers({ companyGuid, ledgerName: name, page: pg, pageSize: PAGE_SIZE_V });
      const list = r?.data?.vouchers || [];
      // Client-side dedup by id
      const seen = new Set();
      const deduped = list.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
      setVouchers(deduped);
      setTotal(r?.data?.total || deduped.length);
    } catch { setVouchers([]); }
    finally { setLoading(false); }
  }, [ledger?.guid, companyGuid]);

  useEffect(() => {
    setVouchers([]); setPage(1); setTotal(0); setSelectedVoucher(null); setTypeFilter('All'); setSearch('');
    loadVouchers(1);
  }, [ledger?.guid, companyGuid]);

  if (selectedVoucher) {
    return (
      <VoucherDetail
        voucherId={selectedVoucher.id}
        companyGuid={companyGuid}
        companyName={ledger?.company_name}
        onBack={() => setSelectedVoucher(null)}
      />
    );
  }

  // Apply client-side filters on top of paginated result
  const filtered = vouchers.filter(v => {
    const tMatch = typeFilter === 'All' || v.voucher_type === typeFilter;
    const sMatch = !search || (v.voucher_number||'').toLowerCase().includes(search.toLowerCase()) ||
      (v.party_name||'').toLowerCase().includes(search.toLowerCase()) ||
      (v.narration||'').toLowerCase().includes(search.toLowerCase());
    return tMatch && sMatch;
  });

  const types = ['All', ...Array.from(new Set(vouchers.map(v => v.voucher_type).filter(Boolean)))];
  const totalPages = Math.ceil(total / PAGE_SIZE_V);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vouchers..."
            className="w-full pl-6 pr-2 py-1.5 text-xs bg-[#F5F4EF] border border-[#ECEEEF] rounded-lg outline-none focus:border-[#1A1A1A]"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="py-1.5 px-2 text-xs bg-white border border-[#D4D3CE] rounded-lg outline-none focus:border-[#1A1A1A]">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-[#AEACA8]">
        {loading ? 'Loading...' : `${total} voucher${total !== 1 ? 's' : ''} · showing ${filtered.length} · click to view`}
      </p>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#F5F4EF] rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <FileText size={24} className="mx-auto mb-2 text-[#D4D3CE]" />
          <p className="text-sm text-[#AEACA8]">No vouchers found</p>
          <p className="text-xs text-[#C5CBD0] mt-1">Vouchers appear when this party has transactions in Tally</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map(v => (
            <div key={v.id}
              className="py-3 border-b border-[#F5F4EF] last:border-0 hover:bg-[#F5F4EF] -mx-1 px-1 rounded-lg cursor-pointer transition-colors"
              onClick={() => setSelectedVoucher(v)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeChip(v.voucher_type)}`}>
                      {v.voucher_type || 'Voucher'}
                    </span>
                    <span className="font-mono text-xs text-[#AEACA8]">{v.voucher_number}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#AEACA8]">{v.date || '—'}</span>
                    {v.party_name && v.party_name !== ledger?.name && (
                      <span className="text-xs text-[#787774] truncate max-w-32">{v.party_name}</span>
                    )}
                  </div>
                  {v.narration && <p className="text-xs text-[#AEACA8] mt-0.5 truncate">{v.narration}</p>}
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${
                  parseFloat(v.amount) > 0 ? 'text-[#2D7D46]' : 'text-[#AEACA8]'
                }`}>
                  {parseFloat(v.amount) > 0 ? fmt(v.amount) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-[#ECEEEF]">
          <span className="text-xs text-[#AEACA8]">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => { const pg = page - 1; setPage(pg); loadVouchers(pg); }} disabled={page === 1}
              className="px-2.5 py-1 text-xs border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF]">← Prev</button>
            <button onClick={() => { const pg = page + 1; setPage(pg); loadVouchers(pg); }} disabled={page >= totalPages}
              className="px-2.5 py-1 text-xs border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF]">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const { selectedCompany, token, selectedFY } = useAuth();
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
  const [trendData, setTrendData]     = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [drawerStatement, setDrawerStatement] = useState(null); // FY-computed opening/closing


  const companyGuid = selectedCompany?.guid;

  const load = useCallback(async (searchText = '', pg = 1) => {
    if (!companyGuid) { setLedgers([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const fyParams = selectedFY ? { from: selectedFY.startDate, to: selectedFY.endDate } : {};
      const res = await api.fetchLedgers({ companyGuid, page: pg, pageSize, searchText, ...fyParams, fy: selectedFY?.finYear });
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

  // Reload whenever company changes
  useEffect(() => {
    setLedgers([]);
    setTotal(0);
    setPage(1);
    setSearch('');
    setGroupFilter('All');
    setTypeFilter('All');
    if (companyGuid) load('', 1);
  }, [companyGuid, selectedFY?.uniqueId]); // eslint-disable-line

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
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <span className="flex-shrink-0">⚠️</span>
          <span><strong>Error:</strong> {error}</span>
          <button onClick={() => window.location.reload()} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}

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
          className="flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] hover:text-[#787774] transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Ledgers"   value={loading ? '—' : ledgers.length} icon={BookOpen}     accent="#1A1A1A" />
        <KPICard title="Debit Balance"   value={loading ? '—' : totalDr}        icon={TrendingUp}   accent="#2D7D46" />
        <KPICard title="Credit Balance"  value={loading ? '—' : totalCr}        icon={TrendingDown} accent="#C0392B" />
        <KPICard title="With GSTIN"      value={loading ? '—' : withGstin}      icon={BookOpen}     accent="#798692" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF6E4] border border-[#F0D49A] rounded-xl text-xs text-[#D97706]">
          ⚠️ {error}
        </div>
      )}

      {/* No company */}
      {!companyGuid && !loading && (
        <div className="bg-white border border-[#D4D3CE] rounded-xl p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-[#C5CBD0]" />
          <p className="text-sm font-medium text-[#787774]">Select a company to view ledgers</p>
        </div>
      )}

      {/* Table */}
      {(companyGuid || loading) && (
        <div className="bg-white border border-[#D4D3CE] rounded-xl overflow-hidden">

          {/* Filters */}
          <div className="p-4 border-b border-[#ECEEEF] flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ledger name or GSTIN..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F5F4EF] border border-[#ECEEEF] rounded-lg outline-none focus:border-[#1A1A1A] focus:bg-white transition-all placeholder:text-[#AEACA8]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#AEACA8]" />
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-white border border-[#D4D3CE] rounded-lg outline-none focus:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
              >
                {groups.map(g => <option key={g}>{g}</option>)}
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-white border border-[#D4D3CE] rounded-lg outline-none focus:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Dr">Debit (Dr)</option>
                <option value="Cr">Credit (Cr)</option>
              </select>
            </div>
            <span className="text-xs text-[#AEACA8] ml-auto">
              {filtered.length} shown
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F4EF] border-b border-[#D4D3CE]">
                  {['Ledger Name', 'Group', 'Opening', 'Closing', 'Type', 'GSTIN', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#AEACA8] uppercase tracking-wider whitespace-nowrap">
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
                      <BookOpen size={28} className="mx-auto mb-2 text-[#D4D3CE]" />
                      <p className="text-sm text-[#AEACA8]">No ledgers found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((l, i) => {
                    const type = getBalType(l);
                    const close = getClose(l);
                    return (
                      <tr
                        key={l.guid || l.GUID || i}
                        className="border-b border-[#ECEEEF] hover:bg-[#F5F4EF] cursor-pointer transition-colors"
                        onClick={() => {
                          setDrawer(l);
                          setLedgerTab(0);
                          setTrendData([]);
                          setDrawerStatement(null);
                          // Fetch FY-computed opening/closing from statement API
                          if (companyGuid && l.guid) {
                            const stParams = selectedFY ? { from: selectedFY.startDate, to: selectedFY.endDate } : {};
                            api.fetchLedgerStatement(companyGuid, l.guid, undefined, stParams)
                              .then(r => { if (r?.data) setDrawerStatement(r.data); })
                              .catch(() => {});
                          }
                          // Pre-fetch trend data
                          if (companyGuid && selectedFY) {
                            setTrendLoading(true);
                            api.fetchLedgerTrend({ companyGuid, ledgerName: getName(l), fromDate: selectedFY.startDate, toDate: selectedFY.endDate })
                              .then(r => setTrendData(r?.data || []))
                              .catch(() => setTrendData([]))
                              .finally(() => setTrendLoading(false));
                          }
                        }}
                      >
                        <td className="px-4 py-3 font-medium text-[#1A1A1A]">{getName(l)}</td>
                        <td className="px-4 py-3 text-[#787774] text-xs">{getGroup(l)}</td>
                        <td className="px-4 py-3 text-[#787774]">{fmt(getOpen(l))}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{fmt(close)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            type === 'Dr'
                              ? 'bg-[#E8F5ED] text-[#2D7D46]'
                              : 'bg-[#FDECEA] text-[#C0392B]'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#AEACA8]">
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
              <p className="text-xs text-[#AEACA8]">
                {total > 0
                  ? <>Showing <span className="font-semibold text-[#1A1A1A]">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold text-[#1A1A1A]">{total}</span></>
                  : <>{filtered.length} ledgers</>
                }
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { const pg = page - 1; setPage(pg); load(search, pg); }}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF] transition-colors"
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
                            ? 'bg-[#1A1A1A] text-white'
                            : 'border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF]'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { const pg = page + 1; setPage(pg); load(search, pg); }}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-xs font-medium border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF] transition-colors"
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
      <Drawer open={!!drawer} onClose={() => { setDrawer(null); setDrawerStatement(null); }} title={getName(drawer || {})}>
        {drawer && (
          <div className="space-y-4">

            {/* Balance summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F5F4EF] rounded-xl border border-[#D4D3CE]">
                <p className="text-xs text-[#AEACA8] mb-1">Opening Balance</p>
                <p className="text-lg font-bold text-[#1A1A1A]">
                  {drawerStatement ? fmt(drawerStatement.opening_balance) : fmt(getOpen(drawer))}
                  {drawerStatement && <span className="text-xs font-normal text-[#787774] ml-1">{drawerStatement.opening_balance_type}</span>}
                </p>
              </div>
              <div className={`p-4 rounded-xl border ${
                (drawerStatement?.closing_balance_type || getBalType(drawer)) === 'Dr'
                  ? 'bg-[#E8F5ED] border-[#A8D5BC]'
                  : 'bg-[#FDECEA] border-[#EDBBB8]'
              }`}>
                <p className="text-xs text-[#AEACA8] mb-1">Closing Balance</p>
                <p className={`text-lg font-bold ${
                  (drawerStatement?.closing_balance_type || getBalType(drawer)) === 'Dr' ? 'text-[#2D7D46]' : 'text-[#C0392B]'
                }`}>
                  {drawerStatement ? fmt(drawerStatement.closing_balance) : fmt(Math.abs(getClose(drawer)))}{' '}
                  {drawerStatement ? drawerStatement.closing_balance_type : getBalType(drawer)}
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
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-semibold'
                      : 'text-[#787774] hover:text-[#1A1A1A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab: Vouchers */}
            {ledgerTab === 1 && (
              <LedgerVouchers ledger={drawer} companyGuid={companyGuid} key={drawer?.guid} />
            )}

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
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#F5F4EF]">
                    <span className="text-xs text-[#AEACA8]">{label}</span>
                    <span className="text-sm font-medium text-[#1A1A1A] max-w-[60%] text-right truncate">{value}</span>
                  </div>
                ))}
                <p className="text-xs text-[#B0B7BF] text-center pt-3">
                  Full transaction history available after Tally sync
                </p>
              </div>
            )}

            {/* Tab: Balance Trend */}
            {ledgerTab === 2 && (
              <div>
                <p className="text-xs font-semibold text-[#AEACA8] uppercase tracking-wider mb-3">Transaction Amounts by Month</p>
                {trendLoading ? (
                  <div className="h-36 flex items-center justify-center text-xs text-[#AEACA8]">Loading trend…</div>
                ) : trendData.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-xs text-[#AEACA8]">
                    No transactions in selected FY · do a Hard Sync to update
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="ledgerGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3F5263" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3F5263" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="#ECEEEF" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#AEACA8' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          formatter={v => [fmt(v), 'Transactions']}
                          contentStyle={{ fontSize: 11, border: '1px solid #D4D3CE', borderRadius: 8 }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#3F5263" strokeWidth={2}
                          fill="url(#ledgerGrad)" dot={{ r: 2, fill: '#3F5263', strokeWidth: 0 }}
                          activeDot={{ r: 4, fill: '#3F5263' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-[#B0B7BF] text-center mt-2">{trendData.length} months · {selectedFY?.name || 'current FY'}</p>
                  </>
                )}
              </div>
            )}

            {/* Tab: GST Info */}
            {ledgerTab === 3 && (
              <div className="space-y-0">
                {getGstin(drawer) ? (
                  [
                    ['GSTIN', getGstin(drawer)],
                    drawer.pan ? ['PAN', drawer.pan] : null,
                    drawer.phone ? ['Phone', drawer.phone] : null,
                    drawer.email ? ['Email', drawer.email] : null,
                    drawer.address ? ['Address', drawer.address] : null,
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#F5F4EF]">
                      <span className="text-xs text-[#AEACA8]">{label}</span>
                      <span className="text-sm font-mono font-medium text-[#1A1A1A] max-w-[60%] text-right break-all">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#AEACA8]">No GSTIN linked to this ledger</p>
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
