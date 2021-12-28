<template>
  <div>
    <div class="content" v-if="isJump">
      <component :is="template(field.value)"></component>
    </div>
    <div class="content" v-else>
      <div 
        :id="id" 
        :name="field.name+'_show'"  
        class="component-input-span"  
        v-append="setValue(field.value)">
      </div>
    </div>
  </div>
</template>

<script>
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-calctext",
  props: ["id"],
  computed: {
    field: function() {
      let data = this.$parent.findField(this.id);
      this.jumpToNewpage(data);
      return this.$parent.findField(this.id);
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  data: function() {
    return {
      isJump:false,
    };
  },

  methods: {
    setValue(value) {
      if(value.indexOf("pdfviewer.html") > -1) {
        let statiContextPath = obpmConfig.statiContextPath;
        if(statiContextPath) { //5.0 trunk
          sessionStorage.setItem("isTrunk", true);
        }else { //4.4 stable
          sessionStorage.setItem("isTrunk", false);
        }
        return value;
      }else if(value.indexOf("viewer.html") > -1) { //金格签章
        let myProfile = this.$store.state.myProfile;
        let loginNo = myProfile?myProfile.loginNo:'';
        sessionStorage.setItem("loginNo", loginNo);
        let path = value.split("?");
        let pathR = path[1];
        let url = '';
        let statiContextPath = obpmConfig.statiContextPath;
        if(statiContextPath) { //5.0 trunk
          url = "<iframe src=" + '"' + obpmConfig.statiContextPath + "/portal/vue/iwebapp/pdfjs/viewer.html?contextPath=" + pathR;
        }else { //4.4 stable
          url = "<iframe src=" + '"' + obpmConfig.obpmFilePath + "/portal/vue/iwebapp/pdfjs/viewer.html?contextPath=" + pathR;
        }
        return url
      }else {
        return value;
      }
    },

    getdocid() {
      return this.field.docId;
    },

    template(val) {
      return {
        methods: {
          calctextJump: this.calctextJump,
        },
        template: "<div>"+val+"</div>"
      };
    },

    //o-action跳转
    calctextJump(openType, params, jumpType, styleParams) {
      let field = this.field
      if(field.isWidgetLink) {
        window.parent.handleOpenTab(params);
      }else {
        let havePar = false;
        let par = "";
        while(!havePar) {
          par = par + '.$parent';
          let url = 'this' + par + '.scriptJump';
          if(eval(url)) {
            let arr = [];
            arr.push(params);
            let json = JSON.stringify(arr);
            let stylePar = JSON.stringify(styleParams);
            let path = url + '(' + ("'" + openType + "'" + "," + "'" + json + "'" + "," + "'" + jumpType + "'" + "," + "'" + stylePar + "'" ) + ')';
            eval(path);
            break
          }
        }
      }
      // this.$parent.scriptJump(openType, params, jumpType);
    },

    jumpToNewpage(data) {
      if(data.value) {
        if(data.value.search("o-action") != -1) {
          this.isJump = true;
        }else {
          this.isJump = false;
        }
      } 
    }
  }
};
</script>