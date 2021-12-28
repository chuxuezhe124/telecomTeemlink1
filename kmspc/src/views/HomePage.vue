<template>
  <div class="homepage" >
    <div id="myapp">
      <div class="content" :class="{'paddingTop':paddingTop}" :style="{'display': indexShow ? '' : 'none'}">
        <div class="content-left">
          <div class="content-search">
          <div class="content-title_search">
              <el-row>
              <el-col :span="24">
                <div class="grid-content">   
                  <div>
                    <img src="@/assets/images/logoIndex.png" class="logo"/>
                  </div>
                  <div class="logo-heard">
                    <div :class="[ $store.state.isEnglish ? 'logo-title-en' : 'logo-title']">{{$t('knowledge_management')}}</div>
                    <div class="logo-endTitle">Knowledge document management</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input
                  :placeholder="$t('tabs.content')"
                  class="grid-search"
                  @keyup.enter.native="selectInputName"
                  v-model="searchFile">
                  <i
                    class="el-input__icon el-icon-search cursor icon-search"
                    slot="suffix"
                    @click="selectInputName">
                  </i>
                </el-input>
              </el-col>
            </el-row>
           </div>
            <el-row class="card-row">
   <el-col>
                <div class="cardIcon" @click="locationHash($t('menu.data_retrieval'),'1','searchFile')">
                  <img src="@/assets/images/icon_zljs.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.data_retrieval')}}</div>
                </div>
              </el-col>
              <el-col>
                <div class="cardIcon" @click="locationHash($t('menu.staff'),'2','personKm')">
                  <img src="@/assets/images/icon_yg.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.staff')}}</div>
                </div>
              </el-col>
              <el-col>
                <div class="cardIcon" @click="locationHash($t('menu.department'),'3','departmentKm')">
                  <img src="@/assets/images/icon_bm.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.department') }}</div>
                </div>
              </el-col>
              <el-col>
                <div class="cardIcon" @click="locationHash($t('menu.team'),'4','teamKm')">
                  <img src="@/assets/images/icon_td.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.team') }}</div>
                </div>
              </el-col>
              <el-col>
                <div class="cardIcon" @click="locationHash($t('menu.knowledge_topics'),'5','knowledgeMap')">
                  <img src="@/assets/images/icon_zswd.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.knowledge_topics')}}</div>
                </div>
              </el-col>
               <el-col>
                <div class="cardIcon" @click="locationHash('知识社区','6','knowledgeCommunity')">
                  <img src="@/assets/images/知识社区.png" class="imgContent"/>
                  <div class="card-name">知识社区</div>
                </div>
              </el-col>
              <el-col v-if="isAdmin">
                <div class="cardIcon" @click="locationHash($t('menu.administrators'),'7','admin')">
                  <img src="@/assets/images/processCenter.png" class="imgContent"/>
                  <div class="card-name">{{$t('menu.administrators')}}</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="content-new">
            <div class="new-heard">
              <div>
                <img src="@/assets/images/icon_new.png"/>
                <span class="new-title">{{$t('file.new')}}</span>
              </div>
              <div class="more" @click="addTab($t('file.new'),'7','newupload')">
                <span>{{$t('more')}}</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div class="new-content">
              <el-table
                :data="newDataList.datas"
                :show-header="false"
                @row-click="RowClick"
                size="mini"
                style="width: 100%">
                <el-table-column
                  type="index">
                </el-table-column>
                <el-table-column
                  prop="name"
                  :label="$t('tabs.name')"
                  min-width="60%">
                </el-table-column>
                <el-table-column
                  prop="creator"
                  :label="$t('tabs.uploader')"
                  min-width="20%">
                </el-table-column>
                <el-table-column
                  prop="createDate"
                  :label="$t('tabs.time')"
                  min-width="20%">
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="content-hot">
            <div class="hot-heard">
              <div>
                <img src="@/assets/images/icon_hot.png"/>
                <span class="hot-title">{{$t('file.hottest')}}</span>
              </div>
              <div class="more" @click="addTab($t('file.hottest'),'8','hotview')">
                <span>{{$t('more')}}</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div class="hot-content">
              <el-table
                :data="hotDataList.datas"
                :show-header="false"
                size="mini"
                @row-click="RowClick"
                style="width: 100%">
                <el-table-column
                  type="index">
                </el-table-column>
                <el-table-column
                  prop="name"
                  :label="$t('tabs.name')"
                  min-width="60%">
                </el-table-column>
                <el-table-column
                  prop="creator"
                  :label="$t('tabs.uploader')"
                  min-width="20%">
                </el-table-column>
                <el-table-column
                  prop="createDate"
                  :label="$t('tabs.time')"
                  min-width="20%">
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div class="content-right">
          <div class="content-upload">
            <div class="upload-heard">{{$t('my.uploads')}}</div>
            <div class="upload-mytotal">
              <el-row class="upload-row">
                <el-col :span="2" class="upload-num" v-for="item in myRowOption" :key="item.id">{{item}}</el-col>
              </el-row>
            </div>
            <div class="upload-total">
              <div class="upload-num">
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{departmentRow}}</div>
              <div class="department-num" :class="[$store.state.isEnglish ? 'text-en' : 'text']" >{{$t("file.total_department")}}</div>
            </div>
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{teamRow}}</div>
              <div class="team-num " :class="[$store.state.isEnglish ? 'text-en' : 'text']">{{$t("file.total_team")}}</div>
            </div>
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{myPendRow}}</div>
              <div class="myPend-num" :class="[$store.state.isEnglish ? 'text-en' : 'text']">{{$t("my.to_do_list")}}</div>
            </div>
              </div>
            </div>
            <div class="uploader">
              <fileuploader
                :params="params"
                @onRefreshHome="onRefreshHome"
                >
              </fileuploader>
            </div>
          </div>
          <!-- 我的下载日志 -->
          <div class="myLog">
            <div class="log-heard">
              <div>
                <img src="@/assets/images/iocn_rz.png"/>
                <span class="log-title">{{$t('my.download_log')}}</span>
              </div>
              <div class="more" @click="addTab($t('my.log'),'9','mydiary')">
                <span>{{$t('more')}}</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div class="log-content">
              <el-table
                :data="logDataList.datas"
                :show-header="false"
                size="mini"
                style="width: 100%">
                <el-table-column
                  prop="createDate"
                  :label="$t('tabs.time')"
                  min-width="40%">
                </el-table-column>
                <el-table-column >
                  <template slot-scope="scope">
                    <div style="overflow: hidden;text-overflow:ellipsis; white-space: nowrap;" :title="scope.row.resourceName">{{$t('you_downloaded')}}{{scope.row.resourceName}}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <!-- 我的排名 -->
          <div class="ranking">
            <div class="ranking-heard">
              <div>
                <img src="@/assets/images/iocn_pm.png"/>
                <span class="ranking-title">{{$t('my.rank')}}</span>
              </div>
              <!-- <div class="more">
                <span>{{$t('more')}}</span>
                <i class="el-icon-arrow-right"></i>
              </div> -->
            </div>
            <div class="ranking-content">
              <div class="rankingList">
                <div class="rankingList_show two">
                  <div class="rankingList_img"><img src="@/assets/images/icon_two.png" class="img"/></div>
                  <div class="rankingList_user">
                    <img :src="allUserFile.two.avatar" class="user" v-if="allUserFile.two.avatar"/>
                    <img src="@/assets/images/face.jpg" class="user" v-else/>
                    </div>
                  <div class="rankingList_name">{{allUserFile.two.name}}</div>
                  <div class="rankingList_total">{{$t('total_upload')}}{{allUserFile.two.count}}</div>
                </div>
                <div class="rankingList_show one">
                  <div class="rankingList_img"><img src="@/assets/images/icon_one.png" class="img"/></div>
                  <div class="rankingList_user">
                    <img :src="allUserFile.one.avatar" class="user" v-if="allUserFile.one.avatar"/>
                    <img src="@/assets/images/face.jpg" class="user" v-else/>
                  </div>
                  <div class="rankingList_name">{{allUserFile.one.name}}</div>
                   <div class="rankingList_total">{{$t('total_upload')}}{{allUserFile.one.count}}</div>
                </div>
                <div class="rankingList_show three">
                  <div class="rankingList_img"><img src="@/assets/images/icon_three.png" class="img"/></div>
                  <div class="rankingList_user">
                    <img :src="allUserFile.three.avatar" class="user" v-if="allUserFile.three.avatar"/>
                    <img src="@/assets/images/face.jpg" class="user" v-else/>
                  </div>
                  <div class="rankingList_name">{{allUserFile.three.name}}</div>
                   <div class="rankingList_total">{{$t('total_upload')}}{{allUserFile.three.count}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   <!-- 超时登录界面 -->
    <div>
      <el-dialog
        :title="$t('login.timeout')"
        :visible.sync="dialogVisible"
        width="30%"
        :modal="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        >
         <el-form size="mini" label-width="80px">
          <el-form-item :label="$t('login.account')">
            <el-input v-model="$store.state.user.loginno" autocomplete="off" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('login.password')">
            <el-input v-model="pwd" autocomplete="off" show-password></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="hanleClickLogin" size="mini">{{$t('login.back')}}</el-button>
          <el-button type="primary" @click="hanleClick" size="mini">{{$t('login.oneself')}}</el-button>
        </div>
      </el-dialog>
    </div> 
     <div>
        <el-dialog
          :title="$t('form.apply_permission')"
          :visible.sync="applyModalParams.applyModalvisible"
          width="40%"
          :before-close="handleApplyModalHide">
          <div>
            <el-form label-position="right" label-width="120px">
              <el-form-item :label="$t('form.permission')">
                <el-checkbox-group v-model="formParams.operations" @change="onChangeAuthority">
                  <el-checkbox label="download">{{$t('btns.download')}}</el-checkbox>
                  <el-checkbox label="preview">{{$t('label.preview')}}</el-checkbox>
                  <el-checkbox label="edit">{{$t('btns.edit')}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item :label="$t('form.reason_application')">
                <el-input v-model="formParams.reason"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.approver')">
                <el-input v-model="approver" :disabled="true"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="handleApplyModalHide">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="handleSubmit">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
      </div> 
  </div>
</template>

<script>
import API from "@/api.js";
import { TimeToDate, filePreview,getCookie,getPreviewUrl} from "@/utils/utils.js";

//上传文件
import fileuploader from '@/components/shared/FileUploader.vue';
let Base64 = require('js-base64').Base64;
export default {
  name: 'homepage',
  components:{

    fileuploader
  },
  data(){
    return {
      searchFile: '',   //知识管理搜索
      dialogVisible: false,
      pwd: '',
      params: {
        userid : '',
        keyWord: '',
        operationType: '1',//日志
        pageNo: 1,
        linesPerPage: 5,
      },
      isAdmin : false,      //是否是管理员
      paddingTop: false,    //头部padding
      indexShow: true,   //首页展示
      tab: [],           //定义标签页数组
      newDataList: {},   //最新文档数据
      hotDataList: {},   //最热文档数据
      myRow: '',         //我的上传量
      myRowOption: '',   //获取上传量数组
      departmentRow: '', //部门数量
      teamRow: '',       //团队数量
      myPendRow: '',     //我的待办
      logDataList: {},   //最热文档数据
      allUserFile: {     //我的排行
        one: {},
        two: {},
        three: {},
      },   
      fileList: [],
                applyModalParams: {  //申请权限弹出层参数
        "resourceId": "",
        "applyModalvisible" : false,
        "previewDefault" : false,
        "downloadDefault" : false,
        "editDefault": false
      },     
       approver: "",
      formParams : {
        "operations": [],
        "download" : false,
        "preview" : false,
        "edit": false,
        "reason" : ""
      },
    }
  },
  created(){
        //根据cookic里的语言状态决定一部分样式
     this.languageStatus();
    
  },
  mounted(){
    this.paddingTop = true;
    this.getNewFile();
    this.getHotFile();
    this.getLogFile();
    let that = this;
    API.getMyProfile(
        {
          onSucess: response => {
            let data = response.data.data;
            /**
             * 判断是否是管理员权限
             * 只有部门知识管理员和企业知识管理员有管理员权限
             */
            if(data.level == 100 || data.level == 10){
              that.isAdmin = true;
            }
            that.getUpload(data.id);
            that.getLogFile(data.id);
          } 
        }
      )
    
  },
  computed: {
    showInstance() {
      return this.$store.state.isInstance;
    },
  },
  methods: {
            /**
      * 单个文件/目录下载若没权限需设置fileId和打开申请权限弹出层
      *@param {fileId} 文件id/目录id
      */
    async showApplyAuthorityModal(fileId, type) {
      let  _download = false;
      let _preview = false;
      let _edit = false;
      switch(type) {
        case "preview" : 
          _preview = true;
          break;
        case "download" : 
          _download = true;
          break;
        case "edit":
          _edit = true;
      }
      //获取审批人
      API.getResourceApprover(fileId, {
        onSucess: resp => {
          this.approver = resp.data.data;
          this.formParams.operations = [type];
          this.formParams.download = _download;
          this.formParams.preview = _preview;
          this.formParams.edit = _edit;
          let applyModalParams = {
            ...this.applyModalParams,
            "resourceId": fileId,
            "previewDefault": _preview,
            "downloadDefault": _download,
            "editDefault": _edit,
            "applyModalvisible" : true,
          }
          this.applyModalParams = applyModalParams;
        },
      })
    },

    //隐藏申请权限模态框
    handleApplyModalHide() {
      let applyModalParams = {
        ...this.applyModalParams,
        "applyModalvisible" : false,
        "resourceId" : "",
        "previewDefault": false,
        "downloadDefault": false,
        "editDefault": false
      }
      this.applyModalParams = applyModalParams;
      //隐藏申请权限对话框把申请理由清空
      this.formParams.reason = "";
    },

     /**
     * 选择申情的权限
     */
     onChangeAuthority(checkedValues) {
      let download = false;
      let preview = false;
      checkedValues.map((item) => {
        if(item == "download") {
          download = true;
        }else if(item == "preview") {
          preview = true;
        }
      });
      let formParams = {
        ...this.formParams,
        "download": download,
        "preview": preview
      }
      this.formParams = formParams;
    },

     /**
     * 提交申请
     */
    async handleSubmit(){
      let that = this;
      if(!this.formParams.download && !this.formParams.preview && !this.formParams.edit) {   //不勾选权限，提示
        this.$message({
          type: 'warning',
          message: this.$t('msg.least_permission_sl')
        });
      }else if(!this.approver){
        this.$message({
          type: 'warning',
          message: this.$t('msg.no_approver_current')
        });
      }else {
        const params = {
          download: this.formParams.download,
          preview: this.formParams.preview,
          edit: this.formParams.edit,
          reason: this.formParams.reason,
          resourceId: this.applyModalParams.resourceId
        }
        const result = (await API.applyAuthority(params)).data;
        if(result.errcode == 0) {
          this.$message({
            type: 'success',
            message: this.$t('msg.approval_admin_wa')
          });
          let applyModalParams = {
            ...this.applyModalParams,
            "resourceId": "",
            "applyModalvisible" : false,
            "previewDefault" : false,
            "downloadDefault" : false,
            "editDefault": false
          }
          this.applyModalParams = applyModalParams;
          //申请成功后，将申请理由清空
          that.formParams.reason = "";
        }
      }
    },
    /**
     * 获取最新文档
     */
    getNewFile() {
      API.getNewUpload(this.params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.newDataList = resp.data.data;
          }
        }
      })
    },
    /**
     * 获取最热文档
     */
    getHotFile() {
      API.getHotView(this.params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.hotDataList = resp.data.data;
          }
        }
      })
    },
    /**
     * 获取我的上传量
     */
    getUpload(id) {
      if(id) this.params.userid = id;     
       /**
       * 获取部门文档
       */
      API.getUserUploadFileCount("", {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let data = resp.data.data.toString()
            let option = [];
            for(let i=0;i<data.length;i++){
              option.push(data.charAt(i))
            }
            this.myRowOption = option;
            this.myRow = resp.data.data;
          }
        }
      })
      /**
       * 获取部门文档
       */
      API.getUserUploadFileCount("1", {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.departmentRow = resp.data.data;
          }
        }
      })
      /**
       * 获取团队文档
       */
      API.getUserUploadFileCount("2", {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.teamRow = resp.data.data;
          }
        }
      })
      /**
       * 获取待办信息
       */
      API.getMypeddingMessage(this.params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.myPendRow = resp.data.data.rowCount;
          }
        }
      })
      /**
       * 获取我的排名
       */
      let params = {
        ...this.params,
        pageNo: 1,
        linesPerPage: 3,
      }
      API.getAllUserUploadFileCount(params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let data = resp.data.data;
            let one = {}
            one.name = data.datas[0].name;
            one.count = data.datas[0].count;
            one.avatar = data.datas[0].avatar;
            if(data.datas[0].avatar){
              one.avatar = JSON.parse(data.datas[0].avatar).url;
            }
            this.allUserFile.one = one;
            let two = {}
            two.name = data.datas[1].name;
            two.count = data.datas[1].count;
            two.avatar = data.datas[1].avatar;
            if(data.datas[1].avatar){
              two.avatar = JSON.parse(data.datas[1].avatar).url;
            }
            this.allUserFile.two = two;
            let three = {}
            three.name = data.datas[2].name;
            three.count = data.datas[2].count;
            three.avatar = data.datas[2].avatar;
            if(data.datas[2].avatar){
              three.avatar = JSON.parse(data.datas[2].avatar).url;
            }
            this.allUserFile.three = three;
          }
        }
      })
    },
    /**
     * 刷新我的上传量widget，刷新最新文档，刷新最热文档
     */
    onRefreshHome(val){
      if(val){
        setTimeout(()=>{          
          this.getNewFile();
          this.getHotFile();
          this.getUpload();
        },1500)
      }
    },
    /**
     * 获取我的日志
     */
    getLogFile(id) {
      this.params.userid = id
      API.getMyDiary(this.params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            //获取时间进行格式转换
            let data = resp.data.data
            for(let i=0;i<data.datas.length;i++){
              if(data.datas[i].createDate){
                data.datas[i].createDate = TimeToDate(data.datas[i].createDate,"YYYY-MM-DD");
              }
            } 
            this.logDataList = resp.data.data;
          }
        }
      })
    },
    /**
     * 搜索
     */
    selectInputName(){
      let text = this.searchFile;
      this.package(this.$t('placeholder.search'),'12','mysearch');
      let params = {
        searchName : text,
        tabName : 'mysearch'
      }
      this.$router.push({
        path: "searchFile",
        query: {params:params}
      })
    },
    /**
     * 新标签页打开
     */
    addTab(title,key,name){
      // this.indexShow = false;
      this.package(title,key,name);
      let routeName = "";
      switch (key){
        case "7":       //最新文档
          routeName = "searchFile";
          break;
        case "8":       //最热文档
          routeName = "searchFile";
          break;
        case "9":       //我的日志
          routeName = "personKm";
          break;
      }
      let params = {
        tabName : name
      }
      this.$router.push({
        path: routeName,
        query: {params:params}
      })
    },
    /**
     * 最新上传和最热文章点击数据预览
     */
    RowClick(row, column, event){
     const preview_params={
        id: row.id,  //文件id
        diskId: row.diskId
      }
      let preview_url = (getPreviewUrl(preview_params)).substring(1);
      let that = this;
      API.getFilePreviewAble(row.id, {
        onSucess: resp => {
        const newWin = window.open(); 
          if(resp.data.errcode == 0){
            newWin.location.href = url;  
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
          }
        },
        onError: error =>{
 
          if(error.response.data.errcode == '403' ) {
           
          //  alert(0)
          // let power={};
          // power.fileId=row.id;
          // power.type='preview';
          // this.jurisdiction=power;
          this.showApplyAuthorityModal(row.id,'preview')
          }else{
            this.$message(error.response.data.errmsg);
          }
        }
      })
    },
    
    /**
     * 组装tab数组
     */
    package(title,key,name){
      let arr = {};
      arr.title = title;
      arr.key = key;
      arr.name = name;
      arr.addTab = false;
      arr.active = true;
      this.tab.push(arr);
      this.$store.commit("addTabHeard",this.tab)
      this.indexShow = false;
    },
    /**
     * 跳转路由
     */
    locationHash(title,key,name) {
      this.package(title,key,name)
      this.$router.push({
        name: name,
      })
    },
    /**
     * 回到登录界面
     */
    hanleClickLogin(){
      let staticContextPath = kmsConfig.staticContextPath;
      console.log(kmsConfig)
      let url = ""
      if(staticContextPath) { //5.0 trunk
        url = "http://" + window.location.host + staticContextPath + "/kms/login/login.html"
      }else { //4.4 stable
        url = "http://" + window.location.host + "/kms/login/login.html"
      }
      window.location.href = url
    },
    /**
     * 登录
     */
    hanleClick(){
      let cookie =  document.cookie.split(";");
      let language,url,path
      for(let i=0;i<cookie.length;i++){
        if(cookie[i].indexOf("USERLANGUAGE")>=0){
          language = cookie[i].split("=")[1];
        }
      }
      let str = Base64.encode(this.pwd);
      let userPwd;
      if(str.length>2){
        let lp = str.substr(0,2);
        let rp = str.substr(2,str.length);
        userPwd = rp+lp;
      }
      let data = {
        username : this.$store.state.user.loginno,
        password : userPwd,
        remember : "0",
        debug : false,
        domainName : this.$store.state.user.domainName,
        checkcode : "",
        language : language,
        url : url,
        path: path
      }
      this.$api.signonLogin(
        data,
        {
          onSucess: res => {
            if(res.data.resultCode != 0) {
              this.pwd = '';
              this.dialogVisible = false;
              this.$message({
                message: this.$t('msg.login_ss'),
                type: 'success'
              });
            }else{
              this.$message.error(res.data.errmsg);
            }
          }
        }
      )
    },
//获取语言的状态
  languageStatus(){
    let data=getCookie('USERLANGUAGE')=='en'|| getCookie('USERLANGUAGE')=='fr' ?  true:false;

     this.$store.commit('GET_LANGUAGE_STATUS',data);
     console.log(data)
     console.log(this.$store.state.isEnglish);
  }

  },
  beforeCreate() {
    this.$store.dispatch("landingUser");
  },
  watch: {
    showInstance(val) {
      if(val){
        this.dialogVisible = true;
      }
    }
  }
}

</script>
