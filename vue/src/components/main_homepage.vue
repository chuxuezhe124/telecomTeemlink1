<template>
  <div id="statement" ref="statement">
    <el-scrollbar id="scrollbar">
      <div id="header" v-show="Controlthelayout">
        <label for>{{$t('view.layout_set')}}:</label>
        <!--添加勾选图标--> 
        <div class="single">
          <span class="single-roll" @click="singlePhotograph('1')">
            1
            <i 
              :class="[currentlayout=='1' ? 'single-active' : '', 'single-roll-photograph']" 
              class="el-icon-success"></i>
          </span>
          <span class="singel-roll-item" @click="singlePhotograph('1:1')">
            1:1
            <i 
              :class="[currentlayout=='1:1' ? 'single-active' : '', 'single-roll-format']" 
              class="el-icon-success"></i>
          </span>
          <span class="singel-roll-item" @click="singlePhotograph('1:2')">
            1:2
            <i 
              :class="[currentlayout=='1:2' ? 'single-active' : '', 'single-roll-format']" 
              class="el-icon-success"></i>
          </span>
          <span class="singel-roll-item" @click="singlePhotograph('2:1')">
            2:1
            <i 
              :class="[currentlayout=='2:1' ? 'single-active' : '', 'single-roll-format']" 
              class="el-icon-success"></i>
          </span>
          <span 
            class="singel-roll-list" 
            @click="singlePhotograph('1:1:1')">
            1:1:1
            <i 
              :class="[currentlayout=='1:1:1' ? 'single-active' : '', 'single-roll-image']" 
              class="el-icon-success"></i>
          </span>
        </div>
        <br />
        <label for>{{$t('view.commonly_set')}}:</label>
        <div class="single-module">
          <span 
            class="single-module-statement" 
            v-for="(item,index) in appIcon" 
            :key="index" 
            @click="iconLinkSetting(index)"
          >
            {{item.name}}
            <i 
              class="el-icon-success single-module-picture" 
              v-if="item.isCommonlyUsed" 
              style="color:#67c754;font-size:17px;"></i>
          </span>
        </div>
        <br />

        <!--增加或移除模块-->
        <label for>{{$t('view.moudule_set')}}:</label>
        <div class="single-module">
          <span 
            class="single-module-statement" 
            v-for="(item,index) in allWidget"
            :key="index"
            @click="singlePicture(item.id, index, item.isShowIcon,item)" 
          >
            {{item.name}}
            <i 
              class="el-icon-success single-module-picture" 
              v-if="item.isShowIcon"
              style="color:#67c754;font-size:17px;"></i>
          </span>
        </div>
        <br />
        <label for></label>
        <div class="single-configuration">
          <el-button @click="configuration">{{$t('view.save_set')}}</el-button>
          <el-button @click="replacement">{{$t('view.reset_set')}}</el-button>
          <el-button @click="Cancel">{{$t('view.cancel_set')}}</el-button>
        </div>
      </div>
      <!--widgets-->
      <el-row id="expand" ref="expand" v-if="(widgetAppL.length >0 || widgetAppM.length >0 || widgetAppR.length >0) && isShowWidget">
        <!--左-->
        <el-col class="common-el" :span="layoutLeft" :style="{height:elRowScrollHeight+'px'}">
          <draggable 
            :scrollSensitivity="40"
            v-model="widgetAppL"
            group="people"  
            animation="300" 
            :scroll="true"
            :move="keep"  
            @start="onStart"
            @end="onEnd">
              <transition-group>
                <div
                  class="homepage-container"
                  v-for="item in widgetAppL"
                  :key="item.id"
                >
                  <component
                    @event="doAction"
                    name="wgt" 
                    :is="template(item.id)"
                    ref="tirget" 
                    v-if="item.isShowIcon">
                  </component>
              </div>
              </transition-group>
          </draggable> 
          <!-- <draggable
            :scrollSensitivity="40"
            :scroll="true"
            style=""
            v-model="widgetAppL"
            group="people"
            @start="drag = true"
            @end="drag = false"
            :move="keep"
          >
            <div
              class="homepage-container"
              v-for="item in widgetAppL"
              :key="item.id"
            >
              <component
                @event="doAction"
                name="wgt" 
                :is="template(item.id)"
                ref="tirget" 
                v-if="item.isShowIcon">
              </component>
            </div>
          </draggable> -->
        </el-col>
        
        <!--中-->
        <el-col class="common-el" :span="layoutCenter" v-if="currentlayout != '1'" :style="{height:elRowScrollHeight+'px'}">
          <draggable 
            :scrollSensitivity="40"
            v-model="widgetAppM"
            group="people"  
            animation="300" 
            :scroll="true"
            :move="keep"  
            @start="onStart"
            @end="onEnd">
              <transition-group>
                <div
                  class="homepage-container"
                  v-for="item in widgetAppM" 
                  :key="item.id"
                >
                  <component 
                    name="wgt" 
                    :is="template(item.id)" 
                    ref="tirget" 
                    v-if="tirget">
                  </component>
                </div>
              </transition-group>
            </draggable> 
          <!-- <draggable
            :scrollSensitivity="40"
            :scroll="true"
            v-model="widgetAppM"
            group="people"
            @start="drag=true"
            @end="drag=false"
            :move="keep"
          >
            <div
              class="homepage-container"
              v-for="item in widgetAppM" 
              :key="item.id"
            >
              <component 
                name="wgt" 
                :is="template(item.id)" 
                ref="tirget" 
                v-if="tirget">
              </component>
            </div>
          </draggable> -->
        </el-col>

        <!--右-->
        <el-col class="common-el" :span="layoutRight" v-if="currentlayout == '1:1:1'" :style="{height:elRowScrollHeight+'px'}">
          <draggable 
            :scrollSensitivity="40"
            v-model="widgetAppR"
            group="people"  
            animation="300" 
            :scroll="true"
            :move="keep"  
            @start="onStart"
            @end="onEnd">
              <transition-group>
                <div
                  class="homepage-container" 
                  v-for="item in widgetAppR" 
                  :key="item.id"
                >
                  <component 
                    name="wgt" 
                    :is="template(item.id)" ref="tirget" 
                    v-if="tirget">
                  </component>
                </div>
              </transition-group>
          </draggable> 
          <!-- <draggable
            :scrollSensitivity="40"
            :scroll="true"
            v-model="widgetAppR"
            group="people"
            @start="drag=true"
            @end="drag=false"
            :move="keep"
          >
            <div
              class="homepage-container" 
              v-for="item in widgetAppR" 
              :key="item.id"
            >
              <component 
                name="wgt" 
                :is="template(item.id)" ref="tirget" 
                v-if="tirget">
              </component>
            </div>
          </draggable> -->
        </el-col>
      </el-row>
      <div v-if="isShowWidget && isHidden"> 
        <div style="width:100%;margin-top:120px;font-size:80px;text-align:center;color:#adadad;"></div>
        <div style="width:100%;font-size:22px;text-align:center;color:#adadad;margin-bottom:18px;">{{$t('view.now_no')}}widget</div>
      </div>
    </el-scrollbar>
     <!--跳转按钮_弹窗打开-->
    <el-dialog 
      @click.stop
      class="common-dialog"
      v-if="jumpPopup" 
      :title="jumpParams.title"
      :append-to-body="true"
      :visible.sync="jumpPopup" 
      top="10px" 
      :lock-scroll="true"
      width="70%" 
      :before-close="handleClose"
    >
      <!--表单-->
      <div v-if="isJumpForm" class="normal-form">
        <el-scrollbar class="scrollbar">
          <form_normalform
            :openParams="jumpParams"
            @action="closeDialog" 
          />
        </el-scrollbar>
      </div>
      <!--视图-->
      <div v-if="isJumpView" class="dialog-listview">
        <el-scrollbar class="scrollbar" v-if="popupLayerType == 'VIEW'">
          <div>
            <view_delegate 
              ref="widgetDelegate"
              :openParams="jumpParams"
              @popupOpenType="setPopupOpenType"
            >
            </view_delegate>
          </div>
        </el-scrollbar>
        <el-scrollbar class="scrollbar" v-else>
          <form_normalform
            :openParams="jumpParamsForm"
            @popupOpenType="setPopupOpenType"
          />
        </el-scrollbar>
      </div>
      <!--外部链接-->
      <div v-if="isExternalLink" class="el-dialog-div" style="height:500px;">
        <common_linkcontent
          :openParams="jumpParams"
        >
        </common_linkcontent>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Constant from "@/Constant.js";
import API from "@/api.js";
import draggable from "vuedraggable";
import view_delegate from "@/components/view_delegate.vue";
import widget_system_workflow from "@/components/widget_system_workflow.vue";
import widget_statement from "@/components/widget_statement.vue";
import widget_chart from "@/components/widget_chart.vue"
import widget_summary from "@/components/widget_summary.vue";
import widget_iscript from "@/components/widget_iscript.vue";
import widget_link from "@/components/widget_link.vue";
import widget_view from "@/components/widget_view.vue";
import widget_carboncopy from "@/components/widget_carboncopy.vue";
import widget_sign_in from "@/components/widget_sign_in.vue";
import widget_carousel from "@/components/widget_carousel.vue"
import form_normalform from "@/components/form_normalform.vue";
export default {
  inject: ["reload"],
  components: { 
    draggable, 
    view_delegate,
    widget_statement,
    widget_chart,
    widget_summary,
    widget_iscript,
    widget_link,
    widget_view,
    widget_carboncopy,
    widget_carousel,
    form_normalform,
  },
  created() {
    API.getHomePageConfig({
      onSucess: response => {
        let configData = response.data.data;
        // for(let key in configData.widgets) {
        //   configData.widgets[key].isShowIcon = true;
        // }
        let L = configData.setting.appL;
        let M = configData.setting.appM;
        let R = configData.setting.appR;
        for(let key in configData.widgets) {
          for(let i=0; i<L.length; i++) {
            if(L[i] == key) {
              configData.widgets[key].isShowIcon = true;
            }
          }
          for(let i=0; i<M.length; i++) {
            if(M[i] == key) {
              configData.widgets[key].isShowIcon = true;
            }
          }
          for(let i=0; i<R.length; i++) {
            if(R[i] == key) {
              configData.widgets[key].isShowIcon = true;
            }
          }
        }
        this.config = configData;
        this.currentlayout = response.data.data.setting.layoutStyle;
        switch (response.data.data.setting.layoutStyle) {
          case '1:1:1': 
            this.layoutLeft = 8;
            this.layoutCenter = 8;
            this.layoutRight = 8;
            break;
          case '1:1': 
            this.layoutLeft = 12;
            this.layoutCenter = 12;
            break;
          case '1': 
            this.layoutLeft = 24;
            break;
          case '1:2': 
            this.layoutLeft = 8;
            this.layoutCenter = 16;
            break;
          case '2:1': 
            this.layoutLeft = 16;
            this.layoutCenter = 8;
            break;
          default:
            break;
        }

        let iconData = configData.setting.appIcon//response.data.data.setting.appIcon;
        let widget = configData.widgets;//response.data.data.widgets;
        for(let key in widget) {
          if(!widget[key].iconShow) {
            this.allWidget.push(widget[key]);
          }
        }
        
        let arr = [];
        // for(let i=0; i<iconData.length; i++) {
        //   for(let key in widget) {
        //     if(iconData[i] == key) {
        //       arr.push(widget[key]);
        //     }
        //   }
        // }
        for(let key in widget) {
          if(widget[key].iconShow) {
            arr.push(widget[key]);
          }
        }
        
        if(iconData && iconData.length > 0 && arr && arr.length > 0) {
          let commonUsed = [];
          arr.forEach((el, i) => {
            if(iconData.indexOf(el.id) > -1) {
              arr[i].isCommonlyUsed = true;
              commonUsed.push( arr[i])
            }else {
              arr[i].isCommonlyUsed = false;
            }
          })
          this.$store.commit('naviBarCommonlyUsed', commonUsed); //常用
        }
        this.appIcon = arr;
        
        let appL = configData.setting.appL,
            appM = configData.setting.appM,
            appR = configData.setting.appR;
        for(let i=0; i<appL.length; i++) {
          for(let key in widget) {
            if(appL[i] == key) {
              this.settingAppL.push(widget[key]);
            }
          }
        }
        this.widgetAppL = JSON.parse(JSON.stringify(this.settingAppL));
        
        for(let i=0; i<appM.length; i++) {
          for(let key in widget) {
            if(appM[i] == key) {
              this.settingAppM.push(widget[key]);
            }
          }
        }
        this.widgetAppM = JSON.parse(JSON.stringify(this.settingAppM));

        for(let i=0; i<appR.length; i++) {
          for(let key in widget) {
            if(appR[i] == key) {
              this.settingAppR.push(widget[key]);
            }
          }
        }
        this.widgetAppR = this.settingAppR;
        //是否展示没有widget
        this.isShowWidget = true;

        if(this.widgetAppL.length ==0 && this.widgetAppM.length ==0 && this.widgetAppR.length ==0){
          this.isHidden = true;
        }
        this.$nextTick(()=>{
          let d = document.getElementById("expand") //.scrollHeight;
          let dh = ''
          if(d) {
            dh = d.scrollHeight
          }
          this.elRowScrollHeight = dh;
        });
        //  this.isHidden = true;
      }
    });
  },

  mounted(){
    // this.$nextTick(()=>{
    //   let d = document.getElementById("expand").scrollHeight;
    //   this.elRowScrollHeight = d;
    //   console.log("d--------->",d)
    // });
  },

  data: function() {
    return {
      Constant,
      allWidget:[],
      layoutLeft:0,
      layoutCenter:0,
      layoutRight: 0,
      currentlayout:'',
      controlOnStart: true,
      appIcon:[], //常用设置
      moduleSettingData:[],
      settingAppL:[],
      settingAppM:[],
      settingAppR:[],
      widgetAppL: [],
      widgetAppM: [],
      widgetAppR: [],

      config: {
        setting: {
          appIcon: [],
          appL: [],
          appM: [],
          layoutStyle: "",
          appR: []
        }
      },
      isHidden: false,
      isShowWidget: false,  //控制是否展示widget数据
      Controlthelayout: false, //控制header的显示或隐藏
      report: true, //控制子组件的隐藏和显示
      tirget: true, //控制流程处理显示和隐藏
      currentUrl: '',
      pagePath:'',
      scriptLink:'', //脚本链接

      jumpParams:'', //跳转按钮参数
      jumpParamsForm:'', //弹出层打开的视图进入表单的参数
      jumpPopup:false,//跳转按钮弹出窗
      isJumpForm:'',//跳转按钮参数
      isJumpView:'',//跳转按钮参数
      isExternalLink:'', //判断是否是外部链接
      popupLayerType:'', //弹出层打开视图然后新建或者打开视图时，判断打开类型
      elRowScrollHeight:600,
    };
  },

  methods: {
    onStart(){
      this.drag = true;
    },
    onEnd(){
      this.drag = false;
      this.$nextTick(()=>{
        let d = document.getElementById("expand").scrollHeight;
        this.elRowScrollHeight = d;
      });
    },
    //包含元素弹出层和当前页打开都是使用这个刷新
    closeDialog(isSave) {
      // this.$refs.widgetDelegate.reloadListView();
      if(!isSave) {
        this.jumpPopup = false;
      }
    },
    setPopupOpenType(type, params){  //当视图是弹出层打开，新建或打开视图列表
      if(type == 'FORM') {
        params.isPopupLayerDisplay = true;
        this.jumpParamsForm = params;
        this.popupLayerType = type;
      }else if(type == 'VIEW'){
        this.popupLayerType = type;
      }
    },
    handleClose(done) {
      done();
    },
    //计算脚本a标签跳转
    scriptJump(openType, params, jumpType) {
      let newparams = JSON.parse(params)[0];
      if(jumpType === 'opendocument') {
        if (openType == "open-eject" || openType == "dialog") {
          this.isJumpForm = true;
          this.jumpParams = newparams;
          this.jumpPopup = true;
        }else if (openType == "open-present") {
          newparams.isCurrentPageOpen = true;
          this.$emit("openNewpage",newparams);
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            // name: "form_blank",
            name: 'open',
            query: newparams,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          this.$emit("add-tab", newparams);
        }
      }else if(jumpType === 'openview') {
        this.popupLayerType = "VIEW";
        if (openType == "open-eject" || openType == "dialog") {
          this.isJumpView = true;
          this.jumpParams = newparams;
          this.jumpPopup = true;
        }else if (openType == "open-present") {
          newparams.isCurrentPageOpen = true;
          this.$emit("openNewpage",newparams);
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            name: "view_blank",
            query: newparams,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          this.$emit("add-tab", newparams);
        }
      }
    },

    doAction(type, item, val, isPenOrpro) {
      if(type == 'system_workflow') {
        if(val) {
          if(isPenOrpro === '1') {
            this.$emit('add-tab',{id:'105',name:this.$t('todo'),linkType:'105', appId: item.appId});
          }else {
            this.$emit('add-tab',{id:'106',name:this.$t('track'),linkType:'106', appId: item.appId});
          }
        }else {
          let params = {
            appId: item.applicationId,
            linkType:'00',
            actionContent:item.formId,
            docId:item.docId,
            _select: item.docId,
            name: item.flowName,
            homeWidgetType: item.homeWidgetType, //判断是否是widget，还没用上
            id:item.docId,
            refreshId:item.docId,
          };
          this.$emit("add-tab", params);
        }
      }else if(type == 'view') {
        this.$emit('add-tab',item);
      }else if (type == 'carboncopy') {
        if(val) {
          if(isPenOrpro ==='1'){
            this.$emit('add-tab',{id:'10',name:this.$t('to_read'),linkType:'10'});
          }else{
            this.$emit('add-tab',{id:'11',name:this.$t('readed'),linkType:'11'});
          }
         
        }else {
          let params = {
            appId: item.applicationId,
            linkType:'00',
            actionContent:item.formId,
            docId:item.docId,
            _select: item.docId,
            name: this.$t('to_read')
          };
          this.$emit("add-tab", params);
        }
      }else if(type == 'chart') {
        this.$emit("add-tab", item);
      }else if(type == 'summary') {
        this.$emit("add-tab", item);
      }
    },
    //点击右侧图标来控制header的隐藏和显示
    Settherollinginstall() {
      console.log("------------->")
      this.Controlthelayout = !this.Controlthelayout;
    },
    //拖拽触发header
    keep(event, index) {
      if (index.clientX >= 840) {
        this.Controlthelayout = true;
      }
      console.log(event);
    },

    //动态的显示两个组件
    template(wgtId) {
      let wgt = this.config.widgets[wgtId];
      let that = this;
      if (wgt) {
        if (wgt.type == "customizeReport") { //报表
          return {
            components: { widget_statement },
            methods: {
              getParams() {
                console.log("that.currentUrl,",that.currentUrl)
                return {
                  id: wgtId,
                  reportData: wgt,
                };
              }
            },
            template: "<div><widget_statement :report='getParams()'/></div>"
          };
        } else if(wgt.type ==  "carboncopy") {
          return {
            methods: {
              doAction(type, item, val, isPenOrpro) {
                that.doAction(type, item, val, isPenOrpro);
              },
              getParams() {
                return {
                  id: wgtId,
                  systemData: wgt,
                };
              }
            },
            components: { widget_carboncopy },
            template: "<div><widget_carboncopy :systemData='getParams()' @event='doAction'/></div>"
          };
        }else if (wgt.type == "system_workflow") {
          return {
            methods: {
              doAction(type, item, val, isPenOrpro) {
                that.doAction(type, item, val, isPenOrpro);
              },
              getParams() {
                return {
                  id: wgtId,
                  systemData: wgt,
                };
              }
            },
            components: { widget_system_workflow },
            template: "<div><widget_system_workflow :systemData='getParams()' @event='doAction'/></div>"
          };
        }else if (wgt.type == 'chart') {
          return {
            components: { widget_chart },
            methods: {
              doAction(type, item, val) {
                that.doAction(type, item, val);
              },
              getParams() {
                return {
                  id: wgtId,
                  wgtData: wgt,
                };
              }
            },
            template: "<div><widget_chart :chart='getParams()' @event='doAction'/></div>"
          };
        }else if(wgt.type == "view") { //视图
          return {
            components: { widget_view },
            methods: {
              doAction(type, item, val) {
                that.doAction(type, item, val);
              },
              getParams() {
                return {
                  id: wgtId,
                  viewData: wgt,
                };
              }
            },
            template: "<div><widget_view @event='doAction' :view='getParams()'/></div>"
          };
        }else if (wgt.type == 'summary') {//摘要
          return {
            components: { widget_summary },
            methods: {
              doAction(type, item, val) {
                that.doAction(type, item, val);
              },
              getParams() {
                return {
                  id: wgtId,
                  wgtData: wgt,
                };
              }
            },
            template: "<div><widget_summary :iscript='getParams()'  @event='doAction'/></div>"
          };
        }else if (wgt.type == 'page') {
          return {
            components: { widget_link },
            methods: {
              getParams() {
                return {
                  id: wgtId,
                  wgtData: wgt,
                };
              }
            },
            template: "<div><widget_link :link='getParams()'/></div>"
          };
        }else if (wgt.type == 'iscript') {
          return {
            components: { widget_iscript },
            methods: {
              getParams() {
                return {
                  id: wgtId,
                  wgtData: wgt,
                };
              }
            },
            template: "<div><widget_iscript :iscript='getParams()'/></div>"
          };
        }else if(wgt.type == 'checkin') {
          return {
            components: { widget_sign_in },
            methods: {
              getParams() {
                return {
                  id: wgtId,
                  wgt,
                };
              }
            },
            template: "<div><widget_sign_in :wgt='getParams()'/></div>"
          };
        }else if(wgt.type == 'carousel'){
          return {
            components: {widget_carousel},
            methods: {
              getParams() {
                return {
                  id: wgtId,
                  wgtData: wgt
                }
              }
            },
            template: "<div><widget_carousel :carousel='getParams()'/></div>"
          }
        }
      }
    },
    //取消用户首页配置
    Cancel() {
      this.reload();
    },
    //重置用户首页设置
    replacement() {
      this.$api.resetHomePageConfig(
        {
          onSucess: res => {
            if(res.data.errcode == 0) {
              this.reload();
            }
          }
        }
      )
      
    },
    //保存用户首页设置
    configuration() {
      let currentAppIcon = [];
      let currentAppL = [],
          currentAppM = [],
          currentAppR = [];
      console.log("this.appIcon-->",this.appIcon);
      console.log("this.widgetAppL-->",this.widgetAppL)
      console.log("this.widgetAppM-->",this.widgetAppM)
      console.log("this.widgetAppR-->",this.widgetAppR)
      this.appIcon.forEach(item => {
        if(item.isCommonlyUsed) {
          currentAppIcon.push(item.id);
        }
      });
      this.widgetAppL.forEach(item => {
        currentAppL.push(item.id);
      });
      this.widgetAppM.forEach(item => {
        currentAppM.push(item.id);
      });
      this.widgetAppR.forEach(item => {
        currentAppR.push(item.id);
      });

      let data = {
          appIcon: currentAppIcon,
          appL: currentAppL,
          appM: currentAppM,
          appR: currentAppR,
          layoutStyle: this.currentlayout,
        }
        console.log("data---->",data)
      this.$api.setHomePageConfig(
        data,
        {
          onSucess: res => {
            if(res.data.errcode == 0) {
              this.$emit("event");
            }
          }
        }
      )
    },

    singlePicture(id, index, isShowIcon, item) {
      this.allWidget[index].isShowIcon = !this.allWidget[index].isShowIcon;
      this.$forceUpdate();
      if(isShowIcon) {
        for(let i=0; i<this.widgetAppL.length; i++) {
          if(id == this.widgetAppL[i].id) {
            this.widgetAppL.splice(i, 1);
            i--;
          }
        }
        for(let i=0; i<this.widgetAppM.length; i++) {
          if(id == this.widgetAppM[i].id) {
            this.widgetAppM.splice(i, 1);
            i--;
          }
        }
        for(let i=0; i<this.widgetAppR.length; i++) {
          if(id == this.widgetAppR[i].id) {
            this.widgetAppR.splice(i, 1);
            i--;
          }
        }
      }else {
        this.widgetAppL.push(this.allWidget[index]);
      }
      this.$forceUpdate();
    },

    //常用设置
    iconLinkSetting(index) {
      this.appIcon[index].isCommonlyUsed = !this.appIcon[index].isCommonlyUsed;
      let arr = this.appIcon;
      let commonUsed = [];
      for(let i=0; i<arr.length; i++) {
        if(arr[i].isCommonlyUsed) {
          commonUsed.push(arr[i]);
        }
      }
      this.$store.commit('naviBarCommonlyUsed', commonUsed);
      this.$forceUpdate();
    },
    
    singlePhotograph(val) {
      console.log("widgetAppL-->",this.widgetAppL)
      console.log(" widgetAppM-->",this.widgetAppM)
      console.log("  widgetAppR-->",this.widgetAppR)
      this.currentlayout = val;
      switch (val) {
        case '1:1:1': 
          this.layoutLeft = 8;
          this.layoutCenter = 8;
          this.layoutRight = 8;
          break;
        case '1:1': 
          this.layoutLeft = 12;
          this.layoutCenter = 12;
          this.widgetAppL = this.widgetAppL.concat(this.widgetAppR)
          this.widgetAppR = []
          break;
        case '1': 
          this.widgetAppL = this.widgetAppL.concat(this.widgetAppM.concat(this.widgetAppR))
          this.widgetAppM = []
          this.widgetAppR = []
          this.layoutLeft = 24;
          break;
        case '1:2': 
          this.widgetAppL = this.widgetAppL.concat(this.widgetAppR)
          this.widgetAppR = []
          this.layoutLeft = 8;
          this.layoutCenter = 16;
          break;
        case '2:1': 
          this.widgetAppL = this.widgetAppL.concat(this.widgetAppR)
          this.widgetAppR = []
          this.layoutLeft = 16;
          this.layoutCenter = 8;
          break;
        default:
          break;
      }
    },
  }
};
</script>

<style lang="scss" scope>

</style>
