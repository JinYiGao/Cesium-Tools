/*
 * @Descripttion: 量测相关工具
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-05-10 21:40:35
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-05-10 22:00:42
 */

import * as Cesium from 'Cesium'

function measureTool(options){
    this.viewer = options.viewer;
}

//测量线段长度
measureTool.prototype.measureLength = function(){

}

//测量多边形面积
measureTool.prototype.measureArea = function(){
    
}

export default measureTool;