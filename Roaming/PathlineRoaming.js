/*
 * @Descripttion: 路径漫游
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-23 09:55:31
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-27 17:57:22
 */
import * as Cesium from 'Cesium'
import { PathlineRoaming } from '..';
function PathinglineRoaming(option){
    this.viewer = option.viewer;
    this.positions = option.positions; //路径点集合 [[lon,lat,height,heading,pitch,roll], [] ...] 或者 [[lon,lat,height], [] ...] // 一定按照这两种格式
    this.speed = option.speed || 1.0; //速度系数  漫游速度  m/s
    if(typeof(option.z) != 'undefined')
    {
        this.z = option.z; //视角抬高
    }
    else
    {
        this.z = 0.0;
    }
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
    return new Promise(resolve=>{
        var _this = this;
        //逐点移动
        var flyForwad = function (positions){
            if(positions.length == 0)
            {
                resolve();
                return;
            }
            var height = Cesium.Cartographic.fromCartesian(_this.viewer.camera.position).height;
            var speed;
            speed = height / 5.0 * _this.speed;
            
            _this.viewer.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(positions[0][0],positions[0][1],positions[0][2]),
                orientation: {
                    heading : positions[0][3],
                    pitch : positions[0][4],    
                    roll : positions[0][5]
                },             
                duration: positions[0].dis / speed,
                easingFunction: Cesium.EasingFunction.LINEAR_NONE, //漫游路径插值与缓动函数
                complete: function(){
                    if(!_this.stopFly)
                    {
                        flyForwad(positions.slice(1)); //取出取出后元素的 1——length-1个元素
                    }
                }
            })
        }
        //设置相机初始视角
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(this.positions[0][0], this.positions[0][1], this.positions[0][2] + this.z),
            orientation: {
                heading : this.positions[0][3],
                pitch : this.positions[0][4],    
                roll : this.positions[0][5]                            
            },
            complete:()=>{
                flyForwad(this.positions.slice(1));//取出1——length-1个元素
            }
        });
        // flyForwad(this.positions.slice(1));//取出1——length-1个元素
    })
}

//给定无相机朝向的路径进行漫游 开始漫游
PathinglineRoaming.prototype.startRoamingWithoutOri = function(){
    return new Promise(resolve=>{
        var _this = this;
        //逐点移动
        var flyForwad = function (positions){
            if(positions.length == 0)
            {
                resolve();
                return;
            }

            //设置相机朝向
            var center = _this.viewer.camera.position;
            var target = Cesium.Cartesian3.fromDegrees(positions[0][0], positions[0][1], positions[0][2]);
            // var heading = getHeading(center, target);
            // var pitch = getPitch(center, target);
            var hpr = gethpr(center, target);
            var speed;
            speed = height / 5.0 * _this.speed;
            
            _this.viewer.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(positions[0][0],positions[0][1],positions[0][2] + _this.z),
                orientation: {
                    // heading : heading,
                    // pitch : pitch,    
                    // roll : 0.0
                    heading : hpr.heading,
                    pitch : hpr.roll, //因为相机 的pitch参数对应的x轴，所以给的是四元数计算得到的x轴旋转角度.    
                    roll : 0.0
                    //direction : Cesium.Cartesian3.normalize(result, new Cesium.Cartesian3),
                    //up : new Cesium.Cartesian3(0, 1, 0)
                    //up : new Cesium.Cartesian3(-0.47934589305293746, -0.8553216253114552, 0.1966022179118339)
                },              
                duration: positions[0].dis / speed,
                easingFunction: Cesium.EasingFunction.LINEAR_NONE, //漫游路径插值与缓动函数
                complete: function(){
                    if(!_this.stopFly)
                    {
                        flyForwad(positions.slice(1)); //取出取出后元素的 1——length-1个元素
                    }
                }
            })
        }

        //设置相机初始视角
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(this.positions[0][0], this.positions[0][1], this.positions[0][2] + this.z),
            complete: ()=>{
                flyForwad(this.positions.slice(1));//取出1——length-1个元素
            }
        });
        // flyForwad(this.positions.slice(1));//取出1——length-1个元素
    })
}

//停止漫游
PathinglineRoaming.prototype.stopRoaming = function(){
    this.viewer.camera.cancelFlight();
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

//由给定两点 计算姿态角hpr hpr这玩意是针对模型的局部坐标系进行的
function gethpr(pos1, pos2){
    //计算给定局部坐标系原点到参考坐标系的转换矩阵
    var mat41 = Cesium.Transforms.eastNorthUpToFixedFrame(pos1);
    var resQua = Cesium.Quaternion.clone(Cesium.Quaternion.IDENTITY);
    // var quaMatrix = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
    var roatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY); 
    var inveRoatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
    var curAxis = new Cesium.Cartesian3(0,0,0); 
    
    roatMat3 = Cesium.Matrix4.getMatrix3(mat41, roatMat3); //获得旋转矩阵
    var orientMat;
    var hpr;
    curAxis = Cesium.Cartesian3.subtract(pos2, pos1, curAxis); //pos1到pos2的向量
    inveRoatMat3 = Cesium.Matrix3.inverse(roatMat3, inveRoatMat3);//逆矩阵
    curAxis = Cesium.Matrix3.multiplyByVector(inveRoatMat3, curAxis, curAxis);//将世界坐标向量转换到局部坐标系下向量，起点为局部坐标系原点
    orientMat = vec1ToVec2Mat(Cesium.Cartesian3.UNIT_X, Cesium.Cartesian3.normalize(curAxis,curAxis));//求指定坐标轴与方向向量夹角 返回旋转矩阵 四元数
    // resQua = Cesium.Quaternion.fromRotationMatrix(orientMat, resQua);

    hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientMat, hpr);

    return hpr;
}

function vec1ToVec2Mat(vec1, vec2){
    //求旋转轴  
    var axis = Cesium.Cartesian3.cross(vec1,vec2, new Cesium.Cartesian3(0,0,0));  
    //求夹角  
    var angle = Cesium.Math.acosClamped(Cesium.Cartesian3.dot(vec1, vec2) / (Cesium.Cartesian3.magnitude(vec1) * Cesium.Cartesian3.magnitude(vec2)));
    //求四元数  
    var quaternion = Cesium.Quaternion.fromAxisAngle(axis, angle, new Cesium.Quaternion(0, 0, 0, 0));   
    //旋转矩阵  
    var rotMat3 = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3());
    
    //想要让Y轴沿着行进方向 ---一般用于相机漫游
    //再沿着Z方向翻转90度
    var vecZ = Cesium.Matrix3.multiplyByVector(rotMat3, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3);
    var quaternionReverse = Cesium.Quaternion.fromAxisAngle(vecZ, 3 * Cesium.Math.PI / 2.0, new Cesium.Quaternion(0, 0, 0, 0));
    var rotMat3Reverse = Cesium.Matrix3.fromQuaternion(quaternionReverse, new Cesium.Matrix3());

    var rot = Cesium.Matrix3.multiply(rotMat3Reverse, rotMat3, new Cesium.Matrix3());
    var qua = Cesium.Quaternion.fromRotationMatrix(rot, new Cesium.Quaternion(0, 0, 0, 0));
    
    return qua;  
}
export default PathinglineRoaming;