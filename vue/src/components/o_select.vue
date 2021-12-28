<template>
  <span :id="id" :name="field.name+'_show'" class="select-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <input type="hidden" v-model="field.value" />
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印页面显示的 -->
      <div v-if="field.multiSelect">
        {{field.multiSelectValue}}
      </div>
      <div v-else>
        {{field.impressionVal}}
      </div>
    </template>
    <!--只读-->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <!-- 只读（文本模式） -->
      <template v-if="field.readOnlyShowValOnly">
        <!-- <input type="hidden" v-model="field.value" /> -->
        <div
          class="select-wrap"
          @mouseenter="enter()" 
          >
         <span class="select-box" v-if="field.multiSelect">{{field.value?field.multiSelectValue:''}}</span >
          <span class="select-box" v-else>
            {{field.value?field.impressionVal:''}}
          </span>
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
      </template>
         
      <!-- 只读（控件模式） -->
      <template v-else>
        <div
          class="select-wrap"
          @mouseenter="enter()" 
        >
          <span class="select-box">
            <template v-if="field.multiSelect">
              <el-select 
                disabled
                :style="{width:field.width?field.width + 'px':''}"
                v-model="multiValue" 
                multiple
                >
                <el-option
                  v-for="(item,index) in field.options"
                  :key="index"
                  :label="item.option"
                  :value="item.value"
                  :selected="item.value==field.value?'true':'false'"
                  >
                </el-option>
              </el-select>
            </template>
            <el-select 
              disabled
              :style="{width:field.width?field.width + 'px':''}"
              v-model="field.value" 
              v-else
            >
              <el-option
                v-for="item in field.options"
                :key="item.value"
                :label="item.option"
                :value="item.value"
                :selected="item.value==field.value?'true':'false'"
                >
              </el-option>
            </el-select>
          </span>
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
      </template>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div
        class="select-wrap"
        @mouseenter="enter()" 
      >
        <span class="select-box" v-if="field.multiSelect">
          <el-select 
            :popper-append-to-body='true' 
            v-model="multiValue" 
            :style="{width:(field.width || field.selectwidth) ?(field.formShowType == 'new' ? field.selectwidth : field.width) + 'px':''}"
            multiple
            @change="onChange"
            >
            <el-option
              v-for="(item,index) in field.options"
              :key="index"
              :label="item.option"
              :value="item.value"
              :selected="item.value==field.value?'true':'false'"
              >
            </el-option>
          </el-select>
          <span 
            v-if="field.instantValidate" 
            slot="suffix"  
            class="el-input__icon"
            style="color:red;">
              *
          </span>
          <div class="tips" v-show="isActive">
            {{errorMessage}}
          </div>
        </span>
        <span class="select-box" v-else>
          <el-select
            :popper-append-to-body='true' 
            v-model="field.value" 
            :style="{width:(field.width || field.selectwidth) ?(field.formShowType == 'new' ? field.selectwidth : field.width) + 'px':''}"
            @change="onChange"
            ref="select"
            >
            <el-option
              v-for="(item,index) in field.options"
              :key="index"
              :label="item.option"
              :value="item.value"
              :selected="item.value==field.value?'true':'false'"
              >
            </el-option>
          </el-select>
          <span 
            v-if="field.instantValidate" 
            slot="suffix"  
            class="el-input__icon"
            style="color:red;">
              *
          </span>
          <div class="tips" v-show="isActive">
            {{errorMessage}}
          </div>
        </span>
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
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-select",

  props: ["id","isPrint"],

  components: {
    form_operation,
  },

  computed: {
    field: function() {
      let allData = this.$parent.findField(this.id);
      allData.multiValue = [];
      if(!allData.value) {
        // allData没有值
        for(let i = 0; i < allData.options.length; i++) {
          if(allData.options[i].def == true) {
            allData.value = allData.options[i].value;
          }
        }
      }else if(allData.multiSelect && allData.value) {
        if((allData.displayType == Constant.PermissionType_READONLY && allData.readOnlyShowValOnly) || allData.displayType == Constant.PermissionType_PRINT || allData.displayType == Constant.PermissionType_DISABLED) {
          let valArray = allData.value.split(";");
          let multiSelectValue = '';
          for(let i=0; i<valArray.length; i++) {
            for(let j=0; j<allData.options.length; j++) {
              if(valArray[i] == allData.options[j].value) {
                multiSelectValue += allData.options[j].option + ';';
              }
            }
          }
          allData.multiSelectValue = multiSelectValue.replace(/^(\s|;)+|(\s|;)+$/g, "");
        }
        this.setValue(allData.value, allData);
      }else {
        for(let i = 0; i < allData.options.length; i++) {
          if(allData.value == allData.options[i].value) {
            allData.impressionVal = allData.options[i].option;
          }
        }
      }
      return allData//this.$parent.findField(this.id);
    }
  },

  mounted() {
    this.$nextTick(() => {
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
        if(field.displayType == Constant.PermissionType_MODIFY) {
          if(this.$refs.select) {
            this.$refs.select.$refs.reference.$refs.input.style = customStyle
          }
        }  
      }
    })
  },

  watch: {
    // field(newV,oldV){ //下拉框联动时需要监听每一次值改变，判断是否要刷新
    //   let field = this.field;
    //   if(field.refreshMode && field.refreshMode == 1) {
    //     if(newV.value != oldV.value) {
    //       let havePar = false;
    //       let par  = '';
    //       while(!havePar) {
    //         par = par + '.$parent';
    //         let url = 'this' + par + '.refresh';
    //         if(eval(url)) {
    //           let path = url + '(' + this.id + ')';
    //           eval(path);
    //           break
    //         }
    //       }
    //     }
    //   }
    //   if(!newV.value) {
    //     field.impressionVal = '';
    //   }
    // },
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
    'field.value':{ //监听的对象
      deep:true, //深度监听设置为 true
      handler:function(newV,oldV){
        if(this.field.refreshOnChanged){
          let havePar = false;
          let par  = '';
          if(newV !== oldV) {
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
        if(!newV) {
          this.field.impressionVal = ''
          this.multiValue = []
          this.field.multiSelectValue = ''
        }
      }
    },
    
    // field(){
    //   if (this.field.refreshOnChanged) {//判断是否需要刷新
    //     let havePar = false;
    //     let par  = '';
    //     while(!havePar) {
    //       par = par + '.$parent';
    //       let url = 'this' + par + '.refresh';
    //       if(eval(url)) {
    //         let path = url + '(' + "'"+ this.id +"'" + ')';
    //         eval(path);
    //         break
    //       }
    //     }
    //   }
    // },
  },

  data: function() {
    return { 
      Constant, 
      selectedOption: {},
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      isActive:false,
      errorMessage:'',
      multiValue: [], //多选时的数组
    };
  },
  
  methods: {
    setValue(value, allData) {
      let arr = [];
      if(value.indexOf(";") > -1) {
        let valArr = value.split(";");
        let ops = allData.options;
        // 数组去重
        valArr = Array.from(new Set(valArr))
        valArr.forEach(el => {
          for(let i=0; i<ops.length; i++) {
            if(ops[i].value == el) {
              arr.push(ops[i].value);
            }
          }
        });
        this.multiValue = arr;
      }else {
        for(let i = 0; i < allData.options.length; i++) {
          if(value == allData.options[i].value) {
            arr.push(allData.options[i].value);
            this.multiValue = arr;
          }
        }
      }
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
      let field = this.field;
      if(field.multiSelect) {
        let value = this.multiValue.join(";");
        this.field.value = value;
      }
      if(field.instantValidate) {
        this.isFieldClear = false;
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
    },
  },
};
</script>