/*
 * @Descripttion: 多段线绘制控制
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-06-07 20:26:09
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-28 20:24:17
 */

function PolylineControl(options){
    this.viewer = options.viewer;

    this.labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection());
    this.polylineEntities = []; //绘制的几何多段线
    this.labelCollection = []; //标签
}

// 从给定坐标点添加多段线
PolylineControl.prototype.addPolyline = function(positions, color = Cesium.Color.RED, isShowDistance = false){
    var polyline = {
        show: true,
        positions: new Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        width: 10,
        clampToGround: false,
        material: new Cesium.PolylineArrowMaterialProperty(color)
    }
    var polylineEntity = this.viewer.entities.add({polyline});
    this.polylineEntities.push(polylineEntity);
    if(isShowDistance && positions.length == 6){
        this.addDistanceLabel(positions)
    }
    return polylineEntity;
}

// 移除所有绘制实体
PolylineControl.prototype.removeAll = function(){
    this.polylineEntities.forEach(entity => {
        this.viewer.entities.remove(entity);
    });
    this.labelCollection.forEach(label=>{
        this.labels.remove(label);
    })
}

// 给该多段线添加长度显示
PolylineControl.prototype.addDistanceLabel = function(positions, color = Cesium.Color.RED){
    var p1 = Cesium.Cartesian3.fromDegrees(positions[0], positions[1],positions[2]);
    var p2 = Cesium.Cartesian3.fromDegrees(positions[3], positions[4], positions[5]);
    var distance = (Cesium.Cartesian3.distance(p1, p2) / 1000.0 * 1.5).toFixed(2);
    var center = Cesium.Cartesian3.add(p1, p2, new Cesium.Cartesian3);
    center.x /= 2;
    center.y /= 2;
    center.z /= 2;
    var c = Cesium.Cartographic.fromCartesian(center);
    c.height += 50;
    var label = this.labels.add({
        position : new Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height),
        text : distance + 'km',
        font : '30px sans-serif',
        fillColor : color,
        outlineColor : Cesium.Color.BLACK,
        outlineWidth : 1.0,
        showBackground : false,
        backgroundColor : new Cesium.Color(0.165, 0.165, 0.165, 0.8),
        backgroundPadding : new Cesium.Cartesian2(7, 5),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 30000),
        style : Cesium.LabelStyle.FILL,
    });
    this.labelCollection.push(label)
}

export default PolylineControl;