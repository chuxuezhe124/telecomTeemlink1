import Vue from 'vue'
import Vuex from 'vuex'
import API from "@/api.js"
import projectJSON from '@/assets/json/project.json';


const statiContextPath = obpmConfig.statiContextPath
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    apps: [],
    menus: {currentApp: "", appMenus: {}, },
    formdatas: {},
    views: {},
    searchFormTemplate: {},
    domainId:'',
    userId:'',
    myProfile:'',
    softwareName:'',
    subDocuments: [], //包含元素网格视图保存时的数据
    subDocumentsData: {}, //包含元素或者tab新建时网格视图的数据，往后可能会有很多页签窗口打开，之后可能修改成数组，保存页面时对比docId
    isIncludeViewRefresh: false, //包含元素网格视图保存时后是否刷新
    firstClick:'',
    naviBarCommonlyUsedList:[], //导航栏常用列表
    pendingListWithWidget: '', //widget流程处理待办的数据
    processedListWithWidget: '', //widget流程处理经办的数据
    operationLogList: [], //操作日志记录
    isInstance: false, //登录超时，状态码出现401，弹出框进行登录
    statiContextPath: '', //判断是5.0还是4.4
    listViewScrollTop: 0,//记录列表视图滚动条位置
    eventMapping:'', //视图选择框设置了事件映射，要把本来视图选择框的映射事件变化到单行文本框中去
    iscriptNum: 0,  //widget计算脚本刷新初始值为0
    includeViewId:'',
    formTableWrapScrollbar:'',
    formTableUpdateId:'',
    saveSubDocments:{}, 
  },

  getters: {
    getPendingListWithWidget: state => {
      return state.pendingListWithWidget;
    },
    getProcessedListWithWidget: state => {
      return state.processedListWithWidget;
    },
    getNaviBarCommonlyUsed: state => {
      return state.naviBarCommonlyUsedList;
    },
    currentMenus: state => {
      return state.menus.appMenus[state.menus.currentApp];
    },
    currentAppName: state => {
      return state.softwareName;
    },
    operationLog: state => {
      return state.operationLogList;
    }
  },

  mutations: { //方法大写规范化
    SET_SAVESUBDOCMENTS: (state, data) => {
      state.saveSubDocments = data
    },

    SET_FORMTABLEUPDATEID: (state, data) => {
      state.formTableUpdateId = data.id;
    },

    SET_FORMTABLEWRAPSCROLLBAR: (state, data) => {
      state.formTableWrapScrollbar = data.scrollbarTop;
    },

    SET_INCLUDEVIEWID: (state, data) => {
      state.includeViewId = data.id;
    },

    SET_SUBDOCUMENTS_DATA: (state, data) => {
      let subDoc = state.subDocumentsData
      if(subDoc[data.sourceDocId]) {
        subDoc[data.sourceDocId][data.currentViewFormId] = data.saveData
      }else {
        let obj = {}
        obj[data.currentViewFormId] = data.saveData
        subDoc[data.sourceDocId] = obj
      }
      state.subDocumentsData = subDoc
      // let obj = {
      //   docId: data.op ? data.op.parentId : '',
      //   _afd: data._afd,
      //   _dl: data._dl,
      //   view: data.view,
      //   op:  data.op,
      // }
      // state.subDocumentsData = obj; 
    },

    GET_OPERATION_LOG: (state, data) => {
      state.operationLogList = data.list;
    },

    GET_PENDING_LIST_WITH_WIDGET: (state, data) => {
      state.pendingListWithWidget = data.pendingData;
    },

    GET_PROCESS_LIST_WITH_WIDGET: (state, data) => {
      state.processedListWithWidget = data.processedData;
    },
    
    SET_STATICONTEXTPATH: (state, data) => {
      state.statiContextPath = data.statiContextPath;
    },

    naviBarCommonlyUsed(state, data) {
      state.naviBarCommonlyUsedList = data;
    },

    loadAppKm(state, data) {
      state.firstClick = data.first;
    },

    saveListViewScrollTop(state,listViewScrollTop) {//记录列表视图滚动条位置
      state.listViewScrollTop = listViewScrollTop
    },
    
    saveEventMapping(state,eventMapping) { 
      state.eventMapping = eventMapping;
    },

    saveSubDocuments(state, data) {
      state.subDocuments = data.data;
      state.isIncludeViewRefresh = data.isRefresh;
    },

    landingUser(state, data){
      state.domainId = data.doId;
      state.userId = data.userId;
      state.myProfile = data.profile;
    },

    loadApps(state, apps) {
      state.apps = apps;
      state.softwareName = apps.length > 0 ? apps[0].name:'';
    },

    loadMenus(state, { appId, menus }) {
      state.menus.currentApp = appId;
      if (menus) {
        menus.appId = appId; //保存一下appId
        state.menus.appMenus[appId] = menus;
      }
    },
    /**
     * 登录超时拦截器
     */
    instanceDialog(state,isInstance){
      state.isInstance = isInstance;
    },
    /**
     * 
     * @param {}} 计算脚本根据流程刷新，目前是通过监听vuex的数据递增进行刷，后期看看要不要改
     */
    iscriptChanage(state){
      state.iscriptNum++;
    },

    loadAppName(state, { name }) {
      state.softwareName = name;
    },

    setFormData(state, { uId, doc }) {
      Vue.set(state.formdatas, uId, doc);
    },

    setSearchFormTemplate(state, { uId, doc }) {
      Vue.set(state.searchFormTemplate, uId, doc);
    },
  },

  actions: {
    getOperationLog(context, {appId, docId, data}) {
      API.getOperationLogs(
        appId,
        docId,
        data,
        {
          onSucess: res => {
            let list = res.data.data;
            context.commit('GET_OPERATION_LOG', {list});
          }
        }
      )
    },

    //获取widget流程处理待办数据
    getPendingListWithWidget(context, {workflowOrder}){
      let that = this;
      API.getPendingListWithWidget(1, 5, workflowOrder, {
        onSucess: res => {
          let pendingData = res.data.data;
          context.commit('GET_PENDING_LIST_WITH_WIDGET', {pendingData});
        }
      });
    },

    //获取widget流程处理经办数据
    getProcessedListWithWidget(context, {workflowOrder}){
      API.getProcessedListWithWidget(1, 5, workflowOrder, {
          onSucess: res => {
            let processedData = res.data.data;
            context.commit('GET_PROCESS_LIST_WITH_WIDGET', {processedData});
          }
        }
      )
    },

    //当前登陆的用户
    landingUser(context) {
      API.getMyProfile(
        {
          onSucess: response => {
            let doId = response.data.data.domainId;
            let userId = response.data.data.id;
            let profile = response.data.data;
            context.commit('landingUser', {doId, userId, profile});
          } 
        }
      )
    },

    loadApps(context, applications) {
      let apps = applications;
      context.commit('loadApps', apps);
      //如果menus为空，则调用第一个软件的menus
      if (Object.keys(context.state.menus.appMenus).length <= 0) {
        let appId = apps[0].id;
        let name = '';
        context.dispatch("loadMenus", {appId, name});
      }
    },

    loadMenus(context, {appId, name}) {
      if (!context.state.menus.appMenus[appId]) {
        if(appId === 'km') {
          let ary = projectJSON.km;
          let kmRealm,kmTeam;
          API.kmsMyProfile({
            onSucess: response =>{
              let result = response.data;
              if(result && result.errcode == 0){
                let isShowAdmin = false;
                if(statiContextPath){//5.0km管理员入口是否显示
                  let roles = result.data.roles;
                  for(let k=0;k<roles.length;k++){
                    if(roles[k].id == "KMSUPERADMINROLEID" || roles[k].id == "KMDEPTADMINROLEID"){
                      isShowAdmin = true;
                    }
                  }
                }else {//4.4km管理员入口是否显示
                  let roles = result.data.roles;
                  for(let k=0;k<roles.length;k++){
                    if(roles[k].id == "0100"){
                      isShowAdmin = true;
                    }
                  }
                }
                API.kmMenuShow(appId,{
                  onSucess: response => {
                    if(response.data){
                      kmRealm = response.data.kmRealm;
                      kmTeam = response.data.kmTeam;
                    }
                    for(let i=0; i<ary.data.length; i++) {
                      if((ary.data[i].id == "committee" && !kmRealm) || (ary.data[i].id == "teamKm" && !kmTeam) || (ary.data[i].id == "admin" &&  !isShowAdmin)) {
                        ary.data.splice(i, 1);
                        i--;
                      }
                    }
                    context.commit('loadMenus', { appId: appId, menus: ary.data })
                  }
                });
              }
            }
          })
          context.commit('loadAppName', { name: name }) //修改软件名字
          context.commit('loadAppKm', { first: 1 }) //第一次点击km或者pm，菜单按钮定位在第一个位置
        }else if(appId === 'qm') {
          let ary = projectJSON.qm;
          context.commit('loadMenus', { appId: appId, menus: ary.data })
          context.commit('loadAppName', { name: name })
          context.commit('loadAppKm', { first: 1 }) //第一次点击km或者pm，菜单按钮定位在第一个位置
        }else {
          API.getMenus(appId, {
            onSucess: response => {
              context.commit('loadMenus', { appId: appId, menus: response.data.data })
              if(name) {
                context.commit('loadAppName', { name: name })
              }
            }
          });
        }
      }else {
        if(context.state.firstClick === 0) { //当重新点击Km或者pm,菜单按钮可以重新定位在第一个
          context.commit('loadAppKm', { first: 1 })
        }
        context.commit('loadMenus', { appId: appId })
        if(name) {
          context.commit('loadAppName', { name: name })
        }
      }
    },

    getFormData(context, { uId, appId, formId, docId }) {
      API.getForm(appId, formId, docId, {}, {
        onSucess: response => {
          context.commit('setFormData', { uId: uId, doc: response.data.data });
        }
      });
    },

    getDocumentEmpty(context, { uId, appId, formId, exparams }) {
      API.getDocumentEmpty(appId, formId, exparams, {
        onSucess: response => {
          if (response.data.data) {
            context.dispatch("getFormData", { uId: uId, appId: appId, formId: formId, docId: response.data.data.id });
          }
        }
      });
    },

  }
})
