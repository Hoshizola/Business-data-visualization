<!-- 商家销售额的横向柱状图 -->
<template>
  <div class="com-container">
      <div class="com-chart" ref="seller_ref">seller</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, //  服务器返回的数据
      currentPage: 1, //  当前页数
      totalPage: 0, //  总页数
      timeId: null
    }
  },
  created () {
    // 回调函数的注册
    this.$socket.registerCallback('sellerData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 向服务端请求数据
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData', // 回调函数唯一标识
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    clearInterval(this.timeId)
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallback('sellerData')
  },
  methods: {
    //  初始化`echartsInstance`对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      //  对图表初始化配置
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 20,
          top: 10
        },
        grid: {
          top: '15%',
          left: '5%',
          right: '6%',
          bottom: '6%',
          containtLabel: true // 坐标轴的距离包含文字在内
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 指明颜色渐变的方向  从左到右
              // 指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // { offset: 0, color: '#5052EE' },
                // { offset: 1, color: '#AB6EE5' }
                { offset: 0, color: '#E2FAFA' },
                { offset: 1, color: '#106767'}
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      //  对图表进行鼠标事件的监听，鼠标移入，停止定时器
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      //  鼠标移出，开启定时器
      this.startInterval()
    },
    //  获取服务器数据
    getData (result) {
      //  http://127.0.0.1:8888/api
      // const { data: result } = await this.$http.get('seller')
      //  console.log(result)
      this.allData = result
      //  对数据排序
      this.allData.sort((a, b) => {
        return a.value - b.value
      })
      //  每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      this.startInterval()
    },
    //  设置option
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map(item => item.name)
      const sellerValues = showData.map(item => item.value)
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval () {
      //  启动定时器之前要确保取消之前的定时器
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生变化时调用
    screenAdapter () {
    //   console.log(this.$refs.seller_ref.offsetWidth)
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      console.log(titleFontSize)
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      console.log('主题切换了')
      this.chartInstance.dispose() // 销毁当前图表
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  }
}
</script>

<style lang="less">

</style>
