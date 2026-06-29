/**
 * Demo citizen data — the primary test user for the Citizen Portal.
 */
export const demoCitizen = {
  nagarikId: 'IND-9481-0032-NC',
  name: 'Ravi Kumar',
  dob: '1988-03-14',
  gender: 'Male',
  mobile: '+91 98765 43210',
  email: 'ravikumar88@gmail.com',
  state: 'Rajasthan',
  district: 'Jaipur',
  pinCode: '302001',
  address: '42, Pratap Nagar, Jaipur',
  blockNumber: '28419033',
  blockHash:
    '0x3f8a9c2d4e1b7f6ab5c8d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9e8d7c6b5a4c291',
  txHash:
    '0x9f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d8901',
  issuedAt: '2026-06-25',
  status: 'ACTIVE',
  biometrics: {
    fingerprint: {
      status: 'enrolled',
      lastVerified: '2026-06-20T14:30:00Z',
    },
    face: {
      status: 'enrolled',
      lastVerified: '2026-06-20T14:31:00Z',
    },
    iris: {
      status: 'enrolled',
      lastVerified: '2026-06-20T14:32:00Z',
    },
  },
  aiTrustScore: 97.3,
  linkedServices: {
    aadhaar: true,
    pan: true,
    epic: true,
    passport: false,
    drivingLicence: false,
  },
};
