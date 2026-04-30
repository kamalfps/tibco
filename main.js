document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  
  // 1. Scene Setup
  const scene = new THREE.Scene();
  // Set background to the warm cream color
  scene.background = new THREE.Color(0xFAF7F2);
  scene.fog = new THREE.FogExp2(0xFAF7F2, 0.03);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true; 
  container.appendChild(renderer.domElement);

  // 2. High-End Studio Lighting for Cream/Brown theme
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
  scene.add(ambientLight);

  // Main soft warm light
  const mainLight = new THREE.DirectionalLight(0xffeedd, 3.5);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  // Subtle fill light
  const fillLight = new THREE.DirectionalLight(0xeebb99, 1.5);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // 3. Luxurious Materials
  // Matte cream ceramic cup
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0xFDFBF7,       
    metalness: 0.1,
    roughness: 0.3,        
    clearcoat: 0.5,        
    clearcoatRoughness: 0.2
  });

  // Deep rich espresso liquid
  const coffeeMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a0a00,       
    metalness: 0.1,
    roughness: 0.0,        
  });

  // Copper/Bronze accent trim
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0x8B5A3C,
    metalness: 0.7,
    roughness: 0.3
  });

  // 4. Build the Cup
  const coffeeGroup = new THREE.Group();
  
  // Offset to the right so it balances with the text on desktop
  if(window.innerWidth > 768) {
      coffeeGroup.position.x = 4;
  }

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

  // 5. Particles: Subtle Steam & Coffee Dust
  // Steam
  const steamGeo = new THREE.BufferGeometry();
  const steamCount = 100;
  const steamPos = new Float32Array(steamCount * 3);
  for(let i=0; i<steamCount*3; i++) {
    steamPos[i] = (Math.random() - 0.5) * 2;
  }
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
  const steamMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.2, // Very subtle against cream background
  });
  const steam = new THREE.Points(steamGeo, steamMat);
  steam.position.y = 1.5;
  coffeeGroup.add(steam);

  // Floating Mocha Dust
  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 150;
  const dustPos = new Float32Array(dustCount * 3);
  for(let i=0; i<dustCount*3; i+=3) {
    dustPos[i] = (Math.random() - 0.5) * 25;   
    dustPos[i+1] = (Math.random() - 0.5) * 25; 
    dustPos[i+2] = (Math.random() - 0.5) * 15; 
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x5D4037, // Mocha brown dots
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // 6. Camera Position & Interaction
  camera.position.set(0, 3, 12);
  camera.lookAt(0, 0, 0);
  coffeeGroup.rotation.x = 0.2; 

  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - windowHalfX) * 0.001;
    mouseY = (e.clientY - windowHalfY) * 0.001;
  });

  // Track scrolling to move the camera down
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // 7. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smoothly pan camera based on mouse AND scroll position
    // As you scroll down the page, the cup moves up in the background
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 3 + 3 + (scrollY * 0.005) - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Gently float and rotate the cup
    coffeeGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
    coffeeGroup.rotation.y += 0.003;
    coffeeGroup.rotation.x = 0.1 + Math.sin(elapsedTime * 0.5) * 0.05;

    // Animate Steam
    const positions = steam.geometry.attributes.position.array;
    for(let i=0; i<steamCount; i++) {
      let y = positions[i*3+1];
      y += 0.008;
      if (y > 3) {
        y = 0; 
        positions[i*3] = (Math.random() - 0.5) * 2; 
        positions[i*3+2] = (Math.random() - 0.5) * 2; 
      }
      positions[i*3+1] = y;
      positions[i*3] += Math.sin(elapsedTime + i) * 0.002; 
    }
    steam.geometry.attributes.position.needsUpdate = true;

    // Animate Mocha Dust
    dust.rotation.y = elapsedTime * 0.02;
    dust.rotation.x = elapsedTime * 0.01;

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if(window.innerWidth > 768) {
        coffeeGroup.position.x = 4;
    } else {
        coffeeGroup.position.x = 0;
    }
  });
});
