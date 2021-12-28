<template>
  <div class="widget-carousel" :style="{'height':wgtData.height?wgtData.height+'px':'','width':'100%'}">
    <div 
      style="width:100%;"
      :style="{background:wgtData.titleBarColor}"
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="wgtData.icon && wgtData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+wgtData.icon.icon" alt="">
        </span>
        <i v-if="wgtData.icon && wgtData.icon.icontype == 'font'" :class="wgtData.icon.icon" :style="{color:wgtData.icon.iconFontColor}"></i>
        <span :style="{color:wgtData.titleColor,background:wgtData.titleBColor}">{{wgtData.name}}</span>
      </div>
      <div class="btn">
        <div>
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
        </div>
      </div>
    </div>
    <div class="home-carousel">
      <el-carousel trigger="click" :height="carouselHeight" :interval="wgtData.frequency * 1000">
      <el-carousel-item v-for="item in wgtData.carouselImg" :key="item">
        <img :src="contextPath + item" class="carousel_img"/>
      </el-carousel-item>
    </el-carousel>
    </div>
  </div>
</template>

<script>
export default {
  name:'widget-carousel',
  props:["carousel"],
  inject: ["reload"],
  data () {
    return {
      contextPath: '',
      conceal: false,
      carouselHeight: '',
      wgtData: this.carousel.wgtData,
    }
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.carouselHeight = this.carousel.wgtData.height - 42 + "px";
    console.log("carousel",this.carousel)
  },
  methods: {
    CardShow() {
      this.conceal = true;
    },
    CardNone() {
      this.conceal = false;
    },
    //流程处理的局部刷新
    Partialrefresh() {
      this.reload();
    },
  },
}
</script>

<style lang='scss' scoped>
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    height: 100%;
    margin: 0;
  }
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>
