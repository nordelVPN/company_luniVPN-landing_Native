import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = 'build/prod';
const forbidden = /^(?:\.env(?:\..*)?|\.git|node_modules|docs|fixtures)$/i;
const expectedHtml = ['account.html', 'create-account.html', 'forgot-password.html', 'index.html', 'login.html', 'privacy.html', 'terms.html'];
const landingSections = ['home', 'the-app', 'why-luni', 'support', 'plans'];
const accountPanels = ['account', 'subscription', 'plans', 'checkout', 'help'];
const expectedPlans = ['trial', 'basic', 'plus', 'complete'];

async function walk(dir, htmlFiles) {
  for (const name of await readdir(dir)) {
    const file = path.join(dir, name);
    const stat = await lstat(file);
    if (stat.isSymbolicLink() || forbidden.test(name) || /\.(?:map|pem|key)$/i.test(name)) {
      throw new Error('Unsafe production entry: ' + file);
    }
    if (stat.isDirectory()) {
      await walk(file, htmlFiles);
    } else if (!stat.isFile()) {
      throw new Error('Not a regular file: ' + file);
    } else if (/\.html$/i.test(name)) {
      htmlFiles.push(path.relative(root, file).replace(/\\/g, '/'));
    }
  }
}

async function checkCommonHtml(file, html, basePath) {
  if (!/<html[\s>]/i.test(html)) throw new Error('Invalid HTML: ' + file);
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length !== 1) throw new Error('Expected exactly one <h1> in ' + file + ', found ' + h1Matches.length);
  if (!/name=["']?description["']?/i.test(html) || !/name=["']?robots["']?/i.test(html)) {
    throw new Error('Missing metadata: ' + file);
  }
  if (!html.includes('data-wishlist-open') || !html.includes('data-wishlist-dialog')) {
    throw new Error('Missing wishlist UI markup in ' + file);
  }
  if (!html.includes(`${basePath}privacy.html`) || !html.includes(`${basePath}terms.html`)) {
    throw new Error('Missing footer legal links (privacy.html / terms.html) in ' + file);
  }
  if (!html.includes('luni-mark.')) {
    throw new Error('Missing updated brand logo asset in ' + file);
  }

  const references = [...html.matchAll(/(?:href|src|srcset)=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g)].map(
    (match) => match[1] || match[2] || match[3]
  );
  for (const url of references) {
    if (url === '#' || url.startsWith('javascript:')) throw new Error('Invalid link in ' + file + ': ' + url);
    if (url.startsWith('#') || url.startsWith('?')) continue;
    if (!url.startsWith(basePath)) continue;
    const relative = url.slice(basePath.length).split(/[?#]/)[0];
    if (!relative) continue;
    try {
      await lstat(path.join(root, relative));
    } catch {
      throw new Error('Missing local target: ' + url + ' in ' + file);
    }
  }
}

try {
  if (!(await lstat(root)).isDirectory() || (await lstat(root)).isSymbolicLink()) {
    throw new Error(root + ' must be a real directory');
  }
  const htmlFiles = [];
  await walk(root, htmlFiles);
  htmlFiles.sort();
  if (JSON.stringify(htmlFiles) !== JSON.stringify(expectedHtml)) {
    throw new Error('Expected ' + expectedHtml.join(', ') + ' in build/prod, found: ' + htmlFiles.join(', '));
  }

  const basePath = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

  const indexHtml = await readFile(path.join(root, 'index.html'), 'utf8');
  await checkCommonHtml('index.html', indexHtml, basePath);
  let lastIndex = -1;
  for (const id of landingSections) {
    const pattern = new RegExp(`<section[^>]*\\sid=["']?${id}(?:["'\\s>])`, 'i');
    const match = pattern.exec(indexHtml);
    if (!match) throw new Error('Missing required landing section #' + id);
    if (match.index <= lastIndex) throw new Error('Landing section out of order: #' + id);
    lastIndex = match.index;
  }
  if (!indexHtml.includes('data-checkout-dialog')) {
    throw new Error('Missing modal checkout dialog in index.html');
  }
  if (!indexHtml.includes('data-wave-canvas')) {
    throw new Error('Missing wave canvas markup in index.html');
  }
  for (const planId of expectedPlans) {
    if (!indexHtml.includes(`data-plan-card=${planId}`) && !indexHtml.includes(`data-plan-card="${planId}"`)) {
      throw new Error('Missing plan card in index.html: ' + planId);
    }
  }
  if (!indexHtml.includes(`${basePath}account.html`)) {
    throw new Error('Missing header link to account.html in index.html');
  }
  for (const assetToken of ['the-app-devices.', 'luni-way-leaf.', 'card-wave.']) {
    if (!indexHtml.includes(assetToken)) {
      throw new Error('Missing required raster illustration in index.html: ' + assetToken);
    }
  }

  const assetNames = await readdir(path.join(root, 'assets'));
  const indexCssName = assetNames.find((name) => /^index\.[a-f0-9]+\.css$/i.test(name));
  if (!indexCssName) throw new Error('Missing compiled index CSS bundle');
  const indexCss = await readFile(path.join(root, 'assets', indexCssName), 'utf8');
  if (!indexCss.includes('home-wave.')) {
    throw new Error('Missing home-wave fallback asset in index CSS');
  }
  if (indexCss.includes('section-wave.')) {
    throw new Error('Legacy static section-wave background should be removed from index CSS (task-014)');
  }

  const accountHtml = await readFile(path.join(root, 'account.html'), 'utf8');
  await checkCommonHtml('account.html', accountHtml, basePath);
  if (!/content=["']?noindex,nofollow["']?/i.test(accountHtml)) {
    throw new Error('account.html must use noindex,nofollow');
  }
  if (!accountHtml.includes('data-account-auth') || !accountHtml.includes('data-demo-signin')) {
    throw new Error('Missing demo sign-in in account.html');
  }
  if (!accountHtml.includes('data-wave-canvas')) {
    throw new Error('Missing wave canvas in account.html');
  }
  for (const panel of accountPanels) {
    if (!accountHtml.includes(`data-account-panel=${panel}`) && !accountHtml.includes(`data-account-panel="${panel}"`)) {
      throw new Error('Missing account portal panel: ' + panel);
    }
  }
  for (const planId of expectedPlans) {
    if (!accountHtml.includes(`data-plan-card=${planId}`) && !accountHtml.includes(`data-plan-card="${planId}"`)) {
      throw new Error('Missing plan card in account.html: ' + planId);
    }
  }

  for (const extraFile of ['login.html', 'create-account.html', 'forgot-password.html', 'privacy.html', 'terms.html']) {
    const html = await readFile(path.join(root, extraFile), 'utf8');
    await checkCommonHtml(extraFile, html, basePath);
  }

  console.log('Production artifact validated: 7 HTML pages (index, login, create-account, forgot-password, account, privacy, terms).');
} catch (error) {
  console.error('Build validation failed:', error.message);
  process.exitCode = 1;
}
