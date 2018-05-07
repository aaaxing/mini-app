//传入YYYYMMDD格式，输出YYYY年MM月DD日格式
let formatDate = (date) => {
    date = date.toString();
    if(date.toString().length != 8){
        return date
    }
    let year = date.substr(0,4)
    let month = date.substr(4,2)
    let day =date.substr(6,2)

    if(month[0] == 0){
        month = month.substr(1,1)
    }
    if(day[0] == 0){
        day = day.substr(1,1)
    }
    return year+"年"+month+"月"+day+"日"
}

let formatTime = (record) => {
    let hour = parseInt(record / 3600);
    let minute = parseInt((record - hour*3600) / 60)
    let second = parseInt(record-hour*3600-minute*60)

    if(hour<10){
        hour = "0"+hour.toString()
    }
    if(minute<10){
        minute = "0"+minute.toString()
    }
    if(second < 10){
        second = "0"+second.toString()
    }
    return hour+":"+minute+":"+second
}

module.exports = {
  formatDate,
  formatTime
}
