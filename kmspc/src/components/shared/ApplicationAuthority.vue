<template>
  <div class="application-authority">
    <el-dialog
      :title="$t('form.apply_permission')"
      :visible.sync="visible_"
      width="30%">
      <div class="authority-box">
        <div class="authority-checkbox">
          <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="(item,index) in List" :key="index" :label="item.value" @change="onChange($event,item.value)">{{item.name}}</el-checkbox>
          </el-checkbox-group>  
        </div>
        <div class="authority">
          <span class="authority-title">{{$t('tabs.apply_reason')}}：</span>
          <el-input 
            v-model="authorityInput"
            :placeholder="$t('placeholder.enter_reason')" 
            size="medium" 
            class="authority-input">
          </el-input>
        </div>
        <div class="approver">
          <span class="approver-title">{{$t('tabs.approver')}}：</span>
          <span>{{this.approvers}}</span>
        </div>
      </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible_ = false" plain size="mini">{{$t('btns.cancel')}}</el-button>
          <el-button @click="authorityClick(checkList,authorityInput)" plain size="mini">{{$t('btns.submit')}}</el-button>
        </span>
    </el-dialog>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "application-authority",
  data () {
    return {
      checkList: ['preview'],
      List:[
        {name:this.$t('label.download'),value:'download'},
        {name:this.$t('label.preview'),value:'preview'},
        {name:this.$t('btns.edit'),value:'edit'}
      ],
      authorityInput: '',
      dataJson:{
        preview:false,
        download:false,
        edit: false
      },
      approvers:''
    }
  },
  props:[
    "visible",
    "authorityModalParams"
  ],
  watch:{
    authorityModalParams() {
      //获取审批人
      this.checkList = [this.authorityModalParams.type];
      API.getApprovers(this.authorityModalParams.fileId, {
        onSucess: resp => {
          console.log(resp)
          this.approvers = resp.data.data;
        } 
      })
    }
  },
  computed: {
    visible_: {
      get() {
        this.authorityInput = "";
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    }
  },
  methods: {
    onChange(ev,val) {
      console.log("e--->",ev);
      console.log("val--->",val);
    },
    //申请权限提交
    authorityClick(checkValue,reason) {
      console.log("checkValue",checkValue);
      console.log("reason",reason);
      this.dataJson.preview = false;
      this.dataJson.download = false;
      this.dataJson.edit = false;
      for(let i=0;i<checkValue.length;i++){
        if(checkValue[i] == "preview"){
          this.dataJson.preview = true;
        }else if(checkValue[i] == "download"){
          this.dataJson.download = true;
        }else{
          this.dataJson.edit = true;
        }
      }
      console.log("this.checkboxList",this.checkboxList);
      this.dataJson.reason = reason;
      this.dataJson.resourceId = this.rowId;
      if(this.approvers != ""){
        this.dataJson.resourceId = this.authorityModalParams.fileId;
        this.$emit("onAuthiority",this.dataJson);
      }else{
        this.$message.error(this.$t('msg.no_approvers_section'));
      }
    },
    
  },
}
</script>
