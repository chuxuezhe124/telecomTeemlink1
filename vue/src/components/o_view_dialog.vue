<template>
  <span class="view-dialog" :id="id">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <input type="hidden" v-model="field.value" />

      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <img
        class="img" 
        :src="path + field.imgpath" 
        :alt="field.caption?field.caption:field.name" 
        :title="field.caption?field.caption:field.name"
        @click="onBtnClick" 
        v-if="!field.eventMapping && field.imgpath" />

      <i 
        class="icon" 
        :class="field.iconpath"
        :title="field.caption?field.caption:field.name"
        @click="onBtnClick" 
        v-else-if="field.iconpath" 
      ></i>
      <el-button 
        calss="view-btn"
        @click="onBtnClick" 
        v-else-if="field.eventMapping == ''"
      >{{field.caption?field.caption:field.name}}</el-button>
      <el-dialog
        :title="field.caption =='' ?field.name:field.caption"
        :visible.sync="dialogVisible"
        v-if="dialogVisible"
        :width="field.maximization?'98%':dialogWidth"
        :height="field.maximization?'98%':dialogHidth"
        :class="field.maximization?'common-view-dialog':'usual-view-dialog'"
        :before-close="handleClose"
        :fullscreen="field.divHeight == '100%' ? true : false"
        :append-to-body="true"
        :top="dialogTop?dialogTop:'5%'"
      >
        <div :style="{height: dialogHidth}">
          <el-scrollbar class="scrollbar">
          <!-- 54： title  55：button -->
            <view_delegate
              :openParams="params"
              :clearCheckboxVal="clearCheckboxV"
              :mutil="field.mutil"
              :selectOne="field.selectOne"
              :isView="isView"
              :isSearchForm="field.isSearchForm"
              :allowOpenDoc="field.allow"
              :selectedRows="selectedRows"
			        :showCleanBtn="showCleanBtn"
              v-bind="$attrs"
              v-on="$listeners"
              @updateViewData="checkboxVal"
              @openDoc="openDoc" 
              @getViewType="getViewType" 
              :tableHeight="field.maximization ? (parseInt(this.dialogHidth) - 54 - 55 - 40) : (parseInt(this.dialogHidth) - 54 - 55)"
            />
          </el-scrollbar>
        </div>
        <span slot="footer" class="dialog-footer" v-if="field.selectOne || field.mutil">
          <el-button @click="handleClose" v-if="!showCleanBtn" size="medium">{{$t('btns.cancel')}}</el-button>
          <!-- <el-button @click="clearCheckbox" v-if="showCleanBtn" size="medium">{{$t('btns.clean')}}</el-button>
          <el-button type="primary" @click="onOk" size="medium">{{$t('btns.sure')}}</el-button> -->
        </span>
      </el-dialog>
    </template>

    <template
      v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED"
    >
      <img
        class="img disabled" 
        :src="'obpm' + field.imgpath" 
        :alt="field.caption?field.caption:field.name" 
        :title="field.caption?field.caption:field.name"
        v-if="!field.eventMapping && field.imgpath" />

      <i 
        class="icon disabled" 
        :class="field.iconpath"
        :title="field.caption?field.caption:field.name"
        v-else-if="field.iconpath" 
      ></i>
      <el-button 
        disabled 
        @click="onBtnClick" 
        v-else-if="field.eventMapping == ''"
        calss="view-btn" 
      >{{field.caption?field.caption:field.name}}</el-button>
    </template>
    <!-- 打印 -->
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <el-button disabled>{{field.caption?field.caption:field.name}}</el-button>
    </template>
	  <!-- 允许打开文档弹框 -->
    <el-dialog
      :title="$t('btns.preview')"
      v-if="popupVisible"
      :append-to-body="true"
      :visible.sync="popupVisible"
      top="10px"
      :lock-scroll="true"
      width="80%"
      :before-close="handleDocumentClose"
    >
      <form_normalform :openParams="documentData" />
    </el-dialog>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import API from "@/api.js";
import view_delegate from "@/components/view_delegate.vue";
import form_normalform from "@/components/form_normalform.vue";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-view-dialog",
  props: ["id", "appId"],
  components: {
    view_delegate,
    form_normalform,
  },
  inject: [
    "findField",
    "buildFormData"
  ],
  computed: {
    field: function () {
      let formData = this.$parent.findField(this.id);
      if (formData.divWidth) {
        if (formData.divWidth.indexOf("px") > -1) {
          this.dialogWidth = formData.divWidth;
        } else if (formData.divWidth.indexOf("%") > -1) {
          this.dialogWidth = formData.divWidth;
        } else {
          this.dialogWidth = formData.divWidth + "px";
        }
      }
      if (formData.divHeight) {
        let screen = document.documentElement.clientHeight;
        let h = "";
        if (formData.divHeight.indexOf("px") > -1) {
          h = formData.divHeight.split("px")[0];
          this.dialogHidth = parseInt(h) - 100 + "px";
        } else if (formData.divHeight.indexOf("%") > -1) {
          h = formData.divHeight;
          let num = h.split("%")[0];
          let he = (screen * parseInt(num)) / 100;
          this.dialogHidth = he - 124 + "px";
        } else {
          let t = screen * 0.15;
          //let t = 1 - (formData.divHeight / screen);
          if(parseInt(formData.divHeight) >= screen) {
            this.dialogTop = "1%";
          }else {
            let hd =  screen - parseInt(formData.divHeight);
            if(hd < t) {
              let d = Math.ceil(hd/t);
              if(d >= 15) {
                this.dialogTop =  "15%";
              }else {
                this.dialogTop =  d +"%";
              }
            }
          }
          this.dialogHidth = parseInt(formData.divHeight) - 124 + "px";
        }
      } else {
        let screen = document.documentElement.clientHeight;
        this.dialogHidth = screen / 2 + 24 +"px";
      }

      formData.obpmFilePath =  obpmConfig.obpmFilePath
      //return this.$parent.findField(this.id);
      return formData;
    },
    params: function () {
      let appId = this.$root.appid
      let field = this.field
      return {
        appId: appId,
        actionContent: field.dialogView,
        parentId: field.docId
      };
    },
  },
  watch: {
    dialogVisible(newVal){
      if(!newVal) {
        this.isClickBtn = false;
        this.selectedDocIdNum = '';
      }
    },
    // 监听$store.state.eventMapping是否为true，显示视图选择框的视图
    '$store.state.eventMapping'() { 
      if(this.$store.state.eventMapping == true) {
        this.onBtnClick();
      }
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.textType == "hidden" || field.displayType == Constant.PermissionType_HIDDEN){
        if(field.isHideType) {
          let id = this.id,
            formShowType = field.formShowType;
          controlHidden({id, field, formShowType})
        }
      }
    })
  },
  data: function () {
    return {
      path:window.location.origin + '/obpm',
      dialog: false,
      Constant,
      dialogVisible: false,
      items: {},
      checkboxParams: {},
      newRow: {},
      clearCheckboxV: false,
      selectedValArr: [],
      allParams: [],
      selectedDocIdNum: "",
      isView: true,
      popupVisible: false,
      documentData: "",
      selectedRows: [],
      dialogWidth: "",
      dialogHidth: "",
      showCleanBtn: true, // 是否显示清除按钮
      dialogTop:'',
      isClickBtn: false,
      isSingleClick: false, //单选的时候限制一直点击
      userFieldList: [],
    };
  },
  methods: {
    hiddencheck(){

    },
    /**
     * 获取当前的视图类型(树形视图不显示清除按钮)
     */
    getViewType(val){
      if(val == 'TreeView'){
        this.showCleanBtn = false
      }
    },
    openDoc(params) {
      params.allowOpenDoc = true; //视图选择框允许查看文档，添加个参数让返回按钮正常返回
      this.documentData = params;
      this.popupVisible = true;
    },
    onBtnClick() {
      this.dialogVisible = true;
    },
    handleDocumentClose() {
      this.popupVisible = false;
    },
    handleClose() {
      this.dialogVisible = false;
      let eventMapping = this.dialogVisible;
      this.$store.commit('saveEventMapping',eventMapping)
    },
    onOk() {
      if(!this.isClickBtn) {
        this.isClickBtn = true;
        this.doAction();
      }
    },
    //清除多选框的值
    clearCheckbox() {
      this.clearCheckboxV = parseInt(Math.random() * 100 + 1) + new Date();
    },

    checkboxVal(params, arrRow, isRadio, userFieldList) {
      //多选时的值
      this.userFieldList = userFieldList;
      this.selectedDocIdNum = arrRow;
      let selectedVal = [];
      this.allParams = params; //之前放在判断中
      if (this.field.mapping && this.field.mapping.length > 0) {
        let mapping = this.field.mapping;
        arrRow.forEach((row) => {
          for (let item in row) {
            for (let i = 0; i < mapping.length; i++) {
              if (item == mapping[i].id) {
                let obj = {};
                obj.id = item;
                obj.value = row[item];
                selectedVal.push(obj);
              }
            }
          }
        });
        let result = [];
        let obj = {};
        for (let i = 0; i < selectedVal.length; i++) {
          if (!obj[selectedVal[i].id]) {
            result.push(selectedVal[i]);
            obj[selectedVal[i].id] = true;
          } else {
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                if (result[j].id == selectedVal[i].id) {
                  result[j].value = result[j].value + ";" + selectedVal[i].value;
                }
              }
            }
          }
        }
        this.selectedValArr = result;
      }
      if (isRadio) {
        this.doAction();
      }
    },

    doAction() {
      this.selectedRows = JSON.parse(JSON.stringify(this.selectedDocIdNum));
      this.selectedDocIdNum = '';
      let sr = this.selectedRows;
      let docId = this.field.docId;
      let inputIdAndName = []; //id+name
      let field = this.field;
      if(field.mutil != 'field.mutil' && field.selectOne != 'field.selectOne') { //单选第一次点击允许，之后连续点击禁止之后的操作
        if(!this.isSingleClick) {
          this.isSingleClick = true;
        }else {
          return;
        }
      } 
      if (field.mapping && field.mapping.length > 0) {
        let mapping = this.field.mapping;
        if(sr && sr.length > 0) {
          for (let i = 0; i < mapping.length; i++) {
            for (let j = 0; j < this.selectedValArr.length; j++) {
              let obj = {};
              // if (inputIdAndName.id == this.selectedValArr[j].id) {
              if (mapping[i].id == this.selectedValArr[j].id) {
                obj.id = docId + "_" + mapping[i].value;
                obj.value = this.selectedValArr[j].value;
                inputIdAndName.push(obj);
              }
            }
          }
          if(this.userFieldList && this.userFieldList.length > 0) { //视图选择框映射用户选择框
            for( let x = 0; x < this.userFieldList.length; x ++) {
              if(this.userFieldList[x].formField == "UserField") {
                for(let m = 0; m <inputIdAndName.length; m ++) {
                  if(this.userFieldList[x].value == inputIdAndName[m].value) { //百川信好像是.id == .id, 有点忘了
                    inputIdAndName[m].data = this.userFieldList[x].data
                    let userId = ""
                    for(let n = 0; n < inputIdAndName[m].data.length; n ++) {
                      userId = userId + ";" + inputIdAndName[m].data[n].id
                    }
                    userId = userId.replace(/^(\s|;)+|(\s|;)+$/g, '') //首尾；去掉
                    inputIdAndName[m].value = userId  //用户选择框映射时value值需为用户id
                  }
                }
              }
            }
          }
        }else {
          for (let i = 0; i < mapping.length; i++) {
            let obj = {};
            if (mapping[i].id) {
              obj.id = docId + "_" + mapping[i].value;
              obj.value = '';
              inputIdAndName.push(obj);
            }
          }
        }
      }
      let doc;
      let fieldData;

      fieldData = this.findField()
      doc = this.buildFormData()

      /**
       * 不要删除先(10.29)
       * 开始
       * **/
      // if (this.$parent.findField) {
      //   if (this.$parent.$parent.buildFormData) {
      //     if(this.$parent.$parent.findField) {
      //       fieldData = this.$parent.$parent.findField();
      //     }else {
      //       fieldData = this.$parent.$parent.formdata; //高级查询里的视图选择框(树形)获取的this.$parent.$parent.findField为undefined
      //     }
      //     doc = this.$parent.$parent.buildFormData();
      //   }else if(this.$parent.$parent.$parent.$parent.buildFormData){ //选项卡折叠模式下
      //     fieldData = this.$parent.$parent.$parent.findField();
      //     doc = this.$parent.$parent.$parent.$parent.buildFormData()
      //   }else if (this.$parent.$parent.$parent.$parent.$parent.$parent.buildFormData) {
      //     fieldData = this.$parent.$parent.$parent.$parent.$parent.$parent.findField();
      //     doc = this.$parent.$parent.$parent.$parent.$parent.$parent.buildFormData();
      //   }
      /**
       * 结束
       * **/


        if(fieldData && fieldData.fields) { //tab标签
          const loopOpe = fields => {
            for (let i = 0; i < fields.length; i++) {
              let fd = fields[i];
              inputIdAndName.forEach((item) => { 
                if (fd.id == item.id) {
                  if(fd.formField == "RadioField") {
                    for (let i = 0; i < fd.options.length; i++) {
                      if(fd.options[i].label == item.value || fd.options[i].option == item.value) {
                        fd.value = fd.options[i].value
                      }
                    }
                  }else if(fd.formField == "UserField") {
                    fd.value = item.value;
                    fd.data = item.data;
                  }else if(fd.formField == "InputField") {
                    if(item.data && item.value) {
                      let valArr = item.value.split(";")
                      let name = ''
                      valArr.forEach(el => {
                        item.data.forEach(elm => {
                          if(el == elm.id) {
                            name += elm.name + ';'
                          }
                        })
                      })
                      fd.value = name.replace(/^(\s|;)+|(\s|;)+$/g, "")
                    }else {
                      fd.value = item.value
                    }
                  }else {
                    fd.value = item.value;
                  }
                  if(item.value) { //这里针对视图选择框 隐藏并且没值时，但有选过值，也要把这个属性传到后台
                    fd.isUpdatedValue = true;
                  }
                }
              });
              if(fd.tabs && fd.tabs.length>0) {
                fd.tabs.forEach(tab => {
                  if(tab.fields) {
                    loopOpe(tab.fields)
                  }
                })
              }
            }
          };
          loopOpe(fieldData.fields)
        }
      
      /**
       * 不要删除先(10.29)
       * 开始
       * **/
      // } else if (this.$parent.$parent.findField) {
      //   //选项卡
      //   let fieldData = this.$parent.$parent.findField();
      //   if(fieldData && fieldData.fields) { //tab标签
      //     const loopOpe = fields => {
      //       for (let i = 0; i < fields.length; i++) {
      //         let fd = fields[i];
      //         inputIdAndName.forEach((item) => { 
      //           if (fd.id == item.id) {
      //             if(fd.formField == "RadioField") {
      //               for (let i = 0; i < fd.options.length; i++) {
      //                 if(fd.options[i].label == item.value || fd.options[i].option == item.value) {
      //                   fd.value = fd.options[i].value
      //                 }
      //               }
      //             }else if(fd.formField == "UserField") {
      //               fd.value = item.value;
      //               fd.data = item.data;
      //             }else {
      //               fd.value = item.value;
      //             }
      //             if(item.value) { //这里针对视图选择框 隐藏并且没值时，但有选过值，也要把这个属性传到后台
      //               fd.isUpdatedValue = true;
      //             }
      //           }
      //         });
      //         if(fd.tabs && fd.tabs.length>0) {
      //           fd.tabs.forEach(tab => {
      //             if(tab.fields) {
      //               loopOpe(tab.fields)
      //             }
      //           })
      //         }
      //       }
      //     };
      //     loopOpe(fieldData.fields)
      //   }
        
      //   // fieldData.fields.forEach((items) => {
      //   //   if (items.tabs) {
      //   //     items.tabs.forEach((item) => {
      //   //       if (item.fields && item.fields.length > 0) {
      //   //         item.fields.forEach((el) => {
      //   //           if (el.id == inputIdAndName) {
      //   //             el.value = selectedVal;
      //   //           }
      //   //         });
      //   //       }
      //   //     });
      //   //   }
      //   // });
      //   doc = this.$parent.$parent.buildFormData();
      // }
      /**
       * 结束
       * **/


      let allData = {
        docId: this.field.docId,
        document: doc,
        fieldId: this.field.divId,
        formId: this.field.formId,
        viewId: this.field.dialogView,
        _selects: this.allParams._select,
      };
      API.runViewDialogConfirmScript(allData, {
        onSucess: (response) => {
          if (response.data.data && response.data.data != "false") {
            this.$message({
              message: response.data.data,
              type: "error",
            });
            this.isSingleClick = false;
          } else if (response.data.data == "false") {
            this.dialogVisible = false;
            this.$message({
              message: response.data.data,
              type: "error",
            });
            this.isSingleClick = false;
          } else if (!response.data.data && response.data.errmsg == "ok") {
            API.runViewDialogCallbackScript(allData, {
              onSucess: (response) => {
                let fds = fieldData.fields;
                if(response.data.data && response.data.data.changedField) { //一定先执行，不然刷新出问题
                  let cf = response.data.data.changedField;
                  let uList = this.userFieldList
                  if(uList && uList.length > 0){
                    const loopOpeSetUser = fields => {
                      for (let i = 0; i < fields.length; i++) {
                        let fld = fields[i];
                        for(let j=0; j<uList.length; j++) {
                          if(uList[j].name == fields[i].name) {
                            if(fields[i].formField === "UserField") {
                              fields[i].data = uList[j].data;
                            }
                          }
                        }
                        if(fld.tabs && fld.tabs.length>0) {
                          fld.tabs.forEach(tab => {
                            if(tab.fields) {
                              loopOpeSetUser(tab.fields)
                            }
                          })
                        }
                      }
                    };
                    loopOpeSetUser(fds)
                  }
                  const loopOpe = fields => {
                    for (let i = 0; i < fields.length; i++) {
                      let fld = fields[i];
                      for (let j = 0; j < cf.length; j++) {
                        for (let key in cf[j]) {
                          if(key == fields[i].name) {
                            fields[i].value = cf[j][key];
                          }
                        }
                      }
                      if(fld.tabs && fld.tabs.length>0) {
                        fld.tabs.forEach(tab => {
                          if(tab.fields) {
                            loopOpe(tab.fields)
                          }
                        })
                      }
                    }
                  };
                  loopOpe(fds)
                }

                if (response.data.errcode == 0) {
                  if (this.field.refreshOnChanged) {
                    //刷新
                    if (this.$parent.refresh) {
                      this.$parent.refresh(this.field.id);
                    } else if (this.$parent.$parent.refresh) {
                      this.$parent.$parent.refresh(this.field.id);
                    } else if (this.$parent.$parent.$parent.$parent.$parent.$parent.refresh) { //视图列类型设置脚本，返回用户id，映射到用户选择框 bug19929 有选项卡嵌套比较复杂暂时先这样
                      let parentFields = this.$parent.$parent.$parent.$parent.$parent.$parent.findField().fields
                      if(parentFields) {
                        for(let i = 0; i < parentFields.length; i ++) {
                          if(parentFields[i].tabs && parentFields[i].tabs.length > 0) {
                            for(let x = 0; x < parentFields[i].tabs.length; x ++) {
                              if(parentFields[i].tabs[x].fields) {
                                for(let m = 0; m <parentFields[i].tabs[x].fields.length; m ++) {
                                  if(parentFields[i].tabs[x].fields[m].refreshOnChanged) {
                                    this.$parent.$parent.$parent.$parent.$parent.$parent.refresh(parentFields[i].tabs[x].fields[m].id)
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  this.isSingleClick = false;
                  this.dialogVisible = false;
                  let eventMapping = this.dialogVisible;
                  this.$store.commit('saveEventMapping',eventMapping)
                }
              },
            });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
