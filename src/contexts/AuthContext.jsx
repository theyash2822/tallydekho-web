import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import wsService from '../services/websocket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,     setToken]     = useState(() => localStorage.getItem('authToken'));
  const [user,      setUser]      = useState(() => { try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; } });
  const [companies, setCompanies] = useState(() => { try { return JSON.parse(localStorage.getItem('companies')) || []; } catch { return []; } });
  const [selectedCompany, setSelectedCompany] = useState(() => { try { return JSON.parse(localStorage.getItem('selectedCompany')); } catch { return null; } });
  const [isPaired,  setIsPaired]  = useState(() => localStorage.getItem('isPaired') === 'true');
  const [syncToast, setSyncToast] = useState(null); // { message, type }

  // ── Connect WebSocket when token is available ─────────────────────────────
  useEffect(() => {
    if (!token) return;
    wsService.connect(token);

    const unSynced   = wsService.on('synced',   (d) => showToast('✅ Tally data synced', 'success'));
    const unUnpaired = wsService.on('unpaired', (d) => { setIsPaired(false); localStorage.removeItem('isPaired'); showToast('⚠️ Tally unpaired', 'warning'); });
    const unLogout   = wsService.on('logout',   (d) => logout());

    return () => { unSynced(); unUnpaired(); unLogout(); wsService.disconnect(); };
  }, [token]);

  const showToast = (message, type = 'info') => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 4000);
  };

  // ── Load companies from real API ──────────────────────────────────────────
  const loadCompanies = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.fetchCompanies();
      const list = res?.data?.companies || res?.data || [];
      const arr = Array.isArray(list) ? list : [];
      localStorage.setItem('companies', JSON.stringify(arr));
      setCompanies(arr);
      // Auto-select first company if none selected
      if (arr.length > 0 && !selectedCompany) {
        localStorage.setItem('selectedCompany', JSON.stringify(arr[0]));
        setSelectedCompany(arr[0]);
      }
      return arr;
    } catch (err) {
      console.warn('fetchCompanies failed:', err.message);
      return [];
    }
  }, [token, selectedCompany]);

  // Load companies on mount
  useEffect(() => { if (token) loadCompanies(); }, [token]);

  const login = async (authToken, userData) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null); setUser(null); setCompanies([]); setSelectedCompany(null); setIsPaired(false);
    wsService.disconnect();
  };

  const selectCompany = (company) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    setSelectedCompany(company);
  };

  const markPaired = () => {
    localStorage.setItem('isPaired', 'true');
    setIsPaired(true);
  };

  return (
    <AuthContext.Provider value={{
      token, user, companies, selectedCompany, isPaired, syncToast,
      login, logout, selectCompany, loadCompanies, markPaired, showToast,
    }}>
      {children}
      {/* Global sync toast */}
      {syncToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-notion-lg text-sm font-medium text-white transition-all
          ${syncToast.type === 'success' ? 'bg-[#059669]' : syncToast.type === 'warning' ? 'bg-amber-500' : 'bg-[#1A1A1A]'}`}>
          {syncToast.message}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
