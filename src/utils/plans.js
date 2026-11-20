const { plans } = require('../data/plans');
function normalizePlanId(value) { return plans.find((plan) => plan.planId === value)?.planId || null; }
function formatPrice(priceMinor, currency) { if (priceMinor == null || !currency) return '—'; return new Intl.NumberFormat('en', { style: 'currency', currency }).format(priceMinor / 100); }
module.exports = { normalizePlanId, formatPrice };
