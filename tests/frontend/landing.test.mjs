import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { normalizePlanId, formatPrice } = require('../../src/utils/plans');
const { publicConfig } = require('../../src/config/public');
const { createServices } = require('../../src/services');
const pages = require('../../webpack/pages');

// 1. Landing + Account portal manifest
assert.deepEqual(
  pages.map((page) => page.id),
  ['index', 'account']
);
assert.deepEqual(
  pages.map((page) => page.output),
  ['index.html', 'account.html']
);

// 2. Plan normalization & pricing
assert.equal(normalizePlanId('monthly'), 'monthly');
assert.equal(normalizePlanId('yearly'), 'yearly');
assert.equal(normalizePlanId('enterprise'), null);
assert.equal(normalizePlanId(''), null);
assert.equal(normalizePlanId(null), null);

assert.equal(formatPrice(null, null), '—');
assert.equal(formatPrice(null, 'USD'), '—');
assert.equal(formatPrice(0, 'USD'), '$0.00');
assert.equal(formatPrice(999, 'USD'), '$9.99');

// 3. Public config validation
const defaultCfg = publicConfig({});
assert.equal(defaultCfg.mode, 'demo');
assert.equal(defaultCfg.basePath, '/');
assert.equal(defaultCfg.wishlistTelegramUrl, '');

const previewCfg = publicConfig({
  BASE_PATH: '/preview',
  PUBLIC_WISHLIST_TELEGRAM_URL: 'https://t.me/lunivpn_bot'
});
assert.equal(previewCfg.basePath, '/preview/');
assert.equal(previewCfg.wishlistTelegramUrl, 'https://t.me/lunivpn_bot');

assert.throws(() => publicConfig({ DATA_MODE: 'live' }), /Unsupported DATA_MODE/);
assert.throws(() => publicConfig({ PUBLIC_WISHLIST_TELEGRAM_URL: 'http://t.me/lunivpn_bot' }), /https:\/\/t\.me/);
assert.throws(() => publicConfig({ PUBLIC_WISHLIST_TELEGRAM_URL: 'https://example.com/bot' }), /https:\/\/t\.me/);

// 4. Demo services
const services = createServices('demo');
assert.equal(services.getPlans().length, 2);
const checkoutRes = await services.createCheckout('monthly');
assert.equal(checkoutRes.status, 'unavailable');

console.log('Frontend unit tests passed.');
