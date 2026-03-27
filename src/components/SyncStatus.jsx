// Sync status indicator — shows in topbar
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { getPendingCount } from '../services/localQueue';
import wsService from '../services/websocket';

export default function SyncStatus() {
  const [pending, setPending] = useState(getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Update pending count every 5s
    const t = setInterval(() => setPending(getPendingCount()), 5000);

    // Listen for sync events from desktop
    const unSynced = wsService.on('synced', () => {
      setSyncing(true);
      setTimeout(() => {
        setSyncing(false);
        setLastSync(new Date());
        setPending(getPendingCount());
      }, 1500);
    });

    return () => { clearInterval(t); unSynced(); };
  }, []);

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#6EE7B7]">
        <RefreshCw size={11} className="animate-spin" style={{ color: '#059669' }} />
        <span className="text-xs font-medium" style={{ color: '#059669' }}>Syncing…</span>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
        <Clock size={11} className="text-amber-600" />
        <span className="text-xs font-medium text-amber-700">{pending} pending</span>
      </div>
    );
  }

  if (lastSync) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5]">
        <CheckCircle size={11} style={{ color: '#059669' }} />
        <span className="text-xs font-medium" style={{ color: '#059669' }}>Synced</span>
      </div>
    );
  }

  return null;
}
