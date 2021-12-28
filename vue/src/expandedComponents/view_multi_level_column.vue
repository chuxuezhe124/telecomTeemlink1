<template>
  <div>
    <el-table-column 
      :prop="column.id"
      :label="column.id"
      align="center"
    >
      <template slot-scope="scope">
        <div style="margin-left: 10px" v-if="!column.children">
          <!-- {{scope.row[column.columns.id]}} -->
          <span v-if="column.columns.formatType=='number'">
            <span v-if="column.columns.type=='COLUMN_TYPE_FIELD'">
              <span
                v-if="column.columns.displayType == '00' && scope.row[column.columns.id]"
              >{{toFixed(scope.row[column.columns.id],column.columns.decimalsNum)}}</span>
              <span
                v-else-if="column.columns.displayType == '01' && scope.row[column.columns.id]"
              >{{toFixed(scope.row[column.columns.id],column.columns.decimalsNum).substr(0,column.columns.displayLength)}}</span>
            </span>
            <span
              v-else-if="column.columns.type=='COLUMN_TYPE_SCRIPT'"
              v-html="toFixed(scope.row[column.columns.id],column.columns.decimalsNum)"
            ></span>
          </span>
          <span v-else-if="column.columns.formatType=='currency'">
            <span v-if="column.columns.type=='COLUMN_TYPE_FIELD'">
              <span v-if="column.columns.displayType == '00' && scope.row[column.columns.id]">
                <!--小计或总计-->
                {{scope.row.isSum?scope.row[column.columns.id]:currencyChange(scope.row[column.columns.id], column.columns.decimalsCurr,column.columns.currType)}}
              </span>
              <span
                v-else-if="column.columns.displayType == '01' && scope.row[column.columns.id]"
              >{{currencyChange(scope.row[column.columns.id], column.columns.decimalsCurr, column.columns.currType).substr(0,column.columns.displayLength)}}</span>
            </span>
            <span
              v-else-if="column.columns.type=='COLUMN_TYPE_SCRIPT'"
              v-html="currencyChange(scope.row[column.columns.id], column.columns.decimalsCurr,column.columns.currType)"
            ></span>
          </span>
          <span v-else-if="column.columns.formatType=='simple'">
            <span v-if="column.columns.type=='COLUMN_TYPE_FIELD'">
              <span v-if="column.columns.displayType == '00' && scope.row[column.columns.id]">
                <!--判断是否显示图标-->
                <span v-if="column.columns.showIcon">
                  <span
                    v-if="column.columns.iconMapping && getIconMapping(column.columns.iconMapping,scope.row[column.columns.id]) == scope.row[column.columns.id]"
                  >
                    <img
                      width="32"
                      height="32"
                      :src="setDefaultIcon(column.columns.iconMapping,'',scope.row[column.columns.id])"
                    />
                  </span>
                  <span v-else :style="{color:column.columns.fontColor?column.columns.fontColor:'',fontSize:column.columns.fontSize?column.columns.fontSize:'',}">{{scope.row[column.columns.id]}}</span>
                </span>
                <span v-else>
                  <!--视图-流程回退标识-->
                  <span v-if="scope.row.isRunningBack">
                    <span v-if="column.columns.flowReturnCss">
                      <img src="../assets/images/backstatelabel01.gif" />
                      <span v-if="column.columns.columnField != 'ImageUploadField' && column.columns.columnField != 'AttachmentUploadField'" :style="{color:column.columns.fontColor?column.columns.fontColor:'',fontSize:column.columnsfontSize?column.columns.fontSize:'',}">
                        {{scope.row[column.columns.id]}}
                      </span>
                    </span>
                    <span v-else>
                      <span v-if="column.columns.columnField != 'ImageUploadField' && column.columns.columnField != 'AttachmentUploadField'" :style="{color:column.columns.fontColor?column.columns.fontColor:'',fontSize:column.columns.fontSize?column.columns.fontSize:'',}">
                        {{scope.row[column.columns.id]}}
                      </span>
                    </span>
                  </span>
                  <span>
                    <span v-if="column.columns.columnField == 'ImageUploadField'">
                      <span v-if="scope.row[column.columns.id]">
                        <span
                          v-for="(el, i) in JSON.parse(scope.row[column.columns.id])"
                          :key="i"
                        >
                          <img
                            :title="el.name"
                            style="max-width:50px; max-height:50px;"
                            :src="viewFieldPath(el,column.columns.columnField)"
                            @click.stop="picturePreview(scope.row[column.columns.id],i)"
                          />
                        </span>
                      </span>
                    </span>
                    <span 
                      class="file-list" 
                      v-else-if="column.columns.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.columns.id],column.columns.columnField).length > 0">
                      <div 
                        class="magnifyImg" 
                        :style="{'display':isShowImg?'block':'none'}" 
                        @click.stop.prevent="hiddenImg" 
                        v-html="addHtml">
                      </div>
                      <div 
                        class="list" 
                        v-for="(el, fi) in viewFieldPath(scope.row[column.columns.id],column.columns.columnField)"  
                        :key='fi'>
                        <div 
                          :title="el.name"
                          class="left" 
                          @click.stop.prevent="handleFileClick(el)">
                          {{el.name}}
                        </div>
                        <div class="right">
                          <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                          <i class="el-icon-view icon-left" @click.stop.prevent="handlePreview(el)"></i>
                          <i class="el-icon-folder-opened" @click.stop.prevent="previewFile(el)"></i>
                        </div>
                      </div>
                    </span>
                    <span 
                      v-if="!scope.row.isRunningBack && 
                        !scope.row.isSum && 
                        column.columns.columnField != 'ImageUploadField' && 
                        column.columns.columnField != 'AttachmentUploadField'" 
                        :style="{fontSize:column.columns.fontSize?column.columns.fontSize:'',}">
                        {{scope.row[column.columns.id]}}
                    </span>
                    <span 
                      v-if="!scope.row.isRunningBack && 
                        scope.row.isSum && 
                        column.columns.columnField != 'ImageUploadField' && 
                        column.columns.columnField != 'AttachmentUploadField'" 
                      :style="{fontSize:column.columns.fontSize?column.columns.fontSize:'','white-space':'normal'}">
                      {{scope.row[column.columns.id]}}
                    </span>
                  </span>
                </span>
              </span>
              <span
                style="cursor:pointer"
                :title="scope.row[column.columns.showTitle?column.columns.id:'']"
                v-else-if="column.columns.displayType == '01' && scope.row[column.columns.id]"
              >
                {{scope.row[column.columns.id].substr(0,column.columns.displayLength)}}
                {{scope.row[column.columns.id].length>column.columns.displayLength?'...':''}}
              </span>
              <span v-else>
                <span v-if="column.columns.columnField == 'QRCodeField'">
                  <span :id="scope.row['docId']" ref="qrcode"></span>
                </span>
              </span>
            </span>
            <span v-else-if="column.columns.type=='COLUMN_TYPE_LOGO'">
              <span v-if="column.columns.iconMapping">
                {{column.columns.iconMapping}}
                <img
                  v-for="(item,index) in column.columns.iconMapping"
                  :key="index"
                  width="32"
                  height="32"
                  :src="setDefaultIcon(item.value, true)"
                />
              </span>
              <span v-else-if="column.columns.icon">
                <img 
                  width="32" 
                  height="32" 
                  :src="setDefaultIcon(column.columns.icon, true)" />
              </span>
            </span>
            <span v-else-if="column.columns.type=='COLUMN_TYPE_OPERATE'">
              <button
                @click.stop.prevent="buttonClick(column.columns, scope.row)"
              >{{column.columns.buttonName}}</button>
            </span>
            <span v-else-if="column.columns.type=='COLUMN_TYPE_SCRIPT'" @click.stop>
              <!-- v-html="scope.row[column.id]" -->
              <component :is="template(scope.row[column.columns.id])" v-if="scope.row[column.columns.id]"></component>
            </span>
            <span v-else-if="column.columns.type=='COLUMN_TYPE_ROWNUM'">{{scope.$index+1}}</span>
          </span>
          <span v-else>
            <span v-if="column.columns.type=='COLUMN_TYPE_FIELD'">
              <span
                style="cursor:pointer"                
                v-if="column.columns.displayType == '00' && scope.row[column.columns.id]">
                <span>
                  <span v-if="column.columns.columnField == 'ImageUploadField'">
                    <span v-if="scope.row[column.columns.id]">
                      <span v-for="(el, i) in JSON.parse(scope.row[column.columns.id])" :key="i">
                        <img
                          :title="el.name"
                          style="max-width:50px; max-height:50px;"
                          :src="viewFieldPath(el,column.columns.columnField)"
                        />
                      </span>
                    </span>
                  </span>
                  <span 
                    class="file-list" 
                    v-else-if="column.columns.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.columns.id],column.columns.columnField).length > 0">
                    <div 
                      class="magnifyImg" 
                      :style="{'display':isShowImg?'block':'none'}" 
                      @click.stop.prevent="hiddenImg" 
                      v-html="addHtml"></div>
                    <div 
                      class="list" 
                      v-for="(el, fi) in viewFieldPath(scope.row[column.columns.id],column.columns.columnField)"  
                      :key='fi'>
                      <div 
                        :title="el.name"
                        class="left" 
                        @click.stop.prevent="handleFileClick(el)">
                        {{el.name}}
                      </div>
                      <div class="right">
                        <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                        <i class="el-icon-view icon-left" @click.stop.prevent="handlePreview(el)"></i>
                        <i class="el-icon-folder-opened" @click.stop.prevent="previewFile(el)"></i>
                      </div>
                    </div>
                  </span>
                  <span v-else-if="column.columns.columnField == 'OnLineTakePhotoField'">
                    <span 
                      style="max-width:50px; max-height:50px;" 
                      v-for="(el, i) in viewPhotoPath(scope.row[column.columns.id],column.columns.columnField)" 
                      :key="i">
                      <img
                        style="max-width:40px; max-height:40px;"
                        :src="el"
                        @click.stop.prevent="picturePreview(scope.row[column.columns.id], 0, column.columns.columnField)"
                      />
                    </span>
                  </span>
                  <span v-else>{{scope.row[column.columns.id]}}</span>
                </span>
              </span>
              <span
                style="cursor:pointer"
                :title="scope.row[column.columns.showTitle?column.columns.id:'']"
                v-else-if="column.columns.displayType == '01' && scope.row[column.columns.id]"
              >
                {{scope.row[column.columns.id].substr(0,column.columns.displayLength)}}
                {{scope.row[column.columns.id].length>column.columns.displayLength?'...':''}}
              </span>
            </span>
            <span
              v-else-if="column.columns.type=='COLUMN_TYPE_SCRIPT'"
              v-html="scope.row[column.columns.id]"
            ></span>
          </span>
        </div>
      </template>
      <template v-if="column.children">
        <view-multi-column
          v-for="(item, index) in column.children"
          :key="index"
          :column="item">
        </view-multi-column>
      </template>
    </el-table-column>
  </div>
</template>

<script>
export default {
  name: 'viewMultiColumn',
  props: {
    column: {
      type: Object
    }
  },
  methods: {
    /**
     * 后台配置视图列按图标显示
     */
    getIconMapping(val,keyVal) {
      let valObj = JSON.parse(val)
      for(let i = 0; i < valObj.length; i++) {
        if(valObj[i].key == keyVal) {
          return valObj[i].key
        }
      }
    },
    picturePreview(list, i, type) { //图片预览
      if(type) {
        if(list.charAt(0) == '[') {
          list = list.replace(/&quot;/g,"\"");
          let onlinePhotoPath = eval('(' + list + ')');
          let pl = onlinePhotoPath;
          for (let i = 0; i < pl.length; i++) {
            pl[i] = obpmConfig.obpmFilePath + pl[i];
          }
          let params = {
            hiddenDialog: true,
            pathLists: pl,
            initialIndex: i,
          };
          this.$parent.setDialogStatus(params);
        }
      }else {
        let pList = JSON.parse(list);
        let pathLists = [];
        pList.forEach(el => {
          let path = obpmConfig.obpmFilePath + el.path;
          pathLists.push(path);
        });
        let params = {
          hiddenDialog: true,
          pathLists,
          initialIndex: i,
        };
        console.log("params--2->",params)
        this.$parent.setDialogStatus(params);
      }
    },
    /**
    点击文件直接预览
    */
    handleFileClick(flie){
      let flieType = flie.name.substring(flie.name.lastIndexOf(".")).toLowerCase();
      const imgType = this.isImgType(flieType);
      if(imgType){
        this.isShowImg = true;
        this.addHtml = '<img src=' + obpmConfig.obpmFilePath + flie.path+'>';
      }else{
        this.handlePreview(flie)
      }
    },
    viewFieldPath(value, field) {
      if (value && field == "ImageUploadField") {
        // // let arr = JSON.parse(value);
        // let name = value.path.name;
        // // if(arr && arr.length > 0) {
        // //   for(let i=0; i<arr.length; i++) {
        // //     name += arr[i].path + ';';
        // //   }
        // // }
        // name = name.replace(/^(\s|;)+|(\s|;)+$/g, "");
        return obpmConfig.obpmFilePath + value.path;
      } else if (value && field == "AttachmentUploadField") {
        // let arr = JSON.parse(value);
        // let name = "";
        // if (arr && arr.length > 0) {
        //   for (let i = 0; i < arr.length; i++) {
        //     name += arr[i].name + ";";
        //   }
        // }
        // name = name.replace(/^(\s|;)+|(\s|;)+$/g, "");
        // return name;
        let arr = JSON.parse(value);
        return arr;
      }
    },

    //列表视图在线拍照控件显示的图片
    viewPhotoPath(value,field) {
      if(value && field == "OnLineTakePhotoField") {
        if(value.charAt(0) == '[') {
          value = value.replace(/&quot;/g,"\"")
          let onlinePhotoPath = eval('(' + value+ ')');
          let list = onlinePhotoPath;
          for (let i = 0; i < list.length; i++) {
            list[i] = obpmConfig.obpmFilePath + list[i];
          }
          return list
      }
      else {
        //默认保存的value是字符串"/resource/image/photo.png"
          let statiContextPath = obpmConfig.statiContextPath;
          if(statiContextPath) {
            value = statiContextPath + value
          }else {
            value = obpmConfig.obpmFilePath + value
          }
          let defaultArr = []
          defaultArr.push(value)
          return defaultArr
      }
      }
    },

    downloadFile(file){ //列表文件下载
      // let link = document.createElement('a')
      // link.style.display = 'none'
      // link.href = this.obpmConfig.obpmFilePath + 
      // "/runtime/file/download?filename="+ file.name +
      // "&filepath=" + file.path;
      // link.setAttribute('download', file.name);
      // link.click();
        let link = document.createElement('a')
        link.style.display = 'none'

        let op = obpmConfig.obpmFilePath;
        let statiContextPath = obpmConfig.statiContextPath;
        if(statiContextPath) { //5.0 trunk
          op = obpmConfig.contextPath;
        }
        link.href = op + "/runtime/file/download?filename=" + file.name + "&filepath=" + file.path;
        link.setAttribute('download', file.name);
        link.click();
    },

    handlePreview(file) {
      this.$api.getenvironment(
        {
          onSucess: res => {
            if(res.data.errcode === 0) {
              if(res.data.data === true) {
                let realName = file.path.split("/")[file.path.split("/").length - 1];
                let isEdit = 'edit';
                let waterMark = '';
                let openWaterMark = false;
                let curEditUserId = this.$store.state.myProfile.id;
                let userName = this.$store.state.myProfile.name;
                let showTrackRevisions = false;
                let selectEditPlug = 'tray';
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

    },
    //视图列设置默认图标显示
    setDefaultIcon(value, isLogo,rowVal){
      let statiContextPath = obpmConfig.statiContextPath;
      let path = '';
      if(isLogo) {
        path = this.setDefaultPath() + '/uploads/lib/icon/' + value;
      }else {
        let valueObject = JSON.parse(value)//字符串转对象
        if(valueObject) {
          for(let i = 0; i < valueObject.length; i ++) {
            if(valueObject[i].key == rowVal) {
              if(statiContextPath) {//5.0
                path = this.setDefaultPath() + valueObject[i].value;
              }else {
                path = this.setDefaultPath() + '/uploads/lib/icon' +valueObject[i].value;
              }
            }
          }
        }
      }
      return path;
    },
    /*number  需要保留小数的数
      fractionDigits 保留小数位数
    */
    toFixed(number, fractionDigits) {
      let times = Math.pow(10, fractionDigits);
      let roundNum = Math.round(number * times) / times;
      let currentVal = roundNum.toFixed(fractionDigits);
      if (fractionDigits == "5") {
        let num = (roundNum || 0).toString();
        let result = "";
        while (num.length > 3) {
          result = "," + num.slice(-3) + result;
          num = num.slice(0, num.length - 3);
        }
        if (result) {
          result = num + result + "." + currentVal.split(".")[1];
          return result;
        } else {
          return currentVal;
        }
      } else {
        return currentVal;
      }
    },
    /* number：要格式化的数字
    * decimals：保留几位小数 默认0位
    * currency：货币类型
    * decPoint：小数点符号 默认.
    * thousandsSep：千分位符号 默认为,
    */
    currencyChange(
      number,
      decimals,
      currency,
      decPoint = ".",
      thousandsSep = ","
    ) {
      number = (number + "").replace(/[^0-9+-Ee.]/g, "");
      let n = !isFinite(+number) ? 0 : +number;
      let prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
      let sep = typeof thousandsSep === "undefined" ? "," : thousandsSep;
      let dec = typeof decPoint === "undefined" ? "." : decPoint;
      let s = "";
      let symbol;
      if (currency == "zh_CN") {
        symbol = "￥";
      } else if (currency == "en_US") {
        symbol = "$";
      } else if (currency == "en_GB") {
        symbol = "£";
      } else if (currency == "ja_JP") {
        symbol = "￥";
      } else {
        symbol = "";
      }
      let toFixedFix = function (n, prec) {
        let k = Math.pow(10, prec);
        return "" + Math.ceil(n * k) / k;
      };
      s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
      let re = /(-?\d+)(\d{3})/;
      while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
      }
      if ((s[1] || "").length < prec) {
        s[1] = s[1] || "";
        s[1] += new Array(prec - s[1].length + 1).join("0");
      }
      return symbol + s.join(dec);
    },

    //o-action跳转
    calctextJump(openType, params, jumpType) {
      if(params.title) {
        params.name = params.title
      }else {
        params.name = this.view.name
      }
      if(jumpType === 'opendocument') {
        if (openType == "open-eject" || openType == "dialog") {
          let type = "FORM";
          this.$parent.openDialogJump(params,type)
        }else if (openType == "open-present") {
          this.$emit("openNewpage",params)
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            // name: "form_blank",
            name: 'open',
            query: params,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          // this.$emit("add-tab", params);
          this.addTab(params)
        }
      }else if(jumpType === 'openview') {
        if (openType == "open-eject" || openType == "dialog") {
          let type = "VIEW";
          this.$parent.openDialogJump(params,type);
        }else if (openType == "open-present") {
          this.$emit("openNewpage",params)
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            name: "view_blank",
            query: params,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          this.addTab(params)
          // this.$emit("add-tab", params);
        }
      }else if(jumpType === 'jumpto'){
        if (openType == "open-eject" || openType == "dialog") {
          let type = "JUMP";
          this.$parent.openDialogJump(params,type);
        }else if (openType == "open-present") {
          this.$emit("openNewpage",params)
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
            name: "view_blank",
            query: params,
          });
          window.open(routeData.href, "_blank");
        }else {//默认用tab方式打开
          // this.$emit("add-tab", params);
          this.addTab(params)
        }
      }
    },
    
    regReplace(value){
      if(value){
        return value.replace(/&#37;/g, "%")
      }
    },

    /*
    * 脚本，o-action
    */
    template(val) {
      return {
        methods: {
          calctextJump: this.calctextJump,
        },
        template: "<div>"+val+"</div>"
      };
    },
  }
}
</script>
