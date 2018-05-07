let moment = require('../../tool/moment.js')

Component({
    options: {
        multipleSlots: true // 多slot支持
    },
    properties: {
        //起始时间范围
        startDate: {
            type: "Date",
            value: new Date()
        },
        //结束时间范围
        endDate: {
            type: "Date",
            value: moment().add(1, "years").toDate()
        },
        //日历列表是否倒序显示
        reverse: {
            type: "Boolean",
            value: false
        }
    },
    data: {
        show: false,
        date: [],
        chooseNow:[],
        outPut:[]
    },
    ready() {
        //初始化加载数据
        this.initCalenda()
    },
    methods: {
        //根据用户设定日历的初始和结束日期，初始化参数
        initCalenda() {
            let startDate = this.properties.startDate;
            let endDate = this.properties.endDate;

            let startYear = startDate.getFullYear();
            let endYear = endDate.getFullYear();
            let startMonth = startDate.getMonth()+1;
            startMonth = startMonth<10?"0"+startMonth:startMonth
            let endMonth = startDate.getMonth()+1;
            endMonth = endMonth<10?"0"+endMonth:endMonth
            let startDay = startDate.getDate()
            startDay = startDay<10?"0"+startDay:startDay
            let endDay = endDate.getDate()
            endDay = endDay<10?"0"+endDay:endDay

            if (startYear && endYear && startDate - endDate <= 0) {
                let start = this.properties.startDate;
                let data = [];
                let handleData = [
                    []
                ];
                let finalData = [];
                //以下使用原生的date类型处理是因为涉及到的循环遍历可能很多，重复调用十分影响性能
                while (start - endDate <= 0) {
                    let year = start.getFullYear()
                    let month = start.getMonth() +1
                    month = month<10?"0"+month:month
                    let day = start.getDate()
                    data.push({
                        year: year,
                        month: month,
                        day: day,
                        describe: '',
                        selected: false
                    })
                    start = moment(start).add(1, "days").toDate()
                }

                let monthNow = startMonth;
                data.forEach((item) => {
                    if (monthNow == item.month) {
                        handleData[handleData.length - 1].push(item)
                    } else {
                        handleData.push([])
                        handleData[handleData.length - 1].push(item)
                        monthNow = item.month
                    }
                })
                handleData.forEach((item, index) => {
                    let startWeekDays;
                    startWeekDays = parseInt(moment(item[0].year.toString() + item[0].month.toString(), 'YYYYMM').format('d'))

                    let obj = {
                        starts: startWeekDays ==0?7:startWeekDays,
                        year: item[0].year,
                        month: item[0].month,
                        days: JSON.parse(JSON.stringify(item))
                    }
                    finalData.push(obj)
                })
                let firstStart = finalData[0].days[0].year.toString() + (finalData[0].days[0].month.toString()) + (finalData[0].days[0].day < 10 ? '0' + finalData[0].days[0].day.toString() : finalData[0].days[0].day.toString())

                finalData[0].starts = parseInt(moment(firstStart, 'YYYYMMDD').format('d'))


                if (this.properties.reverse) {
                    finalData = finalData.reverse();
                }
                this.setData({
                    date: finalData
                })
                this.findToday()
            } else {
                let err = new Error("日期格式不对(是date类型)，并且您需要保证起始日期要早于结束日期")
                throw (err)
            }

        },
        //在数组中找到今天
        findToday(){
            let year = new Date().getFullYear()
            let month = moment().format("MM")
            let day = new Date().getDate()
            let da = this.data.date
            for(let i in da){
                if(da[i].year == year){
                    for(let j in da[i].days){
                        if(da[i].days[j].month == month && da[i].days[j].day == day){
                            this.setData({
                                [`date[${i}].days[${j}].describe`]:"今天"
                            })
                            return
                        }
                    }
                }
            }
        },
        //显示日历
        showCalenda() {
            this.setData({
                show: true
            })
        },
        //关闭日历
        closeCalenda() {
            this.triggerEvent('close')
            this.setData({
                show: false
            })
        },
        //点击返回
        chooseBack() {
            let now = JSON.parse(JSON.stringify(this.data.chooseNow))
            for(let i in now){
                this.setData({
                    [`date[${now[i].x}].days[${now[i].y}].selected`]:false
                })
            }
            this.setData({
                chooseNow:JSON.parse(JSON.stringify(this.data.outPut))
            })
            let nows = this.data.chooseNow
            for(let i in nows){
                this.setData({
                    [`date[${nows[i].x}].days[${nows[i].y}].selected`]:true
                })
            }
            this.closeCalenda();
        },
        //点击确认
        chooseDate() {
            if(this.data.chooseNow.length == 0){
                wx.showToast({
                    title:"请选择日期",
                    icon:"none",
                    duration:1000
                })
                return
            }
            this.setData({
                outPut:JSON.parse(JSON.stringify(this.data.chooseNow))
            })
            let outPutData = JSON.parse(JSON.stringify(this.data.outPut))
            let arr = []
            for(let i in outPutData){
                outPutData[i].data.day = outPutData[i].data.day<10?"0"+outPutData[i].data.day:outPutData[i].data.day
                arr[i] = outPutData[i].data.year.toString() + outPutData[i].data.month.toString() +outPutData[i].data.day.toString()
            }

            this.triggerEvent('change',{
                value: JSON.parse(JSON.stringify(arr))
            })
            this.closeCalenda()
        },
        //选择日期
        pickDate(e){
            let date = this.data.date
            let now = JSON.parse(JSON.stringify(this.data.chooseNow))
            let x = e.currentTarget.dataset.x
            let y = e.currentTarget.dataset.y
            if(now.length == 0){
                //一天都没选，选中这一天
                now.push({
                    x:x,
                    y:y,
                    data:JSON.parse(JSON.stringify(date[x].days[y]))
                })

                this.setData({
                    [`date[${x}].days[${y}].selected`]:true,
                    chooseNow:now
                })
            }else if(now.length == 1){
                //先判断是否是当天，如果是，取反
                if(now[0].x == x && now[0].y == y){
                    this.setData({
                        [`date[${x}].days[${y}].selected`]:false,
                        chooseNow:[]
                    })
                }else{
                    //如果不是当天，判断是否只相差一天
                    //选中的日期
                    let day1 = date[x].days[y]
                    //之前的日期
                    let day2 = now[0].data
                    let day3 = JSON.parse(JSON.stringify(now[0]))

                    day1 = moment(day1.year.toString()+day1.month.toString()+(day1.day<10?("0"+day1.day).toString():day1.day.toString()),'YYYYMMDD')
                    day2 = moment(day2.year.toString()+day2.month.toString()+(day2.day<10?("0"+day2.day).toString():day2.day.toString()),'YYYYMMDD')
                    if((day1.diff(day2))/86400000 == 1){
                        now.push({
                            x:x,
                            y:y,
                            data:JSON.parse(JSON.stringify(date[x].days[y]))
                        })
                        this.setData({
                            [`date[${x}].days[${y}].selected`]:true,
                            chooseNow:now
                        })
                    }else if((day1.diff(day2))/86400000 == -1){
                        now = [];
                        now.push({
                            x:x,
                            y:y,
                            data:JSON.parse(JSON.stringify(date[x].days[y]))
                        })
                        now.push(day3)
                        this.setData({
                            [`date[${x}].days[${y}].selected`]:true,
                            chooseNow:now
                        })
                    }else{
                        now = []
                        now.push({
                            x:x,
                            y:y,
                            data:JSON.parse(JSON.stringify(date[x].days[y]))
                        })
                        this.setData({
                            [`date[${x}].days[${y}].selected`]:true,
                            [`date[${day3.x}].days[${day3.y}].selected`]:false,
                            chooseNow:now
                        })
                    }

                }
            }else if(now.length == 2){
                if(now[0].x == x && now[0].y == y){
                    this.setData({
                        [`date[${x}].days[${y}].selected`]:false,
                        chooseNow:JSON.parse(JSON.stringify([now[1]]))
                    })
                }else if(now[1].x == x && now[1].y == y){
                    this.setData({
                        [`date[${x}].days[${y}].selected`]:false,
                        chooseNow:JSON.parse(JSON.stringify([now[0]]))
                    })
                }else{
                    this.setData({
                        [`date[${x}].days[${y}].selected`]:true,
                        [`date[${now[0].x}].days[${now[0].y}].selected`]:false,
                        [`date[${now[1].x}].days[${now[1].y}].selected`]:false,
                        chooseNow:[{
                            x:x,
                            y:y,
                            data:JSON.parse(JSON.stringify(date[x].days[y]))
                        }]
                    })
                }
            }
        }
    }
})
