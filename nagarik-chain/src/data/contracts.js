import { generateHash } from '@utils/hashGenerator';

/**
 * Pre-loaded smart contract events spanning 6 months.
 * 15 events matching PRD §5.7.5 / Design Doc §7.8.
 */
export const mockContractEvents = [
  {
    id: 'evt-001',
    type: 'IDENTITY_CREATED',
    description: 'Nagarik ID IND-9481-0032-NC issued and anchored to the blockchain.',
    contractName: 'IdentityRegistry.sol',
    trigger: 'Manual: Registration completion',
    txHash: generateHash(64),
    blockNumber: 28418800,
    timestamp: '2025-12-25T09:14:32Z',
    isNew: false,
  },
  {
    id: 'evt-002',
    type: 'DOCUMENT_ANCHORED',
    description: '12th Board Certificate anchored. Hash verified and sealed.',
    contractName: 'DocumentVault.sol',
    trigger: 'Automatic: Document upload',
    txHash: generateHash(64),
    blockNumber: 28418901,
    timestamp: '2026-01-15T11:22:00Z',
    isNew: false,
  },
  {
    id: 'evt-003',
    type: 'BENEFIT_TRIGGERED',
    description: 'PM-KISAN Q1 payment trigger evaluated. Eligibility: TRUE.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Condition: Date = Jan 1, 2026',
    txHash: generateHash(64),
    blockNumber: 28418950,
    timestamp: '2026-01-01T00:01:15Z',
    isNew: false,
    solidityCode: `// PM-KISAN Disbursal Contract
contract BenefitDisbursal {
  mapping(address => uint256) public lastDisbursal;
  
  function triggerQuarterlyPayment(
    bytes32 citizenId,
    uint256 eligibilityBlock
  ) external onlyOracle {
    require(block.timestamp >= lastDisbursal[msg.sender] + 90 days);
    require(eligibilityContract.isEligible(citizenId));
    
    uint256 amount = 2000 * 1e18;
    treasury.transfer(citizenWallet[citizenId], amount);
    lastDisbursal[msg.sender] = block.timestamp;
    
    emit BenefitTransferred(citizenId, amount, block.number);
  }
}`,
  },
  {
    id: 'evt-004',
    type: 'BENEFIT_TRANSFERRED',
    description: '₹2,000 transferred to bank account ••••3829.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Automatic: Post-eligibility transfer',
    txHash: generateHash(64),
    blockNumber: 28418952,
    timestamp: '2026-01-01T00:02:30Z',
    isNew: false,
  },
  {
    id: 'evt-005',
    type: 'DOCUMENT_ANCHORED',
    description: 'Birth Certificate anchored. Hash verified and sealed.',
    contractName: 'DocumentVault.sol',
    trigger: 'Automatic: Document upload',
    txHash: generateHash(64),
    blockNumber: 28418856,
    timestamp: '2026-01-10T09:45:00Z',
    isNew: false,
  },
  {
    id: 'evt-006',
    type: 'VERIFICATION_COMPLETED',
    description: 'Aadhaar-Nagarik Chain biometric cross-match: 99.2% confidence.',
    contractName: 'BiometricVerifier.sol',
    trigger: 'Automatic: Periodic verification cycle',
    txHash: generateHash(64),
    blockNumber: 28418980,
    timestamp: '2026-03-15T16:00:00Z',
    isNew: false,
  },
  {
    id: 'evt-007',
    type: 'BENEFIT_TRIGGERED',
    description: 'National Scholarship eligibility evaluated: TRUE.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Condition: Board results published',
    txHash: generateHash(64),
    blockNumber: 28418990,
    timestamp: '2026-03-20T10:30:00Z',
    isNew: false,
  },
  {
    id: 'evt-008',
    type: 'BENEFIT_TRANSFERRED',
    description: '₹12,500 scholarship credited to citizen account.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Automatic: Post-eligibility transfer',
    txHash: generateHash(64),
    blockNumber: 28418992,
    timestamp: '2026-03-20T10:31:45Z',
    isNew: false,
  },
  {
    id: 'evt-009',
    type: 'FLAG_RAISED',
    description: 'Duplicate benefit claim attempt detected. Auto-suspended.',
    contractName: 'FraudDetection.sol',
    trigger: 'Automatic: FraudNet anomaly detection',
    txHash: generateHash(64),
    blockNumber: 28419000,
    timestamp: '2026-04-15T08:22:10Z',
    isNew: false,
  },
  {
    id: 'evt-010',
    type: 'FLAG_RESOLVED',
    description: 'Duplicate flag resolved by Officer Priya Sharma (GOV-4421).',
    contractName: 'FraudDetection.sol',
    trigger: 'Manual: Officer review',
    txHash: generateHash(64),
    blockNumber: 28419005,
    timestamp: '2026-04-16T14:10:00Z',
    isNew: false,
  },
  {
    id: 'evt-011',
    type: 'DOCUMENT_ANCHORED',
    description: 'Disability Certificate (40%) anchored. Hash verified.',
    contractName: 'DocumentVault.sol',
    trigger: 'Automatic: Document upload',
    txHash: generateHash(64),
    blockNumber: 28418955,
    timestamp: '2026-04-22T13:55:00Z',
    isNew: false,
  },
  {
    id: 'evt-012',
    type: 'VERIFICATION_COMPLETED',
    description: 'PAN-Nagarik cross-reference completed: 98.7% confidence.',
    contractName: 'BiometricVerifier.sol',
    trigger: 'Automatic: Cross-agency verification',
    txHash: generateHash(64),
    blockNumber: 28419015,
    timestamp: '2026-05-10T17:40:00Z',
    isNew: false,
  },
  {
    id: 'evt-013',
    type: 'BENEFIT_TRIGGERED',
    description: 'PM-KISAN Q2 payment trigger evaluated. Eligibility: TRUE.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Condition: Date = Apr 1, 2026',
    txHash: generateHash(64),
    blockNumber: 28419020,
    timestamp: '2026-04-01T00:01:00Z',
    isNew: false,
  },
  {
    id: 'evt-014',
    type: 'BENEFIT_TRANSFERRED',
    description: '₹2,000 transferred to bank account ••••3829.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Automatic: Post-eligibility transfer',
    txHash: generateHash(64),
    blockNumber: 28419022,
    timestamp: '2026-04-01T00:02:15Z',
    isNew: false,
  },
  {
    id: 'evt-015',
    type: 'VERIFICATION_COMPLETED',
    description: 'PM-KISAN Q3 eligibility pre-verified. All conditions met.',
    contractName: 'BenefitDisbursal.sol',
    trigger: 'Automatic: Pre-disbursal eligibility check',
    txHash: generateHash(64),
    blockNumber: 28419030,
    timestamp: '2026-06-15T09:00:00Z',
    isNew: false,
  },
];
