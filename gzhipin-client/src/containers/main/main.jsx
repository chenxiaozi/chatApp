/**
 * 主路由组件
 */

import React from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {connect} from 'react-redux'
import Cookies from 'js-cookie'   // 可以操作前端 cookie 的对象 set()/get()/remove()
import {NavBar} from 'antd-mobile'

import LaobanInfo from '../laoban-info/laoban-info'
import DashenInfo from '../dashen-info/dashen-info'
import Dashen from '../dashen/dashen'
import Laoban from '../laoban/laoban'
import Message from '../message/message'
import Personal from '../personal/personal'
import NavFooter from '../../components/nav-footer/nav-footer'
import Chat from "../chat/chat"


import { getRedirectTo } from '../../utils'
import {getUser} from '../../redux/actions'
import NotFound from '../../components/not-found/not-found'

class Main extends React.Component {

    // 给组件对象添加属性 
    navList = [ // 包含所有导航组件的相关信息数据
        { 
            path: '/laoban', // 路由路径 
            component: Laoban, 
            title: '大神列表', 
            icon: 'dashen', 
            text: '大神', 
        },
        { 
            path: '/dashen', // 路由路径 
            component: Dashen, 
            title: '老板列表', 
            icon: 'laoban', 
            text: '老板', 
        },
        { 
            path: '/message', // 路由路径 
            component: Message, 
            title: '消息列表', 
            icon: 'message', 
            text: '消息',
        },
        { 
            path: '/personal', // 路由路径 
            component: Personal, 
            title: '用户中心', 
            icon: 'personal', 
            text: '个人', 
        } 
    ]


    componentDidMount () {
        // 登陆过（cookie 中有 userid），但还没有登录（redux 管理的 user 中没有 _id）,发送请求获取对应的 user
        const userid = Cookies.get('userid')
        const {_id} = this.props.user
        if(userid && !_id) {
            // 发送异步请求，获取 user
            // console.log('发送 ajax 请求，获取 user')
            this.props.getUser()
        }
    }

    render () {
        // 读取 cookie 中的 userid
        const userid = Cookies.get('userid')
        // 如果没有，自动重定向到登录界面
        if(!userid) {
            return <Redirect to='/login' />
        }
        // 如果有,读取 redux 中的 user 状态
        const {user, unReadCount} = this.props
        // 如果 user 没有 _id，返回 null （不做任何显示）
        if(!user._id) {
            return null
        } else {
            // 如果有 _id，显示对应的界面
            // 如果请求根路径，根据 user 的 type 和 header 来计算出一个重定向的路径，并自动重定向
            let path = this.props.location.pathname
            if(path === '/') {
                // 得到一个重定向的路由路径
                path = getRedirectTo(user.type, user.header)
                return <Redirect to={path} />
            }
        }

        const {navList} = this
        const path = this.props.location.pathname
        const currentNav = navList.find(nav => nav.path === path)  // 得到当前 nav 可能没有
        if(currentNav) {
            // 根据用户类型 决定哪个路由需要隐藏
            if(user.type === 'laoban') {
                // 隐藏数组的第二个
                navList[1].hide = true
            } else {
                // 隐藏数组的第一个
                navList[0].hide = true
            }
        }

        return (
            <div>
                {currentNav ? <NavBar className='sticky-header'>{currentNav.title}</NavBar> : null}
                <Switch>
                    {
                        navList.map(nav => <Route path={nav.path} component={nav.component} key={nav.path}/>)
                    }
                    <Route path='/laobaninfo' component={LaobanInfo}/>
                    <Route path='/dasheninfo' component={DashenInfo}/>
                    <Route path='/chat/:userid' component={Chat}/>
                    <Route component={NotFound} />
                </Switch>
                {currentNav ? <NavFooter navList={navList} unReadCount={unReadCount} /> : null}
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user, unReadCount: state.chat.unReadCount}),
    {getUser}
)(Main)

/**
 * 1、实现自动登录
 *    1.1 componentDidMount()
 *        登陆过（cookie 中有 userid），但还没有登录（redux 管理的 user 中没有 _id）,发送请求获取对应的 user
 *    1.2 render()
 *        如果 cookie 中没有 userid，自动进入 login 界面
 *        判断 redux 管理的 user 中是否有 _id，如果没有，暂时不做任何显示
 *        如果有，说明已经登录，显示对应的界面
 *        当请求根路径，根据 user 的 type 和 header 来计算出一个重定向的路径，并自动重定向
 */