import { useState } from 'react';
import { FormField, Input, Select, SectionTitle } from '../../components/FormField';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, Plus, Edit2 } from 'lucide-react';

const emptyItem = () => ({ id: Date.now(), name: '', qty: 1, amount: 0 });

export default function DeliveryNoteForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', qty: 1, rate: '' });

  const addItem = () => {
    if (!draft.name) return;
    const item = { ...emptyItem(), ...draft, amount: draft.qty * (parseFloat(draft.rate) || 0) };
    setItems(p => [...p, item]);
    setDraft({ name: '', qty: 1, rate: '' });
    setShowItemForm(false);
  };

  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1A1A1A]">Delivery Note Created!</p>
        <p className="text-sm text-[#787774]">DLV-2025-0067</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>Share PDF</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Delivery Note Number"><Input defaultValue="DLV-2025-0067" readOnly /></FormField>
        <FormField label="Dispatch Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Customer" required>
          <Select options={['ABC Traders', 'Reliance Retail Ltd.', 'Metro Cash & Carry']} placeholder="Select customer" />
        </FormField>
        <FormField label="Against Invoice">
          <Select options={['SI-2025-0782', 'SI-2025-0781', 'SI-2025-0780']} placeholder="Link to invoice (optional)" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Dispatch From (Warehouse)">
          <Select options={['Mumbai Main Warehouse', 'Pune Storage', 'Delhi Hub']} placeholder="Select warehouse" />
        </FormField>
        <FormField label="Vehicle / Transporter"><Input placeholder="e.g. MH04 CD 5678 / Blue Dart" /></FormField>
      </div>

      <SectionTitle title="Items to Dispatch" />
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-[#FBFAF8] border border-[#E8E7E3] rounded-xl">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-[#1A1A1A]">{item.name}</span>
              <span className="text-[#787774]">Qty: {item.qty}</span>
              <span className="font-semibold text-[#1A1A1A]">₹{item.amount.toLocaleString('en-IN')}</span>
            </div>
            <button className="w-6 h-6 flex items-center justify-center rounded text-[#AEACA8] hover:text-[#059669]">
              <Edit2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {showItemForm ? (
        <div className="p-4 border border-[#059669] rounded-xl bg-[#ECFDF5] space-y-3">
          <p className="text-xs font-semibold text-[#059669]">Add Dispatch Item</p>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Product Name" required><Input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Qty"><Input type="number" value={draft.qty} onChange={e => setDraft(p => ({ ...p, qty: e.target.value }))} /></FormField>
            <FormField label="Rate (₹)"><Input type="number" value={draft.rate} onChange={e => setDraft(p => ({ ...p, rate: e.target.value }))} /></FormField>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>Add Item</button>
            <button onClick={() => setShowItemForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774]">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowItemForm(true)} className="flex items-center gap-1.5 text-sm font-medium text-[#059669]">
          <Plus size={14} /> {items.length > 0 ? 'Add Another Item' : 'Add Dispatch Item'}
        </button>
      )}

      <SectionTitle title="Narration" />
      <textarea rows={2} placeholder="Delivery instructions or notes" className="notion-input w-full text-sm resize-none" />

      <SummaryFooter subtotal={subtotal} onSubmit={() => setSubmitted(true)} submitLabel="Submit Delivery Note" showDraft={false} />
    </div>
  );
}
