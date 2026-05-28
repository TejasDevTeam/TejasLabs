/* i18n.js — initializes i18next and wires up the language switcher */

const SUPPORTED_LANGS = ['en', 'hi', 'fr', 'es', 'de'];
const DEFAULT_LANG = 'en';

/* Resolve the root path regardless of how deep the page is.
   On GitHub Pages the pathname starts with /reponame/, adding an extra level. */
function rootPath() {
  const slashes = (window.location.pathname.match(/\//g) || []).length;
  const isGitHubPages = window.location.hostname.endsWith('github.io');
  const depth = slashes - 1 - (isGitHubPages ? 1 : 0);
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

/* ===== CONTACT FORM ===== */
const WEB3FORMS_KEY = '9afa997e-87a9-4057-aca3-2e5007f82d74';
const SHEETS_URL    = 'https://script.google.com/macros/s/AKfycbw7nc9NkHG7Uvgt1z-1OuFAUWduQTQkCyLX62jTLafqKaGODUrZSSS1vHHgeKVk_Mvn5g/exec';

/* Generate a unique support ticket token e.g. DTT-A3X9K2M1
   Uses unambiguous chars (no 0/O, 1/I) for easy readability */
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let t = 'DTT-';
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

async function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn        = form.querySelector('.btn-submit');
    const successDiv = document.getElementById('formSuccess');
    const errorDiv   = document.getElementById('formError');
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv)   errorDiv.style.display   = 'none';

    const origText  = btn.textContent;
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    const token = generateToken();

    /* Collect form data */
    const raw = {
      token,
      name:    form.querySelector('[name="name"]').value.trim(),
      email:   form.querySelector('[name="email"]').value.trim(),
      subject: form.querySelector('[name="subject"]').value.trim(),
      app:     form.querySelector('[name="app"]').value,
      message: form.querySelector('[name="message"]').value.trim(),
    };

    let ok = false;

    try {
      /* 1 — Web3Forms (email notification) */
      const fd = new FormData();
      fd.append('access_key', WEB3FORMS_KEY);
      fd.append('subject',    '[' + token + '] Support — ' + raw.subject);
      fd.append('from_name',  'DevTeamTejas Support');
      Object.entries(raw).forEach(([k, v]) => fd.append(k, v));

      const w3res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const w3json = await w3res.json();
      ok = w3json.success;

      /* 2 — Google Sheets (storage) */
      if (SHEETS_URL) {
        fetch(SHEETS_URL, {
          method:  'POST',
          mode:    'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(raw),
        }).catch(() => {});
      }
    } catch (_) { ok = false; }

    btn.disabled    = false;
    btn.textContent = origText;

    if (ok) {
      if (successDiv) {
        successDiv.innerHTML =
          '<strong>Message sent successfully!</strong><br>' +
          'Your reference token is: <strong style="font-size:1.15rem;letter-spacing:0.08em;font-family:monospace">' + token + '</strong><br>' +
          '<small style="opacity:0.85">Please save this token — quote it in any follow-up email so we can find your case instantly.</small>';
        successDiv.style.display = 'block';
      }
      form.reset();
      setTimeout(() => { if (successDiv) successDiv.style.display = 'none'; }, 12000);
    } else {
      if (errorDiv) errorDiv.style.display = 'block';
    }
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
