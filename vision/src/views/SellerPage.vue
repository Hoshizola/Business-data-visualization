<!--
针对/sellerpage这条路径而显示
用来注册和显示子组件
-->
<template>
  <div class='com-page'>
      <seller></seller>
  </div>
</template>

<script>
import Seller from '@/components/Seller'
export default {
  data () {
    return {}
  },
  methods: {},
  components: {
    seller: Seller
  }
}
</script>

<style lang='less' scoped>

</style>
