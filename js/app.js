/* =====================================
   APP.JS — v2 behaviour
   Vanilla, no dependencies, no build step. Every widget degrades to readable
   static content if JS never runs.
   ===================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Scroll reveal ---------------------------------------------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Mobile nav + services dropdown ----------------------------- */
  (function nav() {
    var toggle = $('[data-nav-toggle]');
    var links = $('[data-nav-links]');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    $$('[data-menu-trigger]').forEach(function (btn) {
      var menu = document.getElementById(btn.getAttribute('aria-controls'));
      if (!menu) return;
      menu.hidden = true;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        closeMenus();
        menu.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    function closeMenus() {
      $$('[data-menu-trigger]').forEach(function (b) {
        var m = document.getElementById(b.getAttribute('aria-controls'));
        if (m) { m.hidden = true; }
        b.setAttribute('aria-expanded', 'false');
      });
    }

    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMenus();
        if (links && links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
        }
      }
    });
  })();

  /* ---------- FAQ accordion ---------------------------------------------- */
  (function faq() {
    $$('.faq-q').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = btn.getAttribute('aria-expanded') !== 'true';
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  })();

  /* ---------- Industry tabs ---------------------------------------------- */
  (function tabs() {
    var list = $('[data-tabs]');
    if (!list) return;
    var buttons = $$('[role="tab"]', list);

    function select(btn) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) { p.hidden = !on; }
      });
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(btn); });
      btn.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = buttons[(i + d + buttons.length) % buttons.length];
        select(next);
        next.focus();
      });
    });

    select(buttons[0]);
  })();

  /* ---------- "Which test do I need?" ------------------------------------
     A recommendation tool, not a scanner. It maps answers to service names
     and never reports on the visitor's actual security. */
  (function wizard() {
    var form = $('[data-wizard]');
    if (!form) return;
    var out = $('[data-wizard-out]');
    var list = $('[data-wizard-list]');
    var note = $('[data-wizard-note]');

    var BY_ASSET = {
      website: ['Web Application VAPT'],
      mobile: ['Mobile Application VAPT'],
      api: ['API Security Testing'],
      network: ['Network VAPT'],
      cloud: ['Cloud Security Assessment'],
      multiple: ['Web Application VAPT', 'API Security Testing', 'Network VAPT']
    };

    function recommend() {
      var data = new FormData(form);
      var asset = data.get('asset');
      if (!asset) return;

      var picks = (BY_ASSET[asset] || []).slice();
      var why = [];

      if (data.get('login') === 'yes' && picks.indexOf('API Security Testing') === -1 && asset !== 'network') {
        picks.push('API Security Testing');
        why.push('because logged-in features almost always sit on an API');
      }
      if (data.get('public') === 'yes' && picks.indexOf('External Security Assessment') === -1) {
        picks.push('External Security Assessment');
        why.push('because anything on the public internet is reachable by anyone');
      }
      if (data.get('compliance') === 'yes') {
        picks.push('Compliance Evidence Pack');
        why.push('so findings map to the controls your auditor asks about');
      }
      picks.push('Free Retest');

      list.innerHTML = '';
      picks.forEach(function (p) {
        var li = document.createElement('li');
        li.className = 'tag';
        li.textContent = p;
        list.appendChild(li);
      });

      note.textContent = why.length
        ? 'We added the extras ' + why.join(', and ') + '.'
        : 'This is the smallest scope that still covers your main risk.';

      out.hidden = false;
    }

    form.addEventListener('change', recommend);
  })();

  /* ---------- Forms -------------------------------------------------------
     One handler for both the home quote form and the contact form.

     Validation here is for fast feedback only — it is NOT a security control.
     Anything that reaches the endpoint still has to be validated server side.

     Submission is off until you set data-endpoint on the form. Until then the
     form says plainly that nothing was sent, rather than pretending. */
  (function forms() {
    var MIN_FILL_MS = 3000;   // a human cannot read and complete this faster

    $$('[data-lead-form], form[data-validate]').forEach(function (form) {
      var openedAt = Date.now();
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      var button = form.querySelector('button[type="submit"], .btn[type="submit"]');
      var buttonText = button ? button.textContent : '';

      function slotFor(field) {
        var slot = form.querySelector('[data-error-for="' + field.name + '"]');
        if (!slot && field.parentNode) {
          slot = field.parentNode.querySelector('.field-error');
          if (!slot) {
            slot = document.createElement('span');
            slot.className = 'field-error';
            slot.setAttribute('role', 'alert');
            field.parentNode.appendChild(slot);
          }
        }
        return slot;
      }

      function status() {
        var el = form.querySelector('[data-form-status], .form-status');
        if (!el) {
          el = document.createElement('p');
          el.className = 'form-status';
          el.setAttribute('role', 'status');
          form.appendChild(el);
        }
        return el;
      }

      function say(kind, message) {
        var el = status();
        el.className = 'form-status ' + kind;
        el.textContent = message;
      }

      function check(field) {
        var v = (field.value || '').trim();
        var msg = '';
        if (field.required && !v) {
          msg = 'This field is required.';
        } else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          msg = 'Enter a valid work email address.';
        }
        var slot = slotFor(field);
        if (slot) { slot.textContent = msg; }
        if (msg) { field.setAttribute('aria-invalid', 'true'); }
        else { field.removeAttribute('aria-invalid'); }
        return !msg;
      }

      var fields = $$('.input, .select, .textarea', form).filter(function (f) {
        return f.name !== '_gotcha';
      });

      fields.forEach(function (f) {
        f.addEventListener('blur', function () { check(f); });
      });

      function busy(on) {
        if (!button) return;
        button.disabled = on;
        button.textContent = on ? 'Sending…' : buttonText;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Two quiet spam checks. Neither inconveniences a real person.
        var trap = form.querySelector('[name="_gotcha"]');
        if (trap && trap.value) { return; }
        if (Date.now() - openedAt < MIN_FILL_MS) {
          say('err', 'That was submitted a little too quickly. Please try again.');
          return;
        }

        if (!fields.map(check).every(Boolean)) {
          say('err', 'Please fix the highlighted fields and try again.');
          var first = form.querySelector('[aria-invalid="true"]');
          if (first) { first.focus(); }
          return;
        }

        if (!endpoint) {
          say('ok', 'Thanks — this form is not connected to a backend yet, so nothing was sent. Email us directly in the meantime.');
          return;
        }

        busy(true);
        say('', 'Sending your request…');

        fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) { throw new Error('HTTP ' + res.status); }
          form.reset();
          say('ok', 'Thanks — we have your request. Expect a reply within one working day.');
        }).catch(function () {
          say('err', 'Something went wrong sending that. Please email us directly and we will pick it up.');
        }).then(function () {
          busy(false);
        });
      });
    });
  })();


  /* ---------- Pending image slots ----------------------------------------
     Open any page with ?slots to see which images are still missing and the
     size each one expects. Off by default so a visitor never sees a hole. */
  if (/[?&]slots/.test(window.location.search)) {
    document.body.classList.add('show-slots');
  }

  /* ---------- Footer year -------------------------------------------------- */
  var y = $('[data-year]');
  if (y) { y.textContent = String(new Date().getFullYear()); }
})();
