/**
 * 底部导航的 UI 组件
 */

import React, {Component} from 'react'
import {TabBar} from 'antd-mobile'
import {withRouter} from 'react-router-dom'

// 对父组件传来的props进行检查
import PropTypes from 'prop-types'

const Item = TabBar.Item

class NavFooter extends Component {

    static propTypes = {
        // isRequired 设置属性为必须传递的值
        navList: PropTypes.array.isRequired,
        unReadCount: PropTypes.number.isRequired
    }
    render() {
        let {navList, unReadCount} = this.props
        // 过滤 hide 为 true 的数组项
        navList = navList.filter(nav => !nav.hide)

        // 必须是路由组件下才有 this.props.location.pathname
        const path = this.props.location.pathname  // 请求的 path
        return (
            <TabBar>
                {
                    navList.map((nav) => (
                        <Item key={nav.path}
                            title={nav.text}
                            badge={nav.path === '/message' ? unReadCount : 0}
                            icon={{uri: require(`./images/${nav.icon}.png`)}}
                            selectedIcon={{uri: require(`./images/${nav.icon}-selected.png`)}}
                            selected={path===nav.path}
                            // 跳转路由
                            onPress={() => { this.props.history.replace(nav.path) }}
                        ></Item>
                    ))
                }
            </TabBar>
        )
    }
}

// 让非路由组件可以访问到路由组件的 API 
// 向外暴露 withRouter() 包装产生的组件 
// 内部会向组件中传入一些路由组件特有的属性：history/location/math
export default withRouter(NavFooter) 
