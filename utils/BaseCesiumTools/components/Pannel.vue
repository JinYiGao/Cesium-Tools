<!-- 
 * @Descripttion:  Vue组件类型 辅助工具操作面板
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-23 11:47:15
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-04-05 21:13:51
-->
<template>
    <div class="mainbody">
        <div class="box">
            <div class="title">坐标相关工具</div>
            <button class="cesium-button" @click="getPos"> 开启鼠标点击坐标获取 </button>
            <button class="cesium-button" @click="closeGetPos"> 关闭鼠标点击坐标获取 </button>
        </div>
        <div class="box">
            <div class="title">漫游辅助工具</div>
            <div>
                <button class="cesium-button" @click="startDrawline(0)"> 开启绘制路径(鼠标) </button>
                <button class="cesium-button" @click="startDrawline(1)"> 开启绘制路径(相机) </button>
                <button class="cesium-button" @click="revocation"> 撤销上一段 </button>
                <button class="cesium-button" @click="stopDrawline"> 停止绘制路径 </button>
                <button class="cesium-button" @click="removeAll"> 完全清除本次绘制 </button>
                <button class="cesium-button" @click="exportline"> 导出路径到文件 </button>
            </div>
        </div>
    </div>
</template>

<script>
import {  CameraTools, PathlineRoaming, Draw } from '../index'
export default {
    data(){
        return{
            cameraTools: Object.freeze(undefined),
            drawer: Object.freeze(undefined)
        }
    },
    methods:{
        //返回全局viewer对象
        getViewer(){
            return this.DTGlobe[0];
        },

        //开启鼠标点击坐标获取
        getPos(){
            if(typeof(this.cameraTools) == 'undefined')
            {
                this.cameraTools = new CameraTools(this.getViewer());
            }
            this.cameraTools.getCameraViewPoint();
            this.cameraTools.GetCameraPosition();
        },
        
        //关闭鼠标点击坐标获取
        closeGetPos(){
            if(typeof(this.cameraTools) == 'undefined')
            {
                this.cameraTools = new CameraTools(this.getViewer());
            }
            this.cameraTools.stop();
        },

        //开始绘制路径
        startDrawline(mode){
            if(typeof(this.drawer)=='undefined')
            {
                this.drawer = new Draw({
                    viewer: this.getViewer()
                });
            }
            this.drawer.startDrawPolyline(mode);
        },
        
        //撤销上一段绘制
        revocation(){
            if(typeof(this.drawer) == 'undefined')
            {
                alert('请先点击开始绘制')
            }
            else
            {
                this.drawer.revocation();
            }
        },

        //停止绘制路径
        stopDrawline(){
            if(typeof(this.drawer) == 'undefined')
            {
                alert('请先点击开始绘制')
            }
            else
            {
                this.drawer.stopDrawPolyline();
            }
        },
        
        //完全清除本次绘制
        removeAll(){
            this.stopDrawline();//先停止绘制
            //清除已绘制的所有实体
            var numEntities = this.drawer.lineEntities.length;
            for(var i = 0; i<numEntities;i++)
            {
                this.revocation();
            }
            this.drawer = undefined;
        },

        //导出路径信息到json文件
        exportline(){
            if(typeof(this.drawer) == 'undefined')
            {
                alert('请先点击开始绘制')
            }
            else
            {
                var clickPositions = this.drawer.clickPositions;
                // var json = {};
                // for(var i = 0; i<clickPositions.length;i++)
                // {
                //     json[i] = clickPositions[i];
                // }
                console.log(clickPositions);
                this.exportData('1', clickPositions);
            }
        },

        //下载函数
        downloadFile(filename, data) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(data, filename)
            } else {
                const anchor = document.createElement('a')
                anchor.href = window.URL.createObjectURL(data)
                anchor.download = filename
                anchor.click()
                window.URL.revokeObjectURL(data)
            }
        },

        //导出函数，name为导出的文件名，data为导出的json数据
        exportData(name, data) {
            const content = window.btoa(encodeURIComponent(JSON.stringify(data)))
            const blobData = new Blob([JSON.stringify(data)])
            const filename = `${name}.json` //可以自定义后缀名
            console.log(blobData)
            this.downloadFile(filename, blobData)
        }
    }
}
</script>

<style scoped>
.mainbody{
    position: absolute;
    height: 600px;
    width: 390px;
    background-color: rgba(35, 37, 37, 0.4);
    top: 8.8%;
    left: 12%;
}
.box{
    position: relative;
    top: 5px;
    border-width:3px; 
    border-style:solid; 
    border-color:rgb(0, 0, 0);
    text-align: center;
}

.title{
    position: relative;
    color: rgb(177, 64, 64);
    left: 6px;
    font-size: 20px;
    font-weight: 800;
}
</style>