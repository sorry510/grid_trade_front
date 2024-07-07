<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      <span>debug模式: </span>
      <span v-if="config.debug === '1'" class="red">是</span>
      <span v-else class="green">否</span>
    </div>
    <div class="dashboard-text">
      <span>是否开启币币新币抢购: </span>
      <span v-if="config.spotNewEnable === '1'" class="green">是</span>
      <span v-else class="red">否</span>
    </div>
    <div class="dashboard-text">
      <span>是否开启合约新币抢购: </span>
      <span v-if="config.tradeNewEnable === '1'" class="green">是</span>
      <span v-else class="red">否</span>
    </div>
    <div class="dashboard-text">
      <span>是否开启币种通知信息: </span>
      <span v-if="config.noticeCoinEnable === '1'" class="green">是</span>
      <span v-else class="red">否</span>
    </div>
    <div class="dashboard-text">
      <span>是否开启行情监听通知信息: </span>
      <span v-if="config.listenCoinEnable === '1'" class="green">是</span>
      <span v-else class="red">否</span>
    </div>
    <div class="dashboard-text">
      <span>是否开启自动合约交易: </span>
      <span v-if="config.tradeFutureEnable === '1'" class="green">是</span>
      <span v-else class="red">否</span>

      <div style="margin-left:20px;">
        <div class="dashboard-text">
          <span>是否允许做多: </span>
          <span v-if="config.coinAllowLong" class="green">是</span>
          <span v-else class="red">否</span>
        </div>
        <div class="dashboard-text">
          <span>是否允许做空: </span>
          <span v-if="config.coinAllowShort" class="green">是</span>
          <span v-else class="red">否</span>
        </div>
        <div class="dashboard-text">
          <span>自动交易策略: </span>
          <span class="green">{{ config.tradeStrategyTrade }}</span>
        </div>
        <div class="dashboard-text">
          <span>选币策略: </span>
          <span class="green">{{ config.tradeStrategyCoin }}</span>
        </div>
        <div class="dashboard-text">
          <span>最大持仓数量限制: </span>
          <span class="green">{{ config.coinMaxCount }}</span>
        </div>
        <div class="dashboard-text">
          <span>排除自动交易的币: </span>
          <span class="green">{{ config.coinExcludeSymbols }}</span>
        </div>
        <div class="dashboard-text">
          <span>下单类型: </span>
          <span class="green">{{ config.coinOrderType === 'LIMIT' ? '限价(根据价格深度取平均价挂单，有可能无法买入)' : '市价' }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getServiceConfig } from '@/api/service'

export default {
  name: 'Dashboard',
  data() {
    return {
      config: {},
    }
  },
  async created() {
    await this.fetchConfig()
  },
  methods: {
    async fetchConfig() {
      const { data } = await getServiceConfig()
      console.log(data)
      this.config = data
    },
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.red {
  color: red;
}
.green {
  color: green;
}
</style>
