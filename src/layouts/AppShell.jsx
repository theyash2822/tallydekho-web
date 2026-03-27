import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard, Landmark, ArrowLeftRight, CreditCard, FileBarChart2,
  ShieldCheck, Truck, FileText, Receipt, BookOpen, ClipboardList,
  Sparkles, Settings, ChevronDown, ChevronRight, Menu, Bell, Building2,
  Search, Plus, User, Check, TrendingUp, ShoppingCart, Package
} from 'lucide-react';
import { company } from '../data/mockData';
import CreateModal from '../components/CreateModal';
import { useAuth } from '../contexts/AuthContext';
import SyncStatus from '../components/SyncStatus';
import GlobalSearch from '../components/GlobalSearch';

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const displayName = user?.name || (user?.mobileNumber ? user.mobileNumber : 'Account');
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="relative pl-2 border-l border-[#E8E7E3]" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F7F6F3] transition-colors">
        <div className="w-7 h-7 rounded-full bg-[#ECFDF5] border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ borderColor: '#059669', color: '#059669' }}>
          {initials || <User size={12} />}
        </div>
        <span className="text-xs font-medium text-[#1A1A1A] max-w-[80px] truncate">{displayName.split(' ')[0]}</span>
        <ChevronDown size={11} className="text-[#AEACA8]" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-[#E8E7E3] rounded-xl shadow-notion-lg z-50 py-1">
          <div className="px-4 py-3 border-b border-[#F1F0EC]">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{displayName}</p>
            <p className="text-xs text-[#787774] mt-0.5 truncate">{user?.mobileNumber || ''}</p>
          </div>
          <button className="w-full text-left px-4 py-2.5 text-sm text-[#787774] hover:bg-[#F7F6F3] transition-colors">Profile</button>
          <button className="w-full text-left px-4 py-2.5 text-sm text-[#787774] hover:bg-[#F7F6F3] transition-colors">Settings</button>
          <div className="border-t border-[#F1F0EC] mt-1 pt-1">
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanySwitcher() {
  const [open, setOpen] = useState(false);
  const { companies, selectedCompany, selectCompany } = useAuth();
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const list = companies.length > 0 ? companies : [{ name: 'Maaruji Industries Pvt. Ltd.', guid: 'demo' }];
  const current = selectedCompany || list[0];
  const displayName = current?.name || 'Select Company';

  return (
    <div className="relative pl-2 border-l border-[#E8E7E3]" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F7F6F3] transition-colors">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: '#059669' }}>
          {displayName[0]}
        </div>
        <span className="text-xs font-medium text-[#1A1A1A] max-w-[120px] truncate">{displayName.split(' ').slice(0,2).join(' ')}</span>
        <ChevronDown size={11} className={`text-[#AEACA8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-[#E8E7E3] rounded-xl shadow-notion-lg z-50 py-1 overflow-hidden">
          <p className="px-3 pt-2 pb-1 text-[9px] font-bold text-[#AEACA8] uppercase tracking-widest">Switch Company</p>
          {list.map(c => (
            <button key={c.guid || c.name} onClick={() => { selectCompany(c); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#ECFDF5] transition-colors text-left">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: '#059669' }}>
                {c.name?.[0]}
              </div>
              <span className="flex-1 text-[#1A1A1A] truncate text-xs font-medium">{c.name}</span>
              {current?.guid === c.guid && <Check size={13} style={{ color: '#059669' }} className="flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const navGroups = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    label: 'Transactions',
    items: [
      { label: 'Sales', icon: TrendingUp, path: '/sales' },
      { label: 'Purchase', icon: ShoppingCart, path: '/purchase' },
      { label: 'Inventory', icon: Package, path: '/inventory' },
      { label: 'Expenses', icon: Receipt, path: '/expenses' },
      { label: 'Payments & Receipts', icon: CreditCard, path: '/payments' },
    ],
  },
  {
    label: 'Financials',
    items: [
      { label: 'Cash & Bank', icon: Landmark, path: '/financials/cash-bank' },
      { label: 'Receivables & Payables', icon: ArrowLeftRight, path: '/financials/receivables-payables' },
      { label: 'Loans & ODs', icon: CreditCard, path: '/financials/loans-ods' },
      { label: 'Reports', icon: FileBarChart2, path: '/financials/reports' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'GST', icon: ShieldCheck, path: '/compliance/gst' },
      { label: 'E-Way Bill', icon: Truck, path: '/compliance/eway-bill' },
      { label: 'E-Invoice', icon: FileText, path: '/compliance/einvoice' },
      { label: 'Other Taxes', icon: Receipt, path: '/compliance/other-taxes' },
      { label: 'Audit Trail', icon: ClipboardList, path: '/compliance/audit-trail' },
    ],
  },
  {
    label: null,
    items: [
      { label: 'Ledgers', icon: BookOpen, path: '/ledgers' },
      { label: 'AI Insights', icon: Sparkles, path: '/ai-insights' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

const createMenu = [
  { label: 'Sales',       items: ['Create Invoice','Create Quotation','Sales Order','Delivery Note','Credit Note'] },
  { label: 'Purchase',    items: ['Purchase Invoice','Purchase Order','Debit Note'] },
  { label: 'Voucher',     items: ['Payment Voucher','Receipt Voucher','Contra Voucher','Journal Voucher'] },
  { label: 'Financials',  items: ['Record Payment','Record Receipt','Record Expense'] },
];

export default function AppShell() {
  const [collapsed, setCollapsed] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState('Sales');
  const [activeForm, setActiveForm] = useState(null);
  const createRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const h = (e) => { if (createRef.current && !createRef.current.contains(e.target)) setShowCreate(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleGroup = (label) => setCollapsed(p => ({ ...p, [label]: !p[label] }));

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path.split('/').filter(Boolean).map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(' / ');
  };

  return (
    <div className="flex h-screen bg-[#F7F6F3] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-14'} bg-[#FBFAF8] border-r border-[#E8E7E3] flex flex-col transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-[#E8E7E3]">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#059669' }}>T</div>
          {sidebarOpen && <span className="text-sm font-semibold text-[#1A1A1A] tracking-tight">TallyDekho</span>}
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F1F0EC] text-[#787774] text-xs cursor-pointer hover:bg-[#E8E7E3] transition-colors">
              <Search size={12} /><span>Search...</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-1">
              {group.label && sidebarOpen && (
                <button onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-semibold text-[#AEACA8] uppercase tracking-widest hover:text-[#787774] mt-2">
                  {group.label}
                  {collapsed[group.label] ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
              )}
              {!collapsed[group.label] && group.items.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${isActive
                      ? 'text-white font-medium shadow-sm'
                      : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F1F0EC]'}`
                  }
                  style={({ isActive }) => isActive ? { background: '#059669' } : {}}
                  title={!sidebarOpen ? item.label : undefined}>
                  <item.icon size={14} className="flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Company */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-[#E8E7E3]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#F1F0EC] cursor-pointer">
              <Building2 size={12} className="text-[#AEACA8] flex-shrink-0" />
              <span className="text-xs text-[#787774] truncate">{company.name.split(' ')[0]} Industries</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-12 bg-white border-b border-[#E8E7E3] flex items-center px-5 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(p => !p)} className="text-[#787774] hover:text-[#1A1A1A] transition-colors">
            <Menu size={16} />
          </button>

          {/* Universal Search */}
          <GlobalSearch />

          {/* Create+ button */}
          <div className="relative" ref={createRef}>
            <button onClick={() => setShowCreate(p => !p)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: '#059669' }}>
              <Plus size={13} /> Create
              <ChevronDown size={11} className={`transition-transform ${showCreate ? 'rotate-180' : ''}`} />
            </button>
            {showCreate && (
              <div className="absolute top-full right-0 mt-2 z-50 flex shadow-notion-lg rounded-xl border border-[#E8E7E3] bg-white overflow-hidden" style={{ minWidth: 360 }}>
                <div className="w-36 border-r border-[#E8E7E3] py-1 bg-[#FBFAF8]">
                  {createMenu.map(g => (
                    <button key={g.label} onMouseEnter={() => setHoveredGroup(g.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${hoveredGroup === g.label ? 'bg-white text-[#059669] font-semibold border-r-2 border-[#059669]' : 'text-[#787774] hover:text-[#1A1A1A]'}`}>
                      {g.label}<ChevronRight size={12} />
                    </button>
                  ))}
                </div>
                <div className="w-52 py-1">
                  <p className="px-4 py-2 text-[10px] font-bold text-[#AEACA8] uppercase tracking-widest">{hoveredGroup}</p>
                  {createMenu.find(g => g.label === hoveredGroup)?.items.map(item => (
                    <button key={item} onClick={() => { setActiveForm(item); setShowCreate(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F6F3] transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sync status */}
          <SyncStatus />

          {/* Period selector */}
          <select className="text-xs border border-[#E8E7E3] rounded-md px-2.5 py-1.5 text-[#787774] bg-white outline-none hover:border-[#059669] transition-colors">
            <option>July 2025</option><option>June 2025</option><option>May 2025</option>
          </select>

          {/* Company switcher — custom, no browser blue */}
          <CompanySwitcher />

          <button onClick={() => navigate('/notifications')} className="relative text-[#787774] hover:text-[#1A1A1A] transition-colors">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center font-bold" style={{ background: '#F43F5E' }}>3</span>
          </button>
          <UserMenu user={user} onLogout={() => { logout(); navigate('/auth/login'); }} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Create+ modal */}
      <CreateModal formKey={activeForm} onClose={() => setActiveForm(null)} />
      </div>
  );
}
