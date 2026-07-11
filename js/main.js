/* Trinacria Advisors: header state, mobile menu, scroll reveals,
   numeral count up, the golden thread, and scroll-linked motion.
   Hero draw and copy rise are pure CSS, gated on html.js and
   prefers-reduced-motion. The site reads fully with this file disabled. */
(function () {
  'use strict';

  /* The js class gates hidden-until-revealed styles, so it is set here:
     if this file never runs, the site renders fully visible. */
  document.documentElement.className = 'js';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var heroMark = document.querySelector('.hero-mark');
  var heroBox = document.querySelector('.hero .container');
  var brandMark = document.querySelector('.brand .mark');
  var glyphs = document.querySelectorAll('.divider-glyph svg');

  /* ---- the golden thread: winds down the light middle of the page ---- */
  var thread = null, threadPath = null, threadLen = 0, threadTop = 0, threadH = 0;

  var buildThread = function () {
    if (thread) { thread.remove(); }
    thread = null; threadPath = null;
    if (reduced || window.innerWidth < 1280) return;
    var main = document.querySelector('main');
    if (!main) return;
    var first = main.querySelector('.hero, .page-hero');
    var last = main.querySelector('.cta-band') || main.querySelector('.notfound');
    if (!first || !last || last === first) return;
    var top = first.offsetTop + first.offsetHeight + 40;
    var bottom = last.offsetTop - 60;
    var h = bottom - top;
    if (h < 900) return;

    var gutter = (window.innerWidth - 1100) / 2;
    var mid = Math.max(44, Math.min(gutter * 0.55, 84));
    var amp = Math.min(30, mid - 14);
    var wave = 640;
    var d = 'M' + mid + ' 0';
    var y = 0, i = 0;
    while (y < h) {
      var next = Math.min(y + wave, h);
      var x = mid + (i % 2 === 0 ? amp : -amp);
      d += ' C' + x + ' ' + (y + wave * 0.35) + ' ' + x + ' ' +
           (next - wave * 0.35) + ' ' + mid + ' ' + next;
      y = next; i++;
    }
    var ns = 'http://www.w3.org/2000/svg';
    thread = document.createElementNS(ns, 'svg');
    thread.setAttribute('class', 'thread');
    thread.setAttribute('aria-hidden', 'true');
    thread.setAttribute('width', mid * 2 + amp);
    thread.setAttribute('height', h);
    thread.style.top = top + 'px';
    thread.style.left = '0';
    threadPath = document.createElementNS(ns, 'path');
    threadPath.setAttribute('d', d);
    var dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', mid); dot.setAttribute('cy', h); dot.setAttribute('r', 3.5);
    thread.appendChild(threadPath);
    thread.appendChild(dot);
    main.style.position = 'relative';
    main.appendChild(thread);
    threadLen = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = threadLen;
    threadPath.style.strokeDashoffset = threadLen;
    threadTop = top; threadH = h;
  };

  /* ---- one scroll handler drives everything ---- */
  var vh = window.innerHeight;
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (reduced) return;
    if (heroMark) heroMark.style.transform = 'rotate(' + Math.min(y * 0.05, 30) + 'deg)';
    if (brandMark) brandMark.style.transform = 'rotate(' + (y * 0.04) + 'deg)';
    glyphs.forEach(function (g) { g.style.transform = 'rotate(' + (y * 0.06) + 'deg)'; });
    if (heroBox && y < vh * 1.2) {
      var f = Math.min(y / (vh * 0.9), 1);
      heroBox.style.opacity = String(1 - f * 0.85);
      heroBox.style.transform = 'translateY(' + (y * 0.16) + 'px)';
    }
    if (thread && threadPath) {
      var p = (y + vh * 0.82 - threadTop) / threadH;
      p = Math.max(0, Math.min(p, 1));
      threadPath.style.strokeDashoffset = String(threadLen * (1 - p));
      thread.classList.toggle('done', p > 0.995);
    }
  };

  var onResize = function () {
    vh = window.innerHeight;
    buildThread();
    onScroll();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  /* ---- mobile menu ---- */
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- numeral count up, once ---- */
  var animateCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1100, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---- scroll reveals ---- */
  var targets = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          entry.target.querySelectorAll('[data-count]').forEach(animateCount);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* thread waits for fonts/layout to settle */
  if (document.readyState === 'complete') { buildThread(); onScroll(); }
  else window.addEventListener('load', function () { buildThread(); onScroll(); });
})();
