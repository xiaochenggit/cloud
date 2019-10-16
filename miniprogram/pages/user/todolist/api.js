const db = wx.cloud.database()
const todolist = db.collection('todolist')
const add = (data, successFun, failFun) => {
  todolist.add({
    data,
    success: res => {
      // 在返回结果中会包含新创建的记录的 _id
      successFun(res)
    },
    fail: err => {
      failFun(err)
    }
  })
};
const sreach = (data, successFun, failFun) => {
  todolist.orderBy('endTime', 'asc').get({
    success: function(res) {
      successFun(res.data)
    },
    fail: err => {
      failFun(err)
    }
  })
};
const deleteTodo = (id, successFun, failFun) => {
  todolist.doc(id).remove({
    success: function(res) {
      successFun()
    },
    fail: err => {
      failFun(err)
    }
  })
};
const update = (id, data, successFun, failFun) => {
  todolist.doc(id).update({
    data,
    success: function(res) {
      successFun()
    },
    fail: err => {
      failFun(err)
    }
  })
};
module.exports = {
  add,
  sreach,
  deleteTodo,
  update
}