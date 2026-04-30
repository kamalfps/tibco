document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  
  // 1. Scene Setup
  const scene = new THREE.Scene();
  
  // Soft, cheerful lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(5, 10, 7);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffe6e6, 0.5); // Warm fill
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  // 2. Camera Setup
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  
  // Position camera to the left on desktop so cup is on the right
  if(window.innerWidth > 768) {
    camera.position.set(-3, 4, 12);
  } else {
    camera.position.set(0, 4, 14); // Centered on mobile
  }
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3. Dribbble-Style Clay Materials
  const cupMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF6B6B,       // Vibrant Coral
    roughness: 0.7,        // Matte finish
    metalness: 0.1,
  });

  const coffeeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2D1A11,       // Dark rich coffee
    roughness: 0.2,        // Slightly shiny liquid
    metalness: 0.1
  });

  const beanMaterial = new THREE.MeshStandardMaterial({
    color: 0x8D6E63,       // Soft mocha brown
    roughness: 0.8,
    metalness: 0.0
  });

  // 4. Build the "Chunky" Cup
  const coffeeGroup = new THREE.Group();

  // The main cup body (Cylinder)
  const bodyGeo = new THREE.CylinderGeometry(1.5, 1.2, 2.5, 32);
  const body = new THREE.Mesh(bodyGeo, cupMaterial);
  
  // The chunky lip (Torus)
  const lipGeo = new THREE.TorusGeometry(1.5, 0.2, 16, 32);
  const lip = new THREE.Mesh(lipGeo, cupMaterial);
  lip.position.y = 1.25;
  lip.rotation.x = Math.PI / 2;

  // The coffee liquid
  const liquidGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.4, 32);
  const liquid = new THREE.Mesh(liquidGeo, coffeeMaterial);
  liquid.position.y = 0.1; // Liquid sits slightly below the rim

  // The thick, rounded handle (Torus)
  const handleGeo = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
  const handle = new THREE.Mesh(handleGeo, cupMaterial);
  handle.position.set(1.4, 0, 0);
  handle.rotation.z = -Math.PI / 16;

  // The chunky saucer
  const saucerGeo = new THREE.CylinderGeometry(2.2, 2.0, 0.4, 32);
  const saucer = new THREE.Mesh(saucerGeo, cupMaterial);
  saucer.position.y = -1.45;

  coffeeGroup.add(body, lip, liquid, handle, saucer);
  scene.add(coffeeGroup);

  // 5. Build Floating "Clay" Coffee Beans
  const beans = [];
  const beanGeo = new THREE.SphereGeometry(0.3, 32, 32);
  // Distort sphere to look like a bean
  beanGeo.scale(1, 1.4, 0.8); 

  for(let i=0; i<4; i++) {
    const bean = new THREE.Mesh(beanGeo, beanMaterial);
    
    // Random positions around the cup
    bean.position.x = (Math.random() - 0.5) * 6;
    bean.position.y = (Math.random() - 0.5) * 6;
    bean.position.z = (Math.random() - 0.5) * 4;
    
    // Store random rotation speeds
    bean.userData = {
      rotX: Math.random() * 0.02,
      rotY: Math.random() * 0.02,
      floatSpeed: Math.random() * 0.02 + 0.01,
      startY: bean.position.y
    };

    beans.push(bean);
    scene.add(bean);
  }

  // 6. Mouse Interaction (Parallax)
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // 7. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smoothly rotate the main cup based on time and mouse
    coffeeGroup.rotation.y = elapsedTime * 0.2 + (mouseX * 0.5);
    coffeeGroup.rotation.x = 0.2 + (mouseY * 0.2);
    coffeeGroup.position.y = Math.sin(elapsedTime * 2) * 0.2; // Gentle bob

    // Animate the floating beans
    beans.forEach((bean, index) => {
      bean.rotation.x += bean.userData.rotX;
      bean.rotation.y += bean.userData.rotY;
      // Make them float up and down out of sync
      bean.position.y = bean.userData.startY + Math.sin(elapsedTime * 2 + index) * 0.5;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if(window.innerWidth > 768) {
      camera.position.set(-3, 4, 12);
    } else {
      camera.position.set(0, 4, 14);
    }
  });
});
