import { generateHash } from './hashGenerator';

const INDIAN_NAMES_MALE = [
  'Ravi Kumar', 'Arjun Singh', 'Mohammed Iqbal', 'Rajesh Patel',
  'Suresh Nair', 'Aditya Sharma', 'Vijay Reddy', 'Sanjay Gupta',
  'Rahul Verma', 'Amit Joshi', 'Deepak Mehta', 'Sachin Mishra',
  'Prakash Iyer', 'Vikram Chauhan', 'Manoj Tiwari',
];

const INDIAN_NAMES_FEMALE = [
  'Priya Sharma', 'Anita Devi', 'Sunita Rao', 'Kavita Patel',
  'Meena Kumari', 'Lakshmi Nair', 'Pooja Agarwal', 'Sneha Reddy',
  'Fatima Begum', 'Aarti Singh', 'Rekha Joshi', 'Seema Gupta',
  'Nandini Das', 'Geeta Mishra', 'Divya Menon',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh',
  'Puducherry', 'Andaman & Nicobar', 'Lakshadweep', 'Dadra & Nagar Haveli',
];

const GENDERS = ['Male', 'Female'];

/**
 * Generate mock Indian citizens for the admin registry
 * @param {number} count - Number of citizens to generate (default: 30)
 * @returns {Array<object>}
 */
export const generateMockCitizens = (count = 30) => {
  const citizens = [];

  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() > 0.5;
    const names = isFemale ? INDIAN_NAMES_FEMALE : INDIAN_NAMES_MALE;
    const name = names[Math.floor(Math.random() * names.length)];
    const gender = isFemale ? 'Female' : 'Male';

    // Status distribution: 80% Active, 15% Pending, 5% Suspended
    const statusRand = Math.random();
    let status;
    if (statusRand < 0.8) status = 'ACTIVE';
    else if (statusRand < 0.95) status = 'PENDING';
    else status = 'SUSPENDED';

    // Random registration date within last 2 years
    const now = Date.now();
    const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
    const registeredAt = new Date(
      twoYearsAgo + Math.random() * (now - twoYearsAgo)
    ).toISOString().split('T')[0];

    // Random AI Trust Score: 78–99.9
    const aiTrustScore = parseFloat(
      (78 + Math.random() * 21.9).toFixed(1)
    );

    const rand4 = () =>
      Math.floor(1000 + Math.random() * 9000).toString();

    const biometricOptions = ['enrolled', 'not-enrolled'];

    citizens.push({
      nagarikId: `IND-${rand4()}-${rand4()}-NC`,
      name,
      gender,
      dob: `${1970 + Math.floor(Math.random() * 40)}-${String(
        Math.floor(Math.random() * 12) + 1
      ).padStart(2, '0')}-${String(
        Math.floor(Math.random() * 28) + 1
      ).padStart(2, '0')}`,
      mobile: `+91 ${Math.floor(70000 + Math.random() * 29999)} ${Math.floor(
        10000 + Math.random() * 89999
      )}`,
      state: STATES[i % STATES.length],
      district: 'District ' + (Math.floor(Math.random() * 20) + 1),
      registeredAt,
      status,
      aiTrustScore,
      biometrics: {
        fingerprint:
          Math.random() > 0.1
            ? 'enrolled'
            : biometricOptions[1],
        face:
          Math.random() > 0.15
            ? 'enrolled'
            : biometricOptions[1],
        iris:
          Math.random() > 0.2
            ? 'enrolled'
            : biometricOptions[1],
      },
      blockHash: generateHash(64),
      documentsCount: Math.floor(Math.random() * 8) + 1,
      schemesCount: Math.floor(Math.random() * 5),
      lastVerified: new Date(
        now - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return citizens;
};
