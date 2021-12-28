<template>
  <div class="formwrapper" :id="'formTemplate_' + formTemplateDocid" v-loading="loading">
    <div ref="actBox" class="formcontent" id="obpm-custom-formcontent" v-if="(formdata.stateId && isRouterAlive) || (isShowFormActivity)" ><!-- 2021.9.9之前v-if="(formdata.formTemplate && formdata.formTemplate.template != false) -->
      <div class="act-btns">
        <activity
          v-for="(activity,index) in formdata.activities" 
          :key="index" 
          :info="activity"
          :isBlockClick="isBlockClick" 
          @action="onAction" 
        />
        <collapse_activity 
          :style="{display:collapseButtons.length > 0 ? 'inline-block':'none'}"
          :collapseButtons="collapseButtons" 
          @action="onAction"
        />
      </div>
      <div class="approvers">
        <approvers 
          style="min-width: 250px; display: inline-block;"
          v-if="formdata.stateId && isRouterAlive" 
          :approversData="formdata.approvers" 
          :stateId = "formdata.stateId"
          :openParams = "openParams"
          :flowinfo="{
            docid: this.formdata.docId, 
            approvers:formdata.approvers, 
            stateId:formdata.stateId
          }"
        />
      </div>
    </div>
    <div ref="formTableWrap" class="formTable-wrap custom-scrollbar" :style="{'height':formTableWrapHeight?formTableWrapHeight:''}">
      <!--流程预览-->
      <template v-if="processPreview">
        <processPreview :previewData="previewData" :processPreview="processPreview"></processPreview>
      </template>
      <span class="formTable_signs">
        <span :id="'formTemplate_' + formTemplateDocid + '_1'"></span>
      </span>
      <!--盖章列表-->
      <form_signlist 
        v-if="formdata.sign" 
        :signList="formdata.sign" 
      />
      <!--盖章-->
      <form_stamp
        v-if="currentCustomSign.showSign"
        :visible.sync="currentCustomSign.showSign"
        :signData="currentCustomSign.data"
        :openParams="openParams"
        :formTemplateDocid="formTemplateDocid"
        @event="confirmSignature"
      />
      <!--印章管理-->
      <form_signature  
        v-if="formSignatureData.showFormSignature"
        :options="formSignatureData.list"
        :openParams = "openParams"
        :visible.sync="formSignatureData.showFormSignature"
        @event="getCustomSignatureData"
      />
      <component 
        v-if="hackReset" 
        name="formTemplate" 
        :is="template" 
        :ref="'inputChild_'+formTemplateDocid">
      </component>
      <el-dialog 
        :title="$t('view.noselect_approver')" 
        v-if="showDialog == 1" 
        :visible.sync="dialogVisible" 
        top="10px" 
        :lock-scroll="true"
        width="67%" 
        :before-close="handleClose"
      >
        <div class="print-content">
          <div class="content-wrap" ref="print">
            <!--startprint-->
            <div id="print">
              <form_print 
                :printParams = "printParams"
                :printData = "printData"
              />
            </div>
            <!--endprint-->
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button 
            type="primary" 
            @click="printPage"
          >
            {{$t('report.print')}}
          </el-button>
        </span>
      </el-dialog>
      <!--新版流程提交面板-->
      <!-- <flowDialog
        v-if="flowDialogVisible" 
        :visible.sync="flowDialogVisible"
        :type="flowProcessAct?flowProcessAct.type:''"
      >
        <form_flowpanel
          @click.stop.prevent
          slot="body"
          :stateId="formdata.stateId" 
          :act="flowProcessAct"
          :openParams = "openParams"
          :buildFormData="buildFormData()"
          :approverName = "approverName"
          :submitTo = "submitTo"
          :nextUserId = "nextUserId"
          :approvers = "formdata.approvers?formdata.approvers:''" 
          :subFlowApproverData = "subFlowApproverData"
          :subFlowGroup = "subFlowGroup"
          :newHostOrCohostList = "newHostOrCohostList"
          :cCname = "cCname"
          :subFlowGroupNum = "subFlowGroupNum"
          v-if="flowProcessAct.type == 5 || 
            flowProcessAct.type == 33 ||
            flowProcessAct.type == 47 ||
            flowProcessAct.type == 48 ||
            flowProcessAct.type == 52 ||
            flowProcessAct.type == 55 ||
            flowProcessAct.type == 56 ||
            flowProcessAct.type == 57 ||
            flowProcessAct.type == 58"
          @action="designatedApprover"
          @closePopup="closeThePopup"
          @showSubFlow="showSubFlowDialog"
          @setProcessHosting="getProcessHosting"
        />
      </flowDialog> -->

      <!--新版流程提交面板2.0-->
      <el-dialog 
        class="flow-submission-dialog"
        v-if="flowDialogVisible" 
        :visible.sync="flowDialogVisible"
        :append-to-body="true"
        :lock-scroll="true"
        width="41%" 
        center
      >
        <div slot="title" class="dialog-title">
          <i class="fa fa-paper-plane-o icon"></i>
          <span class="title-text">..</span>
        </div>
        <div class="flow-new-panel-wrap">
          <form_new_flowpanel
            @click.stop.prevent
            slot="body"
            :stateId="formdata.stateId" 
            :act="flowProcessAct"
            :openParams = "openParams"
            :buildFormData="buildFormData()"
            :approverName = "approverName"
            :submitTo = "submitTo"
            :nextUserId = "nextUserId"
            :approvers = "formdata.approvers?formdata.approvers:''" 
            :subFlowApproverData = "subFlowApproverData"
            :subFlowGroup = "subFlowGroup"
            :newHostOrCohostList = "newHostOrCohostList"
            :cCname = "cCname"
            :subFlowGroupNum = "subFlowGroupNum"
            :isShowHandSign = "isShowHandSign"
            :isShowKeyboard = "isShowKeyboard"
            v-if="
              flowDialogVisible &&
              (flowProcessAct.type == 5 || 
              flowProcessAct.type == 33 ||
              flowProcessAct.type == 47 ||
              flowProcessAct.type == 48 ||
              flowProcessAct.type == 52 ||
              flowProcessAct.type == 55 ||
              flowProcessAct.type == 56 ||
              flowProcessAct.type == 57 ||
              flowProcessAct.type == 58)"
            @action="designatedApprover"
            @closePopup="closeThePopup"
            @showSubFlow="showSubFlowDialog"
            @setProcessHosting="getProcessHosting"
          />
        </div> 
      </el-dialog>

      <!--流程指定审批人弹窗-->
      <div class="user-dialog">
        <comm-dialog
          :title="isAppentCirculator?$t('view.cc'):$t('view.point_approver')"
          v-show="approverVisible"
          :visible.sync="approverVisible"
          :setClass="commDialog.userDialog"
          :appendToBody="true"
        >
          <form_selectApprover_flowpanel
            slot="body"
            :act="flowProcessAct"
            :openParams = "openParams"
            :buildFormData="buildFormData()"
            :approversObj = "approversObj"
            :submitTo = "submitTo"
            :flowId = "flowId"
            :isFreeFlow = "isFreeFlow"
            :saveApproverStatus="saveApproverStatus"
            :approverNumType="approverNumType"
            :isAppentCirculator="isAppentCirculator"
            :subFlowToApprover="subFlowToApprover"
            :groupNum="groupNum"
            :isSubFlow="isSubFlow"
            :allowEditApprover="allowEditApprover"
            :approvers = "formdata.approvers?formdata.approvers:''" 
            :processHostingList="processHostingList"
            v-if = "approverVisible"
            @action = "selectApprover"
            @closeApproverDialog = "closeApproverDialog"
            @event = "subflowDataTopanel"
            @selectHostOrCohost = "selectHostOrCohost"
          />
        </comm-dialog>
      </div>

      <!--终止流程-->
      <comm-dialog
        :title="$t('view.stop_flow')"
        v-show="terminationVisible"
        :visible.sync="terminationVisible"
      >
        <!--终止流程-->
        <form_termination_flowpanel
          slot="body"
          :stateId = "formdata.stateId" 
          :act="flowProcessAct"
          :openParams = "openParams"
          :buildFormData = "buildFormData()"
          v-if="flowProcessAct.type == 52"
          @action="terminationWorkflow"
          @handleCancel="handleCancel"
        />
      </comm-dialog>

      <!--发送邮件或手机短信-->
      <comm-dialog
        title="通过邮件或短信通知"
        v-show="sendMailVisible"
        :visible.sync="sendMailVisible"
        width="40%"
      >
        <form_sendMailOrSms_flowpanel
          slot="body"
          :buildFormData = "buildFormData()"
          :act="flowProcessAct"
          :openParams = "openParams"
          v-if="flowProcessAct.type == 37"
          @event="openUserDialg"
          @closePopup="closeThePopup"
        />
      </comm-dialog>

      <!--跳转按钮_弹窗打开-->
      <el-dialog 
        class="common-dialog"
        v-if="jumpPopup" 
        :append-to-body="true"
        :visible.sync="jumpPopup" 
        top="10px" 
        :lock-scroll="true"
        :width="jumpPopupStyle.dialogWidth?jumpPopupStyle.dialogWidth:'70%'" 
        :before-close="handleClose"
        center
      >
        <!--表单-->
        <div 
          :style="{height:jumpPopupStyle.dialogHeight ? jumpPopupStyle.dialogHeight : screenHeight}"
          v-if="isJumpForm" 
          class="normal-form custom-form" 
          :id="'dialog_normalform_' + openParams.actionContent">
          <el-scrollbar class="scrollbar">
            <form_normalform
              :openParams="jumpParams"
              @action="closeDialog" 
            />
          </el-scrollbar>
        </div>
        <!--视图-->
        <div 
          v-if="isJumpView" 
          class="dialog-listview" 
          :style="{height:jumpPopupStyle.dialogHeight ? jumpPopupStyle.dialogHeight : screenHeight}">
          <el-scrollbar class="scrollbar" v-if="popupLayerType == 'VIEW'">
            <div>
              <view_delegate 
                :openParams="jumpParams"
                @popupOpenType="setPopupOpenType"
              >
              </view_delegate>
            </div>
          </el-scrollbar>
          <el-scrollbar class="scrollbar" v-else>
            <form_normalform
              :openParams="jumpParamsForm"
              @popupOpenType="setPopupOpenType"
            />
          </el-scrollbar>
        </div>
        <!--外部链接-->
        <div 
          v-if="isExternalLink" class="normal-form"
          :style="{height:jumpPopupStyle.dialogHeight ? jumpPopupStyle.dialogHeight : screenHeight}"
          >
          <common_linkcontent
            :openParams="jumpParams"
          >
          </common_linkcontent>
        </div>
      </el-dialog>

      <!---->
      <el-dialog 
        class="common-dialog"
        title="..." 
        v-if="customMessagePopup" 
        :visible.sync="customMessagePopup" 
        top="10px" 
        :lock-scroll="true" 
        width="70%" 
      >
        <div v-if="newOpenParams"  class="normal-form">
          <el-scrollbar class="scrollbar">
            <form_template :openParams="newOpenParams" @event="closeCustomMessagePopup"/>
          </el-scrollbar>
        </div>
      </el-dialog>

      <!--流程预览界面-->
      <el-dialog
        :visible.sync="previewDialog"
        :append-to-body="true"
        :lock-scroll="true"
        :before-close="handleClose"
        top="20px"
        class="flow-preview-dialog"
        title="预览流程"
        width="62%"
      >
      <el-scrollbar class="scrollbar">
        <processPreview :previewData="previewData"></processPreview>
      </el-scrollbar>
    </el-dialog>
    </div>
  </div>
</template>
<script>
import Constant from "@/Constant.js";
import API from "@/api.js";
import activity from "@/components/activity.vue";
import approvers from "@/components/approvers.vue";
import form_flowpanel from "@/components/form_flowpanel.vue";
import form_new_flowpanel from "@/components/form_new_flowpanel.vue";
import form_print from "@/components/form_print";
import flowDialog from "@/components/flow_dialog.vue";
import processPreview from "@/components/process_preview.vue";
// import { Loading } from 'element-ui';
import form_selectApprover_flowpanel from "@/components/form_selectApprover_flowpanel.vue";
import form_termination_flowpanel from "@/components/form_termination_flowpanel.vue";
import Watermark from '@/assets/js/watermark';  //路径不要写错
import form_sendMailOrSms_flowpanel from "@/components/form_sendMailOrSms_flowpanel.vue";
import form_template from "@/expandedComponents/form_template.vue";
import common_linkcontent from "@/components/common_linkcontent.vue";
import form_signature from "@/expandedComponents/form_signature.vue";
import form_stamp from "@/expandedComponents/form_stamp.vue";
import form_signlist from "@/expandedComponents/form_sign_list.vue";

//import { constants } from 'crypto';
import authority from "@/components/authority.vue"
import Signature from '@/assets/kinggrid/signature.all.min.js'
// import escapeHTML from "@/assets/js/escapeHTML.js"
import collapse_activity from "@/components/collapse_activity";

export default {
  inject: [
    "refreshForm",
    'addTab',
    'openNewpage'
  ],
  name: "form-normalform",
  props: [
    "openParams",
    "callback",
    "originalFormDocid",
    "emptyParams",
    "openType", //表单打开类型，277弹出层
  ],

  provide () {
    return {
      setListViewDocIds: this.setListViewDocIds,
      findField: this.findField,
      buildFormData: this.buildFormData
    }
  },

  components: {
    activity,
    approvers,
    form_flowpanel,
    form_new_flowpanel,
    form_print,
    flowDialog,
    form_selectApprover_flowpanel,
    form_termination_flowpanel,
    authority,
    form_sendMailOrSms_flowpanel,
    form_template,
    common_linkcontent,
    form_signature,
    form_stamp,
    form_signlist,    processPreview,    collapse_activity  },
  
  // created
  created: function() {
    let op = this.openParams;
    this.initForm({
      appId: op.appId,
      formId: op.actionContent,
      //docId: this.openParams.docId  (9/03改)
      docId: op._select,
    });
    this.initSigns();
  },

  mounted(){
    let id = 'formTemplate_' + this.formTemplateDocid
    document.getElementById(id).addEventListener('scroll', this.handleTableScroll);
  },

  destroyed () {//离开该页面需要移除这个监听的事件
    window.removeEventListener('scroll', this.handleTableScroll)
    sessionStorage.removeItem('currentFormtableDocId')
  },

  data: function() {
    return {
      formTableUpdateId:'',
      formTableCcrollTop:0,
      isBlockClick: false, //阻止按钮点击
      formTableWrapHeight:'',
      formdata: {},
      printData:'',
      isActive:false,
      hidden:true,
      inputId:'', 
      inputVal:'',
      inputCurrentInfo:'',
      inputCurrentVal:'',
      copyFormData:"",
      dialogVisible:false,
      isRouterAlive:true,
      showDialog:'',
      divId:'',
      loading:true,
      hackReset:true,
      parameterObj:{}, //加签主办或者协办新添加的数据，由子组件form_selectHostOrCohost得到
      printParams:{},
      flowDialogVisible: false,

      flowProcessAct: {}, //流程处理按钮
      approverVisible: false,
      approverName: '',
      isFreeFlow:'', //判断是否是自由流程
      nextUserId:'', //自由流程的下一节点人
      submitTo: {}, 
      isAppentCirculator:'',
      approversObj: {}, //指定审批人参数
      saveApproverStatus:'',
      approverNumType:'', //判断指定审批人的用户选择框是单选还是多选。
      terminationVisible: false, //终止流程弹出窗
      sendMailVisible: false, //通过邮件或者手机短信分享弹窗
      groupNum:'',
      subFlowToApprover:[], //提交面板的子流程-并行流程数据保存到form_selectApprover_flowpanel
      isSubFlow:'',
      subFlowApproverData: '', //子流程选择的数据提交到流程面板
      subFlowGroup:'',  //子流程-并行流程数据保存到流程面板
      subFlowGroupNum:'',
      newHostOrCohostList:[], //加签主办或者协办新添加的数据，由子组件form_selectHostOrCohost得到
      formTemplateDocid:'',
      cCname:'', //抄送人姓名
      allowEditApprover: false,
      popupLayerType:'', //弹出层打开视图然后新建或者打开视图时，判断打开类型
      jumpParams:'', //跳转按钮参数
      jumpParamsForm:'', //弹出层打开的视图进入表单的参数
      jumpPopup:false,//跳转按钮弹出窗
      isJumpForm:'',//跳转按钮参数
      isJumpView:'',//跳转按钮参数
      isExternalLink:'', //判断是否是外部链接
      customMessagePopup: false, //按钮，自定义发送消息的弹窗
      newOpenParams:'',
      oldBuildFormData: '', //数据保存后后台返回的表单数据，用户新建带旧数据等
      commDialog: { //弹出窗样选择
        userDialog:'user-dialog',
      },
      processHostingList:[], //加签协办和加签主办列表
      isClickGoBackBtn: false, //判断返回按钮是否点击过
      isShowHandSign: true,//是否显示手签按钮（补签和点评时不需要手签）
      isShowKeyboard: true,//流程启动时不需要显示输入意见
      formSignatureData: {
        showFormSignature: false,
        list:[],
      },
      currentCustomSign: {
        data:'',
        showSign: false,
      }, //当前盖章的数据（非金格签章）
      subSelects: [], //包含元素或者tab页，获取docIds
      isShowFormActivity: true, //是否显示表单按钮
      isDialogOpenExternalLink: false, //弹窗打开外链判断是否刷新
      jumpPopupStyle: {}, //跳转按钮或者计算脚本打开弹窗时设置弹窗宽高
	    previewDialog: false, //流程预览弹框的显示
      previewData:[], //流程预览的数据
      processPreview: false, //是否在表单显示流程预览
	    collapseButtons: [], //折叠按钮组
      haveViewGridview: false, //表单有网格视图    
    };
  },

  computed: {
    template() {
      let data = this.formdata;
      if (data && data.fields) {
        // input 编辑状态下需要补样式
        data.fields.map(item => {
          if(!item.customStyle && data.style && data.style.content){// 编辑时样式无效
            // item.customStyle = {
            //   content: data.style.content ? data.style.content : ''
            // }
          }else if(!item.customStyle && item.type == 'tabfield' && item.tabs && item.tabs.length > 0){ // 选项卡样式不生效
            // item.tabs.forEach(tab => {
            //   if(tab.fields && tab.fields.length > 0) {
            //     tab.fields.map(item2 => {
            //       if(!item2.customStyle && tab.style && tab.style.content){
            //         item2.customStyle = {content: tab.style.content}
            //       }
            //     })
            //   }
            // })
          }
        })

        if(!data.formTemplate.template) {
          return {
            components: { authority },
            template: "<div><authority /></div>"
          };
        }else {
          return {
            methods: {
              findField: this.findField,
              refresh: this.refresh,
              checkData: this.checkData,
              getAllFields: this.getAllFields,
              addTabs: this.addTabs,
              scriptJump: this.scriptJump,
            },
            template: "<div class='formHtml' >" + data.formTemplate.template + "</div>"
          };
        }
      } else
        if(data.formTemplate && data.formTemplate.template) {
          return {
            template: "<div class='formHtml' >" + data.formTemplate.template + "</div>"
          };
        }else {
          return {
            template: "<div></div>"
          };
        }
    },

    listenFormTableUpdate() {
      return this.$store.state.formTableUpdateId
    },
  },

  watch: {
    listenFormTableUpdate(newVal){ //如果是包含元素打开标签页，返回或者关闭页签时刷新视图
      if(newVal == this.formTableUpdateId) {
        let op = this.openParams
        this.initForm({
          appId: op.appId,
          formId: op.actionContent,
          docId: op._select,
        })
      }
    },
  },

  methods: {
    //流程预览
    flowPreview(val) {
      debugger
      let appId = this.getAppId();
      let formId = this.getformId();
      let docId = this.getDocId();
      let formData =  this.buildFormData()
      let jsonData = {
        applicationId: appId,
        formId: formId,
        id: docId,
        parentId: '',
        sign: '',
        subDocuments: [],
        versions: "0",
        docId: docId,
        document: {},
        viewId: '',
        templateForm: '',
      }
      let document = {
        applicationId: formData.applicationId,
        formId: formData.formId,
        id: formData.id,
        items: formData.items,
        parentId: formData.parentId,
        sign: formData.sign,
        subDocuments: [],
        versions: "0",
        exparams: {},
        templateForm: '',
      }
      jsonData.document = document
      this.$api.previewWorkflow(
        appId,
        docId,
        jsonData,
          {
            onSucess: res => {
              if(res.data.errcode == 0) {
                this.previewData = res.data.data;
                let previewData = this.previewData
                for(let i = 0; i < previewData.length; i++) {
                  if(previewData[i].auditors.length > 3) {
                    let item = previewData[i].auditors;
                    let allAuditor = []
                      item.forEach(j => {
                        allAuditor.push(j.name)
                      })
                      allAuditor = allAuditor.join(";")
                      previewData[i].allAuditor = allAuditor
                  }
                }
                if(!val) {
                  this.previewDialog = true
                }
              }
            }
          }
      )
    },

    handleTableScroll(){
      let id = 'formTemplate_' + this.formTemplateDocid
      let sTop = document.getElementById(id).scrollTop
      if((sTop > this.formTableCcrollTop) && (sTop - this.formTableCcrollTop) > 10){
        this.$store.commit('SET_FORMTABLEWRAPSCROLLBAR', {scrollbarTop: sTop});
      } else if((sTop < this.formTableCcrollTop) && (this.formTableCcrollTop - sTop ) > 10){
        this.$store.commit('SET_FORMTABLEWRAPSCROLLBAR', {scrollbarTop: sTop});
      }
      this.formTableCcrollTop = sTop
    },

    //如果是包含元素或者tab页，获取docIds
    setListViewDocIds(docIds){
      this.subSelects = docIds
    },
    //取消
    handleCancel(val) {
      this.terminationVisible = val;
    },
    //新表单的data.formTemplate.template会返回overflow：hidden；导致弹出层没有滚动条
    dialogShowScrollbar() {
      let containerDom = document.getElementsByName('容器1')[0]
      containerDom.style.overflow = 'unset'
    },
    //确定签章
    confirmSignature(data) { 
      let op = this.openParams
      let appId = op.appId
      let formData =  this.buildFormData()
      let documentId = formData.id
      formData.docId = formData.id
      let versions = ''
      let templateForm = ''
      if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
        formData.formId = op.realformId;
        formData.document.formId = op.realformId;
        templateForm = op.actionContent;
      }
      let signArr = []
      signArr.push(data)
      let document = {
        applicationId: appId,
        formId: formData.formId,
        id: documentId,
        items: formData.items,
        parentId: formData.parentId,
        sign: JSON.stringify(signArr),
        versions: versions,
        exparams: {},
        templateForm,
      }
      delete formData.items
      
      formData.document = document
      formData.viewId = ""
      this.$api.confirmSignature(
        appId,
        formData.docId,
        formData,
        {
          onSucess: res => {
            if(res.data.errcode == 0) {
              this.$notify({
                title: '成功',
                message: res.data.data,
                type: 'success'
              })
              this.currentCustomSign.showSign = false
              this.formSignatureData.showFormSignature = false
              let op = this.openParams
              this.initForm({
                appId: op.appId,
                formId: op.actionContent,
                //docId: this.openParams.docId  (9/03改)
                docId: formData.docId,
              })
              // this.refreshForm()
            }
          }
        }
      )
    },

    //获取当前需要盖章的数据
    getCustomSignatureData(data){
      let cs = this.currentCustomSign
      cs.data = data
      cs.showSign = true
    },

    //自定义签章初始化
    initSigns(){
      this.$api.getSigns(
        {
          onSucess: res => {
            this.formSignatureData.list = res.data.data;
          }
        }
      )
    },

    delCB(signatureid, signatureData) {
      for (var key in Signature.list) {
        if (signatureid == key && Signature.list[signatureid].keysn == signatureData.keysn) {
          var signatureCreator = Signature.create();
          signatureCreator.removeSignature(signatureData.documentid, signatureid, function(data){
            console.log(data);
          });
          break;
        }
      }
      return true;
    },

    hiddenCustomizeVisible(){
      this.hackReset = false
      this.$nextTick(() => {
        this.hackReset = true
      })
    },

    mousewheel(e){
      if(this.flowDialogVisible) {
        e.preventDefault();
      }
    },

    closeCustomMessagePopup(){
      this.customMessagePopup = false;
    },

    addTabs(params) {
      if(typeof params == 'string') {
        params = JSON.parse(params)
      }
      this.$emit("add-tab", params); 
    },

    getDocId(){return this.formdata.docId;},
    getformId(){return this.formdata.formId;},
    getAppId(){return this.openParams.appId;},
    getAllFields(){return this.formdata.fields;},

    onAction(act) {
      let actId = act.id;
      let activityType = act.type;
      switch (act.type) {
        case 1: //载入视图
          break;
        case 4: //保存并启动流程
          this.runBeforeAction(actId, "", "", activityType, "", act);
          break;
        case 5: //流程处理
          this.flowHandle(act);
          break;
        case 10: //
          // this.goBack(act);
          this.runBeforeAction(actId, "", "", activityType, "", act);
          break;
        case 11:
        case 13: //自定义按钮
        case 14: //网页打印
        case 16: //导出excel
        case 21: //保存并复制
        case 25:  //导出pdf
          this.runBeforeAction(actId, "", "", activityType, "", act);
          break;
        case 26: //文件下载
          this.runBeforeAction(actId, "", "", activityType);
          break;
        case 28: //自定义按钮
          this.runBeforeAction(actId, "", "", activityType, act);
          break;
        case 30: //自定义打印
          this.runBeforeAction(actId, "", "", activityType, "", act);
          break;
        case 33: //流程启动
          this.flowHandle(act); //不支持流程启动功能
          break;
        case 34: //保存
          this.runBeforeAction(actId, "", "", activityType, "", act);
          break;
        case 37: //流程启动
          this.flowHandle(act);
          //this.sendMailOrSms()
          break;
        case 42: //保存并新建
          this.runBeforeAction(actId, "", "", activityType, act.withOld, act);
          break;
        case 43: //跳转
        case 46: //签章
          this.runBeforeAction(actId, "", "", activityType, '',act);
          break;
        case 47: //回退流程
          this.flowHandle(act);
          break;
        case 48: //流程催办
          this.flowHandle(act);
          break;
        case 49: //流程挂起
          this.suspendWorkflow(act);
          break;
        case 50: //流程恢复
          this.recoveryWorkflow();
          break;
        case 51: //回撤流程
          this.runBeforeAction(actId, "", "", activityType, '',act)
          this.retracementWorkflow(actId,act);
          break;
        case 52: //终止流程
        case 53: //编辑流程审批人
        case 55: //点评
        case 56: //补签
        case 57: //加签主办
        case 58: //加签协办
          this.flowHandle(act);
          break;
        default:
          break;
      }
    },

    findField(id) {
      if(id) {
        let data = this.formdata;
        for (let i = 0; i < data.fields.length; i++) {
          let fld = data.fields[i];
          if (id == fld.id) {
            return fld;
          }else if (fld.tabs && fld.tabs.length > 0) {
            for(let z=0; z<fld.tabs.length; z++) {
              if(fld.tabs[z].fields && fld.tabs[z].fields.length > 0) {
                for(let h=0; h<fld.tabs[z].fields.length; h++) {
                  if(id == fld.tabs[z].fields[h].id) {
                    return fld.tabs[z].fields[h];
                  }
                }
              }
            }
          }
        }
        //TODO:临时处理隐藏字段--Jarod
        return {
          id: id,
          displayType: Constant.PermissionType_HIDDEN,
          hiddenValue: ""
        };
      }else {
        return this.formdata;
      }
    },

    initForm({ appId, formId, docId }) {
      let openParams = this.openParams;
      if(openParams.appId) {
        this.$root.appid = openParams.appId; //如果有多个软件，当从首页进入表单，需要把当前页当前数据的appId赋值给全局变量，否则有可能导致软件的appId拿错
      }
      if (docId && docId != "") {
        let obj = {
          _: new Date().getTime(),
        };
        if(openParams.includeDisplayType && (openParams.includeDisplayType == 1 || openParams.includeDisplayType == 4)) {  //1, 4为不可用
          obj.isReadonly = true;
        }
        if(openParams.exparams) {
          obj = this.setParams(openParams.exparams, obj)
        }
        if(openParams.formParams) {
          obj = this.setParams(openParams.formParams, obj)
        }
        if(openParams.urlParams) {
          obj = this.setParams(openParams.urlParams, obj)
        }
        API.getForm(
          appId,
          formId,
          docId,
          obj,
          // {},
          {
            onSucess: response => {
              this.formTemplateDocid = docId.replace(/_/g, "");
              this.loading = false;
              let fd = response.data.data
              let processPreview = response.data.data.formTemplate.processPreview
              this.processPreview = processPreview
              fd.fields.forEach( val => {
                if(val.value) {
                  val.value = val.value.replace(/&#37;/g, "%");
                }
                if(val.tabs) { //选项卡里套着标签页
                  val.tabs.forEach(item => {
                    if(item.fields) {
                      item.fields.forEach(items => {
                        if(items.value) {
                          items.value = items.value.replace(/&#37;/g, "%");
                        }
                      })
                    }
                  })
                }
              })

              let data = fd;
              let formType = data.formTemplate.showType; //新表单还是旧表单
              let openComment = data.openComment;
              let commentFlag = data.commentFlag;
              const loopOpe = fields => {
                for(let i=0; i<fields.length; i++) {
                  if(fields[i].value) {
                    fields[i].value = fields[i].value
                  }
                  if(!fields[i].isComment) {
                    fields[i].formShowType = formType;
                    fields[i].appId = appId;
                    if(fields[i].formField == "IncludeField") {
                      fields[i].isRefresh = "false"
                      if(fields[i].openType == 288) { //网格视图
                        this.haveViewGridview = true
                      }
                    }
                    if(fields[i].tabs && fields[i].tabs.length>0) {
                      for(let j=0; j<fields[i].tabs.length; j++) {
                        if(fields[i].tabs[j].openComment) { //tab下有评论
                          let cf = fields[i].tabs[j].commentFlag;
                          let commentField = {
                            id: new Date().getTime() + '_评论',
                            appId,
                            docId: cf ? cf : docId, 
                            isComment: true,
                          }
                          fields[i].tabs[j].fields.push(commentField)
                          let dom = `<div>
                                      <o-comment v-bind="$attrs" v-on="$listeners" id='${commentField.id}'>
                                      </o-comment>
                                    </div>`;
                          fields[i].tabs[j].template += dom;
                        }
                        if(fields[i].tabs[j].fields && fields[i].tabs[j].fields.length > 0) {
                          loopOpe(fields[i].tabs[j].fields)
                        }
                      }
                    }
                  }
                }
              };
              if(data.fields && data.fields.length>0) {
                loopOpe(data.fields)
              }

              fd.formId = formId;
              fd.docId = docId;
              if(openComment) { //有评论
                let commentField = {
                  id: new Date().getTime() + '_评论',
                  appId,
                  docId: commentFlag ? commentFlag : docId, 
                  isComment: true,
                }
                data.fields.push(commentField)
                let dom = `<div><o-comment v-bind="$attrs"
                v-on="$listeners" id='${commentField.id}'></o-comment></div>`;
                data.formTemplate.template += dom;
              }
              let btns = []
              if(fd.activities && fd.activities.length > 0) { //如果按钮过多，并且有 __ 双下划线，就折叠起来
                fd.activities = fd.activities.filter(el => {
                  if(el.name.indexOf("__") > -1) {
                    btns.push(el)
                  }
                  return el.name.indexOf("__") < 0
                })
                this.collapseButtons = btns
              }

              this.formdata = fd;
              if(fd.style && fd.style.content) { //自定义样式
                let formCss = "#formTemplate_" + this.formTemplateDocid + " " + fd.style.content
                let css = formCss,
                // let css = fd.style.content,
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');
                head.appendChild(style);
                style.type = 'text/css';
                style.appendChild(document.createTextNode(css));
              }

              if(response.data.data.waterMarkText) {
                this.$nextTick(()=>{
                  let str = docId.replace(/_/g, "");
                  let id = 'formTemplate_' + str;
                  Watermark.set(response.data.data.waterMarkText, id);
                })
              }
              if(this.processPreview) {
                this.flowPreview(true) //true代表着是要在表单显示的流程预览，而不是弹框
              }
              this.$nextTick(() => {
                Signature.init({//初始化属性
                  keysn:'T001',
                  delCallBack : function delCB(signatureid, signatureData) {
                    for (var key in Signature.list) {
                      if (signatureid == key && Signature.list[signatureid].keysn == signatureData.keysn) {
                        var signatureCreator = Signature.create();
                        signatureCreator.removeSignature(signatureData.documentid, signatureid, function(data){
                          console.log(data);
                        });
                        break;
                      }
                    }
                    return true;
                  },
                  imgtag: 0, //签章类型：0：无; 1:公章; 2:私章; 3:法人章; 4:法人签名; 5:手写签名
                  certType : 'server',//设置证书在签章服务器
                  sealType : 'server',//设置印章从签章服务器取
                  serverUrl : 'http://171.34.78.70:8899/iSignatureHTML5/html5',//H5官网演示地址
                  documentid : this.openParams._select?this.openParams._select:'',//设置文档ID
                  documentname : this.openParams._select?this.openParams._select:'',//设置文档名称
                  //pw_enc_save : true,//密码是否加密保存
                  //pw_server_timeout:true,
                  pw_timeout:'s1800', //s：秒；h:小时；d:天
                  scaleImage: 1, //签章图片的缩放比例
                  showProtectedBtn:true  //设置是否显示保护项按钮
                });

                this.$api.getHTMLsignature(
                  this.$root.appid,
                  docId,
                  {
                    onSucess: res => {
                      if(res.data){
                        let signature = {};
                        for(let j=0;j<res.data.data.length;j++){
                          signature[res.data.data[j].signatureId] = true;
                        }
                        var signatureCreator = Signature.create();
                        signatureCreator.getSaveSignatures(docId, function(signs){
                          var signdata = new Array();
                          var jsonList = eval("("+signs+")");
                          for(var i=0;i<jsonList.length;i++){
                            var map = {};
                            map.signatureid = jsonList[i]["signatureId"];
                            map.signatureData = jsonList[i]["signature"];
                            if(signature[map.signatureid]){
                              signdata.push(map);
                            }
                            //signdata.push(map);
                          }  
                          Signature.loadSignatures(signdata); 
                        });
                      }		
                    }
                  }
                )
              })
              let showLog = false;//新表单formTemplate.template返回overflow：hidden会影响操作日志的显示
              if(formType == 'new') {
                for(let i = 0; i < data.fields.length; i ++) {
                  if(data.fields[i].isModified) {
                    console.log('111',showLog)
                    showLog = true;
                    break;
                  }
                }
              }
              this.$nextTick(() => {
                let actBtnHeight = this.$refs.actBox.offsetHeight
                this.formTableWrapHeight = "calc(100% - " + actBtnHeight + "px" + " )"
                if((formType == 'new' && openParams.type == 277) || showLog == true) {
                  this.dialogShowScrollbar();//新表单弹出层有docId时显示滚动条
                }
              })

              this.$emit('event',fd.formTemplate.formName, openParams.id)
            }
          }
        );
      } else {
        let queryStr = '';
        if(openParams.queryString) {//参数
          queryStr = JSON.parse(openParams.queryString);
        }
        let obj = {
          appId: openParams.appId,
					formId: openParams.actionContent,
          _: new Date().getTime(),
        };
        if(openParams.isRelate === true || openParams.isRelate === 'true') { //包含原素或者标签也新建可能会携带isRelate和parentId，需要传到后台
          obj.isRelate = 'true'
        }else {
          obj.isRelate = openParams.isRelate
        }
        if(openParams.parentId) {
          obj.parentId = openParams.parentId
        }

				if(queryStr && queryStr.length>0){
					for(let i = 0; i<queryStr.length;i++){
						obj[queryStr[i].paramKey] = queryStr[i].paramValue;
					}
				}
        let emptyParams = this.emptyParams;
        if(emptyParams && emptyParams.length > 0) {  //视图列带参数跳转
          for(let i=0; i<emptyParams.length; i++) {
            for(let key in emptyParams[i]) {
              obj[key] = emptyParams[i][key];
            }
          }
        }
        if(openParams.exparams) {
          obj = this.setParams(openParams.exparams, obj)
        }
        if(openParams.formParams) {
          obj = this.setParams(openParams.formParams, obj)
        }
        if(openParams.urlParams) {
          obj = this.setParams(openParams.urlParams, obj)
        }
        if(openParams.realformId) { //如果是模板表单
          obj.formId = openParams.realformId
          formId = openParams.realformId
        }

        API.getDocumentEmpty(
          appId,
          formId,
          obj,
          {
            onSucess: response => {
              if(response.data.errcode == 0) {
                if(openParams.isNewCreate) { //视图新建后执行脚本
                  if(openParams.isOpenNewWindow) { //如果是新窗口打开
                    let _rp = JSON.parse(openParams.runAfterParams);
                    _rp.docId = response.data.data.id;
                    this.viewCreateRunAfterAction(_rp).then(()=>{
                      if (response.data.data) {
                        this.loading = false;
                        let docId = this.originalFormDocid?this.originalFormDocid:response.data.data.id; //判断是不是保存并新建_带旧数据的docid
                        this.currentFormDocId = docId;
                        this.formTemplateDocid = response.data.data.id.replace(/_/g, "");
                        this.getForm(appId, formId, docId, {}, response.data.data.id);
                      }else {
                        this.loading = false;
                      }
                    });
                  }else {
                    if(openParams.runAfterParams) {
                      openParams.runAfterParams.docId = response.data.data.id;
                      let treedocid = openParams.treedocid;
                      // this.viewCreateRunAfterAction(openParams.runAfterParams, treedocid); //如果是树形视图新建这个执行顺序一定要在empty之后才会生效
                      this.viewCreateRunAfterAction(openParams.runAfterParams, treedocid, response.data.data.id).then(()=>{
                        if (response.data.data) {
                          this.loading = false;
                          let docId = this.originalFormDocid?this.originalFormDocid:response.data.data.id; //判断是不是保存并新建_带旧数据的docid
                          this.currentFormDocId = docId;
                          this.formTemplateDocid = response.data.data.id.replace(/_/g, "");
                          this.getForm(appId, formId, docId, {}, response.data.data.id);
                        }else {
                          this.loading = false;
                        }
                      })
                    }else {
                      this.currentFormDocId = response.data.data.id;
                      this.getForm(appId, formId, response.data.data.id, {}, response.data.data.id);
                      this.loading = false;
                    }
                  }
                }else {
                  if (response.data.data) {
                    this.loading = false;
                    let docId = this.originalFormDocid?this.originalFormDocid:response.data.data.id; //判断是不是保存并新建_带旧数据的docid
                    this.currentFormDocId = docId;
                    this.formTemplateDocid = response.data.data.id.replace(/_/g, "");
                    this.getForm(appId, formId, docId, {}, response.data.data.id);
                  }else {
                    this.loading = false;
                  }
                }
              }
            }
          }
        );
      }
    },

    getForm(appId, formId, docId, params, currentResDocId) {
      let op = this.openParams;
      if(op.exparams) {
        params = this.setParams(op.exparams, params)
      }
      if(op.formParams) {
        params = this.setParams(op.formParams, params)
      }
      if(op.urlParams) {
        params = this.setParams(op.urlParams, params)
      }
      API.getForm(
        appId,
        formId,
        docId,
        params,
        {
          onSucess: res => {
            let fd = res.data.data;
            this.formTemplateDocid = docId.replace(/_/g, "");
            if(!fd.activities) {
              this.isShowFormActivity = false
            }
            if(fd.style) {
              fd.fields.forEach( val => {
                val.customStyle = fd.style;
              })
            }
            // this.formdata = fd;//res.data.data;
            if(fd.fields) {
              fd.fields.forEach( val => {
                if(val.value) {
                  val.value = val.value.replace(/&#37;/g, "%");
                }
              })
            }

            let data = fd;
            let formType = data.formTemplate.showType; //新表单还是旧表单
            let openComment = data.openComment;
            let commentFlag = data.commentFlag;
            const loopOpe = fields => {
              for(let i=0; i<fields.length; i++) {
                if(fields[i].value) {
                  fields[i].value = fields[i].value
                }
                if(!fields[i].isComment) {
                  fields[i].appId = appId;
                  fields[i].formShowType = formType;
                  if(fields[i].formField == "IncludeField") {
                    fields[i].isRefresh = new Date().getTime()
                    if(fields[i].openType == 288) { //网格视图
                      this.haveViewGridview = true
                    }
                    if(op.type && op.type == 277) {
                      fields[i].isOpenDialog = true;
                      fields[i].dialogId = op.dialogId ? op.dialogId : op.jumpDialogId; //op.jumpDialogId解决当视图列跳转按钮以弹出层打开表单时，包含元素无法显示
                    }
                  }else if(fields[i].formField == "InputField") {
                    fields[i].isRefresh = parseInt(Math.random()*100+1)+new Date().getTime()
                  }else if(fields[i].formField == "CalctextField") {
                    if(op.isWidgetLink) {
                      fields[i].isWidgetLink = true
                    }
                  }
                  if(fields[i].tabs && fields[i].tabs.length>0) {
                    for(let j=0; j<fields[i].tabs.length; j++) {
                      if(fields[i].tabs[j].openComment || fields[i].tabs[j].commentFlag) { //tab下有评论
                        let cf = fields[i].tabs[j].commentFlag;
                        let commentField = {
                          id: new Date().getTime() + '_评论',
                          appId,
                          docId: cf ? cf : docId, 
                          isComment: true,
                        }
                        fields[i].tabs[j].fields.push(commentField)
                        let dom = `<div>
                                    <o-comment v-bind="$attrs" v-on="$listeners" id='${commentField.id}'>
                                    </o-comment>
                                  </div>`;
                        fields[i].tabs[j].template += dom;
                      }
                      if(fields[i].tabs[j].fields && fields[i].tabs[j].fields.length > 0) {
                        loopOpe(fields[i].tabs[j].fields)
                      }
                    }
                  }
                }
              }
            };

            if(data.fields && data.fields.length>0) {
              loopOpe(data.fields)
            }
            console.log("data.fields-->",data.fields)

            fd.formId = formId;
            fd.docId = currentResDocId; //docId,一直拿新页面的docId;
            if(openComment) { //有评论
              let commentField = {
                id: new Date().getTime() + '_评论',
                appId,
                docId: commentFlag ? commentFlag : docId, 
                isComment: true,
              }
              data.fields.push(commentField)
              let dom = `<div><o-comment v-bind="$attrs"
              v-on="$listeners" id='${commentField.id}'></o-comment></div>`;
              data.formTemplate.template += dom;
            }

            let btns = []
            if(fd.activities && fd.activities.length > 0) { //如果按钮过多，并且有 __ 双下划线，就折叠起来
              fd.activities = fd.activities.filter(el => {
                if(el.name.indexOf("__") > -1) {
                  btns.push(el)
                }
                return el.name.indexOf("__") < 0
              })
              this.collapseButtons = btns
            }
            
            // if(fd.style && fd.style.content) { //自定义样式
            //   debugger
            //   let css = fd.style.content,
            //   head = document.head || document.getElementsByTagName('head')[0],
            //   style = document.createElement('style');
            //   head.appendChild(style);
            //   style.type = 'text/css';
            //   style.appendChild(document.createTextNode(css));
            // }

            this.formdata = fd;//res.data.data;
            if(fd.style && fd.style.content) { //自定义样式
              let formCss = "#formTemplate_" + this.formTemplateDocid + " " + fd.style.content
              let css = formCss,
              head = document.head || document.getElementsByTagName('head')[0],
              style = document.createElement('style');
              head.appendChild(style);
              style.type = 'text/css';
              style.appendChild(document.createTextNode(css));
            }
            if(res.data.data.waterMarkText) { //表单水印
              this.$nextTick(()=>{
                let str = docId.replace(/_/g, "");
                let id = 'formTemplate_' + str;
                Watermark.set(res.data.data.waterMarkText, id);
              })
            }
            
            if(this.oldBuildFormData) { //以下为判断当保存并新建后带旧数据时，把旧数据赋值给新表单
              let oldBuildFormData = this.oldBuildFormData;
              for(let key in oldBuildFormData) {
                for(let i=0; i<fd.fields.length; i++) {
                  if(key === fd.fields[i].name) {
                    fd.fields[i].value = oldBuildFormData[key]
                  }
                }
              }
            }
            this.$nextTick(() => {
              let actBtnHeight = ''
              if(this.$refs.actBox) {
                actBtnHeight = this.$refs.actBox.offsetHeight
              }else {
                actBtnHeight = 0
              }
              // let actBtnHeight = this.$refs.actBox.offsetHeight
              this.formTableWrapHeight = "calc(100% - " + actBtnHeight + "px" + " )"
              if(formType == 'new' && op.type == 277) {
                this.dialogShowScrollbar();//新表单弹出层无docId时显示滚动条
              }
            })
            this.$emit('event',fd.formTemplate.formName)
          }
        }
      );
    },

    setParams(params, obj){
      params = params.replace(/^(\s|&)+|(\s|&)+$/g, '')
      let list = params.split("&")
      for (let i = 0; i < list.length; i++) {
        let p = list[i].split("=")
        let isJson = this.isJSON(p[1])
        if(isJson) {
          obj[p[0]] = encodeURI(JSON.stringify(p[1]));
          // obj[p[0]] = encodeURI(p[1])//encodeURIComponent(p[1])
        }else {
          obj[p[0]] = p[1]?p[1]:''
        }
      }
      return obj
    },

    isJSON(str) { //判断是json字符串
      if (typeof str == 'string') {
        try {
          let obj=JSON.parse(str);
          if(typeof obj == 'object' && obj ){
            return true;
          }else{
            return false;
          }
        } catch(e) {
          return false;
        }
      }
    },

    //视图新建后执行脚本
    viewCreateRunAfterAction(params, treedocid, docId){ 
      if(docId) {
        params.formData.docId = docId
      }
      return new Promise((resolve) => {
        this.$api.runAfterActionScript(
          params.appId,
          params.divId,
          docId,
          params.actionContent,
          params.relatedForm,
          params._templateForm,
          params.parentId,
          params._,
          params.formData,
          '',
          treedocid?treedocid:'',
          {
            onSucess: response => {
              if(response.data.data){
                let returnData = response.data.data;
                if(returnData.changedField) {
                  this.$notify.success({
                    title: returnData.content,
                    message: ''
                  });
                }else {
                  let errmsg = response.data.data.content;
                  if(returnData.type && returnData.type == 'message') {
                    if(errmsg.type == 16 || errmsg.type == 1) {
                      this.$notify.success({
                        title: errmsg.content,
                        message: ''
                      });
                    }
                  }else if(returnData.type && returnData.type == '1') {
                    this.$notify.success({
                      title: errmsg,
                      message: ''
                    });
                  }else {
                    this.$notify.error({
                      title: errmsg,
                      message: ''
                    });
                  }
                  resolve();
                }
              }else if(response.data.errcode == 0){
                resolve();
              }
            }
          }
        );
      });
    },

    refresh(fId) {
      let op = this.openParams;
      let fieldId = '';
      if(fId.id) {
        fieldId = fId.id;
      }else {
        fieldId = fId;
      }
      //刷新方法
      let fd = this.buildFormData();
      let data = {
        document: fd,
        formId: op.actionContent,
        docId: fd.id,
        parentId: "",
        templateForm: "",
        viewId: "",
        applicationId: fd.applicationId,
        id: fd.id
      };
      fieldId = fieldId.replace(/"/g, "");
      
      API.refreshForm(fieldId, data, {
        onSucess: response => {
          let fields = response.data.data;
          let keys = Object.keys(fields);
          let formdata = this.formdata;
          keys.forEach(key => {
            let field = fields[key];
            const loopOpe = fields => {
              fields.forEach((f, i) => {
                if (field.id == f.id) {
                  fields[i].value = field.value;//只能更新value，而不能简单做对象替换，field.value绑定在组件v-model上，如果直接替换只是数组内存指针简单变更
                  fields[i].options = field.options;
                  fields[i].tabs = field.tabs;
                  //如果为选择类型field，则options也要在这里替换.....
                  fields[i].displayType = field.displayType;
                  fields[i].data = field.data;
                  fields[i].activity = field.activity
                  if(field.formField == "DepartmentField") { //这个会把部门选择框的值去除掉，后果未知，先这样
                    if(fields[i].value && fields[i].options.length <= 0) {
                      fields[i].value = '';
                    }
                  }else if(field.formField == "IncludeField") {
                    fields[i].isRefresh = new Date().getTime();
                  }else if (field.formField == "InputField") {
                    fields[i].addInTtems = true; //如果刷新重计算有返回控件，就算控件值是隐藏的，也要传到后台，在buildForamData中处理
                    // fields[i].isRefresh = parseInt(Math.random()*100+1)+new Date().getTime();
                  }
                }
                if(f.tabs && f.tabs.length>0) {
                  for(let j=0; j<f.tabs.length; j++) {
                    if(f.tabs[j].fields && f.tabs[j].fields.length > 0) {
                      loopOpe(f.tabs[j].fields)
                    }
                  }
                }
              });
            };
            loopOpe(formdata.fields)
          });
          this.formdata = formdata
        }
      });
    },
    
    handleClose(done) {
      done()
      if(this.isDialogOpenExternalLink) {
        let appId = this.openParams.appId
        let bf = this.buildFormData()
        let formId = bf.formId
        let docId = bf.id
        this.initForm({
          appId,
          formId,
          docId
        });
      }
    },

    setPopupOpenType(type, params){  //当视图是弹出层打开，新建或打开视图列表
      if(type == 'FORM') {
        params.isPopupLayerDisplay = true;
        this.jumpParamsForm = params;
        this.popupLayerType = type;
      }else if(type == 'VIEW'){
        this.popupLayerType = type;
      }
    },

    checkData(value) {
      if(value) {
        let data = this.buildFormData();
        return data; 
      } 
    },
    
    //按钮事件执行前
    /* actId：参数值为act.id;
    * isOrRefresh：刷新重计算
    * id：
    * activityType：参数值为act.type.
    * withOld：判断是否是保存并新建,
    * act：当前点击的按钮的全部参数
    */
    runBeforeAction(actId, isOrRefresh, id, activityType, withOld, act){
      this.isBlockClick = true
      setTimeout(() => {
        this.isBlockClick = false
      }, 3500)
      let op = this.openParams;
      let appId = op.appId;
      let formData = "";
      let documentId = "";
      if(this.copyFormData) { //复制文档时存在
        let cf = this.copyFormData;
        formData = this.buildFormData();//当复制时数据不变，只改变id值
        formData.docId = cf.id;
        formData.id = cf.id;
        documentId = cf.id;
      }else {
        let bf = this.buildFormData();
        formData = bf;
        formData.docId = bf.id;
        documentId = bf.id;
      }
      let subDocuments = [];
      let versions = '';
      let templateForm = '';
      let subDoc = this.$store.state.subDocuments;
      let haveViewGridview = this.haveViewGridview;
      let time = 0;
      if(haveViewGridview) { //如果有网格视图
        this.$store.commit('SET_SAVESUBDOCMENTS', {randomId: new Date().getTime(), docId: formData.docId})
        time = 100
      }
      setTimeout(() => {
        let subDocData = this.$store.state.subDocumentsData;
        if(subDoc && subDoc.length > 0) { //判断是否是包含元素网格视图
          subDocuments = subDoc;
          versions = formData.versions;
          delete formData.subDocuments;
          delete formData.versions;
          delete formData.templateForm;
        }else if(subDocData && haveViewGridview) { //网格视图，看store.js
          subDocuments = this.setAllSubDocmentsData(subDocData);
        }else {
          subDocuments = formData.subDocuments;
          versions = formData.versions;
        }
        let document = {
          applicationId: op.appId,
          formId: formData.formId,
          id: documentId,
          items: formData.items,
          parentId: formData.parentId,
          sign: formData.sign,
          subDocuments: subDocuments,
          versions: versions,
          exparams: {},
          templateForm: templateForm,
        };     
        delete formData.items;
        let subSelects = this.subSelects;
        if(subSelects.length > 0) {
          formData.subSelects = subSelects;
        }
        if(op.parentId) {
          if(op.isRelate === true || op.isRelate === 'true') {
            document.isRelate = 'true'
          }else{
            document.isRelate = op.isRelate
          }
          document.parentId = op.parentId
          formData.parentId = op.parentId
        }
        formData.document = document;
        
        formData.viewId = "";
        formData.templateForm = "";
        if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
          formData.formId = op.realformId;
          formData.document.formId = op.realformId;
          formData.templateForm = op.actionContent;
        }
        this.parameterObj = formData;
        API.runBeforeActionScript(
          appId, 
          actId,
          formData,
          activityType,
          '', //treedocid
          '', //flowType
          {
          onSucess: response => {
            if(response.data.data){ //如果有数据返回，结束下一步
              let resData = response.data.data;
              let errmsg = response.data.data.content;
              if(!resData.type) { //没有type值，但是有返回数据，把数据放进document
                this.isBlockClick = false
                if(resData.changedField) {
                  let items = this.formdata.fields;//formData.document.items;
                  let resDataItem = resData.changedField;
                  if(resDataItem) {
                    for(let j = 0; j<items.length; j++) {
                      for(let i=0; i<resDataItem.length; i++) {
                        for(let el in resDataItem[i]) {
                          if(items[j].name == el) {
                            formData.document.items[el] = resDataItem[i][el];
                            items[j].value = resDataItem[i][el];
                          }
                        }
                      }
                    }
                  }
                  switch (activityType) {
                    case 4: //保存并启动流程
                      this.saveStartWorkFlow(activityType, actId, act);
                      break;
                    case 8: //关闭窗口
                      this.goBack();
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 10: //返回
                      this.goBack(activityType, actId,'',act);
                      break;
                    case 11: //保存并返回
                      this.doSave(activityType, actId, '', subDoc, act);
                      break;
                    case 13:
                      // this.execute(appId, actId, formData, act);
                      this.execute({actId, formData, act});
                      break;
                    case 14: //网页打印
                      this.printForm(act);
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 15: //网页打印_包含流程打印
                      this.printForm(act);
                      break;
                    case 19: //保存草稿
                      this.saveDraft(activityType, actId,act);
                      break;
                    case 21: //保存并复制
                      this.doSave(activityType, actId, '', '', act);
                      break;
                    case 25: //PDF导出
                      this.leadingOut();
                      break; 
                    case 26: //文件下载
                      this.fileDownload(actId);
                      break;
                    case 30: //自定义打印
                      this.printForm(act);
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 34: //保存（校验）数据
                      this.doSave(activityType, actId, '', subDoc, act);
                      break;
                    case 37: //通过邮件或短信通知
                      this.showSendMailOrSmsFlowpanel(act)
                      break;
                    case 42: //保存并新建
                      this.doSave(activityType, actId, withOld, '', act);
                      break;
                    case 43: //跳转
                      this.jumpType(act);
                      break;
                    case 45: //归档
                      this.placeOnFile();
                      break;
                    case 46: //签章
                      this.isBlockClick = false
                      this.formSignatureData.showFormSignature = true;
                      break;
                    default:
                      break;
                  }
                }
              }else if(resData.type == 1){
                this.$notify.success({
                  title: errmsg,
                  message: ''
                });
                this.isBlockClick = false
              }else if(resData.type == 16) {
                this.$notify({
                  title: errmsg,
                  message: '',
                  type: 'warning'
                });
                this.isBlockClick = false
              }else if(resData.type == 32){
                this.$confirm(`${errmsg}`, this.$t('tip'), {
                  confirmButtonText: this.$t('msg.confirm'),
                  cancelButtonText: this.$t('btns.cancel'),
                  type: "warning",
                }).then(() => {
                  switch (activityType) {
                    case 4: //保存并启动流程
                      this.saveStartWorkFlow(activityType, actId, act);
                      break;
                    case 8: //关闭窗口
                      this.goBack(activityType, actId);
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 10: //返回
                      this.goBack(activityType, actId,'',act);
                      break;
                    case 11: //保存并返回
                      this.doSave(activityType, actId, '', subDoc, act);
                      break;
                    case 13:
                      // this.execute(appId, actId, formData, act);
                      this.execute({actId, formData, act});
                      break;
                    case 14: //网页打印
                      this.printForm(act);
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 15: //网页打印_包含流程打印
                      this.printForm(act);
                      break;
                    case 19: //保存草稿
                      this.saveDraft(activityType, actId,act);
                      break;
                    case 21: //保存并复制
                      this.doSave(activityType, actId, '', '', act);
                      break;
                    case 25: //PDF导出
                      this.leadingOut();
                      break; 
                    case 26: //文件下载
                      this.fileDownload(actId);
                      break;
                    case 28: //电子签章 
                      this.isBlockClick = false
                      this.doSignature(act)        
                      break;
                    case 30: //自定义打印
                      this.printForm(act);
                      this.runAfterAction(actId, activityType,'','',act);
                      break;
                    case 34: //保存（校验）数据
                      this.doSave(activityType, actId, '', subDoc, act);
                      break;
                    case 37: //通过邮件或短信通知
                      this.showSendMailOrSmsFlowpanel(act);
                      break;
                    case 42: //保存并新建
                      this.doSave(activityType, actId, withOld, '', act);
                      break;
                    case 43: //跳转
                      this.jumpType(act);
                      break;
                    case 45: //归档
                      this.placeOnFile();
                      break;
                    case 46: //签章
                      break;
                    default:
                      break;
                  }
                }).catch(() => {});
              }
            }else {
              switch (activityType) {
                case 4: //保存并启动流程
                  this.saveStartWorkFlow(activityType, actId, act);
                  break;
                case 8: //关闭窗口
                  this.goBack(activityType, actId);
                  this.runAfterAction(actId, activityType,'','',act);
                  break;
                case 10: //返回
                  this.goBack(activityType, actId,'',act);
                  break;
                case 11: //保存并返回
                  this.doSave(activityType, actId, '', subDoc, act);
                  break;
                case 13:
                  // this.execute(appId, actId, formData, act);
                  this.execute({actId, formData, act});
                  break;
                case 14: //网页打印
                  this.printForm(act);
                  this.runAfterAction(actId, activityType,'','',act);
                  break;
                case 15: //网页打印_包含流程打印
                  this.printForm(act);
                  break;
                case 19: //保存草稿
                  this.saveDraft(activityType, actId,act);
                  break;
                case 21: //保存并复制
                  this.doSave(activityType, actId, '', '', act);
                  break;
                case 25: //PDF导出
                  this.leadingOut();
                  break; 
                case 26: //文件下载
                  this.fileDownload(actId);
                  break;
                case 28: //电子签章 
                  this.isBlockClick = false
                  this.doSignature(act)        
                  break;
                case 30: //自定义打印
                  this.printForm(act);
                  this.runAfterAction(actId, activityType,'','',act);
                  break;
                case 34: //保存（校验）数据
                  this.doSave(activityType, actId, '', subDoc, act);
                  break;
                case 37: //通过邮件或短信通知
                  this.showSendMailOrSmsFlowpanel(act);
                  break;
                case 42: //保存并新建
                  this.doSave(activityType, actId, withOld, '', act);
                  break;
                case 43: //跳转
                  this.jumpType(act);
                  break;
                case 45: //归档
                  this.placeOnFile();
                  break;
                case 46: //签章
                  this.formSignatureData.showFormSignature = true;
                  break;
                default:
                  break;
              }
              if(isOrRefresh) {
                this.refresh(id);
              }
            }
          },
        })
      }, time)
    },

    //执行脚本后
    runAfterAction(actId, num, withOld, subDoc, act) {
      let op = this.openParams
      let that = this
      let appId = op.appId
      let formData = this.parameterObj
      let docId = ""
      let bf = this.buildFormData()
      if(this.copyFormData) { //复制时存在
        docId = this.copyFormData.id
      }else {
        docId = bf.id
      }
      let _bfd = bf
      let formId = _bfd.formId
      let viewId = ""
      let _templateForm = ""
      if(formData.templateForm) {
        _templateForm = formData.templateForm
      }
      let _ = new Date().getTime();
      let parentId = _bfd.parentId;
      API.runAfterActionScript(
        appId,
        actId,
        docId, 
        viewId, 
        formId, 
        _templateForm, 
        parentId, 
        _,
        formData,
        act.type,
        '', //treedocid
        {
          onSucess: response => {
            this.isBlockClick = false
            if(response.data.errcode == 0) {
              if(response.data.data) {
                let resData = response.data.data;
                let errmsg = response.data.data.content;
                if(errmsg.content) {
                  if(errmsg.type == 1){
                    this.$notify.success({
                      title: errmsg.content,
                      message: ''
                    });
                    if(num == 34){
                      this.initForm({ //保存后重新加载页面数据，其他按钮也要执行该操作
                        appId,
                        formId,
                        docId
                      });
                    }
                  }
                }else {
                  if(!resData.type) { //没有type值，但是有返回数据，把数据放进document
                    if(resData.changedField) {
                      let items = this.formdata.fields;//formData.document.items;
                      let resDataItem = resData.changedField;
                      if(resDataItem) {
                        for(let j = 0; j<items.length; j++) {
                          for(let i=0; i<resDataItem.length; i++) {
                            for(let el in resDataItem[i]) {
                              if(items[j].name == el) {
                                formData.document.items[el] = resDataItem[i][el];
                                items[j].value = resDataItem[i][el];
                              }
                            }
                          }
                        }
                      }
                    }
                  }else if(resData.type == 1){
                    this.$notify.success({
                      title: errmsg,
                      message: ''
                    });
                    if(num == 34){
                      this.initForm({ //保存后重新加载页面数据，其他按钮也要执行该操作
                        appId,
                        formId,
                        docId
                      });
                    }
                  }else {
                    this.$notify.success({
                      title: errmsg,
                      message: ''
                    });
                  }
                }
              }else {
                if(num == 4) {
                  this.initForm({
                    appId,
                    formId,
                    docId
                  });
                }else if(num == 11) { //关闭当前页
                  setTimeout(function () {
                    that.goBack();
                  }, 500);
                }else if(num == 21) { //保存并复制
                  this.copyDoc();
                }else if(num == 42) { //保存并重建
                  setTimeout( () => {
                    if(withOld) { //保留旧数据
                      that.$parent.reloading(docId);
                    }else {
                      this.initForm({
                        appId,
                        formId,
                        docId: '',
                      });
                    }
                  }, 500);
                }else if(num == 34) {
                  let openParams = this.openParams;
                  let isSave ='';
                  isSave = true;
                  if(openParams.isIncludeCreate && openParams.isIncludeCreate == 'include') {
                    this.$emit("action",isSave); 
                  }else if(openParams.isTabCreate && openParams.isTabCreate== 'tab' || openParams.showtype == 'tab'){ //选项卡
                    this.$emit("action",isSave);
                  }

                  if(openParams.homeWidgetType && openParams.homeWidgetType == 'system_workflow') {
                    this.$store.dispatch("getPendingListWithWidget"); //保存完毕后首页流程处理widget数据重新刷新
                    this.$store.dispatch("getProcessedListWithWidget");
                  }
                  if(openParams.type == 277) {
                    that.goBack(num);
                  }

                  let isIncludeViewRefresh = this.$store.state.isIncludeViewRefresh;
                  if(isIncludeViewRefresh && subDoc && subDoc.length>0) { //是包含元素网格视图并要刷新
                    that.$parent.reloading();
                    let obj = {
                      data:[],
                      isRefresh: false,
                    }
                    this.$store.commit('saveSubDocuments', obj); //保存成功后重新把包含元素网格视图的数据清空
                  }
                  this.initForm({ //保存后重新加载页面数据，其他按钮也要执行该操作
                    appId,
                    formId,
                    docId
                  });

                  let list = this.formdata.fields;
                  for(let i = 0; i<list.length; i++) {
                    if(list[i].isModified) {
                      let data = {
                          fieldName: list[i].name,
                          _: new Date().getTime(),
                        }
                      let docId = list[i].docId;
                      this.$store.dispatch("getOperationLog",{appId, docId, data});
                    }
                  }

                  this.$store.commit("SET_SUBDOCUMENTS_DATA",{ //保存后清空store里的网格视图的数据
                    op: '',
                    view: '',
                    _afd: '',
                    _dl: '',
                  })
                  this.$store.commit('saveSubDocuments', {
                    data: [],
                    isRefresh: false,
                  });
                }
              }
              if(num == 13) { //自定义按钮
                this.customBtnOperation(act.actionType, appId, formId, docId, num)
              }
              sessionStorage.setItem("currentFormtableDocId", docId) //选项卡时记录选项卡的当前选中的页签
            }
          }
        }
      );
    },

    setSubDocmentsData(data) {
      let _afd = data._afd;
      let _dl = data._dl;
      console.log("data-->",data)
      if(_afd && _afd.length > 0) {
        for(let i=0; i<_afd.length; i++) {
          for(let j=0; j<_dl.length; j++) {
            if(_afd[i].docId == _dl[j].id) {
              let fields = _afd[i].data.fields;
              let items =  _dl[j].items;
              for(let key in items) {
                for(let z=0; z<fields.length; z++) {
                  if(items[key].id == fields[z].id) {
                    items[key].value = fields[z].value
                  }
                }
              }
            }
          }
        }
      }
      let arr = [];
      let dataList = data._dl;
      let view = data.view;
      let op = data.op;
      for (let i = 0; i < dataList.length; i++) {
        let obj = JSON.parse(JSON.stringify(dataList[i]));
        if(op.parentId) {
          obj.parentId = op.parentId;
        }
        if(op.isRelate === true || op.isRelate === 'true') {
          obj.isRelate = "true";
        }else {
          obj.isRelate = op.isRelate
        }        
        obj.items = {};
        for (let j = 0; j < view.columns.length; j++) {
          for (let key in dataList[i].items) {
            if (key == view.columns[j].id) {
              obj.items[dataList[i].items[key].name] = dataList[i].items[
                key
              ].value;
              if(dataList[i].edit) {
                obj.edit = true;
              }else { //暂时没想到其他好方法，只能全部都给edit保存了
                obj.edit = true;
              }
            }
          }
        }
        arr.push(obj);
      }
      return arr
    },

    setAllSubDocmentsData(data){
      let docId = this.formdata.docId
      let subDoc = data[docId]
      let arr = []
      if(Object.values(data).length > 0) {
        for(let key in subDoc) {
          // arr.push(subDoc[key])
          arr = arr.concat(subDoc[key])
        }
      }
      return arr
    },

    //电子签章
    doSignature() {
      let that = this;
      let posid = 'formTemplate_' + this.formTemplateDocid + '_1';
      let signatureCreator = Signature.create();
      signatureCreator.run({
        protectedItems:[],//设置定位页面DOM的id，自动查找ID，自动获取保护DOM的kg-desc属性作为保护项描述，value属性为保护数据。不设置，表示不保护数据，签章永远有效。
        position: posid,//设置盖章定位dom的ID，必须设置
        okCall: function(fn, image) {//点击确定后的回调方法，this为签章对象 ,签章数据撤销时，将回调此方法，需要实现签章数据持久化（保存数据到后台数据库）,保存成功后必须回调fn(true/false)渲染签章到页面上
          // console.log("盖章ID："+this.getSignatureid());
          // console.log("盖章数据："+this.getSignatureData());
          // var result = {"data":{}};
          var json = {};
          var docId = that.buildFormData().id;
          var signatureData = Signature.verifySignByList([this])[0];//返回签章信息
          signatureData.documentid = docId,
          signatureData.documentname = docId,
          signatureData.position = posid;
          var imgData = image.imgdata;//返回签章图片base64数据
          json.signatureData = signatureData;
          json.imgData = imgData;
          json.userId = that.$root.user.id,//that.$store.state.userId; //user写死了
          json.nodeId = "";
          json.stateLabel = "";
          fn(true);

          var signatureCreator = Signature.create();
          var list = Signature.list;
          
          json.signatureId = this.signatureid;
          that.$api.saveHTMLsignature(
            that.$root.appid,
            docId,
            json,
            {
              onSucess: res => {
                if(res.data.errcode === 4001) {
                  Signature.hide();//隐藏签章
                  Toast({
                    message: res.data.errmsg,
                    iconClass: "fa fa-close fa-2x"
                  });
                  return;
                }else {
                  for ( var key in list) {
                    signatureCreator.saveSignature(docId, key, list[key].getSignatureData());
                  }
                }
              }
            }
          )
        },
        cancelCall : function() {//点击取消后的回调方法
        }
      });
    },

    //自定义按钮操作
    customBtnOperation(actionType, appId, formId, docId, num){
      switch(actionType) {
        case 0:
          this.initForm({ //保存后重新加载页面数据，其他按钮也要执行该操作
            appId,
            formId,
            docId
          })
          let list = this.formdata.fields;
          for(let i = 0; i<list.length; i++) {
            if(list[i].isModified) {
              let data = {
                  fieldName: list[i].name,
                  _: new Date().getTime(),
                }
              let docId = list[i].docId;
              this.$store.dispatch("getOperationLog",{appId, docId, data});
            }
          }
          break;
        case 1:
          this.goBack()
          break;
        case 2:
          this.goBack(num)
          break;
        case 3:
          break;
        default:
          break;
      }
    },

     //保存（校验）数据
    doSave(num, actId, withOld, subDoc, act) {
      let openParams = this.openParams;
      let that = this;
      let transferrData = "";
      let id = "";
      let formId = ''
      if(this.copyFormData) { //复制时存在
        transferrData = this.buildFormData(); //this.copyFormData
        id = this.copyFormData.id;
        transferrData.id = id;
      }else {
        let bf = this.buildFormData();
        transferrData = bf;
        id = bf.id;
      }
      if (openParams.parentId) {
        transferrData.parentId = openParams.parentId;
      }else {
        transferrData.parentId = '';
      }
      if(openParams.isRelate === true || openParams.isRelate === 'true') {
        transferrData.isRelate = "true";
      }else {
        transferrData.isRelate = '';
      }
      let subDocData = this.$store.state.subDocumentsData;
      if(subDoc && subDoc.length > 0) { //包含元素网格视图
        transferrData.subDocuments = subDoc;
      }else if(subDocData && this.haveViewGridview) { //网格视图，看store.js
        transferrData.subDocuments = this.setAllSubDocmentsData(subDocData);
      }
      if(openParams.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
        transferrData.templateForm = openParams.actionContent;
        transferrData.formId = openParams.realformId;
        formId = openParams.realformId;
      }else {
        formId = this.formdata.formId;
      }
      API.saveDocument(
        openParams.appId,
        formId,
        id,
        transferrData,
        {
          onSucess: response => {
            let errcode = response.data.errcode;
            let errmsg = response.data.errmsg;
            let errorsList = response.data.errors;
            if(errcode == 4001) {
              this.isBlockClick = false
              let promptData = '';
              if(errorsList && errorsList.length > 0) {
                errorsList.forEach(item => {
                  promptData += item.errmsg + "\n"
                });
              }
              this.promptBox(errcode, errmsg, promptData);
            }else if(errcode == 0){  
              that.promptBox(errcode, errmsg).then(() => {
                this.runAfterAction(actId, num, withOld, subDoc, act);
              });
              
              if(num == 42) { //保存后重建
                if((openParams.isIncludeCreate && openParams.isIncludeCreate == 'include')) {
                  this.$emit("action"); 
                }else if(openParams.type && openParams.type == 277){
                  this.$emit("action", true); 
                }
              }
              if(response.data.data.items && num != 42) {
                this.oldBuildFormData = response.data.data.items;
              }

              // debugger
              // if(!openParams.isFlowCenterCreate) { //流程中心处发起新建，保存后会重新加载整个表单页面，为了不刷新页面，判断非流程中心才执行下一步(m 忘了是不是我写的，但是这里导致普通表单保存后，新建了)
              //   this.$parent.$parent.refreshView(openParams); //普通视图保存成功后刷新视图页面
              // }
            }
          },
        }
      );
    },

    //复制文档
    copyDoc() {
      let appId = this.openParams.appId;
      let docId = "";
      let doc = {};
      let formData ="";
      let bf = this.buildFormData();
      if(this.copyFormData) { //复制时存在
        formData = bf;
        formData.id = this.copyFormData.id;
        docId = this.copyFormData.id;
        doc.document = formData;
      }else {
        formData = bf;
        docId = bf.id;
        doc.document = formData;
      }
      delete doc.document.items.button_act;
      delete doc.document.items.null;
      delete doc.document.items.undefined;
      API.copeDocument(
        appId,
        docId,
        doc,
        {
          onSucess: response => {
            this.copyFormData = this.buildFormData();
            this.copyFormData.id = response.data.data.id;
          }
        }
      )
    },

    //保存草稿(19)
    saveDraft(num, actId,act){
      let that = this;
      let formData = "";
      if(this.copyFormData) { //复制时存在
        formData = this.buildFormData();
        formData.id = this.copyFormData.id;
      }else {
        formData = this.buildFormData();
      }
      delete formData.items.button_act;
      delete formData.items.null;
      delete formData.items.undefined;
      API.saveWithoutValidDocument(
        this.openParams.appId,
        formData.id,
        formData,
        {
          onSucess: response => {
            if(response.data.errcode == 0) {
              let errcode = response.data.errcode;
              let errmsg = response.data.errmsg
              this.promptBox(errcode, errmsg).then((data) => {
                that.runAfterAction(actId, num,'','',act);
              });
            }
          },
        }
      );
    },

    //返回
    /**
     * num为按钮类型type
    */
    goBack(num, actId, isFlowPanel,act){
      let params = this.openParams;
      if(params.isOpenNewWindow)  { //如果是新窗口打开 //|| (top == window 导致保存并返回，提交流程等关闭页签无法执行)
        window.close();
      }else if(params.isExternalLink) { //外链,打开的是opener组件
        if(params.isOpenDialog) { //弹窗打开
          window.parent.handleClose();
        }else {
          this.$emit("onAction",'', true)
        }
      }else if(
        (params.isIncludeCreate && params.isIncludeCreate == 'include' && (!(params.openType && params.openType == 293)))
      ) { //包含元素
        this.$emit("action"); 
      }else if(params.isTabCreate && params.isTabCreate== 'tab'){ //选项卡
        this.$emit("action");
      }else if(params.type && params.type == 277) {
        let isSave = '';
        if(num && num == 34) {
          isSave = true;
        }
        this.$emit("action", isSave);
      }else if(isFlowPanel) { //打开了提交面板，提交流程后关闭表单标签，但是第一个if已经判断了，这里暂时后续再看，先不删除
        let tab = params;
        this.$parent.doBack();
        // let havePar = false;
        // let par  = '';
        // while(!havePar) {
        //   par = par + '.$parent';
        //   let url = 'this' + par + '.onCloseBtnClick';
        //   if(eval(url)) {
        //     let path = url + '(' + JSON.stringify(tab) +')';
        //     eval(path);
        //     break
        //   }
        // }
        // let tab = this.openParams;
        // this.$parent.$parent.onCloseBtnClick(tab);
      }else if(params.isPopupLayerDisplay) { //如果是弹出层打开的视图打开的表单
        this.$emit("popupOpenType", "VIEW");
        this.$emit("action", num);
      }else {
        if(num && num == 8) {
          if(this.isClickGoBackBtn) {
            return
          }
        }
        let tab = params;
        this.isClickGoBackBtn = true;
        if(params.allowOpenDoc && params.allowOpenDoc == true) {
          this.$parent.$parent.handleDocumentClose();  //视图选择框允许查看文档点击返回按钮弹框false
        }else {
          // this.$parent.$parent.onCloseBtnClick(tab);
          this.$parent.doBack()
        }
      }
	  if(num && num == 10) { //返回按钮执行执行后脚本
        this.runAfterAction(actId, num,'','',act);
      }
    },

    printPage() {
      let newWindow = window.open('_blank');   //  打开新窗口
      let codestr = document.getElementById('print').innerHTML;   //  获取需要生成pdf页面的div代码
      newWindow.document.write(codestr);   //  向文档写入HTML表达式或者JavaScript代码
      newWindow.document.close();     //  关闭document的输出流, 显示选定的数据
      setTimeout( ()=> {
        newWindow.print();
      }, 100);
    },

    //打印数据
    printForm(act){
      this.isBlockClick = false
      if(act.type == 14) {
        this.printParams.formId = this.formdata.formId;
        this.printParams.docId = this.formdata.docId;
        let routeData = this.$router.resolve({
          name: "formPrint",
          query: {
            appId: this.openParams.appId,
            formId: this.formdata.formId,
            docId: this.formdata.docId,
            printType: act.type,
          }
        });
        window.open(routeData.href, '_blank');
      }else if(act.type == 30){
        this.printParams.formId = this.formdata.formId;
        this.printParams.docId = this.formdata.docId;
        let routeData = this.$router.resolve({
          name: "formPrint",
          query: {
            appId: this.openParams.appId,
            onActionPrint: act.onActionPrint,
            docId: this.formdata.docId,
            printType: act.type,
          }
        });
        window.open(routeData.href, '_blank');
      }
    },

    //归档
    placeOnFile(){
      let appId = this.openParams.appId;
      let docId = this.buildFormData().id;
      API.Archive(
        appId,
        docId,
        {
          onSucess: () => {
            this.isBlockClick = false
          }
        }
      )
    },

    //文件下载
    fileDownload(actId){
      let appId = this.openParams.appId;
      let docId = this.buildFormData().id;
      API.documentDownload(
        appId,
        docId,
        actId,
        {
          onSucess: res => {
            this.isBlockClick = false
            let path = res.data.data;
			      if(path && (path.indexOf("https://")>-1 || path.indexOf("http://")>-1)){
              window.open(encodeURI(path));
              return false;
            }
            let url = obpmConfig.obpmFilePath + path;
            // window.open(url);
            const elink = document.createElement("a")
            let arr =  path.split("/");
            elink.download = arr[arr.length - 1];
            elink.style.display = "none"
            elink.href = url
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href)
            document.body.removeChild(elink)

            // let fileName = "";
            // let type = response.headers['content-type'];
            // if(response.headers['content-disposition']) {
            //   fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
            // }else {
            //   fileName="下载";
            // }
            // if(response.data.size >0){
            //   this.download(response, type, fileName);
            // }else {
            //   this.$notify({
            //     title: this.$t('form.warning'),
            //     message: '文件不存在',
            //     type: 'warning'
            //   });
            // }
          },
          onError:() => {
            this.isBlockClick = false
            this.$notify({
              title: this.$t('form.warning'),
              message: this.$t('view.nofile'),
              type: 'warning'
            });
          }
        }
      )
    },

    setHtmlReadnoly(isRead){
      let data = this.formdata
      const loopOpe = fields => {
        for(let i=0; i<fields.length; i++) {
          if(isRead) {
            if(fields[i].displayType == Constant.PermissionType_MODIFY) {
              fields[i].originalDisplayType = Constant.PermissionType_MODIFY
              fields[i].displayType = Constant.PermissionType_READONLY
            }
          }else {
            if(fields[i].originalDisplayType) {
              fields[i].displayType = fields[i].originalDisplayType
            }
          }
          if(!fields[i].isComment) {
            if(fields[i].tabs && fields[i].tabs.length>0) {
              for(let j=0; j<fields[i].tabs.length; j++) {
                if(fields[i].tabs[j].fields && fields[i].tabs[j].fields.length > 0) {
                  loopOpe(fields[i].tabs[j].fields)
                }
              }
            }
          }
        }
      };
      if(data.fields && data.fields.length>0) {
        loopOpe(data.fields)
      }
      this.formdata = data
    },

    //PDF导出
    leadingOut(){
      let appId = this.openParams.appId;
      let _bf = this.buildFormData();
      let docId = _bf.id; //__HIyNvkSUkqN1PsZOicZ
      let formId =  _bf.formId;
      this.setHtmlReadnoly(true);
      setTimeout(() => {
        let domId = "formTemplate_" + docId.replace(/_/g, ""); //formTemplate_HIyNvkSUkqN1PsZOicZ
        let htmlBody = document.getElementById(domId).innerHTML;
        let linkCss = "<link rel='stylesheet' href='pdf.css'></link>"
        htmlBody += linkCss;
        let params = {
          htmlBody,
        }
        let statiContextPath = obpmConfig.statiContextPath;
        this.setHtmlReadnoly(false)
        if(statiContextPath) {//5.0 trunk
          API.trunkPDFExport(
            appId,
            formId,
            docId,
            params,
            {
              onSucess: res => {
                this.isBlockClick = false
                let url = obpmConfig.obpmFilePath + res.data.data;
                window.open(url);
              }
            }
          )
        }else {//4.4 stable
          API.stablePDFExport(
            appId,
            formId,
            docId,
            {
              onSucess: response => {
                this.isBlockClick = false
                // 获取在response headers中返回的下载文件类型
                let type = response.headers['content-type'];
                /*获取在response headers中返回的下载文件名
                  因为返回文件名是通过encodeURIComponent()函数进行了编码，因此需要通过decodeURIComponent()函数解码
                */
                let fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
                // 调用封装好的下载函数
                this.download(response, type, fileName);
              }
            }
          )
        }
      }, 100)
      
    },

    download(res, type, filename){
        const blob = new Blob([res.data], {
          // 如果后端没返回下载文件类型，则需要手动设置：type: 'application/pdf;chartset=UTF-8' 表示下载文档为pdf，如果是word则设置为msword，excel为excel
          type: type
        });
        const a = document.createElement('a');
        const herf = window.URL.createObjectURL(blob);
        // 下载链接
        a.href = herf;
        // 下载文件名,如果后端没有返回，可以自己写a.download = '文件.pdf'
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(herf);
    },

    //关闭跳转按钮打开的窗口
    /*
      * num = 13,自定义按钮
    */
    closeDialog(num){
      this.jumpPopup = false;
      if(this.isDialogOpenExternalLink || num == 13) {
        let appId = this.openParams.appId
        let bf = this.buildFormData()
        let formId = bf.formId
        let docId = bf.id
        this.initForm({
          appId,
          formId,
          docId
        });
      }
    },

    //计算脚本a标签跳转
    scriptJump(openType, params, jumpType, styleParams) {
      let newparams = JSON.parse(params)[0]
      newparams.name = this.formdata.formTemplate.formName
      if(jumpType === 'opendocument') {
        if (openType == "open-eject" || openType == "dialog") {
          if(styleParams) {
            styleParams = JSON.parse(styleParams)
          }
          let screen = document.documentElement.clientHeight
          let dialogHeight = styleParams.dialogHeight
          if(dialogHeight) {
            let dh = dialogHeight.split("px")[0]
            if(dh > screen ) {
              styleParams.dialogHeight = (screen - 80) + "px"
            }else {
              styleParams.dialogHeight = (dh - 80) + "px"
            }
          }

          this.isJumpForm = true;
          newparams.dialogId = 'dialog_normalform_' + this.openParams.actionContent; //用于弹窗打开表单有包含元素时，计算包含元素宽度
          this.jumpParams = newparams
          this.jumpPopupStyle = styleParams
          this.jumpPopup = true
        }else if (openType == "open-present") {
          newparams.isCurrentPageOpen = true
          this.$emit("openNewpage",newparams)
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            name: 'open',
            query: newparams,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          this.$emit("add-tab", newparams);
        }
      }else if(jumpType === 'openview') {
        if (openType == "open-eject" || openType == "dialog") {
          this.isJumpView = true;
          this.jumpParams = newparams;
          this.jumpPopup = true;
          this.popupLayerType = "VIEW"
        }else if (openType == "open-present") {
          newparams.isCurrentPageOpen = true;
          this.$emit("openNewpage",newparams);
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            name: "view_blank",
            query: newparams,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          this.$emit("add-tab", newparams);
        }
      }else if(jumpType === 'jumpto'){
        // let routeData = this.$router.resolve({
        //   name: "open",
        //   query: newparams,
        // });
        // window.open(routeData.href, "_blank");
        window.open(newparams.actionContent)
      }
    },

    //跳转
    jumpType(act){
      let _op = this.openParams;
      let name = act.name;
      if(act.jumpMode === 0) {
        let actId = act.targetList.split("|")[0];
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: actId,
          _select:'',
          name,
        };
        if(_op.isOpenNewWindow == 'true') {
          params.isCurrentPageOpen = true;
        }
        let isExternalLink = false
        switch(act.jumpActOpenType) {
          case 0:
            if(!isExternalLink) {
              params.isCurrentPageOpen = true;
              // this.openNewpage(params)
              this.$emit("openNewpage",params);
              this.runAfterAction(act.id, act.type, '', '', act);
            }
            break;
          case 1:
            this.isJumpForm = true;
            if(!isExternalLink) {
              params.isPopupLayerDisplay = true; 
              this.jumpParams = params;
              this.jumpPopup = true;
              this.popupLayerType = "VIEW";
              this.runAfterAction(act.id, act.type, '', '', act);
            }else {
              this.jumpParams = params;
              this.jumpPopup = true;
            }
            break;
          case 2:
            if(!isExternalLink) {
              this.$emit("add-tab", params);
              this.runAfterAction(act.id, act.type, '', '', act);
            }
            break;
          case 3:
            if(!isExternalLink) {
              params.isOpenNewWindow = true; //判断是新窗口打开
              let routeData = this.$router.resolve({
                // name: "form_blank",
                name: 'open',
                query: params,
              });
              window.open(routeData.href, "_blank");
              this.runAfterAction(act.id, act.type, '', '', act);
            }
            break;
          case 4:
            break;
          default:
            break;
        }
      }else if(act.jumpMode === 1) {
        let subSelects = this.subSelects
        let subSelectId = ''
        if(subSelects && subSelects.length > 0) {
          subSelectId = subSelects.join(";")
        }
        this.$api.runScript(
          this.openParams.appId, 
          act.id, 
          this.buildFormData().id, 
          'dispatcherUrl',
          '',
          subSelectId,
          {
            onSucess: res => {
              if(res.data.errcode === 0) {
                this.isBlockClick = false
                let url = res.data.data
                let urlParams = ''
                if(url.indexOf("?") > -1) {
                  urlParams = url.split("?")[1]
                }
                let isForm = url.search("form.html") != -1
                let isView = url.search("view.html") != -1
                let isOpenCurrentSoftwareData = url.search("open?") != -1

                let urlArrayF = url.split("?")
                let urlArray = ''
                if(urlArrayF[1]) {
                  urlArray = urlArrayF[1].split("&")
                }

                this.isJumpForm = isForm;
                this.isJumpView = isView;
                let type = '';
                let isExternalLink = false;
                
                if(isForm) {
                  type = '00';
                }else if(isView) {
                  type = "01"
                }else if (!isForm && !isView && !isOpenCurrentSoftwareData) {
                  isExternalLink = true;
                  this.isExternalLink = true; //判断是否是外部链接
                }
                let params = {
                  linkType: type,
                  appId: this.openParams.appId,
                  actionContent: '',
                  name: act.name,
                  _select: '',
                  viewId: "",
                };
                if(_op.isOpenNewWindow == 'true') {
                  params.isCurrentPageOpen = true;
                }
                let obj = {};
                if(urlArray && urlArray.length > 0) {
                  for(let i=0; i<urlArray.length; i++) {
                    let val = urlArray[i].split("=");
                    obj[val[0]] = val[1];
                  }
                }
                switch(act.jumpActOpenType) {
                  case 0: //当前页打开
                    if(!isExternalLink) {
                      if(isOpenCurrentSoftwareData) { //如果外链形式还是打开产品的控件，那么不用iframe的方法嵌套
                        if(_op.exparams) {
                          obj.exparams = _op.exparams
                        }

                        obj.name = act.name
                        obj.isCurrentPageOpen = true
                        // this.$emit("openNewpage",obj)
                        this.openNewpage(obj)

                      }else {
                        params = {
                          linkType: type,
                          appId: this.openParams.appId,
                          actionContent: obj.viewId?obj.viewId:obj.formId,
                          name: act.name,
                          _select: obj.docid?obj.docid:'',
                          viewId: "",
                          clearTemp: obj.clearTemp?obj.clearTemp:'',
                          isCurrentPageOpen:true,
                        };
                        if(urlParams) {
                          params.urlParams = urlParams
                        }
                        // this.$emit("openNewpage",params)
                        this.openNewpage(obj)
                      }
                    }else {
                      params = {
                        linkType: '103',
                        appId: this.openParams.appId,
                        actionContent: url,
                      };
                      this.$emit("openNewpage",params);
                      this.runAfterAction(act.id, act.type, '', '', act);
                    }
                    break;
                  case 1: //弹出窗打开
                    if(!isExternalLink) {
                      if(isOpenCurrentSoftwareData) {
                        let formParams = '';
                        for(let key in obj) {
                          if(
                            key != 'name' &&
                            key != 'actionContent' &&
                            key != 'searchData' && 
                            key != 'showtype' && 
                            key != 'realformId' && 
                            key != 'templateForm' && 
                            key != 'urlParams' && 
                            key != 'exparams' &&
                            key != 'runAfterParams' &&
                            key != 'queryString' &&
                            key != 'isOpenDialog'
                            ) {
                            if(obj[key]) {
                              formParams += "&" + key + '=' + obj[key];
                            }
                          }
                        }
                        if(_op.exparams) {
                          if(formParams) {
                            formParams = formParams + "" + _op.exparams
                          }else {
                            formParams = _op.exparams
                          }
                        }
                        if(formParams) {
                          obj.formParams = formParams
                        }
                        obj.name = act.name
                        obj.isPopupLayerDisplay = true
                        if(obj.linkType == '00') { //表单
                          this.isJumpForm = true
                        }else if(obj.linkType == '01'){ //视图
                          this.isJumpView = true
                          this.popupLayerType ='VIEW'
                        }
                        if(obj.isRefresh && obj.isRefresh=='true') {
                          this.isDialogOpenExternalLink = true
                        }
                        this.jumpParams = obj
                      }else {
                        params = {
                          linkType: type,
                          appId: this.openParams.appId,
                          actionContent: obj.viewId?obj.viewId:obj.formId,
                          name: act.name,
                          _select: obj.docid?obj.docid:'',
                          viewId: "",
                          clearTemp: obj.clearTemp?obj.clearTemp:'',
                          isPopupLayerDisplay: true, //弹出层打开
                        };
                        if(urlParams) {
                          params.urlParams = urlParams;
                        }
                        this.jumpParams = params;
                        this.popupLayerType = "VIEW";
                      }
                      this.jumpPopup = true;
                      
                    }else {
                      params = {
                        linkType: '103',
                        appId: this.openParams.appId,
                        actionContent: url,
                        name: act.name,
                        _select: obj.docid?obj.docid:'',
                        viewId: '',
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                      };
                      if(obj.isRefresh && obj.isRefresh=='true') {
                        this.isDialogOpenExternalLink = true
                      }
                      this.jumpParams = params;
                      this.jumpPopup = true;
                      this.runAfterAction(act.id, act.type, '', '', act);
                    }
                    break;
                  case 2: //页签打开
                    if(!isExternalLink) {
                      if(isOpenCurrentSoftwareData) {
                        if(_op.exparams) {
                          obj.exparams = _op.exparams
                        }
                        obj.name = act.name
                        this.addTab(obj)
                      }else {
                        params = {
                          linkType: type,
                          appId: this.openParams.appId,
                          actionContent: obj.viewId?obj.viewId:obj.formId,
                          name: act.name,
                          _select: obj.docid?obj.docid:'',
                          viewId: "",
                          clearTemp: obj.clearTemp?obj.clearTemp:'',
                        };
                        if(urlParams) {
                          params.urlParams = urlParams;
                        }
                        // this.$emit("add-tab", params);
                        this.addTab(params)
                      }
                    }else {
                      params = {
                        linkType: '103',
                        appId: _op.appId,
                        actionContent: url,
                        name: act.name,
                        isExternalLink: true, //url是打开opener组件，判断是外链。
                        refreshId: _op.id,  //判断是否得刷新
                        randomRefreshId: new Date().getTime()
                      };
                      this.formTableUpdateId = params.randomRefreshId
                      this.$emit("add-tab", params);
                      this.runAfterAction(act.id, act.type, '', '', act);
                    }
                    break;
                  case 3: //新窗口打开
                    if(!isExternalLink) {
                      params = {
                        linkType: type,
                        appId: this.openParams.appId,
                        actionContent: obj.viewId?obj.viewId:obj.formId,
                        name: act.name,
                        _select: obj.docid?obj.docid:'',
                        viewId: "",
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                      };
                      if(urlParams) {
                        params.urlParams = urlParams;
                      }
                      if(isForm) {
                        let routeData = this.$router.resolve({
                          // name: "form_blank",
                          name: 'open',
                          query: params,
                        });
                        window.open(routeData.href, "_blank");
                      } else if(isView) {
                        let routeData = this.$router.resolve({
                          name: "view_blank",
                          query: params
                        });
                        window.open(routeData.href, '_blank');
                      } else if(isOpenCurrentSoftwareData) {
                        url += '&isOpenNewWindow=true'
                        window.open(url)
                      }
                    }else {
                      window.open(url, '_blank');
                      this.runAfterAction(act.id, act.type, '', '', act);
                    }
                    break;
                  case 4:
                    break;
                  default:
                    break;
                }
              }
            }
          }
        )
      }
    },

    //执行前脚本返回成功后，执行
    execute({actId, formData, act}) {
      if(act.actionSelection === 0) {
        let params = {
          docId: formData.docId,
          viewId: formData.viewId ? formData.viewId:'',
          formId: formData.formId,
          _templateForm: formData.templateForm ? formData.templateForm:'', 
          parentId: formData.parentId ? formData.parentId:'',
        };
        let obj = JSON.parse(JSON.stringify(formData));
        obj.document.exparams = {};
        delete obj.subDocuments;
        delete obj.versions;
        delete obj.sign;
        let appId = this.openParams.appId; 
        API.executeCustom(
          appId,
          actId, 
          obj, 
          params,
          {
            onSucess: res => {
              let errcode = res.data.errcode;
              if(errcode == 0) {
                let errmsg = act.name + this.$t('success');
                this.promptBox(errcode, errmsg);
                let obj = {
                  docId: '',
                  appId: this.openParams.appId,
                  viewId: act.parentForm, 
                  opentarget: '',
                  containTitle: this.formdata.formTemplate.formName,
                  field:'',
                  isRelate: undefined,
                  parentId:'',
                };
                this.$api.getAxecuteAddress(
                  this.openParams.appId,
                  act.id,
                  obj,
                  {
                    onSucess: res => {
                      if(res.data.errcode === 0) {
                        let resData = res.data.data;
                        if(resData && resData.type == 16) {
                          let isOpenCurrentSoftwareData = resData.content.search("open?") != -1
                          if(isOpenCurrentSoftwareData) {
                            let urlArrayF = resData.content.split("?")
                            let urlArray = ''
                            if(urlArrayF[1]) {
                              urlArray = urlArrayF[1].split("&")
                            }
                            let obj = {};
                            if(urlArray && urlArray.length > 0) {
                              for(let i=0; i<urlArray.length; i++) {
                                let val = urlArray[i].split("=");
                                obj[val[0]] = val[1];
                              }
                            }
                            obj.name = act.name
                            this.$emit("add-tab", obj)
                          }else {
                            let params = {
                              linkType: '103',
                              appId: this.openParams.appId,
                              actionContent: resData.content,
                              name: act.name,
                              _select: '',
                              viewId: '',
                            };
                            this.$emit("add-tab", params)
                          }
                        }
                        this.runAfterAction(actId, act.type, '', '', act)
                      }
                    }
                  }
                )
              }else {
                let errmsg = response.data.errmsg
                this.promptBox(errcode, errmsg)
              }
            }
          }
        )
      }else if(act.actionSelection === 1) {
        let obj = {
          appId: this.openParams.appId,
          actionContent: this.openParams.actionContent,
          _select: '',
          relatedFormId: act.relatedFormId,
          opentarget: "detail"
        }
        this.newOpenParams = obj;
        this.customMessagePopup = true;
      }
      
      // API.executeCustom(
      //   appId, 
      //   divId, 
      //   formData,
      //   {
      //     onSucess: response => {
      //       let errcode = response.data.errcode;
      //       if(errcode == 0) {
      //         if(act.actionSelection == 0) {
      //           let obj = {
      //             docId: '',
      //             appId: this.openParams.appId,
      //             viewId: act.parentForm, 
      //             opentarget: '',
      //             containTitle: this.formdata.formTemplate.formName,
      //             field:'',
      //             isRelate: undefined,
      //             parentId:'',
      //           };
      //           this.$api.getAxecuteAddress(
      //             this.openParams.appId,
      //             act.id,
      //             obj,
      //             {
      //               onSucess: res => {
      //                 if(res.data.errcode === 0) {
      //                   let resData = res.data.data;
      //                   if(resData.type == 16) {
      //                     let params = {
      //                       linkType: '103',
      //                       appId: this.openParams.appId,
      //                       actionContent: resData.content,
      //                       name: act.name,
      //                       _select: '',
      //                       viewId: '',
      //                     };
      //                     this.$emit("add-tab", params);
      //                   }
                        
      //                 }
      //               }
      //             }
      //           )
      //         }else {
      //           let errmsg = "成功！";
      //           this.promptBox(errcode, errmsg);
      //         }
      //       }else {
      //         let errmsg = response.data.errmsg
      //         this.promptBox(errcode, errmsg);
      //       } 
      //     }
      //   }
      // )

      // if(act.actionSelection === 0) {
      // }else if(act.actionSelection === 1) {
      //   let obj = {
      //     appId: this.openParams.appId,
      //     actionContent: this.openParams.actionContent,
      //     _select: '',
      //     relatedFormId: act.relatedFormId,
      //     opentarget: "detail"
      //   }
      //   this.newOpenParams = obj;
      //   this.customMessagePopup = true;
      // }else {
        
      // }
      
    },

    //返回成功或失败时的提示框
    promptBox(errcode, errmsg, title){
      let that = this;
      var p = new Promise(function(resolve){
        if(errcode == 4001) {
          that.$notify({
            title: title,
            message: '',
            type: 'warning'
          });

        }else if(errcode == 0) {
          that.$notify({
            title: errmsg,
            message: '',
            type: 'success'
          });
          resolve('成功');
        } 
      });
      return p; 
    },

    buildFormData() {
      let items = {};
      // 判断如果没有值就不执行
      if(this.formdata.fields){
        const loopOpe = fields => {
          for (let i = 0; i < fields.length; i++) {
            let fld = fields[i];
			if(fld.formField == 'AttachmentUploadField') {
              let attachmentUploadVale = fld.value;
              attachmentUploadVale.forEach(item => {
                item.isEdit = false;
              })
            }
            if (
              fld.name &&
              fld.value != undefined &&
              fld.formField != "ButtonField" && 
              fld.displayType != undefined
            ) {
              if(fld.textType =="hidden" && fld.value ) {
                items[fld.name] = fld.value;
              }else if(fld.textType !="hidden"){
                items[fld.name] = fld.value;
              }
              if(fld.textType =="hidden" && !fld.value) {
                if(fld.isUpdatedValue) { //这里针对视图选择框 隐藏并且没值时，但有选过值，也要把这个属性传到后台
                  items[fld.name] = '';
                }
              }
            }
            if(fld.addInTtems) {
              items[fld.name] = fld.value;
            }
            if(fld.tabs && fld.tabs.length>0) {
              fld.tabs.forEach(tab => {
                if(tab.fields) {
                  loopOpe(tab.fields);
                }
              })
            }
          }
        };
        loopOpe(this.formdata.fields)
      }
      return {
        applicationId: this.openParams.appId,
        formId: this.formdata.formId,
        id: this.formdata.docId,
        items: items,
        parentId: "",
        sign: "",
        subDocuments: [],
        versions: "0"
      };
    },

    showSendMailOrSmsFlowpanel(act){
      this.isBlockClick = false
      this.flowProcessAct = act;
      this.sendMailVisible = true;
    },

    flowHandle(act) {
      if(this.flowDialogVisible) {
        this.flowDialogVisible = false;
        return;
      }
      if(act.type == 5) {
        this.flowProcessAct = act;
        this.flowDialogVisible = true;
      }else if(
        act.type == 47 || //回退流程
        act.type == 33 || //流程启动
        act.type == 48 || //流程催办
        act.type == 55 || //点评
        act.type == 56 || //补签
        act.type == 57 || //加签主办
        act.type == 58    //加签主办
        ) { 
        if(act) {
          this.flowProcessAct = act;
        }
        this.flowDialogVisible = true;
        if(act.type == 56 || act.type == 55 || act.type == 33) { //补签和点评和流程启动
          this.isShowHandSign = false
          this.isShowKeyboard = false
        }
        if(act.type == 47) {
          act.flowType = '81'
        }
      }else if(act.type == 37) { //发送邮件或者短信
        this.flowProcessAct = act;
        this.sendMailVisible = true;
      }else if (act.type == 52 ) {//终止流程
        if(act) {
          this.flowProcessAct = act;
        }
        if(act.workFlowType == 1) { //自由流程
          this.flowDialogVisible = true;
        }else {
          this.terminationVisible = true;
        }
      }else if( act.type == 53 ) {//编辑流程审批人
        if(act) {
          this.flowProcessAct = act;
        }
        this.allowEditApprover = true;
        this.approverVisible = true;
      }

    },

    //提交成功或者失败后关闭流程提交面板或者流程退回面板
    closeThePopup(status, isClose) {
      if(isClose) {
        this.flowDialogVisible = false; //流程提交面板
        this.goBack();
      }else if(status == "SUCCESS" && !isClose) {
        let _op = this.openParams;
        let isFlowPanel = true;
        if(_op.isOpenNewWindow == 'true') { //新窗口打开，延迟一下显示提示再关闭
          setTimeout(() => {
            this.flowDialogVisible = false; //流程提交面板
            this.goBack('','',isFlowPanel);
          }, 800);
        }else {
          this.flowDialogVisible = false; //流程提交面板
          this.isShowKeyboard = true;
          this.goBack('','',isFlowPanel);
        }
        
       
      }else if(status == "ERROR" && !isClose) {
        this.flowDialogVisible = false;
      }else {
        this.flowDialogVisible = false; //流程提交面板
        this.sendMailVisible = false;
        this.isShowHandSign = true;
        this.isShowKeyboard = true;
      }
    },

    //指定审批人时显示用户显示用户选择框
    designatedApprover(approversObj, flowId, isFreeFlow, saveApprover, approverNumType, isAppentCirculator) { 
      this.isAppentCirculator = isAppentCirculator; //是否知道流程抄送人
      this.approversObj = approversObj;
      this.flowId = flowId;
      this.isFreeFlow = isFreeFlow;  //判断是否是自由流程
      this.saveApproverStatus = saveApprover;
      this.approverNumType = approverNumType;
      this.approverVisible = true;
      this.isSubFlow = false;
    },

    // 加签主办或者加签协办有数据，显示在用户选择框
    getProcessHosting(list){
      this.processHostingList = list;
      this.approverVisible = true;
    },

    //指定审批人后显示在流程处理面板上
    selectApprover(approverName, submitTo, nextUserId, isAppentCirculator) {
      if(!isAppentCirculator) {
        this.approverName = approverName;
      }else {
        this.cCname = approverName;
      }
      
      this.nextUserId = nextUserId;
      this.submitTo = submitTo;
      this.approverVisible = false;
    },

    closeApproverDialog(isRefresh) {
      if(isRefresh) {
        //  
        // this.isRouterAlive= false;
        // this.$nextTick(() => (this.isRouterAlive= true));
        this.$parent.updateData();
      }
      this.approverVisible = false;
    },

    //回撤流程
    retracementWorkflow(actId,act) {
      let openParams = this.openParams;
      let appId = openParams.appId;
      let docId = openParams._select;
      this.$api.retracementWorkflow(appId, docId, {
        onSucess: response => {
          let errcode = '';
          let errmsg = '';
          if(response.data.data) {
            errcode = response.data.errcode;
            errmsg = response.data.data;
            this.runAfterAction(actId,'','','',act);
            this.$notify({
              title: this.$t('success'),
              message: errmsg,
              type: 'success'
            });
            this.initForm({
              appId: openParams.appId,
              formId: openParams.actionContent,
              docId: openParams._select,
            });
          }else {
            errcode = response.data.errcode;
            errmsg = response.data.errors[0].errmsg;
            if (errcode == 4001) {
              this.$notify({
                title: this.$t('msg.failure'),
                message: errmsg,
                position: 'top-left'
              });
              // this.promptBox(errcode, errmsg, response.data.errors[0].errmsg);
            } else if (errcode == 0) {
              // this.promptBox(errcode, errmsg);
              this.$notify({
                title: this.$t('success'),
                message: errmsg,
                type: 'success'
              });
              this.goBack();
            }
          }
        }
      })
    },

    //终止流程
    terminationWorkflow(act) {
      let errcode = '';
      let errmsg = '';
      if(act.data) {
        errcode = act.errcode;
        errmsg = act.data;
        this.promptBox(errcode, errmsg);
        this.goBack();
      }else {
        errcode = act.errcode;
        errmsg = act.errors[0].errmsg;
        if (errcode == 4001) {
          // this.promptBox(errcode, errmsg, act.errors[0].errmsg);
          this.$notify({
            title: this.$t('msg.failure'),
            message: errmsg,
            position: 'top-left'
          });
        } else if (errcode == 0) {
          // this.promptBox(errcode, errmsg);
          this.$notify({
            title: this.$t('success'),
            message: errmsg,
            type: 'success'
          });
          this.goBack();
        }
      }
    },

     //流程挂起
    suspendWorkflow(){
      let appId = this.openParams.appId;
      let docId = this.openParams._select;
      this.$api.suspendWorkflow(appId, docId, {
        onSucess: response => {
          let errcode = '';
          let errmsg = '';
          if(response.data.data) {
            errcode = response.data.errcode;
            errmsg = response.data.data;
            //this.promptBox(errcode, errmsg);
            this.$notify({
              title: this.$t('success'),
              message: errmsg,
              type: 'success'
            });
            this.goBack();
          }else {
            errcode = response.data.errcode;
            errmsg = response.data.errors[0].errmsg;
            if (errcode == 4001) {
              //this.promptBox(errcode, errmsg, response.data.errors[0].errmsg);
              this.$notify({
                title: this.$t('msg.failure'),
                message: errmsg,
                position: 'top-left'
              });
            } else if (errcode == 0) {
              //this.promptBox(errcode, errmsg);
              this.$notify({
                title: this.$t('success'),
                message: errmsg,
                type: 'success'
              });
              this.goBack();
            }
          }
        }
      })
    },

    //子流程-并行流程(用户选择框的弹窗)
    showSubFlowDialog(approversObj, flowId, isFreeFlow, saveApprover, approverNumType, isAppentCirculator, groupNum, subFlowGroup, isSubFlow) {
      this.approversObj = approversObj;
      this.flowId = flowId;
      this.isFreeFlow = isFreeFlow;  //判断是否是自由流程
      this.saveApproverStatus = saveApprover;
      this.approverNumType = approverNumType
      this.groupNum = groupNum; //子流程小组数量
      this.subFlowToApprover = subFlowGroup;
      this.isSubFlow = isSubFlow;
      this.approverVisible = true;
    },

    //子流程-并行流程(用户选择框的弹窗)组件选择的用户提交到流程面板
    subflowDataTopanel(name, subObj, currentGroup, groupNum) {
      this.approverName = name;
      this.subFlowApproverData = subObj;
      this.subFlowGroup = currentGroup;  //数据保存在流程面板中
      this.subFlowGroupNum = groupNum;
      this.approverVisible = false;
    },

    //流程恢复
    recoveryWorkflow() {
      let appId = this.openParams.appId;
      let docId = this.openParams._select;
      this.$api.recoveryWorkflow(appId, docId, {
        onSucess: response => {
          let errcode = '';
          let errmsg = '';
          if(response.data.data) {
            errcode = response.data.errcode;
            errmsg = response.data.data;
            this.$notify({
              title: errmsg,
              message: '',
              type: 'success'
            });
            this.goBack();
          }else {
            errcode = response.data.errcode;
            errmsg = response.data.errors[0].errmsg;
            if (errcode == 4001) {
              this.$notify({
                title: errmsg,
                message: '',
                position: 'top-left'
              });
            } else if (errcode == 0) {
              this.$notify({
                title: errmsg,
                message: '',
                type: 'success'
              });
              this.goBack();
            }
          }
        }
      })
    },

    //加签添加角色确定后(子组件调用)
    selectHostOrCohost(data, obj) {
      this.newHostOrCohostList = data;
      this.saveApproverStatus = obj;
      this.approverVisible = false;
    },

    //保存并启动流程
    saveStartWorkFlow(num, actId, act) {
      let appId = this.openParams.appId;
      let formData = {};
      formData.document = this.buildFormData()
      if(this.openParams.parentId) {
        formData.document.parentId = this.openParams.parentId;
      }
      this.$api.saveStartWorkFlow(appId, formData, {
        onSucess: response => {
          let errcode = '';
          let errmsg = '';
          if(response.data.data) {
            this.runAfterAction(actId, num, '', '', act);
            this.$notify({
              title: this.$t('success'),
              message: '',
              type: 'success'
            });
          }else {
            errcode = response.data.errcode;
            errmsg = response.data.errors[0].errmsg;  
            if (errcode == 4001) {
              this.$notify({
                title: errmsg,
                message: '',
                type: 'error'
              });
            } else if (errcode == 0) {
              this.runAfterAction(actId, num, '', '', act)
              this.$notify({
                title: errmsg,
                message: '',
                type: 'success'
              });
            }
          }
        }
      });
    },

    //邮件或短信通知，打开用户选择框
    openUserDialg(){
       
    }

  }
};
</script>
<style lang="scss">
@import '../assets/kinggrid/dialog/kgDialog/ui-dialog.css';
@import '../assets/kinggrid/core/kinggrid.plus.css';
@import '../assets/kinggrid/core/kinggrid.plus.mobile.css';
.myapps-iframe {
  overflow: auto;
}
.el-notification {//this.$notify换行样式
  white-space:pre-wrap !important; 
}
// .active{
//   display: none;
// }

// table {
//   width:100%;
// }
</style>
