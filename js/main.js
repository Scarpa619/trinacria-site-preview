/* Trinacria Advisors: header state, progress line, mobile menu,
   scroll reveals, numeral count up, hero mark rotation.
   The hero draw and copy rise are pure CSS, gated on html.js and
   prefers-reduced-motion. The site reads fully with this file disabled. */
(function () {
  'use strict';

  /* The js class gates hidden-until-revealed styles, so it is set here,
     not inline in the head: if this file never runs, the site renders
     in its fully visible no-js layout instead of hiding content. */
  document.documentElement.className = 'js';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var heroMark = document.querySelector('.hero-mark');

  /* progress line lives outside the header so it survives menu states */
  var line = document.createElement('div');
  line.className = 'progress-line';
  line.setAttribute('aria-hidden', 'true');
  document.body.appendChild(line);

  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 24);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    line.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    /* the emblem is three legs in motion: the hero mark turns
       almost imperceptibly as the page scrolls */
    if (heroMark && !reduced) {
      heroMark.style.transform = 'rotate(' + Math.min(y * 0.02, 14) + 'deg)';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
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

  /* Numeral count up, once, skipped under reduced motion.
     Markup already holds the final text; JS only animates toward it. */
  var counters = document.querySelectorAll('[data-count]');
  var animateCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1100, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Scroll reveals: once, subtle */
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
    counters.forEach(function (el) {
      if (!el.closest('.reveal')) {
        var solo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateCount(entry.target); solo.unobserve(entry.target); }
          });
        });
        solo.observe(el);
      }
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
})();
