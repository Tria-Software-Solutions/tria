(function () {
  "use strict";
  if (window.triaI18n) return;

  /* ── Locale helpers ── */

  /** Extract the locale from the current URL path */
  function detectLocale() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    return path.startsWith("/es") ? "es" : "en";
  }

  /** Get the bare (locale-independent) path — strips /es prefix */
  function getBarePath() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    return path.replace(/^\/es/, "") || "/";
  }

  /** Compute the href for a target locale from the current bare path */
  function localeHref(lang) {
    var bare = getBarePath();
    return lang === "en"
      ? bare
      : "/es" + (bare === "/" ? "" : bare);
  }

  /* ── SEO helpers ── */

  function updateCanonical() {
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    var locale = detectLocale();
    var barePath = getBarePath();
    var prefix = locale === "en" ? "" : "/es";
    var canonicalPath = prefix + (barePath === "/" ? "" : barePath);
    link.href = "https://triacr.com" + canonicalPath;
  }

  function updateHreflang() {
    var barePath = getBarePath();
    var enHref = "https://triacr.com" + (barePath === "/" ? "" : barePath);
    var esHref = "https://triacr.com/es" + (barePath === "/" ? "" : barePath);

    var enLink = document.querySelector('link[hreflang="en"]');
    if (enLink) enLink.href = enHref;

    var esLink = document.querySelector('link[hreflang="es"]');
    if (esLink) esLink.href = esHref;

    var xLink = document.querySelector('link[hreflang="x-default"]');
    if (xLink) xLink.href = enHref;
  }

  /* ── Frame/UI helpers ── */

  /** Update frame language buttons to reflect the current locale */
  function updateLangButtons(locale) {
    var selectors = [
      ".tria-lang-btn",
      ".tria-mobile-lang-btn",
      ".tria-menu-lang-btn",
    ];
    var btns = document.querySelectorAll(selectors.join(", "));
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle(
        "is-active",
        btns[i].getAttribute("data-lang") === locale,
      );
    }
  }

  /* ── Language switching ── */

  function switchLanguage(lang) {
    var next = localeHref(lang);
    var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    if (next === currentPath) return; // already there

    // Seamless navigation via Swup (no full page reload)
    if (window.__swup && typeof window.__swup.navigate === "function") {
      window.__swup.navigate(next);
    } else {
      // Fallback: full page navigation
      window.location.href = next;
    }
  }

  /* ── Main apply — called on load and after every page transition ── */

  function apply() {
    var locale = detectLocale();

    // Update <html lang> to match the current locale
    document.documentElement.lang = locale;

    // Update active state on all language switcher buttons
    updateLangButtons(locale);

    // Update canonical URL and hreflang tags (SEO)
    updateCanonical();
    updateHreflang();

    // Broadcast so other modules (frame theme, header) can react
    document.dispatchEvent(
      new CustomEvent("tria:localeChanged", { detail: { locale: locale } }),
    );
  }

  /* ── Click handler: intercept language switcher clicks ── */

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(
      ".tria-lang-btn, .tria-mobile-lang-btn, .tria-menu-lang-btn",
    );
    if (!btn) return;
    e.preventDefault();
    var lang = btn.getAttribute("data-lang");
    if (!lang) return;
    switchLanguage(lang);
  });

  /* ── Re-apply on Swup page transitions ── */

  document.addEventListener("swup:contentReplaced", apply);

  /* ── Initialise ── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  /* ── Public API ── */

  window.triaI18n = {
    switchTo: switchLanguage,
    apply: apply,
    detectLocale: detectLocale,
    getBarePath: getBarePath,
  };
})();
