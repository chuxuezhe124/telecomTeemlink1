<template>
<div class="departmentKm">
    <div class="deptKm" :class="{'paddingTop':paddingTop}" name="departmentKm">
      <div class="dept-header" ref="deptHead">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
          <el-menu-item v-for="(item, index) in disksData" :key="item.id" :index="String(index)">{{item.name}}</el-menu-item>
        </el-menu>
      </div>
      <div class="dept-body"> 
         <div class="treeSearch">
       <div class="search">
        <el-input v-model="params.fileName" size="mini" :placeholder="$t('placeholder.name')" icon="el-icon-search" @change="onSearchChange">
          <el-button slot="append" icon="el-icon-search" size="mini" @click="onSearchChange"></el-button>
        </el-input>
      </div>
      <el-tree 
      :data="data" 
       node-key="id"
       class="depkmTree"
      :props="defaultProps" 
      >
      <span class="custom-tree-node" slot-scope="{ node, data }" @mouseover="mouseover(data)" @mouseleave="mouseout(data)">
      <span>{{ node.label }}</span>
      <div v-show="data.dropdownShow" @click.stop="()=>{}" >
        <!-- <div style="display:flex">
                  <span @click="addModules(data.id)">
                    <i class="addModule el-icon-plus d-none" style="position:absolute;right:40px;line-height:5px;color:#409EFF;padding-right:8px;"></i>
                  </span>
                  <span @click="delectModules(data.id)">
                    <i class="delModule el-icon-edit-outline d-none" style="position:absolute;right:30px;line-height:5px;color:#409EFF;"></i>
                  </span>
                  <span @click="delectModules(data.id)">
                    <i class="delModule el-icon-delete d-none" style="position:absolute;right:10px;line-height:5px;color:#409EFF;"></i>
                  </span>

          </div> -->
        <el-dropdown placement="right-start" trigger="click">
          <i class="el-icon-s-operation"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-plus" @click.native="addPeerTree(node,data)">新增同级</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus" @click.native="addChildrenTree(node,data)">新增下级</el-dropdown-item>
            <el-dropdown-item icon="el-icon-edit-outline" @click.native="updateTree(node,data)">修改</el-dropdown-item>
            <el-dropdown-item icon="el-icon-delete-solid" @click.native="delTree(node,data)">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </span>
      </el-tree> 
    </div>
        <department-km-data 
          ref="multipleTable"
          :breadcrumbData="breadcrumbData"
          :multipleSelection="multipleSelection"
          :multipleSelectionArray="multipleSelectionArray"
          :params="params"
          :curDiskParams="curDiskParams"
          :showNewFloderBtn="showNewFloderBtn"
          :previewCount="previewCount"
          :downloadCount="downloadCount"
          :disksAdminsCount="disksAdminsCount"
          :disksList="disksFoldersList" 
          :loading="loading"
          v-on:clickFolder="clickFolder"
          v-on:handleRenameFolderOk="handleRenameFolderOk"
          v-on:handleRenameFilesOk="handleRenameFilesOk"
          v-on:handleRenameCancel="handleRenameCancel"
          v-on:handleMoveFile="handleMoveFile"
          v-on:handleMoveFileObj="handleMoveFileObj"
          v-on:handleCategoryOk="handleCategoryOk"
          v-on:showApplyAuthorityModal="showApplyAuthorityModal"
          v-on:closeWindow="closeWindow"
          v-on:closeTage="closeTage"
          @loadDisksFolderListAciton="loadDisksFolderListAciton"
          @handleCreateFolder="handleCreateFolder"
          @handleSelectionChange="handleSelectionChange"
          @handleSingleFileDownload="handleSingleFileDownload"
          @handleFileObjDownload="handleFileObjDownload"
          @showOnlineEditModal="showOnlineEditModal"
          @showDeleteMessageBox="showDeleteMessageBox"
          @onSearchChange="onSearchChange"
          @stickFolder="stickFolder"
          @cancelStickFolder="cancelStickFolder"
          @getdisksData="getdisksData"
          @onlineCoEdit="onlineCoEdit"
          >
        </department-km-data>
      </div>
      <div>
        <el-dialog
          :title="$t('form.apply_permission')"
          :visible.sync="applyModalParams.applyModalvisible"
          width="40%"
          :before-close="handleApplyModalHide">
          <div>
            <el-form label-position="right" label-width="120px">
              <el-form-item :label="$t('form.permission')">
                <el-checkbox-group v-model="formParams.operations" @change="onChangeAuthority">
                  <el-checkbox label="download">{{$t('btns.download')}}</el-checkbox>
                  <el-checkbox label="preview">{{$t('label.preview')}}</el-checkbox>
                  <el-checkbox label="edit">{{$t('btns.edit')}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item :label="$t('form.reason_application')">
                <el-input v-model="formParams.reason"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.approver')">
                <el-input v-model="approver" :disabled="true"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="handleApplyModalHide">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="handleSubmit">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
</div>
</template>

<script>
import API from "@/api.js";
import { combineParams, TimeToDate, getFolderIdsFileIds_url } from '@/utils/utils.js';
import DepartmentKmData from '@/components/departmentKm/DepartmentKmData.vue'
export default {
  name: 'departmentKm',
  components: {
    DepartmentKmData
  },
  data() {
    return {
      activeIndex: '0',
      loading: true,
      user: {},         //获取用户信息
      disksData: [],    //部门网盘
      disksFoldersList: {},  //列表数据
      multipleSelection: [],
      multipleSelectionArray: [],
      breadcrumbData: [], //面包屑得数据
      breadcrumbStirng : "",    //面包屑，字符串
      previewCount: "",   //网盘预览量
      downloadCount: "",  //网盘下载量
      disksAdminsCount: "",  //网盘的管理员
      initParams: {   //初始化时请求数据的参数，hash回退时用
        fileName: "",
        diskId: "", 
        folderId: "",
        pageNo: 1,
        linesPerPage: 15
      }, 
      params: {    //初始化时请求数据的参数,hash改变随之改变
        fileName: "",
        diskId: "", 
        folderId: "",
        pageNo: 1,
        linesPerPage: 15
      }, 
      curDiskParams: {},   //当前选中网盘的参数
      showNewFloderBtn: true,
      applyModalParams: {  //申请权限弹出层参数
        "resourceId": "",
        "applyModalvisible" : false,
        "previewDefault" : false,
        "downloadDefault" : false,
        "editDefault": false
      },
      approver: "",
      formParams : {
        "operations": [],
        "download" : false,
        "preview" : false,
        "edit": false,
        "reason" : ""
      },
      paddingTop: false,    //头部padding
    defaultProps: {
        label: "name",
        children: "zones",
        isLeaf: "hasChild",
      },//规定树节点标签的值
      defaultExpandKey:[],
       data: [{
          id: 1,
          label: '研究院',
          children: [{
            id: 3,
            label: '部门1',
            children: [{
              id: 4,
              label: '项目1'
            }, {
              id: 5,
              label: '项目2',
              disabled: true
            }]
          }, {
            id: 2,
            label: '部门2',
            disabled: true,
            children: [{
              id: 6,
              label: '项目1'
            }, {
              id: 7,
              label: '项目2',
              disabled: true
            }]
          }]
        }],


        defaultProps: {
          id:"id",
          children: 'children',
          label: 'label'
        }
    };
  },
  mounted() {
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
    this.getMyProfile();
  },
  methods: {
     mouseover (data) { // 移入
      this.$set(data, 'dropdownShow', true)
    },
    mouseout (data) { // 移除
      this.$set(data, 'dropdownShow', false)
    },
    addPeerTree(node,data){
      console.log(node,data)
    const newChild = { id: node.id++, label: 'testtest', children: [] };
    data.push(newChild);  
    },
  //   addChildrenTree(node,data){
  //  const newChild = { id: id++, label: 'testtest', children: [] };
  //       if (!data.children) {
  //         this.$set(data, 'children', []);
  //       }
  //       data.children.push(newChild);
  //   },
    /**
     * 模块树节点展开时触发的事件
     */
    nodeExpand(data){
      this.defaultExpandKey.push(data.id)
    },

    /**
     * 模块树节点关闭是触发的事件
     */
    nodeCollapse(data){
      for(let i = 0; i < this.defaultExpandKey.length; i++){
        if(this.defaultExpandKey[i] == data.id){
          this.defaultExpandKey = [...this.defaultExpandKey.slice(0, i), ...this.defaultExpandKey.slice(i + 1)]
          break;
        }
      }
    },
      handleNodeClick(data) {
        console.log(data);
      },
    /**
     * 获取当前用户信息
     */
    getMyProfile(){
      API.getMyProfile({
        onSucess: resp => {
          this.user = resp.data.data;
          this.getdisksData();
        } 
      })
    },
    closeWindow(diskId){
      this.getViewsAndDownloads(diskId);
    },
    /**
     * 部门网盘
     */
    getdisksData() {
      this.params.linesPerPage = 999;
      API.getdisksData(this.params,{
        onSucess: resp => {
          this.disksData = resp.data.data.datas;
          if(resp.data.data.datas.length>0){
            this.handleDisksFolderListData(this.user, this.disksData);
          }else{
            //当无部门时，显示无数据
            this.disksFoldersList = {};
            this.loading = false;
          }
        } 
      })
    },

    /**
     * 处理网盘列表数据,初始化，分两种情况，第一种是hash不带参数，第二种是hash带了参数
     */
    handleDisksFolderListData(user, disks){
      let curParams = {
        ...this.params
      }
      let showNewFloderBtn = this.showNewFloderBtn;
      if(this.$route.query.fileName !=  undefined){
        const params = combineParams(this.$route.fullPath);
        const fileName = params.fileName;
        const curDiskId = params.diskId;
        const curFolderId = params.folderId;
        disks.map((e,key) => {
          let active = "";
          if(e.id == curDiskId){
            active = String(key);
            this.activeIndex = active;
          }
        })
        curParams.fileName = fileName;
        curParams.diskId = curDiskId;
        curParams.folderId = curFolderId;
      }else{
        let owner = false;
        if(disks != undefined){
          disks.map((e,key) => {
            let active = "";
            let activeIndex = "";
            if(user.defaultDepartment == e.ownerId){
              activeIndex = String(key);
              active = "activeIndex";
              owner = true;
              this.activeIndex = activeIndex;
            }
            disks[key].active = active;
          })
          if(owner){
            for(let i=0;i<disks.length;i++){
              if(disks[i].active){
                curParams.diskId = disks[i].id;
                curParams.folderId = disks[i].id;
              }
            }
          }else{
            curParams.diskId = disks[0].id;
            curParams.folderId = disks[0].id;
          }
        }else{
          showNewFloderBtn = false;
        }
      }
      let initParams = {...curParams};
      this.initParams = initParams;
      this.params = initParams;
      this.showNewFloderBtn = showNewFloderBtn;
      //获取当前网盘的文件列表
      this.loadDisksFolderListAciton(curParams);
      //获取当前网盘的预览量和下载量
      this.getViewsAndDownloads(curParams.diskId);
      //获取当前网盘的网盘管理员
      // this.getDiskAdmins(curParams.diskId);
      //设置状态curDiskParams
      this.getCurDiskParams(this.activeIndex);
    },

    /**
     * 获取当前网盘的文件列表
     */
    loadDisksFolderListAciton(params){
      API.getDisksFoldersList(params, {
        onSucess: resp => {
          this.disksFoldersList = resp.data.data;
          this.$store.commit('addDisksFoldersList', resp.data.data);
          this.getBreadcrumbData(params);
        }
      })
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
     * 获取当前网盘的预览量和下载量
     * @param {String} diskId 
     */
    async getViewsAndDownloads(diskId) {
      const result = (await API.getViewsAndDownloads(diskId)).data;
      if(result.errcode == 0) {
        const data = result.data;
        this.previewCount = data.views;
        this.downloadCount = data.downloads;
      }
      this.loading = false;
    },

    /**
     * 获取当前网盘的网盘管理员
     * @param {String} diskId 
     */
    async getDiskAdmins(diskId) {
      const result = (await API.getDiskAdmins(diskId)).data;
      if(result.errcode == 0) {
        const data = result.data;
        let disksAdminsCount = "";
        if(data != undefined){
          data.map((item)=>{
            disksAdminsCount += item.name;
            disksAdminsCount += ",";
          })
        }
        if(disksAdminsCount.length > 0 ) {
          disksAdminsCount = disksAdminsCount.substr(0,disksAdminsCount.length-1);
        }
        this.disksAdminsCount = disksAdminsCount
      }else {
        this.$message({
          type: 'info',
          message: result.errmsg
        });
      }
      this.loading = false;
    },

    /**
     * 菜单激活回调
     */
    handleSelect(index) {
      this.loading = true;
      let params = "";
      let diskId = "";
      let folderId = ""
      this.disksData.map((e,key) => {
        if(key == index){
          diskId = e.id;
          folderId = e.id;
        }
      })
      params = {
        ...this.params,
        diskId: diskId,
        folderId: folderId,
        pageNo: 1
      }
      this.params = params;
      this.getCurDiskParams(index);
      this.loadDisksFolderListAciton(params);
      this.getViewsAndDownloads(params.diskId);
      //获取当前网盘的网盘管理员
      this.getDiskAdmins(params.diskId);
    },

    /**
     * 获取当前网盘的信息并设置curDiskParams
     */
     getCurDiskParams (index) {
      let disks = this.disksData;
      let curDiskParams = {};
      disks.map((e,key) => {
        if(key == Number(index)){
          curDiskParams = e;
        }
      });
      this.curDiskParams = curDiskParams;
     },

    /**
     * 查询列表
     */
    onSearchChange(val){
      let params = {
        ...this.params,
        pageNo: val ? val : this.params.pageNo,
      };
     this.loadDisksFolderListAciton(params);
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
          file.creatorId = e.creatorId;
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
     * 在线编辑
     */
    showOnlineEditModal(record){
      const user = this.user;
      let id = record.id;
      let url = record.url;
      let filename=record.name
      let folderId = record.folderId;
      let userName = user.name;
      let userId = user.id;
      let editType=record.editType==='tary'? 'editDocument2':'onlyoffice';//判断在线编辑的方式
      let apiParams = {
        "fileId" : record.id,
        "folder" : record.folder
      };
      API.getEditAbleFile(id, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let previewUrl = "";
            if(kmsConfig.staticContextPath){
              previewUrl = kmsConfig.staticContextPath + kmsConfig.kmsFilePath +'/office/vender/ntko/'+editType+'.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename;
            }else{
              previewUrl = kmsConfig.kmsFilePath +'/kms/office/vender/ntko/'+editType+'.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename;
            }
            window.open(previewUrl);
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {
            this.showApplyAuthorityModal(apiParams.fileId, 'edit');
          }else{
            this.$toast(error.response.data.errmsg);
          }
        }
      })
    },
    onlineCoEdit(record){
     const user = this.user;
      let id = record.id;
      let url = record.url;
      let filename=record.name
      let folderId = record.folderId;
      let userName = user.name;
      let userId = user.id;
      let editType=record.editType;//判断在线编辑的方式
      let apiParams = {
        "fileId" : record.id,
        "folder" : record.folder
      };
       API.getOnlyofficeKey(id, {
        onSucess: resp => {
            let previewUrl = "";
            if(kmsConfig.staticContextPath){
             previewUrl = kmsConfig.staticContextPath + kmsConfig.kmsFilePath +'/office/vender/ntko/'+editType+'.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename+"&key="+resp.data;
            }else{
              previewUrl = kmsConfig.kmsFilePath +'/kms/office/vender/ntko/'+editType+'.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename+"&key="+resp.data;
            }
            window.open(previewUrl);
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {
            this.showApplyAuthorityModal(apiParams.fileId, 'edit');
          }else{
            this.$toast(error.response.data.errmsg);
          }
        }
      })

    },

    /**
     * 单个下载
     * @param {fileId} 文件id/目录id
     * @param {folder} 是否是目录
     */
    handleSingleFileDownload(fileId,folder){
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
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {          
            this.showApplyAuthorityModal(apiParams.fileId, 'download');
          }else{
            this.$toast(error.response.data.errmsg);
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
              let params = this.params;
              this.loadDisksFolderListAciton(params);
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
     * 新建目录（文件夹）
     * 返回数据改变状态，不再请求数据
     */
    async handleCreateFolder() {
      const createFolder_params = this.params;
      if(createFolder_params.diskId == ""){
        this.$message.error(this.$t('msg.create_department'));
      }else{
        const result = (await API.createFolder(createFolder_params)).data;
        if(result.errcode == 0){
          let createFolderData = result.data;
          let newDataArray = [];
          createFolderData.key = createFolderData.id;
          createFolderData.isEditable = true;
          createFolderData.lastModifyDate = TimeToDate(createFolderData.lastModifyDate,"YYYY-MM-DD");
          createFolderData.isCreateFolderRow = true;
  
          newDataArray = [
            createFolderData,
            ...this.$store.state.disksFoldersList.datas
          ];
  
          const disksFoldersList = {
            ...this.$store.state.disksFoldersList
          }
          disksFoldersList.rowCount = parseInt(disksFoldersList.rowCount) +1;
          disksFoldersList.datas = newDataArray;
          this.$store.commit('addDisksFoldersList', disksFoldersList);
          this.disksFoldersList = this.$store.state.disksFoldersList;
        }
      }
    },

    /**
     *  重命名目录
     * @param {fileId} 目录id
     * @param {index} 数据在整个数据的下标，修改状态值用，不需重新抓取数据
     * @param {newFileName} 新名字
     */
    async handleRenameFolderOk(index, row){
      const diskId = this.params.diskId;
      let apiParams = {
        "diskId" : diskId,
        "folderId" : row.id,
        "name" : row.name
      };
      
      const RenameResult = (await API.handleRenameFolderOk(apiParams)).data;
      if(RenameResult.errcode == 0){
        let dataArray = [
          ...this.disksFoldersList.datas
        ]
        if(dataArray[index].isCreateFolderRow == true){
          let createFolderData = RenameResult.data;
          createFolderData.key = createFolderData.id;
          createFolderData.isEditable = false;

          dataArray.splice(index,1,createFolderData);
          const disksFoldersList = {
              ...this.disksFoldersList
          }
          disksFoldersList.datas = dataArray;
          this.$store.commit('addDisksFoldersList', disksFoldersList)
          this.disksFoldersList = this.$store.state.disksFoldersList;
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
    async handleRenameCancel(index){
      let dataArray = [
        ...this.$store.state.disksFoldersList.datas
      ];
      dataArray[index].isEditable = false;
  
      if(dataArray[index].isCreateFolderRow) {
        const delete_fileId = dataArray[index].id;
        const delete_folder = dataArray[index].folder;
        const delete_diskId = dataArray[index].diskId;
        // const delete_folderId = dataArray[index].folderId;

        let params = {
          diskId: delete_diskId,
          folderId: delete_fileId,
          fileId: delete_fileId,
          isfolder: delete_folder
        };
        const deleteFileData = (await API.deleteFile(params)).data;
        if(deleteFileData.data){
          this.$store.commit('deleteDisksFoldersList', index);
          this.$message({
            type: 'success',
            message: this.$t('msg.new_folders_cancel')
          });
        }
      }else {
        //包括分页的列表数据
        const disksFoldersList = {
            ...this.$store.state.disksFoldersList
        }
        disksFoldersList.datas = dataArray;
        this.$store.commit('addDisksFoldersList', disksFoldersList);
        this.disksFoldersList = disksFoldersList;
      }
    },

    /**
     * 进入下一级文件夹
     * @param {object} obj 
     */
    clickFolder(row){
      const folderId = row.id;
      const diskId = row.diskId;
      //获取时间格式，防止跳转路由和地址相同时，路由不会跳转
      let date = new Date();
      this.$router.push({  
        name: 'departmentKm',
        query: {
          "fileName" : "",
          "diskId": diskId,
          "folderId": folderId,
          "pageNo" : 1,
          "dete": date.getTime()
        }
      })
    },

    /**
     * 文件夹置顶(仅企业管理员的功能)
     */
    async stickFolder(diskId,id) {
      const result = (await API.stickFolder(diskId,id)).data;
      if(result.errcode == 0){
        this.$message({
          type: 'success',
          message: this.$t('msg.folder_top_ss')
        });
        const cur_params = {...this.params};
        this.loadDisksFolderListAciton(cur_params);
      }
    },

    /**
     * 文件夹取消置顶(仅企业管理员的功能)
     */
    async cancelStickFolder(diskId,id) {
      const result = (await API.cancelStickFolder(diskId,id)).data;
      if(result.errcode == 0){
        this.$message({
          type: 'success',
          message: this.$t('msg.folder_untop_ss')
        });
        const cur_params = {...this.params};
        this.loadDisksFolderListAciton(cur_params);
      }
    },
    /**
     * 确定移动单个文件或者单个目录
     * 
     */
    async handleMoveFile(moveParams) {
      API.handleMoveFile(moveParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            const cur_params = this.params;
            this.loadDisksFolderListAciton(cur_params);
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
      // let result = (await API.handleMoveFile(moveParams)).data;
      // if(result.data){
      //   const cur_params = this.params;
      //   this.loadDisksFolderListAciton(cur_params);
      //   this.$message({
      //     type: 'success',
      //     message: '移动成功!'
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
            const cur_params = this.params;
            this.loadDisksFolderListAciton(cur_params);
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
      //   const cur_params = this.params;
      //   this.loadDisksFolderListAciton(cur_params);
      //   this.cancelMultipleSelection();  //取消table选中行
      //   this.$message({
      //     type: 'success',
      //     message: '移动成功!'
      //   });
      // }
    },
    /**
     * 删除单个标签
     */
    closeTage(){
      this.handleCategoryOk();
    },
     /**
     * 确定贴标签
     * 
     */    
    async handleCategoryOk() {
      const cur_params = this.params;
      this.loadDisksFolderListAciton(cur_params);
      this.cancelMultipleSelection();  //取消table选中行
    },

    /**
      * 单个文件/目录下载若没权限需设置fileId和打开申请权限弹出层
      *@param {fileId} 文件id/目录id
      */
    async showApplyAuthorityModal(fileId, type) {
      let  _download = false;
      let _preview = false;
      let _edit = false;
      switch(type) {
        case "preview" : 
          _preview = true;
          break;
        case "download" : 
          _download = true;
          break;
        case "edit":
          _edit = true;
      }
      //获取审批人
      API.getResourceApprover(fileId, {
        onSucess: resp => {
          this.approver = resp.data.data;
          this.formParams.operations = [type];
          this.formParams.download = _download;
          this.formParams.preview = _preview;
          this.formParams.edit = _edit;
          let applyModalParams = {
            ...this.applyModalParams,
            "resourceId": fileId,
            "previewDefault": _preview,
            "downloadDefault": _download,
            "editDefault": _edit,
            "applyModalvisible" : true,
          }
          this.applyModalParams = applyModalParams;
        },
      })
    },

    //隐藏申请权限模态框
    handleApplyModalHide() {
      let applyModalParams = {
        ...this.applyModalParams,
        "applyModalvisible" : false,
        "resourceId" : "",
        "previewDefault": false,
        "downloadDefault": false,
        "editDefault": false
      }
      this.applyModalParams = applyModalParams;
      //隐藏申请权限对话框把申请理由清空
      this.formParams.reason = "";
    },

     /**
     * 选择申情的权限
     */
     onChangeAuthority(checkedValues) {
      let download = false;
      let preview = false;
      checkedValues.map((item) => {
        if(item == "download") {
          download = true;
        }else if(item == "preview") {
          preview = true;
        }
      });
      let formParams = {
        ...this.formParams,
        "download": download,
        "preview": preview
      }
      this.formParams = formParams;
    },

     /**
     * 提交申请
     */
    async handleSubmit(){
      let that = this;
      if(!this.formParams.download && !this.formParams.preview && !this.formParams.edit) {   //不勾选权限，提示
        this.$message({
          type: 'warning',
          message: this.$t('msg.least_permission_sl')
        });
      }else if(!this.approver){
        this.$message({
          type: 'warning',
          message: this.$t('msg.no_approver_current')
        });
      }else {
        const params = {
          download: this.formParams.download,
          preview: this.formParams.preview,
          edit: this.formParams.edit,
          reason: this.formParams.reason,
          resourceId: this.applyModalParams.resourceId
        }
        const result = (await API.applyAuthority(params)).data;
        if(result.errcode == 0) {
          this.$message({
            type: 'success',
            message: this.$t('msg.approval_admin_wa')
          });
          let applyModalParams = {
            ...this.applyModalParams,
            "resourceId": "",
            "applyModalvisible" : false,
            "previewDefault" : false,
            "downloadDefault" : false,
            "editDefault": false
          }
          this.applyModalParams = applyModalParams;
          //申请成功后，将申请理由清空
          that.formParams.reason = "";
        }
      }
    },

  }
}
</script>
<style scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 10px;
    height:100%
 }
</style>