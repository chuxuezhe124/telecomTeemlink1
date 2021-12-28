<template>
  <div class="subscriptionTable">
    <div class="subscription-tb">
      <el-row :gutter="30">
        <el-col :span="10">
          <div class="message leftTable">
            <span :class="[$store.state.isEnglish ? 'c-white-en' : 'c-white']">{{$t('tabs.content')}}</span>
          </div>
          <el-table
            :data="leftData.datas"
            style="width: 100%"
            :header-cell-style="rowClass">
            <el-table-column
              prop="contentName"
              :label="$t('tabs.content')"
              min-width="90%">
            </el-table-column>
            <el-table-column
              prop="createDate"
              :label="$t('tabs.subscribe_time')"
              width="180">
            </el-table-column>
          </el-table>
          <div :style="{width: '100%', textRight: 'right',background: '#fff'}">
            <el-pagination
              right
              background
              layout="prev, pager, next"
              class="pagination"
              @current-change="handleCurrentChange"
              :page-size="leftData.linesPerPage"
              :current-page.sync="leftData.pageNo"
              :total="leftData.rowCount">
            </el-pagination>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="message rightTable">
            <span :class="[$store.state.isEnglish ? 'c-white-en' : 'c-white']">{{$t('dynamic')}}</span>
          </div>
          <el-table
            :data="rightData.datas"
            style="width: 100%"
            :header-cell-style="rowClass">
            <el-table-column
              prop="resourceName"
              :label="$t('tabs.definition')"
              min-width="90%">
            </el-table-column>
            <el-table-column
              prop="contentName"
              :label="$t('tabs.attribution')"
              width="180">
            </el-table-column>
            <el-table-column
              prop="createDate"
              :label="$t('tabs.update_time')">
            </el-table-column>
          </el-table>
          <div :style="{width: '100%', textRight: 'right',background: '#fff'}">
            <el-pagination
              right
              background
              layout="prev, pager, next"
              class="pagination"
              @current-change="handleCurrentChange"
              :page-size="rightData.linesPerPage"
              :current-page.sync="rightData.pageNo"
              :total="rightData.rowCount">
            </el-pagination>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "subscriptionTable",
  props: [
    'activeName'
  ],
  data() {
    return {
      user: {},
      leftData: [],   //左边内容
      rightData: [],    //右边动态
      params: {
        userId: '',
        pageNo: 1,
        linesPerPage: 15,
        id: ''
      },
    }
  },

  watch:{
    activeName(val){
      if(val == 'mysubscription'){
        this.getSubscriptionTable();
      }
    },
  },

  methods: {
    /**
     * 获取当前用户信息
     */
    getMyProfile(){
      API.getMyProfile({
        onSucess: resp => {
          this.user = resp.data.data;
          this.getSubscriptionTable();
        } 
      })
    },
    //获取数据
    getSubscriptionTable(currentPage) { 
      if(currentPage){
        this.params.pageNo = currentPage.pageNo;
      }
      this.params.userId = this.user.id;
      API.getSubscriptions(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          if(data && data.datas){
            this.leftData = data;
          }
        } 
      });
      API.getSubscriptionsNotices(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          if(data && data.datas){
            this.rightData = data;
          }
        } 
      });
    },
    //改变表格头部的位置
    rowClass({ row, column, rowIndex, columnIndex}) {
      if(rowIndex == 0 && columnIndex == 0 && row.name == column.name){
        return 'padding-left: 25px'
      }else{
        return ''
      }
    },
    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let currentPage = {
        pageNo: val,
        linesPerPage: this.params.linesPerPage
      }
      this.getSubscriptionTable(currentPage);
    },
  },
  mounted() {
    this.getMyProfile();
  }
}
</script>