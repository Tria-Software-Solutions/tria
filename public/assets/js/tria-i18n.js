(function () {
  "use strict";
  if (window.triaI18n) return;

  var translations = window.__triaTranslations || {};

  function resolveKey(obj, key) {
    if (typeof obj[key] === "string") return obj[key];
    var parts = key.split(".");
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current == null || typeof current !== "object") return null;
      if (typeof current[parts[i]] === "string") return current[parts[i]];
      current = current[parts[i]];
    }
    return typeof current === "string" ? current : null;
  }

  function switchLanguage(lang) {
    if (!translations[lang]) return;
    var t = translations[lang];

    var els, key, val, i;

    els = document.querySelectorAll("[data-i18n]");
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute("data-i18n");
      val = resolveKey(t, key);
      if (val != null) els[i].textContent = val;
    }

    els = document.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute("data-i18n-html");
      val = resolveKey(t, key);
      if (val != null) els[i].innerHTML = val;
    }

    els = document.querySelectorAll("[data-i18n-placeholder]");
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute("data-i18n-placeholder");
      val = resolveKey(t, key);
      if (val != null) els[i].placeholder = val;
    }

    document.documentElement.lang = lang;

    var btns = document.querySelectorAll(".tria-lang-btn");
    for (i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-active", btns[i].getAttribute("data-lang") === lang);
    }

    var cur = window.location.pathname.replace(/\/+$/, "") || "/";
    var isEs = cur.startsWith("/es");
    var next = lang === "en"
      ? (isEs ? (cur.replace(/^\/es/, "") || "/") : cur)
      : (isEs ? cur : "/es" + (cur === "/" ? "" : cur));
    window.history.replaceState(null, "", next);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".tria-lang-btn");
    if (!btn) return;
    e.preventDefault();
    var lang = btn.getAttribute("data-lang");
    if (!lang) return;
    switchLanguage(lang);
  });

  window.triaI18n = {
    switchTo: switchLanguage,
    apply: function () {},
  };
})();
