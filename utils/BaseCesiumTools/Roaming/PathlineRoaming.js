/*
 * @Descripttion: 路径漫游
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-23 09:55:31
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-24 00:02:43
 */

function PathinglineRoaming(option){
    this.viewer = option.viewer;
    this.positions = option.positions; //路径点集合 [[lon,lat,height,heading,pitch,roll], [] ...] 或者 [[lon,lat,height], [] ...] // 一定按照这两种格式
    this.speed = option.speed; //漫游速度  m/s
    
    this.stopFly = false;//停止漫游标志

    //var dislist = [];
    // 计算两两点间距离集合
    for(var i = 0; i < this.positions.length - 1; i++)
    {
        var prePosition = Cesium.Cartesian3.fromDegrees(this.positions[i][0], this.positions[i][1], this.positions[i][2]);
        var currentPosition = Cesium.Cartesian3.fromDegrees(this.positions[i+1][0], this.positions[i+1][1], this.positions[i+1][2]);
        //dislist.push(Cesium.Cartesian3.distance(prePosition,currentPosition));
        this.positions[i + 1].dis = Cesium.Cartesian3.distance(prePosition,currentPosition);
    }
}

//开始漫游
PathinglineRoaming.prototype.startRoaming = function(){
    //设置相机初始视角
    this.viewer.camera.setView({
        destination : Cesium.Cartesian3.fromDegrees(this.positions[0][0], this.positions[0][1], this.positions[0][2]),
        orientation: {
            heading : this.positions[0][3],
            pitch : this.positions[0][4],    
            roll : this.positions[0][5]                            
        }
    });

    var _this = this;
    //逐点移动
    var flyForwad = function (positions){
        if(positions.length == 0)
        {
            return;
        }
        _this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(positions[0][0],positions[0][1],positions[0][2]),
            orientation: {
                heading : positions[0][3],
                pitch : positions[0][4],    
                roll : positions[0][5]
            },             
            duration: positions[0].dis/_this.speed,
            easingFunction: Cesium.EasingFunction.LINEAR_NONE, //漫游路径插值与缓动函数
            complete: function(){
                if(!_this.stopFly)
                {
                    flyForwad(positions.slice(1)); //取出取出后元素的 1——length-1个元素
                }
            }
        })
    }

    flyForwad(this.positions.slice(1));//取出1——length-1个元素
}

//给定无相机朝向的路径进行漫游 开始漫游
PathinglineRoaming.prototype.startRoamingWithoutOri = function(){
    //设置相机初始视角
    this.viewer.camera.setView({
        destination : Cesium.Cartesian3.fromDegrees(this.positions[0][0], this.positions[0][1], this.positions[0][2]),
    });
    // //设置朝向
    //var center = Cesium.Cartesian3.fromDegrees(this.positions[0][0], this.positions[0][1], this.positions[0][2]);
    //var target = Cesium.Cartesian3.fromDegrees(this.positions[1][0], this.positions[1][1], this.positions[1][2]);
    //this.viewer.camera.lookAt(center, Cesium.Cartesian3.subtract(target, center, new Cesium.Cartesian3));

    var _this = this;
    //逐点移动
    var flyForwad = function (positions){
        if(positions.length == 0)
        {
            return;
        }

        //设置相机朝向
        var center = _this.viewer.camera.position;
        var target = Cesium.Cartesian3.fromDegrees(positions[0][0], positions[0][1], positions[0][2]);
        var heading = getHeading(center, target);
        var pitch = getPitch(center, target);
        _this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(positions[0][0],positions[0][1],positions[0][2]),
            orientation: {
                heading : heading,
                pitch : pitch,    
                roll : 0.0
                //direction : Cesium.Cartesian3.normalize(result, new Cesium.Cartesian3),
                //up : new Cesium.Cartesian3(0, 1, 0)
                //up : new Cesium.Cartesian3(-0.47934589305293746, -0.8553216253114552, 0.1966022179118339)
            },              
            duration: positions[0].dis/_this.speed,
            easingFunction: Cesium.EasingFunction.LINEAR_NONE, //漫游路径插值与缓动函数
            complete: function(){
                if(!_this.stopFly)
                {
                    flyForwad(positions.slice(1)); //取出取出后元素的 1——length-1个元素
                }
            }
        })
    }

    flyForwad(this.positions.slice(1));//取出1——length-1个元素
}

//停止漫游
PathinglineRoaming.prototype.stopRoaming = function(){
    this.stopFly = true;
}

function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
    //归一化
    const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
    //heading
    const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
}

function getPitch(pointA, pointB) {
    let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
    const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
    let direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
    Cesium.Cartesian3.normalize(direction, direction);
    //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
    return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
}

export default PathinglineRoaming;