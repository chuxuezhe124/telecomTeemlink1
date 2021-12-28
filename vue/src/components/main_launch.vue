<template>
  <div class="main_launch">
    <div class="header">
      <div class="title">
        <span
          v-for="(item,index) in softwareList" 
          :key="index"
          :class="[activeApp===index?'currentApp':'']"
          @click="showCurrentApp(index, item.id)"
          >{{item.name}}</span>
      </div>
      <div class="search">
        <span 
          :class='["se-comm",currentActive==1 ? "activeType" : ""]'
          @click="setActive(1)"
        >
          <i class="startflowlisticon"></i>
        </span>
        <span 
          :class='["se-comm",currentActive==2 ? "activeType" : ""]'
          @click="setActive(2)"
        >
          <i class="startflowlargeicon"></i>
        </span>
        <span class="input">
          <el-input 
            :placeholder="$t('placeholder.search_content')"  
            v-model="searchValue" 
            class="input-with-select"
            @input="search"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </span>
      </div>
    </div>
    <!-- {{startmenus}} -->
    <div class="launch-wrap">
      <el-scrollbar class="scrollbar">
        <div class="small-icon-list" v-if="currentActive == 1">
          <div class="masonry">
            <div class="item" v-for="(items, index) in menusData" :key="index">
              <div class="item__content">
                <div class="title" v-if="items.description">{{items.description}}</div>
                <div class="menu-list">
                  <ul>
                    <li 
                      v-for="(item, i) in items.child" 
                      :key="i"
                      @click="nav_click(item)"
                    >
                      <span class="img">
                        <img class="menu-icon-img" :src="contextPath + (item.ico&&item.ico.icon)">
                      </span>
                      <span>
                        {{item.description}}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="big-icon-list" v-else-if="currentActive == 2">
          <div class="list-con" v-for="(items, index) in menusData" :key="index">
            <div>{{items.description}}</div>
            <div class="ul-con">
              <ul class="ul">
                <li 
                  v-for="(item, i) in items.child" 
                  :key="i"
                >
                  <div 
                    class="icon"
                    @click="nav_click(item)"
                    @mouseover="mouseOver(i,item)"
                    @mouseleave="mouseLeave(i,item)"
                  >
                    <!-- <i class="processCenterMenuicon 2"></i> -->
                    <img class="menu-icon-img" v-if="currentMenuId == item.id" src="../assets/images/Tloa_icon_plane@2xh.png">
                    <img class="menu-icon-img" v-else src="../assets/images/Tloa_icon_plane_@2x.png">
                  </div>
                  <div class="menu-name">{{item.description}}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import Constant from "@/Constant.js"
export default {
  inject: [],
  data() {
    return {
      menusData:[],
      saveMenusData:[],
      startmenus:[],
      searchValue:'',
      currentActive:1,
      currentMenuId:'',
      softwareList:[],
      activeApp:0,
      appId:'',
      contextPath:'',
    };
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.$api.getApplications(
      {
        onSucess: res => {
          let arr = [];
          res.data.data.applications.forEach(app => {
            if (app.id != "km" && app.id != "pm" && app.id != "qm") {
              arr.push(app);
            }
          });

          this.softwareList = arr;
          if(arr && arr.length > 0) {
            let appId = arr[0].id;
            this.appId = appId;
            this.$api.getStartMenus(appId, {
              onSucess: response => {
                let startmenus = response.data.data;
                this.startmenus = startmenus;
                let modes = [];
                if (startmenus) {
                  startmenus.forEach(menu => {
                    if (menu.parent == appId) {
                      modes.push({
                        id: menu.id,
                        description: menu.description
                      });
                    }
                  });
                  modes.forEach((item,index) => {
                    let dd = this.findLaunchMenus(item.id);
                    modes[index].child = dd;
                  })
                
                  this.menusData = modes;
                  this.saveMenusData = JSON.parse(JSON.stringify(modes));
                }
              }
            });
          }
        }
      }
    )
  },
  methods: {
    showCurrentApp(index, appid) {
      this.appId = appid;
      this.activeApp = index;
      this.$api.getStartMenus(appid, {
        onSucess: response => {
            let startmenus = response.data.data;
            this.startmenus = startmenus;
            let modes = [];
            if (startmenus) {
              startmenus.forEach(menu => {
                if (menu.parent == appid) {
                  modes.push({
                    id: menu.id,
                    description: menu.description
                  });
                }
              });
              modes.forEach((item,index) => {
                let dd = this.findLaunchMenus(item.id);
                modes[index].child = dd;
              })
            
              this.menusData = modes;
              this.saveMenusData = JSON.parse(JSON.stringify(modes));
            }else {
              this.saveMenusData = []
              this.menusData = []
            }
          }
        });
    },

    mouseOver(val,item) {
      this.currentMenuId = item.id;
    },
    mouseLeave() {
      this.currentMenuId = '';
    },
    search() {
      let searchVal = this.searchValue;
      //let data = this.startmenus.filter(value=>value.description.indexOf(searchVal)!==-1);
      let menusData = JSON.parse(JSON.stringify(this.saveMenusData))
      let data = menusData.filter(value=>value.description.indexOf(searchVal)!==-1);
      let arr = [];
      for(let i=0; i<menusData.length; i++) {
        let obj;
        if(menusData[i].description && menusData[i].description.indexOf(searchVal)!==-1) {
          obj = menusData[i];
        }
        let list = menusData[i].child.filter(value=>value.description.indexOf(searchVal)!==-1);
        if(list && list.length > 0) {
          if(obj) {
            obj.child = list;
            arr.push(obj);
          }else {
            obj = {};
            obj.child = list;
            arr.push(obj);
          }
        }
      }
      this.menusData = arr;
    },
    nav_click(menu) {
      let params = {
        appId: this.appId,
        linkType:'00',
        actionContent:menu.formId,
        docId:menu.id,
        name: menu.description,
        isFlowCenterCreate: true, //与普通表单新建区分，表示流程中心发起新建
      };
      this.$emit("add-tab", params);
      //this.$emit("openNewpage", params);
    },
    setActive(val) {
      this.currentActive = val;
    },
    findLaunchMenus(modeid) {
      let menus = [];
      this.findSubMenus(modeid).forEach(menu => {
        if (menu.formId && menu.formId != "") {
          menus.push(menu);
        }
      });
      return menus;
    },

    findSubMenus(modeid) {
      let menus = [];
      if (this.startmenus)
        this.startmenus.forEach(menu => {
          if (menu.parent == modeid) {
            menus.push(menu);
          }
        });

      if (menus.length > 0) {
        menus.forEach(menu => {
          let submenus = this.findSubMenus(menu.id);
          menus = menus.concat(submenus);
        });
      }
      //console.log("modes-->",menus)
      return menus;
    }
  }
}
</script>
<style lang="scss" scoped>

</style>


