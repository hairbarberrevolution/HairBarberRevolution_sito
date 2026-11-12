/* ═══════════════════════════════════════════════════════════════
   Hair&Barber Revolution - animazioni condivise delle sottopagine
   Nessuna libreria: IntersectionObserver per le comparse,
   un solo listener del puntatore per la luce sulle card.
   Se lo script non parte, tutto resta visibile (le regole che
   nascondono gli elementi dipendono dalla classe .js su <html>).
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Divide il titolo della testata in parole, per farle salire una alla volta */
  function splitWords(el) {
    if (!el || el.getAttribute('data-split')) return;
    var words = el.textContent.replace(/\s+/g, ' ').trim().split(' ');
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach(function (word, i) {
      var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', i); w.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span'); s.textContent = word; w.appendChild(s);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.setAttribute('data-split', '1');
  }

  /* Comparsa allo scroll: osserva ogni [data-reveal] non ancora visto.
     Va richiamata dopo che uno script ha inserito nuovo contenuto. */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;

  function reveal(root) {
    var els = (root || document).querySelectorAll('[data-reveal]:not([data-seen])');
    Array.prototype.forEach.call(els, function (el) {
      el.setAttribute('data-seen', '1');
      if (!io || reduce) { el.classList.add('in'); return; }
      io.observe(el);
    });
  }

  /* Luce che segue il puntatore sulle card .spot (un solo listener, aggiornato a ogni frame) */
  var raf = 0, lastEvt = null;
  if (!reduce && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      lastEvt = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var card = lastEvt.target.closest && lastEvt.target.closest('.spot');
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (lastEvt.clientX - r.left) + 'px');
        card.style.setProperty('--my', (lastEvt.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* Indice della Privacy: evidenzia la sezione che si sta leggendo */
  function tocSpy() {
    var links = document.querySelectorAll('.privacy-toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    Array.prototype.forEach.call(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(map).forEach(function (id) { map[id].classList.toggle('is-current', id === e.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* Parole in evidenza: ogni parola diventa un .hlw che riserva la larghezza del grassetto,
     poi diventa grassetto quando il testo entra nello schermo */
  function wrapHl(hl) {
    Array.prototype.slice.call(hl.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        var w = document.createElement('span'), t = document.createElement('span');
        w.className = 'hlw'; w.setAttribute('data-t', tok); t.textContent = tok;
        w.appendChild(t); frag.appendChild(w);
      });
      hl.replaceChild(frag, n);
    });
    /* la punteggiatura subito dopo resta attaccata all'ultima parola (niente virgole a capo da sole) */
    var nx = hl.nextSibling, last = hl.lastChild;
    if (nx && nx.nodeType === 3 && last && last.className === 'hlw') {
      var pm = /^[.,;:!?)]+/.exec(nx.textContent);
      if (pm) {
        var nw = document.createElement('span');
        nw.style.whiteSpace = 'nowrap';
        hl.replaceChild(nw, last);
        nw.appendChild(last);
        nw.appendChild(document.createTextNode(pm[0]));
        nx.textContent = nx.textContent.slice(pm[0].length);
      }
    }
  }
  function highlights() {
    var els = document.querySelectorAll('.hl');
    Array.prototype.forEach.call(els, function (el) {
      wrapHl(el);
      var sibs = el.parentNode.querySelectorAll('.hl');
      el.style.setProperty('--k', Array.prototype.indexOf.call(sibs, el));
    });
    if (!('IntersectionObserver' in window) || reduce) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('on'); });
      return;
    }
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); hio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(els, function (el) { hio.observe(el); });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.page-title'), splitWords);
    reveal();
    tocSpy();
    highlights();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.HBR = { reveal: reveal, splitWords: splitWords, highlights: highlights, reduceMotion: reduce };
})();
