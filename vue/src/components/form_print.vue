<template>
  <div class="form-print-wrap myapps-iframe-box" style="height:auto;">
    <!--:id="'formTemplate_' + formTemplateDocid"-->
     <!--盖章列表-->
    
    <div class="formwrapper form-print" id="form-print">
      <form_signlist 
        v-if="formdata.sign" 
        :signList="formdata.sign" 
      />
      <div class="formcontent" id="printMe">
        <div class="formTable-wrap" v-if="queryData.printType == 14">
          <component 
            name="formPrintTemplate" 
            :is="template" 
            ref="printChild">
          </component>
        </div>
        <div class="formTable-wrap" v-else-if="queryData.printType == 30">
          <iframe
            ref="mainFrame"
            style="border:none"
            width="100%"
            :height="windowHeight"
            frameborder="0"
            allowtransparency="true" 
            noresize="noresize"
            :src="currentUrl"
          ></iframe>
        </div>
      </div>
    </div>
    <div class="print-btn">
      <div class="page-con">
        <!-- <el-button
          class="btn" 
          v-print="'#printMe'" 
          size="medium"
          type="primary"
          >{{$t('report.print')}}</el-button> -->
          <div @click="printView" class="btn no-print" >
            {{$t('report.print')}}
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import Watermark from '@/assets/js/watermark';
import form_signlist from "@/expandedComponents/form_sign_list.vue";
export default {
  props: [
    "printParams",
    "printData"
  ],
  components: {
    form_signlist
  },
  data: function() {
    return {
      formdata: '',
      formTemplateDocid:'',
      queryData:'',
      currentUrl:'',
      windowHeight: 0
    };
  },
  created: function() {
    let queryData = this.$route.query;
    this.queryData = queryData;
    if(queryData.printType == 14) {
      this.initForm({
        appId: queryData.appId,
        formId: queryData.formId,
        docId: queryData.docId,
      });
    }else if(queryData.printType == 30) {
      let id = queryData.onActionPrint;
      let docId = queryData.docId;
      this.$api.getPrintCustomreports(
        id,
        docId,
        {
          onSucess: response => {
            let url = response.data;
            this.currentUrl = obpmConfig.obpmFilePath + url;
          }
        }
      );
    }
    //打印页面给body增加高度自适应，方便打印分页
    let docbody = document.body || document.getElementsByTagName('body')[0];
    docbody.style.miHeight = "100%";
    this.windowHeight = document.documentElement.clientHeight -26;
    // docbody.style.height = "auto";
  },
  mounted(){
  },
  computed: {
    template() {
      let data = this.formdata;
      if (data && data.formTemplate) {//打印添加样式库
        if(data && data.style && data.style.content) {
          let css = data.style.content;
          let head = document.head || document.getElementsByTagName('head')[0];
          let style = document.createElement('style');
          head.appendChild(style);
          style.type = 'text/css';
          style.appendChild(document.createTextNode(css));
        }
        return {
          methods: {
            findField: this.findField,
          },
          template: "<div class='form-template-wrap formHtml'>" + data.formTemplate.template + "</div>"
        };
      } else {
        return {
          template: "<div>" + data + "</div>"
        };
      }
    }
  },
  
  methods: {
    printView() {
      if(this.queryData.printType == 30){
        this.$refs.mainFrame.contentWindow.print()
      }else{
        window.print();
      }
    },
    
    findField(id) {
      let data = this.formdata;
      for (let i = 0; i < data.fields.length; i++) {
        let fld = data.fields[i];
        fld.docId =  this.$route.query.docId;
        if (id == fld.id) return fld;
      }
      //TODO:临时处理隐藏字段--Jarod
      return {
        id: id,
        displayType: Constant.PermissionType_HIDDEN,
        hiddenValue: ""
      };
    },
    
    initForm({ appId, formId, docId }) {
      this.$api.getPrintForm(
        appId,
        formId,
        docId,
        {
          onSucess: res => {
            this.formTemplateDocid = docId.replace(/_/g, "");
            let formdata = res.data.data;
            this.formdata = formdata;
            formdata.fields.forEach(field => {
              if(field.displayType !=3 ) {
                field.displayType = 5;
              }else {
                field.isPrint = true; //当是隐藏并且有隐藏值时，但又有打印时显示隐藏值时，判断是打印页面
              }
            });
            if(res.data.data.waterMarkText) {
              this.$nextTick(()=>{
                let str = docId.replace(/_/g, "");
                let id = 'formTemplate_' + str;
                Watermark.set(res.data.data.waterMarkText, 'form-print');
              })
            }
          }
        }
      );
    },
  },
}
</script>

<style lang="scss">

</style>