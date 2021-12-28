<template>
  <div 
    class="custom-dialog"
    v-loading="loading"
    :element-loading-text="uploading?'上传中':$t('view.checking')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div class="body-cen">
      <div class="tmpl">
        {{$t('view.appendices')}}：<span @click="downloadFile">{{$t('view.dowm_moudles')}}</span>
      </div>
      <div class="upload">
        <el-input class="input" v-model="excelPath"></el-input> 
        <div>
          <el-upload
            multiple
            action=""
            name="files"
            :show-file-list='false'
            :http-request='uploadImg'
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeUpload"
            :on-exceed="handleExceed"
            accept=".xls,.xlsx" 
          >
            <span class="select">{{$t('view.select_files')}}</span>
          </el-upload>
        </div>
      </div>
      <div class="import" v-show="hiddenImport">
        <span class="excel-btn" @click="importExcel('excelimport')">
          <i class="importSurfaceicon" />
          {{$t('view.import_excel')}}
        </span>
        <span class="excel-btn excel-validation" @click="importExcel('validation')">
          <i class="importSurfaceicon" />
          {{$t('view.check_excel')}}
        </span>
      </div>
      <br>
      <el-progress v-show="isShowProgress" :percentage="importProgress" :stroke-width="8"></el-progress>
    </div>
  </div>
</template>

<script>
import Constant from "@/Constant.js";
export default {
  props: [
    "viewId", 
    "act",
    "view",
    "openParams"
  ],
  beforeDestroy(){
    window.clearInterval(this.task)
  },
  data: function() {
    return {
      Constant,
      excelPath:'',
      loading: false,
      isShowProgress: false,//是否显示导入excell进度条
      importProgress: 0,
      uploading:false,
      task:'',
      hiddenImport:true,
    };
  },

  methods: {
    downloadFile() {
      let path = this.act.excelTemplate
      let name = path.split("/")[path.split("/").length-1];
      this.$api.getFileExisted(
        encodeURIComponent(name),
        encodeURIComponent(path),
        {
          onSucess: res => {
            if(res.data.errcode == 500) {
              this.$message({
                message: this.$t('msg.no_moudules'),
                type: 'warning'
              });
            }else {
              this.$api.templateDownload(
                name,
                path,
                {
                  onSucess: response => {
                    let fileName = "";
                    let type = response.headers['content-type'];
                    if(response.headers['content-disposition']) {
                      //fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
                      fileName = name;
                    }else {
                      fileName=this.$t('msg.no_moudules');
                    }
                    this.download(response, type, fileName)
                  }
                }
              )
            }
          }
        }
      )
    },

    download(res, type, filename){
      const blob = new Blob([res.data], {
        // 如果后端没返回下载文件类型，则需要手动设置：type: 'application/pdf;chartset=UTF-8' 表示下载文档为pdf，如果是word则设置为msword，excel为excel
        type: type
      });
      const a = document.createElement('a');
      const herf = window.URL.createObjectURL(blob);
      // 下载链接
      a.href = herf;
      // 下载文件名,如果后端没有返回，可以自己写a.download = '文件.pdf'
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(herf);
    },


    importExcel(val) {
      if(!this.excelPath) {
        this.$message.error(this.$t('msg.select_excel'));
      }else {
        this.hiddenImport = false
        this.runBeforeAction(val);
      }
    },

    uploadImg(e){
      this.uploading = true;
      this.loading = true;
			let fileArray = e.file;
			let file = fileArray;
			let that = this;
      let form = new FormData();
      let id = 'WU_FILE_0',
          name = e.file.name,
          type = e.file.type,
          lastModifiedDate = e.file.lastModifiedDate,
          size = e.file.size;
      form.append("id", id);
      form.append("name", name);
      form.append("type", type);
      form.append("lastModifiedDate", lastModifiedDate);
      form.append("size", size);
      form.append("file", file);
      let allowedTypes = "xls;xlsx",
          fieldid = null,
          fileSaveMode = undefined,
          nullpath = "IMPORTEXCEL_PATH";
      this.$api.importFile(
        form,
        nullpath,
        fileSaveMode,
        fieldid,
        allowedTypes,
        this.openParams.appId,
        {
          onSucess: res => {
            if(res.data){
              setTimeout(() => {
                this.loading = false;
                this.uploading = false;
              }, 3000)
              let path = res.data.split("|")[1];
              //that.$emit("getExcelPath", path); 
              that.excelPath = path;
            }
          }
        }
      )
    },
    
    //执行脚本前
    runBeforeAction(val){
      let op = this.openParams;
      let act = this.act;
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: op.parentId ? op.parentId : "",
        templateForm: this.view.templateForm,
        viewId: op.actionContent,
        _selects: [],
      }
      if(op.isRelate) {
        formData.isRelate = op.isRelate;
      }
      let divId = act.id;
      let actType = act.type;
      this.$api.runBeforeActionScript(
        op.appId, 
        divId, 
        formData, 
        actType,
        '', //treedocid
        '', //flowType
        {
        onSucess: response => {
          if(response.data.errcode == 0 && response.data.data) {
            let errmsg = response.data.data.content;
            this.$notify.error({
              title: errmsg,
              message: ''
            });
          }else if(response.data.errcode == 0){
            this.performExport(val);
          }
        }
      });
    },

     //执行脚本后
    runAfterAction() {
      let op = this.openParams;
      let act = this.act;
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: op.parentId ? op.parentId : "",
        templateForm: "",
        viewId: op.actionContent,
        _selects: [],
      }
      let appId = op.appId;
      let divId = act.id;
      let docId = '';
      let parentId = op.parentId ? op.parentId : "";
      let _templateForm = '';
      let _ = '';
      this.$api.runAfterActionScript(
        appId,
        divId,
        docId,
        this.openParams.actionContent,
        this.view.relatedForm,
        _templateForm,
        parentId,
        _,
        formData,
        act.type,
        '', //treedocid
        {
          onSucess: response => {
            if(response.data.errcode == 0) {
              if(response.data.data.content) {
                let errmsg = response.data.data.content.content;
                this.$notify({
                  title: errmsg,
                  message: '',
                  type: 'warning'
                });
              }
            }
          }
        }
      );
    },

    performExport(val) {
      let op = this.openParams;
      let data = { 
        impmappingconfigid: this.act.impmappingconfigid,
        path: this.excelPath,
        actId: this.act.id,
        parentId: "",
        isRelate: undefined,
        type : val 
      };
      if(val == 'validation') {
        this.loading = true;
        this.$api.importExcel(
          op.appId, 
          this.viewId, 
          data,
          {
            onSucess: response => {
              this.loading = false;
              if(response.data.errcode==0) {
                this.$msgbox({
                  title: this.$t('tip'),
                  message: this.$t('msg.import_data'),
                  showCancelButton: true,
                  confirmButtonText: this.$t('msg.confirm'),
                  cancelButtonText: this.$t('btns.cancel'),
                }).then(() => {
                  this.importExcel('excelimport');
                }).catch(() => {
                  this.$emit("event");
                  this.$message({
                    type: 'info',
                    message: this.$t('msg.cancel_upload')
                  });
                });
              }else {
                if(response.data.errmsg) {
                  let arr = response.data.data;
                  let errMessage = '';
                  errMessage = arr.join('<br/>');
                  this.$message.error({
                    title:response.data.errmsg,
                    dangerouslyUseHTMLString: true,
                    message: errMessage,
                  });
                }else {
                  this.$message.error(this.$t('msg.err'));
                }
                this.$emit("event");
              }
            }
          }
        );
      }else {
        if(op.parentId) {
          data.parentId = op.parentId;
        }
        if(op.isRelate) {
          data.isRelate = "true";
        }else if(op.isRelate === false) {
          data.isRelate = "false";
        }
        let exparams = {
          appId: op.appId,
          docid: op.parentId,
          field: "",
          formId: op.formId,
          isRelate: op.isRelate,
          parentId: op.parentId
        }
        data.exparams = exparams
        this.task = setInterval(() => {
            this.$api.importExcelProgress({
              onSucess: res => {
                this.isShowProgress = true;
                let excelImportCount = res.data.data.excelImportCount//获取已经导入的条数
                let excelRowCount = res.data.data.excelRowCount//需要导入的总条数
                let process = Math.floor(((excelImportCount / excelRowCount) * 100))
                if(process) {
                  this.importProgress = process
                }else {
                  this.importProgress = 0
                }
                if(process == 100) {
                  this.importProgress = process
                  window.clearInterval(this.task)
                }

              }
            })
          }, 500);
        this.$api.importExcel(
          op.appId, 
          this.viewId, 
          data,
          {
            onSucess: response => {
              if(response.data.errcode==0) {
                //导入轮询
                this.$notify({
                  title: this.$t('success'),
                  message: '',
                  type: 'success'
                });
                //this.$emit("update:visible", false);
                this.$emit("event");
                this.runAfterAction();
                
              }else {
                if(response.data.errcode == 4001) {
                  let arr = response.data.data
                  let errMessage = ''
                  for(let i=0; i<arr.length; i++) {
                    errMessage += arr[i] + '\n'
                  }
                  console.log("errMessage-->",errMessage)
                  this.$notify.error({
                    title: response.data.errmsg,
                    message: `${errMessage}`
                  });
                  // this.$message.error(response.data.errmsg);
                }else {
                  this.$message.error(this.$t('msg.err'));
                }
                this.$emit("event");
              }
            }
          }
        );
      }
    },


		handlePreview(file) {
      
		},
		handleExceed(files, fileList) {
			
		},
		beforeUpload(file) {
			
		},
		beforeRemove(file) {
			
		},
		handleRemove(file) {
			
		},



  }
};
</script>>
