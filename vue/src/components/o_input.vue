<template>
  <span :id="id" :name="field.name+'_show'" class="input-control" :style="{display:field.hiddenHtml?'none':'inline-block'}" :ref="id">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <template>
        <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
      </template>
      
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div v-if="field.textType == 'password'">
        •••
      </div>
      <div v-else>
        {{value}}
      </div>
    </template>
    <!-- 只读 -->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <div 
          class="input-wrap"
          @mouseenter="enter()" 
        >
          <div>
            {{value}}
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
      <template v-else-if="field.textType == 'password'">
        <el-input
          size="medium"
          :readonly="true"
          type="password"
          :style="field.style"
          :name="field.name"
          v-model.lazy="value"
          :title="field.title"
          @keydown.enter.native="nextFocus($event)"
        />
      </template>
      <template v-else>
        <div 
          :style="{width:field.width?field.width + 'px':''}"
          class="input-wrap"
        >
          <el-input
            size="medium"
            :disabled="true"
            type="text"
            :style="field.style"
            :name="field.name"
            v-model.lazy="value"
            :title="field.title"
            @keydown.enter.native="nextFocus($event)"
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
    <!--密码-->
    <template v-else-if="field.textType.toLowerCase() == 'password'">
      <el-input
        size="medium"
        type="password"
        :style="field.style"
        :name="field.name"
        v-model.lazy="value"
        :title="field.title"
        @change="onChange"
        @keydown.enter.native="nextFocus($event)"
      />
    </template>
    <!-- 可编辑 -->
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div 
        class="input-wrap"
        @mouseenter="enter()" 
        ref="inputWrap"
      >
        <el-input
          size="medium"
          class="input-p"
		      :style="fieldStyle"
          ref="inputP" 
          :placeholder="field.placeholder?field.placeholder:$t('placeholder.content')"
          type="text" 
          :name="field.name"
          v-model="value"
          :title="field.title"
          @blur="handleBlurChange"
          @change="onChange"
          @keydown.enter.native="nextFocus(field.fieldkeyevent)"
          @input="getValueLength(value)"
        >
        <i 
          v-if="field.textType=='tel'" 
          class="el-icon-phone el-input__icon tel" 
          slot="suffix">
        </i>
        <i 
          v-if="field.eventMapping"
          @click="viewDialogEventMapping"
          class="el-icon-zoom-in el-input__icon" 
          slot="suffix">
        </i> <!-- 视图选择框设置事件映射才显示 -->
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
        <i class="el-icon-close "></i>
          {{errorMessage}}
      </div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js"
import form_operation from "@/components/form_operation_log"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-input",
  props: ["id","callback"],
  components: {
    form_operation,
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
      if(formData.displayType == Constant.PermissionType_HIDDEN || formData.textType.toLowerCase() == 'hidden') {
        formData.hiddenHtml = true
      }
      
      return formData;//this.$parent.findField(this.id);
    }
  },
  watch: {
    'field.width':{
       handler:function(newV,oldV){
        let field = this.field;
        this.fieldStyle.width=field.width ? field.width + 'px':'';
      }
    },
    'field.displayType': {
      deep: true,
      handler:function(newV,oldV){
        let field = this.field
        if(field.displayType != Constant.PermissionType_HIDDEN && field.textType.toLowerCase() != 'hidden') {
          field.hiddenHtml = false
        }
        if(field.isHideType) {
          let id = this.id,
            formShowType = field.formShowType;
          controlHidden({id, field, formShowType})
        }
      }
    },
    'field.value':{ //监听的对象//'field.isRefresh':{ //监听的对象
      deep:true, //深度监听设置为 true
      handler:function(newV,oldV){
        this.value = newV
        let field = this.field
        if (field.refreshOnChanged) {//判断是否需要刷新
          if(field.refreshMode == 1) {
            let havePar = false;
            let par  = '';
            while(!havePar) {
              par = par + '.$parent';
              let url = 'this' + par + '.refresh';
              if(eval(url)) {
                let idd = JSON.stringify(this.id);
                let path = url + '(' + "'"+ idd +"'" + ')';
                eval(path);
                break
              }
            }
          }else {
            if(newV != oldV) {
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
        }
      }
    },
  },
 created(){
     this.definrInputLength()  
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
      if(field.customStyle) {
        let customStyle = field.customStyle.content;
        customStyle = customStyle.split("{")[1].split("}")[0];
        if(field.displayType == Constant.PermissionType_MODIFY) {
          if(this.$refs.inputP){
            this.$refs.inputP.$refs.input.style = customStyle;
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
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      value:'',
      fieldStyle:{},
    };
  },
  methods: {
    viewDialogEventMapping() {
      let eventMapping = true;
      this.$store.commit('saveEventMapping',eventMapping);
    },
    // strDes    [字符串]
    // delimiter [分隔符]
    parseStrObjByFor(strDes, delimiter) {
      var obj = {};
      if (strDes == null || strDes == "") {
        return obj;
      }
      delimiter = delimiter || ";";
      var arr = strDes.split(delimiter);
      var key, value, sub;
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] !== "") {
          sub = arr[i].split("=");
          sub = sub[0].split(":");
          console.log(sub[1]);

          key = sub[0];
          value = sub[1];
          if (key !== "") {
            obj[key] = value;
          }
        }
      }

      return obj;
    },
    getValueLength(value){
      let fieldtype = this.field.fieldtype;
      let textType = this.field.textType;
      if(fieldtype == 'VALUE_TYPE_NUMBER') {
        let origValue = "";
        let re = /^([\-]{1}[0-9]*|[0-9]*)\.?[0-9]*$/;
        let telReg =/^1\d{10}$/;
        if (!re.test(value)) {
          for (var i = 0; i < value.length; i++) {
            var s = value.charAt(i);
            if (isNaN(s)) {
              break;
            }
          }
          this.value = value.substring(0, i);
          return false;
        }
      }
      if(textType == "tel") {
        let telReg =/^1\d{10}$/;
        if (!telReg.test(value)) {
          for (var i = 0; i < value.length; i++) {
            var s = value.charAt(i);
            if (isNaN(s)) {
              break;
            }
          }
          this.value = value.substring(0, i);
          this.field.value = this.value;
          if(this.field.value.length > 11) {
            this.field.value = this.field.value.substring(0,11)
            return
          }
          return false;
        }
      }
    },
    setValue(value){
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
    handleBlurChange() {
      let field = this.field
      if(field.instantValidate) {
        let value = true;
        let formData = this.$parent.checkData(value, field.docId);
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
    nextFocus(value) {
      if(value == "Enterkey") {
        let inputs = document.getElementsByTagName("input"); 
        let arr = [];
        for(let i = 0;i<inputs.length;i++) {
          if(inputs[i].getAttribute('type') != 'hidden') {
            arr.push(inputs[i]);
          }
        }
        if(arr && arr.length > 0) {
          for(let i = 0;i<arr.length;i++){
            if(arr[i] == document.activeElement) {
              if(i==(arr.length-1)){ 
                arr[0].focus(); break; 
              }else { 
                arr[i+1].focus(); break; 
              } 
            }
          } 
        }
      }
      // for(let i = 0;i<inputs.length;i++){
      //   //console.log("inputs[i]------>",inputs[i]);
      //   //console.log(inputs[i].getAttribute('type'));
      //   //console.log(inputs[i].getAttribute('readonly'));
      //   if(inputs[i] == document.activeElement) {
          
      //     // if(i==(inputs.length-1)){ 
      //     //   inputs[0].focus(); break; 
      //     // }else { 
      //     //   inputs[i+3].focus(); break; 
      //     // } 
      //     if(inputs[i+1].getAttribute('type') == 'hidden') {
      //       inputs[i+2].focus(); break;
      //     }else {
      //       console.log("inputs[i+2]-->", inputs[i+2]);
            
      //     }
      //   }else {}
      // } 
      
    },
    onChange() {
      let field = this.field
      field.value = this.value
      if (field.refreshOnChanged) {//判断是否需要刷新
        // field.isRefresh = new Date().getTime()
      }
    },
    definrInputLength(){//获取后台设置的样式，定义在（可编辑）输入框中
      let field = this.field;
      this.fieldStyle.width=field.width ? field.width + 'px':'';
      // 下面代码的目的是在后台设置输入框百分比宽度的时候，使得vue输入框正确显示做的修改。10.19
     let id=this.id
     let fieldStyle = this.field.style;
        //只有在设置百分比长度的时候需要进行以下处理设置el-input的长度
        if( fieldStyle && fieldStyle.lastIndexOf("width:")!==-1 ){
          let index=fieldStyle.lastIndexOf("width:") + 6
               fieldStyle=fieldStyle.slice(index)
               console.log(fieldStyle,1)
               if(fieldStyle.indexOf("%")!==-1){
                 index=fieldStyle.indexOf("%")
                 fieldStyle=fieldStyle.slice(0,index)
                    console.log(fieldStyle,2)
                if(fieldStyle.length<=3){
                  console.log(fieldStyle,3)
                  fieldStyle=parseFloat(fieldStyle)
                
                  this.$refs.inputWrap.style.width="100%"
                  document.getElementById(id).style.width="100%" 
                  // this.field.width=this.$refs.inputWrap.offsetWidth * fieldStyle *0.01;
                  this.field.style=this.parseStrObjByFor(this.field.style,";")
                   this.fieldStyle={...this.fieldStyle,...this.field.style}
                }
               }       
        }
    }
  },
};
</script>

<style lang="scss" scoped>
.el-input {
  width: unset;//不写默认100%，当触发了即时校验，会影响文本框的宽度
}
</style>
