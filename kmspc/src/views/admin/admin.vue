<template>
  <div class="admin">
    <div class="card" :class="{'paddingTop':paddingTop}">
      <div class="card-header">
          <h1 class="admin-title">{{$t('control_panel')}}</h1>
      </div>
      <div class="card-body card-padding">
        <div class="admin-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="company-km">
                <div class="manage-top">
                  <div class="icon icon1"></div>
                  <div class="name">{{$t("panel.enterprise_km")}} </div>
                </div>
                <div class="manage-body" v-if="isShowSuperSetting">
                  <div><a @click="handlDialogClick($t('panel.committee_setup'))">{{$t('panel.committee_setup')}}</a></div>
                  <div><a @click="handlDialogClick($t('panel.department_KM'))">{{$t('panel.department_KM')}}</a></div>
                  <!-- <div><a>批量授权</a></div> -->
                  <Role-Authenticate></Role-Authenticate>
                  <div><a @click="handlDialogClick($t('panel.log'))">{{$t('panel.log')}}</a></div>
                  <div><a @click="handlDialogClick($t('panel.document_watermark'))">{{$t('panel.document_watermark')}}</a></div>
                </div>
                <div class="manage-body uneditSetting" v-if="!isShowSuperSetting">
                  <div><a>{{$t('panel.committee_setup')}}</a></div>
                  <div><a>{{$t('panel.department_KM')}}</a></div>
                  <div><a>{{$t('panel.batch_authorization')}}</a></div>
                  <div><a>{{$t('panel.log')}}</a></div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="tag-km">
                <div class="manage-top">
                  <div class="icon icon3"></div>
                  <div class="name">{{$t('panel.label_classification')}}</div>
                </div>
                <div class="manage-body" v-if="isShowSuperSetting">
                  <div><a @click="handlDialogClick($t('panel.label_set'))">{{$t('panel.label_set')}}</a></div>
                  <div><a @click="handLabelCategoryClick">{{$t('panel.tag')}}</a></div>
                </div>
                 <div class="manage-body uneditSetting" v-if="!isShowSuperSetting">
                  <div><a>{{$t('panel.label_set')}}</a></div>
                  <div><a>{{$t('panel.tag')}}</a></div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="department-km">
                <div class="manage-top">
                  <div class="icon icon2"></div>
                  <div class="name">{{$t('panel.department_log')}}</div>
                </div>
                <div class="manage-body" v-if="isShowDeptSetting">
                  <!-- <div><a>批量授权</a></div> -->
                  <Dept-Role-Authenticate></Dept-Role-Authenticate>
                  <div><a @click="handleDeptReport">{{$t('panel.log')}}</a></div>
                  <div><a @click="handlDialogClick($t('panel.contribution_statements'))">{{$t('panel.contribution_statements')}}</a></div>
                </div>
                <div class="manage-body uneditSetting" v-if="!isShowDeptSetting">
                  <!-- <div><a>批量授权</a></div> -->
                  <div><a @click="handleDeptReport">{{$t('panel.log')}}</a></div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    
    <Dept-Report :visible.sync="deptReportVisible"></Dept-Report>
    <label-category :visible.sync="categoryVisible"></label-category>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="63%"
    >
      <Committee-Km-Settings v-if="visible.committeeVisible"></Committee-Km-Settings>
      <Department-Km-Settings v-if="visible.deptVisible"></Department-Km-Settings>
      <Company-Report v-if="visible.reportVisible"></Company-Report>
      <Water-Mark v-if="visible.watermarkVisible" @Cancel="onCancel"></Water-Mark>
      <label-Settings v-if="visible.outerVisible"></label-Settings>
      <Echart v-if="visible.deptChartVisible"></Echart>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
//专委会设置
import CommitteeKmSettings from "@/components/admin/CompanyAdmin/CommitteeKmSettings.vue";
//部门KM设置
import DepartmentKmSettings from "@/components/admin/CompanyAdmin/DepartmentKmSettings.vue"
//企业KM批量授权
import RoleAuthenticate from "@/components/admin/CompanyAdmin/RoleAuthenticate.vue";
//企业KM日志
import CompanyReport from "@/components/admin/CompanyAdmin/CompanyReport.vue";
//企业km文档水印设置
import WaterMark from "@/components/admin/CompanyAdmin/Watermark.vue";
//标签设置
import labelSettings from "@/components/admin/CompanyAdmin/labelSettings.vue";
//标签类别
import LabelCategory from "@/components/admin/CompanyAdmin/LabelCategory.vue"
//部门KM批量授权
import DeptRoleAuthenticate from "@/components/admin/DeptAdmin/DeptRoleAuthenticate.vue";
//部门KM日志
import DeptReport from "@/components/admin/DeptAdmin/DeptReport.vue";
//部门km贡献报表
import Echart from "@/components/admin/DeptAdmin/Echart.vue"

export default {
    name: "admin",
    components: {
      CommitteeKmSettings,
      DepartmentKmSettings,
      RoleAuthenticate,
      CompanyReport,
      WaterMark,
      labelSettings,
      LabelCategory,
      DeptRoleAuthenticate,
      DeptReport,
      Echart
    },
    data () {
      return {
        paddingTop: false,    //头部padding
        user: {},
        dialogTitle: '',    //弹窗名称
        dialogVisible: false, 
        visible: {
          committeeVisible: false,     //专委会设置
          deptVisible: false,          //部门KM设置
          reportVisible: false,        //企业日志
          watermarkVisible: false,      //文档水印设置
          outerVisible: false,         //标签设置
          deptChartVisible: false,     //贡献量报表
        },
        categoryVisible: false,
        deptReportVisible: false,
        ChartVisible: false,

        RoleConstant: {
          superAdmin : "KMSUPERADMINROLEID", //超级管理员id
          committeeAdmin : "KMCOMMITTEEADMINROLEID", //专委会管理员id
          deptAdmin : "KMDEPTADMINROLEID", //部门管理员id
          member : 0
        },
        isShowSuperSetting: false,
        isShowDeptSetting: false
      }
    },

    mounted(){
      if(this.$store.state.isShowHeard){
        this.paddingTop = true;
      }
      this.getMyProfile();
      //监听页面刷新事件
      window.addEventListener("unload",this.saveLoginUser);
    },

    methods: {
      /**
       * 获取当前用户信息
       */
      getMyProfile(){
        API.getMyProfile({
          onSucess: resp => {
            this.user = resp.data.data;
            this.getInitData();
          } 
        })
      },
      saveLoginUser(){
        //将值VUEX中的state.user 存入sessionStorage
        sessionStorage.setItem('landingUser',JSON.stringify(this.user));
      },

      /**
       * 页面初始化
       */
      async getInitData(){
        let user = this.user;
        let curruserAuthenticate = this.getUserAuthenticate(user.roles);
        this.isShowSuperSetting = curruserAuthenticate.isShowSuperSetting;
        this.isShowDeptSetting = curruserAuthenticate.isShowDeptSetting;
      },

      /**
       * 获取用户权限
       * @param {Array} roles 
       */
      getUserAuthenticate(roles){
        if(!roles) {
            roles = [];
        }
        let userAuthenticate = {
          isShowSuperSetting : false,
          isShowDeptSetting : false,
        }
        roles.map((item)=>{
          switch (item.id) {
            case this.RoleConstant.superAdmin :
              userAuthenticate.isShowSuperSetting = true;
              break;
            case this.RoleConstant.deptAdmin :
              userAuthenticate.isShowDeptSetting = true;
              break;
          }
        })
        return userAuthenticate;
      },
      /**
       * 点击弹窗
       */
      handlDialogClick(val){
        this.dialogTitle = val;
        const visible = {
          ...this.visible,
          committeeVisible: false,
          deptVisible: false,
          reportVisible: false,
          watermarkVisible: false,
          outerVisible: false,
          deptChartVisible: false
        }
        this.visible = visible;
        
        switch (val){
          case  this.$t('panel.committee_setup'):
            this.visible.committeeVisible = true;
          break;
          case this.$t('panel.department_KM'):
            this.visible.deptVisible = true;
          break;
          case this.$t('panel.log'):
            this.visible.reportVisible = true;
          break;
          case this.$t('panel.document_watermark'):
            this.visible.watermarkVisible = true;
          break;
          case this.$t('panel.label_set'):
            this.visible.outerVisible = true;
          break;
          case this.$t('panel.contribution_statements'):
            this.visible.deptChartVisible = true;
          break;
        }
        this.dialogVisible = true;
      },
      /**
       * 监听Watermark.vue传过来的Cancel（取消）事件
       */
      onCancel(val) {
        this.dialogVisible = val
        this.visible.watermarkVisible = val
      },
       /**
       * 
       */
      handlCommitteeClick () {
        this.committeeVisible = true;
      },
       /**
       * 
       */
      handLabelSetClick () {
        this.outerVisible = true;
      },
      /**
       * 
       */
      handLabelCategoryClick(){
        this.categoryVisible = true;
      },
      /**
       * 
       */
      handleDeptReport () {
        this.deptReportVisible = true;
      },
    }
}
</script>