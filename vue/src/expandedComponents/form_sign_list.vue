<template>
  <div class="custom-sign-wrap" v-if="currentSignList && currentSignList.length > 0">
    <div 
      class="img-item" 
      v-for="(item, index) in currentSignList" 
      :key="index" 
      :style="{'left': item.left + 'px', 'top': item.top + 'px'}">
      <img :src="'/obpm' + item.img" />
    </div>
  </div>
</template>
<script>
  
export default {
  name: "form-stamp",
  props: [
    "signList"
  ],

  mounted(){
    this.currentSignList = JSON.parse(this.signList)
  },

  data: function() {
    return {
      currentSignList: [],
    }
  },

  methods: {

  }
}

</script>
