/**
 * Government schemes and disbursal data.
 * Matches PRD §5.6 exactly.
 */

export const mockSchemes = [
  {
    id: 'scheme-001',
    name: 'PM-KISAN',
    ministry: 'Ministry of Agriculture',
    amount: 2000,
    frequency: 'Quarterly',
    status: 'Active',
    benefitType: 'Monthly Cash',
    triggerType: 'Automatic',
    nextDisbursal: '2026-07-01',
    daysInCycle: 90,
    daysElapsed: 78,
    color: '#22c55e',
  },
  {
    id: 'scheme-002',
    name: 'National Scholarship Portal',
    ministry: 'Ministry of Education',
    amount: 12500,
    frequency: 'Annual',
    status: 'Active',
    benefitType: 'Scholarship',
    triggerType: 'Conditional',
    nextDisbursal: '2026-09-01',
    daysInCycle: 365,
    daysElapsed: 280,
    color: '#3b82f6',
  },
  {
    id: 'scheme-003',
    name: 'Ayushman Bharat Health Cover',
    ministry: 'Ministry of Health',
    amount: 500000,
    frequency: 'Annual',
    status: 'Active',
    benefitType: 'In-Kind',
    triggerType: 'Conditional',
    nextDisbursal: '2027-01-01',
    daysInCycle: 365,
    daysElapsed: 175,
    color: '#ef4444',
  },
  {
    id: 'scheme-004',
    name: 'Pradhan Mantri Ujjwala Yojana',
    ministry: 'Ministry of Petroleum',
    amount: 300,
    frequency: 'Monthly',
    status: 'Active',
    benefitType: 'Monthly Cash',
    triggerType: 'Automatic',
    nextDisbursal: '2026-07-01',
    daysInCycle: 30,
    daysElapsed: 25,
    color: '#f59e0b',
  },
  {
    id: 'scheme-005',
    name: 'PM Awas Yojana (Housing)',
    ministry: 'Ministry of Housing',
    amount: 120000,
    frequency: 'One-time grant',
    status: 'Ended',
    benefitType: 'Annual Grant',
    triggerType: 'Conditional',
    nextDisbursal: null,
    daysInCycle: 0,
    daysElapsed: 0,
    color: '#8b5cf6',
  },
];

/**
 * Monthly disbursal history for the bar chart (last 12 months).
 */
export const mockDisbursalHistory = [
  { month: "Jul '25", 'PM-KISAN': 2000, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Aug '25", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Sep '25", 'PM-KISAN': 0, 'Scholarship': 12500, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Oct '25", 'PM-KISAN': 2000, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Nov '25", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 120000 },
  { month: "Dec '25", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Jan '26", 'PM-KISAN': 2000, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Feb '26", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Mar '26", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Apr '26", 'PM-KISAN': 2000, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "May '26", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
  { month: "Jun '26", 'PM-KISAN': 0, 'Scholarship': 0, 'Ujjwala': 300, 'Housing': 0 },
];

/**
 * Upcoming disbursals sorted by date.
 */
export const mockUpcomingDisbursals = [
  { scheme: 'PM Ujjwala Yojana', amount: 300, date: '2026-07-01', auto: true },
  { scheme: 'PM-KISAN', amount: 2000, date: '2026-07-01', auto: true },
  { scheme: 'National Scholarship', amount: 12500, date: '2026-09-01', auto: false },
  { scheme: 'Ayushman Bharat', amount: 500000, date: '2027-01-01', auto: false },
];
