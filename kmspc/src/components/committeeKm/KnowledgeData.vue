<template>
  <div class="knowledgeData">
    <div class="KnowledgeMap">
      <div class="handle">
        <el-button type="primary" size="mini" class="newMapButton" @click="handleCreateKnowMap" v-if="isNewShow">{{$t('new_map')}}</el-button>
        <el-button type="danger" v-show="isShow" size="mini" @click="deleteLabel" class="deleteMapButton">{{$t('btns.delete')}}</el-button>
        <span class="subscriptionBatch">
          <label>{{$t('knowledge_subscription')}}</label>
          <el-switch
            v-model="switchValue"
            active-color="#108ee9"
            inactive-color="#C0C4CC"
            @change="switchChange($event)"
            class="subSwitch">
          </el-switch>
        </span>
        <div class="searchInput">
          <el-input
            :placeholder="$t('File')"
            v-model="inputSearch">
              <el-button slot="append" icon="el-icon-search" @click="searchFormTable"></el-button>
          </el-input>
        </div>
      </div>
      <div class="ant-table-wrapper">
        <div>
          <el-table
            ref="multipleTable"
            :data="dataList.datas"
            tooltip-effect="dark"
            :height="clientHeight"
            @select-all="handleSelectAll"
            @select="handleCheckedClick"
            style="width: 100%">
            <el-table-column
              type="selection"
              width="55"
              >
            </el-table-column>
            <el-table-column
             :label="$t('tabs.definition')"
              min-width="70%">
              <template slot-scope="scope">
                <a size="mini" @click="clickKnowledge(scope.row)">{{scope.row.title}}</a>
              </template>
            </el-table-column>
            <el-table-column
              prop="creator"
                   :label="$t('tabs.creator')"
              width="200">
            </el-table-column>
            <el-table-column
              prop="lastModifyDate"
           :label="$t('tabs.release_time')"
              width="150">
            </el-table-column>
            <el-table-column  :label="$t('tabs.operation')" width="120" v-if="isNewShow">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleMaintain(scope.$index, scope.row)">{{$t('btns.maintenance')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div :style="{width: '100%', textRight: 'right'}">
          <el-pagination
            right
            background
            layout="prev, pager, next"
            class="pagination"
            @current-change="handleCurrentChange"
            :page-size="dataList.linesPerPage"
            :current-page.sync="dataList.pageNo"
            :total="dataList.rowCount">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js";
export default {
  name: "knowledgeData",
  props:[
    "realmsList",
    "tableDataList",
    "tabObj",
    "isChange"
  ],
  data() {
    return {
      clientHeight: '',
      user: {},
      switchValue: false,
      inputSearch: '',      //搜索条件
      dataList: [],
      param: {
        id: '',
        title: '',
        pageNo: 1,
        linesPerPage: 15,
      },
      isShow: false,
      tableRow: {},
      isNewShow: false,      //是否显示新建知识地图
    }
  },
  created (){
    const windowHeight = document.documentElement.clientHeight;
    const cardHead = this.$parent.$refs.cardHead.offsetHeight;
    // 16card外边距 30新建知识地图外边距 40是边距 20按钮的高度 48表格头的高度 32底部按钮 33底部授权信息
    let tableHeight = windowHeight - cardHead - 16 - 30 - 40 - 20 - 48 - 32 - 33;
    if(this.$store.state.isShowHeard){
      tableHeight = tableHeight - 50;
    }
    this.clientHeight = tableHeight;
    //当是企业知识管理员角色才会出现新建知识地图按钮
    if(this.$store && this.$store.state.user && this.$store.state.user.level == 100){
      this.isNewShow = true;  //显示新建知识地图按钮
    }else{   //当状态管理没有时，应该去调用户信息
      API.getMyProfile({
        onSucess: resp => {
          if(resp.data.data.level == 100){
            this.isNewShow = true;  //显示新建知识地图按钮
          }
        } 
      })
    }
  },
  mounted() {
    this.tableList();
  },
  methods:{
    /**
     * 获取表单数据
     */
    tableList(currentPage){
      if(currentPage){
        this.params.pageNo = currentPage.pageNo;
      }
      this.param.id = this.realmsList.id;
      API.getKnowledgeTableList(this.param,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.dataList = data.data;
          }
        } 
      });
      /**
       * 知识订阅是否已经订阅
       */
      API.getIsKnowledgeSubscriptions(this.param,{
        onSucess: resp => {
          let data = resp.data;
          if(data.errcode == 0){
            if(data.data.isSubscription){
              this.switchValue = true;
            }
          }
        } 
      });
    },
    /**
     * 点击全选按钮
     */
    handleSelectAll(row){
      this.handleCheckedClick(row);
    },
    /**
     * 点击选中
     */
    handleCheckedClick(selection,row) {
      if(selection.length>0){
        this.isShow = true;
        this.tableRow = selection
      }else{
        this.isShow = false;
      }
    },
    /**
     * 删除
     */
    deleteLabel() {
      //this.$emit('deleteLabel');
      const checkedRow = this.tableRow;
      if(checkedRow) {
        this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
        }).then(() => {
          let dataJson = [];
          for(let i=0;i<checkedRow.length;i++){
            dataJson.push(checkedRow[i].id);
          }
          API.deleteKnowledge(dataJson,{
            onSucess: resp => {
              if(resp.data.errcode == 0){
                this.tableList();
                this.$message({
                  type: 'success',
                  message: this.$t('msg.es')
                });
              }
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('msg.cancel_del')
          });
        });
      }
    },
    /**
     * 操作按钮维护
     */
    handleMaintain(index,row) {
      this.param.id = row.id
      API.knowledgeMaintain(this.param,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.tableList();
            this.$message({
              type: 'success',
              message: this.$t('msg.maintenance_ss')
            });
          }
        }
      })
    },
    /**
     * 选择器改变
     */
    switchChange(row) {
      if(row){
        let dataJson = {}
        if(this.tabObj.$attrs){
          dataJson.contentId = this.tabObj.$attrs.id;
        }else{
          dataJson.contentId = this.realmsList.id;
        }
        dataJson.contentType = 2
        dataJson.contentName = this.realmsList.name
        API.knowledgeSubscriptions(dataJson,{
          onSucess: resp => {
            let data = resp.data;
            if(data.errcode == 0){
              this.$message({
                message: this.$t('msg.subscription_ss'),
                type: 'success'
              });
            }
          } 
        });
      }else{
        let dataJson = [this.realmsList.id]
        API.deleteKnowledgeSubscriptions(dataJson,{
          onSucess: resp => {
            let data = resp.data;
            if(data.errcode == 0){
              this.$message(this.$t('msg.unsubscribe'));
            }
          } 
        });
      }
    },
    /**
     * 查询功能
     */
    searchFormTable() {
      this.param.title = this.inputSearch;
      this.param.id = this.realmsList.id;
      API.getKnowledgeTableList(this.param,{
        onSucess: resp => {
          let data = resp.data;
          if(data && data.data){
            this.dataList = data.data;
          }
        } 
      });
    },
    /**
     * 新建知识地图
     */
    handleCreateKnowMap() {
      let realmId;
      if(this.tabObj.$attrs){
        realmId = this.tabObj.$attrs.id;
      }else{
        realmId = this.realmsList.id;
      }
      let param = {
        realmId: realmId,

      }
      this.$router.push({
        path: '/newKnowledgeMap',
        query: {param}
      })
    },
    /**
     * 点击名称进入预览界面
     */
    clickKnowledge(row){
      let param = {
        id: row.id
      }
      this.$router.push({
        path: "/knowledgePreview",
        query: {param}
      })
    },
    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let currentPage = {
        pageNo: val,
        linesPerPage: this.params.linesPerPage
      }
      this.tableList(currentPage);
    },
  },
  watch: {
    tableDataList(val) {
      //当标签切换时，把删除按钮隐藏
      this.isShow = false;
      this.dataList = val;
      this.inputSearch = "";
    },
    tabObj(tabObj) {
      this.param.id = tabObj.$attrs.id;
      this.switchValue = false;
      API.getIsKnowledgeSubscriptions(this.param,{
        onSucess: resp => {
          let data = resp.data;
          if(data.errcode == 0){
            if(data.data.isSubscription){
              this.switchValue = true;
            }
          }
        } 
      });
    },
    /**
     * 判断是否切换标签页
     */
    isChange(val){
      //切换了标签页，搜索条件应该清空
      this.inputSearch = "";
    }
  }
}
</script>