import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { getPendingCount } from '../services/localQueue';
import wsService from '../services/websocket';

export default function SyncStatus() {
  const [pending, setPending] = useState(getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setPending(getPendingCount()), 5000);
    const unSynced = wsService.on('synced', () => {
      setSyncing(true);
      setTimeout(() => { setSyncing(false); setLastSync(new Date()); setPending(getPendingCount()); }, 1500);
    });
    return () => { clearInterval(t); unSynced(); };
  }, []);

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F4EF] border border-[#E9E8E3]">
        <RefreshCw size={11} className="animate-spin text-[#787774]" />
        <span className="text-xs font-medium text-[#787774]">Syncing…</span>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
        <Clock size={11} className="text-[#D97706]" />
        <span className="text-xs font-medium text-[#D97706]">{pending} pending</span>
      </div>
    );
  }

  if (lastSync) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8F5ED] border border-[#BBF7D0]">
        <CheckCircle size={11} className="text-[#2D7D46]" />
        <span className="text-xs font-medium text-[#2D7D46]">Synced</span>
      </div>
    );
  }

  return null;
}
