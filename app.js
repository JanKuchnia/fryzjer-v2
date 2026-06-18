// Hair Service Pracownia Fryzjerska - Redesign Interactivity Core
document.addEventListener('DOMContentLoaded', () => {
  initLucide();
  initHeaderScroll();
  initScrollReveals();
  initMobileMenu();
  initBookingModal();
  initServicesTabs();
  initContactForm();
  updateBusinessHoursStatus();
});

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   0. HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  function checkScroll() {
    if (window.scrollY > 50) {
      header.classList.remove('header-transparent');
    } else {
      header.classList.add('header-transparent');
    }
  }

  // Initial check
  checkScroll();

  window.addEventListener('scroll', checkScroll, { passive: true });
}

/* ==========================================================================
   00. SCROLL REVEALS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target); // Reveal only once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   1. MOBILE MENU DRAWER
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = document.getElementById('close-menu');

  if (!menuToggle || !mobileMenu) return;

  // Create an overlay element dynamically for better UX
  let overlay = document.getElementById('mobile-menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobile-menu-overlay';
    overlay.className = 'fixed inset-0 bg-[#000000]/40 z-50 opacity-0 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(overlay);
  }

  function getFocusable() {
    return Array.from(
      mobileMenu.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[hidden]') && !el.closest('.hidden'));
  }

  function trapFocus(e) {
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      closeMenuFn();
    }
  }

  function openMenu() {
    mobileMenu.classList.remove('translate-x-full');
    mobileMenu.classList.add('translate-x-0');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.removeAttribute('aria-hidden');
    mobileMenu.addEventListener('keydown', trapFocus);
    document.body.style.overflow = 'hidden';
    
    // Focus close button
    requestAnimationFrame(() => {
      closeMenu && closeMenu.focus();
    });
  }

  function closeMenuFn() {
    mobileMenu.classList.remove('translate-x-0');
    mobileMenu.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.removeEventListener('keydown', trapFocus);
    document.body.style.overflow = '';
    
    // Re-focus trigger
    requestAnimationFrame(() => {
      menuToggle && menuToggle.focus();
    });
  }

  menuToggle.addEventListener('click', openMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMenuFn);
  overlay.addEventListener('click', closeMenuFn);

  // Close when links are clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenuFn);
  });
}

/* ==========================================================================
   2. SIMULATED BOOKING MODAL
   ========================================================================== */
function initBookingModal() {
  const openModalBtns = document.querySelectorAll('.open-booking-modal');
  if (openModalBtns.length === 0) return;

  let bookingModal = document.getElementById('booking-modal');
  let bookingModalInner = null;

  function ensureModalInjected() {
    bookingModal = document.getElementById('booking-modal');
    if (!bookingModal) {
      const placeholder = document.getElementById('booking-modal-placeholder');
      if (placeholder) {
        placeholder.innerHTML = getModalHTMLTemplate();
        bookingModal = document.getElementById('booking-modal');
      } else {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = getModalHTMLTemplate();
        document.body.appendChild(modalContainer.firstElementChild);
        bookingModal = document.getElementById('booking-modal');
      }
    }
    bookingModalInner = bookingModal.querySelector('.modal-inner');
  }

  let lastFocusedElement = null;

  function openModal() {
    ensureModalInjected();
    lastFocusedElement = document.activeElement;
    
    // Reset modal inner state to entrance scale
    bookingModalInner.style.transform = 'scale(0.95)';
    bookingModalInner.style.opacity = '0';
    bookingModalInner.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)';

    bookingModal.classList.remove('invisible', 'opacity-0');
    bookingModal.classList.add('visible', 'opacity-100');
    document.body.style.overflow = 'hidden';

    // Trigger transition next frame for strong entrance animation
    requestAnimationFrame(() => {
      bookingModalInner.style.transform = 'scale(1)';
      bookingModalInner.style.opacity = '1';
      // Force viewport height update once visible
      const viewport = bookingModal.querySelector('.booking-steps-viewport');
      const activeEl = document.getElementById('step-service');
      if (viewport && activeEl) {
        viewport.style.height = `${activeEl.scrollHeight}px`;
      }
    });

    resetBookingFlow();
    bookingModal.addEventListener('keydown', trapFocus);
    initLucide();

    // Trap focus inside modal
    requestAnimationFrame(() => {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    });
  }

  function closeModal() {
    if (!bookingModal || !bookingModalInner) return;
    
    // Transition out
    bookingModalInner.style.transform = 'scale(0.95)';
    bookingModalInner.style.opacity = '0';
    bookingModal.classList.remove('opacity-100');
    bookingModal.classList.add('opacity-0');

    setTimeout(() => {
      bookingModal.classList.remove('visible');
      bookingModal.classList.add('invisible');
      document.body.style.overflow = '';
      bookingModal.removeEventListener('keydown', trapFocus);
      if (lastFocusedElement) lastFocusedElement.focus();
    }, 200);
  }

  function getFocusable() {
    return Array.from(
      bookingModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => {
      if (el.closest('[hidden]') || el.closest('.hidden')) return false;
      const stepSlide = el.closest('.booking-step-slide');
      if (stepSlide && !stepSlide.classList.contains('active')) return false;
      return true;
    });
  }

  function trapFocus(e) {
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  // Bind open modal buttons
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Delegate clicks on close button
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('#close-booking-modal') || e.target.closest('#close-confirmed')) {
      closeModal();
    }
    // Click backdrop to close
    if (bookingModal && e.target === bookingModal) {
      closeModal();
    }
  });

  // State Management
  const steps = ['step-service', 'step-stylist', 'step-datetime', 'step-contact', 'step-summary', 'step-confirmed'];
  let currentStepIndex = 0;
  let bookingData = { category: '', service: '', price: '', stylist: '', date: '', time: '', name: '', phone: '' };

  function showStep(index) {
    const track = bookingModal.querySelector('.booking-steps-track');
    const viewport = bookingModal.querySelector('.booking-steps-viewport');

    steps.forEach((stepId, i) => {
      const el = document.getElementById(stepId);
      if (el) {
        el.classList.toggle('active', i === index);
      }
    });

    if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    if (viewport) {
      const activeEl = document.getElementById(steps[index]);
      if (activeEl) {
        requestAnimationFrame(() => {
          viewport.style.height = `${activeEl.scrollHeight}px`;
        });
      }
    }

    const modalHeader = document.getElementById('booking-modal-header');
    if (modalHeader) {
      modalHeader.classList.toggle('hidden', index === 5);
    }

    const stepIndicators = document.querySelectorAll('.step-indicator');
    stepIndicators.forEach((ind, i) => {
      if (!ind) return;
      const active = i <= index;
      ind.classList.toggle('bg-[#C5A059]', active);
      ind.classList.toggle('border-[#C5A059]', active);
      ind.classList.toggle('text-[#FFFFFF]', active);
      ind.classList.toggle('border-[#2E2D2C]/20', !active);
      ind.classList.toggle('text-[#2E2D2C]/60', !active);
    });

    currentStepIndex = index;
    initLucide();

    requestAnimationFrame(() => {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    });
  }

  function resetBookingFlow() {
    bookingData = { category: '', service: '', price: '', stylist: '', date: '', time: '', name: '', phone: '' };

    // Reset styles on card selectors
    document.querySelectorAll('.service-card').forEach(c => {
      c.classList.remove('border-[#C5A059]', 'bg-[#C5A059]/5');
      c.removeAttribute('aria-pressed');
    });
    document.querySelectorAll('.stylist-card').forEach(c => {
      c.classList.remove('border-[#C5A059]', 'bg-[#C5A059]/5');
      c.removeAttribute('aria-pressed');
    });
    document.querySelectorAll('.time-slot').forEach(s => {
      s.classList.remove('bg-[#C5A059]', 'text-[#FFFFFF]', 'border-[#C5A059]');
      s.removeAttribute('aria-pressed');
    });

    clearFieldError('booking-name');
    clearFieldError('booking-phone');

    const nameInput = document.getElementById('booking-name');
    const phoneInput = document.getElementById('booking-phone');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';

    showStep(0);
  }

  // Error handling
  function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('border-[#ba1a1a]');
    input.setAttribute('aria-describedby', `${inputId}-error`);
    let errEl = document.getElementById(`${inputId}-error`);
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = `${inputId}-error`;
      errEl.className = 'text-[#ba1a1a] text-xs mt-1';
      errEl.setAttribute('role', 'alert');
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
  }

  function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('border-[#ba1a1a]');
    input.removeAttribute('aria-describedby');
    const errEl = document.getElementById(`${inputId}-error`);
    if (errEl) errEl.remove();
  }

  // Event Delegation for steps
  document.body.addEventListener('click', (e) => {
    // Step 1: Service Selected
    const serviceCard = e.target.closest('.service-card');
    if (serviceCard) {
      document.querySelectorAll('.service-card').forEach(c => {
        c.classList.remove('border-[#C5A059]', 'bg-[#C5A059]/5');
        c.setAttribute('aria-pressed', 'false');
      });
      serviceCard.classList.add('border-[#C5A059]', 'bg-[#C5A059]/5');
      serviceCard.setAttribute('aria-pressed', 'true');
      bookingData.category = serviceCard.dataset.category;
      bookingData.service = serviceCard.dataset.service;
      bookingData.price = serviceCard.dataset.price;

      setTimeout(() => showStep(1), 200);
    }

    // Step 2: Stylist Selected
    const stylistCard = e.target.closest('.stylist-card');
    if (stylistCard) {
      document.querySelectorAll('.stylist-card').forEach(c => {
        c.classList.remove('border-[#C5A059]', 'bg-[#C5A059]/5');
        c.setAttribute('aria-pressed', 'false');
      });
      stylistCard.classList.add('border-[#C5A059]', 'bg-[#C5A059]/5');
      stylistCard.setAttribute('aria-pressed', 'true');
      bookingData.stylist = stylistCard.dataset.stylist;

      setTimeout(() => {
        showStep(2);
        generateDateOptions();
      }, 200);
    }

    // Step 3: Date Selected
    const dateCard = e.target.closest('.date-card');
    if (dateCard) {
      document.querySelectorAll('.date-card').forEach(c => {
        c.classList.remove('border-[#C5A059]', 'bg-[#C5A059]/10');
        c.setAttribute('aria-pressed', 'false');
      });
      dateCard.classList.add('border-[#C5A059]', 'bg-[#C5A059]/10');
      dateCard.setAttribute('aria-pressed', 'true');
      bookingData.date = dateCard.dataset.dateString;
      
      const timeContainer = document.getElementById('time-container');
      if (timeContainer) {
        timeContainer.classList.remove('opacity-30', 'pointer-events-none');
      }
    }

    // Step 3: Time Slot Selected
    const timeSlot = e.target.closest('.time-slot');
    if (timeSlot) {
      if (!bookingData.date) return;
      document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('bg-[#C5A059]', 'text-[#FFFFFF]', 'border-[#C5A059]');
        s.setAttribute('aria-pressed', 'false');
      });
      timeSlot.classList.add('bg-[#C5A059]', 'text-[#FFFFFF]', 'border-[#C5A059]');
      timeSlot.setAttribute('aria-pressed', 'true');
      bookingData.time = timeSlot.dataset.time;

      setTimeout(() => showStep(3), 200);
    }

    // Back Button
    if (e.target.closest('.prev-step')) {
      if (currentStepIndex > 0) {
        showStep(currentStepIndex - 1);
      }
    }

    // Step 4: Submit Contact Details
    if (e.target.id === 'submit-booking-contact') {
      const nameInput = document.getElementById('booking-name');
      const phoneInput = document.getElementById('booking-phone');
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      let valid = true;
      clearFieldError('booking-name');
      clearFieldError('booking-phone');

      if (!name) {
        showFieldError('booking-name', 'Proszę podać imię i nazwisko.');
        valid = false;
      }

      const phoneRegex = /^[\+\d\s\-\(\)]{9,}$/;
      if (!phone) {
        showFieldError('booking-phone', 'Proszę podać numer telefonu.');
        valid = false;
      } else if (!phoneRegex.test(phone)) {
        showFieldError('booking-phone', 'Proszę podać poprawny numer telefonu (min. 9 cyfr).');
        valid = false;
      }

      if (!valid) return;

      bookingData.name = name;
      bookingData.phone = phone;

      // Fill summary fields
      document.getElementById('summary-service').textContent = bookingData.service;
      document.getElementById('summary-price').textContent = bookingData.price;
      document.getElementById('summary-stylist').textContent = bookingData.stylist;
      document.getElementById('summary-date').textContent = bookingData.date;
      document.getElementById('summary-time').textContent = bookingData.time;
      document.getElementById('summary-client').textContent = `${bookingData.name} (${bookingData.phone})`;

      showStep(4);
    }

    // Step 5: Finish Booking
    if (e.target.id === 'finish-booking') {
      showStep(5);
    }
  });

  // Dynamic Date Builder
  function generateDateOptions() {
    const dateContainer = document.getElementById('date-container');
    if (!dateContainer) return;
    dateContainer.innerHTML = '';

    const dates = [];
    let current = new Date();
    while (dates.length < 5) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 1) { // Skip Sunday (0) and Monday (1)
        dates.push(new Date(current));
      }
    }

    const polishDays = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const polishMonthsFull = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    const polishMonthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

    dates.forEach(d => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'date-card border border-[#2E2D2C]/10 rounded-none p-4 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] flex flex-col items-center justify-center relative';
      card.setAttribute('aria-pressed', 'false');

      const checkmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      checkmark.setAttribute('class', 'select-checkmark absolute top-1 right-1 w-3 h-3 text-[#C5A059] opacity-0 transition-opacity duration-200');
      checkmark.setAttribute('viewBox', '0 0 24 24');
      checkmark.setAttribute('fill', 'none');
      checkmark.setAttribute('stroke', 'currentColor');
      checkmark.setAttribute('stroke-width', '3');
      checkmark.setAttribute('stroke-linecap', 'round');
      checkmark.setAttribute('stroke-linejoin', 'round');
      checkmark.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
      card.appendChild(checkmark);

      const dayName = document.createElement('span');
      dayName.className = 'text-xs text-[#2E2D2C]/60 uppercase tracking-wider mb-1';
      dayName.textContent = polishDays[d.getDay()].substring(0, 3);

      const dayNum = document.createElement('span');
      dayNum.className = 'text-2xl font-editorial font-bold text-[#C5A059] mb-1';
      dayNum.textContent = d.getDate();

      const monthName = document.createElement('span');
      monthName.className = 'text-xs text-[#2E2D2C]/60';
      monthName.textContent = polishMonthsShort[d.getMonth()];

      card.appendChild(dayName);
      card.appendChild(dayNum);
      card.appendChild(monthName);

      card.dataset.dateString = `${d.getDate()} ${polishMonthsFull[d.getMonth()]} (${polishDays[d.getDay()]})`;
      dateContainer.appendChild(card);
    });
  }
}

// Modal HTML Template matching Redesign Aesthetics and ZERO border-radius constraints
function getModalHTMLTemplate() {
  return `
  <div id="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title"
    class="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 invisible opacity-0 transition-opacity duration-200 overflow-y-auto">
    <div class="modal-inner bg-[#F8F7F6] border border-[#2E2D2C]/10 rounded-none w-full max-w-3xl p-6 md:p-12 relative my-8 transform scale-95 opacity-0 transition-all duration-200">

      <!-- Close Button -->
      <button id="close-booking-modal" aria-label="Zamknij okno rezerwacji"
        class="absolute top-4 right-4 p-4 text-2xl text-[#2E2D2C]/60 hover:text-[#C5A059] flex items-center justify-center transition-transform active:scale-[0.97]">
        <svg class="w-6 h-6 text-deep-charcoal hover:text-champagne-gold transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- Steps Indicator Header -->
      <div id="booking-modal-header" class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2E2D2C]/10 pb-6 mb-8 gap-4">
        <div>
          <span class="text-[10px] tracking-widest text-[#C5A059] uppercase font-semibold">REZERWACJA ONLINE</span>
          <h3 class="font-display-lg text-2xl text-[#2E2D2C] mt-1 font-bold">Zarezerwuj Wizytę</h3>
        </div>

        <!-- 5 Steps dots indicators -->
        <div class="flex items-center space-x-2">
          <div class="step-indicator w-6 h-6 border border-[#2E2D2C]/20 text-[10px] flex items-center justify-center rounded-none bg-[#C5A059] text-[#FFFFFF] border-[#C5A059]">1</div>
          <div class="w-3 h-[1px] bg-[#2E2D2C]/10"></div>
          <div class="step-indicator w-6 h-6 border border-[#2E2D2C]/20 text-[10px] flex items-center justify-center rounded-none text-[#2E2D2C]/60">2</div>
          <div class="w-3 h-[1px] bg-[#2E2D2C]/10"></div>
          <div class="step-indicator w-6 h-6 border border-[#2E2D2C]/20 text-[10px] flex items-center justify-center rounded-none text-[#2E2D2C]/60">3</div>
          <div class="w-3 h-[1px] bg-[#2E2D2C]/10"></div>
          <div class="step-indicator w-6 h-6 border border-[#2E2D2C]/20 text-[10px] flex items-center justify-center rounded-none text-[#2E2D2C]/60">4</div>
          <div class="w-3 h-[1px] bg-[#2E2D2C]/10"></div>
          <div class="step-indicator w-6 h-6 border border-[#2E2D2C]/20 text-[10px] flex items-center justify-center rounded-none text-[#2E2D2C]/60">5</div>
        </div>
      </div>

      <!-- Slider Viewport containing the Track and Slides -->
      <div class="booking-steps-viewport">
        <div class="booking-steps-track">

          <!-- STEP 1: Choose Service -->
          <div id="step-service" class="booking-step-slide active">
            <h4 class="text-xs font-semibold tracking-wider text-[#C5A059] uppercase mb-6">Krok 1: Wybierz Usługę</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2">

              <button type="button"
                class="service-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] flex flex-col justify-between relative"
                data-category="Strzyżenie" data-service="Strzyżenie Damskie" data-price="120 - 180 PLN">
                <div class="flex justify-between items-start w-full">
                  <span class="text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest">Strzyżenie</span>
                  <svg class="select-checkmark w-4 h-4 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="font-headline-md text-xl text-[#2E2D2C] my-2 font-bold">Strzyżenie Damskie</span>
                <span class="font-editorial text-sm text-[#C5A059] font-bold">120 - 180 PLN</span>
              </button>

              <button type="button"
                class="service-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] flex flex-col justify-between relative"
                data-category="Strzyżenie" data-service="Strzyżenie Męskie" data-price="70 - 90 PLN">
                <div class="flex justify-between items-start w-full">
                  <span class="text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest">Strzyżenie</span>
                  <svg class="select-checkmark w-4 h-4 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="font-headline-md text-xl text-[#2E2D2C] my-2 font-bold">Strzyżenie Męskie</span>
                <span class="font-editorial text-sm text-[#C5A059] font-bold">70 - 90 PLN</span>
              </button>

              <button type="button"
                class="service-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] flex flex-col justify-between relative"
                data-category="Koloryzacja" data-service="Koloryzacja Wielwymiarowa" data-price="320 - 450 PLN">
                <div class="flex justify-between items-start w-full">
                  <span class="text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest">Koloryzacja</span>
                  <svg class="select-checkmark w-4 h-4 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="font-headline-md text-xl text-[#2E2D2C] my-2 font-bold">Balayage & Refleksy</span>
                <span class="font-editorial text-sm text-[#C5A059] font-bold">320 - 450 PLN</span>
              </button>

              <button type="button"
                class="service-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] flex flex-col justify-between relative"
                data-category="Regeneracja" data-service="Rytuał Odżywczy (Botox)" data-price="150 - 250 PLN">
                <div class="flex justify-between items-start w-full">
                  <span class="text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest">Regeneracja</span>
                  <svg class="select-checkmark w-4 h-4 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="font-headline-md text-xl text-[#2E2D2C] my-2 font-bold">Rytuał Odżywczy (Botox)</span>
                <span class="font-editorial text-sm text-[#C5A059] font-bold">150 - 250 PLN</span>
              </button>

            </div>
          </div>

          <!-- STEP 2: Choose Stylist -->
          <div id="step-stylist" class="booking-step-slide">
            <h4 class="text-xs font-semibold tracking-wider text-[#C5A059] uppercase mb-6">Krok 2: Wybierz Stylistę</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <button type="button"
                class="stylist-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] relative"
                data-stylist="Łukasz Pabian">
                <svg class="select-checkmark absolute top-6 right-6 w-5 h-5 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <div class="font-headline-md text-2xl text-[#2E2D2C] font-bold">Łukasz Pabian</div>
                <div class="text-[10px] text-[#C5A059] mt-1 uppercase tracking-widest font-semibold">Master Stylist / Właściciel</div>
                <p class="text-[#2E2D2C]/70 text-xs mt-4 leading-relaxed font-light">Specjalista w zaawansowanych cięciach geometrycznych i precyzyjnym modelowaniu.</p>
              </button>

              <button type="button"
                class="stylist-card border border-[#2E2D2C]/10 rounded-none p-6 text-left transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] relative"
                data-stylist="Kinga">
                <svg class="select-checkmark absolute top-6 right-6 w-5 h-5 text-[#C5A059] opacity-0 transition-opacity duration-200 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <div class="font-headline-md text-2xl text-[#2E2D2C] font-bold">Kinga</div>
                <div class="text-[10px] text-[#C5A059] mt-1 uppercase tracking-widest font-semibold">Starsza Stylistka</div>
                <p class="text-[#2E2D2C]/70 text-xs mt-4 leading-relaxed font-light">Ekspertka w wielowymiarowej koloryzacji, upięciach okolicznościowych i warkoczach.</p>
              </button>

            </div>
            <div class="flex justify-between mt-8">
              <button type="button"
                class="prev-step border border-[#2E2D2C]/10 rounded-none px-6 py-3 text-xs tracking-widest uppercase hover:text-[#C5A059] hover:border-[#C5A059] transition-colors active:scale-[0.97] flex items-center gap-1">
                <svg class="w-3 h-3 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                WSTECZ
              </button>
            </div>
          </div>

          <!-- STEP 3: Choose Date & Time -->
          <div id="step-datetime" class="booking-step-slide">
            <h4 class="text-xs font-semibold tracking-wider text-[#C5A059] uppercase mb-6">Krok 3: Wybierz Termin</h4>

            <!-- Date Selector Container -->
            <div class="mb-8">
              <span class="text-xs text-[#2E2D2C]/60 uppercase tracking-widest mb-3 block">Dostępne Dni</span>
              <div id="date-container" class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <!-- Dynamic dates generated by JS -->
              </div>
            </div>

            <!-- Time Selector Container -->
            <div id="time-container" class="opacity-30 pointer-events-none transition-opacity duration-300">
              <span class="text-xs text-[#2E2D2C]/60 uppercase tracking-widest mb-3 block">Dostępne Godziny</span>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="09:00">
                  09:00
                </button>
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="10:30">
                  10:30
                </button>
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="12:00">
                  12:00
                </button>
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="13:30">
                  13:30
                </button>
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="15:00">
                  15:00
                </button>
                <button type="button"
                  class="time-slot border border-[#2E2D2C]/10 rounded-none py-3 text-center transition-all duration-150 active:scale-[0.97] hover:border-[#C5A059] text-xs font-medium relative"
                  data-time="16:30">
                  16:30
                </button>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button type="button"
                class="prev-step border border-[#2E2D2C]/10 rounded-none px-6 py-3 text-xs tracking-widest uppercase hover:text-[#C5A059] hover:border-[#C5A059] transition-colors active:scale-[0.97] flex items-center gap-1">
                <svg class="w-3 h-3 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                WSTECZ
              </button>
            </div>
          </div>

          <!-- STEP 4: Client Contact Details -->
          <div id="step-contact" class="booking-step-slide">
            <h4 class="text-xs font-semibold tracking-wider text-[#C5A059] uppercase mb-6">Krok 4: Twoje Dane</h4>
            <div class="space-y-4 max-w-md">

              <div>
                <label for="booking-name" class="block text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest mb-2 font-medium">Imię i Nazwisko</label>
                <input type="text" id="booking-name"
                  class="w-full bg-[#FFFFFF] border border-[#2E2D2C]/10 rounded-none px-4 py-3 text-sm text-[#2E2D2C] focus:border-[#C5A059] focus:outline-none"
                  placeholder="np. Anna Kowalska">
              </div>

              <div>
                <label for="booking-phone" class="block text-[10px] text-[#2E2D2C]/60 uppercase tracking-widest mb-2 font-medium">Numer Telefonu</label>
                <input type="tel" id="booking-phone"
                  class="w-full bg-[#FFFFFF] border border-[#2E2D2C]/10 rounded-none px-4 py-3 text-sm text-[#2E2D2C] focus:border-[#C5A059] focus:outline-none"
                  placeholder="np. +48 123 456 789">
              </div>

            </div>
            <div class="flex justify-between mt-8">
              <button type="button"
                class="prev-step border border-[#2E2D2C]/10 rounded-none px-6 py-3 text-xs tracking-widest uppercase hover:text-[#C5A059] hover:border-[#C5A059] transition-colors active:scale-[0.97] flex items-center gap-1">
                <svg class="w-3 h-3 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                WSTECZ
              </button>
              <button type="button" id="submit-booking-contact"
                class="bg-[#2E2D2C] text-[#FFFFFF] px-8 py-3 text-xs tracking-widest font-semibold uppercase hover:bg-[#C5A059] transition-colors active:scale-[0.97] flex items-center gap-1">
                ZOBACZ PODSUMOWANIE
                <svg class="w-3 h-3 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- STEP 5: Booking Summary -->
          <div id="step-summary" class="booking-step-slide">
            <h4 class="text-xs font-semibold tracking-wider text-[#C5A059] uppercase mb-6">Krok 5: Podsumowanie Rezerwacji</h4>

            <div class="border border-[#2E2D2C]/10 bg-[#FFFFFF] p-6 space-y-4 mb-8">
              <div class="flex justify-between border-b border-[#2E2D2C]/10 pb-2">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Usługa</span>
                <span id="summary-service" class="text-sm font-semibold text-[#2E2D2C]">-</span>
              </div>
              <div class="flex justify-between border-b border-[#2E2D2C]/10 pb-2">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Cena (szacunkowa)</span>
                <span id="summary-price" class="text-sm text-[#C5A059] font-semibold font-editorial">-</span>
              </div>
              <div class="flex justify-between border-b border-[#2E2D2C]/10 pb-2">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Stylista</span>
                <span id="summary-stylist" class="text-sm font-semibold text-[#2E2D2C]">-</span>
              </div>
              <div class="flex justify-between border-b border-[#2E2D2C]/10 pb-2">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Data wizyty</span>
                <span id="summary-date" class="text-sm font-semibold text-[#2E2D2C]">-</span>
              </div>
              <div class="flex justify-between border-b border-[#2E2D2C]/10 pb-2">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Godzina</span>
                <span id="summary-time" class="text-sm font-semibold text-[#2E2D2C]">-</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-[#2E2D2C]/60 uppercase font-medium">Klient</span>
                <span id="summary-client" class="text-sm font-semibold text-[#2E2D2C]">-</span>
              </div>
            </div>

            <p class="text-[10px] text-[#2E2D2C]/60 mb-8 italic">
              *To jest symulowana rezerwacja w celach demonstracyjnych. Wizyta nie zostanie zapisana w rzeczywistym systemie salonu.
            </p>

            <div class="flex justify-between">
              <button type="button"
                class="prev-step border border-[#2E2D2C]/10 rounded-none px-6 py-3 text-xs tracking-widest uppercase hover:text-[#C5A059] hover:border-[#C5A059] transition-colors active:scale-[0.97] flex items-center gap-1">
                <svg class="w-3 h-3 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                WSTECZ
              </button>
              <button type="button" id="finish-booking"
                class="bg-[#C5A059] text-[#FFFFFF] px-8 py-3 text-xs tracking-widest font-semibold uppercase hover:bg-[#2E2D2C] transition-colors font-bold active:scale-[0.97] flex items-center gap-1.5">
                <svg class="w-4 h-4 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ZAREZERWUJ WIZYTĘ
              </button>
            </div>
          </div>

          <!-- STEP 6: Confirmation Screen -->
          <div id="step-confirmed" class="booking-step-slide text-center py-8">
            <div class="w-14 h-14 border border-[#C5A059] flex items-center justify-center mx-auto mb-6 rounded-none bg-[#C5A059]/10">
              <svg class="w-6 h-6 text-[#C5A059]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h4 class="font-headline-md text-2xl text-[#2E2D2C] mb-3 font-bold">Rezerwacja Przyjęta</h4>
            <p class="text-[#2E2D2C]/70 text-sm font-light mb-2 max-w-sm mx-auto leading-relaxed">
              Dziękujemy! Skontaktujemy się z Tobą w celu potwierdzenia terminu.
            </p>
            <p class="text-[10px] text-[#2E2D2C]/60 italic mb-8">*To jest symulacja — wizyta nie została zapisana w rzeczywistym systemie.</p>
            <button type="button" id="close-confirmed"
              class="bg-[#2E2D2C] text-[#FFFFFF] px-8 py-3 text-xs tracking-widest font-semibold uppercase hover:bg-[#C5A059] transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5 mx-auto">
              <svg class="w-3.5 h-3.5 text-current shrink-0 align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ZAMKNIJ
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
  `;
}

/* ==========================================================================
   3. SERVICES CATEGORY TABS SWITCHER
   ========================================================================== */
function initServicesTabs() {
  const tabButtons = document.querySelectorAll('.services-tab-btn');
  const tabPanes = document.querySelectorAll('.services-tab-pane');
  if (tabButtons.length === 0) return;

  function updateTabIndicator(activeButton) {
    const indicator = document.getElementById('services-tabs-indicator');
    const container = document.getElementById('services-tabs-container');
    if (!indicator || !container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();

    const left = btnRect.left - containerRect.left;
    const width = btnRect.width;

    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
  }

  // Initial positioning of active tab indicator
  const activeTab = document.querySelector('.services-tab-btn.font-semibold');
  if (activeTab) {
    requestAnimationFrame(() => {
      updateTabIndicator(activeTab);
    });
  }

  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.services-tab-btn.font-semibold');
    if (currentActive) {
      updateTabIndicator(currentActive);
    }
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.dataset.tab;
      const targetPane = document.getElementById(targetTabId);
      if (!targetPane) return;

      // Deactivate all tabs
      tabButtons.forEach(b => {
        b.classList.remove('text-deep-charcoal', 'font-semibold');
        b.classList.add('text-on-surface-variant/60');
      });

      // Deactivate all panes
      tabPanes.forEach(pane => {
        pane.classList.remove('block', 'active');
        pane.classList.add('hidden');
      });

      // Activate current tab
      btn.classList.remove('text-on-surface-variant/60');
      btn.classList.add('text-deep-charcoal', 'font-semibold');

      // Update indicator width/position
      updateTabIndicator(btn);

      // Activate current pane
      targetPane.classList.remove('hidden');
      targetPane.classList.add('block');
      
      // Trigger stagger entrance on next frame
      requestAnimationFrame(() => {
        targetPane.classList.add('active');
      });

      // Re-init Lucide just in case
      initLucide();
    });
  });
}

/* ==========================================================================
   4. CONTACT MESSAGE FORM SIMULATOR
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie...';

    setTimeout(() => {
      submitBtn.textContent = 'Wiadomość wysłana!';
      submitBtn.classList.remove('bg-deep-charcoal');
      submitBtn.classList.add('bg-[#C5A059]', 'text-stark-white');
      contactForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('bg-[#C5A059]', 'text-stark-white');
        submitBtn.classList.add('bg-deep-charcoal');
      }, 3000);
    }, 1000);
  });
}

/* ==========================================================================
   5. LIVE BUSINESS HOURS STATUS BADGE
   ========================================================================== */
function updateBusinessHoursStatus() {
  const badge = document.getElementById('hours-status-badge');
  if (!badge) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  let isOpen = false;

  if (day >= 2 && day <= 5) { // Tuesday - Friday: 9:00 - 18:00
    const start = 9 * 60;
    const end = 18 * 60;
    if (currentTime >= start && currentTime < end) {
      isOpen = true;
    }
  } else if (day === 6) { // Saturday: 9:00 - 14:30
    const start = 9 * 60;
    const end = 14 * 60 + 30;
    if (currentTime >= start && currentTime < end) {
      isOpen = true;
    }
  }

  if (isOpen) {
    badge.textContent = 'Otwarte Teraz';
    badge.className = 'px-2 py-0.5 text-[9px] tracking-widest uppercase font-semibold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]';
  } else {
    badge.textContent = 'Zamknięte';
    badge.className = 'px-2 py-0.5 text-[9px] tracking-widest uppercase font-semibold bg-deep-charcoal/10 text-on-surface-variant/40 border border-deep-charcoal/10';
  }
}
