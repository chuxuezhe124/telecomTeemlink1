<template>
  <div id="myapp">
    <div id="myapp-header" class="clearfix">
      <div class="nav-left-box fl">
        <a href="#">
          <img src="@/assets/images/good-logo.png" alt class="logo" />
        </a>
        <a href="#" @click="hiddenMenu">
          <i class="fa fa-dedent nav-menu" v-show="showMenu"></i>
          <i class="fa nav-menu fa-indent" v-show="!showMenu"></i>
        </a>
      </div>
      <div class="app-bar fl">
        <obpm-main-appbar @change-menu="changeMenu" @add-tab="addTab" />
      </div>
      <div class="center-nav fr">
        <ul class="center-navul">
          <li class="center-navli layui-nav-item lockcms">
            <a href="javascript:;" @click="lockScreen">
              <i class="lockScreenicon"></i>
            </a>
          </li>

          <li class="center-navli center-navli-last">
            <div class="mysetup">
              <a href="javascript:;">
                <img v-if="$root.user.avatar" :src="$root.user.avatar" class="centericon" />
                <img v-else src="../assets/images/face.jpg" class="centericon" />
                <span class="personal-name">{{$store.state.myProfile.name}}</span>
                <i class="fa fa-angle-down pull-down"></i>
              </a>
              <div class="personal-settings">
                <span class="triangle"></span>
                <ul>
                  <li>
                    <a @click="addTab({id:'02',name:'个人设置',linkType:'102'})">
                      <i class="fa fa-user-o"></i>
                      <cite>{{$t('p_set')}}</cite>
                    </a>
                  </li>
                  <li>
                    <a @click="addTab({id:'03',name:'信息管理',linkType:'03',notice:notice})">
                      <i class="fa fa-file-text-o"></i>
                      <cite>
                        <span>{{$t('m_management')}}</span>
                        <span class="cite-num" v-if="notice>=0">{{notice}}</span>
                      </cite>
                    </a>
                    <!-- <cite class="num-cite">{{$t('management')}}</cite> -->
                  </li>
                  <li v-if="$store.state.myProfile.departmentUser">
                    <a @click="systemManagement">
                      <i class="systemManagicon" data-icon="icon-shezhi1"></i>
                      <cite>{{$t('s_management')}}</cite>
                    </a>
                  </li>
                  <li v-if="isChangeDomain">
                    <a @click="changeDomain">
                      <i class="fa fa-exchange"></i>
                      <cite>{{$t('c_organization')}}</cite>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:;" @click="signOut">
                      <i class="fa fa-power-off"></i>
                      <cite>{{$t('e_system')}}</cite>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
        <div class="message-popup">
          <div class="message-popup-close">
            <i class="fa fa-times"></i>
          </div>
          <ul>
            <li data-id="0" style="display:none">
              <span class="message-popup-num"></span>
              <span>{{$t('n_message')}}</span>
              <a class="message-popup-active" data-url="../../message/message.jsp">
                {{$t('c_look')}}
                <cite style="display: none"> {{$t('news')}}</cite>
              </a>
            </li>
            <li data-id="1" style="display:none">
              <span class="message-popup-num"></span>
              <span>{{$t('n_notice')}}</span>
              <a
                class="message-popup-active"
                data-url="../../message/message.jsp?active=announcement"
              >
                {{$t('c_look')}}
                <cite style="display: none">{{$t('notice')}}</cite>
              </a>
            </li>
            <li data-id="2" style="display:none">
              <span class="message-popup-num"></span>
              <span>{{$t('n_reply')}}</span>
              <a class="message-popup-active" data-url="../../message/message.jsp?active=comment">
                {{$t('c_look')}}
                <cite style="display: none">{{$t('reply')}}</cite>
              </a>
            </li>
            <li data-id="3" style="display:none">
              <span class="message-popup-num"></span>
              <span>{{$t('n_event')}}</span>
              <a class="message-popup-active" data-url="../../message/message.jsp?active=notice">
                {{$t('c_look')}}
                <cite style="display: none" >{{$t('j_event')}}</cite>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <!-- v-if="notice && showMessagePopup" -->
      <div class="prompt-popup" v-if="otherNotice.length > 0 && showMessagePopup">
        <div class="message">
          <div class="close-icon">
            <div class="message-popup-close" @click.stop="closeMessagePopup">
              <i class="fa fa-times"></i>
            </div>
          </div>
          <div class="tip" v-for="(item, index) in otherNotice" :key="index">
            <span class="tip-first">{{item.value}}&nbsp;&nbsp;</span>
            <span v-if="item.type == '0'">{{$t('n_notice')}}&nbsp;</span>
            <span v-if="item.type == '1'">{{$t('n_notice')}}&nbsp;</span>
            <span v-else-if="item.type == '2'">{{$t('n_reply')}}&nbsp;</span>
            <span v-else-if="item.type == '3'">{{$t('n_event')}}&nbsp;</span>
            <span class="tip-tree" @click="jumpToInfo({id:'03',name:'信息管理',linkType:'03',remind:'true'})">{{$t('c_look')}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="myapp-content">
      <transition name="slide-fade">
        <div class="nav-bar" v-if="showMenu">
          <div class="app-name">{{applicationName}}</div>
          <el-scrollbar style="height:calc(100% - 40px)">
            <main_navbar 
              :appid="appid" 
              :key="appid" 
              :updateMenu="updateMenu" 
              :updateMenuData="updateMenuData" 
              @add-tab="addTab" 
            />
          </el-scrollbar>
        </div>
      </transition>
      <!-- 内容部分，包括选项卡 -->
      <main_content
        ref="mychild"
        :tabs="tabs"
        @add-tab="addTab"
        @close-tab="closeTab"
        @close-all="closeAllTab"
        @active-tab="activeTab"
        @active-home="activeHome"
        @updateViewNumber="updateViewNumber"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </div>
    <!--一键锁屏-->
    <div id="lockWraper" v-if="isLock == 'true'">
      <div class="lock-content">
        <div class="img">
          <img src="../assets/images/face.jpg" alt="">
        </div>
        <div class="admin-header-lock-name">
          {{$store.state.myProfile.name}}
        </div>
        <div class="input_btn">
          <span class="input-box">
            <div class="error-tip" v-if="isPasswordError=='true'">
              {{nullPrompt?nullPrompt:$t('msg.error_pwd')}}
            </div>
            <input
              v-model="password" 
              type="password" 
              class="admin-header-lock-input layui-input" 
              :placeholder="$t('msg.enter_pwd_lock')" 
              name="lockPwd" 
              id="lockPwd">
          </span>
          <span class="un-lock" @click="unlockScreen">
            {{$t('n_lock')}}
          </span>
        </div>
        <div class="tip">
        {{$t('e_password')}}
        </div>
      </div>
    </div>
    <!-- 超时登录界面 -->
    <div>
      <el-dialog
        :title="$t('view.timeout')"
        :visible.sync="dialogVisible"
        width="30%"
        :modal="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        >
         <el-form size="mini" label-width="80px">
          <el-form-item :label="$t('profile.account')">
            <el-input v-model="$store.state.myProfile.loginNo" autocomplete="off" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('placeholder.pwd')">
            <el-input v-model="pwd" autocomplete="off" show-password></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="hanleClickLogin" size="mini">{{$t('btns.back')}}</el-button>
          <el-button type="primary" @click="hanleClick" size="mini">{{$t('btns.login')}}</el-button>
        </div>
      </el-dialog>
    </div>  
    <div>
      <el-dialog
        :visible.sync="domainDialogVisible"
        width="50%"
        append-to-body
        >
        <main_domain :domainList="domainList"></main_domain>
      </el-dialog>
    </div>
  </div>
</template>


<script>
import main_appbar from "@/components/main_appbar.vue";
import main_navbar from "@/components/main_navbar.vue";
import main_content from "@/components/main_content.vue";
import main_domain from "@/components/domain.vue";
import Constant from "@/Constant.js";
import config from "../../public/js/obpm.config.js"
import API from "@/api.js";
let Base64 = require('js-base64').Base64;
const statiContextPath = config.statiContextPath;
const signonContextPath = config.signonContextPath;
export default {
  name: "mainpage",
  provide () {
    return {
      addTab: this.addTab
    }
  },
  components: {
    "obpm-main-appbar": main_appbar,
    main_navbar,
    main_content,
    main_domain
  },
  computed: {
    applicationName() {
      return this.$store.getters.currentAppName;
    },
    showInstance() {
      return this.$store.state.isInstance;
    },
  },
  created() {
    this.getLock()
    window.setInterval(() => {
      setTimeout(this.getOnlineNumber, 0);
    }, 60000)
    //myprofile接口返回信息增加了isFirstLogin，true时需要弹出个人设置修改密码界面
    if(this.$root.user.isFirstLogin){
      this.addTab({id:'02',name:'个人设置',linkType:'102'})
      this.$alert('密码为初始密码，请尽快修改！', {
        dangerouslyUseHTMLString: true
      });
    }
    let radomNum = new Date().getTime();
    this.$api.getMessage(
      radomNum,
      {
        onSucess: res => {
          this.notice = res.data.data.notice;
        }
      }
    )
    this.$api.getDomainList(
      {
        onSucess: res => {
          if(res.data.data.length){
            // if(res.data.data[0].systemName){
            //   document.title = res.data.data[0].systemName
            // } 
            //当前企业域的domainId
            let domainId = this.$store.state.domainId
            this.domainList = res.data.data;
            let data = res.data.data;
            //显示对应的企业域的systemName
            for(let i = 0; i < data.length; i++) {
              if(domainId === data[i].id) {
                document.title = data[i].systemName
                break;
              }  
            }
            if(res.data.data.length > 1){
              this.isChangeDomain = true;
            }
          }
        }
      }
    )
    this.$api.getNotificationNum(
      {
        onSucess: res => {
          let otherNotice = res.data.data;
          let arr = [];
          for(let key in otherNotice) {
            let obj = {};
            if(otherNotice[key] > 0 && key !="size") {
              obj.type = key.toString();
              obj.value = otherNotice[key];
              arr.push(obj);
            }
          }
          this.otherNotice = arr;
        }
      }
    )
  },

  data: function() {
    return {
      appid: "km1",
      tabs: [],
      password:'',
      isLock:'false',
      notice:0,
      otherNotice:[],
      showMessagePopup: true,
      showMenu: true,
      Constant,
      updateMenu:'',
      updateMenuData:{},
      dialogVisible: false,
      domainDialogVisible: false,
      pwd: '',
      isPasswordError:'',
      isChangeDomain: false,
      domainList: [],
      nullPrompt:'',
    };
  },

  methods: {
    updateViewNumber(menuData){ 
      this.updateMenuData = menuData;
      this.updateMenu = new Date().getTime();
    },

    hiddenMenu() {
      this.showMenu = !this.showMenu;
      this.$refs.mychild.setMaincontent() // 调用子组件的方法
    },

    jumpToInfo(val){
      this.showMessagePopup = false;
      this.addTab(val);
    },

    closeMessagePopup() {
      this.showMessagePopup = false;
    },

    signOut() {
      this.$api.LogOut({
        onSucess: res => {
          window.localStorage.clear();

          let statiContextPath = obpmConfig.statiContextPath;
          let signonContextPath = obpmConfig.signonContextPath
          let url = ""
          if(statiContextPath) { //5.0 trunk
            url = window.location.origin + statiContextPath + signonContextPath +"/index.html"
          }else { //4.4 stable
            url = window.location.origin + signonContextPath + "/index.html"
          }
          window.location.href = url
        }
      });
    },

    getLock() {
      let val = localStorage.getItem('screenLock');
      if(val) {
        this.isLock = val;
      }else {
        this.isLock = 'false';
      }
    },

    getOnlineNumber() {
      this.$api.getNotification(
        {
          onSucess: res => {
            if(res.data.data.data && res.data.data.data.length > 0) {
              let data = res.data.data.data[0];
              this.$notify({
                title: '',
                dangerouslyUseHTMLString: true,
                message: data.summary,
                duration: 5000,
                customClass: 'fontclass'
              });
            }
          }
        }
      )
    },

    systemManagement(){
      let domainid = this.$store.state.domainId;
	    let domainName;//企业域名称
      for(let i = 0; i < this.domainList.length; i ++) {
        if(domainid === this.domainList[i].id) {
          domainName = this.domainList[i].name
        }
      }
      let statiContextPath = obpmConfig.statiContextPath;
      let systemUrl = '';
      if(statiContextPath) { //5.0 trunk
        systemUrl = obpmConfig.statiContextPath + "/domain/index.html#/domain?domainid=" + domainid + "&from=systemManagement" + "&name=" + domainName;//&from=systemManagement让deisgner那边可以获取到标识
      }else { //4.4 stable
        systemUrl = obpmConfig.obpmFilePath + "/domain/index.html#/domain?domainid=" + domainid + "&from=systemManagement" + "&name=" + domainName;
      }
      window.open(systemUrl);
    },

    changeDomain(){
      this.domainDialogVisible = true;
    },

    //退出系统
    Actionquit() {
      API.LogOut({
        onSucess: response => {
          if (response.status == 200) {
            window.location = "http://localhost:8080/signon/";
          }
        },
        onError:error=>{
          console.log(error);
        }
      });
    },

    hanleClickLogin(){
      let statiContextPath = obpmConfig.statiContextPath;
      let url = ""
      if(statiContextPath) { //5.0 trunk
        url = window.location.origin + statiContextPath + "/signon/index.html"
      }else { //4.4 stable
        url = window.location.origin + "/signon/index.html"
      }
      window.location.href = url
    },
 
    hanleClick(){
      let cookie =  document.cookie.split(";");
      let language,url,path
      for(let i=0;i<cookie.length;i++){
        if(cookie[i].indexOf("USERLANGUAGE")>=0){
          language = cookie[i].split("=")[1];
        }
      }
      let str = Base64.encode(this.pwd);
      let userPwd;
      if(str.length>2){
        let lp = str.substr(0,2);
        let rp = str.substr(2,str.length);
        userPwd = rp+lp;
      }
      let data = {
        username : this.$store.state.myProfile.loginNo,
        password : userPwd,
        remember : "0",
        debug : false,
        domainName : this.$store.state.myProfile.domainName,
        checkcode : "",
        language : language,
        url : url,
        path: path
      }
      this.$api.signonLogin(
        data,
        {
          onSucess: res => {
            if(res.data.resultCode != 0) {
              //更新accessToken
              document.cookie = res.data.accessToken
              localStorage.setItem("accessToken",res.data.accessToken);
              this.pwd = '';
              this.dialogVisible = false;
              this.$message({
                message: this.$t('msg.login_ss'),
                type: 'success'
              });
            }else{
              this.$message.error(this.$t('msg.fail_login'));
            }
          }
        }
      )
    },

    //解除锁屏
    unlockScreen() {
      if(!this.password) {
        this.nullPrompt = this.$t('e_password')
        this.isPasswordError = 'true';
        setTimeout(() => {
          this.isPasswordError = '';
        }, 2000)
      } else {
        this.$api.isLock(
          this.password,
          {
            onSucess: res => {
              this.nullPrompt = '';
              if(res.data.data == true) {
                this.isLock = 'false';
                localStorage.setItem('screenLock', 'false');
              }else {
                this.isLock = 'true';
                this.isPasswordError = 'true';
                setTimeout(() => {
                  this.isPasswordError = '';
                }, 2000)
              }
            }
          }
        )
      }     
      //let val = localStorage.getItem('screenLock');
    },

    //一键锁频
    lockScreen() {
      this.password = '';
      this.isLock = 'true';
      localStorage.setItem('screenLock', 'true');
    },

    changeMenu: function(appid) {
      
      this.appid = appid;
    },

    activeHome: function() {
      this.tabs.forEach(function(value) {
        value.active = false;
      });
    },

    addTab(param) { 
      let flag = false;
      this.tabs.forEach(function(value) {
        if ( value.id && value.id == param.id) {
          value.active = true;
          if(param.linkType == '01') { //视图
            value.randomNumber = param.randomNumber;
          }
          flag = flag || true;
        }else {
          value.active = false;
        }
      });

      if (flag) return;
      this.tabs.forEach(function(value) {
        value.active = false;
      });
      param.active = true;

      let currentIndex = ''
      let havePrevious = this.tabs.some((tab,index) => {
        if(tab.id == param.refreshId){
          currentIndex = index + 1
          return true
        }
      })
      if(havePrevious) {
        // this.tabs[currentIndex] = param
        this.tabs.splice(currentIndex, 0, param);
      }else {
        this.tabs.push(param)
      }
    },

    closeAllTab() {
      this.tabs = [];
    },

    closeTab: function(tab, tabindex) {
      let tabs = this.tabs;
      if(tabindex >= 0) { //点击X关闭
        let currentIndex = ''
        let haveParentTab = tabs.some((item, index) => {
          if(item.id == tab.refreshId){
            currentIndex = index
            return true
          }
        })
        if(haveParentTab) {
          tabs.splice(tabindex, 1)
          tabs.forEach(item => {
            item.active = false
          })
          tabs[currentIndex].active = true
        }else {
          tabs.splice(tabindex, 1)
          if(tab.active) {
            if(tabs.length > 0 && ((tabs.length - 1) >= tabindex)) {
              tabs[tabindex].active = true
            }else if(tabs.length > 0 && ((tabs.length - 1) < tabindex)) {
              if(tabindex > 0) {
                tabs[tabindex - 1].active = true
              }
            }
          }
        }        
      }else { //单击返回按钮
        let i = -1;
        tabs.forEach((value, index) => {
          if ((value.id && value.id == tab.id) || (value._select && value._select == tab._select)) {
            i = index;
          }
        })
        let currentIndex = ''
        let haveParentTab = tabs.some((item, index) => {
          if(item.id == tab.refreshId){
            currentIndex = index
            return true
          }
        })
        if(haveParentTab) {
          tabs.splice(i, 1)
          tabs[currentIndex].active = true
        }else {
          tabs.splice(i, 1)
          let act = tabs[i]
          if (act) {
            this.activeTab({ id: act._select ? act._select:act.id })
          }else if(i>=1){
            let act = this.tabs[i-1]
            this.activeTab({ id: act._select ? act._select:act.id })
          }else {
            if(tabs.length > 0){
              tabs[tabs.length-1].active = true
            }
          }
        }

      }
    },
    
    activeTab: function(tab,index) {
      if(index>=0) {
        this.tabs.forEach((value, i) => {
          if (i == index) {
            value.active = true;
          } else {
            value.active = false;
          }
        });
      }else {
        this.tabs.forEach((value) => {
          if ((value.id && value.id == tab.id) || (value._select && value._select == tab._select) ||  (value._select && value._select == tab.id)) {
            value.active = true;
            return;
          } else {
            value.active = false;
          }
        });
      }
    }
  },
  watch: {
    showInstance(val) {
      if(val){
        this.dialogVisible = true;
      }
    }
  }
};
</script>

<style lang="scss">
#lockWraper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(24, 38, 46, 1);
    z-index: 99999;
    color: red;
    .lock-content {
      width: 460px;
      height: 240px;
      background: white;
      border-radius: 5px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-top: -120px;
      margin-left: -230px;
      .img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
        position: absolute;
        left: 50%;
        top: -30px;
        margin-left:-30px;
        img {
          width: 60px;
          height: 60px;
        }
      }
      .admin-header-lock-name {
        margin-top: 43px;
        width: 100%;
        text-align: center;
        color: #333636;
        margin-bottom: 55px;
      }
      .input_btn {
        width: 100%;
        padding-left: 95px;
        padding-right: 95px;
        box-sizing: border-box;
        display: -webkit-flex;
        display: flex;
        justify-content: center;
        align-items: center;
        .input-box {
          position: relative;
          .error-tip {
            position: absolute;
            top: -35px;
            padding: 5px 5px;
            border: 1px solid red;
            border-radius: 4px;
            font-size: 12px;
            &::after {
              position: absolute;
              top: 26px;
              content: "";
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid red;
            }
            &::before {
              position: absolute;
              top: 25px;
              z-index: 10;
              content: "";
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid #fff;
            }
          }
        }
        #lockPwd {
          width: 200px;
          height: 30px;
          border-radius: 3px;
          background: #46D2DB;
          display: inline-block;
          padding-left: 10px;
          font-size: 14px;
          color: #fff;
          border: none;
          vertical-align: middle;
          margin-right: 10px;
          outline: none;
        }
        .un-lock {
          display: inline-block;
          height: 30px;
          line-height: 30px;
          background: #46D2DB;
          color: #fff;
          width: 60px;
          border-radius: 3px;
          text-align: center;
          cursor: pointer;
        }
        ::-webkit-input-placeholder { /* WebKit browsers */ 
          color: #fff; 
        } 
        :-moz-placeholder { /* Mozilla Firefox 4 to 18 */ 
          color: #fff; 
        } 
        ::-moz-placeholder { /* Mozilla Firefox 19+ */ 
          color: #fff; 
        } 
        :-ms-input-placeholder { /* Internet Explorer 10+ */ 
          color: #fff; 
        }
      }
      .tip {
        width: 100%;
        padding-left: 95px;
        box-sizing: border-box;
        margin-top: 20px;

      }
      
    }
}
.fontclass {
    .el-notification__content {
      .notice_actor {
        color: #0095FF;
      }
      .notice_summary {
        color: #0095FF;
      }
    }
    
}
</style>
