<template>
  <div class="collapsible-view" style="width:100%;height:calc(100% - 57px - 40px)">
    <el-table
      :height="(showtype == 'include')?'':'100%'"
      style="width: 100%"
      ref="multipleTable"
      v-if="view.columns && view.columns.length>0"
      :header-cell-style="{background:'#F9F9F9',color:'#5A6779'}"
      :data="tableData"
      row-key="docId"
      :load="load"
      lazy
      @row-click="onRowClick"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
    <!-- 没有数据的时候显示 -->
    <template slot="empty">
      <p>{{emptyData}}</p>
    </template>
    <!-- 选中的内容 -->
      <el-table-column 
        type="selection" 
        v-model="checkedAll" 
        width="55"
      >
      </el-table-column>
      <!-- 表头-->
      <template v-for="(column, index) in view.columns">
        <el-table-column
          :key="index"
          :prop="column.id"
          :label="column.name"
          :width="column.width"
        >
          <template slot-scope="scope">
          <!-- {{regReplace(scope.row[column.id])}} -->
            <!--普通视图-->
            <span
              v-if="!scope.row.isInclude"
              :style="{background:column.groundColor, color:column.color,fontSize:column.fontSize+'px'}">
              <!-- 1 -->
              <span v-if="column.formatType=='number'">
                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                  <span
                    v-if="column.displayType == '00' && scope.row[column.id]"
                  >{{toFixed(scope.row[column.id],column.decimalsNum)}}</span>
                  <span
                    v-else-if="column.displayType == '01' && scope.row[column.id]"
                  >{{toFixed(scope.row[column.id],column.decimalsNum).substr(0,column.displayLength)}}</span>
                </span>
                <span
                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                  v-html="toFixed(scope.row[column.id],column.decimalsNum)"
                ></span>
              </span>

              <!-- 2 -->
              <span v-else-if="column.formatType=='currency'">
                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                  <span v-if="column.displayType == '00' && scope.row[column.id]">
                    <!--小计或总计-->
                    {{scope.row.isSum?scope.row[column.id]:currencyChange(scope.row[column.id], column.decimalsCurr,column.currType)}}
                  </span>
                  <span
                    v-else-if="column.displayType == '01' && scope.row[column.id]"
                  >{{currencyChange(scope.row[column.id], column.decimalsCurr,column.currType).substr(0,column.displayLength)}}
                  </span>
                </span>
                <span
                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                  v-html="currencyChange(scope.row[column.id], column.decimalsCurr,column.currType)"
                ></span>
              </span>

              <!-- 3 -->
              <span v-else-if="column.formatType=='simple'">
                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                  <span v-if="column.displayType == '00' && scope.row[column.id]">
                    <!--判断是否显示图标-->
                    <span v-if="column.showIcon">
                      <span
                        v-if="column.iconMapping && column.iconMapping[0].key == scope.row[column.id]"
                      >
                        <img
                          width="32"
                          height="32"
                          src="/obpm/uploads/lib/icon/p02_setup.png"
                        />
                      </span>
                      <span v-else>{{scope.row[column.id]}}</span>
                    </span>
                    <span v-else>
                      <!--视图-流程回退标识-->
                      <span v-if="column.flowReturnCss && scope.row.isRunningBack">
                        <img src="../assets/images/backstatelabel01.gif" />
                      </span>
                      <span>
                        <span v-if="column.columnField == 'ImageUploadField'">
                          <span v-if="scope.row[column.id]">
                            <span
                              v-for="(el, i) in JSON.parse(scope.row[column.id])"
                              :key="i"
                            >
                              <img
                                style="max-width:50px; max-height:50px;"
                                :src="viewFieldPath(el,column.columnField)"
                              />
                            </span>
                          </span>
                        </span>
                        <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.id],column.columnField).length > 0">
                          <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                            <div class="left">{{el.name}}</div>
                            <div class="right">
                              <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                              <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                            </div>
                          </div>
                        </span>
                        <span :title="scope.row[column.showTitle?column.id:'']" v-else>{{scope.row[column.id]}}</span>
                      </span>
                    </span>
                  </span>
                  <span
                    style="cursor:pointer"
                    :title="scope.row[column.showTitle?column.id:'']"
                    v-else-if="column.displayType == '01' && scope.row[column.id]"
                  >
                    {{scope.row[column.id].substr(0,column.displayLength)}}
                    {{scope.row[column.id].length>column.displayLength?'...':''}}
                  </span>
                  <span v-else> &nbsp; </span>
                </span>
                <span v-else-if="column.type=='COLUMN_TYPE_LOGO'">
                  <span v-if="column.iconMapping">
                    <img
                      v-for="(item,index) in column.iconMapping"
                      :key="index"
                      width="32"
                      height="32"
                      :src="'/obpm/uploads/lib/icon' + item.value"
                    />
                  </span>
                  <span v-else-if="column.icon">
                    <img width="32" height="32" :src="'/obpm/uploads/lib/icon/'+column.icon" />
                  </span>
                </span>
                <span v-else-if="column.type=='COLUMN_TYPE_OPERATE'">
                  <button
                    @click.stop.prevent="buttonClick(column.id, column.parentView, column.buttonType, column.name, scope.row.docId, column.actionScript,column.mappingform,column.jumpMapping,scope.row)"
                  >{{column.buttonName}}</button>
                </span>
                <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'" @click.stop>
                  <!-- v-html="scope.row[column.id]" -->
                  <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                </span>
                <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'">{{scope.$index+1}}</span>
              </span>
              <!-- 4 -->
              <span v-else>
                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                  <span
                    style="cursor:pointer"
                    :title="viewFieldPath(scope.row[column.showTitle?column.id:''],column.columnField)"                
                    v-if="column.displayType == '00' && scope.row[column.id]">
                    <!-- {{scope.row[column.id]}} -->
                    <span>
                      <span v-if="column.columnField == 'ImageUploadField'">
                        <span v-if="scope.row[column.id]">
                          <span v-for="(el, i) in JSON.parse(scope.row[column.id])" :key="i">
                            <img
                              style="max-width:50px; max-height:50px;"
                              :src="viewFieldPath(el,column.columnField)"
                            />
                          </span>
                        </span>
                      </span>
                      <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.id],column.columnField).length > 0">
                        <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                          <div class="left">{{el.name}}</div>
                          <div class="right">
                            <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                            <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                          </div>
                        </div>
                      </span>
                      <span v-else>{{scope.row[column.id]}}</span>
                    </span>
                  </span>
                  <span
                    style="cursor:pointer"
                    :title="scope.row[column.showTitle?column.id:'']"
                    v-else-if="column.displayType == '01' && scope.row[column.id]"
                  >
                    <!-- {{scope.row[column.id].substr(0,column.displayLength)}} -->
                    {{scope.row[column.id].substr(0,column.displayLength)}}
                    {{scope.row[column.id].length>column.displayLength?'...':''}}
                  </span>
                </span>
                <span
                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                  v-html="scope.row[column.id]"
                ></span>
              </span>
            </span>

          </template>
        </el-table-column>
      </template>
    </el-table>
    <div style="width:100%;text-align: center;height: 40px;line-height:40px">
      {{$t('total')}}：{{row_count}}
    </div>
  </div>
</template>

<script>
export default {
  name: "view-collapsibleview",
  props: [
    "view",
    "openParams",
    "showtype",
    "toTab"
  ],
  watch: {
    
  },
  computed: {
    
  },

  mounted() {
    this.getData();
  },

  data: function() {
    return {
      checkedAll:[],
      currentPage: 1,
      tableData:[],
      row_count:0,
      loading: true,
      emptyData:'',
    };
  },

  methods: {
    //删除或导入数据后重新请求加载数据
    reloadListView(){
      // this.reloadListViewRandom = new Date().getTime();
      // this.getData(this.currentPage, this.pagesize, this.searchExcelData);
    },
    buttonClick(){

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
    
    downloadFile(file){ //列表文件下载
      let url = file.url;
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = obpmConfig.obpmFilePath + 
      "/runtime/file/download?filename="+ file.name +
      "&filepath=" + file.path;
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
								let url = pdfPath + "/portal/good/html/pdfviewer.html?action=" + isEdit + 
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

    load(tree, treeNode, resolve,event) {
      console.log(event)
      let that = this;
      let appId = this.openParams.appId;
      let params = {
          viewId: this.openParams.actionContent,
          opentarget: 'detail',
          containTitle: this.view.name,
        }
      this.$api.getCollapsedviewTemplate(
        appId,
        params,
        {
          onSucess: res => {
            if(res.data.data) {
            
              that.$api.getViewData(
                //普通视图接口
                that.$root.appid,
                that.openParams.actionContent,
                {
                  currpage: that.currentPage,
                  lines: 10,
                  parentParam: encodeURIComponent(tree.parentName + '\\'),
                },
                {},
                {
                  onSucess: response => {
                    let docs = response.data.data.data;
                      console.log(docs)
                    let tds = [];
                    if (docs) {
                      docs.forEach(doc => {
                        let rows = {};
                        rows.formId = doc.formId;
                        rows.docId = doc.id;
                        for (let key in doc.items) {
                          let items = doc.items[key];
                          rows[key] = items.value;
                        }
                        if(doc.hasChild) {
                          rows.hasChildren = true;
                        }

                        if(doc.parentName) {
                          rows.parentName = doc.parentName;
                        }
                        tds.push(rows);
                      });
                      console.log("tds--->",tds);
                      resolve(tds);
                    }   
                  }
                }
              );
            }
          }
        }
      )
    },
  
    regReplace(value){
      if(value){
          return value.replace(/&#37;/g, "%")
      }
    },

    reloadListView(){
      this.getData(this.currentPage, 10, "");
    },
    //点击打开最后的视图？
    onRowClick(row) {
      let params = {
        linkType: "00",
        name: this.view.name,
        appId: this.openParams.appId,
        actionContent: row.formId,
        _select:row.docId,
        viewId: this.view.id,
        parentId:this.openParams.parentId?this.openParams.parentId:'',  //包含元素时判断是否有parentId
        isRelate:this.openParams.isRelate?this.openParams.isRelate:'',  //包含元素时判断isRelate是否为true
        templateForm:this.view.templateForm?this.view.templateForm:'',
      };
      if(this.showtype == 'include'){
        this.toTab(params);
      }else {
        this.$emit("add-tab", params)
      }
      //this.$emit("openNewpage",params); //打开新页面
      
    },
    //表格项选中后执行的函数？
    handleSelectionChange(val) {
      let docIds = [];
      if(val.length>0) {
        for(let i=0; i<val.length; i++) {
          docIds.push(val[i].docId);
        }
      }else {
        docIds = [];
      }
      this.$emit("getDocIds",docIds);
    },

    getData(page) {
      this.getViewData(page).then(response => {
        let docs = response.data.data;
        this.dataList = response.data.data;
        this.row_count = response.data.row_count;
        let tds = [];
        if (docs) {
          docs.forEach(doc => {
            let rows = {};
            rows.formId = doc.formId;
            rows.docId = doc.id;
            for (var key in doc.items) {
              let items = doc.items[key];
              rows[key] = items.value;
            }
            if(doc.hasChild) {
              rows.hasChildren = true;
            }
            if(doc.parentName) {
              rows.parentName = doc.parentName;
            }
            tds.push(rows);
          });
           if(tds.length == 0){
            this.emptyData = this.$t('nodata')
          }
          this.loading = false;
          this.tableData = tds;
          console.log("this.tableData---->",this.tableData);
        }   
      });
    },
    
    //模拟数据请求
    getViewData(page) {
      let treeData = "";
      let treeName = "";
      if (this.parentId) {
        //树形视图
        return new Promise(resolve => {
          this.$api.getTreeViewData(
            //树形视接口
            this.openParams.appId,
            this.openParams.actionContent,
            {
              parentId: this.parentId ? this.parentId : ""
            },
            treeData,
            treeName,
            {
              onSucess: response => {
                let treeViewData = response.data;
                resolve(treeViewData);
              }
            }
          );
        });
      } else if (this.openParams && this.openParams.parentId) {
        //包含元素时
        return new Promise(resolve => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.openParams.parentId,
              isRelate: this.openParams.isRelate,
              currpage: page?page:this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 10,
              searchWord: ''
            },
            {

            },
            {
              onSucess: response => {
                let viewData = response.data;
                resolve(viewData);
              }
            }
          );
        });
      } else {
        return new Promise(resolve => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.parentId ? this.parentId : "",
              currpage: page?page:this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 10,
              searchWord:'',
            },
            {},
            {
              onSucess: response => {
                let viewData = response.data;
                resolve(viewData);
              }
            }
          );
        });
      }
    },

    viewFieldPath(value, field) {
      if (value && field == "ImageUploadField") {
        return obpmConfig.obpmFilePath + value.path;
      } else if (value && field == "AttachmentUploadField") {
        let arr = JSON.parse(value);
        return arr;
      }
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

  },
};
</script>