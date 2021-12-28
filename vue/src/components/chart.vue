<template>
  <div class="main-chart" ref="viewChartDelegate">
    <div class="nav-btn">
      <div>
      </div>
      <div>
        <span v-if="isShowBtn" @click="openSearchTemplate">
          <i class="el-icon-search"></i>
        </span>
      </div>
    </div> 
    <div class="search-box" v-show="isOpenTemplate" ref="chartSearchBox">
      <form_searchform
        :appId="openParams.appId"
        :viewId="openParams.actionContent"
        :chartType="chartType"
        @event="showBtn"
        ref="reportSearchform"
        @onSearch="handleSearch"
      /> 
    </div>
    <div class="chart-wrap" v-if="isShowDelegate">
      <view_delegate 
        :openParams="openViewParams"
        :widgetChartView="view"
        :isWidgetChartView="true"
        @action="onAction"
        v-bind="$attrs"
        v-on="$listeners"
        ref="chart"
      >
      </view_delegate>
    </div>
    <div class="chart-wrap"  v-else>
      <el-scrollbar class="scrollbar" :style="{height:chartHeight?chartHeight + 'px':''}">
        <div id="myChart" ref="myChart" style="width:100%; height:650px"></div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import form_searchform from "@/components/form_searchform.vue";
export default {
  name: "chart",
  props: ['openParams'],
  components: {
    form_searchform,
  },
  watch: {
    chartData() {
      this.drawLine();
    },
  },
  created() {
    
  },
  mounted() {
    this.getChart();
  },

  data() {
    return{
      chartData:'',
      view:'',
      isShowDelegate:false,
      openViewParams:{},
      isShowBtn: false,
      isOpenTemplate: false,
      chartType:'chart',
      chartHeight:0,
    }
  },
  methods: {
    hiddenCustomizeVisible() { //该方法实现视图修改数据，或者删除数据重新加载视图数据
      if(this.view.simpleClassName == 'GanttView') { //当是甘特视图直接刷新整个页面
        // this.updateView();
        this.$refs.delegate.reloadListView();
      }else {
        setTimeout(() => {
          this.customizeVisible = false;
          this.$refs.chart.$refs.delegate.reloadListView();
        },1000)
      }
    },
    handleSearch(data, searchData){
      this.$api.getChartData(
        this.openParams.actionContent,
        searchData,
        {
          onSucess: response => { 
            this.chartData = JSON.parse(response.data.data.result);
            this.view = response.data.data.view;
          }
        }
      )
    },
    showBtn(val){
      this.isShowBtn = val;
    },
    openSearchTemplate(){
      this.isOpenTemplate = !this.isOpenTemplate;
      this.$nextTick(()=>{
        this.chartHeight = this.$refs.viewChartDelegate.offsetHeight - this.$refs.chartSearchBox.offsetHeight - 58;       
      })
      
    },
    onAction(params){
      this.$emit("add-tab", params);
    },
    getChart(){
      this.$api.getChart(
        this.openParams.actionContent,
        {
          onSucess: response => { 
            this.chartData = JSON.parse(response.data.data.result);
            this.view = response.data.data.view;
          }
        }
      )
    },
    drawLine(){
      let that = this;
      let myChart = this.$echarts.init(this.$refs.myChart);
      myChart.setOption(this.chartData);
      myChart.on('click', function (param){
        if(that.view && that.view.id) {
          let obj = {};
          obj.appId = that.$root.appid;
          obj.actionContent = that.view.id;
          obj.id = that.openParams.id;
          that.openViewParams = obj;
          that.isShowDelegate = true;
        }       	
      });
    },
  }
};
</script>
<style lang="scss" scoped>

</style>


