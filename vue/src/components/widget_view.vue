<template>
  <!--首页的报表组件-->
  <div class="widget-view-box" v-if="showView" ref="report">
    <div
      :style="{background:view.viewData.titleBarColor}" 
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="view.viewData.icon && view.viewData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+view.viewData.icon.icon" alt="">
        </span>
        <i v-if="view.viewData.icon && view.viewData.icon.icontype == 'font'" :class="view.viewData.icon.icon" :style="{color:view.viewData.icon.iconFontColor}"></i>
        <span :style="{color:view.viewData.titleColor,background:view.viewData.titleBColor}">{{view.viewData.name}}</span>
      </div>
      <div class="btn">
        <div class="btn-icon">
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
          <!-- <i class="el-icon-d-caret" v-show="conceal"></i> -->
          <!-- <i class="el-icon-close" v-show="conceal" @click="dele"></i> -->
        </div>
      </div>
    </div>
    <div class="widget-view-content">
      <el-scrollbar class="view-scrollbar">
        <view_delegate
          :openParams="{
            appId: view.viewData.applicationId, 
            actionContent: view.viewData.actionContent, 
          }"
          v-bind="$attrs"
          v-on="$listeners"
          :showtype = "'home'"
          ref="refreshWidgetView"
          @totalCount="getTableTotalCount"
        >
        </view_delegate>
      </el-scrollbar>
    </div>
    <div class="view-btn" v-if="showMoreBtn">
      <span class="btn-more" @click="getMore">
        {{$t('more')}}
      </span>
    </div>
  </div>
</template>
<script>
import view_delegate from "@/components/view_delegate.vue";
import Constant from "@/Constant.js";
export default {
  inject: ["reload"],
  name: "widget-view",
  props: ["view"],
  components: {
    view_delegate,
  },
  data() {
    return{
      Constant,
      conceal: false,
      showView: true,
      totalCount: 0, // view_delegate的总条数
      viewType: '', //视图类型,日历或者普通视图
      contextPath:'',
    }
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    // this.getTemplate();
  },
  methods: {
    dele(){
      this.showView = false;
    },
    getMore() {
      let viewData = this.view.viewData;
      this.$api.hasPermissionToView(viewData.applicationId, viewData.actionContent, {
        onSucess: res => {
          if(res.data.data) {
            let params = {
              appId: viewData.applicationId,
              actionContent: viewData.actionContent,
              name: viewData.name,
              linkType: '01',
            };
            this.$emit("event", 'view', params);
          }else {
            this.$message({
              message: this.$t('msg.refuse'),
              type: 'warning'
            });
          }
        }
      });
    },

    //流程处理的局部刷新
    Partialrefresh() {
      // this.$emit('refreshWidgetView',this.view.viewData)
       let appId = this.view.viewData.applicationId;
       let viewId = this.view.viewData.actionContent;
      console.log('refreshWidgetView',this.$refs.refreshWidgetView)
      this.$refs.refreshWidgetView.initView({
        appId: appId,
        viewId: viewId,
        data: {}
      })
      // yx 请求刷新视图的数据
      this.$refs.refreshWidgetView.$refs.delegate.reloadListView()
      this.$forceUpdate()
    },
    CardShow() {
      this.conceal = true;
    },
    CardNone() {
      this.conceal = false;
    },
    Report(){
        this.Reporttohide = !this.Reporttohide;
        this.picture = false;
    },
    //刷新功能
    renovation(){
      this.reload();
    },
    toggleShow(){
      this.isShow = !this.isShow
    },

    /**
     * 获取view_delegate的总条数
     */
    getTableTotalCount(val, type){
      this.totalCount = val
      this.viewType = type;
      
    }
  },
  computed:{
    // 显示查看更多按钮
    showMoreBtn(){
      let type = this.viewType;
      if(type && type == 'listView'){
        let flag = false
        if(this.totalCount >= 5){
          flag = true
        }
        return flag
      }else if(type && type == 'calendarview') {
        return true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>

</style>



