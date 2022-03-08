/*
 * @Descripttion: 封装网络请求
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-23 15:36:20
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-04-07 14:57:56
 */
import axios from 'axios'

export default function request(config) {

    //创建axios实例
    const instance = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": 'application/json'
      },
      timeout: 50000,
    })
    
    //发送真正的网络请求
    return instance(config)
}

//示例
// request({
//     baseURL: '',
//     url: '',
//     method: 'get',
//     headers:{

//     }
//     ...
// })