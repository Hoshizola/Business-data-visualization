import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/font/iconfont.css'
import './assets/css/global.less'
import SocketService from '@/utils/socket_service'

// 连接服务器
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance
//  请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
//  将axios挂载到Vue原型上
//  其他组件 this.$http
Vue.prototype.$http = axios

Vue.config.productionTip = false

//  将全局的echarts对象挂载到Vue的原型对象上
//  其他组件 this.$echarts
Vue.prototype.$echarts = window.echarts

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
