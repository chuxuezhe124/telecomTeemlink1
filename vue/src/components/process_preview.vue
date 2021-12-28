<template>
  <div>
    <div :class="processPreview? 'descriptive2' : 'descriptive'">
      <div class="descriptiveText">
        <div class="descriptiveTextLeft1"></div>
        <div class="descriptiveTextRight">处理中节点</div>
      </div>
      <div class="descriptiveText">
        <div class="descriptiveTextLeft2"></div>
        <div class="descriptiveTextRight">已流转节点</div>
      </div>
      <div class="descriptiveText">
        <div class="descriptiveTextLeft4"></div>
        <div class="descriptiveTextRight">回退、回撤节点</div>
      </div>
      <div class="descriptiveText">
        <div class="descriptiveTextLeft3"></div>
        <div class="descriptiveTextRight">未流转节点</div>
      </div>
      <div class="descriptiveText">
        <div class="descriptiveTextLeft5"><i class="el-icon-more"></i></div>
        <div class="descriptiveTextRight">移入显示所有审批人</div>
      </div>
    </div>
      <div :class="processPreview ? 'flow-preview2' : 'flow-preview'">
        <div class="flow-preview-item" v-for="(item,index) in previewData" :key="index" :style="'color:'+previewFont(item)+';'">
          <div class="flow-preview-item-left">
            <div class="nodeName" v-if="item.name">{{item.name}}:</div>
            <div class="auditorsName">
              <div class="auditorsName-left">
                <template v-if="item.auditors.length <= 3">
                  <div class="auditorsName-item" v-for="(auditor,index) in item.auditors" :key="index">
                    {{auditor.name}}
                  </div>
                </template>
                <template v-if="item.auditors.length > 3">
                  <div class="auditorsName-item">
                    {{item.auditors[0].name}}
                  </div>
                    <div class="auditorsName-item">
                    {{item.auditors[1].name}}
                  </div>
                    <div class="auditorsName-item">
                    {{item.auditors[2].name}}
                  </div>
                  <span :title="item.allAuditor" style="cursor: pointer;"><i class="el-icon-more"></i></span>
                </template>
              </div>
              <div class="auditorsName-right">
                <i class="el-icon-success" v-if="item.flowOperation == '80' && item.state == 'history'"></i>
                <i class="el-icon-error" v-else-if ="(item.flowOperation == '81' && item.state == 'history') || (item.flowOperation == '85' && item.state == 'history')"></i>
              </div>
            </div>
          </div>
          <div class="flow-preview-item-right" :style="'color:'+arrowColor(item)+';'" v-if="!(index == previewData.length - 1)">
            <div class="arrow" :style="'background-color:'+arrowColor(item)+';'"></div>
            <i class="el-icon-caret-right icon"></i>
          </div>
          <div style="width:70px;" v-if="(index == previewData.length - 1)">
          </div>
        </div>
      </div>
  </div>
</template>
 
 <script>
export default {
  props: [
    "previewData",
    "processPreview"
  ],
   data() {
     return {
     };
   },
   created() {
     console.log('1111')
     console.log(this.previewData,'123')
   },
   mounted() {
     this.$nextTick(() => {
       console.log(this.previewData,'456')
     })
   },

   methods: {
    //流程预览字体颜色
    previewFont(item) {
      console.log(item.state)
      if(item.state == 'now') {
        return '#ec971f' //当前节点橙色
      }else if(item.state == 'future'){
        return '#666666' //未来节点黑色
      }else if(item.state == 'history' && item.flowOperation == '80'){
        return '#85c529' //历史（成功）节点绿色
      }else if((item.state == 'history' && item.flowOperation == '81') || (item.state == 'history' && item.flowOperation == '85')) {
        debugger
        return 'red' //回退、回撤节点红色
      }
    },
    //箭头颜色
    arrowColor(item) {
      if(item.state == 'history' && item.flowOperation == '80') {
        return '#85c529' //历史（成功）节点箭头绿色
      }else {
        return '#666666' //其他节点箭头都是黑色
      }
    },
   }
 }
 </script>