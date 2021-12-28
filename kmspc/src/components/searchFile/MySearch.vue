<template>
  <div class="mySearch">
    <div>
      <div>
        <el-autocomplete 
          :placeholder="$t('placeholder.search')" 
          class="input-search" 
          v-model="searchText"
          :fetch-suggestions="querySearchAsync"
          @select="filesSearch"
          @keyup.enter.native="filesSearch">
          <i
            class="el-input__icon el-icon-search"
            slot="suffix"
            @click="handleClick">
          </i>
        </el-autocomplete>
        <span class="advancedSearch" @click="handleModalToggle">{{$t('btns.advanced_search')}}</span>
      </div>
      <div class="searchCheck">
        <div class="sub-condition">
          <span>{{$t('selection_range')}}</span>
          <el-checkbox-group v-model="list" class="searchBox">
            <el-checkbox 
              v-for="(item,index) in checkList" 
              :key="index"
              :label="item.key"
              :id="item.name"
              :title="item.title">
              {{item.name}}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="search-scope" v-if="advancedSearch">
          <span>{{$t('search_scope')}}</span>
          <div class="searchBox">
            <el-checkbox v-model="params.selectTitle">{{$t('E_title')}}</el-checkbox>
            <el-checkbox v-model="params.selectContent">{{$t('text')}}</el-checkbox>
          </div>
        </div>
        <div v-if="advancedSearch">
          <el-form :inline="true" :model="params" class="demo-form-inline">
            <el-row :gutter="20">
              <el-col :span="5">
                <el-form-item :label="$t('form.uploader')">
                  <el-input v-model="params.creator" :placeholder="$t('placeholder.name')" size="small" class="search-creator"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item :label="$t('form.upload_period')">
                  <el-date-picker
                    v-model="dateString"
                    type="daterange"
                    :range-separator="$t('to')"
                    :start-placeholder="$t('start_placeholder')"
                    :end-placeholder="$t('end_placeholder')"
                    size="small"
                    class="search-time">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('form.select_label')">
                  <el-button size="mini" @click="showLabelCategoryDialog" class="selectTag">{{$t('btns.select_label')}}</el-button>
                  <el-tag v-for="item in categoryOkParams" :key="item.categoryId" 
                    closable
                    @close="handleClose(item)">
                    {{item.categoryName}}
                  </el-tag>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-form-item label="">
                  <el-button type="primary" plain size="mini" @click="filesSearch">{{$t('btns.query')}}</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>
    <el-row class="item-row">
      <el-col v-if="searchList && searchList.length > 0"> 
        <div class="search-list" :style="{height: scrollHeight + 'px'}">
          <el-card 
            :body-style="{ padding: '0px' }" 
            :span="8" 
            v-for="(item,index) in searchList" 
            :key="index"
            shadow="hover"
            >
            <div class="item-boby">
              <img 
                v-if="item.type=='jpg' || item.type=='png' || item.type=='gif'"
                :src="kmsFilePath+'/uploads/kms/'+item.url"
                class="item-icon icon-file32x32"/>
              <div :class="setClass(item.type)" v-else></div>
              <div style="padding: 14px;">
                <div class="item-heading">
                  <el-row :gutter="10" type="flex">
                    <el-col :span="14">
                      <div class="fileName"><span v-html="item.name" @click="clickFileForPreview(item)"></span></div>
                    </el-col>
                    <el-col :span="10">
                      <div class="tabName"><span>{{$t('tabs.label')}}<a href="javascript:void(0);" :title="item.categorys" class="colorBlue">{{item.categorys}}</a></span></div>
                    </el-col>
                    <el-col :span="8">
                      <div class="fileTime">{{item.createDate}}</div>
                    </el-col>
                  </el-row>
                </div>
                <div class="item-buttom">
                  <div class="fileDetail">
                    <span v-html="item.content"></span>
                  </div>
                  <div class="fileAction">
                    <div class="authorWh pull-left">
                      <span class="uploadAuthor ">{{$t('contributor')}}<a href="javascript:void(0);" :title="item.creator" class="colorBlue">{{item.creator}}</a></span>
                      <span class="fromWhere">{{$t('E_source')}}: <a href="javascript:void(0);" :title="item.folderName" class="colorBlue" @click="handleBackToOrigin(item)">
                        {{item.fileOriginType ? item.fileOriginType : item.folderName}}</a>
                      </span>
                    </div>
                    <div class="action pull-left">
                      <a class="share"  :title="$t('share')" @click="shawFileShareDialog(item.id, item.folder, item.id)"></a>
                      <a class="load" :title="$t('btns.download')" @click="handleSingleFileDownload(item.id, item.folder)"></a>
                      <a class="collect" :title="$t('label.collection')" @click="showCollectModal(item.id)"></a>
                    </div>
                    <div class="page-detail pull-right">
                      <span class="pageNum">{{$t('total_of')}}{{item.pageCount}}{{$t('page')}}</span>
                      <span class="loadNum">{{$t('btns.download')}}： {{item.downloads}}{{$t('time')}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col v-else-if="flag"></el-col>
      <el-col v-else>
        <div class="empty-data">
          <i class="el-icon-circle-close">{{$t('placeholder.no_data')}}</i>
        </div>
      </el-col>
    </el-row>
    <!-- 文件分享 -->
    <filesharedialog
      :shareTreeModalParams="shareTreeModalParams"
      @handleFileShareDialogClose="handleFileShareDialogClose"
    ></filesharedialog>
    <!-- 收藏 -->
    <collectdialog
      :collectTreeModalParams="collectTreeModalParams"
      @handleCollectDialogClose="handleCollectDialogClose"
    ></collectdialog>
    <!-- 标签对话框 -->
    <labelcategorydialog
      v-bind="$attrs" 
      v-on="$listeners"
      :categorySettingsModalParams="categorySettingsModalParams"
      @handleCategoryOk="handleCategoryOk"
      @handleCategoryDialogClose="handleCategoryDialogClose"
    ></labelcategorydialog>
    <!-- 权限对话框 -->
    <application-authority 
      :visible.sync="authorityModalParams.authorityVisible" 
      :authorityModalParams="authorityModalParams"
      @onAuthiority="onAuthiority">
    </application-authority>
  </div>
</template>

<script>
import API from "@/api.js";
import { getPreviewUrl, dateToTime, spliceHash, encodeHash, TimeToDate } from '@/utils/utils.js';
//文件分享
import filesharedialog from '@/components/shared/FileShareDialog.vue';
//收藏文件
import collectdialog from '@/components/shared/CollectDialog.vue';
//标签对话框
import labelcategorydialog from '@/components/shared/LabelCategoryDialog.vue';
//申请权限对话框
import applicationAuthority from '@/components/shared/ApplicationAuthority';
export default {
  name: "mySearch",
  components: {
    filesharedialog,
    collectdialog,
    labelcategorydialog,
    applicationAuthority
  },
  props:[
    "searchName"
  ],
  data () {
    return {
      // checkList: ['部门KM','团队KM','专委会KM'],
      kmsFilePath: kmsFilePath,
      list: ["1","2","4","8"],
      checkList: [{
        name: this.$t('menu.department') + "KM",
        title: this.$t('placeholder.searches_department'),
        key: "1"
      },{
        name: this.$t('menu.team_KM'),
        title: this.$t('placeholder.searches_team'),
        key: "2"
      },{
        name: this.$t('Committee.oneself') + "KM",
        title: this.$t('placeholder.searches_panel'),
        key: "4"
      },{
        name: this.$t('menu.staff_KM'),
        title: this.$t('placeholder.earches_employee'),
        key: "8"
      }],
      searchText: '',
      restaurants: [],
      params:{
        keyWord: '',
        selectTitle: true,      //标题是否搜索
        selectContent: true,   //内容是否搜索
        creator: "",            //创建人
        beginTime: "",          //开始时间
        endTime: "",            //结束时间
        categoryIds: [],
        scope: [],
        pageNo: 1,
        linesPerPage: 15,
      },
      dateString: [],
      timeout: null,
      searchList: [],
      shareTreeModalParams: {     //分享弹出层
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,
        teamTreeData: []
      },
      collectTreeModalParams: {     //文件收藏弹出层
        collectTreeModalVisible: false,
        fileId: "",
      },
      categorySettingsModalParams: {     //贴标签弹出层
        fileId: "",
        defaultValue: [],
        categoryData: [], 
        visible: false, 
      },
      authorityModalParams: {     //权限对话框
        fileId: "",
        authorityVisible: false,    
        type: ""   
      },
      categoryOkParams: [],
      advancedSearch: false,
      fileOriginType: "",     //定义来源信息
      //文件源from哪个km
      resourceType : {
        "ORIGIN_TYPE_DEPT_KM" : 1,  //部门KM
        "ORIGIN_TYPE_DEPT_TEAMKM" : 2,  //团队KM
        "ORIGIN_TYPE_DEPT_COMMITTEEKM" : 4,  //专委会KM
        "ORIGIN_TYPE_DEPT_PERSON" : 8,  //个人
        "ORIGIN_TYPE_DEPT_NETWORK" : 9  //其他网盘
      },
      flag: true,
      scrollHeight: 0
    }
  },
  mounted(){
    /**
     * 获取滚动条的高度
     */
    setTimeout(() => {
      let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      this.scrollHeight = clientHeight - 50 - 40 - 16 - 32 - 24 - 12 - 12 - 35 - 40
    }, 100)
  },
  methods: {
    //显示高级搜索
    handleModalToggle(){
      this.advancedSearch = !this.advancedSearch;
      if(this.advancedSearch){
        this.scrollHeight = this.scrollHeight - 44 - 62
      }else{
        this.scrollHeight = this.scrollHeight + 44 + 62
      }
    },

    // 根据关键字进行查询
    filesSearch(item) {
      if(this.dateString && this.dateString.length>0){
        let beginTime = "";
        let endTime ="";
        this.dateString.map((e,key) => {
          if(key == 0) {
            beginTime = e ? dateToTime(e) : "";
          }else if(key == 1)
            endTime = e ? dateToTime(e) : "";
        })
        this.params.beginTime = beginTime;
        this.params.endTime = endTime;
      }else if(this.dateString == null){    //当日期选择框清空时，把日期的时间清空
        this.params.beginTime = "";
        this.params.endTime = "";
      }
      this.params.scope = [];
      if(item && item.content){
        this.params.keyWord = item.content;
      }else{
        this.params.keyWord = this.searchText
      }
      for(let i=0;i<this.list.length;i++){
        if(this.params.scope.length == 0){
          this.params.scope = "&scope="+ this.list[i];
        }else{
          this.params.scope = this.params.scope + "&scope="+ this.list[i];
        }
      }
      let keyWordStr = this.params.keyWord.trim();
      if(this.params.creator == "" && (this.dateString && this.dateString.length == 0) && this.params.categoryIds.length == 0 && this.advancedSearch){
        if(keyWordStr == "" || keyWordStr == null ){
          this.params.keyWord = "";
          this.$message({
            type: 'warning',
            message: this.$t('msg.keywords_no_empty')
          });
          return
        }else if(this.params.scope == ""  || this.params.scope == null ) {
       
          this.$message({
            type: 'warning',
            message: this.$t('msg.search_area_sl')
          });
          return
        }
        else{
           API.filesSearch(this.params, {
          onSucess: resp => {
            if(this.flag) this.flag = false;
            let data = resp.data.data;
            for(let i=0;i<data.datas.length;i++){
              data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD")
              data.datas[i].fileOriginType =this.getOriginType(data.datas[i]);
            }
            this.searchList = data.datas;
          } 
        })
        }

      }else if (this.params.scope == ""  || this.params.scope == null){
       
        this.$message({
          type: 'warning',
          message: this.$t('msg.selection_range_sl')
        });
      }else if((keyWordStr == "" || keyWordStr == null) && !this.advancedSearch){
    
        this.params.keyWord = "";
        this.$message({
          type: 'warning',
          message: this.$t('msg.keywords_no_empty')
        });
      }else {
        API.filesSearch(this.params, {
          onSucess: resp => {
            if(this.flag) this.flag = false;
            let data = resp.data.data;
            for(let i=0;i<data.datas.length;i++){
              data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD")
              data.datas[i].fileOriginType =this.getOriginType(data.datas[i]);
            }
            this.searchList = data.datas;
          } 
        })
      }
    },
    // 动态获取历史搜索记录
    async querySearchAsync(queryString, cb) {
      const result = (await API.getFilesSearch(this.params)).data;
      if(result.errcode == 0) {
        this.restaurants = result.data.datas;
        for(let i=0;i<this.restaurants.length;i++){
          this.restaurants[i].value = this.restaurants[i].content;
        }
        let results = queryString ? this.restaurants.filter(this.createStateFilter(queryString)) : this.restaurants;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          cb(results);
        }, 2000 * Math.random());
      }
    },
    createStateFilter(queryString) {
      return (state) => {
        return (state.content.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    //动态获取类名
    setClass(key) {
      let obj = "item-icon icon-file32x32 icon-file-"+ key;
      return obj;
    },
    // 点击搜索按钮进行查询
    handleClick() {
      this.filesSearch()
    },
    /**
     * 来源点击回到文件所在的网盘
     */
    handleBackToOrigin(file){
      let resourceType = this.resourceType;
      switch (parseInt(file.resourceType)) {
        case resourceType.ORIGIN_TYPE_DEPT_KM: //部门KM
          let deptHashParams = {
            fileName: "",
            diskId: file.diskId,
            folderId: file.folderId,
            pageNo: 1,
            linesPerPage: 15,
          }
          const deptHash = spliceHash(deptHashParams);
          location.hash = "#/departmentKm?"+ encodeHash(deptHash);
          break;
        case resourceType.ORIGIN_TYPE_DEPT_TEAMKM: //团队KM
          //团队下的阶段所需的的teamId跟diskId相同
          let teamHashParam = {
              "teamId" : file.diskId,
              "diskId" : file.diskId
          }
          const teamHash = spliceHash(teamHashParam);
          location.hash = "#/teamKm?"+encodeHash(teamHash);
          break;
        case resourceType.ORIGIN_TYPE_DEPT_COMMITTEEKM: //专委会KM
          let param = {
            id: file.id,
          }
          this.$router.push({
            path: "/knowledgePreview",
            query: {param}
          })
          break;
        case resourceType.ORIGIN_TYPE_DEPT_PERSON: //个人/员工km
          let personHashParams = {
            diskId: file.diskId,
            folderId: file.folderId,
            pageNo: 1,
            linesPerPage: 15,
          }
          const personHash = spliceHash(personHashParams);
          location.hash = "#/personKm?"+ encodeHash(personHash);
          break;
        case resourceType.ORIGIN_TYPE_DEPT_NETWORK: //其他网盘
          break;
      }
    },
    /**
     * 获取文件来源
     */
    getOriginType(file) {
      let fileOriginType = "";
      let resourceType = this.resourceType;
      switch (parseInt(file.resourceType)) {
        case resourceType.ORIGIN_TYPE_DEPT_KM :
          this.fileOriginType = file.folderName;
          // fileOriginType = "部门KM";
          break;
        case resourceType.ORIGIN_TYPE_DEPT_TEAMKM :
          this.fileOriginType = this.$t('menu.team_KM');
          break;
        case resourceType.ORIGIN_TYPE_DEPT_COMMITTEEKM :
          this.fileOriginType = this.$t('Committee.oneself') + "KM";
          break;
        case resourceType.ORIGIN_TYPE_DEPT_PERSON:
          this.fileOriginType = this.$t('menu.staff_KM');
          break;
        case resourceType.ORIGIN_TYPE_DEPT_NETWORK :
          this.fileOriginType = "其他网盘";
        default:
          break;
      }
      return  this.fileOriginType;
    },
    /**
     * 打开文件分享对话框
     */
    async shawFileShareDialog(fileId, diskId, folderId){
      const result = (await API.getTeamtreeData()).data;
      const treeData = JSON.parse(result.data);
      let shareTreeModalParams= {
        fileId:fileId,
        diskId: diskId,
        folderId: folderId,
        shareTreeModalVisible: true,    //移动弹出层
        teamTreeData: treeData
      }
      this.shareTreeModalParams = shareTreeModalParams;
    },

    /**
     * 取消文件分享对话框
     */
    handleFileShareDialogClose(){
      let shareTreeModalParams= {
        fileId: "",
        diskId: "",
        folderId: "",
        shareTreeModalVisible: false,    
        teamTreeData: []
      }
      this.shareTreeModalParams = shareTreeModalParams;
    },

    /**
      * 无权限下载时的回调函数
      * @param {fileId} 公共使用的下载函数回调返回文件的id
      */
    downloadWithout() {
      this.$message({
        type: 'info',
        message: this.$t('msg.file_download_failed')
      });
    },

    /**
     * 单个下载
     */
    async handleSingleFileDownload(fileId,folder){
      let apiParams = {
        "fileId" : fileId,
        "folder" : folder
      }; 
      API.handleSingleFileDownload(apiParams, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let url = ""
            if(apiParams.folder) {
              url = kmsConfig.contextPath + "/kms/downloads?folderIds="+apiParams.fileId+"&fileIds=";
            }else{
              url = kmsConfig.contextPath + "/kms/download/"+apiParams.fileId;
            }
            window.open(url);
          }
        },
        onError: error =>{
          if(error.response.data.errcode == 403) {
            let authorityModalParams = {
              ...this.authorityModalParams,
              authorityVisible: true,
              fileId: fileId,
              type: 'download'
            }
            this.authorityModalParams = authorityModalParams;
          }else{
            this.$message({
              type: 'warning',
              message: error.response.data.errmsg
            });
          }
        }
      })
    },

    /**
     * 显示收藏对话框
     */
    showCollectModal(fileId){
      const collectTreeModalParams = {     //文件收藏弹出层
        "collectTreeModalVisible": true,
        "fileId" : fileId
      };
      this.collectTreeModalParams = collectTreeModalParams;
    },

    /**
     * 取消收藏
     */
    handleCollectDialogClose(){
      const collectTreeModalParams = {     //文件收藏弹出层
        "collectTreeModalVisible": false,
        "fileId" : ""
      };
      this.collectTreeModalParams = collectTreeModalParams;
    },

    /**
     * 预览文件
     */
    async clickFileForPreview(row){
      const preview_params={
        id: row.id,  //文件id
        diskId: row.diskId
      }

      let preview_url = (getPreviewUrl(preview_params)).substring(1);
     
      API.getFilePreviewAble(row.id, {
        onSucess: resp => {
           const newWin = window.open(); 
           let url;
            if(resp.data.errcode == 0){
             
              if(row.type == "mp4" || row.type == "mp3"){
                url = kmsConfig.kmsFilePath + "/uploads/kms/" + row.url
                
              }else{
                if(kmsConfig.staticContextPath){
                  url = kmsConfig.staticContextPath + kmsConfig.kmsFilePath + "/asset" + preview_url;
                }else{
                  url = kmsConfig.kmsFilePath + "/kms/asset" + preview_url;
                }
              }
              newWin.location.href = url;  
            }
          
        },
        onError: error =>{
          if(error.response.data.errcode == 403) {
           
            let authorityModalParams = {
              ...this.authorityModalParams,
              authorityVisible: true,
              fileId: row.id,
              type: 'preview'
            }
            this.authorityModalParams = authorityModalParams;
          }else{
            
            this.$message({
              type: 'warning',
              message: result.errmsg
            });
          }
        }
      })
    },
    /**
     * 申请权限确定
     */
    onAuthiority(value) {
      API.appAuthority(value,{
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.authorityModalParams.authorityVisible = false;
            this.$message(this.$t('msg.approval_admin_wa'));
          }
        },
        onError: error =>{
          this.$message({
            type: 'warning',
            message: error.response.data.errmsg
          });
        }
      })
    },

     /**
     * 打开标签对话框
     */
    async showLabelCategoryDialog(){
      let categoryIds = this.params.categoryIds;
      const categorySettingsData = (await API.getCategory()).data;
      const categoryData = categorySettingsData.data;
      // let defaultValueData = (await API.getFileCategorys(fileId)).data;
      // if(defaultValueData == undefined){
      //   defaultValueData = [];
      // }
      let defaultValueData = [];
      {
        categoryIds.length >1 ?
        categoryIds.map((item)=>{

            defaultValueData.push(item);
        })
        : ""
      }
      if(!categoryData){
        this.$message({
          type: 'warning',
          message: this.$t('msg.created_tags_no')
        });
      }else{
        let arr = [];
        if(defaultValueData.data){
          defaultValueData.data.map((name)=>{
            categoryData.map((labelCate)=>{
              if(labelCate.name == name){
                arr.push(labelCate.id)
              }
            })
          })
        }
        let categorySettingsModalParams= {
          'fileId' : false,
          'defaultValue': defaultValueData,
          'categoryData': categoryData,
          'visible': true,
          'labelCate': arr
        }
        this.categorySettingsModalParams = categorySettingsModalParams
      }
    },

    /**
     * 取消标签弹出层
     */
    handleCategoryDialogClose(){
      let categorySettingsModalParams= {
        fileId: "",
        defaultValue: [],
        categoryData: [],
        visible: false
      }
      this.categorySettingsModalParams = categorySettingsModalParams;
    },

    /**
     * 确定贴标签
     */    
    async handleCategoryOk(categorySettingsValue) {
      let categoryData = this.categorySettingsModalParams.categoryData;
      let categoryOkParams = [];
      let categoryIds = [];
      categoryData.map((item, index)=>{
        categorySettingsValue.map((e)=>{
          if(item.id === e){
            let option = {};
            option = {
              categoryId: item.id,
              categoryName: item.name,
              isAuto: false
            }
            categoryOkParams.push(option);
            categoryIds.push(item.id);
          }
        })
      })
      this.handleCategoryDialogClose()
      let params = {
        ...this.params,
        categoryIds: categoryIds
      }
      this.params = params;
      this.categoryOkParams = categoryOkParams;
    },

    /**
     * 删除标签
     */
    handleClose(tags){
      let categoryOkParams = this.categoryOkParams;
      let categoryIds = this.params.categoryIds;
      categoryOkParams.map((file, index) =>{
        if(file.categoryId == tags.categoryId){
          categoryOkParams.splice(index, 1);
          {
            categoryIds.length >1 ?
            categoryIds.map((tag, key)=>{
                if(tag == tags.categoryId){
                    categoryIds.splice(key, 1);
                }
            })
            : 
            categoryIds.splice(0, 1)
          }
        }
      })
      let params = {
        ...this.params,
        categoryIds: categoryIds
      }
      this.params = params;
      this.categoryOkParams = categoryOkParams;
    },
  },
  watch: {
    /**
     * 获取首页搜索的信息
     */
    searchName(val){
      this.searchText = val;
      this.filesSearch(val);
    }
  }
}
</script>