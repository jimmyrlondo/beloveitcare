# Beloveit Care — Website

A static marketing website for Beloveit Care, an Ohio agency providing in-home and community-based support for youth and adults with disabilities.

---

## Quick start

This is a **static site** — no build step, no dependencies. Just upload the files to any web host (Netlify, Vercel, GitHub Pages, traditional hosting, S3, etc.).

To preview locally:

```bash
# from inside this folder, start any static server
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## File structure

```
beloveitcare/
├── index.html        # Home page
├── about.html        # About the agency
├── services.html     # 14 service offerings
├── careers.html      # Open positions + employment application
├── ask.html          # Contact form
├── base.css          # CSS reset + design tokens
├── style.css         # All component styling
├── app.js            # Site interactions + form submission
└── assets/
    ├── hero.png      # Home hero (multigenerational family)
    ├── about.png     # About page image (hands)
    ├── careers.png   # Careers image
    ├── logo.svg      # Brand mark
    └── favicon.svg   # Favicon
```

---

## Tech stack

- **Vanilla HTML5 / CSS3 / JavaScript** — no frameworks, no build pipeline
- **Web fonts**: Fraunces (display serif) + Inter (body sans) via Google Fonts
- **Color tokens**: defined as CSS custom properties at the top of `style.css`
  - `--color-primary` #5b2a86 (deep purple)
  - `--color-accent` #d68fd6 (orchid)
  - `--color-highlight` #ec0b43 (crimson)
  - `--color-graphite` #8a897c (warm gray)
  - `--color-bg` #ffffff (white)
- **Dark mode**: supported via `[data-theme="dark"]` attribute on `<html>`; toggle is in the header

---

## Forms

Both `ask.html` and `careers.html` contain submission forms. They are handled in `app.js`.

### Current setup: FormSubmit.co (no server needed)

Forms are submitted via AJAX to **FormSubmit.co**, a free service that forwards form submissions to email. No backend required.

**Configured in `app.js` (top of the form-submission IIFE):**

```js
const PRIMARY_EMAIL = 'a.nicole@upstarmhs.com';     // primary recipient
const CC_EMAIL = 'info@beloveitcare.com';            // CC on every submission
const ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(PRIMARY_EMAIL);
```

Every form submission delivers to `a.nicole@upstarmhs.com` with `info@beloveitcare.com` CC'd, subject prefixed `[Beloveit Care] {form name}`.

**The endpoint is already activated.** No further setup needed.

### Switching to your own backend (optional)

If you want to remove the FormSubmit dependency, replace the `fetch()` block in `app.js` with a POST to your own endpoint. The forms send standard FormData — any backend that accepts multipart/form-data will work.

Form HTML markers to look for:
- `form[data-blc-form]` — the selector the handler binds to
- `data-form-name` attribute — used to label the submission in the email subject
- `[data-form-status]` span — where the success/error message is rendered
- `.success-msg` — additional success banner that fades in

---

## Business info (used across pages)

- **Address**: 34734 Vine Street, Eastlake, OH 44095
- **Phone**: (216) 971-1023
- **Public email** (displayed on site): info@beloveitcare.com
- **Hours**: Mon–Fri 8:00 AM – 5:00 PM

---

## Open positions (careers.html)

10 roles currently listed. Each is a `.position-card` inside `.positions-grid`. To add/remove/edit positions, edit the markup directly in `careers.html` — the application form's position dropdown also lists them and should be kept in sync.

1. Registered Nurse (RN)
2. Licensed Practical Nurse (LPN)
3. State Tested Nursing Assistant (STNA)
4. Direct Support Professional (DSP)
5. Transportation Driver
6. Homemaker / Personal Care Aide
7. Social Worker
8. Behavioral Specialist
9. Adult Day Support Staff
10. Job Coach

---

## Services (services.html)

14 services in a 3-column responsive grid (`.services-grid.services-grid--numbered`). Each card has a gradient italic number badge and a 1–2 sentence description. To edit, modify the `.service-card` blocks directly.

---

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari, mobile Safari, Chrome Android). Uses `IntersectionObserver`, CSS custom properties, and modern CSS Grid/Flexbox.

---

## Notes for the developer

- **Image sizes**: hero/about/careers PNGs are large (2–3 MB each). Consider running through an image optimizer (TinyPNG, Squoosh) or converting to WebP for production.
- **No analytics installed** — add your preferred tracker (GA4, Plausible, Fathom) before launch if needed.
- **No cookie banner** — required if you add any cookie-setting analytics in EU/UK regions.
- **Favicon** is an inline SVG. Generate proper `.ico` + PNG variants if you need full browser/platform support.
- **Accessibility**: forms have labels, headings are semantic, color contrast meets WCAG AA. Recheck with axe DevTools after any changes.
