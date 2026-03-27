import { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { gstr1Data, gstr2aData } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const statusVariant = { Filed: 'green', Pending: 'yellow', Matched: 'green', Unmatched: 'red', Suggested: 'yellow', Rejected: 'red' };
const TABS = ['GSTR-1', 'GSTR-2A Recon', 'GSTR-3B', 'GSTR-4', 'GSTR-6', 'GSTR-9'];

const gstr3b = [
  { section: '3.1(a) – Outward Taxable Supplies', taxable: 3865254, igst: 0, cgst: 257617, sgst: 257617 },
  { section: '3.1(b) – Zero Rated Supplies', taxable: 0, igst: 0, cgst: 0, sgst: 0 },
  { section: '3.1(c) – Nil Rated', taxable: 180000, igst: 0, cgst: 0, sgst: 0 },
  { section: '4 – ITC Available', taxable: 0, igst: 7650, cgst: 60750, sgst: 60750 },
];

export default function GST() {
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);

  const gstr1Cols = [
    { key: 'invoice', label: 'Invoice No', render: v => <span className="font-mono text-xs text-[#059669]">{v}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'gstin', label: 'GSTIN', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
    { key: 'taxable', label: 'Taxable Value', render: v => fmt(v) },
    { key: 'cgst', label: 'CGST', render: v => fmt(v) },
    { key: 'sgst', label: 'SGST', render: v => fmt(v) },
    { key: 'igst', label: 'IGST', render: v => fmt(v) },
    { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  ];

  const gstr2aCols = [
    { key: 'supplier', label: 'Supplier' },
    { key: 'invoice', label: 'Invoice', render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'date', label: 'Date' },
    { key: 'value', label: 'Value', render: v => fmt(v) },
    { key: 'status', label: 'Match', render: v => <Badge label={v} variant={statusVariant[v]} /> },
    { key: 'reason', label: 'Reason', render: v => v ? <span className="text-xs text-rose-500">{v}</span> : '—' },
    { key: 'status', label: 'Action', render: (v) => v !== 'Matched' ? (
      <div className="flex gap-1">
        <button className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100">Accept</button>
        <button className="px-2 py-1 text-xs bg-rose-50 text-rose-600 border border-rose-200 rounded-md hover:bg-rose-100">Reject</button>
      </div>
    ) : <span className="text-[#AEACA8] text-xs">—</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">GST Compliance</h1>
        <p className="text-sm text-[#787774] mt-0.5">FY 2025-26 · July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="GSTR-1 Status" value="Filed" sub="July 2025" icon={CheckCircle} accent="#10B981" />
        <KPICard title="GSTR-3B Status" value="Pending" sub="Due 20 Aug 2025" icon={AlertTriangle} accent="#F59E0B" />
        <KPICard title="2A Mismatches" value="2 entries" icon={XCircle} accent="#F43F5E" />
        <KPICard title="ITC Available" value="₹1,29,150" icon={ShieldCheck} accent="#059669" />
      </div>

      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1A1A1A]">Outward Supplies — July 2025</p>
                <div className="flex gap-2">
                  {['JSON','CSV','XLSX'].map(b => <button key={b} className="px-3 py-1.5 border border-[#E8E7E3] text-[#787774] text-xs rounded-lg hover:bg-[#F7F6F3]">Export {b}</button>)}
                </div>
              </div>
              <Table columns={gstr1Cols} data={gstr1Data} onRowClick={setDrawer} />
            </>
          )}
          {tab === 1 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1A1A1A]">GSTR-2A Reconciliation</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: '#059669' }}>Auto-Match All</button>
                  <button className="px-3 py-1.5 border border-[#E8E7E3] text-[#787774] text-xs rounded-lg hover:bg-[#F7F6F3]">Export CSV</button>
                </div>
              </div>
              <Table columns={gstr2aCols} data={gstr2aData} onRowClick={setDrawer} />
            </>
          )}
          {tab === 2 && (
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-4">GSTR-3B Summary — July 2025</p>
              <div className="overflow-x-auto rounded-xl border border-[#E8E7E3]">
                <table className="w-full text-sm">
                  <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
                    <tr>{['Section','Taxable Value','IGST','CGST','SGST'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#787774] uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {gstr3b.map((row, i) => (
                      <tr key={i} className="border-b border-[#F1F0EC] hover:bg-[#F7F6F3]">
                        <td className="px-4 py-3 font-medium text-[#1A1A1A]">{row.section}</td>
                        <td className="px-4 py-3">{row.taxable ? fmt(row.taxable) : <span className="text-[#AEACA8]">—</span>}</td>
                        <td className="px-4 py-3">{row.igst ? fmt(row.igst) : <span className="text-[#AEACA8]">—</span>}</td>
                        <td className="px-4 py-3">{row.cgst ? fmt(row.cgst) : <span className="text-[#AEACA8]">—</span>}</td>
                        <td className="px-4 py-3">{row.sgst ? fmt(row.sgst) : <span className="text-[#AEACA8]">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {(tab === 3 || tab === 4) && (
            <div className="py-12 text-center text-[#787774]">
              <ShieldCheck size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">{TABS[tab]}</p>
              <p className="text-xs mt-1 text-[#AEACA8]">No records for July 2025</p>
            </div>
          )}
          {tab === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                Annual return for FY 2025-26 will be available after March 2026.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Outward Supplies (YTD)','₹2,31,80,000'],['ITC Claimed (YTD)','₹18,45,000'],['Tax Paid (YTD)','₹24,52,000'],['Late Fee (YTD)','—']].map(([l,v]) => (
                  <div key={l} className="p-4 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                    <p className="text-xs text-[#787774] mb-1">{l}</p>
                    <p className="font-bold text-[#1A1A1A]">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title="GST Entry Details">
        {drawer && (
          <div className="space-y-3 text-sm">
            {Object.entries(drawer).filter(([k]) => k !== 'id').map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[#F1F0EC]">
                <span className="text-[#787774] capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-[#1A1A1A] text-right max-w-xs">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
