import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import KPICard from '../../components/KPICard';
import { plData, balanceSheetData, trialBalance, profitTrend, monthlySalesPurchase } from '../../data/mockData';

const fmt = n => '₹' + n.toLocaleString('en-IN');
const fmtL = n => '₹' + (n / 100000).toFixed(1) + 'L';
const TABS = ['Profit & Loss', 'Balance Sheet', 'Trial Balance'];
const COLORS = ['#059669','#8B5CF6','#10B981','#F59E0B','#F43F5E'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E7E3] rounded-xl p-3 shadow-notion-md text-xs">
      <p className="font-semibold text-[#1A1A1A] mb-1">{label}</p>
      {payload.map((p, i) => <div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="text-[#787774]">{p.name}:</span><span className="font-medium">{fmtL(p.value)}</span></div>)}
    </div>
  );
};

function ExpandRow({ label, amount, children, highlight }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className={`border-b border-[#F1F0EC] cursor-pointer hover:bg-[#F7F6F3] ${highlight ? 'bg-[#ECFDF5]' : ''}`} onClick={() => setOpen(p => !p)}>
        <td className="px-4 py-3">
          <span className="flex items-center gap-2 font-medium text-[#1A1A1A]">
            {children ? (open ? <ChevronDown size={13} className="text-[#787774]" /> : <ChevronRight size={13} className="text-[#787774]" />) : <span className="w-3.5" />}
            {label}
          </span>
        </td>
        <td className={`px-4 py-3 text-right font-semibold ${highlight ? 'text-[#059669]' : 'text-[#1A1A1A]'}`}>{fmt(amount)}</td>
      </tr>
      {open && children}
    </>
  );
}

export default function Reports() {
  const [tab, setTab] = useState(0);
  const { selectedCompany, token } = useAuth();
  const [realPL, setRealPL] = useState(null);
  const [realBS, setRealBS] = useState(null);
  const [loadingReal, setLoadingReal] = useState(false);

  useEffect(() => {
    if (!token || !selectedCompany?.guid) return;
    setLoadingReal(true);
    Promise.all([
      api.fetchVouchers({ companyGuid: selectedCompany.guid, page: 1, pageSize: 1 }).catch(() => null),
    ]).finally(() => setLoadingReal(false));
  }, [selectedCompany?.guid, token]);
  const totalDI = plData.income.directIncome.reduce((s, i) => s + i.amount, 0);
  const totalII = plData.income.indirectIncome.reduce((s, i) => s + i.amount, 0);
  const totalDE = plData.expenses.directExpense.reduce((s, i) => s + i.amount, 0);
  const totalIE = plData.expenses.indirectExpense.reduce((s, i) => s + i.amount, 0);
  const grossProfit = (totalDI + plData.closingStock) - (totalDE + plData.openingStock);
  const netProfit = grossProfit + totalII - totalIE;
  const totalAssets = [...balanceSheetData.assets.fixedAssets, ...balanceSheetData.assets.currentAssets].reduce((s, a) => s + a.amount, 0);
  const totalLiab = [...balanceSheetData.liabilities.capital, ...balanceSheetData.liabilities.longTermLiabilities, ...balanceSheetData.liabilities.currentLiabilities].reduce((s, a) => s + a.amount, 0);

  const expBreakdown = [
    { name: 'Purchase', value: 2840000 },
    { name: 'Salary', value: 380000 },
    { name: 'Freight', value: 85000 },
    { name: 'Rent', value: 75000 },
    { name: 'Others', value: 182500 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Financial Reports</h1>
        <p className="text-sm text-[#787774] mt-0.5">FY 2025-26 · July 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Revenue" value={fmtL(totalDI + totalII)} icon={TrendingUp} accent="#059669" trend={{ up: true, label: '14% vs Jun' }} />
        <KPICard title="Total Expenses" value={fmtL(totalDE + totalIE)} icon={TrendingUp} accent="#F43F5E" />
        <KPICard title="Net Profit" value={fmtL(netProfit)} icon={TrendingUp} accent="#10B981" trend={{ up: true, label: '2.5% vs Jun' }} />
        <KPICard title="Closing Stock" value={fmtL(plData.closingStock)} icon={TrendingUp} accent="#F59E0B" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Profit Trend</p>
          <p className="text-xs text-[#787774] mb-4">6-month net profit</p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={profitTrend}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, border: '1px solid #E8E7E3', borderRadius: 8 }} />
              <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#pg)" dot={{ r: 3, fill: '#059669', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Expense Breakdown</p>
          <p className="text-xs text-[#787774] mb-4">By category</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={expBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {expBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, border: '1px solid #E8E7E3', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E8E7E3] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Sales vs Purchase</p>
          <p className="text-xs text-[#787774] mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthlySalesPurchase} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#059669" radius={[3,3,0,0]} />
              <Bar dataKey="purchase" fill="#D1FAE5" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#E8E7E3]">
              <table className="w-full text-sm">
                <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#787774] uppercase">Particulars</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#787774] uppercase">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <ExpandRow label="Direct Income" amount={totalDI}>
                    {plData.income.directIncome.map(i => <tr key={i.ledger} className="border-b border-[#F1F0EC] bg-[#FBFAF8]"><td className="px-4 py-2 text-[#787774] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#787774]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <ExpandRow label="Indirect Income" amount={totalII}>
                    {plData.income.indirectIncome.map(i => <tr key={i.ledger} className="border-b border-[#F1F0EC] bg-[#FBFAF8]"><td className="px-4 py-2 text-[#787774] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#787774]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <tr className="bg-emerald-50 border-b border-emerald-100"><td className="px-4 py-3 font-bold text-emerald-700">Gross Profit</td><td className="px-4 py-3 text-right font-bold text-emerald-700">{fmt(grossProfit)}</td></tr>
                  <ExpandRow label="Direct Expense" amount={totalDE}>
                    {plData.expenses.directExpense.map(i => <tr key={i.ledger} className="border-b border-[#F1F0EC] bg-[#FBFAF8]"><td className="px-4 py-2 text-[#787774] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#787774]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <ExpandRow label="Indirect Expense" amount={totalIE}>
                    {plData.expenses.indirectExpense.map(i => <tr key={i.ledger} className="border-b border-[#F1F0EC] bg-[#FBFAF8]"><td className="px-4 py-2 text-[#787774] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#787774]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <tr className="bg-[#ECFDF5]"><td className="px-4 py-3 font-bold text-[#059669] text-base">Net Profit</td><td className="px-4 py-3 text-right font-bold text-[#059669] text-base">{fmt(netProfit)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === 1 && (
            <div className="grid grid-cols-2 gap-8">
              {[['ASSETS', [['Fixed Assets', balanceSheetData.assets.fixedAssets], ['Current Assets', balanceSheetData.assets.currentAssets]], totalAssets], ['LIABILITIES', [['Capital', balanceSheetData.liabilities.capital], ['Long-Term', balanceSheetData.liabilities.longTermLiabilities], ['Current', balanceSheetData.liabilities.currentLiabilities]], totalLiab]].map(([title, groups, total]) => (
                <div key={title}>
                  <h3 className="text-xs font-bold text-[#AEACA8] uppercase tracking-widest mb-4 pb-2 border-b border-[#E8E7E3]">{title}</h3>
                  <div className="space-y-4 text-sm">
                    {groups.map(([gName, items]) => (
                      <div key={gName}>
                        <p className="font-semibold text-[#787774] text-xs uppercase tracking-wide mb-2">{gName}</p>
                        {items.map(a => (
                          <div key={a.ledger} className="flex justify-between py-1.5 pl-3 border-b border-[#F1F0EC] last:border-0">
                            <span className="text-[#787774]">{a.ledger}</span>
                            <span className="font-medium text-[#1A1A1A]">{fmt(a.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-between py-2.5 mt-2 border-t-2 border-[#059669] font-bold text-[#059669]">
                      <span>Total {title}</span><span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 2 && (
            <div className="overflow-x-auto rounded-xl border border-[#E8E7E3]">
              <table className="w-full text-sm">
                <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
                  <tr>{['Ledger','Group','Opening Dr','Opening Cr','Period Dr','Period Cr','Closing Dr','Closing Cr'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-[#787774] uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {trialBalance.map((row, i) => (
                    <tr key={i} className="border-b border-[#F1F0EC] hover:bg-[#F7F6F3]">
                      <td className="px-3 py-2.5 font-medium text-[#1A1A1A]">{row.ledger}</td>
                      <td className="px-3 py-2.5 text-[#787774]">{row.group}</td>
                      {[row.openingDr, row.openingCr, row.periodDr, row.periodCr, row.closingDr, row.closingCr].map((v, j) => (
                        <td key={j} className="px-3 py-2.5 text-right">{v ? fmt(v) : <span className="text-[#AEACA8]">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
