<template>
  <div class="app-container">
    <div style="margin-bottom: 10px">
      <span style="margin-right: 10px">
        总收益：
        <span style="color: green">{{ allProfit }}</span>
        usdt
      </span>
      <el-button v-if="buyAll" type="text" @click="changeBuyALL(true)">
        开启所有买单
      </el-button>
      <el-button v-else type="text" @click="changeBuyALL(false)">
        关闭所有买单
      </el-button>
      <el-button v-if="sellAll" type="text" @click="changeSellALL(true)">
        开启所有卖单
      </el-button>
      <el-button v-else type="text" @click="changeSellALL(false)">
        关闭所有卖单
      </el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="listLoading"
        @click="fetchData()"
      >
        刷新
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      size="mini"
      :row-key="rowKey"
      :expand-row-keys="expandKeys"
      highlight-current-row
      @expand-change="expandChange"
    >
      <!-- <el-table-column align="center" label="ID" width="65">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column> -->

      <el-table-column
        label="币种"
        align="center"
        width="100"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.symbol }}
        </template>
      </el-table-column>
      <el-table-column type="expand" label=">>" align="center" width="40">
        <template slot-scope="{ row }">
          <el-table
            :data="row.history_trade"
            border
            fit
            size="mini"
            highlight-current-row
          >
            <el-table-column align="center" label="ID" width="65">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              label="币种"
              align="center"
              width="100"
              show-overflow-tooltip
            >
              <template slot-scope="{ row }">
                {{ row.symbol }}
              </template>
            </el-table-column> -->
            <el-table-column
              label="交易价格"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="{ row }">
                {{ row.price }}
              </template>
            </el-table-column>
            <el-table-column
              label="交易数量"
              align="center"
              width="80"
              show-overflow-tooltip
            >
              <template slot-scope="{ row }">
                {{ row.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="交易方向" align="center" width="75">
              <template slot-scope="{ row }">
                <span v-if="row.side === 'BUY'" style="color: green">买入</span>
                <span v-else style="color: red">卖出</span>
              </template>
            </el-table-column>
            <el-table-column label="已卖出" align="center" width="65">
              <template slot-scope="{ row }">
                <span v-if="row.isSell === true" style="color: green">是</span>
                <span
                  v-else-if="row.isSell === false"
                  style="color: red"
                >否
                </span>
                <span v-else>-</span>
              </template></el-table-column>
            <el-table-column label="当前收益" align="center" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ nowBuyTradeProfit(row, tickets) }}
              </template></el-table-column>
            <el-table-column label="收益" align="center" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ row.profit ? round(row.profit, 2) : '-' }}
              </template></el-table-column>
            <el-table-column
              label="预计卖价"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="{ row }">
                {{ row.sell_price || '-' }}
              </template>
            </el-table-column>

            <!-- <el-table-column label="止损率" align="center" width="65">
              <template slot-scope="{ row }">
                {{ row.side === 'BUY' ? `${row.stop_loss || 0}%` : '-' }}
              </template></el-table-column> -->
            <el-table-column label="交易时间" align="center" width="140">
              <template slot-scope="{ row }">
                {{ row.time }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="交易数量"
        align="center"
        width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{ scope.row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="当前数量"
        align="center"
        width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span style="color: green">
            {{ round(scope.row.buy_quantity, 4) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="收益率"
        align="center"
        width="70"
        show-overflow-tooltip
      >
        <template slot-scope="scope"> {{ scope.row.rate }}% </template>
      </el-table-column>
      <el-table-column label="当前价格" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ tickets[scope.row.symbol] || '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="买单价" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.buy_price }}
        </template>
      </el-table-column>
      <el-table-column label="卖单价" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.sell_price }}
        </template>
      </el-table-column>
      <el-table-column
        label="当前收益"
        align="center"
        width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.nowProfit || 0 }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="止损率" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.stop_loss || '-' }}
        </template>
      </el-table-column> -->
      <el-table-column label="买单开启" align="center" width="80">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.buy_open"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="isChangeBuy($event, row)"
          /> </template></el-table-column>
      <el-table-column label="卖单开启" align="center" width="80">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.sell_open"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="isChangeSell($event, row)"
          /> </template></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getTrades, setTrades, getTickets } from '@/api/trade'
import { round } from 'mathjs'

export default {
  data() {
    return {
      list: [],
      tickets: {},
      listLoading: true,
      timeId: null,
      buyAll: true,
      sellAll: true,
      rowKey(row) {
        return row.symbol;
      },
      expandKeys: []
    }
  },
  computed: {
    allProfit() {
      const profit = this.list.reduce(
        (carry, row) => carry + row.nowProfit,
        0
      )
      return round(profit, 2)
    },
  },
  async created() {
    await this.fetchData()
    this.fetchTickets()
    this.timeId = setInterval(() => this.fetchTickets(), 30 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.timeId)
  },
  methods: {
    expandChange(row, expandedRows) {
      this.expandKeys = expandedRows.map(item => item.symbol)
    },
    async fetchData() {
      this.listLoading = true
      const { data } = await getTrades()
      this.list = data.list
      this.buyAll = !!this.list.find((item) => item.buy_open === false)
      this.sellAll = !!this.list.find((item) => item.sell_open === false)
      this.listLoading = false
    },
    async fetchTickets() {
      const { data } = await getTickets()
      const result = {}
      data.forEach(item => {
        result[item.symbol] = Number(item.price)
      })
      this.tickets = result
      this.list = this.list.map(item => {
        item.nowProfit = this.nowProfit(item) // 当前收益
        return item;
      })
    },
    async edit() {
      try {
        await setTrades({
          trades: this.list,
        })
        this.$message({ message: '修改成功', type: 'success' })
        await this.fetchData()
      } catch (e) {
        this.$message({ message: '修改失败', type: 'success' })
      }
    },
    // 当前收益
    nowProfit(ticket) {
      const { history_trade = [], symbol } = ticket
      const sellProfit = round(
        history_trade
          .filter((item) => item.side === 'SELL')
          .reduce((carry, item) => carry + Number(item.profit || 0), 0),
        2
      )
      const nowPrice = this.tickets[symbol]
      if (nowPrice) {
        // 尚未交易的收益
        const noSellProfit = history_trade
          .filter((item) => item.side === 'BUY' && item.isSell === false)
          .reduce((carry, item) => carry + (nowPrice - Number(item.price)) * item.quantity, 0)
        console.log(symbol, noSellProfit)
        return round(sellProfit + noSellProfit, 2)
      }
      return sellProfit
    },
    nowBuyTradeProfit(order, tickets) {
      const nowPrice = tickets[order.symbol]
      if (nowPrice && order.side === 'BUY' && order.isSell === false) {
        return round((nowPrice - Number(order.price)) * order.quantity, 2)
      }
      return '-'
    },
    round(data, num = 2) {
      return round(data, num)
    },
    async isChangeBuy(event, row) {
      await this.fetchData()
      const find = this.list.find((item) => item.symbol === row.symbol)
      if (event === true) {
        // 重新开启的时候，买的价格定为0，重新开始生成新的价格
        find.buy_price = 0
        find.buy_open = true
      } else {
        find.buy_open = false
      }
      await this.edit()
    },
    async isChangeSell(event, row) {
      await this.fetchData()
      const find = this.list.find((item) => item.symbol === row.symbol)
      find.sell_open = event
      await this.edit()
    },
    async changeBuyALL(status) {
      this.$confirm(`确认要进行此操作吗？`)
        .then(async() => {
          await this.fetchData()
          this.list.map((item) => {
            item.buy_open = status
            if (status === true) {
              item.buy_price = 0
            }
          })
          await this.edit()
        })
        .catch(() => {})
    },
    async changeSellALL(status) {
      this.$confirm(`确认要进行此操作吗？`)
        .then(async() => {
          await this.fetchData()
          this.list.map((item) => (item.sell_open = status))
          await this.edit()
        })
        .catch(() => {})
    }
  },
}
</script>
