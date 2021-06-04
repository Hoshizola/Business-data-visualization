<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      startValue: 0, // 区域缩放起点值
      endValue: 9, // 区域缩放的终点值
      timeId: null
    }
  },
  created () {
    // 回调函数的注册
    this.$socket.registerCallback('rankData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 向服务端请求数据
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData', // 回调函数唯一标识
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
    this.$socket.unRegisterCallback('mapData')
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      const initOption = {
        title: {
          text: '▎地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
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
      // const { data: rankresult } = await this.$http.get('rank')
      this.allData = result
      // 从大到小排序
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.startInterval()
    },
    updateChart () {
      // 拿到数据，处理数据
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        // ['#5052EE', '#AB6EE5']
        ['#EE3D11', '#FFFFBB']
      ]
      // 所有省份名
      const provinceArr = this.allData.map(item => {
        return item.name
      })
      // 所有省份的销售额
      const valueArr = this.allData.map(item => item.value)
      const dataOption = {
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        xAxis: {
          data: provinceArr
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              // arg表示柱状图的信息，不同数值呈现不同颜色
              color: (arg) => {
                let targetColorArr = null
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: targetColorArr[0] },
                  { offset: 1, color: targetColorArr[1] }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue === this.allData.length) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
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

<style lang="less" scoped>

</style>
