/*
 * @Descripttion: 鼠标绘制几何图元
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-22 17:58:24
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-23 23:59:12
 */
function Draw(option){
    this.viewer = option.viewer;
    this.positions = option.positions; //[lon,lat,height,lon,lat,height,...]
    this.id = option.id;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    this.clickPositions = []; //鼠标点击点集合
    this.lineEntities = []; //线段实体集合
}

// ------------------------------------------------多段线 相关-------------------------------------------------------------
//绘制线
Draw.prototype.drawPolyline = function(){
    var material = typeof(option.material)=='undefined' ? new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE) : option.material;
    var entity = viewer.entities.add({
        id: this.id,  
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.positions),
            width: 20,
            arcType: Cesium.ArcType.NONE,
            material: material
        },
    });
    return entity;
}

//启用鼠标选点绘制多段线   绘制模式---- 0: 鼠标点击位置   1: 相机位置
Draw.prototype.startDrawPolyline = function(mode){
    var _this = this;
    //var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.handler.setInputAction(function(lclickment) {
        var scene = _this.viewer.scene;
        var ellipsoid = scene.globe.ellipsoid;
        var cartesian = _this.viewer.scene.pickPosition(lclickment.position);
        var camera = _this.viewer.camera;
        if (cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var clicklon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
            var clicklat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
            //地理高度
            var clickheight = (cartographic.height+1).toFixed(2);
            //console.log("鼠标点击经纬度:" + clicklon + "," + clicklat + "," + clickheight);
            var lon = Cesium.Math.toDegrees(_this.viewer.camera.positionCartographic.longitude).toFixed(7);
            var lat = Cesium.Math.toDegrees(_this.viewer.camera.positionCartographic.latitude).toFixed(7);
            //地理高度
            var clickheight = (cartographic.height+1).toFixed(2);
            //相机高度
            var height = _this.viewer.camera.positionCartographic.height.toFixed(7);
            //方向   围绕Z轴旋转
            var heading = (camera.heading).toFixed(7);
            //倾斜角度   围绕Y轴旋转
            var pitch = (camera.pitch).toFixed(7);
            //围绕X轴旋转
            var roll = (camera.roll).toFixed(7);

            if(mode == 0)
            {
                _this.clickPositions.push({
                    lon: clicklon,
                    lat: clicklat,
                    height: clickheight
                })
            }
            else if(mode == 1)
            {
                _this.clickPositions.push({
                    lon: lon,
                    lat: lat,
                    height: height,
                    heading: heading,
                    pitch: pitch,
                    roll: roll
                })
            }

            //大于两个点则绘制线
            if(_this.clickPositions.length > 1)
            {
                var length = _this.clickPositions.length;
                var positions = [_this.clickPositions[length-2].lon, _this.clickPositions[length-2].lat, _this.clickPositions[length-2].height,
                                _this.clickPositions[length-1].lon, _this.clickPositions[length-1].lat, _this.clickPositions[length-1].height];
                var entity = _this.viewer.entities.add({
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                        width: 10,
                        arcType: Cesium.ArcType.NONE,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: Cesium.Color.ORANGE,
                            outlineWidth: 2,
                            outlineColor: Cesium.Color.BLACK,
                        }),
                    }
                })

                _this.lineEntities.push(entity);
            }
        }
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    console.log('启动路径绘制!')
}

//停止鼠标点击绘制多段线
Draw.prototype.stopDrawPolyline = function(){
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    console.log('停止路径绘制!');
}

//撤销绘制上一段
Draw.prototype.revocation = function(){
    var popEntity = this.lineEntities.pop();//弹出数组最后一个元素并返回
    this.viewer.entities.remove(popEntity);
    this.clickPositions.pop();//删除最后一个绘制的点
}

//导出绘制的点到json 用于漫游读取或其他用途
Draw.prototype.Export2Json = function(){
    console.log(this.clickPositions);
    console.log(this.lineEntities);
}

export default Draw;

