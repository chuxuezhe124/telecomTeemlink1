<template>
  <div id="header">
    <div id="myapp-header" class="clearfix">
        <div class="nav-left-box fl">
          <a href="#">
            <img src="@/assets/images/good-logo.png" alt class="logo" />
          </a>
        </div>
        <div class="myapp-tab">
          <div class="homepageN fl">
            <div class="a-link" @click="home">
              <i class="el-icon-house"></i>
             {{$t("home_page")}} 
            </div>
          </div>
          <div class="main-tab-carousel" ref="box">
            <ul class="main-tab" ref="ulBox">
              <li v-for="(tab,index) in tab" :key="tab.key" :ref="'li'+index" @click="tabChange(tab)">
                <div
                  class="main-sortable"
                  :class="{'tabActive': tab.active }"
                >
                  <cite>{{tab.title}}</cite>
                  <i class="el-icon-close" @click.stop="tabClose(tab)"></i>
                  <!-- <i class="el-icon-close" @click.stop="onCloseBtnClick(tab,index)"></i> -->
                </div>
              </li>
            </ul>
          </div>
          <div class="homepageN-right">
            <ul class="center-navul">

              <!-- 用戶信息 -->
              <li class="center-navli">
                <div class="mysetup">
                  <a href="javascript:;">
                    <img :src="this.$store.state.user.avatar" class="centericon" v-if="this.$store.state.user.avatar" />
                    <img src="@/assets/images/face.jpg" class="centericon" v-else/>
                    <span class="personal-name">{{this.$store.state.user.name}}</span>
                    <i class="el-icon-arrow-down pull-down"></i>
                  </a>
                  <div class="personal-settings">
                    <span class="triangle"></span>
                    <ul>
                      <!-- <li @click="addTab({title:'个人设置',key:'11',name:'personal'})"> -->
                        <li @click="handleClick">
                        <a>
                          <i class="el-icon-user"></i>
                          <cite> {{$t("user.personal_settings")}} </cite>
                        </a>
                      </li>
                      <li @click="login">
                        <a>
                          <i class="el-icon-switch-button"></i>
                          <cite>{{$t("user.exit_system")}}</cite>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <el-dialog :title="$t('personals_ettings')" 
      :visible.sync="dialogTableVisible"
      :before-close="closePersonalDialog"
      append-to-body>
        <div>
          <personal-Setting
          @closePersonalDialog="closePersonalDialog"></personal-Setting>
        </div>
      </el-dialog>
  </div>
</template>
<script>
import API from "@/api.js";
import personalSetting from "@/components/shared/Personal.vue"
export default {
  data(){
    return{
      tab: [],    //标签页
      user: this.$store.state.user,
      dialogTableVisible: false
    }
  },
  components:{
    personalSetting
  },
  mounted(){
  },
  methods:{
    /**
     * 返回首页
     */
    home(){
      let stateTab = this.$store.state.tab;
      stateTab.map((tabs)=>{
        tabs.active = false;
      });
      this.tab = stateTab;
      this.$forceUpdate();
      this.$emit('returnHome', "returnHome");
    },
    /**
     * 个人设置
     */
    handleClick(){ 
      this.dialogTableVisible = true;
    },
    /**
     * 关闭对话框
     */
    closePersonalDialog(){
      this.dialogTableVisible = false;
    },
    /**
     * 添加标签
     */
    addTab(tab){
      let json = [];
      let arr = {};
      arr.title = tab.title;
      arr.id = tab.key;
      arr.name = tab.name;
      arr.addTab = false;
      json.push(arr);
      this.$store.commit("addTabHeard",json)
      this.tab = json;
      let params = {
        tabName : tab.name
      }
      this.$router.push({
        path: tab.name,
        query: {params:params}
      })
    },
    /**
     * 切换标签页
     */
    tabChange(tab){
      let stateTab = this.$store.state.tab;
      stateTab.map((tabs)=>{
        if(tabs.key == tab.key){
          tabs.active = true;
        }else{
          tabs.active = false;
        }
      });
      this.tab = stateTab;
      this.$forceUpdate();
      if(tab.key >6){
        let routeName = "";
        switch (tab.key){
          case "7":       //最新文档
            routeName = "searchFile";
            break;
          case "8":       //最热文档
            routeName = "searchFile";
            break;
          case "9":       //我的日志
            routeName = "personKm";
            break;
          case "12":
            routeName = "searchFile";
            break;
        }
        let params = {
          tabName : tab.name
        }
        this.$router.push({
          path: routeName,
          query: {params:params}
        })
      }else{
        this.$router.push({name:tab.name})
      }
    },
    /**
     * 关闭标签页
     */
    tabClose(tab){
      let tabState = this.$store.state.tab;
      let oldLength = this.$store.state.tab.length;
      //选中页签
      let tabCheck = "";
      //当前页签的key
      let currentKey = "";
      for(let i=0;i<tabState.length;i++){
        if(tabState[i].name == this.$route.name){
          currentKey = tabState[i].key;
        }else if(this.$route.query.params){
          if(tabState[i].name == this.$route.query.params.tabName){
            currentKey = tabState[i].key;
          }
        }
        //针对团队km进入订阅路由地址改变
        if(this.$route.name == "stagekm"){
          if(tabState[i].name == "teamKm"){
            currentKey = tabState[i].key;
          }
        }else if(this.$route.name == "newKnowledgeMap"){
          //针对知识文档&&员工待办进入新建知识地图路由地址改变
          if(tabState[i].name == "knowledgeMap" || tabState[i].name == "personKm"){
            currentKey = tabState[i].key;
          }
        }else if(this.$route.name == "knowledgePreview"){//针对知识文档进入查看知识地图路由地址改变
          if(tabState[i].name == "knowledgeMap"){
            currentKey = tabState[i].key;
          }
        }
        if(tabState[i].key == tab.key){
          this.tab = tabState.splice(i,1);
          tabCheck = i;
        }
      }
      if(currentKey == tab.key){
        if(tabCheck == 0){
          this.$router.push({name:"homepage"})
        }else{
          let routeName = "";
          switch (tabState[tabCheck-1].key){
            case "7":       //最新文档
              routeName = "searchFile";
              break;
            case "8":       //最热文档
              routeName = "searchFile";
              break;
            case "9":       //我的日志
              routeName = "personKm";
              
              break;
            case "12":       //首页搜索
              routeName = "searchFile";
              break;
          }
          tabState[tabCheck-1].active = true;
          if(routeName){
            let params = {
              tabName : tabState[tabCheck-1].name
            }
            this.$router.push({
              path: routeName,
              query: {params:params}
            })
          }else{
            this.$router.push({name:tabState[tabCheck-1].name})
          }
        }
      }
    },
    /**
     * 退出登录
     */
    login(){
      let that = this;
      // window.setCookie(accessToken, "", -1);
      // document.cookie = "accessToken='';path/";
      document.cookie="accessToken=''; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/";
      parent.window.location = staticContextPath+'/signon';
      // API.logout({
      //     onSucess: resp => {
      //       if(resp.data.errcode == 0){
      //         //退出登录时将vuex的tab标签页清空
      //         that.$store.state.tab = [];
      //         if(resp.data.data){
      //         // parent.window.location = staticContextPath+resp.data.data;
      //         parent.window.location = staticContextPath+'/signon';
      //         }else{
      //            parent.window.location = staticContextPath+kmsConfig.signonContextPath;
      //         }
             

      //       }
      //     } 
      //   })
    },
    knowledgeMapclink(){
      window.open("https://graphxr.kineviz.com/share/612f0a037218aa003c3ddb12/procedual/6145c9f8782c18005293053a")
    },
    reportStatistics(){
      window.open("https://datav.aliyuncs.com/share/21a6b27f024624ac1e9b1254120bcbb7")
    }

  },
  computed: {
    isAddTab() {
      this.tab = this.$store.state.tab;
      return this.$store.state.tab;
    }
  },
  watch: {
    isAddTab(value){
      this.tab = value;
    },
  }
}
</script>
