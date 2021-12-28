<template>
  <span :id="id" :name="field.name+'_show'" class="kms-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType.toLowerCase() == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <el-input
        type="hidden"
        :title="field.value"
        :style="field.style"
        v-model="field.value"
      ></el-input>
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div>
        {{field.printHiddenValue?field.printHiddenValue:field.value}}
      </div>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
      <div class="file-list" v-show="selectFileData.length > 0">
        <div class="list" v-for="(item, index) in selectFileData" :key="index">
          <div class="no-edit" @click="handlePreview(item)" v-if="!item.isEdit">
            <div class="list-left">
              <i class="el-icon-tickets"></i>
              {{item.fileName}}
            </div>
            <div class="list-right">
              <span class="icon-down" @click.stop="downloadFile(item)">
                <i class="el-icon-download"></i>
              </span>
              <span class="icon-del" @click.stop="deleteFile(item,index)">
                <i class="el-icon-delete"></i>
              </span>
              <span class="icon-edit" @click.stop="editFileName(item,index)">
                <i class="el-icon-edit"></i>
              </span>
            </div>
          </div>
          <div class="edit" v-else>
            <div class="input">
              <el-input v-model="item.name"></el-input>
            </div>
            <div class="icon-input">
              <i class="el-icon-circle-check" @click="confirm(item, index)"></i>
							<i class="el-icon-circle-close" @click="cancel(index)"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="kms-wrap">
        <div class="btn btnAdd obpm-upload-btn" @click="openKmDialog">
          {{field.name}}
        </div>
        <i 
          class="fa fa-history icon-log" 
          @click="getOperationLogs" 
          style="color:#46d2db" 
          v-if="showLogsIcon && field.isModified" 
          aria-hidden="true">
        </i>
        <form_operation 
          v-if="showLogsDialog"
          :docId="field.docId"
          :operationData="operationData"
          @event="hiddenLogsDialog"
          />
      </div>
    </template>
    <template v-else-if="field.readOnlyShowValOnly">
      <!-- 只读（文本模式） -->
      <template>{{field.value}}</template>
    </template>
    <template v-else>
      <!-- 只读（控件模式） -->
      <div class="btn btnAdd obpm-upload-btn">
        {{field.name}}
      </div>
    </template>
    <el-dialog
      :title="field.name"
      :visible.sync="dialogVisible"
      width="50%"
    >
      <div class="km-dialog">
        <div class="header">
          <div class="left">
            <el-button v-if="selectData.length" type="success" size="small" @click="onOk">{{$t('msg.confirm')}}</el-button>
          </div>
          <div class="right">
            {{$t('flow.name')}}：
            <span class="sear-input">
              <el-input @keyup.enter.native="openKmDialog" v-model="searchValue" ></el-input>
            </span>
            <span class="sear-btn">
              <el-button size="small"  @click="openKmDialog">{{$t('btns.query')}}</el-button>
            </span>
          </div>
        </div>
        <div class="table-box">
          <el-scrollbar class="scrollbar">
            <el-table
              :header-cell-style="{background:'#F2F2F2',color:'#5A6779'}"
              ref="multipleTable"
              :data="tableData"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="handleSelectionChange">
              <el-table-column
                v-model="selectData"
                type="selection"
                width="55">
              </el-table-column>
              <el-table-column
                :label="$t('flow.name')">
                <template slot-scope="scope">{{ scope.row.fileName }}</template>
              </el-table-column>
              <el-table-column
                :label="$t('view.create_time')">
                <template slot-scope="scope">{{ scope.row.createDate }}</template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>

      </div>
    </el-dialog>
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-file-kms",
  props: ["id"],
  components: {
    form_operation,
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return this.$parent.findField(this.id);
    }
  },
  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  data: function() {
    return { 
      dialogVisible:false,
      Constant,
      isActive:false,
      errorMessage:'',
      searchValue:'',
      tableData:[],
      selectData:[],
      selectFileData:[],
      showLogsDialog: false,
      showLogsIcon:true,
      operationData:'',
    };
  },
  methods: {
    confirm(item,index){
      let name = item.name;
      // name = name.replace(/^(\s|.)+|(\s|.)+$/g, "");
      this.selectFileData[index].fileName = name + "." + item.suffix;
      this.selectFileData[index].isEdit = false;
      this.$forceUpdate();
    },
		cancel(index) {
      this.selectFileData[index].isEdit = false;
      this.$forceUpdate();
    },
    editFileName(item, index){
      this.selectFileData[index].isEdit = true;
      this.$forceUpdate();
    },
    handlePreview(file) {
			this.$api.getenvironment(
				{
					onSucess: res => {
						if(res.data.errcode === 0) {
							if(res.data.data === true) {
                let realName = file.filePath.split("/")[file.filePath.split("/").length - 1];
                let kmsPath = "/uploads/kms/" + file.filePath;
                this.$api.getHasPdfFile(
                  kmsPath,
                  realName,
                  {
                    onSucess: resp => {
                      if(res.data.data === true) {
                        let isEdit = this.field.previewEdit?'edit':'';
                        let waterMark = this.field.watermark?encodeURI(this.field.watermark):undefined;
                        let openWaterMark = this.field.openWaterMark;
                        let curEditUserId = file.curEditUserId;
                        let userName = this.$store.state.myProfile.name;
                        let showTrackRevisions = this.field.showTrackRevisions;
                        let selectEditPlug = this.field.selectEditPlug;
                        let cp = obpmConfig.obpmFilePath;
												sessionStorage.setItem("obpmContextPath", cp);
												let statiContextPath = obpmConfig.statiContextPath;
												let pdfPath = "";
												if(statiContextPath) { //5.0 trunk
													pdfPath = obpmConfig.statiContextPath;
												}else { //4.4 stable
													pdfPath = cp;
												}
                        let url = pdfPath + '/portal/vue/pdf/pdfviewer.html?action=' + isEdit + 
                           "&path=/uploads/kms/" + file.filePath + 
                            "&name=" + realName + 
                            "&showName=" + file.fileName + 
                            "&waterMark=" + waterMark + 
                            "&openWaterMark=" + openWaterMark +
                            "&curEditUserId=" + curEditUserId  +
                            "&userName=" + userName + 
                            "&showTrackRevisions=" + showTrackRevisions +
                            "&selectEditPlug=" + selectEditPlug;
                        window.open(url);
                      }
                    }
                  }
                )
								
							}
						}
					}
				}
			)
		},

    hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
    },
    enter(){
      if(this.field.isModified) {
        this.showLogsIcon = true;
      }
    },
    getOperationLogs() {
      let obj = {};
      obj.fieldName = this.field.name;
      this.operationData = obj;
      this.showLogsDialog = true;
    },

    downloadFile(item){
      let name = item.fileName;
      let path = '/uploads/kms/' + item.filePath;
      this.$api.templateDownload(
        name,
        path,
        {
          onSucess: response => {
            console.log("res--->",response)
            let fileName = "";
            let type = response.headers['content-type'];
            if(response.headers['content-disposition']) {
              //fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
              fileName = name;
            }else {
              fileName=this.$t('report.download');
            }
            this.download(response, type, fileName);
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

    deleteFile(item,index){
      let field = this.field;
      this.$confirm(this.$t('view.goon'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.deleteKmsFile(
          this.$root.appid, 
          field.formId, 
          field.docId, 
          item.filePath,
          {
            onSucess: res=> {
              if(res.data.errcode == 0) {
                this.selectFileData.splice(index,1);
                this.$notify({
                  title: '',
                  message: res.data.data,
                  type: 'success'
                });
              }
            }
          }
        )
      }).catch(() => {
                
      });
    },
    onOk() {
      let list = JSON.parse(JSON.stringify(this.selectData));
      list.forEach(el => {
        let a1 = el.fileName.split(".");
        el.isEdit = false;
        el.suffix = a1[a1.length - 1];
        a1.length = a1.length - 1;
        if(a1.length>1){
          el.name = a1.join(".");
        }else {
          el.name = a1[0];
        }
      });
      this.selectFileData = list;
      this.dialogVisible = false; 
      this.$refs.multipleTable.clearSelection();
    },
    handleSelectionChange(val){
      this.selectData = val;
    },
    openKmDialog() {
      console.log("------------>",this.selectData)
      this.dialogVisible = true;
      //fileName=&orderByfield=CREATE_DATE&orderMode=desc&pageNo=1&linesPerPage=10&_=1594349604925
      let params = {
            fileName:this.searchValue,
            orderByfield:'CREATE_DATE',
            orderMode:'desc',
            pageNo:1,
            linesPerPage:10,
            _: new Date().getTime(),
          }
      this.$api.getKmsFiles(
        params,
        {
          onSucess: res => {
            let newData = res.data.data.datas.map(item => {
              return {
                fileName: item.name,
                createDate: item.createDate,
                filePath: item.url,
                curEditUserId: item.creatorId,
              }
            });
            this.tableData = newData;
          }
        }
      )


    },
    onChange(){
      if (this.field.refreshOnChanged){
        this.$parent.refresh(this.id);
      }
    }
  },
};
</script>
