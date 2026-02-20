// ===== SYSTEM V2 — InCruises Landing Script =====

// Supabase config
const SUPABASE_URL = 'https://huhwkryymkqeyilpvxlx.supabase.co';

// IMPORTANT: Replace with your actual Supabase anon key
// Paste the full key from Supabase Dashboard > Settings > API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aHdrcnl5bWtxZXlpbHB2eGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDE2NTUsImV4cCI6MjA4MjA3NzY1NX0.j_OlHxmqVzY7CP8NaJ4u0lMBGZyd28GAbkYyvKaQuNU;'

/**
 * Read URL query parameter.
 * Example: https://site.com/?ref=ABCD -> getQueryParam('ref') === 'ABCD'
 */
function getQueryParam(name) {
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(name);
    return val ? String(val).trim() : null;
  } catch {
    return null;
  }
}

/**
 * Normalize phone (very light): remove spaces, parentheses, dashes.
 * Keeps + if present.
 */
function normalizePhone(raw) {
  if (!raw) return '';
  return String(raw).trim().replace(/[()\s-]/g, '');
}

/**
 * Messenger: map unsupported values to enum-safe ones.
 * Enum messenger_type = whatsapp, telegram, email, instagram, facebook, phone, other
 * We keep "viber" in UI, but store it as "other" in DB.
 */
function normalizeMessenger(m) {
  if (!m) return null;
  const v = String(m).toLowerCase().trim();
  if (v === 'viber') return 'other';
  const allowed = new Set(['whatsapp', 'telegram', 'email', 'instagram', 'facebook', 'phone', 'other']);
  return allowed.has(v) ? v : 'other';
}

/**
 * Collect UTM params (optional) for debugging/analytics in leads.next_action
 */
function collectUtm() {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const out = {};
  keys.forEach(k => {
    const v = getQueryParam(k);
    if (v) out[k] = v;
  });
  return out;
}

document.addEventListener('DOMContentLoaded', () => {
  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 50);
  });

  // ===== BURGER MENU =====
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('burger--active');
    nav.classList.toggle('nav--open');
    document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('burger--active');
      nav.classList.remove('nav--open');
      document.body.style.overflow = '';
    });
  });

  // ===== LANGUAGE SWITCH =====
  const langSwitch = document.getElementById('langSwitch');
  let currentLang = 'ru';

  langSwitch.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    document.documentElement.setAttribute('data-lang', currentLang);

    // Update switch UI
    langSwitch.querySelector('.lang-btn__active').textContent = currentLang.toUpperCase();
    langSwitch.querySelector('.lang-btn__inactive').textContent = currentLang === 'ru' ? 'EN' : 'RU';

    // Update all translatable elements
    document.querySelectorAll('[data-ru][data-en]').forEach(el => {
      const text = el.getAttribute(`data-${currentLang}`);
      if (text) el.textContent = text;
    });

    document.title = currentLang === 'ru'
      ? 'InCruises + SYSTEM V2 — Круизы мечты с AI-системой роста'
      : 'InCruises + SYSTEM V2 — Dream Cruises with AI Growth System';
  });

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.hero__metric-value');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const duration = 2200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.floor(eased * target);
        counter.textContent = target >= 1000 ? val.toLocaleString('ru-RU') : val;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(animateCounters, 600);
      heroObs.disconnect();
    }
  }, { threshold: 0.3 });
  const hero = document.getElementById('hero');
  if (hero) heroObs.observe(hero);

  // ===== REVEAL ON SCROLL =====
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
        setTimeout(() => entry.target.classList.add('reveal--visible'), delay);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ===== HERO PARTICLES =====
  const particles = document.getElementById('particles');
  if (particles) {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (40 + Math.random() * 60) + '%';
      p.style.animationDuration = (10 + Math.random() * 15) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      const size = 2 + Math.random() * 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      particles.appendChild(p);
    }
  }

  // ===== REVIEWS SLIDER =====
  const track = document.querySelector('.reviews__track');
  const cards = document.querySelectorAll('.review');
  const prevBtn = document.querySelector('.reviews__arrow--prev');
  const nextBtn = document.querySelector('.reviews__arrow--next');
  const dotsContainer = document.getElementById('reviewsDots');
  let slide = 0;
  const total = cards.length;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.classList.add('reviews__dot');
    if (i === 0) dot.classList.add('reviews__dot--active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(idx) {
    slide = idx;
    track.style.transform = `translateX(-${slide * 100}%)`;
    document.querySelectorAll('.reviews__dot').forEach((d, i) => {
      d.classList.toggle('reviews__dot--active', i === slide);
    });
  }

  prevBtn.addEventListener('click', () => goTo(slide === 0 ? total - 1 : slide - 1));
  nextBtn.addEventListener('click', () => goTo(slide === total - 1 ? 0 : slide + 1));

  let auto = setInterval(() => goTo(slide === total - 1 ? 0 : slide + 1), 6000);
  const slider = document.getElementById('reviewsSlider');
  slider.addEventListener('mouseenter', () => clearInterval(auto));
  slider.addEventListener('mouseleave', () => {
    auto = setInterval(() => goTo(slide === total - 1 ? 0 : slide + 1), 6000);
  });

  // Touch support
  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(slide === total - 1 ? 0 : slide + 1) : goTo(slide === 0 ? total - 1 : slide - 1);
    }
  }, { passive: true });

  // ===== FORM → SUPABASE =====
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  const modal = document.getElementById('successModal');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    const email = document.getElementById('email').value.trim();
    const phoneRaw = document.getElementById('phone').value.trim();
    const phone = normalizePhone(phoneRaw);

    const country = document.getElementById('country').value.trim();
    const cityEl = document.getElementById('city');
    const city = cityEl ? cityEl.value.trim() : '';

    const interestEl = document.getElementById('interest');
    const interest = interestEl ? (interestEl.value || '').trim() : '';

    const affordabilityEl = document.getElementById('affordability');
    const affordability = affordabilityEl ? (affordabilityEl.value || '').trim() : '';

    const messengerRaw = document.getElementById('messenger').value;
    const messenger = normalizeMessenger(messengerRaw);

    const messengerHandleRaw = document.getElementById('messengerHandle').value.trim();
    const messengerHandle = messengerHandleRaw || phone || null;

    const consent = document.getElementById('consent').checked;

    // ref code from URL: ?ref=XXXX
    const ref = getQueryParam('ref');
    const utm = collectUtm();

    // Validation
    if (!firstName || !email || !phone) {
      status.textContent = currentLang === 'ru'
        ? 'Заполните обязательные поля (имя, email, телефон)'
        : 'Please fill required fields (name, email, phone)';
      status.className = 'form-status form-status--error';
      return;
    }
    if (!consent) {
      status.textContent = currentLang === 'ru'
        ? 'Необходимо согласие на обработку данных'
        : 'Consent is required';
      status.className = 'form-status form-status--error';
      return;
    }

    // Show loading
    status.textContent = currentLang === 'ru' ? 'Отправка...' : 'Sending...';
    status.className = 'form-status form-status--loading';
    document.getElementById('submitBtn').disabled = true;

    // full/display names
    const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();

    // Store marketing meta in next_action (so we don't lose ref/utm on "temporary" landing)
    // Example: "ref=ABCD | utm_source=... | utm_campaign=..."
    const metaParts = [];
    if (ref) metaParts.push(`ref=${ref}`);
    Object.keys(utm).forEach(k => metaParts.push(`${k}=${utm[k]}`));
    const nextAction = metaParts.length ? metaParts.join(' | ') : null;

    // Build payload matching Supabase "leads" table
    // Fields we can fill without server-side lookup:
    // partner_id / sponsor_partner_id remain null until n8n resolves by ref
    const payload = {
      partner_id: null,
      sponsor_partner_id: null,

      source: 'landing',

      first_name: firstName,
      last_name: lastName || null,
      full_name: fullName || null,
      display_name: fullName || null,

      phone: phone,
      email: email,

      country: country || null,
      city: city || null,

      messenger: messenger,
      messenger_handle: messengerHandle,

      interest: interest || null,
      affordability: affordability || null,

      consent: !!consent,

      // We keep defaults for these, but setting them explicitly is OK:
      stage: 'new',
      temperature: 'cold',
      score: 0,

      // Save ref/utm here temporarily:
      next_action: nextAction
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        // Success
        status.textContent = '';
        status.className = 'form-status';
        form.reset();
        modal.classList.add('modal--active');
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Supabase error:', err);

        // If messenger enum fails, you'll see it here; but we normalize viber->other
        status.textContent = currentLang === 'ru'
          ? 'Ошибка отправки. Попробуйте ещё раз.'
          : 'Submission error. Please try again.';
        status.className = 'form-status form-status--error';
      }
    } catch (err) {
      console.error('Network error:', err);
      status.textContent = currentLang === 'ru'
        ? 'Ошибка сети. Проверьте подключение.'
        : 'Network error. Check your connection.';
      status.className = 'form-status form-status--error';
    }

    document.getElementById('submitBtn').disabled = false;
  });

  // Close modal
  const closeModal = () => modal.classList.remove('modal--active');
  modal.querySelector('.modal__close').addEventListener('click', closeModal);
  modal.querySelector('.modal__bg').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
});
