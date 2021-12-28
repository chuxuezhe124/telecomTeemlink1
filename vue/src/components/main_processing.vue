<template>
  <div id="main_processing" v-loading="loading">
    <div class="main_processing-left">
      <div
        class="main_processing-left-header"
        v-for="(item,index) in softwareList"
        :key="item.id"
        @click="setCurrentSoftware(item.id, index)"
      >
        <span>{{item.name}}</span>
        <a :class="[!currentSelectFlowId && currentAppId == item.id?'headNum':'']" v-if="item.processedFlowList && item.processedFlowList.length > 0">
          <b>{{item.processedFlowList[item.processedFlowList.length-1].num}}</b>
        </a>
      </div>
      <el-scrollbar class="scrollbar" :style="{height:'calc( 100% - ' + (softwareList?softwareList.length:1) * 45 + 'px)'}">
        <ul>
          <li 
            v-for="(item,index) in currentSoftwareFlowList" 
            :key="index" 
            @click="onClickSoftware(item.id)"
          >
            <span :class="[currentSelectFlowId==item.id?'headTitle':'']">{{item.name}}</span>
            <a :class="[currentSelectFlowId==item.id?'headNum':'']">
              <b>{{item.num}}</b>
            </a>
          </li>
        </ul>
      </el-scrollbar>
    </div>

    <!--右边-->
    <div class="main_processing-right">
      <div class="main_pending-right-theme">
        <div class="main_pending-right-left">
          <div class="main_processing-right-queer">
            <span>{{$t('view.initiated')}}</span>
            <el-switch
              :width="31"
              v-model="isMyWorkFlow"
              inactive-color
              active-color="#13ce66"
              @change="reluctance"
            ></el-switch>
          </div>
        </div>

        <div class="main_pending-right-right">
          <div class="right-header">
            <el-select 
              v-model="status" 
              clearable
              @change="isComplete"
            >
              <el-option
                v-for="(item,index) in options"
                :key="index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            <el-input 
              v-model="motif" 
              :placeholder="$t('placeholder.theme')" 
              @input="ToRefresh">
            </el-input>
            <el-input
              disabled 
              v-model="backlogProposer" 
              :placeholder="$t('placeholder.applyer')">
            </el-input>
            <span class="right-btn">
              <div class="btn btn-add" @click="AddPopup">
                <i class="el-icon-document-add"></i>&nbsp;
                {{$t('btns.add')}}
              </div>
              <!-- <el-button @click="AddPopup">{{$t('btns.add')}}</el-button> -->
            </span>
            <span class="right-btn">
              <div class="btn btn-clear" @click="eliminate">
                <i class="el-icon-delete"></i>&nbsp;{{$t('btns.clean')}}
              </div>
              <!-- <el-button @click="eliminate">{{$t('btns.clean')}}</el-button> -->
            </span>
            <span class="right-btn">
              <div class="btn btn-search" @click="isComplete">
                <i class="el-icon-search"></i>&nbsp;
                {{$t('placeholder.search')}}
              </div>
              <!-- <el-button type="primary" @click="isComplete">
                <span class="el-icon-search">{{$t('placeholder.search')}}</span>
              </el-button> -->
            </span>
          </div>
        </div>
      </div>
      <div class="view-list">
        <el-scrollbar class="scrollbar">
          <el-table 
            class="view-table"
            :header-cell-style="{background:'#EBEFF0',color:'#666666'}" 
            :row-class-name="tableRowClassName"
            :data="preservation" 
            @row-click="onRowClick"
          >
            <el-table-column 
              width="150"
              :label="$t('placeholder.applyer')" 
              align="center">
              <template slot-scope="scope">
                <!-- {{scope.row.initiatorDept}}{{scope.row.initiatorDept&&scope.row.initiator?'  ':''}}{{scope.row.initiator}} -->
                <div class="applicant">
                  <div class="avatar-box">
                    <span class="avatar">
                      {{scope.row.initiator.substring(scope.row.initiator.length-2,scope.row.initiator.length)}}
                    </span>
                  </div>
                  <div class="app-right">
                    {{scope.row.initiatorDept}}{{scope.row.initiatorDept&&scope.row.initiator?'  ':''}}{{scope.row.initiator}}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column 
              :label="$t('placeholder.theme')" 
              align="center"  
              >
              <template slot-scope="scope">
                <span v-html="setSubjectFormat(scope.row.subject)"></span>
              </template>
            </el-table-column>
            <el-table-column prop="lastProcessTime" :label="$t('label.deal_time')" align="center" width="200"></el-table-column>
            <el-table-column prop="lastFlowOperation" :label="$t('form.action')" align="center" width="50"></el-table-column>
            <el-table-column :label="$t('profile.status')" align="center" width="150">
              <template slot-scope="scope">
                <span class="stateLabel" :title="scope.row.stateLabel">{{scope.row.stateLabel}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
        <div class="page">
          <el-pagination
            background
            small
            layout="total, prev, pager, next,jumper"
            :page-size="10"
            :current-page="1"
            @current-change="algorithm"
            :total="row_count"
          ></el-pagination>
        </div>
      </div>
    </div>

     <!--流程$t('view.noselect_approver')弹窗-->
    <div class="comm-dialog">
      <comm-dialog
        :title="$t('view.noselect_approver')"
        v-if="dialogVisible"
        :visible.sync="dialogVisible"
      >
        <form_selectApprover_flowpanel
          slot="body"
          :isUpcoming="isUpcoming"
          @action = "selectApprover"
        />
      </comm-dialog>
    </div>
  </div>
</template>
<script>

import form_selectApprover_flowpanel from "@/components/form_selectApprover_flowpanel.vue";
import dateFormat from '@/assets/js/dateFormat'; 
export default {
  inject: ["reload"],
  props: [
    "openParams",
  ],
  components: {
    form_selectApprover_flowpanel,
  },
  data() {
    return {
      loading:true,
      softwareList: [],
      currentSoftwareFlowList: [],
      currentAppId:'',
      Navigationlists: [],
      omniselector: [],
      motif: "", //$t('placeholder.theme')框的v-model
      chkReadOnly: false, //复选框的v-model
      preservation: [], //保存获取的经办事项
      backlogProposer:'',
      options: [{
        value: 'all',
        label: this.$t('form.all')
      }, {
        value: 'completed',
        label: this.$t('view.finish')
      }, {
        value: 'pending',
        label: this.$t('view.no_finish')
      }],
      status: 'all',
      row_count:0,
      total:0,
      dialogVisible: false,
      initiatorId:'',
      isUpcoming:true,
      currentSelectFlowId:'',
      isMyWorkFlow: false,
    };
  },
  created() {
    this.navigation();
    // this.avigraph();
    // this.flowcenters();
  },
  methods: {
    tableRowClassName({row, rowIndex}){
      if (rowIndex%2!=0) {
        return 'table-row-color';
      } else {
        return '';
      }
    },
    setSubjectFormat(str) {
      if (str && typeof str == 'string') {
        try {
          let obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return obj.summaryText;
          } else {
            return str;
          }
        } catch (e) {
          return str;
        }
      }
    },
    selectApprover(name, id) {
      this.dialogVisible = false;
      this.backlogProposer = name;
      this.initiatorId = id;
    },
    isComplete() {
      console.log("isComplete---->",this.status);
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
          applicationId: appId,
          status: this.status,
          isMyWorkFlow: this.isMyWorkFlow,
          title: this.motif,
          initiatorId: '',
          flowId: this.currentSelectFlowId?this.currentSelectFlowId:'',
          domainId: '',
          initiatorId: this.initiatorId,
          linesPerPage: 10,
          pageNo: 1
        }
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)) //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
          }
        }
      )
    },
    //点击添加弹出
    AddPopup() {
      this.dialogVisible = true;
    },
    
    onRowClick(row) {
       let op = this.openParams
      let appId = op.appId ? op.appId : this.currentAppId;
      let params = {
        id: row.docId,
        appId: appId,
        linkType:'00',
        actionContent:row.formId,
        name: row.formName,
        docId:row.docId,
        _select:row.docId,
        refreshId: op.id,
      };
      this.$emit("add-tab", params);
      //this.$emit("openNewpage", params);
    },

    writeCurrentDate(val){
      let now = new Date(val);
      let year=now.getFullYear(); 
      let month=(now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1) 
      let date=(now.getDate() < 10 ? '0' + now.getDate() : now.getDate()); 
      let hour=(now.getHours() < 10 ? '0' + now.getHours() : now.getHours()); 
      let minute=(now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()); 
      let second=(now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds());  
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },

    setCurrentSoftware(appid, index){
      this.currentSelectFlowId = '';
      let appId = this.openParams.appId ? this.openParams.appId : appid;
      let softwareList = this.softwareList;
      if(softwareList.length > 0) {
        this.currentSoftwareFlowList = softwareList[index].processedFlowList.slice(0,softwareList[index].processedFlowList.length-1);
        this.currentAppId = softwareList[index].id;
      }
      let params = {
            title: this.motif,
            linesPerPage: 10,
            pageNo: 1,
          }
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            this.total = this.total?this.total:res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
            this.loading = false;
          }
        }
      )
    },
    
    navigation() {
      // let appId = this.openParams.appId ? this.openParams.appId : this.$root.appid;
      this.$api.getNavsProcesseds(
        '',
        {
          onSucess: res => {
            let softwareList = res.data.data;
            this.softwareList = softwareList;
            if(softwareList && softwareList.length > 0) {
              this.currentSoftwareFlowList = softwareList[0].processedFlowList.slice(0,softwareList[0].processedFlowList.length-1);
              this.currentAppId = softwareList[0].id;
              this.flowcenters();
            }else {
              this.loading = false;
            }
          }
        }
      )
    },
    //获取经办导航
    avigraph() {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      this.$api.getNavsProcesseds(
        appId,
        {
          onSucess: res => {
            let newData = res.data.data[0].processedFlowList.map(item => {
              return {
                id: item.id,
                name: item.name,
                num: item.num
              };
            });
            this.omniselector = newData.slice(0,newData.length-1);
          }
        }
      )
    },

    //获取经办事项
    flowcenters() {
      this.currentSelectFlowId = '';
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
            title: this.motif,
            linesPerPage: 10,
            pageNo: 1,
          }
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            this.total = this.total?this.total:res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
            this.loading = false;
          }
        }
      )
   
    },
    //数据分页
    algorithm(value) {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
            applicationId: appId,
            status: this.status,
            isMyWorkFlow: this.isMyWorkFlow,
            title: this.motif,
            flowId: '',
            domainId: '',
            initiatorId: this.initiatorId,
            linesPerPage: 10,
            pageNo: value,
          };
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            let newData = res.data.data.datas.map(item => {
              return {
				formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime))item.lastProcessTime.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
          }
        }
      )

    },
    //{{$t('btns.clean')}}$t('placeholder.theme')框里面的数据
    eliminate() {
      this.backlogProposer = '';
      this.initiatorId = ''; 
    },
    //当$t('placeholder.theme')框的内容长度为null时重新刷新
    ToRefresh() {
      if (this.motif.length === 0) {
        //this.reload();
      }
    },
   
    //左侧导航重新加载数据
    onClickSoftware(id) {
	  this.isMyWorkFlow = false;
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      this.currentSelectFlowId = id;
      let params = {
          applicationId: appId,
          status: this.status,
          isMyWorkFlow: this.isMyWorkFlow,
          title: this.motif,
          flowId: id,
          domainId: '',
          initiatorId: this.initiatorId,
          linesPerPage: 10,
          pageNo: 1
        }
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
          }
        }
      )
    },
    //点击滑块触发回调刷新数据
    reluctance() {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
          applicationId: appId,
          status: this.status,
          isMyWorkFlow: this.isMyWorkFlow,
          title: this.motif,
          flowId: this.currentSelectFlowId?this.currentSelectFlowId:'',
          domainId: '',
          initiatorId: this.initiatorId,
          linesPerPage: 10,
          pageNo: 1
        }
      this.$api.getMainProcesseds(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiatorDept: item.initiatorDept,
                initiator: item.initiator,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                formName: item.formName,
              };
            });
            this.preservation = newData;
          }
        }
      )


    }
  }
};
</script>


