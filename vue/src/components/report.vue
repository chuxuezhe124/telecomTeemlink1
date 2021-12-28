<template>
  <div class="main-report">
    <div class="nav-btn">
      <div>
        <span @click="exportExcel">
          <i class="exportToExcelBtnicon"></i>
           {{$t('report.excel')}}
        </span>
        <span @click="exportPdf">
          <i class="exportToExcelBtnicon"></i>
           {{$t('report.pdf')}}
        </span>
        <span @click="print">
          <i class="htmlPrintBtnicon"></i>
           {{$t('report.print')}}
        </span>
        <!-- 先隐藏，暂未发现有何作用
        <span class="btn-last">
          {{$t('report.signature')}}
        </span>
        -->
      </div>
      <div>
        <span v-if="isShowBtn" @click="openSearchTemplate">
          <i class="el-icon-search"></i>
        </span>
      </div>
    </div> 
    <div class="search-box" v-show="isOpenTemplate">
      <form_searchform
        :appId="openParams.appId"
        :viewId="openParams.actionContent"
        :chartType="chartType"
        @event="showBtn"
        @onSearch="onSearch"
        ref="reportSearchform"
      /> 
    </div>
    <div class="report-content" v-if="reportHtml" style="overflow: auto;">  
      <div v-html="reportHtml" :id="'report_' + openParams.actionContent"></div>  
      <!-- <iframe
        ref="mainFrame"
        style="border:none"
        width="100%"
        :height="iframeHeight"
        frameborder="0"
        allowtransparency="true" 
        noresize="noresize"
        :src="currentUrl"
      ></iframe> -->
    </div>
    <div class="report-content" v-if="currentUrl" style="overflow: auto;">
      <iframe
        ref="mainFrame"
        style="border:none"
        width="100%"
        :height="iframeHeight"
        frameborder="0"
        allowtransparency="true" 
        noresize="noresize"
        :src="currentUrl"
      ></iframe>
    </div>

    <el-dialog 
      :title="$t('report.print')"
      v-if="dialogVisible" 
      :visible.sync="dialogVisible" 
      top="10px" 
      :lock-scroll="true"
      width="67%" 
    >
      <div class="print-content" style="height:450px;overflow:auto;">
        <div class="content-wrap" ref="print">
          <div id="print">
            <div v-html="reportHtml" :id="'print_' + openParams.actionContent"></div>
            <!-- <iframe
              ref="mainFrame"
              style="border:none"
              width="100%"
              height="700"
              frameborder="0"
              allowtransparency="true" 
              noresize="noresize"
              :src="currentUrl"
            ></iframe> -->
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button 
          type="primary" 
          v-print="'#print'"
        >
           {{$t('report.print')}}
        </el-button>
      </span>
    </el-dialog>
  </div>
  
</template>
<script>
import form_searchform from "@/components/form_searchform.vue"
export default {
  props: ['openParams'],
  components: {
    form_searchform,
  },
  watch: {
  },
  created() {
    this.getReport();
  },
  mounted() {
    this.getScollerHeight();
  },

  data() {
    return{
      currentUrl:'',
      dialogVisible:false,
      iframeHeight: '',
      formData:'',
      isOpenTemplate:false,
      isShowBtn:false,
      chartType:'report',
      reportHtml: '',
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    
    onSearch(data){
      this.$api.searchReports (
        data.viewId,
        '',
        data,
        {
          onSucess: res => {
            let urls = res.data;
            this.currentUrl = '';
            this.reportHtml = ''
            setTimeout(() => {
              this.currentUrl = obpmConfig.obpmFilePath + urls;
            }, 300)
          }
        }
      )
    },

    showBtn(val){
      this.isShowBtn = val;
    },

    openSearchTemplate(){
      this.isOpenTemplate = !this.isOpenTemplate;
    },

    printPage() {
      let newWindow = window.open('_blank');   //  打开新窗口
      let codestr = document.getElementById('print').innerHTML;   //  获取需要生成pdf页面的div代码
      newWindow.document.write(codestr);   //  向文档写入HTML表达式或者JavaScript代码
      newWindow.document.close();     //  关闭document的输出流, 显示选定的数据
      setTimeout( ()=> {
        newWindow.print();
      }, 1000);
    },

    print() {
      this.dialogVisible = true;
      setTimeout(() => {
        let id = "print_" + this.openParams.actionContent
        this.setImgUrl(id)
      }, 500)
    },

    setImgUrl(id){
      let imgLists = document.getElementById(id).getElementsByTagName("img")
      console.log("imgLists-->",imgLists)
      let src = ''
      for(let i=0; i<imgLists.length; i++) {
        let imgName = imgLists[i].src.split("/")
        src = obpmConfig.obpmFilePath + "/uploads/reports/" + imgName[imgName.length - 2] + "/" + imgName[imgName.length - 1]
        imgLists[i].src = src
      }
    },

    setParams(op){
      let params = ''
      for(let key in op) { //openParams参数必定携带这几个参数，不需要做参数传到后台
        if(key != 'actionContent' &&
          key != 'active' &&
          key != 'appId' && 
          key != 'linkType' && 
          key != 'name' && 
          key != 'title' && 
          key != '_select'
        ) {
          params = key + "=" + op[key] + "&"
        }
      }
      return params
    },

    exportPdf() {
      let op = this.openParams
      let params = this.setParams(op);
      
      this.$api.exportReportPdf(
        op.actionContent,
        params,
        {
          onSucess: response => {
            let fileName = "";
            let type = response.headers['content-type'];
            if(response.headers['content-disposition']) {
              // fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
              let suffix = fileName.split(".")[1]
              // fileName = name + "." + suffix;
              fileName = op.name + decodeURIComponent(".pdf");
            }else {
              fileName= $t('report.download');
            }
            this.download(response, type, fileName);
          }
        }
      )
    },

    exportExcel() {
      let op = this.openParams
      let params = this.setParams(op);
      this.$api.exportReportExcel(
        op.actionContent,
        params,
        {
          onSucess: response => {
            let fileName = "";
            let type = response.headers['content-type'];
            if(response.headers['content-disposition']) {
               
              // fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
              let suffix = fileName.split(".")[1]
              // fileName = name + "." + suffix;
              fileName =  op.name + decodeURIComponent(".xls");//$t('report.datasource_down') + ".xls";
            }else {
              fileName=$t('report.download');
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

    getReport(){
      let op = this.openParams
      let id = op.actionContent;
      let params = {
        appId: op.appId ? op.appId : '',
        reportId: id,
        orderId: op.orderId ? op.orderId : '',
        docId: op.docId ? op.docId : ''
      }
      this.$api.getCustomreports(
        id,
        params,
        {
          onSucess: response => {
            let urls = response.data;
            if(urls.indexOf('未知系统异常') > -1) {
              alert(urls)
            }
            this.currentUrl = obpmConfig.obpmFilePath + urls;
            this.$api.getCustomreportsHtml(
              urls, 
              {
                onSucess: res => {
                  this.reportHtml = res.data
                  let domId = 'report_' + id
                  setTimeout(() => {
                    this.setImgUrl(domId)
                  }, 1000)
                }
              }
            )
          }
        }
      );
    },

    /**
     * 动态计算页面iframe高度
     */
    getScollerHeight() {
      setTimeout(() => {
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        //60 头部， 32 面包屑， 41 第一层页签， 40 第二层页签， 50 列表标题， 71 查询， 20 父组件外边距, 40分页, 16 外边距
        //这个组件在父组件dialog中高度给的85%，54 弹窗标题 30 弹窗底部padding 50 第一季页签 20机动距离
        this.iframeHeight = clientHeight - 60 - 32 - 41 - 50 - 20 - 16;
      }, 100);
    },
  }
};
</script>
<style lang="scss" scoped>

</style>


