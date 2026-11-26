/* global navigator, URLSearchParams, URL */
'use strict';

var sdkFactory = require('./vpn-portal-sdk');

function initPortalSdkBridge() {
  var sdk = sdkFactory.createVpnPortalSdk({ brandSlug: 'luni' });
  sdkFactory.syncAccountNavLinks(sdk);

  function setStatus(el, msg) {
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function formatEur(minor) {
    var euros = (minor || 0) / 100;
    return '€' + (Number.isInteger(euros) ? String(euros) : euros.toFixed(2));
  }

  // Live showcase plans & servers on index.html
  if (sdk.mode === 'live' && document.querySelector('#plans')) {
    sdk.getPublicPlans().then(function (res) {
      ((res && res.plans) || []).forEach(function (plan) {
        var card = document.querySelector('[data-plan-card="' + plan.plan_code + '"]');
        var priceEl = card && card.querySelector('.plan-price');
        if (priceEl) priceEl.textContent = formatEur(plan.price_minor);
      });
    }).catch(function () { /* keep static fallback */ });

    sdk.getPublicServersCatalog().then(function (res) {
      var servers = (res && (res.servers || res.locations || res.data)) || [];
      var plansSection = document.querySelector('#plans');
      if (plansSection && servers.length) {
        plansSection.setAttribute('data-live-servers-count', String(servers.length));
        sdkFactory.renderLiveServersStrip(plansSection.querySelector('.container') || plansSection, servers);
      }
    }).catch(function () { /* optional */ });
  }

  var isAccountPage = Boolean(document.querySelector('[data-sdk-vpn-panel]'));
  if (!isAccountPage) {
    sdkFactory.initCheckoutReturnPolling(sdk);
  }

  // Live checkout hook
  if (sdk.mode === 'live') {
    document.querySelectorAll('.checkout-preview').forEach(function (el) { el.hidden = true; });

    var getLProvider = function () { return null; };
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

    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('[data-checkout-button], [data-apply-demo-plan]');
      if (!btn || btn.disabled) return;
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
        setStatus(msgEl, (err && err.message) || 'Checkout failed.');
      });
    });
  }

  var loginForm = document.querySelector('[data-portal-login]');
  if (loginForm) {
    var statusEl = loginForm.querySelector('[data-portal-status]');
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdk.login({ email: loginForm.email.value.trim(), password: loginForm.password.value }).then(function () {
        setStatus(statusEl, 'Signed in. Redirecting to account...');
        window.location.href = './account.html';
      }).catch(function (err) {
        setStatus(statusEl, (err && err.message) || 'Sign in failed.');
      });
    });
  }

  var registerForm = document.querySelector('[data-portal-register]');
  if (registerForm) {
    var regStatus = registerForm.querySelector('[data-portal-status]');
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (registerForm.password.value !== registerForm.password_confirmation.value) {
        setStatus(regStatus, 'Passwords do not match.');
        return;
      }
      sdk.register({
        email: registerForm.email.value.trim(),
        password: registerForm.password.value,
        password_confirmation: registerForm.password_confirmation.value,
        display_name: registerForm.display_name ? registerForm.display_name.value.trim() : ''
      }).then(function () {
        setStatus(regStatus, 'Account created. Redirecting...');
        window.location.href = './account.html';
      }).catch(function (err) {
        setStatus(regStatus, (err && err.message) || 'Registration failed.');
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
    var rStatus = resetForm.querySelector('[data-portal-status]');
    resetForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (resetForm.password.value !== resetForm.password_confirmation.value) {
        setStatus(rStatus, 'Passwords do not match.');
        return;
      }
      sdk.resetPassword({
        token: resetForm.token.value,
        password: resetForm.password.value,
        password_confirmation: resetForm.password_confirmation.value
      }).then(function () {
        setStatus(rStatus, 'Password updated. Redirecting to sign in...');
        window.location.href = './login.html';
      }).catch(function (err) {
        setStatus(rStatus, (err && err.message) || 'Reset failed.');
      });
    });
  } else if (forgotForm) {
    var fStatus = forgotForm.querySelector('[data-portal-status]');
    forgotForm.addEventListener('submit', function (event) {
      event.preventDefault();
      sdk.forgotPassword(forgotForm.email.value.trim()).then(function (res) {
        setStatus(fStatus, (res && res.message) || 'If an account exists, reset instructions have been sent.');
      }).catch(function (err) {
        setStatus(fStatus, (err && err.message) || 'Request failed.');
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
            setStatus(statusNote, (err && err.message) || 'Could not revoke device.');
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
        return Promise.all([sdk.getMe(), sdk.getSubscription(), sdk.getBillingHistory()]);
      }).then(function (all) {
        var me = all[0];
        var subRes = all[1];
        var billRes = all[2];
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
            setStatus(statusNote, 'Your VPN subscription has expired. Please renew your plan.');
          } else if (err.code === 'KEY_REVOKED') {
            setStatus(statusNote, 'Your VPN key has been revoked. Please contact support.');
          } else if (err.code === 'DEVICE_LIMIT_REACHED' || err.status === 409) {
            setStatus(statusNote, 'Device limit reached (5/5). Please revoke one of your connected devices below.');
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
          setStatus(document.querySelector('[data-profile-status]'), 'Profile saved.');
        }).catch(function (err) {
          setStatus(document.querySelector('[data-profile-status]'), (err && err.message) || 'Save failed.');
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
      passForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdk.changePassword({
          current_password: passForm.current_password.value,
          password: passForm.password.value,
          password_confirmation: passForm.password_confirmation.value
        }).then(function () {
          passForm.reset();
          setStatus(statusNote, 'Password updated.');
        }).catch(function (err) {
          setStatus(statusNote, (err && err.message) || 'Password update failed.');
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
      supportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdk.createSupportTicket({
          subject: supportForm.subject.value.trim(),
          message: supportForm.message.value.trim()
        }).then(function () {
          supportForm.reset();
          setStatus(statusNote, 'Support ticket submitted.');
        }).catch(function (err) {
          setStatus(statusNote, (err && err.message) || 'Support request failed.');
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
          navigator.clipboard.writeText(accessKey).then(function () { setStatus(statusNote, 'VPN key copied.'); });
        }
      });
    }
  }
}

module.exports = { initPortalSdkBridge: initPortalSdkBridge };
