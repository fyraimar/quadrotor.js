
function get () {
    return 5;
}

function controller (getThetaX, getThetaY, getThetaZ, getA, setPin) {

    this. S;        // S = a0 + a1 + a2 + a3 + ... + ai
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

    this.setup = function () {
        this. S = this. ai = this. aj = getA();
        this. thetaXi = this. thetaXj = getThetaX ();
        this. thetaYi = this. thetaYj = getThetaY ();
        this. thetaZi = this. thetaZj = getThetaZ ();
        this. K2 = 0.00000000013214;
        this. K1 = 0.00000000022407;
    }

    this.loop = function () {
        var fi = 0.0000875 * ai - 0.026 * Si;

        var A = (fi + 0.35) / K1;
        var B = Math.sqrt(2) * (-0.11 * thetaXi + 0.10 * thetaXj) / (0.0432 * K2);
        var C = Math.sqrt(2) * (-0.11 * thetaYi + 0.10 * thetaYj) / (0.0432 * K1);
        var D = (-0.11 * thetaZi + 0.10 * thetaZj) / K2;

        setPin (
            T1 * 1/8 * (A + B + C - D) * Math.sqrt(A + B + C - D), 
            T2 * 1/8 * (A - B + C + D) * Math.sqrt(A - B + C + D), 
            T3 * 1/8 * (A + B + C - D) * Math.sqrt(A + B + C - D), 
            T4 * 1/8 * (A + B - C + D) * Math.sqrt(A + B - C + D)
               );
        
        aj = ai;
        thetaXj = thetaXi;
        thetaYj = thetaYi;
        thetaZj = thetaZi;
        Si += ai;

        thetaXi = getThetaX();
        thetaYi = getThetaY();
        thetaZi = getThetaZ();
        ai = getA();
        
    
    }
}
function set (a,b,c,d) {return a+b+c+d;}
var t = new controller (get,get,get,get, set);
t.setup();
console.log(t);

