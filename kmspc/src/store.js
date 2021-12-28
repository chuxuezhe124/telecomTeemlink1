import Vue from 'vue'
import Vuex from 'vuex'
import API from "@/api.js"
import cloneDeep from 'lodash/cloneDeep'
import {getCookie} from '@/utils/utils'



Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: sessionStorage.getItem('landingUser') ? JSON.parse(sessionStorage.getItem('landingUser')) : {},
    disksFoldersList: {},
    tab: {},
    isEnglish:false,//作为标识，改变受切换语言影响的内容的样式
  },

  getters: {
    // currentMenus: state => {
    //   return state.menus.appMenus[state.menus.currentApp];
    // },
  },

  mutations: {
    landingUser(state, data){
      state.user= data
    },

    addDisksFoldersList(state, data){
      state.disksFoldersList = data;
    },

    deleteDisksFoldersList(state, index){
      let disksFoldersListData = {...state.disksFoldersList}
      disksFoldersListData.datas.splice(index,1);
      state.disksFoldersList = disksFoldersListData;
    },
    /**
     * 登录超时拦截器
     */
     instanceDialog(state,isInstance){
      state.isInstance = isInstance;
    },
    /**
     * 
     * @param {这里存储是否显示头部的top值} state 
     */
    isShowHeard(state,value){
      state.isShowHeard = value;
    },
    /**
     * 
     * @param {文件重命名} state 
     */
    handleRename(state, index){
      const rename_state = cloneDeep(state);
      rename_state.disksFoldersList.datas[index].isEditable = true;
      state.disksFoldersList = rename_state.disksFoldersList;
    },
    /**
     * 
     * @param {添加标签页} state 
     */
    addTabHeard(state,data){
      let isRepetition = false;
      if(state.tab.length){
        for(let i=0;i<state.tab.length;i++){
          if(state.tab[i].key == data[0].key){
            isRepetition = true;
          }
        }
      }
      if(!isRepetition){
        if(state.tab.length != 0 && state.tab.length != undefined){
          state.tab = state.tab.concat(data);
        }else{
          state.tab = data;
        }
      }
      state.tab.addTab = true;
    },
    GET_LANGUAGE_STATUS:(state,value)=>{
    
      state.isEnglish = value;
    },
  },

  actions: {
    // 当前登陆的用户
    landingUser(context) {
      API.getMyProfile(
        {
          onSucess: response => {
            context.commit('landingUser', response.data.data);
          } 
        }
      )
    },
  }
})
