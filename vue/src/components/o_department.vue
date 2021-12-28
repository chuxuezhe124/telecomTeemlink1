<template>
  <span :id="id" :name="field.name+'_show'" class="component-input-span">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType.toLowerCase() == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <select
        class="form-control component-select obpm-select displayn"
        :id="field.divId"
        :discript="field.discript"
        :name="field.name"
        :isCommonFilter="field.isCommonFilter"
        :fieldType="field.formField"
        style="display:none;"
      >
        <option
          v-for="(option) in field.options"
          :key="option.value"
          :value="option.value"
          :selected="option.value==field.value?'true':'false'"
        >{{option.option}}</option>
      </select>
      <span>{{field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <select
        class="form-control component-select obpm-department"
        :class="field.cssClass"
        :id="field.divId"
        :discript="field.discript"
        :name="field.name"
        :isCommonFilter="field.isCommonFilter"
        :fieldType="field.formField"
      >
        <option
          v-for="(option) in field.options"
          :key="option.value"
          :value="option.value"
          class="department-cmd"
          :selected="option.value==field.value?'true':'false'"
        >{{option.option}}</option>
      </select>
    </template>
    <template v-else-if="field.readOnlyShowValOnly">
      <!-- 只读（文本模式） -->
      <span :id="field.name_show">showtxt</span>
      <template v-if="field.textType.toLowerCase() == 'password'">***</template>
      <template v-else>{{field.value}}</template>
    </template>
    <template v-else>
      <!-- 只读（控件模式） -->
      <select
        class="form-control component-select obpm-select"
        :id="field.divId"
        :discript="field.discript"
        :name="field.name"
        :isCommonFilter="field.isCommonFilter"
        :fieldType="field.formField"
        disabled
        :style="field.style"
      >
        <option
          v-for="(option) in field.options"
          :key="option.value"
          :value="option.value"
          :selected="option.value==field.value?'true':'false'"
        >{{option.option}}</option>
      </select>
    </template>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
export default {
  name: "o-department",
  props: ["id"],
  computed: {
    field: function() {
      return this.$parent.findField(this.id);
    }
  },
  data: function() {
    return { Constant, selectedOption: {} };
  }
};
</script>