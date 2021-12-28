<template>
  <div :id="'tabControl_' + id" class="tab-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印 -->
       <div v-if="field.showMode=='0'" :style="{'max-width':tabWidth+'px'}">
        <el-tabs 
          :ref="'tabs_' + id"
          v-model="field.activeName" 
          type="card" 
          @tab-click="handleClick" 
        >
          <el-tab-pane
            v-for="(tab,index) in field.tabs"
            :key="tab.id"
            :label="tab.name"
            :name="tab.id"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto; width:100%;">
                <component 
                  name="formTemplate" 
                  :is="template(index)"> 
                </component>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div v-else-if="field.showMode == '1'">
        <el-collapse 
          v-model="collapseNames" 
          @change="handleChange" 
        >
          <el-collapse-item 
            v-for="(item, index) in field.tabs" 
            :name="index" 
            :key="item.id" 
            :title="item.name"
            :style="{'display':(item.hiddenPrintScript == 'true')?'none':'block'}"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto;width:100%;">
                <component 
                  name="formTemplate" 
                  :is="template(index)">
                </component>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <el-tabs 
        :ref="'tabs_' + id"
        v-model="field.activeName" 
        @tab-click="handleClick" 
        v-if="field.showMode=='2'"
        tabPosition="left"
      >
        <el-tab-pane
          v-for="(tab,index) in field.tabs"
          :key="tab.id"
          :label="tab.name"
          :name="tab.id"
        >
      
          <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
            <div style="margin:0 auto; width:100%;">
              <component 
                name="formTemplate" 
                :is="template(index)"> 
              </component>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs> 
      
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div v-if="field.showMode=='0'" :style="{'max-width':tabWidth+'px'}">
        <el-tabs 
          :ref="'tabs_' + id"
          v-model="field.activeName" 
          type="card" 
          @tab-click="handleClick" 
        >
          <el-tab-pane
            v-for="(tab,index) in field.tabs"
            :key="tab.id + index"
            :label="tab.name"
            :name="tab.id + '_' + index"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;" v-show="tab.displayType != Constant.PermissionType_HIDDEN">
              <div style="margin:0 auto; width:100%;">
                <component 
                  ref="delegate"
                  name="formTemplate" 
                  :is="template(index)"> 
                </component>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div 
        v-else-if="field.showMode == '1'" 
        class="collapse-wrap" 
        :style="{width:collapseWrapWidth?collapseWrapWidth+'px':'100%'}">
        <div 
          v-for="(tab,index) in field.tabs" 
          :key="tab.id" 
          class="tab-container" 
          :style="{'display':tab.displayType != Constant.PermissionType_HIDDEN == true?'block':'none'}">
          <div class="tab-item" @click.stop.prevent="showTab(tab.id, index)">
            <span class="tab-item-left">
              <span class="title">{{tab.name}}</span>
              <span class="icon" v-if="tab.isOpenAll">
                <i class="el-icon-arrow-down"></i>
              </span>
              <span class="icon" v-else>
                <i class="el-icon-arrow-up"></i>
              </span>
            </span>
            <span class="tab-item-right">
              <span class="fold-line"></span>
            </span>
          </div>
          <template>
            <div class="tab-wrap" v-show="tab.isOpenAll">
              <component 
                class="tab-content" 
                name="formTemplate" 
                v-bind="$attrs"
                v-on="$listeners"
                :is="template(index)">
              </component>
            </div>
          </template>
        </div>
        <!-- <el-collapse 
          v-model="collapseNames" 
          @change="handleChange" 
        >
          <el-collapse-item 
            v-for="(item, index) in field.tabs" 
            :name="index" 
            :key="item.id" 
            :title="item.name"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto;width:100%;">
                <component 
                  name="formTemplate" 
                  :is="template(index)">
                </component>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse> -->
      </div>
      <div v-if="field.showMode=='2'">
        <el-tabs 
          :ref="'tabs_' + id"
          v-model="field.activeName" 
          @tab-click="handleClick" 
          tabPosition="left"
        >
          <el-tab-pane
            v-for="(tab,index) in field.tabs"
            :key="tab.id + index"
            :label="tab.name"
            :name="tab.id + '_' + index"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto; width:100%;">
                <component 
                  ref="delegate"
                  name="formTemplate" 
                  :is="template(index)"> 
                </component>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <div v-if="field.showMode=='0'" :style="{'max-width':tabWidth+'px'}">
        <el-tabs 
          :ref="'tabs_' + id"
          v-model="field.activeName" 
          type="card" 
          @tab-click="handleClick" 
        >
          <el-tab-pane
            :lazy="true"
            v-for="(tab,index) in field.tabs"
            :key="tab.id + index"
            :label="tab.name"
            :name="tab.id + '_' + index"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto; width:100%;">
                <component
                  ref="delegate"
                  name="formTemplate" 
                  :is="template(index)"> 
                </component>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div 
        v-else-if="field.showMode == '1'"
        class="collapse-wrap" 
        :style="{width:collapseWrapWidth?collapseWrapWidth+'px':'100%'}">
        <div 
          v-for="(tab,index) in field.tabs" 
          :key="tab.id" 
          class="tab-container" 
          :style="{'display':tab.displayType != Constant.PermissionType_HIDDEN == true?'block':'none'}">
          <div class="tab-item" @click.stop.prevent="showTab(tab.id, index)">
            <span class="tab-item-left">
              <span class="title">{{tab.name}}</span>
              <span class="icon" v-if="tab.isOpenAll">
                <i class="el-icon-arrow-down"></i>
              </span>
              <span class="icon" v-else>
                <i class="el-icon-arrow-up"></i>
              </span>
            </span>
            <span class="tab-item-right">
              <span class="fold-line"></span>
            </span>
          </div>
          <template>
            <div class="tab-wrap" v-show="tab.isOpenAll">
              <component 
                class="tab-content" 
                name="formTemplate" 
                v-bind="$attrs"
                v-on="$listeners"
                :is="template(index)">
              </component>
            </div>
          </template>
        </div>
        <!-- <el-collapse 
          v-model="collapseNames" 
          @change="handleChange" 
        >
          <el-collapse-item 
            v-for="(item, index) in field.tabs" 
            :name="index" 
            :key="item.id" 
            :title="item.name"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto;width:100%;">
                <component 
                  name="formTemplate" 
                  :is="template(index)">
                </component>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse> -->
      </div>
      <div v-if="field.showMode=='2'">
        <el-tabs 
          :ref="'tabs_' + id"
          v-model="field.activeName" 
          @tab-click="handleClick" 
          tabPosition="left"
        >
          <el-tab-pane
            v-for="(tab,index) in field.tabs"
            :key="tab.id + index"
            :label="tab.name"
            :name="tab.id + '_' + index"
          >
            <div style="width:100%; display:-webkit-flex; display:flex; align-items:flex-end;">
              <div style="margin:0 auto; width:100%;">
                <component 
                  ref="delegate"
                  name="formTemplate" 
                  :is="template(index)"> 
                </component>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>  
  </div>
</template>

<script>
import Constant from "@/Constant.js";
import view_delegate from "@/components/view_delegate.vue"
export default {
  name: "o-tab",
  props: ["id"],
  components: { view_delegate },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id)
      if(this.isOpenAll){
        this.allCollapseShow(formData);
      }
      this.tabWidth = document.documentElement.clientWidth - 327;
      return this.setField(formData);
      //return this.$parent.findField(this.id);
    },
  },
  mounted() {
    this.$nextTick(()=> {
      let id = "tabControl_" + this.id;
      let w = document.getElementById(id).clientWidth - 15;
      this.collapseWrapWidth = w;
    });
  },
  data: function() {
    return { 
      Constant, 
      activeName: 0,
      collapseNames: [],
      isOpenAll:true,
      tabWidth:'',
      currentTab:0,
      collapseWrapWidth:'',
    };
  },

  methods: {
    showTab(id, index) {
      let data = this.field.tabs;
      for(let i=0; i<data.length; i++) {
        if(data[i].id == id && index == i) {
          data[i].isOpenAll = !data[i].isOpenAll;
          this.$forceUpdate();
          return;
        }
      }
    },

    toTab(params) {
      //this.$parent.setCallback(params);  //form_normalform组件的方法
      this.$parent.addTabs(params);
    },

    hideTabs() {
      //this.$refs.tabs.$children[0].$el.style.display = 'none';
      this.$refs.tabs.$children[0].$refs.tabs[2].style.display = 'none';
    },

    setField(data) {
      let formData = data
      let docId = sessionStorage.getItem("currentFormtableDocId")
      let haveTab = false
      let activeName = ''
      if(docId && (docId === data.docId)) {
        let cTabs = sessionStorage.getItem("currentTabData")
        if(cTabs && (JSON.parse(cTabs) instanceof Object)) {
          let c = JSON.parse(cTabs)
          if(c[this.id]) {
            activeName = c[this.id]
            haveTab = true
          }
        }
      }
      if(!haveTab) {
        if(data.showMode == '1') {
          if(data.tabs && data.tabs.length > 0) {
            for(let i=0; i<data.tabs.length; i++) {
              if(data.openAll == "true") {
                data.tabs[i].isOpenAll = true
              }else if(data.openAll == "false"){
                if(data.tabs[i].selected == true || data.tabs[i].selected == 'true') {
                  data.tabs[i].isOpenAll = true
                }else {
                  data.tabs[i].isOpenAll = false
                }
              }
            }
          }
        }
        if (formData.tabs &&  formData.tabs.length > 0) {
          let active = '';
          let activeName = '';
          for (let i = 0; i < formData.tabs.length; i++) {
            if(formData.tabs[i].selected) {
              active = i;
              activeName = formData.tabs[i].id + "_" + i;
              formData.activeName = formData.tabs[i].id + "_" + i;
            }else {
              if(active) {
                formData.activeName = formData.tabs[active].id + "_" + i;
              }else {
                if(formData.tabs[i].displayType == 3) {
                  if(formData.tabs[i+1]) {
                    let le = i+1;
                    if(le == formData.tabs.length - 1) {
                      formData.activeName = formData.tabs[0].id + "_" + i;
                    }else {
                      for(let j=0; j<formData.tabs.length; j++) {
                        if(formData.tabs[j].displayType == 2 || formData.tabs[j].displayType == 1) {
                          activeName = formData.tabs[j].id + "_" + j//i;
                          formData.activeName = formData.tabs[j].id + "_" + j//i;
                          break;
                        }
                      }
                    }
                  }
                  this.$nextTick(() => {
                    if(this.$refs['tabs_' + this.id] && this.$refs['tabs_' + this.id].$children) {
                      this.$refs['tabs_' + this.id].$children[0].$refs.tabs[i].style.display = 'none';
                    }
                  })
                }else {
                  if(this.$refs['tabs_' + this.id]) {
                    this.$refs['tabs_' + this.id].$children[0].$refs.tabs[i].style.display = 'inline-block';
                  }
                  for (let j = 0; j < formData.tabs.length; j++) {
                    if(formData.tabs[i].displayType != 3) {
                      if(!activeName) {
                        activeName = formData.tabs[j].id + "_" + j
                        formData.activeName = formData.tabs[j].id + "_" + j
                      }else {
                        continue
                      }
                    }
                  }
                  // if(formData.tabs[0].displayType != 3) {
                  //   formData.activeName = formData.tabs[0].id + "_0";
                  // }else {
                  //   formData.activeName = formData.tabs[i].id + "_" + i;
                  // }
                }
              }
            }
          }
          if(activeName) {
            formData.activeName = activeName;
          }
        }
      }else {
        formData.activeName = activeName
      }
      return formData;
    },
    
    allCollapseShow(formData) {
      let openAll = formData.openAll;
      //打开所有折叠
      if(openAll == "true" && this.isOpenAll) {
        this.isOpenAll = false;
        let arr = [];
        let tabsData = formData.tabs;
        for(let i=0; i<tabsData.length; i++) {
          arr.push(i);
        }
        let s = [];
        for(let j=0; j<tabsData.length; j++) {
          if(tabsData[j].selected) {
            s.push(j);
          }
        }
        if(s.length > 0) {
          this.collapseNames = s;
        }else {
          this.collapseNames = arr;
        }
        
      }
    },

    handleChange(val) {
      console.log(val);
    },

    handleClick(tab) {
      let cTabs = JSON.parse(sessionStorage.getItem("currentTabData") || '{}')
      cTabs[this.id] = tab.name
      sessionStorage.setItem("currentTabData", JSON.stringify(cTabs))
      let tabs = this.field.tabs
      for(let i=0; i<tabs.length; i++ ) {
        if(tab.index == i) {
          if(tabs[i].selectRefresh) {
            this.$parent.refresh(this.id)
            if(tabs[i].fields && tabs[i].fields.length > 0) {
              for(let j=0; j<tabs[i].fields.length; j++) {
                if(tabs[i].fields[j].formField == "CalctextField") { //如果选项卡下计算脚本，计算脚本是pdf文件预览，刷新iframe
                  if(tabs[i].fields[j].value.indexOf("pdfviewer.html") > -1) {
                    let ifr = document.getElementById(tabs[i].fields[j].id).childNodes[0]
                    ifr.contentWindow.location.reload(true)
                    break
                  }
                }
              }
            }
          }
        }
      }
    },

    tabRunBeforeAction(divId, refreshOnChanged, id, activityType, withOld, activity){
      if(id) {
        this.$parent.$parent.runBeforeAction(divId, refreshOnChanged, id, activityType, withOld, activity);
      }
    },

    template(index) {
      let field = this.field;
      let data = field.tabs[index];
      let that = this;
      if (data && data.fields) {
        return {
          methods: {
            findField(id) {
              for (let i = 0; i < data.fields.length; i++) {
                let fld = data.fields[i];
                if(data.style){
                  fld.customStyle = data.style;
                }
                if (id == fld.id) return fld;
              }
              return null;
            },
            getAllFields() { //: this.getAllFields,
              let fld = data.fields;
              return fld;
            },
            runBeforeAction: this.tabRunBeforeAction
          },
          template: "<div>" + data.template + "</div>"
        };
      } else if (data.type == "view") {
        let viewId = data.id;
        let showtype = "tab";
        let parentId = data.docId;
        let isRelate = data.relate;
        let formId = field.formId;
        let displayType = data.displayType;
        return {
          components: { view_delegate },
          methods: {
            getParams() {
              return {
                appId: this.$root.appid,
                actionContent: viewId,
                showtype: showtype,
                parentId: parentId,
                isRelate: isRelate,
                formId: formId,
                showtype: 'tab',
                isFormPrint: displayType,
                includeDisplayType: displayType, //包含元素也用这个
                currentTab: that.currentTab,
              }
            },
            toTab: this.toTab,
          },
          template: "<div><view_delegate :toTab='toTab' :currentTab='getParams().currentTab' :showtype='getParams().showtype' :openParams='getParams()' :isFormPrint='getParams().isFormPrint' :includeDisplayType='getParams().includeDisplayType'/></div>"
        };
      }else {
        return {
          template: "<div>empty</div>"
        };
      }
    }
  }
};
</script>

<style>
</style>
