<template>
  <div>
    <div class="flow-wrap">
      <div class="refer">
        <div class="refer-left">{{$t('view.submit')}}:</div>
        <div class="refer-right">

          <!--自由流程-->
          <div class="free-flow" v-if="act.workFlowType==1">
            <div class="list-right">
              <div class="select-peo">{{$t('placeholder.select')</div>
              <div class="add">
                <img src="../assets/images/add.png" />
              </div>
            </div>
          </div>

          <!-- 单选时 -->
          <div class="refer-radio" v-if="!isSplit">
            <el-radio-group v-model="nextNodeIds">
              <el-radio 
                v-for="(item, index) in selectData" 
                :key="index" 
                :label="item.id">
                {{item.name}}
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 复选时 -->
          <div class="refer-check" v-if="isSplit">
            <el-checkbox-group 
              @change="handleCheckedCitiesChange"
              v-model="nextNodeIds"
            >
              <el-checkbox 
                v-for="(item, index) in selectData" 
                :label="item.id" 
                :key="index">
                  {{item.name}}
                </el-checkbox>
            </el-checkbox-group>
          </div>
          {{nextNodeIds}}
        </div>
      </div>

      <transition :duration="1000" name="face">
        <div v-bind:class="[currentAct ? 'idea' : 'bigIdea' , 'common-idea']">
          <div class="idea-left">
            {{$t('suggest')}}:
          </div>
          <div class="idea-right">
            <div class="idea-use" >
              <span class="use-tip" @click="hiddenSuggest()">
                {{$t('view.fre_suggesst')}}&nbsp;
                <i class="fa fa-caret-down common-opinion-icon"></i>
              </span>
              <div class="use-suggest" v-if="isOrSuggest">
                <div class="sug-data" v-if="allSuggests">
                  <span class="data-row" v-for="(item, index) in allSuggests" :key="index" @click="putData(item.content)">
                    <span>{{item.content}}</span>
                    <span class="icon" v-if="showDelAndEdit">
                      <i class="fa fa-trash-o" @click="deleteSuggestion(item.id)"></i>
                      <i class="fa fa-pencil-square-o" @click.stop.prevent="editSuggestion(item.id, item.content)"></i>
                    </span> 
                  </span>
                </div>
                <div class="sug-btn"  v-if="!showInput">
                  <div class="btns">
                    <span @click="showInputBox">{{$t('view.add_fre_suggesst')}}</span>
                    <span @click="editSuggest">{{$t('view.edit_suggesst')}}</span>
                  </div>
                </div>
                <div class="sug-new" v-if="showEditFirst">
                  <div class="new-input">
                    <input type="text" v-model="input" />
                  </div>
                  <div class="keep-cancel">
                    <span @click="cancelAddSuggest(1)">{{$t('btns.cancel')}}</span>
                    <span @click="addSuggestion">{{$t('btns.save')}}</span>
                  </div>
                </div>
                <div class="sug-new" v-if="showEditSecond">
                  <div class="new-input">
                    <input type="text" v-model="inputSecond" />
                  </div>
                  <div class="keep-cancel">
                    <span @click="cancelAddSuggest(2)">{{$t('btns.cancel')}}</span>
                    <span @click="updateSuggestion">{{$t('btns.save')}}2</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 文本框 -->
            <div class="idea-textbox">
              <el-input
                type="textarea"
                :rows="3"
                :placeholder="$t('view.submit_note')"
                maxLength="140"
                v-model="attitude">
              </el-input>
            </div>
            
            <!--底部-->
            <div class="idea-opinion">
              <span>
              </span>
              <span @click="changeDiv">
                <img src="../assets/images/qianzi.png" />
                {{$t('view.Hand_signed')}}
              </span>
            </div>

            <!--手签意见-->
            <div class="idea-canvas" v-show="!currentAct">
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
              >{{$t('view.nosupport_canvas')}}</canvas>
            </div>
            <div class="idea-clear" v-if="!currentAct">
              <el-button 
                class="btn"
                size="mini" 
                @click="clear">
                {{$t('view.rewrite')}}
              </el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div class="footer-btn">
      <div>
        <!-- <el-button size="medium" type="success" @click="getPhoto">{{$t('view.sub')}}</el-button> -->
        <el-button size="medium" type="success" @click="onSubmit(firstSubmission)">{{$t('view.sub')}}</el-button>
        <span class="pack-up">{{$t('retracting')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  props: [
    "stateId", 
    "act", 
    "buildFormData",
  ],
  data: function() {
    return {
      checkedCities: ['上海'],//复选
      cities: ['上海', '北京'],
      nextNodeIds: undefined,
      radio: '',
      selectData:[],
      isSplit:true,
      currentAct:true,
      isOrSuggest:false,
      attitude: '',
      input: '', //单选框数据
      showInput:false, //是否展示添加常见意见框
      showEditFirst:false, //展示{{$t('view.edit_suggesst')}}框
      showDelAndEdit:false,
      allSuggests:[],
      showEditSecond:false,
      inputSecond:'',
      opinionId:'', //更新意见信息的ID

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

      flowId:"", //当前流程ID
      isAppentCirculator: "", //是否抄送
      currentNodeId: "",
      isToPerson: "",
      firstSubmission: true, //第一次点击提交禁止按钮再次点击
      existCanvas: false, //是否存在手写签名
    };
  },
  mounted(){
    this.getSubmission();
    this.getSuggest();
    this.show();
  },
  methods: {
    handleCheckedCitiesChange(value) {
      console.log("------------->",value)
    },
    //保存重新编辑的意见
    updateSuggestion() {
      console.log("更新编辑的数据-->");
      console.log(this.inputSecond);
      let userId = this.$store.state.userId, 
          opId = this.opinionId, 
          opinion = this.inputSecond;
      API.editMostUseSuggestion(
        userId,
        opId,
        opinion,
        {
          onSucess: response => {
            if(response.data.data) {
              let id = response.data.data.id;
              let content = response.data.data.content;
              for(let i=0; i<this.allSuggests.length; i++) {
                if(this.allSuggests[i].id == id) {
                 
                  this.allSuggests[i].content = content;
                  this.inputSecond = '';
                }
              }
            }
            
          }
        }
      )
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
      API.deleteMostUseSuggestion(
        userId,
        opId,
        {
          onSucess: response => {
            console.log(response.data.data);
            //后台返回500，未执行以下步骤
            if(response.data.data) {
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
            
          }
        }
      )
    },

    //添加意见
    addSuggestion() {
      console.log(this.input);
      let userId = this.$store.state.userId;
      let opinion = this.input;
      API.AddMostUseSuggestion(
        userId,
        opinion,
        {
          onSucess: response => {
            console.log(response.data.data);
            let newSuggest = response.data.data;
            this.allSuggests.push(newSuggest);
            this.input="";
          }
        }
      )
    },

    // 选中的数据放进文本框中
    putData(content){
      if(this.showDelAndEdit == false) {
        if(!this.textarea) {
          this.textarea = content;
        }else if(this.textarea){
          this.textarea = this.textarea + "," + content;
        }

      }
      
    },
    editSuggest(){
      this.showInput = true;
      this.showEditFirst = false;
      this.showEditSecond = true;
      this.showDelAndEdit = true;
    },
    cancelAddSuggest(num){
      if(num == 1) {
        this.showInput = false;
        this.showDelAndEdit = false;
        this.showEditFirst = false;
      }else if(num == 2) {
        this.showInput = false;
        this.showDelAndEdit = false;
        this.showEditSecond = false;
      }
      
    },
    showInputBox() {
      this.showInput = true;
      this.showEditFirst = true;
    },
    showEditBox(){

    },

    //清除画布数据
    clear(){
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      this.existCanvas = false;
    },
    show(){
      this.canvas = this.$refs.canvas;//指定canvas
      this.canvasTxt = this.canvas.getContext("2d");//设置2D渲染区域
      this.canvasTxt.fillStyle = "#fff";
      this.canvasTxt.fillRect(0,0,500,125);
    },
    canvasDown(ev) {
      ev = ev || event
      ev.preventDefault()
      if (1) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY
        }
        this.startX = obj.x
        this.startY = obj.y
        this.canvasTxt.beginPath()
        this.canvasTxt.moveTo(this.startX, this.startY)
        this.canvasTxt.lineTo(obj.x, obj.y)
        this.canvasTxt.stroke()
        this.canvasTxt.closePath()
        this.points.push(obj)
        this.isDown = true
      }
      
    },
    canvasMove(ev) {
      ev = ev || event
      ev.preventDefault()
      if (this.isDown) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY
        }
        this.moveY = obj.y
        this.moveX = obj.x
        this.canvasTxt.beginPath()
        this.canvasTxt.moveTo(this.startX, this.startY)
        this.canvasTxt.lineTo(obj.x, obj.y)
        this.canvasTxt.stroke()
        this.canvasTxt.closePath()
        this.startY = obj.y
        this.startX = obj.x
        this.points.push(obj)
      }
    },
    canvasUp(ev) {
      ev = ev || event
      ev.preventDefault()
      if (1) {
        let obj = {
          x: ev.offsetX,
          y: ev.offsetY
        }
        this.canvasTxt.beginPath()
        this.canvasTxt.moveTo(this.startX, this.startY)
        this.canvasTxt.lineTo(obj.x, obj.y)
        this.canvasTxt.stroke()
        this.canvasTxt.closePath()
        this.points.push(obj)
        this.points.push({x: -1, y: -1})
        this.isDown = false
      }

    },
    canvasLeave(e) {
      console.log(e);
      this.existCanvas = true;
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
          data: str
        };
        return pJson;
      } else {
        return false;
      }
    },

     //提交
    onSubmit() {
     
      if(this.selectData.length > 0 || this.act.workFlowType == 1) {
        if (this.firstSubmission) { //当提交时，确定按钮禁止再次点击提交
          this.firstSubmission = false;
          let status = "";
          if (this.isToPerson) { //当要选择指定审批人时
            if (this.isSplit) {
              //多选
              if (this.nextNodeIds.length > 0) {
                for (let i = 0; i < this.nextNodeIds.length; i++) {
                  for (let j = 0; j < this.selectData.length; j++) {
                    if (this.nextNodeIds[i] == this.selectData[j].id) {
                      if (this.selectData[j].type != "CompleteNode") {
                        if (!this.selectData[j].submitTo) {
                          if(this.selectData[j].isToPerson) {
                             
                            this.$emit("closePopup", status);
                            return;
                          }
                        }
                      }
                    }
                  }
                }
              } else if (this.nextNodeIds.length == 0) {
                 
                this.$emit("closePopup", status);
                return;
              }
            } else {
              //单选
              if (this.nextNodeIds) {
                for (let y = 0; y < this.selectData.length; y++) {
                  if (this.nextNodeIds == this.selectData[y].id) {
                    if (this.selectData[y].type != "CompleteNode") {
                      if (!this.selectData[y].submitTo && !this.selectData[y].subFlowApproverData) {
                        if(this.selectData[y].isToPerson) {
                           
                          this.$emit("closePopup", status);
                          return;
                        }
                      }
                    }
                  }
                }
              } else {
                 
                this.$emit("closePopup", status);
                return;
              }
            }
          }

          if (this.nextNodeIds instanceof Array) {  //多选但没有指定审批人没有选择审批人时
            if(this.nextNodeIds.length < 1) {
               
              return;
            }
          }

          if (this.act.workFlowType == 1) {
            if (!this.nextUserId) {
               
              status = "ERROR";
              this.$emit("closePopup", status);
              return;
            }
          }

          let pJson = this.getSignImageData();
          //let formData = this.$parent.$parent.$parent.$parent.$parent.buildFormData();
          let formData = this.buildFormData;
          formData.stateId = this.stateId;
          let docId = formData.id,
            id = formData.id;
          let formId = formData.formId;
          let document = {
            applicationId: this.$root.appid,
            currentNodeId: this.currentNodeId,
            docId: docId,
            document: formData,
            flowId: this.flowId,
            formId: formId,
            id: id,
            parentId: "",
            templateForm: "",
            viewId: ""
          };

          if(this.isAppentCirculator) { //判断是否抄送
            if(this.isAppentData.circulatorInfo) {
              document.circulatorInfo = this.isAppentData.circulatorInfo;
            }
          }

          

          this.documentData = document; //保存值放到执行后脚本

          let isRelate = '';
          let _flowType = this.act.flowType; //提交为80
          this.$api.submitRunBeforeActionScript(
            this.$root.appid,
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
              onSucess: response => {
                if (response.data.errcode == 0) {
                  if(response.data.data) {
                     
                  }else {
                    this.submitFlowData(document, pJson);
                  }
                
                }
              }
            }
          );
        }
      }
    },
    submitFlowData(allData, pJson) {
      //let formData = this.$parent.$parent.$parent.$parent.$parent.buildFormData();
      let formData = this.buildFormData;
      let appId = this.$root.appid;
      let docId = formData.id;
      let document = allData;
      if (pJson) {
        //手写签名
        document.signatureJson = JSON.stringify(pJson);
      }

      document.attitude = this.attitude;

      if (this.act.workFlowType == 1) {
        //自由流程
        document.nextUserId = this.nextUserId;
        delete document.currentNodeId;
        delete document.flowId;
        API.submitFreeFlow(appId, docId, document, {
          onSucess: response => {
            this.firstSubmission = true;
            let status;
            let prompt;
            if (response.data.errcode == 0) {
              status = "SUCCESS";
              prompt = response.data.data;
              this.runAfterAction(status, prompt);
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              this.$emit("closePopup", status);
              if (response.data.errors && response.data.errors.length > 0) {
                Toast({
                  message: response.data.errors[0].errmsg,
                  iconClass: "fa fa-close fa-2x"
                });
              }
            }
          }
        });
      } else {
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
                console.log("this.selectData[y]-->",this.selectData[y]);
                delete this.selectData[y].submitTo.row;
                document.submitTo.push(this.selectData[y].submitTo);
                if (this.selectData[y].type == "SubFlow") {
                  //主子流程
                  let checkObj = Object.assign({}, this.selectData[y].submitTo);
                  delete checkObj.isToPerson;
                  checkArr.push(checkObj);
                }
              }
            }
          }
          document.subFlowApprover = checkArr;
        } else {
          // 单选
          document.nextNodeIds = [];
          document.nextNodeIds.push(this.nextNodeIds);
          //let arr = [];
          let subArr = [];
          for (let i = 0; i < this.selectData.length; i++) {
            if (
              this.selectData[i].submitTo &&
              this.selectData[i].submitTo.nodeid == this.nextNodeIds
            ) {
              delete this.selectData[i].submitTo.row;
              subArr.push(this.selectData[i].submitTo);
              if (this.selectData[i].type == "SubFlow") {
                //主子流程
                let obj = Object.assign({}, this.selectData[i].submitTo);
                delete obj.isToPerson;
                obj.userids = obj.userids.replace(/^(\s|;)+|(\s|;)+$/g, '');
                let useridData = obj.userids.split(";"); 
                let approverObj = {
                  position:1,
                  userids: useridData,
                }
                let approverArr = [];
                approverArr.push(approverObj);
                //arr.push(obj);
                let subFlowObj = {
                  approver: approverArr,
                  nodeid:obj.nodeid,
                }
                document.subFlowApprover.push(subFlowObj);
              }else {
                document.submitTo = subArr
              }
            }else if (  //当是子流程时
              this.selectData[i].subFlowApproverData &&
              this.selectData[i].subFlowApproverData.nodeid == this.nextNodeIds
            ) {
              let subflowData = Object.assign({}, this.selectData[i].subFlowApproverData);
              for(let j=0; j<subflowData.approver.length; j++) {
                delete subflowData.approver[j].rows
              }
              document.subFlowApprover.push(subflowData);
            }
          }
          //document.subFlowApprover = arr;
          //document.submitTo = subArr;
        }
        API.submitFlow(appId, docId, document, {
          onSucess: response => {
            this.firstSubmission = true;
            let status;
            let prompt;
            if (response.data.errcode == 0) {
              status = "SUCCESS";
              prompt = response.data.data;
              this.runAfterAction(status, prompt);
              
            } else if (response.data.errcode == 4001) {
              status = "ERROR";
              this.$emit("closePopup", status);
              let prompt = response.data.errors[0].errmsg
                ? response.data.errors[0].errmsg
                : response.data.errmsg;
              
            }
          }
        });
      }
    },

     //执行脚本后
    runAfterAction(status, prompt) {
      let document = this.documentData;
      let isRelate = '';
      let _flowType = this.act.flowType; //提交为80
      this.$api.submitRrunAfterActionScript( 
        this.$root.appid,
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
          onSucess: response => {
            if (response.data.errcode == 0 && !response.data.data) {
              this.$notify({
                title: this.$t('success'),
                message: prompt,
                type: 'success'
              });
              this.$emit("closePopup", status);
            }else if(response.data.errcode == 0 && response.data.data) {
              let sta = "ERROR";
              let isClose = true;
              this.$emit("closePopup", sta, isClose);
               
            }
          }
        }
      );
    },



    //隐藏小意见框
    hiddenSuggest() {
      console.log("隐藏小意见框");
      this.isOrSuggest = !this.isOrSuggest;
    },
    changeDiv(){
      this.currentAct = !this.currentAct;
    },
    
    //获取返回的数据
    getSuggest(){
      let userId = this.$store.state.userId;
      this.$api.getCommonOpinions(this.$root.user.id, {
        onSucess: response => {
          this.allSuggests = response.data.data;
        }
      });
    },

    //节点数据
    getSubmission(){
      if (this.act.workFlowType && this.act.workFlowType == 1) {
        console.log("自由流程-->");
      } else {
        console.log("其他-->");
      }
      let formData = this.buildFormData;
      formData.stateId = this.stateId;
      let appId = this.$root.appid;
      let docId = formData.id,
        id = formData.id;
      let formId = formData.formId;
      let document = {
        applicationId: appId,
        docId: docId,
        document: formData,
        formId: formId,
        id: id,
        parentId: "",
        templateForm: "",
        viewId: ""
      };
      API.getFlowPanel(appId, docId, document, {
        onSucess: response => {
          let nodesArr = response.data.data.nextNodes;
          let min;
          for (let i = 0; i < nodesArr.length; i++) {
            for (var j = i; j < nodesArr.length; j++) {
              if (nodesArr[j].orderNum) {
                if (nodesArr[i].orderNum > nodesArr[j].orderNum) {
                  min = nodesArr[j];
                  nodesArr[j] = nodesArr[i];
                  nodesArr[i] = min;
                }
              }
            }
          }
          this.selectData = nodesArr;
          this.selectData.forEach(item => {
            if (item.isToPerson) {
              this.isToPerson = item.isToPerson;
            }
          });
          this.isSplit = response.data.data.isSplit;
          this.currentNodeId = response.data.data.currentNodeId; //当前节点ID
          this.isAppentCirculator = response.data.data.isAppentCirculator; //是否抄送;
          this.flowId = response.data.data.flowId;
          if (this.isSplit) {
            //复选
            this.nextNodeIds = [];
            this.selectData.forEach(item => {
              if (item.checked == true) {
                this.nextNodeIds.push(item.id);
              }
            });
          } else {
            //单选
            this.selectData.every(item => {
              if (item.checked == true) {
                this.nextNodeIds = item.id;
              }
              return false;
            });
          }
        }
      });

         

    }
  }
}
</script>

