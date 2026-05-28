/* i18n.js — initializes i18next and wires up the language switcher */

const SUPPORTED_LANGS = ['en', 'hi', 'fr', 'es', 'de'];
const DEFAULT_LANG = 'en';

/* Resolve the root path regardless of how deep the page is */
function rootPath() {
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  return depth <= 0 ? './' : '../'.repeat(depth);
}

async function loadLocale(lang) {
  const url = rootPath() + 'locales/' + lang + '.json';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Could not load locale', lang, e);
    return {};
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const t = i18next.t(key);
    if (t !== key) el.textContent = t;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const t = i18next.t(key);
    if (t !== key) el.placeholder = t;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const t = i18next.t(key);
    if (t !== key) el.innerHTML = t;
  });
  /* Update lang attribute for accessibility */
  document.documentElement.lang = i18next.language;
}

function setActiveLangBtn(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

async function switchLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  const resources = await loadLocale(lang);
  await i18next.changeLanguage(lang);
  i18next.addResourceBundle(lang, 'translation', resources, true, true);
  localStorage.setItem('lang', lang);
  setActiveLangBtn(lang);
  applyTranslations();
}

async function initI18n() {
  const saved = localStorage.getItem('lang');
  const browser = navigator.language ? navigator.language.split('-')[0] : DEFAULT_LANG;
  const lang = SUPPORTED_LANGS.includes(saved) ? saved :
               SUPPORTED_LANGS.includes(browser) ? browser : DEFAULT_LANG;

  const resources = await loadLocale(lang);

  await i18next.init({
    lng: lang,
    fallbackLng: DEFAULT_LANG,
    resources: {
      [lang]: { translation: resources }
    },
    interpolation: { escapeValue: false }
  });

  applyTranslations();
  setActiveLangBtn(lang);

  /* Wire language buttons */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLang(btn.dataset.lang));
  });
}

/* ===== THEME TOGGLE ===== */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtn(next);
}

/* ===== HAMBURGER ===== */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
}

/* ===== FAQ ACCORDION ===== */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
      if (!isOpen) { btn.classList.add('open'); btn.nextElementSibling.classList.add('open'); }
    });
  });
}

/* ===== CONTACT FORM (demo) ===== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = document.getElementById('formSuccess');
    if (msg) { msg.style.display = 'block'; form.reset(); setTimeout(() => msg.style.display = 'none', 4000); }
  });
}

/* ===== BOOT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHamburger();
  initFaq();
  initContactForm();
  initI18n();

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
