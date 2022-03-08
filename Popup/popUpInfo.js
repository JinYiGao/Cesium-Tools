/*
 * @Descripttion: 
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-16 09:48:38
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-05-26 20:46:18
 */
import './InfoPopup.css'
import $ from 'jquery'

// 创建弹窗对象的方法
var Popup = function (option) {
    this.constructor(option);
}
Popup.prototype.id = 0;
Popup.prototype.constructor = function (option) {
    var _self = this;
    _self.viewer = option.viewer;
    _self.position = option.position;
    _self.info = option.description;
    _self.title = option.title;
    _self.id = option.id;
    _self.type = typeof(option.type) == 'undefined' ? 'info' : option.type;
    
    //_self.id = "popup_" + _self.__proto__.id++;
    _self.context = $('<div class="bx-popup-ctn" id="' + _self.id + '">');
    _self.closebtn = $('<div class="bx-popup-close">');
    _self.context.append(_self.closebtn);
    $(_self.viewer.container).append(_self.context);
    _self.context.append(_self.createHtml(_self.title, _self.info,_self.type));

    if(_self.type == 'info')
    {
        _self.render(_self.position);
        _self.eventListener = _self.viewer.clock.onTick.addEventListener(function () {
            _self.render(_self.position);
        })
    }
    else if(_self.type == 'other')
    {
        _self.renderfixed();
    }
    
    _self.closebtn.click(function () {
        _self.close();
    });
}
// 实时刷新
Popup.prototype.render = function (positionEarth) {
    var _self = this;
    var positionScreen = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_self.viewer.scene, positionEarth);
    var occluder = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, _self.viewer.camera.position)
    if (occluder.isPointVisible(positionEarth) && typeof(positionScreen)!='undefined') {
        _self.context.css("left", positionScreen.x - _self.context.get(0).offsetWidth / 2);
        _self.context.css("top", positionScreen.y - _self.context.get(0).offsetHeight - 10);
        _self.context.show();
    } else {
        _self.context.hide();
    }
}
//固定位置渲染
Popup.prototype.renderfixed = function () {
    var _self = this;
    _self.context.css("left", '25%');
    _self.context.css("top", '82%');
    _self.context.show();
}

// 动态生成内容
Popup.prototype.createHtml = function (header, content, type) {
    if(type == 'info')
    {
    var html = '<div class="bx-popup-header-ctn">' + header + '</div>' + '<div  style="overflow-y:auto; overflow-x:hidden; max-height:300px;max-width: 400px;">' + content + '</div>' +
        '<div class="bx-popup-tip-container" >' +
        '<div class="bx-popup-tip" >' +
        '</div>' +
        '</div>'
    }
    else if(type == 'other')
    {
        var html = '<div class="bx-popup-header-ctn">' +  '<font size="5">' + header + '</font>' + '</div>' + '<div  style="overflow-y:auto; overflow-x:hidden; max-height:3000px;max-width: 4000px;">' + content + '</div>' +
        '<div class="bx-popup-tip-container" >' +
        '</div>'
    }
    return html;
}
// 关闭弹窗按钮
Popup.prototype.close = function () {
    var _self = this;
    _self.context.remove();
    _self.viewer.clock.onTick.removeEventListener(_self.eventListener);
}

export default Popup;