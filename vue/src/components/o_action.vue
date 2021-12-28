<template>
  <span class="actionClass" :title="title" style="display:inline-block;">
    <div @click.stop="jumpTo">
      <slot></slot>
    </div>
    
    <el-dialog :title="$t('tip')" v-if="dialogVisible" :visible.sync="dialogVisible" :before-close="handleClose">
      <form_normalform
        :openParams="params" 
      />
    </el-dialog>
  </span>
</template>

<script>
import form_normalform from "@/components/form_normalform.vue";
export default {
  name: "o-action",
  components: {
    form_normalform,
  },

  // inject: [
  //   'calctextJump'
  // ],

  props: [
    "action-type", 
    "formid",
    "formId",
    "viewId",
    "viewid",
    "appId",
    "appid",
    "open-type",
    "data-val",
    "docId",
    "docid",
    "title",
    "url",
    "exparams",
    "isRefresh",
    "dialog-width",
    "dialog-height"
  ],

  computed: {
    
  },
  
  methods: {
    handleClose(done) {
      done();
    },
    jumpTo() {
      console.log(this.dialogWidth)
      let formId = this.formId || this.formid;
      let docId = this.docId || this.docid;
      let _ep = this.exparams;
      switch (this.actionType) {
          case "opendocument":
            //  open_present当前页打开  open_eject弹出层打开 open_tab标签页打开 open_blank新窗口打开
            if (this.openType == "open-eject" || this.openType == "dialog") {
              let params = {
                linkType: "00",
                appId: this.$root.appid,
                actionContent: formId,
                _select: docId,
                type: 277,
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              if(this.isRefresh == 'true') {
                params.isRefresh = true
              }
              // this.calctextJump(this.openType, params, 'opendocument')
              let styleParams = {
                dialogWidth: this.dialogWidth,
                dialogHeight: this.dialogHeight
              }
              this.$parent.calctextJump(this.openType, params, 'opendocument', styleParams);
            }else if (this.openType == "open-present") {
              let params = {
                linkType: "00",
                appId: this.$root.appid,
                actionContent: formId,
                _select: docId,
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              if(this.isRefresh == 'true') {
                params.isRefresh = true
              }
              this.$parent.calctextJump(this.openType, params,'opendocument');
            }else if (this.openType == "open-blank"){
              let params = {
                linkType: "00",
                appId: this.$root.appid,
                actionContent: formId,
                _select: docId,
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              if(this.isRefresh == 'true') {
                params.isRefresh = true
              }
              this.$parent.calctextJump(this.openType, params, 'opendocument');
            }else {//默认用tab方式打开
              let params = {
                linkType: "00",
                appId: this.$root.appid,
                actionContent: formId,
                _select: docId,
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              if(this.isRefresh == 'true') {
                params.isRefresh = true
              }
              this.$parent.calctextJump(this.openType, params, 'opendocument');
            }
            break;
          case "viewselect":
            break;
          case "openview": //打开视图
            if (this.openType == "open-eject" || this.openType == "dialog") {
              let params = {
                linkType: "01",
                appId: this.$root.appid,
                actionContent: this.viewid?this.viewid:this.viewId,
                _select: '',
                title: this.title,
                type: 277,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              this.$parent.calctextJump(this.openType, params, "openview");
            }else if (this.openType == "open-present") {
              let params = {
                linkType: "01",
                appId: this.$root.appid,
                actionContent: this.viewid?this.viewid:this.viewId,
                _select: '',
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              this.$parent.calctextJump(this.openType, params, "openview");
            }else if (this.openType == "open-blank"){
              let params = {
                linkType: "01",
                appId: this.$root.appid,
                actionContent: this.viewid?this.viewid:this.viewId,
                _select: '',
                title: this.title,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              this.$parent.calctextJump(this.openType, params, "openview");
            }else {//默认用tab方式打开
              let oActionName = this.$el.title ? this.$el.title : this.$el.textContent;  //widget类型设置计算脚本值，使用o-action跳转，tab没有name属性,所以tab没有标题
              let params = {
                linkType: "01",
                appId: this.$root.appid,
                actionContent: this.viewid?this.viewid:this.viewId,
                _select: '',
                title: this.title,
                name: oActionName,
              };
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              this.$parent.calctextJump(this.openType, params, "openview");
            }
            break;
          case "jumpto": //跳转
            if(this.url){
              let params = {
                linkType: "103",
                appId: this.$root.appid,
                actionContent: this.url,
                _select: '',
                title: this.title,
              };
              //url如果是连接到报表，是用good的写法，此处先兼容good,
              //后期一定要改成vue的写法，此处参数分别涉及到api.js(getCustomreports)和组件report.vue(getReport)
              if(params.actionContent.indexOf("report.html") > -1) {
                let url = params.actionContent
                let urlArrayF = url.split("?")
                let urlArray = ''
                let par = {}
                if(urlArrayF[1]) {
                  urlArray = urlArrayF[1].split("&");
                  urlArray.forEach(el => {
                    let arr = el.split("=")
                    par[arr[0]] = arr[1]
                  });
                }
                if(par.applicationId) {
                  params.appId = par.applicationId
                }
                if(par.reportId) {
                  params.actionContent = par.reportId
                }
                if(par.orderId){
                  params.orderId = par.orderId;
                }
                params.linkType = '09' 
              }
              if(_ep) {
                params.exparams = _ep//encodeURI(_ep);
              }
              this.$parent.calctextJump(this.openType, params, "jumpto");
            }
            break;
      }
    }
  },
  data: function() {
    return { 
      dialogVisible:false,
      params:'',
    };
  }
};
</script>
