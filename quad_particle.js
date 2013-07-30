/*
**	Parameter Setting For quadrotor by real test:
	Mass: kg  --- 0.035kg							1e0
	Distance: cm  --- par[2]<--86.5-->par[6]		1e-2
	Velocity: cm\s									1e-2
	Accelerate: m\(s^2)								1e0
	Angle/Rad: 0 -- 3.14							1e0
	Force: N --- 1N = 10* 0.1kg						1e0
**	

**	Quadrotor Particle Model
	Particle Array Index: 
	
  (2)							 (1)
	<Ac	 9                  1 Cw>
		11 \  8        0  / 3
			 10 \ 	 / 2
				  16 					|
				  17				  -	o - ->Y
				/ 	 \					|
			  4        12				|
		 5 /  6        14 \ 13			X
	 <Cw 7                  15  Ac>
  (3)							 (4)
**

**	length:
	1 -- 16 : modelOuterLen = outerlen		-- 43.2 mm -- 4.32cm(1e-2)
	0 -- 16 : modelInnerLen = innerlen		-- 33.6 mm -- 3.36cm(1e-2)
	16 -- 17: len = height					--            0.5cm(1e-2)
**	

**	Mass:
	0\4\8\12  (35/4)g
**

**	Origin Force Apply:
	pin --> n --> F
	1. force up
		131219 * pin - 802520 =  (n*6.2832)^3 / 2000
		F(up) = 2.2407e-10 * n^2 - 2.5540e-3
	2. force spin
		131219 * pin - 802520 =  (n*6.2832)^3 / 2000
		F(sp) = (1.3214e-12 * n^2 - 8.9615e-6) / 43.15e-3
	
	get ForceVec3.
**

**	force apply with Incline rotor:
	rotorQuat[0--3]: rotor deviations
	
	ForceVec3 = rotorQuat[i].vmult( ForceVec3 );
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
		
		var rotorQuat = [];					// CANNON.Quaternion  : 
		var massCenter = new CANNON.Vec3(0,0,10);
		
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
			modelPosition = new CANNON.Vec3(0,0,0);
			// 0,1, 4,5, 8,9, 12,13, 16
			for (var i=0; i<particles.length-2; i++){
				if (i%4 == 0 || i%4 == 1){
					modelPosition.vadd(particles[i].position);
				}
			}
			modelPosition.x /= 9;
			modelPosition.y /= 9;
			modelPosition.z /= 9;
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
			newParticle.position.set(particles[16].position.x + pointPosition.x, 
									particles[16].position.y + pointPosition.y, 
									particles[16].position.z + pointPosition.z );
			world.add(newParticle);
			particles.push(newParticle);
			
			// constraint
			var counter = particleConstraint.length;
			for (var i=0; i<particles.length-1; i++){
				particleConstraint[counter] = (new CANNON.DistanceConstraint( particles[i], newParticle, distofParticle (particles[i], newParticle) , 1e9) );
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
			particleMeshes.push(newBallSMesh);
			scene.add(newBallSMesh);
		}
		
		// remove point
		this.RemoveOnePointMass = function (world, scene){	
			particles[particles.length-1].mass = 0;
			// CANNON side
			// constraint
			var counter = particleConstraint.length-1;
			for (var i=0; i<particles.length; i++){
				world.removeConstraint(particleConstraint[counter]);
				particleConstraint.splice(counter,1);
				counter--;
			}
			console.log("1 "+ particleConstraint.length);
			
			// particle
			//world.remove(particles[particles.length-1]);
			particles.splice(particles.length-1,1)
			console.log("1 "+ particles.length);
			// THREE side
			
			counter = particleMeshes.length-1;
			scene.remove(particleMeshes[counter]);
			particleMeshes.splice(counter,1);
			console.log("1");
		}
			
		// Set all particles' velocity 
		// setVelocityArray : CANNON.Vec3[18]
		this.setModelVelocity = function (setVelocityArray){
			for (var i=0; i<particles.length; i++){
				particles[i].velocity.set(setVelocityArray[i].x, setVelocityArray[i].y, setVelocityArray[i].z);
			}
		} 
			
		// Set Rotors' direction
		// directionArray : CANNON.Vec3[4]
		this.setRotorDirection = function (directionArray){
			normZ = new CANNON.Vec3(0,0,1);
			for (var i=0; i<4; i++){
				 rotorQuat[i].setFromVectors( normZ, directionArray[i] );
			}
		}
		
		// Set force by setting pin of four rotor, translate:
		// pinsArr: int[4] or float[4]
		// force_up \ force_side: two forces to simulate
		this.setModelPin = function (pinsArr){
			var temp = pinsArr[2];
			pinsArr[2] = pinsArr[1];
			pinsArr[1] = temp;
			
			console.log(pinsArr);
		
			var direction = [1,1, -1,-1, 1,-1, -1,1];	//side force direction
			var forceArr = new Array();
			var rad, force_up, force_side;
			var distance;
			getMassCenter();
			
			for (var i=0; i<4; i++){
				distance = distofVec3(particles[i*4+1].position , massCenter);
				rad = Math.pow( (131219 * pinsArr[i] - 802520)*2, 1/3 ) * 62.832;
				
				// calc UP direction force
				force_up = 2.2407e-10 * rad*rad - 2.5540e-3;
				// calc SIDE direction force
				force_side = (1.3214e-12 * rad*rad - 8.9615e-6) / distance / Math.sqrt(2) / 1e-2;
				forceArr[i] = new CANNON.Vec3(0,//force_side * direction[2*i],  
											0,//force_side * direction[2*i+1],
											force_up);
											
				// quaternion to simulate rotor direction
				forceArr[i] = rotorQuat[i].vmult(forceArr[i]);
				//console.log(distance);
			}
			setModelForce_norm(forceArr);
		}
		
		// Set 4 point Vertical force ----->follow by pins
		// setForceArray: CANNON.Vec3[4]      -->   arr[1,5,9,13]
		function setModelForce_norm(setForceArray){
			var deflexion = new CANNON.Quaternion();
			var originPos = new CANNON.Vec3(0,0,1);
			var nowPos = new CANNON.Vec3(particles[16].position.x - particles[17].position.x,
										particles[16].position.y - particles[17].position.y,
										particles[16].position.z - particles[17].position.z);
			deflexion.setFromVectors(originPos, nowPos);
			for (var i=0; i<4; i++){
				setForceArray[i] = deflexion.vmult(setForceArray[i]);
				//console.log(setForceArray[i]);
			}
			for (var i=0; i<4; i++){
				particles[i*4+1].force.set(setForceArray[i].x, setForceArray[i].y, setForceArray[i].z);
			}
			//console.log(particles[0].position);
		}		
			
		// calc mass center
		function getMassCenter(){
			var centerX = 0, centerY = 0, centerZ = 0, massSum = 0;
			for (var i=0; i<particles.length; i++){
				centerX += particles[i].position.x * particles[i].mass;
				centerY += particles[i].position.y * particles[i].mass;
				centerZ += particles[i].position.z * particles[i].mass;
				massSum += particles[i].mass;
			}
			massCenter.x = centerX/massSum;
			massCenter.y = centerY/massSum;
			massCenter.z = centerZ/massSum;
			//console.log(massSum);
		}
		
		
		// Contruct the origin model
		// innerLen, outerLen, height: float
		// particalMass: float[18] -- index as graph
		this.constructModel = function (innerLen, outerLen, height, particalMass){
			modelInnerLen = innerLen;
			modelOuterLen = outerLen;
			innerLen = innerLen / Math.sqrt(2);
			outerLen = outerLen / Math.sqrt(2);
			for (var i=0; i<4; i++)
				rotorQuat[i] = new CANNON.Quaternion();
				
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
			var direction = [-1,1, 1,-1, -1,-1, 1,1];			
			
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
			
			for (var i=0; i<particles.length; i++ ) {
				particles[i].linearDamping =0;
            }
			
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
					particleConstraint[counter] = (new CANNON.DistanceConstraint( particles[i], particles[j], distofParticle (particles[i], particles[j]) , 1e9) );
					counter++;
				}
			}
		}
        
		function distofParticle (a,b) {
			return  Math.sqrt (
                (a.position.x - b.position.x) * (a.position.x - b.position.x) + 
                (a.position.y - b.position.y) * (a.position.y - b.position.y) + 
                (a.position.z - b.position.z) * (a.position.z - b.position.z) );
        }
		
		function distofVec3	(a,b){
			return  Math.sqrt (
                (a.x - b.x) * (a.x - b.x) + 
                (a.y - b.y) * (a.y - b.y) + 
                (a.z - b.z) * (a.z - b.z) );
        }
	}	 
	 
	 
