/* -------------------------------------------

Name: 		Ruizarch
Version:    1.0
Developer:	Nazar Miller (millerDigitalDesign)
Portfolio:  https://themeforest.net/user/millerdigitaldesign/portfolio?ref=MillerDigitalDesign

p.s. I am available for Freelance hire (UI design, web development). email: miller.themes@gmail.com

------------------------------------------- */

$(function () {
  "use strict";

  /***************************

    lenis smooth scroll

    ***************************/
  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.4,
      easing: function (t) { return 1 - Math.pow(1 - t, 3) },
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', function (e) {
      ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Expose so animations can reference it
    window.triaLenis = lenis;

    // GSAP + Lenis integration
    document.addEventListener('swup:contentReplaced', function () {
      lenis.scrollTo(0, { immediate: true });
      setTimeout(function () { ScrollTrigger.refresh(); }, 100);
    });

    // Override anchor scroll to use Lenis
    $(document).on('click', 'a[href^="#"]', function (event) {
      event.preventDefault();
      var target = document.querySelector($(this).attr('href'));
      if (!target) return;
      var offset = $(window).width() < 1200 ? 90 : 0;
      lenis.scrollTo(target, { offset: -offset, duration: 1.6 });
    });

    // Remove the old native smooth scroll handler since Lenis handles it
    // (the handler is below, we keep it for non-Lenis fallback)
  }

  /***************************

    swup

    ***************************/
  const options = {
    containers: ["#swupMain", "#swupMenu"],
    animateHistoryBrowsing: true,
    linkSelector: "a:not([data-no-swup])",
    animationSelector: '[class="tria-main-transition"]',
  };
  const swup = new Swup(options);

  /***************************

    register gsap plugins

    ***************************/
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  /***************************

    color variables

    ***************************/

  var accent = "rgba(255, 152, 0, 1)";
  var dark = "#000";
  var light = "#fff";

  /***************************

    preloader
    
    ***************************/

  var timeline = gsap.timeline();

  timeline.to(".tria-preloader-animation", {
    opacity: 1,
  });

  timeline.fromTo(
    ".tria-animation-1 .tria-h3",
    {
      y: "30px",
      opacity: 0,
    },
    {
      y: "0px",
      opacity: 1,
      stagger: 0.4,
    },
  );

  timeline.to(
    ".tria-animation-1 .tria-h3",
    {
      opacity: 0,
      y: "-30",
    },
    "+=.3",
  );

  timeline.fromTo(
    ".tria-reveal-box",
    0.1,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      x: "-30",
    },
  );

  timeline.to(
    ".tria-reveal-box",
    0.45,
    {
      width: "100%",
      x: 0,
    },
    "+=.1",
  );
  timeline.to(".tria-reveal-box", {
    right: "0",
  });
  timeline.to(".tria-reveal-box", 0.3, {
    width: "0%",
  });
  timeline.fromTo(
    ".tria-animation-2 .tria-h3",
    {
      opacity: 0,
    },
    {
      opacity: 1,
    },
    "-=.5",
  );
  timeline.to(
    ".tria-animation-2 .tria-h3",
    0.6,
    {
      opacity: 0,
      y: "-30",
    },
    "+=.5",
  );
  timeline.to(
    ".tria-preloader",
    0.8,
    {
      opacity: 0,
      ease: "sine",
    },
    "+=.2",
  );
  timeline.fromTo(
    ".tria-up",
    0.8,
    {
      opacity: 0,
      y: 40,
      scale: 0.98,
      ease: "sine",
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      onComplete: function () {
        $(".tria-preloader").addClass("tria-hidden");
      },
    },
    "-=1",
  );
  /***************************

    anchor scroll (Lenis fallback)

    ***************************/
  // Only attach if Lenis is NOT available (Lenis handler is in the init block above)
  if (!window.Lenis) {
    $(document).on("click", 'a[href^="#"]', function (event) {
      event.preventDefault();

      var target = document.querySelector($.attr(this, "href"));
      if (!target) return;

      var offset = 0;
      if ($(window).width() < 1200) {
        offset = 90;
      }

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
    });
  }
  /***************************

    append

    ***************************/
  $(document).ready(function () {
    $(".tria-arrow").clone().appendTo(".tria-arrow-place");
    $(".tria-dodecahedron").clone().appendTo(".tria-animation");
    $(".tria-lines").clone().appendTo(".tria-lines-place");
    $(".tria-main-menu ul li.tria-active > a")
      .clone()
      .appendTo(".tria-current-page");
  });
  /***************************

    accordion

    ***************************/

  let groups = gsap.utils.toArray(".tria-accordion-group");
  let menus = gsap.utils.toArray(".tria-accordion-menu");
  let menuToggles = groups.map(createAnimation);

  menus.forEach((menu) => {
    menu.addEventListener("click", () => toggleMenu(menu));
  });

  function toggleMenu(clickedMenu) {
    menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
  }

  function createAnimation(element) {
    let menu = element.querySelector(".tria-accordion-menu");
    let box = element.querySelector(".tria-accordion-content");
    let symbol = element.querySelector(".tria-symbol");
    let minusElement = element.querySelector(".tria-minus");
    let plusElement = element.querySelector(".tria-plus");

    gsap.set(box, {
      height: "auto",
    });

    let animation = gsap
      .timeline()
      .from(box, {
        height: 0,
        duration: 0.4,
        ease: "sine",
      })
      .from(
        minusElement,
        {
          duration: 0.4,
          autoAlpha: 0,
          ease: "none",
        },
        0,
      )
      .to(
        plusElement,
        {
          duration: 0.4,
          autoAlpha: 0,
          ease: "none",
        },
        0,
      )
      .to(
        symbol,
        {
          background: accent,
          ease: "none",
        },
        0,
      )
      .reverse();

    return function (clickedMenu) {
      if (clickedMenu === menu) {
        animation.reversed(!animation.reversed());
      } else {
        animation.reverse();
      }
    };
  }
  /***************************

    back to top

    ***************************/
  const btt = document.querySelector(".tria-back-to-top .tria-link");

  gsap.set(btt, {
    x: -30,
    opacity: 0,
  });

  gsap.to(btt, {
    x: 0,
    opacity: 1,
    ease: "sine",
    scrollTrigger: {
      trigger: "body",
      start: "top -40%",
      end: "top -40%",
      toggleActions: "play none reverse none",
    },
  });
  /***************************

    cursor

    ***************************/
  const cursor = document.querySelector(".tria-ball");

  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
  });

  document.addEventListener("pointermove", movecursor);

  function movecursor(e) {
    gsap.to(cursor, {
      duration: 0.6,
      ease: "sine",
      x: e.clientX,
      y: e.clientY,
    });
  }

  $(".tria-drag, .tria-more, .tria-choose").mouseover(function () {
    gsap.to($(cursor), 0.2, {
      width: 90,
      height: 90,
      opacity: 1,
      ease: "sine",
    });
  });

  $(".tria-drag, .tria-more, .tria-choose").mouseleave(function () {
    gsap.to($(cursor), 0.2, {
      width: 20,
      height: 20,
      opacity: 0.1,
      ease: "sine",
    });
  });

  $(".tria-accent-cursor").mouseover(function () {
    gsap.to($(cursor), 0.2, {
      background: accent,
      ease: "sine",
    });
    $(cursor).addClass("tria-accent");
  });

  $(".tria-accent-cursor").mouseleave(function () {
    gsap.to($(cursor), 0.2, {
      background: dark,
      ease: "sine",
    });
    $(cursor).removeClass("tria-accent");
  });

  $(".tria-drag").mouseover(function () {
    gsap.to($(".tria-ball .tria-icon-1"), 0.2, {
      scale: "1",
      ease: "sine",
    });
  });

  $(".tria-drag").mouseleave(function () {
    gsap.to($(".tria-ball .tria-icon-1"), 0.2, {
      scale: "0",
      ease: "sine",
    });
  });

  $(".tria-more").mouseover(function () {
    gsap.to($(".tria-ball .tria-more-text"), 0.2, {
      scale: "1",
      ease: "sine",
    });
  });

  $(".tria-more").mouseleave(function () {
    gsap.to($(".tria-ball .tria-more-text"), 0.2, {
      scale: "0",
      ease: "sine",
    });
  });

  $(".tria-choose").mouseover(function () {
    gsap.to($(".tria-ball .tria-choose-text"), 0.2, {
      scale: "1",
      ease: "sine",
    });
  });

  $(".tria-choose").mouseleave(function () {
    gsap.to($(".tria-ball .tria-choose-text"), 0.2, {
      scale: "0",
      ease: "sine",
    });
  });

  $(
    'a:not(".tria-choose , .tria-more , .tria-drag , .tria-accent-cursor"), input , textarea, .tria-accordion-menu',
  ).mouseover(function () {
    gsap.to($(cursor), 0.2, {
      scale: 0,
      ease: "sine",
    });
    gsap.to($(".tria-ball svg"), 0.2, {
      scale: 0,
    });
  });

  $(
    'a:not(".tria-choose , .tria-more , .tria-drag , .tria-accent-cursor"), input, textarea, .tria-accordion-menu',
  ).mouseleave(function () {
    gsap.to($(cursor), 0.2, {
      scale: 1,
      ease: "sine",
    });

    gsap.to($(".tria-ball svg"), 0.2, {
      scale: 1,
    });
  });

  $("body").mousedown(function () {
    gsap.to($(cursor), 0.2, {
      scale: 0.1,
      ease: "sine",
    });
  });
  $("body").mouseup(function () {
    gsap.to($(cursor), 0.2, {
      scale: 1,
      ease: "sine",
    });
  });
  /***************************

     menu

    ***************************/
  $(".tria-menu-btn").on("click", function () {
    $(".tria-menu-btn").toggleClass("tria-active");
    $(".tria-menu").toggleClass("tria-active");
    $(".tria-menu-frame").toggleClass("tria-active");
  });
  /***************************

    main menu

    ***************************/
  $(".tria-has-children a").on("click", function () {
    $(".tria-has-children ul").removeClass("tria-active");
    $(".tria-has-children a").removeClass("tria-active");
    $(this).toggleClass("tria-active");
    $(this).next().toggleClass("tria-active");
  });
  /***************************

    progressbar

    ***************************/
  gsap.to(".tria-progress", {
    height: "100%",
    ease: "sine",
    scrollTrigger: {
      scrub: 0.3,
    },
  });
  /***************************

    scroll animations

    ***************************/

  const appearance = document.querySelectorAll(".tria-up");

  appearance.forEach((section) => {
    // Skip elements already handled by Lenis or that should animate differently
    if (section.classList.contains('tria-skip-gsap')) return;
    gsap.fromTo(
      section,
      {
        opacity: 0,
        y: 30,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          toggleActions: "play none none reverse",
          start: "top 90%",
        },
      },
    );
  });

  const scaleImage = document.querySelectorAll(".tria-scale");

  scaleImage.forEach((section) => {
    var value1 = $(section).data("value-1");
    var value2 = $(section).data("value-2");
    gsap.fromTo(
      section,
      {
        ease: "sine",
        scale: value1,
      },
      {
        scale: value2,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  const parallaxImage = document.querySelectorAll(".tria-parallax");

  if ($(window).width() > 960) {
    parallaxImage.forEach((section) => {
      var value1 = $(section).data("value-1");
      var value2 = $(section).data("value-2");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          y: value1,
        },
        {
          y: value2,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }

  const rotate = document.querySelectorAll(".tria-rotate");

  rotate.forEach((section) => {
    var value = $(section).data("value");
    gsap.fromTo(
      section,
      {
        ease: "sine",
        rotate: 0,
      },
      {
        rotate: value,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      },
    );
  });
  /***************************

    fancybox

    ***************************/
  $('[data-fancybox="gallery"]').fancybox({
    buttons: ["slideShow", "zoom", "fullScreen", "close"],
    loop: false,
    protect: true,
  });
  $.fancybox.defaults.hash = false;
  /***************************

    reviews slider

    ***************************/

  var menu = [
    '<div class="tria-custom-dot tria-slide-1"></div>',
    '<div class="tria-custom-dot tria-slide-2"></div>',
    '<div class="tria-custom-dot tria-slide-3"></div>',
    '<div class="tria-custom-dot tria-slide-4"></div>',
    '<div class="tria-custom-dot tria-slide-5"></div>',
    '<div class="tria-custom-dot tria-slide-6"></div>',
    '<div class="tria-custom-dot tria-slide-7"></div>',
  ];
  var mySwiper = new Swiper(".tria-reviews-slider", {
    // If we need pagination
    pagination: {
      el: ".tria-revi-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + menu[index] + "</span>";
      },
    },
    speed: 800,
    effect: "fade",
    parallax: true,
    navigation: {
      nextEl: ".tria-revi-next",
      prevEl: ".tria-revi-prev",
    },
  });

  /***************************

    infinite slider

    ***************************/
  var swiper = new Swiper(".tria-infinite-show", {
    slidesPerView: 2,
    spaceBetween: 30,
    speed: 5000,
    autoplay: true,
    autoplay: {
      delay: 0,
    },
    loop: true,
    freeMode: true,
    breakpoints: {
      992: {
        slidesPerView: 4,
      },
    },
  });

  /***************************

    portfolio slider

    ***************************/
  var swiper = new Swiper(".tria-portfolio-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 800,
    parallax: true,
    mousewheel: {
      enable: true,
    },
    navigation: {
      nextEl: ".tria-portfolio-next",
      prevEl: ".tria-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });
  /***************************

    1 item slider

    ***************************/
  var swiper = new Swiper(".tria-1-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".tria-portfolio-next",
      prevEl: ".tria-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });
  /***************************

    2 item slider

    ***************************/
  var swiper = new Swiper(".tria-2-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".tria-portfolio-next",
      prevEl: ".tria-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
    },
  });

  /*----------------------------------------------------------
    ------------------------------------------------------------

    REINIT

    ------------------------------------------------------------
    ----------------------------------------------------------*/
  document.addEventListener("swup:contentReplaced", function () {
    window.scrollTo(0, 0);

    gsap.to(".tria-progress", {
      height: 0,
      ease: "sine",
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });
    /***************************

         menu

        ***************************/
    $(".tria-menu-btn").removeClass("tria-active");
    $(".tria-menu").removeClass("tria-active");
    $(".tria-menu-frame").removeClass("tria-active");
    /***************************

        append

        ***************************/
    $(document).ready(function () {
      $(
        ".tria-arrow-place .tria-arrow, .tria-animation .tria-dodecahedron, .tria-current-page a",
      ).remove();
      $(".tria-arrow").clone().appendTo(".tria-arrow-place");
      $(".tria-dodecahedron").clone().appendTo(".tria-animation");
      $(".tria-lines").clone().appendTo(".tria-lines-place");
      $(".tria-main-menu ul li.tria-active > a")
        .clone()
        .appendTo(".tria-current-page");
    });
    /***************************

        accordion

        ***************************/

    let groups = gsap.utils.toArray(".tria-accordion-group");
    let menus = gsap.utils.toArray(".tria-accordion-menu");
    let menuToggles = groups.map(createAnimation);

    menus.forEach((menu) => {
      menu.addEventListener("click", () => toggleMenu(menu));
    });

    function toggleMenu(clickedMenu) {
      menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
    }

    function createAnimation(element) {
      let menu = element.querySelector(".tria-accordion-menu");
      let box = element.querySelector(".tria-accordion-content");
      let symbol = element.querySelector(".tria-symbol");
      let minusElement = element.querySelector(".tria-minus");
      let plusElement = element.querySelector(".tria-plus");

      gsap.set(box, {
        height: "auto",
      });

      let animation = gsap
        .timeline()
        .from(box, {
          height: 0,
          duration: 0.4,
          ease: "sine",
        })
        .from(
          minusElement,
          {
            duration: 0.4,
            autoAlpha: 0,
            ease: "none",
          },
          0,
        )
        .to(
          plusElement,
          {
            duration: 0.4,
            autoAlpha: 0,
            ease: "none",
          },
          0,
        )
        .to(
          symbol,
          {
            background: accent,
            ease: "none",
          },
          0,
        )
        .reverse();

      return function (clickedMenu) {
        if (clickedMenu === menu) {
          animation.reversed(!animation.reversed());
        } else {
          animation.reverse();
        }
      };
    }

    /***************************

        cursor

        ***************************/

    $(".tria-drag, .tria-more, .tria-choose").mouseover(function () {
      gsap.to($(cursor), 0.2, {
        width: 90,
        height: 90,
        opacity: 1,
        ease: "sine",
      });
    });

    $(".tria-drag, .tria-more, .tria-choose").mouseleave(function () {
      gsap.to($(cursor), 0.2, {
        width: 20,
        height: 20,
        opacity: 0.1,
        ease: "sine",
      });
    });

    $(".tria-accent-cursor").mouseover(function () {
      gsap.to($(cursor), 0.2, {
        background: accent,
        ease: "sine",
      });
      $(cursor).addClass("tria-accent");
    });

    $(".tria-accent-cursor").mouseleave(function () {
      gsap.to($(cursor), 0.2, {
        background: dark,
        ease: "sine",
      });
      $(cursor).removeClass("tria-accent");
    });

    $(".tria-drag").mouseover(function () {
      gsap.to($(".tria-ball .tria-icon-1"), 0.2, {
        scale: "1",
        ease: "sine",
      });
    });

    $(".tria-drag").mouseleave(function () {
      gsap.to($(".tria-ball .tria-icon-1"), 0.2, {
        scale: "0",
        ease: "sine",
      });
    });

    $(".tria-more").mouseover(function () {
      gsap.to($(".tria-ball .tria-more-text"), 0.2, {
        scale: "1",
        ease: "sine",
      });
    });

    $(".tria-more").mouseleave(function () {
      gsap.to($(".tria-ball .tria-more-text"), 0.2, {
        scale: "0",
        ease: "sine",
      });
    });

    $(".tria-choose").mouseover(function () {
      gsap.to($(".tria-ball .tria-choose-text"), 0.2, {
        scale: "1",
        ease: "sine",
      });
    });

    $(".tria-choose").mouseleave(function () {
      gsap.to($(".tria-ball .tria-choose-text"), 0.2, {
        scale: "0",
        ease: "sine",
      });
    });

    $(
      'a:not(".tria-choose , .tria-more , .tria-drag , .tria-accent-cursor"), input , textarea, .tria-accordion-menu',
    ).mouseover(function () {
      gsap.to($(cursor), 0.2, {
        scale: 0,
        ease: "sine",
      });
      gsap.to($(".tria-ball svg"), 0.2, {
        scale: 0,
      });
    });

    $(
      'a:not(".tria-choose , .tria-more , .tria-drag , .tria-accent-cursor"), input, textarea, .tria-accordion-menu',
    ).mouseleave(function () {
      gsap.to($(cursor), 0.2, {
        scale: 1,
        ease: "sine",
      });

      gsap.to($(".tria-ball svg"), 0.2, {
        scale: 1,
      });
    });

    $("body").mousedown(function () {
      gsap.to($(cursor), 0.2, {
        scale: 0.1,
        ease: "sine",
      });
    });
    $("body").mouseup(function () {
      gsap.to($(cursor), 0.2, {
        scale: 1,
        ease: "sine",
      });
    });
    /***************************

        main menu

        ***************************/
    $(".tria-has-children a").on("click", function () {
      $(".tria-has-children ul").removeClass("tria-active");
      $(".tria-has-children a").removeClass("tria-active");
      $(this).toggleClass("tria-active");
      $(this).next().toggleClass("tria-active");
    });
    /***************************

        scroll animations

        ***************************/

    const appearance = document.querySelectorAll(".tria-up");

    appearance.forEach((section) => {
      if (section.classList.contains('tria-skip-gsap')) return;
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 30,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            toggleActions: "play none none reverse",
            start: "top 90%",
          },
        },
      );
    });

    const scaleImage = document.querySelectorAll(".tria-scale");

    scaleImage.forEach((section) => {
      var value1 = $(section).data("value-1");
      var value2 = $(section).data("value-2");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          scale: value1,
        },
        {
          scale: value2,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    const parallaxImage = document.querySelectorAll(".tria-parallax");

    if ($(window).width() > 960) {
      parallaxImage.forEach((section) => {
        var value1 = $(section).data("value-1");
        var value2 = $(section).data("value-2");
        gsap.fromTo(
          section,
          {
            ease: "sine",
            y: value1,
          },
          {
            y: value2,
            scrollTrigger: {
              trigger: section,
              scrub: true,
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }

    const rotate = document.querySelectorAll(".tria-rotate");

    rotate.forEach((section) => {
      var value = $(section).data("value");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          rotate: 0,
        },
        {
          rotate: value,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
    /***************************

        fancybox

        ***************************/
    $('[data-fancybox="gallery"]').fancybox({
      buttons: ["slideShow", "zoom", "fullScreen", "close"],
      loop: false,
      protect: true,
    });
    $.fancybox.defaults.hash = false;
    /***************************

        reviews slider

        ***************************/

    var menu = [
      '<div class="tria-custom-dot tria-slide-1"></div>',
      '<div class="tria-custom-dot tria-slide-2"></div>',
      '<div class="tria-custom-dot tria-slide-3"></div>',
      '<div class="tria-custom-dot tria-slide-4"></div>',
      '<div class="tria-custom-dot tria-slide-5"></div>',
      '<div class="tria-custom-dot tria-slide-6"></div>',
      '<div class="tria-custom-dot tria-slide-7"></div>',
    ];
    var mySwiper = new Swiper(".tria-reviews-slider", {
      // If we need pagination
      pagination: {
        el: ".tria-revi-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + menu[index] + "</span>";
        },
      },
      speed: 800,
      effect: "fade",
      parallax: true,
      navigation: {
        nextEl: ".tria-revi-next",
        prevEl: ".tria-revi-prev",
      },
    });

    /***************************

        infinite slider

        ***************************/
    var swiper = new Swiper(".tria-infinite-show", {
      slidesPerView: 2,
      spaceBetween: 30,
      speed: 5000,
      autoplay: true,
      autoplay: {
        delay: 0,
      },
      loop: true,
      freeMode: true,
      breakpoints: {
        992: {
          slidesPerView: 4,
        },
      },
    });

    /***************************

        portfolio slider

        ***************************/
    var swiper = new Swiper(".tria-portfolio-slider", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      parallax: true,
      mousewheel: {
        enable: true,
      },
      navigation: {
        nextEl: ".tria-portfolio-next",
        prevEl: ".tria-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
    });
    /***************************

        1 item slider

        ***************************/
    var swiper = new Swiper(".tria-1-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".tria-portfolio-next",
        prevEl: ".tria-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
    });
    /***************************

        2 item slider

        ***************************/
    var swiper = new Swiper(".tria-2-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".tria-portfolio-next",
        prevEl: ".tria-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
      },
    });
  });
});
