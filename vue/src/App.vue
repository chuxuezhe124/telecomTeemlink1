<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>-->
    <router-view v-if="isRouterAlive"/>
  </div>
</template>
<script>
export default {
  provide(){
    return{
      reload:this.reload
    }
  },
  data(){
    return{
      isRouterAlive:true
    }
  },
  methods:{
    reload(){
      this.isRouterAlive = false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      })
    }
  }
}
</script>

<style lang="scss">
body{
  height: 100%;
}
#app {
  height: 100%;
}

</style>
<style lang="css">
@import url("assets/css/module/obpm.css");
</style>
