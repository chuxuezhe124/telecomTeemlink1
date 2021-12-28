<template>
  <!--首页流程处理的组件-->
  <div class="widget-iscript" v-if="showSummary">
      <div
        :style="{background:iscript.wgtData.titleBarColor}" 
        class="clearfix" 
        @mouseenter="CardShow"
        @mouseleave="CardNone"
      >
        <div class="flow-title">
          <span class="img" v-if="iscript.wgtData.icon && iscript.wgtData.icon.icontype == 'img'">
            <img :src="contextPath +'/'+ iscript.wgtData.icon.icon" alt="">
          </span>

          <i v-if="iscript.wgtData.icon && iscript.wgtData.icon.icontype == 'font'" :class="iscript.wgtData.icon.icon" :style="{color:iscript.wgtData.icon.iconFontColor}"></i>
          <span :style="{color:iscript.wgtData.titleColor,background:iscript.wgtData.titleBColor}">{{iscript.wgtData.name}}</span>
        </div>
        <div class="btn">
          <div>
            <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
          </div>
        </div>
      </div> 
      <div class="iscript-content" v-loading="loading">
        <div class="iscript-list" v-for="(item, index) in htmlA" :key="index">
          <!-- <a v-html="item.summary"></a> -->
          <a v-html="setSubjectFormat(item.summary)" @click="jumpToForm(item)"></a>
        </div>
      </div>
      <div class="view-btn" v-if="showMoreBtn">
        <span class="btn-more" @click="getMore">
          {{$t('more')}}
        </span>
      </div>
  </div>
</template>

<script>
import Constant from "@/Constant.js";
//import API from "@/api.js";
export default {
  name: "widget-iscript",
  props: ["iscript"],
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.$api.getWidgetsIscript(this.iscript.id,
      {
        onSucess: response => {
          let list = response.data.data.data;
          if(list && list.length > 5) {
            list.length = 5;
            this.showMoreBtn = true;
          }
          this.htmlA = list;//[0].summary;
        }
      }
    );
    this.loading = false;
  },
  data: function() {
    return {
      Constant,
      htmlA:'',
      conceal: false,
      showSummary: true,
      loading: true,
      showMoreBtn: false,
      contextPath:'',
    };
  },
  methods: {
    getMore() {
      let params = {
        appId: this.iscript.wgtData.applicationId,
        actionContent: this.iscript.wgtData.actionContent,
        name: this.$t('p_center'),
        linkType: '107',
      };
      let isMore = true;
      this.$emit("event",'summary',params,isMore);
    },
    jumpToForm(item) {
      let params = {};
      if(item.formId) {
        params = {
          appId: item.appId,
          linkType:'00',
          actionContent:item.formId,
          _select: item.docId,
          name: item.formName,
          homeWidgetType: 'summary', //判断是否是widget，还没用上
          id:item.docId,
          refreshId:item.docId,
        };
        this.$emit("event",'summary',params);
      }
      // item.homeWidgetType = 'summary'; 
      // this.$emit("event",'summary',item);
    },
    dele(){
      this.showSummary = false;
    },
    setSubjectFormat(str) {
      if (str && typeof str == 'string') {
        try {
          let obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return obj.summaryText;
          } else {
            return str;
          }
        } catch (e) {
          return str;
        } 
      }
    },

    CardShow() {
      this.conceal = true;
    },
    CardNone() {
      this.conceal = false;
    },
    //流程处理的局部刷新
    Partialrefresh() {
      // this.reload();
      this.loading = true;
      this.$api.getWidgetsIscript(this.iscript.id,
        {
          onSucess: response => {
            this.htmlA = response.data.data.data;//[0].summary;
            let timeLoading =
              setTimeout(()=>{
                this.loading = false;
              },300)     
           }
        }
      );
      // clearTimeout(timeLoading);
    },
  },
  
};
</script>
