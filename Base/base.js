/*
 * @Descripttion: js中经常使用的一些小函数
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-04-09 20:14:43
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-06-29 22:42:07
 */

 export default {
     //去除数组中重复元素
    RemoveRepeat(arr){
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    },

    //暂停ms毫秒
    Sleep(ms){
        return new Promise(resolve=>{
            setTimeout(()=>resolve(), ms)
        })
    },

    //获取当前时间
    getDate(){
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        const hour = d.getHours();
        const minute = d.getMinutes();
        const seconds = d.getSeconds();
        return {
            id: year + '-' + month + '-' + day + '-' + hour + '-' + minute + '-' + seconds,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            seconds: seconds
        }
    }
 }