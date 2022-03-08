/*
 * @Descripttion: 给定坐标绘制动态线
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-22 17:57:30
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-30 13:51:05
 */
import PolylineTrailMaterialProperty from './PolylineTrailMaterialProperty.js'
import Base from '../Base/base.js'

function drawDynamicPolyline(options){
    let viewer = options.viewer;
    let position = options.position; // [Cesium.Cartasian3, ...]
    let color = options.color ?? Cesium.Color.RED;
    let width = options.width ?? 2;
    let imgUrl = options.imgUrl;
    let duration = options.duration ?? 3000;
    let showPoint = options.showPoint ?? false;
    let pointSize = options.pointSize ?? [10, 10];
    let pointColor = options.pointColor ?? [Cesium.Color.BLUE, Cesium.Color.BLUE];
    let label = options.label ?? Base.getDate().id;

    let clampToGround = options.clampToGround ?? false; //是否贴地
    let show = options.show ?? true; //是否可见

    let material = new PolylineTrailMaterialProperty({
        color: color, //指定线原本颜色
        duration: duration,
        trailImage: imgUrl //图片混合
    });

    const startPoint = position[0];
    const endPoint = position[position.length - 1];
    var p1 ,p2;
    // 添加起点与终点
    if(showPoint){
        p1 = viewer.entities.add({
            position: startPoint,
            point: {
                pixelSize: pointSize[0],
                color: pointColor[0]
            }
        });

        p2 = viewer.entities.add({
            position: endPoint,
            point: {
                pixelSize: pointSize[1],
                color: pointColor[1]
            }
        });
    }

    // 添加动态线
    var dynamicPolyline = viewer.entities.add({
        polyline: {
            positions: position,
            width: width,
            material: material,
            clampToGround: clampToGround,
            show: show
        }
    });

    return {
        label: label,
        startPoint: p1,
        endPoint: p2,
        polyline: dynamicPolyline
    }
}

export default drawDynamicPolyline;