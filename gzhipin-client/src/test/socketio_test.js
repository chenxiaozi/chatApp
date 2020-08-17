import io from 'socket.io-client'

// 连接服务器 io 是一个函数  （得到与服务器的连接对象）
// ws 协议名称
const socket = io('ws://localhost:4000')

// 发送消息
socket.emit('sendMsg', {name: 'abc'})
console.log('客户端向服务器发消息',{name: 'abc'})

// 绑定监听，接收服务器发送的消息
socket.on('receiveMsg', function (data) {
    console.log('客户端接收到服务器发送的消息', data)
})
