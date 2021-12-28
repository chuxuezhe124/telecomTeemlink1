<template>
  <div :id="id">
    <template v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'">
      <!--隐藏-->
			<span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.value}}
      </div>
    </template>
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
      <!-- 只读（文本模式） -->
      </template>

      <template v-else>
        
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!--可编辑-->
      <audio controls v-if="field.value"> 
        <source src="" type="audio/ogg"> 
        <source src="" type="audio/mpeg"> 
        <source src="" type="audio/wav">
        {{$t('unsupport')}}
      </audio>
    </template>
  </div>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-record",
  props: ["id"],
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return formData;
    }
  },

  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },

  data: function() {
    return {
      Constant,
    }
  },

  methods: {

  }
}
</script>

<style scoped>

</style>