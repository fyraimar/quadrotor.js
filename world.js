var sphereShape, sphereBody, world, physicsMaterial;

      var camera, scene, renderer;
      var geometry, material, mesh;
      var controls, time = Date.now();

      var blocker = document.getElementById('blocker');
      var instructions = document.getElementById( 'instructions' );

      var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

      if ( havePointerLock ) {
        var element = document.body;

        var pointerlockchange = function (event) {
          if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controls.enabled = true;
            blocker.style.display = 'none' ;
            } else {
            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = '-box';

            instructions.style.display = '';

          }
        }

        var pointerlockerror = function ( event ) {
          instructions.style.display = '';
        }
        
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false);

        instructions.addEventListener( 'click', function (event) {
          instructions.style.display = 'none';

          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock ;
          if ( /Firefox/i.test (navigator.userAgent) ) {
            var fullscreenchange = function (event) {
              if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement == element ) {
                document.removeEventListener( 'fullscreenchange' , fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                element.requestPointerLock();
              }
            }
            document.addEventListener( 'fullscreenchange', fullscreenchange, false);
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false);
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen ();
            } else {
            element.requestPointerLock (); 
          }
        }, false );

        } else {
        instructions.innerHTML = 'Your browser dosen\'t seem to support Pointer Lock API';
      }

	  //-------------- Model ---------------
	  var quadrotor;
	  var PIDcontrol;
	  var noise;
	  
      initCannon();
      init();
      animate();

      function initCannon (){ 
        world = new CANNON.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;

        var solver = new CANNON.GSSolver ();

        world.defaultContactMaterial.contactEquationStiffness = 1e9;
        world.defaultContactMaterial.contactEquationRegularizationTime = 4;

        solver.iteration = 10;
        solver.tolerance = 1e-6;
        var split = true;
        if (split) 
          world.solver = new CANNON.SplitSolver(solver);
        else 
          world.solver = solver;

          world.gravity.set(0,0,-10);
          world.broadphase = new CANNON.NaiveBroadphase ();

          physicsMaterial = new CANNON.Material("slipperyMaterial");
          var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.9, 0.3 );
          world.addContactMaterial(physicsContactMaterial);

          var mass = 1, radius = 1;//We shouldn't affect the world.
          sphereShape = new CANNON.Sphere(radius);
          sphereBody = new CANNON.RigidBody (mass, sphereShape, physicsMaterial);
          sphereBody.position.set(0,-20,1);
          sphereBody.linearDamping = 0.9;
          world.add(sphereBody);

          var groundShape = new CANNON.Plane();
          var groundBody = new CANNON.RigidBody( 0, groundShape, physicsMaterial);
          //groundBody.quaternion.setFromAxisAngle (new CANNON.Vec3(1,0,0), Math.PI);
          world.add(groundBody);
      }

      function init() {
          camera = new THREE.PerspectiveCamera (75, window.Width / window.innerHeight, 0.1, 1000);
		camera.up.set(0,0,1);
		camera.lookAt( new THREE.Vector3( 0, 1, 0 ) );
		
          scene = new THREE.Scene();
          scene.fog = new THREE.Fog (0xbbbbbb, 0, 500);

          var ambient = new THREE.AmbientLight (0x111111);

          scene.add (ambient);
          
          
          light = new THREE.SpotLight (0xffaaff);
          //light.position.set (10 ,30 ,20);
          light.position.set (-100 ,-200 ,300);
          light.target.position.set (0, -50, 0);
          if (true) {
            light.itensity = 0.5;
            light.castShadow = true;

            light.shadowCameraNear = 20;
            light.shadowCameraFar = 50;
            light.shadowCameraFov = 40;

            light.shadowMapBias = 0.1;
            light.shadowMapDarkness = 0.7;
            light.shadowMapWidth = 2 * 512;
            light.shadowMapHeight = 2 * 512;
          }
          scene.add (light);

          light = new THREE.SpotLight (0xffffaa);
          //light.position.set (10 ,30 ,20);
          light.position.set (100 ,200 ,300);
          light.target.position.set (0, 50, 0);
          if (true) {
            light.itensity = 0.5;
            light.castShadow = true;

            light.shadowCameraNear = 20;
            light.shadowCameraFar = 50;
            light.shadowCameraFov = 40;

            light.shadowMapBias = 0.1;
            light.shadowMapDarkness = 0.7;
            light.shadowMapWidth = 2 * 512;
            light.shadowMapHeight = 2 * 512;
          }
          scene.add (light);

          controls = new PointerLockControls (camera, sphereBody);
          scene.add (controls.getObject());

          geometry = new THREE.PlaneGeometry (300, 300, 50, 50);
          geometry.applyMatrix (new THREE.Matrix4().makeRotationZ( -Math.PI/2 ));
          material = new THREE.MeshLambertMaterial( {color:0xbbbbbb} );
          THREE.ColorUtils.adjustHSV (material.color, 0, 0, 0.9);

          mesh = new THREE.Mesh (geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add ( mesh );

          renderer = new THREE.WebGLRenderer();
          renderer.shadowMapEnabled = true;
          renderer.shadowMapSoft = true;
          renderer.setSize ( window.innerWidth, window.innerHeight );
          renderer.setClearColor (scene.fog.color, 1);

          document.body.appendChild (renderer.domElement);

          window.addEventListener("resize", onWindowResize, false);

		  
		  // init all
		quadrotor = new quadrotor_ParticleModel();
		PIDcontrol = new controller(quadrotor.getAllParticles, quadrotor.setModelPin);
		noise = new Noise(quadrotor, world, scene);
		  
		  
			// init quadrotor:
			// inner 3.36cm / outer 4.32cm
			quadrotor.constructModel(3.36, 4.32, 0.5,
				[0.0047, 0.00001, 0.00401, 0.00001,
				0.0047, 0.00001, 0.00401, 0.00001,
				0.0047, 0.00001, 0.00401, 0.00001,
				0.0047, 0.00001, 0.00401, 0.00001,
				 0.00004, 0.00004]);
			quadrotor.showModel(world, scene);
			
			// PIDcontrol setup
			PIDcontrol.setup();
			noise.setup();
        }

        function onWindowResize () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize ( window.innerWidth, window.innerHeight);
        }

        var dt = 1/200;
		var counter = 0;
        function animate() {
          requestAnimationFrame( animate );
          if (controls.enabled) {
            world.step (dt);

			// update function
			PIDcontrol.loop();
			noise.loop();			
			quadrotor.updateAnimate();
          }
          controls.update (Date.now() - time);
          renderer.render (scene, camera);
          time = Date.now();

        }