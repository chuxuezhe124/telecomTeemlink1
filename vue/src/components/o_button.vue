<template>
  <span
    :id="id"
    class="button-control"
    :style="{
      opacity:
        field.textType ||
        field.displayType == Constant.PermissionType_READONLY ||
        field.displayType == Constant.PermissionType_DISABLED
          ? '0.65'
          : '',
    }"
  >
    <template
      v-if="
        field.displayType == Constant.PermissionType_HIDDEN ||
        field.textType == 'hidden'
      "
    >
      <span>{{ field.hiddenValue }}</span>
    </template>
    <!--只读-->
    <template
      v-else-if="
        field.textType == 'readonly' ||
        field.displayType == Constant.PermissionType_READONLY ||
        field.displayType == Constant.PermissionType_DISABLED
      "
    >
      <template v-if="field.readOnlyShowValOnly">
        <a
          :style="{
            'pointer-events': 'none',
            'background-color': field.activity.colorType
              ? field.activity.colorType
              : '',
          }"
          disabled
          :title="field.title"
          :class="[
            'vbtn btn btn-success obpm-success',
            'btnStyle-' + field.activity.type,
            'btnState-' + field.activity.colorType,
          ]"
        >
          <i :class="[field.btn ? field.btn.btnIcon : '']"></i>
          {{ field.title ? field.title : field.value }}
        </a>
      </template>
      <template v-else> </template>
    </template>

    <!-- 可编辑 -->
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <a
        :style="{
          'background-color': field.activity.colorType
            ? field.activity.colorType
            : '',
        }"
        :title="field.title"
        @click="checkValue"
        :class="[
          'vbtn btn btn-success obpm-success',
          'btnStyle-' + field.activity.type,
          'btnState-' + field.activity.colorType,
        ]"
      >
        <i :class="[field.btn ? field.btn.btnIcon : '']"></i>
        {{ field.title ? field.title : field.value }}
      </a>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import controlHidden from "@/assets/js/controlHidden.js";
export default {
  name: "o-button",
  props: ["id"],
  computed: {
    field: function () {
      let formData = this.$parent.findField(this.id);
      let data = {};
      switch (formData.activity.type) {
        case 1: //载入视图
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 2: //创建
          data = {
            btnIcon: "createBtnicon",
          };
          formData.btn = data;
          return formData;
        case 3: //删除
          data = {
            btnIcon: "deleteBtnicon",
          };
          formData.btn = data;
          return formData;
        case 4: //保存并启动流程
          break;
        case 5: //流程处理
          data = {
            btnIcon: "submitflowicon",
          };
          formData.btn = data;
          return formData;
        case 8: //关闭窗口
          data = {
            btnIcon: "closeWindowBtnicon",
          };
          formData.btn = data;
          return formData;
        case 10: //返回
          data = {
            btnIcon: "backBtnicon",
            fc: "#000",
          };
          formData.btn = data;
          return formData;
        case 11: //保存并返回
          data = {
            btnIcon: "saveBackBtnicon",
          };
          formData.btn = data;
          return formData;
        case 13: //无
          data = {
            btnIcon: "noneBtnicon",
            fc: "#000",
          };
          formData.btn = data;
          return formData;
        case 14: //网页打印(表单)
          data = {
            btnIcon: "htmlPrintBtnicon",
          };
          formData.btn = data;
          return formData;
        case 15: //网页打印含历史
          data = {
            btnIcon: "htmlPrintWithHisBtnicon",
          };
          formData.btn = data;
          return formData;
        case 16: //导出excel
          data = {
            btnIcon: "exportToExcelBtnicon",
          };
          formData.btn = data;
          return formData;
        case 19: //保存草稿不校检
          data = {
            btnIcon: "saveWithoutValidateBtnicon",
          };
          formData.btn = data;
          return formData;
        case 18: //清空所有数据
          data = {
            btnIcon: "clearAllBtnicon",
          };
          formData.btn = data;
          return formData;
        case 20: //批量提交
          data = {
            btnIcon: "batchApproveBtnicon",
          };
          formData.btn = data;
          return formData;
        case 21: //保存并复制
          data = {
            btnIcon: "saveCopyBtnicon",
          };
          formData.btn = data;
          return formData;
        case 25: //PDF导出
          data = {
            btnIcon: "exportToPdfBtnicon",
          };
          formData.btn = data;
          return formData;
        case 26: //文件下载
          data = {
            btnIcon: "fileDownloadBtnicon",
          };
          formData.btn = data;
          return formData;
        case 27: //导入excel
          data = {
            btnIcon: "excelImportBtnicon",
          };
          formData.btn = data;
          return formData;
        case 28: //电子签章
          data = {
            btnIcon: "signatureBtnicon",
          };
          formData.btn = data;
          return formData;
        case 29: //批量签章
          data = {
            btnIcon: "batchSignatureBtnicon",
          };
          formData.btn = data;
          return formData;
        case 30: //批量签章
          data = {
            btnIcon: "batchSignatureBtnicon",
          };
          formData.btn = data;
          return formData;
        case 33: //流程启动
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 34: //保存
          data = {
            btnIcon: "saveBtnicon",
          };
          formData.btn = data;
          return formData;
        case 36: //网页打印(视图)
          data = {
            btnIcon: "printViewBtnicon",
          };
          formData.btn = data;
          return formData;
        case 37: //邮件短信分享
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 42: //保存并新建
          data = {
            btnIcon: "saveNewBtnicon",
          };
          formData.btn = data;
          return formData;
        case 43: //跳转
          data = {
            btnIcon: "jumpToBtnicon",
          };
          formData.btn = data;
          return formData;
        case 45: //归档
          data = {
            btnIcon: "",
            fc: "#000",
          };
          formData.btn = data;
          return formData;
        case 46: //签章
          data = {
            btnIcon: "",
            fc: "#000",
          };
          formData.btn = data;
          return formData;
        case 47: //回退流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 48: //催办流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 49: //挂起流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 50: //恢复流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 51: //回撤流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 52: //终止流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 53: //编辑流程审批人
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 54: //调整流程
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 55: //点评
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 56: //补签
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 57: //加签主办
          data = {
            btnIcon: "queryBtnicon",
          };
          formData.btn = data;
          return formData;
        case 58: //加签协办
        default:
          return formData;
      }
      // return this.$parent.findField(this.id);
    },
  },
  mounted() {
    this.$nextTick(() => {
      let field = this.field;
      if (field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({ id, field, formShowType });
      }
    });
  },
  data: function () {
    return {
      Constant,
    };
  },
  methods: {
    checkValue() {
      let field = this.field
      let divId = field.divId
      let refreshOnChanged = field.refreshOnChanged
      let id = this.id
      let activityType = field.activityType
      let activity = field.activity
      activity.actionType = field.actiontype ? parseInt(field.actiontype) : activity.actionType
      if (this.$parent.runBeforeAction) {
        //tab下
        this.$parent.runBeforeAction(
          divId,
          refreshOnChanged,
          id,
          activityType,
          activity.withOld,
          activity
        );
      } else {
        this.$parent.$parent.runBeforeAction(
          divId,
          refreshOnChanged,
          id,
          activityType,
          field.activity.withOld,
          field.activity
        );
      }
    },
  },
};
</script>