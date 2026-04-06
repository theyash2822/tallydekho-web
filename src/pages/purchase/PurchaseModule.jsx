import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ShoppingCart, FileText, Package, Search, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import VoucherDetail from '../../components/VoucherDetail';
import { purchaseInvoices, purchaseOrders, purchaseKPIs } from '../../data/purchaseMock';
import { monthlySalesPurchase } from '../../data/mockData';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Purchase Register', 'Order Register'];
const statusVariant = { Paid: 'green', Unpaid: 'red', Partial: 'yellow', Open: 'blue', 'Fully Received': 'green', Closed: 'gray' };
const receivedVariant = { Complete: 'green', Partial: 'yellow', Pending: 'red' };

const invoiceCols = [
  { key: 'ref', label: 'Invoice No', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'vendor', label: 'Vendor' },
  { key: 'gstin', label: 'GSTIN', render: v => <span className="font-mono text-xs text-[#6B7280]">{v}</span> },
  { key: 'date', label: 'Date', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  { key: 'received', label: 'Delivery', render: v => <Badge label={v} variant={receivedVariant[v]} /> },
];

const orderCols = [
  { key: 'ref', label: 'PO No', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'vendor', label: 'Vendor' },
  { key: 'date', label: 'Date', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => fmt(v) },
  { key: 'expectedDate', label: 'Expected', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function PurchaseModule() {
  const [tab, setTab] = useState(0);
  const { selectedCompany, token, selectedFY, isPaired } = useAuth();
  const isDemo = !isPaired;
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    setInvoices([]); setPage(1);
    if (!selectedCompany?.guid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch all purchase-type vouchers
    const PURCHASE_TYPES = ['Purchase GST', 'Purchase'];
    Promise.all(
      PURCHASE_TYPES.map(vt => api.fetchVouchers({ companyGuid: selectedCompany.guid, voucherType: vt, page: 1, pageSize: 100, fromDate: selectedFY?.startDate, toDate: selectedFY?.endDate }).catch(() => null))
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
        setUsingMock(false);
      } else { setInvoices([]); setUsingMock(false); }
    }).catch(() => { setInvoices([]); setUsingMock(false); })
    .finally(() => setLoading(false));
  }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);

  const displayInvoices = invoices.length > 0 ? invoices : (isDemo ? purchaseInvoices : []);
  const filtered = displayInvoices.filter(r => {
    const s = !search || (r.vendor||'').toLowerCase().includes(search.toLowerCase()) || (r.ref||'').toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'All' || r.status === statusFilter;
    return s && f;
  });

  return (
    <div className="space-y-5">
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span className="text-base">🎭</span>
          <span><strong>Demo Mode</strong> — Showing sample data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Pair Desktop App →</a></span>
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Purchase</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">July 2025 · {selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Purchase" value={loading ? '—' : fmt(displayInvoices.reduce((s,i)=>s+(i.amount||0),0))} icon={ShoppingCart} accent="#3F5263" />
        <KPICard title="Total Bills"    value={loading ? '—' : displayInvoices.length} icon={FileText} accent="#526373" />
        <KPICard title="Paid"           value={loading ? '—' : displayInvoices.filter(i=>i.status==='Paid').length} icon={Package} accent="#2D7D46" />
        <KPICard title="Unpaid"         value={loading ? '—' : displayInvoices.filter(i=>i.status==='Unpaid').length} icon={FileText} accent="#C0392B" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">Purchase Trend</p>
          <p className="text-xs text-[#6B7280] mb-4">Monthly · {selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlySalesPurchase} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#526373" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#526373" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#F0EFE9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => v / 100 + 'L'} />
              <Tooltip formatter={v => ['₹' + (v / 100).toFixed(1) + 'L', 'Purchase']} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #D9DCE0' }} />
              <Area type="monotone" dataKey="purchase" stroke="#526373" strokeWidth={2.5} fill="url(#pg2)" dot={false} activeDot={{ r: 4, fill: '#526373' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-4">Payment Status</p>
          <div className="space-y-3">
            {[['Paid', purchaseKPIs.paid, '#2D7D46'], ['Unpaid', purchaseKPIs.unpaid, '#C0392B']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-sm text-[#6B7280]">{l}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#F0EFE9] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(v / purchaseKPIs.count) * 100}%`, background: c }} />
                  </div>
                  <span className="text-sm font-semibold w-4">{v}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F0EFE9]">
            <p className="text-xs text-[#6B7280] mb-2">Alerts</p>
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">⚠️ 3 bills missing GSTIN · Review</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-2xl">
        <div className="flex border-b border-[#D9DCE0] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor or invoice..."
                  className="notion-input pl-8 w-full text-sm" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="notion-input text-sm text-[#6B7280]">
                {['All', 'Paid', 'Unpaid', 'Partial'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-[#D9DCE0] rounded-lg text-xs text-[#6B7280] hover:bg-[#F4F5F6]">
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
                  <span className="text-xs text-[#9CA3AF]">{filtered.length} total · showing {(page-1)*25+1}–{Math.min(page*25, filtered.length)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p=>p-1)} disabled={page===1} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">← Prev</button>
                    <button onClick={() => setPage(p=>p+1)} disabled={page*25>=filtered.length} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
          {tab === 1 && <Table columns={orderCols} data={purchaseOrders} onRowClick={setDrawer} />}
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
          <div className="p-4 text-sm text-[#9CA3AF] text-center">Loading voucher details...</div>
        ) : null}
      </Drawer>
    </div>
  );
}
