const { normalizePlanId, formatPrice } = require('../utils/plans');
const { createServices } = require('../services');

const SESSION_KEY = 'lunivpn_demo_signed_in';
const VALID_TABS = new Set(['account', 'subscription', 'plans', 'checkout', 'help']);
const initialized = new WeakMap();

function readDemoSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDemoSession(value) {
  try {
    if (value) window.sessionStorage.setItem(SESSION_KEY, '1');
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage restriction in private/restricted browsers
  }
}

function initAccountPortal(root = document) {
  const app = root.querySelector('[data-account-app]');
  if (!app) return () => {};
  if (initialized.has(app)) return initialized.get(app);

  const services = createServices();
  const plans = services.getPlans();

  const authCard = app.querySelector('[data-account-auth]');
  const signInForm = app.querySelector('[data-demo-signin-form]');
  const signOutBtn = app.querySelector('[data-demo-signout]');
  const sessionBar = app.querySelector('[data-account-session-bar]');
  const sessionUser = app.querySelector('[data-session-user]');
  const portal = app.querySelector('[data-account-portal]');

  const tabs = [...app.querySelectorAll('[data-account-tab]')];
  const panels = [...app.querySelectorAll('[data-account-panel]')];
  const gotoButtons = [...app.querySelectorAll('[data-goto-tab]')];

  const profileForm = app.querySelector('[data-profile-form]');
  const profileNameNode = app.querySelector('[data-profile-name]');
  const profileEmailNode = app.querySelector('[data-profile-email]');
  const profileStatus = app.querySelector('[data-profile-status]');

  const subPlanNode = app.querySelector('[data-sub-plan]');
  const subPeriodNode = app.querySelector('[data-sub-period]');
  const subStatusNode = app.querySelector('[data-sub-status]');
  const subRenewalNode = app.querySelector('[data-sub-renewal]');
  const subTogglePauseBtn = app.querySelector('[data-sub-toggle-pause]');
  const subCancelBtn = app.querySelector('[data-sub-cancel]');
  const subMessage = app.querySelector('[data-sub-message]');

  const planSelectButtons = [...app.querySelectorAll('[data-account-select-plan]')];
  const planCards = [...app.querySelectorAll('[data-plan-card]')];

  const checkoutHost = app.querySelector('[data-checkout]');
  const selectedNodes = checkoutHost ? [...checkoutHost.querySelectorAll('[data-selected-plan]')] : [];
  const periodNode = checkoutHost?.querySelector('[data-plan-period]');
  const totalNode = checkoutHost?.querySelector('[data-plan-total]');
  const promptNode = checkoutHost?.querySelector('[data-plan-prompt]');
  const checkoutBtn = checkoutHost?.querySelector('[data-checkout-button]');
  const applyDemoPlanBtn = checkoutHost?.querySelector('[data-apply-demo-plan]');
  const checkoutMessage = checkoutHost?.querySelector('[data-checkout-message]');

  const state = {
    signedIn: readDemoSession(),
    activeTab: 'account',
    activePlanId: 'basic',
    selectedCheckoutPlanId: normalizePlanId(new URLSearchParams(window.location.search).get('plan')),
    subscriptionStatus: 'Active (Demo)'
  };

  const findPlan = (planId) => plans.find((item) => item.planId === planId) || null;

  const renderAuth = () => {
    if (authCard) authCard.hidden = state.signedIn;
    if (portal) portal.hidden = !state.signedIn;
    if (sessionBar) sessionBar.hidden = !state.signedIn;
  };

  const renderTabs = () => {
    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-account-tab') === state.activeTab;
      tab.setAttribute('aria-selected', String(active));
      tab.classList.toggle('is-active', active);
    });
    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute('data-account-panel') !== state.activeTab;
    });
  };

  const renderSubscription = () => {
    const activePlan = findPlan(state.activePlanId);
    if (subPlanNode) subPlanNode.textContent = activePlan ? activePlan.displayName : 'None';
    if (subPeriodNode) subPeriodNode.textContent = activePlan ? (activePlan.durationLabel || activePlan.billingPeriod) : '—';
    if (subStatusNode) subStatusNode.textContent = state.subscriptionStatus;
    if (subRenewalNode) subRenewalNode.textContent = state.subscriptionStatus === 'Active (Demo)' ? 'Demo preview (no billing)' : '—';
    if (subTogglePauseBtn) {
      subTogglePauseBtn.textContent = state.subscriptionStatus === 'Paused (Demo)' ? 'Resume (demo)' : 'Pause (demo)';
    }
    if (subCancelBtn) {
      subCancelBtn.textContent = state.subscriptionStatus === 'Canceled (Demo)' ? 'Reactivate (demo)' : 'Cancel (demo)';
    }
  };

  const renderCheckout = () => {
    const plan = state.selectedCheckoutPlanId ? findPlan(state.selectedCheckoutPlanId) : null;
    selectedNodes.forEach((node) => {
      node.textContent = plan ? plan.displayName : 'Choose a plan first';
    });
    if (periodNode) periodNode.textContent = plan ? (plan.durationLabel || plan.billingPeriod) : '—';
    if (totalNode) totalNode.textContent = plan ? formatPrice(plan.priceMinor, plan.currency) : '—';
    if (promptNode) promptNode.hidden = Boolean(plan);
    if (checkoutBtn) checkoutBtn.disabled = !plan;
    if (applyDemoPlanBtn) applyDemoPlanBtn.disabled = !plan;

    planCards.forEach((card) => {
      card.classList.toggle('is-selected', card.getAttribute('data-plan-card') === state.selectedCheckoutPlanId);
    });
  };

  const setTab = (tabId, updateHash = true) => {
    if (!VALID_TABS.has(tabId)) return;
    state.activeTab = tabId;
    renderTabs();
    if (updateHash) {
      const nextUrl = new URL(window.location.href);
      nextUrl.hash = tabId;
      window.history.replaceState({ tab: tabId }, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
    }
  };

  const syncFromHash = () => {
    const rawHash = window.location.hash.replace(/^#/, '');
    if (VALID_TABS.has(rawHash)) {
      state.activeTab = rawHash;
    }
    renderTabs();
  };

  const onSignIn = (event) => {
    event.preventDefault();
    state.signedIn = true;
    writeDemoSession(true);
    renderAuth();
    renderTabs();
    const activeTabBtn = tabs.find((tab) => tab.getAttribute('data-account-tab') === state.activeTab);
    activeTabBtn?.focus();
  };

  const onSignOut = () => {
    state.signedIn = false;
    writeDemoSession(false);
    renderAuth();
    authCard?.querySelector('[data-demo-signin]')?.focus();
  };

  const onTabClick = (event) => {
    const tabId = event.currentTarget.getAttribute('data-account-tab');
    setTab(tabId);
  };

  const onGotoClick = (event) => {
    const tabId = event.currentTarget.getAttribute('data-goto-tab');
    setTab(tabId);
  };

  const onProfileSubmit = (event) => {
    event.preventDefault();
    const formData = new window.FormData(profileForm);
    const name = String(formData.get('displayName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    if (!name || !email) return;
    if (profileNameNode) profileNameNode.textContent = name;
    if (profileEmailNode) profileEmailNode.textContent = email;
    if (sessionUser) sessionUser.textContent = `${name} · Demo session`;
    if (profileStatus) profileStatus.textContent = 'Demo profile updated for this session only (not saved to a server).';
  };

  const onTogglePause = () => {
    state.subscriptionStatus =
      state.subscriptionStatus === 'Paused (Demo)' ? 'Active (Demo)' : 'Paused (Demo)';
    renderSubscription();
    if (subMessage) subMessage.textContent = `Demo subscription status changed to: ${state.subscriptionStatus}.`;
  };

  const onCancelToggle = () => {
    state.subscriptionStatus =
      state.subscriptionStatus === 'Canceled (Demo)' ? 'Active (Demo)' : 'Canceled (Demo)';
    renderSubscription();
    if (subMessage) subMessage.textContent = `Demo subscription status changed to: ${state.subscriptionStatus}.`;
  };

  const onPlanSelect = (event) => {
    const planId = normalizePlanId(event.currentTarget.getAttribute('data-account-select-plan'));
    if (!planId) return;
    state.selectedCheckoutPlanId = planId;
    renderCheckout();
    if (checkoutMessage) checkoutMessage.textContent = 'Payment is unavailable in this demo.';
    setTab('checkout');
  };

  const onCheckoutPay = async () => {
    if (!state.selectedCheckoutPlanId) return;
    try {
      const result = await services.createCheckout(state.selectedCheckoutPlanId);
      if (checkoutMessage) checkoutMessage.textContent = result.message || 'Payment is unavailable in this demo.';
    } catch {
      if (checkoutMessage) checkoutMessage.textContent = 'Checkout is unavailable. Please try again later.';
    }
  };

  const onApplyDemoPlan = () => {
    if (!state.selectedCheckoutPlanId) return;
    state.activePlanId = state.selectedCheckoutPlanId;
    state.subscriptionStatus = 'Active (Demo)';
    renderSubscription();
    if (subMessage) {
      const plan = findPlan(state.activePlanId);
      subMessage.textContent = `Demo subscription switched to ${plan?.displayName || state.activePlanId} (preview only, no charge).`;
    }
    setTab('subscription');
  };

  syncFromHash();
  renderAuth();
  renderSubscription();
  renderCheckout();

  signInForm?.addEventListener('submit', onSignIn);
  signOutBtn?.addEventListener('click', onSignOut);
  tabs.forEach((tab) => tab.addEventListener('click', onTabClick));
  gotoButtons.forEach((btn) => btn.addEventListener('click', onGotoClick));
  profileForm?.addEventListener('submit', onProfileSubmit);
  subTogglePauseBtn?.addEventListener('click', onTogglePause);
  subCancelBtn?.addEventListener('click', onCancelToggle);
  planSelectButtons.forEach((btn) => btn.addEventListener('click', onPlanSelect));
  checkoutBtn?.addEventListener('click', onCheckoutPay);
  applyDemoPlanBtn?.addEventListener('click', onApplyDemoPlan);
  window.addEventListener('hashchange', syncFromHash);

  const destroy = () => {
    signInForm?.removeEventListener('submit', onSignIn);
    signOutBtn?.removeEventListener('click', onSignOut);
    tabs.forEach((tab) => tab.removeEventListener('click', onTabClick));
    gotoButtons.forEach((btn) => btn.removeEventListener('click', onGotoClick));
    profileForm?.removeEventListener('submit', onProfileSubmit);
    subTogglePauseBtn?.removeEventListener('click', onTogglePause);
    subCancelBtn?.removeEventListener('click', onCancelToggle);
    planSelectButtons.forEach((btn) => btn.removeEventListener('click', onPlanSelect));
    checkoutBtn?.removeEventListener('click', onCheckoutPay);
    applyDemoPlanBtn?.removeEventListener('click', onApplyDemoPlan);
    window.removeEventListener('hashchange', syncFromHash);
    initialized.delete(app);
  };

  initialized.set(app, destroy);
  return destroy;
}

module.exports = { initAccountPortal };
