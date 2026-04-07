import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Edit, Trash2, Search, RefreshCw, WifiOff, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { fetchAuditTrail, retryAuditEntry } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import wsService from '../../services/websocket';

const fmt = n => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const actionVariant = { Created: 'green', Modified: 'yellow', Deleted: 'red' };
const TABS = ['Day Book', 'My Entries'];

// Map Tally voucher types to display labels
const getVoucherTypeLabel = (type) => {
  const map = {
    'Sales': 'Sales Invoice',
    'Purchase': 'Purchase Invoice',
    'Payment': 'Payment Voucher',
    'Receipt': 'Receipt Voucher',
    'Journal': 'Journal Voucher',
    'Contra': 'Contra Voucher',
    'Credit Note': 'Credit Note',
    'Debit Note': 'Debit Note',
    'Sales Order': 'Sales Order',
    'Purchase Order': 'Purchase Order',
  };
  return map[type] || type || 'Voucher';
};

export default function AuditTrail() {
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { selectedCompany, token } = useAuth();
  const [myEntries, setMyEntries] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState(null);
  const [myFilter, setMyFilter] = useState('all');
  const [retrying, setRetrying] = useState({});

  const loadData = async () => {
    if (!token || !selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.fetchVouchers({
        companyGuid: selectedCompany.guid,
        page: 1,
        pageSize: 500,
        searchText: search,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      const list = res?.data?.vouchers || [];
      setVouchers(list);
    } catch (err) {
      console.warn('Vouchers fetch error:', err.message);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedCompany?.guid, token, fromDate, toDate]);
  useEffect(() => {
    const unsub = wsService.on('synced', () => loadData());
    return unsub;
  }, [selectedCompany?.guid]);

  // Get unique voucher types for filter
  const voucherTypes = ['All', ...Array.from(new Set(vouchers.map(v => v.voucher_type).filter(Boolean)))];

  const filtered = vouchers.filter(v => {
    const s = !search || (v.party_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.voucher_number || '').toLowerCase().includes(search.toLowerCase());
    const t = typeFilter === 'All' || v.voucher_type === typeFilter;
    const d1 = !fromDate || !v.date || v.date >= fromDate.replace(/-/g, '');
    const d2 = !toDate || !v.date || v.date <= toDate.replace(/-/g, '');
    return s && t && d1 && d2;
  });

  const loadMyEntries = useCallback(() => {
    if (!selectedCompany?.guid) return;
    setMyLoading(true);
    setMyError(null);
    fetchAuditTrail({ companyGuid: selectedCompany.guid, status: myFilter === 'all' ? undefined : myFilter, limit: 100 })
      .then(res => { if (res?.data) { setMyEntries(res.data.entries || []); setMyStats(res.data.stats); } })
      .catch(e => setMyError(e?.message || 'Failed to load'))
      .finally(() => setMyLoading(false));
  }, [selectedCompany?.guid, myFilter]);

  useEffect(() => { if (tab === 1) loadMyEntries(); }, [tab, loadMyEntries]);

  const retryEntry = async (id) => {
    setRetrying(r => ({ ...r, [id]: true }));
    retryAuditEntry(id)
      .then(() => loadMyEntries())
      .catch(e => setMyError(e?.message))
      .finally(() => setRetrying(r => ({ ...r, [id]: false })));
  };

  const STATUS_CFG = {
    success:         { label: 'In Tally',    cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    desktop_offline: { label: 'Offline',     cls: 'text-amber-700 bg-amber-50 border-amber-200' },
    pending:         { label: 'Pending',     cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    failed:          { label: 'Failed',      cls: 'text-red-700 bg-red-50 border-red-200' },
  };
  const TYPE_LBL = { sales:'Sales Invoice', purchase:'Purchase Invoice', payment:'Payment', receipt:'Receipt', journal:'Journal', contra:'Contra', credit_note:'Credit Note', debit_note:'Debit Note', sales_order:'Sales Order', purchase_order:'Purchase Order', delivery_note:'Delivery Note', party:'Party/Ledger', item:'Stock Item' };

  // Activity per day chart
  const activityByDay = (() => {
    const map = {};
    vouchers.forEach(v => {
      if (!v.date) return;
      const day = v.date.slice(-2) || '?';
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).slice(0, 12).map(([day, count]) => ({ day, count }));
  })();

  const summary = {
    total: vouchers.length,
    sales: vouchers.filter(v => v.voucher_type?.includes('Sales')).length,
    purchase: vouchers.filter(v => v.voucher_type?.includes('Purchase')).length,
    payment: vouchers.filter(v => v.voucher_type?.includes('Payment') || v.voucher_type?.includes('Receipt')).length,
  };

  const cols = [
    { key: 'date', label: 'Date', render: v => <span className="text-[#6B7280]">{v || '—'}</span> },
    { key: 'voucher_number', label: 'Voucher No', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v || '—'}</span> },
    { key: 'voucher_type', label: 'Type', render: v => <span className="text-sm text-[#1C2B3A]">{getVoucherTypeLabel(v)}</span> },
    { key: 'party_name', label: 'Party', render: v => <span className="text-[#6B7280] truncate max-w-32 block">{v || '—'}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-[#1C2B3A]">{v ? fmt(v) : '—'}</span> },
    { key: 'narration', label: 'Narration', render: v => <span className="text-xs text-[#9CA3AF] truncate max-w-32 block">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Audit Trail</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {selectedCompany?.name || 'No company'} · {loading ? 'Loading...' : `${vouchers.length} vouchers`}
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium hover:text-[#1C2B3A]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Vouchers" value={summary.total} icon={ClipboardList} accent="#3F5263" />
        <KPICard title="Sales" value={summary.sales} icon={Plus} accent="#2D7D46" />
        <KPICard title="Purchase" value={summary.purchase} icon={Edit} accent="#F59E0B" />
        <KPICard title="Payments/Receipts" value={summary.payment} icon={Trash2} accent="#C0392B" />
      </div>

      {/* Chart + Latest */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">Vouchers per Day</p>
          <p className="text-xs text-[#6B7280] mb-4">Activity trend</p>
          {activityByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={activityByDay} barSize={16}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F0EFE9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #D9DCE0', borderRadius: 8 }} />
                <Bar dataKey="count" name="Vouchers" fill="#3F5263" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-36 text-[#9CA3AF] text-sm">
              No data yet — sync from Tally to see activity
            </div>
          )}
        </div>
        <div className="bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Latest Entries</p>
          {vouchers.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] text-center py-6">No vouchers yet — sync from Desktop</p>
          ) : (
            <div className="space-y-2.5">
              {vouchers.slice(0, 5).map((v, i) => (
                <div key={i} className="flex items-start gap-2.5 cursor-pointer hover:bg-[#F4F5F6] p-1.5 rounded-lg" onClick={() => setDrawer(v)}>
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#3F5263]" />
                  <div>
                    <p className="text-xs font-medium text-[#1C2B3A]">{v.voucher_number} – {getVoucherTypeLabel(v.voucher_type)}</p>
                    <p className="text-xs text-[#6B7280]">{v.party_name || '—'} · {v.date || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day Book Table */}
      <div className="bg-white border border-[#D9DCE0] rounded-2xl">
        <div className="flex border-b border-[#D9DCE0] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#3F5263] bg-[#ECEEEF]' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search party or voucher no..."
                className="notion-input pl-8 w-full text-sm" />
            </div>
            {/* Voucher type */}
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="notion-input text-sm text-[#6B7280]">
              {voucherTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            {/* Date range */}
            <div className="flex items-center gap-2 bg-white border border-[#D9DCE0] rounded-lg px-3 py-1.5">
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="text-xs text-[#1C2B3A] outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#D9DCE0] rounded-lg px-3 py-1.5">
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">To</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="text-xs text-[#1C2B3A] outline-none bg-transparent"
              />
            </div>
            {/* Clear dates */}
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-xs text-[#C0392B] hover:text-[#C0392B] font-medium px-2 py-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors"
              >
                Clear dates
              </button>
            )}
          </div>

          {tab === 0 ? (
            loading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-[#F4F5F6] rounded-lg animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-[#9CA3AF]">
                <ClipboardList size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No vouchers found</p>
                <p className="text-xs mt-1">Sync from TallyDekho Desktop to see Day Book data</p>
              </div>
            ) : (
              <Table columns={cols} data={filtered} onRowClick={setDrawer} />
            )
          ) : (
            /* My Entries — write_queue */
            <div>
              {myError && <div className="mb-3 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">{myError}</div>}
              <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
                <div className="flex gap-1.5">
                  {['all','success','desktop_offline','failed'].map(k => (
                    <button key={k} onClick={() => setMyFilter(k)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      myFilter === k ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#6B7280] border-[#D9DCE0] hover:border-[#1A1A1A]'
                    }`}>{k === 'all' ? 'All' : k === 'success' ? '✓ In Tally' : k === 'desktop_offline' ? '⏳ Offline' : '✗ Failed'}</button>
                  ))}
                </div>
                <button onClick={loadMyEntries} disabled={myLoading} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1C2B3A] disabled:opacity-40">
                  <RefreshCw size={12} className={myLoading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
              {myLoading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[#F4F5F6] rounded-xl animate-pulse" />)}</div>
              ) : myEntries.length === 0 ? (
                <div className="py-10 text-center text-[#9CA3AF]">
                  <CheckCircle2 size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No entries yet — create an invoice to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myEntries.map(e => {
                    const cfg = STATUS_CFG[e.status] || STATUS_CFG.pending;
                    return (
                      <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[#E8E7E3] rounded-xl hover:border-[#B0B8C1] transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.status === 'success' ? 'bg-emerald-500' : e.status === 'desktop_offline' ? 'bg-amber-400 animate-pulse' : e.status === 'failed' ? 'bg-red-500' : 'bg-blue-400 animate-pulse'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#1C2B3A]">{TYPE_LBL[e.entry_type] || e.entry_type}</span>
                            <span className="text-xs text-[#6B7280] truncate max-w-[180px]">{e.entry_label}</span>
                            {e.amount && parseFloat(e.amount) > 0 && <span className="text-xs font-bold text-[#3F5263]">₹{parseFloat(e.amount).toLocaleString('en-IN',{maximumFractionDigits:0})}</span>}
                            {e.tally_voucher_number && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">#{e.tally_voucher_number}</span>}
                          </div>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{new Date(e.created_at*1000).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:true})} · {e.source === 'mobile' ? '📱' : '🌐'}
                            {e.error_message && <span className="text-red-500 ml-2">{e.error_message.slice(0,60)}</span>}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cfg.cls}`}>{cfg.label}</span>
                        {e.status !== 'success' && (
                          <button onClick={() => retryEntry(e.id)} disabled={retrying[e.id]}
                            className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-50 transition-colors">
                            <RotateCcw size={10} className={retrying[e.id] ? 'animate-spin' : ''} />
                            {retrying[e.id] ? '…' : 'Push'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voucher detail drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.voucher_number || 'Voucher Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#1C2B3A]">{drawer.party_name || 'No party'}</p>
                <p className="font-mono text-xs text-[#6B7280] mt-0.5">{drawer.voucher_number || '—'}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#ECEEEF] text-[#3F5263] border border-[#C5CBD0]">
                {getVoucherTypeLabel(drawer.voucher_type)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Date', drawer.date || '—'],
                ['Voucher No', drawer.voucher_number || '—'],
                ['Type', getVoucherTypeLabel(drawer.voucher_type)],
                ['Amount', drawer.amount ? fmt(drawer.amount) : '—'],
                ['Reference', drawer.reference || '—'],
                ['Narration', drawer.narration || '—'],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#F9F9F9] rounded-xl border border-[#D9DCE0]">
                  <p className="text-xs text-[#6B7280] mb-1">{l}</p>
                  <p className="font-medium text-[#1C2B3A] text-sm break-all">{v}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#1A1A1A' }}>
              View Full Voucher
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
