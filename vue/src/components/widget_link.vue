<template>
  <!--首页的报表组件-->
  <div class="link-box" v-if="showLink" ref="report" :style="{height:link.wgtData.height +'px'}">
    <div 
      :style="{background:link.wgtData.titleBarColor}"
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="link.wgtData.icon && link.wgtData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+link.wgtData.icon.icon" alt="">
        </span>
        <i v-if="link.wgtData.icon && link.wgtData.icon.icontype == 'font'" :class="link.wgtData.icon.icon" :style="{color:link.wgtData.icon.iconFontColor}"></i>
        <span :style="{color:link.wgtData.titleColor,background:link.wgtData.titleBColor}">{{link.wgtData.name}}</span>
      </div>
      <div class="btn">
        <div class="btn-icon">
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
          <!-- <i class="el-icon-d-caret" v-show="conceal"></i> -->
          <!-- <i class="el-icon-close" v-show="conceal" @click="dele"></i> -->
        </div>
      </div>
    </div>
    <div class="link-content">
      <el-scrollbar class="scrollbar" v-if="pagePath">
        <iframe
          ref="mainFrame"
          style="border:none"
          width="100%"
          :height="link.wgtData.height"
          scrolling="no"
          frameborder="0"
          allowtransparency="true" 
          noresize="noresize"
          :src="pagePath"
        ></iframe>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>

export default {
  inject: ["reload", "addTab"],
  props: ["link"],
  data() {
    return{
      conceal: false,
      showLink: true,
      pagePath:'',
    }
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.$api.getWidgetsIscript(this.link.id,
      {
        onSucess: res => {
          let url = res.data.data
          if(url.search("open?") != -1) {
            url += '&isWidgetLink=true'
          }
          this.pagePath = url//res.data.data;
        }
      }
    );
  },
  mounted(){
    // window.addEventListener('message', this.handleMessage)
    window.handleOpenTab = this.handleOpenTab
  },
  methods: {
    handleOpenTab(params){
      this.addTab(params)
    },
    dele(){
      this.showLink = false;
    },
    Partialrefresh() {

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
    }
  }
};
</script>
<style lang="scss" scoped>

</style>


