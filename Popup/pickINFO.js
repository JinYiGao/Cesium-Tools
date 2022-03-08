/*
 * @Descripttion: 注册全局鼠标左键点击弹窗事件
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-05-10 16:29:35
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-05-10 21:18:04
 */

 import Popup from './popUpInfo'
 
const popINFO = {
    clickModel: function (viewer) {
        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
            var pickedFeature = viewer.scene.pick(movement.position);
            if (!pickedFeature) return;
            if (!pickedFeature.id) return;
            if (pickedFeature.id.properties){
                var model = pickedFeature.id;
                var popup = popupInfo(model, viewer);
                //监听模型位置 更新表格
                var updateTable = viewer.scene.preUpdate.addEventListener(function(scene, time) {
                    //表格位置更新
                    if(viewer.entities.contains(model)){
                        var position = model.position.getValue();
                        popup.render(position);
                    }
                    else{
                        popup.close();
                        updateTable();
                    }
                });
            }
            
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
}

var popupInfo = function(model, viewer){
    var date = new Date();
    var id = date.toLocaleDateString();
    var position = model.position.getValue();
    var properties = model.properties;
    var text = '<table><tbody>';
    properties.propertyNames.forEach(key => {
        if(key != 'model'){
            text += '<tr><th>' + key + ' : ' + '</th><td>' + ((properties[key] == null) ? "无" : properties[key]) + '</td></tr>';
        }
    });
    text += '</tbody></table>';
    var name = '导弹信息';
    var popup = new Popup({
      viewer: viewer,
      position: position,
      description: text,
      title: name,
      id: id
    })

    return popup;
}

export default popINFO;