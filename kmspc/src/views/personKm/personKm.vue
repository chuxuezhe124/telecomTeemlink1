<template>
  <div class="personKm">
    <div class="card" :class="{'paddingTop':paddingTop}">
      <div class="card-header">
          <el-row class="personKm-title">
            <el-col :span="24">
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane :label="$t('my.to_do_list')" name="mypending">
                  <my-Pending
                  :activeName="activeName"
                  ></my-Pending>
                </el-tab-pane>
                <el-tab-pane :label="$t('my.library')" name="mylibrary">
                  <my-library
                  :activeName="activeName"
                  ></my-library>
                </el-tab-pane>
                <el-tab-pane :label="$t('tabs.share_list')" name="sharelist">
                  <share-List
                  :activeName="activeName"
                  ></share-List>
                </el-tab-pane>
                <el-tab-pane :label="$t('tabs.recent_editor')" name="recentedit">
                  <recent-Editors
                  :activeName="activeName"
                  ></recent-Editors>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.recently_uploaded')" name="recentupload">
                  <recent-Upload
                  :activeName="activeName"
                  ></recent-Upload>
                </el-tab-pane>
                <el-tab-pane :label="$t('most.recent_search')" name="recentsearch">
                  <recent-Search
                  :activeName="activeName"
                  ></recent-Search>
                </el-tab-pane>
                <el-tab-pane :label="$t('my.subscription')" name="mysubscription">
                  <subscription-Table
                  :activeName="activeName"
                  ></subscription-Table>
                </el-tab-pane>
                <el-tab-pane :label="$t('my.log')" name="mydiary">
                  <my-Diary
                  :activeName="activeName"
                  ></my-Diary>
                </el-tab-pane>
                <el-tab-pane :label="$t('tabs.speech_text')" name="speechTotext">
                  <speech-to-text
                  :activeName="activeName"
                  ></speech-to-text>
                </el-tab-pane>
                <el-tab-pane :label="$t('tabs.Text_speech')" name="textToSpeech">
                  <text-to-speech
                  :activeName="activeName"
                  ></text-to-speech>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
      </div>
    </div>
    
  </div>
</template>

<script>
import myPending from "../../components/personKm/myPending";
//我的文库
import MyLibrary from "../../components/personKm/MyLibrary";
import recentUpload from "../../components/personKm/recentUpload";
import recentSearch from "../../components/personKm/recentSearch";
import shareList from "../../components/personKm/ShareList";
import recentEditors from "../../components/personKm/RecentEditors";
import subscriptionTable from "../../components/personKm/SubscriptionTable";
import myDiary from "../../components/personKm/MyDiary";
import SpeechToText from "../../components/personKm/SpeechToText";
import TextToSpeech from "../../components/personKm/TextToSpeech";
export default {
  name: "personKm",
  components: {
    myPending,
    MyLibrary,
    recentUpload,
    recentSearch,
    shareList,
    recentEditors,
    subscriptionTable,
    myDiary,
    SpeechToText,
    TextToSpeech
  },
  data () {
    return {
      activeName: 'mypending',
      paddingTop: false,    //头部padding
    }
  },

  mounted(){
    this.getinitTab();
    let params = this.$route.query.params;
    if(params){
      this.activeName = this.$route.query.params.tabName;
    }
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
  },

  methods: {
    getinitTab(){
      if(this.$route.query.activeName !=  undefined){
        this.activeName = this.$route.query.activeName;
      }else{
        this.activeName = 'mypending';
      }
    },

    handleClick(tab) {
      this.activeName = tab.name;
    }
  }
}
</script>