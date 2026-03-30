import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Warehouse, Search, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../../components/KPICard';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import Drawer from '../../components/Drawer';
import { stockItems as mockItems, warehouses, stockMovements, stockKPIs } from '../../data/inventoryMock';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import wsService from '../../services/websocket';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
const TABS = ['Items List', 'Warehouses', 'Stock Movement', 'Stock Adjustments'];

const statusVariant = { Normal: 'green', 'Low Stock': 'yellow', 'Out of Stock': 'red', Overstocked: 'blue' };
const movementVariant = { Purchase: 'green', Sales: 'red', Transfer: 'blue', Adjustment: 'yellow' };

const itemCols = [
  { key: 'name', label: 'Item Name', render: v => <span className="font-medium text-[#1A1A1A]">{v}</span> },
  { key: 'sku', label: 'SKU', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
  { key: 'category', label: 'Category' },
  { key: 'qty', label: 'Qty', render: (v, r) => <span className="font-semibold">{v} {r.unit}</span> },
  { key: 'rate', label: 'Rate', render: v => fmt(v) },
  { key: 'value', label: 'Value', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'warehouse', label: 'Warehouse', render: v => <span className="text-xs text-[#787774]">{v}</span> },
  { key: 'status', label: 'Status', render: v => <Badge label={v} variant={statusVariant[v]} /> },
];

const warehouseCols = [
  { key: 'name', label: 'Warehouse', render: v => <span className="font-medium text-[#1A1A1A]">{v}</span> },
  { key: 'code', label: 'Code', render: v => <span className="font-mono text-xs text-[#787774]">{v}</span> },
  { key: 'address', label: 'Address', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'totalSKUs', label: 'SKUs', render: v => <span className="font-semibold">{v}</span> },
  { key: 'totalValue', label: 'Total Value', render: v => <span className="font-semibold">{fmt(v)}</span> },
  { key: 'supervisor', label: 'Supervisor' },
];

const movementCols = [
  { key: 'date', label: 'Date', render: v => <span className="text-[#787774]">{v}</span> },
  { key: 'item', label: 'Item' },
  { key: 'type', label: 'Type', render: v => <Badge label={v} variant={movementVariant[v]} /> },
  { key: 'qty', label: 'Qty', render: v => <span className={`font-bold ${v.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>{v}</span> },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'ref', label: 'Reference', render: v => <span className="font-mono text-xs text-[#059669]">{v}</span> },
  { key: 'balance', label: 'Balance', render: v => <span className="font-semibold">{v}</span> },
];

const warehouseValues = warehouses.map(w => ({ name: w.code, value: w.totalValue / 1000 }));

export default function InventoryModule() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [drawer, setDrawer] = useState(null);
  const [stockItems, setStockItems] = useState(mockItems);
  const [loading, setLoading] = useState(false);
  const { selectedCompany } = useAuth();

  const loadStocks = async () => {
    if (!selectedCompany?.guid) return;
    setLoading(true);
    try {
      const res = await api.fetchStocks({ companyGuid: selectedCompany.guid, page: 1, searchText: search });
      const list = res?.data?.stocks || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setStockItems(list.map(s => ({
          id: s.id,
          name: s.name || s.NAME || 'Unknown',
          sku: s.guid?.slice(-8) || '',
          category: s.category || s.group_name || 'General',
          qty: s.closing_qty || 0,
          unit: s.unit || 'Pcs',
          rate: s.closing_rate || 0,
          value: s.closing_value || 0,
          warehouse: 'Main',
          reorderLevel: s.reorder_level || 0,
          status: s.closing_qty === 0 ? 'Out of Stock' : s.closing_qty <= (s.reorder_level || 0) ? 'Low Stock' : 'Normal',
        })));
      } else {
        setStockItems([]);
      }
    } catch { /* use mock */ } finally { setLoading(false); }
  };

  useEffect(() => { loadStocks(); }, [selectedCompany]);

  // Auto-refresh when Tally syncs
  useEffect(() => {
    const unsub = wsService.on('synced', () => loadStocks());
    return unsub;
  }, [selectedCompany]);

  const categories = ['All', ...Array.from(new Set(stockItems.map(s => s.category || s.CATEGORY || 'Other')))];
  const filtered = stockItems.filter(s => {
    const name = s.name || s.NAME || '';
    const sku  = s.sku  || s.SKU  || '';
    const sr = !search || name.toLowerCase().includes(search.toLowerCase()) || sku.toLowerCase().includes(search.toLowerCase());
    const c  = categoryFilter === 'All' || (s.category || s.CATEGORY || 'Other') === categoryFilter;
    return sr && c;
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Inventory</h1>
          <p className="text-sm text-[#787774] mt-0.5">Stock management · July 2025</p>
        </div>
        <button onClick={loadStocks} className="flex items-center gap-1.5 text-xs text-[#059669] font-medium hover:text-[#047857]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard title="Total Items" value={stockKPIs.totalItems} icon={Package} accent="#059669" />
        <KPICard title="Total Value" value={fmt(stockKPIs.totalValue)} icon={Package} accent="#8B5CF6" />
        <KPICard title="Low / Out of Stock" value={`${stockKPIs.lowStock} / ${stockKPIs.outOfStock}`} icon={AlertTriangle} accent="#F43F5E" />
        <KPICard title="Warehouses" value={warehouses.length} icon={Warehouse} accent="#06B6D4" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Warehouse Value Distribution</p>
          <p className="text-xs text-[#787774] mb-4">₹K per warehouse</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={warehouseValues} barSize={32}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F0EC" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#787774' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#787774' }} axisLine={false} tickLine={false} unit="K" />
              <Tooltip formatter={v => ['₹' + v + 'K', 'Value']} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8E7E3' }} />
              <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E8E7E3] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Stock Alerts</p>
          <div className="space-y-2">
            {stockItems.filter(s => s.status !== 'Normal').map(s => (
              <div key={s.id} className={`px-3 py-2.5 rounded-xl text-xs font-medium border ${s.status === 'Out of Stock' ? 'bg-rose-50 border-rose-200 text-rose-700' : s.status === 'Low Stock' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                <p className="font-semibold">{s.name.split('–')[0]}</p>
                <p className="opacity-75 mt-0.5">{s.status} · {s.qty} {s.unit} remaining</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8E7E3] rounded-2xl">
        <div className="flex border-b border-[#E8E7E3] px-1 pt-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg mr-1 ${tab === i ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#787774] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]'}`}>{t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 0 && (
            <>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEACA8]" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item name or SKU..."
                    className="notion-input pl-8 w-full text-sm" />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="notion-input text-sm text-[#787774]">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Table columns={itemCols} data={filtered} onRowClick={setDrawer} />
            </>
          )}
          {tab === 1 && <Table columns={warehouseCols} data={warehouses} onRowClick={setDrawer} />}
          {tab === 2 && <Table columns={movementCols} data={stockMovements} onRowClick={setDrawer} />}
          {tab === 3 && (
            <div className="py-12 text-center text-[#787774]">
              <Package size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Stock Adjustments</p>
              <p className="text-xs mt-1 text-[#AEACA8]">Use Create+ → Stock Adjustment to record</p>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name || drawer?.ref || 'Details'}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{drawer.name || drawer.ref}</p>
                <p className="text-xs text-[#787774] mt-0.5">{drawer.sku || drawer.code}</p>
              </div>
              {drawer.status && <Badge label={drawer.status} variant={statusVariant[drawer.status]} />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(drawer).filter(([k]) => k !== 'id').map(([k, v]) => (
                <div key={k} className="p-3 bg-[#FBFAF8] rounded-xl border border-[#E8E7E3]">
                  <p className="text-xs text-[#787774] capitalize mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-medium text-[#1A1A1A] text-sm">{typeof v === 'number' ? (k === 'rate' || k === 'value' || k === 'totalValue' ? fmt(v) : v) : String(v)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#059669' }}>Stock Transfer</button>
              <button className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774] hover:bg-[#F7F6F3]">Adjust Stock</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
