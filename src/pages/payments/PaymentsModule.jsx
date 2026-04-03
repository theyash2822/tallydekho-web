import { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { payments, receipts, paymentKPIs } from '../../data/paymentsMock';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Payments', 'Receipts'];
const statusVariant = { Cleared: 'green', Pending: 'yellow', Reversed: 'red' };

const paymentCols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'voucher', label: 'Voucher', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'party', label: 'Party' },
  { key: 'ledger', label: 'Bank / Cash', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-[#C0392B]">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'ref', label: 'Reference', render: v => v ? <span className="font-mono text-xs text-[#787774] truncate max-w-28 block">{v}</span> : <span className="text-[#AEACA8]">—</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

const receiptCols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'voucher', label: 'Voucher', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'party', label: 'Party' },
  { key: 'ledger', label: 'Bank / Cash', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-[#2D7D46]">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'ref', label: 'Reference', render: v => v ? <span className="font-mono text-xs text-[#787774]">{v.slice(0,16)}...</span> : <span className="text-[#AEACA8]">—</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function PaymentsModule() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null);

  const filteredPayments = payments.filter(p => !search || p.party.toLowerCase().includes(search.toLowerCase()) || p.voucher.toLowerCase().includes(search.toLowerCase()));
  const filteredReceipts = receipts.filter(r => !search || r.party.toLowerCase().includes(search.toLowerCase()) || r.voucher.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Payments & Receipts</h1>
        <p className="text-sm text-[#787774] mt-0.5">July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Payments"  value={fmt(paymentKPIs.totalPayments)} icon={ArrowUpRight}  accent="#C0392B" />
        <KPICard title="Total Receipts"  value={fmt(paymentKPIs.totalReceipts)} icon={ArrowDownLeft} accent="#2D7D46" />
        <KPICard title="Net Cash Flow"   value={fmt(paymentKPIs.totalReceipts - paymentKPIs.totalPayments)} icon={CreditCard} accent="#3F5263" />
        <KPICard title="Pending Payments" value={fmt(paymentKPIs.pendingPayments)} icon={CreditCard} accent="#B45309" />
      </div>

      {/* Top parties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Top Payment Parties</p>
          <div className="space-y-2.5">
            {payments.slice(0,4).map((p,i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-[#1A1A1A]">{p.party}</span>
                <span className="text-sm font-semibold text-[#C0392B]">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Top Receipt Parties</p>
          <div className="space-y-2.5">
            {receipts.slice(0,4).map((r,i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-[#1A1A1A]">{r.party}</span>
                <span className="text-sm font-semibold text-[#2D7D46]">{fmt(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8E7E3] rounded-2xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search party or voucher..."
                className="notion-input pl-8 w-full text-sm" />
            </div>
          </div>
          {tab === 0 && <Table columns={paymentCols} data={filteredPayments} onRowClick={setDrawer} />}
          {tab === 1 && <Table columns={receiptCols} data={filteredReceipts} onRowClick={setDrawer} />}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.voucher || 'Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{drawer.party}</p>
                <p className="font-mono text-xs text-[#787774] mt-0.5">{drawer.voucher}</p>
              </div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Date',drawer.date],['Ledger',drawer.ledger],['Amount',fmt(drawer.amount)],['Mode',drawer.mode],['Reference',drawer.ref||'—'],['Status',drawer.status]].map(([l,v])=>(
                <div key={l} className="p-3 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                  <p className="text-xs text-[#787774] mb-1">{l}</p>
                  <p className="font-medium text-[#1A1A1A] text-sm break-all">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>View PDF</button>
              <button className="px-4 py-2.5 rounded-lg text-sm text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
