<template>
  <div class="newKnowledgeHTML">
    <el-row>
      <el-col :span="24">
        <div class="steps-content">
          <el-steps :active="activeId" finish-status="success" align-center>
            <el-step :title="$t('btns.create_maintain')"></el-step>
            <el-step :title="$t('btns.indicators')"></el-step>
            <el-step :title="$t('btns.edit')"></el-step>
            <el-step :title="$t('btns.audit')"></el-step>
            <el-step :title="$t('btns.review_approval')"></el-step>
            <el-step :title="$t('title.published')"></el-step>
          </el-steps>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="file-content">
          <h4></h4>
          <div class="ant-row">
            <div class="ant-col-24 rightGrid" style="padding-left: 16px; padding-right: 16px;">
              <template>
                <el-input 
                  ref="controlTitle"
                  type="text" 
                  class="ant-input form-control title" 
                  :placeholder="$t('E_title')" 
                  value=""
                  v-model="titleControl"></el-input>
              </template>
            </div>
          </div>
          <div class="htmlEditor">
            <vue-ueditor-wrap
              :config="myConfig" 
              v-model="content"
            ></vue-ueditor-wrap>
            <!-- <vue-html5-editor :content="content" :height="500" @change="updateData"></vue-html5-editor> -->
          </div> 
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "newKnowledgeHTML",
  props:[
    "getFiledData",
    "personDataKnowledge"
  ],
  data() {
    return {
      content: '',    //富文本编辑器内容
      titleControl: '',   //标题
      activeId: 1,        //步奏
      status: 'initiate',         //状态值
      myConfig: {
        // 工具栏
        toolbars: [
          [
            "undo", //撤销
            "redo", //重做
            "bold", //加粗
            "indent", //首行缩进
            "italic", //斜体
            "underline", //下划线
            "strikethrough", //删除线
            "formatmatch", //格式刷
            "horizontal", //分隔线
            "removeformat", //清除格式
            "link", //超链接
            "unlink", //取消链接
            "inserttable", //插入表格
            "insertrow", //前插入行
            "insertcol", //前插入列
            "mergeright", //右合并单元格
            "mergedown", //下合并单元格
            "deleterow", //删除行
            "deletecol", //删除列
            "splittorows", //拆分成行
            "splittocols", //拆分成列
            "splittocells", //完全拆分单元格
            "deletecaption", //删除表格标题
            "inserttitle", //插入标题
            "mergecells", //合并多个单元格
            "deletetable", //删除表格
            "fontfamily", //字体
            "fontsize", //字号
            "simpleupload", //单图上传
            "emotion", //表情
            "justifyleft", //居左对齐
            "justifyright", //居右对齐
            "justifycenter", //居中对齐
            "justifyjustify", //两端对齐
            "forecolor", //字体颜色
            "backcolor", //背景色
            "insertorderedlist", //有序列表
            "insertunorderedlist", //无序列表
            "lineheight", //行间距
            "edittip ", //编辑提示
          ],
        ],
        // 编辑器不自动被内容撑高
        autoHeightEnabled: true,
        // 初始容器高度
        initialFrameHeight: 240,
        autoHeightEnabled: false, // 禁止自动增高，改用滚动条
        autoFloatEnabled: false,
        // 初始容器宽度
        initialFrameWidth: "100%",
        // 上传文件接口（这个地址是我为了方便各位体验文件上传功能搭建的临时接口，请勿在生产环境使用！！！）
        serverUrl: "http://localhost:8085/",
        // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
        UEDITOR_HOME_URL:
          process.env.NODE_ENV === "production" ? "UEditor/" : "/UEditor/",
      },
    }
  },
  methods: {
    fn(data){
      this.content = data.content;
      this.titleControl = data.title;
      //判断步奏
      if(data.status){
        this.status = data.status; //赋值状态值
        switch (data.status) {
          case "initiate": //新建/维护
            this.activeId = 1;
            break;
          case "standard": //指标
            this.activeId = 2;
            break;
          case "edit":  //编辑
            this.activeId = 3;
            break;
          case "review":  //审核
            this.activeId = 4;
            break;
          case "pass":  //审定
            this.activeId = 5;
            break;
          case "release":  //已发布
            this.activeId = 6;
            break;
        }
      }
    }
  },
  watch: {
    /**
     * 获取传进来的value绑定content
     */
    getFiledData(value) {
      this.content = value;
    },
    personDataKnowledge(data) {
      let _this = this
      let timer = setInterval(function () {
        // 判断文档和所有子资源(图片、音视频等)已完成加载
        if (document.readyState === 'complete') {
          //执行方法
          _this.fn(data)
          window.clearInterval(timer)
        }
      }, 500)
    }
  }
}
</script>
<style>
/* 编辑器的图片上传暂时没有使用到故禁用 */
#edui59_state{
  display: none;
}
</style>