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
  const fetchProducts = useCallback(async (q) => {
    if (!selectedCompany?.guid) return [];
    const res = await fetchStocks({ companyGuid: selectedCompany.guid, searchText: q, pageSize: 20 });
    return (res?.data?.stocks || []).map(s => ({
      label: s.name,
      value: s.name,
      sub: s.unit ? `Unit: ${s.unit}${s.closing_qty ? ` · Stock: ${s.closing_qty}` : ''}` : '',
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
    // When product selected, update name. Rate/HSN auto-fill can be added when stock has price data
    update(id, 'name', name);
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E8E7E3]">
        <table className="w-full text-sm">
          <thead className="bg-[#FBFAF8] border-b border-[#E8E7E3]">
            <tr>
              {['Product / Service', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Tax', 'Amount (₹)', ''].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-[#787774] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#F1F0EC] last:border-0">
                <td className="px-2 py-1.5" style={{ minWidth: 180 }}>
                  <LiveSearch
                    value={item.name}
                    onChange={name => handleProductSelect(item.id, name)}
                    placeholder="Search product..."
                    fetchFn={fetchProducts}
                    className="w-44"
                  />
                </td>
                <td className="px-3 py-2">
                  <input placeholder="HSN" value={item.hsn} onChange={e => update(item.id, 'hsn', e.target.value)}
                    className="notion-input text-sm w-20" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" min="1" value={item.qty} onChange={e => update(item.id, 'qty', e.target.value)}
                    className="notion-input text-sm w-16" />
                </td>
                <td className="px-3 py-2">
                  <select value={item.unit} onChange={e => update(item.id, 'unit', e.target.value)}
                    className="notion-input text-sm w-16">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="number" placeholder="0.00" value={item.rate} onChange={e => update(item.id, 'rate', e.target.value)}
                    className="notion-input text-sm w-24" />
                </td>
                <td className="px-3 py-2">
                  <select value={item.tax} onChange={e => update(item.id, 'tax', e.target.value)}
                    className="notion-input text-sm w-20">
                    {TAX_RATES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 font-medium text-[#1A1A1A] whitespace-nowrap">
                  ₹{item.amount.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(item.id)} className="w-6 h-6 flex items-center justify-center rounded text-[#AEACA8] hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={add} className="flex items-center gap-1.5 mt-2 text-xs text-[#3F5263] hover:text-[#526373] font-medium transition-colors">
        <Plus size={13} /> Add Item
      </button>
    </div>
  );
}
