<template>
  <div class="add-list">
    <div class="list-wrap">
      <div class="title">
        <span>{{$t('flow.name')}}</span>
        <span>
          <span>{{$t('view.up')}}</span>
          <span>{{$t('view.down')}}</span>
        </span>
      </div>
      <div class="list-content">
        <div class="list" v-for="(item, index) in nodesList" :key="index">
          <span>{{item.name}}</span>
          <span>
            <span>
              <a @click="listUp(index)">
                <i class="fa fa-arrow-circle-up fa-lg" aria-hidden="true"></i>
              </a>
            </span>
            <span>
              <a @click="listDown(index)">
                <i class="fa fa-arrow-circle-down fa-lg" aria-hidden="true"></i>
              </a>
            </span>
          </span>
        </div>
      </div>
     
    </div>
    <div class="btn-bar">
      <div>
        <el-button type="primary" size="medium" @click="addRole">{{$t('btns.add')}}</el-button>
        <el-button size="medium" @click="cancel">{{$t('btns.cancel')}}</el-button>
        <el-button type="success" size="medium"  @click="onOK">{{$t('btns.sure')}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "act",
    "openParams" ,
    "buildFormData" ,
    "approvers",
    "newHostOrCohostList"
  ],
  data: function() {
    return {
      formwrapperHeight: 0,
      allSuggests:[],
      nodesList:[],
    };
  },

  watch: {
    newHostOrCohostList() {
      this.concatList()
    }
  }, 
  created() {
    this.getSuggest();
  },

  mounted() {
    this.approversList();
  },
  methods: {
    //新添加主办或者协办人后拼接数据
    concatList() {
      // if(this.act.type == 57) { //主办
      //   console.log("主办-->")
      // }else if(this.act.type == 58) { //协办
      // }
      console.log("选择合并------>");
      this.nodesList.forEach(item => {
        for(let i=0; i<this.newHostOrCohostList.length; i++) {
          if(item.id == this.newHostOrCohostList[i].id) {
            this.newHostOrCohostList.splice(i, 1);
            i--;
          }
        }
      });
      this.nodesList = this.nodesList.concat(this.newHostOrCohostList)
    },

    cancel(){
      let status = 'ERROR';
      this.$emit("closePopup",status); //
    },

    addRole() {
      let nodesList = JSON.parse(JSON.stringify(this.nodesList));
      this.$emit("setProcessHosting",nodesList)
    },

    goBack() {
      let status = 'ERROR';
      this.$parent.$parent.$parent.$parent.$parent.closeThePopup(status);
    },

    onOK(){
      let array = []
      this.nodesList.forEach(item => {
        array.push(item.id);
      });
      if(this.act.type == 57) { //主办
        console.log("主办-->")
        this.$api.processHosting(this.openParams.appId, this.openParams._select, array, {
          onSucess: response => {
            if(response.data.errcode == 0) {
              this.$notify({
                title:  response.data.data,
                message:'',
                type: 'success'
              });
              let status = "SUCCESS"
              this.$emit("closePopup", status);
            }
          }
        })
      }else if(this.act.type == 58) { //协办
        console.log("协办-->");
        this.$api.processCoHosting(this.openParams.appId, this.openParams._select, array, {
          onSucess: response => {
            if(response.data.errcode == 0) {
              this.$notify({
                title:  response.data.data,
                message:'',
                type: 'success'
              });
              let status = "SUCCESS"
              this.$emit("closePopup", status);
            }
          }
        })
      }
    },

    //向上
    listUp(index) {
      if(index == 0) {
        console.log("最顶部-->");
      }else {
        let arr = this.nodesList;
        arr[index] = arr.splice(index-1, 1, arr[index])[0];
        this.nodesList = arr;
      }
      
    },

    //向下
    listDown(index) {
      if(index == this.nodesList.length-1) {
        console.log("最底部-->")
      }else {
        let arr = this.nodesList;
        arr[index] = arr.splice(index+1, 1, arr[index])[0];
        this.nodesList = arr;
      }
      
    },
    approversList(){
      if(this.act.type == 57) {
        this.nodesList = this.approvers[0].nodes[0].auditors;
        console.log("加签主办-->",this.nodesList);
      }else if (this.act.type == 58) {
        this.nodesList = this.approvers[0].nodes[0].coAuditors;
        console.log("加签协办-->",this.nodesList);
      }
    },
    //获取返回的数据
    getSuggest() {
      this.$api.getCommonOpinions(this.$root.user.id, {
        onSucess: response => {
          this.allSuggests = response.data.data;
        }
      });
    },
  }
};
</script>