module.exports = [
  {
    id: 'index',
    output: 'index.html',
    template: 'pages/index.hbs',
    data: 'src/data/pages/index.js',
    entry: 'src/entries/index.js'
  },
  {
    id: 'login',
    output: 'login.html',
    template: 'pages/login.hbs',
    data: 'src/data/pages/login.js',
    entry: 'src/entries/auth.js'
  },
  {
    id: 'create-account',
    output: 'create-account.html',
    template: 'pages/create-account.hbs',
    data: 'src/data/pages/create-account.js',
    entry: 'src/entries/auth.js'
  },
  {
    id: 'forgot-password',
    output: 'forgot-password.html',
    template: 'pages/forgot-password.hbs',
    data: 'src/data/pages/forgot-password.js',
    entry: 'src/entries/auth.js'
  },
  {
    id: 'account',
    output: 'account.html',
    template: 'pages/account.hbs',
    data: 'src/data/pages/account.js',
    entry: 'src/entries/account.js'
  },
  {
    id: 'privacy',
    output: 'privacy.html',
    template: 'pages/privacy.hbs',
    data: 'src/data/pages/privacy.js',
    entry: 'src/entries/legal.js'
  },
  {
    id: 'terms',
    output: 'terms.html',
    template: 'pages/terms.hbs',
    data: 'src/data/pages/terms.js',
    entry: 'src/entries/legal.js'
  }
];
