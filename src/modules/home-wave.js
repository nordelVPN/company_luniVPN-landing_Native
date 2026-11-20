const initialized = new WeakMap();
const MAX_DELTA_SECONDS = 0.05;

let rendererModulePromise = null;

function loadRendererModule() {
  if (!rendererModulePromise) {
    rendererModulePromise = import(/* webpackChunkName: "home-wave" */ './home-wave-renderer');
  }
  return rendererModulePromise;
}

function initWaveInstance(section) {
  const canvas = section.querySelector('[data-wave-canvas], [data-home-wave]');
  if (!canvas) return () => {};
  if (initialized.has(section)) return initialized.get(section);

  const reducedMotionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  let destroyed = false;
  let renderer = null;
  let loading = false;
  let failed = false;
  let rafId = null;
  let isIntersecting = false;
  let isVisible = !document.hidden;
  let hasSize = false;
  let lastTimestamp = null;
  let elapsedSeconds = Number(section.getAttribute('data-wave-phase')) || 0;
  let firstFrameDone = false;

  const setWaveActive = (active) => {
    section.classList.toggle('is-wave-active', active);
  };

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTimestamp = null;
  };

  const fallbackToStatic = () => {
    failed = true;
    stopLoop();
    setWaveActive(false);
    if (renderer) {
      renderer.destroy();
      renderer = null;
    }
  };

  const isReducedMotion = () => Boolean(reducedMotionQuery && reducedMotionQuery.matches);

  const canAnimate = () =>
    !destroyed && !failed && !isReducedMotion() && isIntersecting && isVisible && hasSize;

  const renderStaticFrame = () => {
    if (!renderer || !hasSize || destroyed || failed) return;
    const drawn = renderer.render(elapsedSeconds, 16);
    if (drawn && !firstFrameDone) {
      firstFrameDone = true;
      setWaveActive(true);
    }
  };

  const tick = (timestamp) => {
    rafId = null;
    if (!canAnimate() || !renderer) return;

    let intervalMs = 0;
    if (lastTimestamp !== null) {
      intervalMs = timestamp - lastTimestamp;
      const dt = Math.min(Math.max(intervalMs / 1000, 0), MAX_DELTA_SECONDS);
      elapsedSeconds += dt;
    }
    lastTimestamp = timestamp;

    const drawn = renderer.render(elapsedSeconds, intervalMs);
    if (drawn && !firstFrameDone) {
      firstFrameDone = true;
      setWaveActive(true);
    }

    if (canAnimate() && renderer) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const startLoop = () => {
    if (!canAnimate() || !renderer || rafId !== null) return;
    lastTimestamp = null;
    rafId = requestAnimationFrame(tick);
  };

  const ensureLoaded = async () => {
    if (renderer || loading || failed || destroyed) return;
    loading = true;
    try {
      const mod = await loadRendererModule();
      if (destroyed || failed) return;
      renderer = await mod.createHomeWaveRenderer(canvas, {
        onContextLost: () => {
          stopLoop();
          setWaveActive(false);
        },
        onContextRestored: () => {
          firstFrameDone = false;
          if (isReducedMotion()) {
            renderStaticFrame();
          } else if (canAnimate()) {
            startLoop();
          }
        },
        onFallback: () => {
          fallbackToStatic();
        }
      });
      if (destroyed || failed) {
        renderer.destroy();
        renderer = null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      hasSize = rect.width > 0 && rect.height > 0;
      if (hasSize) {
        renderer.resize(rect.width, rect.height);
      }
      if (isReducedMotion()) {
        renderStaticFrame();
      } else {
        startLoop();
      }
    } catch {
      fallbackToStatic();
    } finally {
      loading = false;
    }
  };

  const syncPlayback = () => {
    if (destroyed || failed) return;
    if (isReducedMotion()) {
      stopLoop();
      if (isIntersecting && hasSize) {
        if (renderer) renderStaticFrame();
        else ensureLoaded();
      }
      return;
    }
    if (canAnimate()) {
      if (renderer) startLoop();
      else ensureLoaded();
    } else {
      stopLoop();
    }
  };

  let resizeObserver = null;
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      hasSize = width > 0 && height > 0;
      if (renderer && hasSize) {
        renderer.resize(width, height);
        if (isReducedMotion()) renderStaticFrame();
      }
      syncPlayback();
    });
    resizeObserver.observe(canvas);
  } else {
    const rect = canvas.getBoundingClientRect();
    hasSize = rect.width > 0 && rect.height > 0;
  }

  let intersectionObserver = null;
  if (typeof IntersectionObserver === 'function') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        isIntersecting = Boolean(entries[0]?.isIntersecting);
        syncPlayback();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(section);
  } else {
    isIntersecting = true;
  }

  const onVisibilityChange = () => {
    isVisible = !document.hidden;
    syncPlayback();
  };

  const onReducedMotionChange = () => {
    syncPlayback();
  };

  const onPageHide = () => {
    stopLoop();
  };

  const onPageShow = () => {
    isVisible = !document.hidden;
    syncPlayback();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  reducedMotionQuery?.addEventListener?.('change', onReducedMotionChange);

  syncPlayback();

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stopLoop();
    setWaveActive(false);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    reducedMotionQuery?.removeEventListener?.('change', onReducedMotionChange);
    renderer?.destroy();
    renderer = null;
    initialized.delete(section);
  };

  initialized.set(section, destroy);
  return destroy;
}

export function initHomeWave(root = document) {
  const sections = [...root.querySelectorAll('[data-wave-root], [data-home-wave-root]')];
  if (!sections.length) return () => {};
  const cleanups = sections.map((section) => initWaveInstance(section));
  return () => {
    cleanups.forEach((fn) => fn());
  };
}
