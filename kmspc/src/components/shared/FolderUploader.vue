<template>
  <div name="FileUploader" class="file-uploader">
    <div>
       <!-- <input id="fileFolderMore"  type="file" name="file" @change="aa($event)" webkitdirectory/> -->
      <el-upload
        webkitdirectory
        class="upload-demo"
        name='files'
        ref="upload"
        action=""
        :http-request="folderUpload"
        :data="{
          folderId: this.params.folderId?this.params.folderId:form.disksFolder,
          diskId: this.params.diskId?this.params.diskId:form.disks
        }"
        :on-change="handleFileChange"
        :before-upload="handleBeforeUpload"
        multiple
        :file-list="fileList"
        :show-file-list="false"
        :auto-upload="this.params.folderId?true:false"
        >
        <el-button size="mini" v-if="this.params.folderId"><i class="el-icon-upload2"></i> {{$t('btns.upload_folder')}}</el-button>
        <el-button type="primary" v-else> {{$t('btns.upload_folder')}}</el-button>
      </el-upload>
      <el-dialog
        @click.stop.prevent
        :title="$t('btns.upload_folder')"
        :visible.sync="visible"
        width="520px"
        :before-close="handleClose"
        append-to-body>
        <el-dialog
          width="30%"
          :title="$t('title.add_tags')"
          :visible.sync="innerVisible"
          append-to-body>
          <el-form label-width="120px" v-if="!isHomeUpload">
            <el-form-item :label="$t('form.label_classification')">
              <el-select 
                size="mini"
                v-model="categoryOkParams" 
                filterable 
                multiple 
                :placeholder="$t('select')">
                <el-option
                  v-for="item in categoryData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="innerVisible = false" size="mini">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="hanleClickAddTag" size="mini">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
        <div>
          <div>
            <ul class="el-upload-list el-upload-list--text">
              <li class="el-upload-list__item is-success" v-for="(file, index) in fileList" :key="index">
                <a class="el-upload-list__item-name" ::title="file.name">
                  <i class="el-icon-document"></i>
                  {{file.name}}
                </a>
                <div v-for="(item, index) in allfileArray" :key="index">
                  <el-progress :percentage="item.marks" v-show="isShowProgress" style="padding-left:5px"></el-progress>
                  <div style="font-size: 8px;padding-top: 5px;text-align: right;" v-if="item.marks==100 && isShowText">{{$t('placeholder.background_progress_wait')}}</div>
                </div>
                <div class="category-select" :class="{'paddTop12':isShowTop}" v-if="!isHomeUpload">
                  <el-tag
                    :key="tag.categoryId"
                    v-for="tag in file['dynamicTags'+index]"
                    closable
                    :disable-transitions="false"
                    @close="handleTagClose(tag,index)"
                    size="small">
                    {{tag.categoryName}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="file['isInputVisible'+index]"
                    v-model.trim="file['inputValue'+index]"
                    ref="saveTagInput"
                    size="mini"
                    @keyup.enter.native="handleInputConfirm(index)"
                    @blur="handleInputConfirm(index)"
                    @input="hanleInputChange($event)" 
                  >
                  </el-input>
                  <!-- <el-button v-else class="button-new-tag" size="mini" @click="showInput(index)">+ {{$t('btns.create_label')}}</el-button>
                  <el-button size="mini" @click="hanleClickCheked(index)">{{$t('btns.select_label')}}</el-button> -->
                </div>
              </li>
            </ul>
          </div>
          <div>
            <el-form ref="form" :model="form" label-width="120px" v-if="isHomeUpload">
              <el-form-item :label="$t('form.upload_department')">
                <el-select v-model="form.disks" :placeholder="$t('placeholder.upload_department_location')" size="mini" @change="disksChange">
                  <el-option
                  v-for="item in disksData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('form.upload_folder')">
                <el-select v-model="form.disksFolder" :placeholder="$t('placeholder.upload_folder_location')" size="mini">
                  <el-option
                  v-for="item in disksFoldersList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <!-- <span style="margin-right: 10px" v-show="disabled">{{$t('placeholder.enter_initiator')}}</span> -->
          <el-button type="primary" @click="handleSettingsOk" size="mini">{{$t('btns.determine')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: 'FileUploader',
  props: [
    'params'
  ],
  data(){
    return{
      getIndex: 0,
      categoryOkParams: [],
      visible: false,         //外层对话框
      innerVisible: false,    //内层对话框
      fileList: [],
      isUpload : true,
      closable : false,
      showProcess: false,     //显示进度条
      fileId: [],
      categoryData: [],  //标签数据
      form: {
        disks: '',          //部门
        disksFolder: '',    //文件夹
      },
      disksData: [],      //部门数据
      disksFoldersList: [],     //上传文件夹数据
      isHomeUpload: false,      //是否是首页的上传文件
      percentageth : 0,         //进度条初始值
      isShowProgress: false,    //进度条是否显示
      isShowText: true,         //进度条信息
      disabled: true,           //上传只读
      dynamicTags: [],          //动态贴标签
      inputVisible: false,      //获取是否动态贴标签
      isShowTop: false,         //是否调整外边距，上传中显示进度条要向下调整
      allfileArray: [],   
      folderUploadEnd:'',        //作为上传结束的标志  
    }
  },

  mounted(){
    this.getCategory()

  },
  watch:{
   folderUploadEnd:{
       handler(){
          if(this.folderUploadEnd){
     this.visible=false 
      this.fileId=[];
      this.fileList=[];
       
       this.allfileArray=[];
      this.$forceUpdate();
       this.$emit('onRefreshComponent', this.params);
        }
        }

      }
  },

  methods:{
    fileUploadCheck(){
     // .....根据项目需求做校验，满足条件阻止浏览器默认行为
     if(e&&e.preventDefault) {
       e.preventDefault();
     }

   },
    /**
     * 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
     */
    handleFileChange(file, fileList){
      if(file.status == "ready"){
        this.fileList = fileList;
        //首页没有自动上传
        if(this.params.folderId){
         
          this.isShowTop = true;
          const interval = setInterval(() => {
            if(this.percentageth >= 99){
              clearInterval(interval);
              return;
            }
            this.percentageth += 1
          },20)
         
        }
      }else if(file.status == "success"){
        fileList.map((file, index)=>{
          file["isInputVisible" +index] = false;
          file["inputValue" + index] = '';
          file["categoryOkParams" + index] = [];
          file["dynamicTags" + index] = (file.response && file.response.data && file.response.data[index]) ? file.response.data[index].categorys : [];
        })
        this.fileList = fileList;
        let fileId = [];
        //上传成功只读为false
        this.disabled = false;
        this.percentageth = 100;
        setTimeout(()=>{
          this.isShowProgress = false;
          this.isShowTop = false;
        },1000)
        fileList.map((e)=>{
          if(e.status ==  "success" && e.response.data != undefined){
            fileId.push(e.response.data);
          }
        })
        this.fileId = fileId;

      }else if(file.status == "fail"){
        this.$message({
          type: 'info',
          message: this.$t('msg.upload_err')
        });
      }
      //当没有folderId时，手动上传
      if(!this.params.folderId && file.status != "success"){
        this.visible = true;
        this.isHomeUpload = true;
        let params = {
          ...this.params,
          keyWord: this.params.keyWord,
          linesPerPage: 999,
          operationType: this.params.operationType,
          pageNo: this.params.pageNo,
          userid: this.params.userid,
        }
        API.getdisksData(params,{
          onSucess: resp => {
            if(resp.data.errcode == 0){
              this.disksData = resp.data.data.datas;
            }
          } 
        })
      }
       
    },

    folderUpload(e){
    },
    /**
     * 上传文件之前的钩子，参数为上传的文件
     */
    handleBeforeUpload(){
      if(this.params.folderId){
        let uploader = true
        this.visible = true
        return uploader
      }
    },

    /**
     * 获取标签数据
     */
    async getCategory(isAutoCategory){

      const categorySettingsData = (await API.getCategory()).data;
      this.categoryData = categorySettingsData.data;

   this.$nextTick(()=>{
      // this.$refs.upload
      document.getElementsByClassName(
        "el-upload__input"
      )[1].webkitdirectory=true;
    document.getElementsByClassName(
        "el-upload__input"
      )[1].id="inputfile";
          document.getElementsByClassName(
        "el-upload__input"
      )[1].onclick="fileUploadCheck()";
      
    })
  },
    /**
     * 删除动态标签
     */
    handleTagClose(tag,index){
      this.$confirm(this.$t('msg.sure_delete_tag'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.delete'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning'
      }).then(() => {
        let that = this;
        API.getLabelTreeDelete([tag.categoryId],{
          onSucess: resp => {
            if (resp.data.errcode == 0) {
              let fileListIndex;
              that.fileList[index]['dynamicTags'+index].map((fileType,i)=>{
                if(fileType.categoryId == tag.categoryId){
                  fileListIndex = i;
                }
              })
              that.fileList[index]['dynamicTags'+index].splice(fileListIndex, 1);
              that.$forceUpdate();
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          } 
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });          
      });
    },
    /**
     * 防止自动贴标签input框不能连续输入
     */
    hanleInputChange (e) {
      this.$forceUpdate()
    },
    /**
     * 创建标签
     */
    showInput(val) {
      // this.inputVisible = true;
      this.fileList[val]["isInputVisible"+val] = true;
      this.$forceUpdate();
      this.$nextTick(_ => {
        if(this.$refs.saveTagInput[val]){
          this.$refs.saveTagInput[val].$refs.input.focus();
        }
      });
    },
    /**
     * 动态添加标签
     */
    handleInputConfirm(val){
      let inputValue = this.fileList[val]["inputValue"+val];
      if (inputValue) {
        let dataJson = {};
        dataJson.name = inputValue.replace(/^\s*|\s*$/g,'').split(/[(\r\n)\r\n]+/);
        dataJson.parentId = '';
        API.getLabelTreeAdd(dataJson,{
          onSucess: resp => {
            if (resp.data.errcode == 0) {
              let data = resp.data.data;
              let fileArr = [];
              data.map((data)=>{
                let json = {};
                json.categoryName = data.name;
                json.categoryId = data.id
                fileArr.push(json);
                fileArr = this.fileList[val]["dynamicTags"+val].concat(fileArr);
              })
              this.fileList[val]["dynamicTags"+val] = fileArr;
              this.fileList[val]["isInputVisible"+val] = false;
              this.fileList[val]["inputValue"+val] = '';
              this.$forceUpdate();
              this.getCategory();
            }
          },
          onError: error =>{
            this.$message({
              type: 'warning',
              message: error.response.data.errmsg
            });
            this.fileList[val]["isInputVisible"+val]= false;
            this.fileList[val]["inputValue"+val] = '';
             this.$forceUpdate();
          } 
        });
      }else{
        this.fileList[val]["isInputVisible"+val]= false;
        this.$message({
          message: this.$t('msg.names_cannot_empty'),
          type: 'warning'
        });
        this.$forceUpdate();
        return false;
      }
      
    },
    /**
     * 选择标签
     */
    hanleClickCheked(index){
      this.categoryOkParams = []; 
      this.getCategory();
      this.getIndex = index;
      this.innerVisible = true;
      let arr = [];
      let categoryList  = this.categoryData;
      let addCatefory = this.fileList[index]['dynamicTags'+index];
      for(let i=0;i<categoryList.length;i++){
        for(let y=0;y<addCatefory.length;y++){
          if(addCatefory[y].categoryId == categoryList[i].id){
            arr.push(categoryList[i].id);
          }
        }
      }
      this.categoryOkParams = arr;
      this.$forceUpdate();
    },
    /**
     * 添加标签，回调到上传标签点击事件
     */
    hanleClickAddTag(){
      let categoryList = this.categoryData;
      let checkedList = this.categoryOkParams;
      let index = this.getIndex;
      let arr = [];
      for(var i=0;i<checkedList.length;i++){
        for(var y=0;y<categoryList.length;y++){
          if(checkedList[i] == categoryList[y].id){
            let categoryObj = {};
            categoryObj.categoryName = categoryList[y].name;
            categoryObj.categoryId = categoryList[y].id;
            arr.push(categoryObj);
          }
        }
      }
      let addCatefory = this.fileList[index]['dynamicTags'+index];
      let newArr = [];
      for(let a=0;a<arr.length;a++){
        let ischecked = false;
        for(let b=0;b<addCatefory.length;b++){
          if(arr[a].categoryId == addCatefory[b].categoryId){
              ischecked = true;
            }
          }
        if(!ischecked){
          newArr = newArr.concat(arr[a]);
        }
      }
      this.fileList[index]['dynamicTags'+index] = this.fileList[index]['dynamicTags'+index].concat(newArr);
      this.$forceUpdate();
      this.innerVisible = false;
    },

    /**
     * 组装包体数据
     */
    documentItem(fileId,categoryData,defaultValue,categorySettingsArr,a){
      if(categoryData){
        for(let y=0;y<defaultValue.length;y++){
          for(let i=0;i<categoryData.length;i++){
            if(defaultValue[y] == categoryData[i].id || defaultValue[y] == categoryData[i].name){
              let categorySettingsJson = {};
              categorySettingsJson.categoryName = categoryData[i].name;
              categorySettingsJson.categoryId = categoryData[i].id;
              categorySettingsJson.isAuto = false
              categorySettingsArr.push(categorySettingsJson);
            }
          }
        }
      }
      if(!a){
        a = 0;
      }
      let json = {}
      if(typeof(fileId) == "string"){
        json.fileId = fileId;
        json.categorys = categorySettingsArr;
      }else{
        json.fileId = fileId[a][0].fileId;
        json.categorys = categorySettingsArr;
      }
      return json;
    },
    /**
     * 确定
     */
    async handleSettingsOk(){
      // let fileId = this.fileId;
      // //fileId是上传文件后，后台返回的一个id，首页上传按钮没有真实上传，故不展示贴标签
      // if(fileId && fileId.length>0){
      //   const categoryData = this.categoryData;
      //   let defaultValue;
      //   let categorySettingsArr = [];
      //   let that = this;
      //   //单个贴标签
      //   if(this.fileList.length == 1){
      //     //标签分类属性
      //     defaultValue = this.fileList[0].categoryOkParams0;
      //     //贴标签
      //     let dynamicTagsList = this.fileList[0].dynamicTags0;
      //     let list = [];
      //     if(dynamicTagsList && dynamicTagsList.length>0){
      //       dynamicTagsList.map((tagsList)=>{
      //         list.push(tagsList.categoryName);
      //       })
      //     }
      //     defaultValue = list.concat(defaultValue);
      //     let doc = this.documentItem(fileId,categoryData,defaultValue,categorySettingsArr);
      //     await API.onePasteConfirm(doc);
      //   }else{
      //     let arr = [];
      //     this.fileList.map((fileList,a)=>{
      //       defaultValue = fileList['categoryOkParams'+a];
      //       //判断是否自己添加标签
      //       let autoCategory = fileList["dynamicTags"+a];
      //       if(autoCategory.length>0){
      //         let autoArr = [];
      //         autoCategory.map((autoData)=>{
      //           autoArr.push(autoData.categoryName);
      //         })
      //         defaultValue = autoArr.concat(defaultValue);
      //       }
      //       let categorySettingsArr = [];
      //       let doc = this.documentItem(fileId,categoryData,defaultValue,categorySettingsArr,a);
      //       arr.push(doc)
      //     })
      //     await API.pasteConfirm(arr);
      //   }
      //   this.$emit('onRefreshComponent', this.params);
      //   this.categoryOkParams = [];
      //   this.visible = false;
      // }else if(this.params.folderId){
      //   this.$message({
      //     message: this.$t('msg.file_being_uploaded'),
      //     type: 'warning'
      //   });
      // }else{
      //   if(this.form.disks == "" || this.form.disksFolder == ""){
      //     this.$message.error(this.$t('msg.location_sl_d_f'));
      //   }else{
      //     this.$refs.upload.submit();
      //     this.form = {
      //       disks: '',          //部门
      //       disksFolder: '',    //文件夹
      //     }
      //     this.$message({
      //       message: this.$t('msg.upload_ss'),
      //       type: 'success'
      //     });
      //     this.$emit('onRefreshHome', true);
      //     this.categoryOkParams = [];
      //     this.visible = false;
      //   }
      // }
      this.isShowProgress = true;
      let fileList=this.fileList 
       let filesPath=[];
    let form = new FormData();
     for(let i=0;i<fileList.length;i++){
        let a=fileList[i].raw.webkitRelativePath;
            a="/"+a;
            filesPath.push(a)
            form.append("files",fileList[i].raw);
      let ob = {};
			ob.uid = fileList[i].uid;
			ob.name = fileList[i].name
			ob.marks = 0;
			ob.marksValue = '0%';
			this.allfileArray.push(ob);
     } 
      form.append("folderId",this.params.folderId);
      form.append("diskId",this.params.diskId);
      form.append("filesPath",filesPath);

			let files = form;
    //    let filesPath=[];
    //  for(let i=0;i<e.target.files.length;i++){
    //     let a=e.target.files[i].webkitRelativePath;
    //         a="/"+a;
    //         filesPath.push(a);
    //  }
      // let form = new FormData();
      // form.append("files", e.target.files);
      // form.append("folderId",this.params.folderId);
      // form.append("diskId",this.params.diskId);
      // form.append("filesPath",filesPath);
        API.folderUpload(files,
      {
        onSucess: resp => {    
          let flieIdsign=true;
          this.isShowText = false;
          this.disabled = false;
          let fileList = this.fileList;
          let fileId = [];
          fileList.map((file, index)=>{   
          file["isInputVisible" +index] = false;
            file["inputValue" + index] = '';
            file["categoryOkParams" + index] = [];
            file["dynamicTags" + index] = (resp.data.data && resp.data.data[index]) ? resp.data.data[index].categorys : [];
            // fileId.push(resp.data.data);
            // file['fileId'] = resp.data.data[0].fileId
            if(!file['fileId'] && file.name==ob.name){
              file['fileId'] = resp.data.data[0].fileId
           
            }
          })
        
          this.fileList = fileList;
          // this.fileId = fileId;
         this.fileId.unshift(resp.data.data);
          
        //由于上传文件的文件，在后台生成fileid，没有与上传文件的内容自动对应，下面的函数是为了让文件和fileid对应而设置的
         if(this.fileId.length===this.fileList.length){
            for(let i=0;this.fileId.length>i;i++){
             this.fileId[i][0].fileId=this.fileList[i].fileId
            }  
         }
          for(let i=0; i<this.allfileArray.length; i++) {
            if(e.file.uid === this.allfileArray[i].uid) {
              this.allfileArray.splice(i,1);
              i--;
            }
          }
        }
			},
      (res) =>{   
        for(let i=0; i<this.allfileArray.length; i++) {
          this.folderUploadEnd=res.num
          console.log(this.folderUploadEnd)
            this.allfileArray[i].marks = res.num;
            this.allfileArray[i].marksValue= res.complete;
            this.$forceUpdate();
        }
      },
      )
      console.log(this.allfileArray[0].marks)      
        this.$emit('onRefreshComponent', this.params);
     // this.visible=false
      // this.fileId=[];
      // this.fileList=[];
      // this.$forceUpdate();
    },

    /**
     * 取消
     */
    handleClose(){
      //当取消时，将上传的文件删除
      let json = [];
      if(this.params.folderId){   //判断是否是首页上传文件，首页没有folderId
        let isFileId = false; //有fileId才能进行删除
        this.fileList.map((fileList)=>{
          if(fileList.response){
            fileList.response.data.map((data)=>{
              let arr = {};
              data.fileId ? isFileId = true : isFileId = false;
              arr.fileObjectId = data.fileId;
              arr.isFolder = false;
              json.push(arr);
            })
          }else{
            let arr = {};
            fileList.fileId ? isFileId = true : isFileId = false;
            arr.fileObjectId = fileList.fileId;
            arr.isFolder = false;
            json.push(arr);
          }
        })
        if(isFileId){
          let uploadFile = {
            diskId: this.params.diskId,
            fileObject: json
          }
          this.$emit('deleteUploadFile',uploadFile,this.params)
        }
      }else{
        this.$emit('onRefreshComponent', this.params);
        this.$message(this.$t('msg.upload_ca'));
      }
      this.fileList = [];
      this.visible = false;
    },
    
    /**
     * 获取上传文件夹
     */
    disksChange(id){
      let params = {
        diskId: id,
        pageNo: 1,
        linesPerPage: 1000
      }
      this.disabled = true;
      let user = this.$store.state.user;
      this.disksData.map((depart)=>{
        if(depart.id == id){
          /**
           * 判断是否有权上传
           * 1.企业域管理员
           * 2.该部门下的管理员(企业知识管理员)
           */
          if(depart.ownerId == user.defaultDepartment || user.level == 100){
            this.disabled = false;
          }
        }
      })
      //将文件夹选择清空
      this.form.disksFolder = "";
      this.disksFoldersList = [];
      API.getDisksFoldersList(params, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let datas = resp.data.data.datas;
            //当只有文件夹才显示
            let arr = [];
            datas.map((folder)=>{
              if(folder.folder){
                arr.push(folder);
              }
            })
            this.disksFoldersList = arr;
          }
        }
      })
    }
  }
}
</script>