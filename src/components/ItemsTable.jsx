import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchStocks, fetchLedgers } from '../services/api';
import LiveSearch from './LiveSearch';

const TAX_RATES = ['0%', '5%', '12%', '18%', '28%'];
const UNITS = ['Pcs', 'Kg', 'Ltr', 'Box', 'Mtr', 'Set', 'Nos'];

const emptyItem = () => ({ id: Date.now(), name: '', hsn: '', qty: 1, unit: 'Pcs', rate: '', tax: '18%', amount: 0 });

export default function ItemsTable({ warehouse, onWarehouseChange, onItemsChange }) {
  const [items, setItems] = useState([emptyItem()]);
  const [warehouses, setWarehouses] = useState([]);
  const { selectedCompany } = useAuth();

  // Load real warehouses from backend
  useEffect(() => {
    if (!selectedCompany?.guid) return;
    fetchLedgers({ companyGuid: selectedCompany.guid, searchText: 'warehouse', pageSize: 30 })
      .then(res => {
        const wh = (res?.data?.ledgers || []).filter(l =>
          (l.parent || '').toLowerCase().includes('warehouse') ||
          (l.name || '').toLowerCase().includes('warehouse') ||
          (l.name || '').toLowerCase().includes('godown')
        );
        if (wh.length > 0) setWarehouses(wh.map(l => l.name));
      }).catch(() => {});
  }, [selectedCompany?.guid]);

  // Fetch stock items for product search
  const [stockMap, setStockMap] = useState({});

  const fetchProducts = useCallback(async (q) => {
    if (!selectedCompany?.guid) return [];
    const res = await fetchStocks({ companyGuid: selectedCompany.guid, searchText: q, pageSize: 20 });
    const stocks = res?.data?.stocks || [];
    // Cache stock data for autofill
    const map = {};
    stocks.forEach(s => { map[s.name] = s; });
    setStockMap(prev => ({ ...prev, ...map }));
    return stocks.map(s => ({
      label: s.name, value: s.name,
      sub: s.unit ? `Unit: ${s.unit}${s.closing_qty ? ` · Stock: ${parseFloat(s.closing_qty).toFixed(0)}` : ''}` : '',
      badge: s.hsn || '',
    }));
  }, [selectedCompany?.guid]);

  const update = (id, field, val) => {
    const updated = items.map(i => {
      if (i.id !== id) return i;
      const item = { ...i, [field]: val };
      item.amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
      return item;
    });
    setItems(updated);
    onItemsChange && onItemsChange(updated);
  };

  const handleProductSelect = (id, name) => {
    const stock = stockMap[name];
    const updated = items.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        name,
        unit: stock?.unit || i.unit,
        hsn: stock?.hsn || i.hsn,
        // Don't overwrite rate - user enters it
        amount: (parseFloat(i.qty) || 1) * (parseFloat(i.rate) || 0),
      };
    });
    setItems(updated);
    onItemsChange && onItemsChange(updated);
  };

  const remove = (id) => {
    if (items.length === 1) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onItemsChange && onItemsChange(updated);
  };

  const add = () => {
    const updated = [...items, emptyItem()];
    setItems(updated);
    onItemsChange && onItemsChange(updated);
  };

  return (
    <div>
      {/* Warehouse selector */}
      <div className="flex items-center gap-3 mb-3">
        <Package size={14} className="text-[#787774] flex-shrink-0" />
        <select
          value={warehouse}
          onChange={e => onWarehouseChange && onWarehouseChange(e.target.value)}
          className="notion-input text-sm flex-1 max-w-xs"
        >
          <option value="">Select Warehouse</option>
          {warehouses.length > 0
            ? warehouses.map(w => <option key={w}>{w}</option>)
            : ['Main Warehouse', 'Godown 1', 'Godown 2'].map(w => <option key={w}>{w}</option>)
          }
        </select>
      </div>

      {/* Items - card layout instead of table to avoid overflow clipping */}
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid gap-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-1"
          style={{ gridTemplateColumns: '2fr 80px 70px 70px 90px 70px 70px 24px' }}>
          <span>Product / Service</span>
          <span>HSN</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Rate (₹)</span>
          <span>Tax</span>
          <span>Amount</span>
          <span></span>
        </div>

        {items.map((item) => (
          <div key={item.id} className="grid gap-2 items-center px-1"
            style={{ gridTemplateColumns: '2fr 80px 70px 70px 90px 70px 70px 24px' }}>

            {/* Product - LiveSearch with overflow visible */}
            <div className="relative">
              <LiveSearch
                value={item.name}
                onChange={name => handleProductSelect(item.id, name)}
                placeholder="Search product..."
                fetchFn={fetchProducts}
              />
            </div>

            <input placeholder="HSN" value={item.hsn} onChange={e => update(item.id, 'hsn', e.target.value)}
              className="notion-input text-sm w-full" />

            <input type="number" min="0.01" step="0.01" value={item.qty} onChange={e => update(item.id, 'qty', e.target.value)}
              className="notion-input text-sm w-full" />

            <select value={item.unit} onChange={e => update(item.id, 'unit', e.target.value)}
              className="notion-input text-sm w-full">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>

            <input type="number" placeholder="0.00" min="0" step="0.01" value={item.rate}
              onChange={e => update(item.id, 'rate', e.target.value)}
              className="notion-input text-sm w-full" />

            <select value={item.tax} onChange={e => update(item.id, 'tax', e.target.value)}
              className="notion-input text-sm w-full">
              {TAX_RATES.map(r => <option key={r}>{r}</option>)}
            </select>

            <div className="text-sm font-semibold text-[#1A1A1A] text-right">
              ₹{(item.amount || 0).toLocaleString('en-IN')}
            </div>

            <button onClick={() => remove(item.id)}
              className="w-6 h-6 flex items-center justify-center rounded text-[#AEACA8] hover:text-rose-500 hover:bg-rose-50 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={add} className="flex items-center gap-1.5 mt-2 text-xs text-[#3F5263] hover:text-[#526373] font-medium transition-colors">
        <Plus size={13} /> Add Item
      </button>
    </div>
  );
}
