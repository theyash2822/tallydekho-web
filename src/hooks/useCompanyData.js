// Universal hook for fetching company-specific data from real API
// STRICT RULE: No mock/fallback data. Show empty state or error state only.
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useCompanyData(fetcher, deps = []) {
  const { token, selectedCompany } = useAuth();
  const companyGuid = selectedCompany?.guid;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token || !companyGuid) { setLoading(false); setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(companyGuid);
      const result = res?.data ?? res;
      // Empty is valid — null/[] is real data, not a fallback trigger
      setData(result ?? null);
    } catch (err) {
      console.error('[API] fetch failed:', err.message);
      setError(err.message || 'Failed to load data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token, companyGuid, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, companyGuid };
}
