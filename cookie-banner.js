/* ═══════════════════════════════════════════════════════
   Hair&Barber Revolution — Cookie Consent Banner
   Ricorda la scelta in localStorage: non chiede mai due volte.
   Chiave: 'hbr_cookie_consent'  |  Valori: 'granted' | 'denied'
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'hbr_cookie_consent';

  /* ── Applica il consenso a Google Analytics ── */
  function applyConsent(value) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: value });
    }
  }

  /* ── Leggi la scelta precedente ── */
  var saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (saved === 'granted') {
    applyConsent('granted');
    return; /* già accettato, nessun banner */
  }
  if (saved === 'denied') {
    return; /* già rifiutato, nessun banner */
  }

  /* ── Nessuna scelta precedente: mostra il banner ── */
  var style = document.createElement('style');
  style.textContent = [
    '#hbr-cookie-banner {',
    '  position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;',
    '  background: rgba(0,0,0,.97);',
    '  border-top: 1px solid rgba(255,255,255,.12);',
    '  color: #fff;',
    '  padding: 1.1rem 1.5rem;',
    '  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;',
    '  font-family: \'Segoe UI\', system-ui, sans-serif;',
    '  font-size: .8rem;',
    '  line-height: 1.5;',
    '  box-shadow: 0 -4px 24px rgba(0,0,0,.4);',
    '}',
    '#hbr-cookie-banner p { flex: 1; min-width: 200px; opacity: .75; max-width: 600px; }',
    '#hbr-cookie-banner p a { color: #fff; text-decoration: underline; opacity: 1; }',
    '#hbr-cookie-banner .hbr-cb-btns { display: flex; gap: .6rem; flex-shrink: 0; }',
    '#hbr-cb-accept {',
    '  background: #fff; color: #000; border: 1px solid #fff;',
    '  padding: .5rem 1.25rem;',
    '  font-size: .72rem; font-family: inherit; font-weight: 600;',
    '  text-transform: uppercase; letter-spacing: .12em;',
    '  cursor: pointer; transition: background .2s, color .2s;',
    '}',
    '#hbr-cb-accept:hover { background: #ddd; }',
    '#hbr-cb-reject {',
    '  background: transparent; color: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.3);',
    '  padding: .5rem 1.25rem;',
    '  font-size: .72rem; font-family: inherit; font-weight: 500;',
    '  text-transform: uppercase; letter-spacing: .12em;',
    '  cursor: pointer; transition: color .2s, border-color .2s;',
    '}',
    '#hbr-cb-reject:hover { color: #fff; border-color: rgba(255,255,255,.7); }',
    '@keyframes hbrBannerIn { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }',
    '#hbr-cookie-banner { animation: hbrBannerIn .4s ease; }'
  ].join('\n');
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'hbr-cookie-banner';
  banner.innerHTML =
    '<p>Utilizziamo cookie di analisi (Google Analytics) per migliorare il sito. Nessun dato personale viene venduto. ' +
    'Leggi la nostra <a href="privacy.html">Privacy Policy</a>.</p>' +
    '<div class="hbr-cb-btns">' +
    '  <button id="hbr-cb-reject">Rifiuta</button>' +
    '  <button id="hbr-cb-accept">Accetta tutto</button>' +
    '</div>';

  function hideBanner() {
    banner.style.transition = 'transform .3s ease, opacity .3s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function () { banner.remove(); }, 350);
  }

  function onAccept() {
    try { localStorage.setItem(STORAGE_KEY, 'granted'); } catch (e) {}
    applyConsent('granted');
    hideBanner();
  }

  function onReject() {
    try { localStorage.setItem(STORAGE_KEY, 'denied'); } catch (e) {}
    hideBanner();
  }

  /* Aspetta il DOM */
  function attachBanner() {
    document.body.appendChild(banner);
    document.getElementById('hbr-cb-accept').addEventListener('click', onAccept);
    document.getElementById('hbr-cb-reject').addEventListener('click', onReject);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBanner);
  } else {
    attachBanner();
  }
})();
