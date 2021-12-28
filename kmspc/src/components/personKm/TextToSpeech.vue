<template>
  <div class="text-to-speech">
    <el-form  label-width="200px" :model="params">
      <el-form-item :label="$t('tabs.speech_type')">
        <el-select v-model="params.type" :placeholder="$t('select')" @change="onSpeechTypeChange" style="margin-right:12px">
          <el-option :label="$t('option.baidu_cloud')" value="baiduYun"></el-option>
          <el-option :label="$t('option.hkust_xunfei')" value="iflyTek"></el-option>
        </el-select>
        <el-radio-group v-model="params.voiceType" v-if="visible">
          <el-radio label="xiaoyan">{{$t('male_voice')}}</el-radio>
          <el-radio label="xiaoyu">{{$t('female_voice')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('file.upload_document')">
        <el-upload
          class="upload-demo"
          name="file"
          :action="contextPath + '/kms/speech/upload'"
          :on-change="handleFileChange"
          ref="upload"
          >
          <el-button size="small" type="primary">{{$t('btns.uploading_word_document')}}</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item :label="$t('form.text_speech')">
        <el-button size="small" type="primary" :loading="loading" @click="enterLoading">{{$t('btns.conversion')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('tabs.input_text')">
        <el-input
          type="textarea"
          :rows="10"
          v-model="params.value">
        </el-input>
      </el-form-item>
       <el-form-item :label="$t('tabs.audio')">
        <audio id="myaudio" class="audio" :src="params.path" controls="controls"></audio>
        <el-button v-if="uploadbtn" size="small" type="primary" @click="handleUploadAudio" class="uploadAudio">{{$t('btns.download_audio')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "textToSpeech",
  props: [
    'activeName'
  ],
  data() {
    return {
      params:{
        type: "baiduYun",  //语音转换类型1、baiduYun,百度云；2、iflyTek，科大讯飞
        value: "",
        path: "",
        voiceType: "xiaoyan"   //xiaoyan,女音；xiaoyu,男音
      },
      visible: false,
      loading: false,
      uploadbtn: false,
      contextPath: contextPath
    }
  },

  watch:{
    activeName(val){
      if(val == 'textToSpeech'){
        this.params = {
          type: "baiduYun",
          value: "",
          path: "",
          voiceType: "xiaoyan"   //xiaoyan,女音；xiaoyu,男音
        };
        this.visible = false;
        this.loading = false;
        this.uploadbtn = false
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
        this.params.value = file.response.data.text;
      }else if(file.status == "fail"){
        this.$message({
          type: 'info',
          message: this.$t('msg.upload_err')
        });
      }
    },

    /**
     * 判断上传类型
     */
    onSpeechTypeChange(){
      if(this.params.type == "iflyTek"){
        this.visible = true;
      }else{
        this.visible = false;
      }
    },

    //语音转换加载
    enterLoading(){
      this.loading = true;
      this.handleTextChange();
    },

     /**
     * 文字转语音
     */
    async handleTextChange(){
      let params = this.params;
      if(params.value == ""){
        this.loading = false;
        this.$message({
          type: 'info',
          message: this.$t('msg.write_or_upload')
        });
      }else{
        const result = (await API.textToSpeech(params)).data;
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

    /**
     * 下载音频文件
     */
    handleUploadAudio(){
      window.open(this.params.path);
    }
  }

}
</script>