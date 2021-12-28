<template>
<!-- :style="{height:formScrollHeight?formScrollHeight+'px':'100%'}" -->
<!-- :style="{
      height: flowDialogStyle.fHeight?flowDialogStyle.fHeight+'px':'100%',
      width: flowDialogStyle.fWidth?flowDialogStyle.fWidth+'px':'100%',
      top: flowDialogStyle.fTop?flowDialogStyle.fTop:''}" -->
  <div 
    class="flow-dialog" 
    @click.stop="hiddenDialog">
    <div :class="(type== 57 || type== 58)?'active-body':'dialog-body'" @click.stop>
      <slot name="body"></slot> 
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "visible",
    "type",
  ],
  data: function() {
    return {};
  },

  computed: {
    // visible_: {
    //   get() {
    //     return this.visible;
    //   },
    //   set(val) {
    //     this.$emit("update:visible", val);
    //   }
    // }
  },
  methods: {
    hiddenDialog() {
      let val = false;
      this.$emit("update:visible", val);
    }
  }
};
</script>>
