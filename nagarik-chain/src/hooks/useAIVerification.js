import { useMemo } from 'react';
import { mockAIVerificationLog, mockOverallAIStatus } from '@data/aiVerifications';

/**
 * Hook to access AI verification data.
 */
export function useAIVerification() {
  const verificationLog = useMemo(() => mockAIVerificationLog, []);
  const overallScore = useMemo(() => mockOverallAIStatus, []);

  return {
    verificationLog,
    overallScore,
  };
}
