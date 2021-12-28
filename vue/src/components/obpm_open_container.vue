<template>
  <div class="myapps-iframe" id="myapps-iframe" ref="myappsIframe">
    <div class="myapps-iframe-box">
      <component
        ref="obpmContainer"
        v-bind="$attrs"
        v-on="$listeners"
        :is="contentType()"  
        v-if="hackReset" 
        :openParams="params"
        :originalFormDocid="originalFormDocid" 
        @openNewpage = "doAction"
      />
    </div>
  </div>
</template>

<script>
import view_delegate from "@/components/view_delegate.vue"
import form_normalform from "@/components/form_normalform.vue"
import profile from "@/components/profile.vue"
import information from "@/components/information.vue"
import main_management from "@/components/main_management.vue"
import main_pending from "@/components/main_pending.vue"
import main_processing from "@/components/main_processing.vue"
import main_read from "@/components/main_read.vue"
import main_unread from "@/components/main_unread.vue"
import authority from "@/components/authority.vue"
import main_launch from "@/components/main_launch.vue"
import main_meter from "@/components/main_meter"
import report from "@/components/report"
import chart from "@/components/chart"
import common_linkcontent from "@/components/common_linkcontent"
import menu_custom_linktype from "@/components/menu_custom_linktype"
import main_other_software from "@/components/main_other_software"
import FlowCenter from "@/views/FlowCenter"
//import { constants } from 'crypto';

export default {
  name: "obpm-open-container",
  props: ["openParams"],
  components: {
    view_delegate,
    form_normalform,
    profile,
    information,
    main_management,
    main_pending,
    main_processing,
    main_read,
    main_unread,
    authority,
    main_launch,
    main_meter,
    report,
    chart,
    common_linkcontent,
    menu_custom_linktype,
    main_other_software,
    FlowCenter,
  },

  provide() {
    return {
      refreshForm: this.refreshForm,
      setListViewDocIds: this.setListViewDocIds,
      openNewpage: this.doAction
    }
  },
  
  created() {
    let op = this.openParams;
    this.doAction(op, true);
  },

  data: function() {
    return {
      params: null,
      paramsHistory: [],
      hackReset:true,
      originalFormDocid:'',
    };
  },

  methods: {
    setListViewDocIds(){
      
    },

    refreshForm() {
      this.hackReset = false
      this.$nextTick(() => {
        this.hackReset = true
      })
    },

    updateData(linkType, showType) {
      if(linkType === '01') { //视图
        this.$refs.obpmContainer.hiddenCustomizeVisible(); //当是视图打开的某个标签关闭后，统过调用此方法重新加载视图数据
      }else {
        if((linkType === '00' && showType == 'include') || linkType === '02') {
          this.$refs.obpmContainer.hiddenCustomizeVisible();
        }else {
          this.reloading();
        }
      }
    },
    
    //重建时加载
    reloading(docId) {
      this.originalFormDocid = docId;
      this.hackReset = false
      this.$nextTick(() => {
        this.hackReset = true
      })
    },
    
    contentType() {
      // this.params = openParams;
      let compName;
      switch (this.params.linkType) {
        case "00":
          //表单
          compName = "form_normalform";
          break;
        case "01":
          //列表视图
          compName = "view_delegate";
          break;
        case "02":
          //图表
          compName = "chart";
          break;
        case "03":
          //信息管理
          compName = "information";
          break;
        case "04":
          //系统设置
          compName = "main_management";
          break;
        case "05":
          compName = "menu_custom_linktype";
          break;
        case "06":
          compName = "menu_custom_linktype";
          break;
        case "07":
          //自定义脚本链接
          compName = "menu_custom_linktype";
          break;
        case "08":
          //仪表分析
          compName = "main_meter";
          break;
        case "09":
          //报表
          compName = "report";
          break;
        case "10":
          //待阅
          compName = "main_unread";
          break;
        case "11":
          //已阅
          compName = "main_read";
          break;
        case "100":
          //权限页面
          compName = "authority";
          break;
        case "102":
          //个人设置
          compName = "profile";
          break;
        case "103":
          //iframe嵌套
          compName = "common_linkcontent";
          break;
        case "104":
          //发起新建
          compName = "main_launch";
          break;
        case "105":
          //我的待办
          compName = "main_pending";
          break;
        case "106":
          //经办跟踪
          compName = "main_processing";
          break;
        case "107":
          //流程中心
          compName = "FlowCenter";
          break;
        case "km":
          compName = "main_other_software";
          break;
        case "qm":
          compName = "main_other_software";
          break;
        default:
          break;
      }
      return compName;
    },

    doAction(params, isTabOpen) {
      let obj = params;
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
      if(formParams) {
        params.formParams = formParams
      }
      this.paramsHistory.push(params);
      this.params = params;
      if(params.isCurrentPageOpen) { //当是按钮为当前页打开时重新刷新页面加载数据，是视图按钮，或者表单按钮
        this.hackReset = false
        this.$nextTick(() => {
          this.hackReset = true
        })
      }
    },

    doBack() {
      if (this.paramsHistory.length > 0) {
        this.paramsHistory.pop();
      }
      if (this.paramsHistory.length > 0) {
        this.params = this.paramsHistory[this.paramsHistory.length - 1];
      }else {
        this.$parent.onCloseBtnClick(this.params);
      }
    }
  }
};
</script>
