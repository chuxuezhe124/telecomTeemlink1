import axios from 'axios';
import Constant from "@/Constant.js"
import store from "./store.js"

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// import config from "../public/js/obpm.config.js"

// const contextPath = Constant.contextPath;
const contextPath = obpmConfig.contextPath; //config.contextPath;
const accessToken = Constant.accessToken;
const kmsPath = Constant.kmsPath;
const messagePath = obpmConfig.messagePath;
const statiContextPath = obpmConfig.statiContextPath
const signonContextPath = obpmConfig.signonContextPath
const obpmFilePath = obpmConfig.obpmFilePath
const instance = axios.create({
});
window.$http = instance;
//http response 拦截器
instance.interceptors.request.use(
    config => {
        config.headers['accessToken'] = localStorage.getItem('accessToken');
        config.headers['adminToken'] = localStorage.getItem('adminToken');
        return config
    },
    err => {
        return Promise.reject(err)
    }
);
instance.interceptors.response.use(
    response => {
        store.commit("instanceDialog", false);
        if(response.data.errcode == 500) {
            ElementUI.Notification.error({
                title: '错误',
                message: '系统错误,请联系管理员!'
            });
        }
        return response;
    },
    error => {
        if (error.response.status == 401) {
            if(store.state.myProfile){
                store.commit("instanceDialog", true);
            }else {
                let url;
                if(statiContextPath){
                    url = window.location.origin + statiContextPath + signonContextPath + "/index.html";
                }else{
                    url = window.location.origin + signonContextPath + "/index.html";
                }
                window.location.href = url;
            }
        }else if (error.response.status == 500) {
            ElementUI.Notification.error({
                title: '错误',
                message: '系统错误,请联系管理员!'
            });
        }
        else {
            return Promise.reject(error)
        }
    }
);
instance.defaults.withCredentials = true;

export default {
    getMyProfile: function ({ onSucess, onError }) {
        instance.get(contextPath + '/runtime/users/myprofile').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    kmsMyProfile: function ({ onSucess, onError }) {
        let url = "";
        if(statiContextPath){
            url = kmsPath + 'kms/api/kms/users/myprofile';
        }else{
            url = kmsPath + 'kms/kms/users/myprofile';
        }
        instance.get(url).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getDepartmentsByParentId: function(appid,parentId,  { onSucess, onError }){
        instance.get(contextPath + '/runtime/' + appid + '/departments/selectbox/childs?parentId=' + parentId)
        .then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    
    searchDepartments: function(appid, keyWord, { onSucess, onError }){
        instance.get(contextPath + '/runtime/' + appid + '/departments/selectbox/search?keyword=' + keyWord)
        .then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    //http://localhost:8081/obpm%E5%8D%8E&_=0.8404497315018791
    
    /**
     * 主页锁屏功能
     */
    isLock: function (password, { onSucess, onError }) {
        // instance.put(contextPath + '/runtime/users/unlock?pwd=' + password).then(function (response) {
        //     if (onSucess) onSucess(response);
        // }).catch(
        //     function (error) {
        //         if (onError) onError(error);
        //     }
        // );
        axios({
            headers : {
                'Content-Type' : 'application/json',
            },
            url: contextPath + '/runtime/users/unlock',
            data: password,
            method: "put"
        })
        .then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    signonLogin: function(jsonData,{ onSucess, onError }){
        let url;
        if(statiContextPath){
            url = contextPath + "/runtime/login/loginWithCiphertext2"
        }else{
            url = signonContextPath + "/runtime/login/loginWithCiphertext2"
        }
        instance.post(url,jsonData)
        .then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 获取企业域的列表
     */
    getDomainList: function ({ onSucess, onError}){
        instance.get(contextPath +  "/runtime/usersetups/domains").then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 切换企业域
     */
     switchDomain: function (domain, { onSucess, onError }) {
        instance.put(contextPath +  "/runtime/usersetups/domains/switch?domain="+ domain).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 5.13挂起流程
     * 保存文档并挂起流程。
     * 请求方式：PUT
     * 请求地址：/runtime/{applicationId}/documents/{docId}/workflows/suspend
     */
    suspendWorkflow: function (appId, docId, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/suspend').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 5.14恢复流程
     * 请求方式：PUT
     * 请求地址：/runtime/{applicationId}/documents/{docId}/workflows/recovery
     */
    recoveryWorkflow: function (appId, docId, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/recovery').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 5.11撤回流程
     * 请求方式：PUT
     * 请求地址：/runtime/{applicationId}/documents/{docId}/workflows/retracement
     */
    retracementWorkflow: function (appId, docId, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/retracement').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 5.12终止流程
     * 请求方式：PUT
     * 请求地址：/runtime/{applicationId}/documents/{docId}/workflows/termination
     */
    terminationWorkflow: function (appId, docId, attitude, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/termination?attitude=' + attitude).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
     /**
     * 流程预览
     * 请求方式：POST
     * 请求地址：/api/runtime/{applicationId}/documents/{docId}/trail
     */
    previewWorkflow: function (appId, docId, jsonData,{ onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/' + docId + '/trail',jsonData,).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    getApplications: function ({ onSucess, onError }) {
        instance.get(contextPath + '/runtime/applications').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    getMenus: function (appId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/menus').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    getHomePageConfig: function ({ onSucess, onError }) {
        instance.get(contextPath + '/runtime/homepage/config').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8081/obpm/runtime/homepage/config
    setHomePageConfig: function (jsonData, { onSucess, onError }) {
        instance.post( contextPath + '/runtime/homepage/config',jsonData,).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  

    },
    resetHomePageConfig: function ({ onSucess, onError }) {
        instance.post( contextPath + '/runtime/homepage/config',).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  

    },

    getStartMenus: function (appId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/flowcenters/startmenus').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    
    getMainPendings:  function (appId, data, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/" + appId + "/flowcenters/pendings",{params:data})
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    getPendings: function (appId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/flowcenters/navs/pendings?applicationId=' + (appId ? appId : '')).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    getPendingList: function (appId, params, { onSucess, onError }) {
        var urlParams = '';
        for (var key in params) {
            if (urlParams == '') {
                urlParams += '?';
            } else {
                urlParams += '&';
            }
            urlParams += key + '=' + params[key];
        }
        instance.get(contextPath + '/runtime/' + (appId ? appId : '') + '/flowcenters/pendings' + urlParams).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getPendingListWithWidget: function (pageNo, linesPerPage, workflowOrder, { onSucess, onError }) {
        var _pageNo = pageNo ? pageNo : 1;
        var _linesPerPage = linesPerPage ? linesPerPage : 2147483646;
        instance.get(contextPath + '/runtime/widget/myPending?pageNo=' + _pageNo + '&linesPerPage=' + _linesPerPage + '&workflowOrder=' + workflowOrder).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getMainProcesseds: function (appId, data, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/" + appId + "/flowcenters/processeds",{params:data})
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    getNavsPeddings: function (appId, { onSucess, onError }) {
        instance.get(contextPath +  "/runtime/flowcenters/navs/pendings",{applicationId: appId})
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    getNavsProcesseds: function (appId, { onSucess, onError }) {
        instance.get(contextPath +  "/runtime/flowcenters/navs/processeds",{ applicationId: appId,})
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    getProcessedList: function (appId, params, { onSucess, onError }) {
        var urlParams = '';
        for (var key in params) {
            if (urlParams == '') {
                urlParams += '?';
            } else {
                urlParams += '&';
            }
            urlParams += key + '=' + params[key];
        }
        instance.get(contextPath + '/runtime/' + (appId ? appId : '') + '/flowcenters/processeds' + urlParams).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getProcessedListWithWidget: function (pageNo, linesPerPage, workflowOrder,{ onSucess, onError }) {
        var _pageNo = pageNo ? pageNo : 1;
        var _linesPerPage = linesPerPage ? linesPerPage : 2147483646;
        instance.get(contextPath + '/runtime/widget/myProcessing?pageNo=' + _pageNo + '&linesPerPage=' + _linesPerPage + '&workflowOrder=' + workflowOrder).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getViewTemplate: function (appId, viewId, exparams, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/template',{params:exparams}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //获取视图打印模板
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/views/__g4P1Z1Dms6kyAyMccsl/template?appId=sOZu9kthmxyP8qQfq0e&viewId=__g4P1Z1Dms6kyAyMccsl&isPrint=true
    getPrintViewTemplate: function (appId, viewId, isPrint, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/template?appId=' + appId + "&viewId=" + viewId + "&isPrint=" + isPrint).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/views/n3RPxv8mWq8i8PpPkle/template?appId=sOZu9kthmxyP8qQfq0e&viewId=n3RPxv8mWq8i8PpPkle&test=11111&opentarget=target&containTitle=
    getBlankViewTemplate: function (appId, jsonData, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + jsonData.viewId + '/template',{params:jsonData}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //树形视图
    getViewTemplateP: function (appId, viewId, jsonData, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/template',{params:jsonData}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //折叠视图
    //?appId=sOZu9kthmxyP8qQfq0e&viewId=KEemd2e0Yn9a4qCw3iT&opentarget=detail&containTitle=%E6%8A%98%E5%8F%A0%E8%A7%86%E5%9B%BE
    getCollapsedviewTemplate: function (appId, exparams, { onSucess, onError }) {
        let viewId = exparams.viewId;
        let opentarget = exparams.opentarget;
        let containTitle = exparams.containTitle;
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/template?appId=' + appId + "&viewId=" + viewId + "&opentarget=" + opentarget + "&containTitle" + containTitle).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getSearchFormTemplate: function (appId, viewId, exparams, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/searchformtemplate', {params:exparams}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    

    /**
     * 获取视图数据
     */
    getViewData: function (appId, viewId, params, data, { onSucess, onError }) {
        var urlParams = '';
        var parentId = params.parentId ? params.parentId : '';
        var sortCol = params.sortCol ? params.sortCol : '';
        var sortStatus = params.sortStatus ? params.sortStatus : '';
        var currpage = params.currpage ? params.currpage : '1';
        var lines = params.lines ? params.lines : '';
        var treedocid = params.treedocid ? params.treedocid : '';
        var parentNodeId = params.parentNodeId ? params.parentNodeId : '';
        var docid = params.docid ? params.docid : '';
        var fieldid = params.fieldid ? params.fieldid : '';
        var isRelate = params.isRelate ? params.isRelate : '';
        var startDate = params.startDate ? params.startDate : '';
        var endDate = params.endDate ? params.endDate : '';
        var exparams = params.exparams ? params.exparams : '';
        var parentParam = params.parentParam ? params.parentParam : '';
        urlParams += '?parentId=' + parentId + '&sortCol=' + sortCol +
            '&sortStatus=' + sortStatus + '&_currpage=' + currpage +
            '&lines=' + lines + '&treedocid=' + treedocid +
            '&parentNodeId=' + parentNodeId + '&_docid=' + docid +
            '&_fieldid=' + fieldid + '&isRelate=' + isRelate +
            '&startDate=' + startDate + '&endDate=' + endDate + 
            '&parentParam=' + parentParam;
            
        if (data && exparams) {
            data = Object.assign(data, exparams);
        }
        instance.post(contextPath + '/runtime/' + appId + '/views/' + viewId + '/documents' + urlParams,data ? data : {}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    getTreeViewTemplate: function (appId, viewId, hasListview, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/" + appId + "/views/" + viewId + "/template?appId=" + appId + "&viewId=" + viewId + "&hasListview=" + hasListview).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 获取树形视图数据
     */
    getTreeViewData: function (appId, viewId, params, data, name, { onSucess, onError }) {
        let urlParams = '';
        let currpage = params.currpage ? params.currpage : '1';
        let sortCol = params.sortCol ? params.sortCol : '';
        let sortStatus = params.sortStatus ? params.sortStatus : '';
        let parentId = params.parentId ? params.parentId : '';
        let treedocid = params.parentId ? params.parentId : '';
        let parentNodeId = params.parentId ? params.parentId : '';
        let isSearchForm = params.isSearchForm

        urlParams += '?sortCol=' + sortCol +
            '&sortStatus=' + sortStatus + 
            '&name=' + name + 
            "&treedocid=" + treedocid + 
            "&parentNodeId=" + parentNodeId
            "&currpage=" + currpage;
        if(!isSearchForm) {
            urlParams += '&parentId=' + parentId
        }

        instance.post(contextPath + '/runtime/' + appId + '/treeviews/' + viewId + '/documents' + urlParams, data ? data : {}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 获取表单
     */
    getForm: function (appId, formId, docId, exparams, { onSucess, onError }) {
        instance.get( contextPath + '/runtime/' + appId + '/forms/' + formId + '/documents/' + docId, {params:exparams ? exparams : {}}
        ).then((response) => {
            if (onSucess) onSucess(response);
        }).catch((error) => {
            if (onError) onError(error);
        })
    },

    /**
     * 获取表单
     */
    getDocument: function (appId, docId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/documents/' + docId).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 获取空文档
     */
    getDocumentEmpty: function (appId, formId, exparams, { onSucess, onError }) {
        // let ex = decodeURI(exparams)
        instance.get( contextPath + '/runtime/' + appId + '/forms/' + formId + '/empty', {params:exparams ? exparams : {}}).then((response) => {
            if (onSucess) onSucess(response);
        }).catch((error) => {
            if (onError) onError(error);
        })
    },

    /**
     * 6.4	保存并启动流程 --接口有问题，要改 --TODO:Jarod
     */
    saveDocumentAndStartWorkflow: function (appId, formId, docId, /**flowId,*/ data, { onSucess, onError }) {
        var jsonData = {
            "flowId": "",
            "attitude": "",
            "versions": "",
            "document": {
                "id": docId,
                "formId": formId,
                "applicationid": appId,
                "stateid": "",
                "versions": "",
                "parentid": "",
                "sign": "",
                "items": data ? data : {}
            }
        }
        instance.post(contextPath + '/runtime/' + appId + '/documents/' + docId + '/activities/saveStartWorkFlow',JSON.stringify(jsonData)).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 2.6	更新文档（带校验）
     *  请求方式：PUT
     *  请求地址：/runtime/{applicationId}/documents/{id}
     */
    saveDocument: function (appId, formId, docId, docJson, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId,docJson,).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/__K9sL2EHCL3DcW70DyEb/withoutValid
    saveWithoutValidDocument: function (appId,docId, docJson, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/withoutValid',docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 复制文档v
     */
    copeDocument: function (appId, docId, docJson, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/' + docId + '/activities/copy',docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     *创建文档
     */
    createDocument: function (appId, formId, docJson, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents',JSON.stringify(docJson)).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    createWithoutValidDocument: function (appId, formId, docJson, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/withoutValid',JSON.stringify(docJson)).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },


    /**
     * 2.10	批量删除文档
     * 请求方式：DELETE
     * 请求地址：/runtime/{applicationId}/documents
     */
    batchRemoveDocuments: function (appId, idsArray, { onSucess, onError }) {
        instance.delete(contextPath + '/runtime/' + appId + '/documents', {data: idsArray}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *树形视图右键删除节点
    **/
    deleteTreeviewNode: function (appId, nodeId, { onSucess, onError }) {
        instance.delete(contextPath + '/runtime/' + appId + '/documents/' + nodeId).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *5.4	获取文档的流程提交面板
     *服务器返回当前文档流程面板所需要的全部信息，包含当前节点信息，下一步节点的相信配置信息。
     *请求方式：post
     *请求地址：/runtime/{applicationId}/documents/{docId}/panels/submission
     */
    getFlowPanel: function (appId, docId, flowData, { onSucess, onError }) {
        instance.post( contextPath + '/runtime/' + appId + '/documents/' + docId + '/panels/submission',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *5.5获取文档的流程回退面板
     *  服务器返回当前文档流程面板所需要的全部信息，包含当前节点信息，下一步节点的相关配置信息。
     *  请求方式：GET
     *  请求地址：/runtime/{applicationId}/document/{docId}/panels/back
     */
    getBackPanel: function (appId, docId, flowData,{ onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/' + docId + '/panels/back',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *5.8	提交流程
     *保存文档并提交流程。
     *请求方式：PUT
     *请求地址：/runtime/{applicationId}/documents/{docId}/workflows/submit
     */
    /**
     *   {
            "flowId":"14e7dwq091134ct9635fG",
            "flowType":"80",
            "currentNodeId":"1470911349635",
            "nextNodeIds":["1470911349645","1470911349644"],---计算得出
            "attitude":"",
            "signature":"",
            "submitTo": "",
            "circulatorInfo":"",
            "subFlowApproverInfo":"",
            "subFlowApproverInfoAll":""
            "document":{
                "id": "value",
                "formId": "value",
                "applicationid": "value",
                "stateid": "value",
                "versions": 0,
                "parentid": "value",
                …//其他系统字段
                "sign": "value",
                "items": [
                    {
                        "name": "demo",
                        "age": 18,
                        "date": "2017-6-23"
                    }
                ]
            }
        }

     *
     */
    submitFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/submit',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 5.10回退流程
     * 保存文档并回退流程。
     * 请求方式：PUT
     * 请求地址：/runtime/{applicationId}/documents/{docId}/workflows/back
     {
        "flowId":"14e7dwq091134ct9635fG",
        "flowType":"81",
        "currentNodeId":"1470911349635",
        "nextNodeIds":["1470911349645"],
        "attitude":"",
        "signature":"",
        "document":{
            "id": "value",
            "formId": "value",
            "applicationid": "value",
            "stateid": "value",
            "versions": 0,
            "parentid": "value",
            …//其他系统字段
            "sign": "value",
            "items": [
                {
                    "name": "demo",
                    "age": 18,
                    "date": "2017-6-23"
                }
            ]
        }
    }
     */
    backFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/back',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 5.9催办流程
     保存文档并流程催办。
     请求方式：PUT
     请求地址：/runtime/{applicationId}/documents/{docId}/workflows/remind

     {
        "reminderContent":"zz",
        "nodertIds":["1470911349645","1470911349644"]
        }
     */
    remindFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/remind',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *  自由流程-提交
     请求方式：PUT
     请求地址：/runtime/{applicationId}/documents/{docId}/freeflows/submit

     {
            "flowType":"80",
            "nextUserId":"sf34sdsfKJg342",
            "attitude":"",
            "document":{
                "id": "value",
                "formId": "value",
                "applicationid": "value",
                "stateid": "value",
                "versions": 0,
                "parentid": "value",
                …//其他系统字段
                "sign": "value",
                "items": [
                    {
                        "name": "demo",
                        "age": 18,
                        "date": "2017-6-23"
                    }
                ]
            }
        }
     */
    submitFreeFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/freeflows/submit',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *  自由流程-回退
     请求方式：PUT
     请求地址：/runtime/{applicationId}/documents/{docId}/freeflows/back

     {
            "flowType":"80",zidingyi
            "nextUserId":"sf34sdsfKJg342",
            "attitude":"",
            "document":{
                "id": "value",
                "formId": "value",
                "applicationid": "value",
                "stateid": "value",
                "versions": 0,
                "parentid": "value",
                …//其他系统字段
                "sign": "value",
                "items": [
                    {
                        "name": "demo",
                        "age": 18,
                        "date": "2017-6-23"
                    }
                ]
            }
        }
     */
    backFreeFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put( contextPath + '/runtime/' + appId + '/documents/' + docId + '/freeflows/back',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *  自由流程-结束
     请求方式：PUT
     请求地址：/runtime/{applicationId}/documents/{docId}/freeflows/complete

     {
            "flowType":"7",
            "nextUserId":"sf34sdsfKJg342",
            "attitude":"",
            "document":{
                "id": "value",
                "formId": "value",
                "applicationid": "value",
                "stateid": "value",
                "versions": 0,
                "parentid": "value",
                …//其他系统字段
                "sign": "value",
                "items": [
                    {
                        "name": "demo",
                        "age": 18,
                        "date": "2017-6-23"
                    }
                ]
            }
        }
     */
    completeFreeFlow: function (appId, docId, flowData, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/freeflows/complete',flowData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },


    /**
     * 3.7刷新表单
     *   表单某控件触发全局刷新表单的动作，服务器根据最新的文档状态重新运算开启重计算功能的全部控件的值脚本，返回状态发生变更的控件内容。
     *   请求方式：POST
     *   请求地址：/runtime/{applicationId}/forms/{formId}/documents/{docId}/refresh
     */
    refreshForm: function (actField, docJson, { onSucess, onError }) {
        var appId = docJson.applicationId;
        var formId = docJson.formId;
        var docId = docJson.id;
        var refreshData = {
            actField: actField,
            tabId: '',
            document: docJson.document
        };

        instance.post(contextPath + '/runtime/' + appId + '/forms/' + formId + '/documents/' + docId + '/refresh',refreshData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    refreshView: function (docJson, { onSucess, onError }) {
        let appId = docJson.applicationId;
        let formId = docJson.formId;
        let docId = docJson.id;
        let refreshData = {
            tabId: '',
            document: docJson,
        };
        instance.post(contextPath + '/runtime/' + appId + '/forms/' + formId + '/documents/' + docId + '/refresh',refreshData).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },


    /**
     * 获取文档的流程历史
     */
    getFlowHistorys: function (appId, docId, content,{ onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/flowhistorys?content=' + content).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 获取文档的催办记录
     */
    getRemindHistorys: function (appId, docId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/remind-historys').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

   
    /**
     * 运算自定义动作脚本
     */
    executeCustom: function (applicationId, id, data, params,{ onSucess, onError }) {
        instance.put(contextPath + "/runtime/" + applicationId + "/activities/" + id + "/execute",data, {params:params}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 获取文档的流程发起面板
     */
    getPanelsInitiate: function (applicationId, docId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/documents/" + docId + "/panels/initiate",docJson,).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 发起流程
     */
    InitiateWorkFlow: function (applicationId, docId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/documents/" + docId + "/workflows/initiate",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 保存并启动流程
     */
    saveStartWorkFlow: function (applicationId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/documents/activities/saveStartWorkFlow",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 签章
     */
    saveSign: function (applicationId, docId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/documents/" + docId + "/activities/sign",JSON.stringify(docJson)).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 邮件和手机分享
     */
    toShare: function (applicationId, docId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/documents/" + docId + "/activities/share",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 归档
     */
    Archive: function (applicationId, docId, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/" + applicationId + "/documents/" + docId + "/activities/archive").then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 获取打印表单数据
     */
    getPrintForm: function (applicationId, formId, docId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + applicationId + '/forms/' + formId + '/documents/' + docId + '/activities/print').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 清除所有数据
     */
    deleteAllData: function (applicationId, formId, { onSucess, onError }) {
        instance.delete(contextPath + "/runtime/" + applicationId + "/forms/" + formId + "/activities/clear").then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * Excel导入
     */
    importExcel: function (applicationId, viewId, docJson, { onSucess, onError }) {
        let url;
        if(docJson.type == "excelimport"){
            url = contextPath + "/runtime/" + applicationId + "/views/" + viewId + "/activities/importExcel"
        }else{
            url = contextPath + "/runtime/" + applicationId + "/views/" + viewId + "/activities/validationExcel"
        }
        instance.post(url,docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 批量审批
     */
    batchApprove: function (applicationId, docJson, { onSucess, onError }) {
        axios({
            url: contextPath + "/runtime/" + applicationId + "/forms/activities/batchApprove",
            method: 'post',
            data: docJson,
        }).then(function(response) {
            if (onSucess) onSucess(response);
        }).catch(function(error) {
            if (onError) onError(error);
        })
        // instance.post(contextPath + "/runtime/" + applicationId + "/forms/activities/batchApprove",docJson).then(function (response) {
        //     if (onSucess) onSucess(response);
        // }).catch(
        //     function (error) {
        //         if (onError) onError(error);
        //     }
        // );
    },

    /**
     * 判断km团队和知识专题是否显示
     */
    kmMenuShow: function ( { onSucess, onError }) {
        instance.get( contextPath + '/kms/realmAndTeam').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 视图列的提交按钮
     */
    operateSubmit: function (applicationId, viewId, docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/views/" + viewId + "/column/submit",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     * 流程协办（点评）
     */
    review: function (appId, instanceId, comments, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/workflows/' + instanceId + '/assist?attitude=' + comments).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 添加/补签意见
     */
    supplement: function (appId, instanceId, comments, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/workflows/' + instanceId + '/supplement?comments=' + comments).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 加签（主办）
     */
    processHosting: function (appId, docId, data, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/approver/addition',data).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 加签（协办）
     */
    processCoHosting: function (appId, docId, data, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/assist/addition',data).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 企业域信息
     *  */
    getEnterpriseinfo: function (domainId, { onSucess, onError }) {
        instance.get( contextPath + '/portal/domain/' + domainId).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     *  视图选择框确认执行脚本
     */
    runViewDialogCallbackScript: function (docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/views/selectbox/runViewDialogCallbackScript",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 获取是否配置文件预览环境的信息
     */
    getenvironment: function ({ onSucess, onError }) {
        instance.get(contextPath + '/runtime/files/preview/environment').then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //id=__TK3KWkOfistq2Hn95RH&extName=.docx&url=%2Fuploads%2Fmessage%2F%2F__TK3KWkOfistq2Hn95RH.docx&_=1599807632731
    getPreview: function ( data, { onSucess, onError }) {
        instance.get(messagePath + '/message/messages/attachement/preview',{params:data}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     * 通过文件路径和名称判断是否存在对应的PDF文件
     */
    getHasPdfFile: function (filePath, fileRealName, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/files/hasPdf?path=' + filePath + '&fileRealName=' + fileRealName).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     *  视图框选择后回显
     *  /runtime/{applicationId}/forms/{formId}/documents/{docId}/validateFieldValue
     */
    formValueEcho: function (appId, docId, formId, data, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/forms/' + formId + '/documents/' + docId + '/validateFieldValue',JSON.stringify(data)).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /**
     *  是否有打开表单的权限
     *  /runtime/{applicationId}/forms/{formId}/documents/{docId}/openable
     */
     hasPermissionToForm(appId, formId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/forms/' + formId + '/openable',
        ).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /**
     *  是否有打开视图的权限
     *  
     */
    hasPermissionToView(appId, viewId, { onSucess, onError }) {
        instance.get(contextPath + '/runtime/' + appId + '/views/' + viewId + '/openable',
        ).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    runScript: function (appId, actId, docId, fieldName, _, subSelectId,{ onSucess, onError }) {
        let url = contextPath + '/runtime/' + appId + '/activities/' + actId + '/runScript?docId=' + docId + '&fieldName=' + fieldName + "&_" + _
        if(subSelectId) {
            url += "&subSelects=" + subSelectId
        }
        instance.get(url).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    deleteUpload: function (appId, formId, docId, path, { onSucess, onError }) {
        instance.delete(contextPath + '/runtime/files/delete?applicationId=' + appId + '&formId=' + formId + '&docId=' + docId + '&path=' + path).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    // 更新流程节点审批人
    approversWorkflow: function (appId, docId, data, { onSucess, onError }) {
        instance.put(contextPath + '/runtime/' + appId + '/documents/' + docId + '/workflows/approvers',data).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    //智能提示搜索框
    intellectTip: function (applicationId, formId, docId, data, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/" + applicationId + "/forms/" + formId + "/documents/" + docId + "/querySuggest", data).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    //角色
    getAllRoles: function(application,type, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/"+application+"/users/selectbox/role?type="+ type).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )
    },
    
    //获取抄送人角色数据
    getCopyAllRoles: function(application, docId, nodeId, flowId, type, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/"+ application +"/users/selectbox/role?docId="+ docId +"&nodeId="+ nodeId +"&flowId="+ flowId + "&type="+ type).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )
    },
    //获取部门树
    getDepartments: function(parentId, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/selectbox/dept-tree?parentId=" + parentId).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )
    },
    //在线用户
    //runtime/users/selectbox/onlines?pageNum={pageNum}&pageSize={pageSize}
    getOnlines: function(pageNum, pageSize, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/selectbox/onlines?pageNum=" + pageNum+"&pageSize="+pageSize).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )
    },
    //通讯录用户
    getContact: function(contactsId,{ onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox/contacts?contactsId=" + contactsId).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },

     //http://localhost:8081/obpm/runtime/users/selectbox/contacts?contactsId=&userName=1&pageSize=10&pageNum=1&_=1591596427610
    getSearchContact: function(jsonData,{ onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox//contacts",{params:jsonData}).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
   
    //查询
    getSearch: function(keyWord, pageNum, pageSize,{ onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox/search?keyWord="+ keyWord +"&pageNum="+ pageNum +"&pageSize=" + pageSize).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    //部门用户**/runtime/{applicationId}/users/selectbox/department?deptId={deptId}
    getDeptUser: function(application,deptId,{ onSucess, onError }) {
        instance.get(contextPath + "/runtime/"+application+"/users/selectbox/department?deptId=" + deptId).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    //角色
    getRoles: function(application, roleId, type, pageSize, pageNum, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/"+application+"/users/selectbox/role?roleId=" + roleId + "&type=" + type + '&pageSize=' + pageSize + '&pageNum=' + pageNum).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },

    getAddressBook: function(jsonData, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox/contacts",{params:jsonData}).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },

    //通讯录联系人分页
    //http://localhost:8080/obpm/runtime/users/selectbox/contacts?pageNum=2&pageSize=10
    ContactPage: function(pageNum, pageSize, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox/contacts?pageNum=" + pageNum +"&pageSize=" + pageSize).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    //部门树分页
    ///runtime/HdPeBqYwJyFyjHkhZu3/users/selectbox/department?deptId=Z42xU8LmniRouZ93E7s&pageNum=3&pageSize=10
    departmentPage: function(application, deptId,pageNum, pageSize, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/"+application+"/users/selectbox/department?deptId="+deptId +"&pageNum="+ pageNum +"&pageSize=" + pageSize).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    //查询分页
    //http://localhost:8080/obpm/runtime/users/selectbox/search?keyWord=&pageNum=2&pageSize=10
    searchPage: function(keyWord, pageNum, pageSize, { onSucess, onError }) {
        instance.get(contextPath + "/runtime/users/selectbox/search?keyWord="+ keyWord +"&pageNum="+ pageNum +"&pageSize=" + pageSize).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    //上传图片
    ///runtime/upload?applicationId={applicationId}&allowedTypes={allowedTypes}&fieldId={fieldId}&fileSaveMode={fileSaveMode}&path={path}&actionType={actionType}
    uploadFile: function(files, appId, allowedTypes, fieldId, fileSaveMode, path, actionType,{ onSucess, onError }, callback1, uid) {
        axios({
            headers: {
                "content-type": "multipart/form-data;boundary=" + Math.random()
            },
            data: files,
            url: contextPath + "/runtime/upload?applicationId=" +
                appId +
                "&allowedTypes=" +
                allowedTypes +
                "&fieldId=" +
                fieldId +
                "&fileSaveMode=" +
                fileSaveMode +
                "&path=" +
                path +
                "&actionType=" +
                actionType,
            method: "post",
            onUploadProgress:(progressEvent) => { 
                let complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%';
                let num =  (progressEvent.loaded / progressEvent.total * 100 | 0);
                let obj = {
                    complete: complete,
                    num: num,
                    uid: uid,
                }
                callback1(obj);
            }
        }).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },
    
    //上传图片
    uploadImages: function(files, appId, allowedTypes, fieldId, fileSaveMode, path, actionType,{ onSucess, onError }, callback1, uid) {
        axios({
            headers: {
                "content-type": "multipart/form-data;boundary=" + Math.random()
            },
            data: files,
            url: contextPath + "/runtime/upload?applicationId=" +
                appId +
                "&allowedTypes=" +
                allowedTypes +
                "&fieldId=" +
                fieldId +
                "&fileSaveMode=" +
                fileSaveMode +
                "&path=" +
                path +
                "&actionType=" +
                actionType,
            method: "post",
            onUploadProgress:(progressEvent) => { 
                let complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%';
                let num =  (progressEvent.loaded / progressEvent.total * 100 | 0);
                let obj = {
                    complete: complete,
                    num: num,
                    uid: uid,
                }
                callback1(obj);
            }
        }).then(function (response) {
            if(onSucess) onSucess(response);
        }).catch(
            function (error) {
                if(onError) onError(error);
            }
        )  
    },


    /**
     *  视图选择框确认执行脚本
     */
    runViewDialogConfirmScript: function (docJson, { onSucess, onError }) {
        instance.post(contextPath + "/runtime/views/selectbox/runViewDialogConfirmScript",docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    /*
        获取个人设置页面的软件列表
    */ 
   GetsoFtwareList:function({onSucess,onError}){
        instance.get(contextPath + "/runtime/applications").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error){
            if(onError) onError(error);
        })
   },

   /**
    * 个人信息设置
    * 请求地址/runtime/usersetups/detail
    */
   PersonalInformationSettings:function(data, {onSucess, onError}) {
       instance.post(contextPath + '/runtime/usersetups/detail',data).then(function(response){
            if(onSucess) onSucess(response);
       }).catch(function(error){
            if(onError) onError(error);
       })
   },

   /**
    * 皮肤设置
    * 请求地址:/runtime/users/skin
    */
   SkinSetting:function(data, {onSucess, onError}) {
       instance.post(contextPath + '/runtime/users/skin',data).then(function(response){
            if(onSucess) onSucess(response);
       }).catch(function(error){
            if(onError) onError(error);
       })
   },

   /**
    * 退出系统
    * 请求地址：/logout
    */
    LogOut:function({onSucess, onError}){
        instance.post(contextPath + '/runtime/logout?rdm=' + Math.random()).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error){
            if(onError) onError(error);
        })
     },
     LogOutAction:function({onSucess, onError}){
        instance.get(contextPath + "/logout.action?rdm="+ Math.random()).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error){
            if(onError) onError(error);
        })
     },
     
     //执行前脚本
    runBeforeActionScript: function(applicationId, id, data, actType, treedocid, _flowType,{onSucess, onError}) {
        let docId = data.docId?data.docId:'';
        let viewId = data.viewId?data.viewId:'';
        let formId = data.formId?data.formId:'';
        let templateForm = data.templateForm?data.templateForm:'';
        let parentId = data.parentId?data.parentId:'';
        let isRelate = data.isRelate?data.isRelate:'';
        let acttype = actType?actType:'';
        let flowType = _flowType ? _flowType : '';
        let url = contextPath + "/runtime/"+ applicationId +"/activities/"+ id +"/runbeforeactionscript?docId=" + docId + "&viewId=" + viewId + "&formId=" + formId + "&_templateForm=" + templateForm + "&parentId=" + parentId + "&isRelate=" + isRelate + '&actType=' + acttype+ '&_flowType=' + flowType;
        if(treedocid) {
            url = url + "&treedocid=" + treedocid;
        }
        instance.post(url,data).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },    
    //执行后脚本
    ///runtime/HdPeBqYwJyFyjHkhZu3/activities/zLjmORGWoZmG7wXf8LF/runafteractionscript?docId=jPF4VGFTnIrk4wMwonl&viewId=&formId=IfoHRC8Rs6njW75HqiE&_templateForm=&parentId=&_=1566437405210
    runAfterActionScript: function(applicationId, id, docId, viewId, formId, _templateForm, parentId, _, data, actType, treedocid,{onSucess, onError}) {
        let url = contextPath + "/runtime/"+ applicationId +"/activities/"+ id +"/runafteractionscript?docId=" +docId +"&viewId="+ viewId + "&formId=" + formId + "&_templateForm=" + _templateForm + "&parentId=" + parentId + "&_=" + _ + '&actType=' + actType;
        if(treedocid) {
            url = url + "&treedocid=" + treedocid;
        }
        if(data.isRelate) {
            url = url + "&isRelate=" + data.isRelate;
        }
        instance.post(url,data).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },


    //文件下载
    ///http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/activities/qS1l5oy9mA6wFjvYimO/download?docId=__hV1Ofp1vnl48vBkTeQx&newTime=1614146122549
    documentDownload: function(applicationId, docId, actId, {onSucess, onError}) {
        instance({
            url: contextPath + "/runtime/"+ applicationId +"/activities/" + actId + "/download?docId=" + docId,
            method: 'post',
            // responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    viewDocumentDownload: function(applicationId, docId, actId, jsonData, {onSucess, onError}) {
        let url =  contextPath + "/runtime/"+ applicationId +"/activities/" + actId + "/download?docId=" + docId;
        let parentId = jsonData.parentId ? jsonData.parentId : ''
        let isRelate = jsonData.isRelate ? jsonData.isRelate : ''
        url += "&parentId=" + parentId + 
            "&isRelate=" + isRelate
        instance({
            url:url,
            method: 'post',
            // responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //http://localhost:8081/obpm/runtime/file/download?filename=&filepath=/uploads/exceltemplate/%E6%93%8D%E4%BD%9C%E6%8C%89%E9%92%AE%E8%A1%A8%E5%8D%95.xls/
    templateDownload: function(fileName, filepath, {onSucess, onError}) {
        instance({
            url: contextPath + "/runtime/file/download?filename=" + fileName + "&filepath=" + filepath,
            method: 'post',
            responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },


    //http://localhost:8081/obpm/runtime/file/isFileExisted?filename=&filepath=/&newTime=1619146358715&_=1619146358039
    getFileExisted: function(fileName, filepath, {onSucess, onError}) { 
        instance({
            url: contextPath + "/runtime/file/isFileExisted?filename=" + fileName + "&filepath=" + filepath,
            method: 'get',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },


    //5.0PDF导出
    ///runtime/{applicationId}/forms/{formId}/documents/{docId}/activities/exportPdf
    trunkPDFExport: function(applicationId, formId, docId, data, {onSucess, onError}) {
        instance({
            url: contextPath + "/runtime/"+ applicationId +"/forms/"+ formId +"/documents/"+docId+"/activities/exportPdf",
            method: 'post',
            data: data,
            // responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    //4.4PDF导出
    stablePDFExport: function(applicationId, formId, docId, {onSucess, onError}) {
        instance({
            url: contextPath + "/runtime/"+ applicationId +"/forms/"+ formId +"/documents/"+docId+"/activities/exportPdf",
            method: 'post',
            responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //Excel
    //sOZu9kthmxyP8qQfq0e/views/zIDoeHr26TZtP1kZMdr/activities/exportExcel?actId=&filename=&isExpSub=false&parentId=&isRelate=undefined
    exportExcel: function(applicationId, viewId, actId, filename, isExpSub, parentId, isRelate, params, obj, {onSucess, onError}) {
        let data = '';
        if(params) {
            for(let key in params) {
                data += "&" + encodeURIComponent(key) + "=" + params[key]
            }
        }
        instance({
            url: contextPath + "/runtime/"+ applicationId +"/views/"+ viewId +"/activities/exportExcel?actId=" + actId + "&filename=" + filename + "&isExpSub=" + isExpSub + "&parentId=" + parentId + "&isRelate=" + isRelate + data,
            method: 'post',
            responseType: 'blob',
            data:obj,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    //excell导出进度条接口
    exportExcelProgress: function({onSucess, onError}) {
        instance({
            url: contextPath + "/runtime/exportExcel/readProcess",
            method: 'get',
        }).then(function(response) {
            if(onSucess) onSucess(response)
        }).catch(function(response) {
            if(onError) onError(error)
        })
    },
    //excell导出进度条接口
    importExcelProgress: function({onSucess,onError}) {
        instance({
            url: contextPath + "/runtime/importExcel/readProcess",
            method: 'get'
        }).then(function(response) {
            if(onSucess) onSucess(response)
        }).catch(function(response) {
            if(onError) onError(error)
        })
    },

    //上传Excel文件
    //http://localhost:8081/obpm/portal/FrontFileAndImageUploadServlet?data=nullpath:IMPORTEXCEL_PATH,fileSaveMode:undefined,fieldid:null,allowedTypes:xls;xlsx,applicationid:sOZu9kthmxyP8qQfq0e
    uploadExcel: function(jsonData, {onSucess, onError}) {
        instance({
            url: contextPath + "/portal/FrontFileAndImageUploadServlet",
            method: 'post',
            data:jsonData,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },



    //流程图接口（h5的接口）
    //http://localhost:8081/obpm/portal/dynaform/document/viewFlow.action?_docid=Bb8UEPb583uwa3tJ38Z&_instanceId=NRo4wpRuOejquOQGZxz&dateTime=1567495362264
    getViewFlow: function(docId, instanceId, dateTime, {onSucess, onError}) {
        instance.get(contextPath + "/portal/dynaform/document/viewFlow.action?_docid="+ docId +"&_instanceId="+ instanceId + "&dateTime=" + dateTime).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    
    //获取常用意见
    ///runtime/users/{userId}/commonOpinions
    getMostUseSuggestion: function(userId, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/" + userId + "/commonOpinions").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //添加常用意见
    ///runtime/users/{userId}/commonOpinions?opinion={opinion}
    AddMostUseSuggestion: function(userId, opinion, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/users/" + userId + "/commonOpinions?opinion="+opinion).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
     
    //删除常用意见
    ///runtime/users/{userId}/commonOpinions/{opId}
    deleteMostUseSuggestion: function(userId, opId, {onSucess, onError}) {
        instance.delete(contextPath + "/runtime/users/" + userId + "/commonOpinions/" + opId).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //修改意见
    ///runtime/users/{userId}/commonOpinions/{opId}?opinion={opinion}
    editMostUseSuggestion: function(userId, opId, opinion, {onSucess, onError}) {
        instance.put(contextPath + "/runtime/users/" + userId + "/commonOpinions/" + opId + "?opinion=" + opinion).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //流程处理中获取头像
    //http://localhost:8081/obpm/contacts/contacts/getAvatar.action?id=GShxHeYbLQQ3d4Vy58b
    getAvatar: function(id, {onSucess, onError}) { //H5的接口
        instance.put(contextPath + "/contacts/contacts/getAvatar.action?id=" + id).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //获取流程图
    getFlowchart: function(appid, docId, stateId, randomNumber,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/"+appid+"/documents/" + docId + "/workflows/" + stateId+ "/flowchart?_=" + randomNumber).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

     //更新缓存中子表数据(子表为网格视图时使用)
    ///runtime/{applicationId}/documents/{id}/childs
    setGridView: function(appid, viewId, parentId, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/" + appid + "/views/" + viewId + "/documents/" + parentId + "/childs",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    getbillflow: function (data, { onSucess, onError }) {
        axios({
            headers: {'Content-Type': 'multipart/form-data;charset=UTF-8'},
            url: contextPath + "/"+ data,
            responseType: 'blob',
        }).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8081/obpm/portal/good/html/viewer.html?path=/uploads/doc/202003/9cf15bb6-4aa4-4df5-9709-719fc25fad50.doc&fileName=9cf15bb6-4aa4-4df5-9709-719fc25fad50.doc&name=9cf15bb6-4aa4-4df5-9709-719fc25fad50.doc&openWaterMark=false&waterMark=undefined&t=1564481981092
    getWordEditor: function(path, fileName, name, openWaterMark, waterMark, t,{onSucess, onError}) {
        instance.get(contextPath + "/portal/good/html/viewer.html?path=" + path + "&fileName=" + fileName + "&name=" + name + "&openWaterMark=" + openWaterMark + "&waterMark=" + waterMark + "&t=" + t).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //表单控件校验
    ///runtime/{applicationId}/documents/validate
    formValidation: function (appId, docJson, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/validate',docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

     
    //获取常用意见
    ///runtime/users/{userId}/commonOpinions
    getCommonOpinions: function(userId, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/" + userId + "/commonOpinions").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //提交面板的执行前
    submitRunBeforeActionScript: function(applicationId, id, data, docId, viewId, formId, _templateForm, parentId, isRelate, _flowType,{onSucess, onError}) {
        instance.post(contextPath + "/runtime/"+ applicationId +"/activities/"+ id +"/runbeforeactionscript?docId=" + docId + "&viewId=" + viewId + "&formId=" + formId + "&_templateForm=" + _templateForm + "&parentId=" + parentId + "&isRelate=" + isRelate + "&_flowType=" + _flowType,data).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //提交面板的执行后
    submitRrunAfterActionScript: function(applicationId, id, params, docId, viewId, formId, _templateForm, parentId, isRelate, _flowType,{onSucess, onError}) {
        instance.post(contextPath + "/runtime/"+ applicationId +"/activities/"+ id +"/runafteractionscript?docId=" + docId + "&viewId=" + viewId + "&formId=" + formId + "&_templateForm=" + _templateForm + "&parentId=" + parentId + "&isRelate=" + isRelate + "&_flowType=" + _flowType,params).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/Consuming
    //仪表分析
    //提交面板的执行后
    getConsuming: function(appId, jsonData,{onSucess, onError}) {
        instance.post(contextPath + "/runtime/"+ appId + "/Consuming",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //代理设置接口
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys?flowName=&pageNo=1&linesPerPage=10&_=1587881794427
    getproxys: function(appId, jsonData, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/usersetups/proxys",{params:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //添加代理保存
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys/save?id=
    saveProxys: function(appId, jsonData, id, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/"+ appId + "/usersetups/proxys/save?id=" + id,jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //获取代理流程
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys/flows?_=1587889209026
    getProxysFlow: function(appId,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/usersetups/proxys/flows").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //编辑代理流程
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys/o5g2bRmv0c0B1oVuCpM?_=1587953401510
    editProxysFlow: function(appId, id,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/usersetups/proxys/" + id).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    // //删除代理流程
    // http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys
    deleteProxysFlow: function(appId, arrIds,{onSucess, onError}) {
        instance.delete(contextPath + "/runtime/" + appId + "/usersetups/proxys", {data: arrIds}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //获取首页个人设置通讯录分组
    getContactGroup: function({onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/selectbox/contacts/group")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //保存首页通讯录新建的分组
    //http://localhost:8081/obpm/runtime/users/contacts/groups?name=%E9%A1%B6%E9%A1%B6%E9%A1%B6%E9%A1%B6
    saveContactGroup: function(name, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/users/contacts/groups?name=" + name,name).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //编辑首页通讯录新建的分组
    //http://localhost:8081/obpm/runtime/users/contacts/groups/__0nwxZFYKqQormss1ZBI?name=%E5%8F%91%E5%B9%BF%E5%91%8A
    editContactGroup: function(id, name, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/users/contacts/groups/" + id + "?name=" + name,name).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //删除首页通讯录新建的分组
    //http://localhost:8081/obpm/runtime/users/contacts/groups/__0nwxZFYKqQormss1ZBI
    deleteGroup: function(id, {onSucess, onError}) {
        instance.delete(contextPath + "/runtime/users/contacts/groups/" + id).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //添加新的数据到首页通讯录分组
    //http://localhost:8081/obpm
    addDataToGroup: function(id, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/users/contacts/groups/" + id + "/users",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //首页通讯录删除分组里的用户数据
    //http://localhost:8081/obpm
    deleteGroupUserList: function(id, jsonData, {onSucess, onError}) {
        instance.delete(contextPath + "/runtime/users/contacts/groups/"+ id + "/users", {data:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //全部部门的列表
    // http://localhost:8081/obpm
    getAllDeptList: function({onSucess, onError}) {
        instance.get(contextPath + "/runtime/department/list")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //获得公告
    //http://localhost:8081/obpm/message/messages/announcement?_=1588829750160
    getAnnouncement: function({onSucess, onError}) {
        instance.get(messagePath + "/message/messages/announcement")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //发公告
    //http://localhost:8081/obpm/message/messages/announcement
    makeAnnouncement: function(jsonData, {onSucess, onError}) {
        axios({
            headers: {
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url: messagePath + "/message/messages/announcement",
            method: 'post',
            data: jsonData,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //发布公告
    //http://localhost:8081/obpm/message/messages
    annouce: function(jsonData, {onSucess, onError}) {
        axios({
            headers: {
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url: messagePath + "/message/messages",//contextPath + "/message/messages",
            method: 'post',
            data: jsonData,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    //获取热门话题
    //http://localhost:8080/message/api/message/messages/hot/topics?top=6
    getHotThemelist:function(topic, {onSucess, onError}) {
        instance.get(messagePath + "/message/messages/hot/topics"+"?topic="+topic)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //搜索话题
    //http://localhost:8080/message/api/message/messages/list
    getThemelist:function(searchTopic, {onSucess, onError}) {
        instance.get(messagePath + "/message/messages/list"+"?topic="+searchTopic)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //信息管理-企业动态公告列表
    //http://localhost:8081/obpm/message/messages/list?_=1588230210399
    getMessagesList: function({onSucess, onError}) {
        instance.get(messagePath + "/message/messages/list")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    
    //获取评论回复
    //http://localhost:8081/obpm/message/comment?messageId=__hgqhG93gkiBTIaqcNND&_=1588234679724
    getMessagesReplay: function(id, {onSucess, onError}) {
        instance.get(messagePath + "/message/comment?messageId=" + id)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //评论回复
    doComment: function(jsonData, {onSucess, onError}) {
        axios({
            headers: {
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url: messagePath + "/message/comment",
            method: 'post',
            data: jsonData,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //消息管理-工作事项-流程
    //http://localhost:8081/obpm/message/notice?readStatus=&type=0&_currpage=1&_rowcount=30
    getNotice: function(data, {onSucess, onError}) {
        instance.get(messagePath + `/message/notice?readStatus=${data.readStatus}&type=${data.type}&_currpage=${data._currpage}&_rowcount=${data._rowcount}`)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //删除工作事项
    //http://localhost:8081/obpm/message/notice?noticeId=__yP7DDIDfmi097yyUGKc
    deleteNotice: function(noticeId, {onSucess, onError}) {
        instance.delete(messagePath + "/message/notice?noticeId=" + noticeId)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //获取我回复的
    //http://localhost:8081/obpm/message/comment/my/reply?_currpage=1&_rowcount=30&_=1588819405740
    getMyreply: function(_currpage, _rowcount, {onSucess, onError}) {
        instance.get(messagePath + "/message/comment/my/reply?_currpage=" + _currpage + "&_rowcount=" + _rowcount)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //获取回复我的
    //http://localhost:8081/obpm/message/comment/my/receive?_currpage=1&_rowcount=30&_=1588819405742
    getReceive: function(_currpage, _rowcount, {onSucess, onError}) {
        instance.get(messagePath + "/message/comment/my/receive?_currpage=" + _currpage + "&_rowcount=" + _rowcount)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //全部标记已读
    //http://localhost:8081/obpm/message/notice/allRead
    setAllRead: function({onSucess, onError}) {
        instance.put(messagePath + "/message/notice/allRead")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    // http://localhost:8081/obpm/message/notice/read?noticeId=__rGJrdh5McwSl0y7ovLw
    noticeRead:  function(noticeId,{onSucess, onError}) {
        instance.put(messagePath + "/message/notice/read?noticeId=" + noticeId)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //http://localhost:8081/obpm/message/comment?commentId=__8X34cOJ3BAu5DcufrbZ&messageId=__pXF1751980bwn9b9nbn
    deleteReply: function (commentId, messageId, { onSucess, onError }) {
        instance.delete(messagePath + "/message/comment?commentId=" + commentId + "&messageId=" + messageId).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8081/obpm/message/messages?messageId=__MMHdmCOJtczmHsaEHmg
    deleteMessage:  function (messageId, { onSucess, onError }) {
        instance.delete(messagePath + "/message/messages?messageId=" + messageId).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    lockAnnouncementInfo: function(messageId, {onSucess, onError}) {
        instance.get(messagePath + "/message/messages?messageId=" + messageId)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //修改自己的登录密码
    //http://localhost:8081/obpm/runtime/usersetups/password
    updatePassword: function(jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/usersetups/password",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //http://localhost:8081/obpm/message/notification?_=1588921548331
    getNotification: function({onSucess, onError}) {//使用instance写会继承500的拦截器,频繁报错
        axios({
            url:  messagePath + "/message/notification",
            method: 'get',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //http://localhost:8081/obpm/message/notification/login?_=1594020502704
    getNotificationNum: function({onSucess, onError}) {
        instance.get(messagePath + "/message/notification/login")
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    // http://localhost:8081/obpm/message/notification/count?_=1591251768378
    getMessage: function(radomNum,{onSucess, onError}) {
        instance.get(messagePath + "/message/notification/count?_=" + radomNum)
        .then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    getChart: function(id, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/chart/"+id).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    getChartData: function(id, data, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/chart/"+id, data).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    getWidgetsIscript: function(id, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/widgets/"+id).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    getCustomreports: function(id, params, {onSucess, onError}) {
        let url = contextPath + "/runtime/report/showjrxml/" + id
        let urlParams = ''
        if(params instanceof Object) {
            let ur = ''
            for(let key in params) {
                ur += "&" + key + "=" + params[key]
            } 
            urlParams = "?" + ur
            url += urlParams
        }
        instance.post(url, params).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    getCustomreportsHtml: function(url, {onSucess, onError}) {
        instance.post(obpmFilePath + url).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    getPrintCustomreports: function(id, docid,{onSucess, onError}) {
        instance.post(contextPath + "/runtime/report/showjrxml/"+id + "?docid=" + docid).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    searchReports: function(id, docid, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/report/showjrxml/"+id + "?docid=" + docid, jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },
    

    //导出报表
    //http://localhost:8081/obpm/runtime/report/exportexcel/__9M30I7ZscGZKSI1qIR2?
    exportReportExcel: function(id, params, {onSucess, onError}) {
        let url =  contextPath + "/runtime/report/exportexcel/" + id + "?"
        if(params) {
            url += params
        }
        axios({
            headers : {
                'Content-Type' : 'application/json',
            },
            url,
            method: 'POST',
            responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response)
        }).catch(function(error) {
            if(onError) onError(error)
        })

    },

    //http://localhost:8081/obpm/runtime/report/exportpdf/__mXw1keqArTCt2UrAoie?docid=undefined
    exportReportPdf: function(id, params, {onSucess, onError}) {
        let url =  contextPath + "/runtime/report/exportpdf/" + id + "?"
        if(params) {
            url += params
        }
        axios({
            headers : {
                'Content-Type' : 'application/json',
            },
            url,
            method: 'POST',
            responseType: 'blob',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })

    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/views/__jNTf9yWQNpnWT2CLOj6/columns/__lBZrqQoxAY6lwK2gTCX/runActionScript
    runActionScript: function(appId, parentView, id, jsonData, {onSucess, onError}) {
        instance.put(contextPath + "/runtime/" + appId + "/views/" + parentView + "/columns/" + id + "/runActionScript",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    //移除在线用户
    removeOnlineUser: ({onSucess, onError}) => {
        instance.delete( contextPath + "/runtime/removeOnlineUser").then(response => {
            if(onSucess) onSucess(response);
        }).catch((error)=>{
            if(onError) onError(error);
        })
    },

    //流程提交时获取指定显示的用户
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/__xKeJfciUqTLp7o96vVY/workflows/fW1801qkQ6PsAcfxuI2/selectApprovers?nodeId=1566350840526&type=2&selectId=fBUXdkAlWTdGXqOq4cI
    getSelectApprovers: function(appId, docId, flowId, nodeId, type, selectId, pageNum, pageSize,  {onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId +"/documents/" + docId + "/workflows/" + flowId + "/selectApprovers?nodeId=" + nodeId + "&type=" + type + "&selectId=" + selectId + "&pageNum=" + pageNum + "&pageSize=" + pageSize).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    selectCirculators: function(appId, docId, flowId, nodeId, type, selectId, pageNum, pageSize,  {onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId +"/documents/" + docId + "/workflows/" + flowId + "/selectCirculators?nodeId=" + nodeId + "&type=" + type + "&selectId=" + selectId + "&pageNum=" + pageNum + "&pageSize=" + pageSize).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },



    //http://localhost:8081/obpm/runtime/flowcenters/navs/carboncopy?applicationId=&isread=true&_=1594186597018
    navCarboncopy: function(jsonData,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/flowcenters/navs/carboncopy",{params:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/flowcenters/carboncopy?title=&flowId=&initiatorId=&isRead=true&isMyWorkFlow=false&appId=sOZu9kthmxyP8qQfq0e&_=1594187825052
    getCarboncopyList: function(appId, jsonData,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/flowcenters/carboncopy",{params:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //http://localhost:8081/kms/kms/files/data?fileName=&orderByfield=CREATE_DATE&orderMode=desc&pageNo=1&linesPerPage=10&_=1594349604925
    getKmsFiles: function(jsonData,{onSucess, onError}) {
        let url = "";
        if(statiContextPath){
            url = "kms/api/kms/files/data";
        }else{
            url = kmsPath + "kms/kms/files/data";
        }
        instance.get(url,{params:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },
    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/__KAgeEc3BJ3Bsje9ow4n/formhelper/inputlog?fieldName=%E6%96%87%E6%9C%AC%E6%A1%86&_=1594884665008
    getOperationLogs: function(appId, docId, jsonData,{onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/documents/" + docId + "/formhelper/inputlog",{params:jsonData}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //获取自由流程可回退用户
    //runtime/{applicationId}/workflows/{instanceId}/hisActorsFreeFlow
    getHisActorsFreeFlow: function(appId, instanceId, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/"+appId+"/workflows/"+instanceId+"/hisActorsFreeFlow").then(function(response){
             if(onSucess) onSucess(response);
         }).catch(function(error) {
             if(onError) onError(error);
         })   
    },

    getAxecuteAddress: function(appId, actId, jsonData, {onSucess, onError}) {
        let isRelate = jsonData.isRelate ? jsonData.isRelate : ''
        let parentId = jsonData.parentId ? jsonData.parentId : ''
        instance.put(contextPath + "/runtime/" + appId + "/activities/" + actId + "/executeAddress?isRelate=" + isRelate + "&parentId=" + parentId,jsonData).then(function(response){
             if(onSucess) onSucess(response);
         }).catch(function(error) {
             if(onError) onError(error);
         })   
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/batch
    //保存网格视图
    saveGridview: function(appId, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/" + appId + "/documents/batch",jsonData).then(function(response){
             if(onSucess) onSucess(response);
         }).catch(function(error) {
             if(onError) onError(error);
         })   
    },

    downloadWaterMarkFile: function(waterMarkSetting, name, path, {onSucess, onError}) {
        let url;
        if(statiContextPath){
            url = kmsPath + "kms/api/portal/dynaform/document/previewWaterMark?waterMarkSetting=" + encodeURI(waterMarkSetting);
        }else{
            url = contextPath + "/portal/dynaform/document/previewWaterMark?waterMarkSetting=" + encodeURI(waterMarkSetting)
        }
        instance.get(url).then(function(response){
            if(onSucess) onSucess(response);
         }).catch(function(error) {
            if(onError) onError(error);
         })   
    },
    importFile: function(form, nullpath, fileSaveMode, fieldid, allowedTypes, appId, {onSucess, onError}) {
        axios({
            headers: {
                "content-type": "multipart/form-data;boundary=" + Math.random()
            },
            data: form,
            url: contextPath + "/portal/FrontFileAndImageUploadServlet?data=" + 
                "nullpath:" + nullpath + 
                ",fileSaveMode:" + fileSaveMode + 
                ",fieldid:" + fieldid + 
                ",allowedTypes:" + allowedTypes + 
                ",applicationid:" + appId,
            method: "post"
         }).then(function(response){
             if(onSucess) onSucess(response);
         }).catch(function(error) {
             if(onError) onError(error);
         })   
    },
    kmMenuShow: function(appId, {onSucess, onError}){
        instance.get(contextPath + '/runtime/domains/realmAndTeam').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    //http://localhost:8081/obpm/?_time=1606184838377
    reportSearchformtemplate: function(appId, id, {onSucess, onError}){
        instance.get(contextPath + '/runtime/report/' + id + '/searchformtemplate/'+ appId).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },
    
    chartSearchformtemplate: function(appId, id, {onSucess, onError}){
        instance.get(contextPath + '/runtime/chart/' + id + '/searchformtemplate/'+ appId).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    beforescript: function(appId, parentView, id, jsonData, {onSucess, onError}) {
        instance.put(contextPath + "/runtime/" + appId + "/views/" + parentView + "/columns/" + id + "/beforescript",jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    deleteKmsFile: function (appId, formId, docId, path, { onSucess, onError }) {
        instance.delete(contextPath + '/runtime/files/delete?applicationId=' + appId + '&formId=' + formId + '&docId=' + docId + '&path=' + path).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    messageUploadFile: function (form, { onSucess, onError }) {
        axios({
            headers: {
                "content-type": "multipart/form-data;boundary=" + Math.random()
            },
            data: form,
            url: messagePath + "/message/servlet/upload",
            method: "post"
        }).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },
    markAsRead: function({onSucess, onError}){
        instance.get(contextPath + '/runtime/flowcenters/pendings/allRead').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    //http://localhost:8088/obpm/api/runtime/sOZu9kthmxyP8qQfq0e/usersetups/proxys/flows?subject=ff&newTime=1614925197956&_=1614924146008
    getSearchProxysFlows: function(appId, subject, {onSucess, onError}){
        instance.get(contextPath + '/runtime/' + appId +'/usersetups/proxys/flows?subject=' + subject).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/__7HJy8rmhSNErVJGc50I/htmlsignature
    getHTMLsignature: function(appId, docId, {onSucess, onError}) {
        axios({
            url:  contextPath + '/runtime/' + appId + '/documents/' + docId +'/htmlsignature',
            method: 'get',
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    getPDFsignature: function(appId, docId, jsonData, {onSucess, onError}) {
        axios({
            url:  contextPath + '/runtime/' + appId + '/documents/' + docId +'/htmlsignature',
            method: 'put',
            data: jsonData,
        }).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //http://localhost:8081/obpm/runtime/sOZu9kthmxyP8qQfq0e/documents/pdfsignatures
    getPdfsignatures: function (appId, docJson, { onSucess, onError }) {
        instance.post(contextPath + '/runtime/' + appId + '/documents/' + 'pdfsignatures',docJson).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /*
      *获取评论列表
    */
    getCommentList: function(appId, docId, {onSucess, onError}) {
        instance.get(contextPath + '/runtime/' + appId + '/flags/' + docId +'/comments').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    
    /*
      *获取回复列表
    */
    getReplyList: function(appId, commentId, {onSucess, onError}) {
        instance.get(contextPath + '/runtime/' + appId + '/comments/' + commentId +'/answers').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    /*
      *发表评论（回复）
    */
    publishComment: function(appId, docId, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/" + appId + "/flags/" + docId + "/comments", jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    setLike: function(appId, commentId, {onSucess, onError}) {
        instance.put(contextPath + "/runtime/" + appId + "/comments/" + commentId + "/like").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    setUnlike: function(appId, commentId, {onSucess, onError}) {
        instance.put(contextPath + "/runtime/" + appId + "/comments/" + commentId + "/unlike").then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })
    },

    getLikesCount: function(appId, docId, {onSucess, onError}) {
        instance.get(contextPath + '/runtime/' + appId + '/flags/' + docId +'/comments/count').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    getUserAvatar: function(id, {onSucess, onError}) {
        instance.get(contextPath + '/runtime/' + '/users/' + id +'/avatar').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    // http://localhost:8081/obpm/runtime/users/signs
    getSigns: function({onSucess, onError}) {
        instance.get(contextPath + '/runtime/' + '/users/signs').then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        }) 
    },

    //http://localhost:8081/obpm/runtime/users/signs?newTime=1629286776901&_=0.13518071888741412
    deleteSigns: function(idsArray, {onSucess, onError}) {
        instance.delete(contextPath + '/runtime/' + '/users/signs', {data: idsArray}).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    /*
    签到
    */
    ///api/runtime/{applicationId}/widgets/{widgetId}/checkin
    setCheckin: function(appId, widgetId, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/" + appId + "/widgets/" + widgetId + "/checkin", jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    getCheckin: function(appId, widgetId, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/widgets/" + widgetId + "/checkin",).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    signInStatistics: function(appId, widgetId, countType, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/" + appId + "/widgets/" + widgetId + "/checkins?countType=" + countType).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },
    
    //http://localhost:8088/obpm/api/portal/share/component/sign/upload?uuid=0db22859-3b4b-4bcc-b46b-35547c806910
    signatureUploadFile: function (form, uuid, { onSucess, onError }) {
        axios({
            headers: {
                "content-type": "multipart/form-data;boundary=" + Math.random()
            },
            data: form,
            url: contextPath + "/portal/share/component/sign/upload?uuid=" + uuid,
            method: "post"
        }).then(function (response) {
            if (onSucess) onSucess(response);
        }).catch(
            function (error) {
                if (onError) onError(error);
            }
        );
    },

    //http://localhost:8088/obpm/api/runtime/users/signs?newTime=1629376062888&_=0.3008344824478604
    saveSignature: function(jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/users/signs", jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    //http://localhost:8088/obpm/api/runtime/users/signs/488a9a78-1be8-4030-8dfa-3cdfaba7e3a4?password=11&newTime=1629445225786&_=1629442979156
    signConfirmPassword: function(id, password, {onSucess, onError}) {
        instance.get(contextPath + "/runtime/users/signs/" + id + "?password=" + password).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    //http://localhost:8088/obpm/api/runtime/sOZu9kthmxyP8qQfq0e/documents/__Ho3xdXM0JdMzVbAQPWR/activities/sign?newTime=1629448296439&_=0.952910109673961
    confirmSignature: function(appId, docId, jsonData, {onSucess, onError}) {
        instance.post(contextPath + "/runtime/" + appId + "/documents/" + docId + "/activities/sign", jsonData).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    ///api/runtime/{applicationId}/views/{id}/documents?parentId={parentId}&isRelate={isRelate}&fieldName={fieldName}//
    filterViewColumn: function(appId, viewId, fieldName, params, data, {onSucess, onError}) {
        let urlParams = '';
        let parentId = params.parentId ? params.parentId : '';
        let sortCol = params.sortCol ? params.sortCol : '';
        let sortStatus = params.sortStatus ? params.sortStatus : '';
        let currpage = params.currpage ? params.currpage : '1';
        let lines = params.lines ? params.lines : 30;
        let treedocid = params.treedocid ? params.treedocid : '';
        let parentNodeId = params.parentNodeId ? params.parentNodeId : '';
        let docid = params.docid ? params.docid : '';
        let fieldid = params.fieldid ? params.fieldid : '';
        let isRelate = params.isRelate ? params.isRelate : '';
        let startDate = params.startDate ? params.startDate : '';
        let endDate = params.endDate ? params.endDate : '';
        let exparams = params.exparams ? params.exparams : '';
        let parentParam = params.parentParam ? params.parentParam : '';
        urlParams += '?parentId=' + parentId + '&sortCol=' + sortCol +
            '&sortStatus=' + sortStatus + '&_currpage=' + currpage +
            '&lines=' + lines + '&treedocid=' + treedocid +
            '&parentNodeId=' + parentNodeId + '&_docid=' + docid +
            '&_fieldid=' + fieldid + '&isRelate=' + isRelate +
            '&startDate=' + startDate + '&endDate=' + endDate + 
            '&parentParam=' + parentParam +
            '&fieldName=' + fieldName;
        
        if (data && exparams) {
            data = Object.assign(data, exparams);
        }
        let url = "/runtime/" + appId + "/views/" + viewId + "/filterColumns" + urlParams
        // let url = "/runtime/" + appId + "/views/" + viewId + "/filterColumns?fieldName=" + fieldName 
        instance.post(contextPath + url, data ? data : {}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

    // getViewData: function (appId, viewId, params, data, { onSucess, onError }) {
    //     var urlParams = '';
    //     var parentId = params.parentId ? params.parentId : '';
    //     var sortCol = params.sortCol ? params.sortCol : '';
    //     var sortStatus = params.sortStatus ? params.sortStatus : '';
    //     var currpage = params.currpage ? params.currpage : '1';
    //     var lines = params.lines ? params.lines : '';
    //     var treedocid = params.treedocid ? params.treedocid : '';
    //     var parentNodeId = params.parentNodeId ? params.parentNodeId : '';
    //     var docid = params.docid ? params.docid : '';
    //     var fieldid = params.fieldid ? params.fieldid : '';
    //     var isRelate = params.isRelate ? params.isRelate : '';
    //     var startDate = params.startDate ? params.startDate : '';
    //     var endDate = params.endDate ? params.endDate : '';
    //     var exparams = params.exparams ? params.exparams : '';
    //     var parentParam = params.parentParam ? params.parentParam : '';
    //     urlParams += '?parentId=' + parentId + '&sortCol=' + sortCol +
    //         '&sortStatus=' + sortStatus + '&_currpage=' + currpage +
    //         '&lines=' + lines + '&treedocid=' + treedocid +
    //         '&parentNodeId=' + parentNodeId + '&_docid=' + docid +
    //         '&_fieldid=' + fieldid + '&isRelate=' + isRelate +
    //         '&startDate=' + startDate + '&endDate=' + endDate + 
    //         '&parentParam=' + parentParam;
            
    //     if (data && exparams) {
    //         data = Object.assign(data, exparams);
    //     }
    //     instance.post(contextPath + '/runtime/' + appId + '/views/' + viewId + '/documents' + urlParams,data ? data : {}).then(function (response) {
    //         if (onSucess) onSucess(response);
    //     }).catch(
    //         function (error) {
    //             if (onError) onError(error);
    //         }
    //     );
    // },

    saveViewSettings: function(data, {onSucess, onError}) {
        let url = "/runtime/users/views/settings"
        instance.post(contextPath + url, data ? data : {}).then(function(response){
            if(onSucess) onSucess(response);
        }).catch(function(error) {
            if(onError) onError(error);
        })   
    },

};

