<template>
  <span :id="id" :name="field.name+'_show'" class="date-picker-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <el-input
        :readonly="true"
        type="hidden"
        :style="field.style"
        :name="field.name"
        v-model.lazy="field.value"
        :title="field.title"
      />
       <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <!--打印-->
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.value}}
      </div>
    </template>

    <!--只读-->
    <template
      v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED"
    >
      <template v-if="field.readOnlyShowValOnly">
        <div 
          class="date-wrap"
          @mouseenter="enter()"
          :style="{width:field.width?field.width + 'px':'220px'}"
          >
          <template>{{field.value}}</template>
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
      <template v-else>
        <!-- 只读（控件模式） -->
        <div
        class="date-wrap"
        :style="{width:field.width?field.width + 'px':'220px'}">
          <template v-if="field.dateFormat=='yyyy-MM-dd HH:mm:ss'">
            <el-date-picker
              :placeholder="field.placeholder"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              :disabled="true"
              :style="field.style"
              :name="field.name"
              v-model="field.value"
              :title="field.title"
            />
          </template>
          <template v-else-if="field.dateFormat=='yyyy-MM-dd'">
            <el-date-picker
              :placeholder="field.placeholder"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              type="date"
              :disabled="true"
              :style="field.style"
              :name="field.name"
              v-model="field.value"
              :title="field.title"
            />
          </template>
          <template v-else-if="field.dateFormat=='yyyy-MM'">
            <el-date-picker
              :placeholder="field.placeholder"
              format="yyyy-MM"
              value-format="yyyy-MM"
              type="month"
              :disabled="true"
              :style="field.style"
              v-model="field.value"
            />
          </template>
          <template v-else-if="field.dateFormat=='yyyy'">
            <el-date-picker
              :placeholder="field.placeholder"
              format="yyyy"
              value-format="yyyy"
              type="year"
              :disabled="true"
              :style="field.style"
              v-model="field.value"
          />
          </template>
          <template v-else-if="field.dateFormat=='yyyy-MM-dd HH:mm'">
            <el-date-picker
              :placeholder="field.placeholder"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              :disabled="true"
              :style="field.style"
              v-model="field.value"
            />
          </template>
          <template v-else-if="field.dateFormat=='HH:mm:ss'">
            <el-time-picker
              :disabled="true"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              arrow-control
              v-model="field.value"
              :picker-options="{
                selectableRange: '00:00:00 - 23:59:59'
              }"
              :placeholder="$t('placeholder.time')"
              @change="onChange">
            </el-time-picker>
          </template>
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

    <!--编辑-->
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div 
        class="date-wrap"
        @mouseenter="enter()"
        :style="{width:field.width?field.width + 'px':'220px'}"
        >
        <template v-if="field.dateFormat=='yyyy-MM-dd HH:mm:ss'">
          <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
            :picker-options="pickerOptions"
            ref="datePicker"
          />
        </template>
        <template v-else-if="field.dateFormat=='yyyy-MM-dd'">
          
          <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            type="date"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
            :picker-options="pickerOptions"
            ref="datePicker"
          />
        </template>
        <template v-else-if="field.dateFormat=='yyyy-MM'">
          <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            format="yyyy-MM"
            value-format="yyyy-MM"
            type="month"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
            :picker-options="pickerOptions"
            ref="datePicker"
          />
        </template>
        <template v-else-if="field.dateFormat=='yyyy'">
          <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            format="yyyy"
            value-format="yyyy"
            type="year"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
            :picker-options="pickerOptions"
            ref="datePicker"
          />
        </template>
        <template v-else-if="field.dateFormat=='yyyy-MM-dd HH:mm'">
          <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
            :picker-options="pickerOptions"
            ref="datePicker"
          />
        </template>
        <template v-else-if="field.dateFormat=='HH:mm:ss'">
          <!-- <el-date-picker
            :time-arrow-control='true'
            :placeholder="field.placeholder"
            type="datetime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            :style="field.style"
            v-model="field.value"
            @change="onChange"
          /> -->
          <el-time-picker
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            arrow-control
            v-model="field.value"
            :picker-options="{
              selectableRange: '00:00:00 - 23:59:59'
            }"
            :placeholder="$t('placeholder.time')"
            @change="onChange"
            ref="datePicker"
            >
          </el-time-picker>
        </template>
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
        <i class="el-icon-close "></i>
          {{errorMessage}}
      </div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-date-picker",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return formData;//this.$parent.findField(this.id);
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.customStyle) {
        let customStyle = field.customStyle.content;
        customStyle = customStyle.split("{")[1].split("}")[0];
        if(field.displayType == Constant.PermissionType_MODIFY) {
          if(this.$refs.datePicker) {
            this.$refs.datePicker.$refs.reference.$refs.input.style = customStyle
          }
        }  
      }
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  methods: {
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

    onChange(e) {
      if(this.field.prev_Name) { //当有设置限定日期时，日期控件仍可以选择当天（当天<限定的开始时间），不让它选择
        let startField;
        let startFieldName = this.field.prev_Name;
        let fields = this.$parent.getAllFields();
        if (fields)
          for (let i = 0; i < fields.length; i++) {
            if (startFieldName == fields[i].name) {
              startField = fields[i];
              break;
            }
          }
        if (startField) {
          let val = startField.value?startField.value:startField.text;//开始时间
          if(val > e) {
            this.field.value = "";
            this.$confirm(this.$t('view.no'), this.$t('tip'), {
              confirmButtonText: this.$t('msg.confirm'),
              cancelButtonText: this.$t('btns.cancel'),
              type: 'warning'
            })
            return
          }
        }
      }
      let field = this.field;
      if(!e) {
        field.value = '';
      }
      if (field.refreshOnChanged) {
        this.$parent.refresh(this.id);
      }
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
    findStartField() {}
  },
  data: function() {
    return {
      isActive:false,
      errorMessage:'',
      Constant,
      pickerOptions: {
        disabledDate: time => {
          let resData =  '';
          if(this.field.prev_Name) { //开始
            let startField;
            let startFieldName = this.field.prev_Name;
            let fields = this.$parent.getAllFields();
            if (fields)
              for (let i = 0; i < fields.length; i++) {
                if (startFieldName == fields[i].name) {
                  startField = fields[i];
                  break;
                }
              }
            if (startField) {
              let val = startField.value?startField.value:startField.text;
              return new Date(val).getTime() >= (time.getTime()+86400000);
            }
            // return false;
          }else { //结束
            let fields = '';
            let endField;
            fields =  this.$parent.getAllFields();
            if (fields)
              for (let i = 0; i < fields.length; i++) {
                if (fields[i].prev_Name == this.field.name){
                  endField = fields[i];
                  break;
                }
              }
            if (endField && endField.value) {
              return  new Date(endField.value).getTime() <= time.getTime();
            }else {
              return false;
            }
          }
        }
      },
      pickerOptions1: {
        disabledDate: time => {
          let endField;
          let fields = this.$parent.getAllFields();
          if (fields)
            for (let i = 0; i < fields.length; i++) {
              if (fields[i].prev_Name == this.field.name){
                endField = fields[i];
                break;
              }
            }
          if (endField) {
            return  new Date(endField.value).getTime() < time.getTime();
          }
          return false;
        }
      },
      pickerOptions2: {
        disabledDate: time => {
          //当为结束日期时，结束日期不能小于起始日期
          //拿回起始日期
          let startField;
          let startFieldName = this.field.prev_Name;
          let fields = this.$parent.getAllFields();
          if (fields)
            for (let i = 0; i < fields.length; i++) {
              if (startFieldName == fields[i].name) {
                startField = fields[i];
                break;
              }
            }
          if (startField) {
            return  new Date(startField.value).getTime() > time.getTime();
          }
          return false;
        }
      },
      showLogsDialog: false,
      showLogsIcon:true,
      operationData:'',
    };
  }
};
</script>