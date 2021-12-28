<template>
  <span :id="id" :name="field.name + '_show'" class="dept-select-control">
    <template
      v-if="
        field.displayType == Constant.PermissionType_HIDDEN ||
        field.textType.toLowerCase() == 'hidden'
      "
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <input type="hidden" v-model="field.value" />
      <span>{{
        field.printHiddenValue ? field.printHiddenValue : field.hiddenValue
      }}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{ field.data && field.data.length > 0 ? field.data[0].name : "" }}
      </div>
    </template>
    <!-- 只读 -->
    <template
      v-else-if="
        field.textType.toLowerCase() == 'readonly' ||
        field.displayType == Constant.PermissionType_READONLY ||
        field.displayType == Constant.PermissionType_DISABLED
      "
    >
      <!-- 只读（文本模式） -->
      <template v-if="field.readOnlyShowValOnly">
        <div
          class="dept-select-wrap"
          :style="{ width: field.width ? field.width + 'px' : '' }"
          @mouseenter="enter()"
        >
          <span v-for="(item, index) in field.options" :key="index">
            <span v-if="item.value == field.value">{{ item.option }}</span>
          </span>
          <i
            class="fa fa-history icon-log"
            @click="getOperationLogs"
            style="color: #46d2db"
            v-if="showLogsIcon && field.isModified"
            aria-hidden="true"
          >
          </i>
          <div class="log-box" v-if="showLogsDialog">
            <div class="header">
              <span>{{ $t("view.history") }}</span>
              <span
                ><i class="el-icon-close" @click="hiddenLogsDialog"></i
              ></span>
            </div>
            <div class="table-list">
              <div class="table-box">
                <el-table
                  :data="tableData"
                  :header-cell-style="{
                    background: '#F9F9F9',
                    color: '#5A6779',
                  }"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="modifier"
                    :label="$t('view.change_people')"
                  >
                  </el-table-column>
                  <el-table-column prop="time" :label="$t('view.change_time')">
                  </el-table-column>
                  <el-table-column
                    prop="fieldValue"
                    :label="$t('view.change_data')"
                  >
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <div
          class="dept-select-wrap"
          :style="{ width: field.width ? field.width + 'px' : '' }"
          @mouseenter="enter()"
        >
          <el-select
            disabled
            v-model="field.value"
            :id="field.divId"
            :discript="field.discript"
            :name="field.name"
            :isCommonFilter="field.isCommonFilter"
            :fieldType="field.formField"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :value="option.value"
              :label="option.option"
              :selected="option.value == field.value ? 'true' : 'false'"
            >
            </el-option>
          </el-select>
          <i
            class="fa fa-history icon-log"
            @click="getOperationLogs"
            style="color: #46d2db"
            v-if="showLogsIcon && field.isModified"
            aria-hidden="true"
          >
          </i>
          <div class="log-box" v-if="showLogsDialog">
            <div class="header">
              <span>{{ $t("view.history") }}</span>
              <span
                ><i class="el-icon-close" @click="hiddenLogsDialog"></i
              ></span>
            </div>
            <div class="table-list">
              <div class="table-box">
                <el-table
                  :data="tableData"
                  :header-cell-style="{
                    background: '#F9F9F9',
                    color: '#5A6779',
                  }"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="modifier"
                    :label="$t('view.change_people')"
                  >
                  </el-table-column>
                  <el-table-column prop="time" :label="$t('view.change_time')">
                  </el-table-column>
                  <el-table-column
                    prop="fieldValue"
                    :label="$t('view.change_data')"
                  >
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div class="dept-select-wrap" @mouseenter="enter()">
        <el-select
          :popper-append-to-body="true"
          v-model="field.value"
          :style="{ width: (field.width || field.selectwidth) ?(field.formShowType == 'new' ? field.selectwidth : field.width) + 'px' : '' }"
          :id="field.divId"
          :discript="field.discript"
          :isCommonFilter="field.isCommonFilter"
          :fieldType="field.formField"
          @change="onChange"
          ref="deptSelect"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
            :label="option.option"
          >
          </el-option>
        </el-select>
        <span v-if="field.instantValidate" class="mark">*</span>
        <div class="tips" v-show="isActive">
          {{ errorMessage }}
        </div>
        <i
          class="fa fa-history icon-log"
          @click="getOperationLogs"
          style="color: #46d2db"
          v-if="showLogsIcon && field.isModified"
          aria-hidden="true"
        >
        </i>
        <div class="log-box" v-if="showLogsDialog">
          <div class="header">
            <span>{{ $t("view.history") }}</span>
            <span><i class="el-icon-close" @click="hiddenLogsDialog"></i></span>
          </div>
          <div class="table-list">
            <div class="table-box">
              <el-table
                :data="tableData"
                :header-cell-style="{ background: '#F9F9F9', color: '#5A6779' }"
                style="width: 100%"
              >
                <el-table-column
                  prop="modifier"
                  :label="$t('view.change_people')"
                >
                </el-table-column>
                <el-table-column prop="time" :label="$t('view.change_time')">
                </el-table-column>
                <el-table-column
                  prop="fieldValue"
                  :label="$t('view.change_data')"
                >
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import controlHidden from "@/assets/js/controlHidden.js";
export default {
  name: "o-dept-select",
  props: ["id"],
  computed: {
    field: function () {
      let formData = this.$parent.findField(this.id);
      if (formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue
          ? formData.printHiddenValue.replace(/&nbsp;/g, "")
          : "";
      }
      return formData;
    },
  },
  watch: {
    // 'field.options': {
    //   deep:true,
    //   handler:function(newV,oldV){
    //     console.log('field--2-->',this.field.options)
    //     console.log('field---2->',this.field.value)
    //     if(this.field.value) {
    //       if(this.field.options.length <= 0) {
    //         this.field.options = [];
    //         this.fieldValue = '';
    //         this.$forceUpdate();
    //       }
    //     }
    //   }
    // }
  },
  mounted() {
    this.$nextTick(() => {
      let field = this.field;
      if (field.customStyle) {
        let customStyle = field.customStyle.content;
        customStyle = customStyle.split("{")[1].split("}")[0];
        if (this.$refs.deptSelect) {
          this.$refs.deptSelect.$refs.reference.$refs.input.style = customStyle;
        }
      }
      if (field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({ id, field, formShowType });
      }
    });
  },
  data: function () {
    return {
      isActive: false,
      errorMessage: "",
      Constant,
      selectedOption: {},
      showLogsDialog: false,
      tableData: [],
      showLogsIcon: true,
    };
  },
  methods: {
    hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
    },
    enter() {
      if (this.field.isModified) {
        this.showLogsIcon = true;
      }
    },
    getOperationLogs() {
      this.showLogsDialog = true;
      let data = {
        fieldName: this.field.name,
        _: new Date().getTime(),
      };
      this.$api.getOperationLogs(this.$root.appid, this.field.docId, data, {
        onSucess: (res) => {
          this.tableData = res.data.data;
          console.log(this.tableData);
        },
      });
    },
    onChange(ev) {
      debugger
      let field = this.field;
      this.$parent.refresh(this.id);
      if (field.refreshOnChanged) {
        //判断是否需要刷新
        let havePar = false;
        let par = "";
        while (!havePar) {
          par = par + ".$parent";
          let url = "this" + par + ".refresh";
          if (eval(url)) {
            // let path = url + "(" + this.id + ")";
            let path = url + '(' + "'"+ this.id +"'" + ')';
            eval(path);
            break;
          }
        }
      }
      if (field.instantValidate) {
        let value = true;
        let formData = this.$parent.checkData(value);
        this.$api.formValidation(this.$root.appid, formData, {
          onSucess: (response) => {
            if (response.data.errcode == 4001) {
              if (response.data.errors && response.data.errors.length > 0) {
                let arr = response.data.errors;
                for (let i = 0; i < arr.length; i++) {
                  if (this.field.name == arr[i].field) {
                    this.isActive = true;
                    this.errorMessage = arr[i].errmsg;
                    return;
                  } else {
                    this.isActive = false;
                    this.errorMessage = "";
                  }
                }
              }
            } else if (response.data.errcode == 0) {
              this.isActive = false;
            }
          },
        });
      }
    },
  },
};
</script>