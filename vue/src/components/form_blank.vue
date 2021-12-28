<template>
  <div class="view-print">
    <div class="print-wrap">
      <form_normalform
        :openParams="params"
        v-if="hackReset"
        @openNewpage="doAction"
        @add-tab="doAction"
      />
      <!-- <view_delegate :openParams="{appId:$route.query.appId, actionContent: $route.query.actionContent}" :showtype="$route.query.opentarget"/> -->
      <!-- {{$route.query}} -->
    </div>
  </div>
</template>

<script>
import form_normalform from "@/components/form_normalform.vue";
export default {
  props: [
  ],
  components: {
    form_normalform,  
  },
  data: function() {
    return {
      view:'',
      params:'',
      hackReset: true,
    };
  },
  created() {
    let queryData = this.$route.query;
    let openParams = {
      linkType: queryData.linkType,
      appId: queryData.appId,
      actionContent: queryData.actionContent?queryData.actionContent:'',
      _select: queryData.docid ? queryData.docid : '',
      isExternalLink: true,
    };
    if(queryData._select) {
      openParams._select = queryData._select
    }

    if(queryData.realformId) {
      openParams.realformId = queryData.realformId
    }

    if(queryData.isOpenNewWindow) {
      openParams.isOpenNewWindow = queryData.isOpenNewWindow
    }

    if(queryData.isOpenDialog === 'true') {
      openParams.isOpenDialog = true
    }
    if(queryData.isWidgetLink === 'true') { //如果是widget外链打开表单，有计算脚本o-action
      openParams.isWidgetLink  = true
    }
    let formParams = '';
    let obj = queryData;
    for(let key in obj) {
      if(
        key != 'name' &&
        key != 'actionContent' &&
        key != 'searchData' && 
        key != 'showtype' && 
        key != 'realformId' && 
        key != 'templateForm' && 
        key != 'urlParams' && 
        key != 'exparams' &&
        key != 'runAfterParams' &&
        key != 'queryString' &&
        key != 'isOpenDialog'
        ) {
        if(obj[key]) {
          formParams += "&" + key + '=' + obj[key];
        }
      }
    }
    if(obj.exparams) {
      if(formParams) {
        formParams = formParams + "" + obj.exparams;
      }else {
        formParams = obj.exparams;
      }
    }
    if(queryData.urlParams) {
      openParams.urlParams = queryData.urlParams
    }
    if(formParams) {
      openParams.formParams = formParams
    }
    this.doAction(openParams);
  },
  mounted(){
    
  },
  computed: {

  },
  methods: {
    doAction: function(params) {
      // this.paramsHistory.push(params);
      this.params = params;
      if(params.isCurrentPageOpen) { //当是按钮为当前页打开时重新刷新页面加载数据，是视图按钮，或者表单按钮
        this.hackReset = false
        this.$nextTick(() => {
          this.hackReset = true
        })
      }
    },
    getviewData() {
      let appId = this.$route.query.appId;
      let obj = {
            appId,
            viewId: this.$route.query.actionContent,
            test: this.$route.query.paramValue,
            containTitle: this.$route.query.name,
          };
      if(this.$route.query.paramKey) {
        obj[this.$route.query.paramKey] = this.$route.query.paramValue;
      }
    },
  }
}
</script>

<style lang="scss">
  .view-print {
    background: #ffffff;
  }
</style>
