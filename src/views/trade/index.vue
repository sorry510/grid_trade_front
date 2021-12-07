<template>
  <div class="app-container">
    <div style="margin-bottom: 10px">
      <el-button
        type="success"
        size="mini"
        @click="openDialog()"
      >
        新增
      </el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="listLoading"
        @click="fetchData()"
      >
        刷新
      </el-button>
       <el-button
        type="primary"
        size="mini"
        :loading="listLoading"
        @click="start()"
      >
        开启服务
      </el-button>
       <el-button
        type="primary"
        size="mini"
        :loading="listLoading"
        @click="stop()"
      >
        停止服务
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
      @sort-change="sortChange"
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
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.symbol }}
        </template>
      </el-table-column>
      <el-table-column
        label="最新价"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ round(scope.row.close, 4) }}
        </template>
      </el-table-column>
      <el-table-column
        label="24h涨跌"
        align="center"
        show-overflow-tooltip
        sortable="custom"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.percentChange < 0" style="color: red;">{{ scope.row.percentChange }}% </span>
          <span v-else style="color: green;">{{ scope.row.percentChange }}% </span>
        </template>
      </el-table-column>
      <el-table-column
        label="金额"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.quantity"
            class="edit-input"
            size="small"
            @blur="edit(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="开启" align="center" width="80">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.enable"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="isChangeBuy($event, row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="info"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="币种" prop="symbol">
          <el-input v-model="info.symbol" />
        </el-form-item>
        <el-form-item label="交易金额" prop="quantity">
          <el-input v-model="info.quantity" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="addCoin(info)">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFeatures, setFeature, addFeature, startService, stopService } from '@/api/trade'
import { round } from 'mathjs'

export default {
  data() {
    return {
      list: [],
      tickets: {},
      sort: '+',
      listLoading: true,
      timeId: null,
      buyAll: true,
      sellAll: true,
      dialogFormVisible: false,
      dialogLoading: false,
      dialogTitle: '新增币种信息',
      info: {},
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
    this.timeId = setInterval(() => this.fetchData(), 3 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.timeId)
  },
  methods: {
    expandChange(row, expandedRows) {
      this.expandKeys = expandedRows.map(item => item.symbol)
    },
    sortChange(data) {
      const { order } = data;
      this.sort = order === 'ascending' ? '+' : '-'
      this.fetchData()
    },
    async fetchData() {
      // this.listLoading = true
      const { data } = await getFeatures({ sort: this.sort })
      this.list = data.map(item => ({ ...item, enable: item.enable == 1 }))
      // this.listLoading = false
    },
    async edit(row) {
      const { id, enable, ...data } = row
      try {
        await setFeature(id, { ...data, enable: enable ? 1 : 0 })
        this.$message({ message: '修改成功', type: 'success' })
        await this.fetchData()
      } catch (e) {
        this.$message({ message: '修改失败', type: 'success' })
      }
    },
    round(data, num = 2) {
      return round(data, num)
    },
    async isChangeBuy(event, row) {
      await this.edit(row)
    },
    openDialog() {
      this.dialogTitle = '新增币种信息';
      this.dialogFormVisible = true;
    },
    async addCoin(row) {
      const data = {
        'symbol': row.symbol,
        'quantity': row.quantity,
        'percentChange': 0,
        'close': 0,
        'open': 0,
        'low': 0,
        'enable': 1,
        'updateTime': +new Date()
      }
      await addFeature(data)
      this.dialogFormVisible = false;
    },
    async start() {
      await startService()
      this.$message({ message: '开启成功', type: 'success' })
    },
    async stop() {
      await stopService()
      this.$message({ message: '停止成功', type: 'success' })
    }
    // async changeBuyALL(status) {
    //   this.$confirm(`确认要进行此操作吗？`)
    //     .then(async() => {
    //       await this.fetchData()
    //       this.list.map((item) => {
    //         item.buy_open = status
    //         if (status === true) {
    //           item.buy_price = 0
    //         }
    //       })
    //       await this.edit()
    //     })
    //     .catch(() => {})
    // },
    // async changeSellALL(status) {
    //   this.$confirm(`确认要进行此操作吗？`)
    //     .then(async() => {
    //       await this.fetchData()
    //       this.list.map((item) => (item.sell_open = status))
    //       await this.edit()
    //     })
    //     .catch(() => {})
    // }
  },
}
</script>
