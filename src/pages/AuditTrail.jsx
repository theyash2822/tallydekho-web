import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAuditTrail, retryAuditEntry } from '../services/api';
import {
  CheckCircle2, Clock, WifiOff, XCircle, RefreshCw,
  AlertCircle, RotateCcw, ChevronDown, ChevronUp, Filter
} from 'lucide-react';

const STATUS_CONFIG = {
  success:        { label: 'In Tally',       color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 },
  desktop_offline:{ label: 'Pending — Desktop Offline', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400 animate-pulse', Icon: WifiOff },
  pending:        { label: 'Pending',         color: 'text-blue-700 bg-blue-50 border-blue-200',           dot: 'bg-blue-400 animate-pulse', Icon: Clock },
  failed:         { label: 'Failed',          color: 'text-red-700 bg-red-50 border-red-200',             dot: 'bg-red-500', Icon: XCircle },
};

const TYPE_LABELS = {
  sales: 'Sales Invoice', purchase: 'Purchase Invoice', payment: 'Payment',
  receipt: 'Receipt', journal: 'Journal', contra: 'Contra',
  credit_note: 'Credit Note', debit_note: 'Debit Note',
  sales_order: 'Sales Order', purchase_order: 'Purchase Order',
  delivery_note: 'Delivery Note', party: 'Party / Ledger', item: 'Stock Item',
  warehouse: 'Warehouse',
};

function fmtTime(epoch) {
  if (!epoch) return '—';
  return new Date(epoch * 1000).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function fmtAmt(amt) {
  if (!amt || isNaN(amt)) return null;
  const n = parseFloat(amt);
  if (n === 0) return null;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function AuditTrail() {
  const { selectedCompany } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [retrying, setRetrying] = useState({});
  const [expanded, setExpanded] = useState({});

  const load = useCallback(() => {
    if (!selectedCompany?.guid) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetchAuditTrail({
      companyGuid: selectedCompany.guid,
      status: filter === 'all' ? undefined : filter,
      limit: 100,
    })
      .then(res => {
        if (res?.data) {
          setEntries(res.data.entries || []);
          setStats(res.data.stats || null);
        }
      })
      .catch(e => setError(e?.message || 'Failed to load audit trail'))
      .finally(() => setLoading(false));
  }, [selectedCompany?.guid, filter]);

  useEffect(() => { load(); }, [load]);

  const retry = async (id) => {
    setRetrying(r => ({ ...r, [id]: true }));
    try {
      const res = await retryAuditEntry(id);
      if (res?.status) load();
      else setError(res?.message || 'Retry failed');
    } catch (e) {
      setError(e?.message || 'Retry failed');
    } finally {
      setRetrying(r => ({ ...r, [id]: false }));
    }
  };

  const retryAll = async () => {
    const pending = entries.filter(e => e.status !== 'success');
    for (const e of pending) await retry(e.id);
  };

  const pendingCount = stats ? (parseInt(stats.offline_count || 0) + parseInt(stats.pending_count || 0) + parseInt(stats.failed_count || 0)) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Every entry made from app or web — with Tally push status</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={retryAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <RotateCcw size={13} /> Push All Pending ({pendingCount})
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C2B3A] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto underline font-medium">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Entries', value: stats.total, color: '#3F5263' },
            { label: 'In Tally', value: stats.success_count, color: '#2D7D46' },
            { label: 'Pending / Offline', value: parseInt(stats.offline_count||0) + parseInt(stats.pending_count||0), color: '#D97706' },
            { label: 'Failed', value: stats.failed_count, color: '#DC2626' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#D9DCE0] rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'success', label: '✓ In Tally' },
          { key: 'desktop_offline', label: '⏳ Offline' },
          { key: 'failed', label: '✗ Failed' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === f.key
                ? 'bg-[#1A1A1A] text-white border-[#3F5263]'
                : 'bg-white text-[#6B7280] border-[#D9DCE0] hover:border-[#3F5263] hover:text-[#3F5263]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-[#F4F5F6] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F4F5F6] flex items-center justify-center">
            <CheckCircle2 size={20} className="text-[#9CA3AF]" />
          </div>
          <p className="text-sm text-[#9CA3AF]">No entries yet — create an invoice or voucher to see it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
            const isExp = expanded[entry.id];
            const amount = fmtAmt(entry.amount);
            return (
              <div key={entry.id} className="bg-white border border-[#D9DCE0] rounded-xl overflow-hidden hover:border-[#B0B8C1] transition-colors">
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

                  {/* Type + label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#1C2B3A]">
                        {TYPE_LABELS[entry.entry_type] || entry.entry_type}
                      </span>
                      <span className="text-xs text-[#6B7280] truncate max-w-[200px]">{entry.entry_label}</span>
                      {amount && <span className="text-xs font-semibold text-[#3F5263]">{amount}</span>}
                      {entry.tally_voucher_number && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          #{entry.tally_voucher_number}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{fmtTime(entry.created_at)} · {entry.source === 'mobile' ? '📱 Mobile' : '🌐 Web'}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold border ${cfg.color}`}>
                    {cfg.label}
                  </span>

                  {/* Retry button */}
                  {entry.status !== 'success' && (
                    <button
                      onClick={() => retry(entry.id)}
                      disabled={retrying[entry.id]}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-50 transition-colors"
                    >
                      <RotateCcw size={11} className={retrying[entry.id] ? 'animate-spin' : ''} />
                      {retrying[entry.id] ? 'Pushing…' : 'Push to Tally'}
                    </button>
                  )}

                  {/* Expand */}
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [entry.id]: !isExp }))}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-[#3F5263]"
                  >
                    {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expanded: error + attempt info */}
                {isExp && (
                  <div className="px-4 pb-3 border-t border-[#F0F0EE] mt-0 pt-3 space-y-1.5">
                    <div className="flex gap-6 text-[11px] text-[#9CA3AF]">
                      <span>Attempts: <strong className="text-[#1C2B3A]">{entry.attempt_count}</strong></span>
                      <span>Updated: <strong className="text-[#1C2B3A]">{fmtTime(entry.updated_at)}</strong></span>
                      {entry.tally_id && <span>Tally ID: <strong className="text-[#1C2B3A]">{entry.tally_id}</strong></span>}
                    </div>
                    {entry.error_message && (
                      <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-3 py-2 font-mono">
                        {entry.error_message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
