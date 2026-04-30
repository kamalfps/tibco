document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  
  // Cream background
  scene.background = new THREE.Color(0xEAE6DF);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // High-End Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
  scene.add(ambientLight);
  const mainLight = new THREE.DirectionalLight(0xffeedd, 3.0);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  // Materials
  const ceramicMat = new THREE.MeshPhysicalMaterial({ color: 0xFDFBF7, roughness: 0.2, clearcoat: 0.6 });
  const coffeeMat = new THREE.MeshPhysicalMaterial({ color: 0x1a0a00, roughness: 0.0 });

  // Build the Cup
  const coffeeGroup = new THREE.Group();
  
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 2.8, 64), ceramicMat);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 64), coffeeMat);
  liquid.position.y = 0.1;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.2, 16, 64), ceramicMat);
  handle.position.set(1.3, 0, 0);
  handle.rotation.z = -Math.PI / 16;
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.8, 0.2, 64), ceramicMat);
  saucer.position.y = -1.5;

  coffeeGroup.add(cup, liquid, handle, saucer);
  scene.add(coffeeGroup);

  // Base Camera Position
  camera.position.set(0, 2, 12);
  camera.lookAt(0, 0, 0);

  // --- THE PIXILA SCROLL MAGIC ---
  // This ties the 3D rotation directly to the user's scroll bar
  
  // 1. Initial State (Hero Section)
  // Cup is on the right, tilted slightly
  coffeeGroup.position.x = 2.5;
  coffeeGroup.rotation.x = 0.2;
  coffeeGroup.rotation.y = -0.5;

  // 2. Animate as you scroll down the page
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1, // 'Scrub' makes the animation perfectly follow the scrollbar
    }
  });

  // Scroll to Philosophy Section: Move cup to the left, rotate it around
  tl.to(coffeeGroup.position, { x: -2.5, ease: "power1.inOut" }, 0);
  tl.to(coffeeGroup.rotation, { y: Math.PI, ease: "power1.inOut" }, 0);

  // Scroll to Menu Section: Move cup to the right, look down at it
  tl.to(coffeeGroup.position, { x: 2.5, ease: "power1.inOut" }, 1);
  tl.to(coffeeGroup.rotation, { x: 0.8, y: Math.PI * 2, ease: "power1.inOut" }, 1);
  tl.to(camera.position, { z: 8, ease: "power1.inOut" }, 1); // Zoom in slightly

  // Scroll to Footer: Move to center, zoom way out
  tl.to(coffeeGroup.position, { x: 0, ease: "power1.inOut" }, 2);
  tl.to(camera.position, { z: 15, ease: "power1.inOut" }, 2);


  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Add a tiny constant float so it looks alive even when not scrolling
    coffeeGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1;
    
    renderer.render(scene, camera);
  }
  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust layout for mobile
    if(window.innerWidth <= 768) {
      coffeeGroup.position.x = 0; // Keep centered on mobile
    }
  });
});
