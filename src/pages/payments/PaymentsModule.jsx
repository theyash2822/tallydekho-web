import { useState, useEffect } from 'react';
import VoucherDetail from '../../components/VoucherDetail';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { payments, receipts, paymentKPIs } from '../../data/paymentsMock';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Payments', 'Receipts'];
const statusVariant = { Cleared: 'green', Pending: 'yellow', Reversed: 'red' };

const paymentCols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'voucher', label: 'Voucher', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'party', label: 'Party' },
  { key: 'ledger', label: 'Bank / Cash', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-[#C0392B]">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'ref', label: 'Reference', render: v => v ? <span className="font-mono text-xs text-[#6B7280] truncate max-w-28 block">{v}</span> : <span className="text-[#9CA3AF]">—</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

const receiptCols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#6B7280]">{v}</span> },
  { key: 'voucher', label: 'Voucher', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'party', label: 'Party' },
  { key: 'ledger', label: 'Bank / Cash', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-[#2D7D46]">{fmt(v)}</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#6B7280]">{v}</span> },
  { key: 'ref', label: 'Reference', render: v => v ? <span className="font-mono text-xs text-[#6B7280]">{v.slice(0,16)}...</span> : <span className="text-[#9CA3AF]">—</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function PaymentsModule() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null);
  const [page, setPage] = useState(1);
  const [realPayments, setRealPayments] = useState([]);
  const [realReceipts, setRealReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany, selectedFY, isPaired } = useAuth();
  const isDemo = !isPaired;

  useEffect(() => {
    setRealPayments([]); setRealReceipts([]);
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      api.fetchVouchers({ companyGuid: selectedCompany.guid, voucherType: 'Payment', page: 1, pageSize: 100, fromDate: selectedFY?.startDate, toDate: selectedFY?.endDate }).catch(() => null),
      api.fetchVouchers({ companyGuid: selectedCompany.guid, voucherType: 'Receipt', page: 1, pageSize: 100, fromDate: selectedFY?.startDate, toDate: selectedFY?.endDate }).catch(() => null),
    ]).then(([p, r]) => {
      const mapV = v => ({ id: v.id, voucher: v.voucher_number || v.id, party: v.party_name || '—', date: v.date || '—', amount: parseFloat(v.amount) || 0, mode: 'Bank', status: 'Cleared', ref: v.reference || '' });
      if (p?.data?.vouchers?.length) setRealPayments(p.data.vouchers.map(mapV));
      if (r?.data?.vouchers?.length) setRealReceipts(r.data.vouchers.map(mapV));
    }).finally(() => setLoading(false));
  }, [selectedCompany?.guid, selectedFY?.uniqueId]);

  const displayPayments = realPayments.length > 0 ? realPayments : (isDemo ? payments : []);
  const displayReceipts = realReceipts.length > 0 ? realReceipts : (isDemo ? receipts : []);
  const filteredPayments = displayPayments.filter(p => !search || (p.party||'').toLowerCase().includes(search.toLowerCase()) || (p.voucher||'').toLowerCase().includes(search.toLowerCase()));
  const filteredReceipts = displayReceipts.filter(r => !search || (r.party||'').toLowerCase().includes(search.toLowerCase()) || (r.voucher||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span className="text-base">🎭</span>
          <span><strong>Demo Mode</strong> — Showing sample data. <a href="/settings" className="underline font-medium">Pair Desktop App →</a></span>
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Payments & Receipts</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Payments"  value={loading ? '—' : fmt(displayPayments.reduce((s,p)=>s+(p.amount||0),0))} icon={ArrowUpRight}  accent="#C0392B" />
        <KPICard title="Total Receipts"  value={loading ? '—' : fmt(displayReceipts.reduce((s,r)=>s+(r.amount||0),0))} icon={ArrowDownLeft} accent="#2D7D46" />
        <KPICard title="Net Cash Flow"   value={loading ? '—' : fmt(displayReceipts.reduce((s,r)=>s+(r.amount||0),0) - displayPayments.reduce((s,p)=>s+(p.amount||0),0))} icon={CreditCard} accent="#3F5263" />
        <KPICard title="Vouchers"        value={loading ? '—' : displayPayments.length + displayReceipts.length} icon={CreditCard} accent="#B45309" />
      </div>

      {/* Top parties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Top Payment Parties</p>
          <div className="space-y-2.5">
            {payments.slice(0,4).map((p,i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-[#1C2B3A]">{p.party}</span>
                <span className="text-sm font-semibold text-[#C0392B]">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#D9DCE0] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Top Receipt Parties</p>
          <div className="space-y-2.5">
            {receipts.slice(0,4).map((r,i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-[#1C2B3A]">{r.party}</span>
                <span className="text-sm font-semibold text-[#2D7D46]">{fmt(r.amount)}</span>
              </div>
            ))}
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
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search party or voucher..."
                className="notion-input pl-8 w-full text-sm" />
            </div>
          </div>
          {tab === 0 && (
            <>
              <Table columns={paymentCols} data={filteredPayments.slice((page-1)*25,page*25)} onRowClick={setDrawer} />
              {filteredPayments.length > 25 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#ECEEEF] mt-2">
                  <span className="text-xs text-[#9CA3AF]">{filteredPayments.length} total</span>
                  <div className="flex gap-1">
                    <button onClick={()=>setPage(p=>p-1)} disabled={page===1} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">← Prev</button>
                    <button onClick={()=>setPage(p=>p+1)} disabled={page*25>=filteredPayments.length} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
          {tab === 1 && (
            <>
              <Table columns={receiptCols} data={filteredReceipts.slice((page-1)*25,page*25)} onRowClick={setDrawer} />
              {filteredReceipts.length > 25 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#ECEEEF] mt-2">
                  <span className="text-xs text-[#9CA3AF]">{filteredReceipts.length} total</span>
                  <div className="flex gap-1">
                    <button onClick={()=>setPage(p=>p-1)} disabled={page===1} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">← Prev</button>
                    <button onClick={()=>setPage(p=>p+1)} disabled={page*25>=filteredReceipts.length} className="px-3 py-1.5 text-xs border border-[#D9DCE0] rounded-lg disabled:opacity-40 hover:bg-[#F4F5F6]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.voucher || 'Details'}>
        {drawer?.id && selectedCompany?.guid ? (
          <VoucherDetail
            voucherId={drawer.id}
            companyGuid={selectedCompany.guid}
            companyName={selectedCompany?.name}
            onBack={() => setDrawer(null)}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
