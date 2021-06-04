const WebSocket = require('ws')
const path =  require('path')
const fileUtils = require('../utils/file_utils.js')

const wss = new WebSocket.Server({
  port: 9998
})
// 服务端开启监听
module.exports.listen = () => {
  // 监听客户端连接
  wss.on('connection', client => {
    console.log('一个客户端连接成功...')
    // 监听客户端发送的数据
    client.on('message', async msg => {
      console.log('from client: ' + msg)
      let payload = JSON.parse(msg)
      const action = payload.action
      if(action === 'getData'){
        let filePath = '../data/' + payload.chartName + '.json'
        filePath = path.join(__dirname, filePath)
        const result = await fileUtils.getFileJsonData(filePath)
        // 在服务器获取的数据的基础上增加data字段，data对应的值是请求的某个json文件的内容
        payload.data = result
        client.send(JSON.stringify(payload))
      } else {
        // 原封不动的将接收到的数据转发给所有连接的客户端
        // wss.clients 所有客户端连接
        wss.clients.forEach(client => {
          client.send(msg)
        })
      }
      // 给客户端发送数据
      // client.send('hello client')
    })
  })
}
