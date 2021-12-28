import store from './store'
// 引入 axios
import axios from 'axios';
import {
  getDownloadAble_url
} from "@/utils/utils.js"
const contextPath = kmsConfig.contextPath;
const staticContextPath = kmsConfig.staticContextPath
const signonContextPath = kmsConfig.signonContextPath
//http response 拦截器
axios.interceptors.response.use(
  response => {
    store.commit("instanceDialog", false);
    return response;
  },
  error => {
    if (error.response.status == 401) {
      if (store.state.user && store.state.user.id) {
        store.commit("instanceDialog", true);
      } else {
        let url;
        if (staticContextPath) {
          url = "http://" + window.location.host + staticContextPath + signonContextPath + "/index.html";
        } else {
          url = "http://" + window.location.host + signonContextPath + "/index.html";
        }
        window.location.href = url;
      }
    } else {
      return Promise.reject(error)
    }
  }
);
axios.defaults.withCredentials = true;
export default {

  //获取当前用户
  getMyProfile: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/users/myprofile').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  /**
   * 退出登录
   */
  logout: function ({
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/runtime/logout',
      method: 'POST',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },
  /**
   * 
   * 超时登录
   */
  signonLogin: function(jsonData,{ onSucess, onError }){
    let url;
    if(staticContextPath){
        url = "/obpm/api/runtime/login/loginWithCiphertext2"
    }else{
        url = signonContextPath + "/runtime/login/loginWithCiphertext2"
    }
    axios.post(url,jsonData)
    .then(function (response) {
        if (onSucess) onSucess(response);
    }).catch(
        function (error) {
            if (onError) onError(error);
        }
    );
},
  /**
   * 个人信息设置
   */
  detail: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/usersetups/detail',
      method: 'POST',
      data: dataJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },
  /**
   * 密码设置
   */
  password: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/usersetups/password',
      method: 'POST',
      data: dataJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  /**
   * 上传文件
   */
  fileUpload: function (diskId, folderId, dataJson, {
    onSucess,
    onError
  }, callback1, uid) {
    axios({
      headers: {
        "content-type": "multipart/form-data;boundary=" + Math.random()
      },
      url: contextPath + '/kms/upload?diskId=' + diskId + '&folderId=' + folderId,
      method: 'POST',
      data: dataJson,
      onUploadProgress: (progressEvent) => {
        let complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%';
        let num = (progressEvent.loaded / progressEvent.total * 100 | 0);
        // console.log('上传----> ' + complete)
        let obj = {
          complete: complete,
          num: num,
          uid: uid,
        }
        callback1(obj);
      }
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },
  /**
   * 
   * 上传文件夹
   */
   folderUpload:function (dataJson, {
    onSucess,
    onError
  },callback1) {
    axios({
      headers: {
        "content-type": "multipart/form-data;boundary=" + Math.random()
      },
      url: contextPath + '/kms/folder/upload',
      method: 'POST',
      data: dataJson,
      onUploadProgress: (progressEvent) => {
        console.log(progressEvent)
        let complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%';
        let num = (progressEvent.loaded / progressEvent.total * 100 | 0);
        console.log('上传----> ' + complete)
        let obj = {
          complete: complete,
          num: num,
          // uid: uid,
        }
        callback1(obj);
      }
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },




  /**
   * 异步获取当前用户
   */
  getMyProfileAwait: async () => {
    let result = await axios.get(contextPath + '/kms/users/myprofile');
    return result;
  },
  /**
   * 获取首页我的上传量数据
   * @param {*} originType 文件来源类型
   */
  getUserUploadFileCount: function (originType, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/files/userUploadFileCount?originType=' + originType).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  /**
   * 获取首页我的排行版
   * @param {*} originType 文件来源类型
   */
  getAllUserUploadFileCount: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/files/getAllUserUploadFileCount?linesPerPage=' + param.linesPerPage + '&pageNo=' + param.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //获取部门下的用户
  getDeptUser: function (departmentId, pageSize, pageNum, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/users/selectbox/departments/' + departmentId + '?pageNo=' + pageNum + '&linesPerPage=' + pageSize).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //通讯录
  getContactUser: function (keyword, pageSize, pageNum, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/users/selectbox/search?keyword=' + keyword + '&pageNo=' + pageNum + '&linesPerPage=' + pageSize).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //创建空文档
  createEmptydoc: async (params) => {
    let _url = contextPath + '/kms/disks/' + params.diskId + '/folders/' + params.folderId;
    let result = await axios({
      url: _url,
      method: "POST",
    });
    return result;
  },


  //资料检索
  //获取搜索数据
  getFilesSearch: async (params) => {
    let result = await axios.get(contextPath + '/kms/search/files/lastest_search?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage);
    return result;
  },
  //根据条件进行查询
  filesSearch: function (params, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/search/files?keyWord=' + params.keyWord + params.scope + '&selectTitle=' + params.selectTitle + '&selectContent=' + params.selectContent +
        '&creator=' + params.creator + '&beginTime=' + params.beginTime + '&endTime=' + params.endTime +
        '&categoryIds=' + params.categoryIds + '&pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage,
      method: 'get',
      data: params,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },
  //获取最新浏览数据
  getNewPreview: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/lastest_view?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取最新分享数据
  getNewShare: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/lastest_share?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //获取onlyoffice的key值
  getOnlyofficeKey:function(fileId, {
    onSucess,
    onError
  }) {
    {
      axios.get(contextPath + '/edit/key?id='+fileId).then(function (response) {
        if (onSucess) onSucess(response);
      }).catch(
        function (error) {
          if (onError) onError(error);
        }
      )
    }
  },
  //获取最新上传数据
  getNewUpload: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/lastest_upload?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取最新搜索数据
  getNewSearch: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/lastest_search?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取最热文章的数据
  getHotView: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/hot_view?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },


  //专委会设置
  //获取专委会列表
  getCommitteeKmData: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/realms?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //创建专委会
  createCommittee: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/realms',
      method: 'post',
      data,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  // 删除专委会
  // data：["专委会id","专委会id2",…]
  deleteCommittee: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/realms',
      method: 'DELETE',
      data
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //编辑专委会
  //data : 
  // {
  //     "id": "",
  //     "name": "",
  //     "orderNo": ""
  // }
  editCommittee: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/realms',
      method: 'PUT',
      data
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //部门设置-获取部门选择框数据
  getDepartmentsData: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/departments').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //部门设置-创建部门网盘
  createDeptDisks: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/disks/departments',
      method: 'POST',
      data,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  /**
   * 编辑部门网盘序号
   * @param {*} data 
   * @param {*} param1 
   */
  handleEditDeptDisk: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/disks/' + data.id,
      method: 'PUT',
      data
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  // 删除部门网盘
  // data：["部门id","部门id2",…]
  deleteDeptDisks: function (data, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/disks',
      method: 'DELETE',
      data
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },



  //管理员入口模块
  //获取部门km设置列表
  //获取网盘集合
  getdisksData: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/disks/departments?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //授权-获取用户列表
  getUsers: async (params) => {
    const url = contextPath + "/kms/users/?departmentId=" + params.departmentId + "&nameOrAccount=" +
      params.nameOrAccount + "&roleId=" + params.roleId + "&linesPerPage=" + params.linesPerPage + "&pageNo=" +
      params.pageNo;
    let result = await axios.get(url);
    return result;
  },

  //授权-绑定角色
  bindRole: async (params) => {
    let result = await axios({
      url: contextPath + "/kms/users/userroleset",
      method: "POST",
      data: params
    });
    return result;
  },

  //获取管理员标签树
  getLabelTreeView: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/categorys/tree').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //获取标签类别
  getTagCategory: async () => {
    let result = await axios({
      url: contextPath + "/kms/categorys/files/count",
      method: "GET"
    });
    return result;
  },

  //获取标签分类列表
  getKmsFilesList: async (params) => {
    const categoryName = params.categoryName;
    const userIds = params.userIds;
    const beginTime = params.beginTime;
    const endTime = params.endTime;
    const linesPerPage = params.linesPerPage;
    const pageNo = params.pageNo;
    const url = contextPath + "/kms/files?categoryName=" + categoryName + "&userIds=" + userIds + "&beginTime=" + beginTime + "&endTime=" + endTime + "&linesPerPage=" + linesPerPage + "&pageNo=" + pageNo;
    let result = await axios({
      url: url,
      method: "GET"
    });
    return result;
  },
  //获取管理员标签添加
  getLabelTreeAdd: function (docJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/categorys",
      method: 'post',
      data: docJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取管理员标签删除
  getLabelTreeDelete: function (docJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/categorys",
      method: 'delete',
      data: docJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //修改管理员标签
  getLabelTreeEdit: function (docJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/categorys",
      method: 'put',
      data: docJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //报表数据检索
  getReportSoure: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/reports/query?region=' + params.region + '&operationType=' + params.operationType + '&deptId=' + params.departmentId + '&userId=' + params.userId + '&startDate=' + params.startDate + '&endDate=' + params.endDate).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取报表数据
  getChartData: async() => {
    let result = await axios.get(contextPath + "/kms/contributor/fileCount?topCount=10");
    return result;
  },
  /**
   * 获取水印信息
   */
  getWatermark: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/watermark/config').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  /**
   * 文档水印设置修改
   */
  putWatermark: function (docJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/watermark/config",
      method: 'put',
      data: docJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },



  //员工km
  //获取我的代办代办信息
  getMypeddingMessage: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/users/' + params.userId + '/pending/applications?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //我的代办代办同意操作
  agreeOperation: function (params, dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/applications/' + params.id,
      method: 'put',
      data: dataJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //我的代办代办不同意操作
  disAgreeOperation: function (params, dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/applications/' + params.id,
      method: 'put',
      data: dataJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取我的代办已办信息
  getProcessingMessage: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/users/' + params.userId + '/disposing/applications?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取知识地图我的代办信息
  getKnowledgeMypeddingMessage: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/maps/' + params.userId + '/pending?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取知识地图我的代办已办信息
  getKnowledgeProcessingMessage: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/maps/' + params.userId + '/disposing?linesPerPage=' + params.linesPerPage + '&pageNo=' + params.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //点击我的代办知识地图
  getKnowledge: function (id, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps/" + id,
      method: "get",
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //我的文库
  //获取用户的km团队和知识专题的开关
  getKmTeamAndRealm: async () => {
    let result = await axios.get(contextPath + "/kms/realmAndTeam");
    return result;
  },

  //获取我的文库列表
  getMyLibraryList: async (params) => {
    const orderByfield = params.orderByfield ? params.orderByfield : "NAME";
    const orderMode = params.orderMode ? params.orderMode : "ASC";
    const disksFolders_url = contextPath + "/kms/disks/" + params.diskId + "/folders/" + params.folderId +
      "/files?orderByfield=" + orderByfield + "&orderMode=" + orderMode + "&pageNo=" + params.pageNo + "&linesPerPage=" + params.linesPerPage;
    let result = await axios.get(disksFolders_url);
    return result;
  },


  //获取分享列表数据
  getShareList: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/disks/' + params.userId + '/sharefiles?orderByfield=' + params.orderByfield + '&orderMode=' + params.orderMode + '&pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取最新编辑数据
  getRecentlyEditors: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/myRecent_edit?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取最新上传数据
  getRecentlyUpload: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/myLastest_upload?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //查看是否可以进行预览
  getPreviewAble: function (id, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/previewAble/files/" + id).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //查看是否可以进行预览
  getFilePreviewAble: function (fileId, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/previewAble/files/" + fileId).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //获取最新搜索数据
  getRecentSearch: function (params, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/search/files/myLastest_search?pageNo=' + params.pageNo + '&linesPerPage=' + params.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //获取审批人信息
  getApprovers: function (id, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/applications/approvers?resourceId=" + id).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //申请权限
  appAuthority: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + '/kms/applications',
      method: 'post',
      data: dataJson,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //打开预览文件
  previewAble: function (id, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/disks/files/" + id + "/preview").then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //我的订阅获取左边内容
  getSubscriptions: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/subscriptions?userId=" + param.userId + "&linesPerPage=" + param.linesPerPage + "&pageNo=" + param.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //我的订阅获取右边动态
  getSubscriptionsNotices: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/subscriptions/notices?userId=" + param.userId + "&linesPerPage=" + param.linesPerPage + "&pageNo=" + param.pageNo).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //我的日志列表
  getMyDiary: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/users/" + param.userid + "/logs?keyWord=" + param.keyWord + "&operationType=" + param.operationType + "&pageNo=" + param.pageNo + "&linesPerPage=" + param.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //语音转文字
  speechText: function (param, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/speech/speechToText?fromType=" + param.option,
      method: "post",
      //data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //获取科大讯飞的历史上传记录
  historyUpload: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/speech/speechToText/iflyTek/history?pageNo=" + param.pageNo + "&linesPerPage=" + param.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //获取科大讯飞的上传历史记录
  getHistory: async () => {
    let result = await axios({
      url: contextPath + "/kms/speech/speechToText/iflyTek/history?pageNo=1&linesPerPage=10",
      method: "GET",
    });
    return result;
  },

  //获取科大讯飞的上传历史记录转换的语音文件
  getSpeechToText: async (taskId) => {
    let result = await axios({
      url: contextPath + "/kms/speech/speechToText/text?" + "taskId=" + taskId,
      method: "GET",
    });
    return result;
  },

  //文字转语音
  speechVoice: function (param, dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/speech/textToSpeech?fromType=" + param.fromType + "&speechType=" + param.speechType,
      method: "post",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //文字转语音
  textToSpeech: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/speech/textToSpeech?fromType=' + params.type + '&speechType=' + params.voiceType,
      method: "POST",
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: params.value
    });
    return result;
  },




  //知识专题
  //知识专题标签
  getKnowledgeTabList: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/realms/list').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //知识订阅
  knowledgeSubscriptions: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/subscriptions",
      method: "post",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //取消知识订阅
  deleteKnowledgeSubscriptions: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/subscriptions",
      method: "delete",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //判断是否订阅
  getIsKnowledgeSubscriptions: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/realms/" + param.id + "/isSubscription").then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //知识专题表单
  getKnowledgeTableList: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/realms/" + param.id + "/maps?title=" + param.title + "&pageNo=" + param.pageNo + "&linesPerPage=" + param.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //删除知识专题数据
  deleteKnowledge: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps",
      method: "delete",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //知识专题数据操作维护
  knowledgeMaintain: function (param, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps/" + param.id + "/maintenance",
      method: "put",
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },


  //新建知识地图获取部门KM的数据
  getKnowledgeDepartments: function (param, {
    onSucess,
    onError
  }) {
    axios.get(contextPath + "/kms/disks/departments?pageNo=" + param.pageNo + "&linesPerPage=" + param.linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
  //检索的文件名称查询
  getSearchFiles: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/disks/folders/files?fileName=" + dataJson.fileName + "&orderByfield=" + dataJson.orderByfield + "&pageNo=" + dataJson.pageNo + "&linesPerPage=" + dataJson.linesPerPage,
      method: "get",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //查看部门KM的文件
  getDepartmentsFiles: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/disks/folders/files?ownerId=" + dataJson.ownerId + "&orderByfield=" + dataJson.orderByfield + "&pageNo=" + dataJson.pageNo + "&linesPerPage=" + dataJson.linesPerPage,
      method: "get",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //保存知识地图
  saveKnowledge: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps",
      method: "put",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //获取专委会管理员
  getCommitteeAdmin: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/users/roles/realmAdmin?&name=" + dataJson.name + "&pageNo=" + dataJson.pageNo + "&linesPerPage=" + dataJson.linesPerPage,
      method: "get",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //提交专委会管理员
  submitting: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps/submitting",
      method: "put",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },
  //知识地图回退
  rollback: function (params, dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/maps/" + params.mapId + "/rollback",
      method: "put",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },



  //部门km
  //网盘当前文件列表
  getDisksFoldersList: function (params, {
    onSucess,
    onError
  }) {
    const diskId = params.diskId;
    const folderId = params.folderId ? params.folderId : diskId;
    const pageNo = params.pageNo;
    const linesPerPage = params.linesPerPage;
    const orderByfield = params.orderByfield ? params.orderByfield : "NAME";
    const orderMode = params.orderMode ? params.orderMode : "ASC";
    const fileName = params.fileName ? params.fileName : "";
    axios.get(contextPath + '/kms/disks/' + diskId + '/folders/' + folderId + '/files?fileName=' + fileName + '&orderByfield=' + orderByfield + '&orderMode=' + orderMode + '&pageNo=' + pageNo + '&linesPerPage=' + linesPerPage).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //新建目录（文件夹）
  createFolder: async (params) => {
    const body = {
      "name": "新建文件夹",
      "diskId": params.diskId,
      "folderId": params.folderId
    }
    let result = await axios({
      url: contextPath + "/kms/disks/" + params.diskId + "/folders",
      method: "POST",
      data: body
    });
    return result;
  },

  //部门网盘浏览量和下载量
  getViewsAndDownloads: async (diskId) => {
    let result = await axios.get(contextPath + "/kms/disks/" + diskId + "/files/viewsAndDownloads");
    return result;
  },

  //部门当前网盘的网盘管理员
  getDiskAdmins: async (diskId) => {
    let result = await axios.get(contextPath + "/kms/disks/" + diskId + "/superadmins");
    return result;
  },

  //下载单个文件或目录
  handleSingleFileDownload: function (apiParams, {
    onSucess,
    onError
  }) {
    let downloadAble_url = "";
    const options = {
      method: 'GET',
      credentials: 'include',
      headers : { 'Accept': 'application/json', 'Content-Type': 'text/plain'}
  }
    if (apiParams.folder) {
      downloadAble_url = getDownloadAble_url(contextPath,"singleFolder", apiParams);
    } else {
      downloadAble_url = getDownloadAble_url(contextPath,"singleFile", apiParams);
    }
    axios({
      url: downloadAble_url,

      method: 'GET',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  /**
   * 文件点击编辑的时候看是否有编辑的权限
   * @param {*} fileId 
   */
  getEditAbleFile: function (fileId, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/editAble/files/" + fileId,
      method: 'GET',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //获取授权审批人
  getResourceApprover: function (resourceId, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/applications/approvers?resourceId=" + resourceId,
      method: 'GET',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //申请权限
  applyAuthority: async (params) => {
    let result = await axios({
      url: contextPath + "/kms/applications",
      method: "POST",
      data: params
    });
    return result;
  },
  
  /**
   * 批量下载
   */
  handleFileObjDownload: function (params, {
    onSucess,
    onError
  }) {
    const downloadAble_url = getDownloadAble_url(contextPath, "batch", params);
    axios({
      url: downloadAble_url,
      method: 'GET',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //删除多个文件
  deleteFileObj: function (diskId, params, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/disks/" + diskId + "/fileObjs",
      method: 'DELETE',
      data: params,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //重命名目录
  handleRenameFolderOk: async (apiParams) => {
    let params = {
      name: apiParams.name
    }
    let result = await axios({
      url: contextPath + "/kms/disks/" + apiParams.diskId + "/folders/" + apiParams.folderId + "/rename",
      method: "PATCH",
      data: params
    });
    return result
  },

  //重命名文件
  handleRenameFilesOk: async (apiParams) => {
    let params = {
      name: apiParams.name
    }
    let result = await axios({
      url: contextPath + "/kms/disks/" + apiParams.diskId + "/files/" + apiParams.fileId + "/rename",
      method: "PATCH",
      data: params
    });
    return result
  },

  //删除单个文件
  deleteFile: async (params) => {
    const diskId = params.diskId;
    const folderId = params.folderId;
    let url = "";
    if (params.isfolder) {
      url = contextPath + "/kms/disks/" + diskId + "/folders/" + folderId;
    } else {
      const fileId = params.fileId;
      url = contextPath + "/kms/disks/" + diskId + "/files/" + fileId;
    }
    let result = await axios({
      url: url,
      method: "DELETE",
    });
    return result;
  },

  //文件夹置顶
  stickFolder: async (diskId, folderId) => {
    let result = await axios({
      url: contextPath + "/kms/disks/" + diskId + "/folders/" + folderId + "/top",
      method: "PATCH",
    });
    return result;
  },

  //文件夹取消置顶
  cancelStickFolder: async (diskId, folderId) => {
    let result = await axios({
      url: contextPath + "/kms/disks/" + diskId + "/folders/" + folderId + "/top",
      method: "DELETE",
    });
    return result;
  },


  /**获取目录树
   *  @params {String} diskId
   * @params {Array} folderIds移动文件的id(String)，或者id集合(array)
   */
  getFolderstree: async (diskId, selectedFileArray) => {
    let folderIds = "";
    selectedFileArray.map((e) => {
      if (e.isFolder) {
        folderIds += "&folderIds=" + e.fileObjectId;
      }
    });
    if (folderIds) {
      folderIds = folderIds.substring(1);
    }
    const movefile_url = contextPath + "/kms/disks/" + diskId + "/foldersTree?" + folderIds;
    let result = await axios.get(movefile_url);
    return result;
  },

  //获取团队阶段树
  getTeamtreeData: async () => {
    let result = await axios.get(contextPath + "/kms/teams/stagesTree");
    return result;
  },

  //文件内部分享
  handleInsideShareFile: function (apiParams, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/disks/" + apiParams.diskId + "/files/" + apiParams.fileId + "/insideshare",
      method: "post",
      data: apiParams.userIds
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //外部分享复制链接
  outSideShareFile: async (apiParams) => {
    let result = await axios.get(contextPath + "/kms/files/" + apiParams.fileId + "/outsideshare");
    return result;
  },

  //移动单个文件/目录
  handleMoveFile: function (apiParams, {
    onSucess,
    onError
  }) {
    let movefile_url = "";
    if (apiParams.isfolder) { //移动单个目录api
      movefile_url = contextPath + "/kms/disks/" + apiParams.diskId + "/folders/" + apiParams.folderId + "/moveto/folderId/" + apiParams.destfolderId;
    } else { //移动单个文件api
      movefile_url = contextPath + "/kms/disks/" + apiParams.diskId + "/files/" + apiParams.fileId + "/moveto/folderId/" + apiParams.destfolderId;
    }

    axios({
      url: movefile_url,
      method: 'PATCH',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })

    // let result = await axios({
    //   url: movefile_url,
    //   method: "PATCH",
    // });
    // return result;
  },

  //批量移动文件、目录
  handleMoveFileObj: function (apiParams, {
    onSucess,
    onError
  }) {
    let movefile_url = contextPath + "/kms/disks/" + apiParams.diskId + "/fileObjs/moveto/folders/" + apiParams.destfolderId;
    axios({
      url: movefile_url,
      method: 'PATCH',
      data: apiParams.fileObjs
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //文件收藏（指定文件夹）
  handleCollectFile: function (params, {
    onSucess,
    onError
  }) {
    let movefile_url = contextPath + "/kms/disks/" + params.diskId + "/files/" + params.fileId + "/collect/folder/" + params.folderId;
    axios({
      url: movefile_url,
      method: 'GET',
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(function (error) {
      if (onError) onError(error);
    })
  },

  //文件收藏（指定文件夹）
  // handleCollectFile: async(params) => {
  //   let result = await axios.get(contextPath + "/kms/disks/"+params.diskId+"/files/"+params.fileId+"/collect/folder/"+params.folderId);
  //   return result;
  // },

  //面包屑
  getBreadcrumbData: async (id) => {
    let result = await axios.get(contextPath + "/kms/disks/folders/" + id + "/path/list");
    return result;
  },

  //获取标签
  getCategory: async () => {
    let result = await axios.get(contextPath + "/kms/categorys");
    return result;
  },

  //获取文件的标签
  getFileCategorys: async (fileId) => {
    let result = await axios.get(contextPath + "/kms/files/" + fileId + "/categorys");
    return result;
  },

  //贴标签
  pasteCategory: async (fileId, params) => {
    let url = contextPath + "/kms/files/categorys?fileIds=" + fileId + "&categorys=" + params;
    let result = await axios({
      url: url,
      method: "PUT",
    });
    return result;
  },

  /**
   * 批量贴标签
   */
  pasteConfirm: async (data) => {
    let url = contextPath + "/kms/files/categorys/paste";
    let result = await axios({
      url: url,
      method: "PUT",
      data: data,
    });
    return result;
  },
  /**
   * 单个贴标签
   */
  onePasteConfirm: async (data) => {
    let url = contextPath + "/kms/file/categorys/paste";
    let result = await axios({
      url: url,
      method: "PUT",
      data: data,
    });
    return result;
  },
  /**
   * 删除单个标签
   */
  deleteCategory: async (fileId, categoryName) => {
    let url = contextPath + "/kms/files/deleteFileCategory?fileId=" + fileId + "&categoryName=" + categoryName;
    let result = await axios({
      url: url,
      method: "DELETE",
    });
    return result;
  },

  //获取授权列表
  getAuthorizationData: async (resourceId) => {
    let result = await axios.get(contextPath + "/kms/resources/" + resourceId + "/authorizations?pageNo=1&linesPerPage=9999");
    return result;
  },

  //删除授权
  deleteAuthorizations: async (authorizationIdArray) => {
    let result = await axios({
      url: contextPath + "/kms/authorizations",
      method: "DELETE",
      data: authorizationIdArray
    });
    return result;
  },

  //创建授权
  createAuthorization: async (params) => {
    let result = await axios({
      url: contextPath + "/kms/resources/" + params.resourceId + "/authorizations",
      method: "POST",
      data: params
    });
    return result;
  },

  //编辑授权
  editAuthorization: async (params) => {
    let result = await axios({
      url: contextPath + "/kms/resources/" + params.resourceId + "/authorizations/" + params.id,
      method: "PUT",
      data: params
    });
    return result;
  },




  //团队km
  //获取团队km列表数据
  getTeamList: function (params, {
    onSucess,
    onError
  }) {
    let url = contextPath + "/kms/teams/?isMyTeams=" + params.isMyTeams +
      "&serialNumber=" + params.serialNumber +
      "&creator=" + params.creator +
      "&departmentId=" + params.departmentId +
      "&teamName=" + params.teamName +
      "&beginTime=" + params.beginTime +
      "&endTime=" + params.endTime +
      "&linesPerPage=" + params.linesPerPage +
      "&pageNo=" + params.pageNo;
    axios.get(url).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //新建团队时获取编号
  getSerialNumber: function ({
    onSucess,
    onError
  }) {
    axios.get(contextPath + '/kms/teams/serialNumber').then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //创建团队
  createTeam: function (dataJson, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/teams",
      method: "POST",
      data: dataJson
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //编辑团队
  editTeamOk: function (teamId, params, {
    onSucess,
    onError
  }) {
    let editMembers = [...params.members];
    editMembers.map((e, key) => {
      editMembers[key].teamId = teamId;
    })
    const bodyParams = {
      "teamId": teamId,
      ...params,
      members: editMembers
    }
    axios({
      url: contextPath + "/kms/teams/" + teamId,
      method: "PUT",
      data: bodyParams
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    )
  },

  //删除团队
  deleteTeam: function (params, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/teams",
      method: 'DELETE',
      data: params,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },

  //获取指定团队的详情
  getSpecifiedTeam: async (teamId) => {
    let result = await axios.get(contextPath + '/kms/teams/' + teamId);
    return result;
  },

  //根据用户id获取该用户的详细
  getUserDetail: async (id) => {
    let result = await axios.get(contextPath + '/kms/users/' + id);
    return result;
  },

  //获取团队下的所有成员
  getCurTeamMembers: async (teamId) => {
    let result = await axios.get(contextPath + '/kms/teams/' + teamId + '/members');
    return result;
  },

  //获取团队下的阶段集合
  getStageList: async (teamId) => {
    let result = await axios.get(contextPath + '/kms/teams/' + teamId + '/stages');
    return result
  },

  //获取阶段下的文件集合
  getStageFiles: async (params) => {
    const orderByfield = params.orderByfield ? params.orderByfield : "NAME";
    const orderMode = params.orderMode ? params.orderMode : "ASC";
    const disksFolders_url = contextPath + "/kms/disks/" + params.diskId + "/folders/" + params.folderId +
      "/files?orderByfield=" + orderByfield + "&orderMode=" + orderMode + "&pageNo=" + params.pageNo + "&linesPerPage=" + params.linesPerPage;
    let result = await axios.get(disksFolders_url);
    return result
  },

  //申请对团队、专委会、知识地图进行订阅
  applySubscription: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/subscriptions',
      method: "POST",
      data: params
    });
    return result
  },

  //申请对团队、专委会、知识地图进行订阅
  cancelSubscription: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/subscriptions',
      method: "DELETE",
      data: params
    });
    return result
  },

  //创建阶段
  createStage: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/stages',
      method: "POST",
      data: params
    });
    return result
  },

  //编辑阶段
  editStage: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/stages',
      method: "PUT",
      data: params
    });
    return result
  },

  //删除阶段
  deleteStages: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/stages',
      method: "DELETE",
      data: params
    });
    return result
  },

  //获取评论
  getStageComments: async (stageId) => {
    let result = await axios.get(contextPath + '/kms/stages/' + stageId);
    return result
  },

  //创建评论
  createComment: async (stageId, params) => {
    let result = await axios({
      url: contextPath + '/kms/stages/' + stageId + '/comments',
      method: "POST",
      data: params
    });
    return result
  },

  //删除评论
  deleteComment: async (params) => {
    let result = await axios({
      url: contextPath + '/kms/stages/' + params.stageId + '/comments/' + params.commentId,
      method: "DELETE",
    });
    return result
  },

  //删除团队某个阶段下的单个文件
  stagesdeleteFile: function (params, {
    onSucess,
    onError
  }) {
    axios({
      url: contextPath + "/kms/disks/" + params.diskId + "/files/" + params.fileId,
      method: 'DELETE',
      data: params,
    }).then(function (response) {
      if (onSucess) onSucess(response);
    }).catch(
      function (error) {
        if (onError) onError(error);
      }
    );
  },
}