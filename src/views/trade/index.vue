<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="币种" align="center">
        <template slot-scope="scope">
          {{ scope.row.symbol }}
        </template>
      </el-table-column>
      <el-table-column label="交易数量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="止盈率" align="center">
        <template slot-scope="scope"> {{ scope.row.rate }} % </template>
      </el-table-column>
      <el-table-column label="买入价格" align="center">
        <template slot-scope="scope">
          {{ scope.row.buy_price }}
        </template>
      </el-table-column>
      <el-table-column label="卖出价格" align="center">
        <template slot-scope="scope">
          {{ scope.row.sell_price }}
        </template>
      </el-table-column>
      <el-table-column label="当前拥有数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.buy_quantity }}
        </template>
      </el-table-column>
      <el-table-column type="expand" label="交易记录" align="center" width="80">
        <template slot-scope="{ row }">
          <el-table :data="row.history_trade" fit highlight-current-row>
            <el-table-column align="center" label="ID" width="95">
              <template slot-scope="scope">
                {{ scope.$index }}
              </template>
            </el-table-column>
            <el-table-column label="币种" align="center">
              <template slot-scope="{ row }">
                {{ row.symbol }}
              </template>
            </el-table-column>
            <el-table-column label="交易数量" align="center">
              <template slot-scope="{ row }">
                {{ row.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="交易价格" align="center">
              <template slot-scope="{ row }">
                {{ row.price }}
              </template>
            </el-table-column>
            <el-table-column label="交易方向" align="center">
              <template slot-scope="{ row }">
                {{ row.side === 'BUY' ? '买入' : '卖出' }}
              </template>
            </el-table-column>
            <el-table-column label="交易时间" align="center">
              <template slot-scope="{ row }">
                {{ row.time }}
              </template>
            </el-table-column>
            <el-table-column label="是否已卖出" align="center">
              <template slot-scope="{ row }">
                {{ row.isSell === true ? '是' : '否' }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getTrades } from '@/api/trade'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger',
      }
      return statusMap[status]
    },
  },
  data() {
    return {
      list: null,
      listLoading: true,
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const { data } = await getTrades()
      this.list = data.list
      this.listLoading = false
    },
  },
}
</script>
