import { useState } from 'react';
import { Landmark, Clock, XCircle, RefreshCw, ArrowUpRight } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { cashRegister, bankRegister, bankAccounts, reconciliationData } from '../../data/mockData';

const fmt = n => '₹' + Math.abs(n).toLocaleString('en-IN');
const statusVariant = { Cleared: 'green', Pending: 'yellow', Reversed: 'red' };
const reconVariant  = { Matched: 'green', Suggested: 'yellow', Unmatched: 'red' };
const TABS = ['Cash Register', 'Bank Register', 'Reconciliation'];

const cashCols = [
  { key: 'date',        label: 'Date' },
  { key: 'ref',         label: 'Reference', render: v => <span className="font-mono text-xs text-[#9CA3AF]">{v}</span> },
  { key: 'description', label: 'Description' },
  { key: 'dr',  label: 'Credit (₹)', render: v => v ? <span className="text-[#2D7D46] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'cr',  label: 'Debit (₹)',  render: v => v ? <span className="text-[#C0392B] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'balance', label: 'Balance', render: v => <span className="font-semibold text-[#1C2B3A]">{fmt(v)}</span> },
];

const bankCols = [
  { key: 'date',        label: 'Date' },
  { key: 'ref',         label: 'Reference', render: v => <span className="font-mono text-xs text-[#9CA3AF]">{v}</span> },
  { key: 'description', label: 'Description' },
  { key: 'dr',  label: 'Credit (₹)', render: v => v ? <span className="text-[#2D7D46] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'cr',  label: 'Debit (₹)',  render: v => v ? <span className="text-[#C0392B] font-medium">{fmt(v)}</span> : <span className="text-[#C5CBD0]">—</span> },
  { key: 'balance', label: 'Balance', render: v => <span className="font-semibold text-[#1C2B3A]">{fmt(v)}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

export default function CashBank() {
  const [tab, setTab] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]);
  const [drawer, setDrawer] = useState(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Cash & Bank</h1>
        <p className="page-subtitle">July 2025 · All accounts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-3 gap-3">
          <KPICard title="Cash in Hand"       value="₹3,45,000"  icon={Landmark}    accent="#3F5263" />
          <KPICard title="HDFC Bank"           value="₹18,45,000" icon={ArrowUpRight} accent="#526373" />
          <KPICard title="ICICI Bank"          value="₹9,20,000"  icon={ArrowUpRight} accent="#798692" />
          <KPICard title="Total Bank Balance"  value="₹27,65,000" icon={Landmark}    accent="#2D7D46" />
          <KPICard title="Pending Recon"       value="3 entries"  icon={Clock}       accent="#B45309" />
          <KPICard title="Reversed"            value="1 entry"    icon={XCircle}     accent="#C0392B" />
        </div>

        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Account Details</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bankAccounts.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAccount(a)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  selectedAccount.id === a.id
                    ? 'border-[#3F5263] bg-[#ECEEEF] text-[#3F5263] font-medium'
                    : 'border-[#D9DCE0] text-[#6B7280] hover:border-[#3F5263]'
                }`}
              >
                {a.name.split('–')[0].trim()}
              </button>
            ))}
          </div>
          <div className="space-y-0">
            {[['Account', selectedAccount.name], ['Balance', fmt(selectedAccount.balance)], ['Branch', selectedAccount.branch], ['Account No', selectedAccount.masked]].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center py-2 border-b border-[#F4F5F6] last:border-0">
                <span className="text-xs text-[#9CA3AF]">{l}</span>
                <span className={`text-sm font-medium ${l === 'Balance' ? 'text-[#2D7D46]' : 'text-[#1C2B3A]'} ${l === 'Account No' ? 'font-mono text-xs' : ''}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 bg-[#FEF6E4] rounded-lg text-xs text-[#B45309] border border-[#F0D49A]">
            ⚠️ 3 transactions waiting to be matched
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#ECEEEF] px-1 pt-1">
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${
                tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'
              }`}
            >
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
                {[
                  ['Total',      reconciliationData.summary.total,              '#3F5263'],
                  ['Matched',    reconciliationData.summary.matched,            '#2D7D46'],
                  ['Pending',    reconciliationData.summary.pending,            '#B45309'],
                  ['Difference', fmt(reconciliationData.summary.difference),   '#C0392B'],
                ].map(([l, v, c]) => (
                  <div key={l} className="border border-[#D9DCE0] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">{l}</p>
                    <p className="text-lg font-bold" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1C2B3A]">Bank Statement vs Books</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
                  <RefreshCw size={12} /> Auto-Match
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Bank Statement', reconciliationData.bankStatement], ['Your Books', bankRegister]].map(([title, rows]) => (
                  <div key={title}>
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{title}</p>
                    <div className="space-y-1.5">
                      {rows.map((row, i) => (
                        <div key={i} className="bg-[#F4F5F6] rounded-lg p-3 border border-[#D9DCE0] flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#1C2B3A] truncate max-w-[160px]">{row.description}</p>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">{row.date}</p>
                            <p className="text-xs font-semibold mt-1">
                              {(row.dr || row.debit)
                                ? <span className="text-[#2D7D46]">+{fmt(row.dr || row.debit)}</span>
                                : <span className="text-[#C0392B]">-{fmt(row.cr || row.credit)}</span>}
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
                  <p className="text-xs text-[#9CA3AF] mb-1">{l}</p>
                  <p className={`font-medium text-[#1C2B3A] ${l === 'Reference' ? 'font-mono text-xs' : ''}`}>{v}</p>
                </div>
              ))}
              {drawer.dr > 0 && <div><p className="text-xs text-[#9CA3AF] mb-1">Credit</p><p className="font-semibold text-[#2D7D46]">{fmt(drawer.dr)}</p></div>}
              {drawer.cr > 0 && <div><p className="text-xs text-[#9CA3AF] mb-1">Debit</p><p className="font-semibold text-[#C0392B]">{fmt(drawer.cr)}</p></div>}
              <div><p className="text-xs text-[#9CA3AF] mb-1">Balance</p><p className="font-semibold text-[#1C2B3A]">{fmt(drawer.balance)}</p></div>
              {drawer.status && <div><p className="text-xs text-[#9CA3AF] mb-1">Status</p><Badge label={drawer.status} variant={statusVariant[drawer.status]} /></div>}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">View Voucher</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] border border-[#D9DCE0] hover:bg-[#F4F5F6] transition-colors">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
