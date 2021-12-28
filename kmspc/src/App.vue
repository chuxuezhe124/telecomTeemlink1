<template>
  <div id="app">
    <heard @returnHome="returnHome" v-if="isShowHeard"></heard>
    <keep-alive include="launch,menu,view-delegate,view-listview" v-if="$route.meta.keepAlive">
      <router-view v-if="isRouterAlive" :key="$route.fullPath"/>
    </keep-alive>
    <div v-if="!$route.meta.keepAlive" style="height:100%;">
      <router-view v-if="isRouterAlive"></router-view>
    </div>
    <div class="foot">Copyright © 2013 TEEMLINK {{$t('main_log')}}</div>
  </div>
</template>
<script>
import heard from "@/utils/heard.vue";
export default {
  name:'app',
  components: {
    heard
  },
  data(){
    return{
      isRouterAlive: true,
      home: "",       //回到首页 
      isShowHeard: false,   //是否显示头部
    }
  },
  provide(){
    return{
      reload:this.reload
    }
  },
  computed:{
    key(){
      return this.$route.name?this.$route.name+new Date():this.$route+ new Date();
    },
  },
  mounted(){
    /**
     * 是否展示头部
     */
    if(window.frameElement == null){
      this.isShowHeard = true;
      this.$store.commit("isShowHeard",true);
    }else{
      this.$store.commit("isShowHeard",false);
    }
  },
  methods:{
    reload(){
      this.isRouterAlive = false;
      this.$nextTick(function(){
        this.isRouterAlive = true;
      })
    },
    /**
     * 回到首页
     */
    returnHome(returnHome){
      this.$router.push({name:"homepage"})
      this.home = returnHome;
    },
  },
  created(){
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionStorage.getItem("store") ) {
      this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(sessionStorage.getItem("store"))))
     
    } 

    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload",()=>{
      sessionStorage.setItem("store",JSON.stringify(this.$store.state))
    })
  },
}
</script>

