<!-- 
 * @Descripttion:  Vue组件类型 辅助工具操作面板
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-23 11:47:15
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-30 13:49:37
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
                <button class="cesium-button" @click="roamingSimulation"> 漫游模拟 </button>
                <button class="cesium-button" @click="stoproamingSimulation"> 停止模拟 </button>
                <button class="cesium-button" @click="revocation"> 撤销上一段 </button>
                <button class="cesium-button" @click="stopDrawline"> 停止绘制路径 </button>
                <button class="cesium-button" @click="removeAll"> 完全清除本次绘制 </button>
                <button class="cesium-button" @click="log"> 打印路径 </button>
                <button class="cesium-button" @click="exportline"> 导出路径到文件 </button>
            </div>
        </div>
        <div class="box">
            <div class="title">模型姿态辅助工具</div>
            <div>
                <button class="cesium-button" @click="pickModel"> 选取实体模型 </button>
                <table>
                    <tbody>
                        <tr>
                            <td>Heading</td>
                            <td>
                                <el-slider v-model="Heading" :min="minHeading" :max="maxHeading" show-input :step="step"
                                    @input="changeHeadingPitchRoll" :disabled="isdisable">
                                </el-slider>
                            </td>
                        </tr>
                        <tr>
                            <td>Pitch</td>
                            <td>
                                <el-slider v-model="Pitch" :min="minPitch" :max="maxPitch" show-input :step="step"
                                    @input="changeHeadingPitchRoll" :disabled="isdisable">
                                </el-slider>
                            </td>
                        </tr>
                        <tr>
                            <td>Roll</td>
                            <td>
                                <el-slider v-model="Roll" :min="minRoll" :max="maxRoll" show-input :step="step"
                                    @input="changeHeadingPitchRoll" :disabled="isdisable">
                                </el-slider>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- <div class="box">
            <div class="title">量测辅助工具</div>
            <div>
                <button class="cesium-button" @click="test"> 测试 </button>
                <button class="cesium-button" @click="startDrawline(0)"> 线段测量 </button>
                <button class="cesium-button" @click="revocation"> 面积测量 </button>
                <button class="cesium-button" @click="stopDrawline"> 删除 </button>
            </div>
        </div> -->
        <div class="box">
            <div class="title">其它(示例)</div>
            <div>
                <button class="cesium-button" @click="dynamicLine"> 飞线(流动线)功能 </button>
            </div>
        </div>
    </div>
</template>

<script>
    import * as Cesium from 'Cesium'
    import {
        CameraTools,
        Draw,
        modelTool,
        PathlineRoaming
    } from '../index'
    import {
        PolylineTrailMaterialProperty
    } from "../GeometryTools/PolylineTrailMaterialProperty.js";
    export default {
        data() {
            return {
                Heading: 0, //选择查看的Heading
                minHeading: -3.14,
                maxHeading: 3.14, //最大Heading

                Pitch: 0,
                minPitch: -3.14,
                maxPitch: 3.14,

                Roll: 0,
                minRoll: -3.14,
                maxRoll: 3.14,
                isdisable: true,
                step: 0.01,

                drawMode: -1, //绘制模式 0--鼠标 1--相机
                frozon: Object.freeze({
                    CameraTools: {
                        cameraTools: undefined
                    },
                    Draw: {
                        drawer: undefined
                    },
                    ModelTool: {
                        modelTool: undefined
                    },
                    PathlineRoaming: {
                        pathlineRoaming: undefined
                    }
                })
            }
        },

        methods: {
            dynamicLine() {
                //创建射线
                var viewer = this.DTGlobe[0];
                var data = {
                    center: {
                        id: 0,
                        lon: 114.302312702,
                        lat: 30.598026044,
                        size: 20,
                        color: Cesium.Color.PURPLE
                    },
                    points: [
                        {
                            id: 1,
                            lon: 115.028495718,
                            lat: 30.200814617,
                            color: Cesium.Color.YELLOW,
                            size: 15
                        },
                        {
                            id: 2,
                            lon: 110.795000473,
                            lat: 32.638540762,
                            color: Cesium.Color.RED,
                            size: 15
                        },
                        {
                            id: 3,
                            lon: 111.267729446,
                            lat: 30.698151246,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 4,
                            lon: 112.126643144,
                            lat: 32.058588576,
                            color: Cesium.Color.GREEN,
                            size: 15
                        },
                        {
                            id: 5,
                            lon: 114.885884938,
                            lat: 30.395401912,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 6,
                            lon: 112.190419415,
                            lat: 31.043949588,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 7,
                            lon: 113.903569642,
                            lat: 30.93205405,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 8,
                            lon: 112.226648859,
                            lat: 30.367904255,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 9,
                            lon: 114.86171677,
                            lat: 30.468634833,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 10,
                            lon: 114.317846048,
                            lat: 29.848946148,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 11,
                            lon: 113.371985426,
                            lat: 31.70498833,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 12,
                            lon: 109.468884533,
                            lat: 30.289012191,
                            color: Cesium.Color.BLUE,
                            size: 15
                        },
                        {
                            id: 13,
                            lon: 113.414585069,
                            lat: 30.368350431,
                            color: Cesium.Color.SALMON,
                            size: 15
                        },
                        {
                            id: 14,
                            lon: 112.892742589,
                            lat: 30.409306203,
                            color: Cesium.Color.WHITE,
                            size: 15
                        },
                        {
                            id: 15,
                            lon: 113.16085371,
                            lat: 30.667483468,
                            color: Cesium.Color.SALMON,
                            size: 15
                        },
                        {
                            id: 16,
                            lon: 110.670643354,
                            lat: 31.74854078,
                            color: Cesium.Color.PINK,
                            size: 15
                        }
                    ],
                    options: {
                        name: "",
                        polyline: {
                            width: 2,
                            material: [Cesium.Color.GREEN, 3000]
                        }
                    }
                };
                this.createFlyLines(data);
            },
            // 创建飞线效果
            createFlyLines(data) {
                var viewer = this.DTGlobe[0];
                const center = data.center;
                const cities = data.points;
                const startPoint = Cesium.Cartesian3.fromDegrees(
                    center.lon,
                    center.lat,
                    0
                );
                //中心点
                viewer.entities.add({
                    position: startPoint,
                    point: {
                        pixelSize: center.size,
                        color: center.color
                    }
                });
                //大批量操作时，临时禁用事件可以提高性能
                viewer.entities.suspendEvents();

                //散点
                cities.map(city => {
                    let material = new Cesium.PolylineTrailMaterialProperty({
                        color: Cesium.Color.YELLOW, //指定线原本颜色
                        duration: 3000,
                        trailImage: "./config/icons/color.png" //图片混合
                    });
                    
                    const endPoint = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 0);
                    // 添加点
                    viewer.entities.add({
                        position: endPoint,
                        point: {
                            pixelSize: city.size - 10,
                            color: city.color
                        }
                    });
                    // 添加动态线
                    viewer.entities.add({
                        polyline: {
                            positions: this.generateCurve(startPoint, endPoint),
                            width: 2,
                            material: material,
                        }
                    });
                });

                viewer.entities.resumeEvents();
                
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(114.3215757,23.1299747,1458468.6429519),
                    orientation: {
                        heading: 6.12090100854941,
                        pitch: -1.066574955068397,
                        roll: 6.283059436933815
                    }
                })
            },

            /**
            * 生成流动曲线
            * @param startPoint 起点
            * @param endPoint 终点
            * @returns {Array}
            */
            generateCurve(startPoint, endPoint) {
                var viewer = this.DTGlobe[0];
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
                console.log(curvePoints)
                return curvePoints;
            },
            
            //返回全局viewer对象
            getViewer() {
                return this.DTGlobe[0];
            },

            //开启鼠标点击坐标获取
            getPos() {
                if (typeof (this.frozon.CameraTools.cameraTools) == 'undefined') {
                    this.frozon.CameraTools.cameraTools = new CameraTools({
                        viewer: this.getViewer()
                    })
                }
                this.frozon.CameraTools.cameraTools.getCameraViewPoint();
                this.frozon.CameraTools.cameraTools.GetCameraPosition();
                console.log('开启鼠标获取坐标!');
            },

            //关闭鼠标点击坐标获取
            closeGetPos() {
                if (typeof (this.frozon.CameraTools.cameraTools) == 'undefined') {
                    this.frozon.CameraTools.cameraTools = new CameraTools({
                        viewer: this.getViewer()
                    })
                }
                this.frozon.CameraTools.cameraTools.stop();
                console.log('关闭鼠标获取坐标!');
            },

            //开始绘制路径
            startDrawline(mode) {
                if (typeof (this.frozon.Draw.drawer) == 'undefined') {
                    this.frozon.Draw.drawer = new Draw({
                        viewer: this.getViewer()
                    })
                }
                this.drawMode = mode;
                this.frozon.Draw.drawer.startDrawPolyline(mode);
            },

            //绘制路径漫游模拟
            roamingSimulation() {
                if (this.drawMode === -1) {
                    alert('请先绘制路径!');
                    return;
                }
                if (this.frozon.PathlineRoaming.pathlineRoaming) {
                    this.frozon.PathlineRoaming.pathlineRoaming.stopRoaming();
                }
                var viewer = this.getViewer();
                this.frozon.PathlineRoaming.pathlineRoaming = new PathlineRoaming({
                    viewer: viewer,
                    positions: this.frozon.Draw.drawer.lonlatheight,
                })
                console.log('startRoaming');
                if (this.drawMode === 0) {
                    this.frozon.PathlineRoaming.pathlineRoaming.startRoamingWithoutOri();
                } else if (this.drawMode === 1) {
                    this.frozon.PathlineRoaming.pathlineRoaming.startRoaming();
                }
            },
            //停止路径漫游模拟
            stoproamingSimulation() {
                if (!this.frozon.PathlineRoaming.pathlineRoaming) {
                    return;
                }
                this.frozon.PathlineRoaming.pathlineRoaming.stopRoaming();
            },
            //撤销上一段绘制
            revocation() {
                if (typeof (this.frozon.Draw.drawer) == 'undefined') {
                    alert('请先点击开始绘制')
                } else {
                    this.frozon.Draw.drawer.revocation();
                }
            },

            //停止绘制路径
            stopDrawline() {
                if (typeof (this.frozon.Draw.drawer) == 'undefined') {
                    alert('请先点击开始绘制')
                } else {
                    this.frozon.Draw.drawer.stopDrawPolyline();
                }
            },

            //完全清除本次绘制
            removeAll() {
                this.stopDrawline(); //先停止绘制
                //清除已绘制的所有实体
                var numEntities = this.frozon.Draw.drawer.lineEntities.length;
                for (var i = 0; i < numEntities; i++) {
                    this.revocation();
                }
                this.frozon.Draw.drawer = undefined;
                this.drawMode = -1;
            },
            //打印路径信息
            log() {
                if (typeof (this.frozon.Draw.drawer) == 'undefined') {
                    alert('请先点击开始绘制')
                } else {
                    var positions = this.frozon.Draw.drawer.positions;
                    var clickPositions = this.frozon.Draw.drawer.clickPositions;
                    var lonlatheight = this.frozon.Draw.drawer.lonlatheight;
                    // var json = {};
                    // for(var i = 0; i<clickPositions.length;i++)
                    // {
                    //     json[i] = clickPositions[i];
                    // }
                    // console.log(clickPositions);
                    console.log(JSON.stringify(positions));
                    console.log(JSON.stringify(lonlatheight));
                    // this.exportData('Positions', positions);
                    // this.exportData('Arrayheights', lonlatheight);
                }
            },
            //导出路径信息到json文件
            exportline() {
                if (typeof (this.frozon.Draw.drawer) == 'undefined') {
                    alert('请先点击开始绘制')
                } else {
                    var positions = this.frozon.Draw.drawer.positions;
                    var clickPositions = this.frozon.Draw.drawer.clickPositions;
                    var lonlatheight = this.frozon.Draw.drawer.lonlatheight;
                    // var json = {};
                    // for(var i = 0; i<clickPositions.length;i++)
                    // {
                    //     json[i] = clickPositions[i];
                    // }
                    // console.log(clickPositions);
                    this.exportData('Positions', positions);
                    this.exportData('Arrayheights', lonlatheight);
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
                //const content = window.btoa(encodeURIComponent(JSON.stringify(data)))
                const blobData = new Blob([JSON.stringify(data)])
                const filename = `${name}.json` //可以自定义后缀名
                console.log(JSON.stringify(data))
                this.downloadFile(filename, blobData)
            },

            //选取模型实体
            pickModel() {
                //先禁用滑条
                this.Heading = 0.0;
                this.Pitch = 0.0;
                this.Roll = 0.0;
                this.isdisable = true;

                this.frozon.ModelTool.modelTool = new modelTool({
                    viewer: this.getViewer()
                })
                this.frozon.ModelTool.modelTool.pickModel();
                var intervalID = setInterval(() => {
                    if (Cesium.defined(this.frozon.ModelTool.modelTool.model)) {
                        this.isdisable = false; //选取到模型实体后滑条解封
                        //获取模型当前 heading picth roll
                        var hpr = this.frozon.ModelTool.modelTool.getHeadingPitchRoll();
                        this.Heading = parseFloat(hpr.heading.toFixed(2));
                        this.Pitch = parseFloat(hpr.pitch.toFixed(2));
                        this.Roll = parseFloat(hpr.roll.toFixed(2));
                        clearInterval(intervalID);
                    }
                }, 200)
            },

            //改变模型Heading Pitch Roll
            changeHeadingPitchRoll() {
                if (Cesium.defined(this.frozon.ModelTool.modelTool)) {
                    if (Cesium.defined(this.frozon.ModelTool.modelTool.model)) {
                        this.frozon.ModelTool.modelTool.changeHeadingPitchRoll(this.Heading, this.Pitch, this.Roll);
                    } else {
                        alert('请先选择模型!')
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .mainbody {
        position: absolute;
        height: 600px;
        width: 390px;
        background-color: rgba(35, 37, 37, 0.7);
        top: 10%;
        left: 12%;
    }

    .box {
        position: relative;
        top: 5px;
        border-width: 3px;
        border-style: solid;
        border-color: rgb(0, 0, 0);
        text-align: center;
    }

    .title {
        position: relative;
        color: rgb(177, 64, 64);
        left: 6px;
        font-size: 20px;
        font-weight: 800;
    }

    .el-slider {
        /* margin-top: 3px;
    margin-left: 3px; */
        left: 2px;
        position: relative;
        width: 300px;
    }
</style>