// LiveSearch — reusable searchable dropdown for ledgers, stocks, etc.
// Queries real Tally data from backend as user types
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export default function LiveSearch({
  value,
  onChange,
  placeholder = 'Search...',
  fetchFn,           // async (query) => [{ label, value, sub }]
  disabled = false,
  required = false,
  className = '',
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(value || '');
  const ref = useRef(null);
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Sync external value
  useEffect(() => {
    if (value !== selected) {
      setSelected(value || '');
      setQuery(value || '');
    }
  }, [value]);

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
    setSelected('');
    onChange(''); // clear until selected
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const handleSelect = (item) => {
    setSelected(item.value);
    setQuery(item.label);
    onChange(item.value);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setSelected('');
    onChange('');
    setResults([]);
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
    if (!results.length) search(query);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`w-full pl-8 pr-8 py-2 text-sm border rounded-lg outline-none transition-all
            ${selected
              ? 'border-[#3F5263] bg-white text-[#1C2B3A]'
              : 'border-[#D9DCE0] bg-white text-[#1C2B3A] focus:border-[#3F5263]'
            }
            ${disabled ? 'bg-[#F4F5F6] cursor-not-allowed' : ''}
          `}
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#D9DCE0] rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2.5 text-xs text-[#9CA3AF] flex items-center gap-2">
              <div className="w-3 h-3 border border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-[#9CA3AF]">No results for "{query}"</p>
              <p className="text-xs text-[#C5CBD0] mt-0.5">Press Enter to use this name directly</p>
            </div>
          )}
          {!loading && results.length === 0 && query.length === 0 && (
            <div className="px-3 py-2.5 text-xs text-[#9CA3AF]">Start typing to search...</div>
          )}
          {results.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-[#F4F5F6] transition-colors text-left border-b border-[#F4F5F6] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1C2B3A] truncate">{item.label}</p>
                {item.sub && <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{item.sub}</p>}
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ECEEEF] text-[#6B7280] flex-shrink-0 mt-0.5">{item.badge}</span>
              )}
            </button>
          ))}
          {/* Allow typing custom value not in list */}
          {!loading && query && !results.find(r => r.label === query) && (
            <button
              type="button"
              onClick={() => handleSelect({ label: query, value: query })}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#EEF1F3] transition-colors text-left border-t border-[#F4F5F6]"
            >
              <span className="text-xs text-[#3F5263] font-medium">Use "{query}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
