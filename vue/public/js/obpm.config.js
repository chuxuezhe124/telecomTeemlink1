/**
 * 4.4
 * **/
// let _myAppsPateName = window.document.location.pathname;
// let _myAppsContextPath = _myAppsPateName.substring(1,_myAppsPateName.substr(1).indexOf('/')+1);
// let _myAppsKmsPath = _myAppsContextPath;
// let _myAppsObpmFilePath = ''; //所有图片，文件打开用这个路径
// if(_myAppsContextPath == "/"){
//   _myAppsContextPath = "/obpm";
//   _myAppsKmsPath  = "";
// }else{
//   _myAppsContextPath = "../..";  //4.1and4.3stable 
//   _myAppsKmsPath  = "../../../";
// }
// let inx = _myAppsPateName.substr(1).indexOf("/");
// _myAppsObpmFilePath = _myAppsPateName.substr(0, inx + 1);
// if(!_myAppsObpmFilePath) {
//   _myAppsObpmFilePath = "/obpm";
// }else {
//   let urlName = _myAppsPateName.substring(1,_myAppsPateName.substr(1).indexOf('/')+1);
//   _myAppsObpmFilePath = window.location.origin + "/" + urlName;
// }

// let obpmConfig = {
//   contextPath: _myAppsContextPath,
//   statiContextPath: "",
//   signonContextPath: "/signon",
//   obpmFilePath: _myAppsObpmFilePath,
//   messagePath: "/obpm",
// }

/**
 * 5.0
 * **/
let obpmConfig = {
  contextPath: "/obpm/api",
  statiContextPath: "/static",
  obpmFilePath: "/obpm",
  signonContextPath: "/signon",
  messagePath: "/message/api",
}