import { useState } from 'react';
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { auditTrail } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const actionVariant = { Created: 'green', Modified: 'yellow', Deleted: 'red' };
const TABS = ['Day Book', 'My Entries'];
const perDay = [{day:'1',count:4},{day:'2',count:7},{day:'3',count:3},{day:'4',count:8},{day:'5',count:5},{day:'6',count:6},{day:'7',count:9},{day:'8',count:4},{day:'9',count:7},{day:'10',count:8}];

const cols = [
  {key:'date',label:'Date'},
  {key:'voucher',label:'Voucher No',render:v=><span className="font-mono text-xs text-[#059669]">{v}</span>},
  {key:'type',label:'Type'},
  {key:'ledger',label:'Ledger'},
  {key:'drCr',label:'Dr/Cr',render:v=><span className={v==='Dr'?'text-emerald-600 font-semibold':'text-rose-500 font-semibold'}>{v}</span>},
  {key:'amount',label:'Amount',render:v=>fmt(v)},
  {key:'user',label:'User',render:v=><span className="text-[#787774]">{v}</span>},
  {key:'action',label:'Action',render:v=><Badge label={v} variant={actionVariant[v]}/>},
];

export default function AuditTrail() {
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState(null);
  const myEntries = auditTrail.filter(e => e.user === 'Rajesh K.');

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Audit Trail</h1><p className="text-sm text-[#787774] mt-0.5">April – July 2025</p></div>
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Entries" value="8" sub="July 2025" icon={ClipboardList} accent="#059669"/>
        <KPICard title="Created" value="6" icon={Plus} accent="#10B981"/>
        <KPICard title="Modified" value="1" icon={Edit} accent="#F59E0B"/>
        <KPICard title="Deleted" value="1" icon={Trash2} accent="#F43F5E"/>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Activity per Day</p>
          <p className="text-xs text-[#787774] mb-4">July 2025</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={perDay} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:10,fill:'#787774'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#787774'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontSize:11,border:'1px solid #E8E7E3',borderRadius:8}}/>
              <Bar dataKey="count" name="Entries" fill="#059669" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Latest Entries</p>
          <div className="space-y-2.5">
            {auditTrail.slice(0,5).map((e,i)=>(
              <div key={i} className="flex items-start gap-2.5 cursor-pointer hover:bg-[#F7F6F3] p-2 rounded-lg" onClick={()=>setDrawer(e)}>
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.action==='Created'?'bg-emerald-500':e.action==='Modified'?'bg-amber-400':'bg-rose-500'}`}/>
                <div>
                  <p className="text-xs font-medium text-[#1A1A1A]">{e.voucher} – {e.type}</p>
                  <p className="text-xs text-[#787774]">{e.date} · {e.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1">
          {TABS.map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab===i?'text-[#059669] bg-[#ECFDF5]':'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          <Table columns={cols} data={tab===0?auditTrail:myEntries} onRowClick={setDrawer}/>
        </div>
      </div>
      <Drawer open={!!drawer} onClose={()=>setDrawer(null)} title="Voucher Details">
        {drawer&&(
          <div className="space-y-3 text-sm">
            {[['Date',drawer.date],['Voucher No',drawer.voucher],['Type',drawer.type],['Ledger',drawer.ledger],['Dr/Cr',drawer.drCr],['Amount',fmt(drawer.amount)],['User',drawer.user],['Action',drawer.action]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-[#F1F0EC]">
                <span className="text-[#787774]">{l}</span><span className="font-medium text-[#1A1A1A]">{v}</span>
              </div>
            ))}
            <button className="w-full py-2.5 mt-2 rounded-lg text-sm font-medium text-white" style={{background:'#059669'}}>View Full Voucher</button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
