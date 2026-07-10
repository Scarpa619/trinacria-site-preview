/* Trinacria Advisors: header state, mobile menu, scroll reveals.
   The hero mark draw and copy rise are pure CSS, gated on html.js
   and prefers-reduced-motion in main.css. The site reads fully with
   this file disabled. */
(function () {
  'use strict';

  /* The js class gates hidden-until-revealed styles, so it is set here,
     not inline in the head: if this file never runs, the site renders
     in its fully visible no-js layout instead of hiding content. */
  document.documentElement.className = 'js';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  /* Header: transparent over the hero, basalt after scroll */
  if (header) {
    var setState = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    setState();
    window.addEventListener('scroll', setState, { passive: true });
  }

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

  /* Scroll reveals: once, subtle, skipped under reduced motion */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
})();
