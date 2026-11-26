const plans = [
  {
    planId: 'trial',
    displayName: 'Trial',
    subtitle: 'Try full access before committing.',
    durationLabel: '5 days',
    billingPeriod: '5 days',
    priceMinor: 50,
    priceDisplay: '€0.50',
    currency: 'EUR',
    deviceLimit: 10,
    featured: false,
    features: ['All features included', 'Up to 10 devices'],
    featureItems: [
      { icon: 'leaf', text: 'All features included' },
      { icon: 'devices', text: 'Up to 10 devices' }
    ],
    available: false
  },
  {
    planId: 'basic',
    displayName: 'Basic',
    subtitle: 'Flexible and easy to get started.',
    durationLabel: '1 month',
    billingPeriod: '1 month',
    priceMinor: 700,
    priceDisplay: '€7',
    currency: 'EUR',
    deviceLimit: 5,
    featured: false,
    features: ['3 servers', 'Up to 5 devices'],
    featureItems: [
      { icon: 'globe', text: '3 servers' },
      { icon: 'devices', text: 'Up to 5 devices' }
    ],
    available: false
  },
  {
    planId: 'plus',
    displayName: 'Plus',
    subtitle: 'Broader access for everyday browsing.',
    durationLabel: '6 months',
    billingPeriod: '6 months',
    priceMinor: 2500,
    priceDisplay: '€25',
    currency: 'EUR',
    deviceLimit: 5,
    featured: false,
    features: ['All servers', 'Browser extension', 'Up to 5 devices'],
    featureItems: [
      { icon: 'globe', text: 'All servers' },
      { icon: 'layers', text: 'Browser extension' },
      { icon: 'devices', text: 'Up to 5 devices' }
    ],
    available: false
  },
  {
    planId: 'complete',
    displayName: 'Complete',
    subtitle: 'A more convenient, long-term option.',
    durationLabel: '12 months',
    billingPeriod: '12 months',
    priceMinor: 5500,
    priceDisplay: '€55',
    currency: 'EUR',
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
    featureItems: [
      { icon: 'globe', text: 'All servers' },
      { icon: 'layers', text: 'Extended features' },
      { icon: 'shield', text: 'Ad blocker' },
      { icon: 'lock', text: 'Password manager' },
      { icon: 'gift', text: 'Cloud storage' },
      { icon: 'devices', text: 'Up to 10 devices' }
    ],
    available: false
  }
];

module.exports = { plans };
