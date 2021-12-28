<template>
    <!-- :style="{'min-height':field.fixationHeight, height:field.fixationHeight<=0?'305px':'', width:field.includeWidth+'px'}"> -->
    <!-- :style="{width:field.includeWidth+'px'}" -->
  <div 
    :id="id" 
    :name="field.name+'_show'" 
    class="include-control" 
    :style="{width:includeWidth+'px'}"
    >
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
       <span v-if="field.isPrint">{{field.printHiddenValue}}</span>
       <span v-else>{{field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div style="width:100%;" ref="divWidth"></div>
      <!-- 打印 -->
      <view_delegate 
        :openParams="{
          appId: field.application, 
          actionContent: field.viewId, 
          parentId:field.docId, 
          isRelate:field.relate, 
          showtype:'include',
          formId:field.formId,
          docId:field.docId,
        }"
        :includeDisplayType="field.displayType"
        :isFormPrint="field.displayType"
        v-bind="$attrs"
        v-on="$listeners"
        :showtype="'include'"
        :openType="field.openType?field.openType:''"
        :isIncludeViewRefresh="field.isRefreshOnChanged"
        @change="onChange"
        @refresh="refresh"
      >
      </view_delegate>
    </template>

    <!--只读-->
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <span :id="field.name_show">{{field.value}}</span>

      </template>
      <template v-else>
        <div style="width:100%;" ref="divWidth"></div>
        <!-- 只读（控件模式） -->
        <view_delegate 
          :openParams="{appId: field.application, 
            actionContent: field.viewId,
            parentId:field.docId, 
            isRelate:field.relate, 
            showtype:'include',
            formId:field.formId,
            docId:field.docId,
          }"
          :includeDisplayType="field.displayType"
          :isFormPrint="field.displayType"
          :showtype = "'include'"
          :openType = "field.openType?field.openType:''"
          :isIncludeViewRefresh = "field.isRefreshOnChanged"
          :fixationHeight="field.fixationHeight"
          v-bind="$attrs"
          v-on="$listeners"
          v-if="isRouterAlive"
          @change="onChange"
          @refresh="refresh"
        >
        </view_delegate>
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div style="width:100%;" ref="divWidth"></div>
      <!-- 可编辑 -->
      <view_delegate
        :openParams="{
          appId: field.application, 
          actionContent: field.viewId, 
          parentId:field.docId, 
          isRelate:field.relate, 
          showtype:'include',
          formId:field.formId,
          docId:field.docId,
          id:field.docId
        }"
        :showtype = "'include'"
        :openType = "field.openType?field.openType:''"
        :isIncludeViewRefresh = "field.isRefreshOnChanged"
        :toTab='toTab'
        :isFormPrint="field.displayType"
        :fixationHeight="field.fixationHeight"
        v-bind="$attrs"
        v-on="$listeners"
        v-if="isRouterAlive"
        @change="onChange"
        @refresh="refresh"
      >
      </view_delegate>
    </template>
  </div>
</template>

<script>
import view_delegate from "@/components/view_delegate.vue";
import Constant from "@/Constant.js";
import controlHidden from "@/assets/js/controlHidden.js"

export default {
  name: "o-include",
  props: ["id"],
  components: {
    view_delegate,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      let m = document.getElementById('mainHomeContent');
      if (formData.isOpenDialog) { //弹窗打开
        let w = Math.floor(document.getElementById(formData.dialogId).clientWidth - 40);
        formData.includeWidth = w;    
      }else if(m) {
        let w = document.getElementById('mainHomeContent').clientWidth - 88;
        formData.includeWidth = w;
      }

      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }

      formData.fixationHeight = formData.fixationHeight.replace(/px/g, "");
      return formData;
    }
  },
  watch:{
    'field.isRefresh'(){
      this.isRouterAlive = false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      })
    },
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
      this.includeWidth = this.$refs.divWidth.offsetWidth
      if(this.includeWidth <= 100) { //应该是0的，
        this.includeWidth = document.getElementsByClassName("tab-control")[0].clientWidth - 20        
      }
    })
  },
  data: function() {
		return {
			Constant,
      isRouterAlive: true,
      includeWidth: '',
		};
	},
  methods: {
    refresh(){
      this.$parent.refresh(this.id);
    },
    toTab(params) {
      //this.$parent.setCallback(params);  //form_normalform组件的方法
      // this.$parent.addTabs(params);
      if(params) {
        params = JSON.stringify(params)
      }
      let havePar = false;
      let par  = '';
      while(!havePar) {
        par = par + '.$parent';
        let url = 'this' + par + '.addTabs';
        if(eval(url)) {
          let path = url + '(' + "'"+ params +"'" + ')';
          eval(path);
          break
        }
      }
    },
    onChange() {
      if (this.field.isRefreshOnChanged) {//判断是否需要刷新
        this.$parent.refresh(this.id);
      }
    },
  }
};
</script>

<style>
</style>
