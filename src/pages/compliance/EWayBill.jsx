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
      <div><h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">E-Way Bill</h1><p className="text-sm text-[#787774] mt-0.5">July 2025</p></div>
      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total EWBs" value="7" sub="July 2025" icon={Truck} accent="#059669" />
        <KPICard title="Active" value="4" icon={CheckCircle} accent="#10B981" />
        <KPICard title="Expiring Today" value="1" icon={AlertTriangle} accent="#F59E0B" />
        <KPICard title="Cancelled" value="1" icon={XCircle} accent="#787774" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">EWBs per Day</p>
          <p className="text-xs text-[#787774] mb-4">July 2025</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ewbPerDay} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E8E7E3', borderRadius: 8 }} />
              <Bar dataKey="count" name="EWBs" fill="#059669" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Recent Activity</p>
          <div className="space-y-2">
            {ewayBills.slice(0,4).map(e => (
              <div key={e.id} className="flex items-start justify-between cursor-pointer hover:bg-[#F7F6F3] p-2 rounded-lg" onClick={() => setDrawer(e)}>
                <div><p className="text-sm font-medium text-[#1A1A1A]">{e.party.split(' ')[0]}</p><p className="text-xs text-[#787774]">{e.ewbNo.slice(-6)} · {e.date}</p></div>
                <Badge label={e.status} variant={statusVariant[e.status]} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#E8E7E3]">
          <p className="text-sm font-semibold text-[#1A1A1A]">E-Way Bill Register</p>
          <div className="flex gap-2">{['PDF','CSV'].map(b => <button key={b} className="px-3 py-1.5 border border-[#E8E7E3] text-[#787774] text-xs rounded-lg hover:bg-[#F7F6F3]">Export {b}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
              <tr>{['EWB No','Date','Party','Route','Amount','Mode','Status','Valid Till','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#787774] uppercase whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {ewayBills.map((e, i) => (
                <tr key={e.id} className="border-b border-[#F1F0EC] hover:bg-[#F7F6F3] cursor-pointer" onClick={() => setDrawer(e)}>
                  <td className="px-4 py-3 font-mono text-xs text-[#059669]">{e.ewbNo}</td>
                  <td className="px-4 py-3 text-[#787774]">{e.date}</td>
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{e.party}</td>
                  <td className="px-4 py-3 text-[#787774] text-xs">{e.from} → {e.to}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-[#787774]">{e.mode}</td>
                  <td className="px-4 py-3"><Badge label={e.status} variant={statusVariant[e.status]} /></td>
                  <td className="px-4 py-3 text-[#787774]">{e.validity}</td>
                  <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                    <div className="flex gap-1">
                      {e.status === 'Active' && <button className="px-2 py-1 text-xs bg-[#ECFDF5] text-[#059669] rounded-md hover:bg-[#D1FAE5]">Extend</button>}
                      {e.status !== 'Cancelled' && <button className="px-2 py-1 text-xs bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100">Cancel</button>}
                      <button className="px-2 py-1 text-xs bg-[#F7F6F3] text-[#787774] rounded-md hover:bg-[#F1F0EC]">PDF</button>
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
              <div><p className="font-semibold text-[#1A1A1A]">{drawer.party}</p><p className="font-mono text-xs text-[#787774]">{drawer.ewbNo}</p></div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Date',drawer.date],['From',drawer.from],['To',drawer.to],['Mode',drawer.mode],['Vehicle',drawer.vehicle],['Amount',fmt(drawer.amount)],['Valid Till',drawer.validity]].map(([l,v]) => (
                <div key={l} className="p-3 bg-[#FBFAF8] rounded-lg border border-[#E8E7E3]">
                  <p className="text-xs text-[#787774] mb-1">{l}</p>
                  <p className="font-medium text-[#1A1A1A] text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>View PDF</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Share</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
