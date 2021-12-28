<template>
  <div>
    <template>
      <el-table
        ref="tableList"
        :data="mainData.datas"
        :height="mainData.tableHeight"
        @row-click="onRowClick"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" v-if="showCheckBox">
        </el-table-column>
        <template v-for="(column, ind) in mainData.columns">
          <el-table-column
            v-bind:key="ind"
            :prop="column.prop"
            :label="column.columnName"
          >
          </el-table-column>
        </template>
      </el-table>
    </template>
    <el-pagination
      v-if="showPagination"
      class="text-right pt-1"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="mainData.pageNo"
      :page-sizes="[10, 25, 50, 100]"
      :page-size="10"
      background
      layout="total, prev, pager, next, sizes"
      :total="mainData.rowCount"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'publictable',
  props: {
    mainData: {
      type: Object,
      default: function() {
        return {
          datas: [],
          columns: [],
          tableHeight: 300,
          pageNo: 1,
          rowCount: 10
        };
      },
    },
    showCheckBox: {
      // 是否显示可选择的checkbox
      type: Boolean,
      default: false,
    },
    showPagination: {
      // 是否显示页码值
      type: Boolean,
      default: false,
    },
  },
  mounted() {},

  methods: {
    resetField() {
      let obj = {}
      this.mainData.params.forEach((elm) => {
        elm.value = ''
        obj[elm.name] = elm.value
      })
      this.$emit('updataParams', obj)
      this.$emit('getData')
    },
    //查询
    getData() {
      let obj = {}
      this.mainData.params.forEach((elm) => {
        obj[elm.name] = elm.value
      })
      this.$emit('updataParams', obj)
      this.$emit('getData')
    },
    //当前页改变事件
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val)
      // this.$emit('getData');
    },
    //页码大小改变事件
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val)
      this.$emit('getData')
    },
    //表格点击
    onRowClick(row) {
      this.$emit('onRowClick', row)
    },
    //选中的表格数据
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
    },
    //初始化数据
    init(tableData) {
      this.initVisible = true
      this.mainData = tableData
      this.$forceUpdate()
    },
  },
}
</script>