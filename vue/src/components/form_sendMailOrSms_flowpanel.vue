<template>
  <div class="send-mail-wrap">
    <div class="content">
      <div class="email-sms">
        <el-checkbox v-model="isEmail">{{$t('view.email')}}</el-checkbox>
        <el-checkbox v-model="isSms">{{$t('view.message')}}</el-checkbox>
      </div>
      <div class="select-wrap">
        <span class="left">
          <el-input
            type="textarea"
            :rows="1"
            placeholder=""
            v-model="approverName">
          </el-input>
        </span>
        <span class="right" @click="openUserDialog">
          {{$t('view.select_user')}}
        </span>
      </div>
      <div class="send-btn">
        <el-button type="success" size="small" @click="onOk">发送</el-button>
      </div>
    </div>
    <el-dialog
      :title="$t('view.select_user')"
      class="user-dialog"
      v-if="userVisible"
      :visible.sync="userVisible"
      :appendToBody="true"
    >
      <form_selectApprover_flowpanel
        :isSendMail="isSendMail"
        @action = "selectApprover"
      />
      <span slot="footer" class="dialog-footer"></span>
    </el-dialog>
  </div>
</template>

<script>
import form_selectApprover_flowpanel from "@/components/form_selectApprover_flowpanel.vue";
export default {
  props: [
    "act",
    "openParams" ,
    "buildFormData"
  ],
  components: {
    form_selectApprover_flowpanel,
  },
  data: function() {
    return {
      isEmail: false,
      isSms: false,
      selectUserName:'',
      userVisible:false, //用户选择框弹窗
      isSendMail:false,
      approverName:'',
      approverId:'',
    };
  },

  watch: {
    
  }, 
  methods: {
    onOk() {
      let docId = this.buildFormData.id;
      let formId = this.buildFormData.formId;
      if(this.approverId.length == 0) {
        this.$notify({
          title: '请先选中用户',
          message: '',
          type: 'warning'
        });
        return;
      }
      this.$confirm(`是否通过邮件或短信通知，等待时间需要一会`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let obj = {
          email: this.isEmail,
          handleUrl: "/obpm/portal/good/form.html?appId=" + this.openParams.appId + "&docId=" + docId + "&formId=" + formId,
          msm: this.isSms,
          receiverid: this.approverId,
          transpond: this.act.transpond,
        }
        this.$api.toShare(
          this.openParams.appId,
          docId,
          obj,
          {
            onSucess: res => {
              if(res.data.errcode == 0) {
                this.$notify({
                  title: res.data.data,
                  message: '',
                  type: 'success'
                });
                this.$emit("closePopup", status);
              }else {
                this.$notify({
                  title: res.data.errmsg,
                  message: '',
                  type: 'error'
                });
              }
            },
            onError: error => {
              this.$notify({
                title: '邮件和手机分享失败',
                message: '',
                type: 'error'
            })
          }
          }
        )
      }).catch(() => {
                
      });
    },

    selectApprover(approverName, approverId) {
      this.approverName = approverName;
      this.approverId = approverId;
      this.userVisible = false;
    },

    openUserDialog() {
      this.isSendMail = true;
      this.userVisible = true;
    },
  }
};
</script>