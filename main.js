document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lenis Smooth Scroll (The "Pixila" feel)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync GSAP ScrollTrigger with Lenis
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
  gsap.ticker.lagSmoothing(0, 0);

  // 2. Custom Cursor Logic
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  
  let mouseX = 0, mouseY = 0, posX = 0, posY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Direct link for small dot
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0 });
  });

  // Smooth follow for the outer ring
  gsap.ticker.add(() => {
    posX += (mouseX - posX) / 9;
    posY += (mouseY - posY) / 9;
    gsap.set(follower, { x: posX, y: posY });
  });

  // Expand cursor on hoverable elements
  const hoverables = document.querySelectorAll('a, .btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('active'));
    el.addEventListener('mouseleave', () => follower.classList.remove('active'));
  });

  // 3. Magnetic Buttons (Snaps to cursor)
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      const strength = btn.dataset.strength || 20;

      gsap.to(btn, { x: x / strength * 2, y: y / strength * 2, duration: 1, ease: "power3.out" });
      if(btn.querySelector('.btn-text')) {
        gsap.to(btn.querySelector('.btn-text'), { x: x / strength, y: y / strength, duration: 1, ease: "power3.out" });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
      if(btn.querySelector('.btn-text')) {
        gsap.to(btn.querySelector('.btn-text'), { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
      }
    });
  });

  // 4. Page Load Animations (Text slide up)
  const tl = gsap.timeline();
  tl.to('.line', {
    y: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.2
  })
  .fromTo('.fade-up', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, 
    "-=0.8"
  );

  // 5. Scroll Animations
  // Reveal text as it enters viewport
  const scrollLines = document.querySelectorAll('.text-section .line');
  scrollLines.forEach(line => {
    gsap.to(line, {
      y: 0,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: line.parentElement,
        start: "top 85%", // Trigger when 85% down the screen
      }
    });
  });

  // Image Parallax Effect
  gsap.to('.parallax-img', {
    y: "15%", // Moves image down slightly as user scrolls past
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});
