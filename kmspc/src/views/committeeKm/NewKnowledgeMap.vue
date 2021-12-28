<template>
  <div class="newKnowledgeMap" :class="{'paddingTop':paddingTop}">
    <el-container>
      <el-header class="card-header" :class="{'knHeard':knHeard}">
        <div class="mapOperation">
          <el-button icon="el-icon-back" size="mini" @click="back">{{$t('btns.return')}}</el-button>
          <el-button type="success" icon="el-icon-document" size="mini" @click="saveKnowledgeMap" v-if="mode != 'read'">{{$t('btns.save')}}</el-button>
          <el-button type="primary" icon="el-icon-check" size="mini" @click="onSubmitFlow" v-if="mode != 'read'">{{$t('btns.submit')}}</el-button>
          <el-button type="danger" icon="el-icon-bottom-left" size="mini" @click="onReturnFlow" v-show="isStandard" v-if="status != 'initiate' &&mode != 'read'">{{$t('btns.fallback')}}</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <div class="aside-left" :style="{'height':cileHeight}">
            <el-tabs class="tabs-title" v-model="activeName">
              <el-tab-pane :label="$t('btns.retrieve')" name="first">
                <div class="tabs-content-animated">
                  <div class="tabs-tabpane-active">
                    <div class="searchForm" :style="searchHeight">
                      <div class="searchItem">
                        <span class="label">{{$t('form.file_name')}}</span>
                        <el-input 
                          :placeholder="$t('placeholder.enter_keyword_search')" 
                          class="searchInput" 
                          size="medium" 
                          v-model="entInput"
                          @keyup.enter.native="search"></el-input>
                      </div>
                      <div class="searchResult">
                        <p class="number" v-show="isNmuber">{{$t('placeholder.no_search_results')}}</p>
                        <ul v-for="item in searchFieldData" :key="item.id" @click="addLinkToHtmlEditor(item)">
                          <li>
                            <a class="file">
                              <img 
                                v-if="item.type=='jpg' || item.type=='png' || item.type=='gif'"
                                :src="kmsFilePath+'/uploads/kms/'+item.url"
                                class="icon-file"/>
                              <i :class="setClass(item.type)" v-else></i>
                              {{item.name}}
                            </a>
                            <a class="file-arrow-right">
                              <i class="el-icon-s-unfold"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane :label="$t('menu.department_KM')" name="second">
                <div class="tabs-content-animated">
                  <div class="tabs-tabpane-active">
                    <div class="searchForm">
                      <div class="searchItem">
                        <span class="label">{{$t('menu.department_KM')}}:</span>
                        <!-- <div class="searchDepartment">
                          <div class="file-tree" v-show="searchShow">
                            <el-input v-model="keyWord" class="searchFile"></el-input>
                            <div class="fileShow">
                              <ul v-for="item in options" :key="item.id" class="file-tree-ul">
                                <li value="item.id" @click="addDepartment(item)">{{item.name}}</li>
                              </ul>
                              <ul v-show="fileNull" class="file-tree-ul">
                                <li style="cursor:not-allowed">{{$t('placeholder.no_data_available')}}</li>
                              </ul>
                            </div>
                          </div>
                        </div> -->
                          <div class="searchDepartment">
                          <el-input v-model="searchDepartment" @click.native="searchClick" suffix-icon="el-icon-arrow-down"></el-input>
                          <div class="file-tree" v-show="searchShow">
                            <el-input v-model="keyWord" class="searchFile"></el-input>
                            <div class="fileShow">
                              <ul v-for="item in options" :key="item.id" class="file-tree-ul">
                                <li value="item.id" @click="addDepartment(item)">{{item.name}}</li>
                              </ul>
                             <ul v-show="fileNull" class="file-tree-ul">
                                <li style="cursor:not-allowed">{{$t('placeholder.no_data_available')}}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <!-- <el-select v-model="value" filterable :placeholder="$t('select')" size="medium" @change="getFiles($event)">
                          <el-input size="medium" class="select-search__field" v-model="keyWord"></el-input>
                          <el-option
                            v-for="item in options"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                          </el-option>
                        </el-select> -->
                      </div>
                      <div class="searchResult">
                          <ul v-for="item in fileData" :key="item.id" @click="addLinkToHtmlEditor(item)">
                            <li>
                              <a class="file">
                                <img 
                                  v-if="item.type=='jpg' || item.type=='png' || item.type=='gif'"
                                  :src="kmsFilePath+'/uploads/kms/'+item.url"
                                  class="icon-file"/>
                                <i :class="setClass(item.type)" v-else></i>
                                {{item.name}}
                              </a>
                              <a class="file-arrow-right">
                                <i class="el-icon-s-unfold"></i>
                              </a>
                            </li>
                          </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <!-- <el-tab-pane :label="培训视频" name="third">
                <div class="tabs-content-animated">
                  <div class="tabs-tabpane-active">
                    <div class="searchForm">
                      <div class="searchItem">
                        <span class="label">名称:</span>
                        <el-input
                          :placeholder="文件名"
                          v-model="inputSearch" size="medium">
                            <el-button slot="append" icon="el-icon-search"></el-button>
                        </el-input>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane> -->
            </el-tabs>
          </div>
        </el-aside>
        <el-main>
          <div>
            <new-Knowledge-HTML :getFiledData="getFiledData" :personDataKnowledge="personDataKnowledge" ref="newKnowledgeData"></new-Knowledge-HTML>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <!-- 提交按钮的弹窗 -->
    <el-dialog :title="$t('title.select_committee_Administrator')" :visible.sync="dialogCommitteeAdmin">
      <div class="role-content">
        <div class="top">
          <el-input
            :placeholder="$t('tabs.definition')"
            v-model="searchAdmin" 

            size="mini"
            class="searchInput">
              <el-button slot="append" icon="el-icon-search" size="mini" @click="searchAdminName"></el-button>
          </el-input>
        </div>
        <div class="tableList">
          <el-table :data="adminData" @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column property="name" :label="$t('tabs.definition')" min-width="90%"></el-table-column>
            <el-table-column property="email" :label="$t('tabs.email')" width="200"></el-table-column>
            <el-table-column property="telephone" :label="$t('tabs.mobile')"></el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCommitteeAdmin = false;" size="mini">{{$t('btns.cancel')}}</el-button>
        <el-button type="primary" @click="dialogSubmit" size="mini">{{$t('btns.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--回退的弹窗  -->
  <el-dialog :title="$t('btns.fallback')" :visible.sync="dialogFormVisible" width="25%">
    <el-form>
      <el-form-item :label="$t('tabs.reason_rollback')" :label-width="formLabelWidth">
        <span>{{$t('placeholder.enter__rollback_reason')}}</span>
      </el-form-item>
      <el-form-item label="" :label-width="formLabelWidth">
        <el-input autocomplete="off" :placeholder="$t('placeholder.fallback_reason')" v-model="returnReason"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false" size="mini">{{$t('btns.cancel')}}</el-button>
      <el-button type="danger" @click="rollback" size="mini">{{$t('btns.fallback')}}</el-button>
    </div>
  </el-dialog>
  <!-- 用户选择框 -->
  <el-dialog :title="$t('user.select')" :visible.sync="isUserDialog">
    <div style="heigh: 360px;">
      <user-Dialog
        ref="userDialog"
        @handleSelectUser="handleSelectUser"
        :formParams="formParams">
      </user-Dialog>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="isUserDialog = false" size="mini">{{$t('btns.cancel')}}</el-button>
      <el-button type="primary" @click="handleSettingUserOk" size="mini">{{$t('btns.determine')}}</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
import newKnowledgeHTML from '@/components/shared/NewKnowledgeHTML.vue';
import UserDialog from '@/components/shared/UserDialog/UserDialog.vue';
import { getPreviewUrl } from "@/utils/utils.js";
export default {
  name: "newKnowledgeMap",
  components: {
    newKnowledgeHTML,
    UserDialog
  },
  data() {
    return {
      kmsFilePath: kmsFilePath,
      paddingTop: false,    //头部padding
      knHeard: false,
      activeName: 'first',
      searchHeight: {   //部门km展示栏style属性
        height: ''
      },   
      cileHeight: '',     //左边栏的高度
      options: [],
      value: '',
      inputSearch: '',
      isNmuber: false,   //检索查询是否有数据
      entInput: '',   //检索搜索框
      keyWord: '',    //部门km搜索文件框
      searchDepartment: "",     //部门km展示文件
      searchShow: false,        //部门km搜索栏
      fileNull: false,          //部门km暂无数据
      timer: null,
      optionsData: [],  //部门数据的数组
      fileData: [],
      searchFieldData: [],   //获取检索的数据
      param: {        //调接口参数
        mapId: '',        //知识地图id
        linesPerPage: 15,
        pageNo: 1,
      },
      dataJson: {     //传后台的包体
        ownerId: '',
        fileName: '',
        name: '',
        orderByfield: 'NAME',
        pageNo: 1,
        linesPerPage: 15,
      },
      getFiledData: '',
      serialNumber: '',
      dialogCommitteeAdmin: false,   //判断专委会弹窗是否打开
      adminData: [],       //管理员数据
      searchAdmin: '',
      multipleSelection: [],
      personDataKnowledge: {}, //员工km点击数据传入
      isStandard: false,    //指标状态时显示
      dialogFormVisible: false,
      formLabelWidth: '100px',
      returnReason: '',  //回退理由
      status: '',    //判断提交状态
      isUserDialog: false,
      formParams : {
        "serialNumber": "",
        "name":"",
        "description":"",
        "deptPermission":[],
        "compPermission":[],
        "members":[]
      },
      content : "",   //富文本框的value
      mode: "read",   //权限判断是否显示按钮

    }
  },
  mounted () {
    if(this.$store.state.isShowHeard){
      this.paddingTop = true;
      this.knHeard = true;
    }
    this.getDepartments();
    //当没有id时，确定是新建入口进来
    if(!this.$route.query.param.id){
      //当是新建/维护状态，应该给提交保存权限
      if(this.$refs.newKnowledgeData.status == "initiate" && (this.mode == ""|| this.mode == "read")){
        this.status = this.$refs.newKnowledgeData.status;
        this.mode = "edit"
      }
    }
    this.getScollerHeight();
  },
  methods: {
    /**
     * 动态计算页面table高度
     */
    getScollerHeight() {
      setTimeout(() => {
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        //50 头部， 50 面包屑 10边距 33底部授权信息
        this.cileHeight = (clientHeight - 50 - 50 - 10 -33) + 'px'
      }, 100)
    },
    //获取部门数据
    getDepartments() {
      if(this.$route.query.param.data && this.$route.query.param.data.personData){
        if(this.$route.query.param.data.personData.status != "initiate"){
          this.isStandard = true;
        }
        this.personDataKnowledge = this.$route.query.param.data.personData;
      }
      const param = {
        ...this.param,
        mapId: this.param.mapId,        //知识地图id
        linesPerPage: 999,
        pageNo: 1,
      }
      API.getKnowledgeDepartments(param,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.options = data.data.datas;
            
            this.optionsData = data.data.datas;
          }
        } 
      });
      //获取地图编号
      API.getSerialNumber({
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
          this.serialNumber = data.data;
          }
        } 
      });
      //获取知识地图的状态
      if(this.$route.query.param.id){
        API.getKnowledge(this.$route.query.param.id,{
          onSucess: resp => {
            let data = resp.data;
            if(data && data.data){
            this.status = data.data.status;
            this.mode = data.data.mode;
            }
          } 
        });
      }
    },
    //检索的搜索
    search(e) {
      this.dataJson.fileName = this.entInput;
      this.isNmuber = false;
      this.searchFieldData = [];
      API.getSearchFiles(this.dataJson,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            if(data.data.rowCount>0){
              this.searchFieldData = data.data.datas;
            }else{
              this.isNmuber = true
            }
          }
        } 
      });
    },
    /**
      部门km点击展示搜索
     */
    searchClick(){
      this.searchShow == false ? this.searchShow = true : this.searchShow = false;
    },
    /**
     * 添加部门数据到展示栏
     */
    addDepartment(val){
      this.searchDepartment = val.name;
      this.getFiles(val.id);
      this.searchShow = false;
    },


    //点击下拉框搜索
    getFiles(id) {
      this.dataJson.ownerId = id;
      API.getDepartmentsFiles(this.dataJson,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
           this.fileData = data.data.datas;
          }
        } 
      });
    },
    //动态获取类名
    setClass(type) {
      let obj = "icon-file icon-file-"+ type;
      return obj;
    },
    /**
      * 判断知识地图的流程状态
      */
    getMapStatus(status) {
      let currentSatus = 0;   //流程状态到达第几个
      switch(status) {
        case "initiate" :
            currentSatus = 1;
        break;
        case "standard" :
            currentSatus = 2;
        break;
        case "edit" :
            currentSatus = 3;
        break;
        case "review" :
            currentSatus = 4;
        break;
        case "pass" :
            currentSatus = 5;
        break;
        case "release" :
            currentSatus = 6;
        break;
      }
      return currentSatus;
    },
    //返回上一级
    back() {
      history.go(-1);
    },
    //保存知识地图
    saveKnowledgeMap() {
      let newKnowledgeData = this.$refs.newKnowledgeData;
      if(newKnowledgeData.titleControl !=""){
        const saveParams = {
          id: '',
          title: newKnowledgeData.titleControl,
          content: newKnowledgeData.content,
          serialNumber: this.serialNumber,
          knowledgeReamlId: this.$route.query.param.realmId,
        }
        //保存
        API.saveKnowledge(saveParams,{
          onSucess: resp => {
            let data = resp.data;
            if(data.errcode == 0){
              this.param.map = data.data.id
              this.$message({
                message: this.$t('msg.ss'),
                type: 'success'
              });
            }
          } 
        });
      }else{
        this.$message.error(this.$t('msg.fill_knowledge_map'));
      }
    },
    //提交
    onSubmitFlow() {
      if(this.status == "initiate" || this.status == ""){
        this.dialogCommitteeAdmin = true;
        //清空搜索框的内容
        this.dataJson.name = '';
        this.searchAdmin='';

        API.getCommitteeAdmin(this.dataJson,{
          onSucess: resp => {
            let data = resp.data;
            if(data && data.data){
              this.adminData = data.data.datas;
            }
          } 
        });
      }else if(this.status == "standard"){
        this.isUserDialog = true
      }else{
        this.dialogSubmit();
      }
    },
    //回退
    onReturnFlow() {
      this.dialogFormVisible = true;
    },
    //确定回退
    rollback() {
      this.param.mapId = this.$route.query.param.id;
      let returnDataJson = {}
      let flowHistorys = [];
      let remark = {};
      remark.remark = this.returnReason;
      flowHistorys.push(remark);
      returnDataJson.flowHistorys = flowHistorys
      API.rollback(this.param,returnDataJson,{
        onSucess: resp => {
          let data = resp.data;
          if(data.errcode == 0){
            this.$message({
              message: this.$t('msg.fallback_succeeded'),
              type: 'success'
            });
            setTimeout( () => {
              this.$router.push({path:"/personKm"});
            },500)
          }
        } 
      });
    },
    //提交专委会管理员的搜索功能
    searchAdminName() {
      this.dataJson.name = this.searchAdmin;
      API.getCommitteeAdmin(this.dataJson,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.adminData = data.data.datas;
          }
        } 
      });
    },
    //提交专委会管理员
    dialogSubmit() {
      let newKnowledgeData = this.$refs.newKnowledgeData;
      if(newKnowledgeData.titleControl !=""){
        let approverHistorys = [];
        let status = this.getMapStatus(newKnowledgeData.status);
        if(this.multipleSelection.length == 0 && status == 1){
          this.$message.error(this.$t('msg.panel_administrator_sl'));
          return false;
        }
        for(let i=0;i<this.multipleSelection.length;i++){
          let user = {}
          user.approverId = this.multipleSelection[i].id;
          user.approver = this.multipleSelection[i].name
          approverHistorys.push(user);
        }
        let mapId = this.$route.query.param.id;
        const submitData = {
          id: mapId ? mapId : this.param.mapId,
          title: newKnowledgeData.titleControl,
          serialNumber: this.serialNumber,
          knowledgeReamlId: this.$route.query.param.realmId,
          approverHistorys: approverHistorys,
          content: newKnowledgeData.content,
        }
        let that = this
        
        API.submitting(submitData,{
          onSucess: resp => {
            let data = resp.data;
            if(data.errcode == 0){
              this.$message({
                message: this.$t('msg.submit_ss'),
                type: 'success'
              });
              that.dialogCommitteeAdmin = false;
              setTimeout(() => {
                this.$router.go(-1);
              },500)
            }
          } 
        });
      }else{
        this.$message.error(this.$t('msg.fill_knowledge_map'));
      }
    },
    //用户选择框数据包
    handleSettingUserOk() {
      this.$refs.userDialog.handleSelectUser();
    },
    /**
     * 选择用户
     * @param {Object} data 
     */
    handleSelectUser(data){
      data.map((e) => {
        if(typeof(e.type) == "undefined" || e.type == "")
        e.type = 0;
      })
      this.multipleSelection = data;
      this.dialogSubmit()
    },

    //表格选择
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //添加文件到富文本编辑器
    addLinkToHtmlEditor(record) {
      let _html = "";
      let _href = "";
      let _target = "_blank";
      const content = this.$refs.newKnowledgeData.content;
      //文件夹直接打开
      if(record.folder){
        this.dataJson.ownerId = record.id;
        API.getDepartmentsFiles(this.dataJson,{
          onSucess: resp => {
            let data = resp.data;
            if(data && data.data){
            this.fileData = data.data.datas;
            }
          } 
        });
      }else{
        const preview_params={
          'id' : record.id,  //文件id
          'diskId' : record.diskId
        }
         const previewUrl = getPreviewUrl(preview_params)
        _href = kmsConfig.staticContextPath + "/kms/asset" + previewUrl.substr(1);
        _html = content + "<div><a target='"+_target+
                "' href='"+_href+"'>"+record.name;
        this.content = _html;
        this.getFiledData = _html;
      }
    },
  },
  watch: {
    keyWord() {
      let that = this
      this.fileNull = false;
      if(this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout( () => {
        const result = [];
        for(let i in that.optionsData){
          if(that.optionsData[i].name.indexOf(that.keyWord)>-1){
            result.push(that.optionsData[i]);
          }
        }
        if(result.length == 0){
          this.fileNull = true;
        }
        that.options = result
      },50)
    }
  }
  
}
</script>
