<template>
  <div :id="id" class="word-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div class="wrap" v-if="field.openType == '3'">
        <div class="wrap" @click="openDialog">
          <img src="../assets/images/word.gif">
        </div>
      </div>
      <div class="wrap-embed" v-else-if="field.openType == '1'">
        <div class="embed">
          <iframe 
            id="show-iframe" 
            frameborder="0" 
            scrolling="yes" 
            class="iframe"
            :src='wordEditor'>
          </iframe>
        </div>    
      </div>
    </template>
    <!--只读-->
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
         <!--弹出框形式-->
        <div class="wrap" v-if="field.openType == '3'">
          <div class="wrap" @click="openDialog">
            <img src="../assets/images/word.gif">
          </div>
        </div>
        <!--嵌入形式-->
        <!-- <div class="wrap-embed" v-else-if="field.openType == '1'">
          
        </div> -->
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <!--弹出框形式-->
      <div class="wrap" v-if="field.openType == '3'">
        <div class="wrap" @click="openDialog">
          <img src="../assets/images/word.gif">
        </div>
      </div>
      <!--嵌入形式-->
      <div class="wrap-embed" v-else-if="field.openType == '1'">
        <div class="embed">
          <iframe 
            id="show-iframe" 
            frameborder="0" 
            scrolling="yes" 
            class="iframe"
            :src='wordEditor'>
          </iframe>
        </div>
          
      </div>
    </template>
    <el-dialog 
      :title="$t('word_dialod')"
      :visible.sync="dialogVisible" 
      v-if="dialogVisible"
      top="10px" 
      :lock-scroll="true" 
      width="80%" 
      class="abow_dialog" 
      :before-close="handleClose"
    > 
      <div class="iframe-dialog">
        <iframe 
          id="show-iframe" 
          frameborder="0" 
          scrolling="yes" 
          class="iframe"
          :src='wordEditor'>
        </iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-word",
  props: ["id"],
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return this.setEmbedPdf(formData);
      //return this.$parent.findField(this.id);
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
      dialogVisible: false,
      wordEditor:'',
      currentUrl:''
    };
  },

  methods: {
    setEmbedPdf(formData) {
      if(formData.openType == '1') {
        let applicationId = undefined,
            path = formData['data-full-path'],
            name = formData['data-file-name'],
            showName = formData['data-file-name'],
            fileType = "."+formData['data-file-name']?formData['data-file-name'].split(".")[1]:'',  //.doc
            isOpenCloseBtn = false,
            isShowDocName=false,
            curEditUserId = this.$store.state.userId,
            action = formData.action;
        fileType = "." + fileType;
        let cp = obpmConfig.obpmFilePath;
        sessionStorage.setItem("obpmContextPath", cp);
        let statiContextPath = obpmConfig.statiContextPath;
        let pdfPath = "";
        if(statiContextPath) { //5.0 trunk
          sessionStorage.setItem("isTrunk", true);
          pdfPath = obpmConfig.statiContextPath;
        }else { //4.4 stable
          sessionStorage.setItem("isTrunk", false);
          pdfPath = cp;
        }

        this.wordEditor = pdfPath + '/portal/vue/pdf/pdfviewer.html?applicationId=' + applicationId +
          "&path=" + path + 
          "&name=" + name + 
          "&showName=" + showName + 
          "&fileType=" + fileType + 
          "&isOpenCloseBtn=" + isOpenCloseBtn + 
          "&isShowDocName=" + isShowDocName + 
          "&curEditUserId=" + curEditUserId + 
          "&action=" + action;
        return formData
      }else if(formData.openType == '3') {
        return formData
      }
      
    },

    openDialog() {
      let applicationId = undefined,
          path = this.field['data-full-path'],
          name = this.field['data-file-name'],
          showName = this.field['data-file-name'],
          fileType = "."+this.field['data-file-name']?this.field['data-file-name'].split(".")[1]:'',  //.doc
          isOpenCloseBtn = false,
          isShowDocName=false,
          curEditUserId = this.$store.state.userId,
          action = this.field.action;
        fileType = "." + fileType
        let cp = obpmConfig.obpmFilePath;
        sessionStorage.setItem("obpmContextPath", cp);
        let statiContextPath = obpmConfig.statiContextPath;
        let pdfPath = "";
        if(statiContextPath) { //5.0 trunk
          sessionStorage.setItem("isTrunk", true);
          pdfPath = obpmConfig.statiContextPath;
        }else { //4.4 stable
          sessionStorage.setItem("isTrunk", false);
          pdfPath = cp;
        }
        this.wordEditor = pdfPath + '/portal/vue/pdf/pdfviewer.html?applicationId=' + applicationId +
          "&path=" + path + 
          "&name=" + name + 
          "&showName=" + showName + 
          "&fileType=" + fileType + 
          "&isOpenCloseBtn=" + isOpenCloseBtn + 
          "&isShowDocName=" + isShowDocName + 
          "&curEditUserId=" + curEditUserId + 
          "&action=" + action;
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
    },
  }
}
</script>

<style lang="scss" scoped>
  .wrap {
    cursor: pointer;
    width: 26px;
    height: 26px;
    border: 1px solid #a5a5a5;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .abow_dialog {
    display: -webkit-box;
    display: flex;
    justify-content: center;
    align-items: Center;
    overflow: hidden;
    .el-dialog {
      margin: 0 auto !important;
      height: 95%;
      overflow: hidden;
      .el-dialog__body {
        position: absolute;
        left: 0;
        top: 54px;
        bottom: 0;
        right: 0;
        padding: 0;
        z-index: 1;
        overflow: hidden;
        overflow-y: auto;
      }
      .el-dialog__footer {
        position: absolute;
        right:0;
        bottom:0;
        width:100%;
        height:60px;
        z-index: 2;
        background: white;
        .dialog-footer {
          position: absolute;
          right:25px;
          bottom:15px;
          
        }
      }
    }
  }
</style>