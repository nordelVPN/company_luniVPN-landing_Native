import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { normalizePlanId, formatPrice } = require('../../src/utils/plans');
const { publicConfig } = require('../../src/config/public');
const { createServices } = require('../../src/services');
const pages = require('../../webpack/pages');

// 1. Landing + Account + Legal pages manifest
assert.deepEqual(
  pages.map((page) => page.id),
  ['index', 'account', 'privacy', 'terms']
);
assert.deepEqual(
  pages.map((page) => page.output),
  ['index.html', 'account.html', 'privacy.html', 'terms.html']
);

// 2. Plan normalization & pricing (4 plans: trial, basic, plus, complete in EUR)
assert.equal(normalizePlanId('trial'), 'trial');
assert.equal(normalizePlanId('basic'), 'basic');
assert.equal(normalizePlanId('plus'), 'plus');
assert.equal(normalizePlanId('complete'), 'complete');
assert.equal(normalizePlanId('monthly'), null);
assert.equal(normalizePlanId('yearly'), null);
assert.equal(normalizePlanId('enterprise'), null);
assert.equal(normalizePlanId(''), null);
assert.equal(normalizePlanId(null), null);

assert.equal(formatPrice(null, null), '—');
assert.equal(formatPrice(null, 'EUR'), '—');
assert.equal(formatPrice(0, null), '0');
assert.equal(formatPrice(0, 'USD'), '$0.00');
assert.equal(formatPrice(50, 'EUR'), '€0.50');
assert.equal(formatPrice(700, 'EUR'), '€7');
assert.equal(formatPrice(2500, 'EUR'), '€25');
assert.equal(formatPrice(5500, 'EUR'), '€55');
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

// 4. Demo services & 4-plan catalog consistency
const services = createServices('demo');
const catalog = services.getPlans();
assert.deepEqual(
  catalog.map((plan) => ({
    planId: plan.planId,
    priceMinor: plan.priceMinor,
    currency: plan.currency,
    deviceLimit: plan.deviceLimit,
    available: plan.available,
    mode: plan.mode
  })),
  [
    { planId: 'trial', priceMinor: 50, currency: 'EUR', deviceLimit: 10, available: false, mode: 'demo' },
    { planId: 'basic', priceMinor: 700, currency: 'EUR', deviceLimit: 5, available: false, mode: 'demo' },
    { planId: 'plus', priceMinor: 2500, currency: 'EUR', deviceLimit: 5, available: false, mode: 'demo' },
    { planId: 'complete', priceMinor: 5500, currency: 'EUR', deviceLimit: 10, available: false, mode: 'demo' }
  ]
);
const checkoutRes = await services.createCheckout('complete');
assert.equal(checkoutRes.status, 'unavailable');

console.log('Frontend unit tests passed.');
