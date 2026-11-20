const { plans } = require('../data/plans');

function normalizePlanId(value) {
  return plans.find((plan) => plan.planId === value)?.planId || null;
}

function formatPrice(priceMinor, currency = null) {
  if (priceMinor == null) return '—';
  const amount = priceMinor / 100;
  if (currency) {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
  }
  return priceMinor % 100 === 0 ? String(amount) : amount.toFixed(2);
}

module.exports = { normalizePlanId, formatPrice };
