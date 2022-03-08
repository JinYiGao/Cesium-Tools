/*
 * @Descripttion: 控制Entity实体沿路径移动的类
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-04-18 15:57:55
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-28 19:29:50
 */
import * as Cesium from 'Cesium'
import Popup from '../Popup/popUpInfo.js'

function modelMovement(options){
    this.viewer = options.viewer;
    this.modelurl = options.modelurl; //模型路径
    this.scale = options.scale || 1; //模型尺度
    this.path = options.path; //模型移动路径点位 [{x: ***, y: ***, z: ***}, {x: ***, y: ***, z: ***}, Cesium.Cartesian3.....]  Cesium.Cartesian3.fromDegreesArrayHeights
    this.speed = options.speed || 100; //模型移动速度
    this.loop = options.loop || false; //是否循环
    this.showPath = options.showPath || false; //是否显示路径
    this.modelInfo = options.modelInfo; //模型信息

    this.intervalID = undefined;
    this.interval = options.interval || 1; //插值点位间距 1m
    this.index = 0; //当前模型所处坐标索引
    this.newPath = []; //插值后路径点位
    this.modelEntity = undefined; //模型实体
    this.pathEntity = undefined; //路径实体

    this.leadLength = options.leadLength; //路径前面要显示的距离
    this.trailLength = options.trailLength; //路径后面要显示的距离
    this.pathColor = options.pathColor ?? Cesium.Color.WHITE.withAlpha(0.8); //路径颜色

    this.finish = false; //是否停止移动
    this.pause = false; //是否暂停

    this.entity = undefined;
}

//路径点位插值
modelMovement.prototype.linearPath = function(){
    if(this.interval < 0){
        return;
    }
    //计算总距离 以及每一段点位之间距离
    var alldistance = 0.0;
    var controls = [];
    for(var i = 0 ; i < this.path.length - 1 ; i++)
    {
        this.path[i].dis = Cesium.Cartesian3.distance(this.path[i], this.path[i + 1]);
        alldistance += this.path[i].dis;
        controls.push(this.path[i]);
    }
    controls.push(this.path[this.path.length - 1]);
    //设定评估标准
    var times = [0];
    var alltimes = 0.0;
    for(var i = 0 ; i < this.path.length - 1 ; i++)
    {
        alltimes +=  this.path[i].dis / alldistance;
        times.push(alltimes);
    }
    //插值总点数(包括原始点)
    var pointNum = parseInt(alldistance / this.interval);
    if(pointNum < 1){
        return;
    }
    var spline = new Cesium.LinearSpline({
        times: times,
        points: controls
    });
    //生成新路径点位
    for(var i = 0 ; i <= pointNum ; i++)
    {
        this.newPath.push(spline.evaluate(i / pointNum));
        
        if(i > 0)
        {
            var center = this.newPath[i - 1];
            var target = new Cesium.Cartesian3(this.newPath[i].x, this.newPath[i].y, this.newPath[i].z);
            // var heading = getHeading(center, target);
            // var pitch = getPitch(center, target);
            var hpr = gethpr(center, target);
            this.newPath[i - 1].orientation = {
                heading: hpr.heading,
                pitch: hpr.pitch,
                roll: hpr.roll
            };
            if(i == pointNum){
                this.newPath[i].orientation = this.newPath[i - 1].orientation
            }
        }
    }
    return this.newPath;
}

//加载模型 -----------entity方式
modelMovement.prototype.loadModel = function(){
    var _this = this;
    //插值生成新路径点
    this.linearPath();
    // console.log(this.newPath);
    function getPos(){
        return _this.newPath[_this.index];
    }
    function getOrientation(){
        return Cesium.Transforms.headingPitchRollQuaternion(_this.newPath[_this.index],{
            heading: _this.newPath[_this.index].orientation.heading,
            pitch:_this.newPath[_this.index].orientation.pitch,
            // roll: _this.newPath[_this.index].orientation.roll
            roll: 0.0
        });
    }
    //加载模型
    var model = this.viewer.entities.add({
        position: new Cesium.CallbackProperty(getPos, false),
        orientation: new Cesium.CallbackProperty(getOrientation, false),
        // position: _this.newPath[_this.index],
        // orientation: Cesium.Transforms.headingPitchRollQuaternion(_this.newPath[_this.index],{
        //     heading: _this.newPath[_this.index].orientation.heading,
        //     pitch: _this.newPath[_this.index].orientation.pitch,
        //     roll: 0.0
        // }),
        model: {
            uri: this.modelurl,
            scale: this.scale,
           // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND  贴地效果也不行；
        }
    });
    this.modelEntity = model;
    var getlinePositions = function(){
        var start = _this.index - parseInt(_this.trailLength / _this.interval);
        var end;
        if(Cesium.defined(_this.leadLength)){
            end = _this.index + parseInt(_this.leadLength / _this.interval);
        }
        else{
            end = _this.newPath.length;
        }
        console.log(start, end)
        return _this.newPath.slice(start < 0 ? 0 : start, end > _this.newPath.length ? _this.newPath.length : end);
    }
    //显示路径
    if(this.showPath){
        var pathEntity = this.viewer.entities.add({
            polyline: new Cesium.PolylineGraphics({
                positions: (Cesium.defined(this.leadLength) || Cesium.defined(this.trailLength)) ? new Cesium.CallbackProperty(getlinePositions) : this.newPath,
                width: 5,
                arcType: Cesium.ArcType.NONE,
                width: 1,
                material: this.pathColor,
                show: true
            }),
            show: true
        })
        this.pathEntity = pathEntity;
    }
    return model;
}

//模型位置更新 ----本质是更新idnex位置索引
modelMovement.prototype.updatePosition = function(model){
    var _this = this;
    //位置更新间隔
    var time = this.interval / parseFloat(this.speed) * 1000;
    var maxIndex = this.newPath.length
    this.intervalID = setInterval(()=>{
        if(!this.pause){
            if(_this.index + 1 >= maxIndex)
            {   //是否循环移动
                if(!_this.loop)
                {   
                    _this.finish = true; //表示停止移动
                    clearInterval(_this.intervalID);
                    return;
                }
            }
            
            // model.position = _this.newPath[_this.index];
            // model.orientation = Cesium.Transforms.headingPitchRollQuaternion(_this.newPath[_this.index],{
            //     heading: _this.newPath[_this.index].orientation.heading,
            //     pitch:_this.newPath[_this.index].orientation.pitch,
            //     // roll: _this.newPath[_this.index].orientation.roll
            //     roll: 0.0
            // });
            
            // this.showReferenceFrame();
            _this.index = (_this.index + 1) % maxIndex;
        }
    }, time);
}

//开始移动
modelMovement.prototype.startMove = function(){
    //开始更新点位
    this.updatePosition(this.modelEntity);
}

//暂停移动
modelMovement.prototype.pauseMove = function(){
    this.pause = true;
}

//继续移动
modelMovement.prototype.goonMove = function(){
    this.pause = false;
}

//清除所有已加载数据
modelMovement.prototype.clearAll = function(){
    this.viewer.entities.remove(this.modelEntity);
    this.viewer.entities.remove(this.pathEntity);
}

//重置模型位置,初始化
modelMovement.prototype.reset = function(){
    this.index = 0;
    // this.modelEntity.position = this.newPath[this.index];
    // this.modelEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(this.newPath[this.index],{
    //     heading: this.newPath[this.index].orientation.heading,
    //     pitch: this.newPath[this.index].orientation.pitch,
    //     roll: 0.0
    // });
    this.pauseMove();
}

//添加随模型移动的表格
modelMovement.prototype.addInfoTable = function(name){
    var _this = this;
    var popupInfo = function(){
        var date = new Date();
        var id = date.toLocaleDateString();
        var position = _this.modelEntity.position.getValue();
        var text = '<table><tbody>';
        for(var key in _this.modelInfo){
            text += '<tr><th>' + key + ' : ' + '</th><td>' + ((_this.modelInfo[key] == null) ? "无" : _this.modelInfo[key]) + '</td></tr>';
        }
        text += '</tbody></table>';
        var popup = new Popup({
          viewer: _this.viewer,
          position: position,
          description: text,
          title: name,
          id: id
        })
    
        return popup;
    }
    var popup = popupInfo();
    var updateTable = this.viewer.scene.preUpdate.addEventListener(function(scene, time) {
        //表格位置更新
        if(_this.viewer.entities.contains(_this.modelEntity)){
            var position = _this.modelEntity.position.getValue();
            popup.render(position);
        }
        else{
            popup.close();
            updateTable();
        }
    });
}

//给定一组坐标点，当模型在该系列坐标点附近distance米时，模型暂停移动
//postions = [[lon, lat, height],[lon, lat, height]...]
modelMovement.prototype.autoPauseMoving = function(positions, distance, sleeptime, callback){
    if(positions.length == 0){
        return;
    }
    var Cartesians = [];
    positions.forEach(position => {
        Cartesians.push(Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]));
    });
    var _this = this;
    var nopausedNum = 0; //未暂停过的点数量
    var intervalID = setInterval(()=>{
        //获取模型当前位置
        var modelPos = _this.newPath[_this.index];
        //判断是否到达某一点范围内
        for(var i = 0 ; i < Cartesians.length ; i++){
            var dis = Cesium.Cartesian3.distance(modelPos, Cartesians[i]);
            if(dis < distance && !Cartesians[i].paused){
                Cartesians[i].paused = true;
                _this.pauseMove();
                callback(modelPos);
                
                setTimeout(()=>{
                    _this.goonMove();
                }, sleeptime)
            }
            if(!Cartesians[i].paused){
                nopausedNum += 1;
            }
        }
        if(nopausedNum == 0){
            console.log('清除定时!');
            clearInterval(intervalID);
        }
    },100)
}

//朝向
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

//俯仰角
function getPitch(pointA, pointB) {
    let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
    const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
    let direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
    Cesium.Cartesian3.normalize(direction, direction);
    //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
    return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
}

//由给定两点 计算姿态角hpr hpr这玩意是针对模型的局部坐标系进行的 roll对应x轴固定不变 heading: 围绕up方向
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
    // var rotMat3 = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3());
    
    //想要让Y轴沿着行进方向
    //再沿着Z方向翻转90度
    // var vecZ = Cesium.Matrix3.multiplyByVector(rotMat3, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3);
    // var quaternionReverse = Cesium.Quaternion.fromAxisAngle(vecZ, 3 * Cesium.Math.PI / 2.0, new Cesium.Quaternion(0, 0, 0, 0));
    // var rotMat3Reverse = Cesium.Matrix3.fromQuaternion(quaternionReverse, new Cesium.Matrix3());

    // var rot = Cesium.Matrix3.multiply(rotMat3Reverse, rotMat3, new Cesium.Matrix3());
    // var qua = Cesium.Quaternion.fromRotationMatrix(rot, new Cesium.Quaternion(0, 0, 0, 0));
    
    return quaternion;  
}

//调试用 ----绘制坐标系参考
modelMovement.prototype.showReferenceFrame = function(){
    this.viewer.scene.primitives.remove(this.entity);

    var position = this.modelEntity.position.getValue();
    var mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    var orientation = this.modelEntity.orientation.getValue();
    var mtx3 = Cesium.Matrix3.fromQuaternion(orientation);
    var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, position);
    var modelMatrix = Cesium.Matrix4.multiplyByMatrix3(mat4, mtx3, new Cesium.Matrix4);

    this.entity = this.viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
        modelMatrix : mtx4,  // primitive to debug
        length : 20.0,
        width : 3
    }));
}
export default modelMovement;