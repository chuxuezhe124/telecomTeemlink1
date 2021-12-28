<template>
  <div>
    <el-dialog
      :title="$t('authorization.list')"
      :visible.sync="impowerTreeModalParams.visible"
      width="80%"
      :before-close="handleImpowerTreeDialogClose">
      <div class="impower-tree-dialog">
        <div class="bar">
          <el-button type="primary" @click="createAuthorizations">{{$t('btns.create')}}</el-button>
          <el-button v-if="multipleSelectionArray.length > 0" type="danger" @click="showDeleteMessageBox('batch')">{{$t('btns.batch_delete')}}</el-button>
        </div>
        <div class="tableDiv">
          <el-table
            ref="multipleTable"
            :data="data"
            style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              prop="description"
              :label="$t('tabs.description')"
              width="200">
            </el-table-column>
            <el-table-column
              prop="targetName"
              :label="$t('authorization.object')">
            </el-table-column>
            <el-table-column
              prop="operationString"
              :label="$t('form.permission')"
              width="120">
            </el-table-column>
             <el-table-column
              prop="indate"
              :label="$t('tabs.aging')"
              width="200">
            </el-table-column>
            <el-table-column
              :label="$t('tabs.operation')"
              width="160"
              align="right">
              <template slot-scope="scope">
                <el-button
                  size="mini" @click="handleEdit(scope.row)">{{$t('btns.edit')}}</el-button>
                <el-button
                  size="mini"
                  type="danger" @click="showDeleteMessageBox('single', scope.row.id)">{{$t('btns.delete')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="impower-form">
          <el-dialog
            width="50%"
            :title="editVisible ? $t('edit_authorization'): $t('suthorized_as')"
            :visible.sync="subVisible"
            :before-close="handleImpowerFormDialogClose" 
            append-to-body>
            <div>
              <el-form label-position="left" label-width="120px">
                <el-form-item :label="$t('tabs.description')">
                  <el-input
                    type="textarea"
                    :rows="2"
                    :placeholder="$t('placeholder.enter_description')"
                    v-model="impowerParams.description">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('authorization.scope')">
                  <el-radio-group v-model="impowerParams.scope">
                    <el-radio :label="SCOPE_RANGE.DEPT">{{$t('menu.department') }}</el-radio>
                    <el-radio :label="SCOPE_RANGE.USER">{{$t('User')}}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('authorization.empower_department')" v-if="impowerParams.scope == SCOPE_RANGE.DEPT">
                  <div v-if="selectDeptData.length > 0">
                    <el-tag
                      style="margin-right: 4px;"
                      v-for="(data, index) in selectDeptData"
                      :key="data.id"
                      closable
                      @close="handleDeptRemove(index)"
                      type="info">
                      {{data.name}}
                    </el-tag>
                  </div>
                  <el-button type="primary" size="mini"  @click="showDeptSelectBox">{{$t('btns.add_department')}}</el-button>
                </el-form-item>
                <el-form-item :label="$t('authorization.empower_user')" v-if="impowerParams.scope == SCOPE_RANGE.USER">
                  <div v-if="selectUserData.length > 0">
                    <div 
                      style="display: inline-block; margin-right: 4px;"
                      v-for="(data, index) in selectUserData" 
                      :key="data.id">
                      <el-popover 
                        placement="top-start"
                        title=""
                        width="200"
                        trigger="hover"
                        >
                        <div class="popover">
                          <div><a @click="handleUserRemove(index)">{{$t('btns.delete')}}</a></div>
                        </div>
                        <el-tag slot="reference">{{data.name}}</el-tag>
                      </el-popover>
                    </div>
                  </div>
                  <el-button type="primary" size="mini" @click="showUserDialog">{{$t('btns.add_user')}}</el-button>
                </el-form-item>
                <el-form-item :label="$t('form.permission')">
                  <el-checkbox-group v-model="impowerParams.operations">
                    <el-checkbox label="2">{{$t('label.preview')}}</el-checkbox>
                    <el-checkbox label="1">{{$t('btns.download')}}</el-checkbox>
                    <el-checkbox label="3">{{$t('btns.edit')}}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item :label="$t('tabs.aging')">
                  <el-select v-model="impowerParams.timeLimitType" :placeholder="$t('select')">
                    <el-option
                      :label="$t('authorization.permanent')"
                      :value="TIMELIMITTYPE.TIME_LIMIT_TYPE_PERMANENCE">
                    </el-option>
                    <el-option
                      :label="$t('authorization.time_limited')"
                      :value="TIMELIMITTYPE.TIME_LIMIT_TYPE_TEMPORARY">
                    </el-option>
                  </el-select>
                  <el-date-picker
                    v-if="impowerParams.timeLimitType != TIMELIMITTYPE.TIME_LIMIT_TYPE_PERMANENCE"
                    v-model="impowerParams.indateRange"
                    :format="$t('time_y_m_d')"
                    type="daterange"
                    :range-separator="$t('to')"
                    :start-placeholder="$t('start_placeholder')"
                    :end-placeholder="$t('end_placeholder')"
                    @change="onChangeRangePicker">
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="handleImpowerFormDialogClose">{{$t('btns.cancel')}}</el-button>
              <el-button type="primary" v-if="!editVisible" @click="handleImpowerOk">{{$t('btns.determine')}}</el-button>
              <el-button type="primary" v-if="editVisible" @click="handleEditImpowerOk">{{$t('btns.determine')}}</el-button>
            </span>

            <el-dialog
              width="400px"
              :title="$t('department.selection')"
              :visible.sync="deptSelectVisiblve"
              :before-close="handleDeptSelectBoxCancel"
              append-to-body>
              <div>
                <department-select-box
                  :deptSelectVisiblve="deptSelectVisiblve"
                  :impowerParams="impowerParams"
                  @oncheckedKeys="oncheckedKeys"
                ></department-select-box>
              </div>
              <div slot="footer" class="dialog-footer">
                <el-button @click="handleDeptSelectBoxCancel" size="mini">{{$t('btns.cancel')}}</el-button>
                <el-button type="primary" @click="handleDeptSelectBoxOk" size="mini">{{$t('btns.determine')}}</el-button>
              </div>
            </el-dialog>

            <el-dialog
              width="650px"
              :title="$t('user.select')"
              :visible.sync="visible"
              :before-close="handleCancel"
              append-to-body>
              <div style="heigh: 360px;">
                <user-dialog 
                  ref="userDialog"
                  v-bind="$attrs" 
                  v-on="$listeners"
                  :formParams="formParams"
                  @handleSelectUser="handleSelectUser"
                  ></user-dialog>
              </div>
              <div slot="footer" class="dialog-footer">
                <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
                <el-button type="primary" @click="handleSettingUserOk" size="mini">{{$t('btns.determine')}}</el-button>
              </div>
            </el-dialog>

          </el-dialog>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
import moment from 'moment';
moment.locale('zh-cn');

import {handleTableListDataWitdhNORename, dateToTime} from "@/utils/utils.js" ;
//用户选择框
import UserDialog from '@/components/shared/UserDialog/UserDialog.vue';
const TIMELIMITTYPE = {
  "TIME_LIMIT_TYPE_PERMANENCE" : "1", //永久
  "TIME_LIMIT_TYPE_TEMPORARY" : "2", //限时授权
}
const SCOPE_RANGE = {
  "DEPT" : 2,
  "USER" : 1
}

const RESOURCE_TYPE_FILE = 1;
const RESOURCE_TYPE_FOLDER = 2;
const CODE_DOWNLOAD = 1;
const CODE_PREVIEW = 2;
const CODE_EDIT = 3;
const CODE_SHARE = 4;
const CODE_COLLECT = 8;

export default {
  name: 'impowertreedialog',
  components: {
    UserDialog
  },
  props: [
    'impowerTreeModalParams',
  ],
  data(){
    return{
      data: [],
      subVisible: false,  //新建弹出层
      editVisible: false, //编辑权限弹出层
      multipleSelection: [],
      multipleSelectionArray: [],
      editAuthorizationId : "",   //编辑某条授权的id 
      impowerParams: {
        "description": "",
        "scope":SCOPE_RANGE.DEPT,
        "targetId":[],
        "targetName":"",
        "startDate":"",
        "endDate":"",
        "indateRange": "",
        "resourceId": this.impowerTreeModalParams.record.id,
        "resourceType": this.impowerTreeModalParams.record.folder ? RESOURCE_TYPE_FOLDER : RESOURCE_TYPE_FILE,
        "operations":[],
        "creatorId":"",
        "creator":"",
        "createDate":"",
        "timeLimitType" :""
      },
      selectUserData: [], 
      selectDeptData: [],
      deptIds: [],
      TIMELIMITTYPE: {
        "TIME_LIMIT_TYPE_PERMANENCE": "1", //永久
        "TIME_LIMIT_TYPE_TEMPORARY": "2", //限时授权
      },
      SCOPE_RANGE: {
        "DEPT": 2,
        "USER": 1
      },
      deptSelectVisiblve: false,    //部门选择框
      visible: false,
      formParams:{
        members: [],
        userId: []
      }
    }
  },

   watch: {
    impowerTreeModalParams() {
      let resourceId = this.impowerTreeModalParams.resourceId;
      this.getAuthorizationData(resourceId);
      this.setResource(this.impowerTreeModalParams.record);
    }
  },

  mounted(){
    let resourceId = this.impowerTreeModalParams.resourceId;
    this.getAuthorizationData(resourceId);
    this.setResource(this.impowerTreeModalParams.record);
  },

  methods: {
    /**
     * 获取授权列表数据
     */
    async getAuthorizationData(resourceId){
      if(resourceId != ""){
        const result = (await API.getAuthorizationData(resourceId)).data.data.datas;
        const resultAddKey = handleTableListDataWitdhNORename(result);
        const data = this.handleDataForShow(resultAddKey);
        this.data = data;
      }
      

    },

    /**
     * 把当前要授权的资源的id和name添加到state里
     * @param {Object} record 
     */
    setResource(record) {
      let impowerParams = {...this.impowerParams}
      impowerParams.resourceId = record.id;
      impowerParams.creatorId = record.creatorId;
      impowerParams.creator = record.creator;
      impowerParams.createDate = record.createDate;
      this.impowerParams = impowerParams;
    },

    /**
     * 处理授权列表,为显示
     * @param {Array} data 
     */
    handleDataForShow(data) {
      data.map((e,key) => {
        let operationString = "";
        e.operations.map((e) => {
          switch(parseInt(e)) {
            case CODE_DOWNLOAD :
                operationString += this.$t('digalogTree.download');
            break;
            case CODE_PREVIEW :
                operationString += this.$t('digalogTree.preview');
            break;
            case CODE_EDIT :
                operationString +=  this.$t('digalogTree.edit');
            break;
            case CODE_SHARE :
                operationString += this.$t('digalogTree.share');
            break;
            case CODE_COLLECT :
                operationString += this.$t('digalogTree.collection');
            break;
          }
        })
        if(operationString.length>0){
            operationString = operationString.substring(0,operationString.length-1)
        }
        data[key].operationString = operationString;

        let startDate = data[key].startDate ?  data[key].startDate : "" ;
        let endDate = data[key].endDate ?  data[key].endDate : "" ;
        let timeLimitType = data[key].timeLimitType ?  data[key].timeLimitType : "" ;
        let indate = "";
        if(timeLimitType != "1" && (startDate || endDate)){
            indate = data[key].startDate + this.$t('to') + data[key].endDate;
        }else {
            indate = this.$t('permanent');
        }
        data[key].indate = indate;
      });
      return data;
      
    },

    /**
     * 勾选行时响应
     */
    handleSelectionChange(val){
      let multipleSelection = [];
      if(val.length){
        val.map((e) => {
          multipleSelection.push(e.id)
        })
      }
      this.multipleSelectionArray = val;
      this.multipleSelection = multipleSelection;
    },

    /**
     * 取消选中行，分页、批量处理使用
     */
    cancelMultipleSelection() {
      this.$refs.multipleTable.clearSelection();
    },

    /**
     * 批量删除
     */
    showDeleteMessageBox(type, deleteIdArray){
      const resourceId = this.impowerParams.resourceId;
      let authorizationIdArray = [];
      if(type == "single"){
        authorizationIdArray.push(deleteIdArray);
      }else{
        authorizationIdArray = this.multipleSelection;
      }
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(async () => {
        const result = (await API.deleteAuthorizations(authorizationIdArray)).data
        if(result.errcode == 0){
          this.getAuthorizationData(resourceId);
          this.$message({
            type: 'success',
            message: this.$t('msg.es')
          });
        }
      }).catch(() => {
        this.cancelMultipleSelection();
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    },

    /**
     * 取消授权
     */
    handleImpowerTreeDialogClose(){
      this.$emit('handleImpowerTreeDialogClose');
    },


    /**
     * 重置授权参数，新建/编辑时用
     */
    resetImpowerParams(){
      //重置部分参数
      let impowerParams = {
        ...this.impowerParams,
        "description": "",
        "targetId":[],
        "targetName":"",
        "startDate":"",
        "endDate":"",
        "indateRange": "",
        "operations":[],
        "scope" : SCOPE_RANGE.DEPT,
        "creatorId":"",
        "creator":"",
        "createDate":"",
        "timeLimitType":"1"
      };
      this.impowerParams = impowerParams;
    },

    /**
     * 创建授权
     */
    createAuthorizations(){
      this.resetImpowerParams();
      this.showSubImpowerModal();
    },

    /**
     * 打开新建授权信息界面
     */
    showSubImpowerModal(){
      this.subVisible = true
    },

    /**
     * 取消新建授权信息界面
     */
    handleImpowerFormDialogClose(){
      this.selectUserData = [];
      this.selectDeptData = [];
      this.deptIds = [];
      this.subVisible = false;
      if(this.editVisible == true){   //取消编辑授权时
        this.hideEditImpowerCancel();
      }
    },

    /**
     * 确定新建授权
     */
    async handleImpowerOk(){
      const impowerParams = {
        ...this.impowerParams,
        "resourceId": this.impowerTreeModalParams.record.id,
      }
      console.log(impowerParams)
      if(impowerParams.targetId.length == 0) {
        this.$message({
          type: 'warning',
          message: this.$t('msg.authorization_object_sl')
        });
        return;
      }else if(impowerParams.operations.length == 0) {
        this.$message({
          type: 'warning',
          message: this.$t('msg.least_permission_sl')
        });
        return;
      }else if(impowerParams.timeLimitType == TIMELIMITTYPE.TIME_LIMIT_TYPE_TEMPORARY 
        && (impowerParams.startDate == "" || impowerParams.startDate == null )
        && (impowerParams.endDate == "" || impowerParams.endDate == null)){
        this.$message({
          type: 'warning',
          message: this.$t('msg.start_end_time_sl')
        });    
        return;
      }else{
        const result = (await API.createAuthorization(impowerParams)).data;
        if(result.errcode == 0) {
          this.getAuthorizationData(impowerParams.resourceId);
          this.$message({
            type: 'success',
            message: this.$t('msg.authorization_ss')
          }); 
        }
        this.handleImpowerFormDialogClose();
      }
    },

    /**
     * 显示部门选择框
     */
    showDeptSelectBox(){
      this.deptSelectVisiblve = true;
    },

    /**
     * 取消部门选择框
     */
    handleDeptSelectBoxCancel(){
      this.deptSelectVisiblve = false;
      this.deptIds= [];
    },

    /**
     * 获取选中部门节点id
     */
    oncheckedKeys(data){
      this.deptIds = data;
    },

    /**
     * 确定部门选择框
     */
    handleDeptSelectBoxOk(){
      let data = this.deptIds;
      let targetId = [];
      let targetName = "";
      data.map((e) => {
          targetId.push(e.id);
          targetName += e.name+",";
      })
      
      const impowerParams = {
        ...this.impowerParams,
        "targetId" : targetId,
        "targetName" : targetName.substring(0,targetName.length-1)
      }
      this.impowerParams = impowerParams;
      this.selectDeptData = data;
      this.deptSelectVisiblve = false;
    },

    /**
     * 删除部门
     */
    handleDeptRemove(index) {
      let selectDeptData = [
        ...this.selectDeptData.slice(0, index),
        ...this.selectDeptData.slice(index + 1)
      ]

      let targetId = [];
      let targetName = "";
      selectDeptData.map((e) => {
          targetId.push(e.id);
          targetName += e.name+",";
      })
      const impowerParams = {
        ...this.impowerParams,
        "targetId" : targetId,
        "targetName" : targetName.substring(0,targetName.length-1)
      }
      this.impowerParams = impowerParams;
      this.selectDeptData = selectDeptData;
      this.deptIds = selectDeptData;
     },

    /**
     * 显示用户选择框
     */
    showUserDialog(){
      this.visible = true;
    },

    /**
     * 取消用户选择框
     */
    handleCancel(){
      this.$refs.userDialog.handleCancel();
      this.visible = false;
    },

    /**
     * 确定已选择用户
     */
    handleSettingUserOk(){
      this.$refs.userDialog.handleSelectUser();
      this.visible = false;
    },

    /**
     * 选择授权对象-用户
     * @param {Object} data 
     */
    handleSelectUser(data){
      let targetId = [];
      let targetName = "";

      data.map((e) => {
          targetId.push(e.id);
          targetName += e.name+",";
      })
      const selectUserData =  data;
      const impowerParams = {
        ...this.impowerParams,
        "targetId" : targetId,
        "targetName" : targetName.substring(0,targetName.length-1)
      }
      //与用户选择框参数先符合，后续在把授权统一
      const formParams = {
        ...this.formParams,
        "members" : data,
        "userId" : targetId
      }
      this.formParams = formParams;
      this.impowerParams = impowerParams;
      this.selectUserData = selectUserData;
    },

    /**
     * 删除用户
     * @param {int} index 
     */
    handleUserRemove(index){
      let selectUserData = [
        ...this.selectUserData.slice(0, index),
        ...this.selectUserData.slice(index + 1)
      ]
      let targetId = [];
      let targetName = "";
      selectUserData.map((e) => {
          targetId.push(e.id);
          targetName += e.name+",";
      })

      const impowerParams = {
        ...this.impowerParams,
        "targetId" : targetId,
        "targetName" : targetName.substring(0,targetName.length-1)
      }

      this.impowerParams = impowerParams
      this.selectUserData = selectUserData;

      // ---------
      let datas = [
        ...this.formParams.members.slice(0, index),
        ...this.formParams.members.slice(index + 1)
      ]
      const formParams = {
        ...this.formParams,
        "members" : datas,
        "userId" : ""
      }
      this.formParams = formParams;
    },

    /**
     * 修改时效参数
     */
    onChangeRangePicker(){
      let startDate = "";
      let endDate ="";
      let impowerParams = {...this.impowerParams}
      startDate = dateToTime(impowerParams.indateRange[0]);
      endDate = dateToTime(impowerParams.indateRange[1]);
      impowerParams.startDate = startDate;
      impowerParams.endDate = endDate;
      this.impowerParams = impowerParams;
    },

    /**
     * 编辑授权
     */
    handleEdit(record){
      let editAuthorizationId = {...this.editAuthorizationId};
      let indateRange = [];
      console.log(record,"编辑时候的")
      if(record.startDate !="" && record.endDate  !=""){
        indateRange.push(moment(record.startDate, 'YYYY-MM-DD'));
        indateRange.push(moment(record.endDate, 'YYYY-MM-DD'));
      }
      let impowerParams = {
        ...this.impowerParams,
        "startDate" : record.startDate,
        "endDate" : record.endDate,
        "indateRange": indateRange,
        "description" : record.description,
        "scope" : record.scope,
        "targetId" : record.targetId,
        "targetName" : record.targetName,
        "operations" : record.operations,
        "timeLimitType" : record.timeLimitType
      };
      console.log(impowerParams,"aaaa")

      editAuthorizationId = record.id;

      const targetIdArray = record.targetId;
      const targetNameArray = record.targetName.split(",");
      let selectUserData = [];
      let selectDeptData = [];
      let selectData = [];
      
      targetIdArray.map((e,key) => {
        let selectedObj = {};
        selectedObj.id = e;
        selectedObj.name = targetNameArray[key];
        selectData.push(selectedObj);
      })
      
      if(record.scope == SCOPE_RANGE.DEPT) {
          selectDeptData = selectData;
      }

      if(record.scope == SCOPE_RANGE.USER) {
          selectUserData = selectData;
      }
      this.impowerParams = impowerParams;
      this.selectUserData = selectUserData;
      this.selectDeptData = selectDeptData;
      this.editAuthorizationId = editAuthorizationId

      this.ShowEditImpowerShow();
    },

    /**
     * 打开编辑授权信息界面
     */
    ShowEditImpowerShow(){
      this.subVisible = true;
      this.editVisible = true;
    },

    /**
     * 确定编辑授权
     */
    async handleEditImpowerOk() {
      const impowerParams = this.impowerParams;
      let editParams  = {
        "id": this.editAuthorizationId,
        "description": impowerParams.description,
        "scope": impowerParams.scope,
        "targetId": impowerParams.targetId,
        "targetName": impowerParams.targetName,
        "startDate": impowerParams.startDate,
        "endDate": impowerParams.endDate,
        "creatorId":impowerParams.creatorId,
        "creator":impowerParams.creator,
        "createDate":impowerParams.createDate,
        "resourceId":impowerParams.resourceId,
        "resourceType":impowerParams.resourceType,
        "operations":impowerParams.operations,
        "timeLimitType" : impowerParams.timeLimitType
      }

      if(impowerParams.targetId.length == 0) {
        this.$message({
          type: 'warning',
          message: this.$t('msg.authorization_object_sl')
        }); 
        return;
      }else if(impowerParams.operations.length == 0) {
        this.$message({
          type: 'warning',
          message: this.$t('msg.least_permission_sl')
        }); 
        return;
      }else if(impowerParams.timeLimitType == TIMELIMITTYPE.TIME_LIMIT_TYPE_TEMPORARY 
              && (impowerParams.startDate == "" || impowerParams.startDate == null )
              && (impowerParams.endDate == "" || impowerParams.endDate == null)) {
        this.$message({
          type: 'warning',
          message: this.$t('msg.start_end_time_sl')
        });    
        return;
      }else {
        const result = (await API.editAuthorization(editParams)).data;
        if(result.errcode == 0) {
          this.getAuthorizationData(impowerParams.resourceId);
          this.$message({
            type: 'success',
            message: this.$t('msg.authorization_ss')
          }); 
          this.hideEditImpowerCancel();
        }
      }
    },

    /**
     * 取消编辑授权信息界面
     */
    hideEditImpowerCancel(){
      let impowerParams = {...this.impowerParams};
      let editAuthorizationId = {...this.editAuthorizationId};

      editAuthorizationId = "";
      impowerParams.startDate = "";
      impowerParams.endDate = "";
      impowerParams.description = "";

      this.editAuthorizationId = editAuthorizationId;
      this.impowerParams = impowerParams;
      this.editVisible = false;
      this.subVisible = false;
      this.selectUserData = [];
      this.selectDeptData = [];
    },

  }
}
</script>