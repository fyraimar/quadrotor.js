

function getThetaZYX ( points ) {
    console.log("Seq:ZYX");
    /**
     *
     *[x1,x2,x3],
     *[y1,y2,y3],
     *[z1,z2,z3]
     *
     * */
    var base = [[1,0,0],
                [0,1,0],
                [0,0,1]];
    //var curBase = genBase (points);
    curBase =  [[0.93296281 , -0.185281410704 , 0.308428215228],
                [0.24997492 , 0.950296571472 , -0.185281410704],
                [-0.2588    , 0.24997492     , 0.93296281]];
    var thetaY = Math.asin( curBase[0][2] );
    var thetaZ = Math.asin( -curBase[0][1] / (Math.cos(thetaY)) );
    var thetaX = Math.asin( -curBase[1][2] / (Math.cos(thetaY)) );
    console.log ( "x3:" + curBase[0][2] + " x2:" + curBase[0][1] + " y2:" + curBase[1][2] );
    console.log ([thetaX/Math.PI*180, thetaY/Math.PI*180, thetaZ/Math.PI*180]);
}

function getThetaXYZ ( points ) {
    console.log("Seq:XYZ");
    /**
     *
     *[x1,x2,x3],
     *[y1,y2,y3],
     *[z1,z2,z3]
     *
     * */
    var base = [[1,0,0],[0,1,0],[0,0,1]];
    //var curBase = genBase (points);
    //curBase =  [[0.93296281 , -0.185281410704 , 0.308428215228],
    //            [0.24997492 , 0.950296571472 , -0.185281410704],
    //            [-0.2588    , 0.24997492     , 0.93296281]];
    var thetaY = Math.asin( - curBase[2][0]);
    var thetaZ = Math.asin( curBase[1][0] / (Math.cos(thetaY)) );
    var thetaX = Math.asin( curBase[2][1] / (Math.cos(thetaY)) );
    console.log ( "z1:" + curBase[2][0] + " y1:" + curBase[1][0] + " z2:" + curBase[2][1] );
    console.log ([thetaX/Math.PI*180, thetaY/Math.PI*180, thetaZ/Math.PI*180]);
}

function getThetaX() {
    console.log( getAllParticles() );
}
function getThetaY() {}
function getThetaZ() {}
function getA() {}
function setPin(a,b,c,d) {
}


function controller (getAllParticles, setPin) {

    this. S;        // S = a0 + a1 + a2 + a3 + ... + ai
	this. Si;
    this. thetaXi;   // 
    this. thetaYi;   //
    this. thetaZi;   //
    this. thetaXj;   // 
    this. thetaYj;   //
    this. thetaZj;   //
    this. ai;
    this. aj;
    this. E2;       //
    this. E1;       //
	this. K2;
    this. K1;
	this. T1;
    this. T2;
	this. T3;
    this. T4;

    this.setup = function () {
        this. S = this. ai = this. aj = getA();
        // this. thetaXi = this. thetaXj = getThetaX ();
        // this. thetaYi = this. thetaYj = getThetaY ();
        // this. thetaZi = this. thetaZj = getThetaZ ();
        this. K2 = 0.00000000013214;
        this. K1 = 0.00000000022407;
		console.log(getAllParticles());
    }

    this.loop = function () {
        var fi = 0.0000875 * this.ai - 0.026 * this.Si;

        var A = (fi + 0.35) / this.K1;
        var B = Math.sqrt(2) * (-0.11 * this.thetaXi + 0.10 * this.thetaXj) / (0.0432 * this.K2);
        var C = Math.sqrt(2) * (-0.11 * this.thetaYi + 0.10 * this.thetaYj) / (0.0432 * this.K1);
        var D = (-0.11 * this.thetaZi + 0.10 * this.thetaZj) / this.K2;

         setPin ([120,120,120,120
            // T1 * 1/8 * (A + B + C - D) * Math.sqrt(A + B + C - D), 
            // T2 * 1/8 * (A - B + C + D) * Math.sqrt(A - B + C + D), 
            // T3 * 1/8 * (A + B + C - D) * Math.sqrt(A + B + C - D), 
            // T4 * 1/8 * (A + B - C + D) * Math.sqrt(A + B - C + D)
               ]);
        
        this.aj = this.ai;
        this.thetaXj = this.thetaXi;
        this.thetaYj = this.thetaYi;
        this.thetaZj = this.thetaZi;
        this.Si += this.ai;

        // this.thetaXi = getThetaX();
        // this.thetaYi = getThetaY();
        // this.thetaZi = getThetaZ();
        //this.ai = getA();
    }
}

