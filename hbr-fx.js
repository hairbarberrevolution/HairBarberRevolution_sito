/* ═══════════════════════════════════════════════════════════════
   Hair&Barber Revolution - motion graphics condivise (tutte le pagine)
   Nessuna libreria. Ogni effetto è un miglioramento progressivo:
   se lo script non parte, o con "riduci movimento", la pagina resta
   completa e leggibile nel suo stato finale.

   1. Lettere dei titoli        [data-chars]
   2. Nastri di testo scorrevoli [data-marquee] (reagiscono allo scroll)
   3. Cursore che segue il mouse (solo computer)
   4. Bottoni magnetici         .btn, .icon-btn, [data-magnetic]
   5. Inclinazione 3D           [data-tilt]
   6. Numeri che contano        [data-count]
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var mm = window.matchMedia ? window.matchMedia.bind(window) : function () { return { matches: false }; };
  var reduce = mm('(prefers-reduced-motion: reduce)').matches;
  var fine = mm('(hover: hover) and (pointer: fine)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ── 1. Lettere: ogni carattere diventa uno <span class="ch"> con il suo indice ── */
  function splitChars(el) {
    if (el.getAttribute('data-chars') === 'done') return;
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = d.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--c', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
    el.setAttribute('data-chars', 'done');
  }
  each(d.querySelectorAll('[data-chars]'), splitChars);

  /* Numeri che contano fino al loro valore quando entrano nello schermo: [data-count="5" data-dec="1"] */
  (function () {
    var els = d.querySelectorAll('[data-count]');
    if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    var fmt = function (v, dec) { return v.toFixed(dec).replace('.', ','); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
        var t0 = performance.now(), dur = 1700;
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt(to * eased, dec);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    each(els, function (el) { io.observe(el); });
  })();

  /* Hero della home: lo sfondo e il titolo si spostano appena con il puntatore */
  (function () {
    var hero = d.getElementById('home');
    if (!hero || !fine || reduce) return;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    }, { passive: true });
  })();

  /* ── 2. Nastri scorrevoli ──
     Il contenuto viene ripetuto fino a riempire lo schermo, poi scorre in continuo.
     Lo scroll della pagina lo accelera, lo inclina e ne decide il verso. */
  var scrollV = 0, lastY = window.pageYOffset;
  var marquees = [];
  each(d.querySelectorAll('[data-marquee]'), function (box) {
    var track = box.firstElementChild;
    if (!track) return;
    var setHtml = track.innerHTML;
    var m = { box: box, track: track, x: 0, setW: 0, dir: box.getAttribute('data-marquee') === 'rev' ? -1 : 1,
              speed: parseFloat(box.getAttribute('data-speed')) || 60, live: false };
    function build() {
      track.innerHTML = setHtml;
      m.setW = track.scrollWidth;
      if (!m.setW) return;
      var copies = Math.ceil(box.clientWidth / m.setW) + 1, html = setHtml;
      for (var i = 0; i < copies; i++) html += setHtml;
      track.innerHTML = html;
    }
    build();
    m.build = build;
    marquees.push(m);
  });
  if (marquees.length) {
    var rz = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { marquees.forEach(function (m) { m.build(); }); }, 200);
    });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { marquees.forEach(function (m) { m.build(); }); });
  }
  if (marquees.length && !reduce) {
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          marquees.forEach(function (m) { if (m.box === e.target) m.live = e.isIntersecting; });
        });
      }, { rootMargin: '10% 0px' });
      marquees.forEach(function (m) { mio.observe(m.box); });
    } else marquees.forEach(function (m) { m.live = true; });

    var prev = performance.now(), flow = 1;
    (function tick(now) {
      var dt = Math.min(48, now - prev) / 1000; prev = now;
      var y = window.pageYOffset, dy = y - lastY; lastY = y;
      scrollV += (dy - scrollV) * (1 - Math.exp(-dt * 8));    /* velocità smussata, indipendente dai fotogrammi */
      if (Math.abs(scrollV) > 0.6) flow = scrollV < 0 ? -1 : 1;
      var boost = Math.min(Math.abs(scrollV) * 9, 900);
      var skew = Math.max(-7, Math.min(7, scrollV * 0.22));
      marquees.forEach(function (m) {
        if (!m.live || !m.setW) return;
        m.x -= (m.speed + boost) * dt * m.dir * flow;
        if (m.x <= -m.setW) m.x += m.setW;
        if (m.x > 0) m.x -= m.setW;
        m.track.style.transform = 'translate3d(' + m.x.toFixed(1) + 'px,0,0) skewX(' + (-skew * m.dir).toFixed(2) + 'deg)';
      });
      requestAnimationFrame(tick);
    })(prev);
  }

  /* ── 3. Cursore: un anello che segue il puntatore con un leggero ritardo.
     Si allarga sui link e mostra un'etichetta dove c'è [data-cursor].
     Il puntatore vero resta visibile. ── */
  if (fine && !reduce) {
    var cur = d.createElement('div');
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="cur-ring"></span><span class="cur-label"></span>';
    d.body.appendChild(cur);
    var label = cur.lastChild;
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false, shown = false;
    var loop = function () {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2) requestAnimationFrame(loop); else running = false;
    };
    d.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cx = tx; cy = ty; cur.classList.add('on'); }
      var t = e.target.closest ? e.target : null;
      var lab = t && t.closest('[data-cursor]');
      var link = t && t.closest('a, button, select, label, [role="button"]');
      var field = t && t.closest('input, textarea, iframe');
      cur.classList.toggle('is-label', !!lab);
      cur.classList.toggle('is-link', !lab && !!link);
      cur.classList.toggle('is-hidden', !!field);
      if (lab) label.textContent = lab.getAttribute('data-cursor');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    d.addEventListener('pointerover', function (e) { if (e.target.tagName === 'IFRAME') cur.classList.add('is-hidden'); }, { passive: true });
    d.addEventListener('pointerdown', function () { cur.classList.add('is-down'); }, { passive: true });
    d.addEventListener('pointerup', function () { cur.classList.remove('is-down'); }, { passive: true });
    root.addEventListener('mouseleave', function () { shown = false; cur.classList.remove('on'); });
  }

  /* ── 4. Bottoni magnetici: il bottone si sposta di pochi pixel verso il puntatore ── */
  if (fine && !reduce) {
    var mag = null;
    d.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest('.btn:not(.btn-block), .icon-btn, [data-magnetic]') : null;
      if (mag && mag !== el) { mag.style.translate = ''; mag = null; }
      if (!el) return;
      mag = el;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.translate = (dx * 12).toFixed(1) + 'px ' + (dy * 10).toFixed(1) + 'px';
    }, { passive: true });
  }

  /* ── 5. Inclinazione 3D degli elementi [data-tilt] ── */
  if (fine && !reduce) {
    each(d.querySelectorAll('[data-tilt]'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
      });
    });
  }
})();
