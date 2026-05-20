(function () {
  var hero = document.querySelector('.tria-banner');
  var overlay = hero && hero.querySelector('.tria-gradient-overlay');
  if (!hero || !overlay) return;

  var ticking = false;

  function update() {
    var rect = hero.getBoundingClientRect();
    var heroH = rect.height;
    var scrollP = Math.max(0, Math.min(1, -rect.top / heroH));

    overlay.style.transform = 'translate(' + (scrollP * 3) + '%, ' + (-scrollP * 2) + '%) scale(' + (1 + scrollP * 0.08) + ')';
    overlay.style.filter = 'saturate(' + (0.8 + scrollP * 0.4) + ') brightness(' + (1 + scrollP * 0.05) + ')';

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();
