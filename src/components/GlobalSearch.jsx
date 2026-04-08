import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, BookOpen, Package, TrendingUp, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const fmt = n => n ? '₹' + n.toLocaleString('en-IN') : '';

const QUICK_NAV = [
  { label: 'Sales',      path: '/sales',     icon: TrendingUp,  color: '#37352F' },
  { label: 'Purchase',   path: '/purchase',  icon: ShoppingCart,color: '#37352F' },
  { label: 'Inventory',  path: '/inventory', icon: Package,     color: '#798692' },
  { label: 'Ledgers',    path: '/ledgers',   icon: BookOpen,    color: '#9FA9B1' },
];

export default function GlobalSearch() {
  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { selectedCompany, selectedFY } = useAuth();
  const inputRef = useRef(null);
  const ref      = useRef(null);
  const timer    = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setOpen(true);
      }
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);

  // Live search — debounced 350ms
  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim() || !selectedCompany?.guid) { setResults([]); return; }
    setLoading(true);
    timer.current = setTimeout(() => {
      api.fetchVouchers({
        companyGuid: selectedCompany.guid,
        searchText:  query.trim(),
        page: 1, pageSize: 8,
        fromDate: selectedFY?.startDate,
        toDate:   selectedFY?.endDate,
      })
        .then(res => {
          const vouchers = res?.data?.vouchers || [];
          setResults(vouchers.map(v => ({
            type:   v.voucher_type || 'Voucher',
            label:  v.voucher_number || v.guid?.slice(-8) || 'N/A',
            sub:    v.party_name || '—',
            path:   (v.voucher_type || '').toLowerCase().includes('purchase') ? '/purchase' : '/sales',
            icon:   (v.voucher_type || '').toLowerCase().includes('purchase') ? ShoppingCart : TrendingUp,
            color:  (v.voucher_type || '').toLowerCase().includes('purchase') ? '#37352F' : '#37352F',
            amount: parseFloat(v.amount) || 0,
          })));
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query, selectedCompany?.guid, selectedFY?.uniqueId]);

  const handleKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { navigate(results[selected].path); setOpen(false); setQuery(''); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  const go = item => { navigate(item.path); setOpen(false); setQuery(''); };

  return (
    <div className="relative flex-1 max-w-sm" ref={ref}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A97] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search invoices, ledgers... (⌘K)"
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#F7F7F5] border border-[#E9E9E7] rounded-lg outline-none focus:border-[#1A1A1A] focus:ring-2 focus:bg-white transition-all placeholder:text-[#9A9A97]"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A97] hover:text-[#787774]">
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8E7E3] rounded-xl shadow-lg z-[100] overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="px-4 py-4 text-center text-xs text-[#9A9A97]">Searching…</div>
          )}

          {/* No results */}
          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-[#9A9A97]">No results for "{query}"</div>
          )}

          {/* Quick nav (no query) */}
          {!loading && !query.trim() && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold text-[#9A9A97] uppercase tracking-widest mb-2">Quick navigate</p>
              {QUICK_NAV.map(({ label, path, icon: Icon, color }) => (
                <button key={label} onClick={() => { navigate(path); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-[#F7F6F3] text-left transition-colors">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: color + '20' }}>
                    <Icon size={12} style={{ color }} />
                  </div>
                  <span className="text-sm text-[#1A1A1A]">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="py-1">
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-[#9A9A97] uppercase tracking-widest">{results.length} results</p>
              {results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} onClick={() => go(item)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${selected === i ? 'bg-[#F7F7F5]' : 'hover:bg-[#F7F7F5]'}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '20' }}>
                      <Icon size={13} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.label}</p>
                      <p className="text-xs text-[#787774] truncate">{item.type} · {item.sub}</p>
                    </div>
                    {item.amount > 0 && <span className="text-xs font-semibold text-[#1A1A1A] flex-shrink-0">{fmt(item.amount)}</span>}
                    <ArrowRight size={12} className="text-[#9A9A97] flex-shrink-0" />
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
