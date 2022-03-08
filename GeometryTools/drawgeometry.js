/*
 * @Descripttion: 鼠标绘制几何图元
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-22 17:58:24
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-07 14:17:58
 */
import * as Cesium from 'Cesium'
function Draw(option){
    this.viewer = option.viewer;
    this.positions = option.positions; //[lon,lat,height,lon,lat,height,...]
    this.id = option.id;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    this.clickPositions = []; //鼠标点击点集合
    this.positions = [];
    this.lonlatheight = [];
    this.lineEntities = []; //线段实体集合
}

// ------------------------------------------------多段线 相关-------------------------------------------------------------
//绘制线
Draw.prototype.drawPolyline = function(options){
    var material = options.material;
    var positions = options.positions; //[lon,lat,height,lon,lat,height,...]
    var id = options.id;
    
    material = typeof(material)=='undefined' ? new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE) : material;
    var entity = this.viewer.entities.add({
        id: id,  
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
            width: 20,
            arcType: Cesium.ArcType.NONE,
            material: material
        },
    });
    this.lineEntities.push(entity);
    return entity;
}

//删除绘制的线
Draw.prototype.removePolyline = function(){
    for(var i=0;i<this.lineEntities.length;i++)
    {
        this.viewer.entities.remove(this.lineEntities[i]);
    }
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
                    lon: parseFloat(clicklon),
                    lat: parseFloat(clicklat),
                    height: parseFloat(clickheight)
                });

                _this.positions.push(parseFloat(clicklon));
                _this.positions.push(parseFloat(clicklat));
                _this.positions.push(parseFloat(clickheight));
                
                //漫游专用
                _this.lonlatheight.push([parseFloat(clicklon), parseFloat(clicklat), parseFloat(clickheight)]);
            }
            else if(mode == 1)
            {
                _this.clickPositions.push({
                    lon: parseFloat(lon),
                    lat: parseFloat(lat),
                    height: parseFloat(height),
                    heading: parseFloat(heading),
                    pitch: parseFloat(pitch),
                    roll: parseFloat(roll)
                })

                _this.positions.push(parseFloat(lon));
                _this.positions.push(parseFloat(lat));
                _this.positions.push(parseFloat(height));
                _this.positions.push(parseFloat(heading));
                _this.positions.push(parseFloat(pitch));
                _this.positions.push(parseFloat(roll));
                
                // 漫游专用
                var p = [];
                p.push(parseFloat(lon));
                p.push(parseFloat(lat));
                p.push(parseFloat(height));
                p.push(parseFloat(heading));
                p.push(parseFloat(pitch));
                p.push(parseFloat(roll));
                _this.lonlatheight.push(p);
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
    this.lonlatheight.pop();
    this.positions.pop();
    this.positions.pop();
    this.positions.pop();
}

//导出绘制的点到json 用于漫游读取或其他用途
Draw.prototype.Export2Json = function(){
    console.log(this.clickPositions);
    console.log(this.lineEntities);
}

export default Draw;

