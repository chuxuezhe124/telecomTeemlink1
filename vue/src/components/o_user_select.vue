<template>
  <span :id="id" class="user-select-control user-select">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType.toLowerCase() == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.userName}}
      </div>
    </template>

    <!--只读-->
    <template v-else-if="field.textType.toLowerCase() == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <div 
          class="dept-tree-wrap-readonly"
          @mouseenter="enter()"
        >
          <template>{{field.userName}}</template>
          <i 
            class="fa fa-history icon-log" 
            @click="getOperationLogs" 
            style="color:#46d2db"
            v-if="showLogsIcon && field.isModified" 
            aria-hidden="true">
          </i>
          <div class="log-box" v-if="showLogsDialog">
            <div class="header">
              <span>{{$t('view.history')}}</span>
              <span><i class="el-icon-close" @click="hiddenLogsDialog"></i></span>
            </div>
            <div class="table-list">
              <div class="table-box">
                <el-table
                  :data="tableData"
                  :header-cell-style="{background:'#F9F9F9',color:'#5A6779'}"
                  style="width: 100%">
                  <el-table-column
                    prop="modifier"
                    :label="$t('view.change_people')">
                  </el-table-column>
                  <el-table-column
                    prop="time"
                    :label="$t('view.change_time')">
                  </el-table-column>
                  <el-table-column
                    prop="fieldValue"
                    :label="$t('view.change_data')">
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <div 
          class="dept-tree-wrap"
          @mouseenter="enter()"
        >
          <div class="tag-box" :style="{width:field.width?field.width + 'px':'250px'}">
            <el-tag
              class="tag"
              v-for="user in field.data"
              :key="user.id"
              type="info"
              @close="onTabClose(user,field.data)"
            >
              {{user.name}}
            </el-tag>
          </div>
          <i 
            class="fa fa-history icon-log" 
            @click="getOperationLogs" 
            style="color:#46d2db"
            v-if="showLogsIcon && field.isModified" 
            aria-hidden="true">
          </i>
          <div class="log-box" v-if="showLogsDialog">
            <div class="header">
              <span>{{$t('view.history')}}</span>
              <span><i class="el-icon-close" @click="hiddenLogsDialog"></i></span>
            </div>
            <div class="table-list">
              <div class="table-box">
                <el-table
                  :data="tableData"
                  :header-cell-style="{background:'#F9F9F9',color:'#5A6779'}"
                  style="width: 100%">
                  <el-table-column
                    prop="modifier"
                    :label="$t('view.change_people')">
                  </el-table-column>
                  <el-table-column
                    prop="time"
                    :label="$t('view.change_time')">
                  </el-table-column>
                  <el-table-column
                    prop="fieldValue"
                    :label="$t('view.change_data')">
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div 
        class="dept-tree-wrap"
        :style="{width:field.myselfrows ? field.myselfrows : (field.width?field.width + 'px':'250px')}"
        @mouseenter="enter()"
      >
        <div class="tag-box" :style="{width:field.width?(field.width-27) + 'px':'201px'}">
          <el-tag
            class="tag"
            v-for="user in field.data"
            :key="user.id"
            closable
            type="info"
            @close="onTabClose(user,field.data)"
          >
            {{user.name}}
          </el-tag>
        </div>
        <div class="dept-add-btn" @click="eject(field.selectMode)">
          <i class="el-icon-user"></i>
        </div>
        <!-- <el-button 
          icon="el-icon-user" 
          size="small"
          @click="eject(field.selectMode)" /> -->
        <span v-if="field.instantValidate" class="mark">*</span>
        <i 
          class="fa fa-history icon-log" 
          @click="getOperationLogs" 
          style="color:#46d2db"
          v-if="showLogsIcon && field.isModified" 
          aria-hidden="true">
        </i>
        <div class="log-box" v-if="showLogsDialog">
          <div class="header">
            <span>{{$t('view.history')}}</span>
            <span><i class="el-icon-close" @click="hiddenLogsDialog"></i></span>
          </div>
          <div class="table-list">
            <div class="table-box">
              <el-table
                :data="tableData"
                :header-cell-style="{background:'#F9F9F9',color:'#5A6779'}"
                style="width: 100%">
                <el-table-column
                  prop="modifier"
                  :label="$t('view.change_people')">
                </el-table-column>
                <el-table-column
                  prop="time"
                  :label="$t('view.change_time')">
                </el-table-column>
                <el-table-column
                  prop="fieldValue"
                  :label="$t('view.change_data')">
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
        <div class="tips" v-show="isActive">
          <i class="el-icon-close "></i>
          {{errorMessage}}
        </div>

      <!--样式在userSelectControlDialog.scss中-->
      <div class="user-dialog">
        <el-dialog
          class="user-select-control-dialog"
          :modal-append-to-body="false"
          :append-to-body="true"
          :title="$t('user')"
          style="padding:0;" 
          :visible.sync="dialogVisible" 
          :before-close="handleClose">
          <div class="user-container">
            <div class="tab-title-list">
              <div class="list">
                <span 
                  v-for="(item,index) in tabTitleList" 
                  :key="index"
                  @click="handleClick(item)"
                  :class="[tabName===item.name?'tabActive':'']" 
                >
                  {{item.value}}
                </span>
              </div>
              <div class="search-box">
                <el-input 
                  :placeholder="$t('placeholder.name_accouont')"
                  v-model="searchValue"
                  @keyup.enter.native="handleIconSearch(searchValue)"
                  >
                  <el-button 
                    @click="handleIconSearch(searchValue)"
                    slot="append" 
                    icon="el-icon-search">
                  </el-button>
                </el-input>
              </div>
            </div>
            <div class="tab-container">
              <!--按部门-->
              <div class="tab-container-box" :class="[tabName==='first'?'tabBoxBlock':'tabBoxNone']">
                <div class="contact user-common">
                  <!--左-->
                  <div class="left">
                    <span class="top-title">{{$t('department_list')}}</span>
                    <el-scrollbar class="scrollbar">
                      <div class="dept-tree">
                        <el-tree 
                          class="flow-tree"
                          :props="props" 
                          :load="loadNode"
                          node-key="id" 
                          ref="deptTree" 
                          lazy 
                          :expand-on-click-node="false"
                          :check-strictly="true"
                          :default-expanded-keys="defaultExpandedKeys"
                          @node-click="handleNodeClick($event)"
                          >
                          <span class="custom-tree-node" slot-scope="{ data }">
                            
                            <i class="fa fa-folder fa-lg"></i>{{data.name}}        
                          </span>
                        </el-tree>
                      </div>
                    </el-scrollbar>
                  </div>
                  <!--中-->
                  <div class="role-page"> 
                    <div class="user-list"> 
                      <div class="add-all-data" v-if="field.selectMode == 'multiSelect'">
                        <span @click="addAllPage('DEPT')">{{$t('view.add_all')}}</span>
                      </div>
                      <div class="current-role" v-if="currentDeptName">
                        {{$t('view.dept')}}：{{currentDeptName}}
                      </div>
                      <el-scrollbar class="scrollbar">
                        <div class="list-box">
                          <!--单选-->
                          <el-radio-group v-model="selectedUserRadio" v-if="field.selectMode == 'selectOne'">
                            <el-radio 
                              style="display:block;"
                              v-for="user in (searchData && searchData.length>0?searchData:deptUser)" 
                              :label="user.id" 
                              :key="user.id"
                              @change="handleRadioChange($event, user, user.id)"
                              :title="user.name  + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-radio>
                          </el-radio-group>

                          <!--复选-->
                          <el-checkbox-group v-model="selectedUsers" v-else>
                            <el-checkbox 
                              style="display:block"
                              v-for="user in (searchData && searchData.length>0?searchData:deptUser)" 
                              :label="user.id"
                              :key="user.id"
                              @change="handleSelectChange($event, user, user.id)"
                              :title="user.name  + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-checkbox>    
                          </el-checkbox-group>
                        </div>
                        <div class="no-data" style="padding-left:10px;" v-if="searchData.length<=0 && deptUser.length<=0">
                          <span v-if="isclickEmpty">
                            {{$t('view.cant_find')}}
                          </span>
                        </div>
                      </el-scrollbar>
                    </div>
                    <div class="btn">
                      <el-pagination
                        small
                        :pager-count="5"
                        :current-page.sync="currentPage"
                        :page-size="10"
                        layout="prev, pager, next"
                        :total="row_count"
                        @current-change="deptLoadingMore($event)"
                      >
                      </el-pagination>
                    </div>
                  </div>
                  <!--右-->
                  <div class="selected-role">
                    <div class="add-all-data">
                      <div>
                        {{$t('view.has_selectuser')}}：
                        <sup class="labelNum">{{selectedUsers.length}}</sup>
                      </div>
                      <div>
                        <!-- <el-button type="danger" size="mini" @click="closeAll">{{$t('btns.remove')}}所有</el-button> -->
                        <span @click="closeAll">{{$t('btns.remove')}}</span>
                      </div>
                    </div>
                    <el-scrollbar class="scrollbar">
                      <div class="tag-lists">
                        <el-tag
                          class="tag"
                          v-for="(user,i) in selectedUsersList"
                          :key="i"
                          @close="closableTag(user.id,i)"
                          closable
                          :title="user.name + ' ' + user.dept">
                          {{user.name}}
                        </el-tag>
                      </div>
                    </el-scrollbar>
                  </div>
                </div>
              </div>
              
              <!--按角色-->
              <div class="tab-container-box" :class="[tabName==='second'?'tabBoxBlock':'tabBoxNone']">
                <div class="role user-common">
                  <!--左-->
                  <span class="role-left">
                    <span class="top-title">{{$t('view.role')}}{{$t('flow.list')}}:</span>
                    <el-scrollbar class="scrollbar">
                      <ul>
                        <li 
                          v-for="item in allRoles" 
                          :key="item.id" 
                          :title="item.name"
                          @click="rolesList(item.id, item.name)">
                          <img 
                            src="../assets/images/right_2.gif" 
                            class="icon-img"
                            v-if="item.id == roleCurrentId" 
                          />
                            {{item.name}}
                        </li>

                      </ul>
                    </el-scrollbar>
                  </span>
                  <!--中-->
                  <div class="role-page">
                    <div class="user-list"> 
                      <div class="add-all-data" v-if="field.selectMode == 'multiSelect'" >
                        <!-- <el-button plain size="small" @click="addAllPage('ROLE')">{{$t('view.add_all')}}</el-button> -->
                        <span @click="addAllPage('ROLE')">{{$t('view.add_all')}}</span>
                      </div>
                      <div class="current-role">
                        {{$t('view.role')}}：{{currentRoleName}}
                      </div>
                      <el-scrollbar class="scrollbar">
                        <div class="list-box">
                          <!--单选-->
                          <el-radio-group v-model="selectedUserRadio" v-if="field.selectMode == 'selectOne'">
                            <el-radio 
                              style="display:block;"
                              v-for="user in (searchData && searchData.length>0?searchData:rolesData)" 
                              :label="user.id" 
                              :key="user.id"
                              @change="handleRadioChange($event, user, user.id)"
                              :title="user.name  + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-radio>
                          </el-radio-group>
                          
                          <!--复选-->
                          <el-checkbox-group v-model="selectedUsers" v-else>
                            <el-checkbox 
                              style="display:block;"
                              v-for="user in (searchData && searchData.length>0?searchData:rolesData)"
                              :label="user.id" 
                              :key="user.id"
                              @change="handleSelectChange($event, user, user.id)"
                              :title="user.name + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-checkbox>    
                          </el-checkbox-group>
                        </div>
                        <div class="no-data" style="padding-left:10px;" v-if="searchData.length<=0 && rolesData.length<=0">
                          <span v-if="isclickEmpty">
                            {{$t('view.cant_find')}}
                          </span>
                        </div>
                      </el-scrollbar>
                    </div>
                    <div class="btn">
                      <el-pagination
                        small
                        :pager-count="5"
                        :current-page.sync="currentPage"
                        :page-size="10"
                        layout="prev, pager, next"
                        :total="row_count"
                        @current-change="rolesLoadingMore($event)"
                      >
                      </el-pagination>
                    </div>
                  </div>
                  <!--右-->
                  <div class="selected-role">
                    <div class="add-all-data">
                      <div>
                        {{$t('view.has_selectuser')}}：
                        <sup class="labelNum">{{selectedUsers.length}}</sup>
                      </div>
                      <div>
                        <!-- <el-button type="danger" size="mini" @click="closeAll">{{$t('btns.remove')}}所有</el-button> -->
                        <span @click="closeAll">{{$t('btns.remove')}}</span>
                      </div>
                    </div>
                    <el-scrollbar class="scrollbar">
                      <div class="tag-lists">
                        <el-tag
                          class="tag"
                          v-for="(user,i) in selectedUsersList"
                          :key="i"
                          @close="closableTag(user.id,i)"
                          closable
                          :title="user.name + ' ' + user.dept">
                          {{user.name}}
                        </el-tag>
                      </div>
                    </el-scrollbar>
                  </div>
                </div>
              </div>

              <!--通讯录-->
              <div class="tab-container-box" :class="[tabName==='fourth'?'tabBoxBlock':'tabBoxNone']">
                <div class="contact user-common">
                  <!--左-->
                  <div class="left">
                    <span class="top-title">{{$t('profile.tel_list')}}：</span>
                    <span @click="contact" class="all-contact">
                      <img 
                        src="../assets/images/right_2.gif" 
                        class="icon-img"
                      />
                      {{$t('view.all_link')}}
                    </span>
                  </div>
                  <!--中-->
                  <div class="role-page">
                    <div class="user-list"> 
                      <div class="add-all-data" v-if="field.selectMode == 'multiSelect'">
                        <!-- <el-button plain size="small" @click="addAllPage('ADDRESSBOOK')">{{$t('view.add_all')}}</el-button> -->
                        <span @click="addAllPage('ADDRESSBOOK')">{{$t('view.add_all')}}</span>
                      </div>
                      <div class="current-role">
                        {{$t('view.role')}}：{{$t('view.link')}}
                      </div>
                      <el-scrollbar class="scrollbar">
                        <div class="list-box">
                          <!--单选-->
                          <el-radio-group v-model="selectedUserRadio" v-if="field.selectMode == 'selectOne'">
                            <el-radio 
                              style="display:block;"
                              v-for="user in (searchData && searchData.length>0?searchData:linkman)" 
                              :label="user.id" 
                              :key="user.id"
                              @change="handleRadioChange($event, user, user.id)"
                              :title="user.name  + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-radio>
                          </el-radio-group>
                          <el-checkbox-group v-model="selectedUsers" v-else>
                            <el-checkbox 
                              style="display:block"
                              v-for="user in  (searchData && searchData.length>0?searchData:linkman)" 
                              :label="user.id"  
                              :key="user.id"
                              @change="handleSelectChange($event, user, user.id)"
                              :title="user.name + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-checkbox>    
                          </el-checkbox-group>
                        </div>
                        <div class="no-data" style="padding-left:10px;" v-if="searchData.length<=0 && linkman.length<=0">
                          <span v-if="isclickEmpty">
                            {{$t('view.cant_find')}}
                          </span>
                        </div>
                      </el-scrollbar>
                    </div>
                    <div class="btn">
                      <el-pagination
                        small
                        :pager-count="5"
                        :current-page.sync="currentPage"
                        :page-size="10"
                        layout="prev, pager, next"
                        :total="row_count"
                        @current-change="contactLoadingMore($event)"
                      >
                      </el-pagination>
                    </div>
                  </div>
                  <div class="selected-role">
                    <div class="add-all-data">
                      <div>
                        {{$t('view.has_selectuser')}}：
                        <sup class="labelNum">{{selectedUsers.length}}</sup>
                      </div>
                      <div>
                        <!-- <el-button type="danger" size="small" @click="closeAll">{{$t('btns.remove')}}所有</el-button> -->
                        <span @click="closeAll">{{$t('btns.remove')}}</span>
                      </div>
                    </div>
                    <el-scrollbar class="scrollbar">
                      <div class="tag-lists">
                        <el-tag
                          class="tag"
                          v-for="(user, i) in selectedUsersList"
                          :key="i"
                          @close="closableTag(user.id,i)"
                          closable
                          :title="user.name + ' ' + user.dept">
                          {{user.name}}
                        </el-tag>
                      </div>
                    </el-scrollbar>
                  </div>
                </div>
              </div>

              <!--最近-->
              <div class="tab-container-box" :class="[tabName==='fifth'?'tabBoxBlock':'tabBoxNone']">
                <div class="recent-box">
                  <div class="left">
                    <span class="top-title">{{$t('view.near_add')}}：</span>
                    <el-scrollbar class="scrollbar">
                        <div class="list-box">
                          <!--单选-->
                          <el-radio-group v-model="selectedUserRadio" v-if="field.selectMode == 'selectOne'">
                            <el-radio 
                              style="display:block;"
                              v-for="user in (searchData && searchData.length>0?searchData:recentUsers)" 
                              :label="user.id" 
                              :key="user.id"
                              @change="handleRadioChange($event, user, user.id)"
                              :title="user.name  + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-radio>
                          </el-radio-group>

                          <!--复选-->
                          <el-checkbox-group v-model="selectedUsers" v-else>
                            <el-checkbox 
                              style="display:block"
                              v-for="user in (searchData && searchData.length>0?searchData:recentUsers)" 
                              :label="user.id"
                              :key="user.id"
                              @change="handleSelectChange($event, user, user.id)"
                              :title="user.name + ' ' + user.dept"
                            >
                              {{user.name}}
                              <span v-if="user.email" :title="user.email">
                                （{{user.email}}）
                              </span>
                            </el-checkbox>    
                          </el-checkbox-group>
                        </div>
                      </el-scrollbar>
                  </div>
                  <div class="center">
                    <i class="el-icon-arrow-right"></i>
                  </div>
                  <div class="right">
                    <div class="add-all-data">
                      <div>
                        {{$t('view.has_selectuser')}}：
                        <sup class="labelNum">{{selectedUsers.length}}</sup>
                      </div>
                      <div>
                        <!-- <el-button type="danger" size="small" @click="closeAll">{{$t('btns.remove')}}所有</el-button> -->
                        <span @click="closeAll">{{$t('btns.remove')}}</span>
                      </div>
                    </div>
                    <el-scrollbar class="scrollbar">
                      <div class="tag-lists">
                        <el-tag
                          class="tag"
                          v-for="(user, i) in selectedUsersList"
                          :key="i"
                          @close="closableTag(user.id,i)"
                          closable
                          :title="user.name + ' ' + user.dept">
                          {{user.name}}
                        </el-tag>
                      </div>
                    </el-scrollbar>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false" size="medium">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="onOk" size="medium">{{$t('btns.sure')}}</el-button>
          </span>
        </el-dialog>
      </div>
    </template>
  </span>
</template>

<script>
import API from "@/api.js"
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-user-select",
  props: ["id"],
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.value) {
        formData.value = formData.value.replace(/^(\s|;)+|(\s|;)+$/g, '');
        let arr = formData.value.split(";");
        let name = "";
        for(let j=0; j<arr.length; j++) {
          for(let i=0; i<formData.data.length; i++) {
            if(arr[j] == formData.data[i].id) {
              name += formData.data[i].name + ";";
            }
          }
        }
        formData.userName = name.replace(/^(\s|;)+|(\s|;)+$/g, '');
      }else {
        formData.userName = "";
      }
      return formData;
    }
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
  },
  data: function() {
    return { 
      isActive:false,
      errorMessage:'',
      currentPage:1,
      row_count:0,
      begin:true,
      Constant, 
      dialogVisible: false,
      roleCurrentId:'',
      allRoles:'',//所有角色
      selectedUsers:[],//选中的角色id
      selectedUsersList:[], //选中的角色数据列表
      rolesData:[],//角色数据

      activeName:'first',//tab的当前页

      linkman:[],//通讯录{{$t('view.link')}}

      searchData:[],//搜索返回的数据
      props: {
        label: "name",
        children: "zones",
        isLeaf: "leaf"
      },

      deptUser:[],//部门员工列表
      keyWord:'',//搜索关键词

      title:" ",
      tabName:'first',
      rowCount:0,
      roleId:'',
      contactCount:0,
      deptCount:0,
      departId:'',
      searchCount:0,
      onlinesUserCount:0,
      loadingIcon:false,

      onlinesPage:2,
      onlinesPageCount:'',

      singleOrDouble:'',//单选或者复选
      searchValue:'',
      defaultExpandedKeys: [],
      selectedUserRadio: '', //选中的角色id(单选)

      tabTitleList: [
        {
          name: "first",
          value:this.$t('view.a_dept')
        },
        {
          name: 'second',
          value:this.$t('view.a_role')
        },
        {
          name: 'fourth',
          value:this.$t('profile.tel_list')
        },
        {
          name: 'fifth',
          value:this.$t('view.nearly')
        }
      ],
      recentUsers:[],
      currentRoleName:'',
      currentDeptName:'',
      isclickEmpty: false,
      showLogsDialog: false,
      tableData:[],
      showLogsIcon:true,
    };
  },
  methods: {
    getOperationLogs() {
      this.showLogsDialog = true;
      let data = {
        fieldName: this.field.name,
        _: new Date().getTime(),
      }
      this.$api.getOperationLogs(
        this.$root.appid,
        this.field.docId,
        data,
        {
          onSucess: res => {
            this.tableData = res.data.data;
            console.log(this.tableData)
          }
        }
      )
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
    addAllPage(val) {
      let arr = JSON.parse(JSON.stringify(this.selectedUsers));
      if(this.searchData && this.searchData.length > 0) { //当是搜索数据的时候
        if(this.selectedUsers && this.selectedUsers.length>0) {
          this.searchData.forEach(item => {
            if(arr.indexOf(item.id) < 0) {
              this.selectedUsersList.push(item);
              this.selectedUsers.push(item.id);
            }
          });
        }else {
          this.searchData.forEach(item => {
            this.selectedUsersList.push(item);
            this.selectedUsers.push(item.id);
          });
        }
      }else {
        if(val == 'ROLE') {
          if(this.selectedUsers && this.selectedUsers.length>0) {
            this.rolesData.forEach(item => {
              if(arr.indexOf(item.id) < 0) {
                this.selectedUsersList.push(item);
                this.selectedUsers.push(item.id);
              }
            });
          }else {
            this.rolesData.forEach(item => {
              this.selectedUsersList.push(item);
              this.selectedUsers.push(item.id);
            });
          }
        }else if (val == 'DEPT') {
          if(this.selectedUsers && this.selectedUsers.length>0) {
            this.deptUser.forEach(item => {
              if(arr.indexOf(item.id) < 0) {
                this.selectedUsersList.push(item);
                this.selectedUsers.push(item.id);
              }
            });
          }else {
            this.deptUser.forEach(item => {
              this.selectedUsersList.push(item);
              this.selectedUsers.push(item.id);
            });
          }
        }else if (val == 'ADDRESSBOOK') {        
          if(this.selectedUsers && this.selectedUsers.length>0) {
            this.linkman.forEach(item => {
              if(arr.indexOf(item.id) < 0) {
                this.selectedUsersList.push(item);
                this.selectedUsers.push(item.id);
              }
            });
          }else {
            this.linkman.forEach(item => {
              this.selectedUsersList.push(item);
              this.selectedUsers.push(item.id);
            });
          }
        }
      }
    },

    closeAll() {
      this.selectedUserRadio = ''//单选选中状态消失
      this.selectedUsers = [];
      this.selectedUsersList = [];
    },

    closableTag(id, num) {
      this.selectedUsersList.splice(num,1)
      let list = this.selectedUsers;
      for(let i=0; i<list.length; i++) {
        if(id == list[i]) {
          list.splice(i, 1);
        }
      }
      if(this.field.selectMode == 'selectOne') {
        this.selectedUserRadio = ''//单选选中状态消失
      }
    },

    /**
     * 单选时进行操作
     * 
    **/
    handleRadioChange(ev, value, id) {
      let arr = [];
      let arrID = [];
      arrID.push(id);
      arr.push(value);
      this.selectedUsers = arrID;
      this.selectedUsersList = arr;
      console.log("this.selectedUsersList---->",this.selectedUsersList)
    },

    /**
     * 多选时进行操作
     * 
    **/
    handleSelectChange(ev, value, id) {
      if(ev) {
        this.selectedUsersList.push(value);
      }else {
        if(this.selectedUsersList && this.selectedUsersList.length > 0) {
          let list = this.selectedUsersList;
          for(let i=0; i<list.length; i++) {
            if(id == list[i].id) {
              list.splice(i, 1)
            }
          }
        }
      }
    },
    //查询用户
    handleIconSearch(value){
      this.keyWord = value
      this.selectData = [];
      this.$forceUpdate();
      let pageNum = 1, 
        pageSize = 10;
        if(value) {
          this.$api.getSearch(value, pageNum, pageSize, {
            onSucess: res => {
              this.rolesData = [];
              this.deptUser = [];
              this.linkman = [];
              if(res.data.data.msg) {
                this.isclickEmpty = true;
                this.searchData = [];
                this.row_count = 0;
              }else {
                this.searchData = res.data.data.datas;
                this.row_count = res.data.data.rowCount;
                this.currentPage = 1
              }
            }
          })
        }
    },

    //判断是单选还是多选
    handleChange(value, direction, movedKeys) {
      if(this.singleOrDouble == "selectOne" && value.length >= 2){
        this.selectedUsers = [];
        alert("只能选中一个");
      }
    },

    //加载更多查询数据
    searchLoadingMore(){
      let that = this;
      this.loadingIcon = true;
      let keyWord = this.keyWord;
      let pageSize = 10;
      API.searchPage(
        keyWord,
        this.currentPage,
        pageSize,
        {
          onSucess: response => {
            // this.searchData = this.searchData.concat(response.data.data.datas);
            let list = response.data.data.datas;
            // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
            //   for(let i=0; i<that.selectedUsers.length; i++) {
            //     for(let j=0; j<list.length; j++) {
            //       if(that.selectedUsers[i] == list[j].id) {
            //         list.splice(j,1);
            //         j--;
            //       }
            //     }
            //   }
            // }
            this.searchData = list;
            this.loadingIcon = false;
          }        
        }
      )
    },

    //加载更多{{$t('view.link')}}
    contactLoadingMore(num){
      let that = this;
      let keyWord = this.keyWord;
      this.loadingIcon = true;
      let pageSize = 10;
      if(keyWord) {//点击分页渲染的是有查询结果的下一页
        this.searchLoadingMore();
      }else {//点击分页渲染的是无查询结果的下一页
        API.ContactPage(
          num,
          pageSize,
          {
            onSucess: response => {
              // this.linkman = this.linkman.concat(response.data.data.datas);
              let list = response.data.data.datas;
              // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
              //   for(let i=0; i<that.selectedUsers.length; i++) {
              //     for(let j=0; j<list.length; j++) {
              //       if(that.selectedUsers[i] == list[j].id) {
              //         list.splice(j,1);
              //         j--;
              //       }
              //     }
              //   }
              // }
              this.linkman = list;
              this.loadingIcon = false;
            }
          }
        );
      }
    },

    //加载更多在线用户
    onlinesLoadingMore(){
      console.log(111);
      this.loadingIcon = true;
      let pageSize = 10;
      API.getOnlines(
        this.onlinesPage++, 
        pageSize,
        {
          onSucess: response => {
            this.onlinesUser = this.onlinesUser.concat(response.data.data.datas);
            this.loadingIcon = false;
          }
        }
      );
    },

    //加载更多部门
    deptLoadingMore(num){
      let that = this;
      let keyWord = this.keyWord;
      this.loadingIcon = true;
      let pageSize = 10;
      if(keyWord) {//点击分页渲染的是有查询结果的下一页
        this.searchLoadingMore()
      }else {//点击分页渲染的是没有查询结果的下一页
        let appId = this.$root.appid;
        let departId = this.departId;
        API.departmentPage(
          appId,
          departId,
          num,
          pageSize,
          {
            onSucess: response => {
              let list = response.data.data.datas;
              // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
              //   for(let i=0; i<that.selectedUsers.length; i++) {
              //     for(let j=0; j<list.length; j++) {
              //       if(that.selectedUsers[i] == list[j].id) {
              //         list.splice(j,1);
              //         j--;
              //       }
              //     }
              //   }
              // }
              this.deptUser = list;
              // this.deptUser = this.deptUser.concat(response.data.data.datas);
              this.loadingIcon = false;
            }
          }
        );
      }
    },

    //加载更多角色
    rolesLoadingMore(num){
      let keyWord = this.keyWord
      let that = this;
      this.loadingIcon = true;
      let appId = this.$root.appid;//this.$parent.$parent.getAppId();
      let roles = this.roleId;
      let pageSize = 10;
      let type = 0;
      if(keyWord) {//点击分页渲染的是有查询结果的下一页
        this.searchLoadingMore();
      }else {//点击分页渲染的是无查询结果的下一页
        API.getRoles(
          appId,
          roles,
          type,
          pageSize,
          num,
          {
            onSucess: response => {
              let list = response.data.data.datas;
              // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
              //   for(let i=0; i<that.selectedUsers.length; i++) {
              //     for(let j=0; j<list.length; j++) {
              //       if(that.selectedUsers[i] == list[j].id) {
              //         list.splice(j,1);
              //         j--;
              //       }
              //     }
              //   }
              // }
              that.rolesData = list;
              //this.rolesData = this.rolesData.concat(response.data.data.datas);
              this.loadingIcon = false;
            }
          }
        );
      }
    },

    //点击部门树节点触发
    handleNodeClick(e){
      this.keyWord = ''
      this.currentDeptName = e.name;
      this.searchData = [];
      let that = this;
      this.departId = e.id;
      let deptId = e.id;
      let appId = this.$root.appid;
      API.getDeptUser(
        appId, 
        deptId,
        {
          onSucess: response => {
            let list = response.data.data.datas;
            // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
            //   for(let i=0; i<that.selectedUsers.length; i++) {
            //     for(let j=0; j<list.length; j++) {
            //       if(that.selectedUsers[i] == list[j].id) {
            //         list.splice(j,1);
            //         j--;
            //       }
            //     }
            //   }
            // }
            this.row_count = response.data.data.rowCount;
            this.deptUser = list;
            if(list.length <= 0) {
              this.isclickEmpty = true;
            }
            this.title = e.name;
            this.deptCount = response.data.data.rowCount;
          }
        }
      );
    },

    //部门树
    loadNode(node, resolve) {
      let that = this;
      let appid = this.$root.appid;
      if (node.level === 0) {
        API.getDepartmentsByParentId(appid, "", {
          onSucess: function(response) {
            that.defaultExpandedKeys.push(response.data.data[0].id);
            resolve(response.data.data);
          }
        });
      } else {
        API.getDepartmentsByParentId(appid, node.key, {
          onSucess: function(response) {
            resolve(response.data.data);
          }
        });
      }
    },

    //标签页分类
    handleClick(tab){
      this.isclickEmpty = false;
      this.currentPage = 1;
      this.row_count = 0;
      if(tab.name == "second") {
        this.tabName = "second";
        this.searchData = [];
        //按部门
      }else if(tab.name == "third") {
        this.searchData = [];
        this.onlinesPage = 2;
        this.tabName = "third";
        let pageNum = 1;
        let pageSize = 10;
        //在线用户
        API.getOnlines(
          pageNum, 
          pageSize,
          {
            onSucess: response => {
              this.onlinesUser = response.data.data.datas
              this.onlinesUserCount = response.data.data.rowCount;
              this.onlinesPageCount = response.data.data.pageCount;
            }
          }
        );
      }else if(tab.name == "fourth") {
        //通讯录
        this.searchData = [];
        this.tabName = "fourth";
      }else if(tab.name == "fifth"){
        this.searchData = [];
        this.tabName = "fifth";
        this.recentUsers =  JSON.parse(localStorage.getItem("localRecentUsers") || '[]');
        //let keyWord = "";
        //查询
        // let pageNum = 1, 
        // pageSize = 10;
        // API.getSearch(
        //   keyWord,
        //   pageNum,
        //   pageSize,
        //   {
        //     onSucess: response => {
        //       let list = response.data.data.datas;
        //       if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
        //         for(let i=0; i<that.selectedUsers.length; i++) {
        //           for(let j=0; j<list.length; j++) {
        //             if(that.selectedUsers[i] == list[j].id) {
        //               list.splice(j,1);
        //               j--;
        //             }
        //           }
        //         }
        //       }
        //       this.row_count = response.data.data.rowCount;
        //       this.searchData = list;
        //       this.searchCount = response.data.data.rowCount;
        //     }
        //   }
        // );
      }else {
        this.searchData = [];
        this.tabName = "first";
      }
    },
    //通讯录{{$t('view.link')}}
    contact() {
      this.keyWord = '';
      this.searchData = [];
      let that = this;
      let contactsId = "all";
      API.getContact(
        contactsId,
        {
          onSucess: response => {
            let list = response.data.data.datas;
            // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
            //   for(let i=0; i<that.selectedUsers.length; i++) {
            //     for(let j=0; j<list.length; j++) {
            //       if(that.selectedUsers[i] == list[j].id) {
            //         list.splice(j,1);
            //         j--;
            //       }
            //     }
            //   }
            // }
            this.row_count = response.data.data.rowCount;
            this.linkman = list;
            if(list.length <= 0) {
              this.isclickEmpty = true;
            }
            this.contactCount = response.data.data.rowCount;
          }
        }
      );
    },

    //删除选中的角色
    onTabClose(dept) {
      let field = this.field;
      if(field.data.length == 1){
        field.value = "";
        field.data = [];
        this.begin = false;
        if(field.refreshOnChanged) {
          this.onChange();
        }
      }else {
        let deptData = field.data;

        for(let i=0; i<deptData.length; i++) {
          if(dept.id == deptData[i].id) {
            deptData.splice(i, 1);
            i--;
          }
        }

        let id = "";
        if(deptData && deptData.length > 0) {
          for(let i=0; i<deptData.length; i++) {
            id += deptData[i].id + ";";
          }
          id = id.replace(/^(\s|;)+|(\s|;)+$/g, '');
          field.value = id;
        }else {
          field.value = '';
        }
        this.begin = false;
        if(field.refreshOnChanged) {
          this.onChange();
        }
      }
      if(field.instantValidate) {
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

    //选中的角色显示在文本框中
    onOk(){
      if(this.selectedUsers.length && this.selectedUsers.length > 0) {
        let list = this.selectedUsersList;
        let val = "";
        let id = "";
        for(let i=0; i<list.length; i++) {
          id += list[i].id + ";";
          val += list[i].name + ";"; 
        }
        this.field.data = JSON.parse(JSON.stringify(list));
        id = id.replace(/^(\s|;)+|(\s|;)+$/g, '');
        this.field.value = id;
        this.field.userName = val;
        this.dialogVisible = false;
        if (this.field.refreshOnChanged){//判断是否需要刷新
          this.onChange();
        }

        //以下都是最近用户缓存
        let selectList = JSON.parse(JSON.stringify(this.selectedUsersList));
        let recentUsers = JSON.parse(localStorage.getItem("localRecentUsers") || '[]');
        let tempArray1 = [];//临时数组1
        let tempArray2 = [];//临时数组2
        if(recentUsers.length > 0) {
          for(let i=0; i<recentUsers.length; i++){
            tempArray1[recentUsers[i].id] = true;
          }
        }
        for(let i=0; i<selectList.length; i++){
          if(tempArray1[selectList[i].id]){
            selectList.splice(i, 1);
            i--;
          }
        }
        let allLocalRecentUsers = selectList.concat(recentUsers);
        localStorage.setItem('localRecentUsers',JSON.stringify(allLocalRecentUsers)); //缓存最近的用户
      }else {
        this.field.data = [];
        this.field.value = '';
        this.dialogVisible = false;
      }
      if(this.field.instantValidate) {
        this.evenCheck();
      }
    },

    //去除重复数据
    removeDuplicateData(currentData) {
      let uniques = [];
      let stringify = {};
      for (let i = 0; i < currentData.length; i++) {
          let keys = Object.keys(currentData[i]);
          keys.sort(function(a, b) {
              return (Number(a) - Number(b));
          });
          let str = '';
          for (let j = 0; j < keys.length; j++) {
              str += JSON.stringify(keys[j]);
              str += JSON.stringify(currentData[i][keys[j]]);
          }
          if (!stringify.hasOwnProperty(str)) {
              uniques.push(currentData[i]);
              stringify[str] = true;
          }
      }
      uniques = uniques;
      return uniques;
    },

    //角色分类加载
    rolesList(id, name) {
      this.keyWord = '';
      this.currentRoleName = name;
      this.searchData = [];
      this.roleCurrentId = id; 
      this.roleId = id;
      let that = this;
      let appId = this.$root.appid; //this.$parent.$parent.getAppId();
      let type = 0;
      this.$api.getRoles(
        appId, 
        id, 
        type,
        10, 
        1,
        {
          onSucess: response => {
            let list = response.data.data.datas;
            // if(that.selectedUsers && that.selectedUsers.length>0 && list && list.length>0) {
            //   for(let i=0; i<that.selectedUsers.length; i++) {
            //     for(let j=0; j<list.length; j++) {
            //       if(that.selectedUsers[i] == list[j].id) {
            //         list.splice(j,1);
            //         j--;
            //       }
            //     }
            //   }
            // }
            that.row_count = response.data.data.rowCount;
            that.rolesData = list;
            if(list.length <= 0) {
              this.isclickEmpty = true;
            }
            that.rowCount = response.data.data.rowCount;  
          }
        }
      )
    },

    //弹窗并显示角色列表
    eject(both){
      if(this.field.data && this.field.data.length>0) {
        this.selectedUsersList = [];
        this.selectedUsers = [];
        for(let i=0; i<this.field.data.length; i++) {
          this.selectedUsersList.push(this.field.data[i]);
          this.selectedUsers.push(this.field.data[i].id);
        }
      }
      this.singleOrDouble = both;
      let that = this;
      let appId = this.$root.appid;// this.$parent.$parent.getAppId();
      let type = 0;
      //角色的接口
      this.$api.getAllRoles(
        appId,
        type,
        {
          onSucess: res => {
            that.allRoles = res.data.data.datas;
            that.dialogVisible = true;
          }
        }
      )
    },

    handleClose(done) {
      done();
    },
    //判断是否要刷新
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
  
  .el-pagination {
    padding: 2px 5px;
    color: #303133;
    font-weight: 700;
    display: flex;
    flex-flow: row wrap;
  }
  .onlines {
    width:100%;
    min-height:320px;
    display: -webkit-flex;
    display: flex;
  }
  .search {
    width:100%;
    height:310px;
    display: -webkit-flex;
    display: flex;
  }
  .search-page {
    width:210px;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    text-align: center;
  }
</style>
