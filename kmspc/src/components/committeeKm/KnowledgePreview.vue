<template>
  <div class="backgroundWhite" :class="{'paddingTop60':paddingTop}">
    <el-button icon="el-icon-back" size="mini" @click="back">{{$t('btns.return')}}</el-button>
    <div class="center">
      <h1 v-html="title">{{title}}</h1>
    </div>
    <div v-html="content">
      {{content}}
    </div>

  </div>
</template>
<script>
import API from "@/api.js";
export default {
  data(){
    return{
      title: "",      //标题
      content: "",    //内容
      paddingTop: false,    //头部padding
    }
  },
  mounted(){
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
    let id = this.$route.query.param.id;
    this.getKnowledge(id);
  },
  methods:{
    /**
     * 获取知识地图详情
     */
    getKnowledge(id){
      API.getKnowledge(id,{
        onSucess: resp => {
          if(resp.data && resp.data.errcode == 0){
           this.title = resp.data.data.title;
           this.content = resp.data.data.content;
          }
        } 
      });
    },
    /**
     * 后退
     */
    back(){
      history.go(-1);
    }
  }
}
</script>