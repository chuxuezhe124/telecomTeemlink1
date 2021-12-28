<template>
  <transition :duration="1000" name="face">
    <!-- class="main-content" -->
    <div id="mainHomeContent" ref="mainHomeContent" v-bind:class="[currentAct ? 'main-content-first' : 'main-content-second' , 'main-content']">
      <div class="main-body">
        <div class="main-nav clearfix">
          <div class="homepageN fl" @click="onHomeTabClick">
            <!-- <a href="#" class="a-link">
              <i class="glyphicon glyphicon-home"></i>
              <img src="../assets/images/Tloa_home_returnhome@2x.png">
              <cite>{{$t('home')}}</cite>
            </a> -->
            <div class="a-link">
              <img src="../assets/images/Tloa_home_returnhome@2x.png">
              {{$t('home')}}
            </div>
          </div>
          <div class="close-all-tab fr" >
            <span @click="closeAllTab">{{$t('btns.close_all')}}</span>
            <!-- <span style="margin-left: 10px;margin-right:10px;" @click="setWidget">
              <i class="el-icon-setting" style="color:#999; font-size:15px;"></i>
            </span> -->
            <span  @click="setWidget" class="img">
              <img src="../assets/images/Tloa_home_set@2x.png" alt="">
            </span>
          </div>
          <div class="main-tab-con clearfix">
            <div class="img fl" @click="toLeft">
              <img class="fl" src="../assets/images/Tloa_home_nextreturn@2x.png">
            </div>
            <div class="img fr" @click="toRight">
              <img class="fr" src="../assets/images/Tloa_home_nextstep@2x.png">
            </div>          
            <!-- <i class="glyphicon glyphicon-menu-left arrow-upicon fl"></i> -->
            <!-- <i class="glyphicon glyphicon-menu-right arrow-downicon fr"></i> -->
            <div class="main-tab-carousel" ref="box">
              <ul class="main-tab" ref="ulBox">
                <li v-for="(tab,index) in tabs" :key="tab.id" :ref="'li'+index">
                  <div
                    class="main-sortable"
                    :class="{ 'sortable-active': tab.active }"
                    :title="tab.name || tab.title"
                    @click="onTabClick(tab,index)"
                  >
                    <cite>{{tab.name || tab.title}}</cite>
                    <!-- <i class="glyphicon glyphicon-remove" @click.stop="onCloseBtnClick(tab)"></i> -->
                    <i class="el-icon-close" @click.stop="onCloseBtnClick(tab,index)"></i>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="main-tab-content">
          <div class="myapps-component" :style="{display: isHomeActive()?'block':'none'}">
            <main_homepage 
              ref="mainHomepage"
              v-bind="$attrs"
              v-on="$listeners" 
              v-if="isRouterHomepage"
              @event="refreshPage"
            />
          </div>
          <div
            class="myapps-component"
            v-for="(tab, i) in tabs"
            :key="tab.id"
            :style="{ 'display': tab.active ? 'block':'none' }"
          >
            <obpm_open_container
              :ref="`container${i}`"
              v-if="isRouterAlive" 
              v-bind="$attrs"
              v-on="$listeners"
              :openParams="tab"
              @event="setTabName"
              >
            </obpm_open_container>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import obpm_open_container from "@/components/obpm_open_container.vue"
import main_homepage from "@/components/main_homepage.vue"
import { constants } from 'crypto';
// import main_pending from "@/components/main_pending.vue"
// import main_processing  from "@/components/main_processing.vue"
// import instrument from "@/components/instrument.vue"


export default {
  name: "obpm-main-content",
  props: ["tabs"],
  components: {
    obpm_open_container,
    main_homepage
  },
  watch: {
    tabs:{
      immediate:true,
      handler(val){
        if(val && val.length > 0) {
          for(let i=0; i<val.length; i++) {
            if(val[i].active && i == 6) {
              this.$nextTick(() => {
                this.$refs[`box`].scrollLeft = this.$refs[`box`].scrollLeft + 31;
              })
            }else if(val[i].active && i > 6) {
              this.$nextTick(() => {
                this.$refs[`box`].scrollLeft = this.$refs[`box`].scrollLeft + 135;
              })
            }else if(val[i].active && i <= 6) {
              this.$nextTick(() => {
                this.$refs[`box`].scrollLeft = 0;
              })
            }
          }
        }
      },
      deep: true,
    },
  },
  data: function() {
    return {
      isRouterAlive: true,
      isRouterHomepage: true,
      currentAct:true,
    };
  },
  methods: {
    setTabName(name,id){ //在form_normalform设置tab的名字
      if(name) {
        let tabs = this.tabs
        if(id) {
          tabs.some(item => {
            if(item.id == id) {
              item.name = name
              return true
            }
          })
        }else { //此方法如果打开页签速度很快，而上一个页签还没有加载出数据，会导致上个页签没有名字
          tabs.some(item => {
            if(item.active == true){
              item.name = name
              return true
            }
          })
        }
      }
    },
    setMaincontent() {
      this.currentAct = !this.currentAct;
    },
    toLeft() {
      if(0 < this.$refs[`box`].scrollLeft < 809) {
        this.$refs[`box`].scrollLeft = 0
      }else if(this.$refs[`box`].scrollLeft >=  809) {
        this.$refs[`box`].scrollLeft = this.$refs[`box`].scrollLeft - 809;
      }
    },
    toRight() {
      this.$refs[`box`].scrollLeft = this.$refs[`box`].scrollLeft+809;
    },
    refreshPage() {
      this.isRouterHomepage = false;
      this.$nextTick( () => {
        this.isRouterHomepage = true;
      })
    },
    closeAllTab() {
      this.$emit("close-all");
    },
    setWidget() {
      this.$refs.mainHomepage.Settherollinginstall();
    },

    parentHandleclick(e) {
      if(this.tabs && this.tabs.length>0) {
        for(let i=0; i<this.tabs.length; i++) {
          if(this.tabs[i].id == e.refreshId) {
            this.$refs[`container${i}`][0].updateData();
          }
        }
      }
      // this.isRouterAlive = false
      // this.$nextTick(function () {
      //   this.isRouterAlive = true
      // })
    },

    isHomeActive: function() {
      var flag = false;
      this.tabs.forEach(element => {
        flag = element.active || flag;
      });
      return !flag;
    },

    onCloseBtnClick: function(tab,index) {
      let haveRefresh = ''
      if(this.tabs && this.tabs.length>0) {
        for(let i=0; i<this.tabs.length; i++) {
          if(this.tabs[i].id == tab.refreshId) {
            haveRefresh = true
            this.$refs[`container${i}`][0].updateData(this.tabs[i].linkType); //当直接点击关闭标签页时，类型传到obpm_open_container组件
          }
        }
      }
      if((tab.isIncludeCreate == "include" || tab.istabCreate == "tab") && tab.isRefresh) {
        this.$store.commit('SET_INCLUDEVIEWID', {id: tab.randomRefreshId});
      }
      if(!haveRefresh) { //表单新页签打开外链
        this.$store.commit('SET_FORMTABLEUPDATEID', {id: tab.randomRefreshId});
      }
      this.$emit("close-tab", tab,index);
    },

    //打开视图保存后刷新数据
    refreshView(tab) {
      if(tab.viewType && tab.viewType == 'CollapsibleView' && tab.isIncludeCreate == 'include') { //只针对包含元素下的折叠视图进行刷新
        if(this.tabs && this.tabs.length>0) {
          for(let i=0; i<this.tabs.length; i++) {
            if((this.tabs[i].runAfterParams && this.tabs[i].runAfterParams.docId == tab.refreshId) || this.tabs[i].id == tab.refreshId) {
              this.$refs[`container${i}`][0].updateData(this.tabs[i].linkType, tab.isIncludeCreate);
            }
          }
        }
      }else if(tab.isIncludeCreate == 'include' || tab.istabCreate == "tab") {
        this.$store.commit('SET_INCLUDEVIEWID', {id: tab.randomRefreshId});
      }else {
        if(this.tabs && this.tabs.length>0) {
          for(let i=0; i<this.tabs.length; i++) {
            if(this.tabs[i].id == tab.refreshId) {
              this.$refs[`container${i}`][0].updateData(this.tabs[i].linkType, tab.isIncludeCreate);
            }
          }
        }
      }
    },
    
    onTabClick: function(tab,index) {
      this.$emit("active-tab", tab,index);
    },

    onHomeTabClick: function() {
      this.$emit("active-home");
    }
  }
};
</script>
<style lang="scss" scoped>
    .myapps-component{
      // background:white;
      background:rgba(243,247,250,1);
    }
</style>
