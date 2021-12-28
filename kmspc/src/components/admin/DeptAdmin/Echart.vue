<template>
  <div id="myChart" ref="myChart" style="width:100%; height:300px"></div>
</template>
<script>
import API from "@/api.js";
export default {
  name: 'hello',
  data () {
    return {
     xAxis: [],
     fileUploadCount: [],
    }
  },
  watch: {
    fileUploadCount() {
      this.drawLine();
    }
  },
  mounted(){
    this.getChart();
  },
  methods: {
    //获取数据
    async getChart(){
      let result = await API.getChartData()
      let data = result.data.data
      if(data!=undefined){
          for(let i=0;i<data.length;i++){
            let userName=data[i].userName;
            let count=data[i].fileUploadCount;
            this.xAxis.push(userName);
            this.fileUploadCount.push(count);
          }
      }
    },
    //渲染echart
    drawLine(){
      // 基于准备好的dom，初始化echarts实例
      let that = this;
      let myChart = this.$echarts.init(this.$refs.myChart);
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        xAxis : [
          {
            type : 'category',
            data : this.xAxis
          },
        ],
        yAxis: [
          {
            type : 'value'
          }
        ],
        color: ['#d48265', '#91c7ae','#749f83'],
        legend: {
          data: this.xAxis
        },
        series: [
          {
            name:this.$t('label.number_files'),
            itemStyle: {
              normal: {
                color: function(params) {
                  // build a color map as your need.
                  let colorList = [
                    '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
                    '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                    '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
                  ];
                  return colorList[params.dataIndex]
                }
              }
            },
            type:'bar',
            stack: this.$t('label.label_number_files'),
            data: this.fileUploadCount
          }
        ]
      };
      myChart.setOption(option);
    }
  }
}
</script>