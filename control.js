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
//����ϵת����׼��ȷ��z+��������( ThetaZ),����Rz->                            //
//                ȷ��x+����ˮƽ�������->(ThetaY),����Ry->                   //
//                ȷ��y+����ˮƽ�������(ThetaX),����Rx;                      //
//  v(����������ϵ)=RxRyRz*v(��������ϵ) ; ��ϵ����M=RxRyRz ;                 //
//****************************************************************************//
function getThetaXYZ ( points ) {
//���ڻ�ȡ�������ǲ�����ͨ����ϵ����ֱ�Ӽ������ֵ 
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


function controller (getAllParticles, parameter, setPin) { //������ƺ���        
//****************************************************************************//   
//                       �㷨ʵ�ֿ�ֱ�ӵ����Ĳ���                             // 
//****************************************************************************//    
    //ϵͳ���� 
    T_set=1/200;
    
    //��������PI���� 
    this.kp_a;
    this.ki_a;
    
    //����ƽ��PD���� 
    this.Kp_x; 
    this.Kd_x;
    this.Kp_y;
    this.Kd_y;
    this.Kp_z;
    this.Kd_z;
    
    //����ƽ������
    this.a_revise=0;
    this.x_revise=0;
    this.y_revise=0;
     
    //���������ٶ�
    this.v_expectation=0; 
    this.x_expectation=0;
    this.y_expectation=0;   
//****************************************************************************//
//                       ������DMP�㷨�ṩ���Ĳ���                            //
//****************************************************************************// 
    //�������������ڷ��صĲ�������; 
        //��i���� (���ڻ�ȡֵ) 
    this. thetaXi;   //���壺��i����y+��ˮƽ������ǣ� y+��z��ͶӰΪ�����Ϊ��; 
    this. thetaYi;   //���壺��i����x+��ˮƽ������ǣ� x+��z��ͶӰΪ�����Ϊ��; 
    this. thetaZi;   //���壺z������; 
    this. ai;//���壺��������������ٶȣ�����z+����Ϊ��;
    this. Si;//���壺Si = a0 + a1 + a2 + a3 + ... + ai
             //�������ʣ�vi=T*Si ��Ϊ���ڳ�̬�ٶȵ��ٶ����� 
        //��i-1����(�洢ֵ)
    this. thetaXj;    
    this. thetaYj;   
    this. thetaZj;   
    this. aj;
    this. Sj;        

//****************************************************************************//
//                          �������������                                    //
//****************************************************************************//
    //���������� 
    this. K2;//����������K2-���壺����������ƫ��������ת��ƽ��֮��ֵ; 
    this. K1;//����������K1-���壺����������������ת��ƽ��֮��ֵ;
    
    //���ϵ��->���壺���������ת�����η�֮��ֵ; 
    this. T1 = 0.0000000000073416692;
    this. T2 = 0.0000000000073416692;
    this. T3 = 0.0000000000073416692;
    this. T4 = 0.0000000000073416692;
    this. tempCounter;
    
//****************************************************************************//
//                         ����̨���չʾ����                                 //
//****************************************************************************// 
    this.fi;//�����������ĺ����� 
    this.A;//������������ 
    this.B;//X������� 
    this.C;//Y������� 
    this.D;//Z������� 

    //��Ӧ�������ʵ����� 
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
