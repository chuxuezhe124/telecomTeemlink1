<template>
  <span :id="id" :name="field.name+'_show'" class="input-control" :ref="id">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <template>
        <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
      </template>
      
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{value}}
      </div>
    </template>
    <!-- 只读 -->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <div 
          class="input-wrap"
        >
          <div>
            {{value}}
          </div>
        </div>
      </template>
      <template v-else>
        <div 
          :style="{width:field.width?field.width + 'px':''}"
          class="input-wrap"
        >
          <el-input
            :disabled="true"
            type="text"
            :name="field.name"
            v-model.lazy="value"
          />
        </div>
      </template>
    </template>
    <!-- 可编辑 -->
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div 
        :style="{width:field.width?field.width + 'px':''}"
        class="input-wrap"
      >
        <el-input
          class="input-p"
          ref="inputP" 
          :placeholder="field.placeholder?field.placeholder:$t('placeholder.content')"
          type="text" 
          v-model="value"
          @change="onChange"
        >
        <i 
          v-if="field.textType=='tel'" 
          class="el-icon-phone el-input__icon tel" 
          slot="suffix">
        </i>
        <span 
          v-if="field.instantValidate" 
          slot="suffix"  
          class="el-input__icon"
          style="color:red;">
            *
        </span>
        </el-input>
        <div class="tips " v-show="isActive">
          <i class="el-icon-close "></i>
          {{errorMessage}}
        </div>
      </div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-coding",
  props: ["id","callback"],
  components: {
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      if(formData.value) {
        this.setValue(formData.value);
      }
      if(formData.isFrequentlySearch) { //判断是否常用查询
        formData.placeholder = formData.discript || formData.name;
      }
      return formData;//this.$parent.findField(this.id);
    }
  },
  watch: {
    'field.value': {
      deep: true,
      handler:function(){
        if (this.field.refreshOnChanged) {//判断是否需要刷新
          this.$parent.refresh(this.id);
        }
        if(!this.field.value) {
          this.value = '';
        }
      }
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  data: function() {
    return { 
      Constant,
      isActive:false,
      errorMessage:'',
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      value:'',
    };
  },
  methods: {
    setValue(value){
      this.value = value;
    },
    onChange() {
      this.field.value = this.value;
    },
  },
  
};
</script>

<style lang="scss" scoped>

</style>
