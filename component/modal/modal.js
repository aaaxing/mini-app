Component({
  options: {
    multipleSlots: true // 多slot支持
  },

  properties: {
    // 弹窗标题
    title:{
      type: String,     // 类型（必填）String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题'     // 属性初始值（可选）
    },
    // 弹窗内容
    content:{
      type : String ,
      value : '弹窗内容'
    },
    // 弹窗取消按钮文字
    cancelText:{
      type : String ,
      value : '取消'
    },
    // 弹窗确认按钮文字
    confirmText:{
      type : String ,
      value : '确定'
    }
  },

  data: {
    isShow:false
  },

  methods: {
    //隐藏弹框
    hideModal(){
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    showModal(){
      this.setData({
        isShow: !this.data.isShow
      })
    },
    _cancelEvent(){
      //触发取消回调
      this.triggerEvent("cancelEvent")
    },
    _confirmEvent(){
      //触发成功回调
      this.triggerEvent("confirmEvent");
    }
  }
})
