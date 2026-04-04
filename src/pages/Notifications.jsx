import { useState } from 'react';
import { Bell, AlertTriangle, TrendingUp, CheckCircle, Info, X } from 'lucide-react';

const ALL_NOTIFICATIONS = [
  { id:1, title:'GSTR-3B Filing Due',        desc:'GSTR-3B for July 2025 is due in 3 days. 2 mismatches need resolution before filing.', time:'5 mins ago',  tag:'Urgent',   category:'Compliance', color:'#C0392B', icon:AlertTriangle, read:false },
  { id:2, title:'Tally Sync Complete',        desc:'Your Tally Prime data has been synced successfully. 48 new vouchers, 12 ledgers updated.', time:'32 mins ago', tag:'Info',     category:'Sync',       color:'#3F5263', icon:CheckCircle,  read:false },
  { id:3, title:'3 E-Way Bills Expiring',     desc:'3 E-Way Bills will expire today. EWB-271234567892, EWB-271234567893, EWB-271234567894.', time:'1 hr ago',   tag:'Warning',  category:'Compliance', color:'#F59E0B', icon:AlertTriangle, read:false },
  { id:4, title:'Payment Received',           desc:'₹9,80,000 received from Reliance Retail Ltd. via NEFT. Invoice SI-2025-0782 marked paid.', time:'2 hrs ago',  tag:'Success',  category:'Transactions',color:'#3F5263', icon:TrendingUp,   read:true  },
  { id:5, title:'Low Stock Alert',            desc:'B202 – Chemical Mix Type3 is below reorder level. Current: 80 Ltr. Reorder level: 150 Ltr.', time:'4 hrs ago',  tag:'Warning',  category:'Inventory',  color:'#F59E0B', icon:AlertTriangle, read:true  },
  { id:6, title:'Daily Summary Ready',        desc:'Your financial summary for 10 Jul 2025 is ready. Total Sales ₹45.8L, Net Profit ₹8.2L.', time:'8 hrs ago',  tag:'Info',     category:'Analytics',  color:'#6366F1', icon:Info,         read:true  },
  { id:7, title:'OD Utilization High',        desc:'HDFC CC-001 OD utilization has crossed 65%. Current: ₹32.8L of ₹50L limit.', time:'Yesterday', tag:'Warning',  category:'Financials', color:'#F59E0B', icon:AlertTriangle, read:true  },
  { id:8, title:'GSTR-2A Mismatch Detected', desc:'2 invoice mismatches found in GSTR-2A. Bharat Chemicals (GSTIN Mismatch), Sunrise Electricals (Invoice Not Found).', time:'Yesterday', tag:'Urgent',   category:'Compliance', color:'#C0392B', icon:AlertTriangle, read:true  },
  { id:9, title:'EMI Due Tomorrow',           desc:'HDFC Term Loan EMI of ₹1,10,000 is due tomorrow (15 Jul 2025). Ensure sufficient balance.', time:'Yesterday', tag:'Info',     category:'Financials', color:'#6366F1', icon:Info,         read:true  },
];

const TABS = ['All', 'Compliance', 'Transactions', 'Financials', 'Inventory', 'Sync'];
const tagColors = { Urgent: 'bg-[#FEF2F2] text-[#C0392B] border border-[#FECACA]', Warning: 'bg-amber-50 text-amber-600 border border-amber-200', Success: 'bg-[#ECEEEF] text-[#3F5263] border border-[#C5CBD0]', Info: 'bg-blue-50 text-blue-600 border border-blue-200' };

export default function Notifications() {
  const [tab, setTab] = useState('All');
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

  const filtered = tab === 'All' ? notifications : notifications.filter(n => n.category === tab);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications(p => p.filter(n => n.id !== id));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1C2B3A] tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#C0392B' }}>{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{filtered.length} notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#3F5263] hover:underline font-medium">Mark all as read</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${tab === t ? 'text-white' : 'text-[#6B7280] bg-white border border-[#D9DCE0] hover:border-[#3F5263]'}`}
            style={tab === t ? { background: '#3F5263' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#D9DCE0] rounded-2xl py-16 text-center">
            <Bell size={36} className="mx-auto mb-3 text-[#9CA3AF]" />
            <p className="text-sm font-medium text-[#6B7280]">No notifications</p>
            <p className="text-xs text-[#9CA3AF] mt-1">You're all caught up!</p>
          </div>
        ) : filtered.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} onClick={() => markRead(n.id)}
              className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-notion ${n.read ? 'bg-white border-[#D9DCE0]' : 'bg-[#FAFFFE] border-[#C5CBD0]'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: n.color + '20' }}>
                <Icon size={18} style={{ color: n.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold text-[#1C2B3A] ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[n.tag]}`}>{n.tag}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="text-[#9CA3AF] hover:text-[#6B7280] flex-shrink-0 mt-0.5">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{n.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-[#9CA3AF]">{n.time}</span>
                  <span className="text-[10px] text-[#9CA3AF]">·</span>
                  <span className="text-[10px] text-[#9CA3AF]">{n.category}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1" style={{ background: '#3F5263' }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
