<template>
  <div>
    <template v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'">
				<!-- 隐藏 -->
        <template v-if="field.isHideType == true">  	<!-- 勾了隐藏时同时隐藏 -->
          <div :id="id" ref="qrcode" class="qrcode"></div>
        </template>
        <template v-else>
          <div :id="id" ref="qrcode" style="display:none"></div>  <!--不写二维码找不到id会报错-->
          <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
        </template>
		</template>
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!--打印-->
      <div :id="id" ref="qrcode"></div>
    </template>
		<template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
			<template v-if="field.readOnlyShowValOnly">
      <!-- 只读（文本模式） -->
        <div :id="id" ref="qrcode"></div>
			</template>

			<template v-else>
				<div :id="id" ref="qrcode"></div>
			</template>
		</template>

		<template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
			<!--可编辑-->
      <div :id="id" ref="qrcode"></div>
		</template>
  </div>
</template>

<script>
import Constant from "@/Constant.js"
import QRCode from 'qrcodejs2'
import controlHidden from "@/assets/js/controlHidden.js"

import qrcodeMethod from "@/assets/js/qrcodeMethod.js"
export default {
  name: "o-qrcode",
  props: ["id"],
  mounted () {
    this.qrcode(); 
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return formData;
    },
  },

  data: function() {
    return {
      Constant,
    };
  },

  methods: {
    qrcode() {
      let path = obpmConfig.contextPath
	    qrcodeMethod(this.field, this.id, '', path)
    },
  }
}
</script>

<style scoped>

</style>
