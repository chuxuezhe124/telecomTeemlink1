<template>
  <div class="approver-wrap">
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
                  </el-tree>
                </div>
              </el-scrollbar>
            </div>
            <!--中-->
            <div class="role-page">
              <div class="user-list"> 
                <div class="add-all-data" v-if="!isUpcoming && !isFreeFlow && !approverNumType == 1">
                  <span @click="addAllPage('DEPT')">{{$t('view.add_all')}}</span>
                </div>
                <div class="current-role" v-if="currentDeptName && !isclickEmpty">
                  {{$t('view.dept')}}：{{currentDeptName}}
                </div>
				        <div class="current-role" v-else>
                  {{$t('view.default_user')}}
                </div>
                <el-scrollbar class="scrollbar">
                  <div class="list-box">
                    <!--单选-->
                    <el-radio-group v-model="selectedUserFree" v-if="(isFreeFlow || isUpcoming || approverNumType == 1) && (searchData.length>0 || deptUser.length>0)">
                      <el-radio 
                        style="display:block;"
                        v-for="user in (searchData && searchData.length>0?searchData:deptUser)" 
                        :label="user.id" 
                        :key="user.id"
                        @change="handleRadioChange($event, user, user.id)"
                        :title="user.name + ' ' + user.dept"
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
                        v-for="user in (searchData && searchData.length>0?searchData:deptUser)" 
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
                  <div class="no-data" :style="{display:!isclickEmpty?'none':'block'}" v-if="searchData.length<=0 && deptUser.length<=0">
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
            <div class="selected-role" v-if="isSubFlow">
              <div class="add-all-data">
                <div>
                  {{$t('view.has_select')}}:
                </div>
                <div>
                  <span class="flow" v-if="groupNum > 0" @click="addSubflow">+{{$t('view.b_flow')}}</span>
                  <span v-if="groupNum != -2" @click="closeAll">{{$t('btns.remove')}}</span>
                  <span v-if="groupNum == -2" @click="closeAll">{{$t('btns.remove')}}{{$t('form.all')}}</span>
                </div>
              </div>
              <el-scrollbar class="scrollbar">
                <div class="tag-lists" v-if="groupNum != -2">
                  <div class="list-wrap" id="parent">
                    <div 
                      class="list" 
                      v-for="(items,index) in currentGroup" 
                      :key="index"
                    >
                      <div 
                        class="flow" 
                        @click="setCurrentGroupIndex(index)" 
                        :class="{active:currentGroupIndex==index?true:''}"
                      >
                        <div class="name">{{$t('view.di')}}&nbsp;{{index+1}}&nbsp;{{$t('view.group')}}</div>
                        <div class="flow-right">
                          <div class="add-icon" @click.stop.prevent="deleteSubflow(index)">
                            <i class="el-icon-close"></i>
                          </div>
                        </div>
                      </div>
                      <div 
                        class="users" 
                        v-for="(item, i) in items.row" 
                        :key="i"
                      >
                        <div class="user-left">
                          <div class="user-name">
                            {{item.name}}
                          </div>
                        </div>
                        <div class="del-icon" @click="deleteUser(item.id, items, index)">
                          <i class="fa fa-times-circle"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group-num" v-if="groupNum == -2">
                  <div class="tag-list">
                    <el-scrollbar class="scrollbar-tag">
                      <el-tag
                        class="tag"
                        v-for="(user,i) in selectedUsersList"
                        :key="user.name"
                        @close="closableTag(user.id,i)"
                        closable
                        :title="user.name + ' ' + user.dept">
                        {{user.name}}
                      </el-tag>
                    </el-scrollbar>
                  </div>
                  <div class="tip">
                    <span style="color: red;">#</span>
                    {{$t('view.only_flow')}}
                    <span style="color: red;">#</span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <!--寻常流程-->
            <div class="selected-role" v-else>
              <div class="add-all-data">
                <div>
                  {{$t('view.has_selectuser')}}：
                  <sup class="labelNum">{{selectedUsers.length}}</sup>
                </div>
                <div>
                  <span @click="closeAll">{{$t('btns.remove')}}</span>
                </div>
              </div>
              <el-scrollbar class="scrollbar">
                <div class="tag-lists">
                  <el-tag
                    class="tag"
                    v-for="(user,i) in selectedUsersList"
                    :key="user.name"
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
                    :title="item.name"
                    :key="item.id" 
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
                <div class="add-all-data" v-if="!isUpcoming && !isFreeFlow && approverNumType != 1" >
                  <!-- <el-button plain size="small" @click="addAllPage('ROLE')">{{$t('view.add_all')}}</el-button> -->
                  <span @click="addAllPage('ROLE')">{{$t('view.add_all')}}</span>
                </div>
                <div class="current-role" v-if="!isclickEmpty && !isFreeFlow">
                  {{$t('view.role')}}：{{currentRoleName}}
                </div>
                <el-scrollbar class="scrollbar">
                  <div class="list-box">
                    <el-radio-group v-model="selectedUserFree" v-if="(isFreeFlow || isUpcoming || approverNumType == 1) && (searchData.length>0 || rolesData.length>0)">
                      <el-radio 
                        style="display:block;"
                        v-for="user in (searchData && searchData.length>0?searchData:rolesData)" 
                        :label="user.id" 
                        :key="user.id"
                        @change="handleRadioChange($event, user, user.id)"
                        :title="user.name + ' ' + user.dept"
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
                  <div class="no-data" :style="{display:!isclickEmpty?'none':'block'}" v-if="searchData.length<=0 && rolesData.length<=0">
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
            <!--主子流程，子流程{{$t('view.b_flow')}}-->
            <div class="selected-role" v-if="isSubFlow">
              <div class="add-all-data">
                <div>
                  {{$t('view.has_select')}}:
                </div>
                <div>
                  <span class="flow" v-if="groupNum>0" @click="addSubflow">+{{$t('view.b_flow')}}</span>
                  <span v-else @click="closeAll">{{$t('btns.remove')}}</span>
                </div>
              </div>
              <el-scrollbar class="scrollbar">
                <div class="tag-lists" v-if="groupNum != -2">
                  <div class="list-wrap" id="parent">
                    <div 
                      class="list" 
                      v-for="(items,index) in currentGroup" 
                      :key="index"
                    >
                      <div 
                        class="flow" 
                        @click="setCurrentGroupIndex(index)" 
                        :class="{active:currentGroupIndex==index?true:''}"
                      >
                        <div class="name">{{$t('view.di')}}&nbsp;{{index+1}}&nbsp;{{$t('view.group')}}</div>
                        <div class="flow-right">
                          <div class="add-icon" @click.stop.prevent="deleteSubflow(index)">
                            <i class="el-icon-close"></i>
                          </div>
                        </div>
                      </div>
                      <div 
                        class="users" 
                        v-for="(item, i) in items.row" 
                        :key="i"
                      >
                        <div class="user-left">
                          <div class="user-name">
                            {{item.name}}
                          </div>
                        </div>
                        <div class="del-icon" @click="deleteUser(item.id, items, index)">
                          <i class="fa fa-times-circle"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group-num" v-if="groupNum == -2">
                  <div class="tag-list">
                    <el-scrollbar class="scrollbar-tag">
                      <el-tag
                        class="tag"
                        v-for="(user,i) in selectedUsersList"
                        :key="user.name"
                        @close="closableTag(user.id,i)"
                        closable
                        :title="user.name + ' ' + user.dept">
                        {{user.name}}
                      </el-tag>
                    </el-scrollbar>
                  </div>
                  <div class="tip">
                    <span style="color: red;">#</span>
                    {{$t('view.only_flow')}}
                    <span style="color: red;">#</span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <!--寻常流程-->
            <div class="selected-role" v-else>
              <div class="add-all-data">
                <div>
                  {{$t('view.has_selectuser')}}：
                  <sup class="labelNum">{{selectedUsers.length}}</sup>
                </div>
                <div>
                  <!-- <el-button type="danger" size="mini" @click="closeAll">{{$t('btns.remove')}}{{$t('form.all')}}</el-button> -->
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
                <div class="add-all-data" v-if="!isUpcoming && !isFreeFlow">
                  <span @click="addAllPage('ADDRESSBOOK')">{{$t('view.add_all')}}</span>
                </div>
                <div class="current-role">
                  {{$t('view.role')}}：{{$t('view.link')}}
                </div>
                <el-scrollbar class="scrollbar">
                  <div class="list-box">
                    <!--单选-->
                    <el-radio-group v-model="selectedUserFree" v-if="(isFreeFlow || isUpcoming || approverNumType == 1) && (searchData.length>0 || linkman.length>0)">
                      <el-radio 
                        style="display:block;"
                        v-for="user in (searchData && searchData.length>0?searchData:linkman)" 
                        :label="user.id" 
                        :key="user.id"
                        @change="handleRadioChange($event, user, user.id)"
                        :title="user.name + ' ' + user.dept"
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
                        v-for="user in (searchData && searchData.length>0?searchData:linkman)" 
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
                  <div class="no-data" :style="{display:!isclickEmpty?'none':'block'}" v-if="searchData.length<=0 && linkman.length<=0">
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
            <!--主子流程，子流程{{$t('view.b_flow')}}-->
            <div class="selected-role" v-if="isSubFlow">
              <div class="add-all-data">
                <div>
                  {{$t('view.has_select')}}:
                </div>
                <div>
                  <span v-if="groupNum>0" @click="addSubflow">+{{$t('view.b_flow')}}</span>
                  <span v-else @click="closeAll">{{$t('btns.remove')}}</span>
                </div>
              </div>
              <div class="tag-lists" v-if="groupNum != -2">
                <div class="list-wrap" id="parent">
                  <div 
                    class="list" 
                    v-for="(items,index) in currentGroup" 
                    :key="index"
                  >
                    <div 
                      class="flow" 
                      @click="setCurrentGroupIndex(index)" 
                      :class="{active:currentGroupIndex==index?true:''}"
                    >
                      <div class="name">{{$t('view.di')}}&nbsp;{{index+1}}&nbsp;{{$t('view.group')}}</div>
                      <div class="flow-right">
                        <div class="add-icon" @click.stop.prevent="deleteSubflow(index)">
                          <i class="el-icon-close"></i>
                        </div>
                      </div>
                    </div>
                    <div 
                      class="users" 
                      v-for="(item, i) in items.row" 
                      :key="i"
                    >
                      <div class="user-left">
                        <div class="user-name">
                          {{item.name}}
                        </div>
                      </div>
                      <div class="del-icon" @click="deleteUser(item.id, items, index)">
                        <i class="fa fa-times-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="group-num" v-if="groupNum == -2">
                <div class="tag-list">
                  <el-scrollbar class="scrollbar-tag">
                    <el-tag
                      class="tag"
                      v-for="(user,i) in selectedUsersList"
                      :key="user.name"
                      @close="closableTag(user.id,i)"
                      closable
                      :title="user.name + ' ' + user.dept">
                      {{user.name}}
                    </el-tag>
                  </el-scrollbar>
                </div>
                <div class="tip">
                  <span style="color: red;">#</span>
                  {{$t('view.only_flow')}}
                  <span style="color: red;">#</span>
                </div>
              </div>
            </div>

            <!--寻常流程-->
            <div class="selected-role"  v-else>
              <div class="add-all-data">
                <div>
                  {{$t('view.has_selectuser')}}：
                  <sup class="labelNum">{{selectedUsers.length}}</sup>
                </div>
                <div>
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
                    <el-radio-group v-model="selectedUserFree" v-if="isFreeFlow || isUpcoming || approverNumType == 1">
                      <el-radio 
                        style="display:block;"
                        v-for="user in (searchData && searchData.length>0?searchData:recentUsers)" 
                        :label="user.id" 
                        :key="user.id"
                        @change="handleRadioChange($event, user, user.id)"
                        :title="user.name + ' ' + user.dept"
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
                  <!-- <el-button type="danger" size="small" @click="closeAll">{{$t('btns.remove')}}{{$t('form.all')}}</el-button> -->
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
    <span  class="dialog-footer">
      <el-button type="primary" @click="onOk" size="medium">{{$t('btns.sure')}}</el-button>
    </span>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  props: [
    "act",
    "openParams", 
    "buildFormData", 
    "approversObj", 
    "flowId", 
    "isFreeFlow",
    "saveApproverStatus",
    "submitTo",
    "approverNumType",
    "isAppentCirculator",
    "subflowData",
    "subFlowToApprover",
    "groupNum",
    "isSubFlow",
    "isUpcoming", //首页我的待办
    "isProxys", //判断是否是首页个人设置代理设置
    "allowEditApprover",
    "approvers",
    "isSendMail",
    "processHostingList",
  ],
  data: function() {
    return {
      currentPage:1,
      row_count:0,
      begin:true,
      roleCurrentId:'',
      allRoles:'',//{{$t('form.all')}}角色
      selectedUsers:[],//选中的角色id(复选)
      selectedUserFree: '', //选中的角色id(单选自由流程)
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

      title:" ",
      tabName:'first',

      rowCount:0,
      roleId:'',
      contactCount:0,
      departId:'',
      searchCount:0,
      onlinesUserCount:0,
      loadingIcon:false,

      onlinesPage:2,
      onlinesPageCount:'',

      contactPage:2,
      contactPageCount:'',

      searchPage:2,
      searchPageCount:'',

      searchValue:'',

      currentGroup:[], //子流程{{$t('view.group')}}
      groupNumber:'', //子流程{{$t('view.group')}}数量
      currentGroupIndex:-1,
      currentRoleName:'',
      currentDeptName:'',
      defaultExpandedKeys: [],
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
      isSearchOperation: false, //判断是否是查询操作
      isDefaultApprover: false, //默认显示指定角色的{{$t('form.all')}}用户
      defaultApprovers: [],
      defaultApproversCount: '',
      isclickEmpty: false,
      isCarbonCopyPage: false, //当前是抄送分页
    }
  },
  created() {
    if(this.approversObj && this.approversObj.nodeid) { //如果时候指定流程审批人，或指定抄送审批人时，隐藏通讯录
      let tabTitleList = this.tabTitleList;
      tabTitleList.splice(2,1);
      if(this.isSubFlow) {
        tabTitleList.splice(2,1);
      }
    }
  },
  mounted() {
    this.getData();
    if(this.isSubFlow) {
      this.listView();
    }
  },
  methods: {
    closeAll() {
      this.selectedUsers = [];
      this.selectedUsersList = [];
      this.selectedUserFree = '';
      if(this.currentGroup && this.groupNum !=2) {
        this.currentGroup[0].row = [];
      }
    },

    closableTag(id, index){
      this.selectedUsersList.splice(index, 1);
      this.selectedUserFree = '';
      for(let i = 0; i<this.selectedUsers.length; i++) {
        if(this.selectedUsers[i] == id) {
          this.selectedUsers.splice(i, 1);
          break;
        }
      }
    },

    addAllPage(val) {
      let arr = JSON.parse(JSON.stringify(this.selectedUsers));
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
      if(this.isSubFlow) { //如果有子流程
      
        if(this.currentGroup && this.currentGroup.length>0) {
          for(let i=0; i<this.currentGroup.length; i++) {
            if(i == this.currentGroupIndex) {
              let selectedUsersList = this.selectedUsersList;
              let searchData = this.searchData;
              if(selectedUsersList && selectedUsersList.length > 0){
                this.currentGroup[i].row = JSON.parse(JSON.stringify(selectedUsersList));
              }else if (searchData && searchData.length>0) {
                this.currentGroup[i].row = JSON.parse(JSON.stringify(searchData));
                let arr = JSON.parse(JSON.stringify(this.selectedUsers));
                if(this.selectedUsers && this.selectedUsers.length>0) {
                  searchDatar.forEach(item => {
                    if(arr.indexOf(item.id) < 0) {
                      this.selectedUsersList.push(item);
                      this.selectedUsers.push(item.id);
                    }
                  });
                }else {
                  searchData.forEach(item => {
                    this.selectedUsersList.push(item);
                    this.selectedUsers.push(item.id);
                  });
                }
              }
              
            }
          }
        }
      }
    },

    handleRadioChange(ev, value, id) {
      let arr = [];
      let selectedId = [];
      arr.push(value);
      this.selectedUsersList = arr;
      selectedId.push(id);
      this.selectedUsers = selectedId;

    },

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
      if(this.isSubFlow) { //如果有子流程
        if(this.currentGroup && this.currentGroup.length>0) {
          for(let i=0; i<this.currentGroup.length; i++) {
            if(i == this.currentGroupIndex) {
              this.currentGroup[i].row = JSON.parse(JSON.stringify(this.selectedUsersList));
            }
          }
        }
      }
    },
   
    //查询用户
    handleIconSearch(value){
      this.currentPage = 1;
      this.selectData = [];
      this.$forceUpdate();
      if(this.approversObj && this.approversObj.nodeid) {
        let docId = this.buildFormData.id, 
          flowId = this.flowId, 
          nodeId = this.approversObj.nodeid, 
          type = 3, 
          selectId = value, 
          pageNum = 1, 
          pageSize = 10,
          appId = this.openParams.appId;
          if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
            this.isSearchOperation = true;
            this.isCarbonCopyPage = true;
            let currentNodeId = nodeId,
                defaultType = 3;
            this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
          }else {
            this.$api.getSelectApprovers(
              appId, 
              docId, 
              flowId, 
              nodeId, 
              type, 
              selectId, 
              pageNum, 
              pageSize,
              {
                onSucess: res => {
                  this.rolesData = [];
                  this.deptUser = [];
                  this.searchData = res.data.data.datas;
                  this.searchCount =  res.data.data.rowCount
                  this.row_count = res.data.data.rowCount;
                  if(res.data.data.rowCount === 0) {
                    this.isclickEmpty = true;
                  }
                }
              }
            )
          }
      }else {
        this.isSearchOperation = true;
        let pageNum = 1, 
            pageSize = 10;
          this.$api.getSearch(value, pageNum, pageSize, {
            onSucess: res => {
              if(res.data.data.msg) {
                this.rolesData = [];
                this.deptUser = [];
                this.linkman = [];
                this.searchData = [];
                this.searchCount = 0;
                this.row_count = 0;
                this.isclickEmpty = true;
              }else {
                this.rolesData = [];
                this.deptUser = [];
                this.linkman = [];
                this.searchData = res.data.data.datas;
                this.searchCount =  res.data.data.rowCount;
                this.row_count = res.data.data.rowCount;
              }
            }
          })
      }
    },

    //加载更多{{$t('view.link')}}
    contactLoadingMore(num){
      this.loadingIcon = true;
      let pageSize = 10;
      if(this.isSearchOperation){ //判断是查询时使用这个方法
        this.$api.getSearch(this.searchValue, num, 10, {
          onSucess: res => {
            this.searchData = res.data.data.datas;
            this.searchCount =  res.data.data.rowCount
            this.row_count = res.data.data.rowCount;
          }
        })
      }else {
        API.ContactPage(
          num,
          pageSize,
          {
            onSucess: response => {
              this.linkman = response.data.data.datas;
              this.loadingIcon = false;
            }
          }
        );
      }
      
    },

    //点击部门树节点触发
    handleNodeClick(e){
      this.currentPage = 1;
      this.isSearchOperation = false;
      this.searchData = [];
      this.departId = e.id;
      let deptId = e.id;
      this.currentDeptName = e.name;
      let openParams = this.openParams;
      let appId = openParams ? openParams.appId : this.$root.appid;
      let approversObj = this.approversObj;
      if(approversObj && approversObj.nodeid) {
        this.isDefaultApprover = false; //如果有默认指定审批人，点击树后，显示树的数据
        let docId = this.buildFormData.id, 
          flowId = this.flowId, 
          nodeId = approversObj.nodeid, 
          type = 1, 
          selectId = e.id, 
          pageNum = 1, 
          pageSize = 10;
          if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
            this.isCarbonCopyPage = true;
            let currentNodeId = nodeId,
                defaultType = 1;
            this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
          }else {
            this.$api.getSelectApprovers(
              appId, 
              docId, 
              flowId, 
              nodeId, 
              type, 
              selectId, 
              pageNum, 
              pageSize,
              {
                onSucess: res => {
                  this.row_count = res.data.data.rowCount;
                  this.title = e.name;
                  let list = res.data.data.datas;
                  this.deptUser = list;
                  if(list.length <= 0) {
                    this.isclickEmpty = true;
                  }
                }
              }
            )
          }
      }else {
        this.$api.getDeptUser(
          appId, 
          deptId,
          {
            onSucess: res => {
              this.row_count = res.data.data.rowCount;
              this.title = e.name;
              let list = res.data.data.datas;
              this.deptUser = list;
              if(list.length <= 0) {
                this.isclickEmpty = true;
              }
            }
          }
        );
      } 
    },

    //加载更多部门
    deptLoadingMore(ev){
      let appId = this.openParams?this.openParams.appId:this.$root.appid;
      let pageSize = 10;
      let departId = this.departId;
      let approversObj = this.approversObj;
      if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
         let docId = this.buildFormData.id, 
            flowId = this.flowId, 
            nodeId = approversObj.nodeid, 
            selectId = departId, 
            pageNum = ev, 
            pageSize = 10;
        let defaultType = '';
        if(this.isCarbonCopyPage){
          defaultType = 1;
        }else {
          defaultType = 0;
        }
        if(this.isSearchOperation) { //搜索时
          defaultType = 3;
          selectId = this.searchValue;
        }
        let currentNodeId = nodeId;
        this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
        return;
      }
      if(this.isDefaultApprover) { //当前数据是默认指定审批人
        let buildFormData = this.buildFormData;
        let docId = buildFormData?buildFormData.id:''; //凡是表单进来的，打开弹出框拿到docId
        let flowId = this.flowId;
        let currentNodeId = approversObj.nodeid;
        let selectId = '', 
          pageSize = 10,
          defaultType = 0;
        this.getDefault({appId, docId, flowId, currentNodeId, defaultType, selectId, ev, pageSize,});
      }else {
        if(approversObj && approversObj.nodeid) {
          let docId = this.buildFormData.id, 
            flowId = this.flowId, 
            nodeId = approversObj.nodeid, 
            type = 1, 
            selectId = departId, 
            pageNum = ev, 
            pageSize = 10;
          this.$api.getSelectApprovers(
            appId, 
            docId, 
            flowId, 
            nodeId, 
            type, 
            selectId, 
            pageNum, 
            pageSize,
            {
              onSucess: res => {
                this.deptUser = res.data.data.datas;
                this.row_count = res.data.data.rowCount
              }
            }
          )
        }else if(this.isSearchOperation){ //判断是查询时使用这个方法
          this.$api.getSearch(this.searchValue, ev, 10, {
            onSucess: res => {
              this.searchData = res.data.data.datas;
              this.searchCount =  res.data.data.rowCount
              this.row_count = res.data.data.rowCount;
            }
          })
        }else {
          this.$api.departmentPage(
            appId,
            departId,
            ev,
            pageSize,
            {
              onSucess: response => {
                this.deptUser = response.data.data.datas;
                this.row_count = response.data.data.rowCount;
              }
            }
          );
        } 
      }
    },

    //部门树
    loadNode(node, resolve) {
      let appid = this.openParams?this.openParams.appId:this.$root.appid;
      let that = this;
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

     //角色分类加载
    rolesList(id, name) {
      this.isDefaultApprover = false;
      this.currentPage = 1;
      this.searchData = [];
      this.isSearchOperation = false;
      this.currentRoleName = name;
      let that = this;
      this.roleCurrentId = id; 
      this.roleId = id;
      let openParams = this.openParams;
      let appId = openParams?openParams.appId:this.$root.appid;
      let approversObj = this.approversObj;
      if(approversObj && approversObj.nodeid) {
        let docId = this.buildFormData.id, 
          flowId = this.flowId, 
          nodeId = this.approversObj.nodeid, 
          type = 2, 
          selectId = id, 
          pageNum = 1, 
          pageSize = 10;
         if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
            this.isCarbonCopyPage = true;
            let currentNodeId = nodeId,
                defaultType = 2;
            this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
          }else {
            this.$api.getSelectApprovers(
              appId, 
              docId, 
              flowId, 
              nodeId, 
              type, 
              selectId, 
              pageNum, 
              pageSize,
              {
                onSucess: res => {
                  that.row_count = res.data.data.rowCount;
                  let list = res.data.data.datas;
                  that.rolesData = list;
                  if(list.length <= 0) {
                    this.isclickEmpty = true;
                  }
                }
              }
            )
          }
      }else {
        let type = 0;
        this.$api.getRoles(
          appId,
          id,
          type,
          10, 
          1, 
          {
            onSucess: res => {
              that.row_count = res.data.data.rowCount;
              let list = res.data.data.datas;
              that.rolesData = list;
              if(list.length <= 0) {
                this.isclickEmpty = true;
              }
            }
          }
        )
      }
    },

    //加载更多角色
    rolesLoadingMore(ev){
      let openParams = this.openParams;
      let appId = openParams ? openParams.appId : this.$root.appid;
      let roles = this.roleId;
      let pageSize = 10;
      let approversObj = this.approversObj;
      if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
         let docId = this.buildFormData.id, 
            flowId = this.flowId, 
            nodeId = approversObj.nodeid, 
            selectId = this.roleCurrentId,
            pageNum = ev, 
            pageSize = 10;
        let defaultType = '';
        if(this.isCarbonCopyPage){
          defaultType = 2;
        }else {
          defaultType = 0;
        }
        if(this.isSearchOperation) { //搜索时
          defaultType = 3;
          selectId = this.searchValue;
        }
        let currentNodeId = nodeId;
        this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
        return;
      }
      if(this.isDefaultApprover) { 
        let approversObj = this.approversObj;
        let buildFormData = this.buildFormData;
        let docId = buildFormData ? buildFormData.id : ''; //凡是表单进来的，打开弹出框拿到docId
        let flowId = this.flowId;
        let currentNodeId = approversObj.nodeid;
        let selectId = '', 
          pageSize = 10,
          defaultType = 0;
        this.getDefault({appId, docId, flowId, currentNodeId, defaultType, selectId, ev, pageSize,});
      }else {
        if(approversObj && approversObj.nodeid) {
          let docId = this.buildFormData.id, 
            flowId = this.flowId, 
            nodeId = approversObj.nodeid, 
            type = 2, 
            selectId = this.roleCurrentId, 
            pageNum = ev;
          if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
            let currentNodeId = nodeId,
                defaultType = 0;
            this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId, pageNum, pageSize});
          }else {
            this.$api.getSelectApprovers(
              appId, 
              docId, 
              flowId, 
              nodeId, 
              type, 
              selectId, 
              pageNum, 
              pageSize,
              {
                onSucess: res => {
                  this.rolesData = res.data.data.datas;
                  this.row_count = res.data.data.rowCount;
                  return ;
                }
              }
            )
          }
        }else if(this.isSearchOperation){ //判断是查询时使用这个方法
          this.$api.getSearch(this.searchValue, ev, 10, {
            onSucess: res => {
              this.searchData = res.data.data.datas;
              this.searchCount =  res.data.data.rowCount
              this.row_count = res.data.data.rowCount;
            }
          })
        }else {
          this.$api.getRoles(
            appId,
            roles,
            0,
            pageSize,
            ev,
            {
              onSucess: response => {
                this.rolesData = response.data.data.datas;
                that.row_count = res.data.data.rowCount;
              }
            }
          );
        } 
      }
    },

    //标签页分类
    handleClick(tab){
      this.isclickEmpty = false;
      if(!this.isDefaultApprover) {
        this.row_count = 0;
        this.currentPage = 1;
      }
      if(tab.name == "second") { //按角色
        this.tabName = "second";
        this.searchData = [];
        this.isCarbonCopyPage = false;
        if(this.defaultApprovers.length > 0) { //如果默认指定审批人打于0
          let data = this.defaultApprovers;
          this.isDefaultApprover = true;
          this.rolesData = data;
          this.row_count = this.defaultApproversCount;
        }else {
          this.rolesData = [];
        }
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
        this.linkman = [];
        this.searchData = [];
        this.tabName = "fourth";
      }else if(tab.name == "fifth"){ //最近
        this.searchData = [];
        this.tabName = "fifth";
        let approversObj = this.approversObj;
        let isApprovers = (approversObj && approversObj.nodeid)?true:false;
        if(isApprovers) {
          let recentUsers = JSON.parse(localStorage.getItem("localRecentlyDesignatedUsers") || '[]');
          // this.recentUsers
          let defaultData = this.defaultApprovers;
          let list = [];
          if(recentUsers.length > 0) {
            for(let i=0; i<recentUsers.length; i++) {
              for(let j=0; j<defaultData.length; j++) {
                if(recentUsers[i].id == defaultData[j].id) {
                  list.push(recentUsers[i]);
                }
              }
            }
            this.recentUsers = list;
          }else {
            this.recentUsers = [];
          }
        }else { 
          this.recentUsers = JSON.parse(localStorage.getItem("localRecentUsers") || '[]');
        }
      }else { //按部门
        this.isCarbonCopyPage = false;
        this.searchData = [];
        if(this.defaultApprovers.length > 0) {
          this.isDefaultApprover = true;
          this.deptUser = this.defaultApprovers;
          this.row_count = this.defaultApproversCount;
        }else {
          this.deptUser = [];
        }
        this.tabName = "first";
      }
    },

    //通讯录{{$t('view.link')}}
    contact() {
      this.currentPage = 1;
      this.isSearchOperation = false;
      this.searchData = [];
      this.contactPage = 2;
      let contactsId = "all";
      API.getContact(
        contactsId,
        {
          onSucess: response => {
            this.row_count = response.data.data.rowCount;
            this.linkman = response.data.data.datas
            this.contactCount = response.data.data.rowCount;
            
          }
        }
      );
    },
    //删除选中的角色
    onTabClose(dept) {
      if(this.field.data.length == 1){
        this.field.value = "";
        this.field.data = [];
        this.begin = false;
        if(this.field.refreshOnChanged) {
          this.onChange();
        }
      }else {
        let deptData = this.field.data;
        for(let i=0; i<deptData.length; i++) {
          if(dept.id == deptData[i].id) {
            deptData.splice(i, 1);
            i--;
          }
        }
        this.begin = false;
        if(this.field.refreshOnChanged) {
          this.onChange();
        }
      }
      
    },

    onOk(){
      let approverId = "";
      let approverName = "";
      let _su = this.selectedUsers;
      let _sul = this.selectedUsersList;
      if(this.isProxys) { //首页个人设置代理设置
        _su.forEach(item => {
          approverId += item + ";";
          for(let i=0; i < _sul.length; i++) {
            if(item == _sul[i].id){
              approverName += _sul[i].name + ";"; 
            }
          }
        });
        this.$emit("action",approverName, approverId, _sul);
      }else if(this.isSendMail) {
        _su.forEach(item => {
          approverId += item + ";";
          for(let i=0; i < _sul.length; i++) {
            if(item == _sul[i].id){
              approverName += _sul[i].name + ";"; 
            }
          }
        });
        this.$emit("action",approverName, approverId);
      }else if (this.isUpcoming) {
        let list = _sul;
        if(list.length <= 0) {
          this.$emit("action",);
        }else {
          approverName = list[0].name;
          let nextUserId = this.selectedUserFree;
          this.$emit("action",approverName, nextUserId);
        }
      }else if (this.allowEditApprover) {
        let obj = {};
        obj.auditorList = _su;
        let appId =  this.openParams?this.openParams.appId:this.$root.appid;
        this.$api.approversWorkflow(
          appId,
          this.buildFormData.id,
          obj,
          {
            onSucess: res => {
              if(res.data.errcode == 0) {
                let isRefresh = true;
                this.$emit("closeApproverDialog",isRefresh)
                this.$notify({
                  title: res.data.data,
                  message: '',
                  type: 'success'
                });
              }
            }
          }
        )
      }else {
        if(this.act.type == 57 || this.act.type == 58) { //加签主办或协办
          let hostOrCohostList = [];
          let selectedUserObj = {};
          this.selectedUsersList.forEach(items => {
            let obj = {};
            for (let key in items) {
              if(key == "id" || key == "name") {
                obj[key] = items[key];
              }
            }
            approverId += items.id + ";";
            selectedUserObj.userids = approverId;
            hostOrCohostList.push(obj);
          });
          selectedUserObj.row = this.selectedUsersList;
          this.$emit("selectHostOrCohost",hostOrCohostList, selectedUserObj); //调用父组件selectHostOrCohost()方法
        }else if (this.isFreeFlow) {  //自由流程
          approverName = _sul[0].name;
          let nextUserId = this.selectedUserFree;
          this.$emit("action",approverName, "", nextUserId)
        }else if (this.isSubFlow) { //子流程
          let groupNum = this.groupNum;
          let groupLength = Object.assign({}, this.approversObj);
          if(groupNum == -2) { 
            let userid = [];
            let approverName = '';
            let cGroup = {
              groupNum: -2,
              isToPerson: true,
              nodeid: this.approversObj.nodeid,
              row: "",
              type: "subflow",
            }
            let cg = this.currentGroup
            if(cg && cg.length > 0) {
              cg[0].row = this.selectedUsersList
            }else {
              cGroup.row = this.selectedUsersList
              cg.push(cGroup)
            }
            // this.currentGroup[0].row = this.selectedUsersList;
            let obj = {};
            obj.position = 1;
            let arrId = [];
            let row = [];
            if(this.selectedUsersList && this.selectedUsersList.length >0 ) {
              let params =this.selectedUsersList;
              for(let j=0; j<params.length; j++) {
                arrId.push(params[j].id)
                approverName += params[j].name + ";";
                row.push(params[j]);
              }
              obj.userids = arrId;
              obj.rows = row;
              userid.push(obj);
            }
            let subObj = {
              approver:userid,
              nodeid: this.approversObj.nodeid,
            }
            let currentGroup = JSON.parse(JSON.stringify(cg))  //[...this.currentGroup]; //this.currentGroup
            this.$emit("event", approverName, subObj, currentGroup, groupNum);
          }else {
            if(this.currentGroup.length < groupLength.groupNum) {
              this.$message({
                message: this.$t('view.group_noteq')+`${groupLength.groupNum}`+this.$t('view.add_del_group'),
                type: 'warning'
              });
            }else {
              let userid = [];
              let approverName = '';
              for(let i = 0; i < this.currentGroup.length; i++) {
                let obj = {};
                obj.position = i+1;
                let arrId = [];
                let row = [];
                if(this.currentGroup[i].row && this.currentGroup[i].row.length >0 ) {
                  let params = this.currentGroup[i].row;
                  for(let j=0; j<params.length; j++) {
                    arrId.push(params[j].id)
                    approverName += params[j].name + ";";
                    row.push(params[j]);
                  }
                  obj.userids = arrId;
                  obj.rows = row;
                  userid.push(obj);
                }else {
                  this.$message({
                    message: this.$t('view.di')+`${i+1}`+this.$t('view.group_botnull'),
                    type: 'warning'
                  });
                  return false;
                }
              }
              let subObj = {
                approver:userid,
                nodeid:this.approversObj.nodeid,
              }
              let currentGroup = [...this.currentGroup];
              this.$emit("event", approverName, subObj, currentGroup, groupNum);
            }
          }
        }else {  //非自由流程
          if(_su && _su.length > 0) {
            let arr = [];
            if (this.approverNumType == 1) {  //单选
              if(_sul.length > 0 ) {
                approverName = _sul[0].name;
                this.approversObj.userids = _sul[0].id;
                this.approversObj.row = _sul;
              }
            } else {  //多选
              this.selectedUsers.forEach(item => {
                approverId += item + ";";
                for(let i=0; i < _sul.length; i++) {
                  if(item == _sul[i].id){
                    approverName += _sul[i].name + ";"; 
                    arr.push(_sul[i]);
                  }
                }
              });
              _sul = arr;
              // approverName = approverName.replace(/^(\s|;)+|(\s|;)+$/g, '');
              // approverId = approverId.replace(/^(\s|;)+|(\s|;)+$/g, '');
              this.approversObj.userids = approverId;
              this.approversObj.row = _sul;
            }
            let isAppentCirculator = this.isAppentCirculator;
            this.$emit("action",approverName, this.approversObj,'', isAppentCirculator); // 调用父组件selectApprover()方法
          }else {
            let _ao = this.approversObj;
            _ao.userids = '';
            _ao.row = [];
            let isAppentCirculator = this.isAppentCirculator?this.isAppentCirculator:'';
            this.$emit("action", '', _ao , '', isAppentCirculator); 
          }
        }
      }

      //以下都是最近用户缓存
      let selectList = JSON.parse(JSON.stringify(this.selectedUsersList));
      let approversObj = this.approversObj;
      let isApprovers = (approversObj && approversObj.nodeid)?true:false;
      let recentUsers = '';
      if(isApprovers) {
        recentUsers = JSON.parse(localStorage.getItem("localRecentlyDesignatedUsers") || '[]');
      }else {
        recentUsers = JSON.parse(localStorage.getItem("localRecentUsers") || '[]');
      }
      let tempArray1 = [];//临时数组1
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
      if(isApprovers) {
        localStorage.setItem('localRecentlyDesignatedUsers',JSON.stringify(allLocalRecentUsers)); //缓存最近的用户
      }else {
        localStorage.setItem('localRecentUsers',JSON.stringify(allLocalRecentUsers)); //缓存最近的用户
      }
      // localStorage.removeItem("localRecentUsers");
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

    getData() {
      let openParams = this.openParams;
      let buildFormData = this.buildFormData;
      let that = this;
      let appId = openParams?openParams.appId:this.$root.appid;
      let docId = buildFormData?buildFormData.id:''; //凡是表单进来的，打开弹出框拿到docId
      let flowId = this.flowId;
      let ao = this.approversObj;
      //当是抄送流程时，将currentNodeId传过来
      if(this.isAppentCirculator || (JSON.stringify(ao) != '{}' && ao != undefined)){
        //这里的nodeID是当前节点的id-->currentNodeId
        let currentNodeId = ao.nodeid;
        let type;
        if(this.isSubFlow) { //{{$t('view.b_flow')}}子流程
          type = 0;
        }else if(this.isAppentCirculator){ //TODO,当是抄送时，角色是2
          type = 2;
        }else{  //指定审批人
          type = 1;
        }

        if(this.isSubFlow) {
          this.$api.getAllRoles(
            appId,
            type,
            {
              onSucess: res => {
                this.allRoles = res.data.data.datas;
              }
            }
          )
        }else {
          this.$api.getCopyAllRoles(
            appId,
            docId,
            currentNodeId,
            flowId,
            type,
            {
              onSucess: res => {
                that.allRoles = res.data.data.datas;
              }
            }
          )
        }
        //以下是获取默认显示指定角色
        // docId = buildFormData.id, 
        let selectId = '', 
          pageNum = 1, 
          pageSize = 10,
          defaultType = 0;
        if(this.isAppentCirculator) { //抄送的时候调用抄送的接口
          this.getCirculators({appId, docId, flowId, currentNodeId, defaultType, selectId,  pageNum, pageSize})
        }else {
          this.getDefault({appId, docId, flowId, currentNodeId, defaultType, selectId,  pageNum, pageSize});
        }
        
      } else {
        let type = 0;
        //角色的接口
        this.$api.getAllRoles(
          appId,
          type,
          {
            onSucess: res => {
              this.allRoles = res.data.data.datas;
            }
          }
        )
      }
      
      if(this.allowEditApprover) {
        //this.selectedUsersList = JSON.parse(JSON.stringify(this.approvers[0].nodes[0].auditors));
        if(this.approvers[0]) {
          if(this.approvers[0].nodes[0]) {
            this.selectedUsersList = JSON.parse(JSON.stringify(this.approvers[0].nodes[0].auditors));
            if(this.approvers[0].nodes[0].auditors && this.approvers[0].nodes[0].auditors.length > 0) {
              let auditors =  JSON.parse(JSON.stringify(this.approvers[0].nodes[0].auditors));
              for(let i=0; i<auditors.length; i++) {
                this.selectedUsers.push(auditors[i].id)
              }
            }
          }
        }
      }
      let PHList = this.processHostingList;
      if(PHList && PHList.length > 0) {
        for(let i=0; i<PHList.length; i++) {
          this.selectedUsers.push(PHList[i].id);
        }
        this.selectedUsersList = PHList;
      }

      let sas = this.saveApproverStatus;
      if(sas && sas.row && sas.row.length) {
        for(let i=0; i<sas.row.length; i++) {
          this.selectedUsers.push(sas.row[i].id);
        }
        this.selectedUsersList = sas.row;
      }

      let sfta = this.subFlowToApprover
      if(this.isSubFlow && this.groupNum == -2 && sfta && sfta.length > 0) { //子流程 并且 groupNum==2
        let row = sfta[0].row
        for(let i=0; i<row.length; i++) {
          this.selectedUsers.push(row[i].id);
        }
        this.selectedUsersList = row
      }
    },

    //获取抄送审批人
    getCirculators(data) {
      this.$api.selectCirculators(
        data.appId, 
        data.docId, 
        data.flowId, 
        data.currentNodeId, 
        data.defaultType, 
        data.selectId, 
        data.pageNum?data.pageNum:data.ev, 
        data.pageSize,
        {
          onSucess: res => {
            let list = res.data.data.datas;
            this.defaultApprovers = list || [];
            this.row_count = this.defaultApproversCount = res.data.data.rowCount;
            this.rolesData = list;
            this.deptUser = list;
            if(list.length <= 0) {
              this.isclickEmpty = true;
            }
          }
        }
      )
    },
    
    //获取默认审批人
    getDefault(data){
      if(!this.isFreeFlow) {
        this.$api.getSelectApprovers(
          data.appId, 
          data.docId, 
          data.flowId, 
          data.currentNodeId, 
          data.defaultType, 
          data.selectId, 
          data.pageNum?data.pageNum:data.ev, 
          data.pageSize,
          {
            onSucess: res => {
              let resData = res.data.data.datas;
              this.isDefaultApprover = true;
              this.defaultApprovers = resData || [];
              this.row_count = this.defaultApproversCount = res.data.data.rowCount;
              this.rolesData =  res.data.data.datas;
              this.deptUser = res.data.data.datas;
            }
          }
        )
      }
    },

    //子流程{{$t('view.group')}}
    listView(){
      if(this.subFlowToApprover && this.subFlowToApprover.length>0) {
        this.currentGroup = JSON.parse(JSON.stringify(this.subFlowToApprover));
        this.groupNumber = this.currentGroup.length;
      }else {
        let parent = document.getElementById('parent');
        if(parent && parent.children.length == 0){
          // this.groupNumber = parent.children.length;
          let obj = Object.assign({}, this.approversObj);
          obj.type = "subflow";
          obj.row = [];
          this.currentGroup.push(obj);
          this.groupNumber = 1;
          this.currentGroupIndex = 0;
        }
      }
    },

    //添加子流程
    addSubflow() {
      let obj = Object.assign({}, this.approversObj);
      if(obj.groupNum == -1) {
        obj.type = "subflow";
        this.currentGroup.push(obj);
        this.groupNumber++;
      }else {
        if(this.currentGroup.length < obj.groupNum) {
          obj.type = "subflow";
          obj.row = [];
          this.currentGroup.push(obj);
          this.groupNumber++;
        }else {
          this.$message({
            message: this.$t('view.bograter_group')`${obj.groupNum}`,
            type: 'warning'
          });
        }
      }
    },

    //删除字流程
    deleteSubflow(index) {
      if(this.currentGroup.length < 2) {
        this.$message({
          message: this.$t('view.one_group'),
          type: 'warning'
        });
      }else {
        this.currentGroup.splice(index, 1);
        this.$forceUpdate();
      }
    },

     //删除子字流程某个选中用户
    deleteUser(id, items, index) {
      items.row.forEach((item,index) => {
        if(id == item.id) {
          items.row.splice(index, 1);
        }
      });
      this.currentGroup[index].row = items.row;
      this.selectedUsersList = JSON.parse(JSON.stringify(this.currentGroup[index].row));
      for(let i=0; i<this.selectedUsers.length; i++) {
        if(id == this.selectedUsers[i]) {
          this.selectedUsers.splice(i, 1);
          i--;
        }
      }
      this.$forceUpdate() //重新渲染数据
    },

    //设置子流程{{$t('view.group')}}当前index
    setCurrentGroupIndex(index) {
      this.currentGroupIndex = index;
      this.selectedUsersList = [];
      this.selectedUsers = [];
    }
  }
}
</script>