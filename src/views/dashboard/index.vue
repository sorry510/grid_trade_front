<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      <span>合约交易: </span>
      <span v-if="config.tradeFutureEnable === '1'" class="green">开启</span>
      <span v-else class="red">关闭</span>
      <div style="margin-left:20px;">
        <div class="dashboard-text">
          <span>允许做多: </span>
          <span v-if="config.coinAllowLong" class="green">开启</span>
          <span v-else class="red">关闭</span>
        </div>
        <div class="dashboard-text">
          <span>允许做空: </span>
          <span v-if="config.coinAllowShort" class="green">开启</span>
          <span v-else class="red">关闭</span>
        </div>
        <div class="dashboard-text">
          <span>交易策略: </span>
          <span class="green">{{ config.tradeStrategyTrade }}</span>
        </div>
        <div class="dashboard-text">
          <span>选币策略: </span>
          <span class="green">{{ config.tradeStrategyCoin }}</span>
        </div>
        <div class="dashboard-text">
          <span>最大持仓数量: </span>
          <span class="green">{{ config.coinMaxCount }}</span>
        </div>
        <div class="dashboard-text">
          <span>排除自动交易的币: </span>
          <span class="green">{{ config.coinExcludeSymbols }}</span>
        </div>
        <div class="dashboard-text">
          <span>自动下单类型: </span>
          <span class="green">{{ config.coinOrderType === 'LIMIT' ? '限价(根据价格深度取平均价挂单，挂单形式，有可能无法买入)' : '市价' }}</span>
        </div>
      </div>
    </div>
    <div class="dashboard-text">
      <span>新币抢购: </span>
      <div style="margin-left:20px;">
        <div class="dashboard-text">
          <span>币币新币抢购: </span>
          <span v-if="config.spotNewEnable === '1'" class="green">开启</span>
          <span v-else class="red">关闭</span>
        </div>
        <div class="dashboard-text">
          <span>合约新币抢购: </span>
          <span v-if="config.tradeNewEnable === '1'" class="green">开启</span>
          <span v-else class="red">关闭</span>
        </div>
      </div>
    </div>
    <div class="dashboard-text">
      <span>币种通知: </span>
      <span v-if="config.noticeCoinEnable === '1'" class="green">开启</span>
      <span v-else class="red">关闭</span>
    </div>
    <div class="dashboard-text">
      <span>行情监听: </span>
      <span v-if="config.listenCoinEnable === '1'" class="green">开启</span>
      <span v-else class="red">关闭</span>
    </div>
    <div class="dashboard-text">
      <span>合约资金费率监听: </span>
      <span v-if="config.listenFundingRate === '1'" class="green">开启</span>
      <span v-else class="red">关闭</span>
    </div>
    <div class="dashboard-text">
      <span>debug: </span>
      <span v-if="config.debug === '1'" class="red" />
      <span v-else class="green">关闭</span>
    </div>
    <div class="dashboard-text">
      <span>外部链接: </span>
      <div style="margin-left:20px;display:flex;gap: 20px;">
        <el-link v-for="link in config.externalLinks" :key="link.title" type="primary" :underline="false" :href="link.url" target="_blank" style="font-size:30px;">
          {{ link.title }}
        </el-link>
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
      try {
        data.externalLinks = JSON.parse(data.externalLinks)
      } catch (error) {
        data.externalLinks = []
      }
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
