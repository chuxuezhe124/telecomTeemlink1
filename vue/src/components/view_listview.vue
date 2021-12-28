<template>
  <div class="view-listview" :id="'view_'+view.id" ref="viewListview">
    <!--isFormPrint等于5的时候是打印的样式-->
    <template v-if="isFormPrint != 5">   
      <div v-if="showtype=='home'">
        <div class="widget-view-list">
          <el-table
            border
            min-height="270"
            style="width: 100%"
            ref="multipleTable"
            v-if="view.columns && view.columns.length>0"
            v-loading="tableLoading"
            :header-cell-style="{background:'#F9F9F9',color:'#5A6779'}"
            :data="tableData"
            :span-method="arraySpanMethod"
            :cell-class-name="checkbox"
            @row-click="onWidgetRowClick"
            @selection-change="handleSelectionChange"
            @header-click="headerClick"
            >
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
                <template slot="header">
                  <div class="th-header" :title="column.name">
                    {{column.name}}
                  </div>
                </template>
                <template slot-scope="scope">
                  <!--普通视图-->
                  <div
                    v-if="!scope.row.isInclude"
                    :style="{background: (column.showAsLabel ? '' : column.groundColor), color:(column.showAsLabel ? '' : column.color),fontSize:(column.showAsLabel ? '' : column.fontSize+'px')}">
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
                      >
                      </span>
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
                            <span v-else :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}">{{scope.row[column.id]}}</span>
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
                                    <i class="el-icon-view icon-left" @click.stop.prevent="handlePreview(el)"></i>
                                    <i class="el-icon-folder-opened" @click.stop.prevent="previewFile(el)"></i>
                                  </div>
                                </div>
                              </span>
                              <span v-else :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}">{{scope.row[column.id]}}</span>
                            </span>
                          </span>
                        </span>
                        <span
                          style="cursor:pointer"
                          :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}"
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
                        <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                        <!-- <span v-if="scope.row[column.id] && scope.row[column.id].indexOf('o-action') > -1">
                          <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                        </span>
                        <span v-else>
                          <span v-append="scope.row[column.id]"></span>
                        </span> -->
                      </span>
                      <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'">{{scope.$index+1}}</span>
                    </span>

                    <!-- 4 -->
                    <span v-else>
                      <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                        <span
                          style="cursor:pointer"                
                          v-if="column.displayType == '00' && scope.row[column.id]">
                          <span>
                            <span v-if="column.columnField == 'ImageUploadField'">
                              <span v-if="scope.row[column.id]">
                                <span v-for="(el, i) in JSON.parse(scope.row[column.id])" :key="i">
                                  <img
                                    :title="el.name"
                                    style="max-width:50px; max-height:50px;"
                                    :src="viewFieldPath(el,column.columnField)"
                                  />
                                </span>
                              </span>
                            </span>
                            <span 
                              class="file-list" 
                              v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.id],column.columnField).length > 0">
                              <div 
                                class="magnifyImg" 
                                :style="{'display':isShowImg?'block':'none'}" 
                                @click.stop.prevent="hiddenImg" 
                                v-html="addHtml"></div>
                              <div 
                                class="list" 
                                v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  
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
                            <span v-else-if="column.columnField == 'OnLineTakePhotoField'">
                              <span 
                                style="max-width:50px; max-height:50px;" 
                                v-for="(el, i) in viewPhotoPath(scope.row[column.id],column.columnField)" 
                                :key="i">
                               <img
                                  style="max-width:40px; max-height:40px;"
                                  :src="el"
                                  @click.stop.prevent="picturePreview(scope.row[column.id], 0, column.columnField)"
                                />
                              </span>
                            </span>
                            <span v-else>{{scope.row[column.id]}}</span>
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
                      </span>
                      <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'">
                          <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                        <!-- <span v-if="scope.row[column.id] && scope.row[column.id].indexOf('o-action') > -1">
                          <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                        </span>
                        <span v-else>
                          <span v-append="scope.row[column.id]"></span>
                        </span> -->
                      </span>
                    </span>
                  </div>
                </template>
              </el-table-column>
            </template>
            <!--当是包含元素且是当前页打开-->
            <el-table-column type="expand" v-if="showtype=='include' && view.openType == 1">
              <template>
                <form_normalform v-bind="$attrs" v-on="$listeners" :openParams="currentPageParams" />
              </template>
            </el-table-column>
            <el-table-column v-if="allowOpenDoc" :label="$t('check')">
              <template slot-scope="scope">
                <div @click.stop.prevent="openDocument(scope.row)">{{$t('check')}}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!--margin-left = 1px 当试图折叠打开时隐藏掉三角符号多出的1px -->
      <div 
        :class="[(showtype == 'include' || showtype == 'tab')?'listview-container-other':'listview-container']" 
        :style="{'margin-left':((showtype=='include' && view.openType == 1) || (showtype=='tab' && view.openType == 1))? '1px':''}" 
        v-loading="loading" 
        v-else>
        <el-scrollbar class="scrollbar-view">
		      <!-- :class="[view.openType == '1'?'current-page-view':'','listview-box']" -->
          <div id="listview-box" :class="[view.openType == '1'?(view.autoCompose ? 'current-page-view-autoCompose':'current-page-view'):'','listview-box']">
            <!-- <el-scrollbar class="scrollbar"> -->
              <div v-show="isOpenTemplate">
                <form_searchform
                  :appId="openParams.appId"
                  :viewId="openParams.actionContent"
                  :openParams="openParams"
                  :commonFilterCondition="view.commonFilterCondition"
                  @onSearch="onSearch"
                  @setSearchDocument="getSearchDocument"
                  v-bind="$attrs"
                  v-on="$listeners"
                  ref="searchform"
                />
              </div>
              <!-- (showtype == 'include') || 
                  (showtype=='include' && view.openType == 1) || 
                  (showtype=='tab' && view.openType == 1)) ? (fixationHeight > 0 ? fixationHeight : '150') : tableHeight" -->
              <!--randomNumber 让dom结构重排，避免样式改变-->
              <el-table
                :key="randomNumber"
                :border="view.autoCompose"
                style="width: 100%; min-height:100px;"
                ref="multipleTable"
                v-if="view.columns && view.columns.length>0 && !isMultiLevelListHeader"
                v-loading="tableLoading"
                :header-cell-style="tableRowClassName"
                :cell-style="{textAlign:'center'}"
                :height="(view.openType == 1 && (showtype == 'include' || showtype=='tab')) ? (fixationHeight > 0 ? fixationHeight : undefined) : 
                  showtype == 'include' ? (fixationHeight > 0 ? fixationHeight : '150') : 
                  showtype=='tab' ? '350':
                  tableHeight"
                :data="tableData"
                :expand-row-keys="expends"
                :row-key="getRowKeys"
                :span-method="arraySpanMethod"
                :cell-class-name="checkbox"
                :row-class-name="tableRowIndex"
                @row-click="onRowClick"
                @selection-change="handleSelectionChange"
                @header-click="headerClick"
                @sort-change="changeTableSort"
                @header-dragend="headerDragend"
              >
                <template slot="empty">
                  <p>{{emptyData}}</p>
                </template>
                <el-table-column
                  style="view-checkedAll"
                  v-if="mutil || selectOne || !isView"
                  type="selection"
                  v-model="checkedAll"
                  width="55"
                  :selectable="selectInit"
                > 
                </el-table-column>
                <!-- <el-table-column width="55" v-if="!isView">
                  <template slot="header">
                    <span class="checked-all">
                      <el-checkbox v-model="checkedAll" disabled></el-checkbox>
                    </span>
                  </template>
                  <template>
                    <span class="checked-all">
                      <el-checkbox v-model="checkedAll" disabled></el-checkbox>
                    </span>
                  </template>
                </el-table-column> -->
                 <!-- :filters="column.filtersList"
                    :filter-method="filterHandler" -->
                <template v-for="(column, index) in view.columns">
                  <el-table-column
                    :fixed="column.fixed?column.fixed:false"
                    :show-overflow-tooltip="true"
                    :key="index"
                    :prop="column.id"
                    :label="column.name"
                    min-width="120px"
                    :width="column.showColumnWidth ? column.showColumnWidth : getWidth(column.width, view.autoCompose)"
                    :sortable="column.isOrderByField=='true'?'custom':false"
                    v-if="!column.hiddenColumn"
                  >
                    <template slot="header">
                      <div class="th-header" :title="column.name">
                        {{column.name}}
                      </div>
                      <!--筛选的，不要删除-->
                      <span class="th-filter-column" v-if="column.isFilter" @click.stop>
                        <i class="el-icon-arrow-down f-icon" @click.stop="showColumnFilterTip($event, column, index)"></i>
                      </span>
                    </template>
                    <template slot-scope="scope">
                      <!--普通视图-->
                      <div
                        v-if="!scope.row.isInclude"
                        :style="{background: (column.showAsLabel ? '' : column.groundColor), color:(column.showAsLabel ? '' : column.color),fontSize:(column.showAsLabel ? '' : column.fontSize+'px')}"
                      >
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
                        <span v-else-if="column.formatType=='simple'" style="display:inline-block;">
                          <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                            <span v-if="column.displayType == '00' && scope.row[column.id]">
                              <!--判断是否显示图标-->
                              <span v-if="column.showIcon">
                                <span
                                  v-if="column.iconMapping && getIconMapping(column.iconMapping,scope.row[column.id]) == scope.row[column.id]"
                                >
                                  <img
                                    width="32"
                                    height="32"
                                    :src="setDefaultIcon(column.iconMapping,'',scope.row[column.id])"
                                  />
                                </span>
                                <span v-else :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}">{{scope.row[column.id]}}</span>
                              </span>
                              <span v-else>
                                <!--视图-流程回退标识-->
                                <span v-if="scope.row.isRunningBack">
                                  <span v-if="column.flowReturnCss">
                                    <img src="../assets/images/backstatelabel01.gif" />
                                    <span v-if="column.columnField != 'ImageUploadField' && column.columnField != 'AttachmentUploadField'" :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}">
                                      {{scope.row[column.id]}}
                                    </span>
                                  </span>
                                  <span v-else>
                                    <span v-if="column.columnField != 'ImageUploadField' && column.columnField != 'AttachmentUploadField'" :style="{color:column.fontColor?column.fontColor:'',fontSize:column.fontSize?column.fontSize:'',}">
                                      {{scope.row[column.id]}}
                                    </span>
                                  </span>
                                </span>
                                <span v-else>
                                  <span v-if="column.columnField == 'ImageUploadField'">
                                    <span v-if="scope.row[column.id]">
                                      <span
                                        v-for="(el, i) in JSON.parse(scope.row[column.id])"
                                        :key="i"
                                      >
                                        <img
                                          :title="el.name"
                                          style="max-width:50px; max-height:50px;"
                                          :src="viewFieldPath(el,column.columnField)"
                                          @click.stop="picturePreview(scope.row[column.id],i)"
                                        />
                                      </span>
                                    </span>
                                  </span>
                                  <span 
                                    class="file-list" 
                                    v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.id],column.columnField).length > 0">
                                    <div 
                                      class="magnifyImg" 
                                      :style="{'display':isShowImg?'block':'none'}" 
                                      @click.stop.prevent="hiddenImg" 
                                      v-html="addHtml">
                                    </div>
                                    <div 
                                      class="list" 
                                      v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  
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
                                  <span v-else-if="column.columnField == 'NullField'">
                                    <div v-if="isJSON(scope.row[column.id],column.columnField)">
                                      <span class="file-list">
                                        <div 
                                          class="list" 
                                          v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  
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
                                    </div>
                                    <span v-else>
                                      {{scope.row[column.id]}}
                                    </span>
                                  </span>
                                  <span 
                                    v-else-if="!scope.row.isRunningBack && 
                                      !scope.row.isSum && 
                                      column.columnField != 'ImageUploadField' && 
                                      column.columnField != 'AttachmentUploadField' &&
                                      column.columnField != 'NullField'" 
                                      :style="{fontSize:column.fontSize?column.fontSize:'',}">
                                      {{scope.row[column.id]}}
                                  </span>
                                  <span 
                                    v-if="!scope.row.isRunningBack && 
                                      scope.row.isSum && 
                                      column.columnField != 'ImageUploadField' && 
                                      column.columnField != 'AttachmentUploadField' &&
                                      column.columnField != 'NullField'" 
                                    :style="{fontSize:column.fontSize?column.fontSize:'','white-space':'normal'}">
                                    {{scope.row[column.id]}}
                                  </span>
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
                            <span v-else>
							                <span v-if="column.columnField == 'QRCodeField'">
                                <span :id="scope.row['docId']" ref="qrcode"></span>
                              </span>
							              </span>
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
                            <button id="operateId"
                              @click.stop.prevent="buttonClick(column, scope.row)"
                            >{{column.buttonName}}</button>
                          </span>
                          <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'" style="display:inline-block;width:100%;">
                            <!--如果是返回純粹的腳本，script腳本需要加上type='text/JavaScript'-->
                              <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                            <!-- <span v-if="scope.row[column.id] && scope.row[column.id].indexOf('o-action') > -1">
                              <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                            </span>
                            <span v-else>
                              <span v-append="scope.row[column.id]"></span>
                            </span> -->
                          </span>
                          <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'">{{scope.$index+1}}</span>
                        </span>
                        <!-- 4 -->
                        <span v-else>
                          <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                            <span
                              style="cursor:pointer"        
                              v-if="column.displayType == '00' && scope.row[column.id]">
                              <span>
                                <span v-if="column.columnField == 'ImageUploadField'">
                                  <span v-if="scope.row[column.id]">
                                    <span v-for="(el, i) in JSON.parse(scope.row[column.id])" :key="i">
                                      <img
                                        :title="el.name"
                                        style="max-width:50px; max-height:50px;"
                                        :src="viewFieldPath(el,column.columnField)"
                                        @click.stop="picturePreview(scope.row[column.id],i)"
                                      />
                                    </span>
                                  </span>
                                </span>
                                <span 
                                  class="file-list" 
                                  v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(scope.row[column.id],column.columnField).length > 0">
                                  <div 
                                    class="magnifyImg" 
                                    :style="{'display':isShowImg?'block':'none'}" 
                                    @click.stop.prevent="hiddenImg" 
                                    v-html="addHtml"></div>
                                  <div 
                                    class="list" 
                                    v-for="(el, fi) in viewFieldPath(scope.row[column.id],column.columnField)"  
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
                                <span v-else-if="column.columnField == 'OnLineTakePhotoField'">
                                  <span 
                                    style="max-width:50px; max-height:50px;" 
                                    v-for="(el, i) in viewPhotoPath(scope.row[column.id],column.columnField)" 
                                    :key="i">
                                    <img
                                      style="max-width:40px; max-height:40px;"
                                      :src="el"
                                      @click.stop.prevent="picturePreview(scope.row[column.id], 0, column.columnField)"
                                    />
                                  </span>
                                </span>
                                <span v-else-if="column.columnField == 'GenericWordField'">{{regReplace(JSON.parse(scope.row[column.id]).name)}}</span>
                                <span v-else-if="column.columnField == 'WeixinGpsField'">
                                  {{scope.row[column.id] ? JSON.parse(scope.row[column.id]).address:''}}
                                </span>
                                <span v-else>{{regReplace(scope.row[column.id])}}</span>
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
                          </span>
                          <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'">
                            <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                            <!-- <span v-if="scope.row[column.id] && scope.row[column.id].indexOf('o-action') > -1">
                              <component :is="template(scope.row[column.id])" v-if="scope.row[column.id]"></component>
                            </span>
                            <span v-else>
                              <span v-append="scope.row[column.id]"></span>
                            </span> -->
                          </span>
                        </span>
                      </div>
                    </template>
                  </el-table-column>
                </template>
				        <el-table-column
                  v-if="!view.autoCompose"
                ></el-table-column>
                <!--当是包含元素且是当前页打开-->
                <el-table-column 
                  type="expand" 
                  width="1"
                  v-if="((showtype=='include' && view.openType == 1) || (showtype=='tab' && view.openType == 1))">
                  <template>
                    <form_normalform 
                      v-bind="$attrs" 
                      v-on="$listeners" 
                      :openParams="currentPageParams"
                      @action="includeViewRefresh" 
                    />
                  </template>
                </el-table-column>
                <el-table-column v-if="allowOpenDoc" :label="$t('check')">
                  <template slot-scope="scope">
                    <div @click.stop.prevent="openDocument(scope.row)">{{$t('check')}}</div>
                  </template>
                </el-table-column>
              </el-table>
              <!--多级表头-->
              <view_multi_table
                v-else-if="isMultiLevelListHeader && tableData.length>0" 
                :tableData="tableData" 
                :multiLevelColumnData="multiLevelColumnData"
                :mutil="mutil"
                :selectOne="selectOne"
                :isView="isView"
                @selectionChange="handleSelectionChange"
                @rowClick="onRowClick"
              />
            <!-- </el-scrollbar> -->
          </div>
        </el-scrollbar>
        <div class="page" v-if="view.showTotalRow && !view.pagination">
          <div class="page-con total-row" style="text-align:center;">
            {{$t('total')}}：{{row_count}}
          </div>
        </div>
        <div class="page" v-else>
          <div class="page-con" style="text-align:center;">
            <el-pagination
              v-if="view.showTotalRow"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="row_count"
              :page-size="pagesize"
              :page-sizes="[5, 10, 15, 20, 30, 40, 50, 100]"
              :current-page.sync="currentPage"
              :pager-count="5"
              @current-change="onPageChang($event)"
              @size-change="handleSizeChange($event)"
            ></el-pagination>
            <el-pagination
              v-else-if="(!view.showTotalRow && view.pagination)"
              background
              layout="sizes, prev, pager, next, jumper"
              :total="row_count"
              :page-size="pagesize"
              :page-sizes="[5, 10, 15, 20, 30, 40, 50, 100]"
              :current-page.sync="currentPage"
              :pager-count="5"
              @current-change="onPageChang($event)"
              @size-change="handleSizeChange($event)"
            ></el-pagination>
          </div>
        </div>
      </div>
    </template>
    <!--打印时显示以下HTML-->
    <template v-else>
      <div class="view-listview-print">
        <!-- style="table-layout:fixed;" -->
        <table border="0" id="viewTable">
          <thead>
            <tr style="max-width:30%">
              <!-- {{:style="{maxWidth:column.width?column.width + 'px':''}"}} -->
              <td 
                nowrap 
                v-for="(column, index) in view.columns" 
                :key="index">
                <span class="font-print-size">
                  {{column.name}} 
                </span>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row,index) in documents" :key="index">
              <!-- :style="{maxWidth:column.width?column.width + 'px':''}" -->
              <!-- width:column.tdWidth -->
              <td  v-for="(column, inx) in view.columns" :key="inx" :style="{'vertical-align': 'top', 'min-width': '80px','color': column.color,'background-color': column.groundColor}">
                <div class="content-box" style="font-size:12px;">
                  <!-- {{row.items[column.id].value}} -->
                  <span v-if="column.formatType=='number'">
                    <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                      <span
                        class="font-print-size"
                        v-if="column.displayType == '00' && row.items[column.id].value"
                      >{{toFixed(row.items[column.id].value,column.decimalsNum)}}</span>
                      <span
                        class="font-print-size"
                        v-else-if="column.displayType == '01' && row.items[column.id].value"
                      >{{toFixed(row.items[column.id].value,column.decimalsNum).substr(0,column.displayLength)}}</span>
                    </span>
                    <span
                      class="font-print-size"
                      v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                      v-html="toFixed(row.items[column.id].value,column.decimalsNum)"
                    ></span>
                  </span>
                  <!-- 2 -->
                  <span v-else-if="column.formatType=='currency'">
                    <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                      <span 
                        class="font-print-size"
                        v-if="column.displayType == '00' && row.items[column.id].value">
                        {{row.isSum?row.items[column.id].value:currencyChange(row.items[column.id].value, column.decimalsCurr,column.currType)}}
                      </span>
                      <span
                        class="font-print-size"
                        v-else-if="column.displayType == '01' && row.items[column.id].value"
                      >{{currencyChange(row.items[column.id].value, column.decimalsCurr,column.currType).substr(0,column.displayLength)}}</span>
                    </span>
                    <span
                      class="font-print-size"
                      v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                      v-html="currencyChange(row.items[column.id].value, column.decimalsCurr,column.currType)"
                    ></span>
                  </span>
                  <!-- 3 -->
                  <span v-else-if="column.formatType=='simple'">
                    <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                      <span v-if="column.displayType == '00' && row.items[column.id].value">
                        <span v-if="column.showIcon">
                          <span
                            v-if="column.iconMapping && getIconMapping(column.iconMapping,row.items[column.id].value) == row.items[column.id].value"
                          >
                            <img
                              width="32"
                              height="32"
                              :src="setDefaultIcon(column.iconMapping,'',row.items[column.id].value)"
                            />
                          </span>
                          <span v-else class="font-print-size">{{row.items[column.id].value}}</span>
                        </span>
                        <span v-else>
                          <span v-if="column.flowReturnCss && row.items.isRunningBack">
                            <img src="../assets/images/backstatelabel01.gif" />
                          </span>
                          <span>
                            <span v-if="column.columnField == 'ImageUploadField'">
                              <span v-if="row.items[column.id].value">
                                <span
                                  v-for="(el, i) in JSON.parse(row.items[column.id].value)"
                                  :key="i"
                                >
                                  <img
                                    style="max-width:50px; max-height:50px;"
                                    :src="viewFieldPath(el,column.columnField)"
                                  />
                                </span>
                              </span>
                            </span>
                            <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(row.items[column.id].value,column.columnField).length > 0">
                              <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                              <div class="list" v-for="(el, fi) in viewFieldPath(row.items[column.id].value,column.columnField)"  :key='fi'>
                                <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                                <!-- <div class="right">
                                  <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                  <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                                </div> -->
                              </div>
                            </span>
                            <span class="font-print-size" v-else>{{row.items[column.id].value}}</span>
                          </span>
                        </span>
                      </span>
                      <span
                        class="font-print-size"
                        style="cursor:pointer"
                        :title="row.items[column.showTitle?column.id:'']"
                        v-else-if="column.displayType == '01' && row.items[column.id].value"
                      >
                       {{row.items[column.id].value.substring(0,column.displayLength)}}
                       {{row.items[column.id].value.length>column.displayLength?'...':''}}
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
                    <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'">
                      <component :is="template(row.items[column.id].value)" v-if="row.items[column.id].value"></component>
                    </span>
                    <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'">{{index+1}}</span>
                  </span>
                  <!-- 4 -->
                  <span v-else>
                    <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                      <span
                        style="cursor:pointer"
                        :title="viewFieldPath(row.items[column.showTitle?column.id:''],column.columnField)"                
                        v-if="column.displayType == '00' && row.items[column.id].value">
                        <span>
                          <span v-if="column.columnField == 'ImageUploadField'">
                            <span v-if="row.items[column.id].value">
                              <span v-for="(el, i) in JSON.parse(row.items[column.id].value)" :key="i">
                                <img
                                  style="max-width:50px; max-height:50px;"
                                  :src="viewFieldPath(el,column.columnField)"
                                />
                              </span>
                            </span>
                          </span>
                          <span class="file-list" v-else-if="column.columnField == 'AttachmentUploadField' && viewFieldPath(row.items[column.id].value,column.columnField).length > 0">
                            <div class="magnifyImg" :style="{'display':isShowImg?'block':'none'}" @click.stop.prevent="hiddenImg" v-html="addHtml"></div>
                            <div class="list" v-for="(el, fi) in viewFieldPath(row.items[column.id].value,column.columnField)"  :key='fi'>
                              <div class="left" @click.stop.prevent="handleFileClick(el)">{{el.name}}</div>
                              <!-- <div class="right">
                                <i class="el-icon-download icon-left" @click.stop.prevent="downloadFile(el)"></i>
                                <i class="el-icon-view" @click.stop.prevent="handlePreview(el)"></i>
                              </div> -->
                            </div>
                          </span>
                          <span v-else class="font-print-size">{{regReplace(row.items[column.id].value)}}</span>
                        </span>
                      </span>
                      <span
                        class="font-print-size"
                        style="cursor:pointer"
                        :title="row.items[column.showTitle?column.id:'']"
                        v-else-if="column.displayType == '01' && row.items[column.id].value"
                      >
                        {{row.items[column.id].value.substr(0,column.displayLength)}}
                        {{row.items[column.id].value.length>column.displayLength?'...':''}}
                      </span>
                    </span>
                    <span
                      class="font-print-size"
                      v-else-if="column.type=='COLUMN_TYPE_SCRIPT'"
                      v-html="row.items[column.id].value"
                    ></span>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <!--新的筛选，不要删除-->
    <div class="filter-box" @click.stop :style="{display:isShowfilterTip?'block':'none', left:filterTipLocation?filterTipLocation.x + 'px':'',top:filterTipLocation?filterTipLocation.y + 'px':''}">
      <div v-if="filterTipLocation.index >=0 ">
        <div class="filter-list" v-if="filterTipLocation.columns[filterTipLocation.index] && filterTipLocation.columns[filterTipLocation.index].filtersList && filterTipLocation.columns[filterTipLocation.index].filtersList.length>0">
          <el-checkbox-group :key="timeStamp" v-model="filterTipLocation.columns[filterTipLocation.index].selectfilterColumn" @change="handleCheckedColumnChange()">
            <el-checkbox 
              v-for="(list,inx) in filterTipLocation.columns[filterTipLocation.index].filtersList" 
              :label="list" 
              class="input-vertical"
              :key="inx">{{list}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="filter-bottom-btn">
        <span @click.stop="columnFilter()">
          筛选
        </span>
        <span @click.stop="resetColumnFilter()">
          重置
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import form_searchform from "@/components/form_searchform.vue";
import mdialog from "@/components/dialog.vue";
import form_normalform from "@/components/form_normalform.vue";
import Constant from "@/Constant.js";
import Watermark from '@/assets/js/watermark';  //路径不要写错
import qrcodeMethod from "@/assets/js/qrcodeMethod.js";
import view_multi_table from "../expandedComponents/view_multi_level_table.vue"
// import isJSON from "@/assets/js/isJSON.js"
export default {
  name: "view-listview",
  props: {
    "view": Object,
    "openParams": Object,
    "clearCheckboxVal": Boolean,
    "mutil": Boolean, //视图选择框多选
    "selectOne": Boolean, //视图选择框多选
    "isView": Boolean, //判断是否是视图选择框
    "allowOpenDoc": Boolean,
    "showtype": String,
    "selectedRows": Array,
    "callback": Function,
    "delegateWidth": Number,
    "includeDisplayType": Number, //包含元素为只读时的displayType=1
    "toTab": Function, //如果是包含元素或者选项卡，使用该方法打开新标签页
    "isFormPrint": Number,
    "currentTab": Number,
    "isWidgetChartView": Boolean, //首页widget的视图数据
    "tableHeight": { // 表格的高度
      type: Number,
      default: document.documentElement.clientHeight - 55 - 40 - 15 - 45 - 50 - 18 - 20 - 4, // 55: 按钮  40：页码  15：padding  45：tabs(padding-top)  50: header 18:table的padding 20:padding-bottom 4: border
    },
    "fixationHeight": String, //后台设置的视图高度
    "isMultiLevelListHeader": Boolean, //判断是不是多级类表头
    "multiLevelColumnData": Array, //多级列列表头
    "newColumns": Array, //列隐藏选中的列
    "newColumnsFixed": Array, //列固定选中的列
    "columnsArray": Array, //视图列
  },

  provide () {
    return {
      calctextJump: this.calctextJump
    }
  },

  inject: [
    'addTab', 
    'setListViewDocIds'
  ],
  components: {
    form_searchform,
    form_normalform,
    mdialog,
    view_multi_table,
  },

  watch: {
    listenFormTableWrapScrollbar(){
      if(this.isShowfilterTip) {
        this.isShowfilterTip = false
      }
    },

    clearCheckboxVal() {
      if (this.clearCheckboxVal) {
        this.toggleSelection();
      }
    },

    currentTab(){
      if(this.view.waterMarkText) {
        let val = this.view.waterMarkText;
        let id ='view_' + this.view.id;
        Watermark.set(val, id); 
      }
    },

    'isOpenTemplate': { //是否显示高级查询表单
      deep:true,
      handler:function() {
        if(this.isOpenTemplate == true) { //常用查询数据映射到高级查询数据
          let hightData = this.$refs.searchform.getAllFields(); //高级查询数据
          let commonData = this.$parent.$refs.searchform.buildSearchData() //常用数据
          for(let key in commonData) {
            for(let j = 0; j < hightData.length; j ++) {
              if(key == hightData[j].name) {
                hightData[j].value = commonData[key]
              }
            }
          }
        }else {  //高级查询数据映射到常用查询数据
          let retract = true; //是否点收起按钮
          let formdata = this.$parent.$refs.searchform.formdata; //常用form_customize_search的formdata
          if(retract) {
            let hightData = this.$parent.$refs.delegate.$refs.searchform.getAllFields(); //高级查询数据
            for(let x=0; x < formdata.fields.length; x ++) {
              for(let j = 0; j < hightData.length; j++) {
                if(formdata.fields[x].name == hightData[j].name) {
                  formdata.fields[x].value = hightData[j].value
                }
              }
            }
          }
          retract = false;
        }
      }
    },

    'openParams.randomNumber': { //点击一次菜单刷新一次视图
      deep:true,
      handler:function(){
        this.currentPage = 1;
        this.getData(1);
      }
    },

    'newColumns': { //列隐藏新的数据
      deep:true,
      handler:function(newValue){
        let cArray = this.columnsArray
        let columns = []
        if(newValue && newValue.length > 0) {
          cArray.forEach(el => {
            newValue.forEach(ele => {
              if(el.id === ele.id) {
                columns.push(el)
              }
            })
          })
          this.view.columns = columns
        }else{
          this.view.columns = this.columnsArray
        }
        // this.view.columns = JSON.parse(JSON.stringify(newValue));
      }
    },

    'newColumnsFixed': {//列固定新的数据
      deep:true,
      handler:function(newValue){
        let columns = this.view.columns
        if(newValue && newValue.length > 0) {
          newValue.forEach(el => {
            columns.forEach(ele => {
              if(el.id == ele.id) {
                ele.isFixed = true
                ele.fixed = el.fixed
              }else {
                if(!ele.isFixed) {
                  ele.fixed = ''
                }
              }
            })
          });
          columns.forEach(el => {
            el.isFixed = ''
          })
        }else {
          columns.forEach(el => {
            el.isFixed = ''
            el.fixed = ''
          })
          this.randomNumber = new Date().getTime()
        }
      }
    }
  },

  computed: {
    listenFormTableWrapScrollbar () {
      return this.$store.state.formTableWrapScrollbar
    }
  },

  destroyed () {//离开该页面需要移除这个监听的事件
    window.removeEventListener('scroll', this.handleTableScroll)
  },

  mounted() {
    if(this.showtype == 'home') { //首页widget仅显示5条
      this.getData(1, 5);
    }else {
      this.getData();
    }
    //监听table的滚动条事件
    this.$refs.multipleTable.bodyWrapper.addEventListener('scroll', this.handleTableScroll);
    // this.$refs.formTableWrap.addEventListener('scroll', this.handleTableScroll);
  },

  data: function () {
    return {
      randomNumber:1,
      currentPage: 1,
      checkedAll: [],
      tableData: [],
      row_count: 0,
      currentPageParams: {},
      currentPageSize: "",
      documents: "",
      searchExcelData: "",
      pagesize: 0,
      isOpenTemplate: false, //是否打开查询表单
      // view: { columns: [] }
      expends:[],
      tableDataIndex:0,
      Constant,
      classObject:{
        background:'#F9F9F9',
        color:'#5A6779',
        textAlign:'center',
      },
      doCreateId: [], //当前页新建后默认打开的行数据id
      loading: true,
      tableLoading: true,
      emptyData: '',  //清空暂无数据字体
      isShowImg: false,
      addHtml: '',
      reloadListViewRandom: '',
      listViewScrollTop: 0, //记录列表视图滚动条位置
      selectColumn:[],
      timeStamp:'',
      filterInformations: [], //要筛选的列
      multipleTableHeight: '', //this.$refs.multipleTable.$el.style.height
      filterTipLocation: {
        x: 0,
        y: 0,
        index: '',
        filtersList: [],
        selectfilterColumn: [],
        columns: {}
      },
      isShowfilterTip: false,
      tableSelection: [], //表格选中的行
      isRunGetData: false
    };
  },

  methods: {
    //判断是鼠标复制还是点击事件
    getSelected() {
      if (window.getSelection) {
        return window.getSelection().toString();
      } else if (document.getSelection) {
        return document.getSelection().toString();
      } else {
        var selection = document.selection && document.selection.createRange();
        if (selection.text) {
          return selection.text.toString();
        }
        return "";
      }
    },
    
    getSearchformBuildData(){
      return this.$refs.searchform.buildSearchData()
    },

    //拖动列头
    headerDragend(newWidth, oldWidth, column, event){
      let list = JSON.parse(localStorage.getItem("columnsWidthArray") || '[]'); //缓存列隐藏
      list = list || []
      let columnsWidthArray = {
        id: this.openParams.actionContent, 
        columns: [],
      }
      let currentColumn = ''
      let res = ''
      if(list && list.length > 0) {
        res = list.some(el => {
          if(columnsWidthArray.id == el.id){
            currentColumn = el.columns
            return true
          }
        })
      }

      if(res) {
        let oldColumns = currentColumn
        oldColumns.forEach(el => {
          if(el.id == column.property) {
            el.showColumnWidth = newWidth
          }
        })
        let res2 = oldColumns.some(el => {
          if(column.property == el.id){
            return true
          }
        })
        if(!res2) {
          let obj = {
            id: column.property,
            showColumnWidth: newWidth
          }
          oldColumns.push(obj)
        }
        columnsWidthArray.columns = oldColumns
      }else {
        let obj = {
          id: column.property,
          showColumnWidth: newWidth
        }
        columnsWidthArray.columns.push(obj)
        list.push(columnsWidthArray)
      }
      localStorage.setItem('columnsWidthArray',JSON.stringify(list));  
      this.$parent.saveColumnsWidth(list)
    },

    handleTableScroll(){
      this.isShowfilterTip = false
      // let scrollL = this.$refs.multipleTable.bodyWrapper.scrollLeft
    },

    //列筛选重置
    resetColumnFilter(column, index){
      // let view = this.view
      let filterInformations = []
      let ftl = this.filterTipLocation
      for(let key in ftl.columns) {
        let el = ftl.columns[key]
        if(el.selectfilterColumn && el.selectfilterColumn.length > 0) {
          let obj = {}
          let selectColumn = el.selectfilterColumn
          obj[el.fieldName] = selectColumn
          if(ftl.index == key) {
            el.selectfilterColumn = []
            el.isFilterStatus = false
          }
          if(el.isFilterStatus) {
            filterInformations.push(obj)
          }
        }
      }
      this.filterInformations = filterInformations
      this.getData('', '', '', '',filterInformations)
    },

    //筛选
    columnFilter(column, index){
      let view = this.view
      let filterInformations = []
      let ftl = this.filterTipLocation
      for(let key in ftl.columns) {
        let el = ftl.columns[key]
        if(el.selectfilterColumn && el.selectfilterColumn.length > 0) {
          let obj = {}
          let selectColumn = el.selectfilterColumn
          obj[el.fieldName] = selectColumn
          if(ftl.index == key) {
            el.isFilterStatus = true
          }
          if(el.isFilterStatus) {
            filterInformations.push(obj)
          }
        }
      }
      this.filterInformations = filterInformations
      this.getData('', '', '', '',filterInformations)
    },

    handleCheckedColumnChange(column, index){
      this.timeStamp = new Date().valueOf();
    },

    //显示筛选框
    showColumnFilterTip(ev, column, index){
      // let scrollL = this.$refs.multipleTable.bodyWrapper.scrollLeft//document.getElementsByClassName("el-table")//document.getElementById("listview-box")////document.getElementsByClassName("scrollbar-view")
      let view = this.view

      let ftl = this.filterTipLocation
      if(ftl.index === index) {
        ftl.x = ev.pageX - 100;
        ftl.y = ev.pageY + 20;
        this.isShowfilterTip = !this.isShowfilterTip
        return 
      }else {
        let openParams = this.openParams
        ftl.x = ev.pageX - 100;
        ftl.y = ev.pageY + 20;
        ftl.index = index;
        let searchData = {};
        if(openParams.queryString) {
          searchData = this.setParams(openParams.queryString, searchData)
        }
        let urlParams = openParams.urlParams;
        if(urlParams) {
          searchData = this.setParams(urlParams, searchData)
        }
        if(openParams.exparams) {
          searchData = this.setParams(openParams.exparams, searchData)
        }
        this.$api.filterViewColumn(
          openParams.appId,
          view.id,
          column.fieldName,
          {
            parentId: openParams.parentId,
            isRelate: openParams.isRelate,
            searchWord: "",
          },
          searchData ? searchData : {},
          {
            onSucess: (res) => {
              column.filtersList = res.data.data
              if(!column.selectfilterColumn) {
                column.selectfilterColumn = []
              }
              ftl.columns[index] = column
              this.filterTipLocation.filtersList = res.data.data
              this.isShowfilterTip = true
              this.$forceUpdate()
            },
          }
        )
      }
      
      // if(!column.isShowfilterTip) {
      //   column.filterTipLocation = {
      //     x: ev.clientX - 100,//ev.pageX - 100
      //     y: ev.clientY + 20
      //   }
      //   view.columns.forEach((el, inx) => {
      //     if(index != inx) {
      //       el.isShowfilterTip = false
      //     }
      //     if(!el.selectfilterColumn) {
      //       el.selectfilterColumn = []
      //     }
      //   })
        
      //   column.isShowfilterTip = !column.isShowfilterTip
      //   view.columns[index] = column
      //   // this.timeStamp = new Date().valueOf()
      //   let openParams = this.openParams

      //   let searchData = {};
      //   if(openParams.queryString) {
      //     searchData = this.setParams(openParams.queryString, searchData)
      //   }
      //   let urlParams = openParams.urlParams;
      //   if(urlParams) {
      //     searchData = this.setParams(urlParams, searchData)
      //   }
      //   if(openParams.exparams) {
      //     searchData = this.setParams(openParams.exparams, searchData)
      //   }
      //   this.$api.filterViewColumn(
      //     openParams.appId,
      //     view.id,
      //     column.fieldName,
      //     {
      //       parentId: openParams.parentId,
      //       isRelate: openParams.isRelate,
      //       searchWord: "",
      //     },
      //     searchData ? searchData : {},
      //     {
      //       onSucess: (res) => {
      //         view.columns[index].filtersList = res.data.data
      //         this.timeStamp = new Date().valueOf()
      //         setTimeout(() => {
      //           this.$refs.multipleTable.bodyWrapper.scrollLeft = scrollL
      //           console.log(" this.$refs.multipleTable.bodyWrapper-->", this.$refs.multipleTable.bodyWrapper.scrollLeft)
      //         })
      //       },
      //     }
      //   );
      // }else {
      //   column.isShowfilterTip = !column.isShowfilterTip
      //   this.timeStamp = new Date().valueOf()
      // }



      //pageX clientX
    },
    // isJson(str){
    //   return isJSON(str)
    // },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
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

    previewFile(item){
			let url = obpmConfig.obpmFilePath + item.path;
			window.open(url);
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
        this.$parent.setDialogStatus(params);
      }
    },

    getSearchDocument(doc){
      this.$parent.setSearchDocItems(doc);
    },

    changeTableSort(ev){ //自定义排序
      let sortStatus = ''
      if(ev.order) {
        ev.column.sorting = ev.order
      }
      if(ev.order == "descending") {
        sortStatus = 'DESC'
      }else if(ev.order == "ascending"){
        sortStatus = 'ASC'
      }else {
        if(ev.column.sorting == "descending") {
          sortStatus = 'ASC'
        }else {
          sortStatus = 'DESC'
        }
      }
	    for(let i = 0; i<this.view.columns.length; i++) {//排序要传fieldName字段
        if(ev.column.label == this.view.columns[i].name) {
          ev.column.label = this.view.columns[i].fieldName
          break;
        }
      }
      this.getData('',this.pagesize,this.searchExcelData,{sortCol:ev.column.label, sortStatus},this.filterInformations)
      // let list = this.tableData;
      // if(list && list.length > 1) {
      //   if(list[list.length-1].isSum) {
      //     let lastRow = list.splice(list.length-1, 1);
      //     list.reverse();
      //     list = list.concat(lastRow);
      //     this.tableData = list;
      //     this.$forceUpdate();
      //   }else {
      //     list.reverse();
      //     this.tableData = list;
      //     this.$forceUpdate();
      //   }
      // }
    },

    headerClick(column, e){ //头部点击排序
    // sortCol: 开始时间
    // sortStatus: DESC
      if(column.label && column.label.length > 4) { //当列名称字符长度大于4.会使排序标志显示在列名称下面，导致表头height变高，从而使横向滚动条往下移动，导致横向滚动条被覆盖使用不了
        if(!this.multipleTableHeight) { //第二次点击排序时，multipleTableHeight有值不再继续减一
          this.multipleTableHeight = JSON.parse(JSON.stringify(this.$refs.multipleTable.$el.style.height))
          let sortableAfterHeight; //点击排序后this.$refs.multipleTable的高度
          sortableAfterHeight = this.$refs.multipleTable.$el.style.height.replace('px','') - 1 + "px"; //减一横向滚动条就出现了
          this.$refs.multipleTable.$el.style.height = sortableAfterHeight;
        }
      } 
      let columns = this.view.columns;
      for(let i=0; i<columns.length; i++) {
        if(columns[i].id == column.property) {
          columns[i].isOrderByField = 'true';
          break;
        }else {
          columns[i].isOrderByField = 'false';
        }
      }
      let sortStatus = '';
      if(e.layerY >=15) {
        sortStatus = 'ASC'
      }else{
        sortStatus = 'DESC'
      }
	    for(let i = 0; i<this.view.columns.length; i++) {//排序要传fieldName字段
        if(column.label == this.view.columns[i].name) {
          column.label = this.view.columns[i].fieldName;
          break;
        }
      }
      this.getData('',this.pagesize,this.searchExcelData,{sortCol:column.label, sortStatus}, this.filterInformations)
      this.randomNumber = new Date().getTime()
      // let list = this.tableData;
      // if(list && list.length > 1) {
      //   if(list[list.length-1].isSum) {
      //     let lastRow = list.splice(list.length-1, 1);
      //     list.reverse();
      //     list = list.concat(lastRow);
      //     this.tableData = list;
      //     this.$forceUpdate();
      //   }else {
      //     list.reverse();
      //     this.tableData = list;
      //     this.$forceUpdate();
      //   }
      // }
    },

    //获取路径（默认obpm）
    setDefaultPath(){
      return obpmConfig.obpmFilePath;
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

    tableRowIndex ({row, rowIndex}) {
    //把每一行的索引放进row
      row.index = rowIndex;
    },

    tableRowClassName() {
      // if(this.view.style) { //后台有设置样式库，表格头显示该样式
      //   let value = this.view.style.content;
      //   return value;
      // }else {
      //   return this.classObject;
      // }
      return this.classObject;
    },

    //包含元素刷新数据
    includeViewRefresh() {
      
    },

    handleOpenSearchTemplate() {
      this.isOpenTemplate = !this.isOpenTemplate;
    },

    //获取屏幕宽度，设置列宽
    getWidth(val, auto) {
      if (val) {
        if (val.indexOf("%") > -1) {
          let num = val.split("%")[0];
          let w = (this.delegateWidth * parseInt(num)) / 100;
          return w;
        } else {
          return val;
        }
      } else {
        if(auto) return ""
        else return "130"
      }
    },

    //视图列按钮操作
    buttonClick(
      column,
      row
    ) {
      let op = this.openParams;
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
      switch (type) { //type为操作类型
        case "00":
          this.$api.beforescript(this.openParams.appId, parentView, id, data, {
            onSucess: (res) => {
              if (res.data.errcode == 0) {
                if(res.data.data) {
                  let resData = res.data.data;
                  if(!resData.type) {

                  }else if(resData.type == 32) {
                    this.$confirm(`${resData.content}`, this.$t('tip'), {
                      confirmButtonText: this.$t('msg.confirm'),
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
                  this.$confirm(this.$t('msg.deldata'), this.$t('tip'), {
                    confirmButtonText: this.$t('msg.confirm'),
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
            appId: op.appId,
            actionContent:column.templateForm, 
            _select: docId,
            name,
            templateForm: column.templateForm, //打开的是模板表单
            refreshId: op.id,
            displayType: column.templateForm ? "templateForm" : '', //判断是模板表单还是普通表单
            realformId: row.formId, //有模板表单时，原本真实的formId
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
            title: '',
            type: 277,
          };
          if(mappingform) {
            params.jumpDialogId = 'dialog_normalform_' + this.openParams.actionContent; //视图列跳转按钮以弹出层打开，无dialogId，导致目标表单包含元素无法显示,用于计算包含元素的宽度
          }
          this.$parent.openForm(params, emptyParams);
          break;
      }
    },

    getExcelParams() {
      if (this.searchExcelData) {
        return this.searchExcelData;
      } else {
        return "";
      }
    },

    //删除或导入数据后重新请求加载数据
    reloadListView(){
      let filterInfo = this.filterInformations
      this.reloadListViewRandom = new Date().getTime();
      this.getData(this.currentPage, this.pagesize, this.searchExcelData, '', filterInfo);
      if(!this.isMultiLevelListHeader) {
        this.$refs.multipleTable.bodyWrapper.scrollTop = this.$store.state.listViewScrollTop;//重新加载数据时给滚动条定位置
      }
    },

    checkbox(row) {
      if (row.row.isSum) { //当前页小计
        return "mycell isSum";
      }
      if (row.row.isTotal) { //总计
        return "mycell isTotal";
      }
    },

    selectInit(row, index) {
      if (row.isSum || row.isTotal) {
        return false;
      } else {
        return true;
      }
    },

    //视图选择框允许打开文本
    openDocument(row) {
      let params = {
        linkType: "00",
        appId: this.openParams.appId,
        actionContent: row.formId,
        _select: row.docId,
        viewId: this.view.id,
        parentId: this.openParams.parentId ? this.openParams.parentId : "", //包含元素时判断是否有parentId
        isRelate: this.openParams.isRelate ? this.openParams.isRelate : "", //包含元素时判断isRelate是否为true
        searchData: this.searchData,
        showtype: this.showtype,
        templateForm: this.view.templateForm ? this.view.templateForm : "",
      };
      if (this.isView) {
        let arr = [];
        arr.push(row);
        let isRadio = true;
        this.$emit("openDoc", params);
      }
    },

    //设置分页大小
    handleSizeChange(ev) {
      this.currentPageSize = ev;
      let page = 1;
      this.getData(page, this.currentPageSize, this.searchExcelData);
    },

    onPageChang(ev) {
      let page = ev
      let filterInfo = this.filterInformations
      this.getData(page, this.currentPageSize, this.searchExcelData,'', filterInfo);
      //this.$refs.searchform.onSearchClick();
    },

    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (row && row.isInclude && columnIndex == 1) {
        let len = this.view.columns.length;
        return [1, len];
      }
    },

    //包含元素当前页打开新建
    addRow(params) {
      let createId = new Date().getTime();
      params.id = createId;
      this.currentPageParams = params;
      this.doCreateId.push(params.id);
      this.tableData.unshift(
        {
          // id: this.tableDataIndex,
          id: createId,
        }
      );
      this.tableDataIndex = this.tableDataIndex + 1;

      let Id = [];
      this.tableData.forEach(item => {
        this.doCreateId.forEach(id => {
          if(item.id === id) {
            Id.push(item.id);
          }
        })
      })
      this.expends = Id;
    },

    //包含元素当前页打开，新建默认打开
    getRowKeys(row){
      // console.log("row.id--->",row.id)
      return row.id
    },

    getData(page, size, searchData, sortData, filterInformations) {
      this.isRunGetData = true
      this.tableLoading = true
      this.isShowfilterTip = false
      let view = this.view
      this.getViewData(page, size, searchData, sortData, filterInformations).then((response) => {
        let docs = response.data.data
        this.documents = response.data.data
        this.pagesize = size
          ? size
          : view.pageLines
          ? parseInt(view.pageLines)
          : 10;
        let row_count = response.data.row_count
        this.row_count = row_count
        // 传递给首页widget是否显示加载更多按钮，日历视图也要判断
        this.$emit('totalCount' , row_count, 'listView')
        let tds = [];
        // 传递给父组件的column
        let tableColumns = {}
        if (docs){
          docs.forEach((doc) => {
            let rows = {};
            rows.formId = doc.formId
            rows.docId = doc.id
            rows.children = doc.children
            rows.isRunningBack = doc.isRunningBack
            rows.id = new Date().getTime() + Math.random()*1000
            for (var key in doc.items) {
              let items = doc.items[key]
			        if(items.formField == "QRCodeField") {
                this.$nextTick( ()=> {
                  setTimeout(() => {
                    let dom = document.getElementById(doc.id)
                    if(!dom.hasChildNodes()) {
                      qrcodeMethod(items , doc.id, 50, obpmConfig.contextPath)
                    }
                  })
                })
              }
              if(items.formField == 'CheckboxField' || items.formField == 'RadioField') { //特殊字符转义
                if(items.value && items.value.indexOf('&radic;') > -1) {
                  items.value = items.value.replace(/&radic;/g,'√').replace(/&times;/g,'×')
                }else if(items.value && items.value.indexOf('&times;') > -1) {
                  items.value = items.value.replace(/&times;/g,'×')
                }else {
                  items.value = items.value
                }
              }
              rows[key] = items.value
            }
            tableColumns = doc.items
            if (doc.isSum) { //当前页小计
              rows.isSum = doc.isSum
            }
            if(doc.isTotal) { //总计
              rows.isTotal = doc.isTotal
            }
            tds.push(rows)
          });
          // 将列的数据传递给 view_delegate 父组件
          this.$emit('columns', tableColumns)

          if(tds.length == 0){
            this.emptyData = this.$t('nodata')
          }
          this.loading = false;
          this.tableData = tds;
          
          if (this.selectedRows && this.selectedRows.length > 0) {
            this.$nextTick(function () {
              for (let i = 0; i < this.tableData.length; i++) {
                for (let j = 0; j < this.selectedRows.length; j++) {
                  if (this.tableData[i].docId == this.selectedRows[j].docId) {
                    this.$refs.multipleTable.toggleRowSelection(
                      this.tableData[i],
                      true
                    );
                  }
                }
              }
            });
          }
        }
        let op = this.openParams
        let menuData = {
          id: op.id,
          totalRow: row_count//docs.length,
        }
        if(this.reloadListViewRandom || op.haveTotalRow == true) { //菜单链接的视图，并且显示数量，当删除或增加的时候改变菜单显示的数量，现在只做了普通视图，标记一下
          if(op.haveTotalRow) { //菜单有显示数量
            this.$emit("updateViewNumber", menuData)
            this.reloadListViewRandom = ''
          }
        }
        if(view.showWaterMark === true) {
          if(view.waterMarkText) { //判断是否显示水印
            let val = view.waterMarkText
            let id = 'view_' + view.id
            Watermark.set(val, id)
          }
        }
        this.tableLoading = false

        let columns = view.columns
        columns.forEach(el => {
          el.isShowfilterTip = false
        })

        let tSelection = this.tableSelection //查询时保留原先选择的
        if(tSelection.length > 0) {
          this.$nextTick(() => {
            for (let i = 0; i < tds.length; i++) {
              for (let j = 0; j < tSelection.length; j++) {
                if (tds[i].docId == tSelection[j].docId) {
                  this.$refs.multipleTable.toggleRowSelection(
                    tds[i],
                    true
                  )
                }
              }
            }
          })
        }
        this.$nextTick(() => {
          this.isRunGetData = false
        })  
      })
    },

    //模拟数据请求
    getViewData(page, size, searchData, sortData, filterInformations) {
      let openParams = this.openParams;
      let treeData = "";
      let treeName = "";
      let isFormPrint = this.isFormPrint;
      if (this.parentId) {
        //树形视图
        return new Promise((resolve) => {
          this.$api.getTreeViewData(
            //树形视接口
            this.openParams.appId,
            this.openParams.actionContent,
            {
              parentId: this.parentId ? this.parentId : "",
            },
            treeData,
            treeName,
            {
              onSucess: (response) => {
                let treeViewData = response.data;
                resolve(treeViewData);
              },
            }
          );
        });
      } else if (openParams && openParams.parentId) {
        //包含元素时或者视图选择框时
        return new Promise((resolve) => {
          let lines = ''
          if(isFormPrint && isFormPrint == '5') {
            lines = 500
          }else {
            lines = size ? size : parseInt(this.view.pageLines)
          }
          searchData = searchData || {}
          if(filterInformations && filterInformations.length > 0) {
            searchData.filterInformations = filterInformations
          }
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: openParams.parentId,
              isRelate: openParams.isRelate,
              currpage: page ? page : this.currentPage,
              lines: lines,
              searchWord: "",
              treedocid: openParams.treedocid ? openParams.treedocid : '',
            },
            searchData ? searchData : {},
            {
              onSucess: (response) => {
                let viewData = response.data
                resolve(viewData)
              },
            }
          );
        });
      } else {
        return new Promise((resolve) => {
          let lines = ''
          if(isFormPrint && isFormPrint == '5') { //打印
            lines = 500;
          }else {
            lines = size ? size : parseInt(this.view.pageLines);
          }
          searchData = searchData || {};
          if(filterInformations && filterInformations.length > 0) {
            searchData.filterInformations = filterInformations
          }
          if(openParams.queryString) {
            searchData = this.setParams(openParams.queryString, searchData)
          }
          let urlParams = openParams.urlParams;
          if(urlParams) {
            searchData = this.setParams(urlParams, searchData)
          }
          if(openParams.exparams) {
            searchData = this.setParams(openParams.exparams, searchData)
          }
          this.$api.getViewData(
            //普通视图接口
            openParams.appId,
            this.view.id,
            {
              parentId: openParams.parentId,
              isRelate: openParams.isRelate,
              currpage: page ? page : this.currentPage,
              lines: lines,
              searchWord: "",
              sortCol: sortData ? sortData.sortCol : '',
              sortStatus: sortData ? sortData.sortStatus : '',
            },
            searchData ? searchData : {},
            {
              onSucess: (response) => {
                let viewData = response.data;
                resolve(viewData);
              },
            }
          );
        });
      }
    },

    setParams(params, obj){
      params = params.replace(/^(\s|&)+|(\s|&)+$/g, '')
      let list = params.split("&")
      for (let i = 0; i < list.length; i++) {
        let p = list[i].split("=")
        let isJson = this.isJSON(p[1])
        if(isJson) {
          obj[p[0]] = encodeURI(p[1])//encodeURIComponent(p[1])
        }else {
          obj[p[0]] = p[1]?p[1]:''
        }
      }
      return obj
    },

    //获取树形视图节点的数据
    setTreeViewData(nodeKey) {
      let treeData = "";
      let treeName = "";
      this.$api.getTreeViewData(
        //树形视接口
        this.openParams.appId,
        this.openParams.actionContent,
        {
          parentId: nodeKey,
          treedocid: nodeKey,
          parentNodeId: nodeKey,
        },
        treeData,
        treeName,
        {
          onSucess: (response) => {
            let docs = response.data.data.data;
            this.documents = response.data.data.data;
            //this.pagesize = size?size:this.view.pageLines?parseInt(this.view.pageLines):10;
            this.row_count = response.data.data.row_count;
            let tds = [];
            if (docs && docs.length > 0) {
              docs.forEach((doc) => {
                let rows = {};
                rows.formId = doc.formId;
                rows.docId = doc.id;
                rows.children = doc.children;
                for (var key in doc.items) {
                  let items = doc.items[key];
                  rows[key] = items.value;
                }
                if (doc.isSum) {
                  rows.isSum = doc.isSum;
                }
                tds.push(rows);
              });
              this.tableData = tds;
            } else {
              this.tableData = [];
            }
          },
        }
      );
    },

    //清空选择
    toggleSelection() {
      this.$refs.multipleTable.clearSelection();
    },

    handleSelectionChange(val) {
      if(!this.isRunGetData) {
        this.tableSelection = val
      }
      //将长度传回去
      this.$emit('selectNum',val)
      if (this.isView) {
        //视图选择框
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
      } else {
        let docIds = []
        let hasChildren = ""
        if (val.length > 0) {
          for (let i = 0; i < val.length; i++) {
            docIds.push(val[i].docId);
            if (val[i].children) {
              hasChildren = true
            }
          }
        } else {
          docIds = []
        }

        let sy = this.showtype

        if(sy == 'include' || sy == 'tab') { //如果是包含元素或者tab页，获取的docId传到最上层表单
          this.setListViewDocIds(docIds)
        }

        this.$emit("getDocIds", docIds, hasChildren);
      }
    },

    onSearch(searchData, data) {
      let page = 1;
      let size = "";
      this.searchExcelData = data;
      this.getData(page, size, searchData);
      // this.$parent.initView({
      //   appId: this.openParams.appId,
      //   viewId: this.openParams.actionContent,
      //   data: searchData,
      //   exparams: {
      //     currpage: this.currentPage,
      //     lines: this.pagesize
      //   }
      // });
    },

    onWidgetRowClick(row) {
      if (!this.view.readonly) {
        let params = {
          linkType: "00",
          appId: this.openParams.appId,
          actionContent: this.view.displayType == "templateForm" ? this.view.templateForm : row.formId,
          _select: row.docId,
          viewId: this.view.id,
          parentId: this.openParams.parentId ? this.openParams.parentId : "", //包含元素时判断是否有parentId
          isRelate: this.openParams.isRelate ? this.openParams.isRelate : "", //包含元素时判断isRelate是否为true
          searchData: this.searchData,
          showtype: this.showtype,
          templateForm: this.view.templateForm ? this.view.templateForm : "",
        };
        (params.name = this.view.name), this.$emit("event", "view", params);
      }
    },
    /**
     * 隐藏图片
     */
    hiddenImg(){
      this.isShowImg = false;
    },
    /**
     * 判断是否是图片类型
     */
    isImgType(extName){
      switch (extName) {
        case ".jpg":
        case ".jpeg":
        case ".png":
        case ".gif":
        case ".bmp":
          return true;
        default:
          return false;
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

    onRowClick(row) {
      let mouseCopy = this.getSelected(); //是否是鼠标复制
      if(mouseCopy) {
        return
      }
      if(!this.isMultiLevelListHeader) {
        this.listViewScrollTop = this.$refs.multipleTable.bodyWrapper.scrollTop
        let listViewScrollTop = this.listViewScrollTop
        this.$store.commit('saveListViewScrollTop',listViewScrollTop)//记录列表视图滚动条位置
      }
      let openParams = this.openParams
      let view = this.view
      if(row.isSum && row.isSum == true) {//汇总不让点击
        return false
      }
      if (!view.readonly) {
        let formId
        let params = {
          linkType: "00",
          appId: openParams.appId,
          actionContent: '', //formId, //row.formId,
          title: "",
          _select: row.docId,
          viewId: view.id,
          parentId: openParams.parentId ? openParams.parentId : "", //包含元素时判断是否有parentId
          isRelate: openParams.isRelate ? openParams.isRelate : "", //包含元素时判断isRelate是否为true
          searchData: this.searchData,  
          showtype: this.showtype,
          refreshId: openParams.id,  //判断是否得刷新
          id:row.docId + "_" + view.id,
        }
        
        if(view.templateForm) { //判断是模板表单还是普通表单
          formId = view.templateForm
          params.actionContent = view.templateForm
          params.realformId = view.relatedForm
        }else {
          params.actionContent = row.formId;
          formId = row.formId
        }
        if(this.includeDisplayType) {
          params.includeDisplayType = this.includeDisplayType;
        }
        if (this.isView) { //视图选择框
          let arr = [];
          let doc = this.documents[row.index];
          let newRow = JSON.parse(JSON.stringify(row))
          
          let userFieldList = []; //用户选择框用户信息

          for(let key in doc.items) {
            if(doc.items[key].formField == "DepartmentField") {
              let deptValue = newRow[key];
              let data = doc.items[key].data;
              if(data && data.length > 0) {
                for(let i=0; i<data.length; i++) {
                  if(data[i].name == deptValue || data[i].id == deptValue) {
                    newRow[key] = data[i].id;
                    break;
                  }
                }
              }
            }else if(doc.items[key].formField == "UserField") {
              userFieldList.push(doc.items[key]);
            }
          }
          arr.push(newRow);
          let isRadio = true;
          this.$emit("updateViewData", params, arr, isRadio, userFieldList);
        } else {
          this.$api.hasPermissionToForm(openParams.appId, formId, {
            onSucess: (response) => {
              if (response.data.data) {
                if(this.isWidgetChartView){ //如果是widget的视图打开
                  params.name = view.name;
                  this.$emit('action',params)
                  return
                }
                if(openParams.isOpenNewWindow) { //视图时新窗口打开，那么点击后依然是打开新窗口
                  params.isOpenNewWindow = openParams.isOpenNewWindow;
                  let routeData = this.$router.resolve({
                        name: 'open',
                        query: params,
                      });
                  window.open(routeData.href, "_blank");
                }else if(openParams.isExternalLink) { //外链打开，然后新建表单,通过opener组件
                  params.isExternalLink = true; //url是打开opener组件，判断是外链。
                  this.$emit("onAction",params)
                }else {
                  if(this.view.newPage) { //新窗口打开
                    params.isOpenNewWindow = true;
                    params.docid = params._select//params缺少docid会导致视图新窗口打开后的表单 数据没有映射
                    let routeData = this.$router.resolve({
                      name: 'open',
                      query: params,
                    });
                    let winObj = window.open(routeData.href, "_blank");
                    let loop = setInterval(() => {
                      if(winObj.closed) {
                        clearInterval(loop);
                        this.getData(this.currentPage, this.pagesize, this.searchExcelData);
                      }
                    }, 1500);
                  }else if(openParams.isPopupLayerDisplay){ //如果是弹出层打开的视图
                    // this.$parent.setPopupOpenType('FORM', params);
                    this.$emit("popupOpenType",'FORM', params)
                  }else {
                    if (view.openType == 1) { //1为当前页打开
                      if (this.showtype == "include") {
                        params.isIncludeCreate = "include"; //isIncludeCreate判断表单是由包含元素打开
                        this.currentPageParams = params;
                        this.$refs.multipleTable.toggleRowExpansion(row);
                      } else if (this.showtype == "tab") {
                        this.currentPageParams = params;
                        this.$refs.multipleTable.toggleRowExpansion(row);
                      }else if (this.showtype == "target") {
                        let routeData = this.$router.resolve({
                          name: 'open',
                          query: params,
                        });
                        window.open(routeData.href, "_blank");
                      } else {
                        params.name = view.name;
                        this.$emit("openNewpage",params)
                        // this.addTab(params)
                        //this.$emit("add-tab", params); //打开普通视图
                      }
                    } else if (view.openType == 277) { //277为弹窗打开
                      if (this.showtype == "include") {
                        params.isIncludeCreate = "include"; //isIncludeCreate判断表单是由包含元素打开
                        this.$parent.openForm(params);
                      } else {
                        params.type = 277;
                        this.$parent.openForm(params);
                      }
                    } else if (view.openType == 288) {
                      this.$refs.dialog.show(params);
                    } else if (view.openType == 293) {
                      params.name = view.name;
                      this.addTab(params)
                      // this.$emit("add-tab", params); //打开普通视图
                    }
                  }
                }
              } else {
                this.$message({
                  message: this.$t('msg.refuse'),
                  type: "warning",
                });
              }
            },
          });
        }
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
      } else if (value && field == "AttachmentUploadField" || field == 'NullField') {
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
    calctextJump(openType, params, jumpType,styleParams) {
      if(styleParams) {
        params.styleParams = styleParams;
      }
      params.name = params.title || this.view.name
      let showtype = this.showtype
      if(showtype && (showtype == 'tab' || 'include') && params.isRefresh) {
        if(showtype == 'include') {
          params.isIncludeCreate = "include"
        }else if(showtype == 'tab'){
          params.istabCreate = 'tab'
        }
        params.randomRefreshId = new Date().getTime()
        this.$parent.setViewRefreshId(params.randomRefreshId)
      }
      if(jumpType === 'opendocument') {
        if (openType == "open-eject" || openType == "dialog") {
          let type = "FORM";
          this.$parent.openDialogJump(params,type)
        }else if (openType == "open-present") {
          this.$emit("openNewpage",params)
        }else if (openType == "open-blank"){
          let routeData = this.$router.resolve({
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
      // event.stopPropagation();
      return {
        methods: {
          calctextJump: this.calctextJump,
        },
        template: "<div>"+val+"</div>"
      };
    },
  },
  filters: {
    viewFieldPath: function (value, field) {
       ;
      if (value) {
        let arr = JSON.parse(value);
        let name = "";
        if (arr && arr.length > 0) {
          for (let i = 0; i < arr.length; i++) {
            name += arr[i].path + ";";
          }
        }
        name = name.replace(/^(\s|;)+|(\s|;)+$/g, "");
        return name;
      }
    },
  },
};
</script>
<style lang="scss">
/* 根据条件隐藏多选框 */
.mycell.el-checkbox__input {
  display: none;
}
.isSum .cell .el-checkbox:before {
  content: '当前页\A \00A0小计'; //换行\A  空格\00A0
  white-space: pre;
}
.isTotal .cell .el-checkbox:before {
  content: '总计';
  white-space: pre;
}
.el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: #edf2fc;
  border-color: #dcdfe6;
  cursor: not-allowed;
  display: none;
}
.checked-all {
  .el-checkbox__input.is-disabled .el-checkbox__inner {
    background-color: #edf2fc;
    border-color: #dcdfe6;
    cursor: not-allowed;
    display: inline-block;
  }
}
</style>