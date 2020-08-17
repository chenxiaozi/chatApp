var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')

const {UserModel, ChatModel} = require('../db/models')

const filter = {password: 0, __v: 0}   // 指定过滤的属性

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 注册一个路由：用户注册
/**
 * a) path 为: /register 
 * b) 请求方式为: POST 
 * c) 接收 username 和 password 参数 
 * d) admin 是已注册用户 
 * e) 注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’} 
 * f) 注册失败返回: {code: 1, msg: '此用户已存在'}
 */

/**
 * 1、获取请求参数
 * 2、处理
 * 3、返回响应数据
 */

// router.post('/register', function (req, res, next) { 
//   // 1、获取请求参数
//   const {username, password} = req.body 
//   console.log('register', username, password) 
//   // 2、处理
//   if (username === 'admin') { // 注册会失败
//     // 返回相应数据（失败）
//     res.send({code: 1, msg: '此用户已存在'}) 
//   } else { // 注册会成功
//     // 返回相应数据（成功）
//     res.send({code: 0, data: {_id: 'abc123', username, password}}) 
//   } 
// })


// 注册的路由
router.post('/register', function (req, res) {
  // 读取请求参数
  const {username, password, type} = req.body
  // 处理   判断用户是否已经存在  如果存在，返回提示错误信息，如果不存在，保存
    //  查询(根据 username )
    UserModel.findOne({username}, function (err, user) {
      // 如果 user 有值（已存在）
      if (user) {
        // 返回提示错误信息
        res.send({code: 1, msg: '此用户已存在'})
      } else {  // 没有值（不存在）
        // 保存 user
        new UserModel({username, password:md5(password), type}).save(function (error, user) {
          // 返回包含 user 的 Json 数据  
          // 响应数据中不要存在密码 所以封装一个数据
          // const data = {username,  type, _id: user._id}
          // res.send({code: 0, data: user})

          // 生成一个 cookie(userid: user._id), 并交给浏览器保存

          // 持久化 cookie, 浏 览器会保存在本地文件 实现免登陆
          res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})

          // 保存成功, 返回成功的响应数据: user
          // 返回的数据中不要 携带 pwd
          res.send({code: 0, data: {_id: user._id, username, type}})
        })
      }
    })
})
// 登陆的路由
router.post('/login', function (req, res) {
  const {username, password} = req.body
  // 根据 username 和 passworld 查询数据库 users，如果没有返回提示错误信息，如果有，返回登陆成功的信息（包含 user）
  UserModel.findOne({username, password: md5(password)}, filter, function (err, user) {
    if (user) {   // 登陆成功
      // 生成一个 cookie(userid: user._id), 并交给浏览器保存
      // 持久化 cookie, 浏 览器会保存在本地文件 实现免登陆
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
      // 返回登陆成功的信息（包含 user）
      res.send({code: 0, data: user})
    } else {
      // 登陆失败
      res.send({code: 0, msg: '用户名或密码不正确'})
    }
  })
})

// 更新用户信息的路由
router.post('/update', function (req, res) {
  // 从请求的 cookie 中得到 userid
  const userid = req.cookies.userid
  // cookie 有可能被删除，如果不存在，直接返回一个提示信息的结果
  if(!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }
  // 存在，根据 userid 更新对应的 user 文档数据
  // 得到提交的用户数据
  const user = req.body  // 没有 _id
  UserModel.findByIdAndUpdate({_id: userid}, user, function (error, oldUser) {
    if (!oldUser) {
      // 通知浏览器删除 userid cookie
      res.clearCookie('userid')
      // 返回一个提示信息
      res.send({code: 1, msg: '请先登陆'})
    } else {
      // 准备一个返回的 user 数据对象
      const {_id, username,type} = oldUser
      const data = Object.assign(user, {_id, username,type})
      // 返回
      res.send({code: 0, data})
    }
  })
})

// 获取用户信息的路由（根据 cookie 中的 userid
router.get('/user', function(req, res) {
  // 从请求的 cookie 中得到 userid
  const userid = req.cookies.userid
  // cookie 有可能被删除，如果不存在，直接返回一个提示信息的结果
  if(!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }
  // 根据 userid 查询对应的 user
  UserModel.findOne({_id: userid}, filter, function (error,user) {
    res.send({code: 0, data: user})
  })
})

// 获取用户列表（根据类型）
router.get('/userlist', function(req, res) {
  const {type} = req.query
  UserModel.find({type}, filter, function (err, users){
    res.send({code: 0, data: users})
  })
})

// 获取当前用户所有相关聊天信息列表
router.get('/msglist', function (req, res) {
  // 获取 cookie 中的 userid 
  const userid = req.cookies.userid

  // 查询得到所有 user 文档数组 
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象 
    const users = {} // 对象容器
    userDocs.forEach(doc => { 
      users[doc._id] = {username: doc.username, header: doc.header} 
    })

    /**
     * 查询 userid 相关的所有聊天信息 
     *    参数 1: 查询条件 
     *    参数 2: 过滤条件 
     *    参数 3: 回调函数
     */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs){
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据 
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})

// 修改指定消息为已读
router.post('/readmsg', function (req, res) {
  // 得到请求中的 from 和 to 
  // 我只能改对方发过来的数据
  const from = req.body.from 
  const to = req.cookies.userid

  /**
   * 更新数据库中的 chat 数据 
   *    参数 1: 查询条件 
   *    参数 2: 更新为指定的数据对象 
   *    参数 3: 是否 1 次更新多条, 默认只更新一条 
   *    参数 4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc) 
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
})

module.exports = router;
