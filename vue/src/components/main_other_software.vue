<template>
  <div id="main-other-software">
      <iframe
        ref="mainFrame"
        style="border:none"
        width="100%"
        height="100%"
        scrolling="yes"
        frameborder="0"
        allowtransparency="true" 
        noresize="noresize"
        :src="openParams.actionContent"
        :date="openParams.actionContent"
      ></iframe>
  </div>
</template>
<script>
export default {
  inject: ["reload"],
  props: [
    "openParams",
  ],
  components: {
    
  },
  data() {
    return {
      loading: false,
    };
  },
  created() {
    console.log(openParams)
  },
  updated(){
    console.log(openParams)
  },
  methods: {
    
  }
};
</script>
<style lang="scss" scoped>

</style>


