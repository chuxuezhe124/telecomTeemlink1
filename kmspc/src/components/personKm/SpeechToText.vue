<template>
  <div class="speech-to-text">
    <el-form  label-width="200px" :model="params">
      <el-form-item :label="$t('tabs.speech_type')">
        <el-select v-model="params.type" :placeholder="$t('select')" @change="onSpeechTypeChange" size="small">
          <el-option :label="$t('option.baidu_cloud')" value="baiduYun"></el-option>
          <el-option :label="$t('option.hkust_xunfei')" value="iflyTek"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('tabs.uploaded_history')" v-if="visible">
        <el-select v-model="taskId" :placeholder="$t('select')" @change="onHistoryChange" size="small">
          <el-option
            v-for="item in historyData"
            :key="item.id"
            :label="item.fileName"
            :value="item.id">
          </el-option>
        </el-select>
         <el-button size="small" class="refresh" @click="getHistory">{{$t('btns.refresh')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('file.upload_document')">
        <el-upload
          class="upload-demo"
          name="file"
          :action="contextPath + '/kms/speech/speechToText?fromType=' + params.type"
          :on-change="handleFileChange"
          :on-error="onError"
          ref="upload"
          >
          <el-button size="small" type="primary">{{$t('btns.click_upload')}}</el-button>
          <div slot="tip" class="el-upload__tip">{{$t('placeholder.only_uploaded')}}</div>
        </el-upload>
      </el-form-item>
       <el-form-item :label="$t('tabs.speech_text')">
        <el-button size="small" type="primary" :loading="loading" @click="enterLoading">{{$t('btns.conversion')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('tabs.conversion_text')">
        <el-input
          type="textarea"
          :rows="10"
          v-model="params.value">
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "speechText",
  props: [
    'activeName'
  ],
  data() {
    return {
      params:{
        type: "baiduYun",  //语音转换类型1、baiduYun,百度云；2、iflyTek，科大讯飞
        value: "" 
      },
      taskId: "",
      historyData: [],
      visible: false,
      contextPath: contextPath
    }
  },

  watch:{
    activeName(val){
      if(val == 'speechTotext'){
        this.params = {
          type: "baiduYun",
          value: ""
        };
        this.taskId = "";
        this.historyData = [];
        this.visible = false
        this.$refs.upload.clearFiles();
      }
    },
  },

  methods:{
    /**
     * 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
     */
    handleFileChange(file){
      if(file.status == "success"){
        this.params.value = file.response.data.message;
      }
    },

    /**
     * 文件上传失败时的钩子
     */
    onError(err, file, fileList){
      this.$message({
        type: 'info',
        message: JSON.parse(err.message).errmsg
      });
    },

    /**
     * 判断是否显示上传历史
     */
    onSpeechTypeChange(){
      if(this.params.type == "iflyTek"){
        this.visible = true;
        this.getHistory();
      }else{
         this.visible = false;
      }
    },

    /**
     * 查看科大讯飞上传历史
     */
    async getHistory(){
      let result = (await API.getHistory()).data;
      if(result.errcode == 0){
        this.historyData = result.data.datas;
      }else{
         this.$message({
          type: 'info',
          message: result.message
        });
      }
    },

    /**
     * 获取科大讯飞语音转换文字历史记录
     */
    async onHistoryChange(){
      let taskId = this.taskId;
      let result = (await API.getSpeechToText(taskId)).data;
      if(result.errcode == 0){
        this.params.value = result.data.message;
      }
    },
    //语音转换加载
    enterLoading(){
      this.loading = true;
      this.handleTextChange();
    },

     /**
     * 语音转文字
     */
    async handleTextChange(){
      let params = this.params;
      console.log(params)
      if(params.value == ""){
        this.loading = false;
        this.$message({
          type: 'info',
          message: this.$t('msg.write_or_upload')
        });
      }else{
        const result = (await API.speechText(params)).data;
        if(result.errcode == 0){
          let params = {
            ...this.params,
            path: kmsConfig.kmsFilePath + '/uploads/kms/' + result.data.filePath
          }
          this.params = params;
          this.loading = false;
          this.uploadbtn = true;
          this.$message({
            type: 'success',
            message: this.$t('msg.conversion_ss')
          });
        }
      }
    },


  }

}
</script>