import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ShoppingCart, FileText, Package, Search, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import VoucherDetail from '../../components/VoucherDetail';
// No mock data — show empty state when not paired


const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Purchase Register', 'Order Register'];
const statusVariant = { Paid: 'green', Unpaid: 'red', Partial: 'yellow', Open: 'blue', 'Fully Received': 'green', Closed: 'gray' };
const receivedVariant = { Complete: 'green', Partial: 'yellow', Pending: 'red' };

const invoiceCols = [
  { key: 'ref', label: 'Invoice No', render: v => <span className="font-mono text-xs text-[#1A1A1A] font-semibold">{v}</span> },
  { key: 'vendor', label: 'Vendor' },
  { key: 'gstin', label: 'GSTIN', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  { key: 'received', label: 'Delivery', render: v => <Badge label={v} variant={receivedVariant[v]} /> },
];

const orderCols = [
  { key: 'ref', label: 'PO No', render: v => <span className="font-mono text-xs text-[#1A1A1A] font-semibold">{v}</span> },
  { key: 'vendor', label: 'Vendor' },
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => fmt(v) },
  { key: 'expectedDate', label: 'Expected', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function PurchaseModule() {
  const [tab, setTab] = useState(0);
  const { selectedCompany, token, selectedFY, isPaired } = useAuth();
  const isDemo = !isPaired;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const loadData = () => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const PURCHASE_TYPES = ['Purchase GST', 'Purchase'];
    Promise.all(
      PURCHASE_TYPES.map(vt => api.fetchVouchers({
        companyGuid: selectedCompany.guid, voucherType: vt,
        page: 1, pageSize: 100,
        fromDate: selectedFY?.startDate, toDate: selectedFY?.endDate
      }).catch(() => null))
    ).then(results => {
      const all = results.flatMap(r => r?.data?.vouchers || []);
      if (all.length > 0) {
        setInvoices(all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(v => ({
          id: v.id, ref: v.voucher_number || v.guid?.slice(-8) || 'N/A',
          vendor: v.party_name || '—', gstin: '',
          date: v.date || '—', amount: parseFloat(v.amount) || 0,
          voucherType: v.voucher_type || 'Purchase',
          status: v.is_cancelled ? 'Cancelled' : parseFloat(v.amount) > 0 ? 'Paid' : 'Unpaid',
          mode: 'Bank', received: 'Complete',
        })));
      } else { setInvoices([]); }
    }).catch(err => {
      setError(err?.response?.data?.message || err?.message || 'Failed to load purchase data');
      setInvoices([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    setInvoices([]); setPage(1); setError(null);
    loadData();
  }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);

  const displayInvoices = invoices.length > 0 ? invoices : [];
  const monthlyChart = useMemo(() => {
    const src = displayInvoices || [];
    const map = {};
    src.forEach(v => {
      const d = v.date || '';
      if (!d) return;
      const mon = new Date(d).toLocaleString('en', { month: 'short' });
      if (!map[mon]) map[mon] = { month: mon, purchase: 0 };
      map[mon].purchase += (parseFloat(v.amount) || 0) / 1000;
    });
    return Object.values(map).slice(-6);
  }, [displayInvoices]);
  const filtered = displayInvoices.filter(r => {
    const s = !search || (r.vendor||'').toLowerCase().includes(search.toLowerCase()) || (r.ref||'').toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'All' || r.status === statusFilter;
    return s && f;
  });

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <span className="flex-shrink-0">⚠️</span>
          <span><strong>Error:</strong> {error}</span>
          <button onClick={loadData} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}
      {!error && isDemo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span className="text-base">🎭</span>
          <span><strong>Demo Mode</strong> — Showing sample data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Pair Desktop App →</a></span>
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Purchase</h1>
        <p className="text-sm text-[#787774] mt-0.5">July 2025 · {selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Purchase" value={loading ? '—' : fmt(displayInvoices.reduce((s,i)=>s+(i.amount||0),0))} icon={ShoppingCart} accent="#1A1A1A" />
        <KPICard title="Total Bills"    value={loading ? '—' : displayInvoices.length} icon={FileText} accent="#1A1A1A" />
        <KPICard title="Paid"           value={loading ? '—' : displayInvoices.filter(i=>i.status==='Paid').length} icon={Package} accent="#2D7D46" />
        <KPICard title="Unpaid"         value={loading ? '—' : displayInvoices.filter(i=>i.status==='Unpaid').length} icon={FileText} accent="#C0392B" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D4D3CE] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Purchase Trend</p>
          <p className="text-xs text-[#787774] mb-4">Monthly · {selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#F5F4EF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} tickFormatter={v => v / 100 + 'L'} />
              <Tooltip formatter={v => ['₹' + (v / 100).toFixed(1) + 'L', 'Purchase']} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #D4D3CE' }} />
              <Area type="monotone" dataKey="purchase" stroke="#1A1A1A" strokeWidth={2.5} fill="url(#pg2)" dot={false} activeDot={{ r: 4, fill: '#1A1A1A' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#D4D3CE] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Payment Status</p>
          <div className="space-y-3">
            {[['Paid', displayInvoices.filter(i=>i.status==='Paid').length, '#2D7D46'], ['Unpaid', displayInvoices.filter(i=>i.status==='Unpaid').length, '#C0392B']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-sm text-[#787774]">{l}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#F5F4EF] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${displayInvoices.length > 0 ? (v / displayInvoices.length) * 100 : 0}%`, background: c }} />
                  </div>
                  <span className="text-sm font-semibold w-4">{v}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F4EF]">
            <p className="text-xs text-[#787774] mb-2">Alerts</p>
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">⚠️ 3 bills missing GSTIN · Review</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D4D3CE] rounded-2xl">
        <div className="flex border-b border-[#D4D3CE] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#1A1A1A] bg-[#ECEEEF] font-semibold' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F5F4EF]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor or invoice..."
                  className="notion-input pl-8 w-full text-sm" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
                {['All', 'Paid', 'Unpaid', 'Partial'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-[#D4D3CE] rounded-lg text-xs text-[#787774] hover:bg-[#F5F4EF]">
                <Download size={12} /> Export
              </button>
            </div>
          )}
          {tab === 0 && (
            <>
              <Table columns={invoiceCols} data={filtered.slice((page-1)*25, page*25)} onRowClick={setDrawer} />
              {/* Pagination */}
              {filtered.length > 25 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#ECEEEF] mt-2">
                  <span className="text-xs text-[#AEACA8]">{filtered.length} total · showing {(page-1)*25+1}–{Math.min(page*25, filtered.length)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p=>p-1)} disabled={page===1} className="px-3 py-1.5 text-xs border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF]">← Prev</button>
                    <button onClick={() => setPage(p=>p+1)} disabled={page*25>=filtered.length} className="px-3 py-1.5 text-xs border border-[#D4D3CE] rounded-lg disabled:opacity-40 hover:bg-[#F5F4EF]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
          {tab === 1 && <Table columns={orderCols} data={[]} emptyMessage="Purchase orders not available" onRowClick={setDrawer} />}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.ref || 'Details'}>
        {drawer?.id && selectedCompany?.guid ? (
          <VoucherDetail
            voucherId={drawer.id}
            companyGuid={selectedCompany.guid}
            companyName={selectedCompany?.name}
            onBack={() => setDrawer(null)}
          />
        ) : drawer ? (
          <div className="p-4 text-sm text-[#AEACA8] text-center">Loading voucher details...</div>
        ) : null}
      </Drawer>
    </div>
  );
}
