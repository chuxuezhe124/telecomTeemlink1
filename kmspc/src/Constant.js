//4,4代码
// let pateName = window.document.location.pathname;
// let contextPath = pateName.substring(1,pateName.substr(1).indexOf('/')+1)
// if(contextPath == "/"){
//     contextPath = "/kms";
// }else{
//     //contextPath = "../../..";  //4.1and4.3stable 
//     contextPath = "..";         //trunk and 4.4stable
// }
// let staticContextPath = "";
// export default {
//     PermissionType_READONLY: 1, //只读
//     PermissionType_MODIFY: 2, //可编辑
//     PermissionType_HIDDEN: 3,   //隐藏
//     PermissionType_DISABLED: 4,  //不可用
//     PermissionType_PRINT: 5,    //输出
//     contextPath: contextPath,
//     staticContextPath: staticContextPath
// }



//5.0代码
const contextPath = "/kms";
contextPath = contextPath + "/api";
const staticContextPath = "/static";
export default {
    PermissionType_READONLY: 1, //只读
    PermissionType_MODIFY: 2, //可编辑
    PermissionType_HIDDEN: 3,   //隐藏
    PermissionType_DISABLED: 4,  //不可用
    PermissionType_PRINT: 5,    //输出
    contextPath: contextPath,
    staticContextPath: staticContextPath,
}