<template>
  <div class="view-print">
    <div class="print-wrap">
      <div>
        <view_listview 
          :openParams="openParams" 
          :isFormPrint="isFormPrint" 
          :view="view" />
      </div>
    </div>
  </div>
</template>

<script>
import view_listview from "@/components/view_listview.vue";


export default {
  props: [
    'printParams',
    "openParams"
  ],
  components: {
    view_listview,
  },
  data: function() {
    return {
      view:'',
      viewData:'',
      isFormPrint: 5, //打印时时等于5
    };
  },
  created() {
    this.getviewData();
  },
  mounted(){
    
  },
  computed: {
  
  },
  methods: {
    getviewData() {
      let appId = this.openParams.appId;
      let viewId = this.printParams.viewId;
      this.$api.getPrintViewTemplate(appId, viewId, this.printParams.isPrint, {
        onSucess: response => {
          this.view = response.data.data;
          // if(view) {
          //   this.$api.getViewData(
          //     //普通视图接口
          //     this.$root.appid,
          //     this.printParams.viewId,
          //     {
          //       parentId: "",
          //       currpage: 1,
          //       lines: 10,
          //       searchWord:'',
          //     },
          //     {},
          //     {
          //       onSucess: response => {
          //          
          //         this.viewData = response.data.data
          //       }
          //     }
          //   );
          // }
        }
      })
    },
  }
}
</script>

<style lang="scss">

</style>