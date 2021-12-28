<template>
  <ul class="software-navul">
    <li class="software-navli flowCenter" v-if="$root.haveflowCenter">
      <a href="javascript:;" data-appid="flowcenterapp" data-url="html/flowcenter.html">
        <i class="fa fa-th-large"></i>
        <cite>{{$t('p_center')}}</cite>
      </a>
      
      <ul id="tabs_flowcenter" class="tabs_menu sidebar-menu d-inline-block">
        <li tabid="launch" menu="open">
          <a @click="$emit('add-tab',{id:'104',name:'发起新建',linkType:'104'})">
            <cite class="main-menu_title">{{$t('new_create')}}</cite>
          </a>
        </li>
        <li tabid="pending" menu="open">
          <a @click="$emit('add-tab',{id: new Date().getTime(), name:'我的待办', linkType:'105'})">
            <cite class="main-menu_title">{{$t('todo')}}</cite>
          </a>
        </li>
        <li tabid="processed" menu="open">
          <a @click="$emit('add-tab',{id: new Date().getTime(), name:'经办跟踪', linkType:'106'})">
            <cite class="main-menu_title">{{$t('track')}}</cite>
          </a>
        </li>
        <li tabid="pending" menu="open">
          <a @click="$emit('add-tab',{id:'10',name:'我的待阅',linkType:'10'})">
            <cite class="main-menu_title">{{$t('toread')}}</cite>
          </a>
        </li>
        <li tabid="pending" menu="open">
          <a @click="$emit('add-tab',{id:'11',name:'我的已阅',linkType:'11'})">
            <cite class="main-menu_title">{{$t('read')}}</cite>
          </a>
        </li>
        <li tabid="dashboard" menu="open">
          <a @click="$emit('add-tab',{id:'08',name:'仪表分析',linkType:'08'})">
            <cite class="main-menu_title">{{$t('analysis')}}</cite>
          </a>
        </li>
      </ul>
    </li>
    <template v-for="(app,i) in data">
      <li :key="app.id" v-if="i<2" class="software-navli layui-nav-item">
        <a href="javascript:;" :ref="'ref'+i" v-on:click="loadAppMenu(app.id, app.name)">
          <cite>{{app.name}}</cite>
        </a>
      </li>
    </template>
    <template v-if="$root.user.showEmail">
      <li class="software-navli layui-nav-item">
        <a href="javascript:;">
          <cite>个人邮箱</cite>
        </a>
      </li>
    </template>
    <li class="software-navli layui-nav-item other-software" 
      @mouseover="isShowList = true"
      @mouseout="isShowList = false"
      >
      <a href="javascript:;">
        <i class="el-icon-more"></i>
      </a>
      <div class="softwarelist" v-show="isShowList && data.length>2">
        <span class="triangle"></span>
        <el-scrollbar class="scrollbar">
          <ul class="other-software-ul">
            <template v-for="(app,i) in data">
              <li :key="app.id" v-if="i>=2" class="other-software-li">
                <a :title="app.name" href="javascript:;" v-on:click="loadAppMenu(app.id, app.name)" :data-appid="app.id">
                  <cite>{{app.name}}</cite>
                </a>
              </li>
            </template>
          </ul>
        </el-scrollbar>
      </div>
    </li>

    <li class="software-navli regular-use-li">
      <a href="#">
        <span>
          <el-popover
            ref="popover"
            placement="top-start"
            width="200"
            trigger="hover"
          >
            <div class="popover">
              <div>
                <div class="list" 
                  v-for="(item, index) in navCommonlyUsed" 
                  :key="index"
                  @click="onCommonlyUsedClick(item)"
                >
                  {{item.name}}
                </div>
              </div>
            </div>
          </el-popover>
        </span>
        <span v-popover:popover class="commonly-used" v-show="navCommonlyUsed.length > 0">
          {{$t('view.commonly_used')}}
        </span>
        <span class="commonly-used" v-show="navCommonlyUsed.length < 0">
          {{$t('view.commonly_used')}}
        </span>
        <!-- <button class="btn offer-use" v-popover:popover>常用</button> -->
        <!-- <el-button v-popover:popover1>hover 激活</el-button> -->
      </a>
      <div class="regular-use"></div>
    </li>
  </ul>
</template>

<script>
// import API from "@/api.js";
// import projectJSON from '@/assets/json/project.json';

export default {
  name: "obpm-main-appbar",
  data() {
    return {
      tabs: [],
      appid: "km1",
      options: [],
      isShowList: false,    //是否展示软件列表
    };
  },

  created() {
    // this.getApplications();
  },

  computed: {
    //导航栏常用列表
    navCommonlyUsed() {
      let data = this.$store.getters.getNaviBarCommonlyUsed;
      return data;
    },

    data: function() {
      return this.$store.state.apps;
    }
  },
  methods: {
    onCommonlyUsedClick(menu) {
      if(menu.type == 'view') {
        this.$emit("add-tab", {
          id: menu.id,
          name: menu.name,
          appId: menu.applicationId,
          linkType: '01',
          actionContent: menu.actionContent,//存放FORMID或VIEWID
        });
      }else if (menu.type == 'chart') {
        this.$emit("add-tab", {
          id: menu.id,
          name: menu.name,
          appId: menu.applicationId,
          linkType: '02',
          actionContent: menu.actionContent,//存放FORMID或VIEWID
        });
      }else if (menu.type == 'customizeReport') {
        this.$emit("add-tab", {
          id: menu.id,
          name: menu.name,
          appId: menu.applicationId,
          linkType: '09',
          actionContent: menu.actionContent,//存放FORMID或VIEWID
        });
      }else if (menu.type == 'page') {
        let url = menu.actionContent;
        let isForm = url.search("form.html") != -1;
        let isView = url.search("view.html") != -1;
        let isChart  = url.search("chart.html") != -1;
        let urlArrayF = url.split("?");
        let urlArray = '';
        if(urlArrayF[1]) {
          urlArray = urlArrayF[1].split("&");
        }
        let isExternalLink = false;
        let type = '';
        if(isForm) {
          type = '00';
        }else if(isView) {
          type = "01"
        }else if(isChart) {
          type = "02"
        }
        else if (!isForm && !isView) {
          type = "103"//widget链接内容链接地址
          isExternalLink = true
        }
        let obj = {};
        if(urlArray && urlArray.length > 0) {
          for(let i=0; i<urlArray.length; i++) {
            let val = urlArray[i].split("=");
            obj[val[0]] = val[1];
          }
        }
        if(isExternalLink) {
          this.$emit("add-tab", {
            linkType: type,
            appId: menu.applicationId,
            actionContent: menu.actionContent,
            name: menu.name,
            _select: '',
            viewId: "",
          });
        }else {
          this.$emit("add-tab", {
            linkType: type,
            appId: menu.applicationId,
            actionContent: obj.viewId?obj.viewId:obj.formId?obj.formId:obj.chartId,
            name: menu.name,
            _select: '',
            viewId: "",
          })
        }
        // this.$emit("add-tab", {
        //   id: menu.id,
        //   name: menu.name,
        //   appId: this.data.appId,
        //   linkType: '103',
        //   actionContent: menu.actionContent,//存放FORMID或VIEWID
        // });
      }
    },
    getApplications() {
      this.$api.getApplications(
        {
          onSucess: res => {
            this.options = res.data.data;
          }
      });
    },
    loadAppMenu: function(appId, name) {
      if (appId != "km" && appId != "pm" && appId != "qm") {
        this.$root.appid = appId;
      }
      // if(appId === 'km') {
      //   let ary = projectJSON.km;
      //   console.log("arr--->",ary);
      // }else if(appId === 'qm') {
      //    
      // }else {
      //   this.$store.dispatch("loadMenus", appId);

      // }
      this.$store.dispatch("loadMenus", {appId, name});
    },

    activeHome: function() {
      this.tabs.forEach(function(value) {
        value.active = false;
      });
    },
    
    closeTab: function(tab) {
      let i = -1;
      this.tabs.forEach(function(value, index) {
        if (value.id == tab.id) {
          i = index;
        }
      });

      this.tabs.splice(i, 1);
      let act = this.tabs[i];
      if (act) {
        this.activeTab({ id: act.id });
      }
    },
    activeTab: function(tab) {
      this.tabs.forEach(function(value) {
        if (value.id == tab.id) {
          value.active = true;
        } else {
          value.active = false;
        }
      });
    }
  },
  beforeCreate: function() {
    let user = this.$root.user;
    let obj = {
      doId: user.domainId,
      userId: user.id,
      profile: user,
    }
    this.$store.commit('landingUser', obj);
    // this.$store.dispatch("landingUser");
    let applications = this.$root.applications;
    this.$store.dispatch("loadApps", applications); //异步执行
  }
};
</script>

<style lang="scss" scoped>
.popover {
  width: 100%;
  .list {
    width: 100%;
    height: 35px;
    line-height: 35px;
    cursor: pointer;
    padding-left: 10px;
    box-sizing: border-box;
  }
  .list:hover {
    background-color: #f4f6f6;
  }
}
</style>