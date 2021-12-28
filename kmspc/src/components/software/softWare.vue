<template>
  <div id="main-other-software" style="height:100%;padding:60px 0 0 0;">
      <iframe
      v-loading="loading"
        ref="mainFrame"
        style="border:none"
        width="100%"
        height="100%"
        scrolling="yes"
        frameborder="0"
        allowtransparency="true" 
        noresize="noresize"
        src="/static/portal/vue/index.html#/information"
        date="/static/portal/vue/index.html#/information"
        @load="loadend()"
      ></iframe>
  </div>
</template>
<script>
export default {
//  created(){
//     this.actionContent=this.$route.params.actionContent
//     },
  data() {
    return {
      loading: true,
      actionContent:"",
    };
  },
  methods: {
    loadend(){
     this.loading=false; 
     console.log(1000000)
    }
  }
};
</script>
<style lang="scss" scoped>

</style>


