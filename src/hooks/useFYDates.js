/**
 * useFYDates — returns the selected Financial Year's start/end as ISO strings
 * for use as HTML date input min/max constraints.
 */
import { useAuth } from '../contexts/AuthContext';

export default function useFYDates() {
  const { selectedFY } = useAuth();
  return {
    fyMin: selectedFY?.startDate || null,
    fyMax: selectedFY?.endDate   || null,
    fyLabel: selectedFY?.name ? `FY ${selectedFY.name}` : null,
  };
}
