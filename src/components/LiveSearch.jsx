// LiveSearch — searchable dropdown with portal rendering (no clipping issues)
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

function Dropdown({ anchorRef, results, loading, query, onSelect, onUseRaw }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    setPos({
      top: showAbove ? rect.top + window.scrollY - 4 : rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
      showAbove,
    });
  }, [results, loading]);

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.showAbove ? undefined : pos.top,
        bottom: pos.showAbove ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
      }}
      className="bg-white border border-[#D4D3CE] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
    >
      {loading && (
        <div className="px-3 py-2.5 text-xs text-[#AEACA8] flex items-center gap-2">
          <div className="w-3 h-3 border border-[#AEACA8] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Searching...
        </div>
      )}
      {!loading && results.length === 0 && query.length === 0 && (
        <div className="px-3 py-2.5 text-xs text-[#AEACA8]">Start typing to search...</div>
      )}
      {!loading && results.length === 0 && query.length > 0 && (
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-[#AEACA8]">No results for "{query}"</p>
        </div>
      )}
      {results.map((item, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={e => { e.preventDefault(); onSelect(item); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#F5F4EF] text-left border-b border-[#F5F4EF] last:border-0 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.label}</p>
            {item.sub && <p className="text-xs text-[#AEACA8] truncate">{item.sub}</p>}
          </div>
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ECEEEF] text-[#787774] flex-shrink-0">{item.badge}</span>
          )}
        </button>
      ))}
      {!loading && query && !results.find(r => r.label === query) && (
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); onUseRaw(query); }}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#EEF1F3] text-left border-t border-[#F5F4EF]"
        >
          <span className="text-xs text-[#1A1A1A] font-medium">Use "{query}"</span>
        </button>
      )}
    </div>,
    document.body
  );
}

export default function LiveSearch({
  value,
  onChange,
  placeholder = 'Search...',
  fetchFn,
  disabled = false,
  required = false,
  className = '',
}) {
  const [query, setQuery]     = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const anchorRef             = useRef(null);
  const debounceRef           = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const search = useCallback(async (q) => {
    if (!fetchFn) return;
    setLoading(true);
    try {
      const data = await fetchFn(q);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const handleInput = (val) => {
    setQuery(val);
    onChange('');
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const handleSelect = (item) => {
    setQuery(item.label);
    onChange(item.value);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery(''); onChange(''); setResults([]); setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
    if (!results.length) search(query);
  };

  return (
    <div className={`relative ${className}`} ref={anchorRef}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8] pointer-events-none" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`w-full pl-8 pr-7 py-2 text-sm border rounded-lg outline-none transition-all
            ${query ? 'border-[#1A1A1A] bg-white' : 'border-[#D4D3CE] bg-white focus:border-[#1A1A1A]'}
            ${disabled ? 'bg-[#F5F4EF] cursor-not-allowed' : ''}
          `}
        />
        {query ? (
          <button type="button" onMouseDown={e => { e.preventDefault(); handleClear(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AEACA8] hover:text-[#787774]">
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AEACA8] pointer-events-none" />
        )}
      </div>

      {open && (
        <Dropdown
          anchorRef={anchorRef}
          results={results}
          loading={loading}
          query={query}
          onSelect={handleSelect}
          onUseRaw={(q) => { setQuery(q); onChange(q); setOpen(false); }}
        />
      )}
    </div>
  );
}
