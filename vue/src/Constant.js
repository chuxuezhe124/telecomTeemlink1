let pateName = window.document.location.pathname;
let contextPath = pateName.substring(1,pateName.substr(1).indexOf('/')+1);
let kmsPath = pateName.substring(1,pateName.substr(1).indexOf('/')+1);
if(contextPath == "/"){
    contextPath = "obpm";
    kmsPath = "";
}else{
    contextPath = "../..";  //4.1and4.3stable 
    kmsPath = "../../../";
}
let currentPath =  window.location.href;
let accessToken = ''
if(currentPath.indexOf("accessToken") > -1) {
    let list = currentPath.split("&");
    for(let i=0; i<list.length; i++) {
        if(list[i].indexOf("accessToken") > -1) {
            let index = list[i].indexOf('accessToken=')
            accessToken = list[i].substr(index + 12, list[i].length)
            break
        }
    }
    localStorage.setItem("accessToken", accessToken)
}else {
    let tokenData = document.cookie
    let list = tokenData.split("; ")
     for (let i = 0; i < list.length; i++) {
        let pair = list[i].split("=")
        if (pair[0] == "accessToken") {
            accessToken = pair[1]
            break
        }
    }
    localStorage.setItem("accessToken", accessToken)
}
export default {
    PermissionType_READONLY: 1,
    PermissionType_MODIFY: 2,
    PermissionType_HIDDEN: 3,
    PermissionType_DISABLED: 4,
    PermissionType_PRINT: 5,
    contextPath: contextPath,
    accessToken: accessToken,
    kmsPath: kmsPath,
}