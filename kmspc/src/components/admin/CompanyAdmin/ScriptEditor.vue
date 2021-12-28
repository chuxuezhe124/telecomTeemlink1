<template>
  <div>
      <el-dialog
        :title="$t('title.script_editor')"
        :visible.sync="scriptEditorVisible"
        width="80%"
        :before-close="handleClose"
        append-to-body>
        <!-- 头部 -->
        <div class="scriptEditorHeader">
          <div class="scriptEditorHeaderLeft">
            <el-button plain size="small" @click="preStep">
              <img src="@/assets/images/previous.svg" alt="" style="width: 28px; height: 14px;">
            </el-button>
            <el-button plain size="small" @click="nextStep">
              <img src="@/assets/images/next.svg" alt="" style="width: 28px; height: 14px;">
            </el-button>
            <span class="selectForm">
              <span>{{$t('font.size')}}</span>
              <el-select v-model="fontSize" size="small">
                <el-option label="12" value="12"></el-option>
                <el-option label="13" value="13"></el-option>
                <el-option label="14" value="14"></el-option>
                <el-option label="15" value="15"></el-option>
                <el-option label="16" value="16"></el-option>
                <el-option label="17" value="17"></el-option>
                <el-option label="18" value="18"></el-option>
                <el-option label="19" value="19"></el-option>
                <el-option label="20" value="20"></el-option>
                <el-option label="21" value="21"></el-option>
                <el-option label="22" value="22"></el-option>
                <el-option label="23" value="23"></el-option>
                <el-option label="24" value="24"></el-option>
                <el-option label="25" value="25"></el-option>
                <el-option label="26" value="26"></el-option>
              </el-select>
            </span>
          </div>
          <div>
            <el-button size="small" @click="cancel">{{$t('btns.cancel')}}</el-button>
            <el-button size="small" type="primary" @click="confirm">{{$t('btns.determine')}}</el-button>
          </div>
        </div>
        <!-- 内容 -->
        <div :style="{ fontSize: this.fontSize + 'px' }" ref="codemirror">
          <textarea ref="mycode" v-model="code"></textarea>
        </div>
      </el-dialog>
  </div>
</template>

<script>
// 核心样式
import "codemirror/lib/codemirror.css";
// 引入主题后还需要在 options 中指定主题才会生效

// 需要引入具体的语法高亮库才会有对应的语法高亮效果
import "codemirror/mode/javascript/javascript.js";

// require active-line.js
import "codemirror/addon/selection/active-line.js";

let CodeMirror = require("codemirror/lib/codemirror");
export default {
  name:'ScriptEditor',
  data () {
    return {
      editor: null,
      options: {
        mode: "javascript",
        tabSize: 0, // 缩进格式
        lineNumbers: true, // 显示行号
        // autofocus: true, //初始化时自动获取焦点
        autoRefresh: true,
      },
      fontSize: 12,
      code: ''
    };
  },
  methods:{
    // 弹框关闭回调
    handleClose() {
      this.$emit("closeScriptEditorDialog");
    },
    // 回退上一步
    preStep() {
      // 判断是否与原来的代码一致，一致就操作
      let chartCode = this.code;
      if (chartCode !== this.getEditor()) {
        this.editor.doc.undo();
      }
    },
    // 下一步
    nextStep() {
      this.editor.doc.redo();
    },
    // 获取编辑器的值
    getEditor() {
      return this.editor.doc.getValue();
    },
    // 将值传给父组件去更新
    setEditor() {
      
    },
    // 传值进来设置
    setCodeEditor(val) {
      this.editor.doc.setValue(val);
      setTimeout(() => {
        this.editor.refresh();
      }, 100);
    },
    undo() {
      // 判断是否与原来的代码一致，一致就操作
      let chartCode = this.code;
      if (chartCode !== this.getEditor()) {
        this.editor.doc.undo();
      }
    },
    redo() {
      this.editor.doc.redo();
    },
    refresh() {
      // return this.editor.refresh();
      setTimeout(() => {
        this.editor.refresh();
      }, 1);
    },
    confirm(){
      // 写入文本框中
      this.$emit("saveScriptEditor", this.editor.doc.getValue());
      this.$emit("closeScriptEditorDialog");
    },
    cancel(){
      this.$emit("closeScriptEditorDialog");
    },
    _initEditor() {
      if (!this.editor) {
        this.editor = CodeMirror.fromTextArea(this.$refs.mycode, this.options);
      }
      this.editor.setValue(this.value || this.editorCode || '');
      this.editor.setSize("auto", this.editorHeight);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this._initEditor();
    });
  },
  props: {
    scriptEditorVisible: Boolean,
    editorCode: String,
    // 脚本编辑器高度
    editorHeight: {
      type: String,
      default: "350px",
    },
  },
}

</script>
<style lang='scss' scoped>
.scriptEditorHeader {
  display: flex;
  justify-content: space-between;
  .scriptEditorHeaderLeft {
    display: inline-block;
    .selectForm{
      margin-left: 10px;
    }
  }
}
</style>