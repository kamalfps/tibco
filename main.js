document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cup-container');
  if (!container) return; // Failsafe if element doesn't exist

  // Set up 3D Scene
  const scene = new THREE.Scene();
  
  // Set up Camera
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  
  // Set up Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Group to hold all parts of the cup
  const coffeeGroup = new THREE.Group();

  // Define Materials matching the Cream & Espresso theme
  const porcelain = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.1, 
    metalness: 0.1 
  });
  
  const coffeeMat = new THREE.MeshStandardMaterial({ 
    color: 0x2C1E16, 
    roughness: 0.9 
  });
  
  const goldMat = new THREE.MeshStandardMaterial({ 
    color: 0xC69C38, 
    roughness: 0.3, 
    metalness: 0.8 
  });

  // 1. Build Cup Body
  const cupGeo = new THREE.CylinderGeometry(1.6, 1.1, 2.8, 64);
  const cup = new THREE.Mesh(cupGeo, porcelain);
  coffeeGroup.add(cup);

  // 2. Build Liquid Coffee Inside
  const liquidGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.6, 64);
  const liquid = new THREE.Mesh(liquidGeo, coffeeMat);
  liquid.position.y = 0.15; // Raised slightly so it sits 'inside' the cup
  coffeeGroup.add(liquid);

  // 3. Build Cup Handle
  const handleGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 64);
  const handle = new THREE.Mesh(handleGeo, porcelain);
  handle.position.set(1.3, 0, 0);
  handle.rotation.z = -Math.PI / 16;
  coffeeGroup.add(handle);

  // 4. Build Saucer Base
  const saucerGeo = new THREE.CylinderGeometry(2.6, 1.8, 0.2, 64);
  const saucer = new THREE.Mesh(saucerGeo, porcelain);
  saucer.position.y = -1.5;
  coffeeGroup.add(saucer);

  // 5. Build Luxury Gold Trim on Cup Lip
  const trimGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
  const trim = new THREE.Mesh(trimGeo, goldMat);
  trim.position.y = 1.4;
  trim.rotation.x = Math.PI / 2;
  coffeeGroup.add(trim);

  // Add the entire constructed cup to the scene
  scene.add(coffeeGroup);

  // Lighting Setup (Crucial for making materials look real)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Position Camera
  camera.position.set(0, 4, 10);
  camera.lookAt(0, 0, 0);

  // Angle cup slightly down so user can see the coffee inside
  coffeeGroup.rotation.x = 0.2; 

  // Mouse Interaction Variables (Parallax Effect)
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    // Normalize mouse coordinates to range from -1 to 1
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Main Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;
    
    // Auto Spin & Float
    coffeeGroup.rotation.y += 0.005; // Spin slowly
    coffeeGroup.position.y = Math.sin(time * 2) * 0.15; // Bob up and down
    
    // Mouse Parallax reaction
    coffeeGroup.rotation.z = mouseX * 0.1;
    coffeeGroup.rotation.x = 0.2 + (mouseY * 0.1);

    renderer.render(scene, camera);
  }
  
  // Start the animation
  animate();

  // Handle Window Resizing smoothly
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
