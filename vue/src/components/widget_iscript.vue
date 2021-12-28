<template>
  <!--首页流程处理的组件-->
  <div class="widget-iscript" :style="{'height':iscript.wgtData.height?iscript.wgtData.height+'px':'','width':'100%'}" v-if="showIscript">
    <div 
      style="width:100%;"
      :style="{background:iscript.wgtData.titleBarColor}"
      class="clearfix" 
      @mouseenter="CardShow"
      @mouseleave="CardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="iscript.wgtData.icon && iscript.wgtData.icon.icontype == 'img'">
          <img :src="contextPath +'/'+iscript.wgtData.icon.icon" alt="">
        </span>
        <i v-if="iscript.wgtData.icon && iscript.wgtData.icon.icontype == 'font'" :class="iscript.wgtData.icon.icon" :style="{color:iscript.wgtData.icon.iconFontColor}"></i>
        <span :style="{color:iscript.wgtData.titleColor,background:iscript.wgtData.titleBColor}">{{iscript.wgtData.name}}</span>
      </div>
      <div class="btn">
        <div>
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
          <!-- <i class="el-icon-d-caret" v-show="conceal"></i> -->
          <!-- <i class="el-icon-close" v-show="conceal" @click="dele"></i> -->
        </div>
      </div>
    </div>
    <div class="iscript-content" style="width:100%;padding:10px;">
      <div class="iscript-list" style="width:100%;overflow:hidden;" @click.stop>
        <!-- <span ref="htstr" v-html="iscript.scriptLink"></span> -->
        <div style="width:100%;" v-if="isAction">
          <!-- <div style="width:100%;" v-html="htmlA"></div> -->
          <component :is="template(htmlA)"></component>
        </div>
        <div style="width:100%;" v-else>
          <div style="width:100%;" v-append="htmlA"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Constant from "@/Constant.js";
import $ from 'jquery';
//import API from "@/api.js";
export default {
  name: "widget-iscript",
  props: ["iscript","scriptLink"],
  inject: ["reload"],
  created() {
    this.getIscript();
  },
  computed:{
    iscriptRefresh(){
      return this.$store.state.iscriptNum;
    }
  },
  watch:{
    iscriptRefresh(){
      if(this.iscript.wgtData.isRefresh){
        this.getIscript();
      }
    }
  },
  mounted(){
  },
  data: function() {
    return {
      Constant,
      htmlA:'',
      conceal: false,
      showIscript:true,
      isAction: false,
      contextPath:obpmConfig.obpmFilePath,
    };
  },
  methods: {
    getIscript(){
      this.$api.getWidgetsIscript(this.iscript.wgtData.id,
      {
        onSucess: res => {
          let data = res.data.data;
          if(data.indexOf("o-action") > -1) {
            this.isAction = true;
          }else {
            this.isAction = false;
          }
          this.htmlA = res.data.data;
        }
      }
    );
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
    calctextJump(openType, params, jumpType) {
      let havePar = false;
      let par = "";
      while(!havePar) {
        par = par + '.$parent';
        let url = 'this' + par + '.scriptJump';
        if(eval(url)) {
          let arr = [];
          arr.push(params);
          let json = JSON.stringify(arr);
          let path = url + '(' + ("'" + openType + "'" + "," + "'" + json + "'" + "," + "'" + jumpType + "'" ) + ')';
          eval(path);
          break
        }
      }
      // this.$parent.$parent.$parent.$parent.$parent.$parent.scriptJump(openType, params, jumpType); //暂时先这样写了
    },
    dianji(){
      console.log($().jquery)
      // var css = '.obpm-custom  { background: red;}',
      // head = document.head || document.getElementsByTagName('head')[0],
      // style = document.createElement('style');
      // head.appendChild(style);
      // style.type = 'text/css';
      // style.appendChild(document.createTextNode(css));
      

    },
    dele(){
      this.showIscript = false;
    },
    CardShow() {
      this.conceal = true;
    },
    CardNone() {
      this.conceal = false;
    },
    //流程处理的局部刷新
    Partialrefresh() {
      // this.reload();
      this.getIscript();
    },
  },
  filters: {
      formHtml: function (value) {
        let val = value.replace(/^\"|\"$/g,'');
        return val;
      }
    }
  
};
</script>
