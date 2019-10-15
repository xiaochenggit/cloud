// pages/user/todolist/todolist.js
const { $Message } = require('../../../dist/base/index');
const util = require('../../../util/utils.js');
const api = require('./api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    name: 'name1',
    todo: {},
    showConfirmDelete: false,
    todoList: [],
    resetTodo: { // 任务默认属性
      description: '',  // 任务描述
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '23:59',
      type: '', // 事件类型
      progress: 0, // 完成进度
      tags: [
        "common",
        "private",
      ],
      location: '',
      done: false,
      status: 'wrong'
    },
    typeOptions: [{ // 任务类型配置
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
    minStartDate: '2019-01-01', // 最小日期限制
    minStartTime: '00:00', // 最小时间限制
    progressUnit: 10, // 进度条每次变化值
    deleteTodoId: -1,
    deleteTodoIndex: -1,
    deleteTodoIdx: -1,
    deleteTodoTip: '确认删除此事件吗?',
    scrollTop: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.sreachList()
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
    const { description, type, done, progress, startTime } = todo
    let startDate = todo.startDate
    startDate = startDate.replace(/-/g, '/')
    if (!description) {
      $Message({
        content: '请输入事件描述!',
        type: 'warning'
      });
      return false
    }
    if (!type) {
      $Message({
        content: '请选择事件类型!',
        type: 'warning'
      });
      return false
    }
    const data = {
      description,
      endTime: new Date(startDate + ' ' + startTime),
      type,
      progress,
      tags: [
        "common",
        "private"
      ],
      // 为待办事项添加一个地理位置（113°E，23°N）
      location: new db.Geo.Point(113, 23),
      done
    }
    api.add(data, (res) => {
      wx.showToast({
        title: '新增记录成功',
      })
      this.setData({
        isEdit: false
      })
      this.sreachList()
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res)
    }, (err) => {
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })
  },
  toggleEdit() {
    const isEdit = !this.data.isEdit
    if (isEdit) {
      const { resetTodo } = this.data
      const date = util.formatTime(new Date(), 'yyyy-MM-dd HH:mm').split(' ')
      const minStartDate = date[0]
      const minStartTime = date[1]
      this.setData({
        minStartDate,
        minStartTime,
        isEdit,
        todo: {
          ...resetTodo,
          status: 'wrong',
          startDate: minStartDate,
          startTime: minStartTime,
        }
      })
    } else {
      this.setData({
        isEdit
      })
    }
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
  // 开始时间改变
  timeChange(e) {
    const { type } = e.currentTarget.dataset
    const { todo } = this.data
    todo[type] = e.detail.value
    this.setData({
      todo
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
  },
  // 进度条变化
  progressChange(e) {
    const { progressUnit, filterList } = this.data
    const { todo, type, index, idx } = e.currentTarget.dataset
    if (type === 'add') {
      if (todo.progress >= 100) {
        return false
      } else {
        todo.progress += progressUnit
      }
    }
    if (type === 'reduce') {
      if (todo.progress <= 0) {
        return false
      } else {
        todo.progress -= progressUnit
      }
    }
    todo.done = todo.progress >= 100
    todo.status = this.getStaus(todo.progress)
    if (index === undefined) {
      this.setData({
        todo
      })
    } else {
      api.update(todo._id, {
        progress: todo.progress,
        done: todo.done
      }, () => {
        filterList[idx].list[index] = todo
        this.setData({
          filterList
        })
      })
    }
  },
  getStaus(progress) {
    let status = 'wrong'
    if (progress > 50 && progress < 99) {
      status = 'normal'
    }
    if (progress === 100) {
      status = 'success'
    }
    return status
  },
  // 查询列表
  sreachList() {
    api.sreach({
      "_openid": "owedY5Jm_lJkt0s64NarrATdmJ0g"
    }, (res) => {
      res.forEach(item => {
        item.endTime = util.formatTime(item.endTime, 'yyyy-MM-dd HH:mm')
        item.date = item.endTime.split(' ')[0]
        item.isOver = new Date().getTime() > new Date(item.endTime).getTime()
        item.status = this.getStaus(item.progress)
      })
      const filterList = this.filterList(res)
      this.setData({
        todoList: res,
        filterList,
        showConfirmDelete: false
      })
    })
  },
  filterList(list) {
    const filterList = [];
    list.forEach(item => {
      const date = item.date
      let isHas = false
      filterList.forEach(element => {
        if (element.date === date) {
          element.list.push(item)
          isHas = true
        }
      });
      if (!isHas) {
        var obj = {
          date: date,
          list: []
        }
        obj.list.push(item)
        filterList.push(obj)
      }
    })
    return filterList
  },
  // 删除
  deleteTodo(e) {
    const db = wx.cloud.database()
    const { deleteTodoId, filterList, deleteTodoIdx, deleteTodoIndex } = this.data
    if (deleteTodoId === -1) {
      return false
    }
    api.deleteTodo(deleteTodoId, () => {
      $Message({
        content: '删除事件成功!'
      })
      filterList[deleteTodoIdx].list.splice(deleteTodoIndex, 1)
      // 如果删除本日期最后一个
      if (filterList[deleteTodoIdx].list.length === 0) {
        filterList.splice(deleteTodoIdx, 1)
      }
      this.setData({
        filterList,
        showConfirmDelete: false
      })
    }, (err) => {
      console.log(err)
    })
  },
  // 删除提示
  changeConfirmDelete(e) {
    const showConfirmDelete = !this.data.showConfirmDelete
    let deleteTodoId = -1
    let deleteTodoIndex = -1
    let deleteTodoIdx = -1
    if (showConfirmDelete) {
      const { id, index, idx } = e.currentTarget.dataset
      deleteTodoId = id
      deleteTodoIndex = index
      deleteTodoIdx = idx
    }
    this.setData({
      showConfirmDelete,
      deleteTodoId,
      deleteTodoIndex,
      deleteTodoIdx
    })
  },
  onPageScroll(event) {
    this.setData({
      scrollTop: event.scrollTop
    })
  }
})