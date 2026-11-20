const { plans } = require('../data/plans');

function normalizePlanId(value) {
  return plans.find((plan) => plan.planId === value)?.planId || null;
}

function formatPrice(priceMinor, currency = null) {
  if (priceMinor == null) return '—';
  const amount = priceMinor / 100;
  const isWhole = priceMinor % 100 === 0;
  if (currency) {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: isWhole && currency === 'EUR' ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  return isWhole ? String(amount) : amount.toFixed(2);
}

module.exports = { normalizePlanId, formatPrice };
