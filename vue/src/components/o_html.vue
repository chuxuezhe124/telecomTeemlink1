<template>
  <span :id="id" :name="field.name+'_show'" class="component-input-span">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <textarea 
        class="displayn"  
        v-model="field.value">
      </textarea>
     <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div :style="{width:field.width?field.width:'100%'}">
        <!-- <vue-ueditor-wrap
          class="ueditor"
          v-model="field.value"
          :config="myConfig"
          :destroy="true"
        ></vue-ueditor-wrap> -->
        <vue-html5-editor
          :id="id+'_1'"
          :z-index="1001"
          :height="field.height?parseInt(field.height):300" 
          :content="field.value" 
          :name="field.name"
          @blur.native.capture="onChange" 
          @change="updateData">
        </vue-html5-editor>
      </div>
     
    </template>
    <template v-else>
      <!-- 只读（文本模式） -->
        <div :id="field.name+'_show'" class="displayi-b" v-html="field.value"></div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
// import VueUeditorWrap from 'vue-ueditor-wrap' // ES6 Module
import Vue from 'vue'
import VueHtml5Editor from 'vue-html5-editor'

Vue.use(VueHtml5Editor, {
  // 全局组件名称，使用new VueHtml5Editor(options)时该选项无效
  name: "vue-html5-editor",
  // 是否显示模块名称，开启的话会在工具栏的图标后台直接显示名称
  showModuleName: true,
  // 自定义各个图标的class，默认使用的是font-awesome提供的图标
  icons: {
    text: "fa fa-pencil",
    color: "fa fa-paint-brush",
    font: "fa fa-font",
    align: "fa fa-align-justify",
    list: "fa fa-list",
    link: "fa fa-chain",
    unlink: "fa fa-chain-broken",
    tabulation: "fa fa-table",
    image: "fa fa-file-image-o",
    hr: "fa fa-minus",
    eraser: "fa fa-eraser",
    undo: "fa-undo fa",
    "full-screen": "fa fa-arrows-alt",
    info: "fa fa-info"
  },
  // 配置图片模块
  image: {
    // 文件最大体积，单位字节
    sizeLimit: 512 * 1024 * 10,
    // 上传参数,默认把图片转为base64而不上传
    // upload config,default null and convert image to base64
    upload: {
      url: null,
      headers: {},
      params: {},
      fieldName: {}
    },
    // 压缩参数,默认使用localResizeIMG进行压缩,设置为null禁止压缩
    // width和height是文件的最大宽高
    compress: {
      width: 1000,
      height: 600,
      quality: 80
    },
    // 响应数据处理,最终返回图片链接
    uploadHandler(responseText) {
      //      default accept json data like  {ok:false,msg:"unexpected"} or {ok:true,data:"image url"}
      var json = JSON.parse(responseText);
      if (json.status == 200) {
        return json.data;
      } else {
        alert(json.error);
      }
    }
  },
  // 语言，内建的有英文（en-us）和中文（zh-cn）
  language: "zh-cn",
  // 自定义语言
  i18n: {
    "zh-cn": {
      align: "对齐方式",
      image: "图片",
      list: "列表",
      link: "链接",
      unlink: "去除链接",
      table: "表格",
      font: "文字",
      "full screen": "全屏",
      text: "排版",
      eraser: "格式清除",
      info: "关于",
      color: "颜色",
      "please enter a url": "请输入地址",
      "create link": "创建链接",
      bold: "加粗",
      italic: "倾斜",
      underline: "下划线",
      "strike through": "删除线",
      subscript: "下标",
      superscript: "上标",
      heading: "标题",
      "font name": "字体",
      "font size": "文字大小",
      "left justify": "左对齐",
      "center justify": "居中",
      "right justify": "右对齐",
      "ordered list": "有序列表",
      "unordered list": "无序列表",
      "fore color": "前景色",
      "background color": "背景色",
      "row count": "行数",
      "column count": "列数",
      save: "确定",
      upload: "上传",
      progress: "进度",
      unknown: "未知",
      "please wait": "请稍等",
      error: "错误",
      abort: "中断",
      reset: "重置"
    }
  },
  // 隐藏不想要显示出来的模块
  hiddenModules: [],
  // 自定义要显示的模块，并控制顺序
  visibleModules: [
    "text",
    "color",
    "font",
    "align",
    "list",
    "link",
    "unlink",
    "tabulation",
    "image",
    "hr",
    "eraser",
    "undo",
    "full-screen",
    "info",
  ],
  // 扩展模块，具体可以参考examples或查看源码
  // extended modules
  modules: {
    //omit,reference to source code of build-in modules
  }
});

export default {
  name: "o-html",
  props: ["id"],
  components: {
    // VueUeditorWrap
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.height) {
        formData.height = formData.height.split("px")[0];
      }
      return formData;
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let that = this
      document.getElementById(this.id).addEventListener('click', function(e){
        e.stopPropagation
        let allHtml = document.getElementsByClassName("vue-html5-editor")
        for(let i=0; i<allHtml.length; i++) {
          allHtml[i].style.zIndex = 1001
        } 
        if(e.target.innerText.indexOf("全屏") > -1) {
          setTimeout(() => {
            let id = that.id + "_1"
            let targetDom = document.getElementById(id)//childDom[i].getElementsByClassName('vue-html5-editor')
            if(targetDom) {
              if(that.isFullScrenn) {
                targetDom.style.zIndex = 1001
              }else {
                targetDom.style.zIndex = 3000
              }
            }  
          }, 100)        
        }
      })
      let field = this.field;
      if(field.textType == "hidden" || field.displayType == Constant.PermissionType_HIDDEN) {
        if(field.isHideType) {
          let id = this.id,
            formShowType = field.formShowType;
          controlHidden({id, field, formShowType})
        }
      }
    })
  },
  data: function() {
    return { 
      Constant,
      isFullScrenn: false,
      // myConfig: {
      //   // 工具栏
      //   toolbars: [
      //     [
      //       'undo', //撤销
      //       'redo', //重做
      //       'bold', //加粗
      //       'indent', //首行缩进
      //       'italic', //斜体
      //       'underline', //下划线
      //       'strikethrough', //删除线
      //       'formatmatch', //格式刷
      //       'horizontal', //分隔线
      //       'removeformat', //清除格式
      //       'link', //超链接
      //       'unlink', //取消链接
      //       'inserttable', //插入表格
      //       'insertrow', //前插入行
      //       'insertcol', //前插入列
      //       'mergeright', //右合并单元格
      //       'mergedown', //下合并单元格
      //       'deleterow', //删除行
      //       'deletecol', //删除列
      //       'splittorows', //拆分成行
      //       'splittocols', //拆分成列
      //       'splittocells', //完全拆分单元格
      //       'deletecaption', //删除表格标题
      //       'inserttitle', //插入标题
      //       'mergecells', //合并多个单元格
      //       'deletetable', //删除表格
      //       'fontfamily', //字体
      //       'fontsize', //字号
      //       'simpleupload', //单图上传
      //       'emotion', //表情
      //       'justifyleft', //居左对齐
      //       'justifyright', //居右对齐
      //       'justifycenter', //居中对齐
      //       'justifyjustify', //两端对齐
      //       'forecolor', //字体颜色
      //       'backcolor', //背景色
      //       'insertorderedlist', //有序列表
      //       'insertunorderedlist', //无序列表
      //       'lineheight', //行间距
      //       'edittip ', //编辑提示
      //     ],
      //   ],
      //   // 编辑器不自动被内容撑高
      //   autoHeightEnabled: true,
      //   // 初始容器高度
      //   initialFrameHeight: 240,
      //   // 初始容器宽度
      //   initialFrameWidth: '100%',
      //   // 上传文件接口（）
      //   serverUrl: 'http://localhost:8088/obpm/api/runtime/upload',
      //   // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
      //   UEDITOR_HOME_URL:
      //     process.env.NODE_ENV === 'production' ? 'UEditor/' : '/UEditor/',
      // },
    };
  },
  methods: {
    dianji(){
      debugger
    },
    onChange() {
      if (this.field.refreshOnChanged) {//判断是否需要刷新
        this.$parent.refresh(this.id);
      }
    },
    updateData(event){
      //console.log(event);
      this.field.value = event;
    },
  }

};
</script>

<style lang="scss">
  .vue-html5-editor {
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
    text-align: left;
    border-radius: 5px;
    overflow: hidden;
}
</style>