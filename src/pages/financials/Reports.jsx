import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import KPICard from '../../components/KPICard';
import { balanceSheetData, trialBalance } from '../../data/mockData'; // only used for balance sheet structure

const fmt = n => '₹' + n.toLocaleString('en-IN');
const fmtL = n => '₹' + (n / 100000).toFixed(1) + 'L';
const TABS = ['Profit & Loss', 'Balance Sheet', 'Trial Balance'];
const COLORS = ['#3F5263','#526373','#798692','#9FA9B1','#B2BAC1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#D9DCE0] rounded-xl p-3 shadow-notion-md text-xs">
      <p className="font-semibold text-[#1C2B3A] mb-1">{label}</p>
      {payload.map((p, i) => <div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="text-[#6B7280]">{p.name}:</span><span className="font-medium">{fmtL(p.value)}</span></div>)}
    </div>
  );
};

function ExpandRow({ label, amount, children, highlight }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className={`border-b border-[#F0EFE9] cursor-pointer hover:bg-[#F4F5F6] ${highlight ? 'bg-[#ECEEEF]' : ''}`} onClick={() => setOpen(p => !p)}>
        <td className="px-4 py-3">
          <span className="flex items-center gap-2 font-medium text-[#1C2B3A]">
            {children ? (open ? <ChevronDown size={13} className="text-[#6B7280]" /> : <ChevronRight size={13} className="text-[#6B7280]" />) : <span className="w-3.5" />}
            {label}
          </span>
        </td>
        <td className={`px-4 py-3 text-right font-semibold ${highlight ? 'text-[#2D7D46]' : 'text-[#1C2B3A]'}`}>{fmt(amount)}</td>
      </tr>
      {open && children}
    </>
  );
}

export default function Reports() {
  const [tab, setTab] = useState(0);
  const { selectedCompany, token, selectedFY } = useAuth();
  const [plReport, setPlReport] = useState(null);
  const [bsReport, setBsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setPlReport(null);
    setBsReport(null);
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    Promise.all([
      api.fetchReportsPL({ companyGuid: selectedCompany.guid }).catch(() => null),
      api.fetchReportsBS({ companyGuid: selectedCompany.guid }).catch(() => null),
    ]).then(([pl, bs]) => {
      if (pl?.data) setPlReport(pl.data);
      if (bs?.data) setBsReport(bs.data);
    }).catch(err => {
      setError(err?.response?.data?.message || err?.message || 'Failed to load reports data');
    }).finally(() => setLoading(false));
  }, [selectedCompany?.guid]);

  // Derive totals from real data or fall back to mock
  const incomeRows = plReport?.income || [];
  const expenseRows = plReport?.expenses || [];
  const totalIncome   = plReport?.summary?.totalIncome   ?? plData.income.directIncome.reduce((s,i)=>s+i.amount,0) + plData.income.indirectIncome.reduce((s,i)=>s+i.amount,0);
  const totalExpenses = plReport?.summary?.totalExpenses ?? plData.expenses.directExpense.reduce((s,i)=>s+i.amount,0) + plData.expenses.indirectExpense.reduce((s,i)=>s+i.amount,0);
  const netProfit     = plReport?.summary?.netProfit     ?? (totalIncome - totalExpenses);
  const grossProfit   = plReport?.summary?.grossProfit   ?? netProfit;

  const totalAssets = bsReport?.summary?.totalAssets ?? [...balanceSheetData.assets.fixedAssets, ...balanceSheetData.assets.currentAssets].reduce((s, a) => s + a.amount, 0);
  const totalLiab   = bsReport?.summary?.totalLiabilities ?? [...balanceSheetData.liabilities.capital, ...balanceSheetData.liabilities.longTermLiabilities, ...balanceSheetData.liabilities.currentLiabilities].reduce((s, a) => s + a.amount, 0);

  // Expense breakdown for chart
  const expBreakdown = expenseRows.length > 0
    ? expenseRows.slice(0, 5).map(e => ({ name: (e.name||'').split(' ').slice(0,2).join(' '), value: Math.abs(parseFloat(e.closing_balance)||0) }))
    : [{ name: 'Purchase', value: 2840000 }, { name: 'Salary', value: 380000 }, { name: 'Others', value: 182500 }];

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <span className="flex-shrink-0">⚠️</span>
          <span><strong>Error:</strong> {error}</span>
          <button onClick={() => window.location.reload()} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight">Financial Reports</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{selectedFY?.name ? `FY ${selectedFY.name}` : "FY 2025-26"}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Revenue"  value={loading ? '—' : fmtL(totalIncome)}   icon={TrendingUp} accent="#3F5263" />
        <KPICard title="Total Expenses" value={loading ? '—' : fmtL(totalExpenses)} icon={TrendingUp} accent="#C0392B" />
        <KPICard title="Net Profit"     value={loading ? '—' : fmtL(netProfit)}     icon={TrendingUp} accent="#2D7D46" />
        <KPICard title="Total Assets"   value={loading ? '—' : fmtL(totalAssets)}   icon={TrendingUp} accent="#B45309" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">Profit Trend</p>
          <p className="text-xs text-[#6B7280] mb-4">6-month net profit</p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={profitTrend}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3F5263" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3F5263" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, border: '1px solid #D9DCE0', borderRadius: 8 }} />
              <Area type="monotone" dataKey="profit" stroke="#3F5263" strokeWidth={2} fill="url(#pg)" dot={{ r: 3, fill: '#3F5263', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">Expense Breakdown</p>
          <p className="text-xs text-[#6B7280] mb-4">By category</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={expBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {expBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 11, border: '1px solid #D9DCE0', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#D9DCE0] rounded-xl p-5">
          <p className="text-sm font-semibold text-[#1C2B3A] mb-1">Sales vs Purchase</p>
          <p className="text-xs text-[#6B7280] mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={(plReport?.monthlySales || [])} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#3F5263" radius={[3,3,0,0]} />
              <Bar dataKey="purchase" fill="#C5CBD0" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-[#D9DCE0] rounded-xl">
        <div className="flex border-b border-[#D9DCE0] px-1 pt-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#3F5263] bg-[#ECEEEF] font-semibold' : 'text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F4F5F6]'}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#D9DCE0]">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F9F9] border-b border-[#D9DCE0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Particulars</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <ExpandRow label="Direct Income" amount={totalDI}>
                    {plData.income.directIncome.map(i => <tr key={i.ledger} className="border-b border-[#F0EFE9] bg-[#F9F9F9]"><td className="px-4 py-2 text-[#6B7280] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#6B7280]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <ExpandRow label="Indirect Income" amount={totalII}>
                    {plData.income.indirectIncome.map(i => <tr key={i.ledger} className="border-b border-[#F0EFE9] bg-[#F9F9F9]"><td className="px-4 py-2 text-[#6B7280] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#6B7280]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <tr className="bg-[#E8F5ED] border-b border-[#A8D5BC]"><td className="px-4 py-3 font-bold text-[#2D7D46]">Gross Profit</td><td className="px-4 py-3 text-right font-bold text-[#2D7D46]">{fmt(grossProfit)}</td></tr>
                  <ExpandRow label="Direct Expense" amount={totalDE}>
                    {plData.expenses.directExpense.map(i => <tr key={i.ledger} className="border-b border-[#F0EFE9] bg-[#F9F9F9]"><td className="px-4 py-2 text-[#6B7280] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#6B7280]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <ExpandRow label="Indirect Expense" amount={totalIE}>
                    {plData.expenses.indirectExpense.map(i => <tr key={i.ledger} className="border-b border-[#F0EFE9] bg-[#F9F9F9]"><td className="px-4 py-2 text-[#6B7280] pl-10">{i.ledger}</td><td className="px-4 py-2 text-right text-[#6B7280]">{fmt(i.amount)}</td></tr>)}
                  </ExpandRow>
                  <tr className="bg-[#E8F5ED]"><td className="px-4 py-3 font-bold text-[#2D7D46] text-base">Net Profit</td><td className="px-4 py-3 text-right font-bold text-[#2D7D46] text-base">{fmt(netProfit)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === 1 && (
            <div className="grid grid-cols-2 gap-8">
              {[['ASSETS', [['Fixed Assets', balanceSheetData.assets.fixedAssets], ['Current Assets', balanceSheetData.assets.currentAssets]], totalAssets], ['LIABILITIES', [['Capital', balanceSheetData.liabilities.capital], ['Long-Term', balanceSheetData.liabilities.longTermLiabilities], ['Current', balanceSheetData.liabilities.currentLiabilities]], totalLiab]].map(([title, groups, total]) => (
                <div key={title}>
                  <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-4 pb-2 border-b border-[#D9DCE0]">{title}</h3>
                  <div className="space-y-4 text-sm">
                    {groups.map(([gName, items]) => (
                      <div key={gName}>
                        <p className="font-semibold text-[#6B7280] text-xs uppercase tracking-wide mb-2">{gName}</p>
                        {items.map(a => (
                          <div key={a.ledger} className="flex justify-between py-1.5 pl-3 border-b border-[#F0EFE9] last:border-0">
                            <span className="text-[#6B7280]">{a.ledger}</span>
                            <span className="font-medium text-[#1C2B3A]">{fmt(a.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-between py-2.5 mt-2 border-t-2 border-[#3F5263] font-bold text-[#3F5263]">
                      <span>Total {title}</span><span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 2 && (
            <div className="overflow-x-auto rounded-xl border border-[#D9DCE0]">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F9F9] border-b border-[#D9DCE0]">
                  <tr>{['Ledger','Group','Opening Dr','Opening Cr','Period Dr','Period Cr','Closing Dr','Closing Cr'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {trialBalance.map((row, i) => (
                    <tr key={i} className="border-b border-[#F0EFE9] hover:bg-[#F4F5F6]">
                      <td className="px-3 py-2.5 font-medium text-[#1C2B3A]">{row.ledger}</td>
                      <td className="px-3 py-2.5 text-[#6B7280]">{row.group}</td>
                      {[row.openingDr, row.openingCr, row.periodDr, row.periodCr, row.closingDr, row.closingCr].map((v, j) => (
                        <td key={j} className="px-3 py-2.5 text-right">{v ? fmt(v) : <span className="text-[#9CA3AF]">—</span>}</td>
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
