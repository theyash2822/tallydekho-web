// Invoice PDF Preview — renders a professional invoice and allows print/download
import { useRef } from 'react';
import { X, Printer, Download, Share2 } from 'lucide-react';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

const SAMPLE_ITEMS = [
  { name: 'Polymer Sheet 2mm (A101)', hsn: '3920', qty: 200, unit: 'Kg', rate: 180, tax: 18, amount: 36000 },
  { name: 'Chemical Mix Type3 (B202)', hsn: '2900', qty: 50, unit: 'Ltr', rate: 420, tax: 18, amount: 21000 },
  { name: 'Packing Box 12x10 (C303)', hsn: '4819', qty: 500, unit: 'Pcs', rate: 25, tax: 12, amount: 12500 },
];

export default function InvoicePDF({ open, onClose, invoice }) {
  const printRef = useRef(null);
  if (!open) return null;

  const inv = invoice || {
    ref: 'SI-2025-0782',
    date: '10 Jul 2025',
    customer: 'Reliance Retail Ltd.',
    gstin: '27AABCR0001A1Z3',
    address: 'Maker Chambers IV, Nariman Point, Mumbai – 400021',
    phone: '+91 98200 11111',
    items: SAMPLE_ITEMS,
    subtotal: 69500,
    discount: 0,
    cgst: 6255,
    sgst: 6255,
    igst: 0,
    total: 82010,
    mode: 'Credit',
    terms: 'Payment due within 30 days.',
    narration: 'Goods dispatched via Blue Dart. EWB: 271234567890',
  };

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head>
        <title>${inv.ref}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #1A1A1A; }
          .invoice { max-width: 800px; margin: 20px auto; padding: 32px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
          .logo { font-size: 22px; font-weight: 800; color: #3F5263; }
          .title { font-size: 28px; font-weight: 700; color: #1A1A1A; text-align: right; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .label { font-size: 10px; color: #787774; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
          .value { font-size: 12px; color: #1A1A1A; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th { background: #F7F6F3; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: #787774; border-bottom: 1px solid #E8E7E3; }
          td { padding: 10px 12px; border-bottom: 1px solid #F1F0EC; font-size: 12px; }
          .totals { margin-left: auto; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
          .grand-total { font-size: 16px; font-weight: 700; color: #3F5263; padding-top: 8px; border-top: 2px solid #3F5263; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E7E3; font-size: 10px; color: #787774; }
          @media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }
        </style>
      </head><body>
        <div class="invoice">
          <div class="header">
            <div>
              <div class="logo">TallyDekho</div>
              <div style="margin-top:8px;color:#787774;font-size:11px">Maaruji Industries Pvt. Ltd.<br/>301, Mittal Court, Nariman Point<br/>Mumbai – 400021<br/>GSTIN: 27AABCM1234F1Z5</div>
            </div>
            <div style="text-align:right">
              <div class="title">TAX INVOICE</div>
              <div style="margin-top:8px;color:#3F5263;font-size:16px;font-weight:700">${inv.ref}</div>
              <div style="color:#787774;font-size:11px;margin-top:4px">Date: ${inv.date}</div>
            </div>
          </div>
          <div class="grid2">
            <div>
              <div class="label">Bill To</div>
              <div style="font-size:14px;font-weight:600;color:#1A1A1A">${inv.customer}</div>
              <div style="color:#787774;font-size:11px;margin-top:4px">${inv.address || ''}<br/>GSTIN: ${inv.gstin || 'N/A'}<br/>Phone: ${inv.phone || 'N/A'}</div>
            </div>
            <div style="text-align:right">
              <div class="label">Payment Terms</div>
              <div class="value">${inv.mode}</div>
              <div style="margin-top:12px"><div class="label">Place of Supply</div><div class="value">Maharashtra (27)</div></div>
            </div>
          </div>
          <table>
            <thead><tr>
              <th>#</th><th>Item / Service</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th>
            </tr></thead>
            <tbody>
              ${(inv.items || SAMPLE_ITEMS).map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.hsn}</td>
                  <td>${item.qty} ${item.unit}</td>
                  <td>${fmt(item.rate)}</td>
                  <td>${item.tax}%</td>
                  <td><strong>${fmt(item.amount)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display:flex;justify-content:flex-end">
            <div class="totals">
              <div class="total-row"><span style="color:#787774">Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
              ${inv.discount > 0 ? `<div class="total-row"><span style="color:#787774">Discount</span><span style="color:#F43F5E">-${fmt(inv.discount)}</span></div>` : ''}
              ${inv.cgst > 0 ? `<div class="total-row"><span style="color:#787774">CGST</span><span>${fmt(inv.cgst)}</span></div>` : ''}
              ${inv.sgst > 0 ? `<div class="total-row"><span style="color:#787774">SGST</span><span>${fmt(inv.sgst)}</span></div>` : ''}
              ${inv.igst > 0 ? `<div class="total-row"><span style="color:#787774">IGST</span><span>${fmt(inv.igst)}</span></div>` : ''}
              <div class="total-row grand-total"><span>Grand Total</span><span>${fmt(inv.total)}</span></div>
            </div>
          </div>
          ${inv.narration ? `<div style="margin-top:20px;padding:12px;background:#F7F6F3;border-radius:6px;font-size:11px;color:#787774"><strong>Narration:</strong> ${inv.narration}</div>` : ''}
          <div class="footer">
            <div style="display:flex;justify-content:space-between">
              <div><strong>Terms:</strong> ${inv.terms || 'Payment due within 30 days.'}</div>
              <div><strong>Authorised Signatory</strong><br/><br/>________________________</div>
            </div>
            <div style="margin-top:12px;text-align:center;color:#AEACA8">This is a computer generated invoice · TallyDekho v3.7.2</div>
          </div>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxWidth: 860, maxHeight: '92vh' }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E7E3] flex-shrink-0">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Invoice Preview</p>
              <p className="text-xs text-[#787774] mt-0.5">{inv.ref && inv.ref !== 'Pending' ? inv.ref + ' · ' : ''}{inv.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
                <Printer size={14} /> Print
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774] hover:bg-[#F7F6F3]">
                <Download size={14} /> Download PDF
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774] hover:bg-[#F7F6F3]">
                <Share2 size={14} /> Share
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#787774] hover:bg-[#F1F0EC]">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Invoice preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F7F6F3]">
            <div ref={printRef} className="bg-white rounded-xl shadow-notion-md mx-auto p-10" style={{ maxWidth: 760 }}>
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-2xl font-bold text-[#3F5263]">TallyDekho</div>
                  <div className="text-xs text-[#787774] mt-2 space-y-0.5">
                    <p className="font-semibold text-[#1A1A1A]">Maaruji Industries Pvt. Ltd.</p>
                    <p>301, Mittal Court, Nariman Point, Mumbai – 400021</p>
                    <p>GSTIN: 27AABCM1234F1Z5 · Ph: +91 98200 12345</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#1A1A1A]">TAX INVOICE</div>
                  <div className="text-lg font-bold mt-1 text-[#3F5263]">{inv.ref}</div>
                  <div className="text-xs text-[#787774] mt-1">Date: {inv.date}</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E8E7E3] mb-6" />

              {/* Bill To / Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#AEACA8] uppercase tracking-widest mb-2">Bill To</p>
                  <p className="font-bold text-[#1A1A1A] text-base">{inv.customer}</p>
                  <p className="text-xs text-[#787774] mt-1 leading-relaxed">{inv.address}</p>
                  <p className="text-xs text-[#787774] mt-1">GSTIN: {inv.gstin}</p>
                  <p className="text-xs text-[#787774]">Ph: {inv.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#AEACA8] uppercase tracking-widest mb-2">Invoice Details</p>
                  <div className="space-y-1.5 text-xs">
                    {[['Payment Terms', inv.mode], ['Place of Supply', 'Maharashtra (27)'], ['IRN', 'Generated ✓']].map(([l, v]) => (
                      <div key={l} className="flex justify-between gap-8">
                        <span className="text-[#787774]">{l}</span>
                        <span className="font-medium text-[#1A1A1A]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="bg-[#F7F6F3] border-y border-[#E8E7E3]">
                    {['#', 'Item / Service', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-[#787774] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(inv.items || SAMPLE_ITEMS).map((item, i) => (
                    <tr key={i} className="border-b border-[#F1F0EC]">
                      <td className="px-3 py-3 text-[#787774]">{i + 1}</td>
                      <td className="px-3 py-3 font-medium text-[#1A1A1A]">{item.name}</td>
                      <td className="px-3 py-3 font-mono text-xs text-[#787774]">{item.hsn}</td>
                      <td className="px-3 py-3">{item.qty} {item.unit}</td>
                      <td className="px-3 py-3">{fmt(item.rate)}</td>
                      <td className="px-3 py-3">{item.tax}%</td>
                      <td className="px-3 py-3 font-semibold text-[#1A1A1A]">{fmt(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-1.5 text-sm">
                  {[['Subtotal', inv.subtotal], inv.discount > 0 && ['Discount', -inv.discount], inv.cgst > 0 && ['CGST', inv.cgst], inv.sgst > 0 && ['SGST', inv.sgst], inv.igst > 0 && ['IGST', inv.igst]].filter(Boolean).map(([l, v]) => (
                    <div key={l} className="flex justify-between py-1 border-b border-[#F1F0EC]">
                      <span className="text-[#787774]">{l}</span>
                      <span className={`font-medium ${v < 0 ? 'text-rose-500' : 'text-[#1A1A1A]'}`}>{v < 0 ? '-' + fmt(Math.abs(v)) : fmt(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t-2 mt-1 border-[#3F5263]">
                    <span className="font-bold text-[#1C2B3A] text-base">Grand Total</span>
                    <span className="font-bold text-base text-[#3F5263]">{fmt(inv.total)}</span>
                  </div>
                </div>
              </div>

              {/* Narration */}
              {inv.narration && (
                <div className="p-3 bg-[#F7F6F3] rounded-lg text-xs text-[#787774] mb-6">
                  <strong className="text-[#1A1A1A]">Narration: </strong>{inv.narration}
                </div>
              )}

              {/* Footer */}
              <div className="h-px bg-[#E8E7E3] mb-4" />
              <div className="flex justify-between items-end text-xs">
                <div className="text-[#787774]">
                  <p><strong className="text-[#1A1A1A]">Terms:</strong> {inv.terms || 'Payment due within 30 days.'}</p>
                  <p className="mt-1 text-[#AEACA8]">This is a computer generated invoice · TallyDekho v3.7.2</p>
                </div>
                <div className="text-right text-[#787774]">
                  <p className="font-medium text-[#1A1A1A]">Authorised Signatory</p>
                  <div className="mt-6 border-t border-[#E8E7E3] pt-1 w-32 ml-auto">
                    <p>Maaruji Industries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
