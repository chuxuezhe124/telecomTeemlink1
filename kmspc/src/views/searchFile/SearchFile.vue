<template>
  <div class="searchFile">
    <div class="card" :class="{'paddingTop':paddingTop}">
      <div class="card-header">
          <el-row class="searchFile-title">
            <el-col :span="24">
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane :label="$t('label.full')" name="mysearch">
                  <my-Search :searchName="searchName"></my-Search>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.browse_latest')" name="newpreview">
                  <new-Preview
                    :activeName="activeName">
                  </new-Preview>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.share_latest')" name="newshare">
                  <new-Share
                    :activeName="activeName">
                  </new-Share>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.latest_upload')" name="newupload">
                  <new-Upload
                    :activeName="activeName">
                  </new-Upload>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.retrieve_latest')" name="newsearch">
                  <new-Search
                    :activeName="activeName">
                  </new-Search>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.hottest_articles')" name="hotview">
                  <hot-View
                    :activeName="activeName">
                  </hot-View>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import mySearch from "../../components/searchFile/MySearch";
import newPreview from "../../components/searchFile/NewPreview";
import newShare from "../../components/searchFile/NewShare";
import newUpload from "../../components/searchFile/NewUpload";
import newSearch from "../../components/searchFile/NewSearch";
import hotView from "../../components/searchFile/HotView";
export default {
  name: "searchFile",
  components: {
    mySearch,
    newPreview,
    newShare,
    newUpload,
    newSearch,
    hotView,
  },
  data() {
    return {
      activeName: 'mysearch',
      paddingTop: false,    //头部padding
      searchName: '',       //检索的信息
    }
  },
  mounted(){
    let params = this.$route.query.params;
    if(params && params.tabName){
      this.activeName = params.tabName;
    }
    if(params && params.searchName){  //首页检索进来
      this.searchName = params.searchName;
    }
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    }
  },
}
</script>