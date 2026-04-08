import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import KPICard from '../../components/KPICard';

const daily = [
  {day:'1',count:5,errors:0},{day:'2',count:8,errors:1},{day:'3',count:3,errors:0},
  {day:'4',count:6,errors:2},{day:'5',count:9,errors:0},{day:'6',count:4,errors:1},
  {day:'7',count:7,errors:0},{day:'8',count:5,errors:3},{day:'9',count:8,errors:0},{day:'10',count:6,errors:1},
];
const errors = [{rank:1,error:'Invalid GSTIN format',count:4,pct:44},{rank:2,error:'Schema validation failed',count:3,pct:33},{rank:3,error:'Duplicate IRN',count:2,pct:22}];
const recent = [
  {time:'10:24 AM',event:'IRN generated',ref:'SI-2025-0782',status:'success'},
  {time:'10:01 AM',event:'IRN error',ref:'SI-2025-0781',status:'error'},
  {time:'09:45 AM',event:'IRN retry success',ref:'SI-2025-0779',status:'success'},
  {time:'09:12 AM',event:'IRN generated',ref:'SI-2025-0778',status:'success'},
  {time:'08:55 AM',event:'IRN pending',ref:'SI-2025-0776',status:'pending'},
];

export default function EInvoice() {
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-[#37352F] tracking-tight">E-Invoice</h1><p className="text-sm text-[#787774] mt-0.5">FY 2025-26 · July 2025 — Dashboard Only</p></div>
      <div className="p-3 bg-[#EFEFEF] border border-[#C5CBD0] rounded-xl text-xs text-[#37352F] font-medium">
        ℹ️ IRN generation, cancellation and retry are managed from <strong>Sales Register → IRN column</strong>.
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="IRNs Generated" value="46" sub="July 2025" icon={FileText}    accent="#37352F" />
        <KPICard title="IRN Errors"      value="9"  sub="this month" icon={AlertTriangle} accent="#EB5757" />
        <KPICard title="IRNs Pending"    value="3"                   icon={Clock}         accent="#D9730D" />
        <KPICard title="Success Rate"    value="80.4%"               icon={CheckCircle}   accent="#0F7B6C" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#D3D1CB] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#37352F] mb-1">Daily IRN Trend</p>
          <p className="text-xs text-[#787774] mb-4">July 2025</p>
          <div className="flex items-end gap-2 overflow-x-auto pb-2">
            {daily.map(d => (
              <div key={d.day} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex flex-col-reverse items-center gap-0.5">
                  <div className="w-7 rounded-t-md" style={{ height: d.count * 10, background: '#37352F' }} />
                  {d.errors > 0 && <div className="w-7 rounded-t-md" style={{ height: d.errors * 10, background: '#EB5757' }} />}
                </div>
                <span className="text-[10px] text-[#787774]">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#1A1A1A]" /><span className="text-[#9A9A97]">Generated</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#EB5757]" /><span className="text-[#9A9A97]">Errors</span></div>
          </div>
        </div>
        <div className="bg-white border border-[#D3D1CB] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#37352F] mb-4">Top Error Types</p>
          <div className="space-y-4">
            {errors.map(e => (
              <div key={e.rank}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#37352F] font-medium">#{e.rank} {e.error}</span>
                  <span className="text-[#787774]">{e.count}x</span>
                </div>
                <div className="w-full bg-[#F7F7F5] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-[#EB5757]" style={{ width: `${e.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#D3D1CB] rounded-xl p-5">
        <p className="text-sm font-semibold text-[#37352F] mb-4">Recent Activity</p>
        <div className="space-y-3">
          {recent.map((a,i) => (
            <div key={i} className="flex items-center gap-4 text-sm py-2.5 border-b border-[#F7F7F5] last:border-0">
              <span className="text-[#787774] text-xs w-16 flex-shrink-0">{a.time}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status==='success'?'bg-[#0F7B6C]':a.status==='error'?'bg-[#EB5757]':'bg-[#D9730D]'}`} />
              <span className="text-[#37352F] flex-1">{a.event}</span>
              <span className="font-mono text-xs text-[#37352F] font-semibold">{a.ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
