/**
 * 包含 n 个 action creator
 * 异步 action
 * 同步 action
 */

import {
    AUTH_SUCCESS,
    ERROR_MSG,
    RECEIVE_USER,
    RESET_USER,
    RECEIVE_USER_LIST,
    RECEIVE_MSG_LIST,
    RECEIVE_MSG,
    MSG_READ
} from './action-types'
import {
    reqRegister,
    reqLogin,
    reqUpdateUser,
    reqUser,
    reqUserList,
    reqChatMsgList,
    reqReadMsg
} from '../api'

import io from 'socket.io-client'


/**
 * 单例对象
 * 1、创建对象之前：判断对象是否已经创建，只有没有创建才会创建
 * 2、创建对象之后：保存对象
 */

function initIo(dispatch, userid) {
    if(!io.socket) { // 如果 socket 没有创建
        // 连接服务器 io 是一个函数  （得到与服务器的连接对象）
        // ws 协议名称
        const socket = io('ws://localhost:4000')
        // 保存对象
        io.socket = socket
        // 绑定监听，接收服务器发送的消息
        io.socket.on('receiveMsg', function (chatMsg) {
            // console.log('客户端接收到服务器发送的消息', chatMsg)
            // 只有当 chatMsg 是与当前用户相关的消息，才去分发同步 action 保存消息
            if (userid === chatMsg.from || userid === chatMsg.to) {
                dispatch(receiveMsg(chatMsg, userid))
            }
        })
    }  
}

// 读取消息的异步 action
export const readMsg = (from, to) => {
    return async dispatch => {
        const response = await reqReadMsg(from)
        const result = response.data
        if(result.code === 0) {
            const count = result.data
            dispatch(msgRead({count, from, to}))
        }
    }
}

// 异步获取消息列表数据
async function getMsgList(dispatch, userid) {
    initIo(dispatch, userid)
    const response = await reqChatMsgList()
    const result = response.data
    if(result.code === 0) {
        const {users, chatMsgs} = result.data
        // 分发同步 action
        dispatch(receiveMsgList({users, chatMsgs, userid}))
    }
}

// 异步发送消息的 action
export const sendMsg = ({from, to, content}) => {
    return dispatch => {
        console.log('客户端向服务器发送消息', {from, to, content})
        // 这个函数调用多次  不会产生多个 socket
        // initIo()
        // 发消息
        io.socket.emit('sendMsg', {from, to, content})
    }
}

// 授权成功的同步 action
const authSuccess = (user) => ({type: AUTH_SUCCESS, data: user})

// 错误信息提示的同步 action
const errorMsg = (msg) => ({type: ERROR_MSG, data: msg})

// 接收用户的同步 action
const receiveUse = (user) => ({type: RECEIVE_USER, data: user})

// 重置用户的同步 action
export const resetUser = (msg) => ({type: RESET_USER, data: msg})

// 接收用户列表的同步 action
const receiveUserList = (userList) => ({type: RECEIVE_USER_LIST, data: userList})

// 接收消息列表的同步 action
const receiveMsgList = ({users, chatMsgs, userid}) =>({type: RECEIVE_MSG_LIST, data: {users, chatMsgs, userid}})

// 接收一个消息的同步 action
const receiveMsg = (chatMsg, userid) => ({type: RECEIVE_MSG, data: {chatMsg, userid}})

// 读取某个聊天消息的同步 action
const msgRead = ({count, from, to}) => ({type: MSG_READ, data: {count, from, to}})

// 注册异步 action
export const register = (user) => {
    const {username, password, password2, type} = user
    // 做表单的前台验证，如果不通过，分发一个 errorMsg 的同步 action
    if(!username) {
        return errorMsg('用户名不能为空！')
    } else if(password !== password2) {
        return errorMsg('两次密码要一致！')
    }
    // 表单数据合法，返回一个发 ajax 请求的异步 action 函数
    return async dispatch => {
        // 发送注册的异步 ajax 请求
        const response = await reqRegister({username, password, type})
        const result = response.data   // {code: 0/1, data: user, msg: ''}
        if(result.code === 0) {
            getMsgList(dispatch, result.data._id)
            // 成功  分发授权成功的同步 action
            dispatch(authSuccess(result.data))
        } else {
            // 失败  分发错误信息提示的同步 action
            dispatch(errorMsg(result.msg))
        }
    }
}


// 登陆异步 action
export const login = (user) => {
    const {username, password} = user
    // 做表单的前台验证，如果不通过，分发一个 errorMsg 的同步 action
    if(!username) {
        return errorMsg('用户名不能为空！')
    } else if(!password) {
        return errorMsg('密码不能为空！')
    }
    return async dispatch => {
        // 发送注册的异步 ajax 请求
        const response = await reqLogin(user)
        const result = response.data
        if(result.code === 0) {
            getMsgList(dispatch, result.data._id)
            // 成功  分发授权成功的同步 action
            dispatch(authSuccess(result.data))
        } else {
            // 失败  分发错误信息提示的同步 action
            dispatch(errorMsg(result.msg))
        }
    }
}

// 更新用户异步 action
export const updateUser = (user) => {
    return async dispatch => {
        const response = await reqUpdateUser(user)
        const result = response.data
        if(result.code === 0) {
            // 更新成功：data
            dispatch(receiveUse(result.data))
        } else {
            // 更新失败：msg
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户异步 action
export const getUser = () => {
    return async dispatch => {
        // 执行异步 ajax 请求
        const response = await reqUser()
        const result = response.data
        if(result.code === 0) {
            getMsgList(dispatch, result.data._id)
            // 成功获取数据
            dispatch(receiveUse(result.data))
        } else {
            // 失败
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户列表的异步 action
export const getUserList = (type) => {
    return async dispatch => {
        // 执行异步 ajax 请求
        const response = await reqUserList(type)
        const result = response.data
        // 得到结果后，分发一个同步 action
        if(result.code === 0) {
            // 分发同步 action
            dispatch(receiveUserList(result.data))
        }
    }
}

