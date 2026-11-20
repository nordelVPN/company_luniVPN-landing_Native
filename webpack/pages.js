module.exports = [
  {
    id: 'index',
    output: 'index.html',
    template: 'pages/index.hbs',
    data: 'src/data/pages/index.js',
    entry: 'src/entries/index.js'
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
