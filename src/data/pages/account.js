const { plans } = require('../plans');
const { profile, subscription } = require('../fixtures/account');

module.exports = {
  metadata: {
    lang: 'en',
    title: 'Your account (Demo) — LuniVPN',
    description: 'Demo LuniVPN account portal for managing subscription, plans, checkout, profile, and help.',
    pageId: 'account'
  },
  intro: {
    eyebrow: 'DEMO ACCOUNT PORTAL',
    title: 'Your account.',
    description: 'Manage your demo profile, subscription, plans, checkout preview, and help in one place.'
  },
  demoAuth: {
    title: 'Demo sign-in',
    description: 'Explore the LuniVPN account portal using a synthetic demo profile. No real authentication or personal data is sent.',
    emailLabel: 'Demo email',
    submitLabel: 'Sign in to demo account'
  },
  tabs: [
    { id: 'account', label: 'Account' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'plans', label: 'Plans' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'help', label: 'Help' }
  ],
  plans,
  profile,
  subscription,
  checkout: {
    cardNotice: 'Synthetic demo preview only. Do not enter real card numbers, expiration dates, or CVC codes.'
  },
  help: {
    searchLabel: 'Search for help articles',
    searchPlaceholder: 'Search for help articles',
    searchUnavailable: 'Help article search is not available yet.',
    categories: [
      {
        icon: '▷',
        title: 'Getting started',
        description: 'The basics for a smooth beginning.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '⌁',
        title: 'Connection',
        description: 'Help with your connection.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '▤',
        title: 'Account and billing',
        description: 'Questions about plans and account.',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '◉',
        title: 'Contact support',
        description: 'Get in touch when you need help.',
        unavailableReason: 'Support contact coming soon'
      }
    ]
  }
};
