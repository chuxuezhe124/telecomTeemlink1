<template>
  <span :id="id" class="file-upload-control">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || (field.textType && field.textType == 'hidden')"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <el-input
        :readonly="true"
        type="hidden"
        :style="field.style"
        :name="field.name"
        v-model.lazy="field.value"
        :title="field.title"
      />
    	<span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>

		<template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 打印 -->
      <div class="file-upload-wrap" > 
				<div class="file-box" v-if="field.value&&field.value.length>0">
					<div class="file-list"
						:style="{width:field.filew + 'px', height: field.fileh + 'px'}" 
						 v-for="(item, index) in field.value" 
						:key="index"
					>
						<div class="file_f">
							<span class="sortbtn" v-if="field.supportSorting">
								<a class="up"></a>
								<a class="down"></a>
							</span>
             	<span :class="[setClass(item), 'icon-file']"></span>
					  	<span class="title">{{item.name}}</span>	
						</div>
						<div class="show-user-date" v-if="field.showUserNameAndDate">
							<span class="size">{{item.uploader}}&nbsp;&nbsp;{{item.uploadTime}}</span>
						</div>
					</div>
				</div>
			</div>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
			<!-- <div 
				class="file-upload-wrap"
				@mouseenter="enter()"
				v-if="!field.supportSorting">
				<div class="file-box" v-if="field.value&&field.value.length>0">
					<div class="file-list"
						:style="{width:field.filew + 'px', height: field.fileh + 'px'}" 
						@mouseover="changeActive(index)" v-for="(item, index) in field.value" 
						:key="index"
						@mouseout="removeActive"
					>
						<div class="file_f">
							<div :class="[setClass(item), 'icon-file']"></div>
							<div class="title" @click="handlePreview(item)">{{item.name}}</div>	
							<transition name="fade">
								<span v-if="isShow && isActive==index" class="mask">
									<span @click="download(item)">
										<i class="el-icon-download"></i>
									</span>
									<span @click="opendialog(item)">
										<i class="el-icon-delete"></i>
									</span>
								</span>
							</transition>
						</div>
					</div>
				</div>
				<el-upload
					multiple
					action=""
					:limit="parseInt(field.limitNumber)"
					:show-file-list='false'
					class="upload-demo"
					name="files"
					:http-request='uploadImg'
					:on-preview="handlePreview"
					:on-remove="handleRemove"
					:before-remove="beforeRemove"
					:before-upload="beforeUpload"
					:on-exceed="handleExceed"
					:file-list="field.value?field.value:[]">
					<el-button size="small" type="primary">{{$t('btns.click_upload')}}</el-button>
				</el-upload>
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
			</div> --> 
			<div class="file-upload-wrap" > 
				<div class="file-box" v-if="field.value && field.value.length>0">
					<div class="file-list"
						:style="{height: field.fileh + 'px'}" 
						v-for="(item, index) in field.value" 
						:key="index"
						@mouseenter="enter()"
					>
						<div class="file_f" v-if="!item.isEdit">
							<div class="file_box">
								<span class="sortbtn" v-if="field.supportSorting">
									<a class="up" @click="listUp(index)"></a>
									<a class="down" @click="listDown(index)"></a>
								</span>
								<span :class="[setClass(item), 'icon-file']"></span>
								<span class="title fileName" @click="handlePreview(item)" :title="item.name">{{item.name}}</span>	
							</div>
							<transition name="fade" >
								<span class="mask">
									<span @click="download(item)" style="margin-right:10px;">
										<i :title="$t('report.download')" class="el-icon-download"></i>
									</span>
									<span @click="opendialog(item)" style="margin-right:10px;">
										<i :title="$t('delete')" class="el-icon-delete"></i>
									</span>
									<span @click="editFileName(item)" style="margin-right:10px;">
										<i :title="$t('view.rename')" class="el-icon-edit"></i>
									</span>
									<span @click="handlePreview(item)">
										<i :title="$t('btns.preview')" class="el-icon-folder-opened"></i>
									</span>
								</span>
							</transition>
						</div>
						<div style="display: flex; align-items:center" v-else>
							<el-input :value="newFileName" @input="newFileName = $event"></el-input>
							<i class="el-icon-circle-check" @click="confirm(item)"></i>
							<i class="el-icon-circle-close" @click="cancel(item)"></i>
						</div>
						<div class="show-user-date" v-if="field.showUserNameAndDate || field.showusernameanddate==='true'" style="pointer-events: none;" >
							<span class="size">{{item.uploader}}&nbsp;&nbsp;{{item.uploadTime}}</span>
						</div>
					</div>
				</div>
				<div class="file-marks-box" v-for="(item, index) in allfileArray" :key="index" style="margin-bottm:8px;">
					<div class="slider-list">
						<span :class="[setClass(item), 'icon-file']"></span>
						<span class="title">{{item.name}}</span>	
						<el-progress :percentage="item.marks" :stroke-width="8"></el-progress>
					</div>
				</div>
				<div class="upload-wrap">
					<el-upload
						multiple
						action=""
						:limit="parseInt(field.limitNumber)"
						:show-file-list='false'
						class="upload-demo"
						name="files"
						:http-request='uploadImg'
						:on-preview="handlePreview"
						:on-remove="handleRemove"
						:before-remove="beforeRemove"
						:before-upload="beforeUpload"
						:on-exceed="handleExceed"
						:file-list="field.value?field.value:[]">
						<el-button size="small" type="primary">{{$t('btns.click_upload')}}</el-button>
					</el-upload>
					<span v-if="field.instantValidate" class="mark">*</span>
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
			<div class="tips" v-show="isActiveError">
        {{errorMessage}}
      </div>
    </template>

		<template v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
				<div class="file-upload-wrap" > 
					<div class="file-box" v-if="field.value && field.value.length>0">
						<div class="file-list"
							:style="{height: field.fileh + 'px'}" 
							v-for="(item, index) in field.value" 
							:key="index"
							@mouseenter="enter()"
						>
							<div class="file_f">
								<div class="file_box">
									<span class="sortbtn" v-if="field.supportSorting">
										<a class="up" @click="listUp(index)"></a>
										<a class="down" @click="listDown(index)"></a>
									</span>
									<span :class="[setClass(item), 'icon-file']"></span>
									<span class="title" @click="handlePreview(item)" :title="item.name">{{item.name}}</span>	
								</div>
								<transition name="fade">
									<span v-if="isShow && isActive==index" class="mask">
										<span @click="download(item)" style="margin-right:10px;">
											<i :title="$t('report.download')" class="el-icon-download"></i>
										</span>
										<span @click="handlePreview(item)">
											<i :title="$t('btns.preview')" class="el-icon-folder-opened"></i>
										</span>
									</span>
								</transition>
							</div>
							<div class="show-user-date" v-if="field.showUserNameAndDate">
								<span class="size">{{item.uploader}}&nbsp;&nbsp;{{item.uploadTime}}</span>
							</div>
						</div>
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
			<!-- 文本（控件模式） -->
			<template v-else>
				<div class="file-upload-wrap" > 
					<div class="file-box" v-if="field.value&&field.value.length>0">
						<div class="file-list"
							:style="{height: field.fileh + 'px'}" 
							v-for="(item, index) in field.value" 
							:key="index"
							@mouseenter="enter()"
						>
							<div class="file_f">
								<div class="file_box">
									<span class="sortbtn" v-if="field.supportSorting">
										<a class="up" @click="listUp(index)"></a>
										<a class="down" @click="listDown(index)"></a>
									</span>
									<span :class="[setClass(item), 'icon-file']"></span>
									<span class="title" @click="handlePreview(item)" :title="item.name">{{item.name}}</span>	
								</div>
								<transition name="fade">
									<span v-if="isShow && isActive==index" class="mask">
										<span @click="download(item)" style="margin-right:10px;">
											<i :title="$t('report.download')" class="el-icon-download"></i>
										</span>
										<span @click="handlePreview(item)">
											<i :title="$t('btns.preview')" class="el-icon-folder-opened"></i>
										</span>
									</span>
								</transition>
							</div>
							<div class="show-user-date" v-if="field.showUserNameAndDate">
						    <span class="size">{{item.uploader}}&nbsp;&nbsp;{{item.uploadTime}}</span>
							</div>
						</div>
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
    </template>
		<el-dialog 
			class="custom-view-dialog"
			:visible.sync="dialogVisible" 
			:append-to-body="true" 
			center
			width="60%"
			size="tiny">
			<div class="img-box" @mousewheel.prevent="rollImg">
				<img height="auto" width="auto" 
					:src="dialogImageUrl"
					alt="" 
					:style="{transform:'scale(' + imgDetails.scaleNum+')'}">
			</div>
		</el-dialog>	
  </span>
</template>

<script>
import Constant from "@/Constant.js";
import API from "@/api.js";
import form_operation from "@/components/form_operation_log";
import controlHidden from "@/assets/js/controlHidden.js"
export default {	
	name: 'o-file-upload',
	props: ["id"],
	components: {
    form_operation,
  },
	computed: {
		field: function() {
			let formData = this.$parent.findField(this.id);
			if(formData.value && typeof formData.value == 'string') {
        try{
					formData.value = JSON.parse(JSON.parse(decodeURI(formData.value)));
				}catch(e){
					formData.value = JSON.parse(decodeURI(formData.value));
				}
      }else if(formData.value && formData.value instanceof Array) {
        if(formData.value.length == 0) {
          formData.value = "";
        }else {
          formData.value = formData.value;
        }
        formData.value = formData.value;
      }else {
        formData.value = '';
			}
			
			formData.picUrl = obpmConfig.obpmFilePath;
			return this.$parent.findField(this.id);
		}
	},
	data: function() {
		return {
			isActiveError:false,
      errorMessage:'',
			marks:0,
			marksValue:'0%',
			Constant,
			fileList: [],
			fileType:'',
			showLogsDialog: false,
			showLogsIcon:true,
			isShow: false,
			isActive:-1,
			operationData:'',
			fileArray:[],
			allfileArray:[],
			newFileName: '', // 新的文件名字
			fileSuffix: '', // 文件名后缀
			dialogVisible: false,
			dialogImageUrl:'',
			dialogHeight: '',
			imgDetails: {
				scaleNum:1,
      	zoom:'',
			}
		};
	},
	mounted() {
		this.$nextTick(() => { //使用nextTick为了保证dom元素都已经渲染完毕 
			let field = this.field;
			if(field.isHideType) {
				let id = this.id,
					formShowType = field.formShowType;
				controlHidden({id, field, formShowType})
			}

			if(field.fileh) {
				document.getElementById(this.field.id).getElementsByClassName("el-upload")[0].style.width  = parseInt(this.field.filew) +"px";
				document.getElementById(this.field.id).getElementsByClassName("el-upload")[0].style.height =  parseInt(this.field.fileh)+"px";
				document.getElementById(this.field.id).getElementsByClassName("el-upload")[0].style.lineHeight = parseInt(this.field.fileh) +"px";
				// document.getElementById(this.field.id).getElementsByClassName("el-upload-list__item")[0].style.width  = parseInt(this.field.imgw) +"px";
				// document.getElementById(this.field.id).getElementsByClassName("el-upload-list__item")[0].style.height  = parseInt(this.field.imgh) +"px";
			}
		});
		
	},
	methods: {
		// 缩放图片
    rollImg() { 
      /* 获取当前页面的缩放比 若未设置zoom缩放比，则为默认100%，即1，原图大小 */ 
      let zoom = parseInt(this.zoom) || 100;
      /* event.wheelDelta 获取滚轮滚动值并将滚动值叠加给缩放比zoom wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动 */ 
      zoom += event.wheelDelta / 12;
        /* 最小范围 和 最大范围 的图片缩放尺度 */ 
      if (zoom >= 5 && zoom <500) { 
        this.imgDetails.zoom = zoom + "%"; 
        let zoomNum = zoom/100;
        this.imgDetails.scaleNum = zoomNum;
      }
      return false; 
    },

		setClass(item){
			let obj = ''
			if(item.fileType) {
				obj = item.fileType.substr(1);
			}else {
				obj = item.name.split('.')[1];
			}
			return obj;
		},
		
		hiddenLogsDialog() {
      this.showLogsIcon = false;
      this.showLogsDialog = false;
		},

		listUp(index) {
      if(index == 0) {
        console.log("最顶部-->");
      }else {
        let arr = this.field.value;
        arr[index] = arr.splice(index-1, 1, arr[index])[0];
        this.field.value = arr;
      }
		},
		
		listDown(index) {
      if(index == this.field.value.length-1) {
        console.log("最底部-->")
      }else {
        let arr = this.field.value;
        arr[index] = arr.splice(index+1, 1, arr[index])[0];
        this.field.value = arr;
      }
      
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
	
		uploadImg(e){
			let ob = {};
			ob.uid = e.file.uid;
			ob.name = e.file.name
			ob.marks = 0;
			ob.marksValue = '0%';
			this.allfileArray.push(ob);
			
			let fileArray = e.file;
			let file = fileArray;
			let that = this;
			let form = new FormData();
			form.append("files", file);
			let files = form;
			let actionType = this.fileType;
			let appId = this.$root.appid;
			let allowedTypes = this.field.fileType;
			let fieldId = this.id;
			let fileSaveMode = this.field.fileSaveMode;
			let path = this.field.path;
			this.$api.uploadFile(
				files, 
				appId, 
				allowedTypes,  
				fieldId, 
				fileSaveMode, 
				path, 
				actionType,
				{
					onSucess: response => {
						for(let i=0; i<this.allfileArray.length; i++) {
							if(e.file.uid === this.allfileArray[i].uid) {
								this.allfileArray.splice(i,1);
								i--;
							}
						}
						let uploadTime = '';
						let date = new Date();
						let Y = date.getFullYear() + '-';
						let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
						let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
						let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())+ ':';
						let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
						let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()); 
						uploadTime = Y+M+D+h+m+s;

						that.picUrl = obpmConfig.obpmFilePath + "/";
						let obj = {
							name: response.data.data[0].fileName,
							path: response.data.data[0].filePath,
							url: obpmConfig.obpmFilePath + "/" + response.data.data[0].filePath,
							fileType: response.data.data[0].fileType,
							uploader: that.$root.user.name,
							uploadTime,
							userName: that.$root.user.name,
							time: uploadTime,
							size: fileArray.size.toString()
						};
						that.fileArray.push(obj);
						if(that.field.value && that.field.value instanceof Array) {
							that.field.value = that.fileArray.concat(that.field.value);
						}else {
							that.field.value = that.fileArray;
						}
						that.fileArray = [];
						if (that.field.refreshOnChanged){
							that.$parent.refresh(that.id);
						}
						if(that.field.instantValidate) {
							this.evenCheck();
						}
					}
				},
				
				(res) =>{
					for(let i=0; i<this.allfileArray.length; i++) {
						if(res.uid === this.allfileArray[i].uid) {
							this.allfileArray[i].marks = res.num;
							this.allfileArray[i].marksValue= res.complete;
							this.$forceUpdate();
						}
					}
					//  
					// console.log("res--->",res)
					// this.marks = res.num;
					// this.marksValue = res.complete;
				},
				e.file.uid,
			)
		},

		handlePreview(file) {
			let field = this.field
			let isImg = false
			let isVideo = false
			// let isPdf = false //只针对裕发家具
			if(file.name) {
        let name = file.name.split('.')[file.name.split('.').length - 1];
        name = name.toLowerCase();
        if(
          name == 'png' || 
          name == 'jpg' || 
          name  == 'jpeg' || 
          name == 'gif' ) {
          isImg = true;
        }else if(
					name == 'mp3' || 
          name == 'mp4' 
				) {
					isVideo = true
				}
				// else if(name == 'pdf'){ //只针对裕发家具
				// 	isPdf = true
				// }
			}

			// if(isPdf) { //只针对裕发家具
			// 	let url = window.location.origin + obpmConfig.obpmFilePath + file.path
			// 	window.open(url)
			// 	return
			// }

			if(isImg) {
        this.dialogImageUrl = obpmConfig.obpmFilePath + "/" + file.path
        this.dialogVisible = true
        return
			}

			if(isVideo) {
				let url = window.location.origin + obpmConfig.obpmFilePath + file.path
				window.open(url)
				return
			}

			let realName = file.path.split("/")[file.path.split("/").length - 1];
			this.$api.getHasPdfFile(file.path, realName,
				{
					onSucess: res => {
						if(res.data.data){
							this.$api.getenvironment(
								{
									onSucess: res => {
										if(res.data.errcode === 0) {
											if(res.data.data === true) {
												let isEdit = field.previewEdit?'edit':'';
												let waterMark = field.watermark;
												let openWaterMark = field.openWaterMark;
												let curEditUserId = this.$store.state.myProfile.id;
												let userName = this.$store.state.myProfile.name;
												let showTrackRevisions = field.showTrackRevisions;
												let selectEditPlug = field.selectEditPlug;
												let cp = obpmConfig.obpmFilePath;
												sessionStorage.setItem("obpmContextPath", cp);
												let statiContextPath = obpmConfig.statiContextPath;
												let pdfPath = "";
												if(statiContextPath) { //5.0 trunk
													sessionStorage.setItem("isTrunk", true);
													pdfPath = obpmConfig.statiContextPath;
												}else { //4.4 stable
													sessionStorage.setItem("isTrunk", false);
													pdfPath = cp;
												}
												let url = pdfPath + '/portal/vue/pdf/pdfviewer.html?action=' + isEdit + 
													"&path=" + file.path + 
													"&name=" + realName + 
													"&showName=" + file.name + 
													"&waterMark=" + waterMark + 
													"&openWaterMark=" + openWaterMark +
													"&curEditUserId=" + curEditUserId  +
													"&userName=" + userName + 
													"&showTrackRevisions=" + showTrackRevisions +
													"&selectEditPlug=" + selectEditPlug;
													let URL = encodeURI(url)
													window.open(URL);
											}
										}
									}
								}
							)
						}else{
							this.$message({
								message: this.$t('view.trandformAndWait'),
								type: 'warning'
							});
						}
					}
				}
			)

		},
		
		download(file){ 
			if(this.field.watermark) {
				this.$api.downloadWaterMarkFile(
					this.field.watermark,
					'',
					'',
					{
						onSucess: res => {
							if(res.data.waterMarkStr) {
								let url = encodeURI(
									obpmConfig.contextPath + "/runtime/file/download?filename=" + file.name + 
									"&filepath=" + file.path + 
									"&watermarkStr=" + res.data.waterMarkStr);
                window.open(url);
							}
						}
					}
				)
			}else {
				//$t('report.download')
				let link = document.createElement('a')
				link.style.display = 'none'
				let op = obpmConfig.obpmFilePath;
				let statiContextPath = obpmConfig.statiContextPath;
				if(statiContextPath) { //5.0 trunk
					op = op + "/api";
				}
				link.href = op + "/runtime/file/download?filename=" + encodeURI(file.name) + "&filepath=" + file.path;
				link.setAttribute('download', file.name);
				link.click();
			}
		},

		handleExceed(files, fileList) {
			this.$message.warning(this.$t('view.out'));
		},
		
		beforeUpload(file) {
			let field = this.field;
			if(field.customizeType) {
				let testmsg = file.name.substring(file.name.lastIndexOf('.')+1);
				this.fileType = file.type;
				// const extension = testmsg === field.customizeType;
				const extension = field.customizeType.indexOf(testmsg) > -1;
				if(!extension) {
					this.$message({
						message: this.$t('view.upload_only')+`${field.customizeType}`+this.$t('form.format'),
						type: 'error'
					});
					this.fileList = [];
				}
				return extension ;
			}else {
				this.fileType = file.type;
			}
			if(file.size/1024 > this.field.maxsize){
				this.$message({
					message: this.$t('view.upload_over')+`${this.field.maxsize/1024}M!`,
					type: 'error'
				});
				this.fileList = [];
				return false;
			}
		},

		beforeRemove(file) {
			// if(this.field.customizeType != "xmind") {
			// 	return this.$confirm(`确定移除 ${ file.name }？`).then(() => {});
			// }
			if(file && file.status=="success") {
				return this.$confirm(this.$t('btns.comfirm_remove')+`${ file.name }？`).then(() => {});
			}	
		},

		opendialog(item,index) {
			this.$confirm(this.$t('view.goon'), this.$t('tip'), {
				confirmButtonText: this.$t('msg.confirm'),
				cancelButtonText: this.$t('btns.cancel'),
				type: 'warning'
			}).then(() => {
				this.$message({
					type: 'success',
					message: this.$t('msg.es')
				});
				this.handleRemove(item,index);
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('msg.cancel_del')
				});          
			});
		},

		/**
		 * $t('view.rename')文件的名称
		 */
		editFileName(item){
			this.field.value.forEach(item => item.isEdit = false)
			item.isEdit = true
			if(!item.fileType) {
				let fileType;
				let itemName;
				itemName = item.name;
				fileType = itemName.substring(itemName.lastIndexOf("."),itemName.length);
				item.fileType = fileType;
			}
      this.fileSuffix = item.fileType
      this.newFileName = this.cutSuffix(item.name)
      this.$forceUpdate()
		},

		/**
		  * 确认修改文件名
		  */
		confirm(item){
			item.name = this.newFileName + this.fileSuffix
			item.isEdit = false
			this.$forceUpdate()
		},

		/**
		 * 取消修改文件名
		 */
		cancel(item){
			item.isEdit = false
			this.$forceUpdate()
    },

		/**
		* 截取文件名后缀
		*/
		cutSuffix(name){
      return name.replace(this.fileSuffix, '')
    },
			
		handleRemove(file, fileList) {
			let appId = this.$root.appid;
      let formId = this.field.formId;
      let docId = this.field.docId;
			let path = file.path;
			let field = this.field;
      API.deleteUpload(appId, formId, docId, path, {
        onSucess: (res) => {
					if(res.data.errcode == 0) {
						let arr = this.field.value;
						for(let i=0; i<arr.length; i++) {
							if(file.path == arr[i].path) {
								arr.splice(i, 1);
							}
						}
					}
          if (this.field.refreshOnChanged){
            this.$parent.refresh(this.field.id);
					}
					if(field.instantValidate) {
						this.evenCheck();
					}
        }
      });
		},
		
		evenCheck(){
      let value = true;
      let formData = this.$parent.checkData(value);
      this.$api.formValidation(
        this.$root.appid, 
        formData,
        {
          onSucess: response => {
            if(response.data.errcode == 4001) {
              if(response.data.errors && response.data.errors.length > 0) {
                let arr = response.data.errors;
                for(let i=0; i<arr.length; i++) {
                  if(this.field.name == arr[i].field) {
                    this.isActiveError = true;
                    this.errorMessage = arr[i].errmsg
                    return;
                  }else {
                    this.isActiveError = false;
                    this.errorMessage = '';
                  }
                }
              }
            }else if(response.data.errcode == 0) {
              this.isActive = false;
            }
          }
        }
      )
    },
	}
}
</script>

<style>
</style>
