# TejasWeb — Antigravity Apps Static Site

Plain HTML/CSS/JS. No build step. Works by opening `index.html` locally or via GitHub Pages.

---

## Deploy to GitHub Pages (free)

### 1 — Create the repo

```bash
cd /path/to/TejasWeb
git init
git add .
git commit -m "Initial site"
```

Create a new **public** repo on GitHub named e.g. `antigravity-apps` (no README, no .gitignore).

```bash
git remote add origin https://github.com/YOUR_USERNAME/antigravity-apps.git
git branch -M main
git push -u origin main
```

### 2 — Enable GitHub Pages

1. Go to the repo on GitHub → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Click **Save**

Your site will be live at:
`https://YOUR_USERNAME.github.io/antigravity-apps/`

### 3 — Custom domain (optional)

Add a `CNAME` file to the repo root containing your domain (e.g. `apps.yourdomain.com`), then point a CNAME DNS record at `YOUR_USERNAME.github.io`.

---

## Customise your apps

### Replace placeholder content

Edit **`locales/en.json`** (and the other locale files) to fill in real app names, taglines, descriptions, and feature text.

For each app, also update:
- `apps/appN/index.html` — change the emoji icon in the `.app-hero-icon` div and the `<title>` tag
- `apps/appN/index.html` — replace the two `<a href="#">` store badge links with your real App Store / Google Play URLs
- `apps/appN/index.html` — replace `src="about:blank"` in the `<iframe>` with your YouTube embed URL

### Add real screenshots

Drop screenshot images into `assets/` (or `apps/appN/`), then replace the `.screenshot-placeholder` divs with:

```html
<img src="../../assets/screenshot1.png" alt="Screenshot 1" />
```

### Update the contact email

Search-replace `support@example.com` with your real support email across all HTML files and locale JSON files.

### Add your mailing address (GDPR)

Each `apps/appN/privacy.html` has a `<!-- TODO: Add your mailing address -->` comment. Fill it in.

---

## i18n — adding/editing translations

All translatable strings live in `locales/en.json` (and `hi.json`, `fr.json`, `es.json`, `de.json`).

- Add a new key in all 5 files
- In HTML, use `data-i18n="your.key"` on the element
- For HTML content (bold, links), use `data-i18n-html="your.key"`
- For placeholder text, use `data-i18n-placeholder="your.key"`

Language preference is saved to `localStorage` automatically.

---

## File structure

```
/
├── index.html              ← Landing page (all 7 apps)
├── apps/
│   ├── app1/
│   │   ├── index.html      ← App detail: screenshots, features, how-to, video
│   │   ├── privacy.html    ← GDPR-compliant privacy policy
│   │   └── support.html    ← FAQ + contact form
│   └── app2/ … app7/
├── locales/
│   ├── en.json
│   ├── hi.json
│   ├── fr.json
│   ├── es.json
│   └── de.json
└── assets/
    ├── css/style.css
    └── js/i18n.js
```

---

## Dark mode

The theme toggle button (🌙 / ☀️) in the navbar switches between light and dark mode. The preference is saved to `localStorage`.

---

## Notes

- The contact form shows a success message on submit but does **not** send email (GitHub Pages is static). To make it functional, integrate a service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — both have free tiers. Replace the form `action` attribute.
- i18next is loaded from jsDelivr CDN. The site requires an internet connection or a local HTTP server (not `file://`) for locale JSON files to load. Use `npx serve .` or Python's `python3 -m http.server` for local testing.
