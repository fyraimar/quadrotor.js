// parameter for Quadrotor control
parameter_func = function( gravity ){
	var ForceSum = new CANNON.Vec3(0,0,0);;
	var MassSum = 0;
	var Gravity = gravity;
	this.getForceAndMass = function( particles ){
		ForceSum = new CANNON.Vec3(0,0,0);
		MassSum = 0;
        for ( var i=0 ; i < particles.length ; i ++  ) {
            ForceSum.x += particles[i].force.x;
            ForceSum.y += particles[i].force.y;
            ForceSum.z += particles[i].force.z;
            MassSum += particles[i].mass;
        }
	}
	// get Accelerate - world Axis
	this.getAccelerate_WorldX = function( particles ){
		this.getForceAndMass(particles);
        return ForceSum.x / MassSum + Gravity.x;
	}
	this.getAccelerate_WorldY = function( particles ){
		this.getForceAndMass(particles);
        return ForceSum.y / MassSum + Gravity.y;
	}
	this.getAccelerate_WorldZ = function( particles ){
		this.getForceAndMass(particles);
        return ForceSum.z / MassSum + Gravity.z;
	}

	// get Accelerate - body Axis
	this.getAccelerate_BodyX = function( particles ){
		
	}
	this.getAccelerate_BodyY = function( particles ){
		
	}
	this.getAccelerate_BodyZ = function( particles ){
		
	}

	// get Angle - world XY-face and Z Axis
	this.getAngle_WorldX = function( particles ){

	}
	this.getAngle_WorldY = function( particles ){

	}
	this.getAngle_WorldZ = function( particles ){

	}

	// get Euler Angle - XYZ mode
	this.getEuler_XYZ = function( particles ){
		var base = [[1,0,0],[0,1,0],[0,0,1]];
		var curBase = this.genBase (particles);
		var thetaY = Math.asin( - curBase[2][0]);
		var thetaZ = Math.asin( curBase[1][0] / (Math.cos(thetaY)) );
		var thetaX = Math.asin( curBase[2][1] / (Math.cos(thetaY)) );
		return [thetaX,thetaY,thetaZ];
	}
	// get Euler Angle - ZYX mode
	this.getEuler_ZYX = function( particles ){

	}

	// get quaternion -
	this.getQuaternion = function( particles ){
		var body_X = new CANNON.Vec3(particles[14].position.x - particles[2].position.x,
									particles[14].position.y - particles[2].position.y,
									particles[14].position.z - particles[2].position.z );
		var body_Y = new CANNON.Vec3(particles[14].position.x - particles[6].position.x,
									particles[14].position.y - particles[6].position.y,
									particles[14].position.z - particles[6].position.z );
		var body_Z = new CANNON.Vec3(particles[16].position.x - particles[17].position.x,
									particles[16].position.y - particles[17].position.y,
									particles[16].position.z - particles[17].position.z );
		var dest_X, dest_Y;
				
		var quat_Z = new CANNON.Quaternion();
		quat_Z.setFromVectors(new CANNON.Vec3(0,0,1) , body_Z);
		
		dest_X = (quat_Z.inverse()).vmult(body_X);
		dest_Y = (quat_Z.inverse()).vmult(body_Y);
		var quat_Y = new CANNON.Quaternion();
		quat_Y.setFromVectors(new CANNON.Vec3(0,1,0) , dest_Y);
		
		dest_X = (quat_Y.inverse()).vmult(dest_X);
		var quat_X = new CANNON.Quaternion();
		quat_X.setFromVectors(new CANNON.Vec3(1,0,0) , dest_X);
		
		return quat_Z.mult(quat_Y.mult(quat_X));
	}


	this.genBase = function(particles) {
		var vecBaseX = new CANNON.Vec3(0,0,0);
		var vecBaseY = new CANNON.Vec3(0,0,0);
		var vecBaseZ = new CANNON.Vec3(0,0,0);

		vecBaseZ = particles[16].position.vsub(particles[17].position);
		vecBaseX = particles[14].position.vsub(particles[2].position);
		vecBaseY = particles[2].position.vsub(particles[10].position);
		
		vecBaseX.normalize();
		vecBaseY.normalize();
		vecBaseZ.normalize();

		return [[vecBaseX.x,vecBaseY.x,vecBaseZ.x],
			   [vecBaseX.y,vecBaseY.y,vecBaseZ.y],
			   [vecBaseX.z,vecBaseY.z,vecBaseZ.z]];
	}
}