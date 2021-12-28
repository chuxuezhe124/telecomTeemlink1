<template>
  <div class="main_meter">
    <div class="meter-header">
      <div>
        <span class="left-name">{{$t('profile.software')}}</span>
        <el-select
          class="common" 
          v-model="status" 
          clearable
          @change="isComplete"
        >
          <el-option
            v-for="(item,index) in options"
            :key="index"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div>
        <span class="left-name">{{$t('view.start_time')}}</span>
        <el-date-picker
          class="common-time"
          v-model="startDay"
          type="date"
          default-value="2020-04-01"
          :picker-options="pickerOptions1"
          :placeholder="$t('placeholder.select_date')">
        </el-date-picker>
      </div>
      <div>
        <span class="left-name">{{$t('view.end_time')}}</span>
        <el-date-picker
          class="common-time"
          v-model="endDay"
          type="date"
          default-value="2020-04-30"
          :picker-options="pickerOptions2"
          :placeholder="$t('placeholder.select_date')">
        </el-date-picker>
      </div>
      <div  v-if="$store.state.myProfile.domainAdmin">
        <el-checkbox v-model="showMode" @change="handleCheckChange">{{$t('view.display_all_user')}}</el-checkbox>
      </div>
      <div class="select">
        <el-select 
          v-model="select" 
          clearable
          @change="isComplete"
        >
          <el-option
            v-for="(item,index) in selectData"
            :key="index"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <span class="right-name" @click="search">{{$t('btns.query')}}</span>
        
      </div>
    </div>
    
    <div class="meter-container">
      <el-scrollbar class="scrollbar">
        <div class="meter-wrap">
          <div 
            ref="myChart" 
            id="myChart" 
            :style="{width: '100%', height: '200px'}">
          </div>
          <div 
            ref="bar" 
            id="bar" 
            :style="{width: '100%', height: '200px'}">
          </div>
          <div class="view-table" v-if="chartData">
            <el-table  
              :data="chartData[0].table" 
            >
              <el-table-column prop="core" :label="$t('view.id')" align="center"></el-table-column>
              <el-table-column prop="flowname" :label="$t('profile.flow_name')" align="center"></el-table-column>
              <el-table-column prop="state:label" :label="$t('flow.state')" align="center"></el-table-column>
              <el-table-column prop="number" :label="$t('view.number')" align="center"></el-table-column>
              <el-table-column prop="consuming" :label="$t('view.use_hour')" align="center"></el-table-column>
              <el-table-column prop="consumingday" :label="$t('view.use_day')" align="center"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>

let echarts = require('echarts/lib/echarts');
// 引入柱状图组件
require('echarts/lib/chart/bar');
// 引入提示框和title组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
//import echarts from 'echarts';
export default {
  inject: ["reload"],
  components: {
    
  },
  watch: {
    chartData() {
      this.$nextTick(()=> {
        let datas = this.chartData;
        this.drawLine(datas);
      })
    },
  },
  data() {
    return {
      showMode:false,
      startDay: "",
      endDay: "",
      options: [],
      status: '',
      chartData: '',
      selectData: [
        {
          name:this.$t('view.finish'),
          id:1,
        },
        {
          name:this.$t('view.no_finish'),
          id:0,
        }
      ],
      select:1,
      pickerOptions1: {
        disabledDate: time => {
          let endField;
          let fields = this.$parent.getAllFields();
          if (fields)
            for (let i = 0; i < fields.length; i++) {
              if (fields[i].prev_Name == this.field.name){
                endField = fields[i];
                break;
              }
            }
          if (endField) {
            return  new Date(endField.value).getTime() < time.getTime();
          }
          return false;
        }
      },
      pickerOptions1: {
        disabledDate: time => {
          return  new Date(this.endDay).getTime() < time.getTime();
        }
      },
      pickerOptions2: {
        disabledDate: time => {
          return  new Date(this.startDay).getTime() > time.getTime();
        }
      }
    };
  },
  mounted() {
    this.getConsuming();
  },
  created() {
    this.getApplications();
    this.setTime();
  },
  methods: {
    search() {
      let appId = this.$root.appid;
      let data = {
        application: appId,
        dateRange: "",
        enddate: this.writeCurrentDate(this.endDay),
        select: this.select,
        showMode: this.showMode?'all':'mine',
        startdate: this.writeCurrentDate(this.startDay),
      };
      this.$api.getConsuming(
        appId,
        data,
        {
          onSucess: res => {
            this.chartData = res.data.data;
            this.$forceUpdate();
          }
        }
      )
      
    },

    //日期格式转换
    writeCurrentDate(val){
      let day = new Date(val);
      let year = day.getFullYear()
      let Month = day.getMonth() + 1;
      let Day = day.getDate();
      Month = Month >= 10 ? Month: "0"+Month;
      Day = Day >= 10 ? Day: "0" + Day;
      let s = year +"-" +  Month + "-" + Day;
      return s;
    },
    setTime() {
      this.startDay = this.getCurrentMonthFirst();
      this.endDay = this.getCurrentMonthLast();
    },
    handleCheckChange() {
      console.log("showMode---->",this.showMode);
      let startTime = this.writeCurrentDate(this.startDay),
          endTime = this.writeCurrentDate(this.endDay);
      let appId = this.$root.appid;
      let data = {
        application: appId,
        dateRange: "",
        enddate: endTime,
        select: this.select,
        showMode: this.showMode?'all':'mine',
        startdate: startTime,
      };
      this.$api.getConsuming(
        appId,
        data,
        {
          onSucess: res => {
            
            this.chartData = res.data.data;
            this.$forceUpdate();
          }
        }
      )
    },
    drawLine(datas){
      if (datas[0].echart.yAxis != "") {
        var myChart = this.$echarts.init(this.$refs.myChart);
				var dataNums = datas[0].echart.num
				var dataLg = dataNums.length;
				var dataNames = datas[0].echart.xAxis
				var seriesData = [];
				var serie = {};
        var yAxis = datas[0].echart.yAxis;
				for(var i = 0 ; i< dataLg ; i++){
					var data = new Array(dataLg).fill(0);  //新建数组
					data[i] = dataNums[i]
					serie = {
						name: dataNames[i],
						type: 'bar',
						barCategoryGap: '60%',
						barGap:'-100%',
						data: datas[0].echart.yAxis
					}
					seriesData.push(serie);
				}
				myChart.setOption({
					title: {
						text: this.$t('flow.use_time'),
						x: 'center'
					},
					tooltip: {
						trigger: 'item'
					},
					legend: {
						data: datas[0].echart.xAxis,
						y: 'bottom'
					},
					grid: {
						x: 50, y: 30, x2: 15, y2: 60
					},
					calculable: true,
					xAxis: [
						{
							show: false,
							type: 'category',
							data: datas[0].echart.xAxis
						}
					],
					yAxis: [
						{
							type: 'value',
							axisLabel: { formatter: '{value} h' }
						}
					],
					series: seriesData
				});


				var seriesData2 = [];
				var serie2 = {};

				for(var i = 0 ; i< dataLg ; i++){
					var data = new Array(dataLg).fill(0);  //新建数组
					data[i] = dataNums[i]
					serie2 = {
						name: dataNames[i],
						type: 'bar',
						barCategoryGap: '60%',
						barGap:'-100%',
						data: data
					}
					seriesData2.push(serie2);
        }
        
        //第二个
				var myChart = this.$echarts.init(this.$refs.bar) //ec.init(document.getElementById('bar'));
				var option = {
					title: {
						text: this.$t('flow.num'),
						x: 'center'
					},
					tooltip: {
						trigger: 'item'
					},
					legend: {
						data: datas[0].echart.xAxis,
						y: 'bottom'
					},
					grid: {
						x: 50, y: 30, x2: 15, y2: 60
					},
					calculable: true,
					yAxis: [
						{
							type: 'value',
							boundaryGap: [0, 0],
							axisLabel: { formatter: '{value}个' }
						}
					],
					xAxis: [
						{
							show: false,
							type: 'category',
							data: datas[0].echart.xAxis
						}
					],
					series: seriesData2,
				}
        myChart.setOption(option);
			}else {
        this.initchart();
      }
    },
    initchart() {
      var myChart = this.$echarts.init(this.$refs.myChart);
			myChart.setOption({
				title: {
					text: this.$t('flow.use_time'),
					x: 'center'
				},
				tooltip: {
					trigger: 'item'
				},
				grid: {
					x: 50, y: 25, x2: 15, y2: 35
				},
				calculable: true,
				xAxis: [
					{
						type: 'category',
						data: [0, 0]
					}
				],
				yAxis: [
					{
						type: 'value'
					}
				],
				series: [
					{
						type: 'bar',
						barCategoryGap: '60%',
						data: [0, 0]
					}
				]
      }, true);
      var myChart = this.$echarts.init(this.$refs.bar);
			myChart.setOption({
				title: {
					text: this.$t('flow.num'),
					x: 'center'
				},
				tooltip: {
					trigger: 'item'
				},
				grid: {
					x: 50, y: 25, x2: 15, y2: 35
				},
				calculable: true,
				xAxis: [
					{
						type: 'value',
						boundaryGap: [0, 0.01]
					}
				],
				yAxis: [
					{
						type: 'category',
						data: [0, 0]
					}
				],
				series: [
					{
						type: 'bar',
						barCategoryGap: '60%',
						data: [0, 0]
					}
				]
      }, true);
		},

    getConsuming() {
      let startTime = this.getCurrentMonthFirst(),
          endTime = this.getCurrentMonthLast();
      let appId = this.status ? this.status : this.$root.appid;
      let data = {
        application: appId,
        dateRange: "",
        enddate: endTime,
        select: this.select,
        showMode: "mine",
        startdate: startTime,
      };
      this.$api.getConsuming(
        appId,
        data,
        {
          onSucess: res => {
            this.chartData = res.data.data;
          }
        }
      )
    },
    getApplications() {
      this.$api.getApplications(
        {
          onSucess: res => {
            //this.options = res.data.data.applications;
            let arr = [];
            res.data.data.applications.forEach(app => {
              if (app.id != "km" && app.id != "pm" && app.id != "qm") {
                arr.push(app);
              }
            });
            this.status = arr[0].id;
            this.options = arr;
            

            // for(let i = 0; i<this.options.length; i++) {
            //   if(this.options[i].activated) {
            //     this.status = this.options[i].id;
            //   }
            // }
          }
        }
      )
    },
    isComplete() {
      this.getConsuming();
    },

    //当前月第一天
    getCurrentMonthFirst(){
        let date = new Date();
        date.setDate(1);
        let month = parseInt(date.getMonth()+1);
        let day = date.getDate();
        if (month < 10) {
            month = '0' + month
        }
        if (day < 10) {
            day = '0' + day
        }
        return date.getFullYear() + '-' + month + '-' + day;
    },

    //当前月最后一天
    getCurrentMonthLast(){
        let date=new Date();
        let currentMonth=date.getMonth();
        let nextMonth=++currentMonth;
        let nextMonthFirstDay=new Date(date.getFullYear(),nextMonth,1);
        let oneDay=1000*60*60*24;
        let lastTime = new Date(nextMonthFirstDay-oneDay);
        let month = parseInt(lastTime.getMonth()+1);
        let day = lastTime.getDate();
        if (month < 10) {
            month = '0' + month
        }
        if (day < 10) {
            day = '0' + day
        }
        return date.getFullYear() + '-' + month + '-' + day;
    }

  }
};
</script>
<style lang="scss" scoped>

</style>


