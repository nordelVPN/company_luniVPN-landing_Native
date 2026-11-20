const { plans } = require('../plans');
const { profile, subscription } = require('../fixtures/account');

module.exports = {
  metadata: {
    lang: 'en',
    title: 'Your account — LuniVPN',
    description: 'Manage your profile, subscription, plans, checkout, and help in your LuniVPN account.',
    pageId: 'account'
  },
  intro: {
    title: 'Your account.',
    description: 'Manage your profile, subscription, and billing.'
  },
  demoAuth: {
    title: 'Sign in',
    description: 'Access your LuniVPN account to manage your subscription, plans, and profile.',
    emailLabel: 'Email',
    submitLabel: 'Sign in'
  },
  tabs: [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'subscription', label: 'Subscription', icon: 'layers' },
    { id: 'plans', label: 'Plans', icon: 'leaf' },
    { id: 'checkout', label: 'Checkout', icon: 'card' },
    { id: 'help', label: 'Help', icon: 'help' }
  ],
  plans,
  profile,
  subscription,
  checkout: {},
  help: {
    searchLabel: 'Search for help articles',
    searchPlaceholder: 'Search for help articles',
    searchUnavailable: 'Help article search is not available yet.',
    categories: [
      {
        icon: 'play',
        title: 'Getting started',
        description: 'Set up LuniVPN and get familiar with the basics.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'wifi',
        title: 'Connection',
        description: 'Troubleshoot common issues and improve your experience.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'card',
        title: 'Account and billing',
        description: 'Manage your account, subscription, and payment details.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'headset',
        title: 'Contact support',
        description: 'Reach our support team for further help.',
        unavailableReason: 'Support contact coming soon'
      }
    ]
  }
};
