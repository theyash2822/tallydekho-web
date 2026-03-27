import { useState } from 'react';
import { Receipt, AlertTriangle } from 'lucide-react';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { tdsData } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const statusVariant = { Remitted: 'green', Pending: 'yellow', Overdue: 'red' };
const TAX_TABS = ['TDS','TCS','Import Duty','Export Duty','Excise','VAT','Cess'];
const kpis = {
  TDS:[{t:'Deducted',v:'₹42,000',a:'#059669'},{t:'Remitted',v:'₹29,250',a:'#10B981'},{t:'Pending Pay',v:'₹12,750',a:'#F59E0B'},{t:'Late Fee',v:'—',a:'#787774'}],
  TCS:[{t:'Collected',v:'₹18,200',a:'#059669'},{t:'Remitted',v:'₹18,200',a:'#10B981'},{t:'Pending Pay',v:'—',a:'#F59E0B'},{t:'Late Fee',v:'—',a:'#787774'}],
};
const lateChallans = [{party:'IT Services Co.',due:'07 Jul 2025',amount:9500,daysLate:3},{party:'Sunrise Electricals',due:'07 Jul 2025',amount:3000,daysLate:3}];
const tdsCols = [
  {key:'date',label:'Date'},
  {key:'voucher',label:'Voucher',render:v=><span className="font-mono text-xs text-[#787774]">{v}</span>},
  {key:'party',label:'Party'},
  {key:'section',label:'Section',render:v=><span className="font-mono text-xs bg-[#F1F0EC] px-1.5 py-0.5 rounded">{v}</span>},
  {key:'amount',label:'Amount',render:v=>fmt(v)},
  {key:'challan',label:'Challan',render:v=>v||<span className="text-amber-500 text-xs">Pending</span>},
  {key:'status',label:'Status',render:v=><Badge label={v} variant={statusVariant[v]}/>},
];

export default function OtherTaxes() {
  const [taxTab, setTaxTab] = useState('TDS');
  const [drawer, setDrawer] = useState(null);
  const [search, setSearch] = useState('');
  const filtered = tdsData.filter(r=>r.party.toLowerCase().includes(search.toLowerCase())||r.section.toLowerCase().includes(search.toLowerCase())||r.voucher.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Other Taxes</h1><p className="text-sm text-[#787774] mt-0.5">FY 2025-26 · July 2025</p></div>
      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1 overflow-x-auto">
          {TAX_TABS.map(t=>(
            <button key={t} onClick={()=>setTaxTab(t)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg mr-1 ${taxTab===t?'text-[#059669] bg-[#ECFDF5]':'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(kpis[taxTab]||kpis.TDS).map(k=><KPICard key={k.t} title={k.t} value={k.v} icon={Receipt} accent={k.a}/>)}
          </div>
          {taxTab==='TDS'&&lateChallans.length>0&&(
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-2"><AlertTriangle size={13}/>Top Late Challans</p>
              <div className="space-y-2">
                {lateChallans.map((c,i)=>(
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-amber-700 font-medium">{c.party}</span>
                    <span className="font-semibold text-[#1A1A1A]">{fmt(c.amount)}</span>
                    <span className="text-xs text-rose-600 font-medium">{c.daysLate} days overdue</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {taxTab==='TDS'?(
            <>
              <div className="flex justify-between items-center">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search party, voucher, section..." className="notion-input w-64 text-sm"/>
                <button className="px-3 py-1.5 border border-[#E8E7E3] text-[#787774] text-xs rounded-lg hover:bg-[#F7F6F3]">Export CSV</button>
              </div>
              <Table columns={tdsCols} data={filtered} onRowClick={setDrawer}/>
            </>
          ):(
            <div className="py-12 text-center text-[#787774]">
              <Receipt size={32} className="mx-auto mb-3 opacity-20"/>
              <p className="text-sm font-medium">No {taxTab} records for July 2025</p>
            </div>
          )}
        </div>
      </div>
      <Drawer open={!!drawer} onClose={()=>setDrawer(null)} title="Tax Entry Details">
        {drawer&&(
          <div className="space-y-3 text-sm">
            {[['Date',drawer.date],['Voucher',drawer.voucher],['Party',drawer.party],['Section',drawer.section],['Amount',fmt(drawer.amount)],['Challan',drawer.challan||'Pending'],['Status',drawer.status]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-[#F1F0EC]">
                <span className="text-[#787774]">{l}</span><span className="font-medium text-[#1A1A1A]">{v}</span>
              </div>
            ))}
            <button className="w-full py-2.5 mt-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>Mark as Remitted</button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
