<template>
  <div class="app-container">
    <div class="filter-container" style="position: relative; height: 40px">
      <el-button
        type="primary"
        style="position: absolute; right: 0; top: -5px"
        @click="save"
        >保存
      </el-button>
    </div>
    <codemirror
      ref="cmEditor"
      style="width: 100%"
      :value="code"
      :options="cmOptions"
      @ready="onCmReady"
      @focus="onCmFocus"
      @input="onCmCodeChange"
    />
  </div>
</template>

<script>
import { getTrades, setTrades } from '@/api/trade'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js' // 支持JavaScript语言

import 'codemirror/addon/selection/active-line' // 光标行背景高亮，配置里面也需要styleActiveLine设置为true
import 'codemirror/keymap/sublime' // sublime编辑器效果
import 'codemirror/mode/css/css'
import 'codemirror/theme/monokai.css' // 编辑器主题样式，配置里面theme需要设置monokai
import 'codemirror/theme/base16-dark.css'

// 搜索
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/jump-to-line.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'

// 折叠
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'

export default {
  components: {
    codemirror,
  },
  data() {
    return {
      listLoading: true,
      code: null,
      cmOptions: {
        tabSize: 2,
        mode: {
          name: 'javascript',
          json: true,
        },
        theme: 'monokai',
        lineNumbers: true,
        line: true,
        foldGutter: true,
        lineWrapping: true,
        autoFormatJson: true,
        jsonIndentation: true,
        gutters: [
          'CodeMirror-linenumbers',
          'CodeMirror-foldgutter',
          'CodeMirror-lint-markers',
        ],
      },
    }
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror
    },
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const { data } = await getTrades()
      this.code = JSON.stringify(data.list, null, 2)
      this.listLoading = false
    },
    onCmReady(cm) {
      // console.log('the editor is readied!', cm)
    },
    onCmFocus(cm) {
      // console.log('the editor is focused!', cm)
    },
    onCmCodeChange(newCode) {
      // console.log('this is new code', newCode)
      this.code = newCode
    },
    async save() {
      this.$confirm(`此操作不可恢复，确认要保存吗？`)
        .then(() => {
          let trades
          try {
            trades = JSON.parse(this.code)
          } catch (e) {
            this.$message({ message: 'json格式不正确，请检查', type: 'error' })
            return
          }
          ;(async () => {
            try {
              await setTrades({
                trades,
              })
              this.$message({ message: '修改成功', type: 'success' })
            } catch (e) {
              this.$message({ message: '网络错误，修改失败', type: 'error' })
            }
          })()
        })
        .catch(() => {})
    },
  },
}
</script>

<style>
.app-container .CodeMirror {
  border: 1px solid #1890ff !important;
  height: calc(100vh - 140px) !important;
}
</style>

