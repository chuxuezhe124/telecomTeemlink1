<template>
  <div id="menu-custom-linktype" v-loading="loading">
    <div class="link-wrap" v-if="openParams.linkType == '06' || openParams.linkType == '07'">
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
      ></iframe>
    </div>
    <div class="link-wrap" v-else-if="openParams.linkType == '05'">
      <iframe
        ref="mainFrame"
        style="border:none"
        width="100%"
        height="100%"
        scrolling="yes"
        frameborder="0"
        allowtransparency="true" 
        noresize="noresize"
        :src="'/obpm/portal/'+openParams.actionContent"
      ></iframe>
    </div>
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
    
  },
  methods: {
    
  }
};
</script>
<style lang="scss" scoped>

</style>


