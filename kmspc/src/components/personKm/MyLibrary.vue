<template>
  <div class="my-library">
    <div class="toolbar">
      <div class="handle">
        <el-button size="mini" @click="handleCreateFolder">{{$t('btns.new_folder')}}</el-button>
        <!-- <el-button size="mini" @click="showEditModal" v-if="isShowUpload">{{$t('btns.new_file')}}</el-button> -->
      </div>
      <div class="uploader">
        <fileuploader
          v-if="isShowUpload" 
          :params="params"
          @onRefreshComponent="onRefreshComponent"
          @deleteUploadFile="deleteUploadFile"
          >
        </fileuploader>
      </div>
      <div class="batch" v-if="multipleSelectionArray.length > 0"> 
        <el-button size="mini" v-if="isShowUpload" @click="showLabelCategoryDialog(multipleSelection)">{{$t('btns.batch_labeling')}}</el-button>
        <el-button size="mini" @click="handleFileObjDownload">{{$t('btns.download')}}</el-button>
        <el-button size="mini" @click="showDeleteMessageBox">{{$t('btns.delete')}}</el-button>
        <el-button size="mini" @click="showMoveTreeModal(true, multipleSelectionArray, false)">{{$t('btns.move_to')}}</el-button>
      </div>
    </div>
    <!-- <div class="showMessage">
      <div class="breadcrumbMenu">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-if="breadcrumbData && breadcrumbData.length > 0" :to="{ path: '/personKm?&activeName=mylibrary&diskId='+ breadcrumbData[0].diskId +'&folderId='+ breadcrumbData[0].folderId +'&pageNo=1'}" :replace="true">{{$t('btns.all')}}</el-breadcrumb-item>
          <el-breadcrumb-item :replace="true" v-for="item in breadcrumbData" :key="item.id" :to="{ path: '/personKm?&activeName=mylibrary&diskId='+ item.diskId +'&folderId='+ item.id +'&pageNo=1'}">{{item.name}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div> -->
    <p v-if="breadcrumbData && breadcrumbData.length > 0" style="cursor: pointer; color:#606266" @click="goBack"><i class="el-icon-arrow-left"/>{{$t('btns.return_previous_level')}}</p>
    <div class="tableDiv">
      <el-table
        v-loading="loading"
        ref="multipleTable"
        tooltip-effect="dark"
        :data="knowMapTableData.datas"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :height="clientHeight"
        @sort-change="onSortChange"
        :default-sort = "{prop: 'date', order: 'descending'}">
        <el-table-column
          type="selection"
          :selectable="selectable"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('tabs.definition')"
          sortable="custom">
          <template slot-scope="scope">
              <editfloder v-if="scope.row.folder"
                v-bind="$attrs" 
                v-on="$listeners"
                :curDepartData="scope.row[scope.$index]"
                :tableList="scope"
                :disksList="knowMapTableData"
                :handleindex="scope.$index"
                :editcolumn="scope.row.isEditable ? scope.row.isEditable : false"
                @handleRenameFolderOk="handleRenameFolderOk"
                @handleRenameCancel="handleRenameCancel"
                @clickFolder="clickFolder"
               >
              </editfloder>
              <editfile v-else
                v-bind="$attrs" 
                v-on="$listeners"
                :curDepartData="scope.row[scope.$index]"
                :tableList="scope"
                :handleindex="scope.$index"
                :editcolumn="scope.row.isEditable ? scope.row.isEditable : false"
                @handleRenameFilesOk="handleRenameFilesOk"
                @handleRenameCancel="handleRenameCancel"
               >
              </editfile>
          </template>
        </el-table-column>
        <el-table-column
          prop=""
          label=""
          width="260">
          <template slot-scope="scope">
            <div class="operation">
              <div class="upload-div">
                <a class="load" :title="$t('btns.download')" @click="handleSingleFileDownload(scope.row.id, scope.row.folder)"></a>
              </div>
              <div class="onlineEdit" v-if="!scope.row.folder">
                <a class="edit" :title="$t('title.online_editing')" @click="showOnlineEditModal(scope.row)"></a>
              </div>
              <el-dropdown @command="handleCommand" v-if="isShowUpload || scope.row.name != $t('collection_directory ')">
                <span class="el-dropdown-link">
                  {{$t('btns.management')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'fileShare', record: scope.row, index: scope.$index}">{{$t('btns.share_files')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'manageReName', record: scope.row, index: scope.$index}">{{$t('btns.rename')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'movedialog', record: scope.row, index: scope.$index}">{{$t('btns.move_to')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'showDeleteConfirm', record: scope.row}">{{$t('btns.delete')}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('tabs.creator')"
          width="180"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="lastModifyDate"
          :label="$t('tabs.update_time')"
          width="180"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop=""
          :label="$t('tabs.label')"
          width="180">
          <template slot-scope="scope" v-if="!scope.row.folder">
            <div class="label-category">
              <a class="add-label-category" @click="showLabelCategoryDialog(scope.row.id)"><i class="el-icon-plus"></i></a>
              <div>
                <el-tag
                  v-for="tag in scope.row.categorysJson"
                  :key="tag.categoryName"
                  closable
                  size="mini"
                  @close="handleClose(tag,scope.row)"
                  >
                  {{tag.categoryName}}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          right
          background
          layout="prev, pager, next"
          :page-size="knowMapTableData.linesPerPage"
          :total="knowMapTableData.rowCount"
          @current-change="handleCurrentChange"
          :current-page.sync="knowMapTableData.pageNo">
        </el-pagination>
      </div>
      <div>
        <!-- 文件分享 -->
        <filesharedialog
          :shareTreeModalParams="shareTreeModalParams"
          @handleFileShareDialogClose="handleFileShareDialogClose"
        ></filesharedialog>
        <!-- 移动到 -->
        <movedialog 
          v-bind="$attrs" 
          v-on="$listeners"
          :moveTreeModalParams="moveTreeModalParams"
          @handleMoveFile="handleMoveFile"
          @handleMoveFileObj="handleMoveFileObj"
          @handleMoveDialogClose="handleMoveDialogClose"
        ></movedialog>
        <!-- 标签对话框 -->
        <labelcategorydialog
          v-bind="$attrs" 
          v-on="$listeners"
          :categorySettingsModalParams="categorySettingsModalParams"
          @handleCategoryOk="handleCategoryOk"
          @handleCategoryDialogClose="handleCategoryDialogClose"
        ></labelcategorydialog>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
import {handleTableListData, TimeToDate, getFolderIdsFileIds_url} from "@/utils/utils.js"
//引入可编辑的目录组件
import editfloder from '@/components/shared/EditFolder.vue';
//引入可编辑的文件组件
import editfile from '@/components/shared/EditFile.vue';
//上传文件
import fileuploader from '@/components/shared/FileUploader.vue';
//文件分享
import filesharedialog from '@/components/shared/FileShareDialog.vue';
// //收藏文件
// import collectdialog from '@/components/shared/CollectDialog.vue';
// //移动文件
import movedialog from '@/components/shared/MoveDialog.vue';
// //授权
// import impowertreedialog from '@/components/shared/ImpowerTreeDialog.vue';
// //标签对话框
import labelcategorydialog from '@/components/shared/LabelCategoryDialog.vue'



export default {
  name: 'mylibrary',
  components: {
    editfloder,
    editfile,
    fileuploader,
    filesharedialog,
    // collectdialog,
    movedialog,
    // impowertreedialog,
    labelcategorydialog
  },
  props: [
    'activeName'
  ],
  data() {
    return {
      user: {},
      loading: false,
      originType: {    //文件类型
        1: this.$t('label.upload'),
        2: this.$t('share')
      },
      params: {    //初始化时请求数据的参数,hash改变随之改变
        diskId: "", 
        folderId: "", 
        pageNo: 1,
        linesPerPage: 15
      },
      knowMapTableData: {},  
      multipleSelection: [],
      multipleSelectionArray: [],
      breadcrumbData: [], //面包屑得数据
      shareTreeModalParams: {     //分享弹出层
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,
        teamTreeData: []
      },
      moveTreeModalParams: {  //移动弹出层
        isObj: false,
        isfolder: false,
        diskId: "",
        fileId: "",
        moveTreeModalVisible: false,    
        treeData: []
      },
      categorySettingsModalParams: {     //贴标签弹出层
        fileId: "",
        defaultValue: [],
        categoryData: [], 
        visible: false, 
      },
      isShowUpload: false,
      isKmTeam: false,
      clientHeight: "", 
    }
  },

  watch:{
    async activeName(val){
      if(val == 'mylibrary'){
        await this.getInitData();
        await this.getKnowMapTable();
        this.getIsShowUpload();
        //50头部 40标签页 15标签页外边距 28按钮 48返回上一级 40分页 33底部版权信息
        if(this.breadcrumbData != undefined){
          this.clientHeight = `${document.documentElement.clientHeight}`- 50 - 40 - 15 - 28 - 48 - 40 - 33 +'px';
        }else{
          this.clientHeight = `${document.documentElement.clientHeight}`- 50 - 40 - 15 - 28 - 40 - 33 +'px';
        }
      }
    },
  },

  created(){
    //获取浏览器可视区域高度
    if(this.breadcrumbData != undefined){
      this.clientHeight = `${document.documentElement.clientHeight}`- 50 - 40 - 15 - 28 - 48 - 40 - 33 +'px';
    }else{
      this.clientHeight = `${document.documentElement.clientHeight}`- 50 - 40 - 15 - 28 - 40 - 33 +'px';
    }
  },

  async mounted(){
    this.loading = true;
    await this.getMyProfile();
    await this.getInitData();
    await this.getKnowMapTable();
    this.getIsShowUpload();
    this.loading = false;
  },

  methods: {
     /**
     * 获取当前用户信息
     */
    async getMyProfile(){
      const user = (await API.getMyProfileAwait()).data;
      this.user = user.data;
    },
    /**
     * 获取用户user信息
     * 获取网盘列表，并处理数据
     */
    async getInitData(){
      let user = this.user;
      let params;
      if(this.$route.query.diskId !=  undefined){
        // const routeParams = combineParams(this.$route.fullPath);
        const routeParams = this.$route.query;
        const diskId = routeParams.diskId;
        const folderId = routeParams.folderId;
        const pageNo = routeParams.pageNo;
        params = {
          ...this.params,
          'diskId': diskId, 
          'folderId': folderId, 
          'pageNo' : pageNo
        }
      }else{
        params = {
          ...this.params,
          diskId: user.id, 
          folderId: user.id
        }
      }
      const kmTeamAndRealm= (await API.getKmTeamAndRealm()).data;
      const isKmTeam=kmTeamAndRealm["kmTeam"];
      this.user = user;
      this.params = params;
      this.isKmTeam = isKmTeam;
    },

    /**
     * 是否显示上传操作
     */
    getIsShowUpload(){
      const params = this.params;
      let isShowUpload = false;
      if(params.diskId != params.folderId) {
          isShowUpload = true;
      }
      this.isShowUpload = isShowUpload;
    },

    /**
     * 获取目录路径
     * @param {*} params 
     */
    async getBreadcrumbData (params) {
      let id = "";
      if(params.diskId == params.folderId) {  //网盘根目录
          id = params.diskId;
      }else {
          id = params.folderId;
      }
      const result = (await API.getBreadcrumbData(id)).data;
      let breadcrumbData = "";
      if(result.errcode == 0) {
          breadcrumbData = result.data;
      }
      this.breadcrumbData = breadcrumbData;
    },

    /**
     * 加载我的知识体系列表
     */
    async getKnowMapTable(){
      const params =  this.params;
      const knowMapTableData = (await API.getMyLibraryList(params)).data.data;
      const datas = handleTableListData(knowMapTableData.datas);
      knowMapTableData.datas = datas;
      this.knowMapTableData = knowMapTableData;
      this.getBreadcrumbData(params);
    },

    /**
     * 刷新我的文库
     */
    async refreshKnowMapTable(refreshParams){
      const knowMapTableData = (await API.getMyLibraryList(refreshParams)).data.data;
      const datas = handleTableListData(knowMapTableData.datas);
      knowMapTableData.datas = datas;
      this.knowMapTableData = knowMapTableData;
      this.getBreadcrumbData(refreshParams);
    },

    /**
     * 修改页码
     */
    handleCurrentChange(val){
      let params = {
        ...this.params,
        pageNo: val ? val : this.params.pageNo,
      };
      this.refreshKnowMapTable(params);
    },

    //打开新建文件弹出层
    async showEditModal(){
      let result = (await API.createEmptydoc(this.params)).data;
      if(result.errcode == 0){
        // let url = "";
        // if(kmsConfig.staticContextPath){
        //   url = kmsConfig.staticContextPath + kmsConfig.kmsFilePath +'/office/vender/ntko/new.html?diskId='+ result.data.diskId +
        //   '&folderId='+ result.data.folderId +'&userName='+this.user.name+'&userId='+ this.user.id +
        //   '&type='+ result.data.type +'&url='+ result.data.url +'&id='+ result.data.id
        // }else{
        //   url = kmsConfig.kmsFilePath +'/kms/office/vender/ntko/new.html?diskId='+ result.data.diskId +
        //   '&folderId='+ result.data.folderId +'&userName='+this.user.name+'&userId='+ this.user.id +
        //   '&type='+ result.data.type +'&url='+ result.data.url +'&id='+ result.data.id
        // }
        // window.open(url);
        this.refreshKnowMapTable(this.params);
      }
    },

    //判断如果是收藏目录时不可以勾选
    selectable(row){
      if(row.folder && row.type == "1"){
        return false;
      }else{
        return true;
      }
    },

    /**
     * 下拉操作
     */
    handleCommand(obj){
      let index = obj.index;
      let diskId = obj.record.diskId;
      let folderId = obj.record.id;
      let folder = obj.record.folder;
      if(obj.command == 'fileShare'){      //收藏文件
        this.shawFileShareDialog(folderId, diskId, folderId);
      }else if(obj.command == 'manageReName'){        //重命名
        this.handleRename(index);
      }else if(obj.command == 'showDeleteConfirm'){
        this.deleteSingleFile(folderId, index, folder);
      }else if(obj.command == 'movedialog'){        //移动到
        this.showMoveTreeModal(false, folderId, folder)
      }else{
        this.handleRename(index);
      }
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

    /**
     * 新建目录（文件夹）
     */
    async handleCreateFolder(){
      const createFolder_params = this.params;
      const result = (await API.createFolder(createFolder_params)).data;
      if(result.errcode == 0){
        let createFolderData = result.data;
        let newDataArray = [];
        createFolderData.key = createFolderData.id;
        createFolderData.isEditable = true;
        const updateDate = TimeToDate(createFolderData.lastModifyDate,"YYYY-MM-DD");
        createFolderData.lastModifyDate = updateDate;
        createFolderData.isCreateFolderRow = true;
        newDataArray = [
          createFolderData,
          ...this.knowMapTableData.datas
        ];

        const knowMapTableData = {
            ...this.knowMapTableData
        }
        
        knowMapTableData.rowCount = parseInt(knowMapTableData.rowCount) +1;
        knowMapTableData.datas = newDataArray;
        this.knowMapTableData = knowMapTableData;
      }
    },

    /**
     * 点击下拉处重命名
     * @param {init} index 
     */
    handleRename(index) {
      const knowMapTableData = {...this.knowMapTableData};
      knowMapTableData.datas[index].isEditable = true;
      this.knowMapTableData = knowMapTableData;
    },

    /**
     * 重命名目录
     */
    async handleRenameFolderOk(index, row) {
      const diskId = this.params.diskId;
      let apiParams = {
        "diskId" : diskId,
        "folderId" : row.id,
        "name" : row.name
      };
      const RenameResult = (await API.handleRenameFolderOk(apiParams)).data;
      if(RenameResult.data){
        //原来的列表数据
        let dataArray = [
            ...this.knowMapTableData.datas
        ];

        if(dataArray[index].isCreateFolderRow == true) {
          let createFolderData = RenameResult.data;
          createFolderData.key = createFolderData.id;
          createFolderData.isEditable = false;
          const knowMapTableData = {
              ...this.knowMapTableData,
          }
          dataArray.splice(index,1,createFolderData);
          knowMapTableData.datas = dataArray;
          this.knowMapTableData = knowMapTableData;
        }
        this.handleRenameCancel(index);  //成功之后修改状态
        this.$message({
          type: 'success',
          message: this.$t('msg.rename_ss')
        });
      }
    },

    /**
     * 重命名文件
     * @param {fileId} 文件id
     * @param {index} 数据在整个数据的下标，修改状态值用，不需重新抓取数据
     * @param {newFileName} 新名字
     */
    async handleRenameFilesOk(index, row) {
      if(row.name.split(".")[0] == "" && row.name[0]!='.'){
        this.$message({
          type: 'warning',
          message: this.$t('msg.file_name_noempty')
        });
      }else{
        const diskId = this.params.diskId;
        let apiParams = {
          "diskId" : diskId,
          "fileId" : row.id,
          "name" : row.name
        };     
        const RenameResult = (await API.handleRenameFilesOk(apiParams)).data;
        if(RenameResult.data){
          this.handleRenameCancel(index);  //成功之后修改状态
          this.$message({
            type: 'success',
            message: this.$t('msg.rename_ss')
          });
        }
      }
    },

    /**
     * 取消重命名
     */
    async handleRenameCancel(index) {
      const knowMapTableData = {
        ...this.knowMapTableData,
      }
      if(knowMapTableData.datas[index].isCreateFolderRow) {
        const delete_fileId = knowMapTableData.datas[index].id;
        const delete_folder = knowMapTableData.datas[index].folder;
        const delete_diskId = knowMapTableData.datas[index].diskId;

        let params = {
          "diskId": delete_diskId,
          "folderId": delete_fileId,
          "fileId": delete_fileId,
          "isfolder": delete_folder
        };
        const deleteFileData = (await API.deleteFile(params)).data;
        if(deleteFileData.data){
          let newDatas = [
            ...knowMapTableData.datas.slice(0, index),
            ...knowMapTableData.datas.slice(index + 1)
          ];
          knowMapTableData.datas = newDatas;
          this.knowMapTableData = knowMapTableData;
          this.$message({
            type: 'success',
            message: this.$t('msg.new_folders_cancel')
          });
        }
      }else {
        knowMapTableData.datas[index].isEditable = false;
        this.knowMapTableData = knowMapTableData;
      }
    },

    /**
     * 勾选行时响应
     */
    handleSelectionChange(val){
      let multipleSelectionArray = [];
      let multipleSelection = [];
      if(val.length){
        val.map((e) => {
          let file = {};
          file.fileObjectId = e.id;
          file.isFolder = e.folder;
          multipleSelectionArray.push(file);
          multipleSelection.push(e.id)
        })
      }
      this.multipleSelectionArray = multipleSelectionArray;
      this.multipleSelection = multipleSelection;
    },

    /**
     * 取消选中行，分页、批量处理使用
     */
    cancelMultipleSelection() {
      this.$refs.multipleTable.clearSelection();
    },

    /**
     * 打开移动文件对话框
     * @params {isObj} 是否是批量移动
     * @params {fileId} 移动文件/目录的id(String)，或者id集合(array)
     * @params {folder} 非批量移动时，是否是单个文件或者单个目录
     */
    async showMoveTreeModal(isObj,fileId,folder) {
      const diskId = this.params.diskId;
      let selectedFileArray = []; //获取团队树结构时需要目录的id
      if(isObj) {
          selectedFileArray = this.multipleSelectionArray;
      }else {
          let single = {
              "fileObjectId" : fileId,
              "isFolder" : folder
          }
          selectedFileArray.push(single);
      }
      const treeData = (await API.getFolderstree(diskId, selectedFileArray)).data;

      let moveTreeModalParams= {
        "isObj": isObj,
        "isfolder":folder,
        "diskId" : diskId,
        "fileId": fileId,
        "moveTreeModalVisible": true,    //移动弹出层
        "treeData": JSON.parse(treeData.data)
      }
      this.moveTreeModalParams = moveTreeModalParams;
    },

    /**
     * 取消移动
     */
    handleMoveDialogClose(){
      let moveTreeModalParams= {
        "isObj": false,
        "isfolder": false,
        "diskId": "",
        "fileId": "",
        "moveTreeModalVisible": false,    //移动弹出层
        "treeData": []
      }
      this.moveTreeModalParams = moveTreeModalParams;
    },

    /**
     * 确定移动单个文件或者单个目录
     * 
     */
    async handleMoveFile(moveParams) {
       API.handleMoveFile(moveParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            const params = this.params;
            this.refreshKnowMapTable(params);
            this.$message({
              type: 'success',
              message: this.$t('msg.move_ss')
            });
          }
        },
        onError: error =>{
            this.$message({
              type: 'warning',
              message: error.response.data.errmsg
            });
        }
      })
      // if(result.data){
      //   const params = this.params;
      //   this.refreshKnowMapTable(params);
      //   this.$message({
      //     type: 'success',
      //     message: '移动成功!'
      //   });
      // }else{
      //   this.$message({
      //     type: 'error',
      //     message: result.errmsg
      //   });
      // }
    },

     /**
     * 确定移动多个文件/目录
     * @param {moveParams} 文件id
     * 
     */    
    async handleMoveFileObj(moveParams) {
       API.handleMoveFileObj(moveParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            const params = this.params;
            this.refreshKnowMapTable(params);
            this.cancelMultipleSelection();  //取消table选中行
            this.$message({
              type: 'success',
              message: this.$t('msg.move_ss')
            });
          }
        },
        onError: error =>{
            this.$message({
              type: 'warning',
              message: error.response.data.errmsg
            });
        }
      })
      // let result = await API.handleMoveFileObj(moveParams);
      // if(result.data){
      //   const params = this.params;
      //   this.refreshKnowMapTable(params);
      //   this.cancelMultipleSelection();  //取消table选中行
      //   this.$message({
      //     type: 'success',
      //     message: '移动成功!'
      //   });
      // }
    },

    /**
     * 删除单个文件
     */
    deleteSingleFile(fileId,index,folder){
      const diskid = this.params.diskId;
      const isfolder = folder;
      let folderid = "";
      if(isfolder){
        folderid = fileId;
      }else {
        folderid = this.params.folderId;
      }
      let params = {
        "diskId": diskid,
        "folderId": folderid,
        "fileId": fileId,
        "isfolder": isfolder
      };
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(async() => {
        const result = (await API.deleteFile(params)).data;
        if(result.errcode == 0){
          const params = this.params;
          this.refreshKnowMapTable(params);
          this.$message({
            type: 'success',
            message: this.$t('msg.es')
          });
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    },

    /**
     * 批量删除部门网盘
     */
    showDeleteMessageBox(){
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        API.deleteFileObj(this.params.diskId, this.multipleSelectionArray, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              const params = this.params;
              this.refreshKnowMapTable(params);
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          }
        })
      }).catch(() => {
        this.cancelMultipleSelection();
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    },

    /**
     * 单个下载
     */
    async handleSingleFileDownload(fileId,folder){
      let apiParams = {
        "fileId" : fileId,
        "folder" : folder
      }; 
      API.handleSingleFileDownload(apiParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let url = ""
            if(apiParams.folder) {
              url = kmsConfig.contextPath + "/kms/downloads?folderIds="+apiParams.fileId+"&fileIds=";
            }else{
              url = kmsConfig.contextPath + "/kms/download/"+apiParams.fileId;
            }
            window.open(url);
          }
        }
      })
    },

     /**
     * 批量下载
     */
    async handleFileObjDownload(){
      let apiParams = this.multipleSelectionArray;
      API.handleFileObjDownload(apiParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            const folderIdsFileIds_url = getFolderIdsFileIds_url(apiParams);
            let url = kmsConfig.contextPath + "/kms/downloads?"+folderIdsFileIds_url;
            this.cancelMultipleSelection();
            window.open(url);
          }
        },
        onError: err =>{
          this.$message({
            message: err.response.data.errmsg,
            type: 'warning'
          });
        }
      })
      // const fileObjDownloadResult = (await API.handleFileObjDownload(apiParams)).data;
      // if(fileObjDownloadResult.data){
      //   this.cancelMultipleSelection();
      // }
    },

    /**
      * 无权限下载时的回调函数
      * @param {fileId} 公共使用的下载函数回调返回文件的id
      */
    downloadWithout() {
      this.$message({
        type: 'info',
        message: this.$t('msg.file_download_failed')
      });
    },

    /**
     * 在线编辑
     */
    showOnlineEditModal(record){
      const user = this.user;
      let id = record.id;
      let url = record.url;
      let folderId = record.folderId;
      let userName = user.name;
      let userId = user.id;
      let apiParams = {
        "fileId" : record.id,
        "folder" : record.folder
      };
      API.getEditAbleFile(id, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let previewUrl = "";
            if(kmsConfig.staticContextPath){
              previewUrl = kmsConfig.staticContextPath + kmsConfig.kmsFilePath +'/office/vender/ntko/editDocument2.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName;
            }else{
              previewUrl = kmsConfig.kmsFilePath +'/kms/office/vender/ntko/editDocument2.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName;
            }
            window.open(previewUrl);
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {
            this.showApplyAuthorityModal(apiParams.fileId, 'edit');
          }else{
           this.$message(error.response.data.errmsg)
          }
        }
      })
    },
    /**
     * 删除单个标签
     */
    async handleClose(tag,row){
      const resultData = (await API.deleteCategory(row.id,tag.categoryName)).data;
      if(resultData.errcode == 0){
        this.handleCategoryOk();
      }
    },

    /**
     * 打开标签对话框
     */
    async showLabelCategoryDialog(fileId){
      const categorySettingsData = (await API.getCategory(fileId)).data;
      const categoryData = categorySettingsData.data;
      let defaultValueData = (await API.getFileCategorys(fileId)).data;
      if(defaultValueData == undefined){
        defaultValueData = [];
      }
      if(!categoryData){
        this.$message({
          type: 'warning',
          message: this.$t('msg.created_tags_no')
        });
      }else{
        let arr = [];
        if(defaultValueData.data){
          defaultValueData.data.map((name)=>{
            categoryData.map((labelCate)=>{
              if(labelCate.name == name){
                arr.push(labelCate.id)
              }
            })
          })
        }
        let categorySettingsModalParams= {
          'fileId' : fileId,
          'defaultValue': defaultValueData.data,
          'categoryData': categoryData,
          'visible': true,
          'labelCate': arr
        }
        this.categorySettingsModalParams = categorySettingsModalParams
      }
    },

    /**
     * 取消标签弹出层
     */
    handleCategoryDialogClose(){
      let categorySettingsModalParams= {
        fileId: "",
        defaultValue: [],
        categoryData: [],
        visible: false
      }
      this.categorySettingsModalParams = categorySettingsModalParams;
    },

    /**
     * 确定贴标签
     * 
     */    
    async handleCategoryOk() {
      const cur_params = this.params;
      this.refreshKnowMapTable(cur_params);
      this.cancelMultipleSelection();  //取消table选中行
    },

    /**
     * 进入下一级文件夹
     * @param {object} obj 
     */
    clickFolder(row){
      const folderId = row.id;
      const diskId = row.diskId;
      this.$router.push({  
        name: 'personKm',
        query: {
          ...this.params,
          "activeName": 'mylibrary',
          "diskId": diskId,
          "folderId": folderId,
        },
      })
    },

    /**
     * 文件上传成功之后刷新列表
     */
    onRefreshComponent(params){
      this.refreshKnowMapTable(params);
    },
    /**
     * 文件上传成功点击取消，这里是直接删除文件
     */
    deleteUploadFile(fileList,params){
      API.deleteFileObj(fileList.diskId, fileList.fileObject,{
        onSucess: resp => {
          if(resp.data.data){
            this.$message(this.$t('msg.upload_ca'));
            this.onRefreshComponent(params);
          }
        }
      })
    },

    /**
     * 排序
     */
    onSortChange(sorter){
      if(sorter.order){
        let orderMode = "";
        let orderByfield = "";
        if(sorter.order == "descending"){
          orderMode = "DESC";
        }else if(sorter.order == "ascending"){
          orderMode = "ASC";
        }
        switch(sorter.prop) {
          case "name" :
            orderByfield = (sorter.prop).toUpperCase();
            break;
          case "lastModifyDate" :
            orderByfield = "LAST_MODIFY_DATE";
            break;
          case "creator" :
            orderByfield = (sorter.prop).toUpperCase();
            break;
        }
        const sorter_params = {
          ...this.params,
          orderByfield : orderByfield,
          orderMode : orderMode
        };
        this.refreshKnowMapTable(sorter_params);
      }
    },

    /**
     * 返回上一级
     * */
    goBack(){
      if(this.breadcrumbData.length > 0){
        this.$router.push({
          path: '/personKm?&activeName=mylibrary&diskId='+ this.breadcrumbData[this.breadcrumbData.length - 1].diskId +'&folderId='+ this.breadcrumbData[this.breadcrumbData.length - 1].folderId +'&pageNo=1'
        })
      }
    }


  }
}
</script>