import { useState } from 'react';
import { Landmark, Clock, XCircle, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { cashRegister, bankRegister, bankAccounts, reconciliationData } from '../../data/mockData';

const fmt = n => '₹' + Math.abs(n).toLocaleString('en-IN');
const statusVariant = { Cleared: 'green', Pending: 'yellow', Reversed: 'red' };
const reconVariant = { Matched: 'green', Suggested: 'yellow', Unmatched: 'red' };
const TABS = ['Cash Register', 'Bank Register', 'Reconciliation'];

const SectionHeader = ({ title, sub }) => (
  <div className="mb-5">
    <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">{title}</h1>
    {sub && <p className="text-sm text-[#787774] mt-0.5">{sub}</p>}
  </div>
);

export default function CashBank() {
  const [tab, setTab] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]);
  const [drawer, setDrawer] = useState(null);

  const cashCols = [
    { key: 'date', label: 'Date' },
    { key: 'ref', label: 'Reference', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'dr', label: 'Credit (₹)', render: v => v ? <span className="text-emerald-600 font-medium">{fmt(v)}</span> : <span className="text-[#AEACA8]">—</span> },
    { key: 'cr', label: 'Debit (₹)', render: v => v ? <span className="text-rose-500 font-medium">{fmt(v)}</span> : <span className="text-[#AEACA8]">—</span> },
    { key: 'balance', label: 'Balance', render: v => <span className="font-semibold text-[#1A1A1A]">{fmt(v)}</span> },
  ];

  const bankCols = [
    { key: 'date', label: 'Date' },
    { key: 'ref', label: 'Reference', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'dr', label: 'Credit (₹)', render: v => v ? <span className="text-emerald-600 font-medium">{fmt(v)}</span> : <span className="text-[#AEACA8]">—</span> },
    { key: 'cr', label: 'Debit (₹)', render: v => v ? <span className="text-rose-500 font-medium">{fmt(v)}</span> : <span className="text-[#AEACA8]">—</span> },
    { key: 'balance', label: 'Balance', render: v => <span className="font-semibold">{fmt(v)}</span> },
    { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Cash & Bank" sub="July 2025 · All accounts" />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-3 gap-3">
          <KPICard title="Cash in Hand" value="₹3,45,000" icon={Landmark} accent="#F59E0B" />
          <KPICard title="HDFC Bank" value="₹18,45,000" icon={ArrowUpRight} accent="#059669" />
          <KPICard title="ICICI Bank" value="₹9,20,000" icon={ArrowUpRight} accent="#8B5CF6" />
          <KPICard title="Total Bank Balance" value="₹27,65,000" icon={Landmark} accent="#10B981" />
          <KPICard title="Pending Recon" value="3 entries" icon={Clock} accent="#F59E0B" />
          <KPICard title="Reversed" value="1 entry" icon={XCircle} accent="#F43F5E" />
        </div>

        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Account Details</p>
          <div className="flex gap-1.5 mb-4">
            {bankAccounts.map(a => (
              <button key={a.id} onClick={() => setSelectedAccount(a)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${selectedAccount.id === a.id ? 'border-[#059669] bg-[#ECFDF5] text-[#059669] font-medium' : 'border-[#E8E7E3] text-[#787774] hover:border-[#059669]'}`}>
                {a.name.split('–')[0].trim()}
              </button>
            ))}
          </div>
          <div className="space-y-2.5 text-sm">
            {[['Account', selectedAccount.name], ['Balance', fmt(selectedAccount.balance)], ['Branch', selectedAccount.branch], ['Account No', selectedAccount.masked]].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center py-1.5 border-b border-[#F1F0EC] last:border-0">
                <span className="text-[#787774]">{l}</span>
                <span className={`font-medium ${l === 'Balance' ? 'text-emerald-600' : 'text-[#1A1A1A]'} ${l === 'Account No' ? 'font-mono text-xs' : ''}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-200">
            ⚠️ 3 transactions waiting to be matched
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && <Table columns={cashCols} data={cashRegister} onRowClick={setDrawer} />}
          {tab === 1 && <Table columns={bankCols} data={bankRegister} onRowClick={setDrawer} />}
          {tab === 2 && (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[['Total', reconciliationData.summary.total, '#059669'], ['Matched', reconciliationData.summary.matched, '#10B981'], ['Pending', reconciliationData.summary.pending, '#F59E0B'], ['Difference', fmt(reconciliationData.summary.difference), '#F43F5E']].map(([l, v, c]) => (
                  <div key={l} className="border border-[#E8E7E3] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#787774] mb-1">{l}</p>
                    <p className="text-lg font-bold" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1A1A1A]">Bank Statement vs Books</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: '#059669' }}>
                  <RefreshCw size={12} /> Auto-Match
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Bank Statement', reconciliationData.bankStatement], ['Your Books', bankRegister]].map(([title, rows]) => (
                  <div key={title}>
                    <p className="text-xs font-semibold text-[#AEACA8] uppercase tracking-wider mb-2">{title}</p>
                    <div className="space-y-1.5">
                      {rows.map((row, i) => (
                        <div key={i} className="bg-[#FBFAF8] rounded-lg p-3 border border-[#E8E7E3] flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#1A1A1A] truncate max-w-[160px]">{row.description}</p>
                            <p className="text-xs text-[#AEACA8] mt-0.5">{row.date}</p>
                            <p className="text-xs font-semibold mt-1">
                              {(row.dr || row.debit) ? <span className="text-emerald-600">+{fmt(row.dr || row.debit)}</span> : <span className="text-rose-500">-{fmt(row.cr || row.credit)}</span>}
                            </p>
                          </div>
                          <Badge label={row.status} variant={row.status in reconVariant ? reconVariant[row.status] : statusVariant[row.status]} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title="Transaction Details">
        {drawer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Date', drawer.date], ['Reference', drawer.ref], ['Description', drawer.description]].map(([l, v]) => (
                <div key={l} className={l === 'Description' ? 'col-span-2' : ''}>
                  <p className="text-xs text-[#787774] mb-1">{l}</p>
                  <p className={`font-medium text-[#1A1A1A] ${l === 'Reference' ? 'font-mono text-xs' : ''}`}>{v}</p>
                </div>
              ))}
              {drawer.dr > 0 && <div><p className="text-xs text-[#787774] mb-1">Credit</p><p className="font-semibold text-emerald-600">{fmt(drawer.dr)}</p></div>}
              {drawer.cr > 0 && <div><p className="text-xs text-[#787774] mb-1">Debit</p><p className="font-semibold text-rose-500">{fmt(drawer.cr)}</p></div>}
              <div><p className="text-xs text-[#787774] mb-1">Balance</p><p className="font-semibold text-[#1A1A1A]">{fmt(drawer.balance)}</p></div>
              {drawer.status && <div><p className="text-xs text-[#787774] mb-1">Status</p><Badge label={drawer.status} variant={statusVariant[drawer.status]} /></div>}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>View Voucher</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
