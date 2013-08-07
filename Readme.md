#Quadrotor.js

基于three.js与cannon.js的四轴飞行器模拟器。

##基础模型设定

###飞行器结构
对应实际四轴飞行器的物理形态，飞行器以X字形布局，下图是从Z轴正方向看的俯视图：

    (1)                        (0)
    Cw>  9                  1 <Ac
        11 \  8        0  / 3
    	     10 \ 	 / 2
			      16 		    		|
			      17			      -	o - ->Y轴
			    / 	 \		    		|
		      4       12		    	|
	     5 /  6       14 \ 13	    	X轴
    Ac>  7                 15  <Cw
    (2)						   (3)

1. 括号内为电机序号，以(X-, Y+)开始第一个，依次逆时针
2. 4个电机的顺逆标记   Cw：顺时针 | Ac：逆时针
3. 剩下的数字为对应结构的点的序号，分为上下两层：
   上层：(0, 1, 4, 5, 8, 9, 12, 13, 16)、
   下层：(2, 3, 6, 7, 10, 11, 14, 15, 17)。
4. X轴正方向为俯视图正向下，Y轴正方向为俯视图正向右

---------------
###物理参数设定
以下是为了对应物理世界而做的单位确定，其中显示部分使用cm作单位，是为了符合three.js的观察设置

	Mass: kg  --- 0.035kg							1e0
	Distance: cm  --- par[1]<--8.65cm-->par[5]		1e-2
	Velocity: cm\s									1e-2
	Accelerate: m\(s^2)								1e0
	gravity: -10 m\(s^2)							1e0
	Angle/Rad: -3.14 -- 3.14						1e0
	Force: N --- 1N = 10* 0.1kg						1e0

对应原四轴飞行器而设定的参数：

	飞机轴外径长：outerlen = 4.32 (cm)
	飞机轴内径长：innerlen = 3.36 (cm)
	模型高度：    height = 0.5 (cm)
	
	质量分布：总和为0.035 (kg)
	[0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.0047, 0.00001, 0.00401, 0.00001,
	 0.00004, 0.00004]
	
	电机油门平衡值：130, 130, 130, 130

---------------
###模拟器显示设定
镜头开始正对 Y+方向，正右方为 X+方向，正上方为 Z+方向。

--------------
###输入设置
镜头移动部分：

	W,A,S,D 或 ↑,↓,←,→ ：控制水平移动
	space ：控制跳起（因为算法刷新在 test02p.html 被设置为 dt = 1/200，所以重力会变缓慢）

噪声添加设置：
	
	1,2,3,4, ... ,9：可以在noise.js中设置对应按键的反应
	可以添加\去除质量干扰点
	可以修改输出的电机油门值
	可以修改电机装歪后的电机正方向


##算法控制、噪声添加的使用

###算法控制 control.js
这部分是用于测试控制算法的，控制部分程序结构模拟arduino，算法初始化部分使用 setup()，循环部分使用 loop()。

	function controller(getAllParticles, parameter, setPin){
		this.setup = function(){
			// 可添加算法初始化设置
			...
		};
		this.loop = function(){
			// 实现算法调整、输出电机值(setPin)
			...
		};
	}
	
a. 传入函数 getAllParticles：返回模型中18个点的信息，类型为 CANNON.Particle[18]；
b. 传入结构 parameter：可以使用并获取对应参数。
c. 传入函数 setPin：每一次在loop()中设置的电机油门值。

-----------
####使用：
	
可以通过 getAllParticles 的点的实时信息，根据机体设定的相对坐标位置，取得所需要的算法输入值。
	
本程序中使用 getThetaXYZ 获得飞行器 X,Y,Z 的偏转角 thetaX,thetaY,thetaZ，使用 getA 获得飞行器 Z轴方向上的加速度 a。

通过loop()内的循环运算，根据现有的几个参数确定 setPin() 的数值。

	
-----------
###噪声添加 noise.js
噪声部分程序结构模拟arduino，初始添加部分使用 setup()，循环监听改动部分使用 loop()，接收按键事件onKeyDown()。

	function Noise(quadrotor, world , scene){
		var addMassNoise = quadrotor.AddOnePointMass;
		var removeMassNoise = quadrotor.RemoveOnePointMass;
		var setRotorDirection = quadrotor.setRotorDirection;
		var changePin = quadrotor.setModelPin;
		
		this.setup = function(){
			// 可添加初始噪声设置
			...
		};
		this.loop = function(){
			// 可添加运行中噪声设置、按键判断后的噪声实现
			...
		};
		var onKeyDown = function( event ){
			switch( event.keyCode ) {
				case 49:
					// 添加按键判断部分
					...
					break;
			}
		}
		document.addEventListener( 'keydown', onKeyDown, false );
	}
	
传入函数 quadrotor： 类型为quadrotor_ParticleModel，用于获得以下4个修改函数：
    
    addMassNoise(position, mass, world, scene);
		//添加点质量偏移，只能加一个点。
		position: CANNON.Vec3()
		mass: float  (kg)
		world: 传入的world
		scene: 传入的scene
        
	removeMassNoise(world , scene);
		//去除点质量偏移，加了才能使用。
		world: 传入的world
		scene: 传入的scene
        
	setRotorDirection(directionArray);
		//修改电机的偏差方向
	    directionArray: CANNON.Vec3()[4]，分别对应电机0,1,2,3的电机方向
    
	changePin([a, b, c, d]);
		//修改电机输出值
		a, b, c, d: 0--255，分别对应电机0,1,2,3的油门输出
        

-----------
####使用：
		
onKeyDown 修改按键事件，从而修改在loop()中能看到的判断值，使loop()函数可以对此作出反应。
