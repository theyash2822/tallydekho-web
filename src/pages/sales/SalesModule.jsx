import { useState, useEffect } from 'react';
import { TrendingUp, FileText, ShoppingBag, FileCheck, Search, Download, RefreshCw } from 'lucide-react';
import wsService from '../../services/websocket';
import InvoicePDF from '../../components/InvoicePDF';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { salesInvoices, salesOrders, quotations, salesKPIs } from '../../data/salesMock';
import { monthlySalesPurchase } from '../../data/mockData';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Sales Register', 'Order Register', 'Quotations'];

const statusVariant = { Paid: 'green', Unpaid: 'red', Partial: 'yellow', Open: 'blue', Converted: 'green', Expired: 'gray', Lost: 'red', 'Fully Invoiced': 'green', 'Partially Invoiced': 'yellow', Closed: 'gray' };

const irnVariant  = { generated: 'green', pending: 'yellow', error: 'red', none: 'gray' };
const ewbVariant  = { active: 'green', expiring: 'yellow', cancelled: 'gray', generated: 'green', none: 'gray' };

const invoiceCols = [
  { key: 'ref', label: 'Invoice No', render: v => <span className="font-mono text-xs text-[#059669] font-semibold">{v}</span> },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  { key: 'irn', label: 'IRN', render: v => <Badge label={v === 'none' ? '—' : v} variant={irnVariant[v]} /> },
  { key: 'ewb', label: 'E-Way Bill', render: v => <Badge label={v === 'none' ? '—' : v} variant={ewbVariant[v]} /> },
];

const orderCols = [
  { key: 'ref', label: 'Order No', render: v => <span className="font-mono text-xs text-[#059669] font-semibold">{v}</span> },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => fmt(v) },
  { key: 'dueDate', label: 'Due Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

const quotationCols = [
  { key: 'ref', label: 'Quote No', render: v => <span className="font-mono text-xs text-[#059669] font-semibold">{v}</span> },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => fmt(v) },
  { key: 'validity', label: 'Valid Till', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function SalesModule() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pdfInvoice, setPdfInvoice] = useState(null);

  // Auto-refresh when Tally syncs new data
  useEffect(() => {
    const unsub = wsService.on('synced', () => setRefreshKey(k => k + 1));
    return unsub;
  }, []);

  const filtered = salesInvoices.filter(r => {
    const s = !search || r.customer.toLowerCase().includes(search.toLowerCase()) || r.ref.toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'All' || r.status === statusFilter;
    return s && f;
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Sales</h1>
          <p className="text-sm text-[#787774] mt-0.5">July 2025 · FY 2025-26</p>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-1.5 text-xs text-[#059669] font-medium hover:text-[#047857]">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Sales" value={fmt(salesKPIs.total)} icon={TrendingUp} accent="#059669" trend={{ up: true, label: '14.2% vs Jun' }} />
        <KPICard title="Total Tax" value={fmt(salesKPIs.tax)} icon={FileText} accent="#F59E0B" />
        <KPICard title="Avg Invoice" value={fmt(salesKPIs.avgInvoice)} icon={ShoppingBag} accent="#8B5CF6" />
        <KPICard title="Total Invoices" value={salesKPIs.count} icon={FileCheck} accent="#06B6D4" />
      </div>

      {/* Chart + Top customers */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Sales Trend</p>
          <p className="text-xs text-[#787774] mb-4">Monthly · FY 2025-26 (₹K)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlySalesPurchase} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} tickFormatter={v => v / 100 + 'L'} />
              <Tooltip formatter={v => ['₹' + (v / 100).toFixed(1) + 'L', 'Sales']} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} />
              <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2.5} fill="url(#sg)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Status Summary</p>
          <div className="space-y-3">
            {[['Paid', salesKPIs.paid, '#059669'], ['Unpaid', salesKPIs.unpaid, '#F43F5E'], ['Partial', salesKPIs.partial, '#F59E0B']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-sm text-[#787774]">{l}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#F1F0EC] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(v / salesKPIs.count) * 100}%`, background: c }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1A1A1A] w-4">{v}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F1F0EC]">
            <p className="text-xs text-[#787774] mb-2">Alerts</p>
            <div className="space-y-1.5">
              <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">⚠️ 2 IRNs pending generation</div>
              <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">⚠️ 1 E-Way Bill expiring soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E8E7E3] rounded-2xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Filters */}
          {tab === 0 && (
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search party or invoice no..."
                  className="notion-input pl-8 w-full text-sm" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
                {['All', 'Paid', 'Unpaid', 'Partial'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E7E3] rounded-lg text-xs text-[#787774] hover:bg-[#F7F6F3]">
                <Download size={12} /> Export
              </button>
            </div>
          )}

          {tab === 0 && <Table columns={invoiceCols} data={filtered} onRowClick={setDrawer} />}
          {tab === 1 && <Table columns={orderCols} data={salesOrders} onRowClick={setDrawer} />}
          {tab === 2 && <Table columns={quotationCols} data={quotations} onRowClick={setDrawer} />}
        </div>
      </div>

      {/* PDF Preview */}
      <InvoicePDF open={!!pdfInvoice} onClose={() => setPdfInvoice(null)} invoice={pdfInvoice} />

      {/* Drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.ref || 'Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#1A1A1A] text-base">{drawer.customer || drawer.vendor}</p>
                <p className="font-mono text-xs text-[#787774] mt-0.5">{drawer.ref}</p>
              </div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(drawer).filter(([k]) => !['id'].includes(k)).map(([k, v]) => (
                <div key={k} className="p-3 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                  <p className="text-xs text-[#787774] capitalize mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-medium text-[#1A1A1A] text-sm">{typeof v === 'number' ? fmt(v) : String(v)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {tab === 0 && drawer.status === 'Open' && (
                <button className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>Convert to Invoice</button>
              )}
              <button onClick={() => setPdfInvoice(drawer)} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>View PDF</button>
              <button onClick={() => setPdfInvoice(drawer)} className="px-4 py-2.5 rounded-lg text-sm text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
