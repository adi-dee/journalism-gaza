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
  document.querySelector(".layer-dust").style.transform = `translateY(${progress * 40}px)`;
  document.querySelector(".layer-buildings").style.transform = `translateY(${progress * -25}px)`;
  document.querySelector(".layer-mosque").style.transform = `translateY(${progress * -15}px)`;
  document.querySelector(".layer-tents").style.transform = `translateY(${progress * -8}px)`;
  // document.querySelector(".layer-press").style.transform = `translateX(${progress * -10}px)`; // moves opposite for depth
});
 

// map change effect
document.addEventListener("DOMContentLoaded", () => {
  const REGION_TO_STRIP = {
    "rafah": "strip-1",
    "khan-younis": "strip-2",
    "gaza": "strip-4",
    "jabalia": "strip-5"
  };

  fetch("img/map.svg")
    .then(r => r.text())
    .then(svgText => {
      document.querySelectorAll(".map-container").forEach(container => {
        container.innerHTML = svgText;
      });

      const blocks = [...document.querySelectorAll(".timeline-block")];

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const content = entry.target.querySelector(".timeline-content");
          if (!content) return;

          const regionList = (content.dataset.region || "")
            .split(/[,\s]+/) // split by commas or spaces
            .map(r => r.trim().toLowerCase())
            .filter(Boolean);

          const svg = entry.target.querySelector("svg");
          if (!svg) return;

          // Remove previous actives when out of view
          if (!entry.isIntersecting) {
            svg.querySelectorAll(".active").forEach(s => s.classList.remove("active"));
            return;
          }

          // When visible — activate all matching strips
          regionList.forEach(region => {
            const stripId = REGION_TO_STRIP[region];
            if (!stripId) return;
            const strip = svg.querySelector(`#${stripId}`);
            if (strip) strip.classList.add("active");
          });
        });
      }, { threshold: 0.5 });

      blocks.forEach(b => io.observe(b));
    });
});

// helicopter animation
// window.addEventListener("scroll", () => {
//   const scrollY = window.scrollY;
//   const heliFront = document.querySelector(".heli-front");
//   const heliBack = document.querySelector(".heli-back");

//   if (heliFront) heliFront.style.transform = `translateY(${scrollY * 0.1}px)`;
//   if (heliBack) heliBack.style.transform = `translateY(${scrollY * 0.05}px)`;
// });


// journalist target effect

(() => {
  const scene = document.querySelector(".press-illustration");
  const target = scene?.querySelector(".press-layer.target");

  if (!scene || !target) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const maxRange = 100; // wider total movement range (±100px)
  const smoothness = 0.07; // smaller = slower, smoother motion

  const updatePosition = () => {
    // ease toward the target
    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;

    // subtle inertia / overshoot correction
    const inertia = 0.98;
    currentX *= inertia;
    currentY *= inertia;

    target.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(updatePosition);
  };

  const moveTarget = (x, y) => {
    const rect = scene.getBoundingClientRect();
    const relX = (x - rect.left) / rect.width - 0.5;
    const relY = (y - rect.top) / rect.height - 0.5;

    // map position to a wider range
    targetX = relX * maxRange;
    targetY = relY * maxRange;
  };

  // Mouse movement (desktop)
  scene.addEventListener("mousemove", e => moveTarget(e.clientX, e.clientY));

  // Touch movement (mobile)
  scene.addEventListener("touchmove", e => {
    const touch = e.touches[0];
    if (touch) moveTarget(touch.clientX, touch.clientY);
  }, { passive: true });

  // Reset to center slowly when leaving
  scene.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  updatePosition();
})();


// aid and tent parallax
// Parallax motion by changing CSS position (more visible version)
window.addEventListener("scroll", () => {
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const moveY = isDesktop ? 120 : 60; // vertical motion range in px
  const moveX = isDesktop ? 60 : 30;  // horizontal motion range in px

  document.querySelectorAll(".aid-illustration, .tent-illustration").forEach(scene => {
    const rect = scene.getBoundingClientRect();
    const progress = (window.innerHeight / 2 - rect.top) / window.innerHeight; // from -1 to +1

    const background1 = scene.querySelector(".tent-background");
    const background2 = scene.querySelector(".aid-background");

    // Background drifts down-right
    if (background1) {
      background1.style.top = `${progress * moveY}px`;
    }

     if (background2) {
      background2.style.top = `${progress * moveY / 6 }px`;
    }
  });
});

// closing scene parallax


(() => {
  const section = document.querySelector(".closing-scene");
  const layers = document.querySelectorAll(".closing-layer");
  const boats = document.querySelectorAll(".layer-boat");

  window.addEventListener("scroll", () => {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollProgress = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1);

    // vertical parallax: subtle upward movement by depth
    layers.forEach((layer, i) => {
      const speed = (i + 1) * 5; // deeper layers move less
      layer.style.transform = `translateY(${scrollProgress * -speed}px)`;
    });

    // horizontal boat drift
    boats.forEach((boat, i) => {
      const drift = (i % 2 === 0 ? 1 : -1) * scrollProgress * 60; // move opposite directions
      boat.style.transform += ` translateX(${drift}px)`;
    });
  });
})();

