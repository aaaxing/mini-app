Component({
    options: {
        multipleSlots: true // 多slot支持
    },

    properties: {
        // 弹窗标题
        list: {
            type: 'Array', // 类型（必填）String, Number, Boolean, Object, Array, null（表示任意类型）
            value: [] // 属性初始值（可选）
        },
        // 弹窗内容
        value: {
            type: 'String',
            value: '弹窗内容'
        },
        //序号，确定菜单的定位位置
        index: {
            type: 'Number',
            value: 1
        }
    },
    data: {
        pickerShow: false
    },
    methods: {
        //打开选择器
        openPicker() {
            if (this.data.pickerShow) {
                this.setData({
                    pickerShow: !this.data.pickerShow
                })
            } else {
                this.triggerEvent('closePicker')
                this.setData({
                    pickerShow: true
                })
            }
        },
        //选择选择框选项
        choosePicker(e) {
            this.setData({
                pickerShow: false,
                value: e.currentTarget.dataset.pickerLabel
            })
            this.triggerEvent('outPutValue', {
                value: e.currentTarget.dataset.pickerLabel
            })
        },
        //关闭选择器
        closePicker() {
            this.setData({
                pickerShow: false
            })
        }
    }
})
