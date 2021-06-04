<template>
  <div class="com-container" @dblclick="revertMap">
      <div class="com-chart" ref="map_ref">地图组件</div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import { getProvinceMapInfo } from '@/utils/map_utils'

export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      mapData: {} // 获取的地图矢量数据缓存
    }
  },
  created () {
    // 回调函数的注册
    this.$socket.registerCallback('mapData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 向服务端请求数据
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData', // 回调函数唯一标识
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallback('mapData')
  },
  methods: {
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量数据
      // http://localhost:9898/static/map/china.json 数据不在koa后台
      const { data: chinamap } = await axios.get('http://localhost:8989/static/map/china.json')
      this.$echarts.registerMap('chinamap', chinamap)
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'chinamap',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E72BF', // 每个区域的颜色
            borderColor: '#333' // 区域分界线的颜色
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical' // 图例垂直摆放
        }
      }
      this.chartInstance.setOption(initOption)
      // 给地图设置点击事件，arg表示被点击区域的信息
      this.chartInstance.on('click', async arg => {
        // arg.name得到被点击的省份，是中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        // 获取这个省份的地图矢量数据
        // 判断当前请求的省份地图矢量数据是否存在
        if (!this.mapData[provinceInfo.key]) {
          const result = await axios.get('http://localhost:8989' + provinceInfo.path)
          this.mapData[provinceInfo.key] = result.data
          this.$echarts.registerMap(provinceInfo.key, result.data)
        }
        // 切换地图
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    getData (result) {
      // this.$http.get()，对allData赋值
      // const { data: result } = await this.$http.get('map')
      this.allData = result
      this.updateChart()
    },
    updateChart () {
      // 处理数据
      // 图例数据，与series中每个对象的name属性对应
      const legendData = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // return的对象代表一个类别下的所有散点数据
        // 在地图中显示散点数据，需要给散点图表增加coordinateSystem：geo，才能使用地图的坐标系统
        return {
          type: 'effectScatter',
          rippleEffect: {
            scale: 5,
            brushType: 'stroke' // 空心涟漪动画效果
          },
          name: item.name,
          coordinateSystem: 'geo',
          data: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      // 根据容器大小计算标题字体大小
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          },
          itemGap: titleFontSize
        }
      }
      this.chartInstance.setOption(adapterOption)
      // 当容器大小变化时会自动计算图表大小
      this.chartInstance.resize()
    },
    // 回到中国地图
    revertMap () {
      const revertOption = {
        geo: {
          map: 'chinamap'
        }
      }
      this.chartInstance.setOption(revertOption)
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
