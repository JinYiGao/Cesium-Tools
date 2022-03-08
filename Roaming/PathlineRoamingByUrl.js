/*
 * @Descripttion: 给定 漫游路径url进行漫游
 * @version: 
 * @Author: JinYiGao
 * @Date: 2021-03-24 00:04:18
 * @LastEditors: JinYiGao
 * @LastEditTime: 2021-05-27 22:55:33
 */

import PathlineRoaming from './PathlineRoaming'
import request from '../NetWork/request'

//   mode ----0: 不带俯仰角  ------1: 带有相机俯仰角旋转角
export default function startRoamingByUrl(option){
    var viewer = option.viewer;
    var speed = option.speed;
    var url = option.url;
    var mode = option.mode;

    var positions = [];

    return new Promise(resolve=>{
        request({
            baseURL: url,
            method: 'get'
        }).then((data)=>{
            var pos = data.data;
            if(mode == 0)
            {
                for(var i = 0 ;i<pos.length;i++)
                {
                    var position = [pos[i].lon, pos[i].lat, parseFloat(pos[i].height)];
                    positions.push(position);
                }
            }
            else if(mode == 1)
            {
                for(var i = 0 ;i<pos.length;i++)
                {
                    var position = [pos[i].lon, pos[i].lat, parseFloat(pos[i].height), pos[i].heading, pos[i].pitch, pos[i].roll];
                    positions.push(position);
                }
            }
            // console.log(positions);
            var option = {
                viewer: viewer,
                speed: speed,
                positions: positions
            }
            var pathlineroaming = new PathlineRoaming(option);
            if(mode == 0)
            {
                pathlineroaming.startRoamingWithoutOri().then(()=>{
                    resolve()
                });
            }
            else if(mode == 1)
            {
                pathlineroaming.startRoaming().then(()=>{
                    resolve();
                });
            }
        })        
    })
}