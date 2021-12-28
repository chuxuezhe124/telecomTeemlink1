<template>
  <span :id="id" class="dept-tree-select dept-tree-select-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType.toLowerCase() == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <el-input 
        type="hidden" 
        autosize 
        v-model="field.value">
      </el-input>
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.val}}
      </div>
    </template>

    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
         <div 
          class="dept-tree-wrap" style="border:none"
          @mouseenter="enter()">
          <template>{{field.value?field.val:''}}</template>
          <i 
            class="fa fa-history icon-log" 
            @click="getOperationLogs" 
            style="color:#46d2db" 
            v-if="showLogsIcon && field.isModified" 
            aria-hidden="true">
          </i>
          <form_operation 
            v-if="showLogsDialog"
            :docId="field.docId"
            :operationData="operationData"
            @event="hiddenLogsDialog"
          />
         </div>
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <div 
          class="dept-tree-wrap"
          @mouseenter="enter()">
          <div class="tag-box" :style="{width:field.width?field.width + 'px':'250px'}">
            <el-tag
              class="tag"
              v-for="dept in field.data"
              :key="dept.key"
              closable
              type="info">
              {{dept.label?dept.label:dept.name}}
            </el-tag>
          </div>
          <i 
            class="fa fa-history icon-log" 
            @click="getOperationLogs" 
            style="color:#46d2db" 
            v-if="showLogsIcon && field.isModified" 
            aria-hidden="true">
          </i>
          <form_operation 
            v-if="showLogsDialog"
            :docId="field.docId"
            :operationData="operationData"
            @event="hiddenLogsDialog"
          />
        </div>
      </template>
    </template>
    <!-- 可编辑 -->
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div 
        class="dept-tree-wrap"
        :style="{width:field.width?field.width + 'px':'250px'}"
        @mouseenter="enter()"
      >
        <div class="tag-box" :style="{width:field.width?(field.width-27) + 'px':'201px'}">
          <el-tag
            class="tag"
            v-for="dept in field.data"
            :key="dept.key"
            closable
            type="info"
            @close="onTabClose(dept,field.data)">
            {{dept.label?dept.label:dept.name}}
          </el-tag>
        </div>
        
        <div class="dept-add-btn" @click="showDialg">
          +
        </div>
        <!-- <div class="dept-btn">
          <el-button 
            icon="el-icon-s-operation" 
            size="small" 
            @click="showDialg" 
          />
        </div> -->
        <span v-if="field.instantValidate" class="mark">*</span>
        <i 
          class="fa fa-history icon-log" 
          @click="getOperationLogs" 
          style="color:#46d2db" 
          v-if="showLogsIcon && field.isModified" 
          aria-hidden="true">
        </i>
        <form_operation 
          v-if="showLogsDialog"
          :docId="field.docId"
          :operationData="operationData"
          @event="hiddenLogsDialog"
          />
      </div>
      <div class="tips" v-show="isActive">
        <i class="el-icon-close "></i>
        {{errorMessage}}
      </div>
    </template>
    <el-dialog
      :title="$t('view.select_dept')"
      :visible.sync="dialogVisible"
      width="45%"
      :before-close="handleClose"
      class="dept-tree-dialog-new"
      :append-to-body="true"
      >
      <div class="tree-box">
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
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane :label="$t('view.structure')" name="first">
            <div class="tree-content">
              <div class="tree-list">
                <el-scrollbar class="scrollbar">
                  <div class="search-list" v-show="isSearchValue">
                    <el-checkbox-group 
                      v-model="searchDeptListValue"
                      class="obpm-checkbox"
                      @change="searchChange"
                    >
                      <el-checkbox 
                        v-for="(item, index) in searchDeptList" 
                        :label="item" 
                        :key="index">{{item.label}}</el-checkbox>
                    </el-checkbox-group>
                  </div>
                  <div v-show="!isSearchValue">
                    <el-tree 
                      :empty-text="$t('view.loading')"
                      :props="defaultProps" 
                      :load="loadNode" 
                      node-key="key" 
                      ref="deptTree" 
                      lazy 
                      show-checkbox
                      :check-strictly="true"
                      :default-checked-keys="defaultCheckedKeys"
                      :default-expanded-keys="defaultExpandedKeys"
                      @node-click="handleNodeClick"
                      @check-change="handleCheckChange">
                    </el-tree>
                  </div>
                  
                </el-scrollbar>
              </div>
              <div class="tree-select">
                <div class="top">
                  <span 
                    class="to-right" 
                    @click="selectType('TORIGHT')" 
                    :style="{background: selectTreeDept.length>selectTreeDeptRight.length?'#2db7f5':'#ccc'}"
                  >
                    <i class="el-icon-arrow-right"></i>
                  </span>
                  <span 
                    class="to-left"
                    @click="selectType('TOLEFT')" 
                    :style="{background: activeRightDept.length>0?'#2db7f5':'#ccc'}"
                  >
                    <i class="el-icon-arrow-left"></i>
                  </span>
                </div>
                <div class="bottom">
                  <span 
                    class="to-right" 
                    @click="selectType('ALLTOLEFT')"
                    :style="{background: allDeptTree.length>selectTreeDeptRight.length?'#2db7f5':'#ccc'}"
                  >
                    <i class="el-icon-d-arrow-right"></i>
                  </span>
                  <span 
                    class="to-left"
                    @click="selectType('ALLTORIGHT')"
                    :style="{background: allDeptTree.length<=selectTreeDeptRight.length?'#2db7f5':'#ccc'}"
                  >
                    <i class="el-icon-d-arrow-left"></i>
                  </span>
                </div>
              </div>
              <div class="selected">
                <div class="selected-dept">
                  <el-scrollbar class="scrollbar">
                    <span 
                      class="one-dept" 
                      v-for="(item, index) in selectTreeDeptRight" 
                      :key="index"
                      :style="{ background: activeRightDept.indexOf(item.key)>=0 ? '#eaf8fe':''}"
                      @click="handleSelectDeptClick(item.key)"
                    >
                      {{item.label}}
                    </span>
                  </el-scrollbar>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{$t('btns.cancel')}}</el-button>
        <el-button type="primary" @click="onOk" :disabled="selectTreeDeptRight.length>0?false:true">{{$t('btns.sure')}} </el-button>
      </span>
    </el-dialog>
  </span>
</template>
<script>
import Constant from "@/Constant.js";
import API from "@/api.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-dept-tree-select",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      if (formData.value) {
        let arr = formData.value.split(";");
        let val = "";
        for (let j = 0; j < arr.length; j++) {
          for (let i = 0; i < formData.data.length; i++) {
            if (arr[j] == formData.data[i].id) {
              val += formData.data[i].name + ";";
            }
          }
        }
        formData.val = val.replace(/^(\s|;)+|(\s|;)+$/g, '');
      } else {
        formData.val = "";
      }
      //return this.$parent.findField(this.id);
      return formData;
    }
  },
  watch: {
    'field.value': {
      deep:true,
      handler:function(newVal){
        let field = this.field;
        if(!newVal) {
          field.data = [];
        }
      }
    },
    searchValue(newVal){
      if(!newVal) {
        setTimeout(()=> {
          let deptTree = this.searchDeptListValue;
          let rightList = this.activeRightDept;
          for(let i=0; i<rightList.length; i++) {
            for(let j=0; j<deptTree.length; j++) {
              if(rightList[i] == deptTree[j].key) {
                deptTree.splice(j, 1);
                j--;
              }
            }
          }

          let arr = [];
          deptTree.forEach(item => {
            arr.push(item.key);
          })
          this.$refs.deptTree.setCheckedKeys(arr);
          this.selectTreeDeptRight = this.$refs.deptTree.getCheckedNodes();
          this.activeRightDept = [];
          this.$forceUpdate();
        }, 500)
      }
    },
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  data: function() {
    return {
      checkedCities: [],
      isActive:false,
      errorMessage:'',
      activeName:'first',
      Constant,
      dialogVisible: false,
      defaultCheckedKeys:[],
      defaultExpandedKeys:[], //默认展开
      defaultProps: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      selectedNumber:'',
      dialog: false,
      selectTreeDept:[],
      selectTreeDeptRight:[],
      activeRightDept:[],
      allDeptTree:[],
      searchValue:'',
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
      operationData:'',
      searchDeptList: [],
      searchDeptListValue: [],
      isSearchValue: false,
    };
  },
  methods: {
    handleNodeClick(node,nodes,root){
      if(!node.children){
        nodes.checked = nodes.checked == false ? true : false;
      }
    },
    searchChange(value){
      this.selectTreeDept = value;
      this.selectedNumber = value.length;
    },
    hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
    },
    enter(){
      if(this.field.isModified) {
        this.showLogsIcon = true;
      }
    },
    getOperationLogs() {
      let obj = {};
      obj.fieldName = this.field.name;
      this.operationData = obj;
      this.showLogsDialog = true;
    },
    handleIconSearch(value) {
      this.$api.searchDepartments(
        this.$root.appid,
        encodeURIComponent(value),
        {
          onSucess: res => {
            let list = res.data.data.map(item => {
              return {
                children: false,
                key: item.id,
                label: item.name,
                leaf: true,
                level: 0,
                row_count: '',
              }
            })
            this.searchDeptList = list;
            if(!value) {
              this.isSearchValue = false;
            }else {
              this.isSearchValue = true;
            }
          }
        }
      )
    },
    handleSelectDeptClick(key) {
      if(this.activeRightDept.indexOf(key) > -1){
        for(let i=0; i<this.activeRightDept.length; i++) {
          if(this.activeRightDept[i] == key) {
            this.activeRightDept.splice(i, 1);
            break;
          }
        }
      }else {
        this.activeRightDept.push(key);
      }
      console.log("------------->",this.activeRightDept);
    },
    selectType(val){
      if(val == 'TORIGHT') {
        this.selectTreeDeptRight = this.selectTreeDept;
      }else if (val == 'TOLEFT') {
        if(!this.searchValue) {
          let deptTree = this.$refs.deptTree.getCheckedNodes(); 
          let rightList = this.activeRightDept;
          for(let i=0; i<rightList.length; i++) {
            for(let j=0; j<deptTree.length; j++) {
              if(rightList[i] == deptTree[j].key) {
                deptTree.splice(j, 1);
                j--;
              }
            }
          }
          let arr = [];
          deptTree.forEach(item => {
            arr.push(item.key);
          })
          this.$refs.deptTree.setCheckedKeys(arr);
          this.selectTreeDeptRight = this.$refs.deptTree.getCheckedNodes();
          this.activeRightDept = [];
          this.$forceUpdate();
        }else {
          let deptTree = this.searchDeptListValue;
          let rightList = this.activeRightDept;
          for(let i=0; i<rightList.length; i++) {
            for(let j=0; j<deptTree.length; j++) {
              if(rightList[i] == deptTree[j].key) {
                deptTree.splice(j, 1);
                j--;
              }
            }
          }

          let arr = [];
          deptTree.forEach(item => {
            arr.push(item.key);
          })
          this.$refs.deptTree.setCheckedKeys(arr);
          this.selectTreeDeptRight = this.$refs.deptTree.getCheckedNodes();
          this.activeRightDept = [];
          this.$forceUpdate();
        }
      }else if (val == "ALLTOLEFT") {
        this.selectTreeDeptRight = this.allDeptTree;
        let arr = [];
        this.selectTreeDeptRight.forEach(item => {
          item.key = item.id;
          item.label = item.name;
          arr.push(item.id);
        })
        this.$refs.deptTree.setCheckedKeys(arr);
      } else if (val == "ALLTORIGHT") {
        this.selectTreeDeptRight = [];
        this.$refs.deptTree.setCheckedKeys([]);
        this.activeRightDept = [];
      }
    },
    handleClick() {

    },
    showDialg() {
      this.selectedNumber = this.field.data.length;
      this.dialogVisible = true;
    },
    
    handleCheckChange() {
      let res = this.$refs.deptTree.getCheckedNodes(); 
      this.selectTreeDept = this.$refs.deptTree.getCheckedNodes();
      this.selectedNumber = res.length;
    },

    onTabClose(dept) {
      let field = this.field;
      let deptId = dept.id?dept.id:dept.key;
      let allValue = field.value.split(';');
      for(let i=0; i<field.data.length; i++){
        let fieldDeptId = field.data[i].id?field.data[i].id:field.data[i].key;
        if(fieldDeptId == deptId){
          allValue.splice(allValue.indexOf(deptId),1);
        }
      }
      field.value = allValue.join(";");
      field.data.splice(field.data.indexOf(dept), 1);
      if(field.data && field.data.length > 0 ) {
        let arr = [];
        let deptName = '';
        for(let i=0; i<field.data.length; i++) {
          deptName += field.data[i].name + ';';
          let deptid = field.data[i].id ? field.data[i].id : field.data[i].key;
          arr.push(deptid);
        }
        field.val = deptName;
        this.defaultCheckedKeys = arr;
        this.selectTreeDeptRight = field.data;
        this.field = field;
        if(this.$refs.deptTree) {
          this.$refs.deptTree.setCheckedKeys(arr);
        }
      }else {
        this.defaultCheckedKeys = [];
      }
      if(this.field.refreshOnChanged) {
        this.onChange();
      }
      if(this.field.instantValidate) {
        this.evenCheck();
      }
    },

    evenCheck(){
      let value = true;
      let formData = this.$parent.checkData(value);
      this.$api.formValidation(
        this.$root.appid, 
        formData,
        {
          onSucess: response => {
            if(response.data.errcode == 4001) {
              if(response.data.errors && response.data.errors.length > 0) {
                let arr = response.data.errors;
                for(let i=0; i<arr.length; i++) {
                  if(this.field.name == arr[i].field) {
                    this.isActive = true;
                    this.errorMessage = arr[i].errmsg
                    return;
                  }else {
                    this.isActive = false;
                    this.errorMessage = '';
                  }
                }
              }
            }else if(response.data.errcode == 0) {
              this.isActive = false;
            }
          }
        }
      )
    },

    onOk() {
      let nodes = this.selectTreeDeptRight;//this.$refs.deptTree.getCheckedNodes();
      //this.selectedNumber = nodes.length;
      if (nodes && nodes.length <= this.field.limit) {
        let value = "";
        let key = "";
        this.field.data = [];
        let selectKeys = [];
        nodes.forEach(node => {
          selectKeys.push(node.key);
          this.field.data.push({key:node.key, name:node.name});
          value += node.label + ";";
          key += node.key+ ";";
        });
        this.field.data = JSON.parse(JSON.stringify(nodes));
        this.field.value = key.replace(/^(\s|;)+|(\s|;)+$/g, '');
        this.field.val = value;
        this.defaultCheckedKeys = selectKeys;
        this.selectedNumber = this.field.data.length + nodes.length;
        if(this.field.instantValidate) {
          this.evenCheck();
        }
      }else {
        alert("您最多可选择"+this.field.limit+"个部门");
      }
      this.dialogVisible = false;
      if (this.field.refreshOnChanged){//判断是否需要刷新
        this.onChange();
      }
    },
    handleClose(done) {
      this.selectedNumber = this.field.data.length;
      done();
    },

    loadNode(node, resolve) {
      let that = this;
      let appid = this.$root.appid;
      if (node.level === 0) {
        API.getDepartmentsByParentId(appid, "", {
          onSucess: function(response) {
            if(response.data.data) {
              that.allDeptTree = that.allDeptTree.concat(response.data.data);
            }
            let nodes = [];
            that.defaultExpandedKeys.push(response.data.data[0].id);
            let allData = response.data.data;
            allData.forEach(doc => {
              nodes.push(
                { 
                  key: doc.id, 
                  level: 0, 
                  label: doc.name, 
                  children: doc.hasChilds, 
                  row_count: doc.userCount,
                  leaf: doc.hasChilds?false:true,
                });
            })
            // hasChilds: true
            // id: "ZMMMGm5mnGCE4WvWFeI"
            // name: "test123"
            // userCount: 21
            console.log("this.nodes--->",nodes)
            resolve(nodes);
          }
        });
      } else {
        API.getDepartmentsByParentId(appid, node.key, {
          onSucess: function(response) {
            if(response.data.data) {
              that.allDeptTree = that.allDeptTree.concat(response.data.data);
            }
            let nodes = [];
            let allData = response.data.data;
            allData.forEach(doc => {
              nodes.push(
                { 
                  key: doc.id, 
                  level: 0, 
                  label: doc.name, 
                  children: doc.hasChilds, 
                  row_count: doc.userCount,
                  leaf: doc.hasChilds?false:true,
                });
            })
            resolve(nodes)
          }
        });
      }
    },

    onChange() {
      this.$parent.refresh(this.id);
    },
  }
};
</script>
<style lang="scss" scoped>
  .el-textarea {
    width: 240px;
  }
</style>