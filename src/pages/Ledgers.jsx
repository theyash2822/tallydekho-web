import { useState, useEffect } from 'react';
import { BookOpen, Search, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ledgerList as mockLedgers, auditTrail } from '../data/mockData';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const LEDGER_TABS = ['Transactions','Summary','GST Ledger','Documents'];

const movementData = [
  {month:'Feb',balance:320000},{month:'Mar',balance:480000},{month:'Apr',balance:560000},
  {month:'May',balance:420000},{month:'Jun',balance:680000},{month:'Jul',balance:1159000},
];

function SkeletonRow() {
  return (
    <tr className="border-b border-[#ECEEEF]">
      {[1,2,3,4,5,6,7].map(i => (
        <td key={i} className="px-4 py-3"><div className="h-3 bg-[#ECEEEF] rounded animate-pulse" /></td>
      ))}
    </tr>
  );
}

export default function Ledgers() {
  const { selectedCompany, token } = useAuth();
  const [ledgers, setLedgers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);
  const [search,  setSearch]      = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [page,    setPage]        = useState(1);
  const [pageSize, setPageSize]    = useState(25);
  const [total,    setTotal]       = useState(0);
  const [drawer,  setDrawer]      = useState(null);
  const [ledgerTab, setLedgerTab] = useState(0);

  const companyGuid = selectedCompany?.guid;

  const load = async (searchText = '', pg = 1, ps = pageSize) => {
    setLoading(true); setError(null);
    try {
      const res = await api.fetchLedgers({ companyGuid, page: pg, pageSize: ps, searchText });
      const list = res?.data?.ledgers || res?.data || [];
      setLedgers(Array.isArray(list) ? list : []);
      if (res?.data?.total) setTotal(res.data.total);
    } catch (err) {
      console.warn('API error:', err.message);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(search, 1, pageSize); setPage(1); }, [companyGuid, pageSize]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { load(search, 1, pageSize); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const groups = ['All', ...Array.from(new Set(ledgers.map(l => l.group || l.PARENT || 'Other')))];
  const filtered = groupFilter === 'All' ? ledgers : ledgers.filter(l => (l.group || l.PARENT) === groupFilter);

  const getName  = l => l.name || l.NAME || l.ledgerName || '—';
  const getGroup = l => l.parent || l.group || l.PARENT || '—';
  const getClose = l => Math.abs(l.closing_balance || l.closing || l.closingBalance || l.CLOSINGBALANCE || 0);
  const getOpen  = l => Math.abs(l.opening_balance || l.opening || l.openingBalance || l.OPENINGBALANCE || 0);
  const getGstin = l => l.gstin  || l.GSTIN  || '';
  const getType  = l => l.type   || (getClose(l) >= 0 ? 'Dr' : 'Cr');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Ledgers</h1>
          <p className="page-subtitle">
            {selectedCompany?.name || 'All companies'} · {loading ? 'Loading...' : `${ledgers.length} ledgers`}
          </p>
        </div>
        <button onClick={() => load(search, 1)} className="flex items-center gap-1.5 text-xs text-[#3F5263] hover:text-[#526373] font-medium">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Ledgers" value={loading ? '—' : ledgers.length} icon={BookOpen} accent="#3F5263"/>
        <KPICard title="Active" value={loading ? '—' : ledgers.filter(l => l.status !== 'Inactive').length} icon={BookOpen} accent="#526373"/>
        <KPICard title="Debit Balance" value={loading ? '—' : ledgers.filter(l => getType(l) === 'Dr').length} icon={BookOpen} accent="#2D7D46"/>
        <KPICard title="Credit Balance" value={loading ? '—' : ledgers.filter(l => getType(l) === 'Cr').length} icon={BookOpen} accent="#C0392B"/>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          ⚠️ Using demo data — {error}
        </div>
      )}

      <div className="bg-white border border-[#E8E7E3] rounded-xl">
        <div className="p-4 border-b border-[#E8E7E3] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search ledger name, GSTIN..."
              className="notion-input pl-8 w-full text-sm"/>
          </div>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
            {groups.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F5F6] border-b border-[#D9DCE0]"
              <tr>{['Ledger Name','Group','Opening Balance','Closing Balance','Dr/Cr','GSTIN','Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#787774] uppercase whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[#787774]">No ledgers found</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={l.guid || l.GUID || i}
                  className="border-b border-[#ECEEEF] hover:bg-[#F4F5F6] cursor-pointer"
                  onClick={() => { setDrawer(l); setLedgerTab(0); }}>
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{getName(l)}</td>
                  <td className="px-4 py-3 text-[#787774]">{getGroup(l)}</td>
                  <td className="px-4 py-3">{fmt(getOpen(l))}</td>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{fmt(Math.abs(getClose(l)))}</td>
                  <td className="px-4 py-3">
                    <span className={getType(l) === 'Dr' ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>{getType(l)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#787774]">{getGstin(l) || '—'}</td>
                  <td className="px-4 py-3"><Badge label="Active" variant="green"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#E8E7E3] rounded-xl">
          <p className="text-xs text-[#787774]">
            Showing <span className="font-semibold text-[#1A1A1A]">{((page-1)*pageSize)+1}–{Math.min(page*pageSize, total)}</span> of <span className="font-semibold text-[#1A1A1A]">{total}</span> ledgers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { const pg = page-1; setPage(pg); load(search, pg, pageSize); }}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium border border-[#E8E7E3] rounded-lg disabled:opacity-40 hover:bg-[#F7F6F3] transition-colors"
            >← Prev</button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(total/pageSize)) }, (_, i) => {
              const totalPages = Math.ceil(total/pageSize);
              let pg;
              if (totalPages <= 5) pg = i + 1;
              else if (page <= 3) pg = i + 1;
              else if (page >= totalPages - 2) pg = totalPages - 4 + i;
              else pg = page - 2 + i;
              return (
                <button key={pg} onClick={() => { setPage(pg); load(search, pg, pageSize); }}
                  className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${pg === page ? 'text-white bg-[#3F5263]' : 'border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]'}`}>
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => { const pg = page+1; setPage(pg); load(search, pg, pageSize); }}
              disabled={page >= Math.ceil(total/pageSize)}
              className="px-3 py-1.5 text-xs font-medium border border-[#E8E7E3] rounded-lg disabled:opacity-40 hover:bg-[#F7F6F3] transition-colors"
            >Next →</button>
          </div>
        </div>
      )}

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={getName(drawer || {})}>
        {drawer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#6EE7B7]">
                <p className="text-xs text-[#787774]">Opening</p>
                <p className="font-bold text-[#059669]">{fmt(getOpen(drawer))}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-[#787774]">Closing</p>
                <p className="font-bold text-emerald-600">{fmt(Math.abs(getClose(drawer)))}</p>
              </div>
            </div>
            <div className="flex border-b border-[#E8E7E3]">
              {LEDGER_TABS.map((t,i) => (
                <button key={i} onClick={() => setLedgerTab(i)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${ledgerTab===i?'text-[#059669] border-b-2 border-[#059669]':'text-[#787774] hover:text-[#1A1A1A]'}`}>
                  {t}
                </button>
              ))}
            </div>
            {ledgerTab === 0 && (
              <div className="space-y-1 text-sm">
                {[['Name', getName(drawer)], ['Group', getGroup(drawer)], ['GSTIN', getGstin(drawer) || '—'], ['Type', getType(drawer)]].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-[#F1F0EC]">
                    <span className="text-[#787774]">{l}</span>
                    <span className="font-medium text-[#1A1A1A]">{v}</span>
                  </div>
                ))}
                <p className="text-xs text-[#AEACA8] pt-2 text-center">Transaction history available after Tally sync</p>
              </div>
            )}
            {ledgerTab === 1 && (
              <div>
                <p className="text-xs font-semibold text-[#AEACA8] uppercase tracking-wider mb-2">Balance Movement</p>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={movementData}>
                    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:'#787774'}} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip formatter={v=>fmt(v)} contentStyle={{fontSize:11,border:'1px solid #E8E7E3',borderRadius:8}}/>
                    <Area type="monotone" dataKey="balance" stroke="#059669" strokeWidth={2} fill="url(#ag)" dot={{r:2,fill:'#059669',strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {ledgerTab === 2 && (
              <div className="space-y-3 text-sm">
                {getGstin(drawer) ? (
                  <>{[['GSTIN', getGstin(drawer)], ['Reg. Type','Regular'], ['Place of Supply','Maharashtra (27)'], ['Classification','B2B']].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-[#F1F0EC]">
                      <span className="text-[#787774]">{l}</span>
                      <span className="font-medium font-mono text-xs">{v}</span>
                    </div>
                  ))}</>
                ) : <p className="text-[#AEACA8] text-sm">No GSTIN linked to this ledger.</p>}
              </div>
            )}
            {ledgerTab === 3 && (
              <p className="text-xs text-[#AEACA8] text-center py-4">Documents available after Tally sync</p>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
