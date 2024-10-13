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
        label="kc通道"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-button
            type="success"
            size="mini"
            @click="openKlineDialog(scope.row)"
          >chart
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="监听技术类型"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <el-select v-model="scope.row.listen_type" size="small" @change="edit(scope.row)">
            <el-option label="k线变化" value="kline_base" />
            <el-option label="肯纳特通道" value="kline_kc" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="k线周期"
        align="center"
        width="110"
      >
        <template slot-scope="scope">
          <el-select v-if="scope.row.listen_type === 'kline_base'" v-model="scope.row.kline_interval" size="small" @change="edit(scope.row)">
            <el-option label="1m" value="1m" />
            <el-option label="3m" value="3m" />
            <el-option label="5m" value="5m" />
            <el-option label="15m" value="15m" />
            <el-option label="30m" value="30m" />
            <el-option label="1h" value="1h" />
            <el-option label="2h" value="2h" />
            <el-option label="4h" value="4h" />
            <el-option label="6h" value="6h" />
            <el-option label="8h" value="8h" />
            <el-option label="12h" value="12h" />
            <el-option label="1d" value="1d" />
            <el-option label="3d" value="3d" />
            <el-option label="1w" value="1w" />
            <el-option label="1M" value="1M" />
          </el-select>
          <el-select v-if="scope.row.listen_type === 'kline_kc'" v-model="scope.row.kline_interval" size="small" @change="edit(scope.row)">
            <el-option label="15m" value="15m" />
            <el-option label="1h" value="1h" />
            <el-option label="4h" value="4h" />
            <el-option label="1d" value="1d" />
            <el-option label="3d" value="3d" />
            <el-option label="1w" value="1w" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="变化幅度%"
        align="center"
        width="110"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.change_percent"
            class="edit-input"
            size="small"
            @blur="edit(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="通知间隔(min)"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.notice_limit_min"
            class="edit-input"
            size="small"
            @blur="edit(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="上次通知信息"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.last_notice_time !== 0 ? parseTime(scope.row.last_notice_time) : '无' }}
          {{ typeText(scope.row.last_notice_type) }}
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="addCoin(info)">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="dialogTitleKline" :visible.sync="dialogKlineVisible" width="75%" center>
      <div id="chart">
        <apexchart type="line" height="450" :options="chartOptions" :series="series" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getListenCoins, setListenCoin, addListenCoin, delListenCoin, enableListenCoin, getKcLineChart } from '@/api/listenCoin'
import { round } from 'mathjs'
import VueApexCharts from 'vue-apexcharts'
import { parseTime } from '@/utils'

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      list: [],
      tickets: {},
      sort: '+',
      listLoading: false,
      enableLoading: false,
      dialogFormVisible: false,
      dialogLoading: false,
      dialogTitle: '新增币种信息',
      dialogTitleKline: '', // k线图
      dialogKlineVisible: false,
      info: {},
      rowKey(row) {
        return row.symbol;
      },
      expandKeys: [],

      series: [
        // {
        //   name: 'High - 2013',
        //   data: [28, 29, 33, 36, 32, 32, 33]
        // },
        // {
        //   name: 'Low - 2013',
        //   data: [12, 11, 14, 18, 17, 13, 13]
        // }
      ],
      chartOptions: {
        chart: {
          height: 450,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
          },
          zoom: {
            enabled: false
          },
          toolbar: {
            show: false
          }
        },
        colors: ['#77B6EA', '#545454', '#545454', '#545454', '#77B6EA', '#F56c6c', '#F56c6c', '#F56c6c'],
        dataLabels: {
          enabled: false,
        },
        // stroke: {
        //   curve: 'smooth'
        // },
        title: {
          text: 'kc通道',
          align: 'left'
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        markers: {
          size: 1
        },
        // xaxis: {
        //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        //   // title: {
        //   //   text: '4h'
        //   // }
        // },
        yaxis: {
          title: {
            text: 'price'
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5
        }
      },
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
    typeText(type) {
      return {
        'up': '上涨',
        'down': '下跌',
      }[type] || ''
    },
    parseTime,
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
      const { data } = await getListenCoins({ sort: this.sort, type: 2 })
      this.list = data.map(item => ({ ...item, enable: item.enable == 1 }))
      // this.listLoading = false
    },
    async edit(row) {
      const { id, enable, notice_limit_min, ...other } = row
      try {
        await setListenCoin(id, { notice_limit_min: Number(notice_limit_min), enable: enable ? 1 : 0, ...other })
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
            await delListenCoin(row.id)
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
            await enableListenCoin(flag)
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
    async getKcLineChart(row) {
      const { data } = await getKcLineChart(row.id)
      console.log(data)
      const limit = 50
      const kcWideHigh = {
        name: 'kc3.75-high',
        data: data.upper2.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      const kcNarrowHigh = {
        name: 'kc2.75-high',
        data: data.upper1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      const kcNarrowMa = {
        name: 'kc2.75-ma',
        data: data.ma1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      const kcNarrowLow = {
        name: 'kc2.75-low',
        data: data.lower1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      const kcWideLow = {
        name: 'kc3.75-low',
        data: data.lower2.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      const close = {
        name: 'close',
        data: data.close1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      }
      // const high = {
      //   name: 'high',
      //   data: data.high1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      // }
      // const low = {
      //   name: 'low',
      //   data: data.low1.slice(0, limit).reverse().map(item => this.roundOrderPrice(item))
      // }
      this.series = []
      this.series.push(kcWideHigh)
      this.series.push(kcWideLow)
      this.series.push(kcNarrowHigh)
      this.series.push(kcNarrowMa)
      this.series.push(kcNarrowLow)

      this.series.push(close)
      // this.series.push(high)
      // this.series.push(low)
    },
    async openKlineDialog(row) {
      try {
        await this.getKcLineChart(row)
      } catch (e) {
        console.log(e)
        this.$message({ message: '获取k线图失败', type: 'error' })
        return
      }
      this.dialogTitleKline = `${row.symbol}(${row.kline_interval})`;
      this.dialogKlineVisible = true;
    },
    async addCoin(row) {
      const data = {
        ...row,
        'type': 2, // 合约交易
        'createTime': +new Date(),
        'updateTime': +new Date()
      }
      await addListenCoin(data)
      await this.fetchData()
      this.dialogFormVisible = false;
    },
    roundOrderPrice(price, symbol = null) {
      const whiteSymbols = {
        'MKRUSDT': 1,
        'CRVUSDT': 3,
        'XTZUSDT': 3,
      }
      if (whiteSymbols[symbol]) {
        return round(price, whiteSymbols[symbol])
      }
      if (price > 500) {
        return round(price, 1)
      } else if (price > 10) {
        return round(price, 2)
      } else if (price > 1) {
        return round(price, 3)
      } else if (price > 0.1) {
        return round(price, 4)
      } else if (price > 0.01) {
        return round(price, 5)
      } else {
        return round(price, 6)
      }
    }
  },
}
</script>
