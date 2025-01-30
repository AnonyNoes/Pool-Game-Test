// Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x87CEEB);
    document.body.appendChild(renderer.domElement);

    // Physics setup
    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);
    world.solver.iterations = 10;

    // Load the image as a texture for the felt
    const textureLoader = new THREE.TextureLoader();
    const feltTexture = textureLoader.load('YOUR_IMAGE_URL.jpg'); // Replace 'YOUR_IMAGE_URL.jpg' with the actual URL of your image
    feltTexture.wrapS = feltTexture.wrapT = THREE.RepeatWrapping;
    feltTexture.repeat.set(4, 4); // Adjust repeat as needed

    // Create floor (ground plane) with the felt texture
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: feltTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor physics
    const floorBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0)
    });
    const floorShape = new CANNON.Plane();
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

    // Sphere colors
    const sphereColors = [
      0xff0000, // Red
      0x000000, // Black
      0xffa500, // Orange
      0x0000ff, // Blue
      0xffff00, // Yellow
      0xffffff, // White
      0x00ff00, // Green
      0x90ee90  // Light Green
    ];

    // Load environment map
    const rgbeLoader = new THREE.RGBELoader();
    rgbeLoader.load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      // Create spheres
      const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
      const sphereBodies = [];

      for (let i = 0; i < sphereColors.length; i++) {
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
          color: sphereColors[i],
          roughness: 0.1,
          metalness: 0.1,
          reflectivity: 0.8,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          envMap: texture,
          envMapIntensity: 0.8
        });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        // Position spheres in a grid-like pattern
        const x = (i % 4) * 3 - 4.5;
        const z = Math.floor(i / 4) * 3 - 3;
        sphere.position.set(x, 1, z);

        scene.add(sphere);

        // Add physics body
        const sphereBody = new CANNON.Body({
          mass: 1,
          position: new CANNON.Vec3(x, 1, z)
        });
        const sphereShape = new CANNON.Sphere(1);
        sphereBody.addShape(sphereShape);
        world.addBody(sphereBody);
        sphereBodies.push(sphereBody);
        sphere.userData.physicsBody = sphereBody;
      }
    });

    // Load PBR textures for the wood
    const woodBaseColor = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg'); // Replace with your wood texture
    const woodNormalMap = textureLoader.load('https://threejs.org/examples/textures/hardwood2_bump.jpg'); // Replace with your wood normal map
    const woodRoughnessMap = textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg'); // Replace with your wood roughness map

    // Pool Stick
    const stickGeometry = new THREE.CylinderGeometry(0.1, 0.2, 5, 32);
    const stickMaterial = new THREE.MeshStandardMaterial({
      map: woodBaseColor,
      normalMap: woodNormalMap,
      roughnessMap: woodRoughnessMap,
      roughness: 0.7,
      metalness: 0.2
    });
    const poolStick = new THREE.Mesh(stickGeometry, stickMaterial);
    poolStick.position.set(0, 1, 5); // Initial position
    poolStick.rotation.x = Math.PI / 2; // Horizontal
    scene.add(poolStick);

    // Create pool table edges
    const edgeMaterial = new THREE.MeshStandardMaterial({
      map: woodBaseColor,
      normalMap: woodNormalMap,
      roughnessMap: woodRoughnessMap,
      roughness: 0.7,
      metalness: 0.2
    });

    const edgeThickness = 0.5; // Thickness of the edge
    const edgeHeight = 1;     // Height of the edge

    // Long edges
    const longEdgeGeometry = new THREE.BoxGeometry(20 + 2 * edgeThickness, edgeHeight, edgeThickness);
    const longEdge1 = new THREE.Mesh(longEdgeGeometry, edgeMaterial);
    const longEdge2 = new THREE.Mesh(longEdgeGeometry, edgeMaterial);
    longEdge1.position.set(0, edgeHeight / 2, -10 - edgeThickness / 2);
    longEdge2.position.set(0, edgeHeight / 2, 10 + edgeThickness / 2);
    longEdge1.castShadow = true;
    longEdge2.castShadow = true;
    longEdge1.receiveShadow = true;
    longEdge2.receiveShadow = true;
    scene.add(longEdge1);
    scene.add(longEdge2);

    // Short edges
    const shortEdgeGeometry = new THREE.BoxGeometry(edgeThickness, edgeHeight, 20);
    const shortEdge1 = new THREE.Mesh(shortEdgeGeometry, edgeMaterial);
    const shortEdge2 = new THREE.Mesh(shortEdgeGeometry, edgeMaterial);
    shortEdge1.position.set(-10 - edgeThickness / 2, edgeHeight / 2, 0);
    shortEdge2.position.set(10 + edgeThickness / 2, edgeHeight / 2, 0);
    shortEdge1.castShadow = true;
    shortEdge2.castShadow = true;
    shortEdge1.receiveShadow = true;
    shortEdge2.receiveShadow = true;
    scene.add(shortEdge1);
    scene.add(shortEdge2);

    // Add physics bodies for the edges
    function addEdgePhysics(mesh) {
      const shape = new CANNON.Box(new CANNON.Vec3(
        mesh.geometry.parameters.width / 2,
        mesh.geometry.parameters.height / 2,
        mesh.geometry.parameters.depth / 2
      ));
      const body = new CANNON.Body({ mass: 0, position: mesh.position.clone() });
      body.addShape(shape);
      body.quaternion.copy(mesh.quaternion); // Match the rotation
      world.addBody(body);
    }

    addEdgePhysics(longEdge1);
    addEdgePhysics(longEdge2);
    addEdgePhysics(shortEdge1);
    addEdgePhysics(shortEdge2);

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(-5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Camera setup
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Mouse Interaction
    let isDragging = false;
    let previousMousePosition = {
      x: 0,
      y: 0
    };

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);

    function onMouseDown(event) {
      if (event.button === 2) { // Right mouse button
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
      }
    }

    function onMouseMove(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
    
      const intersects = raycaster.intersectObject(poolStick);
      const isMouseOverStick = intersects.length > 0;
    
      // Change cursor style based on mouse over
      if (isMouseOverStick) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    
      if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
    
        // Adjust pool stick position based on mouse movement
        poolStick.position.x += deltaX * 0.01;
        poolStick.position.z += deltaY * 0.01;
    
        // Clamp pool stick position within the table bounds
        const tableWidth = 10; // Adjust as needed
        const tableLength = 10; // Adjust as needed
        poolStick.position.x = Math.max(-tableWidth, Math.min(tableWidth, poolStick.position.x));
        poolStick.position.z = Math.max(-tableLength, Math.min(tableLength, poolStick.position.z));
    
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
      }
    }
    

    function onMouseUp(event) {
      if (event.button === 2) { // Right mouse button
        isDragging = false;
      }
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update physics
      world.step(1 / 60);

      // Update sphere positions if using physics
      for (let i = 0; i < scene.children.length; i++) {
        const obj = scene.children[i];
        if (obj.isMesh && obj.userData.physicsBody) {
          obj.position.copy(obj.userData.physicsBody.position);
          obj.quaternion.copy(obj.userData.physicsBody.quaternion);
        }
      }

      renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate();
