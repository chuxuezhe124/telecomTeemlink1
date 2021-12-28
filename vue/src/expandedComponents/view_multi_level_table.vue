<template>
  <div class="my-table" style="width:100%">
    <el-table 
      :data="tableData"
      :cell-style="{textAlign:'center'}"
      :header-cell-style="{textAlign: 'center'}"
      @selection-change="handleSelectionChange"
      @row-click="onRowClick"
    >
      <el-table-column
        style="view-checkedAll"
        v-if="mutil || selectOne || !isView"
        type="selection"
        v-model="checkedAll"
        width="55"
        :selectable="selectInit"
        fixed="left"
      ></el-table-column>
      <view-multi-column
        v-for="(item,index) in multiLevelColumnData" 
        :key="index" 
        :column="item">
      </view-multi-column>
    </el-table>
  </div>
</template>

<script>
  import viewMultiColumn from './view_multi_level_column.vue'
  export default {
    components: {
      viewMultiColumn
    },
    props: {
      multiLevelColumnData: {
        type: Array
      },
      tableData: {
        type: Array
      },
      "mutil": Boolean, //视图选择框多选
      "selectOne": Boolean, //视图选择框多选
      "isView": Boolean, //判断是否是视图选择框
    },
    data() {
      return {
        checkedAll: [],
        // tableData: [] 
      }
    },
    mounted(){
      this.getList()
    },
    methods: {
      onRowClick(row){
        this.$emit("rowClick",row)
      },
      handleSelectionChange(val){
        this.$emit("selectionChange",val)
      },
      selectInit(row, index) {
        if (row.isSum) {
          return false;
        } else {
          return true;
        }
      },
      getList() {
        // let temList = '{"errcode":0,"errmsg":"ok","data":{"id":"__DCXi9OnT8kJYOr9AaDi","uri":"/trunk功能示例.application/mzj.module/多级表头.view/多级表头.view","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/多级表头.view","name":"多级表头","pagination":true,"pageLines":"10","showTotalRow":true,"refresh":false,"refreshAll":false,"newPage":false,"lastModifyTime":1631773407000,"readonly":false,"displayType":"relatedForm","defaultShowMode":"month","collapsibleShowMode":"normal","showWaterMark":false,"showActivityColumnType":0,"editAble":true,"readAble":true,"columns":[{"id":"__AzeyQjbFkP8QmHPxJjR","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__单12.column/AA__单12.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__单12.column/AA__单12.column","name":"AA__单12","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单12","fieldId":"__9nl1Cig7AQamDJJc5j6","flowReturnCss":false,"orderno":0,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false},{"id":"__xo3gqU4uoPn1SQjfTyp","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单13.column/AA__BB__单13.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单13.column/AA__BB__单13.column","name":"AA__BB__单13","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单13","fieldId":"__pTgo6A8dgVuGOfvE5dF","flowReturnCss":false,"orderno":1,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false},{"id":"__KkrzyCRMupTkF8YOJdP","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单14.column/AA__BB__单14.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单14.column/AA__BB__单14.column","name":"AA__BB__单14","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单14","fieldId":"__f3qX4jm3fmTknpn1dgB","flowReturnCss":false,"orderno":2,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false},{"id":"__mNSF9ZBk7Xeh8tI4IPf","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单15.column/AA__BB__单15.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__BB__单15.column/AA__BB__单15.column","name":"AA__BB__单15","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单15","fieldId":"__TlhH4CVjEVOOZKwWF45","flowReturnCss":false,"orderno":3,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false},{"id":"__fYQeGt3XqW6xkzkH7sW","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__CC__单16.column/AA__CC__单16.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__CC__单16.column/AA__CC__单16.column","name":"AA__CC__单16","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单16","fieldId":"__WKIqB6xGcpyqo6HSyoH","flowReturnCss":false,"orderno":4,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false},{"id":"__wwZy8BJTNwD55IlZYvb","uri":"/trunk功能示例.application/mzj.module/多级表头.view/AA__CC__单234.column/AA__CC__单234.column","fileUrl":"file:///D:/myapps43trunk/obpm434/obpm-demo/workspace/trunk功能示例.application/mzj.module/多级表头.view/AA__CC__单234.column/AA__CC__单234.column","name":"AA__CC__单234","width":"180","parentView":"__DCXi9OnT8kJYOr9AaDi","type":"COLUMN_TYPE_FIELD","formid":"__0K8KZfsfeNRpdjlvTUZ","fieldName":"单234","fieldId":"__f4P0gt6s3kk1Yc2GTTa","flowReturnCss":false,"orderno":5,"sum":false,"total":false,"isOrderByField":"false","orderType":"ASC","columnField":"InputField","clickSorting":true,"sortStandard":"00","formatType":"simple","decimalsNum":"1","thouSign":false,"decimalsCurr":"1","currType":"zh_CN","color":"rgba(0, 0, 0, 1)","fontSize":"12","groundColor":"rgba(255, 255, 255, 0)","showIcon":false,"buttonType":"00","visible":true,"visible4ExpExcel":true,"visible4Print":true,"visible4PagePrint":true,"showType":"01","showMoon":false,"showAsLabel":false,"showAsButton":false,"displayType":"00","showTitle":true,"hiddenColumn":false}],"autoCompose":false,"relatedForm":"__0K8KZfsfeNRpdjlvTUZ","permissionType":"public","filterCondition":"[]","commonFilterCondition":"[]","authorityCondition":"[]","openType":1,"activities":[{"id":"__476t63Ikdy9umAS3q8C","uri":"/trunk功能示例.application/mzj.module/多级表头.view/新建.activity/新建.activity","name":"新建","type":2,"onActionForm":"__0K8KZfsfeNRpdjlvTUZ","readonly":false,"editMode":0,"orderno":0,"parentView":"__DCXi9OnT8kJYOr9AaDi","jumpType":0,"expSub":false,"disableFlowNode":false,"changeFlowOperator":false,"changeFlowCc":false,"dispatcherMode":0,"jumpMode":0,"jumpActOpenType":0,"withOld":false,"actionType":0,"actionSelection":0,"workFlowType":0,"contextMenu":false,"showInToolbar":true,"parentFullName":"多级表头"},{"id":"__7ZI3oRs8Tq2qxkXDeHn","uri":"/trunk功能示例.application/mzj.module/多级表头.view/删除.activity/删除.activity","name":"删除","type":3,"readonly":false,"editMode":0,"orderno":1,"parentView":"__DCXi9OnT8kJYOr9AaDi","jumpType":0,"expSub":false,"disableFlowNode":false,"changeFlowOperator":false,"changeFlowCc":false,"dispatcherMode":0,"jumpMode":0,"jumpActOpenType":0,"withOld":false,"actionType":0,"actionSelection":0,"workFlowType":0,"contextMenu":false,"showInToolbar":true,"parentFullName":"多级表头"}],"editMode":"00","width":0,"height":0,"fullName":"多级表头","intValue":1,"sum":false,"clickSortingFieldArr":["ITEM_单12 ASC00","ITEM_单13 ASC00","ITEM_单14 ASC00","ITEM_单15 ASC00","ITEM_单16 ASC00","ITEM_单234 ASC00"],"simpleClassName":"ListView"}}'
        // let viewList   = '{"errcode":0,"errmsg":"ok","data":{"page_lines":10,"data":[{"formId":"__0K8KZfsfeNRpdjlvTUZ","parentName":"","formName":"多级表头","isRunningBack":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","items":{"__KkrzyCRMupTkF8YOJdP":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单14","value":"3","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单14","width":"","divId":"__f3qX4jm3fmTknpn1dgB","columnName":"AA__BB__单14"},"__AzeyQjbFkP8QmHPxJjR":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单12","value":"1","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单12","width":"","divId":"__9nl1Cig7AQamDJJc5j6","columnName":"AA__单12"},"__xo3gqU4uoPn1SQjfTyp":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单13","value":"2","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单13","width":"","divId":"__pTgo6A8dgVuGOfvE5dF","columnName":"AA__BB__单13"},"__wwZy8BJTNwD55IlZYvb":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单234","value":"6","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单234","width":"","divId":"__f4P0gt6s3kk1Yc2GTTa","columnName":"AA__CC__单234"},"__mNSF9ZBk7Xeh8tI4IPf":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单15","value":"4","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单15","width":"","divId":"__TlhH4CVjEVOOZKwWF45","columnName":"AA__BB__单15"},"__fYQeGt3XqW6xkzkH7sW":{"borderType":false,"docId":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"TgMc6QVjACKomzdij1M--__0K8KZfsfeNRpdjlvTUZ_单16","value":"5","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单16","width":"","divId":"__WKIqB6xGcpyqo6HSyoH","columnName":"AA__CC__单16"}}},{"formId":"__0K8KZfsfeNRpdjlvTUZ","parentName":"","formName":"多级表头","isRunningBack":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","items":{"__KkrzyCRMupTkF8YOJdP":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单14","value":"33","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单14","width":"","divId":"__f3qX4jm3fmTknpn1dgB","columnName":"AA__BB__单14"},"__AzeyQjbFkP8QmHPxJjR":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单12","value":"11","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单12","width":"","divId":"__9nl1Cig7AQamDJJc5j6","columnName":"AA__单12"},"__xo3gqU4uoPn1SQjfTyp":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单13","value":"22","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单13","width":"","divId":"__pTgo6A8dgVuGOfvE5dF","columnName":"AA__BB__单13"},"__wwZy8BJTNwD55IlZYvb":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单234","value":"66","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单234","width":"","divId":"__f4P0gt6s3kk1Yc2GTTa","columnName":"AA__CC__单234"},"__mNSF9ZBk7Xeh8tI4IPf":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单15","value":"44","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单15","width":"","divId":"__TlhH4CVjEVOOZKwWF45","columnName":"AA__BB__单15"},"__fYQeGt3XqW6xkzkH7sW":{"borderType":false,"docId":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ","hiddenValue":"","fieldtype":"VALUE_TYPE_VARCHAR","refreshMode":0,"cssClass":"input-cmd","numberPattern":"","instantValidate":false,"hideType":"parent","discript":"","layoutType":"horizontal","isHideType":false,"id":"xPl9P7JZLk8l8cQOo59--__0K8KZfsfeNRpdjlvTUZ_单16","value":"55","formId":"__0K8KZfsfeNRpdjlvTUZ","readOnlyShowValOnly":true,"fieldkeyevent":"Tabkey","mobile":true,"templateFromId":"","textType":"text","validateLibs":"","formField":"InputField","layout":"horizontal","refreshOnChanged":false,"displayType":2,"calculateOnRefresh":false,"name":"单16","width":"","divId":"__WKIqB6xGcpyqo6HSyoH","columnName":"AA__CC__单16"}}}],"page":1,"row_count":2}}'

        // let view = JSON.parse(temList).data
        // let docs = JSON.parse(viewList).data.data     
        // let listArr = [];
        // const loopOpe = columns => {
        //   let arr = []
        //   for(let i=0; i<columns.length; i++) {
        //     let name = columns[i].name
        //     if(name.indexOf("__") > -1) {
        //       let nArr = name.split("__")
        //       let t = nArr[0]
        //       let t2 = nArr.slice(1).join("__")
        //       let nobj = {
        //         id: t,
        //         name: t2,
        //         label: name,
        //         columns:columns[i],
        //         haveChildren: true,
        //       }
        //       arr.push(nobj)
        //     }else {
        //       let nobj = {
        //         id: name,
        //         name: name,
        //         label: name,
        //         columns:columns[i],
        //         haveChildren: false,
        //       }
        //       arr.push(nobj)
        //     }
        //   }
        //   arr.forEach((el) => {
        //     for (let i = 0; i < listArr.length; i++) {
        //       if (listArr[i].id == el.id) {
        //         listArr[i].children.push({
        //           name: el.name,
        //           label: el.label,
        //           columns:el.columns,
        //           id: el.name,
        //         });
        //         return;
        //       }
        //     }
        //     if(el.haveChildren) {
        //       listArr.push({
        //         id: el.id,
        //         children: [{
        //           id: el.name,
        //           name: el.name,
        //           label: el.label,
        //           columns:el.columns,
        //         }]
        //       })
        //     }else {
        //       listArr.push({
        //         id: el.id,
        //         label: el.label,
        //         columns:el.columns,
        //       })
        //     }
        //   })
        // }

        // if(view.columns && view.columns.length>0) {
        //   loopOpe(view.columns)
        // }

        // const loopOpe2 = (columns, index) => {
        //   let arr = []
        //   let lArr = []
        //   for(let i=0; i<columns.length; i++) {
        //     let name = columns[i].name
        //     if(name.indexOf("__") > -1) {
        //       let nArr = name.split("__")
        //       let t = nArr[0]
        //       let t2 = nArr.slice(1).join("__")
        //       let nobj = {
        //         id: t,
        //         name: t2,
        //         label: t2,
        //         columns: columns[i].columns,
        //         haveChildren: true,
        //       }
        //       arr.push(nobj)
        //     }else {
        //       let nobj = {
        //         id: name,
        //         name: name,
        //         label: name,
        //         columns: columns[i].columns,
        //         haveChildren: false,
        //       }
        //       arr.push(nobj)
        //     }
        //   }
        //   arr.forEach((el) => {
        //     for (let i = 0; i < lArr.length; i++) {
        //       if (lArr[i].id == el.id) {
        //         lArr[i].children.push({
        //           id:el.name,
        //           name: el.name,
        //           label: el.label,
        //           columns: el.columns,
        //         });
        //         return;
        //       }
        //     }
        //     if(el.haveChildren) {
        //       lArr.push({
        //         id: el.id,
        //         children: [{
        //           id:el.name,
        //           name: el.name,
        //           label: el.label,
        //           columns: el.columns,
        //         }]
        //       })
        //     }else {
        //       lArr.push({
        //         id: el.id,
        //         label: el.label,
        //         columns: el.columns,

        //       })
        //     }
        //   })
        //   listArr[index].children = lArr;
        // }

        // if(listArr && listArr.length>0) {
        //   listArr.forEach((el, index) => {
        //     if(el.children && el.children.length > 0) {
        //       loopOpe2(el.children, index)
        //     }
        //   });
        // }

        // let tds = [];
        // if (docs){
        //   docs.forEach((doc) => {
        //     let rows = {};
        //     rows.formId = doc.formId;
        //     rows.docId = doc.id;
        //     rows.children = doc.children;
        //     rows.isRunningBack = doc.isRunningBack;
        //     rows.id = new Date().getTime() + Math.random()*1000;
        //     for (var key in doc.items) {
        //       let items = doc.items[key];
        //       rows[key] = items.value;
        //     }
        //     tds.push(rows);
        //   });
        //   this.tableData = tds;
        // }
        // this.col = listArr
      
      }
    }
  }
</script>
