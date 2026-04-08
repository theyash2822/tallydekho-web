import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, FileText, ShoppingBag, FileCheck, Search, Download, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import InvoicePDF from '../../components/InvoicePDF';
import VoucherDetail from '../../components/VoucherDetail';
// No mock data — show empty state when not paired
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import wsService from '../../services/websocket';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Sales Register', 'Order Register', 'Quotations'];

// All Tally sales-type voucher names
const SALES_TYPES = ['Sales GST', 'Sales', 'Sales Invoice', 'Retail Invoice', 'Tax Invoice'];
const statusVariant = { Paid: 'green', Unpaid: 'red', Partial: 'yellow', Open: 'blue', Converted: 'green', Expired: 'gray', Lost: 'red', 'Fully Invoiced': 'green', 'Partially Invoiced': 'yellow', Closed: 'gray' };

export default function SalesModule() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);
  const [pdfInvoice, setPdfInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;
  const { selectedCompany, token, selectedFY, isPaired } = useAuth();
  const isDemo = !isPaired;
  // Compute monthly chart from real invoice data
  const monthlyChart = useMemo(() => {
    const src = invoices.length > 0 ? invoices : [];
    const map = {};
    src.forEach(v => {
      const d = v.date || '';
      if (!d) return;
      const mon = new Date(d).toLocaleString('en', { month: 'short' });
      if (!map[mon]) map[mon] = { month: mon, sales: 0, purchase: 0 };
      map[mon].sales += (parseFloat(v.amount) || 0) / 1000;
    });
    return Object.values(map).slice(-6);
  }, [invoices, isDemo]);
  const companyGuid = selectedCompany?.guid;

  const loadData = useCallback(async (pg = 1, searchText = '') => {
    if (!companyGuid) { setLoading(false); return; }
    setLoading(true);
    try {
      // Fetch vouchers without voucherType filter — get all, then filter client-side
      // Backend returns sales types: Sales GST, Sales, etc.
      const res = await api.fetchVouchers({
        companyGuid,
        page: pg,
        pageSize,
        searchText,
        fromDate: selectedFY?.startDate,
        toDate: selectedFY?.endDate,
      });
      const allVouchers = res?.data?.vouchers || [];
      const totalCount = res?.data?.total || 0;

      // Filter to only sales-type vouchers
      const salesVouchers = allVouchers.filter(v =>
        SALES_TYPES.some(t => (v.voucher_type || '').toLowerCase().includes(t.toLowerCase()))
      );

      if (salesVouchers.length > 0) {
        const mapped = salesVouchers.map(v => ({
          id: v.id,
          ref: v.voucher_number || v.guid?.slice(-8) || 'N/A',
          customer: v.party_name || '—',
          date: v.date || '—',
          amount: parseFloat(v.amount) || 0,
          voucherType: v.voucher_type || 'Sales',
          status: v.is_cancelled ? 'Cancelled' : parseFloat(v.amount) > 0 ? 'Paid' : 'Unpaid',
          rawData: v,
        }));
        setInvoices(mapped);
        setTotal(mapped.length);
      } else if (allVouchers.length > 0) {
        // No sales filter match — show all vouchers as fallback
        const mapped = allVouchers.map(v => ({
          id: v.id,
          ref: v.voucher_number || v.guid?.slice(-8) || 'N/A',
          customer: v.party_name || '—',
          date: v.date || '—',
          amount: parseFloat(v.amount) || 0,
          voucherType: v.voucher_type || 'Voucher',
          status: v.is_cancelled ? 'Cancelled' : parseFloat(v.amount) > 0 ? 'Paid' : 'Unpaid',
          rawData: v,
        }));
        setInvoices(mapped);
        setTotal(totalCount);
      } else {
        setInvoices([]);
        setTotal(0);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load sales data');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [companyGuid, token]);

  // Reload whenever company changes
  useEffect(() => {
    setInvoices([]);
    setTotal(0);
    setPage(1);
    setSearch('');
    setError(null);
    if (companyGuid) loadData(1, '');
  }, [companyGuid, selectedFY?.uniqueId]); // eslint-disable-line

  useEffect(() => {
    const unsub = wsService.on('synced', () => { if (companyGuid) loadData(1, search); });
    return unsub;
  }, [companyGuid]);

  // Debounced search
  useEffect(() => {
    if (!companyGuid) return;
    const t = setTimeout(() => { loadData(1, search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search, companyGuid]); // eslint-disable-line

  // Use demo data when not paired or no real invoices loaded
  const displayInvoices = invoices;
  const filtered = displayInvoices.filter(r =>
    (!search || (r.customer||r.ref||'').toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || r.status === statusFilter)
  );

  const invoiceCols = [
    { key: 'ref',      label: 'Invoice No',  render: v => <span className="font-mono text-xs text-[#37352F] font-semibold">{v}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'voucherType', label: 'Type',     render: v => <span className="text-xs text-[#787774]">{v}</span> },
    { key: 'date',     label: 'Date',         render: v => <span className="text-[#787774]">{v}</span> },
    { key: 'amount',   label: 'Amount',       render: v => <span className="font-semibold">{fmt(v)}</span> },
    { key: 'status',   label: 'Status',       render: v => <Badge label={v} variant={statusVariant[v] || 'gray'} /> },
  ];

  const totalSales = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paid = invoices.filter(i => i.status === 'Paid').length;
  const unpaid = invoices.filter(i => i.status === 'Unpaid').length;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <span className="flex-shrink-0">⚠️</span>
          <span><strong>Error:</strong> {error}</span>
          <button onClick={() => { setError(null); loadData(1, search); }} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}
      {!error && isDemo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span className="text-base">🎭</span>
          <span><strong>Demo Mode</strong> — Showing sample data. Pair Desktop App for real Tally data. <a href="/settings?tab=integrations&sub=Tally+ERP+Sync" className="underline font-medium">Settings →</a></span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">
            {selectedCompany?.name || 'No company'} · {loading ? 'Loading...' : `${invoices.length} records`}
          </p>
        </div>
        <button onClick={() => loadData(page, search)} className="flex items-center gap-1.5 text-xs text-[#37352F] font-medium hover:text-[#787774]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Sales"    value={fmt(totalSales)}    icon={TrendingUp} accent="#37352F" />
        <KPICard title="Total Invoices" value={invoices.length}    icon={FileCheck}  accent="#37352F" />
        <KPICard title="Paid"           value={paid}               icon={FileText}   accent="#0F7B6C" />
        <KPICard title="Unpaid"         value={unpaid}             icon={ShoppingBag} accent="#EB5757" />
      </div>

      {/* Chart + status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D3D1CB] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#37352F] mb-1">Sales Trend</p>
          <p className="text-xs text-[#9A9A97] mb-4">Monthly · {selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#37352F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#37352F" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#EFEFEF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9A9A97' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9A9A97' }} axisLine={false} tickLine={false} tickFormatter={v => v / 100 + 'L'} />
              <Tooltip formatter={v => ['₹' + (v / 100).toFixed(1) + 'L', 'Sales']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #D3D1CB' }} />
              <Area type="monotone" dataKey="sales" stroke="#37352F" strokeWidth={2.5} fill="url(#sg)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#D3D1CB] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#37352F] mb-4">Status Summary</p>
          <div className="space-y-3">
            {[['Paid', paid, '#0F7B6C'], ['Unpaid', unpaid, '#EB5757']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-sm text-[#787774]">{l}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#EFEFEF] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: invoices.length ? `${(v / invoices.length) * 100}%` : '0%', background: c }} />
                  </div>
                  <span className="text-sm font-semibold text-[#37352F] w-6 text-right">{v}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Voucher type breakdown */}
          <div className="mt-5 pt-4 border-t border-[#EFEFEF]">
            <p className="text-xs font-semibold text-[#9A9A97] uppercase tracking-wider mb-2">By Type</p>
            {SALES_TYPES.map(t => {
              const count = invoices.filter(i => i.voucherType === t).length;
              if (!count) return null;
              return (
                <div key={t} className="flex justify-between py-1 text-xs">
                  <span className="text-[#787774] truncate max-w-32">{t}</span>
                  <span className="font-semibold text-[#37352F]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D3D1CB] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#EFEFEF] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#37352F] bg-[#EFEFEF] font-semibold' : 'text-[#787774] hover:text-[#37352F] hover:bg-[#F7F7F5]'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <>
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A97]" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer or invoice..."
                    className="w-full pl-8 pr-3 py-2 text-sm bg-[#F7F7F5] border border-[#EFEFEF] rounded-lg outline-none focus:border-[#37352F] focus:bg-white transition-all placeholder:text-[#9A9A97]" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="py-2 px-3 text-sm bg-white border border-[#D3D1CB] rounded-lg outline-none text-[#37352F]">
                  {['All', 'Paid', 'Unpaid'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="flex items-center gap-1.5 px-3 py-2 border border-[#D3D1CB] rounded-lg text-xs text-[#787774] hover:bg-[#F7F7F5]">
                  <Download size={12} /> Export
                </button>
              </div>

              {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-[#F7F7F5] rounded-lg animate-pulse" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <TrendingUp size={28} className="mx-auto mb-2 text-[#D3D1CB]" />
                  <p className="text-sm text-[#9A9A97]">No sales records found</p>
                </div>
              ) : (
                <Table columns={invoiceCols} data={filtered} onRowClick={row => setDrawer(row)} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EFEFEF]">
                  <p className="text-xs text-[#9A9A97]">{filtered.length} of {total} records</p>
                  <div className="flex gap-1">
                    <button onClick={() => { const pg = page - 1; setPage(pg); loadData(pg, search); }} disabled={page === 1}
                      className="px-3 py-1.5 text-xs border border-[#D3D1CB] rounded-lg disabled:opacity-40 hover:bg-[#F7F7F5]">← Prev</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return <button key={pg} onClick={() => { setPage(pg); loadData(pg, search); }}
                        className={`w-8 h-8 text-xs rounded-lg ${pg === page ? 'bg-[#1A1A1A] text-white' : 'border border-[#D3D1CB] text-[#787774] hover:bg-[#F7F7F5]'}`}>{pg}</button>;
                    })}
                    <button onClick={() => { const pg = page + 1; setPage(pg); loadData(pg, search); }} disabled={page >= totalPages}
                      className="px-3 py-1.5 text-xs border border-[#D3D1CB] rounded-lg disabled:opacity-40 hover:bg-[#F7F7F5]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
          {tab === 1 && <div className="py-12 text-center text-[#9A9A97]"><p className="text-sm">No open orders</p></div>}
          {tab === 2 && <div className="py-12 text-center text-[#9A9A97]"><p className="text-sm">No quotations</p></div>}
        </div>
      </div>

      <InvoicePDF open={!!pdfInvoice} onClose={() => setPdfInvoice(null)} invoice={pdfInvoice} />


      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.ref || 'Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#37352F] text-base">{drawer.customer}</p>
                <p className="font-mono text-xs text-[#9A9A97] mt-0.5">{drawer.ref} · {drawer.voucherType}</p>
              </div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status] || 'gray'} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Date', drawer.date], ['Amount', fmt(drawer.amount)], ['Type', drawer.voucherType], ['Status', drawer.status]].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#F7F7F5] rounded-xl border border-[#D3D1CB]">
                  <p className="text-xs text-[#9A9A97] mb-1">{l}</p>
                  <p className="font-medium text-[#37352F] text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPdfInvoice(drawer)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">View PDF</button>
              <button className="px-4 py-2.5 rounded-lg text-sm font-medium border border-[#D3D1CB] text-[#787774] hover:bg-[#F7F7F5] transition-colors">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
