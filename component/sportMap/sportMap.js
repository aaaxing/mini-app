let timer;

Component({
    options: {
        multipleSlots: true // 多slot支持
    },
    properties: {
        //地图数据
        datas: {
            type: 'Array',
            value: []
        },
        //是否控制缩放
        ctrlScale: {
            type: 'Boolean',
            value: true
        }
    },
    data: {
        //控制地图显示与隐藏，在微信小程序中，map层级最高，无法覆盖
        show: true,
        //控制地图中心点位置和缩放比例
        center: {
            latitude: 30.67,
            longitude: 104.06,
            scale: 10
        },
        //轨迹数据
        polyline: [],
        //标记点，1是起点，2是终点，3是车辆标记
        markers: [],
        //当前状态数据
        nowData: {
            time: "",
            speed: "",
            limitSpeed: ""
        },
        //控制按钮组button(地图展示)，包括开始/暂停，速度选择，marker移动是否跟随屏幕,重置按钮
        controls: [{
                id: 1,
                position: {
                    left: 20,
                    top: 20,
                    width: 40,
                    height: 40
                },
                iconPath: '/component/sportMap/position/play.png',
                clickable: true
            },
            {
                id: 2,
                position: {
                    left: 20,
                    top: 70,
                    width: 40,
                    height: 40
                },
                iconPath: '/component/sportMap/position/speed-1.png',
                clickable: true
            },
            {
                id: 3,
                position: {
                    left: 20,
                    top: 120,
                    width: 40,
                    height: 40
                },
                iconPath: '/component/sportMap/position/fix.png',
                clickable: true
            },
            {
                id: 4,
                position: {
                    left: 20,
                    top: 170,
                    width: 40,
                    height: 40
                },
                iconPath: '/component/sportMap/position/reset.png',
                clickable: true
            }
        ],
        //控制按钮相关状态
        ctrl: {
            speed: 1,
            start: false,
            follow: false
        },
        //用于记录当前移动到数据的那个点了，用来访问数组下标
        now: 0,
        //存储地图双击事件时间
        tapTime: 0
    },
    //组件准备好之后
    ready() {
        //获取当前定位点
        wx.getLocation({
            success: (res) => {
                this.setData({
                    'center.longitude': res.longitude,
                    'center.latitude': res.latitude
                })
            }
        })
        //获取地图实例
        this.map = wx.createMapContext('map', this)
        if (this.properties.ctrlScale) {
            timer = setInterval(() => {
                this.map.getScale({
                    success: (res) => {
                        if (res.scale > 10) {
                            this.setData({
                                'center.scale': 12
                            })
                        }
                    }
                })
            }, 1000)
        }
    },
    //移除组件之后
    detached() {
        if (timer) {
            clearInterval(timer)
        }
        timer = null;
    },
    methods: {
        //显示地图
        showMap() {
            this.setData({
                show: true
            })
            this.playOrNot(1)
        },
        //隐藏地图
        hideMap() {
            this.setData({
                show: false
            })
            this.playOrNot(2)
        },
        //点击控制按钮组，区分任务
        tapControl(e) {
            switch (e.controlId) {
                case 1:
                    this.playOrNot();
                    break; //播放Or暂停
                case 2:
                    this.changeSpeed();
                    break; //改变速度
                case 3:
                    this.changeFollow();
                    break; //是否跟随
                case 4:
                    this.resetRoute();
                    break; //重新播放
                default:
                    break;
            }
        },
        //根据数据，画路线轨迹，并绘制起终点及车辆图标，一般在更新数据后使用
        drawPolyLine() {
            let polyline = [];

            for (let i in this.properties.datas) {
                polyline.push({
                    longitude: this.properties.datas[i].Longitude,
                    latitude: this.properties.datas[i].Latitude
                })
            }
            this.setData({
                polyline: [{
                    points: polyline,
                    color: '#3372B9',
                    width: 5,
                    dottedLine: false,
                    strokeWidth: 11
                }],
                markers: [
                    {
                        id: 1,
                        latitude: polyline[0].latitude,
                        longitude: polyline[0].longitude,
                        width: 30,
                        height: 30,
                        iconPath: "/component/sportMap/position/startPoint.png",
                        anthor: {
                            x: 0.5,
                            y: 1
                        }
                    },
                    {
                        id: 2,
                        latitude: polyline[polyline.length - 1].latitude,
                        longitude: polyline[polyline.length - 1].longitude,
                        width: 30,
                        height: 30,
                        iconPath: "/component/sportMap/position/endPoint.png",
                        anthor: {
                            x: 0.5,
                            y: 1
                        }
                    },
                    {
                        id: 3,
                        latitude: polyline[0].latitude,
                        longitude: polyline[0].longitude,
                        width: 40,
                        height: 40,
                        rotate: 0,
                        iconPath: "/component/sportMap/position/bus.png",
                        anchor: {
                            x: 0.5,
                            y: 0.5
                        }
                    },
                    // {
                    //     id: 3,
                    //     latitude: polyline[0].latitude,
                    //     longitude: polyline[0].longitude,
                    //     width: 40,
                    //     height: 60,
                    //     rotate: 0,
                    //     iconPath: "/static/icon/position/car.png",
                    //     anchor: {
                    //         x: 0.5,
                    //         y: 0.5
                    //     }
                    // }
                ]
            })
        },

        // 移动到中心点
        moveToCenter(latitude, longitude) {
            if (!this.isData()) {
                return
            }

            this.setData({
                'center.longitude': longitude,
                'center.latitude': latitude
            })
        },

        //移动车的图标,由于小程序开发文档关于平移marker提供了自动旋转，但是平移和旋转运动竟然是分开计算，不是同时。暂无解决方法
        moveBus() {
            if (!this.isData() || !this.data.ctrl.start) {
                return
            }
            this.map.translateMarker({
                markerId: 3,
                destination: {
                    longitude: this.properties.datas[this.data.now].Longitude,
                    latitude: this.properties.datas[this.data.now].Latitude,
                },
                // rotate:this.properties.datas[this.data.now].Direction,
                duration: 40 * 1 / this.data.ctrl.speed,
                animationEnd: () => {
                    //如果小于定位数据长度，并且播放键处于播放状态，则移动车子
                    if (this.data.now < this.properties.datas.length - 1) {
                        //车辆定位计数器递增
                        let record = this.data.now + 1

                        //如果是跟随状态，重置中心点
                        if (this.data.ctrl.follow && this.data.now % 40 == 0) {
                            this.moveToCenter(this.properties.datas[this.data.now].Latitude, this.properties.datas[this.data.now].Longitude)
                        }

                        //设置参数
                        if (this.data.now % 10 == 0) {
                            this.setData({
                                dataNow: {
                                    time: this.properties.datas[this.data.now].Time,
                                    speed: this.properties.datas[this.data.now].Speed,
                                    limitSpeed: this.properties.datas[this.data.now].LimitSpeed
                                }
                            })
                        }

                        if (this.data.now == this.properties.datas.length - 2) {
                            this.setData({
                                dataNow: {
                                    time: this.properties.datas[this.data.now].Time,
                                    speed: 0,
                                    limitSpeed: this.properties.datas[this.data.now].LimitSpeed
                                }
                            })
                        }

                        this.setData({
                            now: record,
                        })

                        //递归
                        this.moveBus()
                    }
                }
            })
        },
        //播放或暂停
        playOrNot(status) {
            //没有数据，不执行该功能
            if (!this.isData()) {
                return
            }

            //状态取反
            if (status == 1) {
                this.setData({
                    'ctrl.start': true
                })
            } else if (status == 2) {
                this.setData({
                    'ctrl.start': false
                })
            } else {
                this.setData({
                    'ctrl.start': !this.data.ctrl.start
                })
            }

            // 重新设置图标
            let item = 'controls[0].iconPath';
            if (this.data.ctrl.start) {
                this.setData({
                    [item]: '/component/sportMap/position/play.png'
                })
                this.moveBus();
            } else {
                this.setData({
                    [item]: '/component/sportMap/position/stop.png'
                })
            }
        },
        //改变速度
        changeSpeed(status) {
            //没有数据，返回
            if (!this.isData()) {
                return
            }

            //改变状态
            let count, icon;
            switch (this.data.ctrl.speed) {
                case 1:
                    count = 2;
                    icon = '/component/sportMap/position/speed-2.png';
                    break;
                case 2:
                    count = 4;
                    icon = '/component/sportMap/position/speed-4.png';
                    break;
                case 4:
                    count = 8;
                    icon = '/component/sportMap/position/speed-8.png';
                    break;
                case 8:
                    count = 1;
                    icon = '/component/sportMap/position/speed-1.png';
                    break;
                default:
                    break;
            }

            //改变
            if (status == 1) {
                count = 1;
                icon = '/component/sportMap/position/speed-1.png'
            }
            let item = 'controls[1].iconPath'
            this.setData({
                'ctrl.speed': count,
                [item]: icon
            })
        },
        //改变跟随状态
        changeFollow(status) {
            //没有数据，返回
            if (!this.isData()) {
                return
            }

            //改变状态和图标
            if (status == 1) {
                this.setData({
                    'ctrl.follow': true
                })
            } else if (status == 2) {
                this.setData({
                    'ctrl.follow': false
                })
            } else {
                this.setData({
                    'ctrl.follow': !this.data.ctrl.follow
                })
            }

            let item = 'controls[2].iconPath';
            if (this.data.ctrl.follow) {
                this.setData({
                    [item]: '/component/sportMap/position/fix-c.png'
                })
            } else {
                this.setData({
                    [item]: '/component/sportMap/position/fix.png'
                })
            }
        },
        //重置按钮，重置路线
        resetRoute() {
            //没有数据，返回
            if (!this.isData()) {
                return
            }
            this.moveToCenter(this.properties.datas[0].Latitude, this.properties.datas[0].Longitude); //重置中心点
            this.changeSpeed(1); //重置速度
            this.playOrNot(2); //先暂停播放

            //记录指针指到当前位置
            this.setData({
                now: 0
            })

            //开始播放
            setTimeout(() => {
                this.playOrNot(1);
                this.moveBus();
            }, 300)
        },
        //是否有定位数据
        isData() {
            if (!this.properties.datas.length) {
                return false
            } else {
                return true
            }
        }

    }
})
