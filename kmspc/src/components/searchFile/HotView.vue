<template>
  <div class="hotView">
    <div class="message lately">
        <span :class="[$store.state.isEnglish ? 'c-white-en' : 'c-white']">{{$t('most.hottest')}}</span>
    </div>
    <el-table
      :data="tableData"
      :height="clientHeight"
      style="width:100%"
      @row-click="previewClick"
      :header-cell-style="rowClass">
      <el-table-column
        prop="name"
        :label="$t('tabs.definition')"
        min-width="200px">
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
        prop="views"
        :label="$t('tabs.viewed')"
        width="100">
      </el-table-column>
    </el-table>
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
import { TimeToDate, getClientHeight, filePreview } from "@/utils/utils.js";
//申请权限对话框
import applicationAuthority from '@/components/shared/ApplicationAuthority'
export default {
  name: "hotView",
  props:[
    'activeName'
  ],
  components:{
    applicationAuthority
  },
  data () {
    return {
      tableData: [],
      authorityModalParams: {     //权限对话框
        fileId: "",
        authorityVisible: false,    
        type: ""   
      },
      params:{
        pageNo: 1,
        linesPerPage: 100,
      },
      type: [],
      clientHeight: '',
      kmsFilePath: kmsFilePath
    }
  },

  watch: {
    activeName(name){
      if(name == 'hotview'){
        //获取浏览器可视区域高度
        this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
        this.getUploadView();
      }
    }
  },

  created(){
    //获取浏览器可视区域高度
    this.clientHeight = getClientHeight(this.$store.state.isShowHeard)
  },

  mounted () {
    this.getUploadView();
  },

  methods: {
    //获取最热文章的数据
    getUploadView() {
      API.getHotView(this.params, {
        onSucess: resp => {
          let data = resp.data.data;
          if(data.datas){
            //获取时间进行格式转换
            for(let i=0;i<data.datas.length;i++){
              if(data.datas[i].createDate){
               data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD");
              }
            } 
          }
          this.tableData = data.datas;
        } 
      })
    },
    //点击列进入预览查看
    previewClick(row) {
      API.getPreviewAble(row.id,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let that = this;
            let params = {
              staticContextPath: kmsConfig.staticContextPath,
              kmsFilePath: kmsConfig.kmsFilePath,
              diskId: row.diskId,
              fileId: row.id,
              collected: row.collects,
              fileObj: row
            }
            let url = filePreview(params);
            let $windowOpen = window.open(url);
            //关闭新窗口回调方法
            let loop = setInterval(function() {     
              if($windowOpen  != null && $windowOpen.closed) {   
                clearInterval(loop);    
                //do something 在这里执行回调
                that.getUploadView();
              }    
            }, 500); 
          }
        },
        onError: error => {
          if(error.response.data && error.response.data.errcode == 403){
            let authorityModalParams = {
              ...this.authorityModalParams,
              authorityVisible: true,
              fileId: row.id,
              type: 'preview'
            }
            this.authorityModalParams = authorityModalParams;
          }
        }
      })
    },
    //申请权限确定
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
    //动态获取类名
    setClass(key) {
      let obj = "icon-file icon-file-"+ key.type;
      return obj;
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
 
}
</script>