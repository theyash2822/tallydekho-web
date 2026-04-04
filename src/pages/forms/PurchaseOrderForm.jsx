import { useState } from 'react';
import { FormField, Input, Select, SectionTitle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PurchaseOrderForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const tax = items.reduce((s, i) => s + (i.amount || 0) * 0.18, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center border border-[#BBF7D0]">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Purchase Order Created!</p>
        <p className="text-sm text-[#6B7280]">PO-2025-0089</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2" style={{ background: '#3F5263' }}>
            Convert to Purchase Invoice <ArrowRight size={13} />
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Share PDF</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Entry Type">
          <div className="flex gap-2">
            <button onClick={() => setIsOptional(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${!isOptional ? 'bg-[#ECEEEF] text-[#3F5263] border-[#C5CBD0]' : 'border-[#D9DCE0] text-[#6B7280]'}`}>Regular</button>
            <button onClick={() => setIsOptional(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isOptional ? 'bg-[#ECEEEF] text-[#3F5263] border-[#C5CBD0]' : 'border-[#D9DCE0] text-[#6B7280]'}`}>Optional</button>
          </div>
        </FormField>
        <FormField label="PO Number"><Input defaultValue="PO-2025-0089" readOnly /></FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="PO Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
        <FormField label="Vendor" required>
          <Select options={['Shree Polymers', 'Bharat Chemicals', 'National Packaging']} placeholder="Search or add vendor" />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Payment Terms"><Select options={['Due on Receipt', '15 Days', '30 Days', 'Custom']} /></FormField>
        <FormField label="Due Date"><Input type="date" /></FormField>
        <FormField label="Expected Delivery"><Input type="date" /></FormField>
      </div>

      <SectionTitle title="Items / Products" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional — can be estimated" />
      <LogisticsSection />

      <SummaryFooter subtotal={subtotal} tax={Math.round(tax)} onSubmit={() => setSubmitted(true)} submitLabel="Submit Purchase Order" showDraft={false} />
    </div>
  );
}
