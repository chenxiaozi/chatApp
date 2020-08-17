/**
 * 包含 n 个 reducer 函数：根据老的 state 和指定的 action 返回一个新的 state 
 */


import { combineReducers } from 'redux'
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

import {getRedirectTo} from '../utils/index'


const initUser = {
    username: '',  // 用户名
    type: '',  // 用户类型   dashen/laoban
    msg: '',  // 错误提示信息
    redirectTo: ''  // 指定需要重定向的路由路径
}
// 产生 user 状态的 reducer
function user ( state=initUser, action ) {
    switch(action.type) {
        case AUTH_SUCCESS:  // data 是 user
            const {type, header} = action.data
            return {...action.data, redirectTo: getRedirectTo(type, header)}
        case ERROR_MSG:  // data 是 msg
            return {...state, msg: action.data}
        case RECEIVE_USER:  // data 是 user
            return action.data
        case RESET_USER:  // data 是 msg
            return {...initUser, msg: action.data}
        default: 
            return state
    }
}

const initUserList = []
// 产生 userlist 状态的 reducer
function userList (state=initUserList, action) {
    switch (action.type) {
        case RECEIVE_USER_LIST:  // data 为 userlist
            return action.data
        default:
            return state
    }
}

const initChat = {
    users: {},  // 所有用户信息的对象   属性名是 userid   属性值是：{username, header}
    chatMsgs: [],   // 当前用户所有相关 msg 的数组
    unReadCount: 0  // 总的未读数量
}

// 产生聊天状态的 reducer
function chat (state=initChat, action) {
    switch (action.type) {
        case RECEIVE_MSG_LIST:   // data: {users, chatMsgs}
            const {users, chatMsgs, userid} = action.data
            return {
                users,
                chatMsgs,
                unReadCount: chatMsgs.reduce((preTotal, msg) => preTotal + (!msg.read && msg.to === userid ? 1 : 0), 0)
            }
        case RECEIVE_MSG:  // data：chatMsg
            const {chatMsg} = action.data
            return {
                users: state.users,
                chatMsgs: [...state.chatMsgs, chatMsg],
                unReadCount: state.unReadCount + (!chatMsg.read && chatMsg.to === action.data.userid ? 1 : 0)
            }
        case MSG_READ:
            const {from, to, count} = action.data
            state.chatMsgs.forEach(msg => {
                if(msg.from===from && msg.to===to && !msg.read) {
                  msg.read = true
                }
            })
            return {
                users: state.users,
                chatMsgs: state.chatMsgs.map(msg => {
                    if(msg.from===from && msg.to===to && !msg.read) {  // 需要更新
                        // msg.read = true   // 不能直接修改状态
                        return {...msg, read: true}
                    } else { // 不需要更新
                        return msg
                    }
                }),
                unReadCount: state.unReadCount - count
            }
        default:
            return state
    }
}

export default combineReducers ({
    user,
    userList,
    chat
})
// 向外暴露的状态结构：{user: {}, userList: [], chat: {}}

