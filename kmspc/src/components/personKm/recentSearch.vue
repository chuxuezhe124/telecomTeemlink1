<template>
  <div class="recentSearch">
    <div class="message hotSearch">
        <span class="c-white">{{$t('hot_search')}}</span>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      :height="clientHeight"
      :header-cell-style="rowClass">
      <el-table-column
        prop="content"
        :label="$t('tabs.keywords')">
      </el-table-column>
      <el-table-column
        prop="createDate"
        :label="$t('tabs.time')"
        width="180">
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import API from "@/api.js";
import { getClientHeight } from "../../utils/utils.js";
export default {
  name: "recentSearch",
  props: [
    'activeName'
  ],
  data () {
    return {
      tableData:[],
      params:{
        pageNo: 1,
        linesPerPage: 100,
      },
      clientHeight: ''
    }
  },
  watch:{
    activeName(val){
      if(val == 'recentsearch'){
        this.getSearchView();
        this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
      }
    },
  },

  created(){
    //获取浏览器可视区域高度
    this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
  },

  methods: {
    //获取最新上传的数据
    getSearchView() {
      API.getRecentSearch(this.params, {
        onSucess: resp => {
          let data = resp.data.data;
          this.tableData = data.datas;
        } 
      })
    },
    //改变表格头部的位置
    rowClass({ row, column, rowIndex, columnIndex}) {
      if(rowIndex == 0 && columnIndex == 0 && row.name == column.name){
        return 'padding-left: 25px'
      }else{
        return ''
      }
    },
  },
  mounted () {
    this.getSearchView();
  }
 
}
</script>