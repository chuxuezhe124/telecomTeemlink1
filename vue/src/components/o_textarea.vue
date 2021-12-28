<template>
  <span :id="id" :name="field.name+'_show'" class="textarea-control" style="width:100%;">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType.toLowerCase() == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <el-input
        type="hidden"
        :title="field.value"
        :style="field.style"
        v-model="field.value"
      ></el-input>
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.value}}
      </div>
    </template>
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <div class="text-wrap">
          <div 
            class="area"
            @mouseenter="enter()"
          >
            <div style="white-space: pre-wrap;">{{field.value}}</div>
            <i 
              class="fa fa-history icon-log" 
              @click="getOperationLogs" 
              style="color:#46d2db" 
              v-if="showLogsIcon && field.isModified" 
              aria-hidden="true">
            </i>
            <form_operation 
              v-if="showLogsDialog"
              :docId="field.docId"
              :operationData="operationData"
              @event="hiddenLogsDialog"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <div class="text-wrap">
          <div 
            class="area"
            :style="{width:field.width?field.width + 'px':''}"
            @mouseenter="enter()"
          >
            <el-input
              type="textarea"
              class="input-width"
              rows="2"
              :readonly="true"
              :title="field.value"
              resize="none"
              :style="{height:field.textareaHeight?field.textareaHeight+'px':''}"
              v-model="field.value"
            >
            </el-input>
            <i 
              class="fa fa-history icon-log" 
              @click="getOperationLogs" 
              style="color:#46d2db" 
              v-if="showLogsIcon && field.isModified" 
              aria-hidden="true">
            </i>
            <form_operation 
              v-if="showLogsDialog"
              :docId="field.docId"
              :operationData="operationData"
              @event="hiddenLogsDialog"
            />
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div class="text-wrap">
        <div 
          :style="{width:(field.width || field.textareawidth) ?(field.formShowType == 'new' ? field.textareawidth : field.width) + 'px':''}"
          class="area"
          @mouseenter="enter()"
        >
          <el-input
            ref="textArea"
            class="input-width"
            type="textarea"
            :rows="isSearchForm?1:2"
            :placeholder="field.placeholder?field.placeholder:$t('placeholder.content')"
            :title="field.value"
            :style="{height:field.textareaHeight?field.textareaHeight+'px':''}"
            resize="none"
            v-model="field.value"
            @change="onChange"
            @blur="handleBlurChange"
          >
          </el-input>
          <span v-if="field.instantValidate" class="mark">*</span>
          <i 
            class="fa fa-history icon-log" 
            @click="getOperationLogs" 
            style="color:#46d2db" 
            v-if="showLogsIcon && field.isModified" 
            aria-hidden="true">
          </i>
          <form_operation 
            v-if="showLogsDialog"
            :docId="field.docId"
            :operationData="operationData"
            @event="hiddenLogsDialog"
          />
        </div>
        <div class="tips" v-show="isActive">
          {{errorMessage}}
        </div>
      </div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js"
import form_operation from "@/components/form_operation_log"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-textarea",
  props: ["id", "isSearchForm"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      if(formData.dataMapping) {//视图选择框设置了数据映射，多行文本框得隐藏，多行文本框只是用于数据的存储
        formData.displayType = Constant.PermissionType_HIDDEN
      }
      return this.$parent.findField(this.id);
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.textType == "hidden" || field.displayType == Constant.PermissionType_HIDDEN){
        if(field.isHideType) {
          let id = this.id,
            formShowType = field.formShowType;
          controlHidden({id, field, formShowType})
        }
      }
      
      if(field.customStyle) {
        let customStyle = field.customStyle.content;
        customStyle = customStyle.split("{")[1].split("}")[0];
        // this.$refs.textArea.$refs.textarea.style = customStyle;
        if(field.displayType == Constant.PermissionType_MODIFY) {
          if(this.$refs.textArea){
            this.$refs.textArea.$refs.textarea.style = customStyle;
          }
        }
        
      }
      
    })
  },
  data: function() {
    return { 
      Constant,
      isActive:false,
      errorMessage:'',
      showLogsIcon: true,
      tableData:[],
      showLogsDialog: false,
      operationData:'',
    };
  },
  methods: {
    hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
    },

    getOperationLogs() {
      let obj = {};
      obj.fieldName = this.field.name;
      this.operationData = obj;
      this.showLogsDialog = true;
    },

    enter(){
      if(this.field.isModified) {
        this.showLogsIcon = true;
      }
    },
    
    handleBlurChange() {
      let field = this.field
      if(field.instantValidate) {
        let value = true;
        let formData = this.$parent.checkData(value, field.docId);
          //item[this.field.name] = this.field.value;
        this.$api.formValidation(
          this.$root.appid, 
          formData,
          {
            onSucess: response => {
              if(response.data.errcode == 4001) {
                if(response.data.errors && response.data.errors.length > 0) {
                  let arr = response.data.errors;
                  for(let i=0; i<arr.length; i++) {
                    if(field.name == arr[i].field) {
                      this.isActive = true;
                      this.errorMessage = arr[i].errmsg
                      return;
                    }else {
                      this.isActive = false;
                      this.errorMessage = '';
                    }
                  }
                }
              }else if(response.data.errcode == 0) {
                this.isActive = false;
              }
            }
          }
        )
      }
    },

    onChange(){
      if (this.field.refreshOnChanged){
        // this.$parent.refresh(this.id);
        let havePar = false;
        let par  = '';
        while(!havePar) {
          par = par + '.$parent';
          let url = 'this' + par + '.refresh';
          if(eval(url)) {
            let path = url + '(' + "'"+ this.id +"'" + ')';
            eval(path);
            break
          }
        }
      }
    }
  },
  
};
</script>
