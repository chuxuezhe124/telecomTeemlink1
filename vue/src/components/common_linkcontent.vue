<template>
  <div class="main-link-content" style="height:100%;">
    <iframe
      ref="mainFrame"
      style="border:none"
      width="100%"
      height="100%"
      frameborder="0"
      allowtransparency="true" 
      noresize="noresize"
      :src="openParams.actionContent"
    ></iframe>
  </div>
</template>
<script>

export default {
  name: "common_linkcontent",
  props: ['openParams'],
  watch: {
    
  },
  created() {
    
  },
  mounted() {
    
  },

  data() {
    return{
      
    }
  },
  methods: {
    
  }
};
</script>
<style lang="scss" scoped>

</style>


