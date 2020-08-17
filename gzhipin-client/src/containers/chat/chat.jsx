/**
 * 对话聊天的路由组件
 */


import React, {Component} from 'react'
import {connect} from 'react-redux'
import {NavBar, List, InputItem, Grid, Icon} from 'antd-mobile'
import QueueAnim from 'rc-queue-anim'

import {sendMsg, readMsg} from '../../redux/actions'


const Item = List.Item

class Chat extends Component {

    state = { 
        content: '',
        isShow: false   // 是否显示表情列表
    }

    componentDidMount() { 
        // 初始显示列表 
        window.scrollTo(0, document.body.scrollHeight) 

        // 发请求  更新消息的未读状态
        const from = this.props.match.params.userid
        const to = this.props.user._id
        this.props.readMsg(from, to)
    }

    componentDidUpdate () { 
        // 更新显示列表 
        window.scrollTo(0, document.body.scrollHeight) 
    }

    componentWillUnmount () {
        const from = this.props.match.params.userid
        const to = this.props.user._id
        this.props.readMsg(from, to)
    }

    componentWillMount () {
        // 初始化表情列表数据
        const emojis = ['😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', 
            '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '🤐', '😐', '😑', 
            '🤢', '🤓', '🧐', '😱', '😤', '😠', '🤬', '👿', '😫', '💀', '☠', '👹',
            '💋', '👋', '🤚', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟', '🤙', '👈', '👉',
            '🖕', '👍', '👎', '✊', '👊', '🙏', '💪', '🧠', '☂', '👓', '🥽', '🥽', '🥻',
            '🩳', '👙', '👜'
        ]
        this.emojis = emojis.map(emoji => ({text: emoji}))
    }

    // 切换表情列表的显示
    toggleShow = () => {
        const isShow = !this.state.isShow
        this.setState({isShow})
        if(isShow) {
            // 异步手动派发 resize 事件,解决表情列表显示的 bug
            setTimeout(() => { 
                window.dispatchEvent(new Event('resize')) 
            }, 0)
        }
    }

    handleSend = () => {
        // 收集数据
        const from = this.props.user._id
        const to = this.props.match.params.userid
        const content = this.state.content
        // 发送请求（发消息）
        if(content) {
            this.props.sendMsg({from, to, content})
        }
        // 清除输入数据
        this.setState({
            content: '',
            isShow: false
        })
    }

    render () {
        const {user} = this.props 
        const {chatMsgs, users} = this.props.chat 
        // 计算当前聊天的 chatID
        const meId = user._id 

        const targetId = this.props.match.params.userid
        if(!users[targetId]) { // 如果还没有获取到数据  直接不做任何显示
            return null 
        }
        const chatId = [targetId, meId].sort().join('_') 
        // 对 chatMsgs 进行过滤
        const msgs = chatMsgs.filter(msg => msg.chat_id === chatId)

        // 得到目标用户的头像
        const targetHeader = users[targetId].header
        const targetIcon = targetHeader ? require(`../../assets/images/${targetHeader}.png`) : null

        return (
            <div id='chat-page'>
                <NavBar 
                    className='sticky-header'
                    icon={<Icon type='left' />}
                    onLeftClick={() => this.props.history.goBack()}
                >
                    {users[targetId].username}
                </NavBar>
                <List style={{marginTop: 50, marginBottom: 50}}>
                    <QueueAnim type='alpha' delay={100}>
                        {
                            msgs.map(msg => {
                                if(targetId === msg.from) {  // 对方发给我的消息
                                    return (
                                        <Item 
                                            key={msg._id}
                                            thumb={targetIcon} 
                                        >
                                            {msg.content}
                                        </Item>
                                    )
                                } else {  // 我发的消息
                                    return (
                                        <Item 
                                            className='chat-me' 
                                            extra='我' 
                                            key={msg._id}
                                        >
                                            {msg.content}
                                        </Item>
                                    )
                                }
                            })
                        }
                    </QueueAnim>
                    
                </List>
                <div className='am-tab-bar'>
                    <InputItem 
                        onChange={val => this.setState({content: val})}
                        placeholder="请输入" 
                        value={this.state.content}
                        onFocus={() => this.setState({isShow: false})}
                        extra={ 
                            <span>
                                <span 
                                    onClick={this.toggleShow}
                                    style={{marginRight: 5}}
                                >
                                    😀
                                </span>
                                <span onClick={this.handleSend}>发送</span> 
                            </span>
                        } 
                    />
                    {
                        this.state.isShow ? (
                            <Grid 
                                data={this.emojis} 
                                columnNum={8} 
                                carouselMaxRow={4} 
                                isCarousel={true}   // 轮播效果
                                onClick={(item) => { 
                                    this.setState({content: this.state.content + item.text}) 
                                }} 
                            />
                        ) : null
                    }
                    

                </div>
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user, chat: state.chat}),
    {sendMsg, readMsg}
)(Chat)