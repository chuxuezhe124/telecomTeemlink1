<template>
  <div class="knowledgeMap">
    <div class="card" :class="{'paddingTop':paddingTop}">
      <div class="card-header" ref="cardHead">
        <el-tabs @tab-click="handleClick">
          <el-tab-pane 
            v-for="(item,index) of tabData" 
            :key="index" 
            :label="item.name"
            :id="item.id"
            >
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="card-body">
        <knowledge-Data
          v-if="JSON.stringify(this.realmsList) != '{}'" 
          :realmsList="realmsList"
          :tableDataList="tableDataList"
          :tabObj="tabObj"
          :isChange="isChange"
          @deleteLabel="deleteLabel"
        ></knowledge-Data>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
import knowledgeData from "../../components/committeeKm/KnowledgeData";
export default {
  name: 'knowledgeMap',
  components: {
    knowledgeData
  },
  data() {
    return {
      paddingTop: false,    //头部padding
      tabIndex: 1,
      tabData: [],
      realmsList: {}, //列表的数据
      param: {
        id: '',
        title: '',
        pageNo: 1,
        linesPerPage: 15,
      },
      tableDataList: {},
      tabObj: {},
      committeeKmData: [],
      isChange: false,      //标签页是否切换
    }
  },
  methods: {
    //获取列表头
    tabList() {
      API.getKnowledgeTabList({
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.tabData = data.data;
            if(JSON.stringify(this.realmsList) == "{}"){
              this.realmsList = data.data[0];
              this.committeeKmData = data.data;
            }
          }else{
            this.$message({
              message: this.$t('msg.special_committee_cr'),
              type: 'warning'
            });
          }
        } 
      });
    },
    //标签点击
    handleClick(tab, event) {
      this.isChange = false;
      let id = tab.$attrs.id;
      let committeeKmData = this.committeeKmData;
      committeeKmData.map((e, index)=>{
        if(e.id == id){
          this.realmsList = committeeKmData[index];
        }
      })
      this.changeTab(id,tab);
      this.isChange = true;
    },
    changeTab(id,tab) {
      this.param.id = id;
      this.tabObj = tab;
      API.getKnowledgeTableList(this.param,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.tableDataList = data.data;
          }
        } 
      });
    },
    /**
     * 批量删除部门网盘
     */
    deleteLabel() {
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        let that = this;
        API.deleteFileObj(that.param.id, this.multipleSelectionArray, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              this.getdisksData();
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          }
        })
      }).catch(() => {
        this.cancelMultipleSelection();
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    }
  },
  mounted() {
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
    }
    this.tabList();
  },
}
</script>