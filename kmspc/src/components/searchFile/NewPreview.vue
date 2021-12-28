<template>
  <div class="newPreview">
    <div class="message lately">
        <span :class="[$store.state.isEnglish ? 'c-white-en' : 'c-white']">{{$t('most.latest')}}</span>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      :height="clientHeight"
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
        width="300"
      >
        <template slot-scope="scope">
          <div class="operation">
            <div class="upload-div icon">
              <a class="share" :title="$t('share')" @click.stop="handleShareFileDownload(scope.row)"></a>
              <a class="load" :title="$t('btns.download')" @click.stop="handleFileDownload(scope.row.id)"></a>
              <a class="collect" :title="$t('label.collection')" @click.stop="handleCollectionDownload(scope.row)"></a>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastViewDate"
        :label="$t('tabs.time')"
        width="100">
      </el-table-column>
    </el-table>
    <!-- 收藏 -->
    <collectdialog
      :collectTreeModalParams="collectTreeModalParams"
      @handleCollectDialogClose="handleCollectDialogClose"
    ></collectdialog>
    <!-- 文件分享 -->
    <filesharedialog
      :shareTreeModalParams="shareTreeModalParams"
      @handleFileShareDialogClose="handleFileShareDialogClose"
    ></filesharedialog>
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
//收藏文件
import collectdialog from '@/components/shared/CollectDialog.vue';
//文件分享
import filesharedialog from '@/components/shared/FileShareDialog.vue';
//申请权限对话框
import applicationAuthority from '@/components/shared/ApplicationAuthority';
export default {
  name: "newPreview",
  components:{
    collectdialog,
    filesharedialog,
    applicationAuthority
  },
  props:[
    'activeName'
  ],
  data () {
    return {
      tableData: [],
      kmsFilePath: kmsFilePath,
      params:{
        pageNo: 1,
        linesPerPage: 100,
      },
      type: [],
      collectTreeModalParams: {     //文件收藏弹出层
        collectTreeModalVisible: false,
        fileId: "",
      },
      shareTreeModalParams: {     //分享弹出层
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,
        teamTreeData: []
      },
      authorityModalParams: {     //权限对话框
        fileId: "",
        authorityVisible: false,    
        type: ""   
      },
      clientHeight: ''
    }
  },

  watch: {
    activeName(name){
      if(name == 'newpreview'){
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
    //获取最新浏览的数据
    getUploadView() {
      API.getNewPreview(this.params, {
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
    /**
     * 文件下载
     */
    handleFileDownload(fileId){
      let apiParams = {
        "fileId" : fileId,
        "folder" : ''
      }; 
      API.handleSingleFileDownload(apiParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let url = kmsConfig.contextPath + "/kms/download/"+apiParams.fileId;
            window.open(url);
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403) {
            let authorityModalParams = {
              ...this.authorityModalParams,
              authorityVisible: true,
              fileId: fileId,
              type: 'download'
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
     * 收藏文件
     */
    handleCollectionDownload(obj){
      let folderId = obj.id
      this.showCollectModal(folderId);
    },
    /**
     * 收藏文件
     */
    handleShareFileDownload(obj){
      let diskId = obj.diskId;
      let folderId = obj.id;
      this.shawFileShareDialog(folderId, diskId, folderId);
    },
    /**
     * 显示收藏对话框
     */
    showCollectModal(fileId){
      const collectTreeModalParams = {     //文件收藏弹出层
        "collectTreeModalVisible": true,
        "fileId" : fileId
      };
      this.collectTreeModalParams = collectTreeModalParams;
    },

    /**
     * 取消收藏
     */
    handleCollectDialogClose(){
      const collectTreeModalParams = {     //文件收藏弹出层
        "collectTreeModalVisible": false,
        "fileId" : ""
      };
      this.collectTreeModalParams = collectTreeModalParams;
    },
    /**
     * 打开文件分享对话框
     */
    async shawFileShareDialog(fileId, diskId, folderId){
      const result = (await API.getTeamtreeData()).data;
      const treeData = JSON.parse(result.data);
      let shareTreeModalParams= {
        fileId:fileId,
        diskId: diskId,
        folderId: folderId,
        shareTreeModalVisible: true,    //移动弹出层
        teamTreeData: treeData
      }
      this.shareTreeModalParams = shareTreeModalParams;
    },
    /**
     * 取消文件分享对话框
     */
    handleFileShareDialogClose(){
      let shareTreeModalParams= {
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,    
        teamTreeData: []
      }
      this.shareTreeModalParams = shareTreeModalParams;
    },
  },
}
</script>