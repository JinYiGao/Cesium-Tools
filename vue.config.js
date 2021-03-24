/*
 * @Descripttion: 
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-24 14:49:20
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-03-24 23:08:45
 */

 module.exports = {
     //基本路径
     publicPath: "./",
     // 构建时的输出目录
     outputDir: "./dist",
     // 放置静态资源目录
     assetsDir: "./static",
     // html输出路径 相对于outputDir
     indexPath: "index.html",
     lintOnSave: false,
     devServer:{
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8888,
        https: false,
        hotOnly: false,
        proxy: null, // 设置代理
     },

     configureWebpack: {
        externals: {
            'Cesium': 'Cesium',
        }
    }
 }