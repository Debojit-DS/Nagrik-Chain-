import { useMemo } from 'react';
import { mockSchemes, mockDisbursalHistory, mockUpcomingDisbursals } from '@data/benefits';

/**
 * Hook to access benefits and disbursal data.
 */
export function useBenefits() {
  const schemes = useMemo(() => mockSchemes, []);
  const disbursalHistory = useMemo(() => mockDisbursalHistory, []);
  const upcomingDisbursals = useMemo(() => mockUpcomingDisbursals, []);

  const totalReceived = useMemo(
    () => schemes.reduce((sum, s) => sum + (s.amountReceived || 0), 0),
    [schemes]
  );

  const activeSchemes = useMemo(
    () => schemes.filter((s) => s.status === 'Active').length,
    [schemes]
  );

  return {
    schemes,
    disbursalHistory,
    upcomingDisbursals,
    totalReceived,
    activeSchemes,
  };
}
