<template>
  <div name="stagekm" class="stage-km">
    <div class="card" :class="{'paddingTop':paddingTop}">
      <div class="card-header clearfix">
        <span class="teamName">{{teamName}}</span>
        <el-checkbox v-if="isShowSubscription" v-model="isSubscription" @change="onChangeSubscription" class="subscription">{{$t('btns.subscribe_team')}}</el-checkbox>
        <el-button type="primary" v-if="isShowOperateStageButton" class="createStage" size="mini" @click="showCreateStageDialog">{{$t('btns.create_stage')}}</el-button>
      </div>
      <div>
        <el-dialog
          width="600px"
          :title="$t('btns.create_stage')"
          :before-close="handleCancel"
          :visible.sync="stageModal.visible">
          <div style="width:500px">
            <el-form label-position="right" label-width="80px">
              <el-form-item :label="$t('form.name')">
                <el-input v-model="stageModal.name" :placeholder="$t('placeholder.name')"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.sort_number')">
                <el-input-number v-model="stageModal.orderNo" controls-position="right" :min="1" :max="10000"></el-input-number>
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" v-if="stageModal.isCreateStage" @click="handleSettingsOk" size="mini">{{$t('btns.determine')}}</el-button>
            <el-button type="primary" v-if="!stageModal.isCreateStage" @click="editStageSuccess" size="mini">{{$t('btns.determine')}}</el-button>
          </div>
        </el-dialog>

        <el-dialog
          width="90%"
          :title="filesModal.datas.name"
          :before-close="hideFilesModal"
          :visible.sync="filesModal.visible">
          <div class="stage-details">
            <div class="stage-list">
              <el-table
                :data="filesModal.data"
                :show-header="false"
                style="width: 100%">
                <el-table-column
                  prop="name"
                  :label="$t('tabs.definition')">
                  <template slot-scope="scope">
                    <a class="file-name" @click="clickFileForPreview(scope.row)">
                      <img 
                        v-if="scope.row.type=='jpg' || scope.row.type=='png' || scope.row.type=='gif'"
                        :src="kmsFilePath+'/uploads/kms/'+scope.row.url"
                        class="icon-file"/>
                      <i :class="'icon-file icon-file-'+scope.row.type" v-else></i>
                      {{scope.row.name}}
                    </a>
                  </template>
                </el-table-column>
                <el-table-column
                  width="200">
                  <template slot-scope="scope">
                    <div class="operation">
                      <div class="onlineEdit"><a class="edit" :title="$t('title.online_editing')" @click="showOnlineEditModal(scope.row)"></a></div>
                      <div class="share-modal"><a class="share" :title="$t('share')" @click="shawFileShareDialog(scope.row.id, scope.row.folder, scope.row.id)"></a></div>
                      <div class="load-div"><a class="load" :title="$t('btns.download')" @click="handleSingleFileDownload(scope.row.id, scope.row.folder)"></a></div>
                      <div class="collect-div"><a class="collect" :title="$t('label.collection')" @click="showCollectModal(scope.row.id)"></a></div>
                      <div class="stageFiledelete-div" v-if="isTeamMember"><a class="stageFiledelete" :title="$t('btns.delete')" @click="showDeleteMessageBox(scope.row, filesModal.datas.id, diskId, filesModal.datas.folderId)"><i class="el-icon-delete"></i></a></div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="creator"  
                  :label="$t('tabs.creator')"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop=""
                  :label="$t('tabs.time')"
                  width="200"
                  align="right">
                  <template slot-scope="scope">
                    <span v-html="dateFormatTime(scope.row.createDate)"></span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop=""
                  :label="$t('tabs.label')"
                  width="200">
                  <template slot-scope="scope">
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
            </div>
            <div class="stage-upload"  v-if="isTeamMember">
              <fileuploader 
                :params="params={
                  id: filesModal.datas.id,
                  diskId: diskId,
                  folderId: filesModal.datas.folderId
                }"
                @onRefreshComponent="onRefreshComponent"
                @deleteUploadFile="deleteUploadFile"
                >
              </fileuploader>
              <!-- <el-button size="mini">{{$t('form.upload_folder')}}<i class="el-icon-upload el-icon--right"></i></el-button> -->
            </div>
            <div class="comments">
              <div>
                <el-tabs v-model="activeName">
                  <el-tab-pane :label="$t('dynamic')" name="first">
                    <ul class="comments-list">
                      <li class="stageFile" v-for="(comment, index) in commentList" :key="index">
                        <div class="commentDetele" v-if="comment.creatorId == user.id ? true : false" @click="deleteComment(comment.id)"><i class="el-icon-close"></i></div>
                        <div class="top">
                          <div class="avatar">{{comment.creator}}</div>
                          <div class="name-date">
                            <div class="name">{{comment.creator}}</div>
                            <div class="date">{{(comment.createDate)}}</div>
                          </div>
                        </div>
                        <div class="content">{{comment.content}}</div>
                      </li>
                    </ul>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div class="send-comment">
                <el-row :gutter="24">
                  <el-col :span="21">
                    <el-input
                      type="text"
                      :placeholder="$t('placeholder.enter_content')"
                      v-model="createComment.content"
                      maxlength="200"
                      show-word-limit
                      :disabled="!isTeamMember"
                      size="mini">
                    </el-input>
                  </el-col>
                  <el-col :span="3">
                    <el-button type="primary" size="mini" @click="createCommentSuccess" :disabled="!isTeamMember">{{$t('btns.send')}}</el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-dialog>
        <!-- 文件分享 -->
        <filesharedialog
          :shareTreeModalParams="shareTreeModalParams"
          @handleFileShareDialogClose="handleFileShareDialogClose"
        ></filesharedialog>
        <!-- 收藏 -->
        <collectdialog
          :collectTreeModalParams="collectTreeModalParams"
          @handleCollectDialogClose="handleCollectDialogClose"
        ></collectdialog>
        <!-- 标签对话框 -->
        <labelcategorydialog
          :categorySettingsModalParams="categorySettingsModalParams"
          @handleCategoryOk="handleCategoryOk"
          @handleCategoryDialogClose="handleCategoryDialogClose"
        ></labelcategorydialog>
      </div>
      <div class="card-body card-padding">
        <div class="breadcrumbMenu">
          <div class="gohistory">
            <a @click="goBack"><i class="el-icon-arrow-left"></i>{{$t('btns.return')}}</a>
          </div>
        </div>
        <div class="gutter-stage">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(item, e) in stageListData" :key="e">
              <div class="gutter-name">
                <span class="name">{{item.name}}</span>
                <div class="setting-operation stage-operation">
                  <el-dropdown>
                    <span class="el-dropdown-link">
                      <i class="el-icon-more"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :disabled="!isShowOperateStageButton">
                        <span @click="showEditStageDialog(item)">{{$t('btns.edit')}}</span>
                      </el-dropdown-item>
                      <el-dropdown-item :disabled="!isShowOperateStageButton">
                        <span @click="deleteStages(item)">{{$t('btns.delete')}}</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
              <div class="gutter-box">
                <ul>
                  <li class="stageFile" v-for="(file, index) in item.filesArray" :key="index">
                    <a class="file" @click="clickFileForPreview(file)">
                      <img 
                        v-if="file.type=='jpg' || file.type=='png' || file.type=='gif'"
                        :src="kmsFilePath+'/uploads/kms/'+file.url"
                        class="icon-file"/>
                      <i :class="'icon-file icon-file-'+file.type" v-else></i>
                      {{file.name}}</a>
                  </li>
                </ul>
                <div class="showMore"> 
                  <el-button size="mini" @click="showStageDetail(item)">{{$t('see_more')}}</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div>
      <el-dialog
        :title="$t('form.apply_permission')"
        :visible.sync="applyModalParams.applyModalvisible"
        width="40%">
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
</template>

<script>
import moment from 'moment';
moment.locale('zh-cn');
import API from "@/api.js";
import { getPreviewUrl } from '@/utils/utils.js';
import {handleTableListDataWitdhNORename, goBack, TimeToDate} from "@/utils/utils.js";
//上传文件
import fileuploader from '@/components/shared/FileUploader.vue';
//文件分享
import filesharedialog from '@/components/shared/FileShareDialog.vue';
//收藏文件
import collectdialog from '@/components/shared/CollectDialog.vue';
//标签对话框
import labelcategorydialog from '@/components/shared/LabelCategoryDialog.vue'
export default {
  name: 'stagekm',
  components: {
    fileuploader,
    filesharedialog,
    collectdialog,
    labelcategorydialog
  },
  data(){
    return{
      kmsFilePath: kmsFilePath,
      paddingTop: false,    //头部padding
      contextPath: contextPath,
      level: {
        ROLE_LEVEL_SUPERADMIN : 100,    //企业知识管理员  
      },
      memberType: {    //成员类型
        TEAM_MEMBER_ADMIN : 1,
        TEAM_MEMBER_NORMAL : 0
      },
      contentType: {
        TEAM : 1,
        COMMITTEE : 2
      },
      teamMembers: [],    //当前团队下的成员
      user: {},           //当前用户信息
      creatorId: "",
      teamName: "",
      teamId: "",
      diskId: "",
      folderId: "",       //存储阶段的id
      isSubscription: false,
      stageListData: [],      //阶段文件集合，最多显示10条
      filesArray: [],         //阶段列表文件集合，显示全部
      stageModal: {           //创建或编辑弹出层
        isCreateStage: false,
        visible: false,
        name: "",
        orderNo: "",
        id: ""
      },
      filesModal: {           //查看更多弹出层
        visible: false,
        data: [],
        datas: ""
      },
      activeName: "first",
      specifiedTeamData: {},   //当前团队的所有信息
      creatorDetail: {},   //团队创建者的详情
      
      commentList: [],      //评论
      createComment: {      //发送评论内容
        content: ""
      },
      isTeamMember: false,    //判断是否为该团队下的成员才能评论
      isShowOperateStageButton: false,
      isShowSubscription: false,      //判断是否显示订阅操作
      shareTreeModalParams: {     //分享弹出层
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,
        teamTreeData: []
      },
      collectTreeModalParams: {     //文件收藏弹出层
        collectTreeModalVisible: false,
        fileId: "",
      },
      applyModalParams: {  //申请权限弹出层参数
        resourceId: "",
        applyModalvisible: false,
        previewDefault: false,
        downloadDefault: false
      },
      approver: "",
      formParams : {
        operations: [],
        download: false,
        preview: false,
        reason: ""
      },
      categorySettingsModalParams: {     //贴标签弹出层
        fileId: "",
        defaultValue: [],
        categoryData: [], 
        visible: false, 
      },
    }
  },

  mounted(){
    //是否展示头部
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
    const teamId = this.$route.query.teamId;
    const diskId = this.$route.query.diskId;
    API.getMyProfile({
      onSucess: resp => {
        this.user = resp.data.data;
        this.getInitData(teamId, diskId);
      } 
    })
    this.teamId = teamId;
    this.diskId = diskId;
  },

  methods:{
    /**
     * 根据角色判断是否显示创建阶段操作
     * 1、企业管理员有对阶段有所有操作权限
     * 2、团队管理员对阶段有所有操作权限
     */
    getIsShowOperateStageButton(){
      const teamMembers = this.teamMembers;
      const level = this.level;
      const user = this.user;
      const memberType = this.memberType;
      const creatorId = this.creatorId;
      
      const record = {
        "members" : teamMembers,
        "creatorId" : creatorId
      }
      let isShowCreateStageButton = false;
      //超级管理员、创建者、团队管理员这三个角色有操作团队的权限
      if(user.level == level.ROLE_LEVEL_SUPERADMIN) {
        isShowCreateStageButton = true;
      }else if(user.id == record.creatorId){
        isShowCreateStageButton = true;
      }else {
        record.members.map((e)=> {
          if(e.userId == user.id && e.type == memberType.TEAM_MEMBER_ADMIN) {
            isShowCreateStageButton = true;
          }
        });
      }
      this.isShowOperateStageButton = isShowCreateStageButton;
    },

    /**
     * 判断是否显示订阅操作
     * 1、超级管理员可以订阅；
     * 2、创建者可以订阅；
     * 3、分享到公司的话所有人能订阅；
     * 4、分享到部门的话，该部门下所有人能订阅；
     * 5、该团队下的成员、管理员可以订阅
     */
    getIsShowSubscription(){
      const specifiedTeamData = this.specifiedTeamData;
      const level = this.level;
      const user = this.user;
      // const memberType = this.memberType;
      const creatorDetail = this.creatorDetail;

      let isShowSubscription = false;
      if(user.level && user.level == level.ROLE_LEVEL_SUPERADMIN) {
          isShowSubscription = true;
      }else if(user.id && specifiedTeamData.creatorId && user.id == specifiedTeamData.creatorId){
          isShowSubscription = true;
      }else if(specifiedTeamData.compPermission && specifiedTeamData.compPermission.length>0) {
          isShowSubscription = true;
      }else if(specifiedTeamData.deptPermission && specifiedTeamData.deptPermission.length>0) {
          if(creatorDetail && user.defaultDepartment == creatorDetail.defaultDepartment) {
              isShowSubscription = true;
          }
      }else if(specifiedTeamData.members && user.id){
          specifiedTeamData.members.map((e) => {
              if(e.userId == user.id) {
                  isShowSubscription = true;
              }
          })
      }
      this.isShowSubscription = isShowSubscription;
    },

    /**
     * 页面初始化时
     */
    async getInitData(teamId, diskId){
      //获取当前团队的详情
      const specifiedTeamResult = await API.getSpecifiedTeam(teamId);
      let teamName = "";
      let creatorId = "";
      let isSubscription = false;
      if( specifiedTeamResult.data.errcode == 0){
        const specifiedTeamData = specifiedTeamResult.data.data;
        teamName = specifiedTeamData.name;
        creatorId = specifiedTeamData.creatorId;
        isSubscription = specifiedTeamData.subscription;

        //获取团队创建人的详情
        const creatorDetail = (await API.getUserDetail(creatorId)).data;
        this.creatorDetail = creatorDetail;
        this.specifiedTeamData = specifiedTeamData;
        this.teamName = teamName;
        this.creatorId = creatorId;
        this.isSubscription = isSubscription;
      }

      //获取当前团队下的成员
      const teamMembersResult = (await API.getCurTeamMembers(teamId)).data;  
      let teamMembers = [];
      if(teamMembersResult.errcode == 0) {
        teamMembers =teamMembersResult.data ? teamMembersResult.data : [];
        this.teamMembers = teamMembers;
      }

      //获取当前团队下的阶段
      let stageListData = await this.getStageListData(diskId,teamId);
      stageListData = handleTableListDataWitdhNORename(stageListData);
      this.stageListData = stageListData;
      this.getIsShowOperateStageButton();
      this.getIsShowSubscription();
    },

    /**
     * 获取当前团队下的阶段
     */
    async getStageListData(diskId,teamId){
      let result = await API.getStageList(teamId);
      let data = {};
      if(result.data.errcode == 0) {
        data = result.data.data ? result.data.data : [];
        if(data.length > 0) {
          for(let i=0; i < data.length; i++){
            const folderId = data[i].folderId;
            let params = {    //初始化时请求数据的参数,hash改变随之改变
              "diskId": diskId, 
              "folderId": folderId,
              "pageNo": 1,
              "linesPerPage": 10
            }
            let filesArray = await this.getStageFilesData(params);
            data[i].filesArray =  filesArray;
          }
        }
      } 
      return data;
    },

    /**
     * 获取阶段下的文件集合
     */
    async getStageFilesData(params) {
      let filesArray = [];
      const result = (await API.getStageFiles(params)).data;
      if(result.errcode == 0) {
          filesArray = result.data.datas;
      }
      return filesArray;
    },

    /**
    * 刷新阶段下的文件集合
    * @param {string} id 阶段id
    */
    async refreshStageFilesList(id, diskId){
      const data = [...this.stageListData];
      for(let i=0; i < data.length; i++){
        if(data[i].id == id ) {
          const folderId = data[i].folderId;
          let params = {    //初始化时请求数据的参数,hash改变随之改变
            "diskId": diskId, 
            "folderId": folderId,
            "pageNo": 1,
            "linesPerPage": 10
          }
          let filesArray = await this.getStageFilesData(params);
          data[i].filesArray =  filesArray;
        }
        this.stageListData = data;
      }
    },

    /**
     * 获取阶段下的文件
     */
    async refreshgetStageFilesData(diskId, folderId) {
      let params = {    //初始化时请求数据的参数,hash改变随之改变
        "diskId": diskId, 
        "folderId": folderId,
        "pageNo": 1,
        "linesPerPage": 9999
      }
      let filesArray = [];
      const result = (await API.getStageFiles(params)).data;
      if(result.errcode == 0) {
        filesArray = handleTableListDataWitdhNORename(result.data.datas);
        return filesArray;
      }
     },

    /**
     * 是否订阅团队
     */
    async onChangeSubscription(checked){
      let teamId = this.teamId;
      if(checked){
        let params = {
          "contentId" : teamId,
          "contentType" : this.contentType.TEAM,
          "contentName" : this.teamName
        } 
        let result = (await API.applySubscription(params)).data;
        if(result.errcode == 0) {
          this.isSubscription = checked;
          this.$message({
            type: 'success',
            message: this.$t('msg.subscription_ss')
          });
        }else {
          this.$message({
            type: 'error',
            message: result.errmsg
          });
        }
      }else{
        let cancelParams = [];
        cancelParams.push(teamId);
        let result = (await API.cancelSubscription(cancelParams)).data;
        if(result.errcode == 0) {
          this.isSubscription = checked;
          this.$message({
            type: 'success',
            message: this.$t('msg.unsubscribe')
          });
        }else {
          this.$message({
            type: 'error',
            message: result.errmsg
          });
        }
      }
    },

    /**
     * 打开创建团队阶段对话框
     */
    showCreateStageDialog(){
      let stageModal = {
        ...this.stageModal,
        isCreateStage: true,
        visible: true,
        name: "",
        id: "",
        orderNo: "",
      }
      this.stageModal = stageModal;
    },

    /**
     * 确定新建阶段
     */
    async handleSettingsOk(){
      const params = {
        "teamId" : this.teamId,
        "name" : this.stageModal.name,
        "orderNo" : this.stageModal.orderNo
      }
      if(this.stageModal.name != ""){
        const result = (await API.createStage(params)).data;
        if(result.errcode == 0){
          let stageListData = await this.getStageListData(this.diskId, this.teamId);
          stageListData = handleTableListDataWitdhNORename(stageListData);
          this.stageListData = stageListData;
          this.handleCancel();
          this.$message({
            type: 'success',
            message: this.$t('msg.created_ss2')
          });
        }
      }else{
        this.$message({
          type: 'warning',
          message: this.$t('msg.enter_stage_name')
        });
      }
    },

    /**
     * 打开编辑阶段弹出层
     */
    showEditStageDialog(params){
      let stageModal = {
        ...this.stageModal,
        isCreateStage: false,
        visible: true,
        name: params.name,
        id: params.id,
        orderNo: params.orderNo,
      }
      this.stageModal = stageModal;
    },

    /**
     * 确定编辑阶段
     */
    async editStageSuccess(){
      const params = {
           "name" : this.stageModal.name,
           "id" : this.stageModal.id,
           "orderNo" : this.stageModal.orderNo
        }
        const result = (await API.editStage(params)).data;
        if(result.errcode == 0) {
          //获取当前团队下的阶段
          let stageListData = await this.getStageListData(this.diskId, this.teamId);
          stageListData = handleTableListDataWitdhNORename(stageListData);
          this.stageListData = stageListData;
          this.handleCancel();
          this.$message({
            type: 'success',
            message: this.$t('msg.name_ch_ss')
          });
        }
    },

    /**
     * 关闭阶段弹出层
     */
    handleCancel(){
      let stageModal = {
        ...this.stageModal,
        isCreateStage: false,
        visible: false,
        name: "",
        id: "",
        orderNo: "",
      }
      this.stageModal = stageModal;
    },

    /**
     * 删除单个团队阶段
     */
    async deleteStages(params){
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then( async () => {
        const stageIdArray = [];
        stageIdArray.push(params.id);
        const result = (await API.deleteStages(stageIdArray)).data;
        if(result.errcode == 0){
          const stageListData = [...this.stageListData];
          for(let i=0;i < stageIdArray.length;i++) {
            let stageId = stageIdArray[i];
            stageListData.map((e,key) => {
              if(stageId == e.id){
                stageListData.splice(key,1);
              }
            });
          }
          this.stageListData = stageListData;
          this.$message({
            type: 'success',
            message: this.$t('msg.phase_de_ss')
          });
        }
        if(result.errcode == 401) { //权限
          this.$message({
            type: 'warning',
            message: result.errmsg
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
   * 返回上一级
   */
    goBack(){
      goBack();
    },

    /**
     * 查看更多
     */
    async showStageDetail(datas){
      this.folderId = datas.folderId;
      let filesArray = await this.refreshgetStageFilesData(datas.id, datas.folderId);
      const filesModal = {           //查看更多弹出层
        ...this.filesModal,
        visible: true,
        data: filesArray,
        datas: datas
      };
      this.getStageCommentsData(datas.id);
      filesModal.data.map((item, index) =>{
        filesModal.data[index].createDate = TimeToDate(item.createDate);
      })
      this.filesModal = filesModal;
    },

    /**
    * 关闭文件弹出层
    */
    hideFilesModal (){
      const filesModal = {           //查看更多弹出层
        ...this.filesModal,
        visible: false,
        data: [],
        datas: ""
      };
      this.filesModal = filesModal;
    },

    /**
     * 上传文件成功之后刷新列表
     */
    async onRefreshComponent(params){
      this.refreshStageFilesList(params.id, params.diskId);
      let filesArray = await this.refreshgetStageFilesData(params.diskId, params.folderId);
      const filesModal = {           //查看更多弹出层
        ...this.filesModal,
        data: filesArray
      };
      this.filesModal = filesModal;
    },
    /**
     * 文件上传成功点击取消，这里是直接删除文件
     */
    deleteUploadFile(fileList,params){
      fileList.fileObject[0].cancelUpload = true;
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
     * 获取阶段下的评论
     */
    async getStageCommentsData(stageId){
      let result = (await API.getStageComments(stageId)).data;
      if(result.errcode == 0) {
        result.data.commentList.map((item, index) =>{
          result.data.commentList[index].createDate = TimeToDate(item.createDate);
        })
        this.commentList = result.data.commentList;
      }

      let isTeamMember = false;
      const user = this.user;
      if(user.level == this.level.ROLE_LEVEL_SUPERADMIN) {
        isTeamMember = true;
      }else {
        this.teamMembers.map((e)=> {
          if(e.userId == user.id) {
            isTeamMember = true;
          }
        });
      }
      this.isTeamMember = isTeamMember;
    },

    /**
     * 删除评论
     */
    async deleteComment(id){
      const stageId = this.filesModal.datas.id;
      const params = {
        stageId : stageId,
        commentId : id
      }
      const result = (await API.deleteComment(params)).data;
      if(result.data) {
        this.getStageCommentsData(stageId);
      }
    },

    /**
     * 创建评论
     */
    async createCommentSuccess(){
      const stageId = this.filesModal.datas.id;
      const params = {
        ...this.createComment
      };

      const result = (await API.createComment(stageId, params)).data;
      if(result.data) {
        this.getStageCommentsData(stageId);
        const createComment = {
          ...this.createComment,
          content: ""
        }
        this.createComment = createComment;
        this.$message({
          type: 'success',
          message: this.$t('msg.comment_cr_ss')
        });
      }
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
      let apiParams = {
        "fileId" : record.id,
        "folder" : record.folder
      };
      API.getEditAbleFile(id, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let previewUrl = "";
            if(kmsConfig.staticContextPath){
              previewUrl = kmsConfig.staticContextPath + kmsConfig.kmsFilePath+'/office/vender/ntko/editDocument2.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename;
            }else{
              previewUrl = kmsConfig.contextPath+'/kms/office/vender/ntko/editDocument2.html?id='+id+"&url="+url+"&folderId="+folderId+"&userId="+userId+"&userName="+userName+"&filename="+filename;
            }
            window.open(previewUrl);
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {
            this.showApplyAuthorityModal(apiParams.fileId, 'edit');
          }else{
            this.$message(error.response.data.errmsg);
          }
        }
      })
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
     * 单个下载
     */
    async handleSingleFileDownload(fileId,folder){
      let apiParams = {
        "fileId" : fileId,
        "folder" : folder
      };
      apiParams.fileId = fileId;
      API.handleSingleFileDownload(apiParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let url = this.contextPath + "/kms/download/"+apiParams.fileId;
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
     * 确定标签对话框
     */
    async handleCategoryOk(){
      let diskId = this.$route.query.diskId;
      let filesArray = await this.refreshgetStageFilesData(diskId,this.folderId);
      const filesModal = {           //查看更多弹出层
        ...this.filesModal,
        data: filesArray
      };
      this.filesModal = filesModal;
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
     * 删除团队
     */
    showDeleteMessageBox(row, id, diskId, folderId){
      let params = {
        fileId: row.id,
        id: id,
        diskId: diskId,
        folderId: folderId
      }
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        API.stagesdeleteFile(params, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              this.onRefreshComponent(params);
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    },

    /**
     * 预览文件
     */
    async clickFileForPreview(row){
      const preview_params={
        id: row.id,  //文件id
        diskId: row.diskId
      }
      let preview_url = (getPreviewUrl(preview_params)).substring(1);
      const newWin = window.open(); 
      API.getFilePreviewAble(row.id, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let url;
            if(row.type == "mp4" || row.type == "mp3"){
              url = kmsConfig.kmsFilePath + "/uploads/kms/" + row.url
            }else{
              url = kmsConfig.staticContextPath + "/kms/asset" + preview_url;
            }
            newWin.location.href = url;  
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403 ) {
            newWin.close();
            this.showApplyAuthorityModal(row.id, 'preview');
          }else{
            this.$toast(error.response.data.errmsg);
          }
        }
      })
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
      }
      this.applyModalParams = applyModalParams;
    },

     /**
     * 选择申情的权限
     */
     onChangeAuthority(checkedValues) {
      let download = false;
      let preview = false;
      let edit = false;
      checkedValues.map((item) => {
        if(item == "download") {
          download = true;
        }else if(item == "preview") {
          preview = true;
        }else if(item == "edit") {
          edit = true;
        }
      });
      let formParams = {
        ...this.formParams,
        "download": download,
        "preview": preview,
        "edit": edit
      }
      this.formParams = formParams;
    },

     /**
     * 提交申请
     */
    async handleSubmit(){
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
            "downloadDefault" : false
          }
          this.applyModalParams = applyModalParams;
          //申请成功后，将申请理由清空
          this.formParams.reason = "";
        }
      }
    },

    /**
     * 格式化时间格式
     */
    dateFormatTime(value){
      if(value){
        var formatterTime = moment(new Date(value)).format("YYYY-MM-DD");
        return formatterTime;
      }else{
        return "";
      }
    },

  }
}
</script>