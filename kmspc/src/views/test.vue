<template>
  <div style="padding-top: 100px">
    <vue-ueditor-wrap
    :config="myConfig"
    ></vue-ueditor-wrap>
  </div>
</template>
<script>
export default {
  data() {
    return {
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
        // 初始容器宽度
        initialFrameWidth: "100%",
        // 上传文件接口（这个地址是我为了方便各位体验文件上传功能搭建的临时接口，请勿在生产环境使用！！！）
        serverUrl: "http://localhost:8085/",
        // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
        UEDITOR_HOME_URL:
          process.env.NODE_ENV === "production" ? "UEditor/" : "/UEditor/",
      },
    };
  },
  methods: {},
};
</script>
<style>
</style>