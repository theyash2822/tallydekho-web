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
  { section: '3.1(a) – Outward Taxable Supplies', taxable: 3865254, igst: 0,    cgst: 257617, sgst: 257617 },
  { section: '3.1(b) – Zero Rated Supplies',       taxable: 0,       igst: 0,    cgst: 0,      sgst: 0 },
  { section: '3.1(c) – Nil Rated',                 taxable: 180000,  igst: 0,    cgst: 0,      sgst: 0 },
  { section: '4 – ITC Available',                  taxable: 0,       igst: 7650, cgst: 60750,  sgst: 60750 },
];

export default function GST() {
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);

  const gstr1Cols = [
    { key: 'invoice',  label: 'Invoice No', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'gstin',    label: 'GSTIN',      render: v => <span className="font-mono text-xs text-[#9CA3AF]">{v}</span> },
    { key: 'taxable',  label: 'Taxable',    render: v => fmt(v) },
    { key: 'cgst',     label: 'CGST',       render: v => fmt(v) },
    { key: 'sgst',     label: 'SGST',       render: v => fmt(v) },
    { key: 'igst',     label: 'IGST',       render: v => fmt(v) },
    { key: 'status',   label: 'Status',     render: v => <Badge label={v} variant={statusVariant[v]} /> },
  ];

  const gstr2aCols = [
    { key: 'supplier', label: 'Supplier' },
    { key: 'invoice',  label: 'Invoice',   render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'date',     label: 'Date' },
    { key: 'value',    label: 'Value',     render: v => fmt(v) },
    { key: 'status',   label: 'Match',     render: v => <Badge label={v} variant={statusVariant[v]} /> },
    { key: 'reason',   label: 'Reason',    render: v => v ? <span className="text-xs text-[#C0392B]">{v}</span> : '—' },
    { key: 'status',   label: 'Action',    render: v => v !== 'Matched' ? (
      <div className="flex gap-1">
        <button className="px-2 py-1 text-xs bg-[#E8F5ED] text-[#2D7D46] border border-[#A8D5BC] rounded-md hover:bg-[#D1F0DC]">Accept</button>
        <button className="px-2 py-1 text-xs bg-[#FDECEA] text-[#C0392B] border border-[#EDBBB8] rounded-md hover:bg-[#FAD8D5]">Reject</button>
      </div>
    ) : <span className="text-[#C5CBD0] text-xs">—</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">GST Compliance</h1>
        <p className="page-subtitle">FY 2025-26 · July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="GSTR-1 Status"  value="Filed"      sub="July 2025"     icon={CheckCircle}  accent="#2D7D46" />
        <KPICard title="GSTR-3B Status" value="Pending"    sub="Due 20 Aug"    icon={AlertTriangle} accent="#B45309" />
        <KPICard title="2A Mismatches"  value="2 entries"                      icon={XCircle}      accent="#C0392B" />
        <KPICard title="ITC Available"  value="₹1,29,150"                      icon={ShieldCheck}  accent="#3F5263" />
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#ECEEEF] px-1 pt-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg mr-1 ${
                tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1C2B3A]">Outward Supplies — July 2025</p>
                <div className="flex gap-2">
                  {['JSON', 'CSV', 'XLSX'].map(b => (
                    <button key={b} className="px-3 py-1.5 border border-[#D9DCE0] text-[#6B7280] text-xs rounded-lg hover:bg-[#F4F5F6] transition-colors">
                      Export {b}
                    </button>
                  ))}
                </div>
              </div>
              <Table columns={gstr1Cols} data={gstr1Data} onRowClick={setDrawer} />
            </>
          )}

          {tab === 1 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-[#1C2B3A]">GSTR-2A Reconciliation</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-[#3F5263] hover:bg-[#526373] transition-colors">
                    Auto-Match All
                  </button>
                  <button className="px-3 py-1.5 border border-[#D9DCE0] text-[#6B7280] text-xs rounded-lg hover:bg-[#F4F5F6] transition-colors">
                    Export CSV
                  </button>
                </div>
              </div>
              <Table columns={gstr2aCols} data={gstr2aData} onRowClick={setDrawer} />
            </>
          )}

          {tab === 2 && (
            <div>
              <p className="text-sm font-semibold text-[#1C2B3A] mb-4">GSTR-3B Summary — July 2025</p>
              <div className="overflow-x-auto rounded-xl border border-[#D9DCE0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F4F5F6] border-b border-[#D9DCE0]">
                      {['Section', 'Taxable Value', 'IGST', 'CGST', 'SGST'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9CA3AF] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gstr3b.map((row, i) => (
                      <tr key={i} className="border-b border-[#ECEEEF] hover:bg-[#F4F5F6]">
                        <td className="px-4 py-3 font-medium text-[#1C2B3A]">{row.section}</td>
                        <td className="px-4 py-3">{row.taxable ? fmt(row.taxable) : <span className="text-[#C5CBD0]">—</span>}</td>
                        <td className="px-4 py-3">{row.igst   ? fmt(row.igst)    : <span className="text-[#C5CBD0]">—</span>}</td>
                        <td className="px-4 py-3">{row.cgst   ? fmt(row.cgst)    : <span className="text-[#C5CBD0]">—</span>}</td>
                        <td className="px-4 py-3">{row.sgst   ? fmt(row.sgst)    : <span className="text-[#C5CBD0]">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(tab === 3 || tab === 4) && (
            <div className="py-12 text-center">
              <ShieldCheck size={36} className="mx-auto mb-3 text-[#D9DCE0]" />
              <p className="text-sm font-medium text-[#6B7280]">{TABS[tab]}</p>
              <p className="text-xs mt-1 text-[#9CA3AF]">No records for July 2025</p>
            </div>
          )}

          {tab === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FEF6E4] border border-[#F0D49A] rounded-xl text-sm text-[#B45309]">
                Annual return for FY 2025-26 will be available after March 2026.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Outward Supplies (YTD)', '₹2,31,80,000'], ['ITC Claimed (YTD)', '₹18,45,000'], ['Tax Paid (YTD)', '₹24,52,000'], ['Late Fee (YTD)', '—']].map(([l, v]) => (
                  <div key={l} className="p-4 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
                    <p className="text-xs text-[#9CA3AF] mb-1">{l}</p>
                    <p className="font-bold text-[#1C2B3A]">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title="GST Entry Details">
        {drawer && (
          <div className="space-y-0">
            {Object.entries(drawer).filter(([k]) => k !== 'id').map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-[#F4F5F6]">
                <span className="text-xs text-[#9CA3AF] capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-[#1C2B3A] text-right max-w-xs">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
