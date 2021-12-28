<template>
  <div class="calendar-view" ref="calendarView" :id="'view_'+view.id">
    <div v-if="showtype=='home'" class="calendar-widget">
      <div class="calendar-wrap">
        <div class="cal-type">
          <div class="date">
            <span @click="prevTime(currentActive)"></span>
            <span>
              <div>
                {{currentDate}}
              </div>
            </span>
            <span @click="nextTime(currentActive)"></span>
          </div>
        </div>
        <div class="cal-box">
          <div class="mon-view-widget">
            <el-scrollbar class="scrollbar">
              <table cellspacing="0" cellpadding="0" style="width:100%">
                <thead>
                  <tr>
                    <td 
                      style="width:calc(100% / 7);"
                      width="1" 
                      v-for="(weekDay, index) in weekDays" 
                      :key="index">
                      {{weekDay}}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in monthRow" :key="i" height="70">
                    <td v-for="(list, index) in monthDateList[i]" :key="index" class="t-body-td">
                      <div class="td-box">
                        <div class="td-date">
                          {{list.date | formDate}}
                        </div>
                        <div style="cursor: pointer;text-align: left" class="monthdatabox" :id="'date-monthdatabox' + i + index">
                          <div v-for="(tr, inx) in documents" :key="inx" class="content-box">
                            <span v-if="tr.items[periodColumn.id].value == list.date" class="div-child-list" >
                              <span v-for="(item, ind) in tr.items" :key="ind">
                                <span v-if="tr.showItemValue && (tr.showItemValue.indexOf(item.name)>=0 || tr.showItemValue.indexOf(item.discript)>=0)" id="date-content-box" @click="onRowClick">
                                  <!-- 首页widget，不要把值释放出来 -->
                                  <!-- {{item.value}} --> 
                                </span>
                              </span>
                            </span>
                          </div>
                          <span 
                            style="display:none;"
                            class="total"
                            :id="'date-monthdatamore' + i + index"
                            @click.stop="seeDateMore(list.date)"
                          >
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="height:100%">
      <div class="calendar-act-btns" >
        <div class="usual-btns">
          <activity 
            v-for="(activity,index) in view.activities" 
            :key="index" 
            :info="activity"
            @action="onActionChild" 
          />
          <a
            class="btn btn-primary btn-type"
            style="background:#8ec9f6;color:white;"
            @click="onClick"
          >
            {{$t('view.list_display')}}
          </a>
        </div>
      </div>
      <!--列表显示-->
      <div v-if="showViewList" class="show-view">
        <el-scrollbar class="scrollbar">
          <el-table
            border
            min-height="270"
            ref="multipleTable"
            v-if="view.columns && view.columns.length>0"
            :header-cell-style="{background:'#F9F9F9',color:'#5A6779',textAlign: 'center'}"
            :cell-style="{textAlign:'center'}"
            header-align="center"
            :data="tableShowLists"
            style="width: 100%"
            @row-click="onRowClick"
            @selection-change="handleSelectionChange"
            :span-method="arraySpanMethod"
          >
            <el-table-column 
              type="selection" 
              v-model="checkedAll" 
              width="55"
            >
            </el-table-column>
            <template v-for="(column, index) in view.columns">
              <el-table-column
                :show-overflow-tooltip="true"
                :key="index"
                :prop="column.id"
                :label="column.name"
                :width="column.width"
                :sortable="column.isOrderByField=='true'?true:false"
                v-if="!column.hiddenColumn"
              >
                <template slot-scope="scope">
                  <!-- {{regReplace(scope.row[column.id])}} -->
                  <div
                    v-if="!scope.row.isInclude"
                    :style="{background:column.groundColor, color:column.color,fontSize:column.fontSize+'px'}"
                    :title="scope.row[column.showTitle?column.id:'']"	>
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
                        >{{currencyChange(scope.row[column.id], column.decimalsCurr,column.currType).substr(0,column.displayLength)}}</span>
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
                                :src="setDefaultIcon(column.iconMapping)"
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
                                <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                                <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                                  <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                  <div class="right">
                                    <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                    <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                  </div>
                                </div>
                              </span>
                              <span v-else>{{scope.row[column.id]}}</span>
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
                          {{column.iconMapping}}
                          <img
                            v-for="(item,index) in column.iconMapping"
                            :key="index"
                            width="32"
                            height="32"
                            :src="setDefaultIcon(item.value, true)"
                          />
                        </span>
                        <span v-else-if="column.icon">
                          <img 
                            width="32" 
                            height="32" 
                            :src="setDefaultIcon(column.icon, true)" />
                        </span>
                      </span>
                      <span v-else-if="column.type=='COLUMN_TYPE_OPERATE'">
                        <button
                          @click.stop.prevent="buttonClick(column, scope.row)"
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
                              <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                              <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                                <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                <div class="right">
                                  <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                  <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                </div>
                              </div>
                            </span>
                            <span v-else>{{regReplace(scope.row[column.id])}}</span>
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
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </el-scrollbar>
      </div>

      <div class="calendar-wrap" style="height:calc(100% - 91px);" v-else>
        <div class="cal-type">
          <div class="date">
            <span @click="prevTime(currentActive)">
              <i class="upperDataicon"></i>
            </span>
            <span>
              <div v-if="currentActive == 1">
                {{currentDate}}
              </div>
              <div  v-else-if="currentActive == 2">
                {{currentDate}}
              </div>
              <div  v-else-if="currentActive == 3">
                {{currentDate}}
              </div>
            </span>
            <span @click="nextTime(currentActive)">
              <i class="lowerDataicon"></i>
            </span>
          </div>
          <div class="view-type">
            <span :class="{date_active:currentActive==1?true:''}" @click="showView(1)">{{$t('day_view')}}</span>
            <span :class="{date_active:currentActive==2?true:''}" @click="showView(2)">{{$t('week_view')}}</span>
            <span :class="{date_active:currentActive==3?true:''}" @click="showView(3)">{{$t('month_view')}}</span>
          </div>
        </div>
        <div class="cal-box">
          <div class="day-view" v-if="currentActive == 1">
            <el-scrollbar class="scrollbar">
              <el-table
                border
                min-height="270"
                ref="multipleTable"
                v-if="view.columns && view.columns.length>0"
                :header-cell-style="{background:'#F9F9F9',color:'#5A6779',textAlign: 'center'}"
                :cell-style="{textAlign:'center'}"
                :data="tableData"
                style="width: 100%"
                @row-click="onRowClick"
                @selection-change="handleSelectionChange"
                :span-method="arraySpanMethod"
                v-loading="loading"
              >
                <template slot="empty">
                  <p>{{emptyData}}</p>
                </template>
                <el-table-column 
                  type="selection" 
                  v-model="checkedAll" 
                  width="55"
                >
                </el-table-column>
                <template v-for="(column, index) in view.columns">
                  <el-table-column
                    :show-overflow-tooltip="true"
                    :key="index"
                    :prop="column.id"
                    :label="column.name"
                    :width="column.width"
                    :sortable="column.isOrderByField=='true'?true:false"
                    v-if="!column.hiddenColumn"
                  >
                    <template slot-scope="scope">
                      <!-- {{regReplace(scope.row[column.id])}} -->
                      <div
                        v-if="!scope.row.isInclude"
                        :style="{background:column.groundColor, color:column.color,fontSize:column.fontSize+'px'}"
                        :title="scope.row[column.showTitle?column.id:'']"	>
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
                            >{{currencyChange(scope.row[column.id], column.decimalsCurr,column.currType).substr(0,column.displayLength)}}</span>
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
                                    :src="setDefaultIcon(column.iconMapping)"
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
                                    <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                                    <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                                      <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                      <div class="right">
                                        <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                        <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                      </div>
                                    </div>
                                  </span>
                                  <span v-else>{{scope.row[column.id]}}</span>
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
                              {{column.iconMapping}}
                              <img
                                v-for="(item,index) in column.iconMapping"
                                :key="index"
                                width="32"
                                height="32"
                                :src="setDefaultIcon(item.value, true)"
                              />
                            </span>
                            <span v-else-if="column.icon">
                              <img 
                                width="32" 
                                height="32" 
                                :src="setDefaultIcon(column.icon, true)" />
                            </span>
                          </span>
                          <span v-else-if="column.type=='COLUMN_TYPE_OPERATE'">
                            <button
                              @click.stop.prevent="buttonClick(column, scope.row)"
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
                                  <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                                  <div class="list" v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  :key='fi'>
                                    <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                    <div class="right">
                                      <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                      <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                    </div>
                                  </div>
                                </span>
                                <span v-else>{{regReplace(scope.row[column.id])}}</span>
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
                      </div>
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </el-scrollbar>
          </div>
          <div class="week-view" v-if="currentActive == 2">
            <el-scrollbar class="scrollbar">
              <table border="0" cellpadding="1" cellspacing="1" class="obpm-listdetails" id="dataTable">
                <thead>
                  <tr class="listDataTh obpm-listdatath daythead">
                      <td nowrap="" class="obpm-detailsthead" style="padding: 15px 20px 15px 20px;">{{$t('date.week')}}</td>
                      <td v-for="(column, index) in weekView" :key="index" class="obpm-otherdetailsthead">
                          {{column.name}}
                      </td>
                  </tr>
                </thead>
                <tbody class="obpm-detailbody">
                  <tr v-for="(item, index) in weekArray" :key="index">
                    <td class="obpm-listcolumnhead">
                      <div>{{item.name}}</div>
                      <div class="week">{{item.value}}</div>
                    </td>
                    <td  v-for="(column, index) in weekView" :key="index">
                      <div class="calendar-event" style="overflow:hidden;">
                        <div v-for="(tr, i) in  documents" :key="i" class="calendar-box" @click="onRowClick(tr)">
                          <span v-if="tr.items[periodColumn.id].value >= item.value && tr.items[periodColumn.id].value < item.value + ' 24:00' && item.value == tr.items[periodColumn.id].value">
                            <span v-if="column.columnField == 'DateField'">
                              {{tr.items[column.id].showValue}} 
                            </span>
                            <span v-else>
                              <!-- {{tr.items[column.id].value}} -->
                              <!-- 1 -->
                              <span v-if="column.formatType=='number'">
                                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                                  <span
                                    v-if="column.displayType == '00' && tr.items[column.id].value"
                                  >{{toFixed(tr.items[column.id].value,column.decimalsNum)}}</span>
                                  <span
                                    v-else-if="column.displayType == '01' && tr.items[column.id].value"
                                  >{{toFixed(tr.items[column.id].value,column.decimalsNum).substr(0,column.displayLength)}}</span>
                                </span>
                                <span
                                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                                  v-html="toFixed(tr.items[column.id].value,column.decimalsNum)"
                                ></span>
                              </span>
                              <!-- 2 -->
                              <span v-else-if="column.formatType=='currency'">
                                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                                  <span v-if="column.displayType == '00' && tr.items[column.id].value">
                                    <!--小计或总计-->
                                    {{tr.items[column.id].isSum?tr.items[column.id].value:currencyChange(tr.items[column.id].value, column.decimalsCurr,column.currType)}}
                                  </span>
                                  <span
                                    v-else-if="column.displayType == '01' && tr.items[column.id].value"
                                  >{{currencyChange(tr.items[column.id].value, column.decimalsCurr,column.currType).substr(0,column.displayLength)}}</span>
                                </span>
                                <span
                                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                                  v-html="currencyChange(tr.items[column.id].value, column.decimalsCurr,column.currType)"
                                ></span>
                              </span>
                              <!-- 3 -->
                              <span v-if="column.formatType=='simple'">
                                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                                  <span v-if="column.displayType == '00' && tr.items[column.id].value">
                                    <span v-if="column.showIcon">
                                      <span
                                        v-if="column.iconMapping && column.iconMapping[0].key == tr.items[column.id].value"
                                      >
                                        <img
                                          width="32"
                                          height="32"
                                          :src="setDefaultIcon(column.iconMapping)"
                                        />
                                      </span>
                                      <span v-else>{{tr.items[column.id].value}}</span>
                                    </span>
                                    <span v-else>
                                      <span v-if="column.flowReturnCss && tr.items[column.id].isRunningBack">
                                        <img src="../assets/images/backstatelabel01.gif" />
                                      </span>
                                      <span>
                                        <span v-if="column.columnField == 'ImageUploadField'">
                                          <span v-if="tr.items[column.id].value">
                                            <span
                                              v-for="(el, i) in JSON.parse(tr.items[column.id].value)"
                                              :key="i"
                                            >
                                              <img
                                                style="max-width:50px; max-height:50px;"
                                                :src="viewFieldPath(el,column.columnField)"
                                              />
                                            </span>
                                          </span>
                                        </span>
                                        <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(tr.items[column.id].value,column.columnField).length > 0">
                                          <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                                          <div class="list" v-for="(el, fi) in viewFieldPath(tr.items[column.id].value,column.columnField)"  :key='fi'>
                                            <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                            <div class="right">
                                              <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                              <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                            </div>
                                          </div>
                                        </span>
                                        <span v-else>{{tr.items[column.id].value}}</span>
                                      </span>
                                    </span>
                                  </span>
                                  <span
                                    style="cursor:pointer"
                                    :title="tr.items[column.showTitle?column.id:''].value"
                                    v-else-if="column.displayType == '01' && tr.items[column.id].value"
                                  >
                                    {{tr.items[column.id].value.substr(0,column.displayLength)}}
                                    {{tr.items[column.id].value.length>column.displayLength?'...':''}}
                                  </span>
                                  <span v-else> &nbsp; </span>
                                </span>
                                <span v-else-if="column.type=='COLUMN_TYPE_LOGO'">
                                  <span v-if="column.iconMapping">
                                    {{column.iconMapping}}
                                    <img
                                      v-for="(item,index) in column.iconMapping"
                                      :key="index"
                                      width="32"
                                      height="32"
                                      :src="setDefaultIcon(item.value, true)"
                                    />
                                  </span>
                                  <span v-else-if="column.icon">
                                    <img 
                                      width="32" 
                                      height="32" 
                                      :src="setDefaultIcon(column.icon, true)" />
                                  </span>
                                </span>
                                <span v-else-if="column.type=='COLUMN_TYPE_OPERATE'">
                                  <button
                                    @click.stop.prevent="buttonClick(column, scope.row)"
                                  >{{column.buttonName}}</button>
                                </span>
                                <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'" @click.stop>
                                  <component :is="template(tr.items[column.id].value)" v-if="tr.items[column.id].value"></component>
                                </span>
                                <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'"></span>
                              </span>
                              <!-- 4 -->
                              <span v-else>
                                <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                                  <span
                                    style="cursor:pointer"
                                    :title="viewFieldPath(tr.items[column.showTitle?column.id:''].value,column.columnField)"                
                                    v-if="column.displayType == '00' && tr.items[column.id].value">
                                    <!-- {{tr.items[column.id].value}} -->
                                    <span>
                                      <span v-if="column.columnField == 'ImageUploadField'">
                                        <span v-if="tr.items[column.id].value">
                                          <span v-for="(el, i) in JSON.parse(tr.items[column.id].value)" :key="i">
                                            <img
                                              style="max-width:50px; max-height:50px;"
                                              :src="viewFieldPath(el,column.columnField)"
                                            />
                                          </span>
                                        </span>
                                      </span>
                                      <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(tr.items[column.id].value,column.columnField).length > 0">
                                        <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                                        <div class="list" v-for="(el, fi) in viewFieldPath(tr.items[column.id].value,column.columnField)"  :key='fi'>
                                          <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                          <div class="right">
                                            <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                            <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                          </div>
                                        </div>
                                      </span>
                                      <span v-else>{{regReplace(tr.items[column.id].value)}}</span>
                                    </span>
                                  </span>
                                  <span
                                    style="cursor:pointer"
                                    :title="scope.row[column.showTitle?column.id:'']"
                                    v-else-if="column.displayType == '01' && tr.items[column.id].value"
                                  >
                                    <!-- {{tr.items[column.id].value.substr(0,column.displayLength)}} -->
                                    {{tr.items[column.id].value.substr(0,column.displayLength)}}
                                    {{tr.items[column.id].value.length>column.displayLength?'...':''}}
                                  </span>
                                </span>
                                <span
                                  v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                                  v-html="tr.items[column.id].value"
                                ></span>
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-scrollbar>
          </div>
          <div class="mon-view" v-if="currentActive == 3">
            <el-scrollbar class="scrollbar">
              <table cellspacing="0" cellpadding="0" style="width:100%">
                <thead>
                  <tr>
                    <td 
                      style="width:calc(100% / 7);"
                      width="1" 
                      v-for="(weekDay, index) in weekDays" 
                      :key="index">
                      {{weekDay}}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in monthRow" :key="i" height="100">
                    <td v-for="(list, index) in monthDateList[i]" :key="index" class="t-body-td" :style="{'width':tdMontnViewWidth+'px'}">
                      <div class="td-box" :style="{'width':tdMontnViewWidth+'px'}">
                        <div class="td-date">
                          {{list.date | formDate}}
                        </div>
                        <div style="cursor: pointer;text-align: left" class="monthdatabox" :id="'date-monthdatabox-view' + i + index">
                          <div v-for="(tr, inx) in documents" :key="inx" :id="'date' + tr.id" class="content-box" @click.stop="onRowClick(tr)">
                            <span v-if="filtersMonthView(tr.items[periodColumn.id].value) == list.date" class="div-child-list" >
                              <span v-for="(item, ind) in tr.items" :key="ind">
                                <span v-if="tr.showItemValue && (tr.showItemValue.indexOf(item.name)>=0 || tr.showItemValue.indexOf(item.discript)>=0 || tr.showItemValue.indexOf(item.columnName)>=0)" id="date-content-box">
                                  <span :title="item.showTitle" v-html="item.value"></span>
                                </span>
                              </span>
                            </span>
                            <span 
                              class="more" 
                              style="display:none;"
                              :id="'date-monthdatamore-view' + i + index"
                              @click.stop="seeMore(list.date)"
                            >{{$t('more')}}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import activity from "@/components/activity.vue";
import Watermark from '@/assets/js/watermark';  //路径不要写错
export default {
  name: "view-calendarview",
  props: [
    "view",
    "openParams",
    "showtype",
  ],
  inject: ['addTab'],
  components: {
    activity,
  },
  watch: {
    
  },
  computed: {
    
  },
  created(){
    let weekView = JSON.parse(JSON.stringify(this.view.columns));
    weekView.forEach((el,i) => {
      if(el.hiddenColumn) {
        weekView.splice(i,1);
        i--;
      }
    });
    this.weekView = weekView;
  },

  mounted() {
    if(this.showtype === 'home') {
      this.currentActive = 3;
      let date = new Date();
      let startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      this.monthFirstDay = this.writeCurrentDate("", startDate);
      this.monthLastDay = this.writeCurrentDate("", endDate);
      let ym = this.monthFirstDay.split("-");
      this.currentDate = ym[0] + "-" + ym[1];
      let periodColumn = '';
      let columns = this.view.columns;
      let showItemValue = [];
      columns.map((item)=>{
        if(item.showMoon){
          showItemValue.push(item.name);
        }
      })
      for(let i=0; i<columns.length; i++) {
        if(columns[i].mappingField === 'CldViewDateColum') {
          periodColumn = columns[i];
          break;
        }
      }
      this.periodColumn = periodColumn;
      this.$api.getViewData(
        //普通视图接口
        this.$root.appid,
        this.view.id,
        {
          parentId: this.parentId ? this.parentId : "",
          currpage: this.currentPage,
          lines: 9999,
          searchWord:'',
          startDate: this.monthFirstDay + ' 00:00',
          endDate: this.monthLastDay + ' 24:00',
        },
        {},
        {
          onSucess: res => {
            // this.documents = res.data.data.data;
            let documents = res.data.data.data;
            if(documents && documents.length > 0) {
              documents.forEach(el => {
                // formField: "DateField"
                el.showItemValue = showItemValue;
                for(let key in el.items){
                  if(el.items[key].formField === "DateField") {
                    if(el.items[key].value) {
                      el.items[key].showValue = el.items[key].value;
                      el.items[key].value = el.items[key].value.split(" ")[0];
                    }
                  }
                }
              });
            }
            this.documents = documents;
            this.$emit('totalCount' , '', 'calendarview')
            this.getDateList(null);
            //以下判断是否显示更多按钮
            this.$nextTick(()=>{
              this.MonthViewUpdateNode();
            })
          }
        }
      );
    }else {
      let showMode = this.view.defaultShowMode;
      if(showMode == 'month') {
        this.showView(3)
      }else if(showMode == "week"){
        this.showView(2)
      }else {
        this.getData();
      }
    }
  },

  data: function() {
    return {
      tableData:[],
      tableShowLists: [],
      documents:'',
      currentActive:1,
      checkedAll:[],
      dayNumber: 1,
      currentDate:'',
      showViewList:false,
      currentWeek:0,
      addWeekNum:'',
      startTime:'',
      endTime:'',
      oneWeekArray:[],
      viewColumns:[],
      weekArray:[],
      periodColumn:'',
      currentDocIds:[],
      loading: true,
      emptyData:'',
      
      //以下是周视图的变量
      currentYear: 1970,  // 年份
      currentMonth: 1, // 月份
      currentDay: 1,  // 日期
      currentWeeks: 1,  // 星期
      days: [],

      //以下是月视图的变量
      weekDays: [this.$t('date.sun'),this.$t('date.mon'),this.$t('date.tues'),this.$t('date.wed'),this.$t('date.thur'),this.$t('date.fri'),this.$t('date.sat')],
      weeks:[this.$t('date.sunday'),this.$t('date.monday'),this.$t('date.tuesday'),this.$t('date.wednesday'),this.$t('date.thursday'),this.$t('date.friday'),this.$t('date.saturday'),],
      year:new Date().getFullYear(),
      month:new Date().getMonth()+1,
      date:new Date().getDate(),
      dateList:[],
      monthFirstDay:'',
      monthLastDay:'',
      // monthRow: [0,1,2,3,4,5,6],
      monthRow: [0,1,2,3,4,5,6],
      monthDateList:[],
      tdMontnViewWidth:0, //月视图的每个表格宽度
      weekView:[], //周视图所用视图列，因为有隐藏列原本的view在周视图使用不能隐藏
      haveWatermark:false,
    };
  },

  methods: {
    /**
     * 截取年月日进行比较
     */
    filtersMonthView: function(value) {
      let val = value.split(" ")
      return val[0]
    },
    reloadListView(){
      let startTime, endTime, date;
      let currentDate = this.currentDate;
      if(this.currentDate.indexOf("~") > -1) {
        date = this.currentDate.split("~");
        startTime = date[0] + ' 00:00';
        endTime = date[1] + ' 24:00';
      }else {
        date = this.currentDate.split("-");
        if(date.length == 2) {
          startTime = this.monthFirstDay + ' 00:00';
          endTime = this.monthLastDay + ' 24:00';
        }else {
          startTime = currentDate + ' 00:00';
          endTime = currentDate + ' 24:00';
        }
      }
      let columns = this.view.columns;
      let showItemValue = [];
      columns.map((item)=>{
        if(item.showMoon){
          showItemValue.push(item.name);
        }
      })
      let currentActive = this.currentActive;
      if(currentActive == 3) {
        this.showView(3,true)
      }else if(currentActive == 2){
        const d = this.oneWeekArray[1];
        d.setDate(d.getDate());
        let days = this.initData(d);
        this.showView(2,days)
      }else {
        this.getData('', '', '', startTime, endTime,showItemValue);
      }
    },

    seeDateMore(date){
      let params = {
        actionContent: this.view.id,
        name: this.view.name,
        linkType: '01',
        clickDate: date,
        appId: this.openParams.appId,
      };
      this.$emit("event", 'view', params);
    },
    
    seeMore(date){
      this.$api.getViewData(
          //普通视图接口
          this.openParams.appId,
          this.view.id,
          {
            parentId: this.parentId ? this.parentId : "",
            currpage: 1,
            lines: 9999,
            searchWord:'',
            startDate: date + ' 00:00',
            endDate: date + ' 24:00',
          },
          {},
          {
            onSucess: res => {
              let docs = res.data.data.data;
              this.row_count = res.data.row_count;
              let tds = [];
              if (docs)
                docs.forEach(doc => {
                  let rows = {};
                  rows.formId = doc.formId;
                  rows.docId = doc.id;
                  for (var key in doc.items) {
                    let items = doc.items[key];
                    rows[key] = items.value;
                  }
                  if(doc.isSum) {
                    rows.isSum = doc.isSum;
                  }
                  tds.push(rows);
                });
                this.tableData = tds;
                this.currentActive = 1;
                this.loading = false;
            }
          }
        );
    },

    onActionChild(act){
      //his.$parent.onAction(act);
      //绑定视图的处理事件
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
        default:
          break;
      }
    },

    //是否删除的弹窗提示
    doRemove(act) {
      let docIds = this.currentDocIds;
      if(docIds && docIds.length > 0) {
        this.$confirm(this.$t('msg.del_or_not')+`${docIds.length}`+this.$t('msg.data'), this.$t('tip'), {
          confirmButtonText: this.$t('btns.sure'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          this.runBeforeAction(act, docIds);
        }).catch(() => {
                  
        });
      }else {
        this.$confirm(this.$t('msg.select_atLeastOne'), this.$t('tip'), {
          confirmButtonText: this.$t('btns.sure'),
          cancelButtonText: this.$t('btns.cancel'),
          type: 'warning'
        }).then(() => {
          
        }).catch(() => {
                  
        });
      }
    },

    regReplace(value){
      if(value){
        return value.replace(/&#37;/g, "%")
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
            this.runAfterAction(act)
            this.includeReload();
          }
        }
      });
    },

    includeReload () { //重新刷新组件刷新
      this.$parent.updateView();
    },

     //执行脚本前
    runBeforeAction(act, docIds){
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: "",
        templateForm: this.view.templateForm,
        viewId: this.openParams.actionContent,
        _selects: docIds && docIds.length>0 ? docIds : [],
      }
      let divId = act.id;
      let actType = act.type;
      this.$api.runBeforeActionScript(
        this.openParams.appId, 
        divId, 
        formData, 
        actType,
        '', //treedocid
        '', //flowType
        {
        onSucess: response => {
          if(response.data.errcode == 0 && response.data.data) {
            let errcode = response.data.errcode;
            let errmsg = response.data.data.content;
            this.$notify.error({
              title: errmsg,
              message: ''
            });
          }else if(response.data.errcode == 0){
            if(act.type == 3) { //删除数据
              this.removeDocuments(act,docIds); 
            }
          }
        }
      });
    },

     //执行脚本后
    runAfterAction(act, docIds) {
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: "",
        templateForm: "",
        viewId: this.openParams.actionContent,
        _selects: docIds && docIds.length>0 ? docIds : [],
      }
      let appId = this.openParams.appId;
      let divId = act.id;
      let docId = '';
      let parentId = '';
      let _templateForm = '';
      let _ = '';
      this.$api.runAfterActionScript(
        appId,
        divId,
        docId,
        this.openParams.actionContent,
        this.view.relatedForm,
        _templateForm,
        parentId,
        _,
        formData,
        act.type,
        '', //treedocid
        {
          onSucess: response => {
            if(response.data.errcode == 0) {
              if(response.data.data.content) {
                let errmsg = response.data.data.content.content;
                this.$notify({
                  title: errmsg,
                  message: '',
                  type: 'warning'
                });
              }
            }
          }
        }
      );
    },

    onClick() {
      if(this.currentActive == 3) { //如果当前是月视图重新从当前月开始
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth()+1;
      }
      if(this.showViewList) {
        this.showViewList = false;
        // this.getData();
        this.showView(this.currentActive);
      }else {
        let startTime = "1900-01-01 00:00",
          endTime = "2099-12-31 00:00";
        this.showViewList = true;
        this.getShowListData('', '', '', startTime, endTime);
      }
       
    },

    writeCurrentDate(val, paramTime){
      let day = ''
      if(val == "NEXT") {
        day = new Date();
        day.setTime(day.getTime()+24*60*60*1000*this.dayNumber);
      }else if(val == "PREV"){
        let str = this.currentDate;
        str = str.replace(/-/g,'/');
        day = new Date(str);
        day.setTime(day.getTime()-24*60*60*1000);
      }else if(val == "WEEK") {
        day = new Date(paramTime);
      }else {
        day = new Date(paramTime);
      }
      let year = day.getFullYear()
      let Month = day.getMonth() + 1;
      let Day = day.getDate();
      Month = Month >= 10 ? Month: "0"+Month;
      Day = Day >= 10 ? Day: "0" + Day;
      let s = year +"-" +  Month + "-" + Day;
      return s;
      
    },

    //下一个时间
    nextTime(currentActive) {
      if(currentActive === 1) { //日视图
        this.currentDate = this.writeCurrentDate("NEXT");
        this.dayNumber++;
        let startTime = this.currentDate + " 00:00";
        let endTime = this.currentDate + " 24:00";
        this.getData('', '', '', startTime, endTime); 
      }else if (currentActive === 2) { //周视图
        const d = this.oneWeekArray[6];
        d.setDate(d.getDate() + 8);
        let days = this.initData(d);
        this.nextWeekData(days);
      }else if(currentActive === 3) {
        this.month++;
        if(this.month==13){
          this.month=1;
          this.year++;
        }
        let isNextOrPre = true;
        this.getDateList(isNextOrPre);
        
      }
    },

    //上一个时间
    prevTime(currentActive) {
      if(currentActive == 1) {
        this.currentDate = this.writeCurrentDate("PREV");
        this.dayNumber--;
        let startTime = this.currentDate + " 00:00";
        let endTime = this.currentDate + " 24:00";
        this.getData('', '', '', startTime, endTime); 
      }else if (currentActive == 2) {
        const d = this.oneWeekArray[0];  // 如果当期日期是7号或者小于7号
        d.setDate(d.getDate() - 6);
        let days = this.initData(d);
        this.nextWeekData(days);
      }else if(currentActive === 3) {
        this.month--;
        if(this.month==0){
          this.month=12;
          this.year--;
        }
        let isNextOrPre = true;
        this.getDateList(isNextOrPre);
      }
    },

    nextWeekData(days) {
      let saturday = days[0];
      let sunday = days[6]
      this.currentDate = saturday + "~" + sunday;
      saturday = encodeURI(saturday + ' 00:00');
      sunday = encodeURI(sunday + ' 24:00');
      let weeks = [];
      days.forEach((el,index) => {
        let obj = {};
        switch(index) {
          case 0: 
            obj.value = el;
            obj.name = this.$t('date.sunday');
            weeks.push(obj);
            break;
          case 1: 
            obj.value = el;
            obj.name = this.$t('date.mon');
            weeks.push(obj);
            break;
          case 2: 
            obj.value = el;
            obj.name = this.$t('date.tues');
            weeks.push(obj);
            break;
          case 3: 
            obj.value = el;
            obj.name = this.$t('date.wed');
            weeks.push(obj);
            break;
          case 4: 
            obj.value = el;
            obj.name = this.$t('date.thur');
            weeks.push(obj);
            break;
          case 5: 
            obj.value = el;
            obj.name = this.$t('date.fri');
            weeks.push(obj);
            break;
          case 6: 
            obj.value = el;
            obj.name = this.$t('date.sat');
            weeks.push(obj);
            break;
          default:
            break;
        }
      });
      let periodColumn = '';
      let columns = this.view.columns;
      let showItemValue = [];
      columns.map((item)=>{
        if(item.showMoon){
          showItemValue.push(item.name);
        }
      })
      for(let i=0; i<columns.length; i++) {
        if(columns[i].mappingField === 'CldViewDateColum') {
          periodColumn = columns[i];
          break;
        }
      }
      this.weekArray = weeks;
      this.periodColumn = periodColumn;
      this.$api.getViewData(
        //普通视图接口
        this.openParams.appId,
        this.view.id,
        {
          parentId: this.parentId ? this.parentId : "",
          currpage: this.currentPage,
          lines: 9999,
          searchWord:'',
          startDate:saturday,
          endDate:sunday,
        },
        {},
        {
          onSucess: res => {
            let documents = res.data.data.data;
            if(documents && documents.length > 0) {
              documents.forEach(el => {
                // formField: "DateField"
                el.showItemValue = showItemValue;
                for(let key in el.items){
                  if(el.items[key].formField === "DateField") {
                    if(el.items[key].value) {
                      el.items[key].showValue = el.items[key].value;
                      el.items[key].value = el.items[key].value.split(" ")[0];
                    }
                  }
                }
              });
            }
            this.documents = documents;
          }
        }
      );
    },

    //日周月视图切换
    showView(val,reloadListViewDays) {
      if(val == 1) { //日视图
        this.currentActive = val;
        this.getCurrentDate();
        this.getData();
      }else if(val ==2) { //周视图
        this.currentActive = val;
        let days = reloadListViewDays ? reloadListViewDays : this.initData(null);
        this.nextWeekData(days);
      }else if(val == 3) { //月视图
        this.tdMontnViewWidth = parseInt((this.$refs.calendarView.clientWidth-20) / 7) || 166;
        this.currentActive = val;
        if(!reloadListViewDays){
          let date = new Date();
          let startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          this.monthFirstDay = this.writeCurrentDate("", startDate);
          this.monthLastDay = this.writeCurrentDate("", endDate);
          let ym = this.monthFirstDay.split("-");
          this.currentDate = ym[0] + "-" + ym[1];
        }
        let periodColumn = '';
        let columns = this.view.columns;
        let showItemValue = [];
        columns.map((item)=>{
          if(item.showMoon){
            showItemValue.push(item.name);
          }
        })
        for(let i=0; i<columns.length; i++) {
          if(columns[i].mappingField === 'CldViewDateColum') {
            periodColumn = columns[i];
            break;
          }
        }
        
        this.periodColumn = periodColumn;
        this.$api.getViewData(
          //普通视图接口
          this.openParams.appId,
          this.view.id,
          {
            parentId: this.parentId ? this.parentId : "",
            currpage: this.currentPage,
            lines: 9999,
            searchWord:'',
            startDate: this.monthFirstDay + ' 00:00',
            endDate: this.monthLastDay + ' 24:00',
          },
          {},
          {
            onSucess: res => {
              let documents = res.data.data.data;
              if(documents && documents.length > 0) {
                documents.forEach(el => {
                  // formField: "DateField"
                  el.showItemValue = showItemValue;
                  for(let key in el.items){
                    if(el.items[key].formField === "DateField") {
                      if(el.items[key].value) {
                        el.items[key].showValue = el.items[key].value;
                        // el.items[key].value = el.items[key].value.split(" ")[0];
                      }
                    }
                  }
                });
              }
              let viewList = this.view.columns;
              viewList.forEach(column => {
                documents.forEach(tr => {
                  for(let key in tr.items){
                    if(tr.items[key].formField != "DateField") {
                      tr.items[key].showTitle = tr.items[key].value;
                      if(column.formatType=='number') {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {
                            tr.items[key].value = this.toFixed(tr.items[key].value,column.decimalsNum);
                          }else if(column.displayType == '01'){
                            tr.items[key].value = this.toFixed(tr.items[key].value,column.decimalsNum).substr(0,column.displayLength);
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT') {
                          // v-html="toFixed(tr.items[column.id].value,column.decimalsNum)"
                        }
                      }else if(column.formatType=='currency'){
                        if(column.type=='COLUMN_TYPE_FIELD') {
                          if(column.displayType == '00') {
                            tr.items[key].value = tr.items[key].isSum?tr.items[key].value:this.currencyChange(tr.items[key].value, column.decimalsCurr,column.currType)
                          }else if(column.displayType == '01') {
                            tr.items[key].value = this.currencyChange(tr.items[key].value, column.decimalsCurr,column.currType).substr(0,column.displayLength)
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT'){

                        }
                      }else if(column.formatType=='simple') {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {
                            if(column.showIcon) {

                            }else {

                            }
                          }else if(column.displayType == '01') {
                            let val = tr.items[key].value.substr(0,column.displayLength) + (tr.items[key].value.length>column.displayLength?'...':'');
                            tr.items[key].value = val
                          }
                          
                        }else if(column.type=='COLUMN_TYPE_LOGO'){

                        }else if(column.type=='COLUMN_TYPE_OPERATE'){
                          
                        }else if(column.type=='COLUMN_TYPE_SCRIPT'){
                          
                        }else if(column.type=='COLUMN_TYPE_ROWNUM'){
                          
                        }
                      }else {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {

                          }else if(column.displayType == '01') {
                            let val =  tr.items[key].value.substr(0,column.displayLength) + (tr.items[key].value.length>column.displayLength?'...':'');
                            tr.items[key].value = val;
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT') {

                        }
                      }
                    }
                  }
                });
              });
              this.documents = documents;
              this.getDateList(null);
              if(this.view.waterMarkText) { //判断是否显示水印
                if(!this.haveWatermark) {
                  let val = this.view.waterMarkText;
                  let id = 'view_' + this.view.id;
                  Watermark.set(val, id);
                  this.haveWatermark = true;
                }
              }
              //以下判断是否显示更多按钮
              this.$nextTick(()=>{
                for(let i=0; i<this.monthRow.length; i++) {
                  if(this.monthDateList[i] && this.monthDateList[i].length){ // this.monthDateList[i].length 最大值为6, i最大值为7
                    for(let j=0; j<this.monthDateList[i].length; j++) {
                      let isShow = 0;
                      let dateListId = "date-monthdatabox-view" + i + j;
                      let app = document.getElementById(dateListId);
                      let sonDom = app.childNodes;
                      for(let z=0; z<sonDom.length; z++) {
                        if(sonDom[z].innerText) {
                          isShow = isShow + 1;
                          if(isShow > 3) {
                            let app2 = document.getElementById('date-monthdatamore-view'+ i + j);
                            app2.style.display = 'block';
                          }else {
                            let app2 = document.getElementById('date-monthdatamore-view'+ i + j);
                            app2.style.display = 'none';
                          }
                        }
                      }
                    }
                  }
                }
              })
            
            }
          }
        );
      }
    },

    //月视图获取月列表
    getDateList(isNextOrPre){
      this.dateList=[];
      let month = this.month,
          year = this.year,
          firstDay = this.getFirstDay(year,month), //当前月
          daysLength = this.getDaysLength(year,month),
          dateList=this.dateList,
          that=this;
      let preMonth = month-1,
          preYear = year,
          nextMonth = month+1,
          nextYear = year;
      if(preMonth == 0){
        preMonth = 12;
        preYear--;
      }
      if(nextMonth == 13){
        nextMonth = 1;
        nextYear++;
      }
      for(var i=0;i<42;i++){
        if(i < firstDay){
          dateList.push({
            date: preYear + '-' + (preMonth>9?preMonth:'0'+preMonth) + '-' + (that.getDaysLength(preYear,preMonth)+(i-firstDay+1)),
            type: 'prev'
          })
        }else if(i < (firstDay+daysLength)){
          dateList.push({
            date: year + '-' + (month>9?month:'0'+month) + '-' + (i-(firstDay)+1>9?i-(firstDay)+1:'0'+(i-(firstDay)+1)),
            type:'now'
          })
        }else{
          dateList.push({
            date: nextYear + '-' + (nextMonth>9?nextMonth:'0'+nextMonth) + '-' + (i-(firstDay+daysLength)+1>9?i-(firstDay+daysLength)+1:'0'+(i-(firstDay+daysLength)+1)),
            type:'next'
          })
        }
      }
      // console.log("this.dateList--->",this.dateList);
      let allArr = [];
      for(let i=0; i<7; i++) {
        let arr = [];
        switch(i) {
          case 0:
            arr = this.dateList.slice(0,7);
            allArr.push(arr);
            break;
          case 1:
            arr = this.dateList.slice(7,14);
            allArr.push(arr);
            break;
          case 2:
            arr = this.dateList.slice(14,21);
            allArr.push(arr);
            break;
          case 3:
            arr = this.dateList.slice(21,28);
            allArr.push(arr);
            break;
          case 4:
            arr = this.dateList.slice(28,35);
            allArr.push(arr);
            break;
          case 5:
            arr = this.dateList.slice(35,42);
            allArr.push(arr);
            break;
          default:
            break
        }

      }
      this.monthDateList = allArr;
      // console.log("this.monthDateList--->",this.monthDateList);
      if(isNextOrPre) {
        let ym = (year + "-" + (month>9?month:'0' + month));
        let newMonth=parseInt(new Date(ym).getMonth())+1;    //获取当前时间的月
        let newYear=parseInt(new Date(ym).getFullYear());   //获取当前时间的年
        let startDate = new Date(newYear,newMonth-1,1);    //获取当前月的第一天
        let endDate = new Date(newYear,newMonth,0);       //获取当前月的最后一天
        this.monthFirstDay = this.writeCurrentDate("", startDate);
        this.monthLastDay = this.writeCurrentDate("", endDate);
        let YM = this.monthFirstDay.split("-");
        this.currentDate = YM[0] + "-" + YM[1];
        this.$api.getViewData(
          //普通视图接口
          this.openParams.appId,
          this.view.id,
          {
            parentId: this.parentId ? this.parentId : "",
            currpage: this.currentPage,
            lines: 9999,
            searchWord:'',
            startDate: this.monthFirstDay + ' 00:00',
            endDate: this.monthLastDay + ' 24:00',
          },
          {},
          {
            onSucess: res => {
              let columns = this.view.columns;
              let showItemValue = [];
              columns.map((item)=>{
                if(item.showMoon){
                  showItemValue.push(item.name);
                }
              })
              let documents = res.data.data.data;
              if(documents && documents.length > 0) {
                documents.forEach(el => {
                  el.showItemValue = showItemValue;
                  for(let key in el.items){
                    if(el.items[key].formField === "DateField") {
                      if(el.items[key].value) {
                        el.items[key].showValue = el.items[key].value;
                        el.items[key].value = el.items[key].value.split(" ")[0];
                      }
                    }
                  }
                });
              }
              let viewList = this.view.columns;
              viewList.forEach(column => {
                documents.forEach(tr => {
                  for(let key in tr.items){
                    if(tr.items[key].formField != "DateField") {
                      tr.items[key].showTitle = tr.items[key].value;
                      if(column.formatType=='number') {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {
                            tr.items[key].value = this.toFixed(tr.items[key].value,column.decimalsNum);
                          }else if(column.displayType == '01'){
                            tr.items[key].value = this.toFixed(tr.items[key].value,column.decimalsNum).substr(0,column.displayLength);
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT') {
                          // v-html="toFixed(tr.items[column.id].value,column.decimalsNum)"
                        }
                      }else if(column.formatType=='currency'){
                        if(column.type=='COLUMN_TYPE_FIELD') {
                          if(column.displayType == '00') {
                            tr.items[key].value = tr.items[key].isSum?tr.items[key].value:this.currencyChange(tr.items[key].value, column.decimalsCurr,column.currType)
                          }else if(column.displayType == '01') {
                            tr.items[key].value = this.currencyChange(tr.items[key].value, column.decimalsCurr,column.currType).substr(0,column.displayLength)
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT'){

                        }
                      }else if(column.formatType=='simple') {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {
                            if(column.showIcon) {
                              
                            }else {
                              // tr.items[key].value = val;
                              
                            }
                          }else if(column.displayType == '01') {
                            let val = tr.items[key].value.substr(0,column.displayLength) + (tr.items[key].value.length>column.displayLength?'...':'');
                            tr.items[key].value = val
                          }
                          
                        }else if(column.type=='COLUMN_TYPE_LOGO'){

                        }else if(column.type=='COLUMN_TYPE_OPERATE'){
                          
                        }else if(column.type=='COLUMN_TYPE_SCRIPT'){
                          
                        }else if(column.type=='COLUMN_TYPE_ROWNUM'){
                          
                        }
                      }else {
                        if(column.type=='COLUMN_TYPE_FIELD'){
                          if(column.displayType == '00') {

                          }else if(column.displayType == '01') {
                            let val =  tr.items[key].value.substr(0,column.displayLength) + (tr.items[key].value.length>column.displayLength?'...':'');
                            tr.items[key].value = val;
                          }
                        }else if(column.type=='COLUMN_TYPE_SCRIPT') {

                        }
                      }
                    }
                  }
                });
              });
              this.documents = documents;  
              if(this.view.waterMarkText) { //判断是否显示水印
                if(!this.haveWatermark) {
                  let val = this.view.waterMarkText;
                  let id = 'view_' + this.view.id;
                  Watermark.set(val, id);
                  this.haveWatermark = true;
                }
              }
              //以下判断是否显示更多按钮
              this.$nextTick(()=>{
                for(let i=0; i<this.monthRow.length; i++) {
                  if(this.monthDateList[i] && this.monthDateList[i].length){ // this.monthDateList[i].length 最大值为6, i最大值为7
                    for(let j=0; j<this.monthDateList[i].length; j++) {
                      let isShow = 0;
                      let dateListId = "date-monthdatabox-view" + i + j;
                      let app = document.getElementById(dateListId);
                      let sonDom = app.childNodes;
                      for(let z=0; z<sonDom.length; z++) {
                        if(sonDom[z].innerText) {
                          isShow = isShow + 1;
                          if(isShow > 3) {
                            let app2 = document.getElementById('date-monthdatamore-view'+ i + j);
                            app2.style.display = 'block';
                          }else {
                            let app2 = document.getElementById('date-monthdatamore-view'+ i + j);
                            app2.style.display = 'none';
                          }
                        }
                      }
                    }
                  }
                }
              })
      
            }
          }
        );
      }
      
    },

    //月视图获取当月第一天是周几
    getFirstDay(year,month){
      let that=this;
      return new Date(year+'-'+month+'-1').getDay();
    },

    //月视图获取月天数
    getDaysLength(year,month){
      var d = new Date(year, month, 0);
      return d.getDate();
    },

    formatDate (year, month, day) {
      const y = year
      let m = month
      if (m < 10) m = `0${m}`
      let d = day
      if (d < 10) d = `0${d}`
      return `${y}-${m}-${d}`
    },

    initData (cur) {
      this.oneWeekArray = [];
      let date = ''
      if (cur) {
        date = new Date(cur)
      } else {
        date = new Date()
      }
      this.currentDay = date.getDate()     // 今日日期 几号
      this.currentYear = date.getFullYear()    // 当前年份
      this.currentMonth = date.getMonth() + 1  // 当前月份
      this.currentWeeks = date.getDay() // 1...6,0  // 星期几
      if (this.currentWeeks === 0) {
        this.currentWeeks = 7
      }
      const str = this.formatDate(this.currentYear, this.currentMonth, this.currentDay)// 今日日期 年-月-日
      this.days.length = 0;
      this.days = [];
      for (let i = this.currentWeeks; i > 0; i -= 1) {
        const d = new Date(str)
        d.setDate(d.getDate() - i)
        this.oneWeekArray.push(d);
        let day = this.formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
        this.days.push(day)
      }
      for (let i = 0; i <= 7 - this.currentWeeks - 1; i += 1) {
        const d = new Date(str)
        d.setDate(d.getDate() + i)
        this.oneWeekArray.push(d);
        let day = this.formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
        this.days.push(day)
      }
      return this.days;
    },

    onRowClick(row) {
      let view = this.view
      let op = this.openParams
      if (!view.readonly) {
        let formId
        if (view.templateForm) {
          //判断是模板表单还是数据源表单
          formId = view.templateForm
        } else {
          formId = row.formId
        }
        let params = {
          linkType: "00",
          appId: op.appId,
          actionContent: formId, //row.formId,
          _select: row.id?row.id:row.docId,
          viewId: view.id,
          parentId: op.parentId ? op.parentId : "", //包含元素时判断是否有parentId
          isRelate: op.isRelate ? op.isRelate : "", //包含元素时判断isRelate是否为true
          searchData: this.searchData,  
          showtype: this.showtype,
          templateForm: view.templateForm ? view.templateForm : "",
          refreshId: op.id,  //判断是否得刷新
        };
        if(this.includeDisplayType) {
          params.includeDisplayType = this.includeDisplayType
        }
        this.$api.hasPermissionToForm(op.appId, formId, {
          onSucess: (response) => {
            if (response.data.data) {
              if (this.isView) {
                let arr = []
                arr.push(row)
                let isRadio = true
                this.$emit("updateViewData", params, arr, isRadio)
              } else if (this.view.openType == 1 && !this.isView) { //1为当前页打开
                if (this.showtype == "include") {
                  this.currentPageParams = params
                  this.$refs.multipleTable.toggleRowExpansion(row)
                } else if (this.showtype == "tab") {
                  params.name = view.name
                  this.addTab(params)
                  // this.currentPageParams = params;
                  // this.$refs.multipleTable.toggleRowExpansion(row);
                }else if (this.showtype == "target") {
                  let routeData = this.$router.resolve({
                    // name: "form_blank",
                    name: 'open',
                    query: params,
                  });
                  window.open(routeData.href, "_blank");
                } else {
                  params.name = view.name
                  this.$emit("add-tab", params)//打开普通视图
                }
              } else if (view.openType == 277 && !this.isView) { //277为弹窗打开
                if (this.showtype == "include") {
                  this.$parent.openForm(params)
                } else {
                  params.type = 277
                  this.$parent.openForm(params)
                }
              } else if (view.openType == 288 && !this.isView) {
                this.$refs.dialog.show(params)
              } else if (view.openType == 293 && !this.isView) {
                params.name = view.name
                this.addTab(params)
              }
            } else {
              this.$message({
                message: this.$t('msg.refuse'),
                type: "warning",
              })
            }
          },
        });
      }
    },

    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if(row && row.isInclude && columnIndex == 1) {
        let len =  this.view.columns.length;  
        return [1,len];
      }
    },

    handleSelectionChange(val) {
      let docIds = [];
      let hasChildren = "";
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          docIds.push(val[i].docId);
        }
      } else {
        docIds = [];
      }
      this.currentDocIds = docIds;
      console.log("docIds--->",docIds);
    },

    getShowListData(page, size, searchData, startTime, endTime,) {
      this.getViewData(page, size,searchData, startTime, endTime).then(response => {
        let docs = response.data.data;
        let documents = response.data.data;
        if(documents && documents.length > 0) {
          documents.forEach(el => {
            for(let key in el.items){
              if(el.items[key].formField === "DateField") {
                if(el.items[key].value) {
                  el.items[key].showValue = el.items[key].value;
                  el.items[key].value = el.items[key].value.split(" ")[0];
                }
              }
            }
          });
        }
        this.documents = documents;
        this.row_count = response.data.row_count;
        let tds = [];
        if (docs) {
          docs.forEach(doc => {
            let rows = {};
            rows.formId = doc.formId;
            rows.docId = doc.id;
            for (var key in doc.items) {
              let items = doc.items[key];
              if(items.formField == "DateField"){
                rows[key] = items.showValue;
              }else {
                rows[key] = items.value;
              }
            }
            if(doc.isSum) {
              rows.isSum = doc.isSum;
            }
            tds.push(rows);
          });
          if(tds.length == 0){
            this.emptyData = this.$t('nodata')
          }
          this.loading = false;
          this.tableShowLists = tds;
        }
      });
    },
    
    
    getData(page, size, searchData, startTime, endTime,showItemValue) {
      this.getViewData(page, size,searchData, startTime, endTime).then(response => {
        let docs = response.data.data;
        let documents = response.data.data;
        if(documents && documents.length > 0) {
          documents.forEach(el => {
            // formField: "DateField"
            el.showItemValue = showItemValue;
            for(let key in el.items){
              if(el.items[key].formField === "DateField") {
                if(el.items[key].value) {
                  el.items[key].showValue = el.items[key].value;
                  el.items[key].value = el.items[key].value.split(" ")[0];
                }
              }
            }
          });
        }
        this.documents = documents;
        this.row_count = response.data.row_count;
        let tds = [];
        if (docs) {
          docs.forEach(doc => {
            let rows = {};
            rows.formId = doc.formId;
            rows.docId = doc.id;
            for (var key in doc.items) {
              let items = doc.items[key];
              if(items.formField == "DateField"){
                rows[key] = items.showValue;
              }else {
                rows[key] = items.value;
              }
            }
            if(doc.isSum) {
              rows.isSum = doc.isSum;
            }
            tds.push(rows);
          });
            if(tds.length == 0){
              this.emptyData = this.$t('nodata')
            }
          this.loading = false;
          this.tableData = tds;
        }

        if(this.view.waterMarkText) { //判断是否显示水印
          if(!this.haveWatermark) {
            let val = this.view.waterMarkText;
            let id = 'view_' + this.view.id;
            Watermark.set(val, id);
            this.haveWatermark = true;
          }
        }
        // let showMode = this.view.defaultShowMode;
        // if(showMode == 'month') {
        //   this.showView(3)
        // }else if(showMode == "week"){
        //   this.showView(2)
        // }
      });
    },
    
    getCurrentDate() {
      //   
      let routerDate = this.openParams.clickDate;
      let day = routerDate ? new Date(routerDate) : new Date();
      day.setTime(day.getTime());
      let year = day.getFullYear()
      let Month = day.getMonth() + 1;
      let Day = day.getDate();
      Month = Month >= 10 ? Month: "0"+Month;
      Day = Day >= 10 ? Day: "0" + Day;
      let s = year +"-" +  Month + "-" + Day;
      this.currentDate = s;
      let obj = {
        startDate: s + " 00:00",
        endDate: s + " 24:00"
      }
      return obj;
    },

    //模拟数据请求
    getViewData(page, size, searchData, startTime, endTime) {
      let startDate = startTime?startTime:this.getCurrentDate().startDate;
      let endDate = endTime?endTime:this.getCurrentDate().endDate;
      let treeData = "";
      let treeName = "";
      return new Promise(resolve => {
        this.$api.getViewData(
          //普通视图接口
          this.openParams.appId,
          this.view.id,
          {
            parentId: this.parentId ? this.parentId : "",
            currpage: page?page:this.currentPage,
            lines: 9999,
            searchWord:'',
            startDate:startDate,
            endDate:endDate,
          },
          searchData?searchData:{},
          {
            onSucess: response => {
              let viewData = response.data;
              console.log("viewData-------->",viewData)
              resolve(viewData);
            }
          }
        );
      });
    },

     //月视图每个时间点获取是否有数据，有就显示
    MonthViewUpdateNode() {
      if(this.monthRow && this.monthRow.length > 0) {                
        for(let i=0; i<this.monthRow.length; i++) {
          if(this.monthDateList[i] && this.monthDateList[i].length > 0) {
            for(let j=0; j<this.monthDateList[i].length; j++) {
              let isShow = 0;
              let dateListId = "date-monthdatabox" + i + j;
              let app = document.getElementById(dateListId);
              let sonDom = app.childNodes;
              let total = 0;
              if(sonDom && sonDom.length > 0) {
                for(let z=0; z<sonDom.length; z++) {
                  // console.log(sonDom[z].innerHTML)
                  let str = sonDom[z].innerHTML;
                  if(str.indexOf("<span>") >= 0) {
                    total = total + 1;
                  }
                }
              }
              if(total > 0) {
                let app2 = document.getElementById('date-monthdatamore'+ i + j);
                    app2.style.color = '#fff';
                    app2.style.display = 'block';
                    app2.innerText = total
              }else {
                let app2 = document.getElementById('date-monthdatamore'+ i + j);
                    app2.style.color = '#fff';
                    app2.style.display = 'none';
                    app2.innerText = ''
              }
            }
          }
        }
      }       
    },

     //视图列设置默认图标显示
    setDefaultIcon(value, isLogo){
      let path = '';
      if(isLogo) {
        path = this.setDefaultPath() + '/uploads/lib/icon/' + value;
      }else {
        if(value[0]) {
          path = this.setDefaultPath() + '/uploads/lib/icon/' + value[0].value;
        }
      }
      return path;
    },
    viewFieldPath(value, field) {
      if (value && field == "ImageUploadField") {
        return obpmConfig.obpmFilePath + value.path;
      } else if (value && field == "AttachmentUploadField") {
        let arr = JSON.parse(value);
        return arr;
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

    downloadFile(file){ //列表文件下载
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

    //视图列按钮操作
    buttonClick(
      column,
      row
    ) {
      let id = column.id,
          parentView = column.parentView,
          type = column.buttonType,
          name = column.name,
          docId = row.docId,
          actionScript = column.actionScript,
          mappingform = column.mappingform,
          jumpMapping = column.jumpMapping;
      let params = "";
      let data = {
        actionScript,
        columnName: name,
        docId,
      };
      switch (type) {
        case "00":
          this.$api.beforescript(this.openParams.appId, parentView, id, data, {
            onSucess: (res) => {
              if (res.data.errcode == 0) {
                if(res.data.data) {
                  let resData = res.data.data;
                  if(!resData.type) {

                  }else if(resData.type == 32) {
                    this.$confirm(`${resData.content}`, this.$t('tip'), {
                      confirmButtonText:this.$t('btns.sure'),
                      cancelButtonText: this.$t('btns.cancel'),
                      type: "warning",
                    }).then(() => {
                      let arr = [];
                      arr.push(docId);
                      this.$api.batchRemoveDocuments(this.openParams.appId, arr, {
                        onSucess: (res) => {
                          this.getData();
                        },
                      });
                    }).catch(() => {});
                  }
                }else {
                  this.$confirm(this.$t('deldata'),  this.$t('tip'), {
                    confirmButtonText: this.$t('btn.sure'),
                    cancelButtonText:  this.$t('btn.cancle'),
                    type: "warning",
                  }).then(() => {
                    let arr = [];
                    arr.push(docId);
                    this.$api.batchRemoveDocuments(this.openParams.appId, arr, {
                      onSucess: (res) => {
                        this.getData();
                      },
                    });
                  }).catch(() => {});
                }
              }
            },
          });
          break;
        case "01":
          let isSubmissionProcess = true;
          this.$parent.viewColumnSubmission(isSubmissionProcess, docId);
          break;
        case "02":
          break;
        case "03":
          params = {
            linkType: "00",
            appId: this.openParams.appId,
            actionContent: mappingform?mappingform:column.templateForm,
            _select: docId,
            name,
            refreshId: this.openParams.id,
          };
          if(this.showtype === 'include' || this.showtype === 'tab') {
            this.toTab(params);
          }else {
            this.$emit("add-tab", params);
          }
          break;
        case "04":
          this.$api.runActionScript(this.openParams.appId, parentView, id, data, {
            onSucess: (res) => {
              if (res.data.errcode == 0) {
                if(res.data.data) {
                  let data = res.data.data;
                  if(data.type == '1') {
                    this.$message(data.content);
                  }
                  if(!data.type) {
                    this.$message(data);
                  }
                }else {
                  this.$emit("updateView");
                  this.$message({
                    showClose: true,
                    message:this.$t('success'),
                    type: "success",
                  });
                }
              }
            },
          });
          break;
        case "05":
          let isEmpty = "";
          let emptyParams = "";
          let arr = [];
          if (jumpMapping) {
            let map = jumpMapping.split(";");
            if(map.length > 0) {
              for(let i=0; i<map.length; i++) {
                let currentObj = map[i].split(":");
                let obj = {};
                for(let key in row) {
                  if(currentObj[1] === key) {
                    obj[currentObj[0]] = row[key];
                    arr.push(obj);
                  }
                }
              }
            }
          }
          if (arr.length > 0) {
            emptyParams = arr;
          }
          params = {
            linkType: "00",
            appId: this.openParams.appId,
            active: true,
            actionContent: mappingform,
            name: this.view.name,
            refreshId: this.openParams.id,
            type: 277,
          };
          this.$parent.openForm(params, emptyParams);
          break;
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
  filters: {
    formDate: function(value) {
      let val = value.split("-");
      return val[2];
    }
  }
};
</script>