<template>
  <div>
    <div class="edit-folder" v-if="disksList && disksList.datas && disksList.datas[handleindex] && disksList.datas[handleindex].isEditable?disksList.datas[handleindex].isEditable:editable" :index="tableList.$index">
      <i class="icon-file icon-file-folder"></i>
      <el-input size="mini" v-model="value"></el-input>
      <i class="el-icon-check" @click="sureToEdit(tableList.$index, tableList.row)"></i>
      <i class="el-icon-close"  @click="cancelEdit(tableList.$index, tableList.row)"></i>
    </div>
 
    <div v-if="!(disksList && disksList.datas  && disksList.datas[handleindex] && disksList.datas[handleindex].isEditable?disksList.datas[handleindex].isEditable:editable)" :index="tableList.$index">
      <a class="floder-name" @click="clickFolder(tableList.row)">
        <i class="icon-file icon-file-folder"></i>
        {{tableList.row.name}}
        <img v-if="tableList.row.orderNo != '0'" style="margin-left: 10px" src="@/assets/images/top.png"/>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'editfolder',
  props: [
    'tableList',
    'handleindex',
    'editcolumn',
    'disksList',
  ],
  data() {
    return{
      editable: false,
      value: ""
    }
  },
  watch:{
    editcolumn(val){
      this.editable = val; 
    },
    tableList(data){
      this.value = data.row.name;
    }
  },

  mounted(){
    this.value = this.tableList.row.name
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
      row.name = this.value;
      if(this.value == ""){
        this.$message({
          message: this.$t('msg.file_name_noempty'),
          type: 'warning'
        });
      }else{
        this.$emit('handleRenameFolderOk', index, row);
      }
    },

    /**
     * 取消重命名
     */
    cancelEdit(index, row){
      this.value = row.name;
      this.$emit('handleRenameCancel', index);
    },

    /**
     * 进入下一级
     */
    clickFolder(row){      
      this.$emit('clickFolder', row);
    },
  }
}
</script>