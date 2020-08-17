/**
 * 使用 axios 封装的 ajax 请求函数 
 * 能发送 ajax 请求的函数模块
 * 函数返回的是 promise 对象
 */

import axios from 'axios'

export default function ajax(url, data={}, type='GET') {
    if(type === 'GET') {
        // 拼请求参数的串
        // {username: 'TOM', password: '123'}
        // paramStr: username=tom&password=123
        let paramStr = ''
        Object.keys(data).forEach(key => {
            paramStr += key + '=' + data[key] + '&'
        })
        if(paramStr) {
            paramStr = paramStr.substring(0, paramStr.length-1)
        }
        // 使用 axios 发 get 请求
        return axios.get(url + '?' + paramStr)
    } else {
        // 发送 POST 请求
        return axios.post(url, data)  // data: 包含请求体数据的对象
    }
    
}
