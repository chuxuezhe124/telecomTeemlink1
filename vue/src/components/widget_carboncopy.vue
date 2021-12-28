<template>
  <!--首页流程处理的组件【抄送】-->
  <div class="widget-box" v-if="showCarboncopy" :style="{height:systemData.systemData.height +'px'}">
    <div 
      :style="{background:systemData.systemData.titleBarColor}"
      class="clearfix" 
      @mouseenter="cardShow"
      @mouseleave="cardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="systemData.systemData.icon && systemData.systemData.icon.icontype == 'img'">
          <img :src="contextPath +'/' + systemData.systemData.icon.icon" alt="">
        </span>
        <i v-if="systemData.systemData.icon && systemData.systemData.icon.icontype == 'font'" :class="systemData.systemData.icon.icon" :style="{color:systemData.systemData.icon.iconFontColor}"></i>
        <span :style="{color:systemData.systemData.titleColor,background:systemData.systemData.titleBColor}">{{systemData.systemData.name}}</span>
      </div>
      <div style="width:100%;height:50px;line-height: 50px;font-size: 20px;text-align: right;">
        <span style="cursor: pointer;" class="el-icon-refresh"  v-show="conceal" @click="partialrefresh"></span>
        <!-- <span style="cursor: pointer;" class="el-icon-close"  v-show="conceal" @click="dele"></span> -->
      </div>
      <div class="btn">
        <div @click.stop.prevent="switchProcess('1')" :class="[currentFlow=='1'?'pro-and-pe':'','pedding']">
          <span>
            {{$t('to_read')}}
          </span>
          <span class="pedding-num" v-if="currentFlow == '1'">
            <span>
              {{row_count}}
            </span> 
          </span>
        </div>
        <div @click.stop.prevent="switchProcess('2')" :class="[currentFlow=='2'?'pro-and-pe':'','processing']">
          <span>
             {{$t('readed')}}
          </span>
          <span class="pedding-num" v-if="currentFlow == '2'">
            <span>
               {{row_count_processing}}
            </span> 
          </span>
        </div>
      </div>
    </div>
     <div class="system-workflow" v-if="currentFlow=='1'" v-loading="loading">
      <div class="pedding" v-if="pendingList.length > 0">
        <div 
          class="pedding-list" 
          v-for="(item,index) in pendingList" 
          :key="index"
          @click="jumpToForm(item)"
        >
          <div class="detail">
            <div class="img">
              <img src="../assets/images/face.jpg" />
            </div>
            <div class="detail-row">
              <span class="row-one">
                {{item.flowName}}
                &nbsp;&nbsp;
                <span v-html="item.subject"></span>
              </span>
              <span>
                {{item.initiator}}&nbsp;{{item.lastProcessTime}}
                <!-- <span v-html="item.summary"></span> -->
              </span>
            </div>
          </div>
          <div class="approve">
            {{item.stateLabel}}
          </div>
        </div>
      </div>
      <div class="kong" v-else>{{$t('nodata')}}</div>
    </div>
    <div class="system-workflow" v-else-if="currentFlow=='2'" v-loading="loading">
      <div class="pedding" v-if="processedList.length > 0">
        <div 
          class="pedding-list" 
          v-for="(item,index) in processedList" 
          :key="index"
          @click="jumpToForm(item)"
        >
          <div class="detail">
            <div class="img">
              <img src="../assets/images/face.jpg" />
            </div>
            <div class="detail-row">
              <span class="row-one">
                {{item.flowName}}
                &nbsp;&nbsp;
                <span v-html="item.subject"></span>
              </span>
              <span>
                {{item.initiator}}&nbsp;{{item.lastProcessTime}}
                <!-- <span v-html="item.summary"></span> -->
              </span>
            </div>
          </div>
          <div class="approve">
            {{item.stateLabel}}
          </div>
        </div>
      </div>
      <div class="kong" v-else >{{$t('nodata')}}</div>
    </div>
    <div class="more" v-if="showMoreBtn">
      <span class="btn-more" @click="getMore">
        {{$t('more')}}
      </span>
    </div>
  </div>
  
</template>

<script>
// import API from "@/api.js";
import Constant from "@/Constant.js";
import dateFormat from '@/assets/js/dateFormat'; 
export default {
  inject: ["reload"],
  props: ['systemData'],
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.getUnRead();
    this.finished();
  },
  data: function() {
    return {
      row_count:0,
      row_count_processing:0,
      Constant,
      pendingList: [],
      processedList: [],
      conceal: false,
      dispose: true, //控制流程处理隐藏或这显示
      GonnaSelect:'pending',
      currentFlow:'1', //1为待阅，2为已阅
      showCarboncopy: true,
      loading: true,
      contextPath:'',
    };
  },
  methods: {
    getUnRead(){
      let appId = this.$root.appid;
      let params = {
          title: '',
          linesPerPage: 5,
          pageNo: 1,
          initiatorId: '',
          flowId: '',
          isRead: false,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)),//this.writeCurrentDate(item.lastProcessTime), //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
                flowName: item.flowName
              };
            });
            this.pendingList = newData;
            this.loading = false;
          }
        }
      )
    
    },
    dele(){
      this.showCarboncopy = false;
    },
    writeCurrentDate(val){
      let now = new Date(val);
      let year=now.getFullYear(); 
      let month=now.getMonth()+1; 
      let date=now.getDate(); 
      let hour=now.getHours(); 
      let minute=now.getMinutes(); 
      let second=now.getSeconds(); 
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },
    switchProcess(val) {
      this.currentFlow = val;
    },
    getMore() {
      let val = true;
      this.$emit("event", 'carboncopy', '', val, this.currentFlow);
    },
    jumpToForm(item) {
      item.applicationId = this.$root.appid
      item._select = item.docId;
      this.$emit("event",'carboncopy',item);
    },
    
    finished() {
      let appId = this.$root.appid;
      let params = {
          title: '',
          linesPerPage: 5,
          pageNo: 1,
          initiatorId: '',
          flowId: '',
          isRead: true,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count_processing = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)),//this.writeCurrentDate(item.lastProcessTime), //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
                flowName: item.flowName
              };
            });
            this.processedList = newData;
            this.loading = false;
          }
        }
      )
    },

    cardShow() {
      this.conceal = true;
    },
    cardNone() {
      this.conceal = false;
    },

    //流程处理的局部刷新
    partialrefresh() {
      this.loading = true;
      this.finished();
      this.getUnRead();
      let timeLoading =
        setTimeout(()=>{
          this.loading = false;
        },300)
    },
  },
  computed:{
    showMoreBtn(){
      let flag = false
      // 经办
      if(this.currentFlow == '1' && this.pendingList && this.pendingList.length >= 5 || this.currentFlow == '2' && this.processedList && this.processedList.length >= 5){
        flag = true
      }
      return flag
    }
  },
  filters: {
    formatDate: function (value) {// 时间戳转换日期格式方法
        if (value == null) {
            return '';
        } else {
            let ymd = value.split(" ")[0];
            return ymd;
        }
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
