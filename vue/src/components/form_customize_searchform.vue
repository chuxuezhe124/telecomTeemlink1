<template>
  <div id="searchFormTableCustomize" class="displayn" style="display: block;">
    <!-- 输出查询表单HTML -->
    <div class="searchDiv" id="searchFormPanel">
      <component name="searchform" class="searchform" :is="form(formdata)"></component>
      <div class="searchBtn-btn"  @click="onSearchClick">
        <!-- <span class="searchBtn"  @click="onSearchClick"> -->
          {{$t('btns.query')}}
        <!-- </span> -->
      </div>
    </div>
  </div>
</template>


<script>
import API from "@/api.js";
export default {
  name: "form-searchform",
  props: [
    "appId", 
    "viewId", 
    "commonFilterCondition",
    "openParams"
  ],
  created: function() {
    this.initSearchForm({
      appId: this.appId,
      viewId: this.viewId
    });
  },

  data: function() {
    return {
      formdata: undefined,
    };
  },

  methods: {
    form(data) {
      let mobileTmpl = "";
      if (data) {
        if (data && data.fields) {
          data.fields.forEach(field => {
            let fieldTag = "";
            switch (field.formField) {
              case "InputField":
                fieldTag = "o-input";
                break;
              case "TextareaField":
                fieldTag = "o-textarea";
                break;
              case "RadioField":
                fieldTag = "o-radio";
                break;
              case "SelectField":
                fieldTag = "o-select";
                break;
              case "ImageUploadField":
                fieldTag = "o-image-upload";
                break;
              case "AttachmentUploadField":
                fieldTag = "o-file-upload";
                break;
              case "DateField":
                fieldTag = "o-date-picker";
                break;
              case "IncludeField":
                fieldTag = "o-include";
                break;
              case "CheckboxField":
                fieldTag = "o-checkbox";
                break;
              case "MapField":
                fieldTag = "o-map";
                break;
              case "QRCodeField":
                fieldTag = "o-qrcode";
                break;
              case "CalctextField":
                fieldTag = "o-calctext";
                break;
              case "UserField":
                fieldTag = "o-user-select";
                break;
              case "DepartmentField":
                fieldTag = "o-dept-select";
                break;
              case "TreeDepartmentField":
                fieldTag = "o-dept-tree-select";
                break;
              case "SuggestField":
                fieldTag = "o-suggest";
                break;
              default:
                break;
            }
            let isSearchForm = true;
            if (fieldTag != "")
              mobileTmpl += `<${fieldTag} id='${field.id}' isSearchForm='${isSearchForm}'></${fieldTag}>`;
          });
        }
        return {
          methods: {
            findField(id) {
              for (let i = 0; i < data.fields.length; i++) {
                let fld = data.fields[i];
                if (id == fld.id) return fld;
              }
              return {
                id:id,
              }
              //return null;
            },
            getAllFields(){
              return data.fields;
            },
          },
          template: "<div>" + mobileTmpl + "</div>"
        };
      } else
        return {
          template: "<div></div>"
        };
    },

    refresh(){

    },

    initSearchForm({ appId, viewId }) {
      let obj = {
        parentId: this.openParams.parentId ? this.openParams.parentId : '',
        isRelate: this.openParams.isRelate ? this.openParams.isRelate : '',
      };
      let queryString = this.openParams.queryString;
      if(queryString) {
        let qs = queryString;
        let list = qs.split("&");
        for (let i = 0; i < list.length; i++) {
          let p = list[i].split("=");
          if(p[1]) {
            obj[p[0]] = p[1];
          }
        }
      }
      let urlParams = this.openParams.urlParams; //跳转按钮携带的参数
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
      API.getSearchFormTemplate(appId, viewId, obj, {
        onSucess: response => {
          if (response.data.data) {
            let formdata = response.data.data;
            let arr = [];
            if(formdata.fields && formdata.fields.length > 0) {
              if(this.commonFilterCondition) {
                // let searchFilter = JSON.parse(JSON.stringify(this.commonFilterCondition));
                let searchFilter = eval(this.commonFilterCondition);
                for(let i=0; i<searchFilter.length; i++) {
                  for(let j=0; j<formdata.fields.length; j++) {
                    if(searchFilter[i].field === formdata.fields[j].name) {
                      formdata.fields[j].isFrequentlySearch = true;
                      arr.push(formdata.fields[j]);
                    }
                  }
                }
              }
            } 
            formdata.fields = arr;
            this.formdata = formdata;
          }
        }
      });
    },

    searchBtnShow(data) {
      return data && data.template && data.template.length > 0;
    },
    
    onSearchClick() {
      let data = this.buildSearchData();
      let searchData = JSON.parse(JSON.stringify(this.buildSearchData()));
      data.appId = this.appId;
      data.viewId = this.viewId;
      this.$emit("onSearch",data, searchData);
      //this.$emit("onSearch", this.buildSearchData());
    },

    //常用查询的重置
    commonReset() {
      let fields = this.formdata.fields
      fields.forEach( item => {
        item.value = '';
        this.$forceUpdate();
      })
    },

    reset() {
      let fields = this.formdata.fields;
      fields.forEach(item => {
        item.value = "";
        // if(item.impressionVal) {
        //   //item.impressionVal = '';
        // }
      });
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
    }
  }
};
</script>
