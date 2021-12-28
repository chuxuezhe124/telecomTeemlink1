<template>
  <div class="companyReport">
    <div>
      <div class="report-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="report-department">
              <span>{{$t("department.name")}}</span>
              <div class="report-input">
                <el-input class="input-group" 
                  v-model="departmentName" 
                  :placeholder="$t('department.selection')" 
                  size="mini" 
                  @focus="showDeptDialog" 
                  clearable 
                  @clear="clearDeptName"></el-input>
              </div>
              <el-dialog
                width="30%"
                :title="$t('department.selection')"
                :visible.sync="visiblve"
                append-to-body>
                <div>
                  <impower-dept-select @oncheckedKeys="oncheckedKeys"></impower-dept-select>
                </div>
              </el-dialog>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{$t("source")}}</span>
              <span class="report-context">
                <el-select v-model="sourceValue" :placeholder="$t('select')" size="mini">
                  <el-option
                    v-for="item in source"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{$t("behavior")}}</span>
              <span class="report-context">
                <el-select v-model="behaviorValue" :placeholder="$t('select')" size="mini">
                  <el-option
                    v-for="item in behavior"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="row-footer">
          <el-col :span="9">
            <div>
              <span>{{$t("User")}}</span>
              <div v-if="formParams.members.length > 0">
                <div 
                  style="display: inline-block; margin-right: 4px;"
                  v-for="data in formParams.members" 
                  :key="data.id">
                  <el-popover 
                    placement="top-start"
                    title=""
                    width="200"
                    trigger="hover"
                    >
                    <div class="popover">
                      <div @click="deleteUserClick(data)"><a>{{$t("btns.delete")}}</a></div>
                    </div>
                    <el-tag slot="reference">{{data.name}}</el-tag>
                  </el-popover>
                </div>
              </div>
              <el-button @click="showUserDialog" size="mini">{{$t("user.get")}}</el-button>
              <el-dialog
                width="650px"
                :title="$t('user.select')"
                :visible.sync="userVisible"
                :before-close="handleCancel"
                append-to-body>
                <div style="heigh: 360px;">
                  <user-dialog 
                    ref="userDialog"
                    v-bind="$attrs" 
                    v-on="$listeners"
                    :formParams="formParams"
                    :isRadio="isRadio"
                    @handleSelectUser="handleSelectUser">
                  </user-dialog>
                </div>
                <div slot="footer" class="dialog-footer">
                  <el-button @click="handleCancel" size="mini">{{$t("btns.cancel")}}</el-button>
                  <el-button type="primary" @click="handleSettingUserOk" size="mini">{{$t('btns.determine')}}</el-button>
                </div>
              </el-dialog>
            </div>
          </el-col>
          <el-col :span="10">
            <div class="repor-time">
              <span class="demonstration">{{$t("time_range")}}</span>
              <el-date-picker
                v-model="timeValue"
                type="datetimerange"
                size="mini"
                class="time-width"
                :range-separator="$t('to')"
                :start-placeholder="$t('start_placeholder')"
                :end-placeholder="$t('end_placeholder')">
              </el-date-picker>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="dialog_footer" slot="footer">
        <el-button size="mini" @click="handleReset">{{$t("btns.reset")}}</el-button>
        <el-button type="primary" size="mini" @click="handleSelect">{{$t("btns.query")}}</el-button>
      </div>
      <div class="searchResult">
        <p class="resultNum" v-if="searchData">{{$t("retrieved_for_you")}}<span class="colorNumber">{{number}}</span>{{$t('File')}}</p>
        <p class="export" v-if="excelButton">
        {{$t("if.derive")}}
          <el-button type="success" size="mini" @click="handExcelClick">{{$t("btns.derive")}}</el-button>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import API from '@/api.js';
import UserDialog from '@/components/shared/UserDialog/UserDialog.vue';
export default {
  name: "companyReport",
  components: {
    UserDialog
  },
  data(){
    return{
      // CODE_PERSON : "1",    //员工KM
      // CODE_DEPARTMENT : "2",     //部门KM
      // CODE_TEAM : "3",    //团队KM
      // CODE_COMMITTEE : "4"    //专委会KM
      source:[{        //来源数据
        value: "1",
        label: this.$t('menu.staff_KM')
      },{
        value: "2",
        label: this.$t('menu.department_KM')
      },
      {
        value: "3",
        label: this.$t('menu.team_KM')
      },{
        value: "4",
        label: this.$t('Committee.oneself') + "KM"
      }],
      sourceValue: "",  //来源数据
      // CODE_DOWNLOAD : "1",  //下载
      // CODE_PREVIEW : "2",  //预览
      // CODE_SHARE : "4",  //分享 
      // CODE_COLLECT : "8",   //收藏
      // CODE_UPLOAD : "5",  //上传 
      // CODE_DELETE : "6",  //删除
      // CODE_MAP_PUBLISH : "9",  //地图发布
      behavior:[{      //行为数据
        value: "1",
        label: this.$t('btns.download')
      },{
        value: "2",
        label: this.$t('label.preview')
      },{
        value: "4",
        label: this.$t('share')
      },{
        value: "5",
        label: this.$t('label.upload')
      },{
        value: "6",
        label: this.$t('label.delete')
      },{
        value: "8",
        label: this.$t('label.collection')
      },{
        value: "9",
        label: this.$t('label.map_release')
      }],
      behaviorValue: "",  //行为数据
      timeValue: [],
      departmentName: "",  //部门名字
      visiblve: false,    //部门对话框
      userVisible: false,   //用户选择框
      params: {
        "region": "",
        "operationType": "",
        "departmentId": "",
        "userId": "",
        "startDate": "",
        "endDate": ""
      },
      formParams : {
        "serialNumber": "",
        "name":"",
        "description":"",
        "deptPermission":[],
        "compPermission":[],
        "members":[]
      },
      number: "",  //检索数据的数量
      searchData: false,     //检索数据
      excelButton: false,   //导出按钮
      isRadio: true,        //日志的用户选择框是单选默认
    }
  },
  methods: {
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
      this.params.departmentId = checkedNodes.id;
      this.departmentName = checkedNodes.name;
      this.visiblve = false;
    },
    /**
     * 清除选择部门的节点
     */
    clearDeptName(){
      let params = {...this.params}
      params.departmentId = "";
      params.departmentName = "";
      this.params = params;
      this.getUsersData(params);
    },
    /**
     * 显示用户选择框
     */
    showUserDialog(){
      this.userVisible = true;
    },
    /**
     * 确定已选择用户
     */
    handleSettingUserOk(){
      this.$refs.userDialog.handleSelectUser();
      this.userVisible = false;
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
     * 隐藏用户选择框
     */
    handleCancel(){
      this.$refs.userDialog.handleCancel();
      this.userVisible = false;
    },
    /**
     * 删除用户
     */
    deleteUserClick(obj){
      const members = this.formParams.members;
      for(let i=0;i<members.length;i++){
        if(members[i].id == obj.id){
          delete members[i];
          members.length = members.length-1;
        }
      }
      const formParams = {
        ...this.formParams,
        "members" : members
      }
      this.formParams = formParams;
    },
    /**
     * 查询
     */
    handleSelect() {
      const params = {
        ...this.params,
        "region": this.sourceValue,
        "operationType": this.behaviorValue,
        "userId": this.formParams.members[0]? this.formParams.members[0].id :'',
        "startDate":this.timeValue[0]? this.timeValue[0].getTime(): '',
        "endDate": this.timeValue[1]? this.timeValue[1].getTime(): ''
      }
      this.params = params;
      this.excelButton = false
      API.getReportSoure(this.params, {
        onSucess: resp => {
          console.log(resp)
          if(resp.data.errcode == "0"){
            this.searchData = true;
            this.number = resp.data.data;
            if(resp.data.data>0){
              this.excelButton = true;
            }
          }
        } 
      })
    },
    /**
     * 导出数据
     */
    handExcelClick(){
      const url = kmsConfig.contextPath + "/kms/reports/export?region="+this.params.region+"&operationType="
                +this.params.operationType+"&deptId="+this.params.departmentId+"&userId="
                +this.params.userId+"&startDate="+this.params.startDate+"&endDate="+this.params.endDate;
      window.open(url);
    },
    /**
     * 重置数据
     */
    handleReset(){
      this.departmentName = "";  //部门
      this.sourceValue = "";    //来源
      this.behaviorValue = "";   //行为
      this.formParams.members = [];   //用户
      this.timeValue = "";    //时间范围
      this.searchData = false   //检索数据
      this.excelButton = false   //导出按钮
    }
  },
}
</script>