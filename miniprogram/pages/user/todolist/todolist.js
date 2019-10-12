// pages/user/todolist/todolist.js
const { $Message } = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEdit: true,
    todo: { // 任务默认属性
      description: '',  // 任务描述
      startTime: '', // 开始时间
      endTime: '', // 结束时间
      type: '', // 事件类型
      progress: 0, // 完成进度
      tags: [
        "common",
        "private",
      ],
      location: '',
      done: false
    },
    typeOptions: [{
      name: '很重要-很紧急',
      value: 'important-critical'
    }, {
      name: '重要-不紧急',
      value: 'important-noCritical'
    }, {
      name: '不重要-紧急',
      value: 'noImportant-critical'
    }, {
      name: '不重要-不紧急',
      value: 'noImportant-noCritical'
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  add() {
    const db = wx.cloud.database()
    const { todo } = this.data
    const { description, type } = todo
    if (!description) {
      $Message({
          content: '请输入任务描述!',
          type: 'warning'
      });
      return false
    }
    if (!type) {
      $Message({
          content: '请选择任务类型!',
          type: 'warning'
      });
      return false
    }
    db.collection('todolist').add({
      data: {
        description,
        startTime:  new Date("2018-09-01"),
        endTime: new Date("2018-09-01"),
        type,
        progress: 0,
        tags: [
          "common",
          "private"
        ],
        // 为待办事项添加一个地理位置（113°E，23°N）
        location: new db.Geo.Point(113, 23),
        done: false
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '新增记录成功',
        })
        this.setData({
          isEdit: false
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  toggleEdit() {
    this.setData({
      isEdit: !this.data.isEdit
    })
  },
  editDescription(e) {
    e = e.detail
    const { todo } = this.data
    this.setData({
      todo: {
        ...todo,
        description: e.detail.value
      }
    })
  },
  // 改变任务类型
  changeTodoType(e) {
    const { todo } = this.data
    const { type } = e.currentTarget.dataset
    todo.type = type
    this.setData({
      todo
    })
  }
})