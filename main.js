document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  
  // 1. Scene Setup
  const scene = new THREE.Scene();
  // Deep espresso gradient background effect is handled by fog
  scene.background = new THREE.Color(0x050404);
  scene.fog = new THREE.FogExp2(0x050404, 0.03);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 12); // Pushed back to give room for text

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true; // Crucial for photorealism
  container.appendChild(renderer.domElement);

  // 2. Cinematic Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Very low base light
  scene.add(ambientLight);

  // Warm rim light (like sunset/mood lighting)
  const warmLight = new THREE.DirectionalLight(0xffaa55, 3);
  warmLight.position.set(5, 5, -5);
  scene.add(warmLight);

  // Cool fill light (brings out reflections)
  const coolLight = new THREE.DirectionalLight(0x55aaff, 1);
  coolLight.position.set(-5, 3, 5);
  scene.add(coolLight);

  // 3. High-End Materials
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,       // Very dark grey/black
    metalness: 0.2,
    roughness: 0.1,        // Glossy
    clearcoat: 1.0,        // Shiny lacquer finish
    clearcoatRoughness: 0.1
  });

  const coffeeMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a0a00,       // Deep black/brown
    metalness: 0.1,
    roughness: 0.0,        // Liquid mirror
    transmission: 0.8,     // Slight translucency
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    metalness: 1.0,
    roughness: 0.2
  });

  // 4. Build the Cup
  const coffeeGroup = new THREE.Group();
  
  // Move group to the right side of the screen on desktop
  if(window.innerWidth > 768) {
      coffeeGroup.position.x = 3.5;
  }

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 2.8, 64), ceramicMat);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 64), coffeeMat);
  liquid.position.y = 0.1;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.2, 16, 64), ceramicMat);
  handle.position.set(1.3, 0, 0);
  handle.rotation.z = -Math.PI / 16;
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.8, 0.2, 64), ceramicMat);
  saucer.position.y = -1.5;
  const trim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.03, 16, 64), goldMat);
  trim.position.y = 1.4;
  trim.rotation.x = Math.PI / 2;

  coffeeGroup.add(cup, liquid, handle, saucer, trim);
  scene.add(coffeeGroup);

  // 5. Particle Systems
  // --- Steam ---
  const steamGeo = new THREE.BufferGeometry();
  const steamCount = 150;
  const steamPos = new Float32Array(steamCount * 3);
  for(let i=0; i<steamCount*3; i++) {
    steamPos[i] = (Math.random() - 0.5) * 2;
  }
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
  const steamMat = new THREE.PointsMaterial({
    color: 0xdddddd,
    size: 0.05,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const steam = new THREE.Points(steamGeo, steamMat);
  steam.position.y = 1.5;
  coffeeGroup.add(steam);

  // --- Gold Dust ---
  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 300;
  const dustPos = new Float32Array(dustCount * 3);
  for(let i=0; i<dustCount*3; i+=3) {
    dustPos[i] = (Math.random() - 0.5) * 20;   // X
    dustPos[i+1] = (Math.random() - 0.5) * 20; // Y
    dustPos[i+2] = (Math.random() - 0.5) * 10; // Z
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: 0.03,
    transparent: true,
    opacity: 0.8
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // 6. Smooth Mouse Interaction (Parallax)
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX - windowHalfX) * 0.002;
    targetY = (e.clientY - windowHalfY) * 0.002;
  });

  // 7. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smoothly pan camera based on mouse
    camera.position.x += (targetX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-targetY * 2 + 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Gently float and rotate the cup
    coffeeGroup.position.y = Math.sin(elapsedTime) * 0.2;
    coffeeGroup.rotation.y += 0.002;
    coffeeGroup.rotation.x = 0.1 + Math.sin(elapsedTime * 0.5) * 0.05;

    // Animate Steam (rising and drifting)
    const positions = steam.geometry.attributes.position.array;
    for(let i=0; i<steamCount; i++) {
      let y = positions[i*3+1];
      y += 0.01;
      if (y > 3) {
        y = 0; // Reset to coffee surface
        positions[i*3] = (Math.random() - 0.5) * 2; // Randomize X
        positions[i*3+2] = (Math.random() - 0.5) * 2; // Randomize Z
      }
      positions[i*3+1] = y;
      positions[i*3] += Math.sin(elapsedTime + i) * 0.002; // Drift
    }
    steam.geometry.attributes.position.needsUpdate = true;

    // Animate Gold Dust
    dust.rotation.y = elapsedTime * 0.05;
    dust.rotation.x = elapsedTime * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust layout for mobile
    if(window.innerWidth > 768) {
        coffeeGroup.position.x = 3.5;
    } else {
        coffeeGroup.position.x = 0;
    }
  });
});
