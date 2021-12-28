<template>
  <div class="myDiary">
    <div class="diary-tabs">
      <el-tabs :tab-position="tabPosition" v-model="active">
        <el-tab-pane :label="$t('my.downloads')" name="upload-log">
          <my-Upload :active="active"></my-Upload>
        </el-tab-pane>
        <el-tab-pane :label="$t('my.share')" name="share-log">
          <my-Share :active="active"></my-Share>
        </el-tab-pane>
        <el-tab-pane :label="$t('my.collection')" name="collection-log">
          <my-Collection :active="active"></my-Collection>
        </el-tab-pane>
        <el-tab-pane :label="$t('my.preview')" name="preview-log">
          <my-Preview :active="active"></my-Preview>
        </el-tab-pane>
       
      </el-tabs>
    </div>
  </div>
</template>
<script>
import myShare from "./myDiary/MyShare";
import myUpload from "./myDiary/MyUpload";
import myCollection from "./myDiary/MyCollection";
import myPreview from "./myDiary/MyPreview";
export default {
  name: "myDiary",
  props: [
    'activeName'
  ],
  components:{
    myShare,
    myUpload,
    myCollection,
    myPreview
  },
  data () {
    return {
     tabPosition: 'left',
     active: 'upload-log'
    }
  },
  watch:{
    activeName(val){
      if(val == 'mydiary'){
        this.active = 'upload-log';
      }
    },
  },
}
</script>