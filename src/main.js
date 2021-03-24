/*
 * @Descripttion: 
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-24 14:39:15
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-24 23:12:20
 */
import Vue from 'vue'
import App from './App.vue'

//全局化3D对象
Vue.prototype.DTGlobe = [];

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
