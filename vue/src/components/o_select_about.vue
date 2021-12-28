<template>
  <span :id="id" :name="field.name+'_show'" class="select-about-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->

      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
      {{field.value}}
      </div>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div 
        class="select-wrap"
        @mouseenter="enter()"
        >
        <div class="transfer-box">
          <div>
            <el-transfer
              :id="field.divId"
              :data="options"
              target-order="push"
              v-model="selectData"
              @change="onChange(selectData)"
              @right-check-change="chooseRightBox"
            >
              <!-- {{$t('btns.up')}} -->
              <!-- {{$t('btns.down')}} -->
              <el-button @click="handleUp" slot="right-footer" size="mini" style="margin-left:8px">上移</el-button>
              <el-button @click="handleDown" slot="right-footer" size="mini">下移</el-button>
            </el-transfer>
          </div>
          <span v-if="field.instantValidate" class="mark">*</span>
        </div>
        <div class="tips" v-show="isActive">
          <i class="el-icon-close "></i>
          {{errorMessage}}
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
      </div>
    </template>
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <div 
          class="select-wrap"
          @mouseenter="enter()"
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
        <el-transfer
          disabled
          :id="field.divId"
          :data="options"
          target-order="push"
          v-model="selectData"
        >
        </el-transfer>

        <!-- 只读（控件模式） -->
      </template>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-select-about",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      return this.$parent.findField(this.id);
    },
    options: function() {
      let data = [];
      let selectData = [];
      let field = this.$parent.findField(this.id);
      if(field.value) {
        let arr = field.value.split(";");
        if(arr && arr.length>0) {
          for(let i=0; i<arr.length; i++) {
            for(let y=0;y<field.options.length;y++){
              if(field.options[y].value == arr[i]){
                selectData.push(field.options[y].option);
              }
            }
          }
        }
      }
      field.options.forEach(option => {
        data.push({
          key: option.option,
          label: option.option,
          disabled: field.displayType == 1?true:false,
          value: option.value,
        });
      });
      this.selectData = selectData;
      return data;
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
      isActive: false,
      errorMessage:'',
      Constant,
      selectData:[],
      showLogsDialog: false,
      showLogsIcon:true,
      operationData:'',
      rightSelectIndex:'',
      rightSelectItem: [],
    };
  },

  methods: {
    chooseRightBox (value) {
      this.rightSelectItem = value;
    },

    handleUp(){
      if(this.rightSelectItem.length == 1) {
        this.selectData.find((val, index) => {
          if (val == this.rightSelectItem) {
            this.rightSelectIndex = index; // 数组项的下标就是我当前选中项的下标
          }
        });
        if (this.rightSelectIndex == 0) {
          // this.$t('msg.no_space')
          return this.$message.info("没有上移的空间了");
        }
        let changeItem = JSON.parse(JSON.stringify(this.selectData[this.rightSelectIndex - 1]));
        this.selectData.splice(this.rightSelectIndex - 1, 1);
        this.selectData.splice(this.rightSelectIndex, 0, changeItem);
        this.rightSelectIndex = this.rightSelectIndex - 1;
        this.sortOnChange(this.selectData)
      }else {
        // this.$t('msg.choose_one')
        return this.$message.error("只能选择一条数据进行上下移动");
      }
    },

    handleDown () {
      if (this.rightSelectItem.length == 1) {
        this.selectData.find((val, indexs) => {
          if (val == this.rightSelectItem) {
            this.rightSelectIndex = indexs;
          }
        });
        if (this.rightSelectIndex == this.selectData.length - 1) {
          // 这里是length-1,因为下标值从0开始
          return this.$message.info("已经是最后了!");
        }
        let changeItem = JSON.parse(JSON.stringify(this.selectData[this.rightSelectIndex]));
        this.selectData.splice(this.rightSelectIndex, 1);
        this.selectData.splice(this.rightSelectIndex + 1, 0, changeItem);
        this.rightSelectIndex = this.rightSelectIndex + 1;
        this.sortOnChange(this.selectData)
      } else {
        return this.$message.error("只能选择一条数据进行上下移动");
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

    sortOnChange(selectData){
      let value = '';
      if(selectData && selectData.length>0) {
        for(let i=0; i<selectData.length; i++) {
          for(let y=0; y<this.options.length; y++){
            if(selectData[i] == this.options[y].label){
              value += this.options[y].value + ";";
            }
          }
        }
      }else {
        value = ''
      }
      this.field.value = value.replace(/^(\s|;)+|(\s|;)+$/g, '');
    },

    onChange(selectData) {
      let value = '';
      if(selectData && selectData.length>0) {
        for(let i=0; i<selectData.length; i++) {
          for(let y=0; y<this.options.length; y++){
            if(selectData[i] == this.options[y].label){
              value += this.options[y].value + ";";
            }
          }
        }
      }else {
        value = ''
      }
      this.field.value = value.replace(/^(\s|;)+|(\s|;)+$/g, '');
      let field = this.field;
      if (field.refreshOnChanged) {//判断是否需要刷新
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
      if(field.instantValidate) {
        this.evenCheck();
      }
    },

    evenCheck(){
      let value = true;
      let formData = this.$parent.checkData(value);
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
    },
  }
};
</script>
<style lang="scss" scoped>
  // .component-input-span {
    
  // }
  
</style>