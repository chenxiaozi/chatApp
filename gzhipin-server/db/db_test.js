/**
 * 测试使用 mongoose 操作 mongodb 数据库
 * 1. 连接数据库 
 *   1.1. 引入 mongoose 
 *   1.2. 连接指定数据库(URL 只有数据库是变化的) 
 *   1.3. 获取连接对象 
 *   1.4. 绑定连接完成的监听(用来提示连接成功) 
 * 2. 得到对应特定集合的 Model 
 *   2.1. 字义 Schema(描述文档结构) 
 *   2.2. 定义 Model(与集合对应, 可以操作集合) 
 * 3. 通过 Model 或其实例对集合数据进行 CRUD 操作 
 *   3.1. 通过 Model 实例的 save()添加数据 
 *   3.2. 通过 Model 的 find()/findOne()查询多个或一个数据 
 *   3.3. 通过 Model 的 findByIdAndUpdate()更新某个数据 
 *   3.4. 通过 Model 的 remove()删除匹配的数据
 */

//  密码加密函数
const md5 = require('blueimp-md5')

/* 1. 连接数据库 */
//    1.1. 引入 mongoose
const mongoose = require('mongoose')
//    1.2. 连接指定数据库  gzhipin_test2 数据库名称
mongoose.connect('mongodb://localhost:27017/gzhipin_test2')
//    1.3. 获取连接对象
const conn = mongoose.connection
//    1.4. 绑定连接完成的监听
conn.on('connected', function () {   // 连接成功回调
    console.log('数据库连接成功') 
})


/* 2. 定义出对应特定集合的 Model 并向外暴露 */
//    2.1. 字义 Schema(描述文档结构)
const userSchema = mongoose.Schema({
    username: {type: String, required: true}, // 用户名
    password: {type: String, required: true}, // 密码
    type: {type: String, required: true}, // 用户类型: examinee/boss
    // header: {type: String}, // 头像名称
    // post: {type: String}, // 职位
    // info: {type: String}, // 个人或职位简介
    // company: {type: String}, // 公司名称
    // salary: {type: String} // 工资
})
//    2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('user', userSchema)   // 集合的名称为 users


/* 3. 通过 Model 或其实例对集合数据进行 CRUD 操作 */
//   3.1. 通过 Model 实例的 save()添加数据 
function testsave () {
    // 创建 UserModel 的实例
    const userModel = new UserModel({username: 'Bob', password: md5('234'), type:'boss'})
    // 调用 save() 保存
    userModel.save(function(error, userDoc) {
        console.log('save()', error, userDoc)
    })
}
// testsave()
//   3.2. 通过 Model 的 find()/findOne()查询多个或一个数据 
function testFind () {
    // 查询多个
    UserModel.find(function (error, users) {
        // 得到的是包含所有匹配文档对象的数组，如果没有匹配的就是 空数组 []
        console.log('find()', error, users)
    })
    // 查询一个
    UserModel.findOne({_id:'5f2a719f3aa7d33a60b7b219'}, function (error, user) {
        // 得到的是匹配的文档对象，如果没有匹配的就是 null
        console.log('findOne()', error, user)
    })
}
// testFind()
//   3.3. 通过 Model 的 findByIdAndUpdate()更新某个数据 
function testUpdate () {
    UserModel.findByIdAndUpdate({_id:'5f2a719f3aa7d33a60b7b219'}, 
    {username:'Jack'}, 
    function (error, oldUser) {
        console.log('findByIdAndUpdate()', error, oldUser)
    })
}
// testUpdate()
//   3.4. 通过 Model 的 remove()删除匹配的数据
function testDelete () {
    UserModel.remove({_id:'5f2a719f3aa7d33a60b7b219'}, function (error, doc) {
        console.log('remove()', error, doc)
        // n 删除数量   ok 删除是否成功  此处为成功
        // remove() null { n: 1, ok: 1, deletedCount: 1 }
    })
}
testDelete()




//    2.3. 向外暴露 Model 
// exports.UserModel = UserModel
