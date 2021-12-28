<template>
    <span :id="id" class="photo-control">
      <template
        v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType == 'hidden')"
      >
        <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
        
        <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
      </template>

      <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
        <!--图片展示-->
        <div class="pic-wrap">
          <div class="ima" v-if="photo"><img :width="field.imgw" :height="field.imgh" :src="photo"></div>
          <div class="ima" v-else>
            <img :width="field.imgw" :height="field.imgh" src="../assets/images/face.jpg">
          </div>
        </div>
      </template>

      <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
        <div>
          <!--开启摄像头-->
          <div 
            class="pic-wrap" 
            @mouseenter="enter()">
            <div class="ima" v-if="photo"><img :width="field.imgw" :height="field.imgh" :src="photo"></div>
            <div class="ima" v-else>
              <img :width="field.imgw" :height="field.imgh" src="../assets/images/face.jpg">
            </div>
            <input type="button"  @click="showDialog" class="button_searchdel4 obpm-searchdel4">
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
          <el-dialog :title="$t('photo.take_photo')" :visible.sync="dialogVisible" :width="dialogWidth" height="200px" :before-close="handleClose">
            <!--图片展示-->
            <div class="shoot-area">
              <div class="left-take">
                <span>{{$t('photo.video_photo')}}</span>
                <video ref="video" width="160" height="125" autoplay></video>
                <el-button size="mini" class="btn" @click="photograph">{{$t('photo.take_photo')}}</el-button>
              </div>
              <div class="right-show">
                <span>{{$t('photo.photo')}}</span>
                <canvas ref="canvas" width="160" height="125"></canvas>
              </div>
            </div>
            <!--canvas截取流-->
            <span slot="footer" class="dialog-footer">
              <el-button @click="callOff()">{{$t('btns.cancel')}}</el-button>
              <el-button type="primary" @click="onOk">{{$t('btns.sure')}}</el-button>
            </span>
          </el-dialog>
          <!-- <el-button size="mini" type="primary" @click="photograph">{{$t('photo.take_photo')}}</el-button>    -->
        </div>
      </template>

      <template v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
        <div class="pic-wrap">
          <div class="ima" v-if="photo"><img :width="field.imgw" :height="field.imgh" :src="photo"></div>
          <div class="ima" v-else><img :width="field.imgw" :height="field.imgh" src="../assets/images/face.jpg"></div>
          <input type="button"  @click="dialogVisible = false" class="button_searchdel4 obpm-searchdel4">
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
	name: 'o-photo',
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
	data: function() {
		return {
      Constant,
      dialogVisible: false,
      photo:'',
      savePhoto:'',
      showLogsDialog: false,
      showLogsIcon:true,
      operationData:'',
      dialogWidth: '576px' //在线拍照弹框宽度
		}
  },
  mounted() {
    window.onresize = () => {
      return ( () => {
        //监听浏览器窗口改变，在线拍照弹窗宽度不变
        this.setDialogWidth()
      })()
    }
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
	methods: {
    setDialogWidth() {
      this.dialogWidth = '576px'
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
    // 调用摄像头
    callCamera () {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(success => {
        // 摄像头开启成功
        this.$refs['video'].srcObject = success
        // 实时拍照效果
        this.$refs['video'].play()
      }).catch(error => {
        console.error('摄像头开启失败，请检查摄像头是否可用！');
        console.log(error);
      })
    },
    // 拍照
    photograph () {
      let ctx = this.$refs['canvas'].getContext('2d');
      // 把当前视频帧内容渲染到canvas上
      ctx.drawImage(this.$refs['video'], 0, 0, 160, 125);
      // 转base64格式、图片格式转换、图片质量压缩
      let imgBase64 = this.$refs['canvas'].toDataURL('image/jpeg', 0.7);
      console.log("拍的图片-->");
      console.log(imgBase64);
      this.savePhoto = imgBase64;
      
    },
    // 关闭摄像头
    closeCamera () {
      if (!this.$refs['video'].srcObject) return
      let stream = this.$refs['video'].srcObject;
      let tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      })
      this.$refs['video'].srcObject = null;
      console.log("关闭了");
    },
    showDialog(){
      var explorer = window.navigator.userAgent;
      if (explorer.indexOf("MSIE") >= 0 || explorer.indexOf("Edge") >=0 ) {
        alert($('photo.unsupport_ie'));
      }else {
        this.dialogVisible = true;
        this.callCamera();
      }

    },
    onOk() {
      this.photo = this.savePhoto;
      this.dialogVisible = false;
      this.closeCamera();
    },
    handleClose(done) {
      this.$confirm($t('close'))
        .then(() => {
          this.closeCamera();
          done();
        })
        .catch(() => {});
    },
    callOff() {
      this.dialogVisible = false;
      this.closeCamera();
    }
  }
}
</script>

<style lang="scss">
  
</style>
