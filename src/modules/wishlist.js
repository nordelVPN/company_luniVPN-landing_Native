const initialized = new WeakMap();
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isVisible(element) {
  return Boolean(element && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0));
}

function initWishlist(root = document) {
  const backdrop = root.querySelector('[data-wishlist-dialog]');
  if (!backdrop) return () => {};
  if (initialized.has(backdrop)) return initialized.get(backdrop);

  const panel = backdrop.querySelector('[data-wishlist-panel]');
  const openers = [...root.querySelectorAll('[data-wishlist-open]')];
  const closers = [...backdrop.querySelectorAll('[data-wishlist-close]')];
  const shell = root.querySelector('[data-page-shell]');
  const navToggle = root.querySelector('[data-nav-toggle]');

  if (!panel || openers.length === 0) return () => {};

  let lastTrigger = null;

  const getFocusables = () => [...panel.querySelectorAll(FOCUSABLE)].filter(isVisible);

  const open = (trigger) => {
    lastTrigger = trigger || null;
    backdrop.hidden = false;
    document.body.classList.add('has-modal-open');
    if (shell) shell.setAttribute('aria-hidden', 'true');
    const focusables = getFocusables();
    (focusables[0] || panel).focus();
  };

  const close = () => {
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('has-modal-open');
    if (shell) shell.removeAttribute('aria-hidden');

    if (isVisible(lastTrigger)) {
      lastTrigger.focus();
    } else if (isVisible(navToggle)) {
      navToggle.focus();
    }
    lastTrigger = null;
  };

  const onOpenerClick = (event) => {
    open(event.currentTarget);
  };

  const onBackdropClick = (event) => {
    if (event.target === backdrop) close();
  };

  const onKeyDown = (event) => {
    if (backdrop.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = getFocusables();
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  openers.forEach((opener) => opener.addEventListener('click', onOpenerClick));
  closers.forEach((closer) => closer.addEventListener('click', close));
  backdrop.addEventListener('click', onBackdropClick);
  document.addEventListener('keydown', onKeyDown);

  const destroy = () => {
    openers.forEach((opener) => opener.removeEventListener('click', onOpenerClick));
    closers.forEach((closer) => closer.removeEventListener('click', close));
    backdrop.removeEventListener('click', onBackdropClick);
    document.removeEventListener('keydown', onKeyDown);
    initialized.delete(backdrop);
  };

  initialized.set(backdrop, destroy);
  return destroy;
}

module.exports = { initWishlist };
