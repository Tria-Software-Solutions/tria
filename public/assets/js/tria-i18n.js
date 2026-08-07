(function () {
  "use strict";
  if (window.triaI18n) return;

  /* ── Persistence (localStorage) ── */

  var STORAGE_KEY = "tria-locale";

  function saveLocale(lang) {
    if (lang !== "en" && lang !== "es") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* storage unavailable (private mode, etc.) — ignore */
    }
  }

  function readStoredLocale() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return v === "en" || v === "es" ? v : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * On first load, if the user previously picked a locale, redirect to it.
   * Runs before Swup is initialised, so it uses a hard replace (no history entry).
   */
  function restoreStoredLocale() {
    var saved = readStoredLocale();
    if (!saved) return;
    var current = detectLocale();
    if (saved === current) return;
    var next = localeHref(saved);
    var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    if (next === currentPath) return;
    window.location.replace(next);
  }

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

  /* ── Persistent (frame/header/menu) text sync ── */

  /**
   * The sticky header, fullscreen menu and bottom frame are rendered outside
   * the #swup container and are not replaced by the locale swap. Copy their
   * localized text (via data-i18n keys) and their localized hrefs from the
   * fetched document so the whole UI matches the new locale.
   */
  function syncPersistentTexts(doc) {
    // 1. Texts — copy innerHTML for matching data-i18n elements
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var src = doc.querySelector('[data-i18n="' + key + '"]');
      if (src && src.innerHTML) el.innerHTML = src.innerHTML;
    });

    // 2. Hrefs — anchors with data-i18n (nav, services, useful links) and
    //    the two logos carry locale-prefixed URLs baked at build time
    document.querySelectorAll("a[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var src = doc.querySelector('a[data-i18n="' + key + '"]');
      if (src && src.getAttribute("href")) {
        el.setAttribute("href", src.getAttribute("href"));
      }
    });

    [".tria-logo", ".tria-menu-logo"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var src = doc.querySelector(sel);
      if (src && src.getAttribute("href")) {
        el.setAttribute("href", src.getAttribute("href"));
      }
    });
  }

  /* ── Language switching ── */

  // Guard against double-clicks while a switch is in flight.
  var localeSwitchInFlight = false;

  /**
   * Swap only the page content (the #swup container) for the target locale
   * without reloading the page — only the texts change. The vendored Swup v1
   * build stalls on repeated navigations, so we do the swap ourselves:
   * fetch → replace → pushState → re-fire swup:contentReplaced (the same DOM
   * event Swup uses, so every re-init listener runs) → restore the scroll.
   *
   * The transition is a movement-free crossfade (opacity only, no transform)
   * with Lenis paused, so the scroll position never moves or jumps.
   */
  function swapLocaleContent(next) {
    var htmlEl = document.documentElement;
    var curContent = document.querySelector("#swup");

    fetch(next, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var nextContent = doc.querySelector("#swup");
        if (!nextContent || !curContent) throw new Error("no #swup container");

        // Freeze the scroll so the crossfade has zero movement
        if (window.triaLenis && window.triaLenis.stop) {
          window.triaLenis.stop();
        }

        // Under prefers-reduced-motion the fade is instant (transition: none),
        // so skip the fade-out wait entirely to avoid a blank flash.
        var reducedMotion =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Fade the current content out (fast, opacity only)
        htmlEl.classList.add("tria-locale-switching");
        curContent.classList.add("tria-locale-fade");

        window.setTimeout(function () {
          // Replace the content and the document title
          curContent.innerHTML = nextContent.innerHTML;
          if (doc.title) document.title = doc.title;

          // The frame/header/menu live outside #swup (per-locale rendered), so
          // sync their localized texts and hrefs from the fetched document.
          syncPersistentTexts(doc);

          // Update the URL without reloading
          try {
            history.pushState(null, "", next);
          } catch (err) {}

          // Re-run every "page changed" initializer (i18n apply, link preview
          // conversion, hero gradient, components). The swup:contentReplaced
          // handlers in tria-main.js read the __triaLocaleScroll flag, restore
          // the saved scroll position and restart Lenis.
          document.dispatchEvent(new CustomEvent("swup:contentReplaced"));

          // Fade the new content back in (slower, fluid)
          window.requestAnimationFrame(function () {
            curContent.classList.remove("tria-locale-fade");
          });

          // Clean up only after the fade-in completes (0.3s from here), so the
          // transition rule isn't removed mid-fade (which would snap the tail).
          window.setTimeout(function () {
            htmlEl.classList.remove("tria-locale-switching");
            localeSwitchInFlight = false;
          }, reducedMotion ? 60 : 520);
        }, reducedMotion ? 0 : 180);
      })
      .catch(function () {
        localeSwitchInFlight = false;
        window.__triaLocaleScroll = null;
        if (curContent) curContent.classList.remove("tria-locale-fade");
        htmlEl.classList.remove("tria-locale-switching");
        if (window.triaLenis && window.triaLenis.start) {
          window.triaLenis.start();
        }
        // Fallback: full page navigation
        window.location.href = next;
      });
  }

  function switchLanguage(lang) {
    var next = localeHref(lang);
    var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    if (next === currentPath) return; // already there
    if (localeSwitchInFlight) return; // already switching

    // Persist the user's choice
    saveLocale(lang);

    // Remember the current scroll level so the swap can restore it — only
    // the texts should change, not the scroll position.
    window.__triaLocaleScroll = window.scrollY || 0;

    localeSwitchInFlight = true;
    swapLocaleContent(next);
  }

  /* ── Main apply — called on load and after every page transition ── */

  function apply() {
    var locale = detectLocale();

    // Persist the current locale only when the user hasn't chosen one yet.
    // Never overwrite an explicit stored preference with the page's locale:
    // doing so caused a redirect loop when a hardcoded (non-localized) link
    // lands on a page in the other language — restoreStoredLocale() redirects
    // to the user's preferred locale, but apply() then flipped the stored value
    // mid-flight, making the redirect target bounce right back (and vice versa).
    if (!readStoredLocale()) saveLocale(locale);

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

  // Restore a previously saved locale (redirects if needed) before anything renders
  restoreStoredLocale();

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
    saveLocale: saveLocale,
    readStoredLocale: readStoredLocale,
  };
})();
