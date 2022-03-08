/*
 * @Descripttion: 包含一些模型实体操作的类 主要用于Entity类型 gltf/glb模型
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-05-08 18:25:20
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-20 16:17:47
 */
import * as Cesium from 'Cesium'

function modelTool(options){
    this.viewer = options.viewer;

    this.model = undefined; //选取的实体模型
    this.camera = this.viewer.camera;
    this.entity = undefined;
}

//鼠标点击选取实体模型
modelTool.prototype.pickModel = function(){
    var that = this;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.setInputAction(function onLeftClick(movement) {
        var pickedFeature = that.viewer.scene.pick(movement.position);
        console.log(pickedFeature)
        if (!pickedFeature) return;
        if (!pickedFeature.id) return;
        if (pickedFeature.id.model || pickedFeature.id.orientation){
            that.model = pickedFeature.id;
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //获取到模型后销毁
            handler.destroy();
        }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
},

//获取模型原始heading pitch roll
modelTool.prototype.getHeadingPitchRoll = function(){
    var orientation = this.model.orientation.getValue();
    var mtx3 = Cesium.Matrix3.fromQuaternion(orientation);
    var position = this.model.position.getValue();
    var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, position);
    var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4);

    this.showReferenceFrame();
    return hpr;
}

//更改Heading Pitch Roll
modelTool.prototype.changeHeadingPitchRoll = function(heading, pitch, roll){
    var position = this.model.position.getValue();
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));
    this.model.orientation = orientation;

    this.showReferenceFrame();
    // this.camera.setView({
    //     orientation: {
    //         heading: heading,
    //         pitch: pitch,
    //         roll:roll
    //     }
    // })
}

//显示模型局部坐标系
modelTool.prototype.showReferenceFrame = function(){
    this.viewer.scene.primitives.remove(this.entity);

    var position = this.model.position.getValue();
    var mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    console.log(mat4);
    var orientation = this.model.orientation.getValue();
    var mtx3 = Cesium.Matrix3.fromQuaternion(orientation);
    var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, position);
    console.log(mtx4);
    var modelMatrix = Cesium.Matrix4.multiplyByMatrix3(mat4, mtx3, new Cesium.Matrix4);

    this.entity = this.viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
        modelMatrix : mtx4,  // primitive to debug
        length : 50.0,
        width : 3
    }));

    // this.viewer.entities.remove(this.entity[0]);
    // this.viewer.entities.remove(this.entity[1]);
    // this.viewer.entities.remove(this.entity[2]);

    // var position = this.model.position.getValue();
    // var mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    // var transform = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY); 
    // transform = Cesium.Matrix4.getMatrix3(mat4, transform);
    // var orientationMat4 = Cesium.Matrix3.fromQuaternion(this.model.orientation.getValue());
    // var orientation = Cesium.Matrix4.getMatrix3(orientationMat4, new Cesium.Matrix3);
    // console.log(orientation)
    // var VectorX = Cesium.Matrix3.multiplyByVector(orientation, Cesium.Cartesian3.UNIT_X);
    // VectorX = Cesium.Matrix3.multiplyByVector(transform, VectorX);
    // var VectorY = Cesium.Matrix3.multiplyByVector(orientation, Cesium.Cartesian3.UNIT_Y);
    // VectorY = Cesium.Matrix3.multiplyByVector(transform, VectorY);
    // var VectorZ = Cesium.Matrix3.multiplyByVector(orientation, Cesium.Cartesian3.UNIT_Z);
    // VectorZ = Cesium.Matrix3.multiplyByVector(transform, VectorZ);

    // //绘制坐标系
    // var material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED);
    // var entityX = this.viewer.entities.add({  
    //     polyline: {
    //         positions: VectorX,
    //         width: 5,
    //         arcType: Cesium.ArcType.NONE,
    //         material: material
    //     },
    // });
    // material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN);
    // var entityY = this.viewer.entities.add({  
    //     polyline: {
    //         positions: VectorY,
    //         width: 5,
    //         arcType: Cesium.ArcType.NONE,
    //         material: material
    //     },
    // });
    // material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE);
    // var entityZ = this.viewer.entities.add({  
    //     polyline: {
    //         positions: VectorZ,
    //         width: 5,
    //         arcType: Cesium.ArcType.NONE,
    //         material: material
    //     },
    // });
    // this.entity.push(entityX);
    // this.entity.push(entityY);
    // this.entity.push(entityZ);
}
export default modelTool;
