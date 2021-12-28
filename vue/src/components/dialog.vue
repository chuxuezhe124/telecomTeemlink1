<template>
  <el-dialog
    :title="title" 
    :visible.sync="visible_"
    :width="width"
    :class="setClass"
    :append-to-body="appendToBody"
    >
    <slot name="body"></slot> 
    <span slot="footer" class="dialog-footer">
      <slot name="footer"></slot>
    </span>
    <!-- <slot name="footer"></slot> -->
  </el-dialog>
</template>

<script>
export default {
  props: [
    "width", 
    "visible", 
    "title",
    "setClass",
    "appendToBody"
    ],
  data: function() {
    return {};
  },

  computed: {
    visible_: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    }
  },
  methods: {
  }
};
</script>>
