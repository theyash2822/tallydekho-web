import { useState } from 'react';
import { Users, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { receivables, payables } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const riskVariant = { High: 'red', Medium: 'yellow', Low: 'green' };
const TABS = ['Party-wise', 'Invoice/Bill-wise', 'Ageing Analysis'];

export default function ReceivablesPayables() {
  const [mode, setMode] = useState('receivables');
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);
  const data = mode === 'receivables' ? receivables : payables;
  const totalOutstanding = data.reduce((s, r) => s + r.outstanding, 0);
  const totalOverdue = data.reduce((s, r) => s + r.overdue, 0);

  const partyCols = [
    { key: 'party', label: mode === 'receivables' ? 'Customer' : 'Vendor' },
    { key: 'outstanding', label: 'Outstanding', render: v => <span className="font-semibold text-[#1C2B3A]">{fmt(v)}</span> },
    { key: 'overdue', label: 'Overdue', render: v => v > 0 ? <span className="text-[#C0392B] font-medium">{fmt(v)}</span> : <span className="text-[#9CA3AF]">—</span> },
    { key: 'risk', label: 'Risk', render: v => <Badge label={v} variant={riskVariant[v]} /> },
    { key: 'contact', label: 'Contact', render: v => <span className="text-[#6B7280] font-mono text-xs">{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Receivables & Payables</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">July 2025</p>
        </div>
        <div className="flex bg-[#ECEEEF] rounded-lg p-0.5">
          {['receivables','payables'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-white text-[#1C2B3A] shadow-sm' : 'text-[#6B7280] hover:text-[#1C2B3A]'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Outstanding" value={fmt(totalOutstanding)} icon={Users}         accent="#3F5263" />
        <KPICard title="Total Overdue"      value={fmt(totalOverdue)}    icon={AlertTriangle} accent="#C0392B" />
        <KPICard title="Due This Week"       value={fmt(Math.round(totalOutstanding * 0.15))} icon={Clock} accent="#B45309" />
        <KPICard title={mode === 'receivables' ? 'Avg Collection Days' : 'Avg Payment Days'} value="28 days" icon={TrendingUp} accent="#2D7D46" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Recent Activity</p>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#F0EFE9]">
              <th className="text-left py-2 text-xs text-[#6B7280] font-semibold">Party</th>
              <th className="text-right py-2 text-xs text-[#6B7280] font-semibold">Amount</th>
              <th className="text-right py-2 text-xs text-[#6B7280] font-semibold">Date</th>
            </tr></thead>
            <tbody>
              {data.slice(0, 4).map((r, i) => (
                <tr key={i} className="border-b border-[#F0EFE9] last:border-0 hover:bg-[#F4F5F6] cursor-pointer" onClick={() => setDrawer(r)}>
                  <td className="py-2.5 font-medium text-[#1C2B3A]">{r.party}</td>
                  <td className="py-2.5 text-right font-semibold text-[#3F5263]">{fmt(r.outstanding)}</td>
                  <td className="py-2.5 text-right text-[#6B7280] text-xs">10 Jul 2025</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-[#1C2B3A]">Alerts</p>
          <div className="p-3 bg-[#FDECEA] rounded-lg text-xs text-[#C0392B] border border-[#EDBBB8]">
            {data.filter(r => r.risk === 'High').length} parties with high-risk outstanding
          </div>
          <div className="p-3 bg-[#FEF6E4] rounded-lg text-xs text-[#B45309] border border-[#F0D49A]">
            {data.filter(r => r.overdue > 0).length} parties with overdue amounts
          </div>
          <p className="text-sm font-semibold text-[#1C2B3A] pt-1">Top 3</p>
          {data.slice(0, 3).map((r, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-[#F0EFE9] last:border-0">
              <span className="text-[#6B7280] truncate mr-2">{r.party.split(' ')[0]}</span>
              <span className="font-semibold text-[#1C2B3A] flex-shrink-0">{fmt(r.outstanding)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-xl">
        <div className="flex border-b border-[#D9DCE0] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && <Table columns={partyCols} data={data} onRowClick={setDrawer} />}
          {tab === 1 && (
            <Table columns={[
              { key: 'party', label: mode === 'receivables' ? 'Customer' : 'Vendor' },
              { key: 'outstanding', label: 'Amount', render: v => fmt(v) },
              { key: 'overdue', label: 'Overdue', render: v => v > 0 ? <span className="text-[#C0392B]">{fmt(v)}</span> : '—' },
              { key: 'risk', label: 'Status', render: v => <Badge label={v === 'High' ? 'Overdue' : v === 'Low' ? 'Current' : 'Partial'} variant={riskVariant[v]} /> },
            ]} data={data} onRowClick={setDrawer} />
          )}
          {tab === 2 && (
            <div className="overflow-x-auto rounded-xl border border-[#D9DCE0]">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F9F9] border-b border-[#D9DCE0]">
                  <tr>{['Party','0–30 days','31–60 days','61–90 days','90+ days','Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i} className="border-b border-[#F0EFE9] hover:bg-[#F4F5F6] cursor-pointer" onClick={() => setDrawer(r)}>
                      <td className="px-4 py-3 font-medium text-[#1C2B3A]">{r.party}</td>
                      <td className="px-4 py-3 text-[#2D7D46]">{r.aging.d0_30   ? fmt(r.aging.d0_30)   : '—'}</td>
                      <td className="px-4 py-3 text-[#B45309]">{r.aging.d31_60  ? fmt(r.aging.d31_60)  : '—'}</td>
                      <td className="px-4 py-3 text-[#B45309]">{r.aging.d61_90  ? fmt(r.aging.d61_90)  : '—'}</td>
                      <td className="px-4 py-3 text-[#C0392B]">{r.aging.d90plus ? fmt(r.aging.d90plus) : '—'}</td>
                      <td className="px-4 py-3 font-bold text-[#1C2B3A]">{fmt(r.outstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.party}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[#1C2B3A] text-base">{drawer.party}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">{drawer.contact}</p>
              </div>
              <Badge label={drawer.risk} variant={riskVariant[drawer.risk]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#ECEEEF] border border-[#C5CBD0]">
                <p className="text-xs text-[#9CA3AF]">Outstanding</p>
                <p className="font-bold text-[#3F5263] text-lg">{fmt(drawer.outstanding)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FDECEA] border border-[#EDBBB8]">
                <p className="text-xs text-[#9CA3AF]">Overdue</p>
                <p className="font-bold text-[#C0392B] text-lg">{fmt(drawer.overdue)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Ageing Buckets</p>
              <div className="space-y-2">
                {[['0–30 days', drawer.aging.d0_30, 'emerald'], ['31–60 days', drawer.aging.d31_60, 'amber'], ['61–90 days', drawer.aging.d61_90, 'orange'], ['90+ days', drawer.aging.d90plus, 'rose']].map(([l, v, c]) => (
                  <div key={l} className="flex items-center gap-3">
                    <span className="text-xs text-[#6B7280] w-20 flex-shrink-0">{l}</span>
                    <div className="flex-1 bg-[#F0EFE9] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full bg-${c}-500`} style={{ width: v ? `${(v / drawer.outstanding) * 100}%` : '0%' }} />
                    </div>
                    <span className={`text-xs font-medium w-20 text-right ${v ? `text-${c}-600` : 'text-[#9CA3AF]'}`}>{v ? fmt(v) : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
                {mode === 'receivables' ? 'Record Receipt' : 'Record Payment'}
              </button>
              <button className="w-full py-2.5 rounded-lg text-sm font-medium text-[#6B7280] border border-[#D9DCE0] hover:bg-[#F4F5F6] transition-colors">Send Reminder</button>
              <button className="w-full py-2.5 rounded-lg text-sm font-medium text-[#6B7280] border border-[#D9DCE0] hover:bg-[#F4F5F6] transition-colors">Share Outstanding PDF</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
