<template>
  <div class="home-chart" v-if="showChart" :style="{height:chart.wgtData.height +'px'}">
    <div 
      :style="{background:chart.wgtData.titleBarColor}"
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title" >
        <span class="img" v-if="chart.wgtData.icon && chart.wgtData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+chart.wgtData.icon.icon" alt="">
        </span>
        <i v-if="chart.wgtData.icon && chart.wgtData.icon.icontype == 'font'" :class="chart.wgtData.icon.icon" :style="{color:chart.wgtData.icon.iconFontColor}"></i>
        <span :style="{color:chart.wgtData.titleColor, background:chart.wgtData.titleBColor}">{{chart.wgtData.name}}</span>
      </div>
      <div class="btn">
        <div class="btn-icon">
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
        </div>
      </div>
    </div>
    <div class="chart-wrap" v-if="isShowDelegate">
      <view_delegate 
        :openParams="openParams"
        :widgetChartView="view"
        :isWidgetChartView="true"
        @action="onAction"
        v-bind="$attrs"
        v-on="$listeners"
      >
      </view_delegate>
    </div>
    <div class="chart-wrap" v-else>
      <div id="myChart" ref="myChart"></div>
    </div>
  </div>
</template>
<script>
import "echarts/map/js/china.js";
import Constant from "@/Constant.js";
// //引入基本模板
// let echarts = require('echarts/lib/echarts')
// // 引入柱状图组件
// require('echarts/lib/chart/bar')
// // 引入提示框和title组件
// require('echarts/lib/component/tooltip')
// require('echarts/lib/component/title')
export default {
  inject: ["reload"],
  props: ["chart"],
  created(){
    this.contextPath = obpmConfig.obpmFilePath;
  },
  mounted() {
    this.getChart();
  },
  watch: {
    chartData() {
      this.drawLine();
    },
  },
  data() {
    return{
      Constant,
      chartData:'',
      conceal: false,
			myChart:'',
      showChart:true,
      view:'',
      isShowDelegate:false,
      openParams:{},
      contextPath:'',
    }
  },
  methods: {
    onAction(params){
      this.$emit("event", 'chart', params);
    },
		dele(){
			this.showChart = false
		},
    //流程处理的局部刷新
    Partialrefresh() {
      this.chartData.series.data = [];
      this.myChart.clear();
      this.$api.getChart(this.chart.wgtData.actionContent, {
        onSucess: response => { 
          this.chartData = JSON.parse(response.data.data.result);
        }
      })
    },
    CardShow() {
      this.conceal = true;
    },
    CardNone() {
      this.conceal = false;
    },
    getChart() {
      this.$api.getChart(this.chart.wgtData.actionContent, {
        onSucess: response => { 
          this.chartData = JSON.parse(response.data.data.result);
          this.view = response.data.data.view;
        }
      })
    },
    drawLine(){
      let that = this;
      this.myChart = this.$echarts.init(this.$refs.myChart);
      this.myChart.setOption(this.chartData);
      this.myChart.on('click', function (param){
        if(that.view && that.view.id) {
          let obj = {};
          obj.appId = that.$root.appid;
          obj.actionContent = that.view.id;
          that.openParams = obj;
          that.isShowDelegate = true;
        }       	
      });
    }
  }
};
</script>
<style lang="scss">

</style>