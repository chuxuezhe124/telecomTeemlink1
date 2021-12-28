
<template>
  <div class="file-share">
    <el-dialog
      :title="$t('btns.file_sharing')"
      :visible.sync="shareTreeModalParams.shareTreeModalVisible"
      width="40%"
      :before-close="handleFileShareDialogClose">
      <div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane :label="$t('tabs.internal_share')" name="internalShare">
            <el-form label-width="130px" class="demo-ruleForm">
              <el-form-item :label="$t('form.choose_share')">
                <div v-if="formParams.members.length > 0">
                  <div 
                    style="display: inline-block; margin-right: 4px;"
                    v-for="(data, index) in formParams.members" 
                    :key="data.id">
                    <el-popover 
                      placement="top-start"
                      title=""
                      width="200"
                      trigger="hover"
                      >
                      <div>
                        <div @click="handleUserRemove(index)"><a>{{$t('btns.delete')}}</a></div>
                      </div>
                      <el-tag slot="reference">{{data.name}}</el-tag>
                    </el-popover>
                  </div>
                </div>
                <el-button @click="showUserDialog" size="mini">{{$t('user.get')}}</el-button>
              </el-form-item>
            </el-form>
            <el-dialog
              width="650px"
              :title="$t('user.select')"
              :visible.sync="visible"
              :before-close="handleCancel"
              append-to-body>
              <div style="heigh: 360px;">
                <user-dialog 
                  ref="userDialog"
                  v-bind="$attrs" 
                  v-on="$listeners"
                  :formParams="formParams"
                  @handleSelectUser="handleSelectUser"
                  ></user-dialog>
              </div>
              <div slot="footer" class="dialog-footer">
                <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
                <el-button type="primary" @click="handleSettingUserOk" size="mini">{{$t('btns.determine')}}</el-button>
              </div>
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane :label="$t('tabs.external_share')" name="externalShare">
            <el-button 
            icon="el-icon-link"
            size="mini"
            v-clipboard:copy="copyText.text"     
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            :disabled="disabled"
            >{{$t('btns.copy_link')}}</el-button>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleFileShareDialogClose">{{$t('btns.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="handleFileSharetOk">{{$t('btns.determine')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
//用户选择框
import UserDialog from '@/components/shared/UserDialog/UserDialog.vue';
export default {
  name: 'filesharedialog',
  components: {
    UserDialog
  },
  props: [
    'shareTreeModalParams',
  ],
  data(){
    return{
      activeName: "internalShare",
      formParams: {
        members: [],
        userId: []
      },
      visible: false,
      shareParams: {   //选择分享的参数
        stageIds: []    //选择移动的目标目录id
      },
      copyText: {   
        text: []    
      },
      disabled: false     //是否只读
    }
  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
      if(tab.name == 'externalShare'){
        this.outsideShare();
      }
    },

    /**
     * 显示用户选择框
     */
    showUserDialog(){
      this.visible = true;
    },

    /**
     * 确定已选择用户
     */
    handleSettingUserOk(){
      this.$refs.userDialog.handleSelectUser();
      this.visible = false;
    },

    /**
     * 隐藏用户选择框
     */
    handleCancel(){
      this.$refs.userDialog.handleCancel();
      this.visible = false;
    },

    /**
     * 选择用户
     * @param {Object} data 
     */
    handleSelectUser(data){
      let userIds = [];
      data.map((e) => {
          userIds.push(e.id);
      });
      const formParams = {
        ...this.formParams,
        "members" : data,
        "userId" : userIds
      }
      this.formParams = formParams;
    },

    /**
     * 删除用户
     * @param {int} index 
     */
    handleUserRemove(index){
      let data = [
        ...this.formParams.members.slice(0, index),
        ...this.formParams.members.slice(index + 1)
        ]
      const formParams = {
        ...this.formParams,
        "members" : data,
        "userId" : ""
      }
      this.formParams = formParams;
    },

    /**
     * 外部分享
     */
    async outsideShare(){
      const shareParams = {
        ...this.shareParams,
        "diskId" : this.shareTreeModalParams.diskId,
        "fileId" : this.shareTreeModalParams.fileId,
        "userIds" : this.formParams.userId
      };
      //当没有权限分享时，不给外部链接
      API.handleInsideShareFile(shareParams,{
        onSucess: resp => {
          this.disabled = false;
        },
        onError: err =>{
          if(err.response.data.errcode == 403){
            this.disabled = true;
          }
        }
      })
      const result = (await API.outSideShareFile(shareParams)).data;
      /\n/.test(result.data) ? this.copyText.text = result.data.split('\n')[1] : this.copyText.text = result.data;
    },

    //分享成功
    onCopy(){
      this.$message({
        type: 'success',
        message: this.$t('msg.Copy_ss')
      });
    },

    //分享失败
    onError(){
      this.$message({
        type: 'warning',
        message:this.$t('msg.copy_err')
      });
    },

    /**
     * 确定分享
     */
    handleFileSharetOk(){
      const shareParams = {
        ...this.shareParams,
        "diskId" : this.shareTreeModalParams.diskId,
        "fileId" : this.shareTreeModalParams.fileId,
        "userIds" : this.formParams.userId
      };
      API.handleInsideShareFile(shareParams,{
        onSucess: resp => {
          if(resp.data.data == true){
            let formParams = {
            members: [],
            userId: []
          }
          this.formParams = formParams;
          this.$message({
            type: 'success',
            message: this.$t('msg.share_ss')
          });
          }
        },
        onError: err =>{
          this.$message({
            message:err.response.data.errmsg,
            type: 'warning'
          });
        }
      })
      this.$emit('handleFileShareDialogClose');
    },

    /**
     * 取消分享
     */
    handleFileShareDialogClose(){
      let formParams = {
        members: [],
        userId: []
      }
      let shareParams = {   //选择分享的参数
        stageIds: []    //选择移动的目标目录id
      }
      let copyText = {   
        text: []    
      }
      this.formParams = formParams;
      this.shareParams = shareParams;
      this.copyText = copyText;
      if(this.$refs.userDialog !=undefined){
        this.$refs.userDialog.initUserParams();
      }
      this.$emit('handleFileShareDialogClose');
    },
  },
  watch:{
    /**
     * 监听改变过，tab标签回到第一次
     */
    shareTreeModalParams(val){
      this.activeName = "internalShare";
    }
  }
}
</script>