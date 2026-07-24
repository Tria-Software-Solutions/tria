(function () {
  "use strict";
  if (window.triaI18n) return;

  function switchLanguage(lang) {
    var cur = window.location.pathname.replace(/\/+$/, "") || "/";
    var isEs = cur.startsWith("/es");
    var next = lang === "en"
      ? (isEs ? (cur.replace(/^\/es/, "") || "/") : cur)
      : (isEs ? cur : "/es" + (cur === "/" ? "" : cur));
    if (next !== cur) {
      window.location.href = next;
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".tria-lang-btn, .tria-mobile-lang-btn, .tria-menu-lang-btn");
    if (!btn) return;
    e.preventDefault();
    var lang = btn.getAttribute("data-lang");
    if (!lang) return;
    switchLanguage(lang);
  });

  window.triaI18n = {
    switchTo: switchLanguage,
    apply: function () {
      var path = window.location.pathname.replace(/\/+$/, "") || "/";
      var detected = path.startsWith("/es") ? "es" : "en";
      document.documentElement.lang = detected;
      var btns = document.querySelectorAll(".tria-lang-btn, .tria-mobile-lang-btn, .tria-menu-lang-btn");
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("is-active", btns[i].getAttribute("data-lang") === detected);
      }
    },
  };
})();
