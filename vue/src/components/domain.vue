<template>
<div>
  <div v-for="(item,index) in domainList" :key="index">
    <div class='card' :title="item.name">
      <div class='between'>
        <div class='cardBox'>
          <div class='card-right'>
            <div class='title'>{{item.name}}</div>
          </div>
        </div>
        <el-button type="primary" size="small" @click="handleClick(item.name)">{{$t('view.enter')}}</el-button>
      </div>
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: "main_domain",
  props:[
    "domainList"
  ],
  data(){
    return{

    }
  },
  methods: {
    handleClick(name){
      let domainName = name;
      this.$api.switchDomain(domainName,
      {
        onSucess: res => {
          if(res.data.errcode == 0){
            window.location.reload()
          }
        }
      })
    }
  }
}
</script>
