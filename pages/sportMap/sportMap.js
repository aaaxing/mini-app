const app = getApp()
let moment = require("../../tool/moment.js")
let leaveDrift = require('../../tool/drift.js').leaveDrift
let mapData = require("../../component/sportMap/data/mapData.js")


let map;

Page({
    //是否缩放地图
    data:{
        ctrlScale:false,
        //存储轨迹数据
        routeData:[]
    },
    onShow(){
        map = this.selectComponent("#sportMap")
        let datas = leaveDrift(mapData.data)
        this.setData({
            routeData:datas
        })
        setTimeout(()=>{
            map.drawPolyLine()
            map.moveToCenter(this.data.routeData[0].Latitude, this.data.routeData[0].Longitude);
            map.playOrNot(1)
        },1000)
    }
})
