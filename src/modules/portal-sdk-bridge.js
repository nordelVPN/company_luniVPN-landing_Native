/* global navigator, URLSearchParams, URL */
'use strict';

var sdkFactory = require('./vpn-portal-sdk');

function initPortalSdkBridge() {
  var sdk = sdkFactory.createVpnPortalSdk({ brandSlug: 'luni' });
  sdkFactory.syncAccountNavLinks(sdk);
  var siteConfigPromise = sdk.getSiteConfig();
  var cachedPlans = [];
  var currentSiteConfig = null;
  var checkoutWishlistCtrls = [];
  siteConfigPromise.then(function (cfg) { currentSiteConfig = cfg; });

  function uiMsg() {
    return sdkFactory.getPortalUiMessages();
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
  }

  function setStatus(el, msg, type, options) {
    if (!el) return;
    sdkFactory.setPortalStatus(el, msg, type || 'info', options);
  }

  function formatEur(minor) {
    var euros = (minor || 0) / 100;
    return '€' + (Number.isInteger(euros) ? String(euros) : euros.toFixed(2));
  }

  // Live showcase plans & servers on index.html
  if (document.querySelector('#plans')) {
    document.querySelectorAll('[data-plan-card]').forEach(function (card) {
      var code = card.getAttribute('data-plan-card');
      var titleEl = card.querySelector('h3');
      if (code) cachedPlans.push({ plan_code: code, name: titleEl ? titleEl.textContent.trim() : code });
    });

    if (sdk.mode === 'live') {
      sdk.getPublicPlans().then(function (res) {
        var plans = (res && res.plans) || [];
        if (plans.length) {
          cachedPlans = plans.map(function (p) { return { plan_code: p.plan_code, name: p.name || p.plan_code }; });
          checkoutWishlistCtrls.forEach(function (c) { c.update({ plans: cachedPlans }); });
        }
        plans.forEach(function (plan) {
          var card = document.querySelector('[data-plan-card="' + plan.plan_code + '"]');
          var priceEl = card && card.querySelector('.plan-price');
          if (priceEl) priceEl.textContent = formatEur(plan.price_minor);
        });
      }).catch(function () { /* keep static fallback */ });
    }

    siteConfigPromise.then(function (cfg) {
      if (!sdkFactory.isSiteServersEnabled(cfg)) {
        var strip = document.querySelector('[data-live-servers-strip]');
        if (strip) strip.hidden = true;
        return;
      }
      if (sdk.mode !== 'live') return;
      sdk.getPublicServersCatalog().then(function (res) {
        var servers = (res && (res.servers || res.locations || res.data)) || [];
        var plansSection = document.querySelector('#plans');
        if (plansSection && servers.length) {
          plansSection.setAttribute('data-live-servers-count', String(servers.length));
          sdkFactory.renderLiveServersStrip(plansSection.querySelector('.container') || plansSection, servers);
        }
      }).catch(function () { /* optional */ });
    });
  }

  var isAccountPage = Boolean(document.querySelector('[data-sdk-vpn-panel]'));
  if (!isAccountPage) {
    sdkFactory.initCheckoutReturnPolling(sdk);
  }

  function mountWishlistInCheckout(cfg, planCode) {
    document.querySelectorAll('[data-checkout]').forEach(function (root) {
      var grid = root.querySelector('.checkout-grid');
      if (grid) grid.hidden = true;
      root.querySelectorAll('[data-payment-providers], [data-checkout-button], [data-apply-demo-plan]').forEach(function (el) {
        el.hidden = true;
      });
      var host = root.querySelector('[data-wishlist-checkout-host]');
      if (!host) {
        host = document.createElement('div');
        host.setAttribute('data-wishlist-checkout-host', '');
        host.style.marginTop = '1rem';
        var inner = root.querySelector('.checkout-dialog-inner') || root;
        inner.appendChild(host);
      }
      var ctrl = sdkFactory.renderWishlistCard(sdk, host, {
        siteConfig: cfg,
        planCode: planCode || '',
        plans: cachedPlans,
        sourcePage: 'checkout',
        variant: 'checkout'
      });
      if (ctrl) checkoutWishlistCtrls.push(ctrl);
    });
  }

  // Live checkout & wishlist_only hook
  var getLProvider = function () { return null; };
  siteConfigPromise.then(function (cfg) {
    if (cfg && cfg.wishlist_bot_url) {
      document.querySelectorAll('[data-wishlist-link]').forEach(function (a) {
        a.setAttribute('href', cfg.wishlist_bot_url);
      });
    }
    if (!sdkFactory.isSiteCheckoutEnabled(cfg)) {
      mountWishlistInCheckout(cfg, '');
      return;
    }
    if (sdk.mode !== 'live') return;
    document.querySelectorAll('.checkout-preview').forEach(function (el) { el.hidden = true; });
    var luniCheckoutRoots = document.querySelectorAll('[data-checkout]');
    luniCheckoutRoots.forEach(function (luniCheckoutRoot) {
      var lProviderHost = luniCheckoutRoot.querySelector('[data-payment-providers]');
      if (!lProviderHost) {
        lProviderHost = document.createElement('div');
        lProviderHost.className = 'payment-providers';
        lProviderHost.setAttribute('data-payment-providers', '');
        lProviderHost.hidden = true;
        var lBtn = luniCheckoutRoot.querySelector('[data-checkout-button], [data-apply-demo-plan]');
        if (lBtn && lBtn.parentNode) {
          lBtn.parentNode.insertBefore(lProviderHost, lBtn);
        } else {
          luniCheckoutRoot.appendChild(lProviderHost);
        }
      }
      sdkFactory.mountPaymentProviderSelector(sdk, lProviderHost).then(function (getter) {
        if (typeof getter === 'function') getLProvider = getter;
      });
    });
  });

  document.addEventListener('click', function (e) {
    var planTrigger = e.target && e.target.closest && e.target.closest('[data-select-plan], [data-account-select-plan]');
    if (planTrigger && currentSiteConfig && !sdkFactory.isSiteCheckoutEnabled(currentSiteConfig)) {
      var picked = planTrigger.getAttribute('data-select-plan') || planTrigger.getAttribute('data-account-select-plan') || '';
      checkoutWishlistCtrls.forEach(function (c) { c.setPlanCode(picked); });
    }
    var btn = e.target && e.target.closest && e.target.closest('[data-checkout-button], [data-apply-demo-plan]');
    if (!btn || btn.disabled) return;
    if (currentSiteConfig && !sdkFactory.isSiteCheckoutEnabled(currentSiteConfig)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      mountWishlistInCheckout(currentSiteConfig, '');
      return;
    }
    if (sdk.mode !== 'live') return;
    var root = btn.closest('[data-checkout]') || document;
    var activeCard = document.querySelector('[data-plan-card].is-selected') || document.querySelector('[data-account-select-plan][aria-pressed="true"]');
    var planCode = (activeCard && (activeCard.getAttribute('data-plan-card') || activeCard.getAttribute('data-account-select-plan'))) || 'plus';
    var promoInput = root.querySelector('[name="promo_code"]');
    var msgEl = root.querySelector('[data-checkout-message]');
    if (!sdk.isAuthenticated()) {
      window.location.replace('./login.html');
      return;
    }
    e.preventDefault();
    var returnUrl = new URL('./account.html', window.location.href).href;
    var cancelUrl = new URL('./index.html?status=cancelled', window.location.href).href;
    sdk.checkout({
      plan_code: planCode,
      provider: getLProvider(),
      promo_code: promoInput ? promoInput.value.trim() : null,
      return_url: returnUrl,
      cancel_url: cancelUrl
    }).then(function (res) {
      setStatus(msgEl, res && res.checkout && res.checkout.mode === 'mock' ? 'Confirm test payment to activate your VPN key.' : 'Redirecting to payment provider...');
      sdkFactory.handleCheckoutResponse(sdk, res);
    }).catch(function (err) {
      if (err && (err.code === 'SITE_IN_WISHLIST_MODE' || err.status === 403)) {
        sdk.getSiteConfig({ force: true }).then(function (cfg) {
          currentSiteConfig = cfg;
          mountWishlistInCheckout(cfg, planCode);
        });
        return;
      }
      setStatus(msgEl, (err && err.message) || 'Checkout failed.');
    });
  });

  var loginForm = document.querySelector('[data-portal-login]');
  if (loginForm) {
    sdkFactory.bindFormValidationClear(loginForm);
    var statusEl = loginForm.querySelector('[data-portal-status]');
    var loginBtn = loginForm.querySelector('button[type="submit"]');
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdkFactory.clearFieldErrors(loginForm);
      var email = loginForm.email.value.trim();
      var password = loginForm.password.value;
      var fieldErrs = {};
      if (!isValidEmail(email)) fieldErrs.email = uiMsg().invalidEmail;
      if (!password) fieldErrs.password = uiMsg().requiredField;
      if (Object.keys(fieldErrs).length) {
        sdkFactory.setFieldErrors(loginForm, fieldErrs);
        setStatus(statusEl, Object.values(fieldErrs)[0], 'error');
        return;
      }
      setStatus(statusEl, uiMsg().loading, 'loading', { scroll: false });
      sdkFactory.withFormBusy(loginForm, loginBtn, function () {
        return sdk.login({ email: email, password: password }).then(function () {
          setStatus(statusEl, 'Signed in. Redirecting to account...', 'success');
          window.location.href = './account.html';
        }).catch(function (err) {
          if (err && err.details) {
            sdkFactory.setFieldErrors(loginForm, err.details);
          } else if (err && err.status === 401) {
            sdkFactory.setFieldErrors(loginForm, {
              email: sdkFactory.formatPortalApiError(err, uiMsg().unauthorized),
              password: ' '
            }, { focus: false });
          }
          setStatus(statusEl, sdkFactory.formatPortalApiError(err, 'Sign in failed.'), 'error');
        });
      });
    });
  }

  var registerForm = document.querySelector('[data-portal-register]');
  if (registerForm) {
    sdkFactory.bindFormValidationClear(registerForm);
    siteConfigPromise.then(function (cfg) {
      if (sdkFactory.isSiteInWishlistMode(cfg)) {
        sdkFactory.mountRegisterWishlistBanner(registerForm, cfg);
      }
    });
    var regStatus = registerForm.querySelector('[data-portal-status]');
    var regBtn = registerForm.querySelector('button[type="submit"]');
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdkFactory.clearFieldErrors(registerForm);
      var email = registerForm.email.value.trim();
      var password = registerForm.password.value;
      var confirm = registerForm.password_confirmation.value;
      var terms = registerForm.accept_terms;
      var fieldErrs = {};
      if (!isValidEmail(email)) fieldErrs.email = uiMsg().invalidEmail;
      if (password.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
      if (password !== confirm) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
      if (terms && !terms.checked) fieldErrs.accept_terms = uiMsg().acceptTermsRequired;
      if (Object.keys(fieldErrs).length) {
        sdkFactory.setFieldErrors(registerForm, fieldErrs);
        setStatus(regStatus, Object.values(fieldErrs)[0], 'error');
        return;
      }
      setStatus(regStatus, uiMsg().loading, 'loading', { scroll: false });
      sdkFactory.withFormBusy(registerForm, regBtn, function () {
        return sdk.register({
          email: email,
          password: password,
          password_confirmation: confirm,
          display_name: registerForm.display_name ? registerForm.display_name.value.trim() : ''
        }).then(function () {
          setStatus(regStatus, 'Account created. Redirecting...', 'success');
          window.location.href = './account.html';
        }).catch(function (err) {
          if (err && err.details) sdkFactory.setFieldErrors(registerForm, err.details);
          setStatus(regStatus, sdkFactory.formatPortalApiError(err, 'Registration failed.'), 'error');
        });
      });
    });
  }

  var forgotForm = document.querySelector('[data-portal-forgot]');
  var resetForm = document.querySelector('[data-portal-reset]');
  var params = new URLSearchParams(window.location.search || '');
  var resetToken = params.get('token');
  if (resetToken && resetForm) {
    if (forgotForm) forgotForm.hidden = true;
    resetForm.hidden = false;
    resetForm.token.value = resetToken;
    sdkFactory.bindFormValidationClear(resetForm);
    var rStatus = resetForm.querySelector('[data-portal-status]');
    var rBtn = resetForm.querySelector('button[type="submit"]');
    resetForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdkFactory.clearFieldErrors(resetForm);
      var pw = resetForm.password.value;
      var confirm = resetForm.password_confirmation.value;
      var fieldErrs = {};
      if (pw.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
      if (pw !== confirm) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
      if (Object.keys(fieldErrs).length) {
        sdkFactory.setFieldErrors(resetForm, fieldErrs);
        setStatus(rStatus, Object.values(fieldErrs)[0], 'error');
        return;
      }
      setStatus(rStatus, uiMsg().loading, 'loading', { scroll: false });
      sdkFactory.withFormBusy(resetForm, rBtn, function () {
        return sdk.resetPassword({
          token: resetForm.token.value,
          password: pw,
          password_confirmation: confirm
        }).then(function () {
          setStatus(rStatus, 'Password updated. Redirecting to sign in...', 'success');
          window.location.href = './login.html';
        }).catch(function (err) {
          if (err && err.details) sdkFactory.setFieldErrors(resetForm, err.details);
          setStatus(rStatus, sdkFactory.formatPortalApiError(err, 'Reset failed. Request a new reset link.'), 'error');
        });
      });
    });
  } else if (forgotForm) {
    sdkFactory.bindFormValidationClear(forgotForm);
    var fStatus = forgotForm.querySelector('[data-portal-status]');
    var fBtn = forgotForm.querySelector('button[type="submit"]');
    forgotForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdkFactory.clearFieldErrors(forgotForm);
      var email = forgotForm.email.value.trim();
      if (!isValidEmail(email)) {
        sdkFactory.setFieldErrors(forgotForm, { email: uiMsg().invalidEmail });
        setStatus(fStatus, uiMsg().invalidEmail, 'error');
        return;
      }
      setStatus(fStatus, uiMsg().loading, 'loading', { scroll: false });
      sdkFactory.withFormBusy(forgotForm, fBtn, function () {
        return sdk.forgotPassword(email).then(function (res) {
          setStatus(fStatus, (res && res.message) || 'If an account exists, reset instructions have been sent.', 'success');
        }).catch(function (err) {
          if (err && err.details) sdkFactory.setFieldErrors(forgotForm, err.details);
          setStatus(fStatus, sdkFactory.formatPortalApiError(err, 'Request failed.'), 'error');
        });
      });
    });
  }

  var vpnPanel = document.querySelector('[data-sdk-vpn-panel]');
  if (vpnPanel) {
    if (sdk.mode === 'live') {
      if (!sdk.isAuthenticated()) {
        window.location.href = './login.html';
        return;
      }
      var demoAuthCard = document.querySelector('[data-account-auth]');
      var portalGrid = document.querySelector('[data-account-portal]');
      var sessionBar = document.querySelector('[data-account-session-bar]');
      if (demoAuthCard) demoAuthCard.hidden = true;
      if (portalGrid) portalGrid.hidden = false;
      if (sessionBar) sessionBar.hidden = false;
    }

    var accessKey = '';
    var revealed = false;

    function maskKey(k) {
      return k && k.length > 12 ? k.slice(0, 10) + '••••••••••••' + k.slice(-4) : '••••••••';
    }

    var keyEl = vpnPanel.querySelector('[data-sdk-vpn-key]');
    var serversBody = vpnPanel.querySelector('[data-sdk-servers]');
    var devicesBody = vpnPanel.querySelector('[data-sdk-devices]');
    var devicesCount = vpnPanel.querySelector('[data-sdk-devices-count]');
    var billingBody = document.querySelector('[data-sdk-billing]');
    var statusNote = vpnPanel.querySelector('[data-sdk-status]');

    function renderDevices(res) {
      var devices = (res && res.devices) || [];
      var limit = (res && res.limit) || 5;
      if (devicesCount) devicesCount.textContent = devices.length + ' / ' + limit;
      if (!devicesBody) return;
      devicesBody.innerHTML = '';
      if (!devices.length) {
        devicesBody.innerHTML = '<tr><td colspan="4">No devices connected.</td></tr>';
        return;
      }
      devices.forEach(function (dev) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td></td><td></td><td></td><td><button type="button" class="button button-outline button-small">Revoke</button></td>';
        tr.children[0].textContent = dev.device_name || dev.device_uid;
        tr.children[1].textContent = dev.platform || 'unknown';
        tr.children[2].textContent = dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleDateString() : '—';
        tr.querySelector('button').addEventListener('click', function () {
          sdk.revokeDevice(accessKey, dev.device_uid).then(function () {
            return sdk.getDevices(accessKey);
          }).then(renderDevices).catch(function (err) {
            setStatus(statusNote, sdkFactory.formatPortalApiError(err, 'Could not revoke device.'), 'error');
          });
        });
        devicesBody.appendChild(tr);
      });
    }

    function renderServers(servers) {
      if (!serversBody) return;
      serversBody.innerHTML = '';
      if (!servers || !servers.length) {
        serversBody.innerHTML = '<tr><td colspan="4">No servers available for this subscription.</td></tr>';
        return;
      }
      servers.forEach(function (srv) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td></td><td></td><td></td><td></td>';
        tr.children[0].textContent = sdkFactory.formatServerLocation(srv);
        tr.children[1].textContent = sdkFactory.formatServerStatusAndLoad(srv);
        tr.children[2].textContent = srv.ping_ms ? srv.ping_ms + ' ms' : '—';
        tr.children[3].textContent = sdkFactory.formatServerProtocolsAndTags(srv);
        serversBody.appendChild(tr);
      });
    }

    function renderBilling(payments) {
      if (!billingBody) return;
      billingBody.innerHTML = '';
      if (!payments || !payments.length) {
        billingBody.innerHTML = '<tr><td colspan="4">No payments yet.</td></tr>';
        return;
      }
      payments.forEach(function (p) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td></td><td></td><td></td><td></td>';
        tr.children[0].textContent = p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—';
        tr.children[1].textContent = p.plan_code;
        tr.children[2].textContent = formatEur(p.final_amount_minor);
        tr.children[3].textContent = sdkFactory.formatPaymentProvider(p.provider) + ' · ' + sdkFactory.formatPaymentStatus(p.status);
        billingBody.appendChild(tr);
      });
    }

    function loadAccountData() {
      var ready = (!sdk.isAuthenticated() && sdk.mode === 'demo')
        ? sdk.login({ email: 'demo@lunivpn.com', password: 'demo-password' })
        : Promise.resolve();

      return ready.then(function () {
        return Promise.all([sdk.getMe(), sdk.getSubscription(), sdk.getBillingHistory(), siteConfigPromise]);
      }).then(function (all) {
        var me = all[0];
        var subRes = all[1];
        var billRes = all[2];
        var siteCfg = all[3];
        var serversAllowed = sdkFactory.isSiteServersEnabled(siteCfg);
        sdkFactory.revealAuthGate();
        if (me && me.client) {
          var nameEl = document.querySelector('[data-profile-name]');
          var emailEl = document.querySelector('[data-profile-email]');
          var sessionUser = document.querySelector('[data-session-user]');
          var nameInput = document.querySelector('#profile-name-input');
          var emailInput = document.querySelector('#profile-email-input');
          if (nameEl) nameEl.textContent = me.client.display_name || me.client.email;
          if (emailEl) emailEl.textContent = me.client.email;
          if (sessionUser) sessionUser.textContent = me.client.display_name || me.client.email;
          if (nameInput) nameInput.value = me.client.display_name || '';
          if (emailInput) emailInput.value = me.client.email || '';
        }
        var payments = (billRes && billRes.payments) || [];
        renderBilling(payments);
        if (statusNote && payments.length && sdk.mode === 'live') {
          statusNote.setAttribute('data-payments-count', String(payments.length));
        }
        var sub = subRes && subRes.subscription;
        if (sub) {
          var subPlan = document.querySelector('[data-sub-plan]');
          var subStatus = document.querySelector('[data-sub-status]');
          var subRenewal = document.querySelector('[data-sub-renewal]');
          if (subPlan) subPlan.textContent = sub.plan_name;
          if (subStatus) subStatus.textContent = sub.status;
          if (subRenewal && sub.expires_at) subRenewal.textContent = new Date(sub.expires_at).toLocaleDateString();
        }
        if (!serversAllowed) {
          [
            keyEl && keyEl.parentElement,
            serversBody && serversBody.closest('div'),
            devicesCount && devicesCount.closest('h3, h2'),
            devicesBody && devicesBody.closest('div')
          ].forEach(function (el) {
            if (el && el !== vpnPanel) el.hidden = true;
          });
          var vpnHeading = vpnPanel.querySelector('h3, h2');
          if (vpnHeading && /VPN Key|Available Servers/i.test(vpnHeading.textContent || '')) vpnHeading.hidden = true;
          sdkFactory.mountAccountWaitlistCard(vpnPanel, siteCfg, { prepend: true, className: 'panel' });
          return;
        }
        accessKey = (sub && sub.access_key) || '';
        if (keyEl) keyEl.textContent = revealed ? accessKey : maskKey(accessKey);
        if (!accessKey) {
          renderServers([]);
          renderDevices({ limit: 5, devices: [] });
          return;
        }
        sdk.getBootstrap(accessKey).then(function (boot) {
          renderServers((boot && boot.servers) || []);
        }).catch(function (err) {
          if (err.code === 'KEY_EXPIRED') {
            setStatus(statusNote, uiMsg().keyExpired, 'warning');
          } else if (err.code === 'KEY_REVOKED') {
            setStatus(statusNote, uiMsg().keyRevoked, 'error');
          } else if (err.code === 'DEVICE_LIMIT_REACHED' || err.status === 409) {
            setStatus(statusNote, uiMsg().deviceLimitReached, 'warning');
            var errDevices = err.payload && err.payload.error && err.payload.error.devices;
            if (Array.isArray(errDevices)) renderDevices({ limit: 5, devices: errDevices });
          } else {
            setStatus(statusNote, (err && err.message) || 'Unable to load VPN servers.');
          }
        });
        sdk.getDevices(accessKey).then(renderDevices).catch(function () { /* ignore */ });
      }).catch(function (err) {
        if (sdk.mode === 'live' && (!sdk.isAuthenticated() || (err && (err.status === 401 || err.code === 'UNAUTHORIZED')))) {
          window.location.replace('./login.html');
          return;
        }
        sdkFactory.revealAuthGate();
        setStatus(statusNote, (err && err.message) || 'Unable to load VPN access data.');
      });
    }

    loadAccountData();
    sdkFactory.initCheckoutReturnPolling(sdk, {
      statusEl: statusNote,
      onPaid: function () {
        loadAccountData();
      }
    });

    // Wire profile update, signout, security, support in live mode
    var profileForm = document.querySelector('[data-profile-form]');
    if (profileForm && sdk.mode === 'live') {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var displayName = profileForm.displayName ? profileForm.displayName.value.trim() : '';
        sdk.updateProfile({ display_name: displayName }).then(function () {
          setStatus(document.querySelector('[data-profile-status]'), 'Profile saved.', 'success');
        }).catch(function (err) {
          setStatus(document.querySelector('[data-profile-status]'), sdkFactory.formatPortalApiError(err, 'Save failed.'), 'error');
        });
      });
    }

    var signoutBtn = document.querySelector('[data-demo-signout]');
    if (signoutBtn && sdk.mode === 'live') {
      signoutBtn.addEventListener('click', function () {
        sdk.logout().then(function () { window.location.href = './login.html'; });
      });
    }

    var passForm = document.querySelector('[data-password-form]');
    if (passForm) {
      sdkFactory.bindFormValidationClear(passForm);
      var pwStatus = passForm.querySelector('[data-password-status]') || statusNote;
      var pwBtn = passForm.querySelector('button[type="submit"]');
      passForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdkFactory.clearFieldErrors(passForm);
        var cur = passForm.current_password.value;
        var nextPw = passForm.password.value;
        var confirmPw = passForm.password_confirmation.value;
        var fieldErrs = {};
        if (!cur) fieldErrs.current_password = uiMsg().requiredField;
        if (nextPw.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
        if (nextPw !== confirmPw) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
        if (Object.keys(fieldErrs).length) {
          sdkFactory.setFieldErrors(passForm, fieldErrs);
          setStatus(pwStatus, Object.values(fieldErrs)[0], 'error');
          return;
        }
        setStatus(pwStatus, uiMsg().loading, 'loading', { scroll: false });
        sdkFactory.withFormBusy(passForm, pwBtn, function () {
          return sdk.changePassword({
            current_password: cur,
            password: nextPw,
            password_confirmation: confirmPw
          }).then(function () {
            passForm.reset();
            setStatus(pwStatus, 'Password updated.', 'success');
          }).catch(function (err) {
            if (err && err.details) sdkFactory.setFieldErrors(passForm, err.details);
            setStatus(pwStatus, sdkFactory.formatPortalApiError(err, 'Password update failed.'), 'error');
          });
        });
      });
    }

    var logoutAllBtn = document.querySelector('[data-logout-all]');
    if (logoutAllBtn) {
      logoutAllBtn.addEventListener('click', function () {
        sdk.logoutAll().then(function () { window.location.href = './login.html'; });
      });
    }

    var supportForm = document.querySelector('[data-support-form]');
    if (supportForm) {
      sdkFactory.bindFormValidationClear(supportForm);
      var sStatus = supportForm.querySelector('[data-support-status]') || statusNote;
      var sBtn = supportForm.querySelector('button[type="submit"]');
      supportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdkFactory.clearFieldErrors(supportForm);
        var subject = supportForm.subject.value.trim();
        var message = supportForm.message.value.trim();
        var fieldErrs = {};
        if (subject.length < 3) fieldErrs.subject = uiMsg().subjectTooShort;
        if (message.length < 5) fieldErrs.message = uiMsg().messageTooShort;
        if (Object.keys(fieldErrs).length) {
          sdkFactory.setFieldErrors(supportForm, fieldErrs);
          setStatus(sStatus, Object.values(fieldErrs)[0], 'error');
          return;
        }
        setStatus(sStatus, uiMsg().loading, 'loading', { scroll: false });
        sdkFactory.withFormBusy(supportForm, sBtn, function () {
          return sdk.createSupportTicket({
            subject: subject,
            message: message
          }).then(function () {
            supportForm.reset();
            setStatus(sStatus, 'Support ticket submitted.', 'success');
          }).catch(function (err) {
            if (err && err.details) sdkFactory.setFieldErrors(supportForm, err.details);
            setStatus(sStatus, sdkFactory.formatPortalApiError(err, 'Support request failed.'), 'error');
          });
        });
      });
    }

    var revBtn = vpnPanel.querySelector('[data-sdk-key-reveal]');
    if (revBtn) {
      revBtn.addEventListener('click', function () {
        revealed = !revealed;
        if (keyEl) keyEl.textContent = revealed ? accessKey : maskKey(accessKey);
        revBtn.textContent = revealed ? 'Hide' : 'Show';
      });
    }

    var copyBtn = vpnPanel.querySelector('[data-sdk-key-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard && accessKey) {
          navigator.clipboard.writeText(accessKey).then(function () { setStatus(statusNote, 'VPN key copied.', 'success', { scroll: false }); }).catch(function () { setStatus(statusNote, 'Could not copy VPN key.', 'error', { scroll: false }); });
        }
      });
    }
  }
}

module.exports = { initPortalSdkBridge: initPortalSdkBridge };
