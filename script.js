(function () {
  'use strict';

  var PHONE_WA = '381654039100';
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Header: linija ispod kad se krene sa vrha ---------- */
  var header = document.getElementById('header');
  if (hasIO) {
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-scrolled', !e[0].isIntersecting);
    }).observe(document.getElementById('topSentinel'));
  }

  /* ---------- Donja traka na telefonu: pojavi se kad dugmad iz hero dela odu sa ekrana ---------- */
  var dock = document.getElementById('dock');
  if (hasIO) {
    new IntersectionObserver(function (e) {
      dock.classList.toggle('is-visible', !e[0].isIntersecting);
    }).observe(document.getElementById('heroActions'));
  } else {
    dock.classList.add('is-visible');
  }

  /* ---------- Meni na telefonu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Zatvori meni');
    body.classList.add('menu-open', 'is-locked');
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otvori meni');
    body.classList.remove('menu-open', 'is-locked');
    setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 350);
  }
  burger.addEventListener('click', function () {
    burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && body.classList.contains('menu-open')) closeMenu();
  });

  /* ---------- Animacije pri skrolovanju ---------- */
  var reveals = document.querySelectorAll('.reveal, .reveal-img');
  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal, :scope > .reveal-img') : [];
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(Math.max(idx, 0), 5) * 70 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Aktivan link u navigaciji ---------- */
  var navLinks = document.querySelectorAll('.nav a');
  if (hasIO) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', entry.target.id && a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section, footer').forEach(function (s) { navIo.observe(s); });
  }

  /* ---------- Galerija: filter ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var chips = document.querySelectorAll('.tab');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach(function (it) {
        var show = f === 'sve' || it.getAttribute('data-cat') === f;
        it.classList.toggle('is-hidden', !show);
        if (show && !reduceMotion) {
          it.style.opacity = '0';
          it.style.transform = 'translateY(12px)';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { it.style.opacity = ''; it.style.transform = ''; });
          });
        }
      });
    });
  });

  /* ---------- Galerija: lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbCount = document.getElementById('lbCount');
  var lbStage = document.getElementById('lbStage');
  var current = 0;
  var list = [];
  var lastFocus = null;

  function visibleItems() {
    return items.filter(function (it) { return !it.classList.contains('is-hidden'); });
  }

  function show(i) {
    var n = list.length;
    current = (i + n) % n;
    var img = list[current].querySelector('img');
    lbImg.classList.add('is-loading');
    var src = img.getAttribute('data-full');
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      lbImg.src = src;
      lbImg.alt = img.alt;
      lbImg.classList.remove('is-loading');
    };
    pre.src = src;
    lbCap.textContent = img.alt;
    lbCount.textContent = (current + 1) + ' / ' + n;
    // Unapred učitaj susedne slike
    [current + 1, current - 1].forEach(function (k) {
      var it = list[(k + n) % n];
      if (it) { var p = new Image(); p.src = it.querySelector('img').getAttribute('data-full'); }
    });
  }

  function openLb(item) {
    list = visibleItems();
    lastFocus = document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    body.classList.add('lb-open', 'is-locked');
    show(list.indexOf(item));
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    body.classList.remove('lb-open', 'is-locked');
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 300);
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (it) {
    var btn = it.querySelector('.g-btn');
    btn.setAttribute('aria-label', 'Uvećaj sliku: ' + it.querySelector('img').alt);
    btn.addEventListener('click', function () { openLb(it); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { show(current - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(current + 1); });
  lbStage.addEventListener('click', function (e) { if (e.target === lbStage) closeLb(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'Tab') {
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      closeMenu();
      burger.focus();
    }
  });

  // Swipe na telefonu
  var startX = 0, startY = 0, tracking = false;
  lb.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchmove', function (e) {
    if (!tracking) return;
    var dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 10) lbImg.style.transform = 'translateX(' + dx * 0.35 + 'px)';
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    lbImg.style.transform = '';
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.5) closeLb();
  });

  /* ---------- Forma: upit preko WhatsApp-a ---------- */
  var form = document.getElementById('bookingForm');
  var fIn = document.getElementById('f-in');
  var fOut = document.getElementById('f-out');
  var fGuests = document.getElementById('f-guests');
  var nightsEl = document.getElementById('nights');
  var errEl = document.getElementById('formError');

  function iso(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function fmt(v) {
    var p = v.split('-');
    return p[2] + '.' + p[1] + '.' + p[0] + '.';
  }
  function nightsWord(n) {
    return (n % 10 === 1 && n % 100 !== 11) ? 'noćenje' : 'noćenja';
  }
  function nightsBetween() {
    if (!fIn.value || !fOut.value) return 0;
    return Math.round((new Date(fOut.value) - new Date(fIn.value)) / 86400000);
  }

  var today = iso(new Date());
  fIn.min = today;
  fOut.min = today;

  function updateDates() {
    if (fIn.value) {
      var next = new Date(fIn.value);
      next.setDate(next.getDate() + 1);
      fOut.min = iso(next);
      if (fOut.value && fOut.value <= fIn.value) fOut.value = '';
    }
    var n = nightsBetween();
    nightsEl.textContent = n > 0 ? n + ' ' + nightsWord(n) : '';
  }
  fIn.addEventListener('change', updateDates);
  fOut.addEventListener('change', updateDates);

  document.querySelectorAll('.stepper__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = parseInt(fGuests.value, 10) || 1;
      v = Math.min(20, Math.max(1, v + parseInt(b.getAttribute('data-step'), 10)));
      fGuests.value = v;
    });
  });

  form.addEventListener('input', function (e) {
    e.target.classList.remove('is-invalid');
    errEl.textContent = '';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var phone = form.elements.phone;
    var errors = [];
    [name, phone, fIn, fOut, fGuests].forEach(function (el) { el.classList.remove('is-invalid'); });

    if (!name.value.trim()) { errors.push(name); }
    if ((phone.value.match(/\d/g) || []).length < 6) { errors.push(phone); }
    if (!fIn.value) { errors.push(fIn); }
    if (!fOut.value || nightsBetween() < 1) { errors.push(fOut); }
    var g = parseInt(fGuests.value, 10);
    if (!g || g < 1) { errors.push(fGuests); }

    if (errors.length) {
      errors.forEach(function (el) { el.classList.add('is-invalid'); });
      var msg = 'Molimo vas da popunite sva polja.';
      if (errors.length === 1 && errors[0] === phone && phone.value.trim()) msg = 'Proverite broj telefona.';
      if (errors.length === 1 && errors[0] === fOut && fOut.value) msg = 'Datum odlaska treba da bude posle datuma dolaska.';
      errEl.textContent = msg;
      errors[0].focus();
      return;
    }

    var n = nightsBetween();
    var text = 'Dobar dan, zanima me slobodan termin u Vili MIJA.\n\n' +
      'Ime: ' + name.value.trim() + '\n' +
      'Telefon: ' + phone.value.trim() + '\n' +
      'Dolazak: ' + fmt(fIn.value) + '\n' +
      'Odlazak: ' + fmt(fOut.value) + ' (' + n + ' ' + nightsWord(n) + ')\n' +
      'Broj gostiju: ' + g;

    var url = 'https://wa.me/' + PHONE_WA + '?text=' + encodeURIComponent(text);
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (err) {} }
    else window.location.href = url;
  });

  /* ---------- Godina u futeru ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
