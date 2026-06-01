(function () {
  var ticking = false;
  var hero, content;

  function bindParallax() {
    hero = document.querySelector(".tria-banner");
    content = hero && hero.querySelector(".tria-banner-content");
  }

  function updateContent() {
    if (!hero) bindParallax();
    if (!hero) { ticking = false; return; }
    var rect = hero.getBoundingClientRect();
    var heroH = rect.height;
    var scrollP = Math.max(0, Math.min(1, -rect.top / heroH));
    if (content) {
      content.style.transform = "translateY(" + -scrollP * 60 + "px)";
      content.style.opacity = 1 - scrollP * 0.5;
    }
    ticking = false;
  }

  bindParallax();

  if (hero) {
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateContent);
          ticking = true;
        }
      },
      { passive: true },
    );
    updateContent();
  }

  window.initTriaGradient = function () {
    bindParallax();
    if (hero) updateContent();
  };
})();
