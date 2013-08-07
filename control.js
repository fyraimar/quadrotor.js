function sleep(milliSeconds){
    var startTime = new Date().getTime(); // get the current time
    while (new Date().getTime() < startTime + milliSeconds); // hog cpu
}

/**
 * Rz . Ry . Rx . Vec3a = Vec3b
 *[x1,x2,x3],
 *[y1,y2,y3],
 *[z1,z2,z3]
 */
//****************************************************************************//
//坐标系转化基准：确定z+轴自旋角( ThetaZ),矩阵Rz->                            //
//                确定x+轴与水平面线面角->(ThetaY),矩阵Ry->                   //
//                确定y+轴与水平面线面角(ThetaX),矩阵Rx;                      //
//  v(飞行器坐标系)=RxRyRz*v(地面坐标系) ; 关系矩阵M=RxRyRz ;                 //
//****************************************************************************//
function getThetaXYZ ( points ) {
//用于获取三个幅角参数，通过关系矩阵直接计算幅角值 
    var base = [[1,0,0],[0,1,0],[0,0,1]];
    var curBase = genBase (points);
    var thetaY = Math.asin( - curBase[2][0]);
    var thetaZ = Math.asin( curBase[1][0] / (Math.cos(thetaY)) );
	
    var thetaX = Math.asin( curBase[2][1] / (Math.cos(thetaY)) );
	//thetaY = Math.asin( curBase[2][0] );
	//thetaX = Math.asin( curBase[2][1] );
    return [thetaX,thetaY,thetaZ];
    //console.log ( "z1:" + curBase[2][0] + " y1:" + curBase[1][0] + " z2:" + curBase[2][1] );
    //console.log ([thetaX/Math.PI*180, thetaY/Math.PI*180, thetaZ/Math.PI*180]);
}

function genBase (points) {
         
    //console.log(points);
    var vecBaseX = new CANNON.Vec3(0,0,0);
    var vecBaseY = new CANNON.Vec3(0,0,0);
    var vecBaseZ = new CANNON.Vec3(0,0,0);

    //console.log(points[17]);
    vecBaseZ = points[16].position.vsub(points[17].position);
	
    // vecBaseX = points[10].position.vadd(points[2].position).vsub(points[17].position).vsub(points[17].position);
    // vecBaseY = points[14].position.vadd(points[2].position).vsub(points[17].position).vsub(points[17].position);
	vecBaseX = points[14].position.vsub(points[2].position);
	vecBaseY = points[2].position.vsub(points[10].position);
	
    vecBaseX.normalize();
    vecBaseY.normalize();
    vecBaseZ.normalize();
    //console.log("16:" + points[16].position);
    //console.log("17:" + points[17].position);
    //console.log("02:" + points[2].position);
    //console.log("10:" + points[10].position);
    //console.log("14:" + points[14].position);
    //vecBaseZ.normalize();
    //console.log(vecBaseX +  "\n" + vecBaseY + "\n" + vecBaseZ);
    return [[vecBaseX.x,vecBaseY.x,vecBaseZ.x],
           [vecBaseX.y,vecBaseY.y,vecBaseZ.y],
           [vecBaseX.z,vecBaseY.z,vecBaseZ.z]];
}

//****************************************************************************//
//                         Main controller function                           //
//****************************************************************************//


function controller (getAllParticles, parameter, setPin) { //输出控制函数        
//****************************************************************************//   
//                       算法实现可直接调整的参数                             // 
//****************************************************************************//    
    //系统周期 
    T_set=1/200;
    
    //纵向悬浮PI参数 
    this.kp_a;
    this.ki_a;
    
    //力矩平衡PD参数 
    this.Kp_x; 
    this.Kd_x;
    this.Kp_y;
    this.Kd_y;
    this.Kp_z;
    this.Kd_z;
    
    //定义平衡设置
    this.a_revise=0;
    this.x_revise=0;
    this.y_revise=0;
     
    //定义期望速度
    this.v_expectation=0; 
    this.x_expectation=0;
    this.y_expectation=0;   
//****************************************************************************//
//                       陀螺仪DMP算法提供出的参数                            //
//****************************************************************************// 
    //陀螺仪相邻周期返回的参数两组; 
        //第i周期 (周期获取值) 
    this. thetaXi;   //定义：第i周期y+与水平面线面角， y+在z轴投影为正则角为正; 
    this. thetaYi;   //定义：第i周期x+与水平面线面角， x+在z轴投影为正则角为正; 
    this. thetaZi;   //定义：z自旋角; 
    this. ai;//定义：飞行器的纵向加速度，定义z+方向为正;
    this. Si;//定义：Si = a0 + a1 + a2 + a3 + ... + ai
             //引申性质：vi=T*Si 作为对于初态速度的速度增量 
        //第i-1周期(存储值)
    this. thetaXj;    
    this. thetaYj;   
    this. thetaZj;   
    this. aj;
    this. Sj;        

//****************************************************************************//
//                          飞行器物理参数                                    //
//****************************************************************************//
    //螺旋桨参数 
    this. K2;//螺旋桨参数K2-定义：螺旋桨产生偏移力矩与转速平方之比值; 
    this. K1;//螺旋桨参数K1-定义：螺旋桨产生升力与转速平方之比值;
    
    //输出系数->定义：油门输出与转速三次方之比值; 
    this. T1 = 0.0000000000073416692;
    this. T2 = 0.0000000000073416692;
    this. T3 = 0.0000000000073416692;
    this. T4 = 0.0000000000073416692;
    this. tempCounter;
    
//****************************************************************************//
//                         控制台输出展示参数                                 //
//****************************************************************************// 
    this.fi;//纵向调整所需的合外力 
    this.A;//纵向合外力输出 
    this.B;//X轴合力矩 
    this.C;//Y轴合力矩 
    this.D;//Z轴合力矩 

    //对应各个电机实际输出 
    this.pin1;
    this.pin2;
    this.pin3;
    this.pin4;

//****************************************************************************//
//                          private function                                  //
//****************************************************************************//
    function getA ( particles ) {
        var forceSumX = 0; 
        var forceSumY = 0; 
        var forceSumZ = 0; 
        var mSum = 0;
        for ( var i=0 ; i < particles.length ; i ++  ) {
            forceSumX += particles[i].force.x;
            forceSumY += particles[i].force.y;
            forceSumZ += particles[i].force.z;
            mSum += particles[i].mass;
        }
        return forceSumZ / mSum - 10;
    }
    
    this.setup = function () {
        this.tempCounter = 0;
        this.Sj= 0;
        this.Si = this.ai = this.aj = getA(getAllParticles());
        var degreeXYZ = getThetaXYZ(getAllParticles());
		
		// thetaZ set to 0 at first
		degreeXYZ[2] = 0;
		
        this.thetaXi = this.thetaXj = degreeXYZ[0];
        this.thetaYi = this.thetaYj = degreeXYZ[1];
        this.thetaZi = this.thetaZj = degreeXYZ[2];
        this.K2 = 0.0000000000013214;
        this.K1 = 0.00000000022407;
        console.log(getAllParticles());
    }
	
	// var minE = -12;
	// var maxE = 0;
	// function getE(num){
		// var str = num.toString().split('e');
		// if (str[1] >0)
			// return str[1];
		// else
			// return str[1] - 5;
	// }
	
    this.loop = function () {
		this.tempCounter ++;
        console.log(this.tempCounter+":");
		
        this.fi = 0.0000875 * this.ai - 0.026 * this.Si;

        this.A = (this.fi + 0.35) / this.K1;
        this.B = Math.sqrt(2) * (-0.025 * this.thetaXi + 0.02 * this.thetaXj) / (0.0432 * this.K2);
        this.C = Math.sqrt(2) * (-0.025 * this.thetaYi + 0.02 * this.thetaYj) / (0.0432 * this.K1);
        this.D = (-0.25 * this.thetaZi + 0.2 * this.thetaZj) / this.K2;
		
		// if (minE > getE(this.fi))
			// minE = getE(this.fi);
		// if (minE > getE((-0.025 * this.thetaXi + 0.02 * this.thetaXj)))
			// minE = getE((-0.025 * this.thetaXi + 0.02 * this.thetaXj));
		// if (minE > getE((-0.025 * this.thetaYi + 0.02 * this.thetaYj)))
			// minE = getE((-0.025 * this.thetaYi + 0.02 * this.thetaYj));
		// if (minE > getE((-0.25 * this.thetaZi + 0.2 * this.thetaZj)))
			// minE = getE((-0.25 * this.thetaZi + 0.2 * this.thetaZj));
		// if (minE > getE(this.fi))
			// minE = getE(this.fi);
		
		// console.log("min = " + minE);
		
        this.pin1 = this.T1 * 1/8 * (this.A + this.B + this.C - this.D) * Math.sqrt(this.A + this.B + this.C - this.D);
        this.pin2 = this.T2 * 1/8 * (this.A - this.B + this.C + this.D) * Math.sqrt(this.A - this.B + this.C + this.D); 
        this.pin3 = this.T3 * 1/8 * (this.A + this.B + this.C - this.D) * Math.sqrt(this.A + this.B + this.C - this.D); 
        this.pin4 = this.T4 * 1/8 * (this.A + this.B - this.C + this.D) * Math.sqrt(this.A + this.B - this.C + this.D);
        if ( this.tempCounter > 5 ) {
            setPin ([
                    (this.pin1 > 255)? 255: (this.pin1 &0xff),
                    (this.pin2 > 255)? 255: (this.pin2 &0xff),
                    (this.pin3 > 255)? 255: (this.pin3 &0xff),
                    (this.pin4 > 255)? 255: (this.pin4 &0xff)
                    ]);
        } else {
            setPin ([ 
                    130,
                    130,
                    130,
                    130
                    ]);
        }
		//console.log(this.pin1 / this.T1 + ", "+this.ai);
        //console.log(this);
		/*console.log( "" 
                + "si-1:" + 
                this. Sj 
                + "\n"  
                + "si:" + 
                this. Si
                + "\n"  
                + "thataXi:" + 
                this. thetaXi   // 
                + "\n"  
                + "thetaYi:" + 
                this. thetaYi   //
                + "\n"  
                + "thetaZi:" + 
                this. thetaZi   //
                + "\n"  
                + "thetaXi-1:" + 
                this. thetaXj   // 
                + "\n"  
                + "thetaYi-1:" + 
                this. thetaYj   //
                + "\n"  
                + "thetaZi-1:" + 
                this. thetaZj   //
                + "\n"  
                + "ai:" + 
                this. ai
                + "\n"  
                + "ai-1:" + 
                this. aj
                + "\n"  
                + "k2:" + 
                this. K2
                + "\n"  
                + "k1:" + 
                this. K1
                + "\n"  
                + "t1:" + 
                this. T1 
                + "\n"  
                + "t2:" + 
                this. T2 
                + "\n"  
                + "t3:" + 
                this. T3 
                + "\n"  
                + "t4:" + 
                this. T4 
                + "\n"  
                + "counter:" + 
                this. tempCounter
                + "\n"  
                + "A:" + 
                this.A
                + "\n"  
                + "B:" + 
                this.B
                + "\n"  
                + "C:" + 
                this.C
                + "\n"  
                + "D:" + 
                this.D
                + "\n"  
                + "fi:" + 
                this.fi
                + "\n"  
                + "pin1:" + 
                this.pin1
                + "\n"  
                + "pin2:" + 
                this.pin2
                + "\n"  
                + "pin3:" + 
                this.pin3
                + "\n"  
                + "pin4:" + 
                this.pin4 + 
				" \n" + 
				" particles data: " +
				getAllParticles()[16].velocity
                ); */
			
		//sleep(1000);
				
        this.aj = this.ai;
        this.thetaXj = this.thetaXi;
        this.thetaYj = this.thetaYi;
        this.thetaZj = this.thetaZi;
        this.Sj = this.Si;
        this.Si += this.ai;

        var degreeXYZ = getThetaXYZ(getAllParticles());
		//console.log("degree = "+degreeXYZ[0]+","+degreeXYZ[1]+","+degreeXYZ[2]);
        this.thetaXi = degreeXYZ[0];
        this.thetaYi = degreeXYZ[1];
        this.thetaZi = degreeXYZ[2];
        this.ai = getA(getAllParticles());
    }
}
