/* global navigator */
'use strict';

var sdkFactory = require('./vpn-portal-sdk');

function initPortalSdkBridge() {
  var sdk = sdkFactory.createVpnPortalSdk({ brandSlug: 'luni' });

  function setStatus(el, msg) {
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
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
  if (forgotForm) {
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
    var accessKey = '';
    var revealed = false;

    function maskKey(k) {
      return k && k.length > 12 ? k.slice(0, 10) + '••••••••••••' + k.slice(-4) : '••••••••';
    }

    var keyEl = vpnPanel.querySelector('[data-sdk-vpn-key]');
    var serversBody = vpnPanel.querySelector('[data-sdk-servers]');
    var devicesBody = vpnPanel.querySelector('[data-sdk-devices]');
    var devicesCount = vpnPanel.querySelector('[data-sdk-devices-count]');
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
          }).then(renderDevices);
        });
        devicesBody.appendChild(tr);
      });
    }

    var ready = (!sdk.isAuthenticated() && sdk.mode === 'demo')
      ? sdk.login({ email: 'demo@lunivpn.com', password: 'demo-password' })
      : Promise.resolve();

    ready.then(function () {
      return sdk.getSubscription();
    }).then(function (subRes) {
      accessKey = (subRes && subRes.subscription && subRes.subscription.access_key) || '';
      if (keyEl) keyEl.textContent = maskKey(accessKey);
      return Promise.all([sdk.getBootstrap(accessKey), sdk.getDevices(accessKey)]);
    }).then(function (results) {
      var boot = results[0];
      var devRes = results[1];
      if (serversBody) {
        serversBody.innerHTML = '';
        ((boot && boot.servers) || []).forEach(function (srv) {
          var tr = document.createElement('tr');
          tr.innerHTML = '<td></td><td></td><td></td><td></td>';
          tr.children[0].textContent = srv.country_code + ' — ' + srv.name + (srv.is_recommended ? ' ★' : '');
          tr.children[1].textContent = srv.status;
          tr.children[2].textContent = srv.ping_ms ? srv.ping_ms + ' ms' : '—';
          tr.children[3].textContent = (srv.protocols || []).map(function (p) { return p.type; }).join(', ');
          serversBody.appendChild(tr);
        });
      }
      renderDevices(devRes);
    }).catch(function (err) {
      setStatus(statusNote, (err && err.message) || 'Unable to load VPN access data.');
    });

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
