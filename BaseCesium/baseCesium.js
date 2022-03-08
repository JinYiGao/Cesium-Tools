/*
 * @Descripttion: 一些在Cesium下常用的辅助开发的小函数
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-04-09 17:34:11
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-29 23:01:37
 */
import * as Cesium from 'Cesium'

export default{
    /**
     * 根据经纬度获取高程信息
     * @author Jin
     * @date 2021-06-29
     * @param {any} viewer
     * @param {any} positions
     * @param {any} level
     * @returns {any}
     */
    getHeightfromlonlat(viewer, positions, level){
        var terrainProvider = viewer.terrainProvider;
        // var terrainProvider = Cesium.createWorldTerrain();
        var promise = new Cesium.sampleTerrain(terrainProvider, level, positions);

        return new Promise(function(resolve){
            Cesium.when(promise, function (updatedPositions) {
                resolve(updatedPositions);
            })
        })
    },

    /**
     * 根据起始点生成飞线曲线 -- return [Cesium.Cartesian3, ...]
     * @author Jin
     * @date 2021-06-29
     * @param {Cesium.Cartesian3} startPoint
     * @param {Cesium.Cartesian3} endPoint
     * @returns {Array}
     */
    generateCurve(startPoint, endPoint) {
        let addPointCartesian = new Cesium.Cartesian3();
        Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);
        let midPointCartesian = new Cesium.Cartesian3();
        Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
        let midPointCartographic = Cesium.Cartographic.fromCartesian(
            midPointCartesian
        );
        midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 5;
        let midPoint = new Cesium.Cartesian3();
        Cesium.Ellipsoid.WGS84.cartographicToCartesian(
            midPointCartographic,
            midPoint
        );
        let spline = new Cesium.CatmullRomSpline({
            times: [0.0, 0.5, 1.0],
            points: [startPoint, midPoint, endPoint]
        });
        let curvePoints = [];
        for (let i = 0, len = 200; i < len; i++) {
            curvePoints.push(spline.evaluate(i / len));
        }
        return curvePoints;
    },
}