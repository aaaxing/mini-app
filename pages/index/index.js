//index.js
//获取应用实例
const app = getApp()
let moment = require("../../tool/moment.js")

Page({
    data: {
        orderStatusList:['全部状态','待审核','未通过','下单成功','已完成','已取消'],
        orderStatus:'全部状态',
        timeList:['全部时间','今天','昨天','本周','本月'],
        time:'全部时间',
        // 初始化日历数据
        calendaStartDate:moment().subtract(1,"years").toDate(),
        // 初始化日历数据
        calendaEndDate:moment().toDate(),
    },
    //弹窗组件相关
    //打开弹窗
    openModal(){
        this.modal = this.selectComponent("#modal");
        this.modal.showModal()
    },
    //点击确认按钮回调
    confirm(){
        this.modal.hideModal()
    },
    //点击取消按钮回调
    cancel(){
        this.modal.hideModal()
    },


    //picker组件相关
    //点击外部,关闭picker
    tapOutSide:function(e){
        console.log(1)
        this.selectComponent("#picker1").closePicker()
        this.selectComponent("#picker2").closePicker()
     },
    //改变订单状态
    changeStatus:function(e){
        this.setData({
            orderStatus:e.detail.value
        })
    },
    //改变时间
    changeTime:function(e){
        this.setData({
            time:e.detail.value
        })
    },


    //calenda组件相关
    openCalenda(){
        this.selectComponent("#calenda").showCalenda();
    },
    //点击确认选择日期
    changeCalenda(value){
        console.log(value.detail.value)
    },
    //点击取消选择日期
    closeCalenda(){},


    //前往移动地图
    toSportMap(){
        wx.navigateTo({
            url:"/pages/sportMap/sportMap"
        })
    }
})
