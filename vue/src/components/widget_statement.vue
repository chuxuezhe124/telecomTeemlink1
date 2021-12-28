<template>
<!--首页的报表组件-->
  <div class="report-box" v-if="showReport" ref="report">
    <div 
      :style="{background:report.reportData.titleBarColor}"
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="report.reportData.icon && report.reportData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+report.reportData.icon.icon" alt="">
        </span>
    
        <i v-if="report.reportData.icon && report.reportData.icon.icontype == 'font'" :class="report.reportData.icon.icon" :style="{color:report.reportData.icon.iconFontColor}"></i>
        <span :style="{color:report.reportData.titleColor,background:report.reportData.titleBColor}">{{report.reportData.name}}</span>
      </div>
      <div class="btn">
        <div class="btn-icon">
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
          <!-- <i class="el-icon-d-caret" v-show="conceal"></i> -->
          <!-- <i class="el-icon-close" v-show="conceal" @click="dele"></i> -->
        </div>
      </div>
    </div>
    <div class="report-content">
      <el-scrollbar class="scrollbar" v-if="currentUrl" v-loading="loading">
        <iframe
          ref="mainFrame"
          style="border:none"
          width="100%"
          height="479"
          scrolling="no"
          frameborder="0"
          allowtransparency="true" 
          noresize="noresize"
          :src="currentUrl"
        ></iframe>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>

import Constant from "@/Constant.js";
export default {
  inject: ["reload"],
  props: ["report"],
  data() {
    return{
      Constant,
      conceal: false,
      currentUrl:'',
      showReport: true,
      loading: true,
      contextPath:'',
    }
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    let params = {}
    this.$api.getCustomreports(
      this.report.reportData.actionContent,
      {},
      {
        onSucess: response => {
          let urls = response.data;
          this.currentUrl = obpmConfig.obpmFilePath + urls;
          this.loading = false;
          // if(urls.split("=")[2]) {
          //   let arr = urls.split("=")[2];
          //   if(arr.split(";")[0]) {
          //     let arr2 = arr.split(";")[0];
          //     if(arr2.split("'")[1]) {
          //       this.currentUrl = arr2.split("'")[1];
          //       this.loading = false;
          //     }
          //   }
          // }
        }
      }
    );
  },
  methods: {
    dele(){
      this.showReport = false;
    },
    Partialrefresh() {
      let param = {}
      this.$api.getCustomreports(
        this.report.reportData.actionContent,
        param,
        {
          
          onSucess: response => {
            this.loading = true;
            let urls = response.data;
            this.currentUrl = obpmConfig.obpmFilePath + urls;
            setTimeout(()=>{
              this.loading = false;
            },300)
          }
        }
      );

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
      // this.reload();

      


    },
    toggleShow(){
      this.isShow = !this.isShow
    }
  }
};
</script>
<style lang="scss" scoped>

</style>


