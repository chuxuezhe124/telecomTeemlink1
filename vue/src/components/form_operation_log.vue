<template>
  <div class="log-box">
    <div class="header">
      <span>{{$t('view.history')}}</span>
      <span><i class="el-icon-close" @click="hiddenLogsDialog"></i></span>
    </div>
    <div class="table-list">
      <el-scrollbar class="scrollbar">
        <div class="table-box">
          <div class="table-list table-th">
            <div class="left">{{$t('view.change_people')}}</div>
            <div class="center">{{$t('view.change_time')}}</div>
            <div class="right">{{$t('view.change_data')}}</div>
          </div>
          <div class="table-list table-td" v-for="(item, index) in tableData" :key="index">
            <div class="left">{{item.modifier}}</div>
            <div class="center">{{item.time}}</div>
            <div class="right">{{item.fieldValue}}</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  props: [
    'docId',
    'operationData',
  ],
  computed: {
    ...mapGetters({
      tableData: 'operationLog'
    }),
  },
  created() {
    let data = {
        fieldName: this.operationData.fieldName,
        _: new Date().getTime(),
      }
    let appId = this.$root.appid;
    let docId = this.docId;
    // this.getOperationLogs()
    this.getOperationLog({appId, docId, data});
  },
  data: function() {
    return {
      showLogsDialog: false,
      // tableData:[],
      showLogsIcon:true,
    };
  },
  methods: {
    ...mapActions([
      "getOperationLog",
    ]),
    getOperationLogs() {
      let data = {
        fieldName: this.operationData.fieldName,
        _: new Date().getTime(),
      }
      this.$api.getOperationLogs(
        this.$root.appid,
        this.docId,
        data,
        {
          onSucess: res => {
            this.tableData = res.data.data;
          }
        }
      )
    },
    hiddenLogsDialog() {
      this.$emit("event");
    },
    
  }
}
</script>

<style lang="scss">

</style>