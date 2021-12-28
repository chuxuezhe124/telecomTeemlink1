<template>
  <div>
    <el-dialog
      :title="$t('title.collection')"
      :visible.sync="collectTreeModalParams.collectTreeModalVisible"
      width="30%"
      :before-close="handleCollectDialogClose">
      <div class="dept-tree">
        <el-tree
          :props='props'
          class="filter-tree"
          :data="treeData"
          node-key="id"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          @current-change="handleNodeClick"
        >
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleCollectDialogClose">{{$t('btns.cancel')}}</el-button>
        <el-button size="small" type="primary" :disabled="disabled" @click="handleCollectOk">{{$t('btns.determine')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: 'collectdialog',
  props: [
    'collectTreeModalParams',
  ],
  data(){
    return{
      user: {},
      selectedFolderId: "",
      diskId: "",
      treeData: [],
      props: {
        children: 'children',
        label:"name"
      },
      disabled: true
    }
  },

  watch:{
    collectTreeModalParams(){
      this.getinitData();
    },
  },

  mounted(){
    this.getMyProfile();
  },

  methods: {
    /**
     * 获取当前用户信息
     */
    getMyProfile(){
      API.getMyProfile({
        onSucess: resp => {
          this.user = resp.data.data;
          this.getinitData();
        } 
      })
    },
    /**
     * 初始化获取目录树
     */
    async getinitData(){
      const user = this.user;
      const diskId = user.id;
      this.diskId = diskId;
      const fileId = this.collectTreeModalParams.fileId;
      if(diskId != "" && fileId !=""){
        const selectedFileArray = [];
        let single = {
          "fileObjectId" : fileId,
          "isFolder" : false
        }
        selectedFileArray.push(single);
        const result = (await API.getFolderstree(diskId, selectedFileArray)).data;
        const treeData = JSON.parse(result.data);
        if(treeData.length == 1) treeData[0].root = true;
        this.treeData = treeData;
      }
    },

    /**
     * 获取选中节点id
     */
    handleNodeClick(data, node) {
      if(node.level == 1){
        this.disabled = true;
          this.$message({
            type: 'warning',
            message: this.$t('msg.no_root_sl')
          });
      }else{
        this.selectedFolderId = data.id;
        this.disabled = false;
      }
    },

    /**
     * 确定收藏
     */
    handleCollectOk(){
      let collectParams = {
        "diskId" : this.diskId,
        "folderId" : this.selectedFolderId,
        "fileId" : this.collectTreeModalParams.fileId
      }
      API.handleCollectFile(collectParams,{
        onSucess: resp => {
          if(resp.data.data){
            this.$message({
              type: 'success',
              message: this.$t('msg.file_saved_ss')
            });
            this.$emit('handleCollectDialogClose');
          }
        },
        onError: err =>{
          this.$message({
            message: err.response.data.errmsg,
            type: 'warning'
          });
        }
      })
    },

    /**
     * 取消收藏
     */
    handleCollectDialogClose(){
      this.$emit('handleCollectDialogClose');
    },
  }
}
</script>