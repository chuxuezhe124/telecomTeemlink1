<template>
  <div class="dept-tree-wraper">
    <!--视图选择框-->
    <div class="is-view" v-if="isView">
      <div :class="[(mutil || selectOne)?'view-tree':'view-tree-wrap']" @onSearch="onSearch">
        <div class="search-input">
          <div class="input-box">
            <el-input
              @keyup.enter.native="handleIconSearch(searchValue)"
              size="small"
              :placeholder="$t('placeholder.search')"
              v-model="searchValue">
              <i slot="suffix" class="el-input__icon el-icon-search" @click.stop.prevent="handleIconSearch(searchValue)"></i>
            </el-input>
          </div>
        </div>
        <div class="empty-page" v-if="isSearchOperation" >
            <i class="fa fa-inbox fa-5x" style="color:#e6e6e6;margin:100px 0 0"></i>
            <div>
              {{$t('nodata')}}
            </div>
        </div>
        <el-tree 
          v-else
          :props="defaultProps"
          :empty-text="loading"
          :load="loadNode" 
          node-key="key" 
          ref="viewTree" 
          lazy 
          :show-checkbox="mutil || selectOne"
          :expand-on-click-node="false"
          :check-strictly="true"
          @node-click="getTemplete"
          @check-change="checkedNodes"
          :filter-node-method="filterNode"
        >
        </el-tree>
      </div>
      <div class="multiple" v-if="mutil || selectOne">
        <div class="header">
          <span class="text">
            <span>{{$t('choosed')}}</span>
            <span>{{tags.length}}</span>
          </span>
          <span @click="reset">{{$t('reset')}}</span>
        </div>
        <div class="content" >
          <el-tag
            class="tag"
            v-for="tag in tags"
            :key="tag.name"
            closable
            @close="handleClose(tag)"
          >
            {{tag.name}}
          </el-tag>
        </div>
      </div>
    </div>

    <!--非视图选择框-->
    <div class="no-view" v-else>
      <div class="treepanel">
        <div class="btns">
          <span class="btn-icon" v-for="(item, index) in menus" :key="index" :title="item.name">
            <i :class="item.setClass" @click="onClickBtn(item)"></i>
          </span>
          <span class="btn-icon btn-right" v-if="view.searchFormId != undefined">
            <i class="btn-icon el-icon-search" @click="showSearchPanel = true"></i>
          </span>
          <span class="btn-icon btn-right">
            <i class="fa fa-refresh" @click="onloadTree"></i>
          </span>
        </div>
        <div class="tree" @contextmenu.prevent="emptyRightClick">
          <el-tree 
            v-if="isTreeRouterAlive"
            :props="defaultProps"
            :empty-text="loading"
            :load="loadNode" 
            node-key="key" 
            ref="deptTree" 
            lazy 
            show-checkbox
            :expand-on-click-node="false"
            :check-strictly="true"
            @node-click="getTemplete"
            @node-contextmenu="rightClick"
            :filter-node-method="filterNode"
          >
            <span slot-scope="{node,data}">
              <span :title="data.label" style="font-size:14px;">{{data.label}}</span>
            </span>
          </el-tree>
          <div 
            id="perTreeMenu" 
            v-if="menuVisible" 
            class="tree_menu" 
            :style="{...rightMenu}"
          >
            <ul>
              <li v-for="(item, index) in view.activities" :key="index">
                <span @click.stop="handleBtn(item.type, item)">
                  <i class="el-icon-tickets" v-if="item.type == 2 && item.contextMenu"></i>
                  <span v-if="item.type == 2 && item.contextMenu"> {{$t('create')}}</span>
                </span>
                <span @click.stop="deleteTreeNode()">
                  <i class="el-icon-delete" v-if="item.type == 3 && item.contextMenu"></i>
                  <span v-if="item.type == 3 && item.contextMenu"> {{$t('delete')}}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="view-form">
        <iframe :src="linkUrl" id='editor' border=1 onselectstart='return false' class='myframe' v-if="linkUrl"></iframe>
        <div v-if="treeview" class="view-box">
          <div class="box-container" v-if="view.innerType == 'LINK'">
            <div style="height:100%;" v-if="linkVoJson && linkVoJson.type == '01'">
              <view_delegate 
                :openParams="openParam" 
                v-bind="$attrs"
                v-on="$listeners"
                />
            </div>
            <div style="height:100%;" v-else-if="linkVoJson && linkVoJson.type == '00'">
              <form_normalform
                :openParams="openParam"
                v-bind="$attrs"
                v-on="$listeners"
              />
            </div>
          </div>
          <div class="box-container" v-else-if="view.innerType == 'VIEW'">
            <view_listview
              :openParams="openParam" 
              :view="treeview"
              :parentId="parentId"
              v-if="isRouterAlive"
              v-bind="$attrs"
              v-on="$listeners"
              @getDocIds="setDocIds"
              ref="treeView"
            />
          </div>
          <div class="box-container" v-else-if="view.innerType == 'FORM'">
            <form_normalform
              :openParams="treeview"
              v-if="isFormRouter"
            />
          </div>
        </div>
      </div>
      <div class="view-search" v-if="showSearchPanel">
        <div class="search-wrap">
          <form_searchform
            :appId="openParams.appId"
            :viewId="openParams.actionContent"
            :isTreeView="true"
            @onSearch="onSearchTree"
            ref="searchform"
          /> 
        </div>
      </div>
    </div>
  </div>
</template>

<script> 
import view_listview from "@/components/view_listview.vue";
import form_normalform from "@/components/form_normalform.vue";
import form_searchform from "@/components/form_searchform.vue";
export default {
  name: "view_treeview",
  props: [
    "view",
    "isView",
    "mutil",
    "selectOne",
    "openParams",
    "isSearchForm"
    ],
  components: {
    view_listview,
    form_normalform,
    form_searchform
  },
  data: function() {
    return {
      defaultProps: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      arrNodes:[],
      treeViewData:[],
      isDisplay: false,
      treeview:'',
      openParam:'',
      parentId:'',
      isRouterAlive: true,
      isFormRouter:true,
      isTreeRouterAlive: true,
      tags: [], // 右侧选中的数组
      loading:this.$t('view.loading'),
      currentDocIds:[],
      hasChildren:'',
      menuVisible:false,
      currentRightNodeId:'', //当前右键选择中的节点
      filterText: '', // 输入框的内容
      searchValue: '',
      node_had: '',
      resolve_had:'',
      showSearchPanel: false, // 是否显示弹窗面板
      isSearchOperation:false,
      linkUrl: '',    //外部链接
      clickTreeDocId:'',
      linkVoJson:'',
    };
  },
  computed: {
    menus() {
      let list = this.view.activities;
      if(list) {
        list.forEach(item => {
          switch(item.type) {
            case 1:
              item.setClass = "glyphicon glyphicon-list";
              break;
            case 2:
              item.setClass = "glyphicon glyphicon-plus";
              break;
            case 3:
              item.setClass = "glyphicon glyphicon-trash";
              break;
            case 16:
              item.setClass = "glyphicon glyphicon-log-out";
              break;
            case 18:
              item.setClass = "glyphicon glyphicon-erase";
              break;
            case 20:
              item.setClass = "glyphicon glyphicon-send";
              break;
            case 26:
              item.setClass = "glyphicon glyphicon-save";
              break;
            case 27:
              item.setClass = "glyphicon glyphicon-log-in";
              break;
            case 29:
              item.setClass = "glyphicon glyphicon-globe";
              break;
            case 34:
              item.setClass = "glyphicon glyphicon-file";
              break;
            case 36:
              item.setClass = "glyphicon glyphicon-print";
              break;
            case 43:
              item.setClass = "glyphicon glyphicon-new-window";
              break;
            default:
              break;
          }
        });
      }
      return list;
    }
  },
  watch:{
    filterText(val) {
      if(this.$refs.deptTree){
        this.$refs.deptTree.filter(val);
        this.$nextTick(() => {
          if(document.getElementsByClassName('el-tree__empty-text')[0]){
            document.getElementsByClassName('el-tree__empty-text')[0].innerText = this.$t('nodata')
          }
        })
      }else{
        this.$refs.viewTree.filter(val);
        this.$nextTick(() => {
          if(document.getElementsByClassName('el-tree__empty-text')[0]){
            document.getElementsByClassName('el-tree__empty-text')[0].innerText = this.$t('nodata')
          }
        })
      }
    }
  },
  created() {
    //this.getTreeView();
  },
  mounted() {
    if(!this.isView) {
      let view = this.view;
      if(view.linkVoJson) {
        this.linkVoJson = JSON.parse(view.linkVoJson);
      }
      this.getTemplete()
    }
  },
  methods: {
    openDialogJump(params,type){
      this.$parent.openDialogJump(params,type)
    },

    setSearchDocItems(doc){ //view-listview调用了
      this.$parent.setSearchDocItems(doc);
    },

    onloadTree(){
      this.$emit("updateView");
    },

    onClickBtn(item) {
      if(item.type == 2 || item.type == 3) {
        this.handleBtn(item.type, item)
      }else {
        this.$parent.onAction(item)
      }
    },
    
    //右键删除树形节点
    deleteTreeNode(){
      this.$api.deleteTreeviewNode(
        this.openParams.appId,
        this.currentRightNodeId, 
        {
          onSucess: res => {
            if(res.data.errcode == 0) {
              this.$notify({
                title: this.$t('success'),
                message: '',
                type: 'success'
              });
              this.$emit("updateView");
            }
          }
        }
      )
    },
    
    //当树形视图完全为空的时候，右键显示
    emptyRightClick(e) {
      if(this.view.activities[0].contextMenu || this.view.activities[1].contextMenu) {
        this.rightMenu = {top:e.pageY + 8 +'px',left:e.pageX+'px'};
        this.menuVisible = true;
        const self = this;
        document.onclick=function(ev){
          if(ev.target!==document.getElementById('perTreeMenu')){
            self.menuVisible = false;
          }
        }
      }
    },

    rightClick(e,data,node,comp){
      if(this.view.activities[0].contextMenu || this.view.activities[1].contextMenu) {
        this.currentRightNodeId = data.key;
        this.rightMenu = {top:e.pageY + 8 +'px',left:e.pageX+'px'};
        this.menuVisible = true;
        const self = this;
        document.onclick=function(ev){
          if(ev.target!==document.getElementById('perTreeMenu')){
            self.menuVisible = false;
          }
        }
      }
    },

    setDocIds(val,hasChildren) {
      this.currentDocIds = val;
      this.hasChildren = hasChildren;
    },

    checkedNodes(node) {
      let res = this.$refs.viewTree.getCheckedNodes();
      let arr = [];
      if(res && res.length>0) {
        this.tags = [];
        let select='';
        for(let i=0; i<res.length; i++) {
          let obj = {};
          obj.name = res[i].label;
          obj.docId = res[i].key;
          this.tags.push(obj);
          select += res[i].rows.docId + ";";
          arr.push(res[i].rows);
        }
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: node.formId,
          _select:select,
          viewId: this.view.id,
        }
        this.$emit("updateViewData", params, arr);
      }else {
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: node.formId,
          _select:'',
          viewId: this.view.id,
        }
        this.$emit("updateViewData", params, arr);
      }
    },

    handleBtn(type, item) {
      switch(type) {
        case 2:
          // let params = {
          //   linkType: "00",
          //   appId: this.openParams.appId,
          //   active: true,
          //   name:'树形视图',
          //   actionContent: item.onActionForm,
          //   refreshId:this.openParams.id, 
          // };
          // this.$emit("add-tab", params)
          let extraParams = {
            treedocid: this.clickTreeDocId,
            document: {},
            innerType: this.view.innerType
          }
          this.$parent.runBeforeAction(item, [], extraParams);
          break;
        case 3:
          if(this.hasChildren) {
            this.$message({
              message: this.$t('view.del_child_node'),
              type: 'warning'
            });
          }else {
            let res = this.$refs.deptTree.getCheckedNodes();
            let arr = [];
            for(let i=0; i < res.length; i++) {
              arr.push(res[i].key);
            }
            arr = arr.concat(this.currentDocIds);
            this.$emit("deleted", item, arr);
          }
          break;
        default:
          break;
      }
    },

    getTemplete(node, resolve){
      let view = this.view;
      let openParams = this.openParams;
      if(node) {
        this.clickTreeDocId = node.key;
      }
      if(!this.isView) { //如果不是视图选择框
        if(this.view.innerType && this.view.innerType == 'VIEW') {
          let params = {
            linkType: "01",
            appId: this.openParams.appId,
            actionContent: this.view.id,
            parentId: node?node.key:'',
            viewId: "",
            id:this.openParams.id,
          };
          this.openParam = params;
          let appId = this.openParams.appId;
          let linkViewId = this.view.id;
          let  hasListview = true;
          if(!node) {
            this.$api.getTreeViewTemplate(  
              appId, 
              linkViewId, 
              hasListview,
              {
                onSucess: response => {
                  this.treeview = response.data.data;
                }
              }
            )
          }else {
            this.parentId = node.key;
            let params = {
              appId: this.openParams.appId,
              viewId: this.view.id,
              hasListview: true,
              hasTreeview: true,
              parentId: node.key,
              isTreeView: true,
              opentarget: "detail",
              treedocid: node.key,
            };
            this.$api.getViewTemplateP(appId, this.view.id, params, {
              onSucess: response => {
                if (response.data.data) {
                  //this.parentId = node.key;
                  this.treeview = response.data.data;
                  this.$refs.treeView.setTreeViewData(node.key);
                  //this.reload();
                }
              }
            });
          }
        }else if (this.view.innerType && this.view.innerType == 'FORM') {
          if(!node) {
            let params = {
              linkType: "00",
              appId: this.openParams.appId,
              actionContent: this.view.relatedForm,
              _select: "",
              viewId: "",
            };
            this.treeview = params;
          }else {
            let params = {
              linkType: "00",
              appId: this.openParams.appId,
              actionContent: this.view.relatedForm,
              _select: node.key,
              viewId: "",
            };
            this.treeview = params;
            let value = "FORM"
            this.reload(value)
          }
        }else if (this.view.innerType && this.view.innerType == 'LINK') {
          if(JSON.parse(this.view.linkVoJson).type == "06"){  //外部链接
            this.linkUrl = this.view.linkViewId;
          }else{
            let linkVoJson = JSON.parse(view.linkVoJson);
            let params = {};
            if(linkVoJson.type == "00") {
              params = {
                linkType: "00",
                appId: openParams.appId,
                actionContent: view.linkViewId,
                parentId: node?node.key:'',
                viewId: "",
                refreshId: openParams.id,
                isTreeViewLink: true,
                treedocid: this.clickTreeDocId,
              };
              this.openParam = params;
              let appId = openParams.appId;
              let linkViewId = view.id;
              let  hasListview = '';
              if(!node) {
                this.$api.getTreeViewTemplate(
                  appId, 
                  linkViewId, 
                  hasListview,
                  {
                    onSucess: response => {
                      this.treeview = response.data.data;
                    }
                  }
                )
              }else {
                this.$api.getViewTemplateP(appId, this.view.id, node.key, {
                  onSucess: response => {
                    if (response.data.data) {
                      this.treeview = response.data.data;
                      this.parentId = node.key;
                      // this.reload();
                    }
                  }
                });
              }
            }else if(linkVoJson.type == "01"){
              params = {
                linkType: "01",
                appId: openParams.appId,
                actionContent: view.linkViewId,
                parentId: node?node.key:'',
                viewId: "",
                refreshId: openParams.id,
                isTreeViewLink: true,
                treedocid: node?node.key:'',
              };
              this.openParam = params;
              let appId = openParams.appId;
              let linkViewId = view.linkViewId;
              let  hasListview = true;
              if(!node) {
                this.$api.getTreeViewTemplate(
                  appId, 
                  linkViewId, 
                  hasListview,
                  {
                    onSucess: response => {
                      this.treeview = response.data.data;
                    }
                  }
                )
              }else {
                this.$api.getViewTemplateP(appId, this.view.id, node.key, {
                  onSucess: response => {
                    if (response.data.data) {
                      this.treeview = response.data.data;
                      this.parentId = node.key;
                      this.reload();
                    }
                  }
                });
              }
            }
            
          }
        }
      }else {
        let arr = [];
        arr.push(node.rows);
        let isRadio = true
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: node.formId,
          _select:node.key,
          viewId: this.view.id,
        }
        this.$emit("updateViewData", params, arr, isRadio);
      }
    },
    
    getExcelParams() {
      if (this.searchExcelData) {
        return this.searchExcelData;
      } else {
        return "";
      }
    },

    reload (value) {
      if(value == "FORM") {
        this.isFormRouter = false
        this.$nextTick(() => (this.isFormRouter = true));
      }else {
        this.isRouterAlive = false
        this.$nextTick(() => (this.isRouterAlive = true));
      }
      
    }, 

    handleIconSearch(value) {
      // 【暂时先注释，通过element的方法实现筛选】
      this.node_had.childNodes = [];//把存起来的node的子节点清空，不然会界面会出现重复树！
      this.loadNode(this.node_had, this.resolve_had, value);//再次执行懒加载的方法
      // this.filterText = value
    },

    loadNode(node, resolve, searchValue) {
      let op = this.openParams
      if(!this.node_had) {
        this.node_had = node;//这里是关键！在data里面定义一个变量，将node.level == 0的node存起来
      }
      
      if(!this.resolve_had) {
        this.resolve_had = resolve;
      }
      //同上，把node.level == 0的resolve也存起来
      let name = searchValue?searchValue:''
      if (node.level === 0) {
        this.$api.getTreeViewData(
          this.openParams.appId,
          this.view.id,
          {
            parentId: op.parentId,
            isRelate: op.isRelate,
            name: name?name:'',
            isSearchForm: this.isSearchForm,
          },
          {},
          name,
          {
            onSucess: response => {
              let viewData = response.data;
              this.treeViewData = response.data.data.data;
              if (viewData.data.data && viewData.data.data.length > 0) {
                this.clickTreeDocId = viewData.data.data[0].id;
                this.isSearchOperation = false;
                let nodes = [];
                this.view.columns.forEach(clm => {
                  if (clm.mappingField == "name_Node") {
                    viewData.data.data.forEach(doc => {
                      let rows = {};
                      rows.formId = doc.formId;
                      rows.docId = doc.id;
                      for (var key in doc.items) {
                        let items = doc.items[key];
                        rows[key] = items.value;
                      }

                      let label = doc.items[clm.id].value;
                      nodes.push(
                        { 
                          key: doc.id, 
                          level: 0, 
                          label: label, 
                          children: doc.children, 
                          formId: doc.formId, 
                          row_count: doc.row_count,
                          rows,
                          leaf: doc.children?false:true,
                        });
                    });
                  }
                });
                this.arrNodes = nodes
                // console.log("this.arrNodes-1--->",this.arrNodes)
                resolve(this.arrNodes);
              }else if(viewData.data.data.length == 0){
                this.loading = " "
                this.isDisplay = true;
                if(searchValue) {
                  this.isSearchOperation = true;
                }
              }
            }
          }                              
        );
      } else {
        this.$api.getTreeViewData(
          this.openParams.appId,
          this.view.id,
          {
            parentId: node.key,
            isSearchForm: this.isSearchForm,
          },
          {},
          "",
          {
            onSucess: response => {
              let viewData = response.data;
              this.treeViewData = response.data.data.data;
              if (viewData.data.data && viewData.data.data.length > 0) {
                this.isSearchOperation = false;
                let nodes = [];
                this.view.columns.forEach(clm => {
                  if (clm.mappingField == "name_Node") {
                    viewData.data.data.forEach(doc => {
                      let rows = {};
                      rows.formId = doc.formId;
                      rows.docId = doc.id;
                      for (var key in doc.items) {
                        let items = doc.items[key];
                        rows[key] = items.value;
                      }

                      let label = doc.items[clm.id].value;
                      nodes.push(
                        { 
                          key: doc.id, 
                          level: 0, 
                          label: label, 
                          children: doc.children, 
                          formId: doc.formId, 
                          row_count: doc.row_count,
                          rows,
                          leaf: doc.children?false:true,
                        });
                    });
                  }
                });
                //this.arrNodes = nodes
                // console.log("nodes-2--->",nodes)
                resolve(nodes);
              }else if(viewData.data.data.length == 0){
                let nodes = [];
                resolve(nodes);
                this.isDisplay = true;
                if(searchValue) {
                  this.isSearchOperation = true;
                }
              }
            }
          }
        );
      }
    },

    getTreeView() {
      this.$api.getTreeViewData(
        this.openParams.appId,
        this.view.id,
        {
          parentId: ""
        },
        {},
        "",
        {
          onSucess: response => {
            let viewData = response.data;
            this.treeViewData = response.data.data.data;
            if (viewData.data.data && viewData.data.data.length > 0) {
              let nodes = [];
              this.view.columns.forEach(clm => {
                if (clm.mappingField == "current_Node") {
                  viewData.data.data.forEach(doc => {
                    let label = doc.items[clm.id].value;
                    nodes.push({ key: doc.id, level: 0, label: label, children: doc.children, formId: doc.formId});
                  });
                }
              });
              this.arrNodes = nodes
              // console.log("this.treeViewData--->",this.treeViewData)
              // console.log("arrNodes--->",this.arrNodes);
            }else if(viewData.data.data.length == 0){
              this.isDisplay = true;
            }
          }
        }
      );
    },

    reloadListView(){
      this.isTreeRouterAlive = false
      this.$nextTick(() => (this.isTreeRouterAlive = true));
      this.isRouterAlive = false
      this.$nextTick(() => (this.isRouterAlive = true));
      // this.getTreeView(this.currentPage, 10, "");
    },

    // 重置数组
    reset(){
      // 清空右侧的内容
      this.tags = []
      // 清空左侧选中的内容
      this.$refs.viewTree.setCheckedKeys([])
    },

    /**
     * 点击tag的删除
     */
    handleClose(tag){
      // 删除右侧的数据
      this.tags.splice(this.tags.indexOf(tag), 1)
      // 获取左侧所有数据
      let leftData = this.$refs.viewTree.getCheckedNodes()
      let keys = []
      // 筛选左侧需要显示的值
      leftData.filter(item =>  (item.label != tag.name)).map(item2 => keys.push(item2.key))
      this.$refs.viewTree.setCheckedKeys(keys)
    },

    /**
     * 点击查询获取值
     */
    onSearch(searchData, data) {
      this.filterText = data[this.$t('view.this_node')]
    },
    /**
     * 筛选显示的节点
     */
    filterNode(value, data) {
      if (!value) return true;
      if(data.label.indexOf(value) !== -1){
        return data.label.indexOf(value) !== -1;
      }else{
        return false;
      }
    },

    /**
     * 搜索的下来弹窗
     */
    onSearchTree(data){
      this.filterText = data[this.$t('view.this_node')] || data[this.$t('view.node_id')] || data[this.$t('view.parent_id')]
    }
  }
};
</script>

<style lang="scss">
  .tree .el-tree-node>.el-tree-node__children {
    overflow: unset; //让el-tree自带的overflow属性失效
  }
</style>
