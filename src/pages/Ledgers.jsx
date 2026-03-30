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
    <tr className="border-b border-[#F1F0EC]">
      {[1,2,3,4,5,6,7].map(i => (
        <td key={i} className="px-4 py-3"><div className="h-3 bg-[#F1F0EC] rounded animate-pulse" /></td>
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
  const [drawer,  setDrawer]      = useState(null);
  const [ledgerTab, setLedgerTab] = useState(0);

  const companyGuid = selectedCompany?.guid;

  const load = async (searchText = '', pg = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await api.fetchLedgers({ companyGuid, page: pg, searchText });
      const list = res?.data?.ledgers || res?.data || [];
      setLedgers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('API error:', err.message);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(search, 1); }, [companyGuid]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { load(search, 1); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const groups = ['All', ...Array.from(new Set(ledgers.map(l => l.group || l.PARENT || 'Other')))];
  const filtered = groupFilter === 'All' ? ledgers : ledgers.filter(l => (l.group || l.PARENT) === groupFilter);

  const getName  = l => l.name  || l.NAME  || l.ledgerName  || '—';
  const getGroup = l => l.group || l.PARENT || '—';
  const getClose = l => l.closing || l.closingBalance || l.CLOSINGBALANCE || 0;
  const getOpen  = l => l.opening || l.openingBalance  || l.OPENINGBALANCE || 0;
  const getGstin = l => l.gstin  || l.GSTIN  || '';
  const getType  = l => l.type   || (getClose(l) >= 0 ? 'Dr' : 'Cr');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Ledgers</h1>
          <p className="text-sm text-[#787774] mt-0.5">
            {selectedCompany?.name || 'All companies'} · {loading ? 'Loading...' : `${ledgers.length} ledgers`}
          </p>
        </div>
        <button onClick={() => load(search, 1)} className="flex items-center gap-1.5 text-xs text-[#059669] hover:text-[#047857] font-medium">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Ledgers" value={loading ? '—' : ledgers.length} icon={BookOpen} accent="#059669"/>
        <KPICard title="Active" value={loading ? '—' : ledgers.filter(l => l.status !== 'Inactive').length} icon={BookOpen} accent="#10B981"/>
        <KPICard title="Debit Balance" value={loading ? '—' : ledgers.filter(l => getType(l) === 'Dr').length} icon={BookOpen} accent="#F59E0B"/>
        <KPICard title="Credit Balance" value={loading ? '—' : ledgers.filter(l => getType(l) === 'Cr').length} icon={BookOpen} accent="#8B5CF6"/>
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
            <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
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
                  className="border-b border-[#F1F0EC] hover:bg-[#F7F6F3] cursor-pointer"
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
