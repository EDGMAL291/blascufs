/* BLASC – Shared JavaScript */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAV SCROLL ──
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── ACTIVE NAV LINK ──
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').split(/[?#]/)[0];
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    const setMobileMenuOpen = (isOpen) => {
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('no-scroll', isOpen);
    };

    hamburger.addEventListener('click', () => {
      setMobileMenuOpen(!mobileMenu.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setMobileMenuOpen(false);
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMobileMenuOpen(false);
        hamburger.focus();
      }
    });
  }

  // ── ACCESSIBLE TABS ──
  const setupTabInterface = ({ tabListSelector, buttonSelector, panelSelector, panelPrefix }) => {
    const tabList = document.querySelector(tabListSelector);
    if (!tabList) return;

    const buttons = Array.from(tabList.querySelectorAll(buttonSelector));
    const panels = Array.from(document.querySelectorAll(panelSelector));
    if (!buttons.length || !panels.length) return;

    tabList.setAttribute('role', 'tablist');

    const getTargetId = (button) => {
      const target = button.dataset.tabTarget || '';
      return target.startsWith(panelPrefix) ? target : `${panelPrefix}${target}`;
    };

    const activateTab = (button, focus = false) => {
      const targetId = getTargetId(button);
      buttons.forEach(tabButton => {
        const isActive = tabButton === button;
        tabButton.classList.toggle('active', isActive);
        tabButton.setAttribute('aria-selected', String(isActive));
        tabButton.tabIndex = isActive ? 0 : -1;
      });
      panels.forEach(panel => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
      if (focus) button.focus();
    };

    buttons.forEach((button, index) => {
      const targetId = getTargetId(button);
      const panel = document.getElementById(targetId);
      if (!panel) return;
      if (!button.id) button.id = `${targetId}-tab`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', targetId);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);

      button.addEventListener('click', () => activateTab(button));
      button.addEventListener('keydown', (event) => {
        const currentIndex = buttons.indexOf(button);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        if (nextIndex !== currentIndex) {
          event.preventDefault();
          activateTab(buttons[nextIndex], true);
        }
      });

      const initiallyActive = button.classList.contains('active') || panel.classList.contains('active') || index === 0;
      button.setAttribute('aria-selected', String(initiallyActive));
      button.tabIndex = initiallyActive ? 0 : -1;
      panel.hidden = !initiallyActive;
    });

    const activeButton = buttons.find(button => button.classList.contains('active')) || buttons[0];
    activateTab(activeButton);
  };

  setupTabInterface({
    tabListSelector: '.prog-tabs',
    buttonSelector: '.tab-btn',
    panelSelector: '.tab-panel',
    panelPrefix: 'tab-'
  });
  setupTabInterface({
    tabListSelector: '.events-tabs',
    buttonSelector: '.etab',
    panelSelector: '.etab-panel',
    panelPrefix: 'etab-'
  });

  // ── FADE-UP INTERSECTION OBSERVER ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── LIGHTBOX ──
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lightbox-img');
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.classList.remove('no-scroll');
    };
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const img = el.querySelector('img');
        if (!img || !lbImg) return;
        lbImg.src = img.src;
        lbImg.alt = img.alt || 'BLASC UFS gallery image';
        lightbox.classList.add('open');
        document.body.classList.add('no-scroll');
      });
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  // ── FORM SUBMIT (demo) ──
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Sent';
        btn.style.background = '#16a34a';
        btn.disabled = true;
        btn.setAttribute('aria-live', 'polite');
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.disabled = false;
          btn.removeAttribute('aria-live');
          form.reset();
        }, 3000);
      }
    });
  });

  // ── GLOBAL ANIMATED SELECTS ──
  const enhancedSelects = new WeakSet();

  const closeAllAnimatedSelects = () => {
    document.querySelectorAll('.ui-select.open').forEach(wrapper => {
      wrapper.classList.remove('open');
      const toggle = wrapper.querySelector('.ui-select-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  };

  const syncAnimatedSelectToggle = (select) => {
    const wrapper = select.closest('.ui-select');
    if (!wrapper) return;
    const toggle = wrapper.querySelector('.ui-select-toggle');
    if (!toggle) return;
    const selectedOption = select.options[select.selectedIndex];
    const emptyOption = Array.from(select.options).find(option => option.value === '');
    toggle.textContent = selectedOption ? selectedOption.textContent : (emptyOption ? emptyOption.textContent : 'Select');

    wrapper.querySelectorAll('.ui-select-option').forEach((optionBtn) => {
      const isActive = optionBtn.dataset.value === select.value;
      optionBtn.classList.toggle('active', isActive);
      optionBtn.setAttribute('aria-selected', String(isActive));
    });
  };

  const enhanceAnimatedSelect = (select) => {
    if (!select || enhancedSelects.has(select)) return;
    if (select.dataset.nativeSelect === 'true') return;
    if (select.multiple) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ui-select';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ui-select-toggle';
    toggle.setAttribute('aria-haspopup', 'listbox');
    toggle.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('div');
    menu.className = 'ui-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', select.getAttribute('aria-label') || select.name || 'Select options');

    Array.from(select.options).forEach((option) => {
      if (!option.value) return;
      const optionBtn = document.createElement('button');
      optionBtn.type = 'button';
      optionBtn.className = 'ui-select-option';
      optionBtn.dataset.value = option.value;
      optionBtn.setAttribute('role', 'option');
      optionBtn.textContent = option.textContent;
      optionBtn.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncAnimatedSelectToggle(select);
        wrapper.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
      menu.appendChild(optionBtn);
    });

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);

    select.classList.add('ui-select-native');
    select.tabIndex = -1;

    toggle.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');
      closeAllAnimatedSelects();
      if (!isOpen) {
        wrapper.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!wrapper.classList.contains('open')) {
          closeAllAnimatedSelects();
          wrapper.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
        const firstOption = wrapper.querySelector('.ui-select-option');
        if (firstOption) firstOption.focus();
      }
    });

    select.addEventListener('change', () => syncAnimatedSelectToggle(select));

    const form = select.closest('form');
    if (form) {
      form.addEventListener('reset', () => {
        setTimeout(() => syncAnimatedSelectToggle(select), 0);
      });
    }

    syncAnimatedSelectToggle(select);
    enhancedSelects.add(select);
  };

  const enhanceAnimatedSelects = (root = document) => {
    root.querySelectorAll('select').forEach(enhanceAnimatedSelect);
  };
  window.blascEnhanceAnimatedSelects = enhanceAnimatedSelects;

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.ui-select')) closeAllAnimatedSelects();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllAnimatedSelects();
  });

  enhanceAnimatedSelects();

  const selectObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('select')) {
          enhanceAnimatedSelect(node);
          return;
        }
        enhanceAnimatedSelects(node);
      });
    });
  });
  selectObserver.observe(document.body, { childList: true, subtree: true });

});
