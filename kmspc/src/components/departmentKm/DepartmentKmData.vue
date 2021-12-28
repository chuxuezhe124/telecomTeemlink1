<template>
  <div class="dept-content">
    <div class="toolbar">
      <div class="handle">
        <el-button size="mini" v-if="showNewFloderBtn && isShowCreateFolder" @click="handleCreateFolder">{{$t('btns.new_folder')}}</el-button>
        <!-- <el-button size="mini" v-if="showNewFloderBtn && user.level == level.ROLE_LEVEL_SUPERADMIN ||(showNewFloderBtn && user.defaultDepartment == curDiskParams.ownerId)" @click="showEditModal">{{$t('btns.new_file')}}</el-button> -->
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
      <div class="uploader">
        <folderuploader
          v-if="isShowUpload" 
          :params="params"
          @onRefreshComponent="onRefreshComponent"
          @deleteUploadFile="deleteUploadFile"
          >
        </folderuploader>       
      </div>
      <!-- 出现多选的情况,出现新的按键-->
      <div class="batch" v-if="multipleSelectionArray.length > 0"> 
        <el-button size="mini" @click="showLabelCategoryDialog(multipleSelection)">{{$t('btns.batch_labeling')}}</el-button>
        <el-button size="mini" @click="handleFileObjDownload">{{$t('btns.download')}}</el-button>
        <el-button size="mini" v-if="isShowBathDelete" @click="showDeleteMessageBox">{{$t('btns.delete')}}</el-button>
        <el-button size="mini" v-if="isShowBath" @click="showMoveTreeModal(true, multipleSelectionArray, false)">{{$t('btns.move_to')}}</el-button>
      </div>
      <div class="search">
        <el-input v-model="params.fileName" size="mini" :placeholder="$t('placeholder.name')" icon="el-icon-search" @change="onSearchChange">
          <el-button slot="append" icon="el-icon-search" size="mini" @click="onSearchChange"></el-button>
        </el-input>
      </div>
    </div>
    <div class="showMessage">
      <div class="breadcrumbMenu">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-if="breadcrumbData && breadcrumbData.length > 0" :to="{ path: '/departmentKm?fileName=&diskId='+ breadcrumbData[0].diskId +'&folderId='+ breadcrumbData[0].folderId +'&pageNo=1'}" :replace="true">{{$t('btns.all')}}</el-breadcrumb-item>
          <el-breadcrumb-item :replace="true" v-for="item in breadcrumbData" :key="item.id" :to="{ path: '/departmentKm?fileName=&diskId='+ item.diskId +'&folderId='+ item.id +'&pageNo=1'}">{{item.name}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 查看和浏览的数量 -->
      <div class="viewsAndDownloads">
        <span class="pageViews">{{$t('form.views')}} {{previewCount}}</span>
        <span class="downloads">{{$t('form.downloads')}} {{downloadCount}}</span>
        <span class="deptAdmin" v-if="disksAdminsCount.length > 0">{{$t('administrator')}}{{disksAdminsCount}}</span>
      </div>
    </div>
    <div class="tableDiv">
      <el-table
        class="multiple-table"
        v-loading="loading"
        ref="multipleTable"
        tooltip-effect="dark"
        :data="disksFoldersList.datas"
        @selection-change="handleSelectionChange"
        :height="clientHeight"
        style="width: 100%"
        @sort-change="onSortChange"
        :default-sort = "{prop: 'date', order: 'descending'}">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('tabs.definition')"
          sortable="custom">
          <!-- 判断是文件还是文件夹 -->
          <template slot-scope="scope">
              <editfloder v-if="scope.row.folder"
                v-bind="$attrs" 
                v-on="$listeners"
                :disksList="disksList"
                :curDepartData="scope.row[scope.$index]"
                :tableList="scope"
                :handleindex="scope.$index"
                :editcolumn="scope.row.isEditable"
               >
              </editfloder>
              <editfile v-else
                v-bind="$attrs" 
                v-on="$listeners"
                :disksList="disksList"
                :curDepartData="scope.row[scope.$index]"
                :tableList="scope"
                :handleindex="scope.$index"
                :editcolumn="scope.row.isEditable"
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
              <div class="upload-div"><!-- v-if="scope.row.op[0]== 1 ||  parentPermission[0]==1" -->
                <a class="load" :title="$t('btns.download')" @click="handleSingleFileDownload(scope.row.id, scope.row.folder)"></a>
              </div>
              <div class="onlineEdit" v-if="!scope.row.folder" > <!-- && (scope.row.op[2] == 3 || parentPermission[2] ==3) -->
                <a class="edit" :title="$t('title.online_editing')" @click="showOnlineEditModal(scope.row)"></a>
              </div>
              <!-- 最高权限为企业管理员 -->
              <el-dropdown @command="handleCommand" v-if="user.level == level.ROLE_LEVEL_SUPERADMIN">
                <span class="el-dropdown-link">
                  {{$t('management')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="scope.row.folder && scope.row.orderNo == 0" :command="{command: 'stickFolder', record: scope.row}">{{$t('btns.placed_top')}}</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.folder && scope.row.orderNo != 0" :command="{command: 'cancelStickFolder', record: scope.row}">{{$t('btns.cancel_top')}}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'fileShare', record: scope.row, index: scope.$index}">{{$t('btns.share_files')}}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'collectFile', record: scope.row}">{{$t('btns.collect_files')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'manageReName', record: scope.row, index: scope.$index}">{{$t('btns.rename')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'movedialog', record: scope.row, index: scope.$index}">{{$t('btns.move_to')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'impowertreedialog', record: scope.row, index: scope.$index}">{{$t('btns.authorization')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'showDeleteConfirm', record: scope.row}">{{$t('btns.delete')}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <!-- /最高权限为员工 -->
              <el-dropdown @command="handleCommand" v-else-if="!scope.row.folder && user.level == level.ROLE_LEVEL_member && user.defaultDepartment == curDiskParams.ownerId && scope.row.creatorId == user.id">
                <span class="el-dropdown-link">
                  {{$t('management')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'fileShare', record: scope.row, index: scope.$index}">{{$t('btns.share_files')}}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'collectFile', record: scope.row}">{{$t('btns.collect_files')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'showDeleteConfirm', record: scope.row}">{{$t('btns.delete')}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <!-- 最高权限为专委会管理员或者部门管理员 -->
              <el-dropdown @command="handleCommand" v-else-if="isDeptAdmin && (user.defaultDepartment == curDiskParams.ownerId)">
                <span class="el-dropdown-link">
                  {{$t('management')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'fileShare', record: scope.row, index: scope.$index}">{{$t('btns.share_files')}}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" :command="{command: 'collectFile', record: scope.row}">{{$t('btns.collect_files')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'manageReName', record: scope.row, index: scope.$index}">{{$t('btns.rename')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'movedialog', record: scope.row, index: scope.$index}">{{$t('btns.move_to')}}</el-dropdown-item>
                  <el-dropdown-item :command="{command: 'impowertreedialog', record: scope.row, index: scope.$index}">{{$t('btns.authorization')}}</el-dropdown-item>
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
          :page-size="disksFoldersList.linesPerPage"
          :total="disksFoldersList.rowCount"
          @current-change="handleCurrentChange"
          :current-page.sync="disksFoldersList.pageNo">
        </el-pagination>
      </div>
      <div>
        <!-- 收藏 -->
        <collectdialog
        :collectTreeModalParams="collectTreeModalParams"
        @handleCollectDialogClose="handleCollectDialogClose"
        ></collectdialog>
        <!-- 移动到 -->
        <movedialog 
          v-bind="$attrs" 
          v-on="$listeners"
          :moveTreeModalParams="moveTreeModalParams"
          @handleMoveDialogClose="handleMoveDialogClose"
        ></movedialog>

        <!-- 文件分享 -->
        <filesharedialog
          :shareTreeModalParams="shareTreeModalParams"
          @handleFileShareDialogClose="handleFileShareDialogClose"
        ></filesharedialog>

        <!-- 授权 -->
        <impowertreedialog
          :impowerTreeModalParams="impowerTreeModalParams"
          @handleImpowerTreeDialogClose="handleImpowerTreeDialogClose"
        ></impowertreedialog>

        <!-- 标签对话框 -->
        <labelcategorydialog
          v-bind="$attrs" 
          v-on="$listeners"
          :categorySettingsModalParams="categorySettingsModalParams"
          @handleCategoryDialogClose="handleCategoryDialogClose"
        ></labelcategorydialog>
      </div>
    </div>
  <!-- 选择在线编辑的方式 -->
    <el-dialog
  title="请选择在线编辑的方式"
  :visible.sync="selectOnlineEditMode"
  width="30%"
  center>
    <div style="display:flex;justify-content: space-around;">
    <el-button @click="taryEditModal">{{$t('taryEdit')}}</el-button>
    <el-button type="primary" @click="onlineEditModal">{{$t('webPageEditing')}}</el-button>
    </div>
</el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
//引入可编辑的目录组件
import editfloder from '@/components/shared/EditFolder.vue';
//引入可编辑的文件组件
import editfile from '@/components/shared/EditFile.vue';
//上传文件
import fileuploader from '@/components/shared/FileUploader.vue';
//上传文件夹
import folderuploader from '@/components/shared/FolderUploader.vue';
//文件分享
import filesharedialog from '@/components/shared/FileShareDialog.vue';
//收藏文件
import collectdialog from '@/components/shared/CollectDialog.vue';
//移动文件
import movedialog from '@/components/shared/MoveDialog.vue';
//授权
import impowertreedialog from '@/components/shared/ImpowerTreeDialog.vue';
//标签对话框
import labelcategorydialog from '@/components/shared/LabelCategoryDialog.vue'



export default {
  name: 'departmentkmdata',
  components: {
    editfloder,
    editfile,
    fileuploader,
    folderuploader,
    filesharedialog,
    collectdialog,
    movedialog,
    impowertreedialog,
    labelcategorydialog
  },
  props: [
    'breadcrumbData',
    'multipleSelection',
    'multipleSelectionArray',
    'disksList',
    'params',
    'curDiskParams',
    'showNewFloderBtn',
    'previewCount',
    'downloadCount',
    'disksAdminsCount',
    'loading'
  ],
  data() {
    return {
      disksFoldersList: {},
      isEditable: false,
      selectOnlineEditMode:false,
      clientHeight: '',
      user: {},
      parentPermission:this.$route.query.operation,//父文件夹的权限
      onlineditrecord:{},
      level : {
        ROLE_LEVEL_SUPERADMIN : 100,    //企业知识管理员  
        ROLE_LEVEL_COMMITTEEADMIN : 20,   //专委会知识管理员 
        ROLE_LEVEL_DEPTADMIN : 10,    //部门知识管理员
        ROLE_LEVEL_member : 0    //普通员工
      },
      moveTreeModalParams: {  //移动弹出层
        isObj: false,
        isfolder: false,
        diskId: "",
        fileId: "",
        moveTreeModalVisible: false,    
        treeData: []
      },
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
      categorySettingsModalParams: {     //贴标签弹出层
        fileId: "",
        defaultValue: [],
        categoryData: [], 
        visible: false, 
      },
      impowerTreeModalParams: {     //文件授权弹出层
        record: {},
        visible: false,
        resourceId: "",
      },
      isDeptAdmin: false,        //根据角色判断是否是管理员
      isShowUpload: false,        //判断角色是否显示上传操作
      isShowCreateFolder: false,  //判断角色是否显示新建文件夹操作
      isShowBath: false,          //判断角色是否显示批量移动操作
      isShowBathDelete: false,    //判断角色是否显示批量删除操作
    }
  },

  watch:{
    disksList(val){    //disksList即为父组件的值，val参数为值
      this.disksFoldersList = val;   //将父组件的值赋给disksFoldersList子组件的值
    },
  },

  updated(){
    this.getisDeptAdmin();
    this.getIsShowUpload();       //判断角色是否是部门管理员
    this.getIsShowCreateFolder(); //判断角色是否显示新建文件夹操作
    this.getIsShowBathDelete();   //判断角色是否显示批量删除操作
    this.getIsShowBathButton();   //判断角色是否显示批量移动操作
  },
  created() {
    const windowHeight = document.documentElement.clientHeight;
    const deptHead = this.$parent.$refs.deptHead.offsetHeight;
    // 16是外边距 28按钮的高度 16浏览量的高度 59表格头的高度
    // this.clientHeight = `${document.documentElement.clientHeight}` - deptHead - 16 - 28 - 16 - 59 +'px';
    this.clientHeight = `${document.documentElement.clientHeight}`- deptHead - 50 - 40 - 15 - 28 - 48 - 40  +'px';

  },
  mounted(){
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
        } 
      })
    },
    /**
     * 根据用户角色[],判断是否是部门管理员
     */
    getisDeptAdmin(){
      let user = this.user;
      let isDeptAdmin = false;
      if(user.roles) {
        isDeptAdmin = this.isDeptaAdmin(user.roles);
      }
      this.isDeptAdmin = isDeptAdmin;
    },
     
    /**
     * 判断角色是否显示上传操作
     * 1、非根目录下显示上传按钮；
     * 2、成员所在的部门id等于当前部门网盘所属的部门的ownerId
     * 3、企业管理员也有权限上传
     */
    getIsShowUpload(){
      let params = this.params;
      let curDiskParams = this.curDiskParams;
      let user = this.user;
      const level = this.level;
      let isShowUpload = false;
      
      if((params.diskId != params.folderId && user.defaultDepartment == curDiskParams.ownerId) ||
      (params.diskId != params.folderId && user.level == level.ROLE_LEVEL_SUPERADMIN)) {
        isShowUpload = true;
      }
      this.isShowUpload = isShowUpload;
    },

    /**
     * 判断角色是否显示新建文件夹操作
     * 1、超级管理员
     * 2、成员所在的部门id等于当前部门网盘所属的部门的ownerId,并且成员是该部门管理员
     */
    getIsShowCreateFolder(){
      let curDiskParams = this.curDiskParams;
      let user = this.user;
      const level = this.level;
      let isShowCreateFolder = false;
      let isDeptaAdmin = false;
      if(user.roles) {       //根据角色判断是否是管理员
        isDeptaAdmin = this.isDeptaAdmin(user.roles);
      }
      
      if(user.level == level.ROLE_LEVEL_SUPERADMIN) {
        isShowCreateFolder = true;
      }else if((user.defaultDepartment == curDiskParams.ownerId) && isDeptaAdmin) {
        isShowCreateFolder = true;
      }
      this.isShowCreateFolder = isShowCreateFolder;
    },

    /**
     * 判断角色是否显示批量移动操作
     * 1、企业管理员有批处理操作；
     * 2、本部门网盘的部门管理员有批处理操作
     */
    getIsShowBathButton() {
      let curDiskParams = this.curDiskParams;
      let user = this.user;
      const level = this.level;
      const curUserLevel = user.level;    //用户最高权限
      const curUserDefaultDepartment = user.defaultDepartment;

      let isShowBath = false;
      let isDeptaAdmin = false;
      if(user.roles) {
        isDeptaAdmin = this.isDeptaAdmin(user.roles);
        
      }
      if(curUserLevel == level.ROLE_LEVEL_SUPERADMIN) {
        isShowBath = true;
      }else if((curUserDefaultDepartment == curDiskParams.ownerId)  && isDeptaAdmin) {
        isShowBath = true;
      }
      this.isShowBath = isShowBath;
    },

    /**
     * 判断角色是否显示批量删除操作
     * 1、企业管理员、本部门网盘的部门管理员有批处理操作；
     * 2、本部门成员有批量删除自己新建的文件夹和上传的文件;
     */
    getIsShowBathDelete(){
      let curDiskParams = this.curDiskParams;
      let user = this.user;
      const level = this.level;
      const multipleSelectionArray = this.multipleSelectionArray;

      let isShowBathDelete = false;
      const curUserLevel = user.level;    //用户最高权限
      const curUserDefaultDepartment = user.defaultDepartment;
      const curUserId = user.id;
      let isDeptaAdmin = false;
      if(user.roles) {
        isDeptaAdmin = this.isDeptaAdmin(user.roles);
      
      }
      if(curUserLevel == level.ROLE_LEVEL_SUPERADMIN) {
        isShowBathDelete = true;
        this.isShowBathDelete = isShowBathDelete;
      }else if(isDeptaAdmin && curUserDefaultDepartment == curDiskParams.ownerId) {
        isShowBathDelete = true;
        this.isShowBathDelete = isShowBathDelete;
      }else if(curUserDefaultDepartment == curDiskParams.ownerId) {
        let num = -1;   //所勾选的全部是自己创建或上传的
        multipleSelectionArray.map((item) => {
          if(item.creatorId != curUserId) {   //只要有一个文件的创建人不等于当前用户，就不显示批量操作
            num += 1;
            return;
          }
        });
        if(num < 0) {   
          isShowBathDelete = true;
        }
        this.isShowBathDelete = isShowBathDelete;
      }else {
        this.isShowBathDelete = isShowBathDelete;
      }
    },

    /**
     * 根据用户角色[],判断是否是部门管理员
     */
    isDeptaAdmin (roles) {
      const level = this.level;
      let deptAdmin = false;
      roles.map((e)=>{
        if(e.roleNo == level.ROLE_LEVEL_DEPTADMIN) {
          deptAdmin = true;
        }
      });
      return deptAdmin
    },

    /**
     * 新建目录（文件夹）
     */
    handleCreateFolder(){
      this.$emit('handleCreateFolder');
    },

    //打开新建文件弹出层
    async showEditModal(){
      let result = (await API.createEmptydoc(this.params)).data;
      if(result.errcode == 0){
        // let url = "";
        // if(kmsConfig.staticContextPath){
        //   url = kmsConfig.staticContextPath + kmsConfig.kmsFilePath + '/office/vender/ntko/new.html?diskId='+ result.data.diskId +
        //   '&folderId='+ result.data.folderId +'&userName='+this.user.name+'&userId='+ this.user.id +
        //   '&type='+ result.data.type +'&url='+ result.data.url +'&id='+ result.data.id
        // }else{
        //   url = kmsConfig.kmsFilePath + '/kms/office/vender/ntko/new.html?diskId='+ result.data.diskId +
        //   '&folderId='+ result.data.folderId +'&userName='+this.user.name+'&userId='+ this.user.id +
        //   '&type='+ result.data.type +'&url='+ result.data.url +'&id='+ result.data.id
        // }
        // window.open(url);
        this.onRefreshComponent(this.params);
      }
    },

    /**
     * 勾选行时响应
     */
    handleSelectionChange(val){
      this.$emit('handleSelectionChange', val);
    },

    /**
     * 取消选中行，分页、批量处理使用
     */
    clearSelection(){
      this.$refs.multipleTable.clearSelection();
    },

    /**
     * 单个下载
     */
    handleSingleFileDownload(fileId,folder){
      this.$emit('handleSingleFileDownload', fileId, folder);
    },

    /**
     * 在线编辑
     */
    showOnlineEditModal(record){
      this.onlineditrecord=record
      this.selectOnlineEditMode=true;
    
    },
    taryEditModal(){
     this.onlineditrecord.editType="tary";
      this.$emit('showOnlineEditModal', this.onlineditrecord);
      this.selectOnlineEditMode=false;
    },
    onlyEditModal(){
        this.onlineditrecord.editType="only";
        this.$emit('showOnlineEditModal', this.onlineditrecord); 
        this.selectOnlineEditMode=false;
    },
    onlineEditModal(){
        this.onlineditrecord.editType="onlineCoedit";
        this.$emit('onlineCoEdit', this.onlineditrecord); 
        this.selectOnlineEditMode=false;
    },


    /**
     * 批量下载
     */
    handleFileObjDownload(){
      this.$emit('handleFileObjDownload');
    },

    /**
     * 批量删除
     */
    showDeleteMessageBox(){
      this.$emit('showDeleteMessageBox');
    },

    /**
     * 查询列表名称
     */
    onSearchChange(){
      this.$emit('onSearchChange');
    },

    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      this.$emit('onSearchChange', val);
    },

    /**
     * 刷新列表
     */
    onRefreshComponent(params){
      this.$emit('loadDisksFolderListAciton', params);
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
     * 下拉操作
     */
    handleCommand(obj){
      let index = obj.index;
      let diskId = obj.record.diskId;
      let folderId = obj.record.id;
      let folder = obj.record.folder;
      
      if(obj.command == 'stickFolder'){     //仅当用户是企业管理员时才有文件夹置顶功能
        this.$emit('stickFolder', diskId, folderId);
      }else if(obj.command == 'cancelStickFolder'){     //仅当用户是企业管理员时才有文件夹取消置顶功能
        this.$emit('cancelStickFolder', diskId, folderId);
      }else if(obj.command == 'fileShare'){         //分享文件
        this.shawFileShareDialog(folderId, diskId, folderId);
      }else if(obj.command == 'collectFile'){      //收藏文件
        this.showCollectModal(folderId);
      }else if(obj.command == 'manageReName'){  //重命名
        this.$store.commit('handleRename', index);
        this.disksFoldersList = this.$store.state.disksFoldersList;
      }else if(obj.command == 'impowertreedialog'){    //授权
        this.showImpowerTreeDialog(obj.record.id, obj.record);
      }else if(obj.command == 'showDeleteConfirm'){     //删除
        const diskid = this.params.diskId;
        const isfolder = folder;
        let folderid = "";
        if(isfolder){
          folderid = folderId;
        }else {
          folderid = this.params.folderId;
        }
        let params = {
          "diskId": diskid,
          "folderId": folderid,
          "fileId": folderId,
          "isfolder": isfolder
        };
        this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('msg.cancel'),
          type: 'warning',
        }).then(async() => {
          const result = (await API.deleteFile(params)).data;
          if(result.errcode == 0){
            let curParams = this.params
            this.$emit('loadDisksFolderListAciton', curParams);
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
      }else if(obj.command == 'movedialog'){        //移动到
        this.showMoveTreeModal(false, folderId, folder)
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
     * 打开文件/文件夹授权对话框
     */
    showImpowerTreeDialog(resourceId,record){
      let impowerTreeModalParams = {     //文件授权弹出层
        "record": record,
        "visible": true,
        "resourceId" : resourceId,
      }
      this.impowerTreeModalParams = impowerTreeModalParams
    },

    /**
     * 取消文件/文件夹授权对话框
     */
    handleImpowerTreeDialogClose(){
      let impowerTreeModalParams = {     //文件授权弹出层
        "record": "",
        "visible": false,
        "resourceId" : "",
      }
      this.impowerTreeModalParams = impowerTreeModalParams
    },
    /**
     * 删除单个标签
     */
    async handleClose(tag,row){
      const resultData = (await API.deleteCategory(row.id,tag.categoryName)).data;
      if(resultData.errcode == 0){
        this.$emit("closeTage")
      }
    },

    /**
     * 打开标签对话框
     */
    async showLabelCategoryDialog(fileId){
      //获取标签
      const categorySettingsData = (await API.getCategory()).data;
      //获取文件已有标签
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
        this.onRefreshComponent(sorter_params);
      }
    }

  }
}
</script>
<style scoped>
/* .multiple-table /deep/.el-table__body-wrapper {
    height: 70%!important;
  } */
  /* 解决bug 19400 部门文件显示不全的问题 */
  .el-dialog{
       display: flex;
       flex-direction: column;
       margin:0 !important;
       position:absolute;
       top:50%;
       left:50%;
       transform:translate(-50%,-50%);
       /*height:600px;*/
       max-height:calc(100% - 30px);
       max-width:calc(100% - 30px);
   }
   .el-dialog .el-dialog__body{
       flex:1;
       overflow: auto;
   }
</style>