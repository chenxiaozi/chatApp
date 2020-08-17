// 此组件只是显示登陆界面图片
// 所以不需要数据交互
// 可以使用函数式组件

import React from 'react'
import logo from './logo.png' 
import './logo.css'


export default function Logo() {
    return (
        <div className="logo-container">
            <img src={logo} alt="logo" className='logo-img'/>
        </div>
    )
}