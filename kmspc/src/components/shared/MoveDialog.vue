<template>
  <div>
    <el-dialog
      :title="$t('btns.move_to')"
      :visible.sync="moveTreeModalParams.moveTreeModalVisible"
      width="30%"
      :before-close="handleMoveDialogClose">

      <div class="dept-tree">
        <el-tree
          :props='props'
          class="filter-tree"
          :data="moveTreeModalParams.treeData"
          node-key="id"
          @node-click="handleNodeClick"
        >
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleMoveDialogClose">{{$t('btns.cancel')}}</el-button>
        
        <el-button type="primary" @click="handleMoveOk">{{$t('btns.determine')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import API from "@/api.js";
export default {
  name: 'movedialog',
  props: [
    'moveTreeModalParams',
  ],
  data(){
    return{
      selectedFolderId: "",
      props: {
        children: 'children',
        label:"name"
      }
    }
  },

  methods: {
    /**
     * 取消移动
     */
    handleMoveDialogClose(){
      this.$emit('handleMoveDialogClose');
    },

    /**
     * 获取选中节点id
     */
    handleNodeClick(data) {
      this.selectedFolderId = data.id;
    
    },
    
    /**
     *  确定移动
     */
    handleMoveOk(){
      
      if(this.moveTreeModalParams.isObj){
        let moveObjParams = {
          "diskId" : this.moveTreeModalParams.diskId,
          "destfolderId" : this.selectedFolderId,
          "fileObjs" : this.moveTreeModalParams.fileId
        }
        this.$emit('handleMoveFileObj', moveObjParams);
      }else{
        let moveParams = {
          "isfolder" : this.moveTreeModalParams.isfolder,
          "diskId" : this.moveTreeModalParams.diskId,
          "folderId" : "",
          "fileId" : "",
          "destfolderId" : this.selectedFolderId
        }
        if(this.moveTreeModalParams.isfolder){
          moveParams.folderId = this.moveTreeModalParams.fileId;
        }else {
          moveParams.fileId = this.moveTreeModalParams.fileId;
        }
        this.$emit('handleMoveFile', moveParams);
      }
      this.$emit('handleMoveDialogClose');
    }
  }
}
</script>