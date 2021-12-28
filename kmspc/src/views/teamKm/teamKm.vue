<template>
  <div class="teamKm" :class="{'paddingTop':paddingTop}" name="teamKm">
    <div class="search-bar" ref="searchHead">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <span class="control-label">{{$t('tabs.NO')}} </span>
            <span>
              <el-input class="input-group" v-model="searchParams.serialNumber" @change="onSearchTeamKmList" :placeholder="$t('placeholder.enter_number')" size="mini"></el-input>
            </span>
          </div>
        </el-col>
        <el-col :span="7">
          <div class="grid-content bg-purple">
            <span class="control-label">{{$t('form.team_sponsor')}}: </span>
            <span>
              <el-input class="input-group" v-model="searchParams.creator" @change="onSearchTeamKmList" :placeholder="$t('placeholder.enter_initiator')" size="mini"></el-input>
            </span>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <span class="control-label">{{$t('menu.department') }}: </span>
            <span>
              <el-input class="input-group" v-model="departmentName" :placeholder="$t('placeholder.department')"   @clear="clearDepartmentName" readOnly size="mini" clearable></el-input>
              <el-button @click="showDeptDialog" size="mini">{{$t('btns.access_department')}}</el-button>
            </span>
            <span>
              <el-dialog
                width="30%"
                :title="$t('department.selection')"
                :visible.sync="visiblve">
                <div>
                  <impower-dept-select @oncheckedKeys="oncheckedKeys"></impower-dept-select>
                </div>
              </el-dialog>
            </span>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="grid-content bg-purple">
            <span class="control-label">{{$t('tabs.keywords')}}: </span>
            <span>
              <el-input class="input-group" v-model="searchParams.teamName" @change="onSearchTeamKmList" :placeholder="$t('placeholder.enter_team_keyword')" size="mini"></el-input>
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content bg-purple">
            <span class="control-label">{{$t('form.time_period')}}: </span>
            <span>
              <el-date-picker
              size="mini"
                v-model="dateString" 
                type="daterange"
                :range-separator="$t('to')"
                :start-placeholder="$t('start_placeholder')"
                :end-placeholder="$t('end_placeholder')">
              </el-date-picker>
            </span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button @click="onSearchTeamKmList" size="mini">{{$t('btns.query')}}</el-button>
            <el-button @click="onReset" size="mini">{{$t('btns.reset')}}</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="create-bar">
       <el-switch
        v-model="searchParams.isMyTeams"
        :active-text="$t('participate_in')"
        @change="onSwitchChange">
      </el-switch>
      <el-button type="primary" @click="showCreatTeamDialog" size="mini">{{$t('diaglog.create_team')}}</el-button>
      <el-button type="danger" v-if="multipleSelectionKeys.length > 0" @click="showDeleteMessageBox" size="mini">{{$t('btns.delete')}}</el-button>
    </div>
    <div>
      <el-dialog
        width="50%"
        :title="$t('diaglog.create_team')"
        :before-close="handleCancel"
        :visible.sync="newTeamVisiblve">
        <div style="width:500px;word-break:keep-all">
          <team-form 
            :formParams="formParams" 
            v-on:handleSelectUser="handleSelectUser"
            :deptList="deptList"
            :comList="comList"
            @handleManagerSet="handleManagerSet"
            @handleUserRemove="handleUserRemove"
            @hanleDeptList="hanleDeptList"
            @hanleComList="hanleComList">
          </team-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
          <el-button type="primary" @click="handleSettingsOk" size="mini">{{$t('btns.determine')}}</el-button>
        </div>
      </el-dialog>
      <el-dialog
        width="50%"
        :title="$t('diaglog.create_team')"
        v-bind="$attrs" 
        v-on="$listeners"
        :before-close="handleCancel"
        :visible.sync="editTeamVisiblve">
        <div style="width:500px">
          <team-form 
            :formParams="formParams"  
            :deptList="deptList"
            :comList="comList"
            v-on:handleSelectUser="handleSelectUser"
            @handleManagerSet="handleManagerSet"
            @handleUserRemove="handleUserRemove"
            @hanleDeptList="hanleDeptList"
            @hanleComList="hanleComList">
          </team-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
          <el-button type="primary" @click="handleEditTeamOk" size="mini">{{$t('btns.determine')}}</el-button>
        </div>
      </el-dialog>
    </div>
    <div class="team-list">
      <el-table
        ref="multipleTable"
        @selection-change="handleSelectionChange"
        :data="teamListData.datas"
        :height="clientHeight"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="serialNumber"
          :label="$t('tabs.NO')"
          width="180">
        </el-table-column>
        <el-table-column
          :label="$t('tabs.definition')">
          <template slot-scope="scope">
            <a class="teamKmName" size="mini" @click="clickTeam(scope.row)">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="membersString"
          :label="$t('tabs.member')">
        </el-table-column>
        <el-table-column
          prop="createDate"
          :label="$t('label.creation_time')"
          width="180">
        </el-table-column>
        <el-table-column
          :label="$t('tabs.operation')"
          width="160"
          align="right">
          <template slot-scope="scope">
            <el-dropdown>
              <span class="el-dropdown-link" >
                <i class="el-icon-more"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="!getIsShowOperation(scope.row)">
                  <span @click="handleEdit(scope.row)">{{$t('btns.edit')}}</span>
                </el-dropdown-item>
                 <el-dropdown-item :disabled="!getIsShowOperation(scope.row)">
                  <span @click="showDeleteMessageBox(scope.row)">{{$t('btns.delete')}}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          right
          background
          layout="prev, pager, next"
          :page-size="teamListData.linesPerPage"
          :total="teamListData.rowCount"
          @current-change="handleCurrentChange"
          :current-page.sync="teamListData.pageNo">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
import { dateToTime, getIsShowOperation } from '@/utils/utils.js';
import TeamForm from '@/components/TeamKm/TeamForm.vue';
export default {
  name: 'teamKm',
  components: {
    TeamForm
  },
  data(){
    return{
      paddingTop: false,    //头部padding
      clientHeight: 0,
      user: {},
      teamListData: {}, 
      dateString: [],
      searchParams : {
        "isMyTeams" : false,
        "serialNumber" : "",
        "creator" : "",
        "departmentId" : "",
        "teamName" : "",
        "beginTime" : "",
        "endTime" : "",
        "linesPerPage" : 15,
        "pageNo" : 1
      }, 
      departmentName: "",
      visiblve: false,
      multipleSelection: [],
      multipleSelectionKeys: [],
      curEditTeamId : "",     //当前编辑的团队的id
      formParams : {
        "serialNumber": "",
        "name":"",
        "description":"",
        "deptPermission":[],
        "compPermission":[],
        "members":[]
      },
      newTeamVisiblve: false,
      editTeamVisiblve: false,
      deptList: [],       //分享部门
      comList: [],        //分享公司
    }
  },
  created(){
    const windowHeight = document.documentElement.clientHeight;
    // 88查询表单的高度 28按钮的高度 38表格头的高度 33底部授权信息
    this.clientHeight = windowHeight - 88 - 28 - 48 -33;
  },
  mounted(){
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
    this.getMyProfile();
    const searchParams = this.searchParams;
    this.getTeamList(searchParams);
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
     * 获取团队km列表数据
     */
    getTeamList(params){
      API.getTeamList(params, {
        onSucess: resp => {
          let data = {};
          if(resp.data.errcode == 0){
            data = resp.data.data;
            data.datas.map((e,key) => {     //添加显示团员字段
              let membersString = "";
              e.members.map((e) => {
                  membersString += e.name;
                  membersString += ",";
              });
              if(membersString.length>0){
                  membersString = membersString.substring(0,membersString.length-1)
              }
              data.datas[key].key = e.id;
              data.datas[key].membersString= membersString;
              data.datas[key].members = this.handleMember(e.members);
            });
          }
          this.teamListData = data;
        } 
      })
    },

    /**
     * 查询列表
     */
    handleCurrentChange(val){
      let searchParams = {
        ...this.searchParams,
        pageNo: val ? val : this.searchParams.pageNo,
      };
     this.getTeamList(searchParams);
    },

    //处理团队列表数据-member[],userId转为id
    handleMember(members) {
      const membersArray = [];    
      members.map((e)=>{
        let replaceObj = {};
        replaceObj.name = e.name;
        replaceObj.teamId = e.teamId;
        replaceObj.type = e.type;
        replaceObj.id = e.userId;
        membersArray.push(replaceObj);
      });
      return membersArray;
    },

    //创建团队、编辑团队的请求包体members[]数组对象重现组合
    getFormMembersArray(membersArray) {
      let members = [];
      membersArray.map((item)=>{
        let memberObj = {};
        memberObj.teamId = item.teamId;
        memberObj.name = item.name;
        memberObj.type = item.type;
        memberObj.userId = item.id;
        members.push(memberObj);
      })
      return members;
    },
//清空部门名字
   clearDepartmentName(){
     this.searchParams.departmentId='';
      this.getTeamList(this.searchParams);
   },
    //重置表单参数
    resetFormParams(){
      let formParams = {...this.formParams};
      formParams.serialNumber = "";
      formParams.name = "";
      formParams.description = "";
      formParams.deptPermission = [];
      formParams.compPermission = [];
      formParams.members = [];
      this.formParams = formParams;
      this.comList = [];
      this.deptList = [];
    },

    /**
     * 查询头时间范围改变并且查询列表
     */
    onSearchTeamKmList(){
      if(this.dateString.length>0){
        let beginTime = "";
        let endTime ="";
        this.dateString.map((e,key) => {
          if(key == 0) {
            beginTime = e ? dateToTime(e) : "";
          }else if(key == 1)
            endTime = e ? dateToTime(e) : "";
        })
        endTime=beginTime===endTime? endTime+86400000:endTime;
        console.log(endTime);
        this.searchParams.beginTime = beginTime;
        this.searchParams.endTime = endTime;
      }
      this.getTeamList(this.searchParams);
    },

    /**
     * 重置查询条件
     */
    onReset(){
      let searchParams = {
        "isMyTeams" : false,
        "serialNumber" : "",
        "creator" : "",
        "departmentId" : "",
        "teamName" : "",
        "beginTime" : "",
        "endTime" : "",
        "linesPerPage" : 15,
        "pageNo" : 1
      }
      let dateString = [];
      let departmentName = "";
      this.searchParams = searchParams;
      this.dateString = dateString;
      this.departmentName = departmentName;
      this.getTeamList(searchParams);
    },

    /**
     * 显示部门选择框对话框
     */
    showDeptDialog(){
      this.visiblve = true;
    },

    /**
     * 获取选中部门节点id
     */
    oncheckedKeys(checkedNodes){
      this.searchParams.departmentId = checkedNodes.id;
      this.departmentName = checkedNodes.name;
      this.visiblve = false;
    },

    /**
     * 我参与查询
     */
    onSwitchChange(){
      const searchParams =this.searchParams;
      this.getTeamList(searchParams);
    },

    /**
     * 显示新建团队km
     */
    showCreatTeamDialog(){
      API.getSerialNumber({
        onSucess: resp =>{
          const user = this.user;
          const teamManager = {
            "name" : user.name,
            "type" : 1,
            "id" : user.id
          } 
          let formParams = {
            ...this.formParams,
            members: [teamManager],
            serialNumber: resp.data.data
          }
          this.formParams = formParams;
          this.newTeamVisiblve = true;
        }
      })
    },

    /**
     * 确定新建团队
     */
    handleSettingsOk(){
      let createParam = {...this.formParams};
      let submitMembers = this.getFormMembersArray(createParam.members);
      createParam.members = submitMembers;
      //这里将分享部门和分享公司重新组装，后台只需要英文
      createParam.deptPermission = this.deptList;
      createParam.compPermission = this.comList;
      if(createParam.name == "" || createParam.name == null) {
        this.$message({
          showClose: true,
          message: this.$t('msg.name_no_empty'),
          type: 'warning'
        });
        return;
      }else{
         API.createTeam(createParam, {
          onSucess: resp => {
            if(resp.data.errcode == "0"){
              const searchParams = {...this.searchParams}
              searchParams.isMyTeams = false;
              searchParams.pageNo = 1;
              this.searchParams = searchParams;
              this.getTeamList(searchParams);  //先重置查询列表参数
              this.handleCancel(); 
            }
          } 
        })
      }
    },

    /**
     * 隐藏新建或编辑dialog
     */
    handleCancel(){
      this.newTeamVisiblve = false;
      this.editTeamVisiblve = false;
      this.resetFormParams();     //重置表单参数
    },
    /**
     * 获取分享部门的数据
     */
    hanleDeptList(val){
      this.deptList = val;
    },
    /**
     * 获取分享公司的数据
     */
    hanleComList(val){
      this.comList = val;
    },

    /**
     * 编辑团队
     */
    handleEdit(row){
      const formParams = {
        ...this.formParams,
        serialNumber : row.serialNumber,
        name : row.name,
        description : row.description,
        deptPermission : row.deptPermission,
        compPermission : row.compPermission,
        members : row.members,
      };
      this.formParams = formParams;
      this.curEditTeamId = row.id;     
      this.deptList = row.deptPermission;
      this.comList = row.compPermission;
      this.$set(this.comList,row.compPermission)
      this.editTeamVisiblve = true; 
    },

    /**
     * 确定编辑团队
     */
    handleEditTeamOk(){
      let createParam = {...this.formParams};
      let submitMembers = this.getFormMembersArray(createParam.members);
      createParam.members = submitMembers;
      const teamId = this.curEditTeamId;
      //这里将分享部门和分享公司重新组装，后台只需要英文
      createParam.deptPermission = this.deptList;
      createParam.compPermission = this.comList;
      if(createParam.name == "" || createParam.name == null) {
        this.$message({
          showClose: true,
          message: this.$t('msg.name_no_empty'),
          type: 'warning'
        });
        return;
      }else{
         API.editTeamOk(teamId, createParam, {
          onSucess: resp => {
            if(resp.data.errcode == "0"){
              const searchParams = {...this.searchParams}
              searchParams.isMyTeams = false;
              searchParams.pageNo = 1;
              this.searchParams = searchParams;
              this.curEditTeamId = "";
              this.getTeamList(searchParams);  //先重置查询列表参数
              this.handleCancel(); 
            }
          } 
        })
      }
    },

    /**
     * 勾选行时响应
     */
    handleSelectionChange(val){
      let multipleSelectionKeys = [];
      if(val.length){
        val.map((e) => {
          multipleSelectionKeys.push(e.id);
        })
      }
      this.multipleSelectionKeys = multipleSelectionKeys;
      this.multipleSelection = val;
    },

    /**
     * 取消选中行，分页、批量处理使用
     */
    cancelMultipleSelection() {
      this.$refs.multipleTable.clearSelection();
    },
    
    /**
     * 删除团队
     */
    showDeleteMessageBox(row){
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        API.deleteTeam(row.id != undefined ? [row.id] : this.multipleSelectionKeys, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              const searchParams =this.searchParams;
              this.getTeamList(searchParams);
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          },
          onError: err => {
            console.log(err)
            this.$message.error(this.$t('msg.no_delete_team'));
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
     * 选择用户
     * @param {Object} data 
     */
    handleSelectUser(data){
      data.map((e) => {
        if(typeof(e.type) == "undefined" || e.type == "")
        e.type = 0;
      })
      const formParams = {
        ...this.formParams,
        "members" : data
      }
      this.formParams = formParams;
    },

    /**
     * 点击团队进入团队阶段
     */
    clickTeam(val){
      this.$router.push({  
        name: 'stagekm',
        query: {
          teamId: val.id,
          diskId: val.diskId
        }
      })
    },

    /**
     * 根据角色判断是否有操作团队的权限
     */
    getIsShowOperation(record){
      const user =this.user;
      //超级管理员、创建者、团队管理员这三个角色有操作团队的权限
      let isShowTeamOperation = getIsShowOperation(user,record);
      return isShowTeamOperation;
    },

    /**
     * 设置为管理员
     * @param {object} item 
     * @param {int} index 
     */
    handleManagerSet(item, index){
      let data = [...this.formParams.members]
      data.map((dataItem, i) => {
        if(i == index){
          let type = dataItem.type;
          if(type == 1) {
            dataItem.type = 0;
          }else if(!type || type == 0){
            dataItem.type = 1
          }
        }
      })
      const formParams = {
        ...this.formParams,
        "members" : data
      }
      this.formParams = formParams;
    },

    /**
     * 删除用户
     * @param {int} index 
     */
    handleUserRemove(index){
      let data = [
        ...this.formParams.members.slice(0, index),
        ...this.formParams.members.slice(index + 1)
      ]
      const formParams = {
        ...this.formParams,
        "members" : data,
      }
      this.formParams = formParams;
    },

  }
}
</script>