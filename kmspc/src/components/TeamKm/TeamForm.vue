<template>
  <div>
    <el-form label-width="100px" class="demo-ruleForm">
      <el-form-item :label="$t('tabs.NO')">
        <el-input v-model="formParams.serialNumber" readOnly></el-input>
      </el-form-item>
      <el-form-item :label="$t('tabs.definition')">
        <el-input v-model="formParams.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('tabs.introduction')">
        <el-input type="textarea" :rows="2" v-model="formParams.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('tabs.member')">
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
              <div class="popover">
                <div><a @click="handleManagerSet(data, index)">{{data.type == 1 ? $t('cancel_administrator') : $t('set_administrator')}}</a></div>
                <div><a @click="handleUserRemove(index)">{{$t('btns.delete')}}</a></div>
              </div>
               <el-tag slot="reference"><i v-if="data.type == 1" class="el-icon-user"></i>{{data.name}}</el-tag>
            </el-popover>
          </div>
        </div>
        <el-button @click="showUserDialog" size="mini">{{$t('user.get')}}</el-button>
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
              :formParams="formParams"></user-dialog>
          </div>
           <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel" size="mini">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="handleSettingUserOk" size="mini">{{$t('btns.determine')}}</el-button>
          </div>
        </el-dialog>
      </el-form-item>
      <el-form-item :label="$t('tabs.share_department')">
        <el-checkbox-group 
          v-model="deptPermissionList"
          @change="deptPermissionChange">
          <el-checkbox :label="$t('label.preview')" ></el-checkbox>
          <el-checkbox :label="$t('btns.download')" ></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('tabs.share_company')">
        <el-checkbox-group 
          v-model="compPermissionList"
          @change="compPermissionChange">
          <el-checkbox :label="$t('label.preview')"></el-checkbox>
          <el-checkbox :label="$t('btns.download')"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import UserDialog from '@/components/shared/UserDialog/UserDialog.vue';
export default {
  name: 'teamForm',
  components: {
    UserDialog
  },
  props: [
    "formParams",
    "deptList",
    "comList"
  ],
    created(){
    this.deptPermissionList=this.deptList.map(item=>{
     item=item==="download"?this.$t('btns.download'):item;
     item=item==="preview"?this.$t('label.preview'):item;
      return item;
    })
    this.compPermissionList=this.comList.map(item=>{
     item=item==="download"?this.$t('btns.download'):item;
     item=item==="preview"?this.$t('label.preview'):item;
      return item;
    })

  },
  data(){
    return{
      visible: false,
      deptPermissionList: [],       //分享到部门
      compPermissionList: [],       //分享到公司
    }
  },

  methods:{
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
     * 设置为管理员
     */
    handleManagerSet(item, index){
      this.$emit('handleManagerSet', item, index);
    },

    /**
     * 删除用户
     * @param {int} index 
     */
    handleUserRemove(index){
      this.$emit('handleUserRemove', index);
    },

    /**
     * 选择分享部门
     */
    deptPermissionChange(list){
      let arr = [];
      if(list.length >0){
        list.map((item) =>{
          if(item == this.$t('btns.download')){
            arr.push('download');
          }else if(item == this.$t('label.preview')){
            arr.push('preview');
          }
        })
      }
      this.$emit('hanleDeptList',arr);
    },
    /**
     * 选择分享公司
     */
    compPermissionChange(list){
      let arr = [];
      if(list.length >0){
        list.map((item) =>{
          if(item == this.$t('btns.download')){
            arr.push('download');
          }else if(item == this.$t('label.preview')){
            arr.push('preview');
          }
        })
      }
      this.$emit('hanleComList',arr);
    },
  },
  watch:{
    deptList: function(val){
    this.deptPermissionList=val.map(item=>{
     item=item==="download"?this.$t('btns.download'):item;
     item=item==="preview"?this.$t('label.preview'):item;
      return item;
    })
    },
    comList: function(val){
    this.compPermissionList=val.map(item=>{
     item=item==="download"?this.$t('btns.download'):item;
     item=item==="preview"?this.$t('label.preview'):item;
      return item;
    })
    }
  }
}
</script>