<template>
  <div class="watermark">
   <div>
      <div class="water">
        <span class="waterText">{{$t('watermark.whether_open')}} </span>
        <el-switch 
        v-model="waterSwitch"
        @change="changeSwitch"
        ></el-switch>
      </div>
      <div class="water-content" v-if="isWater">
        <el-row :gutter="19" class="water-row">
          <el-col :span="3.4" class="water-checked">
            <el-checkbox v-model="preview">{{$t('watermark.preview')}}</el-checkbox>
          </el-col>
          <el-col :span="3.4">
              <el-checkbox v-model="download">{{$t('watermark.download')}} </el-checkbox>
          </el-col>
          <el-col :span="3.4">
              <el-checkbox v-model="print">{{$t('watermark.print')}}</el-checkbox>
          </el-col>
        </el-row>

        <el-row class="water-row">
          <el-radio-group v-model="mode" @change="handleRadio">
            <el-radio :label="1">{{$t('watermark.document_uploader')}} </el-radio>
            <el-radio :label="2">{{$t('watermark.previews_user')}} </el-radio>
            <el-radio :label="3">{{$t('watermark.custom')}}</el-radio>
          </el-radio-group>
        </el-row>
        <el-row v-if="isTextare">
          <el-input
          type="textarea"
          :rows="4"
          v-model="customContent"
          :placeholder="$t('watermark.input')"
          class="textare"
          ></el-input>
          <i
            style="cursor: pointer;"
            class="el-icon-edit-outline"
            @click="showScriptEditor"
          ></i>
        </el-row>
      </div>
      <div slot="footer" class="dialog_footer">
        <el-button size="small" @click="Cancel">{{$t('btns.cancel')}}</el-button>
        <el-button type="primary" size="small" @click="handleClick">{{$t('btns.determine')}}</el-button>
      </div>
   </div>
   <!-- scriptEditorVisible:弹窗显示   showScritptEditorCode：将文本框的值传给编译器  handleScriptEditor：将编译器的值传给textarea-->
   <ScriptEditor 
    v-if="scriptEditorVisible"
    :scriptEditorVisible="scriptEditorVisible"
    :editorCode="customContent"
    @closeScriptEditorDialog="scriptEditorVisible = false"
    @saveScriptEditor="handleScriptEditor"
   />
  </div>
</template>
<script>
import API from "@/api.js";
import ScriptEditor from "@/components/admin/CompanyAdmin/ScriptEditor.vue"
export default {
  name: "watermark",
  data(){
    return{
      waterSwitch: false,       //水印显示
      preview: false,           //预览时水印
      download: true,             //下载时水印
      print: true,              //打印时水印
      mode: 1,                 //水印选择
      customContent: '',             //文本水印
      isWater: false,           //是否开启水印
      isTextare: false,         //是否显示水印文本框
      scriptEditorVisible: false, // 脚本编辑器弹窗
    }
  },
  mounted(){
    this.getWater();
  },
  methods:{
    /**
     * 显示脚本编辑器
     */
    showScriptEditor(){
      this.scriptEditorVisible = true;
    },
    /**
     * 将脚本编辑器的值写入到textarea中
     */
    handleScriptEditor(val) {
      this.customContent = val
    },
    /**
     * 获取水印详情
     */
    getWater(){
      API.getWatermark({
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let data = resp.data.data;
            this.waterSwitch = data.status;
            if(data.status){
              this.isWater = true;
            }
            this.preview = data.preview;
            this.download = data.download;
            this.print = data.print;
            this.customContent = data.customContent;
            if(data.mode == "uploader"){
              this.mode = 1;
            }else if(data.mode == "viewer"){
              this.mode = 2;
            }else{
              this.mode = 3;
              this.isTextare = true;
            }
          }
        } 
      })
    },
    /**
     * 水印设置滑动
     */
    changeSwitch(val){
      if(val){
        this.isWater = true;
      }else{
        this.isWater = false;
      }
    },
    /**
     * 水印选择
     */
    handleRadio(val){
      if(val == "3"){
        this.isTextare = true;
      }else{
        this.isTextare = false;
      }
    },
    /**
     * 确定
     */
    handleClick(){
      let mode = "";
      if(this.mode == 1){
        mode = "uploader";
      }else if(this.mode == 2){
        mode = "viewer";
      }else{
        mode = "custom";
      }
      let dataJson = {
        customContent: this.customContent,
        download: this.download,
        mode: mode,
        preview: this.preview,
        print: this.print,
        status: this.waterSwitch
      }
      API.putWatermark(dataJson,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.$message({
              message: this.$t('msg.ss'),
              type: 'success'
            });
            this.WatermarkVisible = false;
          }
        } 
      })
    },
    /**
     * 取消（文档水印弹窗取消）
     */
    Cancel() {
      let cancel = false
      this.$emit('Cancel',cancel)
    }
  },
  components:{
    ScriptEditor
  },
}
</script>