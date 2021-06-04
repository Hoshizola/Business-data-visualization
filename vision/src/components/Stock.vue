<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
      timeId: null,
      titleFontSize: 0,
      innerRadius: 100,
      outterRadius: 110
    }
  },
  created () {
    // 回调函数的注册
    this.$socket.registerCallback('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 向服务端请求数据
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData', // 回调函数唯一标识
      chartName: 'stock',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
    this.$socket.unRegisterCallback('stockData')
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      const initOption = {
        title: {
          text: '▎商品销量',
          left: 20,
          top: 20
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    getData (result) {
      // await this.$http.get()
      // const { data: result } = await this.$http.get('stock')
      // 给allData赋值
      this.allData = result
      this.updateChart()
      this.startInterval()
    },
    updateChart () {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = start + 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入时的动画效果
          labelLine: {
            show: false // 隐藏指示线
          },
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  { offset: 0, color: colorArr[index][0] },
                  { offset: 1, color: colorArr[index][1] }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      this.titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      this.innerRadius = this.titleFontSize * 2.8
      this.outterRadius = this.innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              fontSize: this.titleFontSize / 2
            },
            radius: [this.outterRadius, this.innerRadius]
          },
          {
            type: 'pie',
            label: {
              fontSize: this.titleFontSize / 2
            },
            radius: [this.outterRadius, this.innerRadius]
          },
          {
            type: 'pie',
            label: {
              fontSize: this.titleFontSize / 2
            },
            radius: [this.outterRadius, this.innerRadius]
          },
          {
            type: 'pie',
            label: {
              fontSize: this.titleFontSize / 2
            },
            radius: [this.outterRadius, this.innerRadius]
          },
          {
            type: 'pie',
            label: {
              fontSize: this.titleFontSize / 2
            },
            radius: [this.outterRadius, this.innerRadius]
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 切换动画
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex === this.allData.length / 5) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 3000)
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
