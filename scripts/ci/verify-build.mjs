import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = 'build/prod';
const forbidden = /^(?:\.env(?:\..*)?|\.git|node_modules|docs|fixtures)$/i;
const expectedHtml = ['account.html', 'index.html'];
const landingSections = ['home', 'the-app', 'why-luni', 'support', 'plans', 'checkout'];
const accountPanels = ['account', 'subscription', 'plans', 'checkout', 'help'];

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
  if (!indexHtml.includes(`${basePath}account.html`)) {
    throw new Error('Missing header link to account.html in index.html');
  }
  if (!indexHtml.includes('the-app-devices.') || !indexHtml.includes('card-wave.')) {
    throw new Error('Missing updated raster illustration assets in index.html');
  }

  const assetNames = await readdir(path.join(root, 'assets'));
  const indexCssName = assetNames.find((name) => /^index\.[a-f0-9]+\.css$/i.test(name));
  if (!indexCssName) throw new Error('Missing compiled index CSS bundle');
  const indexCss = await readFile(path.join(root, 'assets', indexCssName), 'utf8');
  if (!indexCss.includes('home-wave.') || !indexCss.includes('section-wave.')) {
    throw new Error('Missing full-bleed background wave assets in index CSS');
  }

  const accountHtml = await readFile(path.join(root, 'account.html'), 'utf8');
  await checkCommonHtml('account.html', accountHtml, basePath);
  if (!/content=["']?noindex,nofollow["']?/i.test(accountHtml)) {
    throw new Error('account.html must use noindex,nofollow');
  }
  if (!accountHtml.includes('data-account-auth') || !accountHtml.includes('data-demo-signin')) {
    throw new Error('Missing demo sign-in in account.html');
  }
  for (const panel of accountPanels) {
    if (!accountHtml.includes(`data-account-panel=${panel}`) && !accountHtml.includes(`data-account-panel="${panel}"`)) {
      throw new Error('Missing account portal panel: ' + panel);
    }
  }

  console.log('Production artifact validated: index.html (6 landing sections + full-bleed wave backgrounds) + account.html (demo auth + 5 portal panels) and local resources.');
} catch (error) {
  console.error('Build validation failed:', error.message);
  process.exitCode = 1;
}
