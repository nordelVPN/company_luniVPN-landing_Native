const initialized = new WeakMap();

function initNavigation(root = document) {
  const host = root.querySelector('[data-nav-root]');
  if (!host) return () => {};
  if (initialized.has(host)) return initialized.get(host);

  const button = host.querySelector('[data-nav-toggle]');
  const panel = host.querySelector('[data-nav-panel]');
  if (!button || !panel) return () => {};

  const navLinks = [...panel.querySelectorAll('[data-nav-link]')];

  const close = (restoreFocus = false) => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    panel.classList.remove('is-open');
    if (restoreFocus) button.focus();
  };

  const onToggleClick = () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.classList.toggle('is-open', open);
  };

  const onPanelClick = (event) => {
    if (event.target.closest('a, [data-wishlist-open]')) {
      close(false);
    }
  };

  const onKey = (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      close(true);
    }
  };

  const setActiveLink = (sectionId) => {
    for (const link of navLinks) {
      if (link.getAttribute('data-nav-link') === sectionId) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  let observer = null;
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observedSections = navLinks
      .map((link) => root.getElementById(link.getAttribute('data-nav-link')))
      .filter(Boolean);

    if (observedSections.length > 0) {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]?.target?.id) {
            setActiveLink(visible[0].target.id);
          }
        },
        { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
      );
      observedSections.forEach((section) => observer.observe(section));
    }
  }

  button.addEventListener('click', onToggleClick);
  panel.addEventListener('click', onPanelClick);
  host.addEventListener('keydown', onKey);

  const destroy = () => {
    button.removeEventListener('click', onToggleClick);
    panel.removeEventListener('click', onPanelClick);
    host.removeEventListener('keydown', onKey);
    observer?.disconnect();
    initialized.delete(host);
  };

  initialized.set(host, destroy);
  return destroy;
}

module.exports = { initNavigation };
