<template>
  <ul>
    <li v-for="(_topMenuList, index) in data" :key="index">
      <div class="total pull-right" :style="{ display: _topMenuList.totalRow >0 ? 'block':'none','min-width': '10px'}" v-if="_topMenuList.totalRow">{{_topMenuList.totalRow}}</div>
      <a
        :title="_topMenuList.name"
        :data-opentarget="_topMenuList.opentarget"
        :data-linkType="_topMenuList.linkType"
        :data-appid="_topMenuList.appId"
        :data-actioncontent="_topMenuList.actionContent"
        :data-url="_topMenuList.url"
        :data-allowOpenForm="_topMenuList.allowOpenFrom ? 'true' : 'false'"
        :data-allowOpenView="_topMenuList.allowOpenView ? 'true' : 'false'"
        :class="[currentMenuId==_topMenuList.id?'currentFocus':'']"
        @click="onMenuClick(_topMenuList)"
      >
        <img 
          width="16px" 
          height="16px" 
          v-if="_topMenuList.ico && JSON.parse(_topMenuList.ico).icontype == 'img'"  
          :src="contextPath + JSON.parse(_topMenuList.ico).icon" />
        <span
          class="current-icon"
          v-if="_topMenuList.ico && JSON.parse(_topMenuList.ico).icontype == 'font'" 
          :class="JSON.parse(_topMenuList.ico).icon" 
          :style="{color:_topMenuList.ico && JSON.parse(_topMenuList.ico).iconFontColor?JSON.parse(_topMenuList.ico).iconFontColor:''}">
        </span>
        <cite :class="[_topMenuList.children?'cite-children':'']">{{_topMenuList.name}} </cite>
        <span class="icom-img" v-if="_topMenuList.children">
          <i class="fa fa-angle-down" v-if="activatedMenus.indexOf(_topMenuList)>=0"></i>
          <i class="fa fa-angle-left" v-else></i>
        </span>
      </a>
      <dl
        v-if="_topMenuList.children"
        :style="{ display: activatedMenus.indexOf(_topMenuList)>=0 ? 'block':'none'}"
      >
        <dd v-for="(_secondMenuList, index) in _topMenuList.children" :key="index">
          <a
            :title="_secondMenuList.name"
            :data-opentarget="_secondMenuList.opentarget"
            :data-linkType="_secondMenuList.linkType"
            :data-appid="_secondMenuList.appId"
            :data-actioncontent="_secondMenuList.actionContent"
            :data-url="_secondMenuList.url"
            :data-allowOpenForm="_secondMenuList.allowOpenFrom ? 'true' : 'false'"
            :data-allowOpenView="_secondMenuList.allowOpenView ? 'true' : 'false'"
            @click="onMenuClick(_secondMenuList)"
            :class="[currentMenuId==_secondMenuList.id?'currentFocus':'']"
          >
            <div class="total pull-right" :style="{ display: _secondMenuList.totalRow >0 ? 'block':'none','min-width': '10px'}" v-if="_secondMenuList.totalRow">{{_secondMenuList.totalRow}}</div>
            <cite>&nbsp;&nbsp;&nbsp;{{_secondMenuList.name}}</cite>
            <!-- <i v-if="_secondMenuList.children" class="glyphicon" :class="activatedMenus.indexOf(_secondMenuList)>=0 ? 'glyphicon-menu-down':'glyphicon-menu-left'"></i> -->
            <span class="icom-img" v-if="_secondMenuList.children">
              <i class="fa fa-angle-down" v-if="activatedMenus.indexOf(_secondMenuList)>=0"></i>
              <i class="fa fa-angle-left" v-else></i>
            </span>
          </a>
          <ol
            v-if="_secondMenuList.children"
            class="layui-nav-child"
            :style="{ display: activatedMenus.indexOf(_secondMenuList)>=0 ? 'block':'none'}"
          >
            <li v-for="(_thirdMenuList, index) in _secondMenuList.children" :key="index">
              <a
                :title="_thirdMenuList.name"
                href="javascript:;"
                :data-opentarget="_thirdMenuList.opentarget"
                :data-linkType="_thirdMenuList.linkType"
                :data-appid="_thirdMenuList.appId"
                :data-actioncontent="_thirdMenuList.actionContent"
                :data-url="_thirdMenuList.url"
                :data-allowOpenForm="_thirdMenuList.allowOpenFrom ? 'true' : 'false'"
                :data-allowOpenView="_thirdMenuList.allowOpenView ? 'true' : 'false'"
                @click="onMenuClick(_thirdMenuList)"
                :class="[currentMenuId==_thirdMenuList.id?'currentFocus':'']"
              >
                <div class="total pull-right" :style="{ display: _thirdMenuList.totalRow >0 ? 'block':'none','min-width': '10px'}" v-if="_thirdMenuList.totalRow">{{_thirdMenuList.totalRow}}</div>
                <span class="dot-active"></span>
                <cite v-if="_thirdMenuList.name">
                  &nbsp;{{_thirdMenuList.name}}
                </cite>
              </a>
            </li>
          </ol>
        </dd>
      </dl>
    </li>
  </ul>
</template>
<script>
import Constant from "@/Constant.js";
import config from "../../public/js/obpm.config.js"
const statiContextPath = config.statiContextPath;
export default {
  name: "obpm-main-navbar",
  props: [
    "updateMenu",
    "updateMenuData"
  ],
  watch: {
    updateMenu(){
      let _um = this.updateMenuData;
      let menuList = this.data;
      const loopOpe = menuList => {
        for (let i = 0; i < menuList.length; i++) {
          let _ml = menuList[i];
          if(_ml.id == _um.id) {
            _ml.totalRow = _um.totalRow;
          }else {
            if(_ml.children && _ml.children.length>0) {
              loopOpe(_ml.children);
            }
          }
        }
      };
      loopOpe(menuList)
    }
  },
  computed: {
    data() {
      let data = this.$store.getters.currentMenus;
      let appId = this.$root.appid
      if(data && data.appId != appId) {
        if(data[0].appId == 'qm' || data[0].appId == 'km'){
          if(this.$store.state.firstClick == 1) {//第一次点击km,pm，菜单按钮为第一个，之后不再为第一个            
            this.$store.commit('loadAppKm', {first: 0})
            this.onMenuClick(data[0]);
          }
        }
      }
      // return this.$store.getters.currentMenus;
      return data;
    },
    applicationName() {
      return this.$store.getters.currentAppName;
    },
  },

  created(){
    this.contextPath = obpmConfig.obpmFilePath;
  },

  data: function() {
    return {
      Constant,
      activatedMenus: [], //减少操作store数据，不要将所有状态都存储在store中，只有本组件用到的用local存储
      currentMenuId:'',
      contextPath: '',
    };
  },

  methods: {
    onMenuClick: function(menu) {
      this.currentMenuId = menu.id;
      if(menu.opentarget == "target") {
        let paramKey = '';
        let paramValue = '';
        if(menu.queryString && menu.queryString.length) {
          let queryStr = JSON.parse(menu.queryString);
          if(queryStr.length>0) {
            paramKey = queryStr[0].paramKey;
            paramValue = queryStr[0].paramValue;
          }
        }
        let routeData = this.$router.resolve({
              name: "view_blank",
              query: {
                id: menu.id,
                name: menu.name,
                appId: this.data.appId,
                linkType: menu.linkType,
                actionContent: menu.actionContent,
                paramKey,
                paramValue,
                opentarget: menu.opentarget,
              }
            });
        window.open(routeData.href, '_blank');
      }else {
        let p = this.activatedMenus.indexOf(menu);
        if (p < 0) {
          this.activatedMenus.push(menu);
        } else {
          this.activatedMenus.splice(p, 1);
        }
        if (menu.linkType && menu.linkType != "") {
          switch (menu.linkType) {
            case "00": 
              this.$api.hasPermissionToForm(this.data.appId, menu.actionContent, {
                onSucess: response => {
                  if(response.data.data) {
                    this.$emit("add-tab", {
                      id: menu.id,
                      name: menu.name,
                      appId: this.data.appId,
                      linkType: menu.linkType,
                      actionContent: menu.actionContent,//存放FORMID或VIEWID
                      queryString: menu.queryString?menu.queryString:''
                    });
                  }else {
                    this.$emit("add-tab", {
                      linkType: '100',
                      name: menu.name,
                      actionContent: menu.actionContent,//存放FORMID或VIEWID
                    });
                  }
                }
              })
              break;
            case "01": 
              this.$api.hasPermissionToView(this.data.appId, menu.actionContent, {
                onSucess: response => {
                  let randomNumber = new Date().getTime();
                  let params = {
                    id: menu.id,
                    name: menu.name,
                    appId: this.data.appId,
                    linkType: menu.linkType,
                    actionContent: menu.actionContent,//存放FORMID或VIEWID
                    randomNumber: randomNumber, //存放随机数，点击一次菜单刷新一次视图
                  };
                  if(menu.totalRow) { //如果有总数
                    params.haveTotalRow = true;
                  }
                  let qs = menu.queryString;
                  if(qs) {
                    qs = JSON.parse(qs);
                    let queryString = '';
                    qs.forEach(item => {
                      queryString += "&" + item['paramKey'] + '=' + item['paramValue'];
                    });
                    queryString = queryString.replace(/^(\s|&)+|(\s|&)+$/g, '');
                    params.queryString = queryString; //菜单携带参数，传给后台
                  }
                  if(response.data.data) {
                    this.$emit("add-tab", params);
                  }else {
                    this.$emit("add-tab", {
                      linkType: '100',
                      name: menu.name,
                      actionContent: menu.actionContent,//存放FORMID或VIEWID
                    });
                  }
                }
              });
              break;
            case "02": 
              this.$emit("add-tab", {
                id: menu.id,
                name: menu.name,
                appId: this.data.appId,
                linkType: menu.linkType,
                actionContent: menu.actionContent,//存放FORMID或VIEWID
              });
              break;
            case "05":
              let url = menu.actionContent;
              let isForm = url.search("form.html") != -1;
              let isView = url.search("view.html") != -1;
              let urlArrayF = url.split("?");
              let urlArray = '';
              if(urlArrayF[1]) {
                urlArray = urlArrayF[1].split("&");
              }
              let type = '';
              if(isForm) {
                type = '00';
              }else if(isView) {
                type = "01"
              }else if (!isForm && !isView) {
                this.$alert('链接为内部链接，请正确配置', {
                  confirmButtonText: '确定',
                  type: 'warning',
                });
                 return
              }
              let obj = {};
              if(urlArray && urlArray.length > 0) {
                for(let i=0; i<urlArray.length; i++) {
                  let val = urlArray[i].split("=");
                  obj[val[0]] = val[1];
                }
              }
               this.$emit("add-tab", {
                linkType: type,
                appId: this.data.appId,
                actionContent: obj.viewId?obj.viewId:obj.formId,
                name: menu.name,
                _select: '',
                viewId: "",
              })
              // this.$emit("add-tab", {
              //   id: menu.id,
              //   name: menu.name,
              //   appId: this.data.appId,
              //   linkType: menu.linkType,
              //   actionContent: menu.actionContent,//存放FORMID或VIEWID
              // });
              break;
            case "06":
              this.$emit("add-tab", {
                id: menu.id,
                name: menu.name,
                appId: this.data.appId,
                linkType: menu.linkType,
                actionContent: menu.actionContent,//存放FORMID或VIEWID
              });
              break;
            case '07':
              this.$emit("add-tab", {
                id: menu.id,
                name: menu.name,
                appId: this.data.appId,
                linkType: menu.linkType,
                actionContent: menu.actionContent,//存放FORMID或VIEWID
              });
              break;
            case "09": 
              this.$emit("add-tab", {
                id: menu.id,
                name: menu.name,
                appId: this.data.appId,
                linkType: menu.linkType,
                actionContent: menu.actionContent,//存放FORMID或VIEWID
              });
              break;
            case 'km':
              let statiContextPath = obpmConfig.statiContextPath;
              let params = {
                //project.json里面的数据
                id: menu.id,
                name: menu.name,
                appId: menu.appId,
                linkType: menu.linkType,
                actionContent: ''//存放FORMID或VIEWID
              };
              if(statiContextPath) {//5.0trunk
                params.actionContent = menu.trunkUrl
              }else {//4.4 stable
                params.actionContent = menu.stableUrl
              }
              this.$emit("add-tab", params);
              break;
            case 'qm':
              this.$emit("add-tab", {
                id: menu.id,
                name: menu.name,
                appId: menu.appId,
                linkType: menu.linkType,
                actionContent: menu.url,//存放FORMID或VIEWID
              });
              break;
            default:
              break;
          }
          
          // this.$emit("add-tab", {
          //   id: menu.id,
          //   name: menu.name,
          //   appId: this.data.appId,
          //   linkType: menu.linkType,
          //   actionContent: menu.actionContent,//存放FORMID或VIEWID
          // });
        }
      }
    }
  }
};
</script>