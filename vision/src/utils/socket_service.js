export default class SocketService {
  /**
   * 单例模式
   */
  static instance = null
  static get Instance () {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null

  // 存储回调函数
  callbackMapping = {}

  // 标识是否连接成功
  connected = false

  // 记录重新请求连接的次数，连接次数越多，请求连接延时越长
  sendRetryCount = 0

  // 重连次数
  connectRetryCount = 0

  // 定义连接服务器的方法
  connect () {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')

    // 事件监听
    this.ws.onopen = () => {
      this.connectRetryCount = 0
      console.log('连接服务器成功...')
      this.connected = true
    }
    // onclose方法执行有两种情况，连接失败和关闭连接，若连接失败，则重连
    this.ws.onclose = () => {
      console.log('连接失败...')
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, this.connectRetryCount * 500)
    }
    this.ws.onmessage = msg => {
      console.log('从服务端获取到数据')
      const receiveData = JSON.parse(msg.data)
      const socketType = receiveData.socketType
      // 判断回调函数是否存在
      if (this.callbackMapping[socketType]) {
        const action = receiveData.action
        if (action === 'getData') {
          const realData = JSON.parse(receiveData.data)
          this.callbackMapping[socketType].call(this, realData)
          // console.log('socket this:' + this)
          // console.log(Object.keys(this))
        } else if (action === 'fullScreen') {
          this.callbackMapping[socketType].call(this, receiveData)
        } else if (action === 'themeChange') {
          this.callbackMapping[socketType].call(this, receiveData)
        }
      }
    }
  }

  // 回调函数的注册，实际上就是把callback函数存储起来
  registerCallback (socketType, callback) {
    this.callbackMapping[socketType] = callback
  }

  // 取消某个回调函数
  unRegisterCallback (socketType) {
    this.callbackMapping[socketType] = null
  }

  // 发送数据的方法
  send (data) {
    // 判断有没有连接成功
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 300)
    }
  }
}
