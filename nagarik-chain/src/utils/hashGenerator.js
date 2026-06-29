/**
 * Blockchain hash and block generation utilities
 * All values are mock/simulated for demo purposes.
 */

/**
 * Generate a random hexadecimal hash string
 * @param {number} length - Number of hex characters (default: 64)
 * @returns {string} Hash string prefixed with 0x
 */
export const generateHash = (length = 64) =>
  '0x' +
  Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

/**
 * Generate a mock blockchain block
 * @returns {{ blockNumber: number, hash: string, txHash: string, timestamp: string, confirmed: boolean }}
 */
export const generateMockBlock = () => ({
  blockNumber: Math.floor(28419000 + Math.random() * 1000),
  hash: generateHash(64),
  txHash: generateHash(64),
  timestamp: new Date().toISOString(),
  confirmed: true,
});

/**
 * Generate blocks formatted for the hash ribbon display
 * @param {number} count - Number of blocks to generate
 * @returns {Array<{ number: string, hash: string, tx: string }>}
 */
export const generateRibbonBlocks = (count) =>
  Array.from({ length: count }, () => {
    const b = generateMockBlock();
    return {
      number: b.blockNumber.toLocaleString('en-IN'),
      hash: b.hash.slice(0, 6) + '...' + b.hash.slice(-4),
      tx: b.txHash.slice(0, 6) + '...' + b.txHash.slice(-4),
    };
  });

/**
 * Generate a mock contract event for the live feed
 * @returns {object} A contract event object
 */
export const generateMockContractEvent = () => {
  const types = [
    'IDENTITY_CREATED',
    'DOCUMENT_ANCHORED',
    'BENEFIT_TRIGGERED',
    'BENEFIT_TRANSFERRED',
    'VERIFICATION_COMPLETED',
    'FLAG_RAISED',
    'FLAG_RESOLVED',
  ];

  const descriptions = {
    IDENTITY_CREATED: 'New Nagarik ID issued and anchored to the blockchain.',
    DOCUMENT_ANCHORED: 'Document hash recorded on-chain. Integrity sealed.',
    BENEFIT_TRIGGERED: 'Smart contract eligibility check evaluated. Result: TRUE.',
    BENEFIT_TRANSFERRED: 'Benefit payment processed and transferred to citizen wallet.',
    VERIFICATION_COMPLETED: 'Biometric cross-verification completed successfully.',
    FLAG_RAISED: 'Anomaly detected by FraudNet. Auto-flagged for review.',
    FLAG_RESOLVED: 'Flag reviewed and resolved by authorized officer.',
  };

  const contracts = {
    IDENTITY_CREATED: 'IdentityRegistry.sol',
    DOCUMENT_ANCHORED: 'DocumentVault.sol',
    BENEFIT_TRIGGERED: 'BenefitDisbursal.sol',
    BENEFIT_TRANSFERRED: 'BenefitDisbursal.sol',
    VERIFICATION_COMPLETED: 'BiometricVerifier.sol',
    FLAG_RAISED: 'FraudDetection.sol',
    FLAG_RESOLVED: 'FraudDetection.sol',
  };

  const type = types[Math.floor(Math.random() * types.length)];
  const block = generateMockBlock();

  return {
    id: generateHash(16),
    type,
    description: descriptions[type],
    contractName: contracts[type],
    txHash: block.txHash,
    blockNumber: block.blockNumber,
    timestamp: new Date().toISOString(),
    isNew: true,
  };
};
