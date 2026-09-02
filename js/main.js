/* =====================================
   MAIN.JS
   Behaviour for the terminal-native VAPT site. The system has a single cream
   canvas, so there is no theme toggle — the only interactive chrome is the
   nav drawer, the install tab strip, the copy button and the FAQ brackets.
   ===================================== */

const DOM = {
  query: (selector, root = document) => root.querySelector(selector),
  queryAll: (selector, root = document) => Array.from(root.querySelectorAll(selector)),
};

/* ---------------------------------------------------------------
   Scroll reveal — short fade-up, once per element.
   --------------------------------------------------------------- */
class ScrollAnimations {
  constructor() {
    this.elements = DOM.queryAll('.animate-on-scroll');
    this.init();
  }

  init() {
    if (!this.elements.length) return;

    if (!('IntersectionObserver' in window)) {
      this.elements.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    this.elements.forEach((el) => observer.observe(el));
  }
}

/* ---------------------------------------------------------------
   Stat counters — count up once the stat row is on screen.
   --------------------------------------------------------------- */
class AnimatedCounters {
  constructor() {
    this.counters = DOM.queryAll('.counter');
    this.init();
  }

  init() {
    if (!this.counters.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.counted) return;
          entry.target.dataset.counted = 'true';
          this.run(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach((el) => observer.observe(el));
  }

  run(el) {
    const target = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(target)) return;

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out so the number settles rather than snapping.
      const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    el.textContent = '0';
    requestAnimationFrame(tick);
  }
}

/* ---------------------------------------------------------------
   Mobile nav drawer — the CTA stays in the bar at every width.
   --------------------------------------------------------------- */
class MobileMenu {
  constructor() {
    this.button = DOM.query('[data-menu-toggle]');
    this.menu = DOM.query('[data-menu]');
    this.init();
  }

  init() {
    if (!this.button || !this.menu) return;

    this.button.addEventListener('click', () => this.toggle());

    DOM.queryAll('a', this.menu).forEach((link) => {
      link.addEventListener('click', () => this.close());
    });

    document.addEventListener('click', (event) => {
      if (this.menu.contains(event.target) || this.button.contains(event.target)) return;
      this.close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
  }

  toggle() {
    this.menu.classList.contains('active') ? this.close() : this.open();
  }

  open() {
    this.menu.classList.add('active');
    this.button.setAttribute('aria-expanded', 'true');
    this.button.textContent = '[x]';
  }

  close() {
    this.menu.classList.remove('active');
    this.button.setAttribute('aria-expanded', 'false');
    this.button.textContent = '[=]';
  }
}

/* ---------------------------------------------------------------
   Active nav link — underlines the section currently in view.
   --------------------------------------------------------------- */
class ActiveNavLink {
  constructor() {
    this.links = DOM.queryAll('.nav-link');
    this.sections = DOM.queryAll('main section[id]');
    this.init();
  }

  init() {
    if (!this.sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) this.setActive(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    this.sections.forEach((section) => observer.observe(section));
  }

  setActive(id) {
    this.links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }
}

/* ---------------------------------------------------------------
   Install tab strip — swaps the command shown in the snippet.
   --------------------------------------------------------------- */
class InstallTabs {
  constructor() {
    this.strip = DOM.query('[data-tabs]');
    this.target = DOM.query('[data-snippet-target]');
    this.init();
  }

  init() {
    if (!this.strip || !this.target) return;

    DOM.queryAll('.tab', this.strip).forEach((tab) => {
      tab.addEventListener('click', () => this.select(tab));
    });
  }

  select(tab) {
    DOM.queryAll('.tab', this.strip).forEach((other) => {
      const isActive = other === tab;
      other.classList.toggle('active', isActive);
      other.setAttribute('aria-selected', String(isActive));
    });

    this.target.textContent = tab.dataset.snippet || '';
  }
}

/* ---------------------------------------------------------------
   Copy button on the install snippet.
   --------------------------------------------------------------- */
class CopySnippet {
  constructor() {
    DOM.queryAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', () => this.copy(button));
    });
  }

  async copy(button) {
    const snippet = button.parentElement.querySelector('.snippet-code');
    if (!snippet) return;

    const text = snippet.textContent.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // file:// and plain http have no clipboard API — fall back to a
        // throwaway textarea so the button still works locally.
        const scratch = document.createElement('textarea');
        scratch.value = text;
        scratch.setAttribute('readonly', '');
        scratch.style.position = 'absolute';
        scratch.style.left = '-9999px';
        document.body.appendChild(scratch);
        scratch.select();
        document.execCommand('copy');
        scratch.remove();
      }
      this.flash(button, 'copied');
    } catch (error) {
      this.flash(button, 'failed');
    }
  }

  flash(button, label) {
    button.textContent = label;
    button.classList.add('copied');
    clearTimeout(button._resetTimer);
    button._resetTimer = setTimeout(() => {
      button.textContent = 'copy';
      button.classList.remove('copied');
    }, 1600);
  }
}

/* ---------------------------------------------------------------
   FAQ — plain bracket toggles, no chevrons, no animation chrome.
   --------------------------------------------------------------- */
class Faq {
  constructor() {
    // Several regions per page — the FAQ itself and the advisories archive.
    this.roots = DOM.queryAll('[data-faq]');
    this.init();
  }

  init() {
    this.roots.forEach((root) => {
      DOM.queryAll('.faq-question', root).forEach((button) => {
        button.addEventListener('click', () => this.toggle(button));
      });
    });
  }

  toggle(button) {
    const row = button.closest('.faq-row');
    const isOpen = row.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));

    const marker = button.querySelector('.faq-toggle');
    if (marker) marker.textContent = isOpen ? '−' : '+';
  }
}

/* ---------------------------------------------------------------
   Form validation — inline [!] messages, no colour signalling.
   --------------------------------------------------------------- */
class FormValidator {
  constructor() {
    DOM.queryAll('form[data-validate]').forEach((form) => {
      form.addEventListener('submit', (event) => this.handleSubmit(event, form));
    });
  }

  handleSubmit(event, form) {
    event.preventDefault();

    const fields = DOM.queryAll('[required]', form);
    let valid = true;

    fields.forEach((field) => {
      if (this.isValid(field)) {
        this.clearError(field);
      } else {
        valid = false;
        this.showError(field);
      }
    });

    if (!valid) {
      const firstBad = form.querySelector('.error');
      if (firstBad) firstBad.focus();
      return;
    }

    // Wire this to your backend. Until then, confirm receipt in place.
    form.reset();
    this.confirm(form);
  }

  isValid(field) {
    const value = field.value.trim();
    if (!value) return false;

    if (field.type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (field.type === 'tel') {
      return /^[0-9+\-\s()]{10,}$/.test(value);
    }

    return true;
  }

  showError(field) {
    field.classList.add('error');

    let message = field.nextElementSibling;
    if (!message || !message.classList.contains('error-message')) {
      message = document.createElement('span');
      message.className = 'error-message';
      field.insertAdjacentElement('afterend', message);
    }

    message.textContent = field.value.trim()
      ? `check the ${field.type === 'email' ? 'email address' : 'value'}`
      : 'this field is required';
  }

  clearError(field) {
    field.classList.remove('error');
    const message = field.nextElementSibling;
    if (message && message.classList.contains('error-message')) message.remove();
  }

  confirm(form) {
    let note = form.querySelector('.form-confirm');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-confirm meta';
      note.setAttribute('role', 'status');
      form.appendChild(note);
    }
    note.textContent = '[x] Received. We reply within one business day.';
  }
}

/* ---------------------------------------------------------------
   Back to top.
   --------------------------------------------------------------- */
class ScrollToTop {
  constructor() {
    this.button = DOM.query('#scrollToTop');
    this.init();
  }

  init() {
    if (!this.button) return;

    window.addEventListener(
      'scroll',
      () => this.button.classList.toggle('show', window.scrollY > 400),
      { passive: true }
    );

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ---------------------------------------------------------------
   Boot.
   --------------------------------------------------------------- */
function boot() {
  new ScrollAnimations();
  new AnimatedCounters();
  new MobileMenu();
  new ActiveNavLink();
  new InstallTabs();
  new CopySnippet();
  new Faq();
  new FormValidator();
  new ScrollToTop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
