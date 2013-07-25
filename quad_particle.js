/*
**	Parameter Setting For quadrotor by real test
	Mass: kg  --- 25g + 10.4g						1e-3
	Distance: mm  --- par[2]<--86.5-->par[6]		1e-3
	Velocity: mm\s									1e-3
	Accelerate: mm\(s^2)							1e-3
	Angle/Rad: 0 -- 3.14							1e0
	Force: N --- 1N = 10* 100g						1e0
**	

**	Quadrotor Particle Model
	Particle Array Index: 

	<Ac	10                  2 Cw>
		12 \  9        1  / 4
			 11 \ 	 / 3
				  17 
				  18	
				/ 	 \
			  5        12
		 6 /  7        15 \ 14
	 <Cw 8                  16  Ac>

	X
	|
	|
	o - ->Y
**

**	2 -- 17 : len = outerlen * Math.sqrt(2)
	1 -- 17 : len = innerlen * Math.sqrt(2)
	17 -- 18: len = height
**	

**	pin --> n --> F
	1. force up
		131219 * pin - 802520 =  (n*6.2832)^3 / 2000
		F(up) = 2.2407e-10 * n^2 - 2.5540e-3
	2. force spin
		131219 * pin - 802520 =  (n*6.2832)^3 / 2000
		F(sp) = (1.3214e-12 * n^2 - 8.9615e-6) / 43.15e-3
**
*/

	quadrotor_ParticleModel = function(){
		var particles = [];					// CANNON.Particle
		var particleMeshes = [];			// THREE.Mesh
		var particleConstraint = [];		// Distance Constraint
		
		var modelPosition = new CANNON.Vec3(0,0,10);						// Vec3 default: X, Y, Z
		var modelMaterial = new THREE.MeshLambertMaterial( {color:0x0} );	// THREE - Material
		var modelInnerLen = 0;
		var modelOuterLen = 0;
		
		// get all particles condition, particle index as graph about
		// return: particles = CANNON.Particle[18]
		this.getAllParticles = function (){
			return particles;
		}
		
		// Set center point to show model
		// input: x, y, z :float
		this.setModelPosition = function (x, y, z){
			var positionDiff_X = x - modelPosition.x;
			var positionDiff_Y = y - modelPosition.y;
			var positionDiff_Z = z - modelPosition.z;
			
			for (var i=0; i<particles.length; i++)
				particles[i].position.set  (particles[i].position.x + positionDiff_X,
											particles[i].position.y + positionDiff_Y, 
											particles[i].position.z + positionDiff_Z);
											
			for (var i=0; i<particleMeshes.length; i++)
				particleMeshes[i].position.set (particleMeshes[i].position.x + positionDiff_X,
												particleMeshes[i].position.y + positionDiff_Y, 
												particleMeshes[i].position.z + positionDiff_Z);
				
			modelPosition = new CANNON.Vec3(x, y, z);
		}
		// Get center point
		// return: CANNON.Vec3
		this.getModelPosition = function (){
			return modelPosition;
		}
		
		// Set model color
		// colorNum :int (0x000000)
		this.setModelColor = function (colorNum){
			modelMaterial = new THREE.MeshLambertMaterial( {color:colorNum} );
			for (var i=0; i<particleMeshes.length; i++)
				particleMeshes[i].material = modelMaterial;
		}
		
		// Set all particles' mass
		// setMassArray :float[18]
		this.setModelMass = function (setMassArray){	
			for (var i=0; i<particles.length; i++){
				particles[i].mass = setMassArray[i];
			}
		}		
		
		// Add one more point
		this.AddOnePointMass = function (pointPosition, pointMass, world, scene){	
			// CANNON side
			// particle
			var newParticle = new CANNON.Particle(pointMass);
			newParticle.position.copy(pointPosition);
			world.add(newParticle);
			
			// constraint
			var counter = particleConstraint.length;
			for (var i=0; i<particles.length; i++){
				particleConstraint[counter] = (new CANNON.DistanceConstraint( particles[i], newParticle, distof (particles[i], newParticle) , 1e9) );
				world.addConstraint(particleConstraint[counter]);
				counter++;
			}
			
			// THREE side
			var newBallShape = new THREE.SphereGeometry(0.1);
			var newBallSMesh = new THREE.Mesh (newBallShape, modelMaterial);
			newBallSMesh.position.copy(pointPosition);
			newBallSMesh.castShadow = true;
			newBallSMesh.receiveShadow = true;
			newBallSMesh.useQuaternion = true;
			scene.add(newBallSMesh);
			
		}
			
		// Set all particles' velocity 
		// setVelocityArray :CANNON.Vec3[18]
		this.setModelVelocity = function (setVelocityArray){
			for (var i=0; i<particles.length; i++){
				particles[i].velocity.set(setVelocityArray[i].x, setVelocityArray[i].y, setVelocityArray[i].z);
			}
		} 
			
		
		// Set force by setting pin of four rotor, translate:
		// pinsArr: int[4] or float[4]
		// force_up \ force_side: two forces to simulate
		this.setModelPin = function (pinsArr){
			console.log(pinsArr);
		
			var direction = [1,-1,1,-1,-1,-1,1,1];
			var forceArr = new Array();
			var rad, force_up, force_side;
			
			for (var i=0; i<4; i++){
				rad = Math.pow( (131219 * pinsArr[i] - 802520)*2, 1/3 ) * 62.832;
				force_up = 2.2407e-10 * rad*rad - 2.5540e-3;
				force_side = (1.3214e-12 * rad*rad - 8.9615e-6) / 43.15e-3 / Math.sqrt(2);
				forceArr[i] = new CANNON.Vec3(force_side * direction[2*i],  
											force_side * direction[2*i+1],
											force_up);
			}
			setModelForce_norm(forceArr);
		}
		
		// Set 4 point Vertical force ----->follow by pins
		// setForceArray: CANNON.Vec3[4]      -->   arr[1,5,9,13]
		setModelForce_norm = function (setForceArray){
			var deflexion = new CANNON.Quaternion();
			var originPos = new CANNON.Vec3(0,0,1);
			var nowPos = new CANNON.Vec3(particles[16].position.x - particles[17].position.x,
										particles[16].position.y - particles[17].position.y,
										particles[16].position.z - particles[17].position.z);
			deflexion.setFromVectors(originPos, nowPos);
			for (var i=0; i<4; i++){
				setForceArray[i] = deflexion.vmult(setForceArray[i]);
			}
			for (var i=0; i<4; i++){
				particles[i*4+1].force.set(setForceArray[i].x, setForceArray[i].y, setForceArray[i].z);
			}
			//console.log(particles[0].position);
		}
	
		
		// add AxisZ turn force, to simulate spinning witn unbalance
		// forceArr: CANNON.Vec3[4]      -->   arr[1,5,9,13]
			
		// Contruct the origin model
		// innerLen, outerLen, height: float
		// particalMass: float[18] -- index as graph
		this.constructModel = function (innerLen, outerLen, height, particalMass){
			modelInnerLen = innerLen* Math.sqrt(2);
			modelOuterLen = outerLen* Math.sqrt(2);
			// construct all point
			constructModelPoint(innerLen, outerLen, height, particalMass);
			// make all particles' constraints
			pointCloudConstraint();
		}
		
		// Get CANNON.world and THREE.scene to show model
		// world: CANNON.world 
		// scene: THREE.scene
		this.showModel = function(world, scene){
			for (var i=0; i<particles.length; i++){
				world.add(particles[i]);
			}
			for (var i=0; i<particleMeshes.length; i++){
				scene.add(particleMeshes[i]);
			}
			for (var i=0; i <particleConstraint.length; i++){
				world.addConstraint(particleConstraint[i]);
			}
		}
		
		// For animate() to update model position
		this.updateAnimate = function(){
			for (var i=0; i<particles.length; i++ ) {
				particles[i].position.copy (particleMeshes[i].position);
            }
			
			var nextPos = new CANNON.Vec3((particles[3].position.x - particles[7].position.x),
										(particles[3].position.y - particles[7].position.y),
										(particles[3].position.z - particles[7].position.z));
			//console.log(nextPos);
			
		}
			
		// Contruct the parts
		// innerLen, outerLen, height: float
		// particalMass: float[18] -- index as graph
		function constructModelPoint(innerLen, outerLen, height, particalMass){
			var direction = [1,1,-1,-1,1,-1,-1,1];			
			
			// points except center 
			for (var i=0 ; i < 4; i ++) {
				var innerParticleUp = new CANNON.Particle (particalMass[4*i]);
				var outerParticleUp = new CANNON.Particle (particalMass[4*i+1]);
				var innerParticleDown = new CANNON.Particle (particalMass[4*i+2]);
				var outerParticleDown = new CANNON.Particle (particalMass[4*i+3]);
				
				innerParticleUp.position.set ( modelPosition.x + direction[i*2] * innerLen, modelPosition.y + direction[i*2+1] * innerLen, modelPosition.z + height);
				outerParticleUp.position.set ( modelPosition.x + direction[i*2] * outerLen, modelPosition.y + direction[i*2+1] * outerLen, modelPosition.z + height);
				innerParticleDown.position.set ( modelPosition.x + direction[i*2] * innerLen, modelPosition.y + direction[i*2+1] * innerLen, modelPosition.z );
				outerParticleDown.position.set ( modelPosition.x + direction[i*2] * outerLen, modelPosition.y + direction[i*2+1] * outerLen, modelPosition.z );
				
				particles.push (innerParticleUp);
				particles.push (outerParticleUp);
				particles.push (innerParticleDown);
				particles.push (outerParticleDown);
	
				var innerBallUp = new THREE.SphereGeometry(0.1);
				var outerBallUp = new THREE.SphereGeometry(0.1);
				var innerBallDown = new THREE.SphereGeometry(0.1);
				var outerBallDown = new THREE.SphereGeometry(0.1);
				var innerBallMeshUp = new THREE.Mesh (innerBallUp, modelMaterial);
				var outerBallMeshUp = new THREE.Mesh (outerBallUp, modelMaterial);
				var innerBallMeshDown = new THREE.Mesh (innerBallDown, modelMaterial);
				var outerBallMeshDown = new THREE.Mesh (outerBallDown, modelMaterial);

				innerBallMeshUp.position.set ( modelPosition.x + direction[i*2] * innerLen, modelPosition.y + direction[i*2+1] * innerLen, modelPosition.z + height );
				outerBallMeshUp.position.set ( modelPosition.x + direction[i*2] * outerLen, modelPosition.y + direction[i*2+1] * outerLen, modelPosition.z + height );
				innerBallMeshDown.position.set ( modelPosition.x + direction[i*2] * innerLen, modelPosition.y + direction[i*2+1] * innerLen, modelPosition.z );
				outerBallMeshDown.position.set ( modelPosition.x + direction[i*2] * outerLen, modelPosition.y + direction[i*2+1] * outerLen, modelPosition.z );

				innerBallMeshUp.castShadow = true;
				outerBallMeshUp.castShadow = true;
				innerBallMeshDown.castShadow = true;
				outerBallMeshDown.castShadow = true;
				
				innerBallMeshUp.receiveShadow = true;
				outerBallMeshUp.receiveShadow = true;
				innerBallMeshDown.receiveShadow = true;
				outerBallMeshDown.receiveShadow = true;

				innerBallMeshUp.useQuaternion = true;
				outerBallMeshUp.useQuaternion = true;
				innerBallMeshDown.useQuaternion = true;
				outerBallMeshDown.useQuaternion = true;

				particleMeshes.push(innerBallMeshUp);
				particleMeshes.push(outerBallMeshUp);
				particleMeshes.push(innerBallMeshDown);
				particleMeshes.push(outerBallMeshDown);
				
			}
			
			// center point
			var centerParticleUp = new CANNON.Particle(particalMass[16]);
			var centerParticleDown = new CANNON.Particle(particalMass[17]);
			centerParticleUp.position.set (modelPosition.x, modelPosition.y, modelPosition.z + height);
			centerParticleDown.position.set (modelPosition.x, modelPosition.y, modelPosition.z);
			
			particles.push(centerParticleUp);
			particles.push(centerParticleDown);
	
			var centerBallUp = new THREE.SphereGeometry (0.1);
			var centerBallDown = new THREE.SphereGeometry (0.1);
			var centerBallMeshUp = new THREE.Mesh (centerBallUp, modelMaterial);
			var centerBallMeshDown = new THREE.Mesh (centerBallUp, modelMaterial);	
			centerBallMeshUp.position.set (modelPosition.x, modelPosition.y, modelPosition.z + height);
			centerBallMeshDown.position.set (modelPosition.x, modelPosition.y, modelPosition.z);
	
			centerBallMeshUp.castShadow = true;
			centerBallMeshUp.receiveShadow = true;
			centerBallMeshUp.useQuaternion = true;
			centerBallMeshDown.castShadow = true;
			centerBallMeshDown.receiveShadow = true;
			centerBallMeshDown.useQuaternion = true;
	
			particleMeshes.push (centerBallMeshUp);
			particleMeshes.push (centerBallMeshDown);
			//console.log(particleMeshes.length);
			
			// ----for test ----velocity
			particles[1].velocity.set(0,0,0);
			particles[5].velocity.set(0,0,0);
			particles[9].velocity.set(0,0,0);
			particles[13].velocity.set(0,0,0);
		}
		
		function pointCloudConstraint () {
			var counter = 0;
			for ( var i = 0 ; i < particles.length - 1; i ++ ) {
				for ( var j = i + 1 ; j < particles.length; j ++ ) {
					particleConstraint[counter] = (new CANNON.DistanceConstraint( particles[i], particles[j], distof (particles[i], particles[j]) , 1e9) );
					counter++;
				}
			}
		}
        
		function distof (a,b) {
			return  Math.sqrt (
                (a.position.x - b.position.x) * (a.position.x - b.position.x) + 
                (a.position.y - b.position.y) * (a.position.y - b.position.y) + 
                (a.position.z - b.position.z) * (a.position.z - b.position.z) );
        }		
	}	 
	 
	 
