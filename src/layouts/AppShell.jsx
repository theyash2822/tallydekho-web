import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Landmark, ArrowLeftRight, CreditCard, FileBarChart2,
  ShieldCheck, Truck, FileText, Receipt, BookOpen, ClipboardList,
  Sparkles, Settings, ChevronDown, ChevronRight, Menu, Bell, Building2,
  Search, Plus, User, Check, TrendingUp, ShoppingCart, Package, LogOut
} from 'lucide-react';
import CreateModal from '../components/CreateModal';
import { useAuth } from '../contexts/AuthContext';
import SyncStatus from '../components/SyncStatus';
import GlobalSearch from '../components/GlobalSearch';

// ─── User Menu ───────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const displayName = user?.name || user?.mobileNumber || 'Account';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="text-xs font-medium text-black max-w-[80px] truncate hidden sm:block">
          {displayName.split(' ')[0]}
        </span>
        <ChevronDown size={11} className="text-[#8C8C8C]" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-[#E0E0E0] rounded-xl shadow-md z-50 py-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F0F0F0]">
            <p className="text-sm font-semibold text-black truncate">{displayName}</p>
            <p className="text-xs text-[#8C8C8C] mt-0.5 truncate">{user?.mobileNumber || ''}</p>
          </div>
          <button className="w-full text-left px-4 py-2.5 text-sm text-[#4B4B4B] hover:bg-[#F5F5F5] transition-colors">Profile</button>
          <button className="w-full text-left px-4 py-2.5 text-sm text-[#4B4B4B] hover:bg-[#F5F5F5] transition-colors">Settings</button>
          <div className="border-t border-[#F0F0F0] mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Company Switcher ────────────────────────────────────────────────────────
function CompanySwitcher() {
  const [open, setOpen] = useState(false);
  const { companies, selectedCompany, selectCompany } = useAuth();
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const list = companies.length > 0 ? companies : [{ name: 'Demo Company', guid: 'demo' }];
  const current = selectedCompany || list[0];
  const displayName = current?.name || 'Select Company';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F5F5F5] border border-[#E0E0E0] transition-colors"
      >
        <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {displayName[0]}
        </div>
        <span className="text-xs font-medium text-black max-w-[120px] truncate">
          {displayName.split(' ').slice(0, 2).join(' ')}
        </span>
        <ChevronDown size={11} className={`text-[#8C8C8C] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-60 bg-white border border-[#E0E0E0] rounded-xl shadow-md z-50 py-1 overflow-hidden">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-[#8C8C8C] uppercase tracking-widest">Switch Company</p>
          {list.map(c => (
            <button
              key={c.guid || c.name}
              onClick={() => { selectCompany(c); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] transition-colors text-left"
            >
              <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {c.name?.[0]}
              </div>
              <span className="flex-1 text-sm text-black truncate font-medium">{c.name}</span>
              {current?.guid === c.guid && <Check size={13} className="text-[#059669] flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nav config ──────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    label: 'Transactions',
    items: [
      { label: 'Sales',               icon: TrendingUp,      path: '/sales' },
      { label: 'Purchase',            icon: ShoppingCart,    path: '/purchase' },
      { label: 'Inventory',           icon: Package,         path: '/inventory' },
      { label: 'Expenses',            icon: Receipt,         path: '/expenses' },
      { label: 'Payments & Receipts', icon: CreditCard,      path: '/payments' },
    ],
  },
  {
    label: 'Financials',
    items: [
      { label: 'Cash & Bank',             icon: Landmark,        path: '/financials/cash-bank' },
      { label: 'Receivables & Payables',  icon: ArrowLeftRight,  path: '/financials/receivables-payables' },
      { label: 'Loans & ODs',             icon: CreditCard,      path: '/financials/loans-ods' },
      { label: 'Reports',                 icon: FileBarChart2,   path: '/financials/reports' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'GST',         icon: ShieldCheck,   path: '/compliance/gst' },
      { label: 'E-Way Bill',  icon: Truck,         path: '/compliance/eway-bill' },
      { label: 'E-Invoice',   icon: FileText,      path: '/compliance/einvoice' },
      { label: 'Other Taxes', icon: Receipt,       path: '/compliance/other-taxes' },
      { label: 'Audit Trail', icon: ClipboardList, path: '/compliance/audit-trail' },
    ],
  },
  {
    label: null,
    items: [
      { label: 'Ledgers',      icon: BookOpen,  path: '/ledgers' },
      { label: 'AI Insights',  icon: Sparkles,  path: '/ai-insights' },
      { label: 'Notifications',icon: Bell,      path: '/notifications' },
      { label: 'Settings',     icon: Settings,  path: '/settings' },
    ],
  },
];

const createMenu = [
  { label: 'Sales',      items: ['Create Invoice','Create Quotation','Sales Order','Delivery Note','Credit Note'] },
  { label: 'Purchase',   items: ['Purchase Invoice','Purchase Order','Debit Note'] },
  { label: 'Voucher',    items: ['Payment Voucher','Receipt Voucher','Contra Voucher','Journal Voucher'] },
  { label: 'Financials', items: ['Record Payment','Record Receipt','Record Expense'] },
];

// ─── AppShell ─────────────────────────────────────────────────────────────────
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
    const h = e => { if (createRef.current && !createRef.current.contains(e.target)) setShowCreate(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleGroup = label => setCollapsed(p => ({ ...p, [label]: !p[label] }));

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path.split('/').filter(Boolean)
      .map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      .join(' / ');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-[#F9F9F9] border-r border-[#E0E0E0] flex flex-col transition-all duration-200 flex-shrink-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-13 py-3.5 border-b border-[#E0E0E0]">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold flex-shrink-0">T</div>
          {sidebarOpen && <span className="text-sm font-semibold text-black tracking-tight">TallyDekho</span>}
        </div>

        {/* Search pill */}
        {sidebarOpen && (
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E0E0E0] text-[#8C8C8C] text-xs cursor-pointer hover:border-[#B0B0B0] transition-colors">
              <Search size={12} />
              <span>Search...</span>
              <span className="ml-auto text-[10px] bg-[#EBEBEB] px-1.5 py-0.5 rounded font-medium">⌘K</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-1">
              {group.label && sidebarOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-widest hover:text-[#4B4B4B] mt-2 transition-colors"
                >
                  {group.label}
                  {collapsed[group.label] ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
              )}
              {!collapsed[group.label] && group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-black text-white font-medium'
                        : 'text-[#4B4B4B] hover:text-black hover:bg-[#EBEBEB]'
                    }`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon size={14} className="flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-[#E0E0E0]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#EBEBEB] cursor-pointer transition-colors">
              <Building2 size={12} className="text-[#8C8C8C] flex-shrink-0" />
              <span className="text-xs text-[#4B4B4B] truncate">Company</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-12 bg-white border-b border-[#E0E0E0] flex items-center px-5 gap-3 flex-shrink-0">

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="text-[#8C8C8C] hover:text-black transition-colors p-1 rounded-lg hover:bg-[#F5F5F5]"
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <span className="text-sm font-semibold text-black hidden md:block">{getBreadcrumb()}</span>

          <div className="flex-1" />

          {/* Universal Search */}
          <GlobalSearch />

          {/* Create+ */}
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setShowCreate(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-[#222] transition-colors"
            >
              <Plus size={13} /> Create
              <ChevronDown size={11} className={`transition-transform ${showCreate ? 'rotate-180' : ''}`} />
            </button>

            {showCreate && (
              <div className="absolute top-full right-0 mt-2 z-50 flex bg-white rounded-xl border border-[#E0E0E0] shadow-lg overflow-hidden" style={{ minWidth: 360 }}>
                {/* Left: groups */}
                <div className="w-36 border-r border-[#E0E0E0] py-1 bg-[#F9F9F9]">
                  {createMenu.map(g => (
                    <button
                      key={g.label}
                      onMouseEnter={() => setHoveredGroup(g.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        hoveredGroup === g.label
                          ? 'bg-white text-black font-semibold border-r-2 border-black'
                          : 'text-[#4B4B4B] hover:text-black'
                      }`}
                    >
                      {g.label}<ChevronRight size={12} />
                    </button>
                  ))}
                </div>
                {/* Right: items */}
                <div className="w-52 py-1">
                  <p className="px-4 py-2 text-[10px] font-bold text-[#8C8C8C] uppercase tracking-widest">{hoveredGroup}</p>
                  {createMenu.find(g => g.label === hoveredGroup)?.items.map(item => (
                    <button
                      key={item}
                      onClick={() => { setActiveForm(item); setShowCreate(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-[#F5F5F5] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sync status */}
          <SyncStatus />

          {/* Divider */}
          <div className="h-5 w-px bg-[#E0E0E0]" />

          {/* Company switcher */}
          <CompanySwitcher />

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-[#8C8C8C] hover:text-black transition-colors p-1 rounded-lg hover:bg-[#F5F5F5]"
          >
            <Bell size={16} />
            {(() => {
              try {
                const stored = localStorage.getItem('notifications');
                const items = stored ? JSON.parse(stored) : null;
                const count = Array.isArray(items) ? items.filter(n => !n.read).length : 0;
                return count > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white text-[9px] flex items-center justify-center font-bold">
                    {count > 9 ? '9+' : count}
                  </span>
                ) : null;
              } catch { return null; }
            })()}
          </button>

          {/* User */}
          <UserMenu user={user} onLogout={() => { logout(); navigate('/auth/login'); }} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="px-8 py-6 w-full max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Create modal */}
      <CreateModal formKey={activeForm} onClose={() => setActiveForm(null)} />
    </div>
  );
}
