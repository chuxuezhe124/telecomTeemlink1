<template>
  <div name="userdialog" class="userdialog">
    <div class="user-select">
      <el-input
        :placeholder="$t('placeholder.enter_name')"
        :clearable="true"
        v-model="searchValue"
        @keyup.enter.native="searchName">
        <el-button slot="append" icon="el-icon-search" @click="searchName"></el-button>
      </el-input>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane :label="$t('menu.department') " name="dept">
          <el-row :gutter="20">
            <el-col :span="8">
              <div>
                <el-tree
                  :props='props'
                  class="filter-tree"
                  :data="treeData"
                  node-key="id"
                  ref="tree"
                  :expand-on-click-node="false"
                  @node-click="getCheckedNodes">
                </el-tree>
              </div>
            </el-col>
            <el-col :span="8">
              <div>
                <div class="modal-user-data-list-title">
                  <el-checkbox v-model="checkAll" @change="handleCheckAllChange" :disabled="isRadio">{{$t('btns.select_all')}}</el-checkbox>
                  <span class="modal-user-data-list-show">{{$t('btns.reveal_all')}}</span>
                </div>
                <div class="modal-user-data-list" v-if="modalUserData && modalUserData.datas.length > 0">
                  <el-checkbox-group v-model="checkedCities">
                    <el-checkbox class="modal-user-checkbox" 
                      v-for="data in modalUserData.datas" :label="data.id" :key="data.id"
                      @change="handleCheckedCitiesChange($event, data, data.id)">
                      <el-avatar size="small" :src="circleUrl"></el-avatar>
                      <span class="user-name" :title="data.name">{{data.name}}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div>
                <div class="modal-user-data-list-title">
                  {{$t('selected_members')}}
                  <i class="el-icon-delete delect-user-name" @click="handlDelect()"></i>
                </div>
                <div class="modal-user-select-panel-list">
                  <div class="modal-user-select-panel" v-for="data in modalData" :key="data.id">
                    <span class="modal-user-select-item">
                      <el-avatar size="small" :src="circleUrl" class="modal-user-avatar mb-2"></el-avatar>
                      <span class="modal-user-select-name">{{data.name}}</span>
                      <i class="el-icon-close close-user-name"  @click="handlTreeSelectRemove(data)"></i>
                    </span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane :label="$t('address_book')" name="contact">
          <el-row :gutter="20">
            <el-col :span="16">
              <div>
                <div class="modal-user-data-list-title">
                  <el-checkbox v-model="checkAll" @change="handleCheckAllChange">{{$t('btns.select_all')}}</el-checkbox>
                  <span class="modal-user-data-list-show">{{$t('btns.reveal_all')}}</span>
                </div>
                <div class="modal-user-data-list" v-if="modalUserData && modalUserData.datas.length > 0">
                  <el-checkbox-group v-model="checkedCities">
                    <el-checkbox class="modal-user-checkbox d-block" 
                      v-for="data in modalUserData.datas" :label="data.id" :key="data.id" 
                      @change="handleCheckedCitiesChange($event, data, data.id)">
                      <el-avatar size="small" :src="circleUrl"></el-avatar>
                      <span  class="user-name" :title="data.name">{{data.name}}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div>
                <div class="modal-user-data-list-title">
                  {{$t('selected_members')}}
                  <i class="el-icon-delete delect-user-name" @click="handlDelect()"></i>
                </div>
                <div class="modal-user-select-panel-list">
                  <div class="modal-user-select-panel" v-for="data in modalData" :key="data.id">
                    <span class="modal-user-select-item">
                      <el-avatar size="small" :src="circleUrl" class="modal-user-avatar mb-2"></el-avatar>
                      <span class="modal-user-select-name">{{data.name}}</span>
                      <i class="el-icon-close close-user-name"  @click="handlTreeSelectRemove(data)"></i>
                    </span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: 'userdialog',
  props: [
    'formParams',
    'isRadio'
  ],
  data() {
    return {
      activeName: 'dept',
      treeData: [],
      checkedKeys: [],
      props: {
        children: 'children',
        label:"name"
      },
      modalUserData: null,     //所有用户
      checkedCities: [],  //回显用户数组:userid
      checkAll: false,
      isIndeterminate: false,
      pageNum: 1,
      pageSize: 10,
      searchValue: "",
      circleUrl: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      modalData: this.formParams.members
    };
  },

  mounted() {
    this.getDepartmentsData();
  },
  watch:{
    formParams(val){
      this.modalData = val.members;
      this.setUserDataChecked(this.modalData,this.modalUserData)
    }
  },
  methods: {
   
    /**
     * 获取部门树
     */
    getDepartmentsData(){
      API.getDepartmentsData({
        onSucess: resp => {
          this.treeData = resp.data.data;
        }
      })
    },

    /**
     * 页签切换
     */
    handleClick(tab) {
      if(tab.name == 'contact'){
        this.getDeptUser(tab.name);
      }else{
        this.modalUserData.datas = [];
      }
    },

    /**
     * 查询用户名称
     */
    searchName(){
      this.activeName = "contact";
      this.getDeptUser("contact");
    },
    
    /**
     * 获取选中节点id
     */
    getCheckedNodes(data) {
      this.checkedKeys =data;
      this.getDeptUser('dept', data)
    },

    /**
     * 获取用户数据
     */
    getDeptUser(type, info, pageSize, pageNum){
      if(!pageSize){
        pageSize = 100000;
        this.pageSize = pageSize
      }
      if(!pageNum){
        pageNum = 1;
        this.pageNum = pageNum;
      }
      const keyWord = this.searchValue;
      switch(type){
        case 'dept':
          API.getDeptUser(info.id, pageSize, pageNum, {
            onSucess: resp => {
              let modalUserData = this.setUserDataChecked(this.modalData, resp.data.data);
              this.modalUserData = modalUserData;           
            }
          })
          break;
        case 'contact':
          API.getContactUser(keyWord, pageSize, pageNum, {
            onSucess: resp => {
              
             let modalUserData = this.setUserDataChecked(this.modalData, resp.data.data);
             this.modalUserData = modalUserData;
            }
          })
          break;
      }
    },

    /**
     * 显示所有成员面板数据回显选中
     */
    setUserDataChecked(modalData, modalUserData){
      let checkAll = true;
      let checkedCities = [];
      if(modalUserData && modalUserData.datas.length > 0){
        modalUserData.datas = modalUserData.datas.map((user) => {
          user['checked'] = false;
          modalData.map((data) => {
              if (user.id == data.id) {
                user['checked'] = true;
                checkedCities.push(data.id);
              }
          })
          if(!user['checked']){
            checkAll = false
          }
          return user
        })
      }else{
        checkAll = false
      }
      this.checkAll = checkAll;
      this.checkedCities = checkedCities;
      return modalUserData;
    },

    /**
     * 全选
     */
    handleCheckAllChange(val){
      let that = this;
      const checkedCities = [];
      this.modalUserData.datas.map((user)=>{
        checkedCities.push(user.id)
      })
      this.checkedCities = checkedCities;
      this.isIndeterminate = false;
      let selectModalData = this.filterSelectModalData(checkedCities,val);
      if(!val){
        this.checkedCities = [];
      }
      this.modalData = selectModalData;
    },

    /**
     * 单个勾选
     */
    handleCheckedCitiesChange(checked, user, id){
      if(checked){
        //这里获取用户信息，把type属性去掉，用在团队km申请管理员权限
        let obj = user;
        this.$delete(obj,'type');
        //管理员入口，日志的用户选择框是单选模式
        if(this.isRadio){
          this.checkedCities = []
          this.modalData = [];
          this.checkedCities.push(id);
        }
        this.modalData.push(obj)
      }else{
        if(this.modalData && this.modalData.length > 0) {
          let list = this.modalData;
          for(let i=0; i<list.length; i++) {
            if(id == list[i].id) {
              list.splice(i, 1)
            }
          }
        }
      }
     
    },

    /**
     * 筛选是否选中数据
     */
    filterSelectModalData(value,ischecked){
      const members = this.modalData;
      let selectModalData = [];
      // selectModalData = selectModalData.concat(members);
      //全选选中
      if(ischecked){
        this.modalUserData.datas.map((user) => {
          value.map((userId) => {
            if(user.id == userId){
              selectModalData.push(user);
            }
          })
        })
        selectModalData.map((selectUser,i)=>{
          members.map((menberUser)=>{
            if(selectUser.id == menberUser.id){
              selectModalData.splice(i,1);
            }
          })
        })
      }else{
        value.map((userId) => {
          members.map((user,index) => {
            if(user.id == userId){
              members.splice(index,1);
            }
          })
        })
      }
      if(value.length>0){
        selectModalData = members.concat(selectModalData)
      }
      return selectModalData;
    },

    /**
     * 清除已选择面板上的用户
     */
    handlTreeSelectRemove(data){
      let userId = [data.id]
      let selectModalData = this.handlSelectRemove(userId);
      this.modalData = selectModalData;
    },

    /**
     * 清除所有选中成员
     */
    handlDelect(){
      let selectModalData = [];
      this.checkedCities = selectModalData;
      this.checkAll = false;
      this.modalData = selectModalData;
    },

    /**
     * 筛选清除哪个用户
     */
    handlSelectRemove(data){
      let modalData = this.modalData;
      let checkedCities = this.checkedCities;
      this.modalData.map((user, userIndex) => {
        if(user.id == data[0]){
          modalData.splice(userIndex, 1);
        }
      });
      this.checkedCities.map((checkedId, index)=>{
        if(checkedId == data[0]){
          checkedCities.splice(index, 1);
        }
      });
      //判断没有选中数据时，全选复选框清除选中样式
      if(checkedCities.length == 0){
        this.isIndeterminate = false;
      }
      this.checkedCities = checkedCities
      return modalData;
    },

    /**
     * 确定选择用户
     */
    handleSelectUser(){
      //确定之后清空搜索记录
      this.searchValue = "";
      this.$emit('handleSelectUser', this.modalData)
      this.modalData = [];
    },

    /**
     * 取消
     */
    handleCancel(){
      //取消之后清空搜索记录
      this.searchValue = "";
      this.setUserDataChecked(this.formParams.members, this.modalUserData);
      this.modalData = this.formParams.members;
    },

    /**
     * 恢复用户选择框初始值
     */
    initUserParams(){
      let selectModalData = [];
      this.checkedCities = selectModalData;
      this.checkAll = false;
      this.modalData = selectModalData;
      this.modalUserData = null;
      this.getDepartmentsData();
    }
  }
}
</script>
