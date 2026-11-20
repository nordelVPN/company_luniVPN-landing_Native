const { normalizePlanId, formatPrice } = require('../utils/plans');
const { createServices } = require('../services');

const initialized = new WeakMap();

function initCheckout(root = document) {
  const host = root.querySelector('[data-checkout]');
  if (!host) return () => {};
  if (initialized.has(host)) return initialized.get(host);

  const services = createServices();
  const plans = services.getPlans();
  const planTriggers = [...root.querySelectorAll('[data-select-plan]')];
  const planCards = [...root.querySelectorAll('[data-plan-card]')];
  const selectedNodes = [...host.querySelectorAll('[data-selected-plan]')];
  const periodNode = host.querySelector('[data-plan-period]');
  const totalNode = host.querySelector('[data-plan-total]');
  const promptNode = host.querySelector('[data-plan-prompt]');
  const button = host.querySelector('[data-checkout-button]');
  const message = host.querySelector('[data-checkout-message]');

  let currentPlanId = null;

  const applyPlan = (rawPlanId) => {
    const id = normalizePlanId(rawPlanId);
    const plan = id ? plans.find((item) => item.planId === id) || null : null;
    currentPlanId = plan ? plan.planId : null;

    selectedNodes.forEach((node) => {
      node.textContent = plan ? plan.displayName : 'Choose a plan first';
    });
    if (periodNode) periodNode.textContent = plan ? (plan.durationLabel || plan.billingPeriod) : '—';
    if (totalNode) totalNode.textContent = plan ? formatPrice(plan.priceMinor, plan.currency) : '—';
    if (promptNode) promptNode.hidden = Boolean(plan);
    if (button) button.disabled = !plan;

    planCards.forEach((card) => {
      card.classList.toggle('is-selected', card.getAttribute('data-plan-card') === currentPlanId);
    });
    planTriggers.forEach((trigger) => {
      const selected = trigger.getAttribute('data-select-plan') === currentPlanId;
      trigger.setAttribute('aria-current', selected ? 'true' : 'false');
    });
  };

  const syncFromUrl = () => {
    const raw = new URLSearchParams(window.location.search).get('plan');
    applyPlan(raw);
  };

  const scrollToCheckout = () => {
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    host.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  };

  const onPlanSelect = (event) => {
    const trigger = event.currentTarget;
    const planId = normalizePlanId(trigger.getAttribute('data-select-plan'));
    if (!planId) return;
    event.preventDefault();
    applyPlan(planId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('plan', planId);
    nextUrl.hash = 'checkout';
    window.history.pushState({ planId }, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
    scrollToCheckout();
  };

  const onCheckoutClick = async () => {
    if (!currentPlanId) return;
    try {
      const result = await services.createCheckout(currentPlanId);
      if (message) message.textContent = result.message || 'Payment is unavailable in this demo.';
    } catch {
      if (message) message.textContent = 'Checkout is unavailable. Please try again later.';
    }
  };

  syncFromUrl();

  planTriggers.forEach((trigger) => trigger.addEventListener('click', onPlanSelect));
  button?.addEventListener('click', onCheckoutClick);
  window.addEventListener('popstate', syncFromUrl);

  const destroy = () => {
    planTriggers.forEach((trigger) => trigger.removeEventListener('click', onPlanSelect));
    button?.removeEventListener('click', onCheckoutClick);
    window.removeEventListener('popstate', syncFromUrl);
    initialized.delete(host);
  };

  initialized.set(host, destroy);
  return destroy;
}

module.exports = { initCheckout };
