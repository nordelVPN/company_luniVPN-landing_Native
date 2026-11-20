const { plans } = require('../plans');
const { profile, subscription } = require('../fixtures/account');

module.exports = {
  metadata: {
    lang: 'en',
    title: 'LuniVPN — a little more room to breathe',
    description: 'A VPN for online privacy and freedom — protect your connection, keep your activity private, and enjoy a more open internet.',
    pageId: 'index'
  },
  home: {
    title: 'A little more room to breathe.',
    kicker: 'Explore more. Connect freely.',
    description: 'A VPN for online privacy and freedom — protect your connection, keep your activity private, and enjoy a more open internet.',
    primaryCta: { label: 'Get Luni', href: '#plans' },
    secondaryCta: { label: 'Learn more', href: '#why-luni' },
    featuresTitle: 'A VPN for a more private, open internet.',
    featuresLead: 'LuniVPN helps you browse, work, and explore online with greater privacy, security, and freedom.',
    features: [
      {
        icon: 'leaf',
        title: 'Freedom to explore.',
        description: 'Access your favorite sites, apps, and content without unnecessary limits.'
      },
      {
        icon: 'shield',
        title: 'Privacy by design.',
        description: 'Keep your activity private with a VPN built around your privacy.'
      },
      {
        icon: 'bolt',
        title: 'Simple and seamless.',
        description: 'A clean, intuitive app that just works, across your devices.'
      }
    ]
  },
  theApp: {
    title: 'A little more ease, on every device.',
    kicker: 'The LuniVPN app for a simpler, more open online experience.',
    description: 'A clean, thoughtful app that helps you explore, stay private, and enjoy the internet — across all the devices you use.',
    primaryCta: { label: 'Get Luni', href: '#plans' },
    secondaryCta: { label: 'Explore the app', href: '#the-app-highlights' },
    highlights: [
      {
        icon: 'leaf',
        title: 'Ease, by design.',
        description: "A clean, intuitive app that's simple to set up and a pleasure to use every day."
      },
      {
        icon: 'pin',
        title: 'Locations that fit you.',
        description: 'A growing selection of countries so you can explore more of the internet, your way.'
      },
      {
        icon: 'devices',
        title: 'Across your devices.',
        description: 'One app that works beautifully across your phone, tablet, and computer.'
      }
    ]
  },
  whyLuni: {
    eyebrow: 'PRIVACY · FREEDOM · SIMPLICITY',
    title: 'A more open internet, on your terms.',
    description: 'LuniVPN gives you a more private, more flexible, and more effortless way to go online — so you can explore, connect, and enjoy the internet with greater freedom.',
    primaryCta: { label: 'Get Luni', href: '#plans' },
    secondaryCta: { label: 'Learn more', href: '#the-app' },
    luniWay: {
      eyebrow: 'THE LUNI WAY',
      title: 'A more thoughtful way to be online.',
      paragraphs: [
        'LuniVPN is designed around what matters most: your privacy, your freedom to explore, and a simple, seamless experience.',
        'And with its calm, intuitive design, it fits effortlessly into your everyday online life.'
      ]
    }
  },
  support: {
    eyebrow: 'SUPPORT',
    title: 'How can we help?',
    description: 'Find answers, get setup guidance, and learn how to make the most of LuniVPN.',
    searchLabel: 'Search for help articles',
    searchPlaceholder: 'Search for help articles',
    searchUnavailable: 'Help article search is not available yet.',
    categories: [
      {
        icon: 'play',
        title: 'Getting started',
        description: 'Set up LuniVPN and get familiar with the basics.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'wifi',
        title: 'Connection',
        description: 'Troubleshoot common issues and improve your experience.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'card',
        title: 'Account and billing',
        description: 'Manage your account, subscription, and payment details.',
        actionLabel: 'Explore articles',
        unavailableReason: 'Articles coming soon'
      },
      {
        icon: 'headset',
        title: 'Contact support',
        description: 'Reach our support team for further help.',
        actionLabel: 'Get in touch',
        unavailableReason: 'Support contact coming soon'
      }
    ]
  },
  plansSection: {
    title: 'Find your space online.',
    description: 'Simple, private, and more open internet access. Choose the plan that fits you.'
  },
  plans,
  checkout: {
    title: 'Checkout',
    description: 'Complete your subscription to LuniVPN.'
  },
  account: {
    title: 'Your account.',
    description: 'Manage your profile, subscription, and billing.',
    navItems: ['Account', 'Subscription', 'Billing', 'Settings'],
    billingActions: ['Payment methods', 'Billing history', 'Manage subscription'],
    profile,
    subscription
  }
};
