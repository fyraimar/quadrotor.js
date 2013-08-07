#Quadrotor.js

����three.js��cannon.js�����������ģ������

##����ģ���趨

###�������ṹ
��Ӧʵ�������������������̬����������X���β��֣���ͼ�Ǵ�Z�������򿴵ĸ���ͼ��

    (1)                        (0)
    Cw>  9                  1 <Ac
        11 \  8        0  / 3
    	     10 \ 	 / 2
			      16 		    		|
			      17			      -	o - ->Y��
			    / 	 \		    		|
		      4       12		    	|
	     5 /  6       14 \ 13	    	X��
    Ac>  7                 15  <Cw
    (2)						   (3)

1. ������Ϊ�����ţ���(X-, Y+)��ʼ��һ����������ʱ��
2. 4�������˳����   Cw��˳ʱ�� | Ac����ʱ��
3. ʣ�µ�����Ϊ��Ӧ�ṹ�ĵ����ţ���Ϊ�������㣺
   �ϲ㣺(0, 1, 4, 5, 8, 9, 12, 13, 16)��
   �²㣺(2, 3, 6, 7, 10, 11, 14, 15, 17)��
4. X��������Ϊ����ͼ�����£�Y��������Ϊ����ͼ������

---------------
###��������趨
������Ϊ�˶�Ӧ������������ĵ�λȷ����������ʾ����ʹ��cm����λ����Ϊ�˷���three.js�Ĺ۲�����

	Mass: kg  --- 0.035kg							1e0
	Distance: cm  --- par[1]<--8.65cm-->par[5]		1e-2
	Velocity: cm\s									1e-2
	Accelerate: m\(s^2)								1e0
	gravity: -10 m\(s^2)							1e0
	Angle/Rad: -3.14 -- 3.14						1e0
	Force: N --- 1N = 10* 0.1kg						1e0

��Ӧԭ������������趨�Ĳ�����

	�ɻ����⾶����outerlen = 4.32 (cm)
	�ɻ����ھ�����innerlen = 3.36 (cm)
	ģ�͸߶ȣ�    height = 0.5 (cm)
	
	�����ֲ����ܺ�Ϊ0.035 (kg)
	[0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.00004, 0.00004]
	
	�������ƽ��ֵ��130, 130, 130, 130

---------------
###ģ������ʾ�趨
��ͷ��ʼ���� Y+�������ҷ�Ϊ X+�������Ϸ�Ϊ Z+����

--------------
###��������
��ͷ�ƶ����֣�

	W,A,S,D �� ��,��,��,�� ������ˮƽ�ƶ�
	space ������������Ϊ�㷨ˢ���� test02p.html ������Ϊ dt = 1/200������������仺����

����������ã�
	
	1,2,3,4, ... ,9��������noise.js�����ö�Ӧ�����ķ�Ӧ
	�������\ȥ���������ŵ�
	�����޸�����ĵ������ֵ
	�����޸ĵ��װ���ĵ��������


##�㷨���ơ�������ӵ�ʹ��

###�㷨���� control.js
�ⲿ�������ڲ��Կ����㷨�ģ����Ʋ��ֳ���ṹģ��arduino���㷨��ʼ������ʹ�� setup()��ѭ������ʹ�� loop()��

	function controller(getAllParticles, parameter, setPin){
		this.setup = function(){
			// ������㷨��ʼ������
			...
		};
		this.loop = function(){
			// ʵ���㷨������������ֵ(setPin)
			...
		};
	}
	
a. ���뺯�� getAllParticles������ģ����18�������Ϣ������Ϊ CANNON.Particle[18]��
b. ����ṹ parameter������ʹ�ò���ȡ��Ӧ������
c. ���뺯�� setPin��ÿһ����loop()�����õĵ������ֵ��

-----------
####ʹ�ã�
	
����ͨ�� getAllParticles �ĵ��ʵʱ��Ϣ�����ݻ����趨���������λ�ã�ȡ������Ҫ���㷨����ֵ��
	
��������ʹ�� getThetaXYZ ��÷����� X,Y,Z ��ƫת�� thetaX,thetaY,thetaZ��ʹ�� getA ��÷����� Z�᷽���ϵļ��ٶ� a��

ͨ��loop()�ڵ�ѭ�����㣬�������еļ�������ȷ�� setPin() ����ֵ��

	
-----------
###������� noise.js
�������ֳ���ṹģ��arduino����ʼ��Ӳ���ʹ�� setup()��ѭ�������Ķ�����ʹ�� loop()�����հ����¼�onKeyDown()��

	function Noise(quadrotor, world , scene){
		var addMassNoise = quadrotor.AddOnePointMass;
		var removeMassNoise = quadrotor.RemoveOnePointMass;
		var setRotorDirection = quadrotor.setRotorDirection;
		var changePin = quadrotor.setModelPin;
		
		this.setup = function(){
			// ����ӳ�ʼ��������
			...
		};
		this.loop = function(){
			// ������������������á������жϺ������ʵ��
			...
		};
		var onKeyDown = function( event ){
			switch( event.keyCode ) {
				case 49:
					// ��Ӱ����жϲ���
					...
					break;
			}
		}
		document.addEventListener( 'keydown', onKeyDown, false );
	}
	
���뺯�� quadrotor�� ����Ϊquadrotor_ParticleModel�����ڻ������4���޸ĺ�����
    
    addMassNoise(position, mass, world, scene);
		//��ӵ�����ƫ�ƣ�ֻ�ܼ�һ���㡣
		position: CANNON.Vec3()
		mass: float  (kg)
		world: �����world
		scene: �����scene
        
	removeMassNoise(world , scene);
		//ȥ��������ƫ�ƣ����˲���ʹ�á�
		world: �����world
		scene: �����scene
        
	setRotorDirection(directionArray);
		//�޸ĵ����ƫ���
	    directionArray: CANNON.Vec3()[4]���ֱ��Ӧ���0,1,2,3�ĵ������
    
	changePin([a, b, c, d]);
		//�޸ĵ�����ֵ
		a, b, c, d: 0--255���ֱ��Ӧ���0,1,2,3���������
        

-----------
####ʹ�ã�
		
onKeyDown �޸İ����¼����Ӷ��޸���loop()���ܿ������ж�ֵ��ʹloop()�������ԶԴ�������Ӧ��
