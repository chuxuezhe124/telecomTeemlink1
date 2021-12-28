<template>
  <div :id="'searchFormTable_' + viewId" class="formwrapper searchFormTableBox" style="display: block;" @wheel="handleWheel">
    <!-- 输出查询表单HTML -->
    <div class="formTable-wrap" id="searchFormPanel">
      <component name="searchform" :is="form(formdata)"></component>
    </div>
    <div 
      class="row searchFormBtn" 
      v-show="searchBtnShow(formdata)" 
      >
      <div class="col-xs-12 text-center">
        <button id="searchBtn" type="button" class="btn btn-primary" @click="onSearchClick" style="margin-right:10px;">{{$t('btns.query')}}</button>
        <button id="restBtn" type="button" class="btn btn-default btn-reset" @click="reset(isTreeView)">{{$t('reset')}}</button>
        <el-select 
          size="mini"
          class="selectBox"
          style="width:100px;"
          v-model="selectValue"
          placeholder="检索历史">
          <el-option
            v-for="(item, index) in allCondition"
            :key="item.value"
            :label="item.label + (index + 1)"
            :value="item.value"
            @click.native="onChange(item.data)"
          >
            <span style="float:left">{{item.label + (index + 1)}}</span>
            <span style="float:right" @click.stop="deleteOption(index)">
              <i class="el-icon-circle-close"></i>
            </span>
          </el-option>
        </el-select>
        <button 
          id="awayBtn" 
          type="button" 
          class="btn btn-default btn-reset" 
          @click="away" 
          v-if="isTreeView" 
          style="margin-left: 10px;">{{$t('retracting')}}</button>
        <button 
          id="saveFormat" 
          type="button" 
          class="btn btn-default btn-reset"  
          @click="dialogVisible = true" 
          style="margin-left:10px;">保存格式</button>
      </div>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%">
      <div>
        <el-input v-model="searchName" placeholder="请重新命名">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveFormat">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "form-searchform",
  props: [
    "appId", 
    "viewId",
    "chartType", 
    "isTreeView",
    "openParams",
    "commonFilterCondition"
  ], // isTreeView: 是否显示收起按钮

  provide () {
    return {
      findField: this.findField,
      buildFormData: this.buildFormData,
    }
  },

  created() {
    this.initSearchForm({
      appId: this.appId,
      viewId: this.viewId
    });
  },

  mounted()  {
    let list = JSON.parse(localStorage.getItem("searchConditionArray") || '{}');
    if(this.openParams) {
      let id = this.openParams.actionContent
      this.allCondition = list[id]
    }
  },

  data: function() {
    return {
      formdata: undefined,
      allCondition:[],
      selectValue:'',
      dialogVisible: false,
      searchName:'',
    };
  },

  methods: {
    deleteOption(index){
      this.allCondition.splice(index, 1)
      let list = JSON.parse(localStorage.getItem("searchConditionArray") || '{}')
      let allCondition = this.allCondition
      let id = this.openParams.actionContent
      if(allCondition.length <=0 ) {
        delete list[id]
      }else {
        list[id] = allCondition
      }
      localStorage.setItem("searchConditionArray", JSON.stringify(list))
      this.saveViewSettings(list)
    },

    onChange(params){
      let fields = this.formdata.fields
      params.forEach(el => {
        fields.forEach(ele => {
          if(el.divId == ele.divId) {
            ele.value = el.value
          }
        })
      })
    },

    saveViewSettings(list){
      let columnslist = JSON.parse(localStorage.getItem("columnsArray") || '[]'); //缓存列隐藏
      let listFixed = JSON.parse(localStorage.getItem("columnsFixedArray") || '[]');
      let colList = JSON.parse(localStorage.getItem("columnsWidthArray") || '[]'); //列宽
      let viewSettingData = {
        hiddenColumns: columnslist,
        fixedColumns: listFixed,
        columnsWidth: colList,
        searchCondition: list
      }
      this.$api.saveViewSettings(
        viewSettingData,
        {
          onSucess: () => {}
        }
      )
    },

    saveFormat(){
      if(!this.searchName) {
        this.$message({
          message: '不能为空',
          type: 'warning'
        });
        return
      }else {
        let list = JSON.parse(localStorage.getItem("searchConditionArray") || '{}')
        list = list || {}
        let id = this.openParams.actionContent
        let arr = []
        let fields = this.formdata.fields
        let allCondition = []
        let allObj = {}
        if(fields && fields.length > 0) {
          fields.forEach(field => {
            let obj = {}
            if(field.value) {
              obj.divId = field.divId
              obj.value = field.value
              arr.push(obj)
            }
          })
        }
        if(arr && arr.length > 0) {
          allObj.value = new Date().getTime();
          allObj.label = this.searchName 
          allObj.data = arr
          allCondition.push(allObj)
          if(list[id]) {
            list[id].push(allObj)
          }else {
            list[id] = allCondition
          }
          this.allCondition = list[id]
          this.dialogVisible = false
          localStorage.setItem("searchConditionArray", JSON.stringify(list))
          this.saveViewSettings(list)
        }
      }
    },

    getAllFields(){return this.formdata.fields;},

    findField(id) {
      let data = this.formdata
      for (let i = 0; i < data.fields.length; i++) {
        let fld = data.fields[i];
        if (id == fld.id) return fld;
      }
      return this.formdata;
    },

    form(data) {
      let that = this;
      if (data) {
        return {
          methods: {
            findField: that.findField,
            // findField(id) {
            //   for (let i = 0; i < data.fields.length; i++) {
            //     let fld = data.fields[i];
            //     if (id == fld.id) return fld;
            //   }
            //   return null;
            // },
            refresh: this.refresh,
            getAllFields: this.getAllFields,
          },
          template: "<div>" + data.template + "</div>"
        };
      } else
        return {
          template: "<div></div>"
        };
    },

    initSearchForm({ appId, viewId }) {
      let ct = this.chartType
      if(ct && ct == 'report') { //报表的查询判断
        this.$api.reportSearchformtemplate(
          appId,
          viewId,
          {
            onSucess: res => {
              let formdata = res.data.data;
              this.formdata = formdata;
              
              if(formdata.fields && formdata.fields.length > 0) {
                this.$emit('event', true)
              }else {
                this.$emit('event', false)
              }
            }
          }
        )
      }else if(ct && ct == 'chart'){ //图表
        this.$api.chartSearchformtemplate(
          appId,
          viewId,
          {
            onSucess: res => {
              let formdata = res.data.data;
              this.formdata = formdata;
              if(formdata.fields && formdata.fields.length > 0) {
                this.$emit('event', true)
              }else {
                this.$emit('event', false)
              }
            }
          }
        )
      }else {
        let urlParams = '';
        let obj = {};
        if(this.openParams) {
          urlParams = this.openParams.urlParams; //跳转按钮携带的参数
          obj = {
            parentId: this.openParams.parentId ? this.openParams.parentId : '',
            isRelate: this.openParams.isRelate ? this.openParams.isRelate : '',
          }
        }
        if(urlParams) {
          let fp = urlParams.replace(/^(\s|&)+|(\s|&)+$/g, '');
          let list = fp.split("&");
          for (let i = 0; i < list.length; i++) {
            let p = list[i].split("=");
            if(p[1]) {
              obj[p[0]] = p[1];
            }
          }
        }
        this.$api.getSearchFormTemplate(appId, viewId, obj, {
          onSucess: response => {
            if (response.data.data) {
              let fd = response.data.data;
              fd = response.data.data;
              
              if(fd.fields) {
                fd.fields.forEach(el => {
                  if(el.formField == "ViewDialogField") { //如果是视图选择框，并且是查询表单，不要传parentId
                    el.isSearchForm = true;
                  }
                })
              }
              fd.formId = response.data.data.fields[0].formId; //可能不行，但没时间，先这样
              fd.docId = response.data.data.fields[0].docId;
              if(this.commonFilterCondition) {
                let searchFilter = eval(this.commonFilterCondition);
                for(let i=0; i<searchFilter.length; i++) {
                  for(let j=0; j<fd.fields.length; j++) {
                    if(searchFilter[i].field === fd.fields[j].name) {
                      fd.fields[j].isFrequentlySearch = true;
                    }
                  }
                }
              }
              this.formdata = fd;
              let doc = fd.document.items;
              this.$emit("setSearchDocument",doc)
            }
          }
        });
      }
    },

    refresh(fId) {
      let fieldId = '';
      if(fId.id) {
        fieldId = fId.id;
      }else {
        fieldId = fId;
      }
      //刷新方法
      let fd = this.buildFormData();
      let data = {
        document: fd,
        formId: this.formdata.formId,
        docId: fd.id,
        parentId: "",
        templateForm: "",
        viewId: "",
        applicationId: fd.applicationId,
        id: fd.id
      };
      API.refreshForm(fieldId, data, {
        onSucess: response => {
          let fields = response.data.data;
          let keys = Object.keys(fields);
          keys.forEach(key => {
            let field = fields[key];
            this.formdata.fields.forEach((f, i) => {
              if (field.id == f.id) {
                // console.log("this.formdata.fields--->",this.formdata.fields[i])
                this.formdata.fields[i].value = field.value;//只能更新value，而不能简单做对象替换，field.value绑定在组件v-model上，如果直接替换只是数组内存指针简单变更
                this.formdata.fields[i].options = field.options;
                this.formdata.fields[i].tabs = field.tabs;
                //如果为选择类型field，则options也要在这里替换.....
                this.formdata.fields[i].displayType = field.displayType;
                if(field.formField == "DepartmentField") { //这个会把部门选择框的值去除掉，后果未知，先这样
                  if(this.formdata.fields[i].value && this.formdata.fields[i].options.length <= 0) {
                    this.formdata.fields[i].value = '';
                  }
                }
              }
            });
          });
          
        }
      });
    },

    searchBtnShow(data) {
      return data && data.template && data.template.length > 0;
    },

    throttle (fn, gapTime) {
      let _this = this
      return function () {
        let _nowTime = +new Date()
        if (_nowTime - _this._lastTime > gapTime || !_this._lastTime) {
          fn()// 函数可以带参数
          _this._lastTime = _nowTime
        }
      }
    },

    handleWheel (e) {
      e.stopPropagation()
      this.throttle(this.pageUpOrDown, 600)(e)
    },

    pageUpOrDown () {     
      let allSelelect = document.getElementsByClassName("el-select-dropdown");
      if(allSelelect) 
        if(allSelelect && allSelelect.length > 0) {
          for(let i=0; i<allSelelect.length; i++) {
            allSelelect[i].style.display = 'none'
          }
        }

        let p = document.getElementsByClassName("select-control") //下拉框
        for(let i=0; i<p.length; i++) {
          p[i].getElementsByClassName("el-input")[0].className = 'el-input el-input--suffix'
          p[i].getElementsByClassName("el-input__icon")[0].className = 'el-select__caret el-input__icon el-icon-arrow-up'
        }

        let p2 = document.getElementsByClassName("dept-select-control") //部门选择框
        for(let i=0; i<p.length; i++) {
          p2[i].getElementsByClassName("el-input")[0].className = 'el-input el-input--suffix'
          p2[i].getElementsByClassName("el-input__icon")[0].className = 'el-select__caret el-input__icon el-icon-arrow-up'
        }
    },

    onSearchClick() {
      let data = this.buildSearchData();
      let searchData = JSON.parse(JSON.stringify(this.buildSearchData()));
      data.appId = this.appId;
      data.viewId = this.viewId;
      this.$emit("onSearch",data, searchData);
      //this.$emit("onSearch", this.buildSearchData());
      if(this.isTreeView){
        this.away()
      }
    },

    reset(isTreeView) {
      if(!isTreeView) { //树形视图不执行
        if(this.$parent.$parent.$parent.executeCommonReset) {
          this.$parent.$parent.$parent.executeCommonReset() //重置时也要把常用的内容清空，执行view_delegate的executeCommonReset
        }
      }
      let fields = this.formdata.fields;
      fields.forEach(item => {
        item.value = "";
		if(item.formField == "UserField" || item.formField == "TreeDepartmentField") {
          item.data = [];
        }
        this.$forceUpdate()
        // if(item.impressionVal) {
        //   //item.impressionVal = '';
        // }
      });
    },

    /**
     * 收起【调用父组件方法】
     */
    away(){
      this.$parent.showSearchPanel = false;
    },

  //  refresh(fieldId) {
  //     //刷新方法
  //     let fd = this. buildSearchData();
  //     let data = {
  //       document: fd,
  //       formId: '',
  //       docId: fd.id,
  //       parentId: "",
  //       templateForm: "",
  //       viewId: "",
  //       applicationId: fd.applicationId,
  //       id: fd.id
  //     };
  //     API.refreshForm(fieldId, data, {
  //       onSucess: response => {
  //         let fields = response.data.data;
  //         let keys = Object.keys(fields);
  //         keys.forEach(key => {
  //           let field = fields[key];
  //           this.formdata.fields.forEach((f, i) => {
  //             if (field.id == f.id) {
  //               this.formdata.fields[i].value = field.value;//只能更新value，而不能简单做对象替换，field.value绑定在组件v-model上，如果直接替换只是数组内存指针简单变更
  //               this.formdata.fields[i].options = field.options;
  //               this.formdata.fields[i].tabs = field.tabs;
  //               //如果为选择类型field，则options也要在这里替换.....
  //               this.formdata.fields[i].displayType = field.displayType;
  //             }
  //           });
  //         });
          
  //       }
  //     });
  //   },

    //按钮事件执行前
    /* actId：参数值为act.id;
    * isOrRefresh：刷新重计算
    * id：
    * activityType：参数值为act.type.
    * withOld：判断是否是保存并新建,
    * act：当前点击的按钮的全部参数
    */
    runBeforeAction(actId, isOrRefresh, id, activityType, withOld, act){
      let appId = this.openParams.appId;
      let formData = "";
      let documentId = "";
      if(this.copyFormData) { //复制文档时存在
        formData = this.buildFormData();//当复制时数据不变，只改变id值
        formData.docId = this.copyFormData.id;
        formData.id = this.copyFormData.id;
        documentId = this.copyFormData.id;
      }else {
        formData = this.buildFormData();
        formData.docId = this.buildFormData().id;
        documentId = this.buildFormData().id;
      }
      let subDocuments = [];
      let versions = '';
      let templateForm = '';
      let subDoc = this.$store.state.subDocuments;
      if(subDoc && subDoc.length > 0) { //判断是否是包含元素网格视图
        subDocuments = subDoc;
        versions = formData.versions;
        delete formData.subDocuments;
        delete formData.versions;
        delete formData.templateForm;
      }else {
        subDocuments = formData.subDocuments;
        versions = formData.versions;
      }
      let document = {
        applicationId: this.openParams.appId,
        formId: formData.formId,
        id: documentId,
        items: formData.items,
        parentId: formData.parentId,
        sign: formData.sign,
        subDocuments: subDocuments,
        versions: versions,
        exparams: {},
        templateForm: templateForm,
      };
      delete formData.items;
      
      formData.document = document;
      formData.viewId = "";
      formData.templateForm = this.openParams.templateForm?this.openParams.templateForm:"";

      if(this.openParams.displayType && this.openParams.displayType == "templateForm") {//如果是模板表单，formId是真实formID，而不是templateForm
        formData.formId  = this.openParams.realformId;
        formData.document.formId = this.openParams.realformId;
      }

      this.parameterObj = formData;
      API.runBeforeActionScript(
        appId, 
        actId,
        formData,
        activityType,
        '', //treedocid
        '', //flowType
        {
        onSucess: response => {
          if(response.data.data){ //如果有数据返回，结束下一步
            let resData = response.data.data;
            let errmsg = response.data.data.content;
            if(!resData.type) { //没有type值，但是有返回数据，把数据放进document
              if(resData.changedField) {
                let items = this.formdata.fields;//formData.document.items;
                let resDataItem = resData.changedField;
                if(resDataItem) {
                  for(let j = 0; j<items.length; j++) {
                    for(let i=0; i<resDataItem.length; i++) {
                      for(let el in resDataItem[i]) {
                        if(items[j].name == el) {
                          formData.document.items[el] = resDataItem[i][el];
                          items[j].value = resDataItem[i][el];
                        }
                      }
                    }
                  }
                }
                switch (activityType) {
                  case 43:
                    break;
                  default:
                    break;
                }
              }
            }else if(resData.type == 1){
              this.$notify.success({
                title: errmsg,
                message: ''
              });
            }else if(resData.type == 32){
              this.$confirm(`${errmsg}`, this.$t('tip'), {
                confirmButtonText: this.$t('msg.confirm'),
                cancelButtonText: this.$t('btns.cancel'),
                type: "warning",
              }).then(() => {
                
              }).catch(() => {});
            }
          }else {
            switch (activityType) {
              case 43: //跳转
                this.jumpType(act);
                break;
              default:
                break;
            }
            if(isOrRefresh) {
              this.refresh(id);
            }
          }
        },
      })
    },

     //跳转
    jumpType(act){
      let name = act.name;
      if(act.jumpMode === 0) {
        let actId = act.targetList.split("|")[0];
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: actId,
          _select:'',
          name,
        };
        let isExternalLink = false;
        switch(act.jumpActOpenType) {
          case 0:
            if(!isExternalLink) {
              params.isCurrentPageOpen = true;
              this.$emit("openNewpage",params)
            }
            break;
          case 1:
            this.isJumpForm = true;
            if(!isExternalLink) {
              params.isPopupLayerDisplay = true; 
              this.jumpParams = params;
              this.jumpPopup = true;
              this.popupLayerType = "VIEW";
            }else {
              this.jumpParams = params;
              this.jumpPopup = true;
            }
            break;
          case 2:
            if(!isExternalLink) {
              this.$emit("add-tab", params);
            }
            break;
          case 3:
            if(!isExternalLink) {
              params.isOpenNewWindow = true; //判断是新窗口打开
              let routeData = this.$router.resolve({
                // name: "form_blank",
                name: 'open',
                query: params,
              });
              window.open(routeData.href, "_blank");
            }
            break;
          case 4:
             
            break;
          default:
            break;
        }
      }else if(act.jumpMode === 1) {
        this.$api.runScript(
          this.openParams.appId, 
          act.id, 
          this.buildFormData().id, 
          'dispatcherUrl',
          '',
          '',
          {
            onSucess: res => {
              if(res.data.errcode === 0) {
                let url = res.data.data;
                let isForm = url.search("form.html") != -1;
                let isView = url.search("view.html") != -1;
                let urlArrayF = url.split("?");
                let urlArray = '';
                if(urlArrayF[1]) {
                  urlArray = urlArrayF[1].split("&");
                }
                this.isJumpForm = isForm;
                this.isJumpView = isView;
                let type = '';
                let isExternalLink = false;
                
                if(isForm) {
                  type = '00';
                }else if(isView) {
                  type = "01"
                }else if (!isForm && !isView) {
                  isExternalLink = true;
                  this.isExternalLink = true; //判断是否是外部链接
                }
                let params = {
                  linkType: type,
                  appId: this.openParams.appId,
                  actionContent: '',
                  name: act.name,
                  _select: '',
                  viewId: "",
                };
                let obj = {};
                if(urlArray && urlArray.length > 0) {
                  for(let i=0; i<urlArray.length; i++) {
                    let val = urlArray[i].split("=");
                    obj[val[0]] = val[1];
                  }
                }
                switch(act.jumpActOpenType) {
                  case 0:
                    if(!isExternalLink) {
                      params = {
                        linkType: type,
                        appId: this.openParams.appId,
                        actionContent: obj.viewId?obj.viewId:obj.formId,
                        name: act.name,
                        _select: '',
                        viewId: "",
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                        isCurrentPageOpen:true,
                      };
                      this.$emit("openNewpage",params)
                    }else {
                      params = {
                        linkType: '103',
                        appId: this.openParams.appId,
                        actionContent: url,
                      };
                      this.$emit("openNewpage",params)
                    }
                    break;
                  case 1:
                    if(!isExternalLink) {
                      params = {
                        linkType: type,
                        appId: this.openParams.appId,
                        actionContent: obj.viewId?obj.viewId:obj.formId,
                        name: act.name,
                        _select: '',
                        viewId: "",
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                        isPopupLayerDisplay: true, //弹出层打开
                      };
                      this.jumpParams = params;
                      this.jumpPopup = true;
                      this.popupLayerType = "VIEW";
                    }else {
                      params = {
                        linkType: '103',
                        appId: this.openParams.appId,
                        actionContent: url,
                        name: act.name,
                        _select: '',
                        viewId: '',
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                      };
                      this.jumpParams = params;
                      this.jumpPopup = true;
                    }
                    break;
                  case 2:
                    if(!isExternalLink) {
                      params = {
                        linkType: type,
                        appId: this.openParams.appId,
                        actionContent: obj.viewId?obj.viewId:obj.formId,
                        name: act.name,
                        _select: '',
                        viewId: "",
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                      };
                      this.$emit("add-tab", params);
                    }else {
                      params = {
                        linkType: '103',
                        appId: this.openParams.appId,
                        actionContent: url,
                        name: act.name,
                        isExternalLink: true, //url是打开opener组件，判断是外链。
                      };
                      this.$emit("add-tab", params);
                    }
                    
                    break;
                  case 3:
                    if(!isExternalLink) {
                      params = {
                        linkType: type,
                        appId: this.openParams.appId,
                        actionContent: obj.viewId?obj.viewId:obj.formId,
                        name: act.name,
                        _select: '',
                        viewId: "",
                        clearTemp: obj.clearTemp?obj.clearTemp:'',
                      };
                      if(isForm) {
                        let routeData = this.$router.resolve({
                          // name: "form_blank",
                          name: 'open',
                          query: params,
                        });
                        window.open(routeData.href, "_blank");
                      }else if(isView) {
                        let routeData = this.$router.resolve({
                          name: "view_blank",
                          query: params
                        });
                        window.open(routeData.href, '_blank');
                      }
                    }else {
                      window.open(url, '_blank');
                    }
                    break;
                  case 4:
                     
                    break;
                  default:
                    break;
                }
              }
            }
          }
        )
      }
      
    },

    buildSearchData() {
      let data = {};
      for (let i = 0; i < this.formdata.fields.length; i++) {
        let fld = this.formdata.fields[i];
        if(fld.formField == "InputField") {
          fld.value = fld.value.trim(); //文本框前后去除空格
        }
        data[fld.name] = fld.value;
      }
      return data;
    },

    buildFormData() {
      let items = {};
      // 判断如果没有值就不执行
      if(this.formdata.fields){
        const loopOpe = fields => {
          for (let i = 0; i < fields.length; i++) {
            let fld = fields[i];
            if (
              fld.name &&
              fld.value != undefined &&
              fld.formField != "ButtonField" && 
              fld.displayType != undefined
            ) {
              if(fld.textType =="hidden" && fld.value) {
                items[fld.name] = fld.value;
              }else if(fld.textType !="hidden"){
                items[fld.name] = fld.value;
              }
            }
            if(fld.tabs && fld.tabs.length>0) {
              fld.tabs.forEach(tab => {
                if(tab.fields) {
                  loopOpe(tab.fields);
                }
              })
            }
          }
        };
        loopOpe(this.formdata.fields)
      }
      return {
        applicationId: this.openParams.appId,
        formId: this.formdata.formId,
        id: this.formdata.docId,
        items: items,
        parentId: "",
        sign: "",
        subDocuments: [],
        versions: "0"
      };
    },
  }
};
</script>
