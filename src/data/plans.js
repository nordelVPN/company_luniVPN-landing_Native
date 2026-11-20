const plans = [
  {
    planId: 'trial',
    displayName: 'Trial',
    durationLabel: '5 days',
    billingPeriod: '5 days',
    priceMinor: 50,
    priceDisplay: '0.50',
    currency: null,
    deviceLimit: 10,
    featured: false,
    features: ['All features included', 'Up to 10 devices'],
    available: false,
    mode: 'demo'
  },
  {
    planId: 'basic',
    displayName: 'Basic',
    durationLabel: '1 month',
    billingPeriod: '1 month',
    priceMinor: 700,
    priceDisplay: '7',
    currency: null,
    deviceLimit: 5,
    featured: false,
    features: ['3 servers', 'Up to 5 devices'],
    available: false,
    mode: 'demo'
  },
  {
    planId: 'plus',
    displayName: 'Plus',
    durationLabel: '6 months',
    billingPeriod: '6 months',
    priceMinor: 2500,
    priceDisplay: '25',
    currency: null,
    deviceLimit: 5,
    featured: false,
    features: ['All servers', 'Browser extension', 'Up to 5 devices'],
    available: false,
    mode: 'demo'
  },
  {
    planId: 'complete',
    displayName: 'Complete',
    durationLabel: '12 months',
    billingPeriod: '12 months',
    priceMinor: 5500,
    priceDisplay: '55',
    currency: null,
    deviceLimit: 10,
    featured: true,
    features: [
      'All servers',
      'Extended features',
      'Ad blocker',
      'Password manager',
      'Cloud storage',
      'Up to 10 devices'
    ],
    available: false,
    mode: 'demo'
  }
];

module.exports = { plans };
