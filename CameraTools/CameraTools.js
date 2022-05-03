/*
 * @Descripttion: 获取坐标相关信息类
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-22 15:56:34
 * @LastEditors: JinYiGao
 * @LastEditTime: 2022-04-16 22:51:19
 */
import * as Cesium from 'Cesium'

function CameraTools(options) {
    this.viewer = options.viewer;
    this.handlerlist = [];
    //this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
}
//获取相机相关信息
CameraTools.prototype.getCameraViewPoint = function () {
    var _this = this;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.handlerlist.push(handler);
    handler.setInputAction(function (lclickment) {
        // 获取相机点经纬度
        var camera = _this.viewer.scene.camera;
        var scene = _this.viewer.scene;
        var ellipsoid = scene.globe.ellipsoid;
        var position = camera.position;
        position = ellipsoid.cartesianToCartographic(position);
        var lon = (position.longitude * 180) / Math.PI;
        var lat = (position.latitude * 180) / Math.PI;
        var height = position.height;
        var center = {
            longitude: lon,
            latitude: lat,
            height: height
        };
        // 计算可视区域
        var rectangle = camera.computeViewRectangle(
            ellipsoid,
            new Cesium.Rectangle()
        );
        // 获取相机HPR
        var cameraHPR = {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
        };
        var viewPoint = [];
        viewPoint.push({
            Position: center,
            Rectangle: rectangle,
            Orientation: cameraHPR
        });
        var text = '';
        text = `"Orientation":{
                "heading":` + viewPoint[0].Orientation.heading + `,
                "pitch":` + viewPoint[0].Orientation.pitch + `,
                "roll":` + viewPoint[0].Orientation.roll + `
                },
                "Position":{
                "longitude": ` + viewPoint[0].Position.longitude + `,
                "latitude":` + viewPoint[0].Position.latitude + `,
                "height":` + viewPoint[0].Position.height + `
                },
                "Rectangle":{
                "west":` + viewPoint[0].Rectangle.west + `,
                "south":` + viewPoint[0].Rectangle.south + `,
                "east":` + viewPoint[0].Rectangle.east + `,
                "north": ` + viewPoint[0].Rectangle.north + `
                }`;
        console.log(text);
        return viewPoint[0];
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

//获取相机位置以及角度信息
CameraTools.prototype.GetCameraPosition = function () {
    var _this = this;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.handlerlist.push(handler);
    handler.setInputAction(function (lclickment) {
        var scene = _this.viewer.scene;
        var ellipsoid = scene.globe.ellipsoid;
        //var cartesian = LoadCesium.Viewer.camera.pickEllipsoid(lclickment.position, ellipsoid);
        var cartesian = _this.viewer.scene.pickPosition(lclickment.position);
        console.log("笛卡尔坐标:" + cartesian);
        var camera = _this.viewer.camera;
        if (cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var clicklon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
            var clicklat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
            var lon = Cesium.Math.toDegrees(_this.viewer.camera.positionCartographic.longitude).toFixed(7);
            var lat = Cesium.Math.toDegrees(_this.viewer.camera.positionCartographic.latitude).toFixed(7);
            //地理高度
            var clickheight = (cartographic.height + 1).toFixed(2);
            //相机高度
            var height = _this.viewer.camera.positionCartographic.height.toFixed(7);
            //方向   围绕Z轴旋转
            //var heading = Cesium.Math.toDegrees(camera.heading).toFixed(7);
            var heading = (camera.heading).toFixed(7);
            //倾斜角度   围绕Y轴旋转
            //var pitch = Cesium.Math.toDegrees(camera.pitch).toFixed(7);
            var pitch = (camera.pitch).toFixed(7);
            //围绕X轴旋转
            //var roll = Cesium.Math.toDegrees(camera.roll).toFixed(7);
            var roll = (camera.roll).toFixed(7);
            console.log("相机经纬度:" + lon + "," + lat + "," + height + ',' + heading + ',' + pitch + ',' + roll);
            console.log("鼠标点击经纬度:" + clicklon + "," + clicklat + "," + clickheight);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

//停止鼠标事件监听
CameraTools.prototype.stop = function () {
    for (var i = 0; i < this.handlerlist.length; i++) {
        this.handlerlist[i].removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handlerlist[i].removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handlerlist[i].removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handlerlist[i].removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    this.handlerlist = [];
}

export default CameraTools;