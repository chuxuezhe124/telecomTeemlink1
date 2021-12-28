<template>
  <div class="delegate" ref="viewDelegate" :id="'delegate_'+openParams.actionContent">
    <!-- openType： 288(网格显示) -->
    <div 
      class="act-btns view-act-btns" 
      v-if="showtype != 'home' && 
        view.openType != 288 &&  
        view.simpleClassName != 'CalendarView' && 
        view.simpleClassName != 'GanttView' &&  
        view.simpleClassName != 'TreeView' && 
        view.simpleClassName != 'MapView' && 
        isFormPrint != 5">
      <div
        class="usual-btns"
        v-if="!isView && 
          showtype != 'home' &&
          isShowActivity
        ">
        <activity 
          v-for="activity in view.activities" 
          :key="activity.id" 
          :info="activity"
          :isBlockClick="isBlockClick" 
          @action="onAction" 
        />
        <collapse_activity 
          :style="{display:collapseButtons.length > 0 ? 'inline-block':'none'}"
          :collapseButtons="collapseButtons" 
          @action="onAction"
        />
      </div>
      <div v-if="isView" class="clear-btn-box">
        <span class="searchBtn danger" @click="clearViewSelect">
          {{$t('btns.cancel')}}
        </span>
		    <template v-if="selectOne || mutil">
          <el-button @click="viewDialogClean" size="medium" v-if="showCleanBtn">{{$t('btns.clean')}}</el-button>
          <el-button type="primary" @click="viewDialogSure" size="medium">{{$t('btns.sure')}}</el-button>
        </template>
        <span class="searchBtn danger"  style="margin:0 10px" @click="returnPrevious" v-if="cardBack">  
          {{$t('form.back')}}
        </span>
      </div>
      <span></span>
      <div class="search-btns-box view-search-btns-box">
        <div class="search-btns" v-if="view.searchFormId != undefined">
          <div class="left" v-show="!isShowSearchTemplate && view.commonFilterCondition && view.commonFilterCondition != '[]'">
            <form_customize_searchform
              :appId="openParams.appId"
              :viewId="openParams.actionContent"
              :commonFilterCondition="view.commonFilterCondition"
              :openParams="openParams" 
              @onSearch="onSearch"
              ref="searchform"
            />
          </div>
          <div class="right">
            <span class="advanced-btn" v-show="!isShowSearchTemplate" @click="openSearchTemplate">
              <span v-if="view.commonFilterCondition && view.commonFilterCondition != '[]'">
                {{$t('highlevel')}}
              </span>
              <span v-else>
                <i class="el-icon-search"></i>
              </span>
            </span>
            <span class="advanced-btn" v-show="isShowSearchTemplate" @click="openSearchTemplate" style="width:60px;">
              <span v-if="view.commonFilterCondition && view.commonFilterCondition != '[]'">
                {{$t('retracting')}}
              </span>
              <span v-else>
                <i class="el-icon-search"></i>
              </span>
            </span>
            <span v-if="(mutil || selectOne)&&!(this.view.simpleClassName =='TreeView') ">
              <span span class="select">{{$t('choosed')}}：</span>    
              <span class="select-num" @click="showCheckedList">{{checkedNum}}</span>
            </span>
          </div>
        </div>
		    <!--列隐藏功能，不提交到sp1-->
        <div class="icon-filter-box">
          <i class="fa fa-filter fa-lg" @click="columsDialogVisible = true"></i>
        </div>
      </div>
    </div>   
    <!--isFormPrint为5的时候是打印-->
    <!--columns： view_listView 传递的table显示列的数据 getTableTotalCount: 获取table的总条数 -->
    <component
      ref="delegate"
      :is="viewType" 
      :view="view"
      :openParams="openParams" 
      :clearCheckboxVal="clearCheckboxVal" 
      :mutil="mutil" 
      :selectOne="selectOne"
      :showtype="showtype"
      :isView = 'isView'
      :allowOpenDoc="allowOpenDoc"
      :delegateWidth="delegateWidth"
      :includeDisplayType="includeDisplayType"
      :toTab="toTab"
      :currentTab="currentTab"
      :isFormPrint="isFormPrint"
      :isMultiLevelListHeader="isMultiLevelListHeader"
      :multiLevelColumnData="multiLevelColumnData"
      :newColumns = "newColumns"
      :newColumnsFixed = "columnsFixed.newColumnsFixed"
      :columnsArray = "columnsArray"
      v-bind="$attrs"
      v-on="$listeners"
      v-if="isRouterAliveInclude"
      @updateView="updateView"
      @action="closeDialog" 
      @deleted="doRemove"
      @getDocIds="setDocIds"
      @selectNum="selectNum"
      @gridviewTem="gridviewTem"
      v-loading="loading"
      @columns="getViewTableColumns"
      @cardBackSign="cardBackSign"
    >
    </component>
    <!--新建以弹出层方式-->
    <el-dialog 
      :class="[dialogView.height?'configuration-common-dialog':'common-dialog']"
      :title="dialogTitle" 
      v-if="dialogVisible" 
      :append-to-body="true"
      :visible.sync="dialogVisible" 
      top="10px" 
      :lock-scroll="true"
      :width="dialogView.width?dialogView.width + 'px':'70%'"
      :before-close="handleClose"
    >
      <div 
        class="dialog-normalform" 
        :id="'dialog_normalform_'+openParams.actionContent"
        :style="{height:dialogView.height?(dialogView.height - 83) + 'px':screenHeight + 'px'}">
        <el-scrollbar class="scrollbar">
          <form_normalform
            :emptyParams="emptyParams"
            :openParams="newIncludeO"
            @action="closeDialog" 
          />
        </el-scrollbar>
      </div>
    </el-dialog>

    <el-dialog 
      :title="$t('message')" 
      :visible.sync="popupVisible" 
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="bulk-submission">
        <div class="text">
          {{$t('enter_auditing')}}<br/>{{$t('suggest')}}:
        </div>
        <div class="textarea">
          <el-input
            type="textarea"
            rows="8"
            :placeholder="$t('placeholder.content')"
            v-model="attitude">
          </el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="popupVisible = false" size="small">{{$t('btns.cancel')}}</el-button>
        <el-button type="primary" @click="onOk" size="small">{{$t('btns.sure')}}</el-button>
      </span>
    </el-dialog>
    
    <customDialog
      :title="title"
      :width="width"
      v-if="customizeVisible"
      :visible.sync="customizeVisible"
      :lock-scroll="true"
      :appendToBody="true"
    >
      <excelUpload 
        slot="body"
        :viewId="view.id"
        :act="act"
        :view="view"
        :openParams="openParams"
        @event="hiddenCustomizeVisible"
      />
    </customDialog>

    <!--跳转按钮_弹窗打开-->
    <div class="common-dialog-box">
      <el-dialog 
        class="common-dialog"
        v-if="jumpPopup" 
        :append-to-body="true"
        :visible.sync="jumpPopup" 
        top="10px" 
        :lock-scroll="true"
        :width="jumpParams.styleParams ? jumpParams.styleParams.dialogWidth :'70%'"
        :before-close="handleClose"
        center
      >
        <!--表单-->
        <div v-if="isJumpForm" 
          class="dialog-normalform custom-form" 
          :id="'dialog_normalform_'+openParams.actionContent"
          :style="{height: jumpParams.styleParams ? jumpParams.styleParams.dialogHeight : screenHeight + 'px'}"
        >
          <el-scrollbar class="scrollbar">
            <form_normalform
              :openParams="jumpParams"
              @action="closeDialog" 
            />
          </el-scrollbar>
        </div>
        <!--视图-->
        <div 
          v-if="isJumpView" 
          class="dialog-listview"
          :style="{height:jumpParams.styleParams ? jumpParams.styleParams.dialogHeight : screenHeight + 'px'}"
        >
          <el-scrollbar class="scrollbar" v-if="popupLayerType == 'VIEW'">
            <div>
              <view_delegate 
                :openParams="jumpParams"
                @popupOpenType="setPopupOpenType"
              >
              </view_delegate>
            </div>
          </el-scrollbar>
          <el-scrollbar class="scrollbar scrollbar-form" v-else>
            <form_normalform
              :openParams="jumpParamsForm"
              @popupOpenType="setPopupOpenType"
            />
          </el-scrollbar>
        </div>

        <!--外部链接-->
        <!-- style="height:calc(100% - 40px);" -->
        <div 
          v-if="isExternalLink" 
          class="el-dialog-div" 
          :style="{height:jumpParams.styleParams ? jumpParams.styleParams.dialogHeight : screenHeight + 'px'}"
        >
          <el-scrollbar class="scrollbar" v-if="popupLayerType == 'VIEW'">
            <div class="common-linkcontent-wrap">
              <common_linkcontent
                :openParams="jumpParams"
              >
              </common_linkcontent>
            </div>
            </el-scrollbar>
            <el-scrollbar class="scrollbar" v-else>
              <div class="common-linkcontent-wrap">
                <common_linkcontent
                  :openParams="jumpParams"
                >
                </common_linkcontent>
              </div>
            </el-scrollbar>
        </div>
      </el-dialog>
    </div>
   
    <!--导出EXCel表格弹窗-->
    <el-dialog 
      title="Excel导出" 
      v-if="exportDialog" 
      :append-to-body="true"
      :visible.sync="exportDialog" 
      :lock-scroll="true"
      top="100px" 
      width="40%"
    >
      <div style="display: flex;flex-flow: row nowrap;justify-content: space-between;">
        <el-radio-group v-model="exportData">
          <el-radio :label="1">{{$t('choosed_data')}}</el-radio>
          <el-radio :label="2">{{$t('all_data')}}</el-radio>
        </el-radio-group>
        <el-switch
          v-model="switchValue"
          active-color="#66b1ff"
          inactive-color="#CCCCCC"
          :active-text="$t('check_all')"
          @change="dataAll(switchValue)">
        </el-switch>
      </div>
      <div>
        <el-checkbox-group v-model="excelSelectList" @change="isShowSwitch(excelSelectList)">
          <el-checkbox 
            v-for="(column, index) in excelColumns" 
            :key="index"
            :value="column.name"
            :label="column.name"
            >{{column.name}}</el-checkbox> 
        </el-checkbox-group>
      </div>
      <br>
      <div>
        <el-progress v-show="isShowProgress" :percentage="exportProgress" :stroke-width="8"></el-progress>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmExportFile(currentClickBtnAct)">{{$t('btns.sure')}}</el-button>
      </span>
    </el-dialog>

    <!-- 显示已选择视图列表数据的弹窗 -->
    <el-dialog
      :title="$t('seedata')"
      :visible.sync="checkedListDialog"
      width="50%"
      append-to-body
    >
      <!-- showCheckBox： 是否显示复选框   showPagination： 是否显示分页  mainData：需要显示的数据-->
      <view_table :showCheckBox="false" :showPagination="false" :mainData="viewTableData"/>
    </el-dialog>

    <!-- 批量弹窗 -->
    <el-dialog 
      :title="$t('view.batch_ss')"
      class="common-dialog-signature"
      v-if="signatureDialog" 
      :append-to-body="true"
      :visible.sync="signatureDialog" 
      top="10px" 
      :lock-scroll="true"
      width="50%" 
      :close="signatureDialog == false"
    >

      <div v-if="signatureDialog" style="height:300px" class="signature-wrap">
        <el-button 
          type="primary" 
          v-for="item in signatureData.acts" 
          :key="item.id"
        >
          <span v-if="item.signatureAction == 'sign'">
            {{$t('view.sign')}}
          </span>
          <span v-if="item.signatureAction == 'opinion'">
            {{$t('suggest')}}
          </span>
          <span v-if="item.signatureAction == 'signature'">
            {{$t('view.seal')}}
          </span>
        </el-button>
        <el-select v-model="signatureValue" style="margin-left: 10px;">
          <el-option
            v-for="item in signatureData.acts"
            :key="item.id"
            :label="item.name"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </el-dialog>

    <!-- 列隐藏 列固定-->
    <el-dialog
      class="columns-operation-dialog"
      title="列操作"
      :visible.sync="columsDialogVisible"
      :append-to-body="true"
      width="50%"
    >
      <div class="container custom-scrollbar" :style="{maxHeight:screenHeight ? (screenHeight - 140) + 'px':''}">
        <h5 class="title">显示列</h5>
        <el-checkbox-group 
          style="white-space:pre-wrap"
          v-model="columnsId"
          @change="handleColumnChange($event,'hidden')"
        >
          <el-row>
            <el-col 
              :span="4" 
              v-for="(item) in columnsArray" 
              :label="item.id" 
              :key="item.id">
              <div :title="item.name" class="columns-col">
                <el-checkbox :label="item.id" >{{item.name}}</el-checkbox>
              </div>
            </el-col>
          <!-- <el-checkbox 
            v-for="(item) in columnsArray"
            :label="item.id" 
            :key="item.id">{{item.name}}</el-checkbox>-->
          </el-row> 
        </el-checkbox-group>
        <h5 class="title t-fixed">固定列</h5>
        <el-checkbox-group 
          style="white-space:pre-wrap"
          v-model="columnsFixed.columnsFixedId"
        >
          <el-row>
            <el-col 
              :span="4" 
              v-for="(item, index) in columnsArray"
              :label="item.id" 
              :key="item.id">
              <div :title="item.name" class="columns-col">
                <el-checkbox 
                  @change="handleColumnChange($event, 'fixed', index)"
                  :label="item.id">{{item.name}}</el-checkbox>
              </div>
            </el-col>
          </el-row> 
          <!-- <el-checkbox 
            v-for="(item, index) in columnsArray"
            :label="item.id" 
            :key="item.id"
            @change="handleColumnChange($event, 'fixed', index)"
            >{{item.name}}</el-checkbox> -->
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
      </span>
    </el-dialog>   

    <div v-show="isPrint">
      <div v-if="printParams">
        <div id="print">
          <div class="view-print">
            <view_listview 
              :openParams="openParams" 
              v-if="viewPrintData" 
              :view="viewPrintData" />
          </div>
        </div>
      </div>
    </div>

    <div 
      class="picture-preview-wrap" 
      v-if="imageParams.hiddenDialog" 
      @click="imageParams.hiddenDialog = false">
      <div class="picture-list">
        <el-carousel 
          :autoplay="false" 
          :initial-index="imageParams.initialIndex"
          arrow="always"
        >
          <el-carousel-item 
            v-for="item in imageParams.pathLists" 
            :key="item"
          >
            <img :src="item" style="height:100%" @click.stop>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="icon-dlose" @click="imageParams.hiddenDialog = false">
        <i class="el-icon-close"></i>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
import Constant from "@/Constant.js";
import view_emptyview from "@/components/view_emptyview.vue";
import view_listview from "@/components/view_listview.vue";
import view_gridview from "@/components/view_gridview.vue";
import view_mapview from "@/components/view_mapview.vue";
import view_treeview from "@/components/view_treeview.vue";
import view_collapsibleview from "@/components/view_collapsibleview.vue";
import view_cardview from "@/components/view_cardview.vue";

import view_calendarview from "@/components/view_calendarview.vue";
import activity from "@/components/activity.vue";
import form_normalform from "@/components/form_normalform.vue";
import customDialog from "@/components/dialog.vue";
import excelUpload from "@/components/excel_upload.vue";
// import Watermark from '@/assets/js/watermark';  //路径不要写错
import view_print from "@/components/view_print";
import form_customize_searchform from "@/components/form_customize_searchform.vue";
import common_linkcontent from "@/components/common_linkcontent";
import view_gantt from "@/components/view_gantt";
import view_table from '@/expandedComponents/view_table.vue' // 公用的table组件
import collapse_activity from "@/components/collapse_activity";
export default {
  name: "view-delegate",
  props: [
    "openParams",
    "clearCheckboxVal",
    "mutil",  //判断视图选择框多选或者拼接
    "selectOne", //判断视图选择框多选或者拼接
    "isView",
    "showtype",
    "allowOpenDoc",
    "toTab",
    "openType",
    "includeDisplayType", //包含元素或者选项卡为只读时的displayType=1,=4
    "isFormPrint", //表单打印时等于5
    "currentTab",
    "widgetChartView", //widget点击统计图时，传到这里的数据
	  "showCleanBtn",
  ],
  inject: [
    'addTab',
	  'openNewpage'
  ],

  watch: {
    listenIncludeViewUpdate(newVal){ //如果是包含元素打开标签页，返回或者关闭页签时刷新视图
      if(newVal == this.includeRefreshId) {
        this.$refs.delegate.getData()
      }
    },

    isShowSearchTemplate() {
      this.$refs.delegate.handleOpenSearchTemplate();
    },

    exportDialog(newVal) {
      if(!newVal) {
        this.isShowProgress = false
        this.exportProgress = 0
      }
    },

    columsDialogVisible() {
      if(!this.columsDialogVisible) {
        let columnsArray = {
          id: this.openParams.actionContent, 
          columns: this.newColumns,
        }
        let list = JSON.parse(localStorage.getItem("columnsArray") || '[]'); //缓存列隐藏
        list = list || []
        let res = ''
        if(list && list.length > 0) {
          res = list.some(item=>{
            if(item.id == columnsArray.id){
              return true
            }
          })
        }
        
        if(res){ 
          for(let i=0; i<list.length; i++) {
            if(columnsArray.id == list[i].id) {
              list[i] = columnsArray;
            }
          }
        }else {
          list.unshift(columnsArray);
        }
        let savesLists = []
        if(list && list.length > 0) {
          list.forEach(el => {
            if(el.columns.length > 0) {
              savesLists.push(el)
            }
          })
        }
        localStorage.setItem('columnsArray',JSON.stringify(list));//列隐藏

        let columnsFixedArray = {  //列固定
          id: this.openParams.actionContent, 
          columns: this.columnsFixed.newColumnsFixed,
        }
        let listFixed = JSON.parse(localStorage.getItem("columnsFixedArray") || '[]');
        listFixed = listFixed || []
        let resp = ''
        if(listFixed && listFixed.length > 0) {
          resp = listFixed.some(item=>{
            if(item.id == columnsFixedArray.id){
              return true
            }
          })
        }
        if(resp){ 
          for(let i=0; i<listFixed.length; i++) {
            if(columnsFixedArray.id == listFixed[i].id) {
              listFixed[i] = columnsFixedArray//columnsArray;
            }
          }
        }else {
          listFixed.unshift(columnsFixedArray);
        }
        let savesFixed = []
        if(listFixed && listFixed.length > 0) {
          listFixed.forEach(el => {
            if(el.columns.length > 0) {
              savesFixed.push(el)
            }
          })
        }
        let colList = JSON.parse(localStorage.getItem("columnsWidthArray") || '[]'); //列宽
        let searchCondition = JSON.parse(localStorage.getItem("searchConditionArray") || '{}')

        let viewSettingData = {
          hiddenColumns: savesLists,
          fixedColumns: savesFixed,
          columnsWidth: colList,
          searchCondition: searchCondition,
        }
        localStorage.setItem('columnsFixedArray',JSON.stringify(savesFixed));

        this.$api.saveViewSettings(
          viewSettingData,
          {
            onSucess: () => {}
          }
        )
      }
    },  
  },

  created: function() {
    if(this.widgetChartView) { //首页widget统计图数据
      this.delegateWidth = 0;
      this.view = this.widgetChartView;
      this.loading = false;
    }else {
      this.init()
    }
  },

  mounted: function () {
    window.handleClose = this.handleClose //调整按钮以iframe嵌套打开，在iframe页面调用此方法关闭弹窗
  },

  beforeDestroy(){
    window.clearInterval(this.task)
  },

  components: {
    view_emptyview,
    view_listview,
    view_gridview,
    view_treeview,
    view_mapview,
    view_collapsibleview,
    view_cardview,
    view_calendarview,
    activity,
    form_normalform,
    customDialog,
    excelUpload,
    view_print,
    form_customize_searchform,
    common_linkcontent,
    view_gantt,
    view_table,
    collapse_activity
  },

  data: function() {
    return {
      isBlockClick: false,
      screenHeight: document.documentElement.clientHeight - 120,
	    columnsArray: [],
      columsDialogVisible: false,
      columnsFixed: { //列固定
        newColumnsFixed: [], //列固定选中的数据
        columnsFixedId: [], //列固定选中的数据的id（多选）
      },
      columnsId: [], //选中的列ID
      newColumns: [], //选中的列数据
      isShowActivity: true,//视图操作按钮为0时，不显示操作按钮行
      exportProgress: 0,//导出进度条进度
      isShowProgress: false,//导出进度条是否显示
      switchValue: true,//全选
      view: { columns: [] }, //视图的列
      loading:true,
      title:'',
      dialogTitle: '新建',
      newIncludeO:'',
      dialogVisible:false,
      isRouterAliveInclude: true,
      currentOpenType:'',
      currentDocIds:[],
      popupVisible:false,
      attitude:'',
      currentAct:'',
      customizeVisible:false,
      width:'40%',
      excelPath:'',
      act:'',
      isPrint:false,
      printParams:'',
      viewPrintData:'',
      delegateWidth:'',
      isSubmissionProcess:'', //是否是视图列的提交流程
      viewRowId:'', //视图列的提交流程docId
      emptyParams:'',
      isShowSearchTemplate: false,
      jumpParams:'', //跳转按钮参数
      jumpPopup:false,//跳转按钮弹出窗
      isJumpForm:'',//跳转按钮参数
      isJumpView:'',//跳转按钮参数
      isExternalLink:'', //判断是否是外部链接
      checkedNum: 0,    //获取视图选择框选中的数值
      jumpParamsForm:'', //弹出层打开的视图进入表单的参数
      viewTableData:{ // table的数据
        tableHeight: 370,
        datas: [], // 被选中的数据
        columns:[], // 显示的列
      },
      checkedListDialog: false, // 视图选择框选中的列表
      excelColumns:[], //导出数据应该显示的列
      exportDialog: false, //文件导出的弹窗
      exportData: 2, //2为导出全部数据，1为导出选中数据
      currentClickBtnAct:'', //当前点击按钮的act数据
      popupLayerType: '', //判断弹出层是打开表单还是视图
      excelSelectList:[],
      searchDocItems: '', //查询表单的数据
      imageParams:{
        hiddenDialog: false,
        pathLists: [],
        initialIndex: 0,
      },
      dialogView: { //视图弹出层打开设置了宽高
        width:'',
        height: '',
      },
      cvFormData: {},//复制runBeforeAction的参数formdata，保存在cvFormData里用于给getAxecuteAddress传参
      signatureDialog: false,
      signatureData: [],
      signatureValue: '',
      task:'', //导出时的定时器
      isExporting: false, //正在导出
      isMultiLevelListHeader:false,
      multiLevelColumnData: [] ,//多级列列表头
      copyColumns:[], //深拷贝视图列给excell导出使用
      isDialogOpenExternalLink: false,
      refreshId: '',
      cardBack:'',
      collapseButtons: []
    };
  },

  methods: {
    viewDialogClean() {
      this.$parent.$parent.$parent.clearCheckbox(); //视图选择框的clearCheckbox()
    },

    viewDialogSure() {
      this.$parent.$parent.$parent.onOk(); //视图选择框的onOk()
    },

    saveColumnsWidth(colList){
      let list = JSON.parse(localStorage.getItem("columnsArray") || '[]'); //列隐藏
      let listFixed = JSON.parse(localStorage.getItem("columnsFixedArray") || '[]') //列固定
      let searchCondition = JSON.parse(localStorage.getItem("searchConditionArray") || '{}')
      let viewSettingData = {
        hiddenColumns: list,
        fixedColumns: listFixed,
        columnsWidth: colList,
        searchCondition: searchCondition,
      }
      this.$api.saveViewSettings(
        viewSettingData,
        {
          onSucess: () => {}
        }
      )
    },

    init(isCloseDialog){
      let op = this.openParams
      let exparams = {}
      if(op.exparams) { //如果携带参数
        let ex = op.exparams.replace(/^(\s|&)+|(\s|&)+$/g, '')
        let list = ex.split("&")
        for (let i = 0; i < list.length; i++) {
          let e = list[i].split("=")
          if(e[1]) {
            exparams[e[0]] = e[1];
          }
        }
      }
      if(op.formParams) {
        exparams = this.setParams(op.formParams, exparams)
      }
      this.initView({
        appId: op.appId,
        viewId: op.actionContent,
        exparams: exparams ? exparams : {},
        isCloseDialog: isCloseDialog,
      });
    },

    setParams(params, obj){
      params = params.replace(/^(\s|&)+|(\s|&)+$/g, '')
      let list = params.split("&")
      for (let i = 0; i < list.length; i++) {
        let p = list[i].split("=")
        let isJson = this.isJSON(p[1])
        if(isJson) {
          obj[p[0]] = encodeURI(p[1])
        }else {
          obj[p[0]] = p[1]?p[1]:''
        }
      }
      return obj
    },

    isJSON(str) { //判断是json字符串
      if (typeof str == 'string') {
        try {
          let obj=JSON.parse(str);
          if(typeof obj == 'object' && obj ){
            return true;
          }else{
            return false;
          }
        } catch(e) {
          return false;
        }
      }
    },

    handleColumnChange(ev, type, index) { //列隐藏
      let list = JSON.parse(JSON.stringify(this.columnsArray))
      let arr = []
      if(type === 'hidden') {
        ev.forEach(el => {
          list.forEach(item => {
            if(el == item.id) {
              let obj = {
                id: item.id
              }
              arr.push(obj)
              // arr.push(item)
            }
          })
        });
        
        this.newColumns = arr
      }else {
        let arrId = []
        list.forEach((item, inx) => {
          if(inx <= index) {
            let obj = {}
            obj.id = item.id
            obj.fixed = 'left'
            arr.push(obj)
            arrId.push(item.id);
          }
        })
        this.columnsFixed.columnsFixedId = arrId
        this.columnsFixed.newColumnsFixed = arr
        if(!ev && index === 0) {
          this.columnsFixed.columnsFixedId = []
          this.columnsFixed.newColumnsFixed = []
        }
      }
    },    
    //选中的导出方式
    // handleChange(opt){
    //   if(opt === 1) {
    //     this.switchValue = false;
    //     // this.isDisabled = false;
    //     this.excelSelectList = [];
    //   }
    //   else if(opt === 2) {        
    //     let selectAll = [];
    //     let columns = this.excelColumns;  
    //     for (let i = 0; i < columns.length; i++) {
    //       selectAll.push(columns[i].name);       
    //     }   
    //     this.excelSelectList = selectAll;
    //     // this.switchValue = false;
    //     // this.isDisabled = true;
    //   }
    // },
    isShowSwitch(val) {
      if(val.length === this.excelColumns.length) {
        this.switchValue = true
      }else {
        this.switchValue = false
      }
    },

    //el-switch全选
    dataAll(val) {
      if(val === true) {
        let selectAll = [];
        let columns = this.excelColumns;
        for (let i = 0; i < columns.length; i++) {
          selectAll.push(columns[i].name);
        }
        this.excelSelectList = selectAll;
      }else {
        this.excelSelectList = [];
      }
    },

    setDialogStatus(params){
      this.imageParams = params;
    },

    setSearchDocItems(doc){
      this.searchDocItems = doc;
    },
    
    //高级查询
    onSearch(searchData, data) {
      this.$refs.delegate.onSearch(searchData, data);
    },

    //执行常用查询的重置
    executeCommonReset() {
      this.$refs.searchform.commonReset()
    },

    //打开或者关闭查询表单
    openSearchTemplate() {
      this.isShowSearchTemplate = !this.isShowSearchTemplate;
    },

    updateView() {
      this.isRouterAliveInclude = false;
      this.$nextTick(() => (this.isRouterAliveInclude = true));
    },

    hiddenCustomizeVisible() { //该方法实现视图修改数据，或者删除数据重新加载视图数据
      let openType = this.view.openType
      if(this.view.simpleClassName == 'GanttView') { //当是甘特视图直接刷新整个页面
        // this.updateView();
        this.$refs.delegate.reloadListView()
      }else if(openType == 288) { //网格视图
        setTimeout(() => {
          this.customizeVisible = false
          this.updateView()
        },1000)
      }else {
        setTimeout(() => {
          this.customizeVisible = false
          this.$refs.delegate.reloadListView()
        },1000)
      }
    },

    setExcelPath(path) {
      this.excelPath = path;
    },

    //批量提交或者提交流程
    onOk() {
      if(this.isSubmissionProcess) {
        if(!this.attitude) {
          this.$message({
            message: this.$t('view.input_ss'),
            type: 'warning'
          });
        }else {
          let obj = {
            approveLimit: "",
            attitude: this.attitude,
            docId: this.viewRowId
          }
          this.$api.operateSubmit(
            this.openParams.appId,
            this.view.id,
            obj,
            {
              onSucess: res => {
                this.popupVisible = false;
                if(res.data.errcode == 0) {
                  this.attitude = '';
                  this.$notify({
                    title: res.data.data,
                    message: '',
                    type: 'success'
                  });
                }else {
                  this.$notify.error({
                    title: this.$t('msg.err'),
                    message: ''
                  });
                }
              }
            }
          )
        }
      }else {
        if(!this.attitude) {
          this.$message({
            message: this.$t('view.input_ss'),
            type: 'warning'
          });
        }else {
          this.runBeforeAction(this.currentAct,this.currentDocIds);
        }
        
      }
      
    },

    handleClose() {
      this.dialogVisible = false
      this.jumpPopup = false
      if(this.isDialogOpenExternalLink) {
        // this.$refs.delegate.getData();
        let isCloseDialog = true
        this.init(isCloseDialog)
      }
    },

    //包含元素弹出层和当前页打开都是使用这个刷新
    closeDialog(isSave) {
      this.$refs.delegate.reloadListView()
      if(!isSave) {
        this.dialogVisible = false
        this.jumpPopup = false
      }
      let _st = this.showtype
      if(_st && _st == 'include') {
        this.$emit("refresh")
      }
    },

    includeReload () { //重新刷新组件刷新
      this.$emit("change");
      this.isRouterAliveInclude = false
      this.$nextTick(() => (this.isRouterAliveInclude = true));
    },
    
    initView({ appId, viewId, exparams, isCloseDialog}) {
      let op = this.openParams;
      let st = this.showtype;
      exparams = exparams || {};
      if(op.queryString) {
        let qs = op.queryString;
        let list = qs.split("&");
        for (let i = 0; i < list.length; i++) {
          let p = list[i].split("=");
          if(p[1]) {
            exparams[p[0]] = p[1];
          }
        }
      }
      let urlParams = op.urlParams; //跳转按钮携带的参数
      if(urlParams) {
        let fp = urlParams.replace(/^(\s|&)+|(\s|&)+$/g, '');
        let list = fp.split("&");
        for (let i = 0; i < list.length; i++) {
          let p = list[i].split("=");
          if(p[0] && p[0] != 'appId' && p[0] != 'viewId') {
            if(p[1]) {
              exparams[p[0]] = p[1];
            }
          }
        }
      }
      if((st && st == 'tab') || (st && st == 'include')){ //如果是控件选项卡
        exparams.parentId = op.parentId;
        exparams.isRelate = op.isRelate;
      }
      this.$api.getViewTemplate(appId, viewId, exparams, {
        onSucess: response => {
          this.loading = true;
          if (response.data.data) {
            if(!response.data.data.activities) { //后台配置的视图操作按钮为0
              this.isShowActivity = false
            }
            this.delegateWidth = this.$refs.viewDelegate.clientWidth;
            let viewData = response.data.data;
            let columns = viewData.columns;
            if(!columns) {
              this.$message({
                message: this.$t('msg.set_viewlist'),
                type: 'warning'
              });
              return
            }
            this.copyColumns = JSON.parse(JSON.stringify(columns));
            let isMultiLevelListHeader = false; //多级表头
            for(let i=0;i<columns.length;i++){
              let name = columns[i].name
              if(!isMultiLevelListHeader) {
                if(name.indexOf("__") > -1) {
                  isMultiLevelListHeader = true
                }
              }
              if(!columns[i].visible){
                columns.splice(i,1);
                i--;
              }
            }
            let iType = this.includeDisplayType;            
            if(viewData.readonly || (iType && (iType == Constant.PermissionType_READONLY || iType == Constant.PermissionType_DISABLED))) { //只读或者包含元素为只读，视图都要只读
              let btnArr = viewData.activities;
              if(btnArr && btnArr.length > 0) {
                for(let i = btnArr.length-1; i >= 0; i--){
                  if(btnArr[i].type != 1 && btnArr[i].type != 16 && btnArr[i].type != 26 && btnArr[i].type != 36 && btnArr[i].type != 43){
                    btnArr.splice(i,1);
                  }
                }        
              }
              // 1 16 26 36
            }

            let btns = []
            if(viewData.activities && viewData.activities.length > 0) { //如果按钮过多，并且有 __ 双下划线，就折叠起来
              viewData.activities = viewData.activities.filter(el => {
                if(el.name.indexOf("__") > -1) {
                  btns.push(el)
                }
                return el.name.indexOf("__") < 0
              })
              this.collapseButtons = btns
            }

            let formPrint = this.isFormPrint;
            if(formPrint && formPrint == '5') { //判断视图列打印时是否隐藏
              // let bodyWidth = document.documentElement.clientWidth - 52;
              let tdsWidth = 0;
              for(let j=0; j<columns.length; j++){
                if(!columns[j].visible4PagePrint){
                  columns.splice(j,1);
                  j--;
                }else{
                  if(columns[j].width) {
                    tdsWidth = tdsWidth + parseInt(columns[j].width);
                  }else {
                    columns[j].width = 100;
                    tdsWidth = tdsWidth + 100;
                  }
                }
              }
              for(let j=0; j<columns.length; j++){
                if(columns[j].width) {
                  let tdWidth = Math.floor(columns[j].width/tdsWidth * 100);
                  columns[j].tdWidth = tdWidth + '%';
                }
              }
            }
            if(viewData.openType != 288) { //判断是视图类型不是网格视图时，把保存按钮删除
              if(viewData.activities) {
                if(viewData.activities.length > 0) {
                  for(let i=0; i<viewData.activities.length; i++) {
                    if(viewData.activities[i].type === 34) {
                      viewData.activities.splice(i, 1);
                      break;
                    }
                  }
                }
              }
            }
            viewData.columns.forEach((item,index) => {
              if(item.iconMapping) {
                if(!viewData.columns[index].visible) {
                  viewData.columns[index].iconMapping = JSON.parse(item.iconMapping)// item.iconMapping//JSON.parse(item.iconMapping)
                }
              }
            });
            
            if(viewData.width) { //视图是弹出层打开时有宽高
              this.dialogView.width = viewData.width;
            }
            if(viewData.height) {
              this.dialogView.height = viewData.height;
            }

            let columnsArray = columns;
            for(let i = 0; i < columnsArray.length; i++){
              if(!columnsArray[i].visible || columnsArray[i].hiddenColumn){
                columnsArray.splice(i,1);
                i--;
              }
            }
            this.title =
              response.data.data.description || response.data.data.name;
            this.currentOpenType = response.data.data.openType;

            let list = JSON.parse(localStorage.getItem("columnsArray") || '[]'); //视图列隐藏数据
            let currentViewList = [];
            let res = ''
            if(list && list.length > 0) {
              res = list.some(item=>{
                if(item.id == this.openParams.actionContent){
                  currentViewList.push(item);
                  return true
                }
              })
            }
            
            if(res){ //如果列隐藏有缓存
              this.columnsArray = columnsArray
              this.showViewRow = currentViewList[0].columns || []
              let arrId = []
              let arr = []
              let rowsId = []
              let currentColumns = currentViewList[0].columns
              columnsArray.forEach(el => {
                currentColumns.forEach(ele => {
                  if(ele.id === el.id) {
                    arr.push(el)
                    arrId.push(el.id)
                    let obj = {
                      id: el.id
                    }
                    rowsId.push(obj)
                  }
                })
              });
              this.columnsId = arrId
              this.newColumns = rowsId
              viewData.columns = arr
            }else {
              let showColumns = columnsArray
              this.columnsArray = showColumns
              if(showColumns) {
                let arrId = []
                let arr = []
                let rowsId = []
                for(let i=0; i<showColumns.length; i++) {
                  arrId.push(showColumns[i].id)
                  arr.push(showColumns[i])
                  let obj = {
                    id: showColumns[i].id
                  }
                  rowsId.push(obj)
                }
                this.columnsId = arrId
                this.newColumns = rowsId
                viewData.columns = arr
              }
            }

            let listFixed = JSON.parse(localStorage.getItem("columnsFixedArray") || '[]') //列固定
            let viewFixedList = [];
            let resp = ''
            if(listFixed && listFixed.length > 0) {
              resp = listFixed.some(item => {
                if(item.id == this.openParams.actionContent){
                  viewFixedList.push(item);
                  return true
                }
              })
            }
             
            if(resp){ //如果列固定有缓存
              let arrId = []
              let arr = []
              let fixedList = viewFixedList[0].columns
              fixedList.forEach(el => {
                columnsArray.forEach(ele => {
                  if(ele.id === el.id) {
                    ele.fixed = el.fixed
                    arr.push(ele)
                    arrId.push(ele.id)
                  }
                })
              });
              this.columnsFixed.newColumnsFixed = viewFixedList[0].columns 
              this.columnsFixed.columnsFixedId = arrId
            }

            let columnsWidthLists = JSON.parse(localStorage.getItem("columnsWidthArray") || '[]')
            let viewColumnsWidth = []
            let rep = ''
            if(columnsWidthLists && columnsWidthLists.length > 0) {
              rep = columnsWidthLists.some(item => {
                if(item.id == this.openParams.actionContent){
                  viewColumnsWidth.push(item)
                  return true
                }
              })
            }

            if(rep){ //如果列宽有缓存
              let columnsList = viewColumnsWidth[0].columns
              columnsList.forEach(el => {
                columnsArray.forEach(ele => {
                  if(ele.id === el.id) {
                    ele.showColumnWidth = el.showColumnWidth
                  }
                })
              });
            }

            this.view = viewData;

            if(viewData.style && viewData.style.content) {
              let viewCss = '#view_' + viewData.id + " " + viewData.style.content;
              let css = viewCss,
              head = document.head || document.getElementsByTagName('head')[0],
              style = document.createElement('style');
              head.appendChild(style);
              style.type = 'text/css';
              style.appendChild(document.createTextNode(css));
            }

            if(isCloseDialog) { //弹窗打开视图后重新加载数据
              this.$refs.delegate.getData();
            }

            //多级表头
            if(isMultiLevelListHeader) {
              let listArr = [];
              const loopOpe = columns => {
                let arr = []
                for(let i=0; i<columns.length; i++) {
                  let name = columns[i].name
                  if(name.indexOf("__") > -1) {
                    let nArr = name.split("__")
                    let t = nArr[0]
                    let t2 = nArr.slice(1).join("__")
                    let nobj = {
                      id: t,
                      name: t2,
                      label: name,
                      columns:columns[i],
                      haveChildren: true,
                    }
                    arr.push(nobj)
                  }else {
                    let nobj = {
                      id: name,
                      name: name,
                      label: name,
                      columns:columns[i],
                      haveChildren: false,
                    }
                    arr.push(nobj)
                  }
                }
                arr.forEach((el) => {
                  for (let i = 0; i < listArr.length; i++) {
                    if (listArr[i].id == el.id) {
                      listArr[i].children.push({
                        name: el.name,
                        label: el.label,
                        columns:el.columns,
                        id: el.name,
                      });
                      return;
                    }
                  }
                  if(el.haveChildren) {
                    listArr.push({
                      id: el.id,
                      children: [{
                        id: el.name,
                        name: el.name,
                        label: el.label,
                        columns:el.columns,
                      }]
                    })
                  }else {
                    listArr.push({
                      id: el.id,
                      label: el.label,
                      columns:el.columns,
                    })
                  }
                  // listArr.push({
                  //   id: el.id,
                  //   children: [{
                  //     name: el.name,
                  //   }]
                  // })
                })
              }
              if(columns && columns.length>0) {
                loopOpe(columns)
              }

              const loopOpe2 = (columns, index) => {
                let arr = []
                let lArr = []
                for(let i=0; i<columns.length; i++) {
                  let name = columns[i].name
                  if(name.indexOf("__") > -1) {
                    let nArr = name.split("__")
                    let t = nArr[0]
                    let t2 = nArr.slice(1).join("__")
                    let nobj = {
                      id: t,
                      name: t2,
                      label: t2,
                      columns: columns[i].columns,
                      haveChildren: true,
                    }
                    arr.push(nobj)
                  }else {
                    let nobj = {
                      id: name,
                      name: name,
                      label: name,
                      columns: columns[i].columns,
                      haveChildren: false,
                    }
                    arr.push(nobj)
                  }
                }
                arr.forEach((el) => {
                  for (let i = 0; i < lArr.length; i++) {
                    if (lArr[i].id == el.id) {
                      lArr[i].children.push({
                        id:el.name,
                        name: el.name,
                        label: el.label,
                        columns: el.columns,
                      });
                      return;
                    }
                  }
                  if(el.haveChildren) {
                    lArr.push({
                      id: el.id,
                      children: [{
                        id:el.name,
                        name: el.name,
                        label: el.label,
                        columns: el.columns,
                      }]
                    })
                  }else {
                    lArr.push({
                      id: el.id,
                      label: el.label,
                      columns: el.columns,

                    })
                  }
                })
                listArr[index].children = lArr;
              }

              if(listArr && listArr.length>0) {
                listArr.forEach((el, index) => {
                  if(el.children && el.children.length > 0) {
                    loopOpe2(el.children, index)
                  }
                });
              }
              this.multiLevelColumnData = listArr;
              this.isMultiLevelListHeader = true
            }
            this.loading = false;
            // 传递给子组件 view_treeview 判断是否需要显示清除按钮
            this.$emit('getViewType', response.data.data.simpleClassName)
          }
          clearTimeout(timeLoading);
        }
      });
    },

    openForm(params, emptyParams) {
      this.emptyParams = emptyParams;
      this.newIncludeO = params;
      if(params.title != undefined){
        this.dialogTitle = params.title;
      }
      this.dialogVisible = true;
    },

    //创建新表单
    doCreate(act, extraParams) {
      let view = this.view;
      let openParams = this.openParams;
      let params = {
        linkType: "00",
        appId: openParams.appId,
        active: true,
        actionContent: act.onActionForm,
        name: view.name,
        refreshId: openParams.id,
        id: new Date().getTime(),
      };
      
      //以下的参数形式是在新建后执行执行后脚本
      let sd = this.searchDocItems;
      let formData = {
        docId: "",
        document: {},
        formId: view.relatedForm,
        parentId: "",
        templateForm: "",
        viewId: openParams.actionContent,
        _selects: this.currentDocIds,
      }
      if(extraParams && extraParams.treedocid) {
        params.treedocid = extraParams.treedocid;
        formData.treedocid = extraParams.treedocid;
      }
      if(sd) {
        formData.document = sd;
      }
      let appId = openParams.appId;
      let divId = act.id;
      let docId = '';
      let parentId = openParams.parentId ? openParams.parentId:'';
      let _templateForm = '';
      let _ = '';
      params.isNewCreate = true;
      params.runAfterParams = {
        appId,
        divId,
        docId,
        actionContent: openParams.actionContent,
        relatedForm: view.relatedForm,
        _templateForm,
        parentId,
        _,
        formData,
      }
      let includeRunAfterParams = params.runAfterParams; //包含元素里嵌套视图，视图新建执行后有脚本
      if(view.newPage) { //新窗口打开
        this.isBlockClick = false
        params.isOpenNewWindow = true;
        params.runAfterParams = JSON.stringify(params.runAfterParams)
        let routeData = this.$router.resolve({
            // name: "form_blank",
            name: 'open',
            query: params,
          });
        let winObj = window.open(routeData.href, "_blank");
        let loop = setInterval(() => {
          if(winObj.closed) {
            clearInterval(loop);
            this.$refs.delegate.reloadListView();
          }
        }, 1500);
      }else if(this.widgetChartView){ //如果是widget的视图新建
        this.isBlockClick = false
        this.$emit('action',params)
      }else if(openParams.isOpenNewWindow && view.openType !== 277) { //如果是新窗口打开且没设置视图打开方式为弹出层
        this.isBlockClick = false
        let newParams = JSON.parse(JSON.stringify(params));
        newParams.isOpenNewWindow = true;
        let routeData = this.$router.resolve({
            name: "open",
            query: newParams,
          });
        window.open(routeData.href, "_blank");
      }else if(openParams.isPopupLayerDisplay) { //如果打开类型是弹出层，新建时打开表单
        this.isBlockClick = false
        this.$emit("popupOpenType",'FORM',params);
      }else if(openParams.isExternalLink) { //外链打开，然后新建表单,通过opener组件
        // params = {
        //   linkType: '00',
        //   appId: openParams.appId,
        //   actionContent: act.onActionForm,//url,
        //   isExternalLink: true, //url是打开opener组件，判断是外链。
        // };
        this.isBlockClick = false
        params.isExternalLink = true
        this.$emit("onAction",params)
      }else {
        if(!this.showtype || this.showtype == "target") { //普通视图新建或者后台设置了菜单的打开链接方式是新窗口打开（target）
          this.isBlockClick = false
          if(view.newPage) { //打开新窗口
            let newParams = JSON.parse(JSON.stringify(params));
            newParams.runAfterParams = JSON.stringify(newParams.runAfterParams);
            newParams.isOpenNewWindow = true;
            let routeData = this.$router.resolve({
                // name: "form_blank",
                name: 'open',
                query: newParams,
              });
            window.open(routeData.href, "_blank");
          }else {
            if(this.view.openType == 277) { //弹出层
              params.type = 277;
			        params.dialogId = 'dialog_normalform_' + openParams.actionContent; ////用于弹窗打开表单有包含元素时，计算包含元素宽度
              this.newIncludeO = params;
              this.dialogVisible = true;
            }else {
              if(this.view.openType == 293) { //新页签打开
                this.$emit("add-tab",params);
              }else { //当前页打开
                this.openNewpage(params)
              }
            }
          }
        }else {
          if(this.showtype == 'include') { //包含元素
            this.isBlockClick = false
            let params = {
              linkType: "00",
              appId: openParams.appId,
              active: true,
              actionContent: act.onActionForm,
              name: this.view.name,
              refreshId: openParams.id,
              randomRefreshId: new Date().getTime(),
              runAfterParams: includeRunAfterParams,
            };
            params.parentId = openParams.parentId ? openParams.parentId:'';  //包含元素时判断是否有parentId
            params.isRelate = openParams.isRelate ? true:'';
            params.isIncludeCreate = "include";
            params.isNewCreate = true;
            this.includeRefreshId = params.randomRefreshId;
            if(this.currentOpenType == 1) {
              if(this.view.simpleClassName == "CollapsibleView") {
                params.viewType = "CollapsibleView";
                this.toTab(params);
              }else {
                this.$refs.delegate.addRow(params);
              }
            }else if(this.currentOpenType == 277) {
              this.newIncludeO = params;
              this.dialogVisible = true;
            }else if(this.currentOpenType == 293) { //标签页打开
              params.name = this.view.name;
				      params.openType = this.view.openType
              this.toTab(params);
            }
          }else if(this.showtype == 'tab') { //选项卡
            this.isBlockClick = false
            params.parentId = openParams.parentId ? openParams.parentId:'';  //包含元素时判断是否有parentId
            params.isRelate = openParams.isRelate ? true:'';
            params.istabCreate = "tab";
            this.includeRefreshId = params.randomRefreshId;
            if(this.currentOpenType == 1) {
              if(extraParams && extraParams.innerType == "FORM") { //树形视图新建打开表单
                this.toTab(params);
              }else {
                this.$refs.delegate.addRow(params);
              }
            }else if(this.currentOpenType == 277) {
              params.isTabCreate = "tab";
              params.type = 277;
              params.dialogId = 'dialog_normalform_' + openParams.actionContent; //用于弹窗打开表单有包含元素时，计算包含元素宽度
              this.newIncludeO = params;
              this.dialogVisible = true;
            }else if(this.currentOpenType == 293) { //标签页打开
              // this.$emit("add-tab", {
              //   linkType: "00",
              //   appId: this.openParams.appId,
              //   active: true,
              //   actionContent: act.onActionForm,
              //   name: this.view.name,
              //   refreshId:this.openParams.id,
              // });
              this.toTab(params);
            }
          }
        }
      }
    },

    setViewRefreshId(id){
      this.includeRefreshId = id
    },

    setPopupOpenType(type, params){  //当视图是弹出层打开，新建或打开视图列表
      if(type == 'FORM') {
        params.isPopupLayerDisplay = true;
        this.jumpParamsForm = params;
        this.popupLayerType = type;
      }else if(type == 'VIEW'){
        this.popupLayerType = type;
      }
    },

    //是否删除的弹窗提示
    doRemove(act, value) {
      let docIds = '';
      if(this.currentDocIds && this.currentDocIds.length > 0) {
        docIds = this.currentDocIds;
      }else { //树形视图时
        docIds = value;
      }
      if(docIds && docIds.length > 0) {
        this.$confirm(this.$t('msg.del_select')+`${docIds.length}`+this.$t('msg.data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          this.runBeforeAction(act, docIds);
        }).catch(() => {
                  
        });
      }else {
        this.$confirm(this.$t('msg.least_one_data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          
        }).catch(() => {
                  
        });
      }
    },

    //删除视图
    removeDocuments(act,docIds) {
      this.$api.batchRemoveDocuments(this.openParams.appId, docIds, {
        onSucess: (res) => {
          if(res.data.errcode == 0) {
            this.$notify({
              title:this.$t('success'),
              message:'',
              type: 'success'
            })
            this.runAfterAction(act, []);
            this.$refs.delegate.reloadListView();
            let _st = this.showtype;
            if(_st && _st == 'include') { //包含元素删除视图应刷新表单页面，新建也一样
              this.$emit("refresh")
            }
            // this.includeReload();
          }
        }
      });
    },

    setDocIds(val) {
      this.currentDocIds = val
    },

    //是否清空所有数据的弹窗
    clearDataPopup(data) {
      this.$confirm(this.$t('msg.del_all'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.runBeforeAction(data);
      }).catch(() => {
                
      });
    },
    
    //清空所有数据
    clearAllData(act) {
      let appId = this.openParams.appId;
      let formId = this.view.relatedForm;
      this.$api.deleteAllData(appId, formId, {
        onSucess: res => {
          if(res.data.errcode == 0) {
            this.$notify({
              title: res.data.data,
              message: '',
              type: 'success'
            });
            this.runAfterAction(act, []);
            this.includeReload();
          }
        }
      })
    },

    //执行脚本前
    /**
     * docIds 视图选中的id
     * extraParams 树形视图新建传过来的参数，以后其他视图可能也会用到
     * **/
    runBeforeAction(act, docIds, extraParams){
      this.isBlockClick = true
      setTimeout(() => {
        this.isBlockClick = false
      }, 3500)
      let view = this.view;
      let sd = this.searchDocItems;
      let commonSearchFlag = true //常用查询是否有值
      for(let key in sd) {
        if(sd[key]) {
          commonSearchFlag = false
        }
      }
      if(commonSearchFlag) { //常用查询
        if(this.$refs.searchform) {
          sd = this.$refs.searchform.buildSearchData()
        }
      }
      if(view.searchFormId != undefined) { //高级查询
        let sfd = this.$refs.delegate.getSearchformBuildData()
        sd = Object.assign(sfd, sd)
      }
      let openParams = this.openParams;
      let formData = {
        docId: "",
        document: sd ? sd : {},
        formId: view.relatedForm,
        parentId: "",
        templateForm: view.templateForm,
        viewId: openParams.actionContent,
        _selects: docIds && docIds.length > 0 ? docIds : this.currentDocIds,
      }
      this.cvFormData = formData //复制runBeforeAction的参数formdata，保存在cvFormData里用于给getAxecuteAddress传参
      let st = this.showtype;
      if((st && st == 'tab') || (st && st == 'include')) { //如果是控件选项卡或包含元素
        formData.parentId = openParams.parentId;
        formData.isRelate = openParams.isRelate;
      }
      let treedocid = '';
      if(extraParams && extraParams.treedocid) {
        treedocid = extraParams.treedocid;
        formData.treedocid = extraParams.treedocid;
        formData.document = extraParams.document;
      }
      if(openParams.isRelate) {
        formData.isRelate = openParams.isRelate;
      }
      if(openParams.parentId) {
        formData.parentId = openParams.parentId;
      }
      let divId = act.id;
      let actType = act.type;
      this.$api.runBeforeActionScript(
        openParams.appId, 
        divId, 
        formData, 
        actType,
        treedocid?treedocid:'', //treedocid
        '', //flowType
        {
        onSucess: response => {
          if(response.data.data){ //如果有数据返回，结束下一步
            this.isBlockClick = false
            let resData = response.data.data;
            let errmsg = response.data.data.content;
            if(!resData.type) { //没有type值，但是有返回数据，把数据放进document
              if(resData.changedField) {
                this.$notify.success({
                  title: resData.content,
                  message: ''
                });
              }
            }else if(resData.type == 1){
              this.$notify.error({
                title: errmsg,
                message: '',
                customClass: 'notify-success', //载入视图执行前脚本返回值显示为红色         
              });
            }else if(resData.type == 16){
              this.$notify.error({
                title: errmsg,
                message: ''
              });
            }else if(resData.type == 32){
              this.$confirm(`${errmsg}`, this.$t('tip'), {
                confirmButtonText: this.$t('msg.confirm'),
                cancelButtonText: this.$t('btns.cancel'),
                type: "warning",
              }).then(() => {
                switch(act.type) {
                  case 1: //载入视图
                    this.getTemplate(act);
                    break;
                  case 2: //新建表单
                    this.doCreate(act, extraParams);
                    break;
                  case 3: //删除数据
                    this.removeDocuments(act,docIds);
                    break;
                  case 16: //导出excel
                    this.isBlockClick = false
                    this.currentClickBtnAct = act;
                    let excelColumns = []; 
                    let columns = this.copyColumns;
                    let selectAll = []
                    for (let i = 0; i < columns.length; i++) {
                      if(columns[i].visible4ExpExcel) {
                        excelColumns.push(columns[i]);
                      }
                        selectAll.push(columns[i].name);
                    }
                    this.excelColumns = excelColumns;
                    this.excelSelectList = selectAll;
                    this.exportDialog = true;
                    this.switchValue = true;
                    this.exportData = 2
                    break;
                  case 18: //清空所有数据
                    this.clearAllData(act);
                    break;
                  case 20: //批量提交
                    this.onSubmit(act, docIds);
                    break;
                  case 26: //文件下载
                    this.fileDownload(act.id);
                    break;
                  case 27: //导入excel
                    this.showLeadDialog(act);
                    break;
                  case 36: //网页打印(视图)
                    this.viewPrint(act);
                    break;
                  case 43: //跳转
                    this.jumpType(act);
                    break;
                  default:
                    break;
                }
              }).catch(() => {});
            }
          }else {
            switch(act.type) {
              case 1: //载入视图
                this.getTemplate(act);
                break;
              case 2: //新建表单
                this.doCreate(act, extraParams);
                break;
              case 3: //删除数据
                this.removeDocuments(act,docIds);
                break;
              case 16: //导出excel
                this.isBlockClick = false
                this.currentClickBtnAct = act;
                let excelColumns = []; 
                let columns = this.copyColumns;
                let selectAll = []
                for (let i = 0; i < columns.length; i++) {
                  if(columns[i].visible4ExpExcel) {
                    excelColumns.push(columns[i]);
                  }
                    selectAll.push(columns[i].name);
                }
                this.excelColumns = excelColumns;
                this.excelSelectList = selectAll;
                this.exportDialog = true;
                this.switchValue = true;
                this.exportData = 2
                break;
              case 18: //清空所有数据
                this.clearAllData(act);
                break;
              case 20: //批量提交
                this.onSubmit(act, docIds);
                break;
              case 26: //文件下载
                this.fileDownload(act.id);
                break;
              case 27: //导入excel
                this.showLeadDialog(act);
                break;
              case 29:
                break;
              case 36: //网页打印(视图)
                this.viewPrint(act);
                break;
              case 43: //跳转
                this.jumpType(act);
                break;
              default:
                break;
            }
          }

          // if(response.data.errcode == 0 && response.data.data) {
          //   let errcode = response.data.errcode;
          //   let errmsg = response.data.data.content;
          //   this.$notify.error({
          //     title: errmsg,
          //     message: ''
          //   });
          // }else if(response.data.errcode == 0){
          //   switch(act.type) {
          //     case 1: //载入视图
          //       this.getTemplate(act);
          //       break;
          //     case 2: //新建表单
          //       this.doCreate(act);
          //       break;
          //     case 3: //删除数据
          //       this.removeDocuments(act,docIds);
          //       break;
          //     case 16: //导出excel
          //       this.currentClickBtnAct = act;
          //       let selectAll = [];
          //       let columns = this.view.columns;
          //       columns.forEach(el => {
          //         selectAll.push(el.name);
          //       });
          //       this.excelSelectList = selectAll;
          //       this.exportDialog = true;
          //       break;
          //     case 18: //清空所有数据
          //       this.clearAllData(act);
          //       break;
          //     case 20: //批量提交
          //       this.onSubmit(act, docIds);
          //       break;
          //     case 26: //文件下载
          //       this.fileDownload(act.id);
          //       break;
          //     case 36: //网页打印(视图)
          //       this.viewPrint(act);
          //       break;
          //     case 43: //跳转
          //       this.jumpType(act);
          //       break;
          //     default:
          //       break;
          //   }
          // }
        }
      });
    },

    //执行脚本后
    runAfterAction(act, docIds, extraParams) {
      let sd = this.searchDocItems;
      let op = this.openParams;
      let formData = {
        docId: "",
        document: sd ? sd : {},
        formId: this.view.relatedForm,
        parentId: "",
        templateForm: "",
        viewId: op.actionContent,
        _selects: docIds && docIds.length > 0 ? docIds : this.currentDocIds,
      }
      let st = this.showtype;
      let parentId = '';
      if((st && st == 'tab') || (st && st == 'include')) { //如果是控件选项卡或包含元素
        formData.parentId = op.parentId;
        formData.isRelate = op.isRelate;
        parentId = op.parentId;
      }
      if(extraParams && extraParams.treedocid) {
        formData.treedocid = extraParams.treedocid;
        formData.document = extraParams.document;
      }
      let appId = op.appId;
      let divId = act.id;
      let docId = '';
      
      let _templateForm = '';
      let _ = '';
      this.$api.runAfterActionScript(
        appId,
        divId,
        docId,
        op.actionContent,
        this.view.relatedForm,
        _templateForm,
        parentId,
        _,
        formData,
        act.type,
        '', //treedocid
        {
          onSucess: response => {
            this.isBlockClick = false
            if(response.data.data){
              let returnData = response.data.data;
              if(returnData.changedField) {
                this.$notify.success({
                  title: returnData.content,
                  message: ''
                });
              }else {
                let errmsg = response.data.data.content;
                if(returnData.type && returnData.type == 'message') {
                  if(errmsg.type == 16) {
                    this.$notify.success({
                      title: errmsg.content,
                      message: ''
                    });
                  }
                }else if(returnData.type && returnData.type == '1') {
                  this.$notify.success({
                    title: errmsg,
                    message: ''
                  });
                }else {
                  this.$notify.error({
                    title: errmsg,
                    message: ''
                  });
                }
              }
            }else {
              if(act.type == 1) {
                // this.$refs.delegate.reloadListView();
              }else if(act.type == 20) {
                this.popupVisible = false;
              }
            }
            // if(response.data.errcode == 0) {
            //   if(response.data.data.content) {
            //     let errmsg = response.data.data.content.content;
            //     this.$notify({
            //       title: errmsg,
            //       message: '',
            //       type: 'warning'
            //     });
            //   }else {
            //     if(act.type == 20) {
            //       this.popupVisible = false;
            //     }
            //   }
            // }
          }
        }
      );
    },

    //计算基本打开窗口跳转
    openDialogJump(params, type){
      if(type == "FORM") {
        params.dialogId = 'dialog_normalform_' + this.openParams.actionContent; //用于弹窗打开表单有包含元素时，计算包含元素宽度
        this.isJumpView = false;
        this.isJumpForm = true;
        this.jumpParams = params;
        this.jumpPopup = true;
      }else if(type == "VIEW") {
        this.popupLayerType = "VIEW";
        this.isJumpForm = false;
        this.isJumpView = true;
        params.isPopupLayerDisplay = true;
        this.jumpParams = params;
        this.jumpPopup = true;
      }else if(type == "JUMP"){
        this.popupLayerType = "VIEW";
        this.isJumpForm = false;
        this.isJumpView = false;
        this.jumpParams = params;
        this.jumpPopup = true;
        this.isExternalLink = true;
      }
    },

    //跳转按钮的跳转类型
    jumpType(act){
      let name = this.view.fullName.split("_").join("、")
      let _selects = this.cvFormData._selects
      let op = this.openParams
      let obj = {
        docId: '',
        appId: this.$api.appid,
        viewId: act.parentView, 
        opentarget: '',
        containTitle:name,
        field:'',
        isRelate: undefined,
        parentId:'',
        _selects: _selects,
      };
      if(op.parentId) {
        obj.parentId = op.parentId
      }
      if(op.isRelate != null) {
        obj.isRelate = op.isRelate
      }
      this.$api.getAxecuteAddress(
        this.openParams.appId,
        act.id,
        obj,
        {
          onSucess: res => {
            this.isBlockClick = false
            if(res.data.errcode === 0) {
              let url = res.data.data.content
              let queryString = act.dispatcherParams
              let isForm = url.search("form.html") != -1  //兼容good的url的写法（后期改）
              let isView = url.search("view.html") != -1  //兼容good的url的写法（后期改）
              let isReport = url.search("report.html") != -1 //兼容good的url的写法（后期改）
              let isOpenCurrentSoftwareData = url.search("open?") != -1

              let urlArrayF = url.split("?");
              let urlArray = '';
              if(urlArrayF[1]) {
                urlArray = urlArrayF[1].split("&");
              }else {
                if(url.indexOf('?') == -1) {
                  url = url + '?';
                }
              }
              this.isJumpForm = isForm;
              this.isJumpView = isView;
              let type = '';
              let isExternalLink = false;
              
              if(isForm) {
                type = '00'
              }else if(isView) {
                type = "01"
              }else if(isReport) { //报表
                type = '09'
              }else if (!isForm && !isView && !isOpenCurrentSoftwareData) {
                isExternalLink = true;
                this.isExternalLink = true; //判断是否是外部链接
              }

              let params = {
                linkType: type,
                appId: op.appId,
                actionContent: '',
                name: act.name,
                _select: '',
                viewId: "",
              }
              if(op.parentId) {
                params.parentId = op.parentId
              }
              if(op.isRelate != null) {
                params.isRelate = op.isRelate
              }
              let obj = {};
              if(urlArray && urlArray.length > 0) {
                for(let i=0; i<urlArray.length; i++) {
                  let val = urlArray[i].split("=");
                  obj[val[0]] = val[1];
                }
              }
              obj.refreshId = op.id
              switch(act.jumpActOpenType) {
                case 0:
                  if(!isExternalLink) {
                    if(isOpenCurrentSoftwareData) { //如果外链形式还是打开产品的控件，那么不用iframe的方法嵌套
                      if(op.exparams) {
                        obj.exparams = op.exparams
                      }
                      obj.name = act.name
                      if(op.isPopupLayerDisplay) { //弹窗打开视图后，跳转按钮打开表单，还是在弹窗打开
                        this.$emit("popupOpenType",'FORM',obj);
                      }else {
                        this.$emit("openNewpage",obj)
                      }
                    }else {
                      params.actionContent = obj.viewId ? obj.viewId : obj.formId
                      params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                      param.isCurrentPageOpen = true
                      param.queryString = queryString
                      this.$emit("openNewpage",params)
                    }
                  }else {
                    params = {
                      linkType: '103',
                      appId: op.appId,
                      actionContent: url,
                    };
                    // this.$emit("openNewpage",params)
                    this.openNewpage(params)
                  }
                  break;
                case 1:
                  if(!isExternalLink) {
                    if(isOpenCurrentSoftwareData) {
                      let formParams = '';
                      for(let key in obj) {
                        if(
                          key != 'name' &&
                          key != 'actionContent' &&
                          key != 'searchData' && 
                          key != 'showtype' && 
                          key != 'realformId' && 
                          key != 'templateForm' && 
                          key != 'urlParams' && 
                          key != 'exparams' &&
                          key != 'runAfterParams' &&
                          key != 'queryString' &&
                          key != 'isOpenDialog'
                          ) {
                          if(obj[key]) {
                            formParams += "&" + key + '=' + obj[key];
                          }
                        }
                      }
                      if(op.exparams) {
                        if(formParams) {
                          formParams = formParams + "" + op.exparams
                        }else {
                          formParams = op.exparams
                        }
                      }
                      if(formParams) {
                        obj.formParams = formParams
                      }
                      obj.name = act.name
                      obj.isPopupLayerDisplay = true
                      if(obj.linkType == '00') { //表单
                        this.isJumpForm = true
                      }else if(obj.linkType == '01'){ //视图
                        this.isJumpView = true
                        this.popupLayerType = "VIEW";
                      }
                      if(obj.isRefresh && obj.isRefresh=='true') {
                        this.isDialogOpenExternalLink = true
                      }
                      this.jumpParams = obj
                    }else {
                      params.actionContent = obj.viewId ? obj.viewId : obj.formId
                      params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                      params.isPopupLayerDisplay = true
                      this.jumpParams = params
                      this.popupLayerType = "VIEW"
                    }
                    this.jumpPopup = true
                  }else {
                    params.linkType = '103'
                    params.actionContent = url //url + "&isOpenDialog=true"
                    params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                    params.isExternalLink = true                    
                    let linkType = '';
                    for(let i=0; i<urlArray.length; i++) {
                      if(urlArray[i].indexOf("linkType") > -1) {
                        if(urlArray[i].indexOf("01") > -1) {
                          linkType = "VIEW";
                          params.actionContent = url + "&isOpenDialog=true"
                        }else if(urlArray[i].indexOf("00") > -1) {
                          linkType = "FORM";
                          params.actionContent = url + "&isOpenDialog=true"
                        }
                      }
                    }
                    this.jumpParams = params;
                    this.popupLayerType = linkType;
                    this.jumpPopup = true;
                  }
                  break;
                case 2:
                  if(!isExternalLink) {
                    if(isOpenCurrentSoftwareData) {
                      if(op.exparams) {
                        obj.exparams = op.exparams
                      }
                      obj.name = act.name
                      this.addTab(obj)
                    }else {
                      params.actionContent = obj.viewId ? obj.viewId : obj.formId
                      params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                      if(isReport) { //报表
                        if(obj.reportId) {
                          params.actionContent = obj.reportId
                        }
                        Object.assign(params, obj)
                      }
                      this.addTab(params)
                    }
                  }else {
                    params.linkType = '103'
                    params.actionContent = url
                    params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                    params.isExternalLink = true
                    if(isReport) { //报表
                      if(obj.reportId) {
                        params.actionContent = obj.reportId
                      }
                      Object.assign(params, obj)
                    }
                    // this.$emit("add-tab", params);
                    this.addTab(params)
                  }
                  break;
                case 3:
                  if(!isExternalLink) {
                    params.actionContent = obj.viewId ? obj.viewId : obj.formId
                    params.clearTemp = obj.clearTemp ? obj.clearTemp : ''
                    if(isForm) {
                      params.urlParams = urlArrayF[1] //携带url后面的参数
                      let routeData = this.$router.resolve({
                        // name: "form_blank",
                        name: 'open',
                        query: params,
                      });
                      window.open(routeData.href, "_blank");
                    } else if(isView) {
                      let routeData = this.$router.resolve({
                        name: "view_blank",
                        query: params
                      });
                      window.open(routeData.href, '_blank');
                    } else if(isOpenCurrentSoftwareData) {
                      url += '&isOpenNewWindow=true'
                      window.open(url)
                    }
                  }else {
                    params = {
                      linkType: '103',
                      appId: op.appId,
                      actionContent: url,
                    };
                    window.open(params.actionContent)
                  }
                  break;
                case 4:
                  break;
                default:
                  break;
              }
            }
          }
        }
      )
    },

    //提交
    onSubmit(act, docIds) {
      let attitude = this.attitude;
      let appId = this.openParams.appId;
      let doJson = {
        actId:act.id,
        attitude,
        docIds:docIds,
        limistStrList:'',
        remark: '',
      }
      this.$api.batchApprove(appId, doJson, {
        onSucess: res => {
          if(res.data.data && res.data.errcode == 0) {
            this.$notify.success({
              title: this.$t('success'),
              message: res.data.data.content,
            });
            this.popupVisible = false;
            this.runAfterAction(act, docIds);
            this.$refs.delegate.reloadListView(); //刷新
          }else if(res.data.errcode==0) {
            this.$notify.success({
              title: this.$t('success'),
              message: res.data.data.content,
            });
            this.popupVisible = false;
            this.runAfterAction(act, docIds);
            this.$refs.delegate.reloadListView(); //刷新
          }else if(res.data.errcode==4001){
            this.isBlockClick = false
            this.$notify.error({
              title: this.$t('msg.err'),
              message:  res.data.errmsg,
            });
          }
        }
      });
    },

    //获取视图模板
    getTemplate(act){
      let op = this.openParams;
      this.view = '';
      let appId = op.appId;
      let viewId = act.onActionView;
      let exparams = {};
      let st = this.showtype;
      if((st && st == 'tab') || (st && st == 'include')) { //如果是控件选项卡或包含元素
        exparams.parentId = op.parentId;
        exparams.isRelate = op.isRelate;
      }
      exparams.appId = appId;
      exparams.viewId = viewId;
      this.$api.getViewTemplate(appId, viewId, exparams, {
        onSucess: response => {
          if(response.data.errcode == 0) {
            setTimeout(() => {
              this.view = response.data.data
              this.currentDocIds = []
              this.runAfterAction(act, [])
            }, 1000);
            // this.runAfterAction(act, []);//外面执行this.view仍为''
          }
        }
      })
    },

    //批量提交按钮弹窗
    showSubmitPanel(act, docIds) {
      if((this.currentDocIds && this.currentDocIds.length>0) || (docIds && docIds.length > 0)) {
        if(docIds && docIds.length > 0) {
          this.currentDocIds = docIds;
        }
        this.currentAct = act;
        this.popupVisible = true;
      }else {
        this.$alert(this.$t('msg.least_one_data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          callback: () => {
          }
        });
      }
    },

     //文件下载
    fileDownload(divId){
      let op = this.openParams
      let appId = op.appId;
      let docId = ''
      let actId = divId;
      let params = {
        parentId: op.parentId ? op.parentId : '',
        isRelate: op.isRelate,
      }
      API.viewDocumentDownload(
        appId,
        docId,
        actId,
        params,
        {
          onSucess: response => {
            this.isBlockClick = false
            if(response.data.errcode != 0) {
              this.$notify({
                title: this.$t('form.warning'),
                message: this.$t('view.nofile'),
                type: 'warning'
              });
            }else {
              let fileName = "";
              let url = ""
              let contextPath = obpmConfig.contextPath;
              let filePath = response.data.data;  //uploads/doc/202108/文本框pdf导出 (7).pdf
						  if(filePath && (filePath.indexOf("https://")>-1 || filePath.indexOf("http://")>-1)){
                window.open(encodeURI(filePath));
                return false;
              }
              fileName = filePath.substring(filePath.lastIndexOf("/")+1);
              url = contextPath + "/runtime/file/download?filepath=" + filePath + "&filename=" + fileName
              window.open(encodeURI(url))
            }
            // let type = response.headers['content-type'];
            // if(response.headers['content-disposition']) {
            //   fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
            // }else {
            //   fileName=this.$t('report.download');
            // }
            // if(response.data.size >0){
            //   this.download(response, type, fileName);
            // }else {
            //   this.$notify({
            //     title: this.$t('form.warning'),
            //     message: this.$t('view.nofile'),
            //     type: 'warning'
            //   });
            // }
          },
          onError:error =>{
            this.isBlockClick = false
            if(error.response && error.response.status == 500)
              this.$notify({
                title: this.$t('form.warning'),
                message: this.$t('view.nofile'),
                type: 'warning'
              });
          }
        }
      )
    },
    
    download(res, type, filename, act){
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
      this.runAfterAction(act, this.currentDocIds);
      setTimeout(() => {
        window.clearInterval(this.task)
        this.exportDialog = false
        this.isShowProgress = false;//进度条下载后隐藏
        this.exportProgress = 0;//进度条数值下载后为0
        this.isExporting = false;
      },500)
    },

    //Excel导出弹窗
    confirmExportFile(act) {
      if(this.exportData === 1 && this.currentDocIds.length === 0){
        this.$alert(this.$t('msg.least_one_data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          type: 'warning',
          callback: () => {
          }
        });
      }else {
        if(this.excelSelectList.length === 0) {
          this.$alert(this.$t('msg.select_list'), this.$t('tip'), {
            confirmButtonText: this.$t('msg.confirm'),
            type: 'warning',
            callback: () => {
            }
          });
          return false;
        }
        if(this.isExporting) {
          return 
        }
        let view = this.view
        this.isExporting = true;
        let op = this.openParams;
        let applicationId = op.appId,
            viewId = view.id,
            actId = act.id,
            name = view.name,
            isExpSub = act.expSub,
            parentId = '',
            isRelate = undefined;
        let st = this.showtype;
        if((st && st == 'tab') || (st && st == 'include')) { //如果是控件选项卡或包含元素
          parentId = op.parentId,
          isRelate = op.isRelate;
        }
        let params = this.$refs.delegate.getExcelParams();
        let selectDocId = this.exportData == 2 ? []:this.currentDocIds;
        let sc = this.excelSelectList;
        let selectColumns = (sc && sc.length > 0) ? sc.join(","):'';
        let obj = {
          selectColumns,
          selectDocIds:selectDocId,
          items: {}
        }
        let sd = this.searchDocItems;
        let commonSearchFlag = true //常用查询是否有值
        for(let key in sd) {
          if(sd[key]) {
            commonSearchFlag = false
          }
        }
        if(commonSearchFlag) { //常用查询
          if(this.$refs.searchform) {
            sd = this.$refs.searchform.buildSearchData()
            obj.items = sd
          }
        }
        if(view.searchFormId != undefined) { //高级查询
          let sfd = this.$refs.delegate.getSearchformBuildData()
          sd = Object.assign(sfd, sd)
          obj.items = sd
        }
        
        this.task = setInterval( () => {
          this.$api.exportExcelProgress(
            {
              onSucess: response => {
                if(response.data.errcode == 0) {
                  let process;//进度条数值
                  this.isShowProgress = true;
                  let excelExportCount = response.data.data.excelExportCount//获取已经导出的条数
                  let excelRowCount = response.data.data.excelRowCount//需要导出总条数
                  if(excelRowCount == 0) {//导出空表
                    process = 100 
                  }else {
                    process = Math.floor(((excelExportCount / excelRowCount) * 100)) 
                  }
                  this.exportProgress = process
                  if(process == 100) {
                    window.clearInterval(this.task)
                  }
                }
              }
            },
          )
        },500)
        this.$api.exportExcel(
          applicationId,
          viewId,
          actId,
          name,
          isExpSub,
          parentId,
          isRelate,
          params,
          obj,
          {
            onSucess: response => {
              let fileName = "";
              let type = response.headers['content-type'];
              if(response.headers['content-disposition']) {
                fileName = decodeURIComponent(response.headers['content-disposition'].split("=")[1]);
                let suffix = fileName.split(".")[1]
                fileName = name + "." + suffix;
              }else {
                fileName=this.$t('report.download');
              }
              setTimeout(() => {
                this.isExporting = false;
              }, 1000)
              
              this.download(response, type, fileName, act);
            }
          },
        )

      }
    },

    //网页打印 
    viewPrint(act) {
      let openParams = this.openParams
      let view = this.view;
      let routeData = this.$router.resolve({
        name: "printView",
        query: {
          //给print_view.vue接收
          viewId: this.view.id,
          isPrint: true,
          openType: view.openType,
          simpleClassName: view.simpleClassName,
          appId: openParams.appId,
          isRelate: openParams.isRelate,
          parentId: openParams.parentId,
        }
      });
      window.open(routeData.href, '_blank');
      this.runAfterAction(act, []);
    },

    //视图提交流程打开弹窗
    viewColumnSubmission(val, docId){
      this.isSubmissionProcess = val;
      this.viewRowId = docId;
      this.popupVisible = true;
    },

    //弹出导入Excel的窗口
    showLeadDialog(act) {
      this.isBlockClick = false
      this.act = act;
      this.customizeVisible = true;
    },

    onAction(act) {
      //绑定视图的处理事件
      let activityType = act.type;
      switch (act.type) {
        case 1: //载入视图
          this.runBeforeAction(act);
          break;
        case 2: //创建
          this.isBlockClick = true
          let formId = this.view.relatedForm
          this.$api.hasPermissionToForm(this.openParams.appId, formId, {
            onSucess: (res) => {
              if (res.data.data) {
                this.runBeforeAction(act)
              }else {
                this.isBlockClick = false
                this.$message({
                  message: this.$t('msg.refuse'),
                  type: "warning",
                })
              }
            }
          })
          break;
        case 3: //删除
          this.doRemove(act);
          break;
        case 5: //流程处理
          this.$parent.flowHandle();
          break;
        case 8: //关闭窗口
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 10: //返回
          this.doBack();
          break;
        case 11: //保存并返回
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 14: //网页打印(表单)
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 15: //网页打印含历史
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 16: //导出excel
          this.isShowProgress = false
          this.exportProgress = 0
          this.runBeforeAction(act);
          break;
        case 18: //清空所有数据
          this.clearDataPopup(act) 
          break;
        case 20: //批量提交
          this.showSubmitPanel(act);
          break;
        case 25: //PDF导出
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 26: //文件下载
          this.runBeforeAction(act);
          break;
        case 27: //导入excel
          this.showLeadDialog(act);
          break;
        case 28: //电子签章
          break;
        case 29: //批量签章
          this.pdfsignatures(act);
          break;
        case 34: //保存
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 36: //网页打印(视图)
          this.runBeforeAction(act);
          break;
        case 37: //邮件短信分享
          break;
        case 42: //保存并新建
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 43: //跳转
          this.runBeforeAction(act);
          break;
        case 46: //签章
          break;
        default:
          break;
      }
    },

    pdfsignatures(act){
      this.isBlockClick = false
      let cd = this.currentDocIds;
      let appId = this.openParams.appId;
      if(cd.length <= 0) {
        this.$message({
          message:this.$t('msg.least_one_data'),
          type: 'warning'
        });
      }else {
        this.$api.getPdfsignatures(
          appId,
          cd,
          {
            onSucess: res => {
              this.signatureData = res.data.data;
              this.signatureDialog = true;
            }
          }
        )
      }
    },

    //获取子组件的选中的数据
    selectNum(val) {
      this.checkedNum = val.length
      // 已选中的视图列表
      this.viewTableData.datas = val
      if (val.length > 0 && val[0] != undefined) {
          let select = "";
          for (let i = 0; i < val.length; i++) {
            select += val[i].docId + ";";
          }
          let params = {
            linkType: "00",
            appId: this.openParams.appId,
            actionContent: val[0].formId,
            _select: select,
            viewId: this.view.id,
          };
          
          this.$emit("updateViewData", params, val);
        }else{
          this.$emit("updateViewData", [], val);
        }
    },
  

    gridviewTem(act){
      this.getTemplate(act);
    },

    clearViewSelect(){     
      let openParams = this.openParams;
      let formId = openParams.actionContent;
        if(this.view.displayType && this.view.displayType == "templateForm") { //判断是模板表单还是数据源表单
          formId = this.view.templateForm;
        }
        let params = {
          linkType: "00",
          appId: openParams.appId,
          actionContent: formId, //row.formId,
          _select: '',
          viewId: this.view.id,
          parentId: openParams.parentId ? openParams.parentId : "", //包含元素时判断是否有parentId
          isRelate: openParams.isRelate ? openParams.isRelate : "", //包含元素时判断isRelate是否为true
          templateForm: this.view.templateForm ? this.view.templateForm : "",//模板表单携带的formId
        };
        let isRadio = true;
        this.$emit("updateViewData", params, [], isRadio);
    },

    /**
     * 显示已选择的列表
     */
    showCheckedList() {
      this.checkedListDialog = true
    },

    /**
     * 接受view_listview传递table的column
     */
    getViewTableColumns(val){
      let tempColumns = []
      let columnObj = {}
      for(let k in val){
        columnObj = {
          prop: k,
          label: val[k].name,//字段名
		      columnName: val[k].columnName,//列名称
        }
        tempColumns.push(columnObj)
      }
      this.viewTableData.columns = tempColumns
    },
      /**
     * 接受view_cardview的下一层级出现返回按钮的标志
     */
    cardBackSign(val){ 
      this.cardBack=val;
    },
    returnPrevious(val){//点击返回触发的事件 重新加载上一次的数据 （可以保留在父节点的数据 在层数高的时候可以使用多层在浏览器缓存太多不合算）
      this.$refs.delegate.returnPrevious()
      // if(val){
      //  this.cardBack=false; 
      // }
      // else{
      // //  this.$refs.view_cardview.
      // }
    },
    // handleSelectionChange(val) {//参考列表视图把数据传回去  2个问题能不能正确回显和显示参数
    //   //将长度传回去
    //   // this.$emit('selectNum',val)
    //   if (this.isView) {
    //     //视图选择框
    //     if (val.length > 0 && val[0] != undefined) {
    //       let select = "";
    //       for (let i = 0; i < val.length; i++) {
    //         select += val[i].docId + ";";
    //       }
    //       let params = {
    //         linkType: "00",
    //         appId: this.openParams.appId,
    //         actionContent: val[0].formId,
    //         _select: select,
    //         viewId: this.view.id,
    //       };
    //       this.$emit("updateViewData", params, val);
    //     }else{
    //       this.$emit("updateViewData", [], val);
    //     }
    //   } else {
    //     let docIds = []
    //     let hasChildren = ""
    //     if (val.length > 0) {
    //       for (let i = 0; i < val.length; i++) {
    //         docIds.push(val[i].docId);
    //         if (val[i].children) {
    //           hasChildren = true
    //         }
    //       }
    //     } else {
    //       docIds = []
    //     }

    //     let sy = this.showtype

    //     if(sy == 'include' || sy == 'tab') { //如果是包含元素或者tab页，获取的docId传到最上层表单
    //       this.setListViewDocIds(docIds)
    //     }

    //     this.$emit("getDocIds", docIds, hasChildren);
    //   }
    // },
  },
  
  computed: {
    viewType() {
      //let type = "view_emptyview";
      let type = '';
      if (this.view) {
        switch (this.view.simpleClassName) {
          case "CollapsibleView": //折叠视图
          if(this.view.collapsibleShowMode == "card"){
            type="view_cardview";
          }
          else{
             type = "view_collapsibleview";
          }
           
            break;
          case "CalendarView": //日历视图
            type = "view_calendarview";
            break;
          case "TreeView": //树形视图
            type = "view_treeview";
            break;
          case "MapView": //地图视图
            type = "view_mapview";
            break;
          case "GanttView": //甘特视图
            type = "view_gantt";
            break;
          case "ListView": //列表视图
            if (this.view.openType == 288) {
        
              //网格打开
              type = "view_gridview";
            } else {
              //正常打开
              type = "view_listview";
            }
            break;
          default:
        }
      }
      return type;
    },

    listenIncludeViewUpdate() {
      return this.$store.state.includeViewId;
    },
  },
};
</script>

<style lang="scss">
  .notify-success .el-notification__title {
    color: red;
  }
  .notify-success .el-icon-success {
    color: red;
  }
</style>