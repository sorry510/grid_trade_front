<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      size="mini"
      highlight-current-row
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
                <span v-else-if="row.isSell === false" style="color: red"
                  >否
                </span>
                <span v-else>-</span>
              </template></el-table-column
            >
            <el-table-column label="收益" align="center" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ row.profit ? round(row.profit, 2) : '-' }}
              </template></el-table-column
            >
            <el-table-column
              label="预计卖价"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="{ row }">
                {{ row.sell_price || '-' }}
              </template>
            </el-table-column>

            <el-table-column label="止损率" align="center" width="65">
              <template slot-scope="{ row }">
                {{ row.side === 'BUY' ? `${row.stop_loss || 0}%` : '-' }}
              </template></el-table-column
            >
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
        label="收益率"
        align="center"
        width="70"
        show-overflow-tooltip
      >
        <template slot-scope="scope"> {{ scope.row.rate }}% </template>
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
        label="当前数量"
        align="center"
        width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ round(scope.row.buy_quantity, 4) }}
        </template>
      </el-table-column>
      <el-table-column
        label="当前收益"
        align="center"
        width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ nowProfit(scope.row.history_trade) }}
        </template>
      </el-table-column>
      <el-table-column label="止损率" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.stop_loss || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="买单开启" align="center" width="80">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.buy_open"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="isStop($event, row, 'buy_price')"
          /> </template
      ></el-table-column>
      <el-table-column label="卖单开启" align="center" width="80">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.sell_open"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="isStop($event, row)"
          /> </template
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getTrades, setTrades } from '@/api/trade'
import { round } from 'mathjs'

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      timeId: null,
    }
  },
  created() {
    this.fetchData()
    this.timeId = setInterval(() => this.fetchData(), 120 * 1000)
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const { data } = await getTrades()
      this.list = data.list
      this.listLoading = false
    },
    async eidt() {
      await setTrades({
        trades: this.list,
      })
    },
    // 当前收益
    nowProfit(orders) {
      return round(
        orders
          .filter((item) => item.side === 'SELL')
          .reduce((carry, item) => carry + Number(item.profit || 0), 0),
        2
      )
    },
    // 当前未卖出的损失（不知道现在价格，暂不做）
    nowLoss(orders) {
      return orders.filter(
        (item) => item.side === 'SELL' && item.isSell === false
      )
    },
    round(data, num = 2) {
      return round(data, num)
    },
    async isStop(event, row, field = null) {
      if (event === true && field) {
        // 重新开启的时候，买的价格定为0，重新开始生成
        const find = this.list.find((item) => item.symbol === row.symbol)
        if (find) {
          find[field] = 0
        }
      }
      this.listLoading = true
      try {
        await setTrades({
          trades: this.list,
        })
        this.$message({ message: '修改成功', type: 'success' })
      } catch (e) {}
      this.listLoading = false
    },
  },
}
</script>
