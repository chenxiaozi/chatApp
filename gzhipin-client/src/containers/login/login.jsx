/**
 * 登陆路由组件
 */

import React from 'react'
import { 
    NavBar, 
    WingBlank, 
    List, 
    InputItem,  
    WhiteSpace,
    Button
} from 'antd-mobile'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'

import {login} from '../../redux/actions'
import Logo from '../../components/logo/logo'

class Login extends React.Component {
    constructor (props) {
        super (props)
        this.state = { 
            username: '', 
            password: ''
        }
    }

    login = () => {
        // console.log(this.state)
        this.props.login(this.state)
    }

    toRegister = () => {
        this.props.history.replace('/register')
    }

    // 处理输入数据的改变，更新对应的状态
    handleChange = (name, val) => {
        // 更新状态
        this.setState({
            [name]: val
        })
    }

    render () {
        const {msg, redirectTo} = this.props.user
        // 如果 redirectTo 有值，就需要重定向到指定的路由
        if(redirectTo) {
            return <Redirect to={redirectTo}/>
        }
        return (
            <div>
                <NavBar>极&nbsp;速&nbsp;应&nbsp;聘</NavBar>
                <Logo />
                <WingBlank>
                    <List>
                        {msg?<div className='error-msg'>{msg}</div>:null}
                        <WhiteSpace/>
                        <InputItem
                        placeholder='输入用户名'
                        onChange={val => {this.handleChange('username', val)}}
                        >
                            用户名：
                        </InputItem>
                        <WhiteSpace/>

                        <InputItem 
                        type='password'
                        placeholder='输入密码'
                        onChange={val => {this.handleChange('password', val)}}
                        >
                            密&nbsp;&nbsp;&nbsp;码：
                        </InputItem>
                        <WhiteSpace/>

                        <Button type='primary' onClick={this.login}>登&nbsp;&nbsp;&nbsp;录 </Button>
                        <WhiteSpace/>

                        <Button onClick={this.toRegister}>还没有账号</Button>
                        <WhiteSpace/>
                    </List>
                </WingBlank>
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user}),
    {login}
)(Login)