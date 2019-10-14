const db = wx.cloud.database()
const add = (data, successFun, failFun) => {
  db.collection('todolist').add({
    data,
    success: res => {
      // 在返回结果中会包含新创建的记录的 _id
      successFun(res)
    },
    fail: err => {
      failFun(err)
    }
  })
}
module.exports = {
  add
}