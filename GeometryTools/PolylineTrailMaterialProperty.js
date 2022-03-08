/*
 * @Descripttion: 新增飞线 流动线材质类
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-06-29 20:02:57
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-30 13:54:11
 */
import * as Cesium from 'Cesium'

export default class PolylineTrailMaterialProperty {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;

        this.color = options.color;
        this.duration = options.duration;
        this.trailImage = options.trailImage;
        this._time = performance.now();
    }
}

Object.defineProperties(PolylineTrailMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

PolylineTrailMaterialProperty.prototype.getType = function (time) {
    return 'PolylineTrail';
}

/**
 * 获取当前材质
 * @author Jin
 * @date 2021-06-29
 * @param {any} time
 * @param {any} result
 * @returns {any}
 */
PolylineTrailMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    //result.image = Cesium.Material.PolylineTrailImage;
    result.image = this.trailImage;
    result.time = ((performance.now() - this._time) % this.duration) / this.duration;

    return result;
}

PolylineTrailMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof PolylineTrailMaterialProperty && Cesium.Property.equals(this._color, other._color))
}

Cesium.Material.PolylineTrailType = 'PolylineTrail';
Cesium.Material.PolylineTrailImage = "./config/icons/color.png";
Cesium.Material.PolylineTrailSource = `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
     {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        vec2 st = materialInput.st;\n\
        vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
        material.alpha = colorImage.a * color.a;\n\
        material.diffuse = (colorImage.rgb + color.rgb) / 2.0;\n\
        return material;\n\
    }`;

/**
 * 添加材质
 * @author Jin
 * @date 2021-06-29
 * @returns {any}
 */
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
    fabric: {
        type: Cesium.Material.PolylineTrailType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
            image: Cesium.Material.PolylineTrailImage,
            time: 0
        },
        source: Cesium.Material.PolylineTrailSource
    },
    translucent: function (material) {
        return true;
    }
});

Cesium.PolylineTrailMaterialProperty = PolylineTrailMaterialProperty;