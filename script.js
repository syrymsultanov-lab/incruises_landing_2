// ===== SYSTEM V2 — InCruises Landing Script =====

const SUPABASE_URL = 'https://huhwkryymkqeyilpvxlx.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aHdrcnl5bWtxZXlpbHB2eGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDE2NTUsImV4cCI6MjA4MjA3NzY1NX0.j_OlHxmqVzY7CP8NaJ4u0lMBGZyd28GAbkYyvKaQuNU";

function getQueryParam(name) {
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(name);
    return val ? String(val).trim() : null;
  } catch {
    return null;
  }
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function normalizePhone(raw) {
  if (!raw) return '';
  return String(raw).trim().replace(/[()\s-]/g, '');
}

function normalizeMessenger(m) {
  if (!m) return null;
  const v = String(m).toLowerCase().trim();
  if (v === 'viber') return 'other';
  const allowed = new Set(['whatsapp','telegram','email','instagram','facebook','phone','other']);
  return allowed.has(v) ? v : 'other';
}

function collectUtm() {
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const out = {};
  keys.forEach(k => {
    const v = getQueryParam(k);
    if (v) out[k] = v;
  });
  return out;
}

document.addEventListener('DOMContentLoaded', () => {

  let currentLang = 'ru';

  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  const modal = document.getElementById('successModal');
  const submitBtn = document.getElementById('submitBtn');

  // ===== ATTRIBUTION =====
  const ref = getQueryParam('ref');
  const sponsorPartnerId = (ref && isUuid(ref)) ? ref : null;

  if (!sponsorPartnerId) {
    status.textContent = 'Эта форма работает только по персональной ссылке партнёра.';
    status.className = 'form-status form-status--error';
    submitBtn.disabled = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!sponsorPartnerId) {
      status.textContent = 'Нет ID партнёра в ссылке.';
      status.className = 'form-status form-status--error';
      return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = normalizePhone(document.getElementById('phone').value.trim());
    const country = document.getElementById('country').value.trim();
    const city = document.getElementById('city').value.trim();
    const messenger = normalizeMessenger(document.getElementById('messenger').value);
    const messengerHandle = document.getElementById('messengerHandle').value.trim() || phone;
    const consent = document.getElementById('consent').checked;

    if (!firstName || !email || !phone) {
      status.textContent = 'Заполните обязательные поля.';
      status.className = 'form-status form-status--error';
      return;
    }

    if (!consent) {
      status.textContent = 'Необходимо согласие.';
      status.className = 'form-status form-status--error';
      return;
    }

    status.textContent = 'Отправка...';
    status.className = 'form-status form-status--loading';
    submitBtn.disabled = true;

    const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();

    const utm = collectUtm();
    const metaParts = [];
    if (ref) metaParts.push(`ref=${ref}`);
    Object.keys(utm).forEach(k => metaParts.push(`${k}=${utm[k]}`));
    const nextAction = metaParts.length ? metaParts.join(' | ') : null;

    const payload = {
      partner_id: sponsorPartnerId,
      sponsor_partner_id: sponsorPartnerId,
      source: 'landing',

      first_name: firstName,
      last_name: lastName || null,
      full_name: fullName,
      display_name: fullName,

      phone: phone,
      email: email,

      country: country || null,
      city: city || null,

      messenger: messenger,
      messenger_handle: messengerHandle,

      interest: null,
      affordability: null,

      consent: true,
      stage: 'new',
      temperature: 'cold',
      score: 0,

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
        form.reset();
        modal.classList.add('modal--active');
        status.textContent = '';
      } else {
        status.textContent = 'Ошибка отправки.';
        status.className = 'form-status form-status--error';
      }
    } catch (err) {
      status.textContent = 'Ошибка сети.';
      status.className = 'form-status form-status--error';
    }

    submitBtn.disabled = false;
  });

  const closeModal = () => modal.classList.remove('modal--active');
  modal.querySelector('.modal__close').addEventListener('click', closeModal);
  modal.querySelector('.modal__bg').addEventListener('click', closeModal);
});
