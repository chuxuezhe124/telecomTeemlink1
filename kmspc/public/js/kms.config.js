// 4.4代码
// let pateName = window.document.location.pathname;
// let contextPath = pateName.substring(1,pateName.substr(1).indexOf('/')+1)
// if(contextPath == "/"){
//     contextPath = "/kms";
// }else{
//     //contextPath = "../../..";  //4.1and4.3stable 
//     contextPath = "..";         //trunk and 4.4stable
// }
// let staticContextPath = "";
// let kmsFilePath = contextPath;

// let kmsConfig = {
//     contextPath: contextPath,
//     staticContextPath: staticContextPath,
//     kmsFilePath: kmsFilePath,
//     signonContextPath: '/signon'
// }







// 5.0代码
let contextPath = "/kms/api";
let staticContextPath = "/static";
let kmsFilePath = "/kms";
let onlyofficJsPath="http://localhost/web-apps/apps/api/documents/api.js"
let kmsConfig = {
    contextPath: contextPath,
    staticContextPath: staticContextPath,
    kmsFilePath: kmsFilePath,
    signonContextPath: '/signon',
    onlyofficJsPath:onlyofficJsPath,
}