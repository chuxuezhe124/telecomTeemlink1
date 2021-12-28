/* require.config.js */
var __debug__ = false; //打开调试模式为true，则不会使用编译后的template
//获取Token的值
var accessToken = ""
var query = window.location.search.substring(1);
var vars = query.split("&");
for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == "accessToken") {
        accessToken = pair[1];
    }
}
if(!accessToken){
    var cookie = document.cookie.substring(document.cookie.indexOf("accessToken")+12);
    if(cookie.indexOf(";") > -1){
        accessToken = cookie.substring(0, cookie.indexOf(";"));
    } else {
        accessToken = cookie;
    }
}else{
    document.cookie = "accessToken=" + accessToken + ";path=/";
}

//用户可以在这里配置项目路径
var contextPath = "/obpm";
//配置消息模块
var messageContextPath = "/message";
//kms项目名配置
var kmsContextPath = "/kms";
//static项目名配置
var staticContextPath = "/static";
//signon项目名配置
var signonContextPath = "/signon";

var contentPath = staticContextPath + "/portal/good/";

var obpmContextPath = sessionStorage.getItem("obpmContextPath");

var isTrunk = sessionStorage.getItem("isTrunk");
let cp = '';
if(isTrunk == 'true') { //5.0
    contextPath = contextPath + "/api";
}
messageContextPath = messageContextPath + "/api";
kmsContextPath = kmsContextPath + "/api";

// TODO 暂时多页引发问题处理方法
var interceptUrl = top.window.location.href.indexOf("index") >= 0 ? "html/" : "";
require.config({
    // urlArgs: "_=" + (new Date()).getTime(),  //取消注释可以为js清楚缓存，仅在调试时使用，生产环境应注销
    baseUrl: contentPath + "js/", //针对非单页面处理
    paths: {
        "jquery": "lib/jquery-1.11.3.min",
        "ZeroClipboard": "lib/zeroclipboard/ZeroClipboard",
        "toastr": "lib/showMessage/toastr.min",
        "sweetalertDev": "lib/showMessage/sweetvigilance-dev",
        "artDialog": "lib/dialog/artDialog/jquery.artDialog.source",
        "artDialogIframeTools": "lib/dialog/artDialog/plugins/iframeTools.source",
        "viewer": "lib/viewer.min",
        "template": __debug__ ? "lib/template" : "template",//arttemplate 调试模式
        // "template": "template",//arttemplate 引用编译后 tmod
        "nicescroll": "lib/jquery.nicescroll",
        "pagination": "lib/jquery.pagination",
        "qrcode": "lib/jquery.qrcode-0.12.0",
        "datetimepicker": "lib/datetimepicker/bootstrap-datetimepicker",
        "moment": "lib/datetimepicker/moment-with-locales",
        "webuploader": "lib/webuploader",
        "selectFile": "lib/selectFile",
        "typeahead": "lib/typeahead.jquery.min",
        "multiselect2side": "lib/jquery.multiselect2side",
        "UE": "lib/ueditor/ueditor.all.min",
        "ue_config": "lib/ueditor/ueditor.config",
        "viewer": "lib/viewer.min",
        "async": "lib/async",
        'BMap': ['https://api.map.baidu.com/api?v=2.0&ak=mXijumfojHnAaN2VxpBGoqHM'],
        'jstree': "lib/tree/jquery.jstree",
        'wtree': "lib/dialog/wtree",
        'bootstrap': "lib/bootstrap.min",
        "holmes": "lib/holmes",
        "cookie": "lib/jquery.cookie",
        "Masonry": "lib/jquery.masonry.min", // 暂时没使用
        "bootstrap-datetimepicker": "lib/datetimepicker/bootstrap-datetimepicker.min",
        "datetimepickerZh": "lib/datetimepicker/bootstrap-datetimepicker.zh-CN",
        "echarts": "lib/echarts",
        "jqueryUi": "lib/jquery-ui.min",
        "fly": "lib/jquery.fly.min",
        "AC_OETags": "lib/AC_OETags",
        'FormBMap': ['https://api.map.baidu.com/api?v=1.4'],
        "laydate": 'lib/laydate/laydate',
        "sweelateDev": 'lib/showMessage/sweetvigilance-dev',
        "i18n": 'lib/i18n/jquery.i18n.properties',
        // 'jSignature':'lib/jSignature/jSignature.min',
        // "FormBMap"
        // 工具包 (天气 sweelate 水印 不支持)

        "common": 'util/obpm.common',
        "api": "util/obpm.api",
        "watermark": "util/obpm.watermark", //ie8不支持
        "formUtil": "util/obpm.form.util",
        "bridge": "util/jquery.bridge.obpm",
        "tool": "util/obpm.tool",
        "layui": "lib/layui/layui",
        /*****组件 start***/

        //组件 公共部分
        "Shared/activity": 'component/shared/obpm.activity',

        //组件 index部分
        "component/main": 'component/obpm.main',
        "component/bodytab": 'component/bodyTab',

        //组件 homepage部分
        "Home/homepage": 'component/Home/obpm.homepage',

        //组件 个人设置
        "Home/usersetup": 'component/Home/obpm.usersetup',

        //组件 form部分
        "Form/document": 'component/Form/obpm.document',
        "Form/formRender": 'component/Form/obpm.form.render',
        "Form/Printer": 'component/Form/obpm.printer',
        "FormControls/sign": 'component/Form/FormControls/obpm.sign',
        "FormControls/kinggridHTMLSignature": 'component/Form/FormControls/obpm.kinggridHTMLSignature',
        "FormControls/calctextField": 'component/Form/FormControls/obpm.calctextField',
        "FormControls/checkboxField": 'component/Form/FormControls/obpm.checkboxField',
        "FormControls/dateField": 'component/Form/FormControls/obpm.dateField',
        "FormControls/inputField": 'component/Form/FormControls/obpm.inputField',
		"FormControls/noField": 'component/Form/FormControls/obpm.noField',
        "FormControls/radioField": 'component/Form/FormControls/obpm.radioField',
        "FormControls/textareaField": 'component/Form/FormControls/obpm.textareaField',

        "FormControls/selectField": 'component/Form/FormControls/obpm.selectField',
        "FormControls/selectCheckBox": 'component/Form/FormControls/obpm.selectCheckBox',
        "FormControls/departmentField": 'component/Form/FormControls/obpm.departmentField',
        "FormControls/viewDialogField": 'component/Form/FormControls/obpm.viewDialogField',
        "FormControls/treeDepartmentField": 'component/Form/FormControls/obpm.treeDepartmentField',
        "FormControls/flowHistoryField": 'component/Form/FormControls/obpm.flowHistoryField',

        // "FormControls/JqueryweixinGpsField": 'component/Form/FormControls/weixinGpsField/jquery.weixinGpsField',
        "FormControls/weixinGpsField": 'component/Form/FormControls/weixinGpsField/obpm.weixinGpsField',

        "FormControls/htmlEditorField": 'component/Form/FormControls/htmlEditor/obpm.htmlEditorField',
        "FormControls/includedView": 'component/Form/FormControls/obpm.includedView',
        "FormControls/genericWordField": 'component/Form/FormControls/obpm.genericWordField',
        "FormControls/flowReminderHistoryField": 'component/Form/FormControls/obpm.flowReminderHistoryField',
        "FormControls/surveyField": 'component/Form/FormControls/obpm.surveyField',
        "FormControls/selectAboutField": 'component/Form/FormControls/obpm.selectAboutField',

        "FormControls/JqueryweixinRecord": 'component/Form/FormControls/weixinRecord/jquery.weixinRecord',
        "FormControls/weixinRecord": 'component/Form/FormControls/weixinRecord/obpm.weixinRecord',

        "FormControls/baiduMap": 'component/Form/FormControls/map/obpm.baiduMap',
        "FormControls/baiduMapAPI": 'component/Form/FormControls/map/baiduMapAPI',

        "FormControls/onlineTakePhoto": 'component/Form/FormControls/onlinetakephoto/obpm.onlineTakePhoto',
        "FormControls/JqueryOnlineTakePhoto": "component/Form/FormControls/onlinetakephoto/jquery.onlineTakePhoto",

        "FormControls/userField": 'component/Form/FormControls/obpm.userField',
        "FormControls/suggestField": 'component/Form/FormControls/obpm.suggestField',
        "FormControls/fileUploadField": 'component/Form/FormControls/upload/obpm.fileUploadField',
        "FormControls/kmsDataField": 'component/Form/FormControls/upload/obpm.kmsDataField',

        "FormControls/imageUploadField": 'component/Form/FormControls/upload/obpm.imageUploadField',
        "FormControls/qrcodeUtil": "component/Form/FormControls/qrcode/jquery.qrcodeField",
        "FormControls/qrcodeField": 'component/Form/FormControls/qrcode/obpm.qrcodeField',
        "FormControls/tabNormalField": 'component/Form/FormControls/tabField/obpm.tabNormalField',
        "FormControls/tabCollapseField": 'component/Form/FormControls/tabField/obpm.tabCollapseField',
        "FormControls/tabListField": 'component/Form/FormControls/tabField/obpm.tabListField',
        "FormControls/buttonField": 'component/Form/FormControls/obpm.buttonField',

        // 组件 WorkFlow
        "WorkFlow/workflow": "component/WorkFlow/obpm.workflow",
        "WorkFlow/flowCenter": "component/WorkFlow/obpm.flowCenter",
        "WorkFlow/efficiency": "component/WorkFlow/obpm.efficiency",
        "WorkFlow/flowCenterCore": "component/WorkFlow/obpm.flowCenter.core",
        "WorkFlow/flowCenterService": "component/WorkFlow/obpm.flowCenter.service",
        "WorkFlow/meterAnalysis": "component/WorkFlow/obpm.meterAnalysis",
        "WorkFlow/WorkFlowPanel": "component/WorkFlow/obpm.workFlowPanel",
        "WorkFlow/carboncopy": "component/WorkFlow/obpm.carboncopy",

        // 组件 View
        "View/baseview": "component/View/obpm.baseview",
        "ViewControls/calendarview": "component/View/ViewControls/obpm.calendarview",
        "ViewControls/collapseview": "component/View/ViewControls/obpm.collapseview",
        "ViewControls/cardview": "component/View/ViewControls/obpm.cardview",
        "ViewControls/editview": "component/View/ViewControls/obpm.editview",
        "ViewControls/tabview": "component/View/ViewControls/obpm.tabview",
        "ViewControls/gridview": "component/View/ViewControls/obpm.gridview",
        "ViewControls/listview": "component/View/ViewControls/obpm.listview",
        "ViewControls/ganttview": "component/View/ViewControls/obpm.ganttview",
        "ViewControls/listviewDialog": "component/View/ViewControls/obpm.listview.dialog",
        "ViewControls/mapview": "component/View/ViewControls/obpm.mapview",
        "ViewControls/treeview": "component/View/ViewControls/obpm.treeview",
        "ViewControls/treeviewDialog": "component/View/ViewControls/obpm.treeview.dialog",
        /*****组件 end***/

        // 入口函数 (不使用data-main 方式会存在加载机制问题)

        // "form": "view/require.form",
        // "index": "view/index",
    },
    map: {
        '*': {
            'css': 'lib/css'
        }
    },
    shim: {
        "artDialogIframeTools": {
            deps: ["artDialog"],
            exports: "artDialog"
        },
        "artDialog": {
            deps: ["jquery"],
            exports: "artDialog"
        },
        "nicescroll": {
            deps: ["jquery"]
        },
        "typeahead": {
            deps: ["jquery"]
        },
        "watermark": {
            deps: ["jquery"]
        },
        "FormControls/sign": {
            deps: ["jquery"]
        },
        "qrcode": {
            deps: ["jquery"]
        },
        "FormControls/qrcodeUtil": {
            deps: ["jquery"]
        },
        "datetimepicker": {
            deps: ["jquery", "moment"]
        },
        "pagination": {
            deps: ["jquery"]
        },
        "webuploader": {
            deps: ["jquery"],
            exports: 'WebUploader'
        },
        "selectFile": {
            deps: ["webuploader"],          //ie8存在问题 需要使用upload的flash 版本
            exports: "FU"
        },
        // "multiselect2side": {
        //     deps: ["jquery"],
        //     exports: "multiselect2side"
        // },
        // "FormControls/JqueryOnlineTakePhoto": {
        //     deps: ["jquery"]
        // },
        "UE": {
            deps: ["ue_config"],
            exports: "UE"
        },
        'BMap': {
            deps: ['jquery'],
            exports: 'BMap'
        },
        'jstree': {
            deps: ['jquery']
        },
        'wtree': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'Masonry': {                 //没使用
            deps: ['jquery'],
            exports: 'Masonry'
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery']
        },
        'datetimepickerZh': {
            deps: ["bootstrap-datetimepicker"],
            expoets: "bootstrap-datetimepicker"
        },
        // 'FormControls/JqueryweixinGpsField': {
        //     deps: ['jquery','common']
        // },
        'FormControls/JqueryweixinRecord': {
            deps: ['jquery']
        },
        'fly': {
            deps: ['jquery']
        }
    },
    waitSeconds: 0
});