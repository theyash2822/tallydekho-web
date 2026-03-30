// Universal hook for fetching company-specific data from real API
// Falls back to mock data if API fails or no company selected
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export function useCompanyData(fetcher, deps = [], mockData = null) {
  const { token, selectedCompany } = useAuth();
  const companyGuid = selectedCompany?.guid;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(companyGuid);
      const result = res?.data ?? res;
      if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0)) {
        setData(result);
        setUsingMock(false);
      } else if (mockData) {
        setData(mockData);
        setUsingMock(true);
      }
    } catch (err) {
      console.warn('[API] Using mock data:', err.message);
      if (mockData) { setData(mockData); setUsingMock(true); }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, companyGuid, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, usingMock, reload: load, companyGuid };
}
