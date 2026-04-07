import { useState } from 'react';
import { Truck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Drawer from '../../components/Drawer';
import { ewayBills, ewbPerDay } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const statusVariant = { Active: 'green', Expiring: 'yellow', Expired: 'red', Cancelled: 'gray' };

export default function EWayBill() {
  const [drawer, setDrawer] = useState(null);
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">E-Way Bill</h1><p className="text-sm text-[#6B7280] mt-0.5">July 2025</p></div>
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total EWBs"    value="7" sub="July 2025" icon={Truck}         accent="#3F5263" />
        <KPICard title="Active"         value="4"               icon={CheckCircle}  accent="#2D7D46" />
        <KPICard title="Expiring Today" value="1"               icon={AlertTriangle} accent="#B45309" />
        <KPICard title="Cancelled"      value="1"               icon={XCircle}       accent="#C0392B" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">EWBs per Day</p>
          <p className="text-xs text-[#6B7280] mb-4">July 2025</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ewbPerDay} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #D9DCE0', borderRadius: 8 }} />
              <Bar dataKey="count" name="EWBs" fill="#3F5263" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-3">Recent Activity</p>
          <div className="space-y-2">
            {ewayBills.slice(0,4).map(e => (
              <div key={e.id} className="flex items-start justify-between cursor-pointer hover:bg-[#F4F5F6] p-2 rounded-lg" onClick={() => setDrawer(e)}>
                <div><p className="text-sm font-medium text-[#1C2B3A]">{e.party.split(' ')[0]}</p><p className="text-xs text-[#6B7280]">{e.ewbNo.slice(-6)} · {e.date}</p></div>
                <Badge label={e.status} variant={statusVariant[e.status]} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#D9DCE0] rounded-xl">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#D9DCE0]">
          <p className="text-sm font-semibold text-[#1C2B3A]">E-Way Bill Register</p>
          <div className="flex gap-2">{['PDF','CSV'].map(b => <button key={b} className="px-3 py-1.5 border border-[#D9DCE0] text-[#6B7280] text-xs rounded-lg hover:bg-[#F4F5F6]">Export {b}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F9F9] border-b border-[#D9DCE0]">
              <tr>{['EWB No','Date','Party','Route','Amount','Mode','Status','Valid Till','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {ewayBills.map((e, i) => (
                <tr key={e.id} className="border-b border-[#F0EFE9] hover:bg-[#F4F5F6] cursor-pointer" onClick={() => setDrawer(e)}>
                  <td className="px-4 py-3 font-mono text-xs text-[#3F5263] font-semibold">{e.ewbNo}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{e.date}</td>
                  <td className="px-4 py-3 font-medium text-[#1C2B3A]">{e.party}</td>
                  <td className="px-4 py-3 text-[#6B7280] text-xs">{e.from} → {e.to}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{e.mode}</td>
                  <td className="px-4 py-3"><Badge label={e.status} variant={statusVariant[e.status]} /></td>
                  <td className="px-4 py-3 text-[#6B7280]">{e.validity}</td>
                  <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                    <div className="flex gap-1">
                      {e.status === 'Active' && <button className="px-2 py-1 text-xs bg-[#ECEEEF] text-[#3F5263] rounded-md hover:bg-[#D9DCE0]">Extend</button>}
                      {e.status !== 'Cancelled' && <button className="px-2 py-1 text-xs bg-[#FDECEA] text-[#C0392B] rounded-md hover:bg-[#FAD8D5]">Cancel</button>}
                      <button className="px-2 py-1 text-xs bg-[#F4F5F6] text-[#6B7280] rounded-md hover:bg-[#ECEEEF]">PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={`EWB: ${drawer?.ewbNo || ''}`}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div><p className="font-semibold text-[#1C2B3A]">{drawer.party}</p><p className="font-mono text-xs text-[#6B7280]">{drawer.ewbNo}</p></div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Date',drawer.date],['From',drawer.from],['To',drawer.to],['Mode',drawer.mode],['Vehicle',drawer.vehicle],['Amount',fmt(drawer.amount)],['Valid Till',drawer.validity]].map(([l,v]) => (
                <div key={l} className="p-3 bg-[#F4F5F6] rounded-lg border border-[#D9DCE0]">
                  <p className="text-xs text-[#6B7280] mb-1">{l}</p>
                  <p className="font-medium text-[#1C2B3A] text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] transition-colors">View PDF</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] border border-[#D9DCE0] hover:bg-[#F4F5F6] transition-colors">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
