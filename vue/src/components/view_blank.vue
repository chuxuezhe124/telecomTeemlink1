<template>
  <div class="view-print">
    <div class="print-wrap">
      <component 
        v-bind="$attrs"
        v-on="$listeners"
        :is="contentType()"  
        :openParams="params"
        :showtype="$route.query.opentarget" 
        :tableHeight="tableHeight"
        @openNewpage = "doAction"
      />
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
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

export default {
  props: [
  ],
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
    main_other_software
  },
  data: function() {
    return {
      params: null,
      view:'',
      tableHeight: document.documentElement.clientHeight - 55 - 40 - 20 - 20  // 55：按钮  40：页码 20：padding
    };
  },
  created() {
    this.doAction();
    //this.getviewData();
  },
  mounted(){
    
  },
  computed: {
  
  },
  methods: {
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

    doAction(params, isCreate) {
      if(isCreate) { //新窗口打开然后点击新建时
        this.params = params;
      }else {
        let openParams = {
          appId: this.$route.query.appId,
          actionContent: this.$route.query.actionContent,
          linkType: this.$route.query.linkType,
          isOpenNewWindow: true,
        };
        this.params = openParams;
      }
    },
    getviewData() {
      let appId = this.$root.appid;
      let obj = {
            appId,
            viewId: this.$route.query.actionContent,
            test: this.$route.query.paramValue,
            containTitle: this.$route.query.name,
          };
      if(this.$route.query.paramKey) {
        obj[this.$route.query.paramKey] = this.$route.query.paramValue;
      }

      //delegate带参数的
      this.$api.getBlankViewTemplate(appId, obj, {
        onSucess: response => {
          this.view = response.data.data;
        }
      })
    },
  }
}
</script>

<style lang="scss">
  .view-print {
    width: 100%;
    height: 100%;
    background: #ffffff;
    padding:10px 20px;
    box-sizing: border-box;
    .print-wrap {
      width:100%;
      height: 100%;
      .delegate {
        position: relative;
        width:100%;
        height:100%;
        .view-listview {
          width: 100%;
          height: calc(100% - 57px);
          .listview-container {
            //padding-top: 20px;
            padding:18px 18px 0 18px;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            overflow: hidden;
            .el-table th {
              padding: 8px 0;
              min-width: 0;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              text-overflow: ellipsis;
              vertical-align: middle;
              position: relative;
              text-align: center;
            }
            .el-table td, .el-table th {
              padding: 8px 0;
              min-width: 0;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              text-overflow: ellipsis;
              vertical-align: middle;
              position: relative;
              text-align: left;
            }
          }
          .listview-box {
            width:100%;
            height: calc(100% - 40px);
            overflow: hidden;
            .scrollbar {
              width: 100%;
              height: 100%;
              overflow-x: hidden;
            }
            
            .el-scrollbar__wrap {
              overflow-x: hidden;
            }
          }
          .page {
            width:100%;
            height: 40px;
            .page-con {
              width: 100%;
              height:100%;
              display: -webkit-flex;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
      
        }
      }
    }
  }
</style>
