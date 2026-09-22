/* Natalia Dymińska — zgoda na cookies i Google Analytics 4.

   Tryb podstawowy Consent Mode v2: do Google nie wychodzi ani jeden bajt,
   dopóki użytkownik nie kliknie „Akceptuję". To świadomy wybór dla strony,
   na którą trafiają osoby w kryzysie — prywatność ponad kompletność danych.

   Wybór zapisujemy w localStorage. To informacja niezbędna do działania
   (żeby nie pytać przy każdej wizycie) i nie wymaga osobnej zgody.

   Bez GA_ID skrypt nie robi nic — nie ma bannera, nie ma analityki. */
(function () {
  "use strict";

  var GA_ID = "G-G1ENNZR1W1";              // identyfikator pomiaru GA4, np. "G-XXXXXXXXXX"
  var STORAGE_KEY = "nd-consent";
  var CONSENT_VERSION = 1;     // podbić, gdy zmieni się zakres tego, na co pytamy

  if (!GA_ID) return;

  /* ---------- Pamięć wyboru ---------- */
  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== CONSENT_VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  function saveChoice(analytics) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: CONSENT_VERSION, analytics: !!analytics, at: new Date().toISOString()
      }));
    } catch (e) { /* prywatny tryb / zablokowany storage — trudno, zapytamy znów */ }
  }

  /* ---------- Google Analytics ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var gaLoaded = false;

  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;

    // Domyślne ustawienia zgody MUSZĄ trafić do dataLayer przed gtag.js.
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500
    });

    // Skoro tu jesteśmy, użytkownik się zgodził. Personalizację reklam
    // zostawiamy wyłączoną na stałe — remarketing wobec osób szukających
    // pomocy psychologicznej to kategoria wrażliwa i nie będziemy go robić.
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      analytics_storage: "granted"
    });

    gtag("js", new Date());
    gtag("config", GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  /* ---------- Zdarzenia konwersji ----------
     Strona nie ma formularza, więc „konwersją" jest kliknięcie w kontakt.
     Nazwy zdarzeń trafiają do GA4; tam oznacza się je jako kluczowe
     i importuje do Google Ads. */
  function track(name, params) {
    if (!gaLoaded) return;
    gtag("event", name, params || {});
  }

  function bindConversions() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener("click", function () { track("contact_email", { method: "email" }); });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () { track("contact_phone", { method: "phone" }); });
    });
    document.querySelectorAll('a[href*="google.com/maps/dir"]').forEach(function (a) {
      a.addEventListener("click", function () { track("contact_route", { method: "route" }); });
    });
    document.querySelectorAll(".contact__social a, .social__link").forEach(function (a) {
      a.addEventListener("click", function () {
        var label = (a.getAttribute("title") || "").toLowerCase();
        track("social_click", { network: label });
      });
    });
  }

  /* ---------- Banner ---------- */
  var banner = null;

  function buildBanner() {
    var el = document.createElement("div");
    el.className = "consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-labelledby", "consent-title");
    el.setAttribute("aria-describedby", "consent-text");
    el.innerHTML =
      '<div class="consent__inner">' +
        '<div class="consent__body">' +
          '<p class="consent__title" id="consent-title">Kilka słów o prywatności</p>' +
          '<p class="consent__text" id="consent-text">' +
            'Ta strona nie zbiera żadnych danych bez Twojej zgody. Jeśli pozwolisz, ' +
            'włączę anonimowe statystyki odwiedzin (Google Analytics), żeby wiedzieć, ' +
            'jak trafiają tu ludzie. Bez zgody strona działa dokładnie tak samo. ' +
            '<a href="/polityka-prywatnosci.html">Polityka prywatności</a>' +
          '</p>' +
        '</div>' +
        '<div class="consent__actions">' +
          '<button type="button" class="button button--ghost" data-consent="deny">Tylko niezbędne</button>' +
          '<button type="button" class="button button--primary" data-consent="grant">Akceptuję</button>' +
        '</div>' +
      '</div>';

    el.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (!btn) return;
      var granted = btn.getAttribute("data-consent") === "grant";
      saveChoice(granted);
      if (granted) loadAnalytics();
      hideBanner();
    });
    return el;
  }

  function showBanner() {
    if (!banner) banner = buildBanner();
    if (!banner.isConnected) document.body.appendChild(banner);
    // Dwie klatki dają płynne wejście, ale requestAnimationFrame bywa
    // wstrzymany (karta w tle, wczytywanie dużych obrazów), a banner musi
    // się pokazać zawsze. Stąd zapasowy timer — co zadziała pierwsze.
    var reveal = function () { banner.classList.add("is-visible"); };
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    window.setTimeout(reveal, 120);
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove("is-visible");
    // Usuwamy z DOM po czasie animacji (0.45 s w CSS), a nie na transitionend —
    // to zdarzenie bywa zawodne, a niewidoczny role="dialog" myli czytniki ekranu.
    var el = banner;
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 500);
  }

  /* ---------- Start ---------- */
  bindConversions();

  var choice = readChoice();
  if (choice === null) {
    showBanner();
  } else if (choice.analytics) {
    loadAnalytics();
  }

  // „Ustawienia cookies" w stopce — możliwość zmiany decyzji w każdej chwili.
  document.querySelectorAll("[data-consent-settings]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showBanner();
    });
  });
})();
