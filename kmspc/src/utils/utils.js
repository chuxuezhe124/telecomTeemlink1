//编码hasn
export const encodeHash = (hash) => {
  return  encodeURI(hash)
}
//解码hash
export const decodeHash = (hash) => {
  return  decodeURI(hash);
}

/**
     * 获取cookie的值
     */
export const getCookie = (cname) =>{
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i=0; i<ca.length; i++) 
  {
    let c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length).toLocaleLowerCase()
  }
  return "";
}

export const spliceHash = (obj) => {
 let hash='';
 for (var key in obj){
      hash = hash + key+'='+obj[key]+'&';
  }
 return hash.substring(0,hash.length-1);
}

export const combineParams = (hash) => {
    
  let params = {};
  if(hash){
      let hashObj = hash.split("&");
      hashObj.map((e) => {
          let key_val = e.split("=");
          let key1 = key_val[0];
          let val1 = key_val[1];
          params[key1] = val1;
      })
  }
  
  return params;
}

export const handleTableListData = (data) => {
  data.map((e,key) => {
      data[key].key = e.id;
      data[key].isEditable = false; 
  });
  return data;
}

export const handleTableListDataWitdhNORename = (data) => {
  data.map((e,key) => {
      data[key].key = e.id;
  });
  return data;
}

//日期字符串转时间戳
export const dateToTime = (date) => {
  let time = new Date(date).getTime();
  return time;
}

//时间戳转日期字符串
export const TimeToDate = (time,formatString) => {
  formatString = formatString? formatString: "YYYY-MM-DD h:m:s";
  let now = new Date(time);
  let yy = now.getFullYear();      //年
  let mm = now.getMonth() + 1;     //月
  let dd = now.getDate();          //日
  let hh = now.getHours();         //时
  let ii = now.getMinutes();       //分
  let ss = now.getSeconds();       //秒
  // let date = yy + "-";
  // if(mm < 10) date += "0";
  // date += mm + "-";
  // if(dd < 10) date += "0";
  // date += dd + " ";
  // if(hh < 10) date += "0";
  // date += hh + ":";
  // if (ii < 10) date += "0"; 
  // date += ii + ":";
  // if (ss < 10) date += "0"; 
  // date += ss;
  // return date;

  let date;
  switch(formatString) {
      case "YYYY-MM-DD h:m:s":
          date = yy + "-";
          if(mm < 10) date += "0";
          date += mm + "-";
          if(dd < 10) date += "0";
          date += dd + " ";
          if(hh < 10) date += "0";
          date += hh + ":";
          if (ii < 10) date += "0"; 
          date += ii + ":";
          if (ss < 10) date += "0"; 
          date += ss;

          break;
      case "YYYY-MM-DD":
          date = yy + "-";
          if(mm < 10) date += "0";
          date += mm + "-";
          if(dd < 10) date += "0";
          date += dd;

          break;
  }
  return date;

}

//异步获取Json数据
export const serviceFetch = async(url, options, params) => {
  try {
      let _options = {
          ...options
      }
      if (params) {
          _options.body = JSON.stringify(params)

      }

      let result = await fetch(url, _options).then(response => response.json());
      return result;
  } catch (err) {
      console.log(err)
  }
}

/**
 * 获取预览文件的url
 * @param {Object} params 
 * params={
 *      'id'
 *      'diskId'
 *      'collected'
 * }
 * 
 * collected: 0 未收藏 1已收藏
 */
export const getPreviewUrl = (params) => {
  
  let preview_url = "";
  let preview_hash = "";
  const fileId = params.id;
  const diskId = params.diskId;
  const collected = params.collected ? params.collected : 0;

  preview_url = "./preview/preview.html";
  preview_hash = "#diskId="+diskId+"&fileId="+fileId+"&collected="+collected;
  preview_url += encodeHash(preview_hash);
  return preview_url;
}

/**
 * 获取URL后面的参数
 */
export const getQueryVariable = (variable) => {
  let query = window.location.hash.substring(1);
  let vars = query.split("?");
  for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (pair[0] == variable) {
          return pair[1];
      }
  }
  return (undefined);
}


/**
 * 获取判断单个文件、单个文件夹、批量下载的权限的url
 * @param {String} type 
 * @param {Object} apiParams 
 */
export const getDownloadAble_url = (contextPath,type,apiParams)=>{
  let downloadAble_url
  if(type == "batch"){
    downloadAble_url = contextPath + "/kms/downloadAble?";
    const folderIdsFileIds_url = getFolderIdsFileIds_url(apiParams);
    downloadAble_url += folderIdsFileIds_url;
    return downloadAble_url;
  }else if(type == "singleFile"){
    downloadAble_url = contextPath + "/kms/downloadAble?folderIds=&fileIds="+apiParams.fileId;
    return downloadAble_url;
  }else if(type == "singleFolder"){
    downloadAble_url = contextPath + "/kms/downloadAble?folderIds="+apiParams.fileId+"&fileIds=";
    return downloadAble_url;
  }
}


/**
 * 批量下载获取folderIds，fileIds字符串
 */
export const getFolderIdsFileIds_url = (apiParams)=>{
  let folderIds = "";
  let fileIds = "";
  let part_url = "";
  apiParams.map((e) => {
    if(e.isFolder) {
      folderIds += "&folderIds=" + e.fileObjectId;
    }else{
      fileIds += "&fileIds=" + e.fileObjectId;
    }
  })
  if(folderIds) {
    folderIds = folderIds.substring(1);
  }else {
    folderIds = "folderIds=";
  }
  if(!fileIds) {
    fileIds = "&fileIds="
  }
  part_url += folderIds;
  part_url += fileIds;
  return part_url;
}

/**
 * 返回上一级
 */
export const goBack = () => {
  history.go(-1);
}

export const getIsShowOperation = (user,record) => {
  const level = {  //角色类型
    ROLE_LEVEL_SUPERADMIN : 100,    //企业知识管理员  
    ROLE_LEVEL_COMMITTEEADMIN : 20,   //专委会知识管理员 
    ROLE_LEVEL_DEPTADMIN : 10,    //部门知识管理员
    ROLE_LEVEL_member : 0    //普通员工
  };
  const memberType = {    //成员类型
    TEAM_MEMBER_ADMIN : 1,
    TEAM_MEMBER_NORMAL : 0
  };
  const members = record.members;
  let isShowTeamOperation = false;
  //超级管理员、创建者、团队管理员这三个角色有操作团队的权限
  if(user.level == level.ROLE_LEVEL_SUPERADMIN) {
    isShowTeamOperation = true;
  }else if(user.id == record.creatorId){
    isShowTeamOperation = true;
  }else {
    members.map((e)=> {
      if(e.id == user.id && e.type == memberType.TEAM_MEMBER_ADMIN) {
        isShowTeamOperation = true;
      }
    });
  }
  return isShowTeamOperation;
}

/**
  获取页面的高度
 */
export const getClientHeight = (isShowHeard) => {
  /**
    55---->heard头部的高度
    48---->表格头的高度
    33---->底部授权信息
   */
  const windowHeight = document.documentElement.clientHeight;
  let clientHeight;
  if(isShowHeard){
    clientHeight = windowHeight - 55 - 48 -33 +'px';
  }else{
    clientHeight = windowHeight - 48 - 33 +'px';
  }
  return clientHeight;
}

/**
  文件预览地址
 */
export const filePreview = (params) => {
  let url = "";
  if(params.fileObj && (params.fileObj.type == "mp4" || params.fileObj.type == "mp3")){
    url = params.kmsFilePath + "/uploads/kms/" + params.fileObj.url;
  }else{
    url = (params.staticContextPath ? params.staticContextPath + params.kmsFilePath : params.kmsFilePath + "/kms") + "/asset/preview/preview.html#diskId=" 
        + params.diskId + "&fileId=" + params.fileId + "&collected=" + params.collected;
  }
  return url;
}
