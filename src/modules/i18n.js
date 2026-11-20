const dictionaries = require('../data/locales.json');

const fallback = 'en';
const storageKey = 'lunivpn-language';
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const boundSelects = new WeakSet();
let language = fallback;

function format(template, params) {
  if (!params || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (
    owns(params, key) && params[key] !== undefined && params[key] !== null ? String(params[key]) : ''
  ));
}

function t(key, params) {
  let value = null;
  if (owns(dictionaries[language], key)) value = dictionaries[language][key];
  else if (owns(dictionaries[fallback], key)) value = dictionaries[fallback][key];
  return value !== null ? format(value, params) : null;
}

function getLanguage() {
  return language;
}

function translate(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  const attributes = ['aria-label', 'placeholder', 'title', 'content'];
  const selector = ['[data-i18n]', ...attributes.map((name) => '[data-i18n-' + name + ']')].join(',');
  const elements = [...root.querySelectorAll(selector)];
  if (root.matches && root.matches(selector)) elements.unshift(root);
  elements.forEach((element) => {
    if (element.hasAttribute('data-i18n')) {
      const value = t(element.dataset.i18n);
      if (value !== null) element.textContent = value;
    }
    attributes.forEach((attribute) => {
      const key = element.getAttribute('data-i18n-' + attribute);
      if (key) {
        const value = t(key);
        if (value !== null) element.setAttribute(attribute, value);
      }
    });
  });
}

function setLanguage(value) {
  language = owns(dictionaries, value) ? value : fallback;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    translate();
    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = language;
    });
  }
  try {
    window.localStorage.setItem(storageKey, language);
  } catch {
    /* Storage may be unavailable. */
  }
  if (typeof document !== 'undefined' && typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
    document.dispatchEvent(new window.CustomEvent('languagechange', { detail: { language } }));
  }
}

function initI18n(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('[data-language-select]').forEach((select) => {
    if (boundSelects.has(select)) return;
    boundSelects.add(select);
    select.replaceChildren();
    Object.keys(dictionaries).forEach((code) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = dictionaries[code]['language.name'] || code.toUpperCase();
      select.appendChild(option);
    });
    select.addEventListener('change', () => setLanguage(select.value));
  });

  let saved = fallback;
  try {
    saved = window.localStorage.getItem(storageKey) || fallback;
  } catch {
    /* Use default English. */
  }
  setLanguage(saved);
}

module.exports = { t, translate, setLanguage, getLanguage, initI18n };
