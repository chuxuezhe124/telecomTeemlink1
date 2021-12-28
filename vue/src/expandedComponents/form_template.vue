<template>
  <div id="searchFormTable" class="displayn" style="display:block;width:100%;height:100%;">
    <!-- 输出查询表单HTML -->
    <div class="searchDiv" id="searchFormPanel" style="height:calc(100% - 40px)">
      <component name="searchform" :is="form(formdata)"></component>
    </div>
    <div class="row" >
      <div class="col-xs-12 text-center">
        <button id="searchBtn" type="button" class="btn btn-primary" @click="onSubmit">{{$t('btns.sure')}}</button>
        <button id="restBtn" type="button" class="btn btn-default btn-reset" @click="onCancel" style="margin-left:10px;">{{$t('btns.cancel')}}</button>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "form-searchform",
  props: ["openParams"],
  created: function() {
    this.initForm({
      appId: this.openParams.appId,
      formId: this.openParams.actionContent,
      docId: this.openParams._select,
    });
  },

  data: function() {
    return {
      formdata: undefined,
    };
  },

  methods: {
    form(data) {
      if (data) {
        return {
          methods: {
            findField(id) {
              for (let i = 0; i < data.fields.length; i++) {
                let fld = data.fields[i];
                if (id == fld.id) return fld;
              }
              return null;
            }
          },
          template: "<div>" + data.formTemplate.template + "</div>"
        };
      } else
        return {
          template: "<div></div>"
        };
    },

    getAllFields(){return this.formdata.fields;},

    initForm({ appId, formId, docId }) {
        let obj = {
          appId: this.openParams.appId,
					formId: this.openParams.actionContent,
          _: new Date().getTime(),
				};
        API.getDocumentEmpty(
          appId,
          formId,
          obj,
          {
            onSucess: response => {
              if (response.data.data) {
                let docId = response.data.data.id;
                if(this.openParams.relatedFormId) { //获取的是模板表单
                  let obj = {
                    appId: this.openParams.appId,
                    formId: this.openParams.relatedFormId,
                    docid: docId,
                    templateForm: true,
                    _: new Date().getTime(),
                  }
                  API.getForm(
                    appId,
                    this.openParams.relatedFormId,
                    docId,
                    obj,
                    {
                      onSucess: res => {
                        this.formdata = res.data.data;
                        this.formdata.formId = formId;
                        this.formdata.docId = response.data.data.id; //docId,一直拿新页面的docId;
                      }
                    }
                  );
                }else {
                  API.getForm(
                    appId,
                    formId,
                    docId,
                    {},
                    {
                      onSucess: res => {
                        this.formdata = res.data.data;
                        this.formdata.formId = formId;
                        this.formdata.docId = response.data.data.id; //docId,一直拿新页面的docId;
                      }
                    }
                  );
                }
              }
            }
          }
        );
    },

    onSubmit(){
      let buildFormData = this.buildFormData();
      buildFormData.formId = this.openParams.relatedFormId;
      let data = {
        applicationId: this.openParams.appId,
        docId: buildFormData.id,
        document: buildFormData,
        formId: buildFormData.formId,
        id: buildFormData.id,
        parentId: "",
        templateForm: "",
        viewId: "",
      }

      let params = {
        docId: buildFormData.docId,
        viewId: buildFormData.viewId ? buildFormData.viewId:'',
        formId: buildFormData.formId,
        _templateForm: buildFormData.templateForm ? buildFormData.templateForm:'', 
        parentId: buildFormData.parentId ? buildFormData.parentId:'',
      };

      this.$api.executeCustom(
        this.$api.appid, 
        buildFormData.id, 
        data,
        params,
        {
          onSucess: res => {
            if(res.data.errcode === 0) {
              this.$emit("event")
              this.$notify({
                title: this.$t('success'),
                message: '',
                type: 'success'
              });
            }
          }
        }
      )

    },

    onCancel(){

    },
    
    searchBtnShow(data) {
      return data && data.template && data.template.length > 0;
    },

    buildFormData() {
      let items = {};
      for (let i = 0; i < this.formdata.fields.length; i++) {
        let fld = this.formdata.fields[i];
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
