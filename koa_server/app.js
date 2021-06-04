
//服务器入口文件
//1、创建KOA对象
const koa = require('koa')
const app = new koa()
//2、绑定中间件
//绑定第一层中间件
const resDurationMiddleware = require('./middleware/koa_response_duration')
app.use(resDurationMiddleware)
//第二层中间件
const resHeaderMiddleware = require('./middleware/koa_response_header')
app.use(resHeaderMiddleware)
//第三层中间件
const resDataMiddleware = require('./middleware/koa_response_data')
app.use(resDataMiddleware)
//3、监听端口
app.listen(8888, function(){
    console.log('server starting...')
})

const webSocketService = require('./service/websocket-service')
// 开启服务端的监听，监听客户端的连接
webSocketService.listen()
