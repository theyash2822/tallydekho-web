import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle } from 'lucide-react';
import InvoicePDF from '../../components/InvoicePDF';

const LEDGERS = ['Cash Sales', 'Credit Sales', 'Off-Books', 'On-Books'];
const PAYMENT_TERMS = ['Paid / Due on Receipt', '15 Days', '30 Days', 'Custom'];

export default function SalesInvoiceForm({ onClose, onSubmit }) {
  const [submitted, setSubmitted] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [collectNow, setCollectNow] = useState(false);
  const [upiQR, setUpiQR] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const tax = items.reduce((s, i) => s + (i.amount || 0) * (parseFloat(i.tax) / 100 || 0.18), 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center border border-[#A8D5BC]">
          <CheckCircle size={32} className="text-[#2D7D46]" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Invoice Created Successfully!</p>
        <p className="text-sm text-[#6B7280]">INV-2025-0783 · ₹{(subtotal + tax).toLocaleString('en-IN')}</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">Share PDF</button>
          <button onClick={() => setSubmitted(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">Create Another</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Ledger + Optional toggle */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ledger" required>
          <div className="flex gap-2">
            <Select options={LEDGERS} placeholder="Select Ledger" />
            <button onClick={() => setIsOptional(p => !p)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium flex-shrink-0 transition-colors ${isOptional ? 'bg-[#ECEEEF] text-[#3F5263] border-[#C5CBD0]' : 'border-[#D9DCE0] text-[#6B7280]'}`}>
              {isOptional ? 'Optional' : 'Regular'}
            </button>
          </div>
        </FormField>
        <FormField label="Invoice Number">
          <Input defaultValue="INV-2025-0783" readOnly />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Invoice Date" required>
          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </FormField>
        <FormField label="Payment Terms">
          <Select options={PAYMENT_TERMS} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Customer" required>
          <Select options={['ABC Traders', 'Reliance Retail Ltd.', 'Metro Cash & Carry', 'D-Mart Ltd.']} placeholder="Search or select customer" />
        </FormField>
        <FormField label="Due Date">
          <Input type="date" />
        </FormField>
      </div>

      <SectionTitle title="Items / Services" subtitle="Select warehouse first, then add products" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional" />
      <LogisticsSection />

      <SectionTitle title="Payment & Collection" />
      <div className="space-y-3">
        <Toggle label="Attach UPI QR Code" checked={upiQR} onChange={setUpiQR} />
        <Toggle label="Collect Payment Now" checked={collectNow} onChange={setCollectNow} />
        {collectNow && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
            <FormField label="Payment Mode"><Select options={['Cash', 'Bank Transfer', 'UPI', 'Cheque']} /></FormField>
            <FormField label="Amount Received"><Input type="number" placeholder="0.00" prefix="₹" /></FormField>
            <FormField label="Reference / UTR No"><Input placeholder="Optional" /></FormField>
            <FormField label="Payment Date"><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
          </div>
        )}
      </div>

      <SectionTitle title="Narration" />
      <textarea rows={2} placeholder="Internal notes or narration (optional)" className="notion-input w-full text-sm resize-none" />

      <SummaryFooter
        subtotal={subtotal}
        tax={Math.round(tax)}
        onSubmit={() => setSubmitted(true)}
        onDraft={() => alert('Saved as draft')}
        submitLabel="Submit Invoice"
      />
    </div>
  );
}
