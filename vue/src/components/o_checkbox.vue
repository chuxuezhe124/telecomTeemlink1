<template>
  <span :id="id" :name="field.name+'_show'" class="checkbox-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <span
        :id="field.divId"
        :fieldType="field.formField"
        :data-label="field.name"
        :name="'span_'+field.name"
        :discript="field.discript"
        style="display:none"
      >
        <label
          v-for="options in field.options"
          :key="options.value"
          class="checkbox-inline obpm-checkbox"
        >
          <input
            :text="options.option"
            type="checkbox"
            :value="options.value"
            :name="field.name"
            :class="field.cssClass"
            class="checkboxWid"
            :isRefreshOnChanged="field.refreshOnChanged"
            v-model="value"
          >
          <span class="displayi-b">{{options.option}}</span>
        </label>
        <br v-if="field.layout && field.layout.toLowerCase()=='vertical'">
      </span>
     <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印 -->
      <div>
        {{field.checkShowValue}}
      </div>
    </template>

    <!--只读-->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <span
          :id="field.divId"
          class="check-input"
          @mouseenter="enter()"
        >
          <div>
            {{escape(field.value)}}
          </div>
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
        </span>
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <span
          class="checkbox-readonly check-input"
          :id="field.divId"
          @mouseenter="enter()"
        >
          <el-checkbox-group v-model="value">
            <el-checkbox 
              disabled
              v-for="options in field.options" 
              :key="options.value" 
              :text="options.option"
              :class="field.layout=='horizontal'?'checkbox-inline obpm-checkbox':vertical"
              :isRefreshOnChanged="field.refreshOnChanged" 
              :value="options.value"
              :label="options.value"
              >{{escape(options.option)}}</el-checkbox>
          </el-checkbox-group>
          <br v-if="field.layout && field.layout.toLowerCase()=='vertical'">
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
        </span>
      </template>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <span
        :id="field.divId"
        class="check-input"
        @mouseenter="enter()"
      >
        <div :class="[isActive ? 'instantVerification':'', 'checkbox-wrap']">
          <el-checkbox-group v-model="value">
            <el-checkbox 
              v-for="(options,index) in field.options" 
              :key="index" 
              :class="field.layout=='horizontal'?'checkbox-inline obpm-checkbox':vertical"
              :value="options.value"
              :label="options.value"
              @change="onChange"
              >{{escape(options.option)}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="tips" v-show="isActive">
          {{errorMessage}}
        </div>
        <br v-if="field.layout && field.layout.toLowerCase()=='vertical'">
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
      </span>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-checkbox",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let allData = this.$parent.findField(this.id)
      // if(allData.options && allData.options.length) {
      //   for(let i=0; i<allData.options.length; i++) {
      //     if(allData.options[i].def) {
      //       allData.options[i].def = false;
      //       allData.value = allData.value +";" + allData.options[i].value;
      //     }
      //   }
      // }
      allData.selectAalueArr = []
      let value = []
      if(allData.value){
        let checkReallyArray = allData.value.split(";")
        let checkShowValue = ""
        for(let i=0; i<checkReallyArray.length; i++) {
            for(let j=0; j<allData.options.length; j++) {
              if(checkReallyArray[i] == allData.options[j].value) {
                checkShowValue += allData.options[j].option + ';'
                value.push(checkReallyArray[i])
              }
            }
          }
        allData.checkShowValue = checkShowValue
      }else {
        let options = allData.options
        let checkShowValue = "";

        for(let i=0; i<options.length; i++) {
          if(options[i].def) {
            checkShowValue += options[i].option + ';'
            value.push(options[i].value)
          }
        }
        allData.checkShowValue = checkShowValue
      }
      let formData = this.setField(allData, value)
      return formData
    },
    // value: {
    //   get: function() { 
    //     let val = this.field.value;
    //     if(val) {
    //       return this.field.value.split(";");
    //     } else {
    //       return [];
    //     }
        
    //   },
    //   set: function(newValue) {
    //     debugger
    //     let val = newValue.join(";");
    //     this.field.value = val.replace(/^(\s|;)+|(\s|;)+$/g, '');
    //     return newValue;
    //   }
    // }
  },
  watch: {
    'field.displayType': {
      deep: true,
      handler:function(newV,oldV){
        let field = this.field;
        if(field.isHideType) {
          let id = this.id,
            formShowType = field.formShowType;
          controlHidden({id, field, formShowType})
        }
      }
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
    })
  },
  data: function() {
    return { 
      Constant, 
      selectedOption: {},
      vertical:'input-vertical',
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      isActive:false,
      errorMessage:'',
      operationData: '',
      value: [],
    };
  },
  methods: {
    escape(value) { //特殊字符转义
      if(value.indexOf('&radic;') > -1) {
        value = value.replace('&radic;','√');
      }else if(value.indexOf('&times;') > -1) {
        value = value.replace('&times;','×');
      }else {
        value = value;
      }
      return value
    },
    setField(allData, value) {
      this.value = value;
      return allData;
    },
    hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
    },
    enter(){
      if(this.field.isModified) {
        this.showLogsIcon = true;
      }
    },
    getOperationLogs() {
      let obj = {};
      obj.fieldName = this.field.name;
      this.operationData = obj;
      this.showLogsDialog = true;
    },
    onChange() {
      let val = this.value;
      let field = this.field;
      field.value = val.join(";");
      if(field.instantValidate) {
        this.isFieldClear = false;
        let value = true;
        let formData = this.$parent.checkData(value);
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
      if (field.refreshOnChanged) {//判断是否需要刷新
        this.$parent.refresh(this.id);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
  .input-vertical {
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    font-weight: normal;
    cursor:pointer;
    margin-left:21px;
  }
</style>