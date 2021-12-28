<template>
  <div class="shareList">
    <el-table
    :data="tableData.datas"
    style="width: 100%"
    :height="clientHeight"
    @row-click="previewClick"
    :default-sort = "{prop: 'date', order: 'descending'}"
    >
    <el-table-column
      prop="name"
      :label="$t('tabs.definition')"
      sortable
      min-width="75%">
      <template slot-scope="scope">
        <img 
          v-if="scope.row.type=='jpg' || scope.row.type=='png' || scope.row.type=='gif'"
          :src="kmsFilePath+'/uploads/kms/'+scope.row.url"
          class="icon-file"/>
        <i :class="setClass(scope.row)" v-else></i>
        <span>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="lastShareDate"
      :label="$t('tabs.update_time')"
      sortable
      min-width="20%">
    </el-table-column>
  </el-table>
  <div class="pagination">
    <el-pagination
      right
      background
      layout="prev, pager, next"
      :page-size="tableData.linesPerPage"
      :total="tableData.rowCount"
      @current-change="handleCurrentChange"
      :current-page.sync="tableData.pageNo">
    </el-pagination>
  </div>
  <!-- 权限对话框 -->
    <application-authority 
      :visible.sync="authorityModalParams.authorityVisible" 
      :authorityModalParams="authorityModalParams"
      @onAuthiority="onAuthiority">
    </application-authority>
  </div>
</template>
<script>
import API from "@/api.js";
import { getClientHeight, filePreview } from "../../utils/utils.js";
//申请权限对话框
import applicationAuthority from '@/components/shared/ApplicationAuthority';
export default {
  name: "shareList",
  props: [
    'activeName'
  ],
  components:{
    applicationAuthority
  },
  data() {
    return {
      user: {},
      tableData: [],
      params: {
        userId: '',
        orderByfield: 'LAST_MODIFY_DATE',
        orderMode: 'DESC',
        linesPerPage: 15,
        pageNo: 1
      },
      clientHeight: '',
      authorityModalParams: {     //权限对话框
        fileId: "",
        authorityVisible: false,    
        type: ""   
      },
      kmsFilePath: kmsFilePath
    }
  },

  watch:{
    activeName(val){
      if(val == 'sharelist'){
        this.getShareList();
        this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
      }
    },
  },

  created(){
    //获取浏览器可视区域高度
    this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
  },

  methods: {
    /**
     * 获取当前用户信息
     */
    getMyProfile(){
      API.getMyProfile({
        onSucess: resp => {
          this.user = resp.data.data;
          this.getShareList();
        } 
      })
    },
    //获取列表数据
    getShareList(currentPage){
      if(currentPage){
        this.params.pageNo = currentPage.pageNo;
      }
      const user = this.user;
      this.params.userId = user.id;
      API.getShareList(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          this.tableData = data;
        } 
      })
    },
    //动态获取类名
    setClass(key) {
      let obj = "icon-file icon-file-"+ key.type;
      return obj;
    },
    /**
     * 点击列进入预览查看
     */
    previewClick(row) {
      API.getPreviewAble(row.id,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let params = {
              staticContextPath: kmsConfig.staticContextPath,
              kmsFilePath: kmsConfig.kmsFilePath,
              diskId: row.diskId,
              fileId: row.id,
              collected: row.collects,
              fileObj: row
            }
            let url = filePreview(params);
            window.open(url);
          }
        },
        onError: error => {
          if(error.response.data.errcode == 403) {
            let authorityModalParams = {
              ...this.authorityModalParams,
              authorityVisible: true,
              fileId: row.id,
              type: 'preview'
            }
            this.authorityModalParams = authorityModalParams;
          }else{
            this.$message({
              type: 'warning',
              message: error.response.data.errmsg
            });
          }
        }
      })
    },
    /**
     * 申请权限确定
     */
    onAuthiority(value) {
      API.appAuthority(value,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.authorityModalParams.authorityVisible = false;
            this.$message(this.$t('msg.approval_admin_wa'));
          }
        },
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
      this.getShareList(currentPage);
    },
  },
  mounted() {
    this.getMyProfile();
  }
}
</script>