<template>
  <div class="app-container">
    <div style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.symbol"
        size="mini"
        placeholder="币种"
        style="width: 200px; margin-right: 10px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        :loading="listLoading"
        @click="handleFilter"
      >搜索</el-button>
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
      @sort-change="sortChange"
      @expand-change="expandChange"
    >
      <el-table-column align="center" label="ID" width="65">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column
        label="币种"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.symbol }}
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.sideText }}
        </template>
      </el-table-column>
      <el-table-column
        label="方向"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.positionText }}
        </template>
      </el-table-column>
      <el-table-column
        label="收益"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.side === 'close' ? scope.row.inexact_profit : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="数量"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.amount }}
        </template>
      </el-table-column>
      <el-table-column
        label="价格"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.avg_price }}
        </template>
      </el-table-column>
      <el-table-column
        label="时间"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.updateDate }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getOrders } from '@/api/order'
import Pagination from '@/components/Pagination'
import { round } from 'mathjs'

export default {
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+',
      },
      listLoading: false,
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
    await this.getList()
  },
  beforeDestroy() {
  },
  methods: {
    round(data, num = 2) {
      return round(data, num)
    },
    expandChange(row, expandedRows) {
      this.expandKeys = expandedRows.map(item => item.symbol)
    },
    sortChange(data) {
      const { order } = data;
      this.listQuery.sort = order === 'ascending' ? '+' : '-'
      this.getList()
    },
    async getList() {
      this.listLoading = true
      const { data } = await getOrders(this.listQuery)
      this.list = data.list
      this.total = data.total
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    }
  },
}
</script>
