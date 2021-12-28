<template>
  <span style="position:realative;">
    <span class="flow-his">
      <span @click="handleDialog" v-if="!finished">
        <!-- <span class="formFlowstateicon obpm-glyphicon" style="color:#4ead49;"></span> -->
        <img src="../assets/images/ic_lczt.png" width="18px" height="18px">
        {{$t('flow.state')}}
        <i class="el-icon-arrow-down"></i>
      </span>
      <span @click="openDialog">
        <img src="../assets/images/ic_lcls.png" width="18px" height="18px"/>
        {{$t('flow.history')}}
      </span>
    </span>

    <!-- 流程状态 -->
    <div class="approvers" v-if="isHandleDialog">
      <div class="a-wrap">
        <div class="tit">
          <span>{{$t('flow.people')}}</span>
          <span>{{$t('flow.point')}}</span>
        </div>
        <div v-if="approversNum<5">
          <div class="first-con-le flow-common">
            <div v-for="(el, i) in currentApproversList.nodes" :key="i">
              <div class="a-list" v-for="(item, index) in el.auditors" :key="index">
                <span>
                  <!-- 有头像时显示头像，否则显示名字后两位 -->
                  <span
                    v-show="!item.photo"
                    class="s1"
                  >{{item.name.substring(item.name.length-2,item.name.length)}}</span>
                  <span class="s2">
                    <img :src="item.photo" />
                  </span>
                </span>
                <span :title="item.name">{{item.name}}</span>
                <span>{{currentApproversList.nodes[i].stateLabel}}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="first-con flow-common" v-if="showAllHandler">
            <div
              class="a-list"
              v-for="(item, index) in firstShowApproversList"
              :key="index"
            >
              <span>
                <span
                  v-show="!item.photo"
                  class="s1"
                >{{item.name.substring(item.name.length-2,item.name.length)}}</span>
                <span class="s2">
                  <img :src="item.photo" />
                </span>
              </span>
              <span :title="item.name">{{item.name}}</span>
              <span
                :title="item.stateLabel"
              >{{item.stateLabel}}</span>
            </div>
            <!-- <div
              class="a-list"
              v-for="(item, index) in currentApproversList.nodes[0].auditors"
              :key="index"
            >
              <span v-if="index<3">
                <span
                  v-show="!item.photo"
                  class="s1"
                >{{item.name.substring(item.name.length-2,item.name.length)}}</span>
                <span class="s2">
                  <img :src="item.photo" />
                </span>
              </span>
              <span v-if="index<3" :title="item.name">{{item.name}}</span>
              <span
                v-if="index<3"
                :title="currentApproversList.nodes[0].stateLabel"
              >{{currentApproversList.nodes[0].stateLabel}}</span>
            </div> -->
            <div class="a-list split-line" @click="AllHandlerData">
              <i class="left"></i>
              <i class="el-icon-arrow-down down"></i>
            </div>
          </div>
          <div class="second-con" v-if="!showAllHandler">
            <el-scrollbar class="scrollbar">
              <div class="divider" >
                <i class="left"></i>
                <i class="el-icon-arrow-down down" @click.stop="AllHandlerData"></i>
              </div>
              <div class="a-list" v-for="(item, index) in allNodes" :key="index">
                <div class="list-wrap">
                  <span>
                    <span
                      v-show="!item.photo"
                      class="s1"
                    >{{item.name.substring(item.name.length-2,item.name.length)}}</span>
                    <span class="s2">
                      <img :src="item.photo" />
                    </span>
                  </span>
                  <span :title="item.name">{{item.name}}</span>
                  <span :title="item.stateLabel">{{item.stateLabel}}</span>
                </div>
              </div>
             </el-scrollbar>
          </div>
        </div>
      </div>
    </div>

    <!-- 流程历史 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :lock-scroll="true"
      :before-close="handleClose"
      top="20px"
      class="flow-history-dialog"
      :title="$t('flow.history')"
      width="62%"
    >
      <div slot="title" class="dialog-title">
        <!-- <img src="../assets/images/ic_lcls.png" width="18px" height="18px"/> -->
        <i class="fa fa-info-circle ic"></i>
        <span class="title-text">{{$t('flow.msg')}}</span>
      </div>
      <div class="dia-con">
        <div class="tab-header">
          <div :class="[activeName=='first'?'':'tab-header-bg','tab-header-left']" @click="handleClick('first')">
            <span :class="[activeName=='first'?'active-tab':'','title']">
              <i class="fa fa-clock-o"></i>
              <span>{{$t('flow.timeline')}}</span>
            </span>
          </div>
          <div :class="[activeName=='second'?'':'tab-header-bg','tab-header-center']" @click="handleClick('second')">
            <span :class="[activeName=='second'?'active-tab':'','title']">
              <i class="fa fa-list-alt"></i>
              <span>{{$t('flow.list')}}</span>
            </span>
          </div>
          <div :class="[activeName=='three'?'':'tab-header-bg','tab-header-right']" @click="handleClick('three')">
            <span :class="[activeName=='three'?'active-tab':'','title']">
              <i class="fa fa-industry"></i>
              <span>{{$t('flow.flowsheet')}}</span>
            </span>
          </div>
        </div>
        <div class="tab-section">
          <div class="flow-history-wrap" v-show="activeName=='first'">
            <el-scrollbar class="scrollbar">
              <div class="content-box">
                <div class="card-btn">
                  <!-- <div class="btn-list">
                    <span @click="cutPage(true)" :class="[isActive == true ? activeClass : '']">{{$t('flow.timeline')}}</span>
                    <span @click="cutPage(false)" :class="[isActive == false? activeClass : '']">{{$t('flow.list')}}</span>
                  </div> -->
                  <div>
                    <el-input
                      :placeholder="$t('placeholder.condition')"
                      @keyup.enter.native="handleIconSearch(searchValue)"
                      v-model="searchValue">
                      <i style="cursor: pointer;" class="el-icon-search" slot="suffix" @click="handleIconSearch(searchValue)"></i>
                    </el-input>
                  </div>
                </div>
                <div
                  class="list-con"
                  :class="[isActive == true ? isOrHidden : currentCard]"
                  v-if="reverseTableData && reverseTableData.length > 0">
                  <div class="step">
                    <div class="p-location">
                      <div class="flow-info-list" v-for="(item, index) in reverseTableData" :key="index">
                        <div class="flow-time">
                          <span>
                            {{item.processtime | formProcesstime}}
                          </span>
                        </div>
                        <div class="flow-detail">
                          <div class="flow-detail-top">
                            <span>
                              <img src="../assets/images/face.jpg" width="24px" height="24px" />
                            </span>
                            <span>{{item.startNodeName}}&nbsp;{{$t('flow.subbmit_in')}}&nbsp;{{item.processtime}}</span>
                          </div>
                          <div class="flow-detail-bottom">
                            <span class="start-node-name">{{item.startNodeName}}</span>
                            <span @mouseover="mover('YES')" @mouseout="mover('NO')">
                              <i v-if="item.flowOperation == 81 " class="fa fa-reply-all" aria-hidden="true" style="color:#f76260;"></i>
                              <i v-else-if="item.flowOperation == 85 " class="fa fa-repeat" aria-hidden="true" style="color:#ffc107;"></i> 
                              <i v-else-if="item.flowOperation == 88 " class="el-icon-remove" aria-hidden="true" style="color:#ffc107;"></i> 
                              <i v-else-if="item.flowOperation == 89 " class="fa fa-repeat" aria-hidden="true" style="color:skyblue;"></i> 
                              <img v-else src="../assets/images/ok.png" />
                            </span>
                            <span class="flow-hidden-info" v-show="isShowStatus">
                              <span>
                                {{item.startNodeName}}
                                <i class="fa fa-hand-o-right"></i>
                              </span>
                              <span v-if="item.flowOperation == '81'">{{$t('flow.back')}}</span>
                              <span v-else-if="item.flowOperation == '85'">{{$t('flow.recall')}}</span>
                              <span v-else-if="item.flowOperation == '88'">{{$t('flow.handup')}}</span>
                              <span v-else-if="item.flowOperation == '89'">{{$t('flow.recover')}}</span>
                              <span v-else-if="item.flowOperation == '91'">{{$t('flow.countersign')}}</span>
                              <span v-else>{{$t('flow.circulation')}}</span>
                              <span>{{item.targetNodeName}}</span>
                            </span>
                          </div>
                          <div class="flow-detail-sug" :style="{'display':(item.attitude || item.signatureImageDate)?'block':'none'}">
                            {{item.attitude}}
                            <span class="img" v-show="item.signatureImageDate">
                              <img :src="item.signatureImageDate" height="40px" alt="">
                            </span>
                          </div>
                        </div>
                        
                      </div>
                      <!-- <span class="location" v-for="(item, index) in reverseTableData" :key="index">
                        <div class="status" v-show="isShowStatus">
                          <span>
                            {{item.startNodeName}}
                            <i class="fa fa-hand-o-right"></i>
                          </span>
                          <span v-if="item.flowOperation == '81'">{{$t('flow.back')}}</span>
                              <span v-else-if="item.flowOperation == '85'">{{$t('flow.recall')}}</span>
                              <span v-else-if="item.flowOperation == '88'">{{$t('flow.handup')}}</span>
                              <span v-else-if="item.flowOperation == '89'">{{$t('flow.recover')}}</span>
                              <span v-else-if="item.flowOperation == '91'">{{$t('flow.countersign')}}</span>
                              <span v-else>{{$t('flow.circulation')}}</span>
                          <span>{{item.targetNodeName}}</span>
                        </div>
                        <span class="local-left">{{item.processtime}}</span>
                        <span class="local-cen">
                          <div class="cen-pic">
                            <span>{{item.auditorName.substring(item.auditorName.length-2,item.auditorName.length)}}</span>
                            <div v-if="item.flowOperation == '91'">{{$t('flow.will')}}</div>
                          </div>
                          <div class="cen-name">
                            <span>{{item.auditorName}}</span>
                            <span v-if="index+1 != stepLength"></span>
                          </div>
                        </span>
                        <span class="local-right">
                          <div class="info">
                            <div class="info-top">
                              <div @mouseover="mover('YES')" @mouseout="mover('NO')">
                                <span>{{item.startNodeName}}</span>
                                <span>
                                  <img src="../assets/images/ok.png" />
                                </span>
                                <div class="iconfont-h5 iconfont-e065 icon-ffc107"></div>
                              </div>
                              <div>{{item.duration}}</div>
                            </div>
                            <div class="photo">
                              <div>{{item.attitude}}</div>
                              <div>
                                <img
                                  :src="item.signatureImageDate"
                                  height="32px"
                                  @click="bigPhoto(item.signatureImageDate)"
                                />
                              </div>
                            </div>
                          </div>
                        </span>
                      </span> -->
                    </div>
                  </div>
                </div>
                <div class="kong" v-else></div>
              </div>
            </el-scrollbar>
          </div>
          <div class="flow-pic-wrap" v-show="activeName=='second'">
            <el-scrollbar class="scrollbar">
              <div class="content-box">
                <div 
                  class="list-con" 
                  v-if="tableData && tableData.length > 0"
                  >
                  <el-table 
                    :data="tableData" 
                    border
                    :header-cell-style="{background:'#EBEFF0',color:'#666666',textAlign:'center',}" 
                    :cell-style="{textAlign:'center'}"
                    :row-class-name="tableRowClassName"
                    style="width: 100%">
                    <el-table-column prop="startNodeName" :label="$t('label.approval_node')" width="180" align="center"></el-table-column>
                    <el-table-column prop="auditorName" :label="$t('label.transactors')" align="center"></el-table-column>
                    <el-table-column prop :label="$t('label.sign_off_act')" align="center">
                      <template slot-scope="scope">
                        <span v-if="scope.row.flowOperation == '81'">{{$t('flow.back')}}</span>
                        <span v-else-if="scope.row.flowOperation == '85'">{{$t('flow.recall')}}</span>
                        <span v-else-if="scope.row.flowOperation == '88'">{{$t('flow.handup')}}</span>
                        <span v-else-if="scope.row.flowOperation == '89'">{{$t('flow.recover')}}</span>
                        <span v-else-if="scope.row.flowOperation == '91'">{{$t('flow.countersign')}}</span>
                        <span v-else-if="scope.row.flowOperation == '8'">{{$t('flow.stop')}}</span>
                        <span v-else>{{$t('flow.circulation')}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop :label="$t('label.sign_off_comments')" align="center">
                      <!-- 图片的显示 -->
                      <template slot-scope="scope">
                        {{scope.row.attitude}}
                        <img
                          :src="scope.row.signatureImageDate"
                          style="height:32px;"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop :label="$t('label.receiver')" align="center">
                      <!-- 图片的显示 -->
                      <template slot-scope="scope">
                        {{scope.row.receiverInfo | setReceiver}}
                        <!-- {{scope.row.receiverInfo?JSON.parse(scope.row.receiverInfo).users[0].username:''}} -->
                      </template>
                    </el-table-column>
                    <el-table-column prop="processtime" :label="$t('label.processing_time')" align="center" width="200"></el-table-column>
                  </el-table>
                </div>
                <div class="kong" v-else></div>
              </div>
            </el-scrollbar>
          </div>
          <div class="flow-pic-wrap" v-show="activeName=='three'">
            <el-scrollbar class="scrollbar">
              <div class="content-box">
                <div class="flow-chart" style="font-size:11px; font-weight:bold;">
                  <div
                    class="free-flow"
                    v-if="(approversData && approversData[0].flowName == $t('flow.free_flow')) || isFreeFlow"
                  >
                    <i class="fa fa-file-image-o fa-5x" aria-hidden="true"></i>
                    <div>{{$t(flow.free_flow_noflowsheet)}}</div>
                  </div>
                  <div class="pic-box" v-else>
                    <div style="z-index:10000">
                      {{$t('flow.explain_word')}}：
                      1、
                      <span style="color:red;">{{$t('flow.red_line')}}</span>{{$t('flow.node_now')}}2、
                      <span style="color:green;">{{$t('flow.green_line')}}</span>{{$t('flow.has_line')}}3、
                      <span style="color:black;">{{$t('flow.black_line')}}</span>{{$t('flow.wait_line')}}
                      <!-- <br />&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;4、
                      <span
                        style="background:yellow;color:black;"
                      >黄色背景</span>代表流程已终止。 -->
                    </div>
                    <div class="flow-pic" @mousewheel.prevent="rollImg">
                      <img :src="`${flowChart+'?'+now}`" alt="" :style="{transform:'scale(' +scaleNum+')'}" class="imgDiv" @mousedown="move"/>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-dialog>
    <div class="big-pic" v-show="show" @click.prevent.stop="hiddenBigPhoto">
      <div class="pic-container" :title="$t('click_close')" @click.prevent.stop="hiddenBigPhoto">
        <img :src="bigPhotoSrc" />
      </div>
    </div>
    <div class="mask"  v-if="isHandleDialog" @click.stop.prevent="hiddenFlowStatus()"></div>
  </span>
</template>
<script>
import API from "@/api.js";
// import { constants } from "crypto";
// import { connect } from "tls";
import Constant from "@/Constant.js";
export default {
  props: ["flowinfo", "approversData", "stateId",'openParams'],
  computed: {
    now() {
      return Date.now();
    },
  },
  data: function () {
    return {
      searchValue: "",
      dialogVisible: false,
      isHandleDialog: false,
      activeName: "first",
      isActive: true,
      activeClass: "active",
      tableData: [],
      isOrHidden: "hidden-card",
      currentCard: "no-hidden",
      stepLength: "",
      show: false,
      bigPhotoSrc: "",
      flowChart: "",
      flowPhoto: "",
      showAllHandler: true,
      reverseTableData: [],
      isShowStatus: false,
      currentApproversList: "",
      finished: "",
      approversNum: "",
      allNodes: [],
      isFreeFlow: false, //是否是自由流程
      Constant,
      scaleNum:0.9,
      zoom:'',
      firstShowApproversList: [],
    };
  },
  mounted: function () {
    //this.getAvatar()
    this.setCurrentApprovers();
  },

  methods: {
    hiddenFlowStatus(){
      this.isHandleDialog = false;
    },

    tableRowClassName({row, rowIndex}){
      if (rowIndex%2!=0) {
        return 'table-row-color';
      } else {
        return '';
      }
    },

    // 拖动图片
    move(e) {
      e.preventDefault()
      // 获取元素
      var flowPic = document.querySelector('.flow-pic')
      var img = document.querySelector('.imgDiv')
      var x = e.pageX - img.offsetLeft
      var y = e.pageY - img.offsetTop
      // 添加鼠标移动事件
      flowPic.addEventListener('mousemove', move)
              function move(e) {
              img.style.left = e.pageX - x + 'px'
              img.style.top = e.pageY - y + 'px'
              }
      // 添加鼠标抬起事件，鼠标抬起，将事件移除
      img.addEventListener('mouseup', function() {
          flowPic.removeEventListener('mousemove', move)
      })
      // 鼠标离开父级元素，把事件移除
      flowPic.addEventListener('mouseout', function() {
          flowPic.removeEventListener('mousemove', move)
      })
    },

    // 缩放图片
    rollImg() { 
      /* 获取当前页面的缩放比 若未设置zoom缩放比，则为默认100%，即1，原图大小 */ 
      let zoom = parseInt(this.zoom) || 100;
      /* event.wheelDelta 获取滚轮滚动值并将滚动值叠加给缩放比zoom wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动 */ 
      zoom += event.wheelDelta / 12;
        /* 最小范围 和 最大范围 的图片缩放尺度 */ 
      if (zoom >= 5 && zoom <500) { 
        this.zoom = zoom + "%"; 
        let zoomNum = zoom/100;
        this.scaleNum = zoomNum;
      }
      return false; 
    },
 
    handleIconSearch() {
      this.dialogVisible = true;
      let appId = this.openParams.appId,
        docId = this.$parent.getDocId();
      let content = "";
      if (this.searchValue) {
        content = this.searchValue;
      }
      API.getFlowHistorys(appId, docId, content, {
        onSucess: (response) => {
          if (response.data.data) {
            let allData = response.data.data;
            this.tableData = response.data.data;
            this.reverseTableData = response.data.data;
            this.stepLength = this.tableData.length;
            this.$forceUpdate();
          } else {
            this.tableData = [];
            this.reverseTableData = [];
          }
        },
      });
    },

    mover(val) {
      if (val == "YES") {
        this.isShowStatus = true;
      } else if (val == "NO") {
        this.isShowStatus = false;
      }
    },

    setCurrentApprovers() {
      if (this.flowinfo.approvers) {
        if (!this.flowinfo.approvers[0].nodes[0].nodeId) {
          this.finished = true
        }
        let firstShowApproversList = []
        for (let i = 0; i < this.flowinfo.approvers.length; i++) {
          if (this.flowinfo.stateId == this.flowinfo.approvers[i].instanceId) {
            this.currentApproversList = this.flowinfo.approvers[i]
            let arr = this.flowinfo.approvers[i]
            let approversNum = 0
            for (let i = 0; i < arr.nodes.length; i++) {
              approversNum += arr.nodes[i].auditors.length
              let nodes = arr.nodes[i]
              if (nodes.auditors.length > 0) {
                for (let j = 0; j < nodes.auditors.length; j++) {
                  nodes.auditors[j].stateLabel = nodes.stateLabel
                }
                if(firstShowApproversList.length <3) {
                  firstShowApproversList = firstShowApproversList.concat(nodes.auditors)
                }
                this.allNodes = this.allNodes.concat(nodes.auditors)
              }
            }
            this.approversNum = approversNum
          }
        }
        this.firstShowApproversList = firstShowApproversList
      }
    },
    // getAvatar(){
    //   if(this.approversData && this.approversData[0].nodes[0]) {
    //     let allAvatar = this.approversData[0].nodes[0].auditors;
    //     for(let i=0; i<allAvatar.length; i++) {
    //       API.getAvatar(
    //         allAvatar[i].id,
    //         {
    //           onSucess: response => {
    //             this.approversData[0].nodes[0].auditors[i].photo = response.data.data
    //           }
    //         }
    //       )
    //     }
    //   }
    // },

    AllHandlerData() {
      this.showAllHandler = !this.showAllHandler;
    },

    hiddenBigPhoto() {
      this.show = false;
    },

    bigPhoto(picSrc) {
      this.bigPhotoSrc = picSrc;
      this.show = true;
    },

    openDialog() {
      this.dialogVisible = true;
      let appId = this.openParams.appId,
        docId = this.$parent.getDocId();
      let content = "";
      if (this.searchValue) {
        content = this.searchValue;
      }
      API.getFlowHistorys(appId, docId, content, {
        onSucess: (response) => {
          let td = response.data.data;
          if (
            td &&
            td.length > 0 &&
            td[0].auditorId == td[0].startNodeId
          ) {
            //判断是否是流程
            this.isFreeFlow = true;
          }
          this.tableData = td;
          this.reverseTableData = response.data.data; //.reverse();
          this.stepLength = this.tableData.length;
        },
      });

      let instanceId = this.stateId;
      let dateTime = new Date().getTime();
      this.flowPhoto = this.stateId;
      API.getFlowchart(this.openParams.appId, docId, instanceId, dateTime, {
        onSucess: (response) => {
          //this.flowChart = "http://" + path + "/obpm/" + response.data.data.currentFlowChart;
          this.flowChart = obpmConfig.obpmFilePath + '/' + response.data.data.currentFlowChart;
        },
      });
    },

    /**
     * 计算日期差
     * @param date,date2
     */
    numOfDayCalc: function (date, date2) {
      let startDateArr = date.split(/[- :]/);
      let startDate = new Date(
        startDateArr[0],
        startDateArr[1] - 1,
        startDateArr[2]
      );
      let years, month, nowDate;
      if (!date2 || date2 == "") {
        years = new Date().getFullYear();
        month = new Date().getMonth();
        let date = new Date().getDate();
        nowDate = new Date(years, month, date);
      } else {
        nowDate = new Date(date2);
      }
      let msDate = nowDate.getTime() - startDate.getTime();
      //计算出相差天数
      let numOfDay = Math.floor(msDate / (24 * 3600 * 1000));

      return numOfDay;
    },

    calculateTime(_time) {
      let _timeAgo;
      let flowTime = new Date(_time);
      let timeFixArr = _time.split(/[- :]/);
      let timeFixDate = new Date(
        timeFixArr[0],
        timeFixArr[1] - 1,
        timeFixArr[2],
        timeFixArr[3],
        timeFixArr[4]
      );
      let Month = timeFixDate.getMonth() + 1;
      let Day = timeFixDate.getDate();
      let Hour = timeFixDate.getHours();
      let Minute = timeFixDate.getMinutes();
      let _date = _time.substr(0, _time.indexOf(" "));
      if (this.numOfDayCalc(_date) > 2) {
        if (Month >= 10) {
          _timeAgo = Month + "-";
        } else {
          _timeAgo = "0" + Month + "-";
        }
        if (Day >= 10) {
          _timeAgo += Day + " ";
        } else {
          _timeAgo += "0" + Day;
        }
      } else if (this.numOfDayCalc(_date) == 2) {
        _timeAgo = this.$t('date.last_day');
        if (Hour >= 10) {
          _timeAgo += Hour + ":";
        } else {
          _timeAgo += "0" + Hour + ":";
        }
        if (Minute >= 10) {
          _timeAgo += Minute;
        } else {
          _timeAgo += "0" + Minute;
        }
      } else if (this.numOfDayCalc(_date) == 1) {
        _timeAgo = this.$t('date.yesday');
        if (Hour >= 10) {
          _timeAgo += Hour + ":";
        } else {
          _timeAgo += "0" + Hour + ":";
        }
        if (Minute >= 10) {
          _timeAgo += Minute;
        } else {
          _timeAgo += "0" + Minute;
        }
      } else if (
        this.numOfDayCalc(_date) == 0 &&
        this.daysCalc(_time).hours > 0
      ) {
        _timeAgo = this.daysCalc(_time).hours +  this.$t('date.hour_ago');
      } else if (
        this.numOfDayCalc(_date) == 0 &&
        this.daysCalc(_time).hours <= 0 &&
        this.daysCalc(_time).minutes > 5
      ) {
        _timeAgo = this.daysCalc(_time).minutes + this.$t('date.min_ago');
      } else {
        _timeAgo = this.$t('date.now');
      }
      return _timeAgo;
    },

    /**
     * 计算时间差
     * @param date,date2
     */
    daysCalc: function (date, date2) {
      let startDateArr = date.split(/[- :]/);
      let startDate = new Date(
        startDateArr[0],
        startDateArr[1] - 1,
        startDateArr[2],
        startDateArr[3],
        startDateArr[4],
        startDateArr[5] != undefined && startDateArr[5] != ""
          ? startDateArr[5]
          : 0
      );
      let nowDate;
      if (!date2 || date2 == "") {
        nowDate = new Date();
      } else {
        nowDate = new Date(date2);
      }
      let msDate = nowDate.getTime() - startDate.getTime();
      //计算出相差天数
      let days = Math.floor(msDate / (24 * 3600 * 1000));
      //计算出小时数
      let leave1 = msDate % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      let hours = Math.floor(leave1 / (3600 * 1000));
      //计算相差分钟数
      let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      let minutes = Math.floor(leave2 / (60 * 1000));
      //计算相差秒数
      let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      let seconds = Math.round(leave3 / 1000);
      //alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒");
      let timeCalc = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      };
      return timeCalc;
    },

    handleClose() {
      this.dialogVisible = false;
    },

    handleDialog() {
      this.isHandleDialog = !this.isHandleDialog;
    },

    handleClick(val) {
      this.activeName = val;
    },

    cutPage(val) {
      this.isActive = val;
    },
  },
  filters: {
    formProcesstime(value){
      if(value) {
        let time = value.split(" ")[0];
        return time;
      }else {
        return '';
      }
    },
    setReceiver: function (value) {
      if (value) {
        let arr = JSON.parse(value).users;
        let name = "";
        if (arr && arr.length > 0) {
          for (let i = 0; i < arr.length; i++) {
            name += arr[i].username + ";";
          }
        }
        name = name.replace(/^(\s|;)+|(\s|;)+$/g, "");
        return name;
      }
    },
  },
};
</script>


