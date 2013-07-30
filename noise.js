// noise Adding

function Noise(quadrotor){
	this.addMassNoise = quadrotor.AddOnePointMass;
	this.removeMassNoise = quadrotor.RemoveOnePointMass;
	this.setRotorDirection = quadrotor.setRotorDirection;
	this.changePin = quadrotor.setModelPin;
	
	var ifaddMassNoise = false;
	var ifremoveMassNoise = false;
	var isAdded = false
	
	var ifsetRotorDirection = false
	var ifchangePin = false;
	var inputNum = 0;
	
	
	// noise setup in initial status
	this.setup = function(){
		
	}
	
	// noise work when in working
	this.loop = function(){
		// add Mass and use only ONCE
		if (ifaddMassNoise == true && isAdded == false){
			
			ifaddMassNoise = false;
			isAdded = true;
		}
		// remove Mass only ONCE when added
		if (ifremoveMassNoise == true && isAdded == true){
			
			ifremoveMassNoise = false;
			isAdded = false;
		}
		
		if (ifsetRotorDirection == true){
			//this.setRotorDirection();
			
			ifsetRotorDirection = false;
		}
		
		if (ifchangePin == true){
			switch (inputNum){
				case 1:
					this.changePin([50,130,130,130]);
					break;
				case 2:
					this.changePin([180,130,130,130]);
					break;
				case 3:
					this.changePin([180,80,180,80]);
					break;
				case 4:
					this.changePin([80,180,80,180]);
					break;
			}
			ifchangePin = false;
		}
	}
	
	// key down to active/remove noise
	var onKeyDown = function( event ){
		switch( event.keyCode ) {
            case 49:// 1
				ifchangePin = true;
				inputNum = 1;
				break;
			case 50:// 2
				ifchangePin = true;
				inputNum = 2;
				break;
			case 51:// 3
				ifchangePin = true;
				inputNum = 3;
				break;
			case 52:// 4
				ifchangePin = true;
				inputNum = 4;
				break;
			case 53:// 5
				break;
			case 54:// 6
				break;
			case 55:// 7
				break;
			case 56:// 8
				break;
			case 57:// 9
				break;
        }
	}
	document.addEventListener( 'keydown', onKeyDown, false );
    //document.addEventListener( 'keyup', onKeyUp, false );
}
