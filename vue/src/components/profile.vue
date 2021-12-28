<template>
  <div class="profile-box">
    <el-tabs :tab-position="tabPosition" class="tab-wraper">
      <!--个人设置-->
      <el-tab-pane :label="$t('profile.basic_info')">
        <!-- {{information}} -->
        <div class="fieldset-box">
          <fieldset class="basic-info" >
            <legend class="legend">{{$t('profile.basic_info')}}</legend>
            <label>{{$t('profile.user_name')}}:</label>
            <el-input v-model="information.name"></el-input>
            <label for>{{$t('profile.account')}}:</label>
            <el-input :disabled="true" v-model="information.loginNo"></el-input>
            <br />
            <label for>{{$t('profile.email')}}:</label>
            <el-input v-model="information.email" @blur="checkedEmail"></el-input>
            <label for>{{$t('profile.tel')}}:</label>
            <el-input v-model="information.mobile" @blur="checkedMobile"></el-input>
          </fieldset>

          <fieldset class="password">
            <legend class="legend">{{$t('profile.change_pwd')}}</legend>
            <label for>{{$t('profile.old_pwd')}}:</label>
            <el-input v-model="oldPassword" type="password"></el-input>
            <br />
            <label for>{{$t('profile.new_pwd')}}:</label>
            <el-input v-model="newPassword" type="password"></el-input>
            <br />
            <label for>{{$t('profile.confirm_pwd')}}:</label>
            <el-input v-model="affirmPassword" type="password"></el-input>
          </fieldset>
          <div class="saveChange">
            <div class="exitbtn">
              <el-button type="success" @click="UserSetups">{{$t('btns.save')}}</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <!--皮肤样式-->
      <!-- <el-tab-pane label="皮肤样式">
        <div>
          <table class="table_noborder" width="100%" style="margin-top: 15px;">
            <tbody>
              <tr class="selectSkin">
                <td align="center">
                  <div class="personSetSkin" style="float:left">
                    <div @click="addSkin">
                      <img src="/preview-good.gif" alt class="addImg" />
                      <div class="focusImg" style="display: block;">
                        <img src="/obpm/resource/images/iconfont-zhuangtai.gif" v-show=" showAttr" />
                      </div>
                    </div>
                    <span class="skinLabel">
                      <input
                        type="radio"
                        name="content.userSkin"
                        value="good"
                        style="display:none;"
                        checked="checked"
                      />
                      <span>good</span>
                    </span>
                  </div>

                  <div class="personSetSkin" style="float:left">
                    <div @click="addModality">
                      <img src="/preview-H5.gif" alt class="addImg" />
                      <div class="focusImg">
                        <img src="/obpm/resource/images/iconfont-zhuangtai.gif" v-show="showReveal" />
                      </div>
                    </div>
                    <span class="skinLabel">
                      <input type="radio" name="content.userSkin" value="H5" style="display:none;" />
                      <span>{{$t('profile.default')}}</span>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="skinkung">
            <div class="skinright">
              <el-button type="success" @click="Userskin">{{$t('profile.use')}}</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane> -->
      <!--代理设置-->
      <el-tab-pane :label="$t('profile.proxy_setting')">
        <div class="agency-container">
          <div class="agency-header">
            <span>{{$t('profile.flow_proxy')}}:</span>
            <b class="agency-b">{{$t('profile.software')}}:</b>
            <el-radio-group v-model="selectSoftwareId">
              <el-radio 
                v-for="(item,index) in allSoftware" 
                :key="index" 
                :label="item.id"
                @change="onChange"
                >{{item.name}}</el-radio>
            </el-radio-group>
          </div>
          <div class="agency-middle">
            <div class="agency-left">
              <el-button 
                size="medium" 
                type="primary" 
                @click="construction" 
              >
                {{$t('btns.new')}}
              </el-button>
              <el-button 
                size="medium" 
                type="danger" 
                @click="DELETEusersetups"
              >
                {{$t('btns.delete')}}
              </el-button>
            </div>
            <div class="agency-right">
              <label for>{{$t('profile.flow_name')}}:</label>
              <div class="flow-name">
                <el-input 
                  v-model="agency" 
                  ref="empty"
                ></el-input>
              </div>
              <el-button 
                size="medium" 
                type="primary"
                @click="searchFlow"
              >
                {{$t('btns.query')}}
              </el-button>
              <el-button 
                size="medium" 
                type="danger"
                @click="replacement"
              >
                {{$t('btns.reset')}}
              </el-button>
            </div>
          </div>
          <div class="agency-box">
            <el-scrollbar class="scrollbar">
              <el-table
                ref="Current"
                :data="process"
                tooltip-effect="dark"
                @selection-change="handleCurrentChange"
              >
                <el-table-column prop="id" type="selection" width="55"></el-table-column>
                <el-table-column prop="flowName" :label="$t('profile.flow_name')"></el-table-column>
                <el-table-column :label="$t('profile.proxy_way')">
                  <template slot-scope="scope">
                    <span v-if="scope.row.proxyMode == 0">{{$t('profile.appoint_proxy')}}</span>
                    <span v-if="scope.row.proxyMode == 1">{{$t('profile.all_proxy')}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" :label="$t('profile.description')" show-overflow-tooltip></el-table-column>
                <el-table-column prop="agentsName" :label="$t('profile.empower')"></el-table-column>
                <el-table-column prop="state" :label="$t('profile.status')">
                  <template slot-scope="scope">
                    <span v-if="scope.row.state == '0'">{{$t('profile.forbiddden')}}</span>
                    <span v-if="scope.row.state == '1'">{{$t('profile.activate')}}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('operate')">
                  <template slot-scope="scope">
                    <i class="el-icon-edit edit" @click="fountain(scope.row, scope.$index)"></i>
                    <i class="el-icon-delete" @click="deleteFlow(scope.row, scope.$index)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>
            <div class="page"> 
              <el-pagination
                background
                layout="total, prev, pager, next,jumper"
                :total="row_count"
                :page-size="10"
                :current-page.sync="currentPage"
                @current-change="handlAgentpaging($event)"
              ></el-pagination>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <!--通讯录-->
      <el-tab-pane :label="$t('profile.tel_list')">
        <div class="address-book">
          <div class="dendrogram">
            <div class="left">
              <a href="###" @click="ContentBox">{{$t('profile.all_linkman')}}</a>
            </div>
            <div class="doNewGroup">
              <a href="###" @click="setNewGroup()">
                <span class="el-icon-plus"></span>
                {{$t('profile.new_group')}}
              </a>
            </div>
            <div class="group-list" v-for="(item, index) in groupList" :key="index">
              <span class="group-left" @click="toPacketData(item)">{{item.name}}</span>
              <span class="group-right">
                <i class="el-icon-edit" @click="setNewGroup(item)"></i>
                <i class="el-icon-delete" @click="deleteGroup(item, index)"></i>
              </span>
            </div>
          </div>
          <div class="content">
            <div class="content-width">
              <div class="agency-left">
                <el-button 
                  size="medium"
                  type="primary"
                  @click="contentNowrap"
                >
                {{$t('profile.add')}}  
                </el-button>
                <el-button 
                  v-if="isOneGroup"
                  size="medium"
                  type="danger"
                  @click="moveOutOfGroup"
                >
                 {{$t('profile.move')}} 
                </el-button>
              </div>
              <div class="agency-right">
                <label for>{{$t('profile.user_name')}}:</label>
                <div class="flow-name">
                  <el-input 
                    v-model="nohark" 
                    ref="empty"
                  ></el-input>
                </div>
                <el-button 
                  size="medium" 
                  type="primary"
                  @click="inquire"
                >
                 {{$t('btns.query')}}
                </el-button>
                <el-button 
                  size="medium" 
                  type="danger"
                  @click="reset"
                >
                  {{$t('btns.reset')}}
                </el-button>
              </div>
            </div>
            <div class="content-keep">
              <el-scrollbar class="scrollbar">
                <!--通讯录的table表格-->
                <el-table
                  :data="tableData"
                  ref="multipleTable"
                  tooltip-effect="dark"
                  row-key="1"
                  @selection-change="handleGrounpChange"
                >
                  <el-table-column type="selection" width="55"></el-table-column>
                  <el-table-column prop="name" :label="$t('profile.user_name')">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                  </el-table-column>
                  <el-table-column prop="mobile" :label="$t('profile.tel')"></el-table-column>
                  <el-table-column prop="email" :label="$t('profile.email')"></el-table-column>
                </el-table>
              </el-scrollbar>
            </div>
            <!--分页器-->
            <div class="page">
              <el-pagination
                background
                layout="total,prev, pager, next,jumper"
                :total="tableDataNum"
                :page-size="pageSize"
                :current-page.sync="pageNum"
                @current-change="Addressbookpaging($event)"
              ></el-pagination>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!--添加代理窗口-->
    <el-dialog 
      :title="$t('profile.add_proxy')"
      :visible.sync="centerDialogVisible" 
      width="40%" 
      class="new-flow-dialog"
      :before-close="proxyClose"
    >
      <div class="dialog-box">
        <el-form :label-position="labelPosition" label-width="145px">
          <el-form-item :label="$t('profile.proxy_mode')">
            <!-- <el-radio v-model="proxyMode" label="0">{{$t('profile.proxy_some')}}</el-radio>
            <el-radio v-model="proxyMode" label="1">{{$t('profile.proxy_all')}}</el-radio> -->
            <el-radio-group v-model="proxyMode" @change="changeHandler">
              <el-radio label="0">{{$t('profile.proxy_some')}}</el-radio>
              <el-radio label="1">{{$t('profile.proxy_all')}}</el-radio>
            </el-radio-group>

          </el-form-item>
          <el-form-item :label="$t('profile.flow_name')" v-if="proxyMode == '0'">
            <div class="comm">
              <el-input :disabled="true" v-model="flowName"></el-input>
              <el-button class="btn" size="small" @click="showInnerDialog" plain>{{$t('btns.select')}}</el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('profile.empower')">
            <div class="comm">
              <el-input :disabled="true" v-model="authorizedUser"></el-input>
              <el-button class="btn" size="small" @click="showUserDialg" plain>{{$t('btns.select')}}</el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('view.proxy_start')">
            <div class="comm">
              <el-date-picker
                v-model="startDay"
                type="datetime"
                placeholder="">
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item :label="$t('view.proxy_end')">
            <div class="comm">
              <el-date-picker
                v-model="endDay"
                type="datetime"
                placeholder="">
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item :label="$t('profile.status')">
            <el-radio v-model="state" label="1">{{$t('profile.activate')}}</el-radio>
            <el-radio v-model="state" label="0">{{$t('profile.forbiddden')}}</el-radio>
          </el-form-item>
          <el-form-item :label="$t('profile.description')"> 
            <div class="comm">
              <el-input
                type="textarea"
                :rows="3"
                :placeholder="$t('placeholder.content')"
                v-model="description">
              </el-input>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" type="primary" @click="centerDialog">{{$t('btns.sure')}}</el-button>
      </span>
    </el-dialog>

    <!--流程列表-->
    <el-dialog 
      v-if="innerVisible"
      :title="$t('placeholder.s_flow')" 
      :visible.sync="innerVisible" 
      width="40%" 
      class="new-flow-dialog"
    >
      <div class="dialog-box">
        <div class="search-box">
          <div class="input-box">
            <el-input
              @keyup.enter.native="handleIconSearch(searchFlowValue)"
              :placeholder="$t('placeholder.condition')"
              v-model="searchFlowValue">
              <i class="el-icon-search" slot="suffix" @click="handleIconSearch(searchFlowValue)"></i>
            </el-input>
          </div>
        </div>
        <div class="flow-list">
          <el-scrollbar class="scrollbar">
            <el-table
              :data="flowData"
              ref="flowTable"
              tooltip-effect="dark"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-model="checkedFlowId"
                type="selection" 
                width="55">
              </el-table-column>
              <el-table-column 
                prop="name" 
                :label="$t('profile.flow_name')">
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button 
          size="medium" 
          plain="" 
          @click="innerVisible=false"
        >{{$t('btns.cancel')}}</el-button>
        <el-button 
          size="medium" 
          type="primary" 
          @click="getFlowName"
        >{{$t('msg.confirm')}}</el-button>
      </span>
    </el-dialog>

    <!--用户选择框-->
    <div class="comm-dialog">
      <comm-dialog
        :title="$t('view.select_user')"
        v-if="userVisible"
        :visible.sync="userVisible"
      >
        <form_selectApprover_flowpanel
          slot="body"
          :isProxys="isProxys"
          :saveApproverStatus="saveApproverStatus"
          @action = "selectApprover"
        />
      </comm-dialog>
    </div>

    <!--通讯录新建分组弹窗-->
    <div class="address-book-dialog">
      <comm-dialog
        width="28%"
        :title="currentGroupName"
        v-if="addressBookVisible"
        :visible.sync="addressBookVisible"
      >
        <div slot="body" class="body-box">
          <span>
            {{$t('view.g_name')}}:
          </span>
          <div class="input">
            <el-input v-model="newGroupName" :placeholder="$t('placeholder.input')"></el-input>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button 
            size="medium" 
            plain="" 
            @click="addressBookVisible=false"
          >{{$t('btns.cancel')}}</el-button>
          <el-button 
            size="medium" 
            type="primary" 
            @click="doNewGroup"
          >{{$t('msg.confirm')}}</el-button>
        </span>
      </comm-dialog>
    </div>

    <!--通讯录添加新的数据到分组-->
    <div class="address-book-dialog">
      <comm-dialog
        width="28%"
        :title="addUserTogroup"
        v-if="AgencyDialogVisible"
        :visible.sync="AgencyDialogVisible"
      >
        <div slot="body" class="body-box">
          <span>
            {{$t('profile.add')}}:
          </span>
          <div class="input">
            <el-select v-model="groupValue" :placeholder="$t('placeholder.select')">
              <el-option
                v-for="(item,index) in groupList"
                :key="index"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button 
            size="medium" 
            plain="" 
            @click="AgencyDialogVisible=false"
          >{{$t('btns.cancel')}}</el-button>
          <el-button 
            size="medium" 
            type="primary" 
            @click="addToGroup"
          >{{$t('msg.confirm')}}</el-button>
        </span>
      </comm-dialog>
    </div>

  </div>
</template>
<script>
import form_selectApprover_flowpanel from "@/components/form_selectApprover_flowpanel.vue";
import API from "@/api.js";

export default {
  name: "profile",
  props: ["appid"],
  components: {
    form_selectApprover_flowpanel,
  },
  computed: {
    baseInfoma() {
      return this.$store.state.myProfile;

    }
  },
  data() {
    return {
      currentPage: 1,
      labelPosition:'right',
      startDay: '',
      endDay: '',
      description:'',
      flowName:'',
      selectFlowId:'',
      authorizedUser:'',
      authorizedUserId:'',
      flowData: [],
      checkedFlowId:[],

      information: '',
      tabPosition: "left",
      oldPassword: "",  //
      newPassword: "",
      affirmPassword: "",

      userVisible:false, //用户选择框弹窗
      isProxys:true,
      owner:'',
      proxyMode:'0',
      row_count: 0, //代理设置分页总数
      flowId: '',
      addressBookVisible:false, //通讯录弹窗
      newGroupName:'',
      groupId:'',
      groupList:[], //通讯录分组列表
      selectGroup:[], //选中的通讯录数据
      groupValue:'',
      nohark: "", //通讯录查询关键字
      isOneGroup:false,
      currentGroupId: '',
      agency: "",
      radio: "1",
      pageSize: 10,
      pageNum: 1,
      centerDialogVisible: false,
      innerVisible: false,
      AgencyDialogVisible: false,
      value: "",
      tableData: [],
      tableDataNum: 0,
      multipleSelection: [],
      process: [],
      currentRow: [],
      selectedIDs: [],
      appId: "", //获取到的软件id
      saveApproverStatus:'',
      state:'1',
      currentRowId:'',
      currentGroupName:'',
      addUserTogroup:'',
      allSoftware: [],
      selectSoftwareId:'',
      currentAppid:'',
      searchFlowValue:'',
      isShowError: false,   //是否出现邮箱或者手机验证消息
    };
  },
  created() {
    this.baseInfo()
    this.ContentBox();
    this.proxys();
    this.contactsGroup();
    //获取软件列表
    API.GetsoFtwareList({
      onSucess: response => {
        let newData = [];
        response.data.data.applications.forEach(app => {
          if (app.id != "km" && app.id != "pm" && app.id != "qm") {
            newData.push(app);
          }
        });
        this.allSoftware = newData;
        this.selectSoftwareId = this.$root.appid;
      }
    });
  },
  methods: {
    handleIconSearch(value) {
      let appId = this.$root.appid;
      this.$api.getSearchProxysFlows(
        appId,
        value,
        {
          onSucess: res=> {
            let flowData = res.data.data;
            let arr = [];
            for(let key in flowData) {
              let obj = {};
              if(key) {
                obj.id = key;
                obj.name = flowData[key];
                arr.push(obj);
              }
            }
            this.flowData = arr;
          }
        }
      )
    },
    onChange(e){
      this.currentAppid = e;
      this.proxys();
    },
    showInnerDialog() {
      let appId = this.currentAppid?this.currentAppid:this.$root.appid;
      this.$api.getProxysFlow(
        appId,
        {
          onSucess: res => {
            let flowData = res.data.data;
            let arr = [];
            for(let key in flowData) {
              let obj = {};
              if(key) {
                obj.id = key;
                obj.name = flowData[key];
                arr.push(obj);
              }
            }

            console.log("arr---->",arr);
            this.flowData = arr;
            let selectList = JSON.parse(JSON.stringify(this.checkedFlowId));
            this.$nextTick(()=>{
              for(let i=0;i<arr.length;i++){
                if(this.flowId && this.flowId == arr[i].id){
                  this.$refs.flowTable.toggleRowSelection(arr[i])
                }else if(this.checkedFlowId.length>0){
                  for(let y=0;y<selectList.length;y++){
                    if(selectList[y].id == arr[i].id){
                      this.$refs.flowTable.toggleRowSelection(arr[i])
                    }
                  }
                }
              }
            })
          }
        }
      )
      this.innerVisible = true
    },
    changeHandler() {
      this.state = '1';
    },
    //移出分组
    moveOutOfGroup() {
      if(this.selectGroup.length < 1) {
        this.$message({
          message:this.$t('msg.select_atLeastOne'),
          type:'warning'
        })
      }else {
        this.$confirm(this.$t('msg.comfirm')+`${this.selectGroup.length}`+this.$t('msg.move_group'), this.$t('msg.move'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          let arr = [];
          for(let i=0; i<this.selectGroup.length; i++) {
            arr.push(this.selectGroup[i].id);
          }
          this.$api.deleteGroupUserList(
            this.currentGroupId,
            arr,
            {
              onSucess: res => {
                if(res.data.errcode == 0) {
                  // this.selectGroup.forEach((item,index) => {

                  //   for(let i=0; i<this.tableData.length; i++) {
                  //     if(item.id == this.tableData[i].id) {
                  //       this.tableData.splice(i, 1);
                  //       i--;
                  //     }
                  //   }
                  // });
                  this.selectGroup = [];
                  this.$api.getAddressBook(
                    {
                      contactsId: this.currentGroupId,
                      userName:this.nohark,
                      pageSize: 10,
                      pageNum: 1,
                    },
                    { 
                      onSucess: response => {
                        this.tableDataNum = response.data.data.rowCount;
                        let newData = response.data.data.datas.map(item => {
                          return {
                            name: item.name,
                            dept: item.dept,
                            mobile: item.mobile,
                            email: item.email,
                            id: item.id,
                            deptId: item.deptId,
                          };
                        });
                        this.tableData = newData;
                      }
                    }
                  )



                  this.$notify({
                    title: this.$t('msg.es'),
                    message: '',
                    type: 'success'
                  });
                }
              }
            }
          )
        }).catch(() => {

        });
      }

      
    },

    //点击分组展示分组数据
    toPacketData(item) {
      this.selectGroup = [];
      this.isOneGroup = true;
      this.currentGroupId = item.id;
      this.$api.getContact(
        item.id,
        {
          onSucess: res => {
            this.tableData = res.data.data.datas;
            this.tableDataNum = res.data.data.rowCount;
            this.pageNum = 1;
          }
        }
      )
    },
    //通讯录添加新数据到分组
    addToGroup() {
      let arr = [];
      this.selectGroup.forEach(item => {
        arr.push(item.id);
      })
      let id = this.groupValue;
      if(id) {
        this.$api.addDataToGroup(
          id,
          arr,
          {
            onSucess: res => {
              this.AgencyDialogVisible = false;
              this.selectGroup = [];
              this.$refs.multipleTable.clearSelection();
              this.groupValue = '';
              if(res.data.errcode == 0) {
                this.$notify({
                  title: this.$t('msg.op_ss'),
                  message: '',
                  type: 'success'
                });
              }
            }
          }
        )
      }else {
        this.$message({
          message: this.$t('msg.select_move_group'),
          type: 'warning'
        })
      }
      
    },
    //通讯录删除分组
    deleteGroup(item, index) {
      this.$confirm(this.$t('msg.del_group'), this.$t('delete'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        let id = item.id;
        this.$api.deleteGroup(
          id,
          {
            onSucess: res => {
              if(res.data.errcode == 0) {
                this.groupList.splice(index, 1);
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'success'
                });
              }
            }
          }
        )
      }).catch(() => {
                  
      });
    },

    //通讯录新建分组保存
    doNewGroup() {
      if(this.groupId) {
        if(!this.newGroupName) {
          this.$message({
            message: this.$t('placeholder.group_name'),
            type: 'warning'
          });
        }else { 
          this.$api.editContactGroup(
            this.groupId,
            this.newGroupName,
            {
              onSucess: res => {
                let data = res.data.data
                for(let i=0; i<this.groupList.length; i++) {
                  if(this.groupList[i].id == data.id) {
                    this.groupList[i] = data;
                    break;
                  }
                }
                this.addressBookVisible = false;
              }
            }
          )
        }
        
      }else {
        if(!this.newGroupName) {
          this.$message({
            message: this.$t('placeholder.group_name'),
            type: 'warning'
          });
        }else {
          let name = this.newGroupName;
          this.$api.saveContactGroup(
            name,
            {
              onSucess: res => {
                let data = res.data.data;
                this.groupList.push(data);
                this.addressBookVisible = false;
              }
            }
          )
        }
      }
      
    },
    //通讯录新建分组
    setNewGroup(item) {
      if(item) {
        this.currentGroupName = this.$t('profile.edit_group')
        this.newGroupName = item.name
        this.groupId = item.id;
      }else {
        this.currentGroupName = this.$t('profile.new_group')
        this.newGroupName = ''
        this.groupId = '';
      }
      this.addressBookVisible = true;
    },

    //代理设置编辑流程
    fountain(row, index) {
        let id = row.id;
        this.currentRowId = id;
        let appId = this.currentAppid?this.currentAppid:this.$root.appid;
        this.$api.editProxysFlow(
          appId,
          id,
          {
            onSucess: res => {
              if(res.data.data) {
                let data = res.data.data;
                this.authorizedUser = data.agentsName;
                this.description = data.description;
                this.startDay = data.startProxyTime;
                this.endDay = data.endProxyTime;
                this.flowName = data.flowName;
                this.owner = data.owner;
                this.state = data.state;
                this.proxyMode = data.proxyMode.toString();
                this.flowId = data.flowId;
              }
              this.centerDialogVisible = true;
            }
          }
        )
    },
    //代理窗口关闭回调
    proxyClose(done){
      done();
      this.checkedFlowId = [];
    },

    //代理设置删除流程
    deleteFlow(row, index) {
      this.$confirm(this.$t('msg.del_data'), this.$t('delete'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        let appId = this.currentAppid?this.currentAppid:this.$root.appid;
        let id = row.id;
        let arrIds = [];
        arrIds.push(id);
        this.$api.deleteProxysFlow(
          appId,
          arrIds,
          {
            onSucess: res => {
              if(res.data.errcode == 0) {
                this.process.splice(index, 1);
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'success'
                });
              }
            }
          }
        )
      }).catch(() => {
                  
      });
    },

    // 删除代理
    DELETEusersetups() {
      if (this.selectedIDs == "") {
        this.$message({
          message: this.$t('msg.least_one'),
          type: 'warning'
        })
      } else {
        this.$confirm(this.$t('msg.confirm_to_del')+`${this.selectedIDs.length}`+this.$t('msg.t_data'), this.$t('delete'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          let appId = this.currentAppid?this.currentAppid:this.$root.appid;
          let arrIds = this.selectedIDs;
          this.$api.deleteProxysFlow(
            appId,
            arrIds,
            {
              onSucess: res => {
                if(res.data.errcode == 0) {
                  this.$notify({
                    title: this.$t('msg.es'),
                    message: '',
                    type: 'success'
                  });
                  this.proxys();
                }
              }
            }
          )


        }).catch(() => {
                    
        });



        
      }
    },

    //代理设置查询流程
    searchFlow() {
      let appId = this.currentAppid?this.currentAppid:this.$root.appid;
      let jsonData = {
            flowName: this.agency,
            linesPerPage: 10,
            pageNo: 1,
          };
      this.$api.getproxys(
        appId,
        jsonData,
        {
          onSucess: res => {
            let newData = res.data.data.datas.map(item => {
              return {
                id: item.id,
                flowName: item.flowName,
                proxyMode: item.proxyMode,
                description: item.description,
                agentsName: item.agentsName,
                state: item.state
              };
            });
            this.process = newData;
            console.log("this.process--->",this.process);
          }
        }
      )


    },

    //代理设置选择授权用户
    selectApprover(name, id, selectedUsersList) {
      this.userVisible = false;
      this.authorizedUser = name;
      this.authorizedUserId = id;
      let obj = {};
      obj.row = selectedUsersList;
      this.saveApproverStatus = obj;
    },

    //展示用户选择框
    showUserDialg() {
      this.userVisible = true;
    },

    //选择流程弹窗按确定后的数据
    getFlowName() {
      this.flowName = '';
      this.selectFlowId = '';
      if(this.checkedFlowId && this.checkedFlowId.length > 0) {
        this.checkedFlowId.forEach(item => {
          this.flowName += item.name + ';';
          this.selectFlowId += item.id + ';';
        })
        this.innerVisible = false;
      }else {
        this.flowName = '';
        this.selectFlowId = '';
      }
    },
    
    //流程选择中的数据
    handleSelectionChange(val) {
      this.checkedFlowId = val;
    },

    //通讯录选择中的数据
    handleGrounpChange(val) {
      this.selectGroup = val;
    },

    //打开代理弹窗并获取流程数据
    construction() {
      this.proxyMode = '0';
      this.state = '1';
      this.currentRowId = '';
      this.saveApproverStatus = '';
      this.authorizedUser = '';
      this.description = '';
      this.endDay = '';
      this.startDay = '';
      this.selectFlowId = '';
      this.flowName = '';
      this.centerDialogVisible = true;
      this.innerVisible = false;
      let appId = this.currentAppid?this.currentAppid:this.$root.appid;
      this.$api.getProxysFlow(
        appId,
        {
          onSucess: res => {
            let flowData = res.data.data;
            let arr = [];
            for(let key in flowData) {
              let obj = {};
              if(key) {
                obj.id = key;
                obj.name = flowData[key];
                arr.push(obj);
              }
            }
            console.log("arr---->",arr);
            this.flowData = arr;
          }
        }
      )
    },


    // 保存代理信息
    centerDialog() {
      if (!this.authorizedUser) {
        this.$message({
          message: this.$t('view.select_authorizer'),
          type: 'warning'
        });
      } else if (!this.startDay) {
        this.$message({
          message: this.$t('view.select_start_date'),
          type: 'warning'
        });
      } else if (!this.endDay) {
        this.$message({
          message: this.$t('view.select_end_date'),
          type: 'warning'
        });
      } else {
        let startTime = new Date(this.startDay);
        startTime = startTime.getTime();
        let endTime = new Date(this.endDay);
        endTime = endTime.getTime();

        if(startTime > endTime) {
          this.$message({
            message: this.$t('view.end_than_start'),
            type: 'warning'
          });
        }else {
          let appId = this.currentAppid?this.currentAppid:this.$root.appid;
          let id = this.currentRowId?this.currentRowId:'';
          let data = {
            agents: this.authorizedUserId,
            agentsName: this.authorizedUser,
            description: this.description,
            endProxyTime: endTime,
            flowId: this.proxyMode=='0'?this.selectFlowId:'',
            flowName: this.proxyMode=='0'?this.flowName:this.$t('view.total_flow'),
            owner: this.$store.state.userId,
            proxyMode: parseInt(this.proxyMode),
            startProxyTime: startTime,
            state: this.state,
          };
          this.$api.saveProxys(
            appId,
            data,
            id,
            {
              onSucess: res => {
                if(res.data.errcode == 40014) {
                  this.centerDialogVisible = false;
                  this.$notify.error({
                    title: this.$t('msg.err'),
                    message: res.data.errmsg
                  });
                  
                }else {
                  this.centerDialogVisible = false;
                  this.$notify({
                    title: this.$t('msg.ss'),
                    message: '',
                    type: 'success'
                  });
                  this.proxys();
                }
              }
            }
          )
        }
        
      }
    },
    //校验邮箱
    checkedEmail(){
      // var emailReg=/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      // if(!emailReg.test(this.information.email) && this.information.email!=="" && this.information.email!==null){
      //   this.$notify({
      //     title: this.$t('view.noagree_email'),
      //     message: '',
      //     type: 'warning'
      //   });
      //   this.isShowError = true;
      //   return
      // }
    },
    //校验手机
    checkedMobile(){
      var phoneReg =/^1\d{10}$/;
      console.log(!phoneReg.test(this.information.mobile)&& !this.information.mobile)
      console.log(this.information.mobile)
      if(!phoneReg.test(this.information.mobile) && this.information.mobile!=="" && this.information.mobile!==null){
        this.$notify({
          title: this.$t('view.noagree_tel'),
          message: '',
          type: 'warning'
        });
        this.isShowError = true;
        return
      }
    },

    // 个人基本信息保存的请求
    UserSetups() {
      let Base64 = require('js-base64').Base64;
      this.isShowError = false;
      this.checkedEmail();
      this.checkedMobile();
      if(!this.isShowError){
        if(this.oldPassword) {
          if(!this.newPassword) {
            this.$notify({
              title: this.$t('view.new_pwd_notnull'),
              message: '',
              type: 'warning'
            });
          }else {
            if(!this.affirmPassword) {
              this.$notify({
                title: this.$t('view.old_new_same'),
                message: '',
                type: 'warning'
              });
            }else if(this.newPassword !== this.affirmPassword) {
              this.$notify({
                title: this.$t('view.old_new_same'),
                message: '',
                type: 'warning'
              });
            }else if (this.newPassword == this.affirmPassword) {
              let ap = this.affirmPassword
              let np = this.newPassword
              let op = this.oldPassword
              ap = Base64.encode(this.affirmPassword)
              np = Base64.encode(this.newPassword)
              op = Base64.encode(this.oldPassword)
              let ap1 = ap.substr(0,2)
              let ap2 = ap.substr(2)
  
              let np1 = np.substr(0,2)
              let np2 = np.substr(2)
  
              let op1 = op.substr(0,2)
              let op2 = op.substr(2)
  
              ap = ap2 + ap1
              np = np2 + np1
              op = op2 + op1
  
  
              let data = {
                confirmPassword: ap,
                newpassword: np,
                oldPassword: op,
              }
              this.$api.updatePassword(
                data,
                {
                  onSucess: res => {
                    if(res.data.errcode == 0) {
                      this.$notify({
                        title: this.$t('view.update_ss'),
                        message: '',
                        type: 'success'
                      });
                    }else {
                      this.$notify({
                        title: res.data.errmsg,
                        message: '',
                        type: 'error'
                      });
                    }
                  }
                }
              )
            }
          }
        }else if(!this.oldPassword && this.affirmPassword) {
          this.$notify({
            title: this.$t('view.old_pwd_notnull'),
            message: '',
            type: 'warning'
          });
        }else if(this.newPassword) {
          if(!this.oldPassword) {
            this.$notify({
              title: this.$t('view.old_pwd_notnull'),
              message: '',
              type: 'warning'
            });
          }
        }
        this.$api.PersonalInformationSettings(
          {
            name: this.information.name,
            email: this.information.email,
            telephone: this.information.mobile
          },
          {
            onSucess: response => {
              if(!this.oldPassword && !this.newPassword && !this.affirmPassword) {
                if (response.status == 200) {
                  this.$notify({
                    title: this.$t('msg.ss'),
                    message: '',
                    type: 'success'
                  });
                }
              }
            },
            onError: error => {
              console.log(error);
            }
          }
        );
      }
    },


    baseInfo() {
      this.information = this.$store.state.myProfile;
    },
   
    
    setCurrent(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.Current.toggleRowSelection(row);
        });
      } else {
        this.$refs.Current.clearSelection();
      }
    },

    handleCurrentChange(val) {
      this.currentRow = val;
      let ids = [];
      this.currentRow.map(item => {
        ids.push(item.id);
      });
      this.selectedIDs = ids;
    },

    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    //新建代理信息的弹框
    innerAgencyVisible() {
      this.innerVisible = false;
      this.centerDialogVisible = false;
    },

    //通讯录{{$t('profile.add')}}
    contentNowrap() {
      this.addUserTogroup =this.$t('view.add_to_group');
      if (this.selectGroup.length == 0) {
        this.$message({
          message: this.$t('profile.select_one_user'),
          type: 'warning'
        })
      } else {
        this.$api.getContactGroup(
          {
            onSucess: res => {
              this.groupList = res.data.data.datas;
            }
          }
        )
        this.AgencyDialogVisible = true;
      }
    },
    replacement() {
      this.agency = "";
    },
    reset() {
      this.nohark = '';
    },

    // 通讯录查询用户
    inquire() {
      this.pageNum = 1;
      let params = {
        contactsId: this.currentGroupId?this.currentGroupId:'',
        userName:this.nohark,
        pageSize:10,
        pageNum:1,
      };
      this.$api.getSearchContact(
        params,
        {
          onSucess: res => {
            let newData = res.data.data.datas.map(item => {
              return {
                name: item.name,
                dept: item.dept,
                mobile: item.mobile,
                email: item.email,
                id: item.id,
                deptId: item.deptId,
              };
            });
            this.tableData = newData;
            this.tableDataNum = res.data.data.rowCount;
          }
        }

      )
    },
  
    // 获取代理列表
    proxys() {
      let appId = this.currentAppid?this.currentAppid:this.$root.appid;
      let jsonData = {
            flowName: '',
            linesPerPage: 10,
            pageNo: 1,
          };
      this.$api.getproxys(
        appId,
        jsonData,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                id: item.id,
                flowName: item.flowName,
                proxyMode: item.proxyMode,
                description: item.description,
                agentsName: item.agentsName,
                state: item.state
              };
            });
            this.process = newData;
            console.log("this.process--->",this.process);
          }
        }
      )
    },

    // 获取通讯录分组
    contactsGroup() {
      this.$api.getContactGroup(
        {
          onSucess: res => {
            this.groupList = res.data.data.datas;
          }
        }
      )
    },


    //获取代理设置分页数据的请求
    handlAgentpaging(ev) {
      let appId = this.currentAppid?this.currentAppid:this.$root.appid;
      let jsonData = {
            flowName: this.agency,
            linesPerPage: 10,
            pageNo: ev,
        }
      this.$api.getproxys(
        appId,
        jsonData,
        {
          onSucess: res => {
            this.row_count = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                id: item.id,
                flowName: item.flowName,
                proxyMode: item.proxyMode,
                description: item.description,
                agentsName: item.agentsName,
                state: item.state
              };
            });
            this.process = newData;
            console.log("this.process--->",this.process);
          }
        }
      )
    },
    //通讯录分页请求
    Addressbookpaging(num) {
      if(this.currentGroupId) {
        this.$api.getAddressBook(
          {
            contactsId: this.currentGroupId,
            userName:this.nohark,
            pageSize: 10,
            pageNum: num,
          },
          {
            onSucess: res => {
              this.tableDataNum = res.data.data.rowCount;
              let newData = res.data.data.datas.map(item => {
                return {
                  name: item.name,
                  dept: item.dept,
                  mobile: item.mobile,
                  email: item.email,
                  id: item.id,
                  deptId: item.deptId,
                };
              });
              this.tableData = newData;
            }
          }
        )

      }else {
        this.$api.getAddressBook(
          {
            contactsId: "",
            userName:this.nohark,
            pageSize: 10,
            pageNum: num,
          },
          {
            onSucess: res => {
              this.tableDataNum = res.data.data.rowCount;
              let newData = res.data.data.datas.map(item => {
                return {
                  name: item.name,
                  dept: item.dept,
                  mobile: item.mobile,
                  email: item.email,
                  id: item.id,
                  deptId: item.deptId,
                };
              });
              this.tableData = newData;
            }
          }
        )
      }
    },
    // 请求通讯录里面要渲染的数据
    ContentBox() {
      this.isOneGroup = false;
      this.currentGroupId = '';
      this.nohark = '';
      this.$api.getAddressBook(
        {
          contactsId: "",
          pageSize: 10,
          pageNum: 1,
        },
        {
          onSucess: res => {
            this.tableDataNum = res.data.data.rowCount;
            let newData = res.data.data.datas.map(item => {
              return {
                name: item.name,
                dept: item.dept,
                mobile: item.mobile,
                email: item.email,
                id: item.id,
                deptId: item.deptId,
              };
            });
            this.tableData = newData;
          }
        }
      )
      
    },
    // 这是皮肤样式的请求
    Userskin() {
      API.SkinSetting(
        {
          skin: "H5"
        },
        {
          onSucess: response => {
            if (response.status == 200) {
              alert(this,$t('profile.h_ss'));
              window.location = "http://localhost:8080/obpm/portal/H5/main.jsp";
            }
          },
          onError: error => {
            console.log(error);
          }
        }
      );
    },


   
  }
};
</script>



