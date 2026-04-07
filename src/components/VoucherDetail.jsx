import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer, Share2, Check } from 'lucide-react';
import api from '../services/api';

const fmt = n => '₹' + Math.abs(parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const typeColor = (type) => {
  if (!type) return 'bg-[#ECEEEF] text-[#3F5263]';
  if (type.includes('Sales'))   return 'bg-[#F0FDF4] text-[#2D7D46]';
  if (type.includes('Purchase')) return 'bg-[#FFFBEB] text-[#B45309]';
  if (type.includes('Payment')) return 'bg-[#FEF2F2] text-[#C0392B]';
  if (type.includes('Receipt')) return 'bg-[#F0FDF4] text-[#2D7D46]';
  if (type.includes('Journal')) return 'bg-[#EFF6FF] text-[#2563EB]';
  if (type.includes('Contra'))  return 'bg-[#FFFBEB] text-[#B45309]';
  return 'bg-[#ECEEEF] text-[#3F5263]';
};

export default function VoucherDetail({ voucherId, companyGuid, companyName, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!voucherId || !companyGuid) return;
    setLoading(true);
    setError(null);
    api.fetchVoucherDetail({ companyGuid, voucherId })
      .then(r => setData(r?.data))
      .catch(e => setError(e.message || 'Failed to load voucher'))
      .finally(() => setLoading(false));
  }, [voucherId, companyGuid]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Voucher</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #1C2B3A; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #1C2B3A; padding-bottom: 12px; }
        .company { font-size: 18px; font-weight: 700; color: #1C2B3A; }
        .voucher-type { font-size: 14px; font-weight: 600; text-align: right; }
        .voucher-number { font-size: 22px; font-weight: 700; color: #3F5263; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .meta-item { }
        .label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .value { font-size: 12px; font-weight: 500; color: #1C2B3A; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #F4F5F6; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid #D9DCE0; }
        td { padding: 8px 10px; border-bottom: 1px solid #F4F5F6; font-size: 12px; }
        .total-row { font-weight: 700; background: #F4F5F6; }
        .amount-dr { color: #C0392B; }
        .amount-cr { color: #2D7D46; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #D9DCE0; font-size: 10px; color: #6B7280; display: flex; justify-content: space-between; }
        @media print { @page { margin: 15mm; } }
      </style></head><body>
      <div class="header">
        <div>
          <div class="company">${companyName || 'Company'}</div>
          ${data?.voucher?.date ? `<div style="color:#6B7280;font-size:11px;margin-top:4px">Date: ${data.voucher.date}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div class="voucher-type">${data?.voucher?.voucher_type || 'Voucher'}</div>
          <div class="voucher-number">${data?.voucher?.voucher_number || ''}</div>
        </div>
      </div>
      ${data?.voucher?.party_name ? `<div class="meta"><div class="meta-item"><div class="label">Party</div><div class="value">${data.voucher.party_name}</div></div>${data?.voucher?.reference ? `<div class="meta-item"><div class="label">Reference</div><div class="value">${data.voucher.reference}</div></div>` : ''}</div>` : ''}
      ${data?.voucher?.narration ? `<div style="margin-bottom:12px;padding:8px;background:#F4F5F6;border-radius:4px;font-size:11px;color:#6B7280"><strong>Narration:</strong> ${data.voucher.narration}</div>` : ''}
      <table>
        <thead><tr><th>Particulars</th><th style="text-align:right">Dr Amount</th><th style="text-align:right">Cr Amount</th></tr></thead>
        <tbody>
          ${(data?.items || []).map(item => `
            <tr>
              <td>${item.ledger_name || '—'}${item.item_name ? ` <span style="color:#6B7280">(${item.item_name})</span>` : ''}</td>
              <td style="text-align:right" class="${item.type === 'Dr' ? 'amount-dr' : ''}">${item.type === 'Dr' && parseFloat(item.amount) > 0 ? fmt(item.amount) : '—'}</td>
              <td style="text-align:right" class="${item.type === 'Cr' ? 'amount-cr' : ''}">${item.type === 'Cr' && parseFloat(item.amount) > 0 ? fmt(item.amount) : '—'}</td>
            </tr>`).join('')}
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td style="text-align:right"><strong>${fmt(data?.voucher?.amount)}</strong></td>
            <td style="text-align:right"><strong>${fmt(data?.voucher?.amount)}</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div>Computer generated voucher · TallyDekho</div>
        <div><strong>Authorised Signatory</strong><br/><br/>_________________________</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  if (loading) return (
    <div className="space-y-3 p-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-[#F4F5F6] rounded-lg animate-pulse" style={{ width: `${70 + (i * 11) % 30}%` }} />)}
    </div>
  );

  if (error || !data) return (
    <div className="p-4 text-center">
      <p className="text-sm text-[#C0392B]">{error || 'Voucher not found'}</p>
      <button onClick={onBack} className="mt-3 text-xs text-[#3F5263] hover:underline">← Back</button>
    </div>
  );

  const { voucher, items = [], company } = data;
  const drTotal = items.filter(i => i.type === 'Dr').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const crTotal = items.filter(i => i.type === 'Cr').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#3F5263] hover:text-[#526373] font-medium transition-colors">
          <ArrowLeft size={13} /> Back to vouchers
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const text = `${voucher?.voucher_type || 'Voucher'} ${voucher?.voucher_number || ''} | ${voucher?.party_name || ''} | ₹${Math.abs(parseFloat(voucher?.amount) || 0).toLocaleString('en-IN')} | ${voucher?.date || ''} | ${companyName || ''}`;
              if (navigator.share) {
                navigator.share({ title: `Voucher ${voucher?.voucher_number}`, text });
              } else {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#D9DCE0] rounded-lg hover:bg-[#F4F5F6] transition-colors text-[#6B7280]">
            {copied ? <><Check size={12} className="text-[#2D7D46]" /> Copied</> : <><Share2 size={12} /> Share</>}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg transition-colors">
            <Printer size={12} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Voucher card */}
      <div ref={printRef} className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between p-4 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">{companyName}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${typeColor(voucher.voucher_type)}`}>
              {voucher.voucher_type}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#1C2B3A]">{voucher.voucher_number}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{voucher.date}</p>
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Party', voucher.party_name],
            ['Date', voucher.date],
            ['Reference', voucher.reference],
            ['Narration', voucher.narration],
          ].filter(([, v]) => v).map(([l, v]) => (
            <div key={l} className={`p-3 bg-white border border-[#D9DCE0] rounded-xl ${l === 'Narration' || l === 'Party' ? 'col-span-2' : ''}`}>
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{l}</p>
              <p className="text-sm font-medium text-[#1C2B3A]">{v}</p>
            </div>
          ))}
        </div>

        {/* Line items table */}
        <div className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F4F5F6] border-b border-[#D9DCE0]">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ledger Entries</p>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-[#9CA3AF]">No line items available</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECEEEF]">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase">Particulars</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#9CA3AF] uppercase">Dr Amount</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#9CA3AF] uppercase">Cr Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.filter(i => parseFloat(i.amount) > 0 || i.item_name).map((item, i) => (
                  <tr key={i} className="border-b border-[#F4F5F6] last:border-0 hover:bg-[#F9F9F9]">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-[#1C2B3A]">{item.ledger_name || '—'}</p>
                      {item.item_name && (
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{item.item_name}{item.qty ? ` · ${item.qty} ${item.unit || ''}` : ''}{item.rate ? ` @ ₹${item.rate}` : ''}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {item.type === 'Dr' && parseFloat(item.amount) > 0
                        ? <span className="text-[#C0392B]">{fmt(item.amount)}</span>
                        : <span className="text-[#D9DCE0]">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {item.type === 'Cr' && parseFloat(item.amount) > 0
                        ? <span className="text-[#2D7D46]">{fmt(item.amount)}</span>
                        : <span className="text-[#D9DCE0]">—</span>}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-[#F4F5F6] font-semibold border-t border-[#D9DCE0]">
                  <td className="px-4 py-2.5 text-sm text-[#1C2B3A]">Total</td>
                  <td className="px-4 py-2.5 text-right text-sm text-[#C0392B]">{drTotal > 0 ? fmt(drTotal) : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-[#2D7D46]">{crTotal > 0 ? fmt(crTotal) : '—'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Grand total */}
        <div className="flex justify-between items-center p-4 bg-[#1A1A1A] rounded-xl">
          <span className="text-sm font-semibold text-white/80">Net Amount</span>
          <span className="text-xl font-bold text-white">{fmt(voucher.amount)}</span>
        </div>
      </div>
    </div>
  );
}
