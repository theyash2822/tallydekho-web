import { useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';

const emptyEntry = () => ({ id: Date.now(), type: 'Courier', amount: '', tracking: '', remarks: '' });

export default function LogisticsSection({ onLogisticsChange }) {
  const [entries, setEntries] = useState([]);
  const [taxRate, setTaxRate] = useState('18%');
  const [show, setShow] = useState(false);

  const add = () => {
    const updated = [...entries, emptyEntry()];
    setEntries(updated);
    onLogisticsChange && onLogisticsChange(updated);
  };

  const update = (id, field, val) => {
    const updated = entries.map(e => e.id === id ? { ...e, [field]: val } : e);
    setEntries(updated);
    onLogisticsChange && onLogisticsChange(updated);
  };

  const remove = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    onLogisticsChange && onLogisticsChange(updated);
  };

  const total = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { setShow(p => !p); if (!show && entries.length === 0) add(); }}
          className="flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] hover:text-[#787774]">
          <Truck size={13} /> {show ? 'Hide Logistics' : '+ Add Logistics / Shipping'}
        </button>
        {total > 0 && <span className="text-xs text-[#787774]">Total: <strong className="text-[#1A1A1A]">₹{total.toLocaleString('en-IN')}</strong></span>}
      </div>

      {show && (
        <div className="border border-[#E8E7E3] rounded-xl p-4 space-y-3 bg-[#FBFAF8]">
          {entries.map(e => (
            <div key={e.id} className="grid grid-cols-4 gap-2 items-start">
              <select value={e.type} onChange={v => update(e.id, 'type', v.target.value)} className="notion-input text-sm">
                {['Courier','Transport','Freight','Custom'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Amount (₹)" value={e.amount} onChange={v => update(e.id, 'amount', v.target.value)} className="notion-input text-sm" />
              <input placeholder="Tracking No (optional)" value={e.tracking} onChange={v => update(e.id, 'tracking', v.target.value)} className="notion-input text-sm" />
              <div className="flex gap-1">
                <input placeholder="Remarks" value={e.remarks} onChange={v => update(e.id, 'remarks', v.target.value)} className="notion-input text-sm flex-1" />
                <button onClick={() => remove(e.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-[#AEACA8] hover:text-rose-500 hover:bg-rose-50">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <button onClick={add} className="flex items-center gap-1.5 text-xs text-[#1A1A1A] font-medium">
              <Plus size={12} /> Add Logistics Entry
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#787774]">Tax on Logistics:</span>
              <select value={taxRate} onChange={e => setTaxRate(e.target.value)} className="notion-input text-xs py-1 px-2">
                {['0%','5%','12%','18%'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
