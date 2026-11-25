const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const Handlebars = require('handlebars');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin, sources } = require('webpack');
const pages = require('./pages');
const { publicConfig } = require('../src/config/public');

const root = path.resolve(__dirname, '..');
const config = publicConfig();
const partialRoot = path.join(root, 'src/templates/partials');
const watchedDirectories = [
  'pages',
  'src/data',
  'src/templates',
  'src/assets/illustrations',
  'src/assets/brand',
  'src/assets/icons'
].map((dir) => path.join(root, dir));

const illustrationMap = {
  theAppDevicesWebp: 'src/assets/illustrations/the-app-devices.webp',
  theAppDevicesPng: 'src/assets/illustrations/the-app-devices.png',
  luniWayLeafWebp: 'src/assets/illustrations/luni-way-leaf.webp',
  luniWayLeafPng: 'src/assets/illustrations/luni-way-leaf.png',
  cardWaveWebp: 'src/assets/illustrations/card-wave.webp',
  cardWavePng: 'src/assets/illustrations/card-wave.png',
  luniMarkWebp: 'src/assets/brand/luni-mark.webp',
  luniMarkPng: 'src/assets/brand/luni-mark.png',
  iconLeafWebp: 'src/assets/icons/leaf.webp',
  iconLeafPng: 'src/assets/icons/leaf.png',
  iconShieldWebp: 'src/assets/icons/shield.webp',
  iconShieldPng: 'src/assets/icons/shield.png',
  iconBoltWebp: 'src/assets/icons/bolt.webp',
  iconBoltPng: 'src/assets/icons/bolt.png',
  iconPinWebp: 'src/assets/icons/pin.webp',
  iconPinPng: 'src/assets/icons/pin.png',
  iconDevicesWebp: 'src/assets/icons/devices.webp',
  iconDevicesPng: 'src/assets/icons/devices.png',
  iconPlayWebp: 'src/assets/icons/play.webp',
  iconPlayPng: 'src/assets/icons/play.png',
  iconWifiWebp: 'src/assets/icons/wifi.webp',
  iconWifiPng: 'src/assets/icons/wifi.png',
  iconCardWebp: 'src/assets/icons/card.webp',
  iconCardPng: 'src/assets/icons/card.png',
  iconHeadsetWebp: 'src/assets/icons/headset.webp',
  iconHeadsetPng: 'src/assets/icons/headset.png'
};

function resolveIllustrationAssets() {
  const urls = {};
  const files = [];
  for (const [key, relPath] of Object.entries(illustrationMap)) {
    const absPath = path.join(root, relPath);
    const buffer = fs.readFileSync(absPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 8);
    const parsed = path.parse(relPath);
    const outName = `assets/${parsed.name}.${hash}${parsed.ext}`;
    urls[key] = config.basePath + outName;
    files.push({ outName, buffer, absPath });
  }
  return { urls, files };
}

function partialFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const file = path.join(directory, item.name);
    return item.isDirectory() ? partialFiles(file) : item.name.endsWith('.hbs') ? [file] : [];
  });
}

function renderPage(page) {
  const handlebars = Handlebars.create();
  const names = new Set();
  handlebars.registerHelper('eq', (a, b) => a === b);
  for (const file of partialFiles(partialRoot)) {
    const name = path.relative(partialRoot, file).replace(/\\/g, '/').replace(/\.hbs$/, '');
    if (names.has(name)) throw new Error('Duplicate partial: ' + name);
    names.add(name);
    handlebars.registerPartial(name, fs.readFileSync(file, 'utf8'));
  }
  const dataFile = path.join(root, page.data);
  const siteFile = path.join(root, 'src/data/site.js');
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(path.join(root, 'src/data') + path.sep)) delete require.cache[key];
  }
  const pageData = require(dataFile);
  const site = require(siteFile);
  const metadata = pageData.metadata;
  for (const key of ['lang', 'title', 'description', 'pageId']) {
    if (typeof metadata?.[key] !== 'string' || !metadata[key].trim()) {
      throw new Error(page.id + ': invalid metadata.' + key);
    }
  }
  if (metadata.pageId !== page.id) throw new Error(page.id + ': pageId mismatch');
  const isDemoOnlyPage = page.id === 'account';
  const canonicalPath = page.output === 'index.html' ? config.basePath : config.basePath + page.output;
  const canonical = !isDemoOnlyPage && config.siteUrl ? new URL(canonicalPath, config.siteUrl).href : '';
  const robots = !isDemoOnlyPage && config.appEnv === 'production' && config.siteUrl ? 'index,follow' : 'noindex,nofollow';
  const { urls: assets } = resolveIllustrationAssets();
  const context = {
    ...pageData,
    metadata,
    site,
    assets,
    basePath: config.basePath,
    canonical,
    robots,
    wishlistUrl: config.wishlistTelegramUrl
  };
  const body = handlebars.compile(fs.readFileSync(path.join(root, page.template), 'utf8'))(context);
  return handlebars.compile(fs.readFileSync(path.join(root, 'src/templates/layouts/main.hbs'), 'utf8'))({
    ...context,
    body: new handlebars.SafeString(body)
  });
}

class WatchContentPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WatchContentPlugin', (compilation) => {
      watchedDirectories.forEach((directory) => compilation.contextDependencies.add(directory));
      compilation.fileDependencies.add(path.join(root, 'src/data/site.js'));
      compilation.fileDependencies.add(path.join(root, 'src/data/plans.js'));
      compilation.fileDependencies.add(path.join(root, 'src/data/fixtures/account.js'));
      compilation.fileDependencies.add(path.join(root, 'src/templates/layouts/main.hbs'));
      pages.forEach((page) => {
        compilation.fileDependencies.add(path.join(root, page.template));
        compilation.fileDependencies.add(path.join(root, page.data));
      });
      const { files } = resolveIllustrationAssets();
      files.forEach(({ absPath }) => compilation.fileDependencies.add(absPath));
      compilation.hooks.processAssets.tap(
        { name: 'EmitIllustrationsPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
        () => {
          for (const { outName, buffer } of files) {
            if (!compilation.getAsset(outName)) {
              compilation.emitAsset(outName, new sources.RawSource(buffer));
            }
          }
        }
      );
    });
  }
}

const ids = new Set();
const outputs = new Set();
const entry = {};
for (const page of pages) {
  for (const key of ['id', 'output', 'template', 'data', 'entry']) {
    if (typeof page[key] !== 'string' || !page[key]) throw new Error('Invalid page ' + key);
  }
  if (ids.has(page.id) || outputs.has(page.output)) throw new Error('Duplicate page id or output');
  ids.add(page.id);
  outputs.add(page.output);
  entry[page.id] = path.join(root, page.entry);
}

module.exports = {
  context: root,
  entry,
  output: {
    path: path.join(root, 'build/prod'),
    filename: 'assets/[name].[contenthash:8].js',
    publicPath: config.basePath,
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(?:svg|webp|png)$/i,
        type: 'asset/resource',
        generator: { filename: 'assets/[name].[contenthash:8][ext]' }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      __VPN_BUILD_CONFIG__: JSON.stringify({
        brandSlug: process.env.BRAND_SLUG || 'luni',
        mode: process.env.DATA_MODE || 'demo',
        dashboardApiUrl: process.env.PORTAL_API_URL || 'http://localhost:8080',
        adminServersApiUrl: process.env.SERVERS_API_URL || 'http://localhost:8082',
        serversCatalogUrl: process.env.SERVERS_CATALOG_URL || '/_api/servers'
      })
    }),
    new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' }),
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          filename: page.output,
          chunks: [page.id],
          inject: 'body',
          cache: false,
          templateContent: () => renderPage(page),
          minify: false
        })
    ),
    new WatchContentPlugin()
  ]
};
