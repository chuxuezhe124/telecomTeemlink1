<template>
  <div id="main_pending" v-loading="loading">
    <div class="main_pending-left">
      <div 
        class="main_pending-left-dyspepsia" 
        v-for="(item, index) in softwareList" 
        :key="index" 
        @click="setCurrentSoftware(item.id, index)">
        <span>{{item.name}}</span>
        <a :class="[!currentSelectFlowId && currentAppId == item.id ? 'headNum':'']" v-if="item.pendingFlowList && item.pendingFlowList.length > 0">
          <b>{{item.pendingFlowList[item.pendingFlowList.length-1].num}}</b>
        </a>
      </div>
      <ul>
        <li
          class="soft-heading"
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
    </div>

    <!--右边-->
    <div class="main_pending-right">
      <div class="main_pending-right-theme">
        <div class="main_pending-right-right">
          <div class="right-header">
            <span class="right-read-btn">
              <div class="btn btn-add" @click="allSubmit">
                <i class="el-icon-s-promotion"></i>&nbsp;
                {{$t('view.all_submit')}} 
              </div>
            </span>
            <span class="right-read-btn">
              <div class="btn btn-add" @click="markAsRead">
                <!-- <i class="el-icon-document-add"></i>&nbsp; -->
                {{$t('view.all_read')}}
              </div>
            </span>
            <el-input 
              v-model="backlogRight" 
              :placeholder="$t('placeholder.theme')" 
              @input="activate">
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
            </span>
            <span class="right-btn">
              <div class="btn btn-clear" @click="eliminating">
                <i class="el-icon-delete"></i>&nbsp;{{$t('btns.clean')}}
              </div>
            </span>
            <span class="right-btn">
              <div class="btn btn-search"  @click="flowcenters">
                <i class="el-icon-search"></i>&nbsp;
                {{$t('placeholder.search')}}
              </div>
            </span>
          </div>
        </div>
      </div>
      <div class="view-list">
        <el-scrollbar class="scrollbar">
          <el-table 
            class="view-table" 
            :data="Formrendering"
            :header-cell-style="{background:'#EBEFF0',color:'#666666'}" 
            :row-class-name="tableRowClassName"
            @row-click="onRowClick"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="40">
            </el-table-column>
            <el-table-column 
              width="150"
              :label="$t('placeholder.applyer')" 
              align="center">
              <template slot-scope="scope">
                <div class="applicant">
                  <div class="avatar-box">
                    <span class="avatar">
                      {{scope.row.initiator.substring(scope.row.initiator.length-2,scope.row.initiator.length)}}
                    </span>
                    <span class="red-dot" v-if="!scope.row.read"></span>
                    <span class="isagent" v-if="scope.row.isagent">{{$t('profile.agent')}}</span>
                  </div>
                  <div class="app-right">
                    {{scope.row.initiatorDept}}{{scope.row.initiatorDept&&scope.row.initiator?'  ':''}}{{scope.row.initiator}}
                  </div>
                </div>
                <!--  -->
              </template>

            </el-table-column>
            <el-table-column 
              :label="$t('placeholder.theme')" 
              align="center">
              <template slot-scope="scope">
                <!-- <span v-html="scope.row.subject?scope.row.subject.summaryText:''">
                </span> -->
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
            :total="row_count"
            @current-change="paging($event)"
          ></el-pagination> 
        </div>
        
      </div>
      
      <!--弹出框-->
      <!-- <el-dialog title="选择用户" :visible.sync="dialogVisible" width="60%">
        <el-tabs v-model="activeName">
          <el-tab-pane :label="按角色" name="first">
            <div class="first-box">
              <div class="first-item">
                <span>角色列表:</span>
                <ul>
                  <li v-for="item in Storage" :key="item.id" @click="selected(item.id)">
                    <span>{{item.name}}</span>
                  </li>
                </ul>
              </div>
              <el-transfer
                v-model="Shuttle"
                :data="userSublist"
                :titles="['角色','已选用户']"
                :props="{key:'id',label:'name'}"
              ></el-transfer>
            </div>
          </el-tab-pane>
          <el-tab-pane label="按部门" name="second">
            <div class="first-box">
              <div class="first-item">
                <span>{{$t('department_list')}:</span>
                <div class="first-list">
                  <el-tree
                    node-key="id"
                    show-checkbox
                    :props="props"
                    :load="loadNode"
                    lazy
                    @node-click="handelDepartment($event)"
                  ></el-tree>
                </div>
              </div>
              <el-transfer :titles="['部门：','已选择用户:']" v-model="ChildList"></el-transfer>
            </div>
          </el-tab-pane>
          <el-tab-pane label="在线用户" name="third">角色管理</el-tab-pane>
          <el-tab-pane label="通讯录" name="fourth">定时任务补偿</el-tab-pane>
          <el-tab-pane label="查询" name="five">角色管理</el-tab-pane>
        </el-tabs>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">{{$t('btns.cancel')}}</el-button>
          <el-button type="primary" @click="dialogVisible = false">{{$t('btns.sure')}}</el-button>
        </span>
      </el-dialog> -->
    </div>
    <!--流程指定审批人弹窗-->
    <div class="comm-dialog">
      <comm-dialog
        :title="$t('view.select_user')"
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
      softwareList: [], //软件列表
      currentSoftwareFlowList: [], //当前软件流程列表
      putaside: [],
      Formrendering: [], //表格里面首次渲染的数据
      backlogRight: "", //$t('placeholder.theme')框的v-model
      backlogProposer: "", //申请框的v-model
      ChildList:'',//按部门的穿梭框的v-model
      dialogVisible: false, //弹出框是否弹出
      activeName: "first", //标签页默认选中第一个
      Storage: [], //储存按角色为树形的用户数据
      Shuttle: "", //按角色的穿梭框的v-model
      userSublist: [], //按角色储存子列表的数据
      DepartmentSublist:[],//按部门储存子列表数据
      submitDocId: [], //流程中心中我的待办里面的{{$t('view.all_submit')}}按钮选中的那一行，存储在一个数组里面，这里是存储该数组的docId属性
       
      //按部门选择的节点展示
      props: {
        label: "name",
        children: "zones",
        isLeaf: "leaf"
      },
      row_count:0,
      isUpcoming:true,
      initiatorId:'',
      currentSelectFlowId:'',
      currentAppId: '', //当前appId
    };
  },
  created() {
    this.navigation();
    // this.getAllSoftwareList();
    // this.flowcenters();
  },
  methods: {
    handleSelectionChange(v){
      this.submitDocId =  v.map(item => item.docId)
    },
    //全部提交按钮
    allSubmit() {
      let attitude = '';
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let doJson = {
        actId: '',
        attitude,
        docIds:this.submitDocId,
        limistStrList:'',
        remark: '',
      }
      this.$api.batchApprove(appId, doJson, {
        onSucess: res => {
          if( res.data.errcode == 0) {
            this.$notify.success({//弹窗
              title: this.$t('success'),
              message: res.data.data.content,
            });
            this.navigation();//刷新界面
          }else if(res.data.errcode==4001){
            this.$notify.error({
              title: this.$t('msg.err'),
              message: res.data.errmsg,
            });
          }
        },
        onError:(error) => {
          if(error.response.data) {
            if(error.response.data.errcode == 500) {
              let errmsg;
              if(error.response.data.errmsg == 'Please choose one') {
                errmsg = this.$t('msg.select_atLeastOne')
              }
              this.$notify({
                title: this.$t('msg.err'),
                message: errmsg,
                type: 'error'
              });
            }
          }
        }
      });
    },
    markAsRead(){
      this.$api.markAsRead(
        {
          onSucess: res=> {
            if(res.data.errcode == 0) {
              this.$notify({
                title: this.$t('success'),
                message: '',
                type: 'success'
              });
              this.navigation();
            }
          }
        }
      )
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

    tableRowClassName({row, rowIndex}) {
      row.index = rowIndex;
      if (rowIndex%2!=0) {
        return 'table-row-color';
      } else {
        return '';
      }
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
      this.Formrendering[row.index].read = true;
      this.$forceUpdate();

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
        this.currentSoftwareFlowList = softwareList[index].pendingFlowList.slice(0,softwareList[index].pendingFlowList.length-1);
        this.currentAppId = softwareList[index].id;
      }
      let params = {
          title: '',
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: this.initiatorId,
        }
      this.$api.getMainPendings(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              let flowName = item.auditorNames.split(",");
              let isagent = true;
              for(let i = 0; i < flowName.length; i ++) {
                if(flowName[i] == this.$store.state.myProfile.name) {
                  isagent = false;
                }
              }
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
                auditorNames: item.auditorNames, //代理
                isagent: isagent,
              };
            });
            this.Formrendering = newData;
          }
        }
      )
    },

     //点击重新加载表格数据
    primaryNavigationSystem() {
      this.currentSelectFlowId = '';
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
          title: '',
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: this.initiatorId,
        }
      this.$api.getMainPendings(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
              };
            });
            this.Formrendering = newData;
          }
        }
      )
   
   },

    //服务器返回待办导航的结果
    navigation() {
      // let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      this.$api.getPendings(
        '',
        {
          onSucess: res => {
            let softwareList = res.data.data;
            this.softwareList = softwareList;
            if(softwareList && softwareList.length > 0) {
              this.currentSoftwareFlowList = softwareList[0].pendingFlowList.slice(0,softwareList[0].pendingFlowList.length-1);
              this.currentAppId = softwareList[0].id;
              this.flowcenters();
            }else {
              this.loading = false;
            }
          }
        }
      )
    },

    getAllSoftwareList() {
      //let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      this.$api.getNavsPeddings(
        '',
        {
          onSucess: res => {
            let newData = res.data.data.map(item => {
              return {
                id: item.id,
                name: item.name
              };
            });
            this.putaside = newData;
          }
        }
      )
    },

    //获取待办事项
    flowcenters() {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
          title: this.backlogRight,
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: this.initiatorId,
          flowId: this.currentSelectFlowId,
        }
      this.$api.getMainPendings(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let docs = res.data.data.datas;
            this.loading = false;
            if(docs && docs.length > 0) {
              let newData = docs.map(item => {
                let flowName = item.auditorNames.split(",");
                let isagent = true;
                for(let i = 0; i < flowName.length; i ++) {
                  if(flowName[i] == this.$store.state.myProfile.name) {
                    isagent = false;
                  }
                }
                return {
                  formId: item.formId,
                  docId: item.docId,
                  initiator: item.initiator,
                  initiatorDept: item.initiatorDept,
                  lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime))this.writeCurrentDate(item.lastProcessTime), //.substring(5, 10),
                  lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                  stateLabel: item.stateLabel,
                  subject: item.subject,
                  read:item.read,
                  formName: item.formName,
                  auditorNames: item.auditorNames, //代理
                  isagent: isagent,
                };
              });
              this.Formrendering = newData;
            }else {
              this.Formrendering = []
            }
            
          }
        }
      )
    },
    //{{$t('btns.clean')}}$t('placeholder.theme')框和申请框里面面对数据
    eliminating() {
      this.backlogProposer = '';
      this.initiatorId = '';
    },
    //分页请求
    paging(num) {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      let params = {
          linesPerPage: 10,
          pageNo: num,
          flowId: this.currentSelectFlowId,
          applicationId: appId,
          domainId: '',
          initiatorId: this.initiatorId,
        }
      this.$api.getMainPendings(
        appId,
        params,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              let flowName = item.auditorNames.split(",");
              let isagent = true;
              for(let i = 0; i < flowName.length; i ++) {
                if(flowName[i] == this.$store.state.myProfile.name) {
                  isagent = false;
                }
              }
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
                auditorNames: item.auditorNames, //代理
                isagent: isagent,
              };
            });
            this.Formrendering = newData;
          }
        }
      )
    },
    //$t('placeholder.theme')框的出发事件
    activate() {
      if (this.backlogRight.length === 0) {
        console.log("--->0");
      }
    },
    //点击左侧导航触发待办事项
    onClickSoftware(id) {
      let appId = this.openParams.appId ? this.openParams.appId : this.currentAppId;
      this.currentSelectFlowId = id;
      this.$api.getMainPendings(
        appId,
        {
          flowId: id
        },
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              let flowName = item.auditorNames.split(",");
              let isagent = true;
              for(let i = 0; i < flowName.length; i ++) {
                if(flowName[i] == this.$store.state.myProfile.name) {
                  isagent = false;
                }
              }
              return {
                formId: item.formId,
                docId: item.docId,
                initiator: item.initiator,
                initiatorDept: item.initiatorDept,
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime), //dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)).substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
                auditorNames: item.auditorNames, //代理
                isagent: isagent,
              };
            });
            this.Formrendering = newData;
          }
        }
      )
    },
   
    //点击添加弹出
    AddPopup() {
      this.dialogVisible = true;
    },
  }
};
</script>
<style lang="scss" scoped>

</style>


