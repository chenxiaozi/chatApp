/**
 * 注册路由组件
 */

import React from 'react'
import { 
    NavBar, 
    WingBlank, 
    List, 
    InputItem,  
    WhiteSpace,
    Radio,
    Button
} from 'antd-mobile'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'

import {register} from '../../redux/actions'
import Logo from '../../components/logo/logo'


class Register extends React.Component {
    constructor (props) {
        super (props)
        this.state = { 
            username: '', 
            password: '', 
            password2: '', 
            type: 'dashen' 
        }
    }

    // 点击注册调用
    register = () => {
        // console.log(JSON.stringify(this.state))
        this.props.register(this.state)
    }

    toLogin = () => {
        this.props.history.replace('/login')
    }

    // 处理输入数据的改变，更新对应的状态
    handleChange = (name, val) => {
        // 更新状态
        this.setState({
            [name]: val
        })
    }
    render () {
        // 解构赋值
        const {type} = this.state
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

                        <InputItem 
                        type='password' 
                        placeholder='输入确认密码'
                        onChange={val => {this.handleChange('password2', val)}}
                        >
                            确认密码：
                        </InputItem>
                        <WhiteSpace/>

                        {/* List.item 是为了让里面的东西放在同一行 */}
                        <List.Item>
                            <span style={{marginRight: 30}}>用户类型:</span>
                            <Radio 
                            className="my-radio"
                            onChange={() => this.handleChange('type', 'dashen')}
                            checked={type==='dashen'}
                            >
                                应聘者
                            </Radio>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Radio 
                            className="my-radio"
                            onChange={() => this.handleChange('type', 'laoban')}
                            checked={type==='laoban'}
                            >
                                老板
                            </Radio>
                        </List.Item>
                        <WhiteSpace/>

                        <Button type='primary' onClick={this.register}>注&nbsp;&nbsp;&nbsp;册 </Button>
                        <WhiteSpace/>

                        <Button onClick={this.toLogin}>已经有账号</Button>
                        <WhiteSpace/>
                    </List>
                </WingBlank>
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user}),
    {register}
)(Register)
