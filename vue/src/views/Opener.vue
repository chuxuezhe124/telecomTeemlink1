<template>
  <div class="myapps-iframe" style="width:100%;background:#fff;">
    <component
      :key="$route.query.actionContent"
      :is="contentType()"  
      :openParams="params" 
      @onAction="doAction"/>
  </div>
</template>
<script>
import view_delegate from "@/components/view_delegate.vue"
import form_normalform from "@/components/form_normalform.vue"
import report from "@/components/report"
import main_pending from "@/components/main_pending.vue"
import main_processing from "@/components/main_processing.vue"
import main_read from "@/components/main_read.vue"
import main_unread from "@/components/main_unread.vue"
import main_launch from "@/components/main_launch.vue"
import chart from "@/components/chart"
import common_linkcontent from "@/components/common_linkcontent"
import menu_custom_linktype from "@/components/menu_custom_linktype"
import main_other_software from "@/components/main_other_software"
export default {
  name: "obpm-open-container",
  pros: [],
  cpmponents: {
    view_delegate,
    form_normalform,
    report,
    main_pending,
    main_processing,
    main_read,
    main_unread,
    main_launch,
    chart,
    common_linkcontent,
    menu_custom_linktype,
    main_other_software,
  },
  provide () {
    return {
      addTab: this.addTab,
      openNewpage: this.goAction
    }
  },
  watch: {
    '$route' () {   //监听路由是否变化
      this.setOpenParams()
    }
  },
  created(){
    this.setOpenParams()
  },
  data: function() {
    return {
      params: null,
      routeData: [],
    }
  },
  methods: {
    addTab(){},

    setOpenParams(){
      let queryData = this.$route.query
      let openParams = {
        linkType: queryData.linkType,
        appId: queryData.appId,
        actionContent: queryData.actionContent?queryData.actionContent:'',
        _select: queryData.docid ? queryData.docid : '',
        isExternalLink: true,
      };
      if(queryData._select) {
        openParams._select = queryData._select
      }

      if(queryData.realformId) {
        openParams.realformId = queryData.realformId
      }

      if(queryData.isOpenNewWindow) {
        openParams.isOpenNewWindow = queryData.isOpenNewWindow
      }

      if(queryData.isOpenDialog === 'true') {
        openParams.isOpenDialog = true
      }
      if(queryData.isWidgetLink === 'true') { //如果是widget外链打开表单，有计算脚本o-action
        openParams.isWidgetLink  = true
      }
      let formParams = '';
      let obj = queryData;
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
      if(obj.exparams) {
        if(formParams) {
          formParams = formParams + "" + obj.exparams;
        }else {
          formParams = obj.exparams;
        }
      }
      if(queryData.urlParams) {
        openParams.urlParams = queryData.urlParams
      }
      if(formParams) {
        openParams.formParams = formParams
      }
      this.doAction(openParams)
    },

    doAction(params, isBack) {
      if(isBack) {
        let _rd = this.routeData;
        _rd.pop();
        let _p = _rd[_rd.length-1]
        this.params = _p;
      }else {
        this.routeData.push(params);
        this.params = params;
      }
    },

    goAction(params) {
      this.$router.push({ name: "open", query: params });
    },

    contentType: function() {
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
        default:
          break;
      }
      return compName;
    },
  },
}
</script>
