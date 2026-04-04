import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, Upload, FileText } from 'lucide-react';

export default function PurchaseInvoiceForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [scanned, setScanned] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const tax = items.reduce((s, i) => s + (i.amount || 0) * 0.18, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center border border-[#BBF7D0]">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Purchase Invoice Created!</p>
        <p className="text-sm text-[#6B7280]">PI-2025-0457</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#3F5263' }}>Share PDF</button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">View Scanned Invoice</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* OCR Upload */}
      <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${scanned ? 'border-emerald-300 bg-[#F0FDF4]' : 'border-[#D9DCE0] bg-[#F9F9F9] hover:border-[#3F5263]'}`}
        onClick={() => setScanned(true)}>
        {scanned ? (
          <div className="flex items-center justify-center gap-2 text-[#2D7D46]">
            <FileText size={16} /><span className="text-sm font-medium">Invoice scanned — data auto-filled below</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload size={20} className="mx-auto text-[#9CA3AF]" />
            <p className="text-sm font-medium text-[#6B7280]">Upload or Scan Invoice (OCR)</p>
            <p className="text-xs text-[#9CA3AF]">Supports PDF, JPG, PNG — auto-extracts vendor, items & amounts</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ledger" required>
          <Select options={['Purchase - Raw Materials', 'Purchase - Finished Goods', 'Expenses', 'Capital Purchase']} placeholder="Select Ledger" />
        </FormField>
        <FormField label="Invoice Number"><Input defaultValue="PI-2025-0457" /></FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Invoice Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
        <FormField label="Vendor" required>
          <Select options={['Shree Polymers', 'Bharat Chemicals', 'National Packaging', 'Excel Logistics']} placeholder="Search or add vendor" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Purchase Reference No" hint="For internal tracking">
          <Input placeholder="Optional" />
        </FormField>
        <FormField label="Payment Terms">
          <div className="flex gap-2">
            <Select options={['Due on Receipt', '15 Days', '30 Days', 'Custom', 'Paid']} onChange={e => setIsPaid(e.target.value === 'Paid')} />
          </div>
        </FormField>
      </div>

      {isPaid && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
          <FormField label="Payment Mode"><Select options={['Cash', 'Bank Transfer', 'UPI', 'Cheque']} /></FormField>
          <FormField label="Amount Paid"><Input type="number" prefix="₹" /></FormField>
          <FormField label="Reference / UTR"><Input placeholder="Optional" /></FormField>
          <FormField label="Payment Date"><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
        </div>
      )}

      <SectionTitle title="Stock / Products" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional" />
      <LogisticsSection />

      <SummaryFooter subtotal={subtotal} tax={Math.round(tax)} onSubmit={() => setSubmitted(true)} onDraft={() => alert('Saved as draft')} submitLabel="Submit Purchase Invoice" />
    </div>
  );
}
