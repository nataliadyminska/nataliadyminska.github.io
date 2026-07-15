/* Natalia Dymińska — progresywne wzbogacenie.
   Strona jest w pełni czytelna również bez JavaScript. */
(function () {
  "use strict";

  /* ---------- Menu mobilne ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
    });

    // Zamknij menu po kliknięciu w link
    header.querySelectorAll(".nav__list a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (header.classList.contains("nav-open")) {
          header.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Otwórz menu");
        }
      });
    });

    // Zamknij menu klawiszem Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Otwórz menu");
        toggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Akordeon: zamykaj pozostałe po otwarciu jednego ---------- */
  var accItems = document.querySelectorAll(".accordion__item");
  accItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        accItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Logo → przewiń na samą górę ---------- */
  var brand = document.querySelector(".brand");
  if (brand) {
    brand.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Mapa Leaflet (OpenStreetMap) ---------- */
  var mapEl = document.getElementById("map");
  if (mapEl && window.L) {
    var lat = parseFloat(mapEl.getAttribute("data-lat"));
    var lon = parseFloat(mapEl.getAttribute("data-lon"));
    var zoom = parseInt(mapEl.getAttribute("data-zoom"), 10) || 15;

    var map = L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lon], zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var pin = L.divIcon({
      className: "",
      html: '<svg class="map__pin" width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.6" fill="#fff"/></svg>',
      iconSize: [30, 40],
      iconAnchor: [15, 40]
    });
    L.marker([lat, lon], { icon: pin, title: "al. Jaworowa 14, Wrocław" }).addTo(map);

    // scroll-zoom tylko po kliknięciu w mapę (nie łapie scrolla strony)
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
  }

  /* ---------- Rok w stopce ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
