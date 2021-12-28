<template>
  <div class="myCollection">
    <div class="share-box">
      <div class="share-input">
        <el-input
          :placeholder="$t('placeholder.file_name')"
          size="mini"
          v-model="inputSearch">
            <el-button slot="append" icon="el-icon-search" size="mini" @click="searchFormTable"></el-button>
        </el-input>
      </div>
      <div>
        <el-table
          :data="tableData.datas"
          size="mini"
          border
          :height="clientHeight"
          style="width: 100%">
          <el-table-column
            prop="resourceName"
            :label="$t('placeholder.file_name')"
            width="780">
          </el-table-column>
          <el-table-column
            prop="creator"
            :label="$t('operation.operator')"
            width="180">
          </el-table-column>
          <el-table-column
            :label="$t('operation.content')">
            <template slot-scope="scope">
              <span>{{scope.row.operationType == 8 ? $t('label.collection'): ""}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createDate"
            :label="$t('operation.date')">
          </el-table-column>
        </el-table>
      </div>
      <div>
        <el-pagination
          right
          background
          layout="prev, pager, next"
          class="pagination"
          @current-change="handleCurrentChange"
          :page-size="tableData.linesPerPage"
          :current-page.sync="tableData.pageNo"
          :total="tableData.rowCount">
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
import { TimeToDate } from "../../../utils/utils.js";
export default {
  name: "myCollection",
  props: [
    'active'
  ],
  data () {
    return {
      user: {},
      tabPosition: 'left',
      inputSearch: '',
      tableData: [],
      params: {
        userid : '',
        keyWord: '',
        operationType: '8',
        linesPerPage: 15,
        pageNo: 1
      },
      clientHeight: ''
    }
  },

  watch:{
    active(val){
      if(val == 'collection-log'){
        this.getMyCollection();
        //33底部授权信息
        this.clientHeight = `${document.documentElement.clientHeight}`- 208 - 33+'px';
      }
    }
  },

  created(){
    //获取浏览器可视区域高度 33底部授权信息
    this.clientHeight = `${document.documentElement.clientHeight}`- 208 - 33+'px';
  },

  mounted() {
    this.getMyProfile();
  },

  methods: {
    /**
     * 获取当前用户信息
     */
    getMyProfile(){
      API.getMyProfile({
        onSucess: resp => {
          this.user = resp.data.data;
          this.getMyCollection();
        } 
      })
    },
    getMyCollection(currentPage) {
      if(currentPage){
        this.params.pageNo = currentPage.pageNo;
      }
      this.params.userid = this.user.id;
      API.getMyDiary(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          //获取时间进行格式转换
          for(let i=0;i<data.datas.length;i++){
            if(data.datas[i].createDate){
              data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD");
            }
          } 
          this.tableData = data;
        } 
      })
    },
    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let currentPage = {
        pageNo: val,
        linesPerPage: this.params.linesPerPage
      }
      this.getMyCollection(currentPage);
    },
    //查询功能
    searchFormTable() {
      this.params.keyWord = this.inputSearch;
      API.getMyDiary(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          //获取时间进行格式转换
          for(let i=0;i<data.datas.length;i++){
            if(data.datas[i].createDate){
              data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD");
            }
          } 
          this.tableData = data;
        } 
      })
    }
  },
}
</script>