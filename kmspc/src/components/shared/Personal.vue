<template>
  <div class="personal" name="personal">
    <div class="card">
      <div style="overflow:auto" :style="{height: tableHeight + 'px'}">
        <!-- 基本信息 -->
        <fieldset class="fieldsetBox">
          <legend class="legendBox">{{$t('tabs.basic_information')}}</legend> 
          <el-form :inline="true" :model="baseicFrom" ref="baseicFrom" class="form-inline"  :rules="rules" :label-position="labelPosition" label-width="80px">
            <el-row>
              <el-form-item :label="$t('form.user_name')" class="form-item" >
                <el-input v-model="baseicFrom.name" :placeholder="$t('placeholder.enter_name')"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.account')" class="form-item" >
                <el-input v-model="baseicFrom.loginno" disabled></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item :label="$t('form.mail')" class="form-item" prop="email">
                <el-input v-model="baseicFrom.email" :placeholder="$t('placeholder.enter_email')"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.phone')" class="form-item" prop="telephone">
                <el-input v-model="baseicFrom.telephone" :placeholder="$t('placeholder.enter_phone')"></el-input>
              </el-form-item>
            </el-row>
          </el-form>
        </fieldset>
        <!-- 修改密码 -->
        <fieldset class="fieldsetBox">
          <legend class="legendBox">{{$t('btns.change_password')}}</legend>
          <el-form :model="passwordFrom" class="form-inline" :label-position="labelPosition" label-width="80px">
            <el-form-item :label="$t('form.old_password')" class="form-item">
              <el-input v-model="passwordFrom.oldPassword" show-password></el-input>
            </el-form-item>
            <el-form-item :label="$t('form.new_password')" class="form-item" >
              <el-input v-model="passwordFrom.newpassword" show-password></el-input>
            </el-form-item>
            <el-form-item :label="$t('form.confirm_password')" class="form-item">
              <el-input v-model="passwordFrom.confirmPassword" show-password @blur="confirm"></el-input>
            </el-form-item>
          </el-form>
        </fieldset>
      </div>
      <div class="form-save">
        <el-button type="success" @click="handSave('baseicFrom')">{{$t('btns.save')}}</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: 'personal',
  data() {
    return {
      baseicFrom: {     //基本信息表单
        name: '',       //名称
        loginno: '',    //账号
        email: '',      //邮箱
        telephone:'',   //手机
      },
       rules: {
          telephone:[
          { min: 11, max: 11, message: this.$t('placeholder.Please_enter_11_phone_number'), trigger: "blur" },
          {pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,message: this.$t('placeholder.Please_enter_correct_phone_number'),}
        ],
        email:[
           { pattern:/^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g, message: this.$t('placeholder.Please_enter_correct_mailbox'), trigger: "blur"}
        ]

       },
      

      passwordFrom: {           //修改密码
        oldPassword: '',    //旧密码
        newpassword: '',    //新密码
        confirmPassword: '',//确认密码
      },
      tableHeight: 420,  //表格高度
      labelPosition:"right",
    }
  },
  mounted(){
    this.getScollerHeight()
    this.getUser();
    this.labelPosition=this.$store.state.isEnglish ? "top" :"right";
  },
  methods:{
    /**
     * 动态计算页面table高度
     */
    getScollerHeight() {
      setTimeout(() => {
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        let height = clientHeight - 250;
        //大屏幕的高度比较高，取530高度正好
        if(height>530){
          height = 530;
        }
        this.tableHeight = height;
      }, 100)
    },
    /**
     * 获取用户信息
     */
    getUser(){
      this.baseicFrom = this.$store.state.user;
    },
    /**
     * 保存
     */
    handSave(formName){
      //加上校验了邮箱和手机号 校验成功才执行后面的程序
    this.$refs[formName].validate((valid) => {
    if (valid) {
              const baseic = this.baseicFrom;
      const password = this.passwordFrom
      let that = this;
      //基本信息保存
      let baseicArr = {
        email: baseic.email,
        name: baseic.name,
        telephone: baseic.telephone
      }
      API.detail(baseicArr, {
        onSucess: resp => {
        } 
      })
      //修改密码
      if(password.oldPassword && password.newpassword && password.confirmPassword){
        let passwordArr = {
          oldPassword: password.oldPassword,    //旧密码
          newpassword: password.newpassword,    //新密码
          confirmPassword: password.confirmPassword,//确认密码
        }
        API.password(passwordArr, {
          onSucess: resp => {
            if(resp.data.errmsg == "ok"){
              this.$message({
                message: this.$t('msg.ss'),
                type: 'success'
              });
              let newPwd = {
                oldPassword: "",
                newpassword: "",
                confirmPassword: ""
              }
              that.passwordFrom = newPwd;
            }else if(resp.data.errcode == 500){
              this.$message.error(resp.data.errmsg);
            }
          } 
        })
      }else if(password.oldPassword == "" && password.newpassword == "" && password.confirmPassword == ""){
        this.$emit("closePersonalDialog")
        this.$message({
          message: this.$t('msg.ss'),
          type: 'success'
        });
      }else if(password.oldPassword == ""){
        this.$message.error(this.$t('msg.old_pass_req'));
      }else if(password.newpassword == ""){
        this.$message.error(this.$t('msg.new_pass_req'));
      }else if(password.confirmPassword == ""){
        this.$message.error(this.$t('msg.confirm_password_mandatory'));
      }
          } else {
            return false;
          }
        });
    
    },
    /**
     * 校验密码是否一致
     */
    confirm(){
      let password = this.passwordFrom;
      if(password.confirmPassword != password.newpassword){
        this.$message.error(this.$t('msg.password_inconsistent'));
      }
    }
  }
}
</script>