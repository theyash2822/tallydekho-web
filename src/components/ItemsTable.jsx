import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';

const TAX_RATES = ['0%', '5%', '12%', '18%', '28%'];
const UNITS = ['Pcs', 'Kg', 'Ltr', 'Box', 'Mtr', 'Set', 'Nos'];

const emptyItem = () => ({ id: Date.now(), name: '', hsn: '', qty: 1, unit: 'Pcs', rate: '', tax: '18%', amount: 0 });

export default function ItemsTable({ warehouse, onWarehouseChange, onItemsChange }) {
  const [items, setItems] = useState([emptyItem()]);

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
          className="notion-input text-sm"
        >
          <option value="">Select Warehouse *</option>
          <option>Mumbai Main Warehouse</option>
          <option>Pune Storage</option>
          <option>Delhi Hub</option>
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
                <td className="px-3 py-2">
                  <input placeholder="Item name" value={item.name} onChange={e => update(item.id, 'name', e.target.value)}
                    className="notion-input text-sm w-36" />
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
