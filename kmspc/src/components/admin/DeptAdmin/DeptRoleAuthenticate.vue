<template>
  <div>
    <a @click="showRoleAuthorizationDialog">{{$t("authorization.Batch")}}</a>
    <el-dialog
      :title="$t('authorization.department_role')"
      :visible.sync="roleVisible" 
      width="80%">
      <div>
        <div>
          <el-row :gutter="20" type="flex">
            <el-col :span="6">
            </el-col>
            <el-col :span="6">
            </el-col>
            <el-col :span="6">
              <div>
                <!-- <el-select v-model="params.roleId" :placeholder="$t('select')" size="mini" @change="onChangeRole" clearable @clear="onClearRole">
                  <el-option value="KMSUPERADMINROLEID" :label="企业管理员">{{$t('admin.enterprise')}}</el-option>
                  <el-option value="KMCOMMITTEEADMINROLEID" :label="专委会管理员">专委会管理员</el-option>
                  <el-option value="KMDEPTADMINROLEID" :label="部门管理员">部门管理员</el-option>
                  <el-option value="KMNORMALROLEID" label="员工">员工</el-option> -->
                <!-- </el-select> -->
                <el-select v-model="params.roleId" :placeholder="$t('select')" size="mini" @change="onChangeRole" clearable @clear="onClearRole">
                  <el-option value="KMSUPERADMINROLEID" :label="$t('admin.enterprise')">{{$t('admin.enterprise')}}</el-option>
                  <el-option value="KMCOMMITTEEADMINROLEID" :label="$t('admin.committee')">{{$t('admin.committee')}}</el-option>
                  <el-option value="KMDEPTADMINROLEID" :label="$t('admin.department')">{{$t('admin.department')}}</el-option>
                  <el-option value="KMNORMALROLEID" :label="$t('menu.staff')">{{$t('menu.staff')}}</el-option>
                </el-select>
              </div>
            </el-col>
            <el-col :span="6">
              <div>
                <el-input class="input-group" 
                  v-model="params.nameOrAccount" 
                  :placeholder="$t('placeholder.name_account')" size="mini"
                  prefix-icon="el-icon-search"
                  @change="getUsersData(params)"
                  clearable 
                  @clear="clearNameOrAccount"></el-input>
              </div>
            </el-col>
            <el-col :span="6">
              <div style="float: right;">
         <el-button size="mini" @click="Cancel">{{$t('btns.cancel')}}</el-button>
                <el-button type="primary" size="mini" @click="hanleConfirm">{{$t("authorization.authorization")}}</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
        <el-table
          :data="usersData.datas"
          style="width: 100%"
          height="370"
          size="mini"
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('tabs.definition')"
            width="150">
          </el-table-column>
          <el-table-column
            prop="email"
            :label="$t('tabs.email')"
            width="180">
          </el-table-column>
          <el-table-column
            prop="telephone"
          :label="$t('tabs.mobile')"
            width="120">
          </el-table-column>
          <el-table-column
            prop="role"
           :label="$t('tabs.role')">
            <template slot-scope="scope">
              <div className="setting-role">
                <span v-for="item in scope.row.roles" :key="item.id" style="margin-right: 8px" >{{item.name}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            :label="$t('tabs.operation')"
            width="180"
            align="right">
            <template slot-scope="scope">
              <el-dropdown>
                <span class="el-dropdown-link" >
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <span @click="editUserRole(scope.row)">{{$t('btns.edit')}}</span>
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
            :page-size="usersData.linesPerPage"
            :total="usersData.rowCount"
            @current-change="handleCurrentChange"
            :current-page.sync="usersData.pageNo">
          </el-pagination>
        </div>
      </div>
      <el-dialog
        width="60%"
        :title="$t('authorization.for')"
        :visible.sync="subVisible"
        append-to-body>
        <div class="roleSelect">
          <el-row :gutter="20">
            <el-checkbox-group v-model="selectedRoleIds">
            <!-- <el-col :span="6">
              <div class="company">
                <div>
                  <el-checkbox label="KMSUPERADMINROLEID">企业管理员</el-checkbox>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="committee">
                <div>
                  <el-checkbox label="KMCOMMITTEEADMINROLEID">专委会管理员</el-checkbox>
                </div>
              </div>
            </el-col> -->
            <el-col :span="10">
              <div class="department">
                <div>
                  <el-checkbox label="KMDEPTADMINROLEID">{{$t('admin.department')}}</el-checkbox>
                </div>
              </div>
            </el-col>
            <el-col :span="10">
              <div class="employee">
                <div>
                  <el-checkbox label="KMNORMALROLEID">{{$t('menu.staff')}}</el-checkbox>
                </div>
              </div>
            </el-col>
             </el-checkbox-group>
          </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
          <el-button type="primary" size="mini" @click="handleImpowerOk">{{$t("authorization.determine")}}</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";

// const ROLE={
//   ROLE_SUPERADMIN : "KMSUPERADMINROLEID",    //企业知识管理员
//   ROLE_DEPTADMIN : "KMDEPTADMINROLEID",   //部门知识管理员
//   ROLE_COMMITTEEADMIN : "KMCOMMITTEEADMINROLEID",    //专委会知识管理员
//   ROLE_MEMBER : "KMNORMALROLEID"    //普通员工
// }
export default {
  name: 'deptroleauthenticate',
  data(){
    return{
      user: {},
      usersData: {},
      multipleSelectionArray: [],
      selectedUserIds: [],    //选择用户的集合
      selectedRoleIds: [],    //选择角色的集合
      defaultRoleValue: [],   //编辑角色
      params: {
        "departmentId" : "",    //选中部门的id
        "departmentName": "",
        "nameOrAccount" : "",
        "roleId" : "",
        "linesPerPage" : 15,
        "pageNo" : 1,
      },
      isKmRealm:false,
      roleVisible: false,          //批量授权
      editSingleRole: false,
      subVisible: false,
      defaultDepartment: "",
    }
  },

  async mounted(){
    if(this.$store.state.user.defaultDepartment){
      this.defaultDepartment = this.$store.state.user.defaultDepartment;
    }
    await this.getMyProfile();
    let params = {...this.params};
    params.departmentId = this.defaultDepartment;
    this.params = params
    this.getInitData();
    this.getUsersData(params);
  },

  methods:{
    /**
     * 获取当前用户信息
     */
    async getMyProfile(){
      const user = (await API.getMyProfileAwait()).data;
      this.defaultDepartment = user.data.defaultDepartment;
    },
    async getInitData(){
      const kmTeamAndRealm = (await API.getKmTeamAndRealm()).data;
      const isKmRealm=kmTeamAndRealm["kmRealm"];
      this.isKmRealm = isKmRealm;
    },

     //初始化时获取用户列表
    async getUsersData (params) {
      const result = (await API.getUsers(params)).data; 
      if(result.errcode == 0) {
        const data = result.data;
        if(data.datas.length > 0) {
            data.datas.map((e) => {
              e.key = e.id;
            });
        }
        this.usersData = data;
      }else {
        this.$message({
          type: 'warning',
          message: result.errmsg
        });
      }
    },

    /**
     * 选择角色查询
     */
    onChangeRole(){
      let params = {...this.params}
      this.getUsersData(params);
    },

    /**
     * 清除选中角色
     */
    onClearRole(){
      let params = {...this.params}
      params.roleId = "";
      this.params = params;
      this.getUsersData(params);
    },

    /**
     * 清除名称或账号
     */
    clearNameOrAccount(){
      let params = {...this.params}
      params.nameOrAccount = "";
      this.params = params;
      this.getUsersData(params);
    },

    /**
     * 显示角色授权对话框
     */
    showRoleAuthorizationDialog(){
      this.roleVisible = true;
    },

    /**
     * 修改页码
     */
    handleCurrentChange(val){
      let params = {
        ...this.params,
        pageNo: val ? val : this.params.pageNo,
      };
      this.getUsersData(params);
    },

    /**
     * 编辑角色-授权
     */
    editUserRole(record){
      let defaultRoleValue = [];
      let selectedUserIds = [];
      selectedUserIds.push(record.id);
      record.roles.map((e) => {
        defaultRoleValue.push(e.id);
      });
      this.editSingleRole = true;
      this.selectedUserIds = selectedUserIds;
      this.selectedRoleIds = defaultRoleValue;
      this.subVisible = true;
    },

    /**
     * 确定授权
     */
    async handleImpowerOk(){
      let params = {
        "userIds": this.selectedUserIds,
        "roleIds": this.selectedRoleIds
      }
      const result = (await API.bindRole(params)).data;
      if(result.data){
        this.editSingleRole = false;
        this.selectedUserIds = [];
        this.selectedRoleIds = [];
        this.subVisible = false;
        this.$message({
          type: 'success',
          message: this.$t('msg.authorization_ss')
        });
        const listParams = {...this.params};
        this.getUsersData(listParams);
      }
    },

    /**
     * 取消授权对话框
     */
    handleCancel(){
      this.selectedRoleIds = [];
      this.subVisible = false;
    },
    /**
     * 全选-批量授权
     */
    handleSelectionChange(val) {
      this.multipleSelectionArray = val;
    },
    /**
     * 对话框取消
     */
    Cancel(){
      this.roleVisible = false;
    },
    /**
     * 对话框授权
     */
    hanleConfirm(){

      if(this.multipleSelectionArray.length>0){
        let defaultRoleValue = [];
        let selectedUserIds = [];
        for(let i=0;i<this.multipleSelectionArray.length;i++){
          selectedUserIds.push(this.multipleSelectionArray[i].id);
        }       
        this.editSingleRole = true;
        this.selectedUserIds = selectedUserIds;
        this.selectedRoleIds = defaultRoleValue;
        this.subVisible = true;
      }else{
        this.$message.error(this.$t('msg.authorized_personnel_sl'));
      }
    }
  }
}
</script>