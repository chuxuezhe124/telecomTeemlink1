<template>
  <span :id="id" :name="field.name+'_show'" class="suggest-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType.toLowerCase() == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <input type="hidden" v-model="field.value" />
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印 -->
      {{field.printHiddenValue?field.printHiddenValue:field.value}}
      
    </template>

    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <div 
          class="suggest-wrap"
          :style="{width:field.width?field.width + 'px':''}"
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
        <!-- 只读（控件模式） -->
        <!-- <el-autocomplete readonly class="inline-input" v-model="field.value"></el-autocomplete> -->
        <div 
          class="suggest-wrap"
          :style="{width:field.width?field.width + 'px':''}"
          @mouseenter="enter()"
        >
          <el-input
            :readonly="true"
            type="text"
            :name="field.name"
            v-model.lazy="field.value"
            :title="field.title"
          />
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
        class="suggest-wrap"
        :style="{width:field.width?field.width + 'px':''}"
        @mouseenter="enter()"
      >
        <span class="select-box">
          <el-autocomplete
            class="inline-input"
            v-model="value"
            ref="suggest"
            :fetch-suggestions="querySearch"
            :placeholder="$t('placeholder.content')"
            :trigger-on-focus="false"
            @select="handleSelect($event)" 
            @input="onChange"
          >
            <template slot-scope="scope">
              <el-tooltip class="item-scope" effect="dark" :content="scope.item.value" >
                <p v-html="setFontColor(scope.item.value)"></p>
              </el-tooltip>
            </template>
          </el-autocomplete>
          <span v-if="field.instantValidate" class="mark">*</span>
        </span>
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
  </span>
</template>

<script>
import form_operation from "@/components/form_operation_log";
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
import API from "@/api.js";
export default {
  name: "o-suggest",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.dataMode == 'local') {
        let haveValue = false;
        for(let i=0; i < formData.options.length; i++){
          if(formData.value ===  formData.options[i].value) {
            haveValue = true;
            this.setCurrentValue(formData.options[i].option)
          }
          let temp = formData.options[i].option;
          formData.options[i].option =formData.options[i].value;
          formData.options[i].value = temp;
        }
        if(!haveValue && formData.value) {
          this.setCurrentValue(formData.value)
        }
      }else if(formData.dataMode == 'remote') {
        if(formData.value) {
          this.getQuerySearch(formData.formId, formData.docId, formData.divId, formData.value);
        }
      }

      // }else if(this.field.dataMode == 'remote') {
      //    
      // }
      return this.$parent.findField(this.id);
    },
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.customStyle) {
        let customStyle = field.customStyle.content;
        customStyle = customStyle.split("{")[1].split("}")[0];
        this.$refs.suggest.$refs.input.$refs.input.style = customStyle;
      }
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
      restaurants:[],
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      options:[],
      value:'',
      isActive:false,
      errorMessage:'',
    };
  },

  methods: {    
    setFontColor(value) {
      let val = value.replace(this.value,"<span class='current-color'>"+this.value+"</span>");
      return val;
    },
    getQuerySearch(formId, docId, divId, value) {
      let appId = this.$root.appid;
      API.intellectTip(
        appId,
        formId,
        docId,
        {
          formFieldId: divId,
          keyword: value,
          parentId: "",
        },
        {
          onSucess: res => {
            let data = res.data.data;
            if(data && data.length > 0) {
              if(data.length == 1) {
                this.value = value;
              }else {
                for(let i=0; i<data.length; i++) {
                  if(value === data[i].id) {
                    this.value = data[i].name;
                  }
                }
              } 
            }else {
              this.value = value;
            }
          }
        }
      );
    },

    setCurrentValue(value) {
      this.value = value;
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
    handleSelect(ev) {
      if(this.field.dataMode == 'local'){
        this.field.value = ev.option
      }else if(this.field.dataMode == 'remote'){
        this.field.value = ev.id;
      }
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
        // this.$parent.refresh(this.id);let havePar = false;
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
    querySearch(queryString, cb) {
      if(this.field.dataMode == 'local'){
        let options = this.field.options;
        // console.log("options--->",options);
        // for(let i=0; i < options.length; i++){
        //   // options[i].value = options[i].name;
        //   let temp = options[i].option;
        //   options[i].option = options[i].value;
        //   options[i].value = temp;

        // }
        let results = queryString
          ? options.filter(this.createFilter(queryString))
          : options;
        // 调用 callback 返回建议列表的数据
        cb(results);
        
      }else if(this.field.dataMode == 'remote'){
        let appId = this.$root.appid;
        let formId = this.field.formId;
        let docId = this.field.docId;
        API.intellectTip(
          appId,
          formId,
          docId,
          {
            formFieldId: this.field.divId,
            keyword: this.value,
            parentId: "",
          },
          {
            onSucess: response => {
              let options = response.data.data;
              for(let i=0; i < options.length; i++){
                options[i].value = options[i].name;
              }
              this.options = options;
              let results = queryString 
                ? options.filter(this.createFilter(queryString)) 
                : options;
              cb(results);
            }
          }
        );
      
      }
      
    },
    createFilter(queryString) {
      return options => {
        return (
          options.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
        );
      };
    },
    onChange() {
      if(!this.value) {
        this.field.value = '';
      }else {
        this.field.value = this.value;
      }
      // // if (this.field.refreshOnChanged){//判断是否需要刷新
      // //    
      // //   this.$parent.$parent.refresh(this.id);
      // // }
      // this.$parent.refresh(this.id);
      
    },
  }
};
</script>

<style lang="scss">
.current-color {
  font-weight: bold;
}
</style>