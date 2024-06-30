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
      <div style="margin-top:20px;color:red;">
        tips: 如果交易金额和交易数量同时填写,以交易数量为准
      </div>
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
        label="买卖类型"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-select v-model="scope.row.side" size="small" @change="edit(scope.row)">
            <el-option label="买币" value="buy" />
            <el-option label="卖币" value="sell" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="通知价格"
        align="center"
        width="130"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.notice_price"
            class="edit-input"
            size="small"
            @blur="edit(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="已通知"
        align="center"
        width="60"
      >
        <template slot-scope="scope">
          {{ scope.row.has_notice == '1' ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="自动下单" align="center" width="80">
        <template slot-scope="scope">
          <el-select v-model="scope.row.auto_order" size="small" @change="edit(scope.row)">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="交易金额"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.usdt"
            class="edit-input"
            size="small"
            @blur="edit(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="交易数量"
        align="center"
        width="100"
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
        <el-form-item label="通知价格" prop="symbol">
          <el-input v-model="info.notice_price" />
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
import { getNoticeCoins, setNoticeCoin, addNoticeCoin, delNoticeCoin, enableNoticeCoin } from '@/api/noticeCoin'

export default {
  data() {
    return {
      list: [],
      sort: '+',
      listLoading: false,
      timeId: null,
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
  async created() {
    await this.fetchData()
    // this.timeId = setInterval(() => this.fetchData(), 5 * 1000)
  },
  beforeDestroy() {
    // clearInterval(this.timeId)
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
      const { data } = await getNoticeCoins({ sort: this.sort, type: 1 })
      this.list = data.map(item => ({ ...item, enable: item.enable == 1 }))
      console.log(this.list)
      // this.listLoading = false
    },
    async edit(row) {
      const { id, enable, leverage, usdt, ...data } = row
      try {
        await setNoticeCoin(id, { ...data, leverage: Number(leverage), usdt, enable: enable ? 1 : 0 })
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
            await delNoticeCoin(row.id)
            this.$message({ message: '删除成功', type: 'success' })
            await this.fetchData()
          } catch (e) {
            this.$message({ message: '删除失败', type: 'success' })
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
        ...row,
        'type': 1, // 币币交易
        'createTime': +new Date(),
        'updateTime': +new Date()
      }
      await addNoticeCoin(data)
      await this.fetchData()
      this.dialogFormVisible = false;
    },
  },
}
</script>
