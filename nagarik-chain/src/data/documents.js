import { generateHash } from '@utils/hashGenerator';

/**
 * Pre-loaded documents for the demo citizen's document vault.
 * Matches PRD §5.5.3 exactly.
 */
export const mockDocuments = [
  {
    id: 'doc-001',
    name: '12th Board Certificate',
    type: 'Education',
    issuedBy: 'CBSE, New Delhi',
    status: 'Verified',
    uploadDate: '2026-01-15',
    hash: generateHash(64),
    blockNumber: 28418901,
    aiConfidence: 97.3,
  },
  {
    id: 'doc-002',
    name: 'Birth Certificate',
    type: 'Identity',
    issuedBy: 'Municipal Corp., Jaipur',
    status: 'Verified',
    uploadDate: '2026-01-10',
    hash: generateHash(64),
    blockNumber: 28418856,
    aiConfidence: 98.1,
  },
  {
    id: 'doc-003',
    name: 'Land Title — Khasra No. 421',
    type: 'Property',
    issuedBy: 'Revenue Dept., Rajasthan',
    status: 'Pending',
    uploadDate: '2026-05-20',
    hash: generateHash(64),
    blockNumber: 28419010,
    aiConfidence: 83.7,
  },
  {
    id: 'doc-004',
    name: 'PM-KISAN Eligibility Certificate',
    type: 'Financial',
    issuedBy: 'Ministry of Agriculture',
    status: 'Verified',
    uploadDate: '2026-02-08',
    hash: generateHash(64),
    blockNumber: 28418920,
    aiConfidence: 98.8,
  },
  {
    id: 'doc-005',
    name: 'Disability Certificate (40%)',
    type: 'Health',
    issuedBy: 'AIIMS, Jodhpur',
    status: 'Verified',
    uploadDate: '2026-03-22',
    hash: generateHash(64),
    blockNumber: 28418955,
    aiConfidence: 96.5,
  },
  {
    id: 'doc-006',
    name: 'Class 10 Marksheet',
    type: 'Education',
    issuedBy: 'RBSE',
    status: 'Verified',
    uploadDate: '2026-01-12',
    hash: generateHash(64),
    blockNumber: 28418848,
    aiConfidence: 97.8,
  },
];

/**
 * Document type configurations with colors and icons.
 */
export const documentTypes = [
  { type: 'Identity', color: 'orange', bgClass: 'bg-orange-900/50', textClass: 'text-brand-saffron' },
  { type: 'Education', color: 'blue', bgClass: 'bg-blue-900/50', textClass: 'text-blue-400' },
  { type: 'Property', color: 'green', bgClass: 'bg-green-900/50', textClass: 'text-green-400' },
  { type: 'Health', color: 'red', bgClass: 'bg-red-900/50', textClass: 'text-red-400' },
  { type: 'Financial', color: 'purple', bgClass: 'bg-purple-900/50', textClass: 'text-purple-400' },
  { type: 'Other', color: 'gray', bgClass: 'bg-gray-800', textClass: 'text-gray-400' },
];
