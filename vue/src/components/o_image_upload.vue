<template>
  <span :id="id" class="image-upload">
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
      <div>
				<img class="printImg" v-for="(item, index) in field.value" :key="index" :src="item.url" :style="{width:field.imgw + 'px', height: field.imgh + 'px'}" >
        <!-- <img src="../assets/images/face.jpg" style="width:100px;height:100px" /> -->
      </div>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <!-- 可编辑 -->
			<div 
				class="img-wrap" 
				@mouseenter="enter()">
				<div class="img-box" v-if="field.value&&field.value.length>0">
					<div class="pic-list"
						:style="{width:field.imgw + 'px', height: field.imgh + 'px'}" 
						@mouseover="changeActive(index)" v-for="(item, index) in field.value" 
						:key="index"
						@mouseout="removeActive"
					>
						<div class="pic">
							<img 
								:style="{width:field.imgw + 'px', height: field.imgh + 'px'}"
							 	:src="item.url?item.url:field.picUrl+item.path" />
						</div>
						<transition name="fade">
							<div v-if="isShow && isActive==index" class="mask">
								<span @click="handlePictureCardPreview(index)">
									<i class="el-icon-zoom-in"></i>
								</span>
								<span @click="opendialog(item,index)">
									<i class="el-icon-delete"></i>
								</span>
							</div>
						</transition>
					</div>
				</div>
				<div v-for="(item, index) in allfileArray" :key="index" class="file-marks-box" :style="{width:field.imgw + 'px', height: field.imgh + 'px', marginBottm: '8px'}">
					<div class="slider-list" :style="{width:field.imgw - 9 + 'px', height: field.imgh - 9 + 'px'}">
						<img :src="item.path" :style="{width:field.imgw - 9 + 'px', height: field.imgh - 9 + 'px'}" />
					</div>
					<el-progress :percentage="item.marks" :stroke-width="8"></el-progress>
				</div>
				
				<el-upload
					:show-file-list='false'
					multiple
					action=""
          ref="upload"
          name="files"
					:limit="parseInt(field.limitNumber)"
					:http-request='uploadImg'
					list-type="picture-card"
					:file-list="field.value?field.value:[]"
					:on-preview="handlePictureCardPreview"
					:on-remove="handleRemove"
					:on-exceed="handleExceed"
					:on-success="uploadSuccess"
					:before-upload="beforeAvatarUpload"
					:auto-upload="true"
					accept="image/*"
				>
					<i class="el-icon-plus"></i>
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
				<el-dialog 
					class="custom-view-dialog"
					:visible.sync="dialogVisible" 
					:append-to-body="true" 
					center
					width="60%"
					size="tiny">
					<div class="img-box" @mousewheel.prevent="rollImg">
						<img 
							height="100%" 
							:src="dialogImageUrl" 
							alt="" 
							:style="{transform:'scale(' + imgDetails.scaleNum+')'}">
					</div>
				</el-dialog>	
			</div>
    </template>

		<template v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
				<div 
					class="img-wrap" 
					@mouseenter.stop.prevent="enter()">
					<div class="img-box" v-if="field.value&&field.value.length>0">
						<div class="pic-list"
							:style="{width:field.imgw + 'px', height: field.imgh + 'px'}" 
							@mouseover.stop.prevent="changeActive(index)" v-for="(item, index) in field.value" 
							:key="index"
							@mouseout.stop.prevent="removeActive"
						>
							<div class="pic">
								<img :src="item.base64?item.base64:getBase64Image(field.origiUrl, item.url, field.picUrl, item.path, index)" />
								<!-- <img :src="item.url ? field.origiUrl + item.url + field.accessToken : field.picUrl + item.path" /> -->
								<!-- <img :src="item.url ? field.origiUrl + item.url + field.accessToken : field.picUrl + item.path" /> -->
							</div>
							<transition name="fade">
								<div v-if="isShow && isActive==index" class="mask">
									<span @click.stop="handlePictureCardPreview(index)">
										<i class="el-icon-zoom-in"></i>
									</span>
								</div>
							</transition>
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
					<el-dialog :visible.sync="dialogVisible" size="tiny">
						<img width="100%" height="100%" :src="dialogImageUrl" alt="">
					</el-dialog>	
				</div>
        <!-- <el-upload
					disabled
					class="hide"
					multiple
					action=""
          ref="upload"
          name="files"
					:limit="parseInt(field.limitNumber)"
					:http-request='uploadImg'
					list-type="picture-card"
					:file-list="field.value?field.value:[]"
					:on-preview="handlePictureCardPreview"
					:on-remove="handleRemove"
					:on-exceed="handleExceed"
					:on-success="uploadSuccess"
					:before-upload="beforeAvatarUpload"
					:auto-upload="true"
					accept="image/*"
				>
					<i class="el-icon-plus"></i>
				</el-upload>
				<el-dialog :visible.sync="dialogVisible" size="tiny">
					<img width="100%" height="100%" :src="dialogImageUrl" alt="">
				</el-dialog> -->
      </template>

			<template v-else>
					<div 
					class="img-wrap" 
					@mouseenter="enter()">
					<div class="img-box">
						<div class="pic-list"
							:style="{width:field.imgw + 'px', height: field.imgh + 'px'}" 
							@mouseover="changeActive(index)" v-for="(item, index) in field.value" 
							:key="index"
							@mouseout="removeActive"
						>
							<div class="pic">
								<img 
									:style="{width:field.imgw + 'px', height: field.imgh + 'px'}"  
									:src="item.base64?item.base64:getBase64Image(field.origiUrl, item.url, field.picUrl, item.path)" />
							</div>
							<transition name="fade">
								<div v-if="isShow && isActive==index" class="mask">
									<span @click="handlePictureCardPreview(index)">
										<i class="el-icon-zoom-in"></i>
									</span>
								</div>
							</transition>
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
						<el-upload
							disabled
							multiple
							action=""
							ref="upload"
							name="files"
							:limit="parseInt(field.limitNumber)"
							:http-request='uploadImg'
							list-type="picture-card"
							:on-preview="handlePictureCardPreview"
							:on-remove="handleRemove"
							:on-exceed="handleExceed"
							:on-success="uploadSuccess"
							:before-upload="beforeAvatarUpload"
							:auto-upload="true"
							accept="image/*"
						>
							<i class="el-icon-plus"></i>
						</el-upload>
					</div>
					<el-dialog :visible.sync="dialogVisible" size="tiny">
						<img width="100%" height="100%" :src="dialogImageUrl" alt="">
					</el-dialog>	
				</div>
				<!-- <el-dialog :visible.sync="dialogVisible" size="tiny">
					<img width="100%" height="100%" :src="dialogImageUrl" alt="">
				</el-dialog> -->
			</template>
    </template>

		<div 
      class="picture-preview-wrap" 
      v-if="hiddenDialog" 
      @click="hiddenDialog = false">
      <div class="picture-list">
        <el-carousel 
          :autoplay="false" 
          :initial-index="initialIndex"
          arrow="always"
        >
          <el-carousel-item 
            v-for="item in field.pathLists" 
            :key="item"
          >
            <!-- <img :src="item" style="max-width:100%;height:100px;" @click.stop> -->
						<div class="img-box">
							<img class="img" :src="item">
						</div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="icon-dlose" @click="hiddenDialog = false">
        <i class="el-icon-close"></i>
      </div>
    </div>
  </span>
</template>

<script>
import Constant from "@/Constant.js"
import API from "@/api.js"
import form_operation from "@/components/form_operation_log"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
	name: 'o-image-upload',
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
			if(formData.value && typeof formData.value == 'string') {
        formData.value = JSON.parse(decodeURI(formData.value));
      }if(formData.value && formData.value instanceof Array) {
        if(formData.value.length == 0) {
          formData.value = "";
        }else {
          formData.value = formData.value;
        }
        formData.value = formData.value;
      }else {
        formData.value = '';
			}
			if(formData.value && formData.value.length > 0) {
				formData.pathLists = []
				formData.value.forEach(el => {
					formData.pathLists.push(el.url)
				});
			}

			formData.origiUrl = window.location.origin;
      formData.picUrl = obpmConfig.obpmFilePath;
			let accessToken = "?accessToken=" + localStorage.getItem("accessToken");
			formData.accessToken = accessToken
			return formData
		}
	},
	mounted() {
		this.$nextTick(() => { //使用nextTick为了保证dom元素都已经渲染完毕 
			let field = this.field;
			if(field.textType == "hidden" || field.displayType == Constant.PermissionType_HIDDEN){
				if(field.isHideType) {
					let id = this.id,
						formShowType = field.formShowType;
					controlHidden({id, field, formShowType})
				}
			}
			if(field.imgh) {
				let dom = document.getElementById(field.id).getElementsByClassName("el-upload")
				if(dom[0]) {
					dom[0].style.width = parseInt(field.imgw) +"px";
					dom[0].style.height =  parseInt(field.imgh)+"px";
					dom[0].style.lineHeight = parseInt(field.imgh) +"px";
				}
				// document.getElementById(field.id).getElementsByClassName("el-upload")[0].style.width = parseInt(field.imgw) +"px";
				// document.getElementById(field.id).getElementsByClassName("el-upload")[0].style.height =  parseInt(field.imgh)+"px";
				// document.getElementById(field.id).getElementsByClassName("el-upload")[0].style.lineHeight = parseInt(field.imgh) +"px";
				// document.getElementById(this.field.id).getElementsByClassName("el-upload-list__item")[0].style.width  = parseInt(this.field.imgw) +"px";
				// document.getElementById(this.field.id).getElementsByClassName("el-upload-list__item")[0].style.height  = parseInt(this.field.imgh) +"px";
			}
		});
	},

	data: function() {
		return {
			Constant,
			dialogImageUrl: '',
			dialogVisible: false,
			imageType:'',
			fileArray:[],
			uploadArray:[],
			isActive:-1,
			isShow: false,
			showLogsDialog: false,
      showLogsIcon:true,
			operationData:'',
			allfileArray:[],
			imgDetails: {
				scaleNum:1,
      	zoom:'',
			},
			initialIndex: 1,
			hiddenDialog: false,
		};
	},
	
	methods: {
		getBase64Image(origiUrl, url, picUrl, path, index) {
			let field = this.field
			let imgUrl
			if(url) {
				imgUrl = origiUrl + url
			}else {
				imgUrl = origiUrl + picUrl + path
			}
			let image = new Image();  
			image.src = imgUrl; 
			let base64;
			let that = this
			image.onload=function(){
				base64 = that.transformBase64Image(image)
				field.value[index].base64 = base64
				that.$forceUpdate()
			}
			return imgUrl				
		},

		transformBase64Image(img) {
			let field = this.field
			let canvas = document.createElement("canvas");  
			canvas.width = field.imgw;  
			canvas.height = field.imgh;  
			let ctx = canvas.getContext("2d");  
			ctx.drawImage(img, 0, 0, field.imgw, field.imgh);  
			let ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();  
			let dataURL = canvas.toDataURL("image/"+ext); 
			return dataURL;  
		},

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

		changeActive(index) {
			this.isActive = index;
			this.isShow = true;
		},

		removeActive() {
			this.isActive = -1;
		},

		uploadSuccess(response, file, fileList) {
			console.log(file);
			console.log(fileList);
			let obj = {
					name: response.data[0].fileName,
					path: response.data[0].filePath,
					url: obpmConfig.obpmFilePath + "/" + response.data[0].filePath,
				};
			this.field.value.push(obj);
		},

		uploadImg(e){
			let fileArray = e.file;
			let file = fileArray;
			let that = this;
			let form = new FormData();
			form.append("files", file);
			//form.append("***");//根据上传入参添加参数
			//let result = await this.post("/file/upload-file", form);
			let files = form;
			let actionType = this.imageType;
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
						that.picUrl = obpmConfig.obpmFilePath + "/";
						let obj = {
							name: response.data.data[0].fileName,
							path: response.data.data[0].filePath,
							url: obpmConfig.obpmFilePath + "/" + response.data.data[0].filePath,
						};
						that.fileArray.push(obj);
						// that.field.value = that.fileArray;
						if(that.field.value && that.field.value instanceof Array) {
							that.field.value = that.fileArray.concat(that.field.value);
						}else {
							that.field.value = that.fileArray;
						}
						that.fileArray = [];
						if (that.field.refreshOnChanged){
							that.$parent.refresh(that.id);
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
				},
				e.file.uid,
			)
		},

		opendialog(item,index) {
			this.$confirm(this.$t('msg.forever_del'), this.$t('msg.tip'), {
				confirmButtonText: this.$t('btns.sure'),
				cancelButtonText: this.$t('btns.cancel'),
				type: 'warning'
			}).then(() => {
				this.$message({
					type: 'success',
					message:this.$t('msg.del_ss')
				});
				this.handleRemove(item,index);
			}).catch(() => {
				this.$message({
					type: 'info',
					message: this.$t('msg.cancel_del')
				});          
			});
		},
		
		handleRemove(file, fileList) {
			console.log("file--->",file);
			console.log(fileList);
			let appId = this.$root.appid;
      let formId = this.field.formId;
      let docId = this.field.docId;
      let path = file.path;
      API.deleteUpload(appId, formId, docId, path, {
        onSucess: (res) => {
					if(res.data.errcode == 0) {
						let arr = this.field.value;
						for(let i=0; i<arr.length; i++) {
							if(file.path == arr[i].path) {
								arr.splice(i, 1);
							}
						}
						console.log("this.field.value--->",this.field.value);
					}
          if (this.field.refreshOnChanged){
            // this.$parent.refresh(this.field.id);
						let havePar = false;
						let par  = '';
						while(!havePar) {
							par = par + '.$parent';
							let url = 'this' + par + '.refresh';
							if(eval(url)) {
								let path = url + '(' + "'"+ this.id +"'" + ')';
								eval(path);
								break
							}
						}
          }
        }
      });
		},

		handlePictureCardPreview(index) {
			this.initialIndex = index
			this.hiddenDialog = true
      // let picUrl = obpmConfig.obpmFilePath;
			// this.dialogImageUrl = picUrl + file.path;
			// this.dialogVisible = true;
		},

		handleExceed(files, fileList) {
			this.$message.warning(this.$t('view.out'));
		},

		beforeAvatarUpload(file) {
			this.imageType = file.type
			const isJPG = file.type === 'image/jpeg' || 'image/png' || 'image/gif' || 'image/jpg' || 'image/JPG'|| 'image/JPEG'|| 'image/GIF'|| 'image/PNG'
			let temp = file.name.split(".")
			let name = temp[temp.length -1]
			let arr = ['','jpeg','png','gif','jpg', 'JPG', 'JPEG', 'PNG', 'GIF']
			let isSuffix = arr.indexOf(name) > 0
			const isLt2M = file.size / 1024 < this.field.maxsize
			if (!isJPG || !isSuffix) {
				this.$message.error(this.$t('view.pic_err'))
				return false
			}
			if (!isLt2M) {
				this.$message.error(this.$t('view.data_out'))
				return false
			}
			if(isJPG){
				const reader = new FileReader()
				// readAsDataURL：读取为base64格式
				reader.readAsDataURL(file)
				// onload 在文件读取成功时触发
				reader.onload = () => {
					const ImgBase64 = reader.result
					let ob = {}
					ob.uid = file.uid
					ob.name = file.name
					ob.marks = 0
					ob.marksValue = '0%'
					ob.path = ImgBase64
					this.allfileArray.push(ob)
				};
			}
			return isJPG && isLt2M && isSuffix
		},
	},
}
</script>

<style lang="scss" scoped>
	
	
</style>
