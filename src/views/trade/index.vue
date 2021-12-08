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
        type="success"
        size="mini"
        :loading="serviceLoading"
        @click="start()"
      >
        开启服务
      </el-button>
      <el-button
        type="danger"
        size="mini"
        :loading="serviceLoading"
        @click="stop()"
      >
        停止服务
      </el-button>
      <el-button
        type="success"
        size="mini"
        :loading="serviceLoading"
        @click="enableAll(1)"
      >
        开启所有
      </el-button>
      <el-button
        type="danger"
        size="mini"
        :loading="serviceLoading"
        @click="enableAll(0)"
      >
        停用所有
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
        label="24h↑↓"
        align="center"
        show-overflow-tooltip
        sortable="custom"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.percentChange < 0" style="color: red;">{{ scope.row.percentChange }}%↓ </span>
          <span v-else style="color: green;">{{ scope.row.percentChange }}%↑ </span>
        </template>
      </el-table-column>
      <!-- <el-table-column
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
      </el-table-column> -->
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
      <el-table-column
        label="操作"
        align="center"
        width="80"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            type="danger"
            size="mini"
            @click="del(row)"
          >删除
          </el-button>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="addCoin(info)">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFeatures, setFeature, addFeature, delFeature, startService, stopService, enableFeature } from '@/api/trade'
import { round } from 'mathjs'

export default {
  data() {
    return {
      list: [],
      tickets: {},
      sort: '+',
      listLoading: false,
      serviceLoading: false,
      enableLoading: false,
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
    round(data, num = 2) {
      return round(data, num)
    },
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
    del(row) {
      this.$confirm(`确认要删除${row.symbol}吗？`)
        .then(async() => {
          try {
            await delFeature(row.id)
            this.$message({ message: '删除成功', type: 'success' })
            await this.fetchData()
          } catch (e) {
            this.$message({ message: '删除失败', type: 'success' })
          }
        })
        .catch(() => {})
    },
    enableAll(flag) {
      this.$confirm(`确认要${flag === 1 ? '启用' : '停用'}所有吗？`)
        .then(async() => {
          try {
            await enableFeature(flag)
            this.$message({ message: '操作成功', type: 'success' })
            await this.fetchData()
          } catch (e) {
            this.$message({ message: '操作失败', type: 'success' })
          }
        })
        .catch(() => {})
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
        'quantity': 20,
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
    start() {
      this.$confirm(`此操作不可恢复，确认要开启服务吗？`)
        .then(async() => {
          this.serviceLoading = true
          await startService()
          this.$message({ message: '开启成功', type: 'success' })
          this.serviceLoading = false
        })
        .catch(() => {})
    },
    stop() {
      this.$confirm(`此操作不可恢复，确认要停止服务吗？`)
        .then(async() => {
          this.serviceLoading = true
          await stopService()
          this.$message({ message: '停止成功', type: 'success' })
          this.serviceLoading = false
        })
        .catch(() => {})
    }
  },
}
</script>
