// Sun parallax: move DOWN slower but still cross the whole screen
(() => {
  const section = document.querySelector('.intro-section');
  const sun = document.querySelector('.sun-wrapper');
  const SPEED = 0.3; // <1 = slower than scroll, >1 = faster

  function onScroll() {
    if (!section || !sun) return;
    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // how much of the section has been scrolled
    const scrolled = Math.max(0, -rect.top);

    // move proportionally across the entire screen height
    const progress = scrolled / (sectionHeight - viewportHeight);
    const y = progress * viewportHeight; // full descent across screen

    sun.style.transform = `translate(-50%, ${y}px)`;
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();


// parallex opening

document.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scene = document.querySelector(".intro-section");
  if (!scene) return;

  const sectionTop = scene.offsetTop;
  const sectionHeight = scene.offsetHeight;
  const progress = Math.min(Math.max((scrollTop - sectionTop) / (sectionHeight - window.innerHeight), 0), 1);

  // each layer moves at a slightly different speed (up/down)
  document.querySelector(".layer-dust").style.transform = `translateY(${progress * -40}px)`;
  document.querySelector(".layer-buildings").style.transform = `translateY(${progress * -25}px)`;
  document.querySelector(".layer-mosque").style.transform = `translateY(${progress * -15}px)`;
  document.querySelector(".layer-tents").style.transform = `translateY(${progress * -8}px)`;
  // document.querySelector(".layer-press").style.transform = `translateX(${progress * -10}px)`; // moves opposite for depth
});
 

// map change effect
document.addEventListener("DOMContentLoaded", () => {
  const STRIP_PREFIX = "strip-";   

  fetch("img/map.svg")
    .then(r => r.text())
    .then(svgText => {
      document.querySelectorAll(".map-container").forEach(container => {
        container.innerHTML = svgText;
      });

      const blocks = [...document.querySelectorAll(".timeline-block")];

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const blockIndex = blocks.indexOf(entry.target) + 1;
          const svg = entry.target.querySelector("svg");
          if (!svg) return;

          const strip = svg.querySelector(`#${STRIP_PREFIX}${blockIndex}`);
          if (!strip) return;

          if (entry.isIntersecting) {
            // fade in
            strip.classList.add("active");
          } else {
            // fade out when leaving viewport
            strip.classList.remove("active");
          }
        });
      }, { threshold: 0.5 });

      blocks.forEach(b => io.observe(b));
    });
});

// helicopter animation
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const heliFront = document.querySelector(".heli-front");
  const heliBack = document.querySelector(".heli-back");

  if (heliFront) heliFront.style.transform = `translateY(${scrollY * 0.1}px)`;
  if (heliBack) heliBack.style.transform = `translateY(${scrollY * 0.05}px)`;
});


// tent heat effect
(() => {
  const section = document.querySelector('.tent-scene');
  const sun = document.querySelector('.tent-scene .sun');

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrolled = Math.max(0, window.innerHeight - rect.top);
    const y = Math.min(scrolled * 0.15, 100); // slower descent
    sun.style.transform = `translate(-50%, ${y}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

