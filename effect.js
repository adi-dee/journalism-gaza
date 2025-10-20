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


 
// opening swap

(() => {
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const layers = document.querySelectorAll(".intro-section .layer");
  const layers2 = document.querySelectorAll(".ceasefire-parallax .change-mobile");


  const swapImages = (isMobile) => {
    layers.forEach(img => {
      const src = img.getAttribute("src");
      const base = src.replace(/-m(\.[a-z]+)$/i, "$1"); // remove -m if exists
      const ext = base.split(".").pop();
      const baseName = base.substring(0, base.lastIndexOf("."));
      const newSrc = isMobile ? `${baseName}-m.${ext}` : `${baseName}.${ext}`;
      if (src !== newSrc) img.setAttribute("src", newSrc);
    });

    layers2.forEach(img => {
      const src = img.getAttribute("src");
      const base = src.replace(/-m(\.[a-z]+)$/i, "$1"); // remove -m if exists
      const ext = base.split(".").pop();
      const baseName = base.substring(0, base.lastIndexOf("."));
      const newSrc = isMobile ? `${baseName}-m.${ext}` : `${baseName}.${ext}`;
      if (src !== newSrc) img.setAttribute("src", newSrc);
    });
  };

  // run on load
  swapImages(mobileQuery.matches);

  // run on resize / device rotation
  mobileQuery.addEventListener("change", e => swapImages(e.matches));
})();


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


(() => {
  const scene = document.querySelector(".press-illustration");
  const target = scene?.querySelector(".press-layer.target");
  if (!scene || !target) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let isVisible = false; // 🔥 visibility tracker

  const maxRange = 80;
  const smoothness = 0.07;

  const updatePosition = () => {
    if (!isVisible) {
      // slowly return to center when not visible
      targetX *= 0.9;
      targetY *= 0.9;
    }

    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;
    target.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(updatePosition);
  };

  const moveTarget = (x, y) => {
    if (!isVisible) return; // ⛔ ignore movement when out of view
    const rect = scene.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relX = (x - centerX) / rect.width;
    const relY = (y - centerY) / rect.height;
    targetX = relX * maxRange;
    targetY = relY * maxRange;
  };

  // 🌗 Visibility watcher
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => (isVisible = entry.isIntersecting));
    },
    { threshold: 0.1 } // only counts as visible when ~10% on screen
  );
  io.observe(scene);

  // 🖱️ Desktop
  window.addEventListener("mousemove", e => moveTarget(e.clientX, e.clientY));

  // 📱 Mobile
  window.addEventListener(
    "touchmove",
    e => {
      const t = e.touches[0];
      if (t) moveTarget(t.clientX, t.clientY);
    },
    { passive: true }
  );
  window.addEventListener(
    "touchstart",
    e => {
      const t = e.touches[0];
      if (t) moveTarget(t.clientX, t.clientY);
    },
    { passive: true }
  );

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

// ceasfire break scene

(() => {
  const section = document.querySelector(".ceasefire-parallax");
  const flares = section.querySelectorAll(".flare");
  const city = section.querySelector(".dark-city");
  const people = section.querySelector(".people");
  const rock = section.querySelector(".rock");
  const smoke = section.querySelector(".smoke-bottom");


  window.addEventListener("scroll", () => {
    const rect = section.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);

    // move flares downward (different speeds)
    flares.forEach(flare => {
      const speed = parseFloat(flare.dataset.speed) || 0.2;
      const translateY = progress * 80 * (speed * 3); // more distance
      flare.style.transform = `translateY(${translateY}vh)`;
    });
 // === City rises (background) ===
    const cityLift = -progress * 80; // moves upward as you scroll
    city.style.transform = `translateY(${cityLift}px)`;
    // city.style.opacity = Math.min(progress * 1.4, 1);

    const smokeLift = progress * 20; // moves upward as you scroll
    smoke.style.transform = `translateY(${cityLift}px)`;
    // city.style.opacity = Math.min(progress * 1.4, 1);


    // === People + rock descend (foreground) ===
    const foregroundMove = progress * 40; // move downward
    people.style.transform = `translateY(${foregroundMove}px)`;
    rock.style.transform = `translateY(${foregroundMove}px)`;  });
})();



// eye on rafah scene
(() => {
  const scene = document.querySelector(".eye-illustration");
  const eye = scene?.querySelector(".eye-layer.eyeball");
  if (!scene || !eye) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let isVisible = false; // 🔥 track visibility

  // ✨ Motion tuning
  const rangeX = isMobile ? 50 : 60;    // horizontal movement range
  const rangeY = isMobile ? 10 : 20;    // downward movement range
  const smoothness = isMobile ? 0.08 : 0.05; // smoother on desktop

  const updateEye = () => {
    // when not visible, ease back to center
    if (!isVisible) {
      targetX *= 0.9;
      targetY *= 0.9;
    }

    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;
    eye.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(updateEye);
  };

  const moveEye = (x, y) => {
    if (!isVisible) return; // 🧠 only move if visible
    const rect = scene.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (x - centerX) / rect.width;
    const relY = (y - centerY) / rect.height;

    targetX = relX * rangeX;
    targetY = Math.max(0, relY * rangeY); // only from middle downward
  };

  // 🌗 Visibility watcher
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => (isVisible = entry.isIntersecting));
    },
    { threshold: 0.1 } // only active when at least 10% is visible
  );
  io.observe(scene);

  // 🖱️ Desktop — global tracking
  if (!isMobile) {
    window.addEventListener("mousemove", e => moveEye(e.clientX, e.clientY));
    window.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });
  }

  // 📱 Mobile — global touch tracking
  if (isMobile) {
    window.addEventListener(
      "touchmove",
      e => {
        const t = e.touches[0];
        if (t) moveEye(t.clientX, t.clientY);
      },
      { passive: true }
    );

    window.addEventListener(
      "touchstart",
      e => {
        const t = e.touches[0];
        if (t) moveEye(t.clientX, t.clientY);
      },
      { passive: true }
    );
  }

  updateEye();
})();


// closing scene parallax
(() => {
  const section = document.querySelector(".closing-scene");
  if (!section) return;

  const layers = {
    leftBack: section.querySelector(".layer-left-back"),
    rightBack: section.querySelector(".layer-right-back"),
    leftFront: section.querySelector(".layer-left-front"),
    rightFront: section.querySelector(".layer-right-front"),
    woman: section.querySelector(".layer-woman"),
  };

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Smooth easing function
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Update on scroll
  window.addEventListener("scroll", () => {
    const rect = section.getBoundingClientRect();
    let progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    const eased = easeInOutCubic(progress);

    // X motion follows a sine curve (natural)
    const wave = Math.sin(eased * Math.PI);

    // Depth multipliers (back moves less, front more)
    const depth = {
      backY: isMobile ? 20 : 40,
      frontY: isMobile ? 35 : 100,
      backX: isMobile ? 10 : 20,
      frontX: isMobile ? 15 : 90,
    };

    // Background (moves up + subtle drift)
    layers.leftBack.style.transform = `
      translate(${wave * -depth.backX}px, ${-eased * depth.backY}px) 
      scale(${1 + eased * 0.01})
    `;
    layers.rightBack.style.transform = `
      translate(${wave * depth.backX}px, ${-eased * depth.backY}px)
      scale(${1 + eased * 0.01})
    `;

    // Foreground (moves down + more outward)
    layers.leftFront.style.transform = `
      translate(${wave * -depth.frontX}px, ${eased * depth.frontY}px)
      scale(${1 + eased * 0.03})
    `;
    layers.rightFront.style.transform = `
      translate(${wave * depth.frontX}px, ${eased * depth.frontY}px)
      scale(${1 + eased * 0.03})
    `;

    // Woman (slight delay + zoom)
    const womanEase = easeInOutCubic(Math.min(progress + 0.05, 1));
    layers.woman.style.transform = `
      translate(0, ${womanEase * depth.frontY * 0.8}px)
      scale(${1 + womanEase * 0.04})
    `;
  });
})();
