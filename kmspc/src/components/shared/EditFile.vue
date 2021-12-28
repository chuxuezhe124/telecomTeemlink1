<template>
  <div>
    <div class="edit-files" v-if="editable" :index="tableList.$index">
      <img 
        v-if="tableList.row.type =='jpg' || tableList.row.type =='png' || tableList.row.type =='gif'" 
        :src="kmsFilePath+'/uploads/kms/'+tableList.row.url" 
        class="icon-file"/>
      <i :class="'icon-file icon-file-'+tableList.row.type" v-else></i>
      <el-input size="mini" v-model="value" @change="handleChange"></el-input>
      <i class="el-icon-check" @click="sureToEdit(tableList.$index, tableList.row)"></i>
      <i class="el-icon-close"  @click="cancelEdit(tableList.$index, tableList.row)"></i>
    </div>
    <div v-if="!editable">
      <a class="file-name" @click="clickFileForPreview(tableList.row)">
        <img 
          v-if="tableList.row.type =='jpg' || tableList.row.type =='png' || tableList.row.type =='gif'" 
          :src="kmsFilePath+'/uploads/kms/'+tableList.row.url" 
          class="icon-file"/>
        <i :class="'icon-file icon-file-'+tableList.row.type" v-else></i>
        {{tableList.row.name}}
      </a>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
import { getPreviewUrl } from '@/utils/utils.js';

export default {
  name: 'editfile',
  props: [
    'tableList',
    'handleindex',
    'editcolumn',
    'preview',   // 判断是否有预览的权限
  ],
  data() {
    return{
      kmsFilePath: kmsFilePath,
      editable: false,

      value: this.tableList.row.name.substring(0,this.tableList.row.name.indexOf(this.tableList.row.type)-1),
    }
  },
  watch:{
    editcolumn(val){   
      this.editable = val; 
    },
    tableList(datas){
      this.value = datas.row.name.substring(0,datas.row.name.indexOf(datas.row.type)-1)
    }
  },

  methods:{
    /**
     * 修改名称
     */
    handleChange(e){
      this.value = e;
    },

    /**
     * 确定重命名
     */
    sureToEdit(index, row){  
      row.name = this.value + "." + row.type;
      this.$emit('handleRenameFilesOk', index, row);
    },

    /**
     * 取消重命名
     */
    cancelEdit(index, row){
      this.value = row.name.substring(0,row.name.indexOf(row.type)-1)
      this.$emit('handleRenameCancel', index);
    },

    /**
     * 预览文件
     */
    async clickFileForPreview(row){
     const preview_params={
        id: row.id,  //文件id
        diskId: row.diskId
      }
      // if(!this.preview){
      //     this.$message("没有预览该文件的权限");
      //     return
      // }  判断有没有预览的权限 对文件夹进行一样的处理   暂时不写
      let preview_url = (getPreviewUrl(preview_params)).substring(1);
      let that = this;
      API.getFilePreviewAble(row.id, {
        onSucess: resp => {
        const newWin = window.open(); 
          if(resp.data.errcode == 0){
            newWin.location.href = url;  
            let url;
            if(resp.data.errcode == 0){
              if(row.type == "mp4" || row.type == "mp3"){
                url = kmsConfig.kmsFilePath + "/uploads/kms/" + row.url
              }else{
                if(kmsConfig.staticContextPath){
                  url = kmsConfig.staticContextPath + kmsConfig.kmsFilePath + "/asset" + preview_url;
                }else{
                  url = kmsConfig.kmsFilePath + "/kms/asset" + preview_url;
                }
              }
              newWin.location.href = url;  
            }
          }
        },
        onError: error =>{
 
          if(error.response.data.errcode == '403' ) {
           
          //  alert(0)
            this.$emit('showApplyAuthorityModal', row.id, 'preview');
          }else{
            this.$message(error.response.data.errmsg);
          }
        }
      })
      // //关闭新窗口回调方法
      // let loop = setInterval(function() {     
      //   if(newWin  != null && newWin.closed) {   
      //     clearInterval(loop);    
      //     //do something 在这里执行回调
      //     that.$emit("closeWindow",that.tableList.row.diskId);
      //   }    
      // }, 500); 
    }
  }
}
</script>