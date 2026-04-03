import { useState } from 'react';
import { Receipt, Search, Download, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { expenses, expenseCategories, expenseKPIs } from '../../data/expensesMock';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const statusVariant = { Paid: 'green', Unpaid: 'red' };
const COLORS = ['#3F5263','#526373','#798692','#9FA9B1','#B2BAC1'];

const cols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'voucher', label: 'Voucher', render: v => <span className="font-mono text-xs text-[#3F5263] font-semibold">{v}</span> },
  { key: 'category', label: 'Category' },
  { key: 'ledger', label: 'Ledger', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'amount', label: 'Amount', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'tax', label: 'Tax', render: v => v ? fmt(v) : <span className="text-[#AEACA8]">—</span> },
  { key: 'mode', label: 'Mode', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
  { key: 'attachment', label: 'Docs', render: v => v ? <span className="text-xs text-[#3F5263] font-medium">📎</span> : <span className="text-[#C5CBD0]">—</span> },
];

export default function ExpensesModule() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);

  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];
  const filtered = expenses.filter(e => {
    const s = !search || e.category.toLowerCase().includes(search.toLowerCase()) || e.voucher.toLowerCase().includes(search.toLowerCase());
    const c = categoryFilter === 'All' || e.category === categoryFilter;
    const m = modeFilter === 'All' || e.mode === modeFilter;
    return s && c && m;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Expenses</h1>
        <p className="text-sm text-[#787774] mt-0.5">July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Expenses" value={fmt(expenseKPIs.total)} icon={Receipt} accent="#3F5263" />
        <KPICard title="Total Tax"       value={fmt(expenseKPIs.tax)}   icon={Receipt} accent="#B45309" />
        <KPICard title="Paid"            value={expenseKPIs.paid}       icon={Receipt} accent="#2D7D46" />
        <KPICard title="Unpaid"          value={expenseKPIs.unpaid}     icon={Receipt} accent="#C0392B" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Expense by Category</p>
          <p className="text-xs text-[#787774] mb-4">July 2025</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={expenseCategories} barSize={28} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v / 1000) + 'K'} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#787774' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} />
              <Bar dataKey="amount" fill="#3F5263" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Category Mix</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="amount" paddingAngle={2}>
                {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {expenseCategories.map((c, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-[#787774] truncate max-w-24">{c.name}</span>
                </div>
                <span className="font-semibold text-[#1A1A1A]">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search category or voucher..."
              className="notion-input pl-8 w-full text-sm" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
            {['All', 'Cash', 'Bank', 'Credit'].map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E7E3] rounded-lg text-xs text-[#787774] hover:bg-[#F7F6F3]">
            <Download size={12} /> Export
          </button>
        </div>
        <Table columns={cols} data={filtered} onRowClick={setDrawer} />
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.voucher || 'Expense Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{drawer.category}</p>
                <p className="font-mono text-xs text-[#787774] mt-0.5">{drawer.voucher}</p>
              </div>
              <Badge label={drawer.status} variant={statusVariant[drawer.status]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Date',drawer.date],['Ledger',drawer.ledger],['Amount',fmt(drawer.amount)],['Tax',fmt(drawer.tax)],['Mode',drawer.mode],['Attachment',drawer.attachment?'Yes':'No']].map(([l,v])=>(
                <div key={l} className="p-3 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                  <p className="text-xs text-[#787774] mb-1">{l}</p>
                  <p className="font-medium text-[#1A1A1A] text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>View PDF</button>
              <button className="px-4 py-2.5 rounded-lg text-sm text-[#787774] border border-[#E8E7E3] hover:bg-[#F7F6F3]">Edit</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
