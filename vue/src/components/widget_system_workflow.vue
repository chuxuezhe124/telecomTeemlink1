<template>
  <!--首页流程处理的组件-->
  <div class="widget-box" v-if="showWorkflow">
    <div
      :style="{background:systemData.systemData.titleBarColor}" 
      class="clearfix" 
      @mouseenter="cardShow"
      @mouseleave="cardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="systemData.systemData.icon && systemData.systemData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+systemData.systemData.icon.icon" alt="">
        </span>
        <i v-if="systemData.systemData.icon && systemData.systemData.icon.icontype == 'font'" :class="systemData.systemData.icon.icon" :style="{color:systemData.systemData.icon.iconFontColor}"></i>
        <span :title="systemData.systemData.name" class="title" :style="{color:systemData.systemData.titleColor,background:systemData.systemData.titleBColor}">{{systemData.systemData.name}}</span>
      </div>
      <div class="flow-center-icon">
        <span style="cursor: pointer;" class="el-icon-refresh" v-show="conceal" @click="partialrefresh"></span>
      </div>
      <div class="btn">
        <div @click.stop.prevent="switchProcess('1')" :class="[currentFlow=='1'?'pro-and-pe':'','pedding']">
          <span>
           {{$t('wait_do')}}
          </span>
          <span class="pedding-num" v-if="currentFlow == '1'">
            <span>
              {{pendingList.rowCount}}
            </span> 
          </span>
        </div>
        <div @click.stop.prevent="switchProcess('2')" :class="[currentFlow=='2'?'pro-and-pe':'','processing']">
          <span>
           {{$t('has_do')}}
          </span>
          <span class="pedding-num" v-if="currentFlow == '2'">
            <span>
              {{processedList.rowCount}}
            </span> 
          </span>
        </div>
      </div>
    </div>
    <div class="system-workflow" v-if="currentFlow=='1'" v-loading="loading">
      <div class="pedding" v-if="pendingList.datas && pendingList.datas.length > 0">
        <div 
          class="pedding-list" 
          v-for="(item,index) in pendingList.datas" 
          :key="index"
          @click="jumpToForm(item, index)"
        >
          <div class="detail">
            <div class="img">
              <img v-if="item.photo" :src="item.photo" />
              <img v-else src="../assets/images/face.jpg" />
              <div class="readcir" v-if="!item.read"></div>
            </div>
            <div class="detail-row">
              <span class="row-one">
                {{item.flowName}}
                &nbsp;&nbsp;
                <span v-html="setSubjectFormat(item.subject)"></span>
              </span>
              <span>
                {{item.initiatorDept}}{{item.initiator}}&nbsp;{{item.lastProcessTime | formatDate}}
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
      <div class="pedding" v-if="processedList.datas && processedList.datas.length > 0">
        <div 
          class="pedding-list" 
          v-for="(item,index) in processedList.datas" 
          :key="index"
          @click="jumpToForm(item, index)"
        >
          <div class="detail">
            <div class="img">
              <img src="../assets/images/face.jpg" />
            </div>
            <div class="detail-row">
              <span class="row-one">
                {{item.flowName}}
                &nbsp;&nbsp;
                <span v-html="setSubjectFormat(item.subject)"></span>
              </span>
              <span>
                {{item.initiatorDept}}{{item.initiator}}&nbsp;{{item.lastProcessTime | formatDate}}
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
      <!-- <i class="el-icon-d-arrow-right"></i> -->
      <span class="btn-more" @click="getMore">
        {{$t('more')}}
      </span>
    </div>
  </div>
</template>
<script>
import Constant from "@/Constant.js";
import dateFormat from '@/assets/js/dateFormat'; 
import { mapGetters, mapActions } from 'vuex'
export default {
  inject: ["reload"],
  props: ['systemData'],
  computed:{
    ...mapGetters({
      processedList: 'getProcessedListWithWidget',
      pendingList: 'getPendingListWithWidget'
    }),
    // 显示查看更多按钮
    showMoreBtn(){
      let flag = false
      // 经办
      if(this.currentFlow == '1' && this.pendingList.datas && this.pendingList.datas.length >= 5 || this.currentFlow == '2' && this.processedList.datas && this.processedList.datas.length >= 5){
        flag = true
      }
      return flag
    }
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    let workflowOrder = this.systemData.systemData.workflowOrder;
    sessionStorage.setItem("workflowOrder", workflowOrder); //每次流程提交后都要重新刷新widget流程处理，根据这个值来判断是否进行排序
    this.getPendingListWithWidget({workflowOrder});
    // this.$store.dispatch("getPendingListWithWidget", {workflowOrder}); //流程提交完毕后首页流程处理widget数据重新刷新
    // this.$store.dispatch("getProcessedListWithWidget", {workflowOrder});
    this.loading = false;
    const that = this
    that.timer = setInterval(function () {
      if (document.readyState === 'complete') {
        let pl = that.pendingList
        if(pl) {
          let list = that.pendingList.datas;
          // for (let i = 0; i < list.length; i++) {
          //   that.$api.getAvatar(list[i].initiatorId, {
          //     onSucess: response => {
          //       list[i].photo = response.data.data;
          //       that.$forceUpdate();
          //     }
          //   })
          // }
          let tempArr = [];
          let newArr = [];
          list.forEach((i, index) => {
            if (tempArr.indexOf(i.initiatorId) === -1) {
              newArr.push({
                id: i.initiatorId,
                arr: [index]
            });
              tempArr.push(i.initiatorId);
            } else {
              newArr[tempArr.indexOf(i.initiatorId)].arr.push(index)
            }
          });
          newArr.forEach(item => {
            that.$api.getAvatar(item.id, {
              onSucess: response => {
                let photo = response.data.data;
                item.arr.forEach(i => {
                  list[i].photo = photo;
                });
                that.$forceUpdate();
              }
            })
          });
        }
        window.clearInterval(that.timer)
      }
    }, 1000)

  },

  data: function() {
    return {
      Constant,
      conceal: false,
      dispose: true, //控制流程处理隐藏或这显示
      GonnaSelect:'pending',
      row_count:0,
      row_Count:0,
      currentFlow:'1',
       //1为待办，2为经办
      showWorkflow: true,
      loading: true,
      contextPath:'',
    };
  },
  methods: {
    ...mapActions([
      "getPendingListWithWidget",
      "getProcessedListWithWidget"
    ]),

    dele(){
      this.showWorkflow = false;
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

    switchProcess(val) {
      this.currentFlow = val;
      if(val == "2" && this.processedList.length==0){
        let workflowOrder = this.systemData.systemData.workflowOrder;
        this.getProcessedListWithWidget({workflowOrder});
      }
    },

    getMore() {
      let params = {
        appId: this.systemData.systemData.applicationId,
        actionContent: this.systemData.systemData.actionContent,
      };
      let val = true;
      this.$emit("event", 'system_workflow', params, val, this.currentFlow);
    },

    jumpToForm(item, index) {
      item.homeWidgetType = 'system_workflow'; 
      this.$emit("event",'system_workflow',item);
      if(!item.read) {
        this.pendingList.datas[index].read = true;
        this.$forceUpdate();
      }
    },

    cardShow() {
      this.conceal = true;
    },

    cardNone() {
      this.conceal = false;
    },

    //流程处理的局部刷新
    partialrefresh() {
      let workflowOrder = this.systemData.systemData.workflowOrder;
      this.loading = true;
      this.getPendingListWithWidget({workflowOrder});
      this.getProcessedListWithWidget({workflowOrder});
      setTimeout(()=>{
        this.loading = false;
      },300)
      const that = this
      that.timer = setInterval(function () {
        if (document.readyState === 'complete') {
          let pl = that.pendingList
          if(pl) {
            let list = that.pendingList.datas;
            let tempArr = [];
            let newArr = [];
            list.forEach((i, index) => {
              if (tempArr.indexOf(i.initiatorId) === -1) {
              　newArr.push({
                  id: i.initiatorId,
                  arr: [index]
              　});
                  tempArr.push(i.initiatorId);
              } else {
                newArr[tempArr.indexOf(i.initiatorId)].arr.push(index)
              }
            });
            newArr.forEach(item => {
              that.$api.getAvatar(item.id, {
                onSucess: response => {
                  let photo = response.data.data;
                  item.arr.forEach(i => {
                    list[i].photo = photo;
                  });
                  that.$forceUpdate();
                }
              })
            });
          }
          window.clearInterval(that.timer)
        }
      }, 1000)
    },
  },
  filters: {
    formatDate: function (value) {// 时间戳转换日期格式方法
      let _time = dateFormat.calculateTime(value);
      return _time;
    }
  }
}
</script>

