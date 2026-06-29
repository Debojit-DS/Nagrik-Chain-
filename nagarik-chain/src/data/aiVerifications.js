/**
 * AI Verification data — trust scores, verification log, and model info.
 * Matches PRD §5.8 / Design Doc §7.9.
 */

export const mockOverallAIStatus = {
  overallTrustScore: 97.3,
  subScores: {
    biometricMatch: 99.1,
    documentIntegrity: 96.8,
    behavioralConsistency: 95.9,
  },
  status: 'IDENTITY VERIFIED — No anomalies detected. All biometrics consistent.',
  lastVerified: '2026-06-25T09:14:32Z',
  modelInfo: {
    name: 'NagarikAI-Verify',
    version: 'NGC-V2.1-PROD',
    lastTrained: 'March 2026',
  },
};

/**
 * 12+ AI verification log entries with mixed outcomes.
 */
export const mockAIVerificationLog = [
  {
    id: 'ai-001',
    date: '2026-06-20T14:30:00Z',
    type: 'Biometric',
    input: 'Fingerprint + Face scan',
    model: 'NGC-BiometricNet-v3',
    confidence: 99.1,
    outcome: 'Approved',
    details: {
      inputReceived: 'Fingerprint scan (right index) + Face photograph',
      featuresExtracted: '142 fingerprint minutiae points, Face embedding: 512-dim vector',
      pipeline: [
        { step: 'Liveness check', duration: '0.12s', passed: true },
        { step: 'Database comparison', duration: '0.31s', passed: true },
        { step: 'Fraud pattern match', duration: '0.08s', passed: true },
        { step: 'Cross-modal verification', duration: '0.15s', passed: true },
      ],
    },
  },
  {
    id: 'ai-002',
    date: '2026-06-15T11:22:00Z',
    type: 'Document',
    input: '12th Board Certificate',
    model: 'NGC-DocVerify-v2',
    confidence: 97.3,
    outcome: 'Approved',
    details: {
      inputReceived: 'PDF document scan — 12th Board Certificate (CBSE)',
      featuresExtracted: 'OCR text extraction, watermark detection, seal verification',
      pipeline: [
        { step: 'Document format check', duration: '0.22s', passed: true },
        { step: 'OCR extraction', duration: '0.45s', passed: true },
        { step: 'Authority seal match', duration: '0.12s', passed: true },
        { step: 'Tamper detection', duration: '0.10s', passed: true },
      ],
    },
  },
  {
    id: 'ai-003',
    date: '2026-06-10T09:15:00Z',
    type: 'Fraud Check',
    input: 'Cross-scheme claim check',
    model: 'NGC-FraudNet-v1',
    confidence: 94.2,
    outcome: 'Approved',
    details: {
      inputReceived: 'Cross-reference check across 5 active schemes',
      featuresExtracted: 'Claim patterns, timing analysis, amount consistency',
      pipeline: [
        { step: 'Duplicate claim scan', duration: '0.05s', passed: true },
        { step: 'Amount pattern analysis', duration: '0.08s', passed: true },
        { step: 'Network heuristics', duration: '0.12s', passed: true },
      ],
    },
  },
  {
    id: 'ai-004',
    date: '2026-06-01T10:30:00Z',
    type: 'Eligibility',
    input: 'PM-KISAN land holding check',
    model: 'NGC-EligibilityEngine-v1',
    confidence: 98.8,
    outcome: 'Approved',
    details: {
      inputReceived: 'Land records from Revenue Department',
      featuresExtracted: 'Land area: 2.4 hectares, Crop pattern: Wheat/Mustard',
      pipeline: [
        { step: 'Land record verification', duration: '0.18s', passed: true },
        { step: 'Eligibility criteria match', duration: '0.04s', passed: true },
      ],
    },
  },
  {
    id: 'ai-005',
    date: '2026-05-25T16:45:00Z',
    type: 'Biometric',
    input: 'Iris scan',
    model: 'NGC-BiometricNet-v3',
    confidence: 99.6,
    outcome: 'Approved',
    details: {
      inputReceived: 'Iris scan (both eyes)',
      featuresExtracted: '256 iris feature points per eye',
      pipeline: [
        { step: 'Iris quality check', duration: '0.08s', passed: true },
        { step: 'Database match', duration: '0.23s', passed: true },
      ],
    },
  },
  {
    id: 'ai-006',
    date: '2026-05-15T13:00:00Z',
    type: 'Document',
    input: 'Birth Certificate',
    model: 'NGC-DocVerify-v2',
    confidence: 96.1,
    outcome: 'Approved',
    details: {
      inputReceived: 'Scanned birth certificate (Municipal Corporation)',
      featuresExtracted: 'OCR text, official stamp detection, date consistency',
      pipeline: [
        { step: 'Format verification', duration: '0.20s', passed: true },
        { step: 'OCR extraction', duration: '0.40s', passed: true },
        { step: 'Stamp authenticity', duration: '0.09s', passed: true },
      ],
    },
  },
  {
    id: 'ai-007',
    date: '2026-04-15T08:22:10Z',
    type: 'Fraud Check',
    input: 'Duplicate ID detection',
    model: 'NGC-FraudNet-v1',
    confidence: 71.3,
    outcome: 'Flagged',
    details: {
      inputReceived: 'Automated cross-check triggered by duplicate benefit claim',
      featuresExtracted: 'Matching biometric features found in 2 separate IDs',
      pipeline: [
        { step: 'ID cross-reference', duration: '0.15s', passed: true },
        { step: 'Biometric overlap check', duration: '0.22s', passed: false },
        { step: 'Flag generation', duration: '0.02s', passed: true },
      ],
      flagReason: 'Potential duplicate identity detected. Biometric overlap with IND-7721-4489-NC.',
    },
  },
  {
    id: 'ai-008',
    date: '2026-04-10T14:00:00Z',
    type: 'Eligibility',
    input: 'Scholarship income criteria',
    model: 'NGC-EligibilityEngine-v1',
    confidence: 93.4,
    outcome: 'Approved',
    details: {
      inputReceived: 'Income certificate from SDM office',
      featuresExtracted: 'Annual income: ₹2,40,000, Category: OBC',
      pipeline: [
        { step: 'Income verification', duration: '0.12s', passed: true },
        { step: 'Category eligibility', duration: '0.10s', passed: true },
      ],
    },
  },
  {
    id: 'ai-009',
    date: '2026-05-20T11:30:00Z',
    type: 'Document',
    input: 'Land Title — Khasra No. 421',
    model: 'NGC-DocVerify-v2',
    confidence: 83.7,
    outcome: 'Referred to Officer',
    details: {
      inputReceived: 'Land title document for Khasra No. 421',
      featuresExtracted: 'OCR text, mutation records, boundary details',
      pipeline: [
        { step: 'Document format check', duration: '0.25s', passed: true },
        { step: 'OCR extraction', duration: '0.55s', passed: true },
        { step: 'Mutation record match', duration: '0.30s', passed: false },
      ],
      flagReason: 'Mutation records could not be fully verified. Manual review required.',
    },
  },
  {
    id: 'ai-010',
    date: '2026-06-18T10:00:00Z',
    type: 'Biometric',
    input: 'Face recognition update',
    model: 'NGC-BiometricNet-v3',
    confidence: 98.9,
    outcome: 'Approved',
    details: {
      inputReceived: 'Updated face photograph for periodic re-verification',
      featuresExtracted: '512-dim face embedding, age progression check',
      pipeline: [
        { step: 'Face quality assessment', duration: '0.10s', passed: true },
        { step: 'Age progression match', duration: '0.18s', passed: true },
        { step: 'Liveness detection', duration: '0.08s', passed: true },
      ],
    },
  },
  {
    id: 'ai-011',
    date: '2026-03-01T09:30:00Z',
    type: 'Eligibility',
    input: 'Ayushman Bharat eligibility',
    model: 'NGC-EligibilityEngine-v1',
    confidence: 97.2,
    outcome: 'Approved',
    details: {
      inputReceived: 'SECC data cross-reference for health coverage eligibility',
      featuresExtracted: 'Household income, family size, existing coverage',
      pipeline: [
        { step: 'SECC data match', duration: '0.14s', passed: true },
        { step: 'Coverage eligibility', duration: '0.08s', passed: true },
      ],
    },
  },
  {
    id: 'ai-012',
    date: '2026-05-05T15:20:00Z',
    type: 'Fraud Check',
    input: 'Address verification',
    model: 'NGC-FraudNet-v1',
    confidence: 96.5,
    outcome: 'Approved',
    details: {
      inputReceived: 'Address cross-check with postal and electoral records',
      featuresExtracted: 'Pin code match, electoral roll presence, utility bill address',
      pipeline: [
        { step: 'Postal record match', duration: '0.06s', passed: true },
        { step: 'Electoral roll check', duration: '0.09s', passed: true },
        { step: 'Utility bill verification', duration: '0.07s', passed: true },
      ],
    },
  },
];
