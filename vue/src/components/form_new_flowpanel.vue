<template>
  <div style="height:97%" class="flow-panel-box">
    <!--加签主办（协办）-->
    <div v-if="act.type == 57 || act.type == 58" class="process-host">
      <!--加签主办与协办-->
      <form_processHosting_flowpanel
        :act="act"
        :openParams="openParams"
        :buildFormData="buildFormData"
        :approvers="approvers"
        :newHostOrCohostList="newHostOrCohostList"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </div>

    <!--其他流程-->
    <div class="flow-wrap" v-else>
      <!--补签-->
      <div class="refer" v-if="act.type == 56">
        <div class="t-box">
          <div class="sug-left">{{$t('suggest')}}:</div>
          <div class="idea-textbox">
            <el-input
              class="idea-box"
              type="textarea"
              :rows="7"
              :placeholder="$t('view.input_ss')"
              maxlength="300"
              v-model="attitude"
            >
            </el-input>
          </div>
        </div>
      </div>

      <!--点评-->
      <div class="refer" v-else-if="act.type == 55">
        <div class="t-box">
          <div class="sug-left">{{$t('suggest')}}:</div>
          <div class="idea-textbox">
            <el-input
              class="idea-box"
              type="textarea"
              :rows="7"
              :placeholder="$t('view.input_ss')"
              maxlength="300"
              v-model="attitude"
            >
            </el-input>
          </div>
        </div>
      </div>

      <!--流程提交-->
      <div class="refer" v-else>
        <div class="refer-top">
          <!-- <img src="../assets/images/ic_tjz_s.png" width="18px" height="18px" /> -->
          <span v-if="act && act.type == 47"> {{$t('view.back_to')}}: </span>
          <span v-if="act && act.type == 48"> {{$t('view.push_for')}}: </span>
          <span v-if="act.type != 47 && act.type != 48"> {{$t('view.submit_to')}}: </span>
        </div>
        <div class="refer-footer"
          v-if="act.type != 47 && act.type != 48 && act.type != 33 && act.type != 52"
        >
          <!-- <el-scrollbar class="scrollbar"> 隐藏会有一个问题，那就是如果节点很多，那么可能导致高度太高，但是不隐藏，节点会一直被遮挡，因为没有固定高度 -->
            <div class="free-flow" v-if="act.workFlowType == 1">
              <div class="list-right">
                <div class="add" v-if="!approverName" @click="select()">+</div>
                <div v-else>
                  <el-tag
                    :key="approverName"
                    closable
                    :id="nextUserId"
                    @close="onTabClose(nextUserId)"
                  >
                    {{ approverName }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="refer-radio" v-if="!isSplit">
                <span class="refer-radio-group">
                  <el-radio-group v-model="nextNodeIds">
                    <el-radio
                      v-for="(item, index) in selectData"
                      :key="index"
                      :label="item.id"
                    >
                      <span class="refer-radio-node" :title="item.name">{{item.name}}</span>
                      <div class="check-input-box" v-if="item.isToPerson" 
                        @click="
                          selectApprovers(
                            item.isToPerson,
                            item.id,
                            item.submitTo,
                            item.approverNumType,
                            '',
                            item.groupNum,
                            index
                          )
                        "
                      >
                        <span class="check-input">
                          <el-input
                            v-if="item.checkedOnSinglePerson"
                            :value="item.approverName"
                            :placeholder="$t('view.point')"
                          ></el-input>
                          <el-input
                            v-else
                            v-model="item.approverName"
                            :placeholder="$t('view.point')"
                          ></el-input>
                        </span>
                        <span 
                          class="icon-peo" 
                          :style="{display: item.checkedOnSinglePerson && item.isARole?'none':''}"
                        >
                          <i class="fa fa-user-o fa-lg"></i>
                        </span>
                      </div>
                    </el-radio>
                  </el-radio-group>
                </span>
              
                <span class="check-input-wrap" v-if="isAppentCirculator" >
                  <span class="check-input-box" 
                    @click="
                      selectApprovers(
                        '',
                        currentNodeId,
                        isAppentData.submitTo,
                        '',
                        isAppentCirculator
                      )"
                  >
                    <span class="check-input">
                      <span>{{$t('view.cc')}}&nbsp;&nbsp;</span>
                      <el-input
                        v-model="isAppentData.approverName"
                        :placeholder="$t('placeholder.select')"
                      ></el-input>
                    </span>
                    <span class="icon-peo">
                      <i class="fa fa-user-o fa-lg"></i>
                    </span>
                  </span>
                </span>
              </div>

              <div class="refer-check" v-if="isSplit">
                <span class="refer-radio-group">
                  <el-checkbox-group
                    v-model="nextNodeIds"
                  >
                    <el-checkbox
                      v-for="(item, index) in selectData"
                      :label="item.id"
                      :key="index"
                      :disabled="item.locked"
                    >
                      <span class="refer-radio-node" :title="item.name">{{ item.name }}</span>
                      <div class="check-input-box" v-if="item.isToPerson" 
                        @click.stop.prevent="
                        selectApprovers(
                          item.isToPerson,
                          item.id,
                          item.submitTo,
                          item.approverNumType,
                          '',
                          item.groupNum,
                          index
                        )
                      "
                      >
                        <span class="check-input">
                          <el-input
                            v-model="item.approverName"
                            :placeholder="$t('view.point')"
                          ></el-input>
                        </span>
                        <span 
                          class="icon-peo" 
                          :style="{display: item.checkedOnSinglePerson && item.isARole?'none':''}"
                          >
                          <i class="fa fa-user-o fa-lg"></i>
                        </span>
                      </div>
                    </el-checkbox>
                  </el-checkbox-group>
                </span>

                <span class="check-input-wrap" v-if="isAppentCirculator">
                  <span class="check-input-wrap">
                    <span class="check-input-box"
                      @click="
                        selectApprovers(
                          '',
                          currentNodeId,
                          isAppentData.submitTo,
                          '',
                          isAppentCirculator
                        )
                      "
                    >
                      <span class="check-input">
                        <span>{{$t('view.cc')}}&nbsp;&nbsp;</span>
                        <el-input
                          v-model="isAppentData.approverName"
                          :placeholder="$t('placeholder.select')"
                        ></el-input>
                      </span>
                      <span class="icon-peo">
                        <i class="fa fa-user-o fa-lg"></i>
                      </span>
                    </span>
                  </span>
                </span>
              </div>
            </div>
          <!-- </el-scrollbar> -->
        </div>
        <div class="refer-footer refer-footer-comm" v-if="act.type == 33">
          <el-select v-if="processNodes" v-model="selectProcessNode">
            <el-option
              v-for="(item, index) in processNodes"
              :key="index"
              :label="item.subject"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <div v-if="processNodeList.length > 1">
            <el-checkbox-group v-model="selectProcessNodeUser">
              <el-checkbox
                v-for="(item, index) in processNodeList"
                :label="item.id"
                :key="index"
                >{{ item.name }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
          <div v-if="selectProcessNodeUserRadio" style="margin-top: 5px">
            <el-radio-group v-model="selectProcessNodeUserRadio">
              <el-radio
                v-for="(item, index) in processNodeList"
                :label="item.id"
                :key="index"
                >{{ item.name }}</el-radio
              >
            </el-radio-group>
          </div>
        </div>

        <div class="refer-footer refer-footer-comm refer-footer-backNodes" v-if="act.type == 47">
          <el-select v-if="backNodes" v-model="selectBackNodes">
            <el-option
              v-for="(item, index) in backNodes"
              :key="index"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>

        <div class="refer-footer refer-footer-comm" v-if="act.type == 48">
          <div class="refer-check">
            <el-checkbox-group
              v-model="selectNodesId"
              v-if="nodesList && nodesList.length > 0"
            >
              <el-checkbox
                style="display: block"
                v-for="(item, index) in nodesList"
                :label="item.nodeId"
                :key="index"
              >
                {{ item.nodeName }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <div class="refer-footer refer-footer-comm" v-if="act.type == 52">
          本次流程结束
        </div>
      </div>

      <transition
        v-if="act.type != 56 && act.type != 55 && act.type != 33"
        :duration="1000"
        name="face"
      >
        <div class= "common-idea">
          <div class="idea-top">
            <span class="suggest">{{$t('suggest')}}{{$t('view.word')}}</span>
            <span class="idea-use">
              <span class="use-tip" @click.stop="hiddenSuggest()">
                {{$t('view.fre_suggesst')}}
                <i class="el-icon-arrow-down" v-show="!isOrSuggest"></i>
                <i class="el-icon-arrow-up" v-show="isOrSuggest"></i>
              </span>
              <div class="use-suggest" v-if="isOrSuggest">
                <div class="sug-data" v-if="allSuggests">
                  <div
                    class="data-row"
                    v-for="(item, index) in allSuggests"
                    :key="index"
                    @click.stop="putData(item.content)"
                  >
                    <span :title="item.content" :class="[showEditSecond?'is-edit':'no-edit','opinion-content']">{{ item.content }}</span>
                    <span class="icon" v-if="showDelAndEdit">
                      <i
                        class="fa fa-trash-o"
                        @click.stop="deleteSuggestion(item.id)"
                      ></i>
                      <i
                        class="fa fa-pencil-square-o"
                        @click.stop="
                          editSuggestion(item.id, item.content)
                        "
                      ></i>
                    </span>
                  </div>
                </div>
                <div class="sug-btn" v-if="!showInput">
                  <div class="btns">
                    <span @click.stop="showInputBox">{{$t('view.add_fre_suggesst')}}</span>
                    <span @click.stop="editSuggest">{{$t('view.edit_suggesst')}}</span>
                  </div>
                </div>
                <div class="sug-new" v-if="showEditFirst">
                  <div class="new-input">
                    <input type="text" v-model="input" class="option-input" />
                  </div>
                  <div class="keep-cancel">
                    <span @click.stop="cancelAddSuggest(1)">{{$t('btns.cancel')}}</span>
                    <span @click.stop="addSuggestion">{{$t('btns.save')}}</span>
                  </div>
                </div>
                <div class="sug-new" v-if="showEditSecond">
                  <div class="new-input">
                    <input type="text" v-model="inputSecond" class="option-input" />
                  </div>
                  <div class="keep-cancel">
                    <span @click.stop="cancelAddSuggest(2)">{{$t('btns.cancel')}}</span>
                    <span @click.stop="updateSuggestion">{{$t('form.edit')}}</span>
                  </div>
                </div>
              </div>
            </span>
          </div>
         
          <div class="idea-bottom" v-show="currentAct">
            
            <div class="idea-textbox">
              <!-- maxlength="300" -->
              <el-input
                class="idea-box"
                type="textarea"
                :rows="4"
                :placeholder="$t('placeholder.input')"
                show-word-limit
                v-model="attitude"
                resize="none"
              >
              </el-input>
            </div>
          </div>
          <div class="idea-bottom" v-show="!currentAct" style="background:#f9f9f9;">
              <div class="idea-canvas" >
                <canvas
                  class="canvas"
                  id="canvas"
                  width="510"
                  height="125"
                  @mousedown="canvasDown($event)"
                  @mousemove="canvasMove($event)"
                  @mouseup="canvasUp($event)"
                  @mouseleave="canvasLeave($event)"
                  ref="canvas"
                  >{{$t('view.nosupport_canvas')}}</canvas
                >
              </div>
              <div class="idea-clear">
                <el-button class="btn" size="mini" @click="clear">
                  {{$t('view.rewrite')}}
                </el-button>
              </div>
          </div>
        </div>
      </transition>
      <div class="edit-icon-box">
        <span :class="[currentAct ? 'icon-color' :'','keyboard']" @click="changeDiv" v-show="isShowKeyboard">
          <i class="fa fa-keyboard-o icon"></i>
        </span>
        <span :class="[!currentAct ? 'icon-color' :'','hand-sign']" @click="changeDiv" v-show="isShowHandSign">
          <i class="fa fa-pencil-square icon"></i>
        </span>
      </div>
      <div class="idea common-idea" v-if="act.type == 33">
        <div class="idea-top">&nbsp;</div>
        <div class="idea-bottom-submission-process">
          说明文字:此功能供用户给当前表单开启不同的流程！
        </div>
      </div>
    </div>
    <div class="footer-btn" v-if="act.type != 57 && act.type != 58">
      <div>
        <span class="pack-up" @click.stop="stowPopup">{{$t('btns.cancel')}}</span>
        <span
          class="flowpanel-btn"
          @click.stop="startProcess()"
          v-if="act && act.type == 33">
          {{$t('btns.sure')}}
        </span>
        <span
          class="flowpanel-btn"
          @click.stop="rollBack(firstSubmission)"
          v-else-if="act && act.type == 47">
          回 退
        </span>
        <span
          class="flowpanel-btn"
          v-else-if="act && act.type == 48"
          @click.stop="remind">
          催 办
        </span>
        <span
          class="flowpanel-btn"
          v-else-if="act && act.type == 52"
          @click.stop="endTheFreeFlow">
          结 束
        </span>
        <span
          class="flowpanel-btn"
          v-else-if="act && (act.type == 56 || act.type == 55)"
          @click.stop="endorsement(act.type)">
          {{$t('btns.sure')}}
        </span>
        <span
          class="flowpanel-btn"
          v-else
          @click.stop="onSubmit(firstSubmission)">
          {{$t('btns.sure')}}
        </span>
      </div>
    </div>

    <!--流程指定审批人弹窗-->
    <comm-dialog
      class="user-dialog"
      title="用户选择框"
      v-show="approverVisible"
      :visible.sync="approverVisible"
      :appendToBody="true"
    >
      <form_selectApprover_flowpanel
        slot="body"
        :act="act"
        :openParams="openParams"
        :buildFormData="buildFormData"
        :setClass="commDialog.userDialog"
        :approversObj = "subFlowParams.approversObj"
        :approverNumType = "subFlowParams.approverNumType"
        :groupNum = "subFlowParams.groupNum"
        :subFlowToApprover="subFlowParams.subFlowToApprover[currentSelectDataIndex]"
        :isSubFlow = "subFlowParams.isSubFlow"
        :flowId="flowId"
        @event = "subflowDataTopanel"
        v-if="approverVisible"
      />
    </comm-dialog>
  </div>
</template>

<script>
import form_processHosting_flowpanel from "@/components/form_processHosting_flowpanel.vue"
import form_selectApprover_flowpanel from "@/components/form_selectApprover_flowpanel.vue"
import API from "@/api.js";
export default {
  props: [
    "stateId",
    "act",
    "openParams",
    "buildFormData",
    "approverName",
    "submitTo",
    "nextUserId",
    "approvers",
    "subFlowApproverData",
    "subFlowGroup",
    "newHostOrCohostList",
    "cCname",
    "subFlowGroupNum",
    "isShowHandSign",//是否显示手签按钮（补签和点评时不需要手签）
    "isShowKeyboard",//流程启动时不需要显示输入意见
  ],
  components: {
    form_processHosting_flowpanel,
    form_selectApprover_flowpanel
  },

  watch: {
    submitTo() {
      this.newSelectData();
    },

    subFlowApproverData() {
      this.setSubflowselectData();
    },

    //流程启动下拉框选择类型
    selectProcessNode() {
      //我也不知道启动流程是不是有多个下拉框的，先当他是一个吧
      for (let i = 0; i < this.processNodes.length; i++) {
        if (this.selectProcessNode == this.processNodes[i].id) {
          this.processNodeList = this.processNodes[i].firstNodeList;
          if (this.processNodeList.length > 0) {
            this.selectProcessNodeUserRadio = this.processNodeList[0].id;
          }
        }
      }
    },
  },

  data: function () {
    return {
      commDialog: { //弹出窗样选择
        userDialog:'user-dialog',
      },
      approverVisible: false,
      subFlowParams: {
        approversObj:'',
        approverNumType:'',
        groupNum:'',
        subFlowToApprover:{},
        isSubFlow:'',
      },
      currentSelectDataIndex:'',
      
      isKeyboard: true,
      radio: 3,
      input: "",
      nextNodeIds: undefined,
      selectData: [],
      isSplit: true,
      currentAct: true,
      isOrSuggest: false,
      attitude: "",
      showInput: false, //是否展示添加常见意见框
      showEditFirst: false, //展示{{$t('form.edit')}}意见框
      showDelAndEdit: false,
      allSuggests: [],
      showEditSecond: false,
      inputSecond: "",
      opinionId: "", //更新意见信息的ID

      /*
        手签
      */
      points: [],
      canvasTxt: null,
      startX: 0,
      startY: 0,
      moveY: 0,
      moveX: 0,
      endY: 0,
      endX: 0,
      isDown: false,

      flowId: "", //当前流程ID
      isAppentCirculator: "", //是否抄送
      isAppentData: {},
      currentNodeId: "",
      isToPerson: "",
      firstSubmission: true, //第一次点击提交禁止按钮再次点击
      existCanvas: false, //是否存在手写签名

      backNodes: "", //流程回退节点
      selectBackNodes: "",
      nodesList: [], //催办节点数据
      selectNodesId: [],
      processNodes: [], //流程启动按钮的节点
      selectProcessNode: "", //流程启动按钮下拉框选择的值
      processNodeList: [],
      selectProcessNodeUser: [],
      selectProcessNodeUserRadio: "",
      isMoreCurrentNode: "",
      htmlExparams: "",
    };
  },

  beforeCreate(){

  },

  mounted() {
    if (this.act.type == 48 || this.act.type == 33 || this.act.type == 55 || this.act.type == 56) {
      this.setNodes(this.act.type);
    } else {
      this.getSubmission();
        this.getSuggest();
        this.show();
    }
    window.addEventListener('click', (e)=> {
      if(this.isOrSuggest && e.target.className != "option-input"){
        this.hiddenSuggest()
      }
    })
  },

  methods: {
    //子流程-并行流程(用户选择框的弹窗)组件选择的用户提交到流程面板
    subflowDataTopanel(name, subObj, currentGroup) {
      let obj = this.subFlowParams
      let currentSelectFlow = this.selectData[this.currentSelectDataIndex]
      currentSelectFlow.approverName = name.replace(/^(\s|;)+|(\s|;)+$/g, '')
      currentSelectFlow.subFlowApproverData = subObj
      obj.subFlowToApprover[this.currentSelectDataIndex] = currentGroup
      let userids = ''
      if(currentSelectFlow.submitTo) {
        let row = currentSelectFlow.submitTo.row || []
        if(row.length > 0) {
          row.forEach(el => {
            userids += el.id + ";"
          })
          userids = userids.replace(/^(\s|;)+|(\s|;)+$/g, '')
        }
        currentSelectFlow.submitTo.userids = userids
      }
      if(this.isSplit) { //并行多选
        this.nextNodeIds.push(subObj.nodeid); //子流程复选框勾上
        this.nextNodeIds = Array.from(new Set(this.nextNodeIds))
      }
      this.approverVisible = false
    },

    setSubflowselectData() {
      for (let i = 0; i < this.selectData.length; i++) {
        if (this.selectData[i].id == this.subFlowApproverData.nodeid) {
          this.selectData[i].approverName = this.approverName;
          this.selectData[i].subFlowApproverData = this.subFlowApproverData;
          //mzj
         
        }
      }
      this.$forceUpdate(); //重新渲染数据
    },

    //结束自由流程
    endTheFreeFlow() {
      let op = this.openParams;
      let appId = op.appId;
      let formData = this.buildFormData;
      formData.stateId = this.stateId;
      let docId = formData.id,
        id = formData.id;
      let formId = '';
      let templateForm = ''
      if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
        formId = op.realformId;
        formData.formId = op.realformId;
        templateForm = op.actionContent;
      }else {
        formId = formData.formId;
      }
      let document = {
        applicationId: appId,
        attitude: this.attitude,
        docId: docId,
        document: formData,
        formId: formId,
        id: id,
        parentId: "",
        templateForm,
        viewId: "",
      };
      this.$api.completeFreeFlow(appId, docId, document, {
        onSucess: (res) => {
          if (res.data.errcode == 0) {
            status = "SUCCESS";
            this.$emit("closePopup", status);
            this.$notify({
              title: res.data.data,
              message: "",
              type: "success",
            });
          }
        },
      });
    },

    //流程启动
    startProcess() {
      if (!this.selectProcessNode) {
        this.$message({
          message: this.$t('view.noselect_data'),
          type: "warning",
        });
      } else {
        if (
          this.selectProcessNodeUser.length <= 0 &&
          !this.selectProcessNodeUserRadio
        ) {
          this.$message({
            message: this.$t('view.noselect_data'),
            type: "warning",
          });
        } else {
          let nextId = "";
          if (this.selectProcessNodeUserRadio) {
            nextId = this.selectProcessNodeUserRadio;
          } else {
            if (this.selectProcessNodeUser.length > 0) {
              for (let i = 0; i < this.selectProcessNodeUser.length; i++) {
                nextId += this.selectProcessNodeUser[i] + ";";
              }
            }
          }
          let formData = this.buildFormData;
          formData.stateId = this.stateId;
          let docId = formData.id,
            id = formData.id;
          let formId = '';
          let op = this.openParams;
          let appId = op.appId;
          let templateForm = '';
          if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
            formId = op.realformId;
            formData.formId = op.realformId;
            templateForm = op.actionContent;
          }else {
            formId = formData.formId;
          }

          let document = {
            applicationId: appId,
            actId: this.act.id,
            docId: docId,
            document: formData,
            flowId: this.selectProcessNode,
            formId: formId,
            id: id,
            nextId,
            parentId: "",
            templateForm,
            viewId: "",
          };
          this.$api.InitiateWorkFlow(appId, docId, document, {
            onSucess: (response) => {
              let status;
              if (response.data.errcode == 0) {
                status = "SUCCESS";
                this.$emit("closePopup", status);
                this.$notify({
                  title: response.data.data,
                  message: "",
                  type: "success",
                });
              } else if (response.data.errcode == 4001) {
                status = "ERROR";
                this.$emit("closePopup", status);
                this.$notify({
                  title: response.data.errmsg,
                  message: "",
                  type: "error",
                });
              }
            },
          });
        }
      }
    },

    //催办提交
    remind() {
      let op = this.openParams;
      let appId = op.appId;
      let pJson = this.getSignImageData();
      let formData = this.buildFormData;
      formData.stateId = this.stateId;
      let docId = formData.id,
        id = formData.id;
      let formId = '';
      let templateForm = '';
      if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
        formId = op.realformId;
        formData.formId = op.realformId;
        templateForm = op.actionContent;
      }else {
        formId = formData.formId;
      }
      let document = {
        applicationId: appId,
        currentNodeId: this.currentNodeId,
        docId: docId,
        document: formData,
        formId: formId,
        id: id,
        nodertIds: this.selectNodesId,
        parentId: "",
        templateForm,
        viewId: "",
      };
      if (pJson) {
        //手写签名
        document.signatureJson = JSON.stringify(pJson);
      }
      document.attitude = this.attitude;
      this.$api.remindFlow(appId, docId, document, {
        onSucess: (response) => {
          let status;
          if (response.data.errcode == 0) {
            status = "SUCCESS";
            this.$emit("closePopup", status);
            this.$notify({
              title: response.data.data,
              message: "",
              type: "success",
            });
          } else if (response.data.errcode == 4001) {
            status = "ERROR";
            this.$emit("closePopup", status);
            this.$notify({
              title: response.data.errmsg,
              message: "",
              type: "error",
            });
          }
        },
      });
    },

    //催办数据
    setNodes(type) {
      let op = this.openParams;
      let appId = op.appId;
      if (type == 48) {
        let obj = JSON.parse(this.act.reminderNodesData);
        this.nodesList = obj.data;
      } else if (type == 33) {
        //流程启动
        let formData = this.buildFormData;
        formData.stateId = this.stateId;
        let docId = formData.id,
          id = formData.id;
        let formId = '';
        let templateForm = '';
        if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
          formId = op.realformId;
          formData.formId = op.realformId;
          templateForm = op.actionContent;
        }else {
          formId = formData.formId;
        }

        let document = {
          applicationId: appId,
          docId: docId,
          document: formData,
          formId: formId,
          id: id,
          parentId: "",
          templateForm,
          viewId: "",
        };
        this.$api.getPanelsInitiate(appId, docId, document, {
          onSucess: (res) => {
            this.processNodes = res.data.data;
          },
        });
      }
    },

    //补签提交
    endorsement(val) {
      if (val == 56) {
        let appId = this.openParams.appId;
        let instanceId = this.approvers[0].instanceId;
        let attitude = this.attitude;
        if(attitude.indexOf('%') > -1) {
          attitude = encodeURI(attitude) 
        }
        this.$api.supplement(appId, instanceId, attitude, {
          onSucess: (response) => {
            let act = response.data.data;
            let status = "SUCCESS";
            if (response.data.errcode == 0) {
              this.$notify({
                title: response.data.data,
                message: "",
                type: "success",
              });
              this.$emit("closePopup", status);
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              //this.$emit("closePopup", status);
              let prompt = response.data.errors[0].errmsg
                ? response.data.errors[0].errmsg
                : response.data.errmsg;
              this.$notify.error({
                title: response.data.errmsg,
                message: response.data.errmsg,
              });
            }
            //this.$emit("action", act);
          },
        });
      } else if ((val = 55)) {
        let attitude = this.attitude;
        let appId = this.openParams.appId;
        let instanceId = this.approvers[0].instanceId;
        this.$api.review(appId, instanceId, attitude, {
          onSucess: (response) => {
            let act = response.data.data;
            let status = "SUCCESS";
            if (response.data.errcode == 0) {
              this.$notify({
                title: response.data.data,
                message: "",
                type: "success",
              });
              this.$emit("closePopup", status);
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              //this.$emit("closePopup", status);
              let prompt = response.data.errors[0].errmsg
                ? response.data.errors[0].errmsg
                : response.data.errmsg;
              this.$notify.error({
                title: response.data.errmsg,
                message: response.data.errmsg,
              });
            }
            //this.$emit("action", act);
          },
        });
      }
    },

    newSelectData() {
      for (let i = 0; i < this.selectData.length; i++) {
        let _st = this.submitTo;
        let _sd = this.selectData;
        if (_sd[i].id == _st.nodeid) {
          if (!_st.isAppentCirculator) {
            _sd[i].approverName = this.approverName;
            if(_st.row && _st.row.length > 0) {
              _sd[i].submitTo = _st;
            }else {
              _sd[i].submitTo = '';
            }
            
          }
        }
      }
      if (this.submitTo.isAppentCirculator) {
        this.isAppentData.approverName = this.cCname; //this.approverName;
        this.isAppentData.circulatorInfo = this.submitTo.userids;
        this.isAppentData.submitTo = this.submitTo;
      }
      this.$forceUpdate(); //重新渲染数据
    },

    stowPopup() {
      // this.approverName = '';
      this.$emit("closePopup");
    },

    //指定审批人
    //现在是传到form_normalform -> form_selectApprover_flowpanel -> form_normalform -> form_new_flowpanel,
    //但是这样写以后很难改得动，以后都在当前组件引入用户选择框，目前只有子流程groupNum == -2实现了
    selectApprovers(
      isToPerson,
      nodeid,
      submitTo,
      approverNumType,
      isAppentCirculator,
      groupNum,
      index
    ) {
      // this.subFlowApproverData = subObj;
      // this.subFlowGroup = currentGroup;  //数据保存在流程面板中
      // this.subFlowGroupNum = groupNum;
      if ((groupNum && groupNum > 1) || groupNum <= -1) {
        //子流程分组
        let approversObj = {
          isToPerson: isToPerson,
          nodeid: nodeid,
          groupNum: groupNum,
        };
        if (isAppentCirculator) {
          approversObj.isAppentCirculator = isAppentCirculator;
        }
        let saveApprover = submitTo;
        let subFlowGroup = [];
        if (this.subFlowGroup && this.subFlowGroup.length > 0) {
          subFlowGroup = [...this.subFlowGroup]; //this.subFlowGroup
        }
        let isSubFlow = true;
        if(groupNum == -2){ //使用当前页面的用户选择框组件(目前只有子流程并且groupNum == -2时使用，以后都要改成当前页的用户选择框)
          this.currentSelectDataIndex = index
          let subF = this.subFlowParams.subFlowToApprover
          subF[index] = subF[index] || []
          let subFlowParams = {
            approversObj: approversObj,
            approverNumType: approverNumType,
            groupNum: groupNum,
            subFlowToApprover: subF,
            isSubFlow: isSubFlow,
          }
          this.subFlowParams = subFlowParams
          this.approverVisible = true
        }else {
          this.$emit(
            "showSubFlow",
            approversObj,
            this.flowId,
            "",
            saveApprover,
            approverNumType,
            isAppentCirculator,
            groupNum,
            subFlowGroup,
            isSubFlow
          );
        }

       
      } else {
        let approversObj = {
          isToPerson: isToPerson,
          nodeid: nodeid,
        };
        if (isAppentCirculator) {
          approversObj.isAppentCirculator = isAppentCirculator;
        }
        let saveApprover = submitTo;
        this.$emit(
          "action",
          approversObj,
          this.flowId,
          "",
          saveApprover,
          approverNumType,
          isAppentCirculator
        ); //调用父组件designatedApprover()方法
      }
    },

    //流程回退执行前
    rollBack() {
      let op = this.openParams;
      let appId = op.appId;
      if (this.act.workFlowType == 1) {
        //自由流程
        let pJson = this.getSignImageData();
        let formData = this.buildFormData;
        formData.stateId = this.stateId;
        let docId = formData.id,
          id = formData.id;
        let formId = '';
        let templateForm = '';
        if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
          formId = op.realformId;
          formData.formId = op.realformId;
          templateForm = op.actionContent;
        }else {
          formId = formData.formId;
        }
        let document = {
          applicationId: appId,
          docId: docId,
          document: formData,
          formId: formId,
          id: id,
          nextUserId: this.selectBackNodes,
          parentId: "",
          templateForm,
          viewId: "",
        };
        document.attitude = this.attitude;
        if (pJson) {
          //手写签名
          document.signatureJson = JSON.stringify(pJson);
        }
        this.$api.backFreeFlow(appId, docId, document, {
          onSucess: (response) => {
            let status;
            if (response.data.errcode == 0) {
              status = "SUCCESS";
              this.$emit("closePopup", status);
              this.$notify({
                title: response.data.data,
                message: "",
                type: "success",
              });
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              this.$emit("closePopup", status);
              this.$notify({
                title: response.data.data,
                message: "",
                type: "error",
              });
            }
          },
        });
      } else {
        if (this.selectBackNodes) {
          let pJson = this.getSignImageData();
          let formData = this.buildFormData;
          formData.stateId = this.stateId;
          let docId = formData.id,
            id = formData.id;
          let formId = '';
          let templateForm = '';
          if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
            formId = op.realformId;
            formData.formId = op.realformId;
            templateForm = op.actionContent;
          }else {
            formId = formData.formId;
          }
          let document = {
            applicationId: appId,
            currentNodeId: this.currentNodeId,
            docId: docId,
            document: formData,
            flowId: this.flowId,
            formId: formId,
            id: id,
            parentId: "",
            templateForm,
            viewId: "",
          };
          let _flowType = this.act.flowType;
          this.$api.runBeforeActionScript(
            appId,
            this.act.id,
            document,
            this.act.type,
            '', //treedocid
            _flowType, //flowType
            {
              onSucess: (response) => {
                if (response.data.errcode == 0) {
                  let resData = response.data.data;
                  if(resData && !resData.type) { //没有type值，但是有返回数据，把数据放进document
                    if(resData.changedField) {
                      let resDataItem = resData.changedField;
                      if(resDataItem) {
                        for(let i=0; i<resDataItem.length; i++) {
                          for(let el in resDataItem[i]) {
                            document.document.items[el] = resDataItem[i][el];
                          }
                        }
                      }
                    }
                  }
                  this.flowRollBack(document, pJson);
                }
              },
            }
          );
        } else {
          let status = "ERROR";
          this.$message({
            message: this.$t('view.noselect_people'),
            type: "warning",
          });
        }
      }
    },

    //流程回退
    flowRollBack(allData, pJson) {
      let formData = this.buildFormData;
      let appId = this.openParams.appId;
      let docId = formData.id;
      let document = allData;
      if (pJson) {
        //手写签名
        document.signatureJson = JSON.stringify(pJson);
      }
      if (this.nextNodeIds instanceof Array) {
        //多选
        document.nextNodeIds = this.nextNodeIds;
      } else {
        // 单选
        document.nextNodeIds = [];
        document.nextNodeIds.push(this.selectBackNodes);
      }
      document.attitude = this.attitude;
      document.subFlowApprover = []; //多种流程处理方式，此数据为完善未完善
      document.submitTo = []; //多种流程处理方式，此数据为完善未完善
      this.documentData = document;
      API.backFlow(appId, docId, document, {
        onSucess: (response) => {
          let status;
          if (response.data.errcode == 0) {
            status = "SUCCESS";
            // this.$emit("closePopup", status);
            this.$notify({
              title: this.$t('success'),
              message: response.data.data,
              type: "success",
            });
            this.runAfterAction(status);
          } else if (response.data.errcode == 4001) {
            status = "ERROR";
            this.$emit("closePopup", status);
             ;
          }
        },
      });
    },

    //取消自由流程选中的用户
    onTabClose(id) {
      this.approverName = "";
      this.nextUserId = "";
    },

    //自由流程选择用户
    select() {
      let isFreeFlow = true;
      this.$emit("action", "", "", isFreeFlow); //调用父组件designatedApprover()方法
    },

    //保存重新编辑的意见
    updateSuggestion() {
      console.log("更新编辑的数据-->");
      console.log(this.inputSecond);
      let opinion = this.inputSecond;
      if(!opinion) {
        this.$message({
          message: this.$t('view.notnull_ss'),
          type: 'warning'
        });
      }else {
        let userId = this.$store.state.userId,
          opId = this.opinionId;
        API.editMostUseSuggestion(userId, opId, opinion, {
          onSucess: (response) => {
            if (response.data.data) {
              let id = response.data.data.id;
              let content = response.data.data.content;
              for (let i = 0; i < this.allSuggests.length; i++) {
                if (this.allSuggests[i].id == id) {
                  this.allSuggests[i].content = content;
                  this.inputSecond = "";
                }
              }
            }
          },
        });
      }
    },
    //重新编辑意见
    editSuggestion(id, content) {
      this.inputSecond = content;
      this.opinionId = id;
    },
    //删除意见
    deleteSuggestion(id) {
      let userId = this.$store.state.userId;
      let opId = id;
      API.deleteMostUseSuggestion(userId, opId, {
        onSucess: (response) => {
          console.log(response.data.data);
          //后台返回500，未执行以下步骤
          if (response.data.data) {
            let delId = response.data.data.id;
            let allSug = this.allSuggests;
            for (let i = 0; i < allSug.length; i++) {
              if (allSug[i].id == delId) {
                allSug.splice(i, 1);
                i--;
              }
            }
            this.allSuggest = allSug;
          }
        },
      });
    },

    //添加意见
    addSuggestion() {
      console.log(this.input);
      let userId = this.$store.state.userId;
      let opinion = this.input;
      API.AddMostUseSuggestion(userId, opinion, {
        onSucess: (response) => {
          console.log(response.data.data);
          let newSuggest = response.data.data;
          this.allSuggests.push(newSuggest);
          this.input = "";
        },
      });
    },

    // 选中的数据放进文本框中
    putData(content) {
      if (this.showDelAndEdit == false) {
        if (!this.attitude) {
          this.attitude = content;
        } else if (this.attitude) {
          this.attitude = this.attitude + "," + content;
        }
      }
    },

    editSuggest() {
      this.showInput = true;
      this.showEditFirst = false;
      this.showEditSecond = true;
      this.showDelAndEdit = true;
    },

    cancelAddSuggest(num) {
      if (num == 1) {
        this.showInput = false;
        this.showDelAndEdit = false;
        this.showEditFirst = false;
      } else if (num == 2) {
        this.showInput = false;
        this.showDelAndEdit = false;
        this.showEditSecond = false;
      }
    },

    showInputBox() {
      this.showInput = true;
      this.showEditFirst = true;
    },

    showEditBox() {},

    //清除画布数据
    clear() {
      this.canvasTxt.clearRect(
        0,
        0,
        this.canvasTxt.canvas.width,
        this.canvasTxt.canvas.height
      );
      this.existCanvas = false;
    },
    show() {
      this.canvas = this.$refs.canvas; //指定canvas
      this.canvasTxt = this.canvas.getContext("2d"); //设置2D渲染区域
      this.canvasTxt.fillStyle = "#F9F9F9";
      this.canvasTxt.fillRect(0, 0, 500, 125);
    },
    canvasDown(ev) {
      ev = ev || event;
      ev.preventDefault();
      if (1) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY,
        };
        this.startX = obj.x;
        this.startY = obj.y;
        this.canvasTxt.beginPath();
        this.canvasTxt.moveTo(this.startX, this.startY);
        this.canvasTxt.lineTo(obj.x, obj.y);
        this.canvasTxt.stroke();
        this.canvasTxt.closePath();
        this.points.push(obj);
        this.isDown = true;
      }
    },
    canvasMove(ev) {
      ev = ev || event;
      ev.preventDefault();
      if (this.isDown) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY,
        };
        this.moveY = obj.y;
        this.moveX = obj.x;
        this.canvasTxt.beginPath();
        this.canvasTxt.moveTo(this.startX, this.startY);
        this.canvasTxt.lineTo(obj.x, obj.y);
        this.canvasTxt.stroke();
        this.canvasTxt.closePath();
        this.startY = obj.y;
        this.startX = obj.x;
        this.points.push(obj);
      }
    },
    canvasUp(ev) {
      ev = ev || event;
      ev.preventDefault();
      if (1) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY,
        };
        this.canvasTxt.beginPath();
        this.canvasTxt.moveTo(this.startX, this.startY);
        this.canvasTxt.lineTo(obj.x, obj.y);
        this.canvasTxt.stroke();
        this.canvasTxt.closePath();
        this.points.push(obj);
        this.points.push({ x: -1, y: -1 });
        this.isDown = false;
      }
      this.existCanvas = true;
    },
    canvasLeave() {
      // this.existCanvas = true;
      this.canvasMoveUse = false;
    },

    getSignImageData() {
      if (this.existCanvas) {
        //判断是否存在手写签名
        let pJson;
        let canvas = document.getElementById("canvas");
        let signature = canvas.toDataURL("image/png");
        let str = signature.replace("data:image/png;base64,", "");
        pJson = {
          type: "image/png;base64",
          data: str,
        };
        return pJson;
      } else {
        return false;
      }
    },

    //提交
    onSubmit() {
      let op = this.openParams;
      let appId = op.appId;
      let arrayIuput = document.getElementsByTagName("input");
      let arrayTextA = document.getElementsByTagName("textarea");
      let htmlArr = [];
      if (arrayIuput.length > 0) {
        for (let i = 0; i < arrayIuput.length; i++) {
          let obj = {};
          if (
            arrayIuput[i].hasAttribute("storage") &&
            arrayIuput[i].getAttribute("storage") == "exparams"
          ) {
            if (arrayIuput[i].type == "radio" && arrayIuput[i].checked) {
              obj.id = arrayIuput[i].getAttribute("name");
              obj.value = arrayIuput[i].value;
              htmlArr.push(obj);
            } else if (arrayIuput[i].type != "radio") {
              obj.id = arrayIuput[i].getAttribute("name");
              obj.value = arrayIuput[i].value;
              htmlArr.push(obj);
            }
          }
        }
      }
      if (arrayTextA.length > 0) {
        for (let i = 0; i < arrayTextA.length; i++) {
          let obj = {};
          if (
            arrayTextA[i].hasAttribute("storage") &&
            arrayTextA[i].getAttribute("storage") == "exparams"
          ) {
            obj.id = arrayTextA[i].getAttribute("name");
            obj.value = arrayTextA[i].value;
            htmlArr.push(obj);
          }
        }
      }
      let exparams = {};
      if (htmlArr.length > 0) {
        for (let i = 0; i < htmlArr.length; i++) {
          exparams[htmlArr[i].id] = htmlArr[i].value;
        }
      }
      this.htmlExparams = exparams;

      if (this.selectData.length > 0 || this.act.workFlowType == 1) {
        if (this.firstSubmission) {
          //当提交时，确定按钮禁止再次点击提交
          this.firstSubmission = false;
          let status = "";
          if (this.isToPerson) {
            //当要选择指定审批人时
            if (this.isSplit) {
              //多选
              let nextNodeIds = this.nextNodeIds
              let selectData = this.selectData
              if (nextNodeIds.length > 0) {
                let isCanApprove = false
                let haveUserId = true
                for (let i = 0; i < nextNodeIds.length; i++) {
                  for (let j = 0; j < selectData.length; j++) {
                    if (nextNodeIds[i] == selectData[j].id) {
                      if (selectData[j].type != "CompleteNode") {
                        if(selectData[j].type == 'SubFlow')  {
                          if (selectData[j].isToPerson) {
                            if (selectData[j].subFlowApproverData) {
                              let approver = selectData[j].subFlowApproverData.approver
                              if(!approver || approver.length <= 0) {
                                haveUserId = false
                              }
                              if(haveUserId) {
                                isCanApprove = true
                              }else {
                                isCanApprove = false
                              }
                            }else {
                              haveUserId = false
                              isCanApprove = false
                            }
                          }
                        }else {
                          if (selectData[j].isToPerson) {
                            let subTo = selectData[j].submitTo
                            if(!subTo) {
                              haveUserId = false
                            }
                            if(haveUserId) {
                              isCanApprove = true
                            }else {
                              isCanApprove = false
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if(!isCanApprove) {
                  this.$message({
                    showClose: true,
                    message: this.$t('view.noselect_approver'),
                    type: 'warning'
                  })
                  haveUserId = true
                  this.firstSubmission = true
                  return
                }
                
              } else if (this.nextNodeIds.length == 0) {
                this.$message.error(this.$t('placeholder.select')+this.$t('label.approval_node'));
                this.firstSubmission = true;
                return;
              }
            } else {
              //单选
              let nextNodeIds = this.nextNodeIds
              let selectData = this.selectData
              if (nextNodeIds) {
                let isCanApprove = false
                let haveUserId = true
                for (let y = 0; y < selectData.length; y++) {
                  if (nextNodeIds == selectData[y].id) {
                    if (selectData[y].type != "CompleteNode") {
                      if(selectData[y].type == 'SubFlow'){
                        if (selectData[y].subFlowApproverData) {
                          if (selectData[y].isToPerson) {
                            let approver = selectData[y].subFlowApproverData.approver
                            if(!approver || approver.length <= 0) {
                              haveUserId = false
                            }
                            if(haveUserId) {
                              isCanApprove = true
                            }else {
                              isCanApprove = false
                            }
                          }
                        }
                      }else {
                        if(selectData[y].submitTo) {
                          if (selectData[y].isToPerson) {
                            isCanApprove = true
                          }
                        }
                      }
                      // if (
                      //   !this.selectData[y].submitTo &&
                      //   !this.selectData[y].subFlowApproverData
                      // ) {
                      //   if (this.selectData[y].isToPerson) {
                      //     this.$message({
                      //       showClose: true,
                      //       message: this.$t('view.noselect_approver'),
                      //       type: 'warning'
                      //     });
                      //     this.firstSubmission = true;
                      //     return;
                      //   }
                      // }
                    }else if(selectData[y].type == "CompleteNode") { //流程直接结束
                      if(selectData[y].isToPerson) {
                        if(selectData[y].submitTo) {
                          isCanApprove = true
                        }
                      }else {
                        isCanApprove = true
                      }
                    }
                  }
                }
                if(!isCanApprove) {
                  this.$message({
                    showClose: true,
                    message: this.$t('view.noselect_approver'),
                    type: 'warning'
                  })
                  haveUserId = true
                  this.firstSubmission = true
                  return
                }
              } else {
                // this.$emit("closePopup", status);
                this.$message.error(this.$t('placeholder.select')+this.$t('label.approval_node'));
                this.firstSubmission = true;
                return;
              }
            }
          }

          if (this.nextNodeIds instanceof Array) {
            //多选但没有指定审批人没有选择审批人时
            if (this.nextNodeIds.length < 1) {
              return;
            }
          }

          if (this.act.workFlowType == 1) {
            if (!this.nextUserId) {
              this.$message({
                message: this.$t('view.noselect_approver'),
                type: 'warning'
              });
              this.firstSubmission = true;
              // status = "ERROR";
              // this.$emit("closePopup", status);
              return;
            }
          }

          let pJson = this.getSignImageData();
          //let formData = this.$parent.$parent.$parent.$parent.$parent.buildFormData();
          let formData = this.buildFormData;
          formData.stateId = this.stateId;
          if (this.htmlExparams) {
            formData.exparams = this.htmlExparams;
          }
          let docId = formData.id,
            id = formData.id;
          let formId = '';
          let templateForm = '';
          if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
            formId = op.realformId;
            formData.formId = op.realformId;
            templateForm = op.actionContent;
          }else {
            formId = formData.formId;
          }
          let subDocuments = [];
          let subDoc = this.$store.state.subDocuments;//包含元素里配置网格视图的数据，提交按钮时网格视图的数据也要一起保存
          if(subDoc && subDoc.length > 0) {
            subDocuments = subDoc;
            delete formData.subDocuments;
            formData.subDocuments = subDocuments
          }
          let document = {
            applicationId: appId,
            currentNodeId: this.currentNodeId,
            docId: docId,
            document: formData,
            flowId: this.flowId,
            formId: formId,
            id: id,
            parentId: "",
            templateForm,
            viewId: "",
          };
          if (this.isMoreCurrentNode) {
            document.isMoreCurrentNode = this.isMoreCurrentNode;
          }
          if (this.isAppentCirculator) {
            //判断是否抄送
            if (this.isAppentData.circulatorInfo) {
              document.circulatorInfo = this.isAppentData.circulatorInfo;
            }
          }

          this.documentData = document; //保存值放到执行后脚本
          document.attitude = this.attitude;
          let isRelate = "";
          let _flowType = this.act.flowType; //提交为80

          //非自由流程
          document.subFlowApprover = []; //多种流程处理方式，此数据为完善未完善
          document.submitTo = [];
          //流程单选或多选
          if (this.nextNodeIds instanceof Array) {
            //多选
            let checkArr = [];
            document.nextNodeIds = this.nextNodeIds;
            for (let j = 0; j < this.nextNodeIds.length; j++) {
              for (let y = 0; y < this.selectData.length; y++) {
                if (
                  this.nextNodeIds[j] == this.selectData[y].id &&
                  this.selectData[y].submitTo
                ) {
                  delete this.selectData[y].submitTo.row;
                  document.submitTo.push(this.selectData[y].submitTo);
                  if (this.selectData[y].type == "SubFlow") {
                    let s = this.selectData[y];
                    if(s.groupNum == -2) { //groupNum有-1，-2和>0, 当-1时无限制添加分组，-2是每个用户都是单独的分组
                      let checkSubmit = s.submitTo;
                      let approver = [];
                      let subFlowUserId = '';
                      if(s.subFlowApproverData && s.subFlowApproverData.approver && s.subFlowApproverData.approver.length > 0) {
                        s.subFlowApproverData.approver[0].userids.forEach(el => {
                          subFlowUserId += el + ";";
                        });
                      }
                      if(subFlowUserId) {
                        checkSubmit.userids = subFlowUserId;
                      }
                      if(checkSubmit.userids) {
                        let list = checkSubmit.userids.replace(/^(\s|;)+|(\s|;)+$/g, '')
                        let useridList = list.split(";");
                        for(let z=0; z<useridList.length; z++) {
                          let obj = {};
                          let userids = [];
                          obj.position = z+1;
                          obj.userids = userids;
                          userids.push(useridList[z]);
                          approver.push(obj);
                        }
                      }
                      let approverObj = {};
                      approverObj.approver = approver;
                      approverObj.nodeid = checkSubmit.nodeid;
                      checkArr.push(approverObj);
                      document.subFlowApprover = checkArr;
                    }else {
                      let obj = Object.assign({}, this.selectData[y].submitTo);
                      delete obj.isToPerson;
                      obj.userids = obj.userids.replace(/^(\s|;)+|(\s|;)+$/g, "");
                      let useridData = obj.userids.split(";");
                      let approverObj = {
                        position: 1,
                        userids: useridData,
                      };
                      let approverArr = [];
                      approverArr.push(approverObj);
                      //arr.push(obj);
                      let subFlowObj = {
                        approver: approverArr,
                        nodeid: obj.nodeid,
                      };
                      document.subFlowApprover.push(subFlowObj);
                    }
                    // //主子流程
                    // let checkObj = Object.assign({}, this.selectData[y].submitTo);
                    // delete checkObj.isToPerson;
                    // checkArr.push(checkObj);
                  }
                }else if(
                  this.nextNodeIds[j] == this.selectData[y].id && 
                  !this.selectData[y].submitTo && 
                  this.selectData[y].subFlowApproverData) {
                  if (this.selectData[y].type == "SubFlow") {
                    let s = this.selectData[y];
                    if(s.groupNum == -2) { //groupNum有-1，-2和>0, 当-1时无限制添加分组，-2是每个用户都是单独的分组
                      let approver = [];
                      let subUserids = ''
                      if(s.subFlowApproverData && s.subFlowApproverData.approver && s.subFlowApproverData.approver.length > 0) {
                        s.subFlowApproverData.approver[0].userids.forEach(el => {
                          subUserids += el + ";";
                        });
                      }
                      if(subUserids) {
                        let list = subUserids.replace(/^(\s|;)+|(\s|;)+$/g, '')
                        let useridList = list.split(";");
                        for(let z=0; z<useridList.length; z++) {
                          let obj = {};
                          let userids = [];
                          obj.position = z+1;
                          obj.userids = userids;
                          userids.push(useridList[z]);
                          approver.push(obj);
                        }
                      }
                      let approverObj = {};
                      approverObj.approver = approver;
                      approverObj.nodeid = s.subFlowApproverData.nodeid;
                      checkArr.push(approverObj);
                      document.subFlowApprover = checkArr;
                    }else {
                      let obj = Object.assign({}, s.subFlowApproverData);
                      let subUserids = ''
                      if(s.subFlowApproverData && s.subFlowApproverData.approver && s.subFlowApproverData.approver.length > 0) {
                        s.subFlowApproverData.approver[0].userids.forEach(el => {
                          subUserids += el + ";";
                        });
                      }
                      obj.userids = subUserids.replace(/^(\s|;)+|(\s|;)+$/g, "");
                      let useridData = obj.userids.split(";");
                      let approverObj = {
                        position: 1,
                        userids: useridData,
                      };
                      let approverArr = [];
                      approverArr.push(approverObj);
                      //arr.push(obj);
                      let subFlowObj = {
                        approver: approverArr,
                        nodeid: s.subFlowApproverData.nodeid,
                      };
                      document.subFlowApprover.push(subFlowObj);
                    }
                  }
                }
              }
            }
            document.subFlowApprover = checkArr;
          } else { // 单选
            document.nextNodeIds = [];
            if(this.nextNodeIds) {
              document.nextNodeIds.push(this.nextNodeIds);
            }
            //let arr = [];
            let subArr = [];
            let checkArr = [];
            for (let i = 0; i < this.selectData.length; i++) {
              if (
                this.selectData[i].submitTo &&
                this.selectData[i].submitTo.nodeid == this.nextNodeIds
              ) {
                delete this.selectData[i].submitTo.row;
                subArr.push(this.selectData[i].submitTo);
                if (this.selectData[i].type == "SubFlow") { // //主子流程
                  let s = this.selectData[i];
                  if(s.groupNum == -2) { //groupNum有-1，-2和>0, 当-1时无限制添加分组，-2是每个用户都是单独的分组
                    let checkSubmit = s.submitTo;
                    let approver = [];
                    let subFlowUserId = '';
                    if(s.subFlowApproverData && s.subFlowApproverData.approver && s.subFlowApproverData.approver.length > 0) {
                      s.subFlowApproverData.approver[0].userids.forEach(el => {
                        subFlowUserId += el + ";";
                      });
                    }
                    if(subFlowUserId) {
                      checkSubmit.userids = subFlowUserId;
                    }
                    if(checkSubmit.userids) {
                      let list = checkSubmit.userids.replace(/^(\s|;)+|(\s|;)+$/g, '')
                      let useridList = list.split(";");
                      for(let z=0; z<useridList.length; z++) {
                        let obj = {};
                        let userids = [];
                        obj.position = z+1;
                        obj.userids = userids;
                        userids.push(useridList[z]);
                        approver.push(obj);
                      }
                    }
                    let approverObj = {};
                    approverObj.approver = approver;
                    approverObj.nodeid = checkSubmit.nodeid;
                    checkArr.push(approverObj);
                    document.subFlowApprover = checkArr;
                  }else {
                    let obj = Object.assign({}, this.selectData[i].submitTo);
                    delete obj.isToPerson;
                    obj.userids = obj.userids.replace(/^(\s|;)+|(\s|;)+$/g, "");
                    let useridData = obj.userids.split(";");
                    let approverObj = {
                      position: 1,
                      userids: useridData,
                    };
                    let approverArr = [];
                    approverArr.push(approverObj);
                    //arr.push(obj);
                    let subFlowObj = {
                      approver: approverArr,
                      nodeid: obj.nodeid,
                    };
                    document.subFlowApprover.push(subFlowObj);
                  }
                } else {
                  document.submitTo = subArr;
                }
              } else if (
                //当是子流程时
                this.selectData[i].subFlowApproverData &&
                this.selectData[i].subFlowApproverData.nodeid == this.nextNodeIds
              ) {
                let subflowData;
                if (this.subFlowGroupNum && this.subFlowGroupNum == -2) {
                  subflowData = Object.assign(
                    {},
                    this.selectData[i].subFlowApproverData
                  );
                  let arr = subflowData.approver[0]
                    ? subflowData.approver[0].userids
                    : [];
                  if (arr && arr.length > 0) {
                    let approvers = [];
                    for (let k = 0; k < arr.length; k++) {
                      let obj = {};
                      obj.position = k + 1;
                      let id = [];
                      id.push(arr[k]);
                      obj.userids = id;
                      approvers.push(obj);
                    }
                    let subFlow = {};
                    subFlow.approver = approvers;
                    subFlow.nodeid = subflowData.nodeid;
                    document.subFlowApprover.push(subFlow);
                  }
                } else {
                  subflowData = Object.assign(
                    {},
                    this.selectData[i].subFlowApproverData
                  );
                  for (let j = 0; j < subflowData.approver.length; j++) {
                    delete subflowData.approver[j].rows;
                  }
                  document.subFlowApprover.push(subflowData);
                }
              }
            }
          }

          this.$api.submitRunBeforeActionScript(
            appId,
            this.act.id,
            document,
            docId,
            document.viewId,
            formId,
            document.templateForm,
            document.parentId,
            isRelate,
            _flowType,
            {
              onSucess: (response) => {
                if (response.data.errcode == 0) {
                  if (response.data.data) {
                    let resData = response.data.data;
                    if(!resData.type) { //没有type值，但是有返回数据，把数据放进document
                      if(resData.changedField) {
                        // let items = document.document.items;
                        let resDataItem = resData.changedField;
                        if(resDataItem) {
                          for(let i=0; i<resDataItem.length; i++) {
                            for(let el in resDataItem[i]) {
                              document.document.items[el] = resDataItem[i][el];
                            }
                          }
                          // for(let key in items) {
                          //   for(let i=0; i<resDataItem.length; i++) {
                          //     for(let el in resDataItem[i]) {
                          //       if(el == key) {
                          //         document.document.items[key] = resDataItem[i][el];
                          //       }
                          //     }
                          //   }
                          // }
                        }
                        this.submitFlowData(document, pJson);
                      }else if(resData.content){
                        this.$notify.error({
                          title: resData.content,
                          message: "",
                        });
                        status = "ERROR";
                        this.$emit("closePopup", status);
                      }
                    }else if(resData.type == 16) {
                      this.$notify.error({
                        title: response.data.data.content,
                        message: "",
                      });
                    }else if(resData.type === 32) {
                      //解决在操作类型流程处理时，设置执行前脚本时，创建弹窗不生
                      let information=resData.content ? resData.content : this.$t('msg.submit_flow');
                      this.$confirm(information, this.$t('tip'), {
                        confirmButtonText: this.$t('msg.confirm'),
                        cancelButtonText: this.$t('btns.cancel'),
                        type: 'warning'
                      }).then(() => {
                        this.submitFlowData(document, pJson);
                      }).catch(() => {
                        this.firstSubmission = true
                      });
                    }else {
                      this.$notify.error({
                        title: response.data.data.content,
                        message: "",
                      });
                      status = "ERROR";
                      this.$emit("closePopup", status);
                    }
                  } else {
                    this.submitFlowData(document, pJson);
                  }
                }
              },
            }
          );
        }
      }
    },

    submitFlowData(allData, pJson) {
      //let formData = this.$parent.$parent.$parent.$parent.$parent.buildFormData();
      let appId = this.openParams.appId;
      let formData = this.buildFormData;
      let docId = formData.id;
      let document = allData;
      if (pJson) {
        //手写签名
        document.signatureJson = JSON.stringify(pJson);
      }
      if (this.htmlExparams) {
        document.document.exparams = this.htmlExparams;
      }
      document.attitude = this.attitude;
      if (this.act.workFlowType == 1) {
        //自由流程
        document.nextUserId = this.nextUserId;
        delete document.currentNodeId;
        delete document.flowId;
        API.submitFreeFlow(appId, docId, document, {
          onSucess: (response) => {
            this.firstSubmission = true;
            let status;
            let prompt;
            if (response.data.errcode == 0) {
              status = "SUCCESS";
              prompt = response.data.data;
              this.$notify({
                title: prompt,
                message: "",
                type: "success",
              });
              this.runAfterAction(status);
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              this.$emit("closePopup", status);
              if (response.data.errors && response.data.errors.length > 0) {
                Toast({
                  message: response.data.errors[0].errmsg,
                  iconClass: "fa fa-close fa-2x",
                });
              }
            }
          },
        });
      } else {
        API.submitFlow(appId, docId, document, {
          onSucess: (response) => {
            this.firstSubmission = true;
            let status;
            let prompt;
            if (response.data.errcode == 0) {
              status = "SUCCESS";
              prompt = response.data.data;
              this.$notify({
                title: prompt,
                message: "",
                type: "success",
              });
              this.runAfterAction(status);
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              //this.$emit("closePopup", status);
              let prompt = response.data.errors[0].errmsg
                ? response.data.errors[0].errmsg
                : response.data.errmsg;
              this.$notify.error({
                title: response.data.errmsg,
                message: prompt,
              });
            }
          },
        });
      }
    },

    //执行脚本后
    runAfterAction(status) {
      let appId = this.openParams.appId;
      let document = this.documentData;
      let isRelate = "";
      let _flowType = this.act.flowType; //提交为80
      this.$api.submitRrunAfterActionScript(
        appId,
        this.act.id,
        document,
        document.docId,
        document.viewId,
        document.formId,
        document.templateForm,
        document.parentId,
        isRelate,
        _flowType,
        {
          onSucess: (response) => {
            if (response.data.errcode == 0 && !response.data.data) {
              // this.$notify({
              //   title: '成功',
              //   message: prompt,
              //   type: 'success'
              // });
              this.$emit("closePopup", status);
            } else if (response.data.errcode == 0 && response.data.data) {
              this.$notify({
                title: response.data.data.content.content,
                message: "",
                type: "error",
              });
              let sta = "ERROR";
              let isClose = true;
              this.$emit("closePopup", sta, isClose);
            }
            let workflowOrder = sessionStorage.getItem("workflowOrder");
            this.$store.dispatch("getPendingListWithWidget", {workflowOrder}); //流程提交完毕后首页流程处理widget数据重新刷新
            this.$store.dispatch("getProcessedListWithWidget", {workflowOrder});
            this.$store.commit("iscriptChanage") //流程提交完毕后首页计算脚本widget数据根据配置项重新刷新
          },
        }
      );
    },

    //隐藏小意见框
    hiddenSuggest() {
      console.log("隐藏小意见框");
      this.isOrSuggest = !this.isOrSuggest;
    },

    changeDiv() {
      this.currentAct = !this.currentAct;
    },

    //获取返回的数据
    getSuggest() {
      let userId = this.$store.state.userId;
      this.$api.getCommonOpinions(this.$root.user.id, {
        onSucess: (response) => {
          this.allSuggests = response.data.data;
        },
      });
    },

    //节点数据
    getSubmission() {
      let op = this.openParams;
      let appId = op.appId;
      if (this.act && this.act.type == 47) {
        //流程回退
        if (this.act.workFlowType == 1) {
          //自由流程
          let instanceId;
          for (let i = 0; i < this.approvers.length; i++) {
            instanceId = this.approvers[i].instanceId;
          }
          this.$api.getHisActorsFreeFlow(appId, instanceId, {
            onSucess: (response) => {
              this.backNodes = response.data.data;
            },
          });
        } else if (this.act.workFlowType == 0) {
          let formData = this.buildFormData;
          formData.stateId = this.stateId;
          let docId = formData.id,
            id = formData.id;
          let formId = '';
          let templateForm = '';
          if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
            formId = op.realformId;
            formData.formId = op.realformId;
            templateForm = op.actionContent;
          }else {
            formId = formData.formId;
          }
          let document = {
            applicationId: appId,
            docId: docId,
            document: formData,
            formId: formId,
            id: id,
            parentId: "",
            templateForm,
            viewId: "",
          };
          this.$api.getBackPanel(appId, docId, document, {
            onSucess: (response) => {
              this.backNodes = response.data.data.backNodes;
              this.selectBackNodes = this.backNodes[0].id;
              this.currentNodeId = response.data.data.currentNodeId; //当前节点ID
              this.flowId = response.data.data.flowId;
            },
          });
        }
      } else {
        let formData = this.buildFormData;
        formData.stateId = this.stateId;
        let docId = formData.id,
            id = formData.id;
        let formId = '';
        let templateForm = '';
        if(op.realformId) {//如果是模板表单，realformId是真实formID，而不是templateForm
          formId = op.realformId;
          formData.formId = op.realformId;
          templateForm = op.actionContent;
        }else {
          formId = formData.formId;
        }
        let document = {
          applicationId: appId,
          docId: docId,
          document: formData,
          formId: formId,
          id: id,
          parentId: "",
          templateForm,
          viewId: "",
        };
        API.getFlowPanel(appId, docId, document, {
          onSucess: (response) => {
            let nodesArr = response.data.data.nextNodes;
            this.isMoreCurrentNode = response.data.data.isMoreCurrentNode
              ? response.data.data.isMoreCurrentNode
              : "";
            let min;
            for (let i = 0; i < nodesArr.length; i++) {
              for (let j = i; j < nodesArr.length; j++) {
                if (nodesArr[j].orderNum > -1) {
                  if (nodesArr[i].orderNum > nodesArr[j].orderNum) {
                    min = nodesArr[j];
                    nodesArr[j] = nodesArr[i];
                    nodesArr[i] = min;
                  }
                }
              }
            }
            this.selectData = nodesArr;
            nodesArr.forEach((item, index) => {
              if (item.isToPerson) {
                this.isToPerson = item.isToPerson;
              }
              if(item.checkedOnMultiplePerson) { //当后台设置了选中下一步审批人，默认选中全部人
                let flowId = response.data.data.flowId, 
                    nodeId = item.id, 
                    type = 0, 
                    selectId = '', 
                    pageNum = 1, 
                    pageSize = 10;
                this.$api.getSelectApprovers(
                  appId, 
                  docId, 
                  flowId, 
                  nodeId, 
                  type, 
                  encodeURIComponent(selectId), 
                  pageNum, 
                  pageSize,
                  {
                    onSucess: res => {
                      let list = res.data.data.datas;
                      let name = '', userids = '';
                      let submitTo = {};
                      if(list && list.length) {
                        list.forEach(el => {
                          name += el.name + ";";
                          userids += el.id + ";";
                        });
                        name = name.replace(/^(\s|;)+|(\s|;)+$/g, '');
                        userids = userids.replace(/^(\s|;)+|(\s|;)+$/g, '');
                        submitTo = {
                          isToPerson: item.isToPerson,
                          nodeid: item.id,
                          userids: userids,
                          row:res.data.data.datas,
                        }
                        item.approverName = name;
                        item.submitTo = submitTo;
                        // item.isARole = true;
                        this.$forceUpdate();
                      }

                      if(item.groupNum == -2) {
                        let userid = [];
                        let obj = {};
                        obj.position = 1;
                        let arrId = [];
                        let row = [];
                        if(list && list.length >0 ) {
                          let params = list;
                          for(let j=0; j<params.length; j++) {
                            arrId.push(params[j].id)
                            row.push(params[j]);
                          }
                          obj.userids = arrId;
                          obj.rows = row;
                          userid.push(obj);
                        }
                        let subObj = {
                          approver:userid,
                          nodeid: item.id,
                        }
                        item.subFlowApproverData = subObj
                        let obj2 = {
                          groupNum: -2,
                          isToPerson: item.isToPerson,
                          nodeid: item.id,
                          type: "subflow",
                          row: row
                        }
                        let arr = []
                        arr.push(obj2)
                        this.subFlowParams.subFlowToApprover[index] = arr
                        this.$forceUpdate()
                      }
                    }
                  }
                );
              }else if(item.checkedOnSinglePerson) { //当后台设置了下一步审批人只有一人，默认选中该人时
                let flowId = response.data.data.flowId, 
                    nodeId = item.id, 
                    type = 0, 
                    selectId = '', 
                    pageNum = 1, 
                    pageSize = 10;
                this.$api.getSelectApprovers(
                  appId, 
                  docId, 
                  flowId, 
                  nodeId, 
                  type, 
                  encodeURIComponent(selectId), 
                  pageNum, 
                  pageSize,
                  {
                    onSucess: res => {
                      let list = res.data.data.datas;
                      let name = '', userids = '';
                      let submitTo = {};
                      if(list && list.length == 1) {
                        list.forEach(el => {
                          name += el.name + ";";
                          userids += el.id + ";";
                        });
                         name = name.replace(/^(\s|;)+|(\s|;)+$/g, '');
                        userids = userids.replace(/^(\s|;)+|(\s|;)+$/g, '');
                        submitTo = {
                          isToPerson: item.isToPerson,
                          nodeid: item.id,
                          userids: userids
                        }
                        item.approverName = name;
                        item.submitTo = submitTo;
                        item.isARole = true;
                        this.$forceUpdate();
                      }
                     
                    }
                  }
                );
              
              }
            });
             
            this.isSplit = response.data.data.isSplit;
            this.currentNodeId = response.data.data.currentNodeId; //当前节点ID
            this.isAppentCirculator = response.data.data.isAppentCirculator; //是否抄送;
            this.flowId = response.data.data.flowId;
            if (this.isSplit) {
              //复选
              this.nextNodeIds = [];
              this.selectData.forEach((item) => {
                if (item.checked == true) {
                  this.nextNodeIds.push(item.id);
                }
              });
            } else {
              //单选
              this.selectData.every((item) => {
                if (item.checked == true) {
                  this.nextNodeIds = item.id;
                }
                return false;
              });
            }
          },
        });
      }
    },
  },
};
</script>

