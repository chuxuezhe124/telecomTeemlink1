<template>
  <div class="calendar-view">
    <div class="calendar-act-btns">
      <div class="usual-btns">
        <activity 
          v-for="(activity,index) in view.activities" 
          :key="index" 
          :info="activity"
          @action="onActionChild" 
        />
      </div>
      <div class="drop-down-box">
        <el-select 
          v-model="currentTimeType"
          @change="onChange"
        >
          <el-option
            v-for="(item,index) in options"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="gantt-wrap">
      <el-scrollbar class="scrollbar">
        <div class="gantt-box">
          <table v-if="currentTimeType === 'month'" style="width:0;" class="gantt-tab table table-bordered table-hover listDataTable obpm-datatable" id="dataTable" >
            <thead>
                <tr class="listDataTh obpm-listdatath">
                  <th style="width: 40px">
                    <input name="ganttSelected" type="checkbox" @change="changeAllChecked()" class="ganttSelected" :checked="isSelectedAll"/>
                  </th>
                  <th style="width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{missionName}}
                  </th>
                  <th v-for="(item, index) in monthBetweenHeadNum" :key="index" style="width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{item}}
                  </th>
                </tr>
            </thead>
            <tbody>
              <tr v-for="(tr, inx) in documents" :key="inx" :id="'mycanvas' + inx" class="listDataTr obpm-listdatatr treeHead">
                <td style="width: 40px"><input type="checkbox" name="checkbox" :data-id="tr.id" :checked="checked"/></td>
                <td v-for="(column, index) in viewColumnsName.columns" :key="index" style="width:130px;" @click="handleClick(tr)">
                  <span v-if="column.mappingField == 'name'">
                    {{tr.items[column.id].value}}
                  </span>
                </td>
                <td 
                  v-for="item in monthBetweenNum" 
                  :key="item" 
                  style="width:130px; padding:11px 0"
                  @mouseover="mouseOver(inx, item)"
                  @mouseleave="mouseLeave"
                >
                <!-- v-if="currentTd === String(inx) + String(item)" -->
                  <div class="detail-data" v-if="currentTd === String(inx) + String(item)">
                    <div v-for="(column, i) in view.columns" :key="i">
                      <span v-if="column.mappingField == 'name'" class="title">
                        {{tr.items[column.id].value}}
                      </span>
                      <!-- <span class="content-box" v-else-if="column.mappingField == 'start' || column.mappingField == 'end'">
                        <span v-if="column.mappingField == 'start'" class="start">
                          {{$t('jobtime')}}：{{tr.items[column.id].value}}
                        </span>
                        <span v-if="column.mappingField == 'end'" class="end">
                          -{{tr.items[column.id].value}}
                        </span>
                      </span> --> 
                      <span class="complete" v-if="column.mappingField == 'start'">
                        {{$t('view.start_time')}}：{{tr.items[column.id].value}}
                      </span>
                      <span class="complete" v-if="column.mappingField == 'end'">
                        {{$t('view.end_time')}}：{{tr.items[column.id].value}}
                      </span>
                      <span v-else-if="column.mappingField == 'complete'" class="complete">
                        {{$t('completion')}}：{{tr.items[column.id].value | dataEscape}}
                      </span>
                      <span class="complete-second" v-else-if="(column.mappingField  == 'color' || column.mappingField  == 'description' || column.mappingField  == 'parent' || column.mappingField  == 'dependency' || column.mappingField  =='caption') && tr.items[column.id].value">
                        {{column.name}}：{{tr.items[column.id].value}}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-if="currentTimeType === 'year'" class="gantt-tab table table-bordered table-hover listDataTable obpm-datatable" id="dataTable2">
            <thead>
                <tr class="listDataTh obpm-listdatath">
                  <th style="width: 40px"><input name="ganttSelected" type="checkbox" @change="changeAllChecked()" class="ganttSelected" :checked="isSelectedAll"/></th>
                  <th style="width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{missionName}}
                  </th>
                  <th v-for="(item, index) in yearBetweenHeadNum" :key="index" style="width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{item}}
                  </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(tr, inx) in documents" :key="inx" :id="'myYearCanvas' + inx" class="listDataTr obpm-listdatatr treeHead">
                  <td style="width: 40px"><input type="checkbox" name="checkbox" :data-id="tr.id" :checked="checked"/></td>
                  <td v-for="(column, index) in viewColumnsName.columns" :key="index" style="width:130px;" @click="handleClick(tr)">
                    <span v-if="column.mappingField == 'name'">
                      {{tr.items[column.id].value}}
                    </span>
                  </td>
                  <td 
                    v-for="item in yearBetweenNum" 
                    :key="item" 
                    style="width:130px; padding:11px 0"
                    @mouseover="mouseOver(inx, item)"
                    @mouseleave="mouseLeave"
                  >
                    <!-- v-if="currentTd === String(inx) + String(item)" -->
                    <div class="detail-data"  v-if="currentTd === String(inx) + String(item)">
                      <div v-for="(column, i) in view.columns" :key="i" >
                        <span v-if="column.mappingField == 'name'" class="title">
                          {{tr.items[column.id].value}}
                        </span>
                        <!-- <span class="content-box" v-else-if="column.mappingField == 'start' || column.mappingField == 'end'">
                          <span v-if="column.mappingField == 'start'" class="start">
                            {{$t('jobtime')}}：{{tr.items[column.id].value}}
                          </span>
                          <span v-else-if="column.mappingField == 'end'" class="end">
                            -{{tr.items[column.id].value}}
                          </span>
                        </span> -->
                        <span class="complete" v-if="column.mappingField == 'start'">
                          {{$t('view.start_time')}}：{{tr.items[column.id].value}}
                        </span>
                        <span class="complete" v-if="column.mappingField == 'end'">
                          {{$t('view.end_time')}}：{{tr.items[column.id].value}}
                        </span>
                        <span v-else-if="column.mappingField == 'complete'" class="complete">
                         {{$t('completion')}}：{{tr.items[column.id].value | dataEscape}}
                        </span>
                        <span class="complete-second" v-else-if="(column.mappingField  == 'color' || column.mappingField  == 'description' || column.mappingField  == 'parent' || column.mappingField  == 'dependency' || column.mappingField  =='caption') && tr.items[column.id].value">
                          {{column.name}}：{{tr.items[column.id].value}}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
            </tbody>
          </table>
          <table v-if="currentTimeType === 'day'" style="width:0;" class="gantt-tab gantt-tab table table-bordered table-hover listDataTable obpm-datatable" id="dataTable2">
            <thead>
                <tr class="listDataTh obpm-listdatath">
                  <th style="width: 40px"><input name="ganttSelected" type="checkbox" @change="changeAllChecked()" class="ganttSelected" :checked="isSelectedAll"/></th>
                  <th style="width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{missionName}}
                  </th>
                  <th v-for="(item, index) in dayBetweenHeadNum" :key="index" style="min-width:130px;" class="listDataThTd nowrap obpm-listdatath obpm-ganttData">
                    {{item}}
                  </th>
                </tr>
            </thead>
            <tbody>
              <tr v-for="(tr, inx) in documents" :key="inx" :id="'myDayCanvas' + inx" class="listDataTr obpm-listdatatr treeHead">
                <td style="width: 40px"><input type="checkbox" name="checkbox" :data-id="tr.id" :checked="checked"/></td>
                <td v-for="(column, index) in viewColumnsName.columns" :key="index" style="width:130px;" @click="handleClick(tr)">
                  <span v-if="column.mappingField == 'name'">
                    {{tr.items[column.id].value}}
                  </span>
                </td>
                <td 
                  v-for="item in dayBetweenNum" 
                  :key="item" 
                  style="width:130px; padding:11px 0;position: relative;"
                  @mouseover="mouseOver(inx, item)"
                  @mouseleave="mouseLeave"
                >
                  <div class="detail-data" v-if="currentTd == String(inx) + String(item)">
                    <div v-for="(column, i) in view.columns" :key="i" >
                      <span v-if="column.mappingField == 'name'" class="title">
                        {{tr.items[column.id].value}}
                      </span>
                      <!-- <span class="content-box" v-if="column.mappingField == 'start' || column.mappingField == 'end'">
                        <span v-if="column.mappingField == 'start'" class="start">
                          {{$t('jobtime')}}：{{tr.items[column.id].value}}
                        </span>
                        <span v-if="column.mappingField == 'end'" class="end">
                          -{{tr.items[column.id].value}}
                        </span>
                      </span> -->
                      <span class="complete" v-if="column.mappingField == 'start'">
                        {{$t('view.start_time')}}：{{tr.items[column.id].value}}
                      </span>
                      <span class="complete" v-if="column.mappingField == 'end'">
                        {{$t('view.end_time')}}：{{tr.items[column.id].value}}
                      </span>
                      <span v-if="column.mappingField == 'complete'" class="complete">
                        {{$t('completion')}}：{{tr.items[column.id].value | dataEscape}}
                      </span>
                      <span class="complete-second" v-else-if="(column.mappingField  == 'color' || column.mappingField  == 'description' || column.mappingField  == 'parent' || column.mappingField  == 'dependency' || column.mappingField  =='caption') && tr.items[column.id].value">
                        {{column.name}}：{{tr.items[column.id].value}}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import activity from "@/components/activity.vue";
export default {
  name: "view-gantt",
  props: [
    "view",
    "openParams",
    "showtype",
  ],
  components: {
    activity,
  },
  watch: {
    
  },
  computed: {
    
  },
  created(){
    let columns = this.view.columns;
    for(let i=0; i<columns.length; i++) {
      if(columns[i].mappingField == "name") {
        this.missionName = columns[i].fieldName;
        break
      }
    }
  },

  mounted() {
    this.getData();
  },

  data: function() {
    return {
      currentTd:'',
      tableData:[],
			documents:'',
			monthBetweenHeadNum: [],
			monthBetweenNum: [],
			viewColumnsName: [],
      currentTimeType: 'month',

      yearBetweenHeadNum: [],
      yearBetweenNum: [],

      dayBetweenHeadNum: [],
      dayBetweenNum: [],
      options: [{
        value: 'month',
        label: this.$t('view.month')
      }, {
        value: 'year',
        label: this.$t('view.year')
      }, {
        value: 'day',
        label: this.$t('view.day')
      }], 
      loadYearCanvas: true, // 是否重复加载年的canvas
      loadDayCanvas: true, // 是否重复加载天的canvas
      checked: false,     //初始化不选中
      missionName:'',
      isSelectedAll: false,
    };
  },

  methods: {
    /**
     * 点击任务名称下的td
     */
    handleClick(row){
      let openParams = this.openParams;
      let view = this.view;
      let params = {
        linkType: "00",
        name: view.name,
        appId: openParams.appId,
        actionContent: row.formId,
        _select: row.id,
        viewId: view.id,
        parentId: openParams.parentId ? openParams.parentId:'',  //包含元素时判断是否有parentId
        isRelate: openParams.isRelate ? openParams.isRelate:'',  //包含元素时判断isRelate是否为true
        templateForm: view.templateForm ? view.templateForm:'',
        refreshId: openParams.id,  //判断是否得刷新
      };
      this.$emit("add-tab", params)
    },
    
    mouseOver(inx, item) {
      this.currentTd = String(inx) + String(item);
    },
    // 移出
    mouseLeave() {
      this.currentTd = '';
    },

    getData(page, size, searchData, selectType) {
      this.getViewData(page, size,searchData).then(response => {
        let docs = response.data.data;
        this.documents = response.data.data;
        this.row_count = response.data.row_count;
        let viewColumns = JSON.parse(JSON.stringify(this.view));
        for(let i=0; i<viewColumns.columns.length; i++) {
          if(viewColumns.columns[i].mappingField === 'name' || viewColumns.columns[i].mappingField === 'start' || viewColumns.columns[i].mappingField === 'end' || viewColumns.columns[i].mappingField === 'color') {
            continue;
          }else {
            viewColumns.columns.splice(i, 1);
            i--;
          }
				}
				
				let viewColumnsName = JSON.parse(JSON.stringify(viewColumns)); 
				for(let i=0; i<viewColumnsName.columns.length; i++) {
          if(viewColumnsName.columns[i].mappingField === 'name') {
            continue;
          }else {
            viewColumnsName.columns.splice(i, 1);
            i--;
          }
				}
				this.viewColumnsName = viewColumnsName;
        let missionName = '';
        let startTime = [];
        let endTime = [];
        if (docs) {
          docs.forEach((doc, index) => {
            for (let key in doc.items) {
              viewColumns.columns.forEach(column => {
                if(column.mappingField === 'name' && key === column.id) {
                  missionName = column.name;
                }else if(column.mappingField === 'start' && key === column.id) {
                  if(doc.items[key].value){
                    startTime.push(doc.items[key].value);
                  }
                }else if(column.mappingField === 'end' && key === column.id) {
                  if(doc.items[key].value){
                    endTime.push(doc.items[key].value);
                  }
                  
                }
              })
            }
          });
        }
        let maxTime = endTime[0];
        for(let i=1; i<endTime.length; i++){ 
          if(maxTime < endTime[i]){
            maxTime = endTime[i];
          }
        }

        let minTime = startTime[0];
        for(let i=1; i<startTime.length; i++){ 
          if(minTime > startTime[i]){
            minTime = startTime[i];
          }
        }
        console.log("maxTime-->",maxTime,minTime)
        let monthBetweenNum = this.getMonthBetween(minTime, maxTime);

				this.monthBetweenHeadNum = JSON.parse(JSON.stringify(monthBetweenNum));
				// this.monthBetweenHeadNum.unshift(missionName);
        this.monthBetweenNum = monthBetweenNum;
				this.$nextTick(() => {
          this.getCanvas();
          if(selectType) {
            this.loadDayCanvas = true;
            this.loadYearCanvas = true;
            this.onChange(selectType)
          }
				})
      });
		},
    
    //获取两个日期的相隔的月份
    getMonthBetween(start, end, isNum){  
      var result = [];
      var starts = start.split('-');
      var ends = end.split('-');
      var staYear = starts[0]*1;
      var staMon = starts[1]*1 < 10? starts[1]:starts[1];
      var endYear = ends[0]*1;
      var endMon = ends[1]*1 < 10? ends[1]:ends[1];;
      result.push(staYear+'-'+staMon);
      while (staYear <= endYear) {
          if (staYear === endYear) {
              while (staMon < endMon) {
                  staMon++;
                  if(staMon < 10){
                    result.push(staYear+'-0'+staMon);
                  }else{
                    result.push(staYear+'-'+staMon);
                  }
              }
              staYear++;
          } else {
              staMon++;
              if (staMon > 12) {
                  staMon = 1;
                  staYear++;
              }
              if(staMon < 10){
                result.push(staYear+'-0'+staMon);
              }else{
                result.push(staYear+'-'+staMon);
              }
          }
      }
      if(isNum) {
        return result.length - 1;
      }else {
        return result;
      }
    },
    
    //模拟数据请求
    getViewData(page, size, searchData) {
      let startDate = "";
      let endDate =  "";
      let treeData = "";
      let treeName = "";
      return new Promise(resolve => {
        this.$api.getViewData(
          //普通视图接口
          this.openParams.appId,
          this.view.id,
          {
            parentId: this.parentId ? this.parentId : "",
            currpage: 1,
            lines: 1000,
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
    },

    onChange(ev) {
      //切换甘特日期时，将全选取消
      this.checked = false;
      const obj = document.getElementsByName("ganttSelected")
      obj.forEach(item => {
        item.checked = false;
      })
      if(ev === 'year' && this.loadYearCanvas) {
        this.loadYearCanvas = false
        let docs = this.documents ;
        let viewColumns = this.view;
        let missionName = '';
        let startTime = [];
        let endTime = [];
        if (docs) {
          docs.forEach((doc, index) => {
            for (let key in doc.items) {
              viewColumns.columns.forEach(column => {
                if(column.mappingField === 'name' && key === column.id) {
                  missionName = column.name;
                }else if(column.mappingField === 'start' && key === column.id) {
                  if(doc.items[key].value) {
                    startTime.push(doc.items[key].value);
                  }
                }else if(column.mappingField === 'end' && key === column.id) {
                  if(doc.items[key].value) {
                    endTime.push(doc.items[key].value);
                  }
                }
              })
            }
          });
        }
        let maxTime = endTime[0];
        for(let i=1; i<endTime.length; i++){ 
          if(maxTime < endTime[i]){
            maxTime = endTime[i];
          }
        }

        let minTime = startTime[0];
        for(let i=1; i<startTime.length; i++){ 
          if(minTime > startTime[i]){
            minTime = startTime[i];
          }
        }

        let differenceYear = parseInt(maxTime.split('-')[0]) - parseInt(minTime.split('-')[0]);
        let arr = [];
        let startYear = parseInt(minTime.split('-')[0]);
        let endYear = parseInt(maxTime.split('-')[0]);
        let num = 0;
        if(differenceYear > 1) {
          while(differenceYear > 1) {
            num = num + 1;
            let newY = startYear + num;
            arr.push(newY);
            differenceYear--;
          }
          arr.unshift(startYear);
          arr.push(endYear);
          this.yearBetweenNum = arr;
          let yearBetweenHeadNum = [];
          yearBetweenHeadNum = JSON.parse(JSON.stringify(arr));
          // yearBetweenHeadNum.unshift(missionName);
          this.yearBetweenHeadNum = yearBetweenHeadNum;
          this.$nextTick(() => {
            this.getYearCanvas();
          })
          
        }else if(differenceYear == 1) {
          arr.unshift(startYear);
          arr.push(endYear);
          this.yearBetweenNum = arr;
          let yearBetweenHeadNum = [];
          yearBetweenHeadNum = JSON.parse(JSON.stringify(arr));
          // yearBetweenHeadNum.unshift(missionName);
          this.yearBetweenHeadNum = yearBetweenHeadNum;
          this.$nextTick(() => {
            this.getYearCanvas();
          })
        }else if(differenceYear === 0) {
          arr.unshift(startYear);
          this.yearBetweenNum = arr;
          let yearBetweenHeadNum = [];
          yearBetweenHeadNum = JSON.parse(JSON.stringify(arr));
          // yearBetweenHeadNum.unshift(missionName);
          this.yearBetweenHeadNum = yearBetweenHeadNum;
          this.$nextTick(() => {
            this.getYearCanvas();
          })
        }
      }else if(ev === 'day' && this.loadDayCanvas) {
        this.loadDayCanvas = false
        let docs = this.documents ;
        let viewColumns = this.view;
        let missionName = '';
        let startTime = [];
        let endTime = [];
        if (docs) {
          docs.forEach((doc) => {
            for (let key in doc.items) {
              viewColumns.columns.forEach(column => {
                if(column.mappingField === 'name' && key === column.id) {
                  missionName = column.name;
                }else if(column.mappingField === 'start' && key === column.id) {
                  if(doc.items[key].value) {
                    startTime.push(doc.items[key].value);
                  }
                }else if(column.mappingField === 'end' && key === column.id) {
                  if(doc.items[key].value) {
                    endTime.push(doc.items[key].value);
                  }
                }
              })
            }
          });
        }

        let maxTime = endTime[0];
        for(let i=1; i<endTime.length; i++){ 
          if(maxTime < endTime[i]){
            maxTime = endTime[i];
          }
        }

        let minTime = startTime[0];
        for(let i=1; i<startTime.length; i++){ 
          if(minTime > startTime[i]){
            minTime = startTime[i];
          }
        }
        let dayBetweenNum = this.getDateBetween(minTime, maxTime);

        this.dayBetweenNum  = dayBetweenNum;
        let dayBetweenHeadNum = [];
        dayBetweenHeadNum = JSON.parse(JSON.stringify(dayBetweenNum));
        // dayBetweenHeadNum.unshift(missionName);
        this.dayBetweenHeadNum = dayBetweenHeadNum;
        this.$nextTick(() => {
          this.getdayCanvas()
        })
      }else {
        this.getData();
      }
      // this.loadYearCanvas = true
      // this.loadDayCanvas = true

      // 取消所有选中的checkbox
      let allCheckBox = document.getElementsByName('checkbox')
      for (var i = 0; i < allCheckBox.length; i++) {
        allCheckBox[i].checked = false;
      }
    },

    //全选
    changeAllChecked(val){
      let isChecked = this.checked;
      if(isChecked){
        this.checked = false;
      }else{
        this.checked = true;
      }
    },

    reloadListView(){
      let type = this.currentTimeType;
      let c = document.getElementsByTagName("canvas");
      for(let i = 0; i<c.length; i++) {
        c[i].remove();
        i--;
      }
      this.getData('', '', '', this.currentTimeType);
    },

    //年canvas
    getYearCanvas(){
      let startTime = this.yearBetweenNum[0];
      for(let i=0; i<this.documents.length; i++) {
        let viewColumns = this.view;
        let doc = this.documents[i];
        let yearBetween = [];
        let missionName = '';
        let ganttColor = '';
        for (let key in doc.items) {
          viewColumns.columns.forEach(column => {
            if(column.mappingField === 'name' && key === column.id) {
              missionName = doc.items[key].value;
            }else if(column.mappingField === 'start' && key === column.id) {
              yearBetween.unshift(doc.items[key].value);
            }else if(column.mappingField === 'end' && key === column.id) {
              yearBetween.push(doc.items[key].value);
            }else if(column.mappingField === "color" && key === column.id) {
              if(doc.items[key].value) {
                ganttColor = doc.items[key].value;
              }else {
                // ganttColor = '#C5E0B3';
                ganttColor = '#B4C6E7';
              }
            }
          })
        }
        
        if(!yearBetween[0] || !yearBetween[1]) {
          continue
        }

        let sY = parseInt(yearBetween[0].split("-")[0]);
        let eY = parseInt(yearBetween[1].split("-")[0]);

        let startYM = yearBetween[0].split('-');
        let sDay = new Date(startYM[0],startYM[1],0);
        let startDays = sDay.getDate(); //结束月的天数
        let sD = startDays - parseInt(yearBetween[0].split("-")[2]);

        let endYM = yearBetween[1].split('-');
        let eDay = new Date(endYM[0],endYM[1],0);
        let endDays = eDay.getDate(); //结束月的天数
        let eD = endDays - parseInt(yearBetween[1].split("-")[2]);
       
        let sYDays = '', //开始年份总天数 
            eYDays = ''; //结束年份总天数
        if(sY % 100 != 0 && sY % 4 == 0 || sY % 400 == 0){  //判断开始年份是否是闰年
          sYDays = 366;
        }else{
          sYDays = 365;
        }
        if(eY % 100 != 0 && eY % 4 == 0 || eY % 400 == 0){  //判断结束年份是否是闰年
          eYDays = 366;
        }else{
          eYDays = 355;
        }

        let sYM = parseInt(yearBetween[0].split("-")[1]), //开始年份年月月份 
            eYM = parseInt(yearBetween[1].split("-")[1]); //结束年份年月月份
        let SDaysArrive = this.getDayNumByYearMonth(sY, sYM); //开始年份到达的年月日总数
        let EDaysArrive = this.getDayNumByYearMonth(eY, eYM); //结束年份到达的年月日总数

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        // 设置线条的颜色
        let YBetween = this.yearBetweenHeadNum.length;
        let yearBetweenHeadNum = YBetween; //>= 2 ? YBetween -1 : YBetween;
        canvas.width = yearBetweenHeadNum * 130;
        canvas.height = 25;
        context.strokeStyle = ganttColor;//'#C5E0B3';
        // 设置线条的宽度
        context.lineWidth = 5;

        // 绘制直线
        context.beginPath();
        // 起点
        let toLeft = (sY - startTime) * 130 + Math.round( 130 / sYDays * SDaysArrive) - Math.round( 130 / sYDays * sD);
        let toRight = (eY - startTime) * 130 + Math.round( 130 / eYDays * EDaysArrive) - Math.round( 130 / eYDays * eD);
        context.moveTo(toLeft, 20);// 起点
        context.lineTo(toRight, 20);// 终点
        context.closePath();
        context.stroke();
        context.font = '12px "微软雅黑"'; 
        context.fillStyle = "#5A6779";
        context.fillText('',toLeft,12);
  
        // canvas.style.zIndex = 1;
        canvas.style.position = "absolute";
        canvas.style.bottom = "15px";
        // canvas.style.left = '40px';
        // canvas.style.marginTop = '8px';
        let val = document.getElementById('myYearCanvas' + i).children[2]
        val.appendChild(canvas);
        this.loadYearCanvas = true
      }
    },

     //月canvas
		getCanvas(){
      let startTime = this.monthBetweenNum[0];
      for(let i=0; i<this.documents.length; i++) {
        let viewColumns = this.view;
        let doc = this.documents[i];
        let monthBetween = []; //每行数据的开始日期和结束时间
        let missionName = '';
        let ganttColor = '';
        for (let key in doc.items) {
          viewColumns.columns.forEach(column => {
            if(column.mappingField === 'name' && key === column.id) {
              missionName = doc.items[key].value;
            }else if(column.mappingField === 'start' && key === column.id) {
              monthBetween.unshift(doc.items[key].value);
            }else if(column.mappingField === 'end' && key === column.id) {
              monthBetween.push(doc.items[key].value);
            }else if(column.mappingField === "color" && key === column.id) {
              if(doc.items[key].value) {
                ganttColor = doc.items[key].value;
              }else {
                ganttColor = '#B4C6E7';
              }
            }
          })
        }
        if(!monthBetween[0] || !monthBetween[1]) {
          continue
        }
        let isNum = true;
        let leftNumber = this.getMonthBetween(startTime, monthBetween[0], isNum);
        let rightNumber = this.getMonthBetween(startTime, monthBetween[1], isNum);
        
        let startYM = monthBetween[0].split('-');
        let sDay = new Date(startYM[0],startYM[1],0);
        let startDays = sDay.getDate(); //开始月的天数

        let endYM = monthBetween[1].split('-');
        let eDay = new Date(endYM[0],endYM[1],0);
        let endDays = eDay.getDate(); //结束月的天数

        let sCurrentDays = monthBetween[0].split('-')[2]; //开始的月份日
        let eCurrentDays = monthBetween[1].split('-')[2]; //结束的月份日

        let startDaysOwned = startDays - parseInt(sCurrentDays); //开始月的完整天数 - 数据返回所在的开始天数

        let endtDaysOwned = endDays - parseInt(eCurrentDays);  //结束的完整天数 - 数据返回所在的结束天数

        let tdLeftWidth = Number((130 - (130 / startDays) * startDaysOwned).toFixed(2)) + Number(130 * leftNumber);//;
        let tdRightWidth = 130 + Number(130 * rightNumber) - Number(((130 / endDays) * endtDaysOwned).toFixed(2));
        
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        // 设置线条的颜色
        // canvas.width = "700";
        canvas.width = this.monthBetweenHeadNum.length * 130 + 40;
        
        canvas.height = 25;
        context.strokeStyle = ganttColor; //'#B4C6E7';
        // 设置线条的宽度
        context.lineWidth = 5;

        // 绘制直线
        context.beginPath();
        // 起点

        let toLeft =  parseInt(tdLeftWidth);
        let toRight = parseInt(tdRightWidth);//130 - parseInt(Math.abs(tdRightWidth));
        // console.log("tdLeftWidth----->",tdLeftWidth);
        context.moveTo(toLeft, 20);// 起点
        context.lineTo(toRight, 20);// 终点
        context.closePath();
        context.stroke();
        context.font = '12px "微软雅黑"'; 
        context.fillStyle = "#5A6779";
        context.fillText('',toLeft,12);
        // canvas.id = "CursorLayer";
        // canvas.style.zIndex = 1;
        canvas.style.position = "absolute";
        canvas.style.bottom = "15px";
        // canvas.style.left = '40px';
        // canvas.style.marginTop = '8px';
        if(document.getElementById('mycanvas' + i)) {
          let val = document.getElementById('mycanvas' + i).children[2];
          val.appendChild(canvas);
        }
        
      }
    },

    //日canvas
    getdayCanvas() {
      let startTime = this.dayBetweenNum[0];
      let startYear = startTime;
      for(let i=0; i<this.documents.length; i++) {
        let viewColumns = this.view;
        let doc = this.documents[i];
        let dayBetween = [];
        let missionName = '';
        let ganttColor = '';
        for (let key in doc.items) {
          viewColumns.columns.forEach(column => {
            if(column.mappingField === 'name' && key === column.id) {
              missionName = doc.items[key].value;
            }else if(column.mappingField === 'start' && key === column.id) {
              dayBetween.unshift(doc.items[key].value);
            }else if(column.mappingField === 'end' && key === column.id) {
              dayBetween.push(doc.items[key].value);
            }else if(column.mappingField === "color" && key === column.id) {
              if(doc.items[key].value) {
                ganttColor = doc.items[key].value;
              }else {
                // ganttColor = '#FEE598';
                ganttColor = '#B4C6E7';
              }
            }
          })
        }
        // let sD = parseInt(dayBetween[0].split("-")[2]); //每条数据的开始天数
        // let eD = parseInt(dayBetween[1].split("-")[2]); //每条数据的结束天数
        if(!dayBetween[0] || !dayBetween[1]) {
          continue
        }
        let isNum = true;
        let SDaysArrive = this.getDateBetween(startTime, dayBetween[0], isNum); //开始年份到达的年月日总数
        let EDaysArrive = this.getDateBetween(startTime, dayBetween[1], isNum); //结束年份到达的年月日总数


        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        // 设置线条的颜色
        // canvas.width = "700";
        canvas.width = this.dayBetweenHeadNum.length * 130 + 10;
        canvas.height = 25;
        context.strokeStyle = ganttColor; //'#FEE598';
        // 设置线条的宽度
        context.lineWidth = 5;

        // 绘制直线
        context.beginPath();
        // 起点
        let toLeft =  ( SDaysArrive - 1 ) * 130;
        let toRight =  EDaysArrive * 130;
        context.moveTo(toLeft, 20);// 起点
        context.lineTo(toRight, 20);// 终点
        context.closePath();
        context.stroke();
        context.font = '12px "微软雅黑"'; 
        context.fillStyle = "#5A6779";
        context.fillText('',toLeft,12);
  
        // canvas.style.zIndex = 1;
        canvas.style.position = "absolute";
        canvas.style.bottom = "15px";
        // canvas.style.left = '40px';
        // canvas.style.marginTop = '8px';
        let val = document.getElementById('myDayCanvas' + i).children[2]
        val.appendChild(canvas);
        this.loadDayCanvas = true;
      }
    },

    //获取两个日期的相隔的天数
    getDateBetween(start,end, isNum){
      var result = [];
      //使用传入参数的时间
      var startTime = new Date(start);
      var endTime = new Date(end);
      while(endTime - startTime>=0 ) {
          let year = startTime.getFullYear();
          let month = startTime.getMonth().toString().length==1?"0"+(startTime.getMonth()+1).toString():startTime.getMonth()+1;
          let day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate();
          //加入数组
          month = month == '010'?'10':month;
          result.push(year+"-"+month+"-"+day);
          //更新日期
          startTime.setDate(startTime.getDate()+1);
      }
      if(isNum) {
        return result.length;
      }else {
        return result;
      }
      
    },

    getDayNumByYearMonth(year,month){
        let totalDays = 0; 
        for(let i=1; i<=month; i++) {
          if(i==1 || i==3 || i==5 || i==7 || i==8 || i==10 || i==12 ) {
            totalDays = totalDays + 31;
          }else if(i == 4 || i==6 || i==9 || i==11) {
            totalDays = totalDays + 30;
          }else if(i == 2) {
            if(this.isLeapYear(year)) {
              totalDays = totalDays + 29;
            }else {
              totalDays = totalDays + 28;
            }
          }
        }
        return totalDays;
    },

    isLeapYear(year) {
        if(year % 100 != 0 && year % 4 == 0 || year % 400 == 0){  //判断开始年份是否是闰年
          return 29;
        }else{
          return 28;
        }
    },

    getExcelParams() {
      if (this.searchExcelData) {
        return this.searchExcelData;
      } else {
        return "";
      }
    },

    onActionChild(act){
      switch (act.type) {
        case 1: //载入视图
          this.$parent.onAction(act);
          break;
        case 2: //创建
          this.$parent.onAction(act);
          break;
        case 3: //删除
          this.doRemove(act);
          break;
        case 16: //导出excel
          this.$parent.onAction(act);
          break;
        case 27: //导入excel
          this.$parent.onAction(act);
          break;
        default:
          break;
      }
    },


    doRemove(act) {
      const obj = document.getElementsByName("checkbox")
      let check_val = []
      for (let k in obj) {
        if (obj[k].checked)
        check_val.push(obj[k].dataset.id);
      }
      let docIds = check_val;
      if(docIds && docIds.length > 0) {
        this.$confirm(this.$t('msg.del_select')+`${docIds.length}`+this.$t('msg.data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          this.$parent.runBeforeAction(act, docIds);
        }).catch(() => {
                  
        });
      }else {
        this.$confirm(this.$t('placeholder.least_one_data'), this.$t('tip'), {
          confirmButtonText: this.$t('msg.confirm'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => { 
          
        }).catch(() => {
                  
        });
      }
    },
  },

  filters: {
    formDate: function(value) {
      let val = value.split("-");
      return val[2];
    },
    dataEscape: function(value) {
      let val = value.replace("&#37;", "%");
      return val;
    },
    
  }
};
</script>