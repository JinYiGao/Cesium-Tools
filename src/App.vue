<!--
 * @Descripttion: 
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-24 14:39:15
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-24 23:02:45
-->
<template>
  <div id="app">
    <Globe />
    <BaseTools />
  </div>
</template>

<script>
import Globe from './components/common/Globe.vue'
import BaseTools from '../utils/BaseCesiumTools/components/Pannel.vue'

export default {
  name: 'App',
  components: {
    Globe,
    BaseTools
  }
}
</script>

<style>
html,
body,
#app,
.wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: PingFang SC;
  color: rgba(255, 255, 255, 1);
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  font-size: 12px;
} 


</style>
