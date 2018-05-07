let formatTime = require('./util.js').formatTime
// 去除漂移
//超过该速度则漂移 单位m/s
const speed = 44.5
const limitDistance = 50

//不在中国国内的点
function notInChina(item){
    if(item.Longitude/1000000 >137.8347 || item.Longitude/1000000 <72.004 || item.Latitude/1000000 < 0.8293 || item.Latitude/1000000 > 55.8271){
        return false
    }else{
        return true
    }
}

//计算距离
function countDistance(item,itemNext){
    var radLat1 = (item.Latitude/1000000) * Math.PI / 180.0;
    var radLat2 = (itemNext.Latitude/1000000) * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = (item.Longitude/1000000) * Math.PI / 180.0 - (itemNext.Longitude/1000000) * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    return s
}

//确定是否是漂移,如果不是，返回当前速度
function ifDrift(item,itemNext){
    let distance = countDistance(item,itemNext)
    let time = itemNext.GpsTime - item.GpsTime
    let outSpeed = distance/time*100

    if(outSpeed > speed){//漂移，抛掉
        return true
    }else if(distance*100<limitDistance){//距离过短，抛掉
        return true
    }else{
        return outSpeed
    }
}


//去除漂移并重新组装数据
function leaveDrift(data){
    let outPut = [];
    for(let i = 0;i<data.length-1;i++){
        //去除不在中国国内的点
        if(!notInChina(data[i])){
            continue
        }

        //数组最后一条无法遍历
        if(i == data.length-1){
            continue
        }

        let outSpeed = ifDrift(data[i],data[i+1])

        if(outSpeed != true){
            outPut.push({
                Direction:data[i].Direction,
                Latitude:data[i].Latitude/1000000,
                Longitude:data[i].Longitude/1000000,
                LimitSpeed:data[i].LimitSpeed,
                Speed:parseInt(outSpeed * 3.6),
                Time:data[i].GpsDate+"  "+formatTime(data[i].GpsTime)
            })
        }
    }

    //添加终点
    let objLast = {
        Direction:data[data.length-1].Direction,
        Latitude:data[data.length-1].Latitude/1000000,
        Longitude:data[data.length-1].Longitude/1000000,
        LimitSpeed:data[data.length-1].LimitSpeed,
        Time:data[data.length-1].GpsDate+"  "+formatTime(data[data.length-1].GpsTime),
        Speed:0
    }

    outPut.push(objLast)
    return outPut
}

module.exports = {
  leaveDrift
}
