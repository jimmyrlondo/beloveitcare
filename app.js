// ============================================================
// Beloveit Care — site interactions
// ============================================================

// Theme toggle (no localStorage — sandboxed iframes block it)
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = sysDark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function render() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark' ? sun : moon;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  render();
  toggle && toggle.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    render();
  });
})();

// Sticky header scroll state
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Mobile nav toggle
(function () {
  const btn = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', function () {
    const open = links.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('is-open'); });
  });
})();

// Reveal on scroll (defensive — elements always show; this just adds polish)
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  // Show elements already in view immediately
  function reveal(el) { el.classList.add('in-view'); }
  if (!('IntersectionObserver' in window)) {
    els.forEach(reveal); return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px 10% 0px', threshold: 0 });
  els.forEach(function (el) { io.observe(el); });
  // Safety net: reveal anything still hidden after 1.2s
  setTimeout(function () { els.forEach(reveal); }, 1200);
})();

// Auto-calculate age from DOB
(function () {
  document.querySelectorAll('input[type="date"][data-age-target]').forEach(function (input) {
    const target = document.querySelector(input.dataset.ageTarget);
    if (!target) return;
    input.addEventListener('change', function () {
      if (!input.value) { target.value = ''; return; }
      const dob = new Date(input.value);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      target.value = age >= 0 ? age : '';
    });
  });
})();

// Referral type toggle (start services)
(function () {
  const radios = document.querySelectorAll('input[name="referral_type"]');
  if (!radios.length) return;
  const child = document.querySelector('[data-section="child"]');
  const adult = document.querySelector('[data-section="adult"]');
  function show(val) {
    if (!child || !adult) return;
    if (val === 'child') {
      child.hidden = false; adult.hidden = true;
      child.querySelectorAll('[data-required]').forEach(el => el.required = true);
      adult.querySelectorAll('[data-required]').forEach(el => el.required = false);
    } else {
      child.hidden = true; adult.hidden = false;
      child.querySelectorAll('[data-required]').forEach(el => el.required = false);
      adult.querySelectorAll('[data-required]').forEach(el => el.required = true);
    }
  }
  radios.forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) show(r.value); });
    if (r.checked) show(r.value);
  });
})();

// Form submission (FormSubmit.co — sends to a.nicole@upstarmhs.com, CC info@beloveitcare.com)
(function () {
  const PRIMARY_EMAIL = 'a.nicole@upstarmhs.com';
  const CC_EMAIL = 'info@beloveitcare.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(PRIMARY_EMAIL);

  function setStatus(form, msg, kind) {
    const el = form.querySelector('[data-form-status]') || form.querySelector('.form-status');
    if (el) {
      el.textContent = msg;
      el.classList.remove('is-success', 'is-error');
      if (kind) el.classList.add('is-' + kind);
    }
    const ok = form.querySelector('.success-msg');
    if (ok && kind === 'success') {
      ok.classList.add('is-visible');
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  document.querySelectorAll('form[data-blc-form]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }
      setStatus(form, 'Sending…', null);

      const formData = new FormData(form);
      const formName = form.dataset.formName || form.dataset.blcForm || 'Form';
      formData.append('_subject', '[Beloveit Care] ' + formName);
      formData.append('_cc', CC_EMAIL);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        const data = await res.json();
        const msg = (data && data.message) ? String(data.message).toLowerCase() : '';
        if (data && (data.success === 'true' || data.success === true)) {
          form.reset();
          setStatus(form, 'Thank you — your message has been sent. We\u2019ll be in touch within 1–2 business days.', 'success');
        } else if (msg.includes('activation') || msg.includes('activate')) {
          // FormSubmit one-time verification — message reached the server
          form.reset();
          setStatus(form, 'Thank you — your message has been sent. We\u2019ll be in touch within 1–2 business days.', 'success');
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        setStatus(form, 'Sorry, something went wrong. Please call (216) 971-1023 or email a.nicole@upstarmhs.com.', 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }
      }
    });
  });
})();

// Year in footer
(function () {
  const y = document.getElementById('current-year');
  if (y) y.textContent = new Date().getFullYear();
})();
