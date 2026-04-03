import { useState, useEffect, useRef } from 'react';
import { Search, FileText, BookOpen, Package, TrendingUp, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ledgerList } from '../data/mockData';
import { salesInvoices } from '../data/salesMock';
import { purchaseInvoices } from '../data/purchaseMock';
import { stockItems } from '../data/inventoryMock';

// Build search index from all modules
const buildIndex = () => [
  ...salesInvoices.map(i => ({ type: 'Sales Invoice', label: i.ref, sub: i.customer + ' · ' + i.date, path: '/sales', icon: TrendingUp, color: '#3F5263', amount: i.amount })),
  ...purchaseInvoices.map(i => ({ type: 'Purchase', label: i.ref, sub: i.vendor + ' · ' + i.date, path: '/purchase', icon: ShoppingCart, color: '#526373', amount: i.amount })),
  ...ledgerList.map(l => ({ type: 'Ledger', label: l.name, sub: l.group, path: '/ledgers', icon: BookOpen, color: '#798692' })),
  ...stockItems.map(s => ({ type: 'Stock Item', label: s.name, sub: s.category + ' · ' + s.qty + ' ' + s.unit, path: '/inventory', icon: Package, color: '#9FA9B1' })),
];

const INDEX = buildIndex();
const fmt = n => n ? '₹' + n.toLocaleString('en-IN') : '';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    // Ctrl+K / Cmd+K shortcut
    const k = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); setOpen(true); } };
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(INDEX.filter(item => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)).slice(0, 8));
    setSelected(0);
  }, [query]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { navigate(results[selected].path); setOpen(false); setQuery(''); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  const go = (item) => { navigate(item.path); setOpen(false); setQuery(''); };

  return (
    <div className="relative flex-1 max-w-sm" ref={ref}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search invoices, ledgers, items... (⌘K)"
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#F4F5F6] border border-[#D9DCE0] rounded-lg outline-none focus:border-[#3F5263] focus:ring-2 focus:bg-white transition-all placeholder:text-[#9CA3AF]"
          style={{ '--tw-ring-color': '#05966920' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AEACA8] hover:text-[#787774]">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8E7E3] rounded-xl shadow-notion-lg z-[100] overflow-hidden">
          {results.length === 0 && query.trim() ? (
            <div className="px-4 py-6 text-center text-xs text-[#AEACA8]">No results for "{query}"</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold text-[#AEACA8] uppercase tracking-widest mb-2">Quick navigate</p>
              {[['Sales', '/sales', TrendingUp, '#3F5263'], ['Purchase', '/purchase', ShoppingCart, '#526373'], ['Inventory', '/inventory', Package, '#798692'], ['Ledgers', '/ledgers', BookOpen, '#9FA9B1']].map(([l, p, Icon, c]) => (
                <button key={l} onClick={() => { navigate(p); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-[#F7F6F3] text-left transition-colors">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: c + '20' }}>
                    <Icon size={12} style={{ color: c }} />
                  </div>
                  <span className="text-sm text-[#1A1A1A]">{l}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-1">
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-[#AEACA8] uppercase tracking-widest">{results.length} results</p>
              {results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} onClick={() => go(item)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${selected === i ? 'bg-[#ECEEEF]' : 'hover:bg-[#F4F5F6]'}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '20' }}>
                      <Icon size={13} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.label}</p>
                      <p className="text-xs text-[#787774] truncate">{item.type} · {item.sub}</p>
                    </div>
                    {item.amount && <span className="text-xs font-semibold text-[#1A1A1A] flex-shrink-0">{fmt(item.amount)}</span>}
                    <ArrowRight size={12} className="text-[#AEACA8] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
