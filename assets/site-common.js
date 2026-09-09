/* ===========================================================
   Bar Los Ángeles — comportamiento compartido
   Carga header/footer, scroll, menú móvil, modal legal,
   selector de idioma (ES/EN/DE), lightbox y render de la carta.
   =========================================================== */

(async function () {
  const prefix = window.SITE_PREFIX || '';

  /* ---------- Inyección de partials ---------- */
  async function injectPartial(slotId, file) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    try {
      const res = await fetch(prefix + file, { cache: 'no-store' });
      let html = await res.text();
      html = html.split('{{PREFIX}}').join(prefix);
      slot.outerHTML = html;
    } catch (err) {
      console.error('No se pudo cargar ' + file, err);
    }
  }

  await injectPartial('site-header-slot', 'partials/header.html');
  await injectPartial('site-footer-slot', 'partials/footer.html');

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header con scroll + botón subir ---------- */
  const siteHeader = document.getElementById('site-header');
  const siteToTop = document.getElementById('toTop');
  if (siteHeader && siteToTop) {
    window.addEventListener('scroll', () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 40);
      siteToTop.classList.toggle('show', window.scrollY > 500);
    });
    siteToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Menú móvil ---------- */
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  /* ---------- Modal legal ---------- */
  const legalModal = document.getElementById('legalModal');
  if (legalModal) {
    const legalTabs = document.querySelectorAll('.legal-tab');
    const legalPanels = {
      aviso: document.getElementById('legalPanelAviso'),
      privacidad: document.getElementById('legalPanelPrivacidad'),
      cookies: document.getElementById('legalPanelCookies'),
    };
    function openLegal(tab) {
      legalModal.classList.add('open');
      legalTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-legal-panel') === tab));
      Object.entries(legalPanels).forEach(([key, el]) => el && el.classList.toggle('active', key === tab));
    }
    document.querySelectorAll('[data-legal-tab]').forEach(btn =>
      btn.addEventListener('click', () => openLegal(btn.getAttribute('data-legal-tab')))
    );
    legalTabs.forEach(btn =>
      btn.addEventListener('click', () => openLegal(btn.getAttribute('data-legal-panel')))
    );
    const legalClose = document.getElementById('legalClose');
    if (legalClose) legalClose.addEventListener('click', () => legalModal.classList.remove('open'));
    legalModal.addEventListener('click', e => { if (e.target === legalModal) legalModal.classList.remove('open'); });
  }

  /* ---------- Lightbox de la galería y de la carta ---------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lightboxImg');
    document.querySelectorAll('#galleryGrid figure img, .js-lightbox img').forEach(img => {
      img.parentElement.addEventListener('click', () => {
        lbImg.src = img.getAttribute('data-full') || img.src;
        lbImg.alt = img.alt || '';
        lightbox.classList.add('open');
      });
    });
    const lbClose = document.getElementById('lightboxClose');
    if (lbClose) lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
  }

  /* ===========================================================
     CARTA — se pinta desde menu-data.json (ES / EN / DE)
     =========================================================== */
  window.MENU_DATA = null;

  async function loadMenu() {
    const tabsEl = document.getElementById('cartaTabs');
    const panelEl = document.getElementById('cartaPanel');
    if (!tabsEl || !panelEl) return;
    try {
      const res = await fetch(prefix + 'menu-data.json', { cache: 'no-store' });
      window.MENU_DATA = await res.json();
      renderMenu(window.CURRENT_LANG || 'es');
    } catch (err) {
      console.error('No se pudo cargar la carta', err);
      panelEl.innerHTML = '<p class="carta-msg" data-i18n="carta_error"></p>';
      applyTranslations(window.CURRENT_LANG || 'es');
    }
  }

  function t(lang, key) {
    return (I18N[lang] && I18N[lang][key]) || (I18N.es && I18N.es[key]) || '';
  }

  function pick(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.es || field.en || '';
  }

  function renderMenu(lang) {
    const tabsEl = document.getElementById('cartaTabs');
    const panelEl = document.getElementById('cartaPanel');
    if (!tabsEl || !panelEl) return;

    const data = window.MENU_DATA;
    const cats = (data && data.categories) || [];

    if (!cats.length) {
      tabsEl.innerHTML = '';
      panelEl.innerHTML = '<p class="carta-msg">' + t(lang, 'carta_empty') + '</p>';
      return;
    }

    const currency = (data && data.currency) || '€';
    let active = window.CURRENT_CAT || cats[0].id;
    if (!cats.some(c => c.id === active)) active = cats[0].id;
    window.CURRENT_CAT = active;

    tabsEl.innerHTML = cats.map(c =>
      `<button type="button" class="carta-tab${c.id === active ? ' active' : ''}" data-cat="${c.id}">${pick(c.name, lang)}</button>`
    ).join('');

    panelEl.innerHTML = cats.map(c => {
      const sub = pick(c.sub, lang);
      const note = pick(c.note, lang);
      let body;

      if (c.type === 'grid') {
        body = `<div class="carta-grid">${(c.grid || []).map(g =>
          `<span>${pick(g, lang)}</span>`).join('')}</div>`;
      } else {
        body = `<div class="carta-list">${(c.items || []).map(it => {
          const price = pick(it.price, lang);
          const desc = pick(it.desc, lang);
          return `
            <div class="carta-item">
              <div class="ci-body">
                <div class="ci-name">${pick(it.name, lang)}</div>
                ${desc ? `<div class="ci-desc">${desc}</div>` : ''}
              </div>
              ${price ? `<div class="ci-price">${price} ${currency}</div>` : ''}
            </div>`;
        }).join('')}</div>`;
      }

      return `
        <div class="carta-panel${c.id === active ? ' active' : ''}" data-panel="${c.id}">
          ${sub ? `<p class="carta-catsub">${sub}</p>` : ''}
          ${body}
          ${note ? `<p class="carta-catnote">${note}</p>` : ''}
        </div>`;
    }).join('');

    tabsEl.querySelectorAll('.carta-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        window.CURRENT_CAT = cat;
        tabsEl.querySelectorAll('.carta-tab').forEach(b => b.classList.toggle('active', b === btn));
        panelEl.querySelectorAll('.carta-panel').forEach(p =>
          p.classList.toggle('active', p.getAttribute('data-panel') === cat)
        );
      });
    });
  }

  /* ===========================================================
     IDIOMA (ES / EN / DE)
     =========================================================== */
  const FLAGS = { es: '🇪🇸', en: '🇬🇧', de: '🇩🇪' };
  let currentLang = localStorage.getItem('angeles_lang') || 'es';
  if (!I18N[currentLang]) currentLang = 'es';

  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[lang] && I18N[lang][key] !== undefined) el.innerHTML = I18N[lang][key];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      // formato: "title:map_title" o "alt:some_key"
      el.getAttribute('data-i18n-attr').split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (I18N[lang] && I18N[lang][key] !== undefined) el.setAttribute(attr, I18N[lang][key]);
      });
    });
  }

  function setLanguage(lang) {
    currentLang = lang;
    window.CURRENT_LANG = lang;
    localStorage.setItem('angeles_lang', lang);
    document.documentElement.lang = lang;

    const langFlag = document.getElementById('langFlag');
    const langCode = document.getElementById('langCode');
    if (langFlag) langFlag.textContent = FLAGS[lang];
    if (langCode) langCode.textContent = lang.toUpperCase();

    document.querySelectorAll('[data-lang]').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-lang') === lang)
    );

    applyTranslations(lang);
    if (window.MENU_DATA) renderMenu(lang);
  }

  const langSwitch = document.getElementById('langSwitch');
  const langBtn = document.getElementById('langBtn');
  if (langSwitch && langBtn) {
    langBtn.addEventListener('click', e => { e.stopPropagation(); langSwitch.classList.toggle('open'); });
    document.querySelectorAll('[data-lang]').forEach(b => {
      b.addEventListener('click', () => { setLanguage(b.getAttribute('data-lang')); langSwitch.classList.remove('open'); });
    });
    document.addEventListener('click', () => langSwitch.classList.remove('open'));
  }

  setLanguage(currentLang);
  loadMenu();
})();
