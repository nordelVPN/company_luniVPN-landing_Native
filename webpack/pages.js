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
  }
];
