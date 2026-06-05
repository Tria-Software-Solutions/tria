(function () {
  "use strict";

  if (window.triaI18n) return;
  window.triaI18n = {
    translations: null,
    currentLang: "en",

    init: function (data) {
      if (!data) {
        data = window.__triaData;
        if (typeof data === "string") {
          try { data = JSON.parse(data); }
          catch(e) { data = null; }
        }
      }
      if (!data) return;
      this.translations = data;
      this.currentLang =
        getStoredLang() ||
        (navigator.language &&
        navigator.language.slice(0, 2) === "es"
          ? "es"
          : "en");
      this.apply();
      this._bindButtons();
    },

    switchTo: function (lang) {
      if (!this.translations) {
        var d = window.__triaData;
        if (typeof d === "string") {
          try { d = JSON.parse(d); }
          catch(e) { d = null; }
        }
        this.translations = d;
      }
      if (!this.translations || !this.translations[lang]) return;
      this.currentLang = lang;
      setStoredLang(lang);
      this.apply();
      var btns = document.querySelectorAll(".tria-lang-btn[data-lang]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle(
          "is-active",
          btns[i].getAttribute("data-lang") === lang,
        );
      }
    },

    apply: function () {
      var strings =
        this.translations[this.currentLang];
      if (!strings) return;

      document
        .querySelectorAll("[data-i18n]")
        .forEach(function (el) {
          var key = el.getAttribute("data-i18n");
          var val = resolveKey(strings, key);
          if (val != null) el.textContent = val;
        });

      document
        .querySelectorAll("[data-i18n-html]")
        .forEach(function (el) {
          var key = el.getAttribute("data-i18n-html");
          var val = resolveKey(strings, key);
          if (val != null) el.innerHTML = val;
        });

      document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach(function (el) {
          var key = el.getAttribute(
            "data-i18n-placeholder",
          );
          var val = resolveKey(strings, key);
          if (val != null)
            el.setAttribute("placeholder", val);
        });

      document
        .querySelectorAll("[data-i18n-tooltip]")
        .forEach(function (el) {
          var key = el.getAttribute(
            "data-i18n-tooltip",
          );
          var val = resolveKey(strings, key);
          if (val != null)
            el.setAttribute("data-tooltip", val);
        });

      document
        .querySelectorAll("[data-i18n-aria-label]")
        .forEach(function (el) {
          var key = el.getAttribute(
            "data-i18n-aria-label",
          );
          var val = resolveKey(strings, key);
          if (val != null)
            el.setAttribute("aria-label", val);
        });

      document.documentElement.lang = this.currentLang;
      this._syncButtons();
    },

    _bindButtons: function () {
      var self = this;
      if (!this._buttonsBound) {
        document.addEventListener("click", function (event) {
          var btn = event.target.closest(
            ".tria-lang-btn[data-lang]",
          );
          if (!btn) return;
          event.preventDefault();
          self.switchTo(btn.getAttribute("data-lang"));
        });
        this._buttonsBound = true;
      }
      this._syncButtons();
    },

    _syncButtons: function () {
      var btns = document.querySelectorAll(
        ".tria-lang-btn[data-lang]",
      );
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle(
          "is-active",
          btns[i].getAttribute("data-lang") ===
            this.currentLang,
        );
      }
    },
  };

  function resolveKey(obj, key) {
    if (!obj || !key) return null;
    if (typeof obj[key] === "string") return obj[key];
    var parts = key.split(".");
    var val = obj;
    for (var i = 0; i < parts.length; i++) {
      if (val == null || typeof val !== "object")
        return null;
      val = val[parts[i]];
    }
    return typeof val === "string" ? val : null;
  }

  function getStoredLang() {
    try {
      return window.localStorage && window.localStorage.getItem("tria-lang");
    } catch (e) {
      return null;
    }
  }

  function setStoredLang(lang) {
    try {
      if (window.localStorage) window.localStorage.setItem("tria-lang", lang);
    } catch (e) {}
  }

  window.triaI18n.init();
})();
