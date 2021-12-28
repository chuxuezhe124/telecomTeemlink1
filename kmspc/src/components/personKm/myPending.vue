<template>
  <div class="myPending">
    <div class="pending-tb">
      <div class="left-tb">
        <el-tabs type="border-card" class="person-card-title">
          <el-tab-pane >
        <span slot="label">
          <span class="span-box">
            <span>{{$t('tabs.to_do')}}</span>

              <span class="btn-bell-badge todo">
                <span class="num ">{{pengding.rowCount}}</span>
              </span>
          </span>
        </span>
            <div class="personPending">
              <div class="message pending">
                <span class="c-white">{{$t('tabs.to_do')}}</span>
              </div>
              <el-table
                :data="pengding.datas"
                style="width: 100%"
                max-height="200"
                :header-cell-style="rowClass">
                <el-table-column
                  prop="resourceName"
                  :label="$t('placeholder.file_name')"
                  min-width="40%">
                </el-table-column>
                <el-table-column
                  prop="userName"
                  :label="$t('tabs.applicant')" 
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop="power"
                  :label="$t('form.apply_permission')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop=""
                  :label="$t('tabs.apply_reason')"
                  min-width="16%">
                  <template slot-scope="scope">
                    <span v-html="getApplicationReason(scope.row)"></span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createDate"
                  :label="$t('tabs.apply_time')"
                  min-width="13%">
                </el-table-column>
                <el-table-column
                  prop="approvers"
                  :label="$t('tabs.approver')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  :label="$t('tabs.operation')"
                  min-width="12%"
                  >
                  <template slot-scope="scope">
                    <el-dropdown>
                      <span class="el-dropdown-link" >
                        <i class="el-icon-more"></i>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                          <span  @click="agreeOperation(scope.row.id)">{{$t('btns.agree')}}</span>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <span @click="disAgreeOperation(scope.row.id)">{{$t('btns.no_agree')}}</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                right
                background
                layout="prev, pager, next"
                class="myPedding-pag"
                :page-size="pengding.linesPerPage"
                :current-page.sync="pengding.pageNo"
                :total="pengding.rowCount">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane>
        <span slot="label">
          <span class="span-box">
            <span>{{$t('tabs.have_to_do')}}</span>

              <span class="btn-bell-badge havedo">
                <span class="num ">{{processing.rowCount}}</span>
              </span>
          </span>
        </span>
            <div>
              <div class="message pending">
                <span class="c-white">{{$t('tabs.have_to_do')}}</span>
              </div>
              <el-table
                :data="processing.datas"
                style="width: 100%"
                max-height="200"
                @row-click="procesCellClick"
                :header-cell-style="rowClass">
                <el-table-column
                  prop="resourceName"
                  :label="$t('placeholder.file_name')"
                  min-width="40%"
                  >
                </el-table-column>
                <el-table-column
                  prop="userName"
                  :label="$t('tabs.applicant')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop="power"
                  :label="$t('form.apply_permission')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop="createDate"
                  :label="$t('tabs.apply_time')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop="approval"
                  :label="$t('label.examine_approve')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  prop="approvers"
                  :label="$t('tabs.approver')"
                  min-width="12%">
                </el-table-column>
                <el-table-column
                  :label="$t('label.reason')"
                  min-width="12%">
                  <template slot-scope="scope">
                    <span>{{scope.row.rejectReason?scope.row.rejectReason:scope.row.reason}}</span>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                right
                background
                layout="prev, pager, next"
                class="myPedding-pag"
                :page-size="processing.linesPerPage"
                :current-page.sync="processing.pageNo"
                :total="processing.rowCount">
              </el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- 不同意时的操作 -->
        <el-dialog
          :title="$t('title.refuse_reason')"
          :visible.sync="dialogRefuse"
          width="23%"
          >
          <div class="refuseText">
            <span>{{$t('placeholder.enter_reason_rejection')}}</span>
            <div class="refuseInput">
              <input type="text" :placeholder="$t('title.refuse_reason')" class="refuseInput-text" v-model="refuseMessage"/>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogRefuse = false">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="refuseConfirm(dialogId,refuseMessage)">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 知识地图列表 -->
      <div class="right-tb">
        <el-tabs type="border-card" class="person-card-title">
          <el-tab-pane>
              <span slot="label">
          <span class="span-box">
            <span>{{$t('tabs.to_do')}}</span>

              <span class="btn-bell-badge todo">
                <span class="num ">{{knowledgePengding.rowCount}}</span>
              </span>
          </span>
        </span>
            <div class="personPending">
              <div class="message pending">
                <span class="c-white">{{$t('tabs.to_do')}}</span>
              </div>
              <el-table
                :data="knowledgePengding.datas"
                style="width: 100%"
                max-height="200"
                @row-click="handleKnowledgeClick"
                :header-cell-style="rowClass">
                <el-table-column
                  prop="title"
                  :label="$t('tabs.knowledge_map')"
                  min-width="90%">
                </el-table-column>
                <el-table-column
                  prop="approvers"
                  :label="$t('tabs.approver')" 
                  width="150">
                </el-table-column>
                <el-table-column
                  prop="power"
                  :label="$t('tabs.current_state')"
                  width="150">
                </el-table-column>
              </el-table>
              <el-pagination
                right
                background
                layout="prev, pager, next"
                class="myPedding-pag"
                :page-size="knowledgePengding.linesPerPage"
                :current-page.sync="knowledgePengding.pageNo"
                :total="knowledgePengding.rowCount">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane >
       <span slot="label">
         <span class="span-box">
            <span>{{$t('tabs.have_to_do')}}</span>
          
              <span class="btn-bell-badge havedo">
                <span class="num ">{{knowledgeProcessing.rowCount}}</span>
              </span>
          </span>
       </span>
            <div>
              <div class="message pending">
                <span class="c-white">{{$t('tabs.have_to_do')}}</span>
              </div>
              <el-table
                :data="knowledgeProcessing.datas"
                style="width: 100%"
                max-height="200"
                @row-click="handleKnowledgeClick"
                :header-cell-style="rowClass">
                <el-table-column
                  prop="title"
                  :label="$t('tabs.knowledge_map')"
                  min-width="90%"
                  >
                </el-table-column>
                <el-table-column
                  prop="approvers"
                  :label="$t('tabs.approver')"
                  width="150">
                </el-table-column>
                <el-table-column
                  prop="power"
                  :label="$t('tabs.current_state')"
                  width="150">
                </el-table-column>
              </el-table>
              <el-pagination
                right
                background
                layout="prev, pager, next"
                class="myPedding-pag"
                :page-size="knowledgeProcessing.linesPerPage"
                :current-page.sync="knowledgeProcessing.pageNo"
                :total="knowledgeProcessing.rowCount">
              </el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
  </div>
</template>
<script>
import API from "@/api.js";
import { filePreview } from "../../utils/utils.js";
//状态：0 没处理  1 处理通过  2处理不通过
const APPLY_STATUS = {
    PENDING : 0,
    AGREE : 1,
    DISAGREE : 2
}
export default {
  name: "myPending",
  props: [
    'activeName'
  ],
  data () {
    return {
      user: {},
      pengding: [],    //待办
      processing: [],    //{{$t('tabs.have_to_do')}}
      knowledgePengding: [],    //知识地图待办
      knowledgeProcessing: [],   //知识地图已办
      dialogRefuse: false,
      params: {
        userId: '',
        pageNo: 1,
        linesPerPage: 15,
        id: ''
      },
      currentId:'',
      dialogId:'',
      refuseMessage:''
    }
  },

  watch:{
    activeName(val){
      if(val == 'mypending'){
        this.getMyPedding();
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
          this.getMyPedding();
          this.knowledgeData();
        } 
      })
    },
    getMyPedding () {
      let that = this;
      //获取待办信息
      this.params.userId = this.user.id;
      API.getMypeddingMessage(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          if(data && data.datas){
            //判断申请权限
            for(let i=0;i<data.datas.length;i++){
              let power ="";
              if(data.datas[i].download){
                power += this.$t('btns.download');
              }
              if(data.datas[i].preview){
                power += this.$t('digalogTree.preview');
              }
              if(data.datas[i].edit){
                power += this.$t('btns.edit');
              }
              data.datas[i].power = power.trim();
            }
          }
          this.pengding = data;
        } 
      });
      //获取已办信息
      API.getProcessingMessage(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          //判断申请权限
          for(let i=0;i<data.datas.length;i++){
            let permission = that.getPermission(data.datas[i]);
            data.datas[i].power = permission;
            if(data.datas[i].status== 0){
              data.datas[i].approval = "未处理"
            }else if(data.datas[i].status== 1){
              data.datas[i].approval = "同意"
            }else{
              data.datas[i].approval = "不同意"
            }
          }
          this.processing = data;
        } 
      })
    },

    //获取知识地图待办已办的信息
    knowledgeData() {
      this.params.userId = this.user.id;
      //获取待办信息
      API.getKnowledgeMypeddingMessage(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          if(data && data.datas){
            //判断当前状态
            for(let i=0;i<data.datas.length;i++){
              data.datas[i].power = this.getMapStatus(data.datas[i].status);
            }
          }
          this.knowledgePengding = data;
        } 
      });
      //获取已办信息
      API.getKnowledgeProcessingMessage(this.params, {
        onSucess: resp => {
          let data = resp.data.data
          if(data && data.datas){
            //判断当前状态
            for(let i=0;i<data.datas.length;i++){
              data.datas[i].power = this.getMapStatus(data.datas[i].status);
            }
          }
          this.knowledgeProcessing = data;
        } 
      });
    },
    /**
     * 返回申请权限
     * @param {object} record 
     */
    getPermission(record) {
        let permission = "";
        if (record.download) {
            permission += this.$t('btns.download');
        }
        if (record.preview) {
            permission += "  预览";
        }
        if (record.edit) {
            permission += this.$t('btns.edit');
        }
        return permission.trim();
    },

    /**
     * 判断知识地图的当前流程状态
     */
     getMapStatus(status) {
      let currentSatus = "";   //流程状态;
      switch(status) {
        case "initiate" :
          currentSatus = this.$t('btns.newly_build');
        break;
        case "standard" :
          currentSatus = this.$t('btns.indicators');
        break;
        case "edit" :
          currentSatus = this.$t('btns.edit');
        break;
        case "review" :
          currentSatus = this.$t('btns.audit');
        break;
        case "pass" :
          currentSatus = this.$t('btns.review_approval');
        break;
        case "release" :
          currentSatus =this.$t('btns.release');
        break;
      }
      return currentSatus;
    },

    //点击知识地图
    handleKnowledgeClick(row) {
      API.getKnowledge(row.id,{
        onSucess: resp => {
          if(resp.data && resp.data.errcode == 0){
            let param = {
              id: row.id,
              data:{
                personData:resp.data.data
              }
            }
            this.$router.push({
              path: '/newKnowledgeMap',
              query: {param}
            });
          }
        } 
      });
    },
    //待办同意操作
    agreeOperation(id) {
      let dataJson={};
      this.params.id = id;
      dataJson.id = id;
      dataJson.status = "1";
      API.agreeOperation(this.params,dataJson,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.getMyPedding();
          }
        } 
      });
    },
    //待办不同意操作
    disAgreeOperation(id) {
      this.dialogRefuse = true;
      this.dialogId = id;
    },
    //拒绝理由的确认
    refuseConfirm(id,rejectReason) {
      this.params.id = id;
      let dataJson = {}
      dataJson.id = id,
      dataJson.rejectReason = rejectReason,
      dataJson.status = 2,
      API.agreeOperation(this.params,dataJson,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.dialogRefuse = false;
            this.getMyPedding();
          }
        } 
      });
    },
    //预览状态
    procesCellClick (row) {
     let fileId = row.resourceId;
     API.previewAble(fileId,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let params = {
              staticContextPath: kmsConfig.staticContextPath,
              kmsFilePath: kmsConfig.kmsFilePath,
              diskId: resp.data.diskId,
              fileId: resp.data.id,
              collected: resp.data.originType,
              fileObj: row
            }
            let url = filePreview(params);
            window.open(url);
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
     * 获取申请理由
     */
    getApplicationReason(record){
      let reason = "";
      switch(record.status) {
      case APPLY_STATUS.PENDING : 
          reason = record.reason;
          break;
      case APPLY_STATUS.AGREE : 
          reason = "";
          break;
      case APPLY_STATUS.DISAGREE : 
          reason = "";
          break;
      }
      return reason;
    },

  },

  mounted () {
    this.getMyProfile();
  },
  
}
</script>

