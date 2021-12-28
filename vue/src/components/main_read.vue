<template>
  <div id="main_pending" v-loading="loading">
    <div class="main_pending-left">
      <div class="main_pending-left-dyspepsia" @click="primaryNavigationSystem" >
        <span>{{preserveObj.name}}</span>
        <a :class="[!currentSelectFlowId?'headNum':'']" v-if="preserveObj && preserveObj.total > 0">
          <b>{{preserveObj.total}}</b>
        </a>
      </div>
      <ul>
        <span class="noData" v-if="preserve.length==0">暂无数据</span>
        <li
          class="soft-heading"
          v-for="(item,index) in preserve"
          :key="index"
          @click="omniselector(item.id)"
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
          >
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
                <!-- <span v-html="scope.row.subject?scope.row.subject:''">
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
            layout="prev, pager, next,jumper"
            :page-size="10"
            :current-page="1"
            :total="row_count"
            @current-change="paging($event)"
          ></el-pagination>
        </div>
        
      </div>
      
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
  components: {
    form_selectApprover_flowpanel,
  },
  data() {
    return {
      loading:true,
      preserve: [],
      preserveObj: {},
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
    };
  },
  created() {
    this.navigation();
    this.flowcenters();
    //this.selectbox();
  },
  methods: {
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
    onRowClick(row, column, event ) {
      console.log("row--->",row.index);
      
      let params = {
        appId: this.$root.appid,
        linkType:'00',
        actionContent:row.formId,
        name: row.formName,
        docId:row.docId,
        _select:row.docId,
        refreshId:'11',
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
      let hour=now.getHours(); 
      let minute=now.getMinutes(); 
      let second=now.getSeconds(); 
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },

    //服务器返回待办导航的结果
    navigation() {
      //applicationId=&isread=true&_=1594186597018
      this.$api.navCarboncopy(
        {
          applicationId: this.$root.appid,
          isread: true,
          _:new Date().getTime(),
        },
        {
          onSucess: res => {
            let newData = res.data.data[0].carboncopyFlowList.map(item => {
              return {
                id: item.id,
                name: item.name,
                num: item.num
              };
            });
            this.preserveObj = {
              name: res.data.data[0].name,
              total: newData[newData.length-1].num,
            }
            this.preserve = newData.slice(0,newData.length-1);
          }
        }
      )
    },
   
    //获取待办事项
    flowcenters() {
      let appId = this.$root.appid;
      let params = {
          title: this.backlogRight,
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: this.initiatorId,
          flowId: this.currentSelectFlowId,
          isRead: true,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
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
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)), //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
              };
            });
            this.Formrendering = newData;
            this.loading = false;
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
      let appId = this.$root.appid;
      let params = {
          title: this.backlogRight,
          linesPerPage: 10,
          pageNo: num,
          initiatorId: this.initiatorId,
          flowId: this.currentSelectFlowId,
          isRead: true,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
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
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)) //.substring(5, 10),
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
    //$t('placeholder.theme')框的出发事件
    activate() {
      if (this.backlogRight.length === 0) {
        console.log("--->0");
      }
    },
    //点击左侧导航触发待办事项
    omniselector(id) {
      let appId = this.$root.appid;
      this.currentSelectFlowId = id;
      let params = {
          title: this.backlogRight,
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: this.initiatorId,
          flowId: id,
          isRead: true,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
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
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)), //.substring(5, 10),
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
    //点击重新加载表格数据
    primaryNavigationSystem() {
      this.currentSelectFlowId = '';
      let appId = this.$root.appid;
      let params = {
          title: '',
          linesPerPage: 10,
          pageNo: 1,
          initiatorId: '',
          flowId: '',
          isRead: true,
          isMyWorkFlow: false,
          appId: this.$root.appid,
          _: new Date().getTime(),
        }
      this.$api.getCarboncopyList(
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
                lastProcessTime: this.writeCurrentDate(item.lastProcessTime),//dateFormat.calculateTime(this.writeCurrentDate(item.lastProcessTime)), //.substring(5, 10),
                lastFlowOperation: (item.lastFlowOperation = this.$t('flow.circulation')),
                stateLabel: item.stateLabel,
                subject: item.subject,
                read:item.read,
                formName: item.formName,
              };
            });
            this.Formrendering = newData;
            this.loading = false;
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


