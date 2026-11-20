const { plans } = require('../plans');
const { profile, subscription } = require('../fixtures/account');

module.exports = {
  metadata: {
    lang: 'en',
    title: 'LuniVPN — a little more room to breathe',
    description: 'Explore more and connect freely with LuniVPN across your devices.',
    pageId: 'index'
  },
  home: {
    title: 'A little more room to breathe.',
    kicker: 'Explore more. Connect freely.',
    description: 'Enjoy a simpler way to protect your connection and keep your online world your own.',
    primaryCta: { label: 'Discover Luni', href: '#plans' },
    secondaryCta: { label: 'See how it works', href: '#the-app' },
    features: [
      {
        icon: '✦',
        title: 'Freedom to explore.',
        description: 'Make room for more of the content you love.'
      },
      {
        icon: '◈',
        title: 'Privacy by design.',
        description: 'A more private connection, made simple.'
      },
      {
        icon: 'ϟ',
        title: 'Simple and seamless.',
        description: 'Feel at home across your devices.'
      }
    ]
  },
  theApp: {
    eyebrow: 'THE APP',
    title: 'A little more ease, on every device.',
    kicker: 'Simple by design.',
    description: 'Stay connected to the things you love with an experience that feels effortless.',
    primaryCta: { label: 'Get Luni', href: '#plans' },
    secondaryCta: { label: 'Explore the app', href: '#the-app-highlights' },
    highlights: [
      {
        icon: '✦',
        title: 'Ease, by design.',
        description: 'A clear, calm experience from the first tap.'
      },
      {
        icon: '◎',
        title: 'Locations that fit you.',
        description: 'Choose the location that works for you.'
      },
      {
        icon: '▣',
        title: 'Across your devices.',
        description: 'A familiar feel wherever you connect.'
      }
    ]
  },
  whyLuni: {
    eyebrow: 'WHY LUNI',
    title: 'Calm protection, built around your day.',
    description: 'LuniVPN removes the clutter so privacy feels natural rather than technical.',
    cta: { label: 'See plans', href: '#plans' },
    pillars: [
      {
        icon: '◈',
        title: 'Quiet privacy first.',
        description: 'Designed to keep your connection private without noisy pop-ups or complex toggles.'
      },
      {
        icon: '✦',
        title: 'Thoughtful simplicity.',
        description: 'Clear controls and readable states across desktop, tablet, and phone.'
      },
      {
        icon: '◎',
        title: 'Consistent everywhere.',
        description: 'One familiar interface whether you are at home, working remotely, or traveling.'
      }
    ]
  },
  support: {
    eyebrow: 'SUPPORT',
    title: 'How can we help?',
    description: 'Find your way with LuniVPN support.',
    searchLabel: 'Search for help articles',
    searchPlaceholder: 'Search for help articles',
    searchUnavailable: 'Help article search is not available yet.',
    categories: [
      {
        icon: '▷',
        title: 'Getting started',
        description: 'The basics for a smooth beginning.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '⌁',
        title: 'Connection',
        description: 'Help with your connection.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '▤',
        title: 'Account and billing',
        description: 'Questions about plans and account.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: '◉',
        title: 'Contact support',
        description: 'Get in touch when you need help.',
        actionLabel: 'Get in touch',
        unavailableReason: 'Support contact coming soon'
      }
    ]
  },
  plansSection: {
    eyebrow: 'PLANS',
    title: 'Find your space online.',
    description: 'Choose Trial, Basic, Plus, or Complete. Currency and real purchases will be confirmed before launch.'
  },
  plans,
  checkout: {
    eyebrow: 'DEMO CHECKOUT',
    title: 'Checkout',
    description: 'Complete your subscription to LuniVPN.',
    cardNotice: 'Synthetic demo preview only. Do not enter real card numbers, expiration dates, or CVC codes.'
  },
  account: {
    eyebrow: 'DEMO ACCOUNT',
    title: 'Your account.',
    description: 'Preview your profile and subscription in one place.',
    navItems: ['Account', 'Subscription', 'Billing', 'Settings'],
    billingActions: ['Payment methods', 'Billing history', 'Manage subscription'],
    profile,
    subscription
  }
};
