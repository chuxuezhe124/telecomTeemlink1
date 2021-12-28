<template>
  <div class="print-view" id="print_view">
    <div class="print-view-wrap" v-if="simpleClassName=='listView'">
      <view_listview 
        v-if="viewPrintData"
        :openParams="openParams"  
        :view="viewPrintData" 
        :isFormPrint="isFormPrint"
      />
    </div>
    <div class="print-view-wrap" v-else-if="simpleClassName=='gridview'">
      <view_gridview 
        v-if="viewPrintData"
        :openParams="openParams"  
        :view="viewPrintData" 
        :isFormPrint="isFormPrint"
      />
    </div>
    <div class="print-btn">
      <div class="page-con">
        <div @click="printView" class="btn no-print" v-show = 'isHide'>
          {{$t('report.print')}}
        </div>
        <!-- <el-button
          class="btn no-print" 
          @click="printView" 
          size="medium"
          type="primary"
          >{{$t('report.print')}}</el-button> -->
      </div>
    </div>
  </div>
</template>

<script>

import view_listview from "@/components/view_listview.vue";
import view_gridview from "@/components/view_gridview.vue";
export default {
  name:"",
  props: [""],
  components: {
    view_listview,
    view_gridview
  },
  computed: {
  },
  created(){
    let query = this.$route.query;
    if(query.simpleClassName == "ListView"){
      if(query.openType == "288") {
        this.simpleClassName = "gridview";
      }
    }
    console.log("--->",this.$route.query)
  },
  mounted() {
    this.getViewData();
  },
  data: function() {
    return {
      viewPrintData:'',
      openParams:'',
      isFormPrint: 5,//打印时时等于5
      simpleClassName: 'listView',
      isHide: true,
    }
  },
  methods: {
    printView() {
      this.isHide = false
      setTimeout(function () {
        window.print();
      }, 100);
      let that = this
      //window打印界面关闭
      window.onafterprint = function() {
        that.$nextTick(function(){
        that.isHide = true
      });
      };
    },
    getViewData(){
      let appId = this.$root.appid;
      let viewId = this.$route.query.viewId;
      let isPrint = this.$route.query.isPrint;
      this.openParams = {
        appId,
        viewId,
        isPrint,
        isRelate: this.$route.query.isRelate,
        parentId: this.$route.query.parentId,
      }
      this.$api.getPrintViewTemplate(appId, viewId, isPrint, {
        onSucess: response => {
            this.viewPrintData = response.data.data;  
            let columns = this.viewPrintData.columns;
            for(let i=0;i<columns.length;i++){
              if((columns[i].hiddenColumn == true) || (!columns[i].visible4PagePrint)){
                  columns.splice(i,1);
                  i--;
              }
            }
        }
      })
    },
  }
}
</script>

<style lang="scss">
  
</style>