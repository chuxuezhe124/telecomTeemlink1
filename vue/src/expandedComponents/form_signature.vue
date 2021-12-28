<template>
  <div class="custom-signature-wrap">
    <span class="icon-close-wrap" @click="closepopup(false)">
      <i class="el-icon-close "></i>
    </span>
    <div class="content">
      <div>
        <el-button 
          size="medium" 
          type="primary"
          @click="showdialog"
        >印章管理</el-button>
      </div>
      <div>
        <el-select v-model="signId" placeholder="请选择一个印章">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div>
        <el-button size="medium" type="success" @click="clickStamp">盖章</el-button>
      </div>
    </div>
    <div class="content content-pass" v-if="showPassword">
      <div>
        请输入密码:
      </div>
      <div>
        <el-input
          size="medium"
          type="password"
          v-model="password">
        </el-input>
      </div>
      <div>
        <el-button class="el-btn" size="medium" type="success" @click="onOk">确定</el-button>
      </div>
    </div>
    <comm-dialog
      title="印章管理"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :appendToBody="true"
      class="custom-signature-dialog"
    >
      <div slot="body" class="signature-box">
        <div class="btn-box">
          <el-button size="small" type="primary" @click="doCreate">新建</el-button>
          <el-button size="small" type="danger" @click="doRemove">删除</el-button>
        </div>
        <div 
          class="list-con" 
          v-if="signatureList && signatureList.length > 0"
          >
          <el-table 
            :data="signatureList" 
            border
            :header-cell-style="{background:'#EBEFF0',color:'#666666',textAlign:'center',}" 
            :cell-style="{textAlign:'center'}"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            >
            <el-table-column
              style="view-checkedAll"
              type="selection"
              v-model="selectId"
              width="55"
            ></el-table-column>
            <el-table-column prop label="印章" width="180" align="center">
              <!-- /obpm/uploads/signs/1f051b34-5127-4eca-a0c3-d0b0f445aa8b.png -->
              <template slot-scope="scope">
                <img
                  :src="'/obpm/uploads/signs/' + scope.row.img"
                  style="height:32px;"
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" align="center"></el-table-column>
            <el-table-column prop="date" label="创建日期" align="center"></el-table-column>
            <el-table-column prop="desc" label="备注" align="center">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </comm-dialog>
    <comm-dialog
      title="新建印章"
      v-if="popupVisible"
      :visible.sync="popupVisible"
      width="33%"
      :appendToBody="true"
      class="custom-signature-create-dialog"
    >
      <div slot="body" class="create-box">
        <div class="common">
          <i>*</i>印章名称:
          <div class="input">
            <el-input 
              size="small"
              v-model="createSignatureData.name" >
            </el-input>
          </div>
        </div>
        <div class="common">
          <i>*</i>印章密码:
          <div class="input">
            <el-input
              type="password" 
              size="small"
              v-model="createSignatureData.password" >
            </el-input>
          </div>
        </div>
        <div class="common upload-img-box">
          <i>*</i>上传印章:
          <div class="img" v-if="createSignatureData.src">
            <img width="80px" :src="createSignatureData.src" />
          </div>
          <div class="btn-box" v-else>
            <!-- <el-button type="primary" size="mini">选择图片</el-button> -->
            <el-upload
              class="upload-demo"
              multiple
              action=""
              name="files"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
              :http-request='uploadFile'
              :show-file-list="false"
              >
              <span>
                <!-- <i class="fa fa-plus-square-o func-attachement-icon add-icon"></i> -->
                <el-button type="primary" size="mini">选择图片</el-button>
              </span>
            </el-upload>
          </div>
        </div>
        <div class="common">
          &emsp;&emsp;&nbsp;&nbsp;&nbsp;描述:
          <div class="input">
            <el-input
              resize="none"
              type="textarea"
              :rows="3"
              v-model="createSignatureData.describe">
            </el-input>
          </div>
        </div>
        <div class="common submit-box">
          <span>
            <el-button type="success" @click="saveSign">保 存</el-button>
          </span>
        </div>
      </div>
    </comm-dialog>
  </div>
</template>
<script>
  
export default {
  //inject: ["reload"],
  name: "form-signature",
  props: [
    "openParams",
    "options",
    "visible"
  ],

  mounted(){

  },

  data: function() {
    return {
      signId: '',
      dialogVisible: false,
      popupVisible: false,
      signatureList: [],
      selectId: [],
      createSignatureData: {
        name:'',
        password:'',
        src:'',
        img:'',
        describe:''
      },
      fileList: [],
      password:'',
      showPassword: false,
      positionX:0,
      positionY:0,
    }
  },

  methods: {
    onOk(){
      let password = this.password
      let signId = this.signId
      if(password) {
        this.$api.signConfirmPassword(
          signId,
          password,
          {
            onSucess: res => {
              if(res.data.errcode == '40001') {
                this.$message({
                  showClose: true,
                  message: res.data.errmsg,
                  type: 'warning'
                });
              }else {
                let currentSign = res.data.data;
                this.$emit("event", currentSign)
              }
            }
          }
        )
      }else {
        this.$message({
          showClose: true,
          message: '密码不能为空',
          type: 'warning'
        });
      }
    },
    clickStamp(){
      let value = this.signId
      if(value) {
        this.showPassword = true;
      }else {
        this.$message({
          showClose: true,
          message: '签章前请先选中一个印章！',
          type: 'warning'
        });
      }
    },

    getYMD() {
      let date = new Date()
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date .getDate()
      return y + "-" + m + "-" + d; 
    },

    saveSign(){
      let date = this.getYMD()
      let data = this.createSignatureData
      let id = data.img.split(".")[0]
      let jsonData = {
        date,
        desc: data.describe,
        id,
        img: data.img,
        name: data.name,
        password: data.password
      }
      this.$api.saveSignature(
        jsonData,
        {
          onSucess: res => {
            if(res.data.errcode == 0) {
              this.popupVisible = false;
              this.showdialog()
            }
          }
        }
      )
    },

    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    //上传文件
    uploadFile(e) {
      let fileArray = e.file;
			let file = fileArray;
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
      let uuid = this.guid();
      this.$api.signatureUploadFile(
        form,
        uuid,
        {
          onSucess: res => {
            this.createSignatureData.src = '/obpm/uploads/signs/' + res.data.path;
            this.createSignatureData.img = res.data.path;
            // 992a29ff-b56d-4978-a80c-337b1a40172e.jpg
            // let obj = {
            //   extName: res.data.extName,
            //   id:res.data.id,
            //   size:res.data.size,
            //   type:res.data.type,
            //   name: res.data.name,
            
            //   url: res.data.url,
            // };
            // this.fileList.push(obj);
          }
        }
      )
    },

    handleRemove(file,fileList) {
      
    },
    handlePreview(file) {
      
    },

    doCreate(){
      this.popupVisible = true;
    },

    doRemove(){
      let idArr = this.selectId
      if(idArr.length <= 0) {
        this.$confirm('请选择至少一个印章删除', '消息', {
          confirmButtonText: '确定',
          type: 'warning'
        })
      }else {
        this.$api.deleteSigns(
          this.selectId,
          {
            onSucess: res => {
              this.$message({
                showClose: true,
                message: res.data.data,
                type: 'success'
              });
              this.showdialog(true);
            }
          }
        )
      }
      
    },

    handleSelectionChange(val) {
      let arr = []
      if(val.length > 0) {
        val.forEach(el => {
          arr.push(el.id);
        });
      }
      this.selectId = arr
    },
    
    showdialog(){
      this.dialogVisible = true;
      this.$api.getSigns(
        {
          onSucess: res => {
            this.signatureList = res.data.data;
          }
        }
      )
    },
    closepopup(val) {
      this.$emit("update:visible", val);
    }
  }
}

</script>
