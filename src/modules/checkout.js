const { normalizePlanId, formatPrice } = require('../utils/plans');
const { createServices } = require('../services');
const { t } = require('./i18n');

const initialized = new WeakMap();
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSE_ANIMATION_MS = 280;

function initCheckout(root = document) {
  const backdrop = root.querySelector('[data-checkout-dialog]');
  if (!backdrop) return () => {};
  if (initialized.has(backdrop)) return initialized.get(backdrop);

  const panel = backdrop.querySelector('[data-checkout-panel]');
  const shell = root.querySelector('[data-page-shell]');
  const services = createServices();
  const plans = services.getPlans();
  const planTriggers = [...root.querySelectorAll('[data-select-plan], [data-wishlist-open]')];
  const planRadios = [...backdrop.querySelectorAll('input[name="checkout-plan"]')];
  const planCards = [...root.querySelectorAll('[data-plan-card]')];
  const selectedNodes = [...backdrop.querySelectorAll('[data-selected-plan]')];
  const subtitleNode = backdrop.querySelector('[data-selected-plan-subtitle]');
  const periodNode = backdrop.querySelector('[data-plan-period]');
  const totalNode = backdrop.querySelector('[data-plan-total]');
  const button = backdrop.querySelector('[data-checkout-button]');
  const message = backdrop.querySelector('[data-checkout-message]');
  const closeTriggers = [...backdrop.querySelectorAll('[data-checkout-close]')];

  let currentPlanId = null;
  let lastTrigger = null;
  let closeTimer = null;
  let lastMessageKey = null;

  const prefersReducedMotion = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getLocalizedPlan = (plan) => {
    const id = plan.planId;
    return {
      name: t(`plans.${id}.name`) || plan.displayName,
      subtitle: t(`plans.${id}.subtitle`) || plan.subtitle,
      duration: t(`plans.${id}.duration`) || plan.durationLabel
    };
  };

  const setOpenState = (open, { immediate = false } = {}) => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (open) {
      backdrop.hidden = false;
      document.body.classList.add('has-modal-open');
      if (shell) {
        shell.setAttribute('aria-hidden', 'true');
        shell.inert = true;
      }
      if (immediate || prefersReducedMotion()) {
        backdrop.classList.add('is-open');
      } else {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            backdrop.classList.add('is-open');
          });
        });
      }
      return;
    }

    backdrop.classList.remove('is-open');
    document.body.classList.remove('has-modal-open');
    if (shell) {
      shell.removeAttribute('aria-hidden');
      shell.inert = false;
    }
    if (immediate || prefersReducedMotion()) {
      backdrop.hidden = true;
    } else {
      closeTimer = window.setTimeout(() => {
        backdrop.hidden = true;
        closeTimer = null;
      }, CLOSE_ANIMATION_MS);
    }
  };

  const applyPlan = (rawPlanId, { preserveMessage = false } = {}) => {
    const id = normalizePlanId(rawPlanId);
    const plan = id ? plans.find((item) => item.planId === id) || null : null;
    currentPlanId = plan ? plan.planId : null;

    if (plan) {
      const loc = getLocalizedPlan(plan);
      selectedNodes.forEach((node) => {
        node.textContent = t('checkout.planTitle', { name: loc.name }) || `${loc.name} Plan`;
      });
      if (subtitleNode) {
        subtitleNode.textContent = t('checkout.planMeta', {
          subtitle: loc.subtitle,
          duration: loc.duration,
          devices: plan.deviceLimit
        }) || `${loc.subtitle} (${loc.duration} · up to ${plan.deviceLimit} devices)`;
      }
      if (periodNode) periodNode.textContent = `${loc.name} · ${loc.duration}`;
      if (totalNode) totalNode.textContent = formatPrice(plan.priceMinor, plan.currency);
    } else {
      selectedNodes.forEach((node) => {
        node.textContent = t('checkout.chooseFirst') || 'Choose a plan first';
      });
      if (subtitleNode) {
        subtitleNode.textContent = t('checkout.chooseHint') || 'Select Trial, Basic, Plus, or Complete in Plans.';
      }
      if (periodNode) periodNode.textContent = '—';
      if (totalNode) totalNode.textContent = '—';
    }

    if (button) button.disabled = !plan;
    if (!preserveMessage) {
      lastMessageKey = null;
      if (message) message.textContent = '';
    } else if (message && lastMessageKey) {
      message.textContent = t(lastMessageKey) || '';
    }

    planCards.forEach((card) => {
      card.classList.toggle('is-selected', card.getAttribute('data-plan-card') === currentPlanId);
    });
    planRadios.forEach((radio) => {
      radio.checked = radio.value === currentPlanId;
    });
    planTriggers.forEach((trigger) => {
      const selected = trigger.getAttribute('data-select-plan') === currentPlanId;
      trigger.setAttribute('aria-current', selected ? 'true' : 'false');
    });

    return Boolean(plan);
  };

  const openModal = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    setOpenState(true);
    const first = panel?.querySelector(FOCUSABLE) || panel;
    first?.focus?.();
  };

  const closeModal = ({ scrollToPlans = false } = {}) => {
    if (backdrop.hidden && !backdrop.classList.contains('is-open')) return;
    setOpenState(false);

    const nextUrl = new URL(window.location.href);
    if (nextUrl.searchParams.has('plan') || nextUrl.hash === '#checkout') {
      nextUrl.searchParams.delete('plan');
      nextUrl.hash = scrollToPlans ? 'plans' : '';
      window.history.replaceState({}, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
    }

    if (scrollToPlans) {
      root.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
  };

  const syncFromUrl = () => {
    const raw = new URLSearchParams(window.location.search).get('plan');
    const valid = applyPlan(raw);
    if (valid && (window.location.hash === '#checkout' || raw)) {
      setOpenState(true, { immediate: true });
    } else if (!backdrop.hidden) {
      setOpenState(false, { immediate: true });
    }
  };

  const onPlanSelect = (event) => {
    const trigger = event.currentTarget;
    const rawId = trigger.getAttribute('data-select-plan') || 'plus';
    const planId = normalizePlanId(rawId) || 'plus';
    event.preventDefault();
    applyPlan(planId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('plan', planId);
    nextUrl.hash = 'checkout';
    window.history.pushState({ planId }, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
    openModal(trigger);
  };

  const onRadioChange = (event) => {
    const radio = event.currentTarget;
    if (radio.checked) applyPlan(radio.value);
  };

  const onBackdropClick = (event) => {
    if (event.target === backdrop) closeModal();
  };

  const onKeydown = (event) => {
    if (backdrop.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab' || !panel) return;
    const focusables = [...panel.querySelectorAll(FOCUSABLE)];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onLanguageChange = () => applyPlan(currentPlanId, { preserveMessage: true });

  syncFromUrl();

  planTriggers.forEach((trigger) => trigger.addEventListener('click', onPlanSelect));
  closeTriggers.forEach((trigger) => trigger.addEventListener('click', closeModal));
  planRadios.forEach((radio) => radio.addEventListener('change', onRadioChange));
  backdrop.addEventListener('click', onBackdropClick);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('languagechange', onLanguageChange);
  window.addEventListener('popstate', syncFromUrl);

  const destroy = () => {
    planTriggers.forEach((trigger) => trigger.removeEventListener('click', onPlanSelect));
    closeTriggers.forEach((trigger) => trigger.removeEventListener('click', closeModal));
    planRadios.forEach((radio) => radio.removeEventListener('change', onRadioChange));
    backdrop.removeEventListener('click', onBackdropClick);
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('languagechange', onLanguageChange);
    window.removeEventListener('popstate', syncFromUrl);
    setOpenState(false, { immediate: true });
    initialized.delete(backdrop);
  };

  initialized.set(backdrop, destroy);
  return destroy;
}

module.exports = { initCheckout };
