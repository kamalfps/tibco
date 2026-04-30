document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Scene, Camera, and Renderer
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  
  // Warm cream background
  scene.background = new THREE.Color(0xFAF7F2);
  scene.fog = new THREE.FogExp2(0xFAF7F2, 0.04);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. High-End Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
  scene.add(ambientLight);
  const mainLight = new THREE.DirectionalLight(0xffeedd, 3.5);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  // 3. Premium Materials
  const ceramicMat = new THREE.MeshPhysicalMaterial({ color: 0xFDFBF7, roughness: 0.3, clearcoat: 0.5 });
  const coffeeMat = new THREE.MeshPhysicalMaterial({ color: 0x1a0a00, roughness: 0.0 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0x8B5A3C, metalness: 0.7, roughness: 0.3 });

  // 4. Build the Coffee Cup
  const coffeeGroup = new THREE.Group();
  
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 2.8, 64), ceramicMat);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 64), coffeeMat);
  liquid.position.y = 0.1;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.2, 16, 64), ceramicMat);
  handle.position.set(1.3, 0, 0);
  handle.rotation.z = -Math.PI / 16;
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.8, 0.2, 64), ceramicMat);
  saucer.position.y = -1.5;
  const trim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 16, 64), copperMat);
  trim.position.y = 1.4;
  trim.rotation.x = Math.PI / 2;

  coffeeGroup.add(cup, liquid, handle, saucer, trim);
  scene.add(coffeeGroup);

  // 5. Add Floating Coffee Beans
  const beans = new THREE.Group();
  const beanGeo = new THREE.SphereGeometry(0.2, 16, 16);
  beanGeo.scale(1, 1.4, 0.8); // Squish it into a bean shape

  for(let i = 0; i < 15; i++) {
    const bean = new THREE.Mesh(beanGeo, copperMat);
    bean.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    beans.add(bean);
  }
  scene.add(beans);

  // 6. Scroll Animation Magic
  // We use the scroll position to change where the camera looks and moves
  let scrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Base camera position
  camera.position.z = 12;
  camera.position.y = 2;
  camera.position.x = 3;

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Calculate scroll percentage (0 to 1)
    const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);

    // MOVE CAMERA BASED ON SCROLL
    // As user scrolls, the camera orbits around the coffee cup
    camera.position.x = 3 + Math.sin(scrollPercent * Math.PI * 2) * 5;
    camera.position.z = 12 - (scrollPercent * 5); 
    camera.position.y = 2 + (scrollPercent * 3);
    
    // Always keep the camera looking at the coffee cup
    camera.lookAt(coffeeGroup.position);

    // Gently float the cup automatically over time
    coffeeGroup.position.y = Math.sin(elapsedTime) * 0.2;
    
    // Slowly rotate the floating beans
    beans.rotation.y = elapsedTime * 0.05;
    beans.rotation.x = elapsedTime * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // 7. Handle Window Resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
