import { useState } from 'react';
import { FormField, Input, Select, SectionTitle } from '../../components/FormField';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, Plus, Edit2 } from 'lucide-react';

const emptyItem = () => ({ id: Date.now(), name: '', qty: 1, warehouse: 'Mumbai Main', amount: 0 });

export default function DebitNoteForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', qty: 1, warehouse: 'Mumbai Main', rate: '' });

  const addItem = () => {
    if (!draft.name) return;
    const item = { ...emptyItem(), ...draft, amount: draft.qty * (parseFloat(draft.rate) || 0) };
    setItems(p => [...p, item]);
    setDraft({ name: '', qty: 1, warehouse: 'Mumbai Main', rate: '' });
    setShowItemForm(false);
  };

  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center border border-[#BBF7D0]">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Debit Note Created!</p>
        <p className="text-sm text-[#6B7280]">DN-2025-0021</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#3F5263' }}>Share PDF</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Debit Note Number"><Input defaultValue="DN-2025-0021" readOnly /></FormField>
        <FormField label="Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Vendor" required>
          <Select options={['Shree Polymers', 'Bharat Chemicals', 'National Packaging']} placeholder="Select vendor" />
        </FormField>
        <FormField label="Against Purchase Invoice" hint="Link to original purchase invoice">
          <Select options={['PI-2025-0456', 'PI-2025-0455', 'PI-2025-0454']} placeholder="Select invoice" />
        </FormField>
      </div>

      <SectionTitle title="Return Items" />
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-[#F9F9F9] border border-[#D9DCE0] rounded-xl">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-[#1C2B3A]">{item.name}</span>
              <span className="text-[#6B7280]">Qty: {item.qty}</span>
              <span className="text-[#6B7280]">{item.warehouse}</span>
              <span className="font-semibold text-[#1C2B3A]">₹{item.amount.toLocaleString('en-IN')}</span>
            </div>
            <button className="w-6 h-6 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#3F5263] hover:bg-[#ECEEEF]">
              <Edit2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {showItemForm ? (
        <div className="p-4 border border-[#3F5263] rounded-xl bg-[#ECEEEF] space-y-3">
          <p className="text-xs font-semibold text-[#3F5263]">Add Return Item</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Product Name" required><Input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Qty"><Input type="number" value={draft.qty} onChange={e => setDraft(p => ({ ...p, qty: e.target.value }))} /></FormField>
            <FormField label="Warehouse"><Select options={['Mumbai Main Warehouse', 'Pune Storage', 'Delhi Hub']} /></FormField>
            <FormField label="Rate (₹)"><Input type="number" value={draft.rate} onChange={e => setDraft(p => ({ ...p, rate: e.target.value }))} /></FormField>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#3F5263' }}>Add Item</button>
            <button onClick={() => setShowItemForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowItemForm(true)} className="flex items-center gap-1.5 text-sm font-medium text-[#3F5263]">
          <Plus size={14} /> {items.length > 0 ? 'Add Another Item' : 'Add Return Item'}
        </button>
      )}

      <SectionTitle title="Reason / Narration" />
      <textarea rows={2} placeholder="Reason for debit note (optional)" className="notion-input w-full text-sm resize-none" />

      <SummaryFooter subtotal={subtotal} onSubmit={() => setSubmitted(true)} submitLabel="Submit Debit Note" showDraft={false} />
    </div>
  );
}
