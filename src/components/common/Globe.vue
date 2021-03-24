<!--
 * @Descripttion: 
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-24 14:47:05
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-24 23:12:05
-->
<template>
  <div class="parentdiv">
    <div id="cesiumContainer">
    </div>
  </div>
</template>
<script>
import * as Cesium from 'Cesium';

export default {
    data(){
        return{

        }
    },

    beforeMount () {
        this.$nextTick(() => {
            this.cesiumInit();
        });
    },
    
    methods:{
        cesiumInit(){
          Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNGYwOGZjMS03NDA0LTQ0YmItYjllMy02NTBmMDc5MzNkNDUiLCJpZCI6MzI1NDUsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciLCJnYyIsInByIl0sImlhdCI6MTU5NzE1NDQ1N30.BnTmgn0aCFnn3geiCJmJIrioI7NLILyyW35qeuZJvTw';

          let viewer = new Cesium.Viewer('cesiumContainer',{
            // 高德地图
            // imageryProvider : new Cesium.UrlTemplateImageryProvider({
            //     url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            // }),
            imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
                url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=e378319b5250eff0fdd562f3aa190e62",
                layer: "img",
                style: "default",
                format: "tiles",
                tileMatrixSetID: "w",
                credit: new Cesium.Credit('天地图全球影像服务'),
                subdomains: ['t0', "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
                maximumLevel: 18,
                show: true
            }),
            terrainProvider : Cesium.createWorldTerrain()
          });

          this.DTGlobe.push(viewer);
        }
    }
}
</script>

<style scoped>
.parentdiv {
  width: 100%;
  height: 100%;
  margin-top: -5px;
}
#cesiumContainer {
  height: 100%;
}
</style>