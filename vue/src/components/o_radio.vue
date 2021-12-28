<template>
  <span :id="id" :name="field.name+'_show'" class="radio-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <input type="hidden" v-model="field.value" />
       <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印 -->
      {{field.displayValue}}
    </template>

    <!--只读-->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式）-->
        <span
          class="local"
          :id="field.divId"
          @mouseenter="enter()">
          <div :id="field.name_show">{{field.displayValue}}</div>
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
          class="local"
          :id="field.divId"
          @mouseenter="enter()">
          <el-radio-group 
            v-for="options in field.options" 
            :key="options.value"
            v-model="field.value" 
            :class="field.layout=='horizontal'?'radio-inline obpm-radio':vertical">
            <el-radio
              disabled 
              :text="options.option" 
              :value="options.value" 
              :name="field.name" 
              :isRefreshOnChanged="field.refreshOnChanged" 
              :label="options.value">{{options.option}}</el-radio>
            <span class="displayi-b">{{options.option}}</span>
          </el-radio-group>
          <br v-if="field.layout && field.layout.toLowerCase()=='vertical'"/>
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
      <span v-if="field.textType == 'readonly'">
        {{field.displayValue}}
      </span>
      <span 
        v-else
        class="local"
        @mouseenter="enter()"
      >
        <div :class="[isActive ? 'instantVerification':'', 'radio-wrap']">
          <el-radio-group 
            v-for="options in field.options" 
            :key="options.value" 
            v-model="field.value" 
            :class="field.layout=='horizontal'?'radio-inline obpm-radio':vertical">
              <el-radio
                :text="options.option" 
                :value="options.value" 
                :name="field.name" 
                :isRefreshOnChanged="field.refreshOnChanged" 
                :label="options.value"
                @change="onChange">{{escape(options.option)}}</el-radio>
              <span class="displayi-b">{{options.option}}</span>
          </el-radio-group>
        </div>
        <div class="tips" v-show="isActive">
          {{errorMessage}}
        </div>
        <br v-if="field.layout && field.layout.toLowerCase()=='vertical'"/>
        <i 
          class="fa fa-history icon-log " 
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
import Constant from "@/Constant.js"
import form_operation from "@/components/form_operation_log"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-radio",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let allData = this.$parent.findField(this.id);
      if(!allData.value) {
        if(allData.options && allData.options.length > 0) {
          for(let i=0; i<allData.options.length; i++) {
            if(allData.options[i].def) {
              allData.value = allData.options[i].value;
              allData.displayValue = allData.options[i].option;
            }
          }
        }
      }else {
        if(allData.options && allData.options.length > 0) {
          for(let i=0; i<allData.options.length; i++) {
            if(allData.value == allData.options[i].value) {
              allData.displayValue = allData.options[i].option;
            }
          }
        }
      }
      return this.$parent.findField(this.id);
    }
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
      operationData:'',
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
      if(this.field.instantValidate) {
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
                    if(this.field.name == arr[i].field) {
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
   
      if (this.field.refreshOnChanged){//判断是否需要刷新
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