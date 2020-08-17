/**
 * 消息主界面路由容器组件
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {List, Badge} from 'antd-mobile'
import QueueAnim from 'rc-queue-anim'

const Item = List.Item 
const Brief = Item.Brief

/**对 chatMsg 按 chat_id 进行分组,并得到每个组的 lastMsg 组成的数组
 * 1、找到每个聊天的 lastMsg ，并用一个对象容器来保存  {chat_id, lastMsg}
 * 2、得到所有 lastMsg 的数组
 * 3、对数组进行排序（按 create_time 降序）
 */
function getLastMsgs (chatMsgs, userid) {
    // 1、找到每个聊天的 lastMsg ，并用一个对象容器来保存  {chat_id, lastMsg}
    const lastMsgObjs = {}
    chatMsgs.forEach(msg => {
        // 对 msg 进行个体的统计
        if (msg.to === userid && !msg.read) {
            msg.unReadCount = 1
        } else {
            msg.unReadCount = 0
        }
        
        // 得到 msg 的聊天标识 id
        const chatId = msg.chat_id
        // 获取已保存的当前组件的 lastMsg
        let lastMsg = lastMsgObjs[chatId]
       
        if (!lastMsg) {    // 没有
            // 当前 msg 就是所在组的 lastMsg
            lastMsgObjs[chatId] = msg
        } else {   // 有
            // 累加 unReadCount = 已经统计的 + 当前 msg 的
            const unReadCount = lastMsg.unReadCount + msg.unReadCount
            // 如果 msg 比 lastMsg 晚，就将 msg 保存为 lastMsg
            if(msg.create_time > lastMsg.create_time) {
                lastMsgObjs[chatId] = msg
            }
            // 将 unReadCount 保存在最新的 lastMsg 上
            lastMsgObjs[chatId].unReadCount = unReadCount
        }
    })

    // 2、得到所有 lastMsg 的数组
    const lastMsgs = Object.values(lastMsgObjs)

    // 3、对数组进行排序（按 create_time 降序）
    lastMsgs.sort(function(m1, m2) {
        return m2.create_time - m1.create_time
    })
    return lastMsgs
}

class Message extends Component {
    render() {
        const {user} = this.props
        const {users, chatMsgs} = this.props.chat

        // 对 chatMsg 按 chat_id 进行分组
        const lastMsgs = getLastMsgs (chatMsgs, user._id)
        return (
            <List style={{marginTop: 50, marginBottom: 50}}>
                <QueueAnim type='alpha'>
                    {
                        lastMsgs.map(msg => {
                            // 得到目标用户的 id
                            const targetUserId = msg.to === user._id ? msg.from : msg.to
                            // 得到目标用户的信息
                            const targetUser = users[targetUserId]
                            return (
                                <Item 
                                    key={msg._id}
                                    extra={<Badge text={msg.unReadCount}/>} 
                                    thumb={targetUser.header ? require(`../../assets/images/${targetUser.header}.png`): null} 
                                    arrow='horizontal' 
                                    onClick={() => this.props.history.push(`/chat/${targetUserId}`)}
                                >
                                    {msg.content}
                                    <Brief>{targetUser.username}</Brief>
                                </Item>
                            )
                        })
                    }
                </QueueAnim>
                
            </List>
        )
    }
}

export default connect(
    state => ({user: state.user, chat: state.chat}),
    {}
)(Message)