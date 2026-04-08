import { useState } from 'react';
import { CreditCard, Calendar, TrendingDown, AlertTriangle } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { loans, odAccounts, emiSchedule } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const statusVariant = { Active: 'green', Closed: 'gray', NPA: 'red' };
const emiVariant = { Paid: 'green', Due: 'yellow', Upcoming: 'blue', Overdue: 'red' };
const TABS = ['Loans Register', 'OD Accounts', 'EMI Calendar'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCalendar() {
  const weeks = []; let week = [];
  for (let d = 1; d <= 31; d++) {
    const dow = new Date(2025, 6, d).getDay();
    if (d === 1) week = new Array(dow).fill(null);
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) weeks.push([...week, ...new Array(7 - week.length).fill(null)]);
  return weeks;
}

const emiDays = { 15: { label: 'HDFC EMI', status: 'Due', amount: 110000 }, 20: { label: 'Axis EMI', status: 'Upcoming', amount: 18500 } };

export default function LoansODs() {
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);
  const calendar = buildCalendar();

  const loanCols = [
    { key: 'name', label: 'Loan Name' },
    { key: 'lender', label: 'Lender' },
    { key: 'type', label: 'Type' },
    { key: 'sanctioned', label: 'Sanctioned', render: v => fmt(v) },
    { key: 'outstanding', label: 'Outstanding', render: v => <span className="font-semibold text-[#EB5757]">{fmt(v)}</span> },
    { key: 'emiAmount', label: 'EMI/Month', render: v => fmt(v) },
    { key: 'nextEmiDate', label: 'Next EMI' },
    { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#37352F] tracking-tight">Loans & ODs</h1>
        <p className="text-sm text-[#787774] mt-0.5">July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Loan Outstanding" value="₹43.2L" icon={CreditCard} accent="#EB5757" />
        <KPICard title="EMI / Month" value="₹1,28,500" icon={Calendar} accent="#F59E0B" />
        <KPICard title="HDFC OD Utilization" value="65.6%" sub="₹32.8L of ₹50L" icon={TrendingDown} accent="#37352F" />
        <KPICard title="EMI Due Soon" value="2 EMIs" sub="within 7 days" icon={AlertTriangle} accent="#EB5757" />
      </div>

      <div className="bg-white border border-[#D3D1CB] rounded-xl">
        <div className="flex border-b border-[#D3D1CB] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#37352F] bg-[#EFEFEF]' : 'text-[#787774] hover:text-[#37352F] hover:bg-[#F7F7F5]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && <Table columns={loanCols} data={loans} onRowClick={setDrawer} />}
          {tab === 1 && (
            <div className="space-y-4">
              {odAccounts.map(od => {
                const pct = Math.round((od.utilized / od.limit) * 100);
                const color = pct > 80 ? '#EB5757' : pct > 60 ? '#F59E0B' : '#0F7B6C';
                return (
                  <div key={od.id} className="border border-[#D3D1CB] rounded-xl p-5 bg-[#F9F9F9]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-[#37352F]">{od.name}</p>
                        <p className="text-sm text-[#787774]">{od.bank} · {od.accountNo}</p>
                      </div>
                      <Badge label={od.status} variant="green" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div><p className="text-xs text-[#787774] mb-1">Limit</p><p className="font-semibold text-[#37352F]">{fmt(od.limit)}</p></div>
                      <div><p className="text-xs text-[#787774] mb-1">Utilized</p><p className="font-semibold" style={{ color }}>{fmt(od.utilized)}</p></div>
                      <div><p className="text-xs text-[#787774] mb-1">Available</p><p className="font-semibold text-[#0F7B6C]">{fmt(od.limit - od.utilized)}</p></div>
                    </div>
                    <div className="w-full bg-[#F7F7F5] rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <p className="text-xs text-[#787774] mt-1.5">{pct}% utilized · {od.interest}% p.a.</p>
                  </div>
                );
              })}
            </div>
          )}
          {tab === 2 && (
            <div>
              <p className="text-sm font-semibold text-[#37352F] mb-4">EMI Calendar — July 2025</p>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-[#9A9A97] py-1">{d}</div>)}
              </div>
              {calendar.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                  {week.map((day, di) => {
                    const emi = day && emiDays[day];
                    return (
                      <div key={di} className={`h-14 rounded-lg flex flex-col items-center justify-center text-xs border transition-colors ${!day ? 'border-transparent' : emi ? 'border-[#37352F] bg-[#EFEFEF] cursor-pointer hover:bg-[#EDF3EC]' : 'border-[#D3D1CB] bg-white hover:bg-[#F7F7F5]'}`}>
                        {day && <span className={`font-medium ${emi ? 'text-[#37352F]' : 'text-[#37352F]'}`}>{day}</span>}
                        {emi && <span className="text-[9px] font-semibold text-[#37352F] mt-0.5 px-1 truncate">{emi.label}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex gap-4 mt-4 text-xs">
                {[['Due','#F59E0B'],['Upcoming','#37352F'],['Paid','#0F7B6C'],['Overdue','#EB5757']].map(([l,c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                    <span className="text-[#787774]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[#37352F]">{drawer.name}</p>
                <p className="text-sm text-[#787774]">{drawer.lender} · {drawer.accountNo}</p>
              </div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Sanctioned',fmt(drawer.sanctioned)],['Outstanding',fmt(drawer.outstanding)],['Interest Rate',drawer.interestRate+'%'],['Tenure',drawer.tenure+' months'],['EMI Amount',fmt(drawer.emiAmount)],['Next EMI',drawer.nextEmiDate],['Type',drawer.type],['Collateral',drawer.collateral]].map(([l,v]) => (
                <div key={l} className="p-3 bg-[#F9F9F9] rounded-lg border border-[#D3D1CB]">
                  <p className="text-xs text-[#787774] mb-1">{l}</p>
                  <p className="font-medium text-[#37352F] text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#9A9A97] uppercase tracking-wider mb-2">EMI Schedule</p>
              <div className="overflow-x-auto rounded-lg border border-[#D3D1CB]">
                <table className="w-full text-xs">
                  <thead className="bg-[#F9F9F9]"><tr>
                    {['#','Date','Principal','Interest','EMI','Status'].map(h => <th key={h} className="px-3 py-2 text-left text-[#787774] font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {emiSchedule.map(e => (
                      <tr key={e.no} className="border-t border-[#F7F7F5]">
                        <td className="px-3 py-2 text-[#787774]">{e.no}</td>
                        <td className="px-3 py-2">{e.date}</td>
                        <td className="px-3 py-2">{fmt(e.principal)}</td>
                        <td className="px-3 py-2">{fmt(e.interest)}</td>
                        <td className="px-3 py-2 font-semibold">{fmt(e.emi)}</td>
                        <td className="px-3 py-2"><Badge label={e.status} variant={emiVariant[e.status]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
