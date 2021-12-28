<template>
  <div class="view-gridview-wrap">
    <!--isFormPrint等于5的时候是打印的样式-->
    <div
      :class="[isZomm ? 'view-gridview' : 'view-gridview-box']"
      :id="'view_' + view.id"
      :style="[!isZomm ? viewGridviewZomm : '']"
      v-if="isFormPrint != 5"
    >
      <div class="act-btns">
        <div>
          <activity
            v-for="activity in activityBtns"
            :key="activity.id"
            :info="activity"
            @action="onAction"
          />
        </div>
        <div class="zoom-btn" @click="onClickZoom">
          <i class="fa fa-expand fa-lg" style="color: #777" v-show="isZomm"></i>
          <i
            class="fa fa-compress fa-lg"
            style="color: #777"
            v-show="!isZomm"
          ></i>
        </div>
      </div>
      <el-divider></el-divider>
      <!--网格视图查询css(.listview-box)已注释-->
      <div class="listview-box">
        <form_searchform
          :appId="openParams.appId"
          :viewId="openParams.actionContent"
          @onSearch="onSearch"
          ref="searchform"
        />
        <!-- :height="tableHeight" -->
        <el-table
          :style="{ width: totalColumnWidth ? totalColumnWidth : '100%' }"
          :max-height="tableHeight"
          :height="
            fixationHeight
              ? fixationHeight > 0
                ? fixationHeight
                : '150'
              : tableHeight
          "
          v-if="view.columns && view.columns.length > 0"
          :data="tableData"
          :header-cell-style="{ background: '#EBEFF0', color: '#666666' }"
          :row-class-name="tableRowClassName"
          :cell-class-name="checkbox"
          @selection-change="handleSelectionChange"
          @row-click="onRowClick"
        >
          <el-table-column type="selection"></el-table-column>
          <template v-for="column in view.columns">
            <el-table-column
              :key="column.id"
              :prop="column.id"
              :label="column.name"
              min-width="130px"
              :width="column.width ? column.width : tdWidth"
              :filters="column.filtersList"
              :filter-method="filterHandler"
            >
              <template slot-scope="scope">
                <template v-if="status[scope.row.docId] == 1">
                  <!--网格视图下组件的样式和单独控件下的不一致 有两处有网格视图控件的样式，分别在_forms.scss和_view.scss-->
                  <div class="gridview-box" style="min-width: 130px">
                    <div v-if="column.columnField == 'NullField'">
                      {{ scope.row[column.id][0] }}
                    </div>
                    <div v-else>
                      <component
                        name="rowformTemplate"
                        :is="scope.row[column.id][1]"
                      ></component>
                    </div>
                  </div>
                </template>
                <!-- <template v-else>{{scope.row[column.id][0]}}</template> -->
                <template v-else>
                  <div
                    :style="{
                      background: column.showAsLabel ? '' : column.groundColor,
                      color: column.showAsLabel ? '' : column.color,
                      fontSize: column.showAsLabel
                        ? ''
                        : column.fontSize + 'px',
                    }"
                  >
                    <!-- 1 -->
                    <span v-if="column.formatType == 'number'"> </span>
                    <!-- 2 -->
                    <span v-else-if="column.formatType == 'currency'"> </span>
                    <!-- 3 -->
                    <span v-else-if="column.formatType == 'simple'">
                      <span v-if="column.type == 'COLUMN_TYPE_FIELD'">
                        <span
                          v-if="
                            column.displayType == '00' && scope.row[column.id]
                          "
                        >
                          <!--判断是否显示图标-->
                          <span v-if="column.showIcon">
                            <span
                              v-if="
                                column.iconMapping &&
                                getIconMapping(
                                  column.iconMapping,
                                  scope.row[column.id][0]
                                ) == scope.row[column.id][0]
                              "
                            >
                              <img
                                width="32"
                                height="32"
                                :src="
                                  setDefaultIcon(
                                    column.iconMapping,
                                    '',
                                    scope.row[column.id][0]
                                  )
                                "
                              />
                            </span>
                            <span v-else>{{ scope.row[column.id][0] }}</span>
                          </span>
                          <span v-else>
                            <!--视图-流程回退标识-->
                            <span
                              v-if="
                                column.flowReturnCss && scope.row.isRunningBack
                              "
                            >
                              <img
                                src="../assets/images/backstatelabel01.gif"
                              />
                            </span>
                            <span>
                              <span
                                v-if="column.columnField == 'ImageUploadField'"
                              >
                                <span
                                  v-if="
                                    scope.row[column.id][0] &&
                                    scope.row[column.id][0] instanceof Array
                                  "
                                >
                                  <span
                                    v-for="(el, i) in JSON.parse(
                                      scope.row[column.id][0]
                                    )"
                                    :key="i"
                                  >
                                    <img
                                      :title="el.name"
                                      style="max-width: 50px; max-height: 50px"
                                      :src="
                                        viewFieldPath(el, column.columnField)
                                      "
                                      @click.stop="
                                        picturePreview(scope.row[column.id], i)
                                      "
                                    />
                                  </span>
                                </span>
                                <span v-else-if="scope.row[column.id][0]">
                                  <span
                                    v-for="(el, i) in JSON.parse(
                                      scope.row[column.id][0]
                                    )"
                                    :key="i"
                                  >
                                    <img
                                      style="max-width: 50px; max-height: 50px"
                                      :src="
                                        viewFieldPath(el, column.columnField)
                                      "
                                    />
                                  </span>
                                </span>
                              </span>
                              <span
                                class="file-list"
                                v-else-if="
                                  column.columnField ==
                                    'AttachmentUploadField' &&
                                  viewFieldPath(
                                    scope.row[column.id][0],
                                    column.columnField
                                  ).length > 0
                                "
                              >
                                <div
                                  class="magnifyImg"
                                  :style="{
                                    display: isShowImg ? 'block' : 'none',
                                  }"
                                  @click.stop.prevent="hiddenImg"
                                  v-html="addHtml"
                                ></div>
                                <div
                                  class="list"
                                  v-for="(el, fi) in viewFieldPath(
                                    scope.row[column.id][0],
                                    column.columnField
                                  )"
                                  :key="fi"
                                >
                                  <div
                                    :title="el.name"
                                    class="left"
                                    @click.stop.prevent=""
                                  >
                                    {{ el.name }}
                                  </div>
                                  <div class="right">
                                    <i
                                      class="el-icon-download icon-left"
                                      @click.stop.prevent=""
                                    ></i>
                                    <i
                                      class="el-icon-view icon-left"
                                      @click.stop.prevent=""
                                    ></i>
                                    <i
                                      class="el-icon-folder-opened"
                                      @click.stop.prevent=""
                                    ></i>
                                  </div>
                                </div>
                              </span>
                              <span
                                v-else-if="column.columnField == 'NullField'"
                              >
                                <div
                                  v-if="
                                    isJson(
                                      scope.row[column.id][0],
                                      column.columnField
                                    )
                                  "
                                >
                                  <span class="file-list">
                                    <div
                                      class="list"
                                      v-for="(el, fi) in viewFieldPath(
                                        scope.row[column.id][0],
                                        column.columnField
                                      )"
                                      :key="fi"
                                    >
                                      <div
                                        :title="el.name"
                                        class="left"
                                        @click.stop.prevent="
                                          handleFileClick(el)
                                        "
                                      >
                                        {{ el.name }}
                                      </div>
                                      <div class="right">
                                        <i
                                          class="el-icon-download icon-left"
                                          @click.stop.prevent="downloadFile(el)"
                                        ></i>
                                        <i
                                          class="el-icon-view icon-left"
                                          @click.stop.prevent="
                                            handlePreview(el)
                                          "
                                        ></i>
                                        <i
                                          class="el-icon-folder-opened"
                                          @click.stop.prevent="previewFile(el)"
                                        ></i>
                                      </div>
                                    </div>
                                  </span>
                                </div>
                                <span v-else>
                                  <span v-if="scope.row[column.id][2]">
                                    {{ scope.row[column.id][2] }}
                                  </span>
                                  <span v-else>{{
                                    scope.row[column.id][0]
                                  }}</span>
                                </span>
                              </span>
                              <span v-else>
                                <span v-if="scope.row[column.id][2]">
                                  {{ scope.row[column.id][2] }}
                                </span>
                                <span v-else>{{
                                  scope.row[column.id][0]
                                }}</span>
                              </span>
                            </span>
                          </span>
                        </span>
                        <span
                          style="cursor: pointer"
                          :title="scope.row[column.showTitle ? column.id : '']"
                          v-else-if="
                            column.displayType == '01' && scope.row[column.id]
                          "
                        >
                          <span v-if="scope.row[column.id][2]">{{
                            scope.row[column.id][2]
                          }}</span>
                          <span v-else>{{ scope.row[column.id][0] }}</span>
                        </span>
                        <span v-else> &nbsp; </span>
                      </span>
                      <span v-else-if="column.type == 'COLUMN_TYPE_LOGO'">
                        <span v-if="column.iconMapping">
                          {{ column.iconMapping }}
                          <img
                            v-for="(item, index) in column.iconMapping"
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
                            :src="setDefaultIcon(column.icon, true)"
                          />
                        </span>
                      </span>
                      <span v-else-if="column.type == 'COLUMN_TYPE_OPERATE'">
                        <button
                          @click.stop.prevent="buttonClick(column, scope.row)"
                        >
                          {{ column.buttonName }}
                        </button>
                      </span>
                      <span
                        v-else-if="column.type == 'COLUMN_TYPE_SCRIPT'"
                        @click.stop
                      >
                        <!-- v-html="scope.row[column.id]" -->
                        <component
                          :is="template(scope.row[column.id][0])"
                          v-if="scope.row[column.id][0]"
                        ></component>
                      </span>
                      <span v-else-if="column.type == 'COLUMN_TYPE_ROWNUM'">
                        {{ scope.$index + 1 }}
                      </span>
                    </span>
                    <!-- 4 -->
                    <span v-else>
                      <span v-if="column.type == 'COLUMN_TYPE_FIELD'">
                        <span
                          style="cursor: pointer"
                          :title="
                            viewFieldPath(
                              scope.row[column.id][0],
                              column.columnField
                            )
                          "
                          v-if="
                            column.displayType == '00' &&
                            scope.row[column.id][0]
                          "
                        >
                          <span>
                            <span
                              v-if="column.columnField == 'ImageUploadField'"
                            >
                              <span
                                v-if="
                                  scope.row[column.id][0] &&
                                  scope.row[column.id][0] instanceof Array
                                "
                              >
                                <span
                                  v-for="(el, i) in scope.row[column.id][0]"
                                  :key="i"
                                >
                                  <img
                                    style="max-width: 50px; max-height: 50px"
                                    :src="viewFieldPath(el, column.columnField)"
                                  />
                                </span>
                              </span>
                              <span v-else-if="scope.row[column.id][0]">
                                <span
                                  v-for="(el, i) in JSON.parse(
                                    scope.row[column.id][0]
                                  )"
                                  :key="i"
                                >
                                  <img
                                    style="max-width: 50px; max-height: 50px"
                                    :src="viewFieldPath(el, column.columnField)"
                                  />
                                </span>
                              </span>
                            </span>
                            <span
                              class="file-list"
                              v-else-if="
                                column.columnField == 'AttachmentUploadField' &&
                                viewFieldPath(
                                  scope.row[column.id][0],
                                  column.columnField
                                ).length > 0
                              "
                            >
                              <div
                                class="list"
                                v-for="(el, fi) in viewFieldPath(
                                  scope.row[column.id][0],
                                  column.columnField
                                )"
                                :key="fi"
                              >
                                <div class="left" @click.stop.prevent="">
                                  {{ el.name }}
                                </div>
                                <div class="right">
                                  <i
                                    class="el-icon-download icon-left"
                                    @click.stop.prevent=""
                                  ></i>
                                  <i
                                    class="el-icon-view"
                                    @click.stop.prevent=""
                                  ></i>
                                </div>
                              </div>
                            </span>
                            <span v-else>
                              <span v-if="scope.row[column.id][2]">{{
                                scope.row[column.id][2]
                              }}</span>
                              <span v-else>{{ scope.row[column.id][0] }}</span>
                            </span>
                          </span>
                        </span>
                        <span
                          style="cursor: pointer"
                          v-else-if="
                            column.displayType == '01' && scope.row[column.id]
                          "
                        >
                          <span v-if="scope.row[column.id][2]">{{
                            scope.row[column.id][2]
                          }}</span>
                          <span v-else>{{ scope.row[column.id][0] }}</span>
                        </span>
                      </span>
                    </span>
                  </div>
                  <!-- <span v-if="scope.row[column.id][2]">{{scope.row[column.id][2]}}</span>
                  <span v-else>{{scope.row[column.id][0]}}</span> -->
                </template>
              </template>
            </el-table-column>
          </template>
          <el-table-column
            fixed="right"
            :label="$t('operate')"
            width="100"
            v-if="
              view.showActivityColumnType != 3 &&
              includeDisplayType != Constant.PermissionType_READONLY
            "
          >
            <template slot-scope="scope">
              <div v-if="!scope.row.isSum && !scope.row.isTotal">
                <el-button
                  v-if="
                    status[scope.row.docId] != 1 &&
                    (view.showActivityColumnType === 0 ||
                      view.showActivityColumnType === 1)
                  "
                  @click.stop="doEdit(scope.row, view.columns, scope.$index)"
                  type="text"
                  size="small"
                >
                  <span class="icon-box icon-edit-box">
                    <i class="el-icon-edit-outline edit"></i>
                  </span>
                </el-button>
                <el-button
                  v-if="
                    status[scope.row.docId] == 1 &&
                    (view.showActivityColumnType === 0 ||
                      view.showActivityColumnType === 1 ||
                      view.showActivityColumnType === 2 ||
                      view.showActivityColumnType === 3)
                  "
                  @click.stop="doConfirm(scope.row, view.columns)"
                  type="text"
                  size="small"
                >
                  <span class="icon-box">
                    <i class="el-icon-check check"></i>
                  </span>
                </el-button>
                <el-button
                  v-if="
                    status[scope.row.docId] != 1 &&
                    (view.showActivityColumnType === 0 ||
                      view.showActivityColumnType === 2)
                  "
                  @click.stop="doRemove(scope.row, scope.$index)"
                  type="text"
                  size="small"
                >
                  <span class="icon-box">
                    <i class="el-icon-delete del"></i>
                  </span>
                </el-button>
                <el-button
                  v-if="
                    status[scope.row.docId] == 1 &&
                    (view.showActivityColumnType === 0 ||
                      view.showActivityColumnType === 1 ||
                      view.showActivityColumnType === 2 ||
                      view.showActivityColumnType === 3)
                  "
                  @click.stop="doCancel(scope.row, view.columns)"
                  type="text"
                  size="small"
                >
                  <span class="icon-box">
                    <i class="el-icon-close close"></i>
                  </span>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- <div class="page">
        <div class="page-con">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="row_count"
            :page-size="pagesize"
            :current-page.sync="currentPage"
            @current-change="onPageChang($event)"
          ></el-pagination>
        </div>
      </div> -->
    </div>
    <!--打印时显示以下HTML-->
    <template v-else>
      <div class="view-listview-print">
        <table border="0" id="viewTable">
          <thead>
            <tr style="max-width: 30%">
              <td
                nowrap
                v-for="(column, index) in view.columns"
                :key="index"
                :style="{ maxWidth: column.width ? column.width + 'px' : '' }"
              >
                <span class="font-print-size">
                  {{ column.name }}
                </span>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in dataList" :key="index">
              <td
                v-for="(column, inx) in view.columns"
                :key="inx"
                :style="{ maxWidth: column.width ? column.width + 'px' : '' }"
              >
                <div class="content-box" style="font-size: 12px">
                  <!-- <span v-if="column.formatType=='number'">
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

                  <span v-else-if="column.formatType=='simple'">
                    <span v-if="column.type=='COLUMN_TYPE_FIELD'">
                      <span v-if="column.displayType == '00' && row.items[column.id].value">
                        <span v-if="column.showIcon">
                          <span
                            v-if="column.iconMapping && column.iconMapping[0].key == row.items[column.id].value"
                          >
                            <img
                              width="32"
                              height="32"
                              :src="setDefaultIcon(column.iconMapping)"
                            />
                          </span>
                          <span v-else class="font-print-size">{{row.items[column.id].vallue}}</span>
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
                    <span v-else-if="column.type=='COLUMN_TYPE_SCRIPT'" @click.stop>
                      <component :is="template(row.items[column.id].value)" v-if="row.items[column.id].value"></component>
                    </span>
                    <span v-else-if="column.type=='COLUMN_TYPE_ROWNUM'">{{index+1}}</span>
                  </span> -->
                  <!-- v-else -->
                  <span>
                    <span v-if="column.type == 'COLUMN_TYPE_FIELD'">
                      <span
                        style="cursor: pointer"
                        v-if="
                          column.displayType == '00' &&
                          row.items[column.id].value
                        "
                      >
                        <span>
                          <span v-if="column.columnField == 'ImageUploadField'">
                            <span v-if="row.items[column.id].value">
                              <span
                                v-for="(el, i) in JSON.parse(
                                  row.items[column.id].value
                                )"
                                :key="i"
                              >
                                <img
                                  style="max-width: 50px; max-height: 50px"
                                  :src="viewFieldPath(el, column.columnField)"
                                />
                              </span>
                            </span>
                          </span>
                          <span
                            class="file-list"
                            v-else-if="
                              column.columnField == 'AttachmentUploadField' &&
                              viewFieldPath(
                                row.items[column.id].value,
                                column.columnField
                              ).length > 0
                            "
                          >
                            <div
                              class="list"
                              v-for="(el, fi) in viewFieldPath(
                                row.items[column.id].value,
                                column.columnField
                              )"
                              :key="fi"
                            >
                              <div class="left">{{ el.name }}</div>
                            </div>
                          </span>
                          <span v-else class="font-print-size">{{
                            regReplace(row.items[column.id].value)
                          }}</span>
                        </span>
                      </span>

                      <span
                        class="font-print-size"
                        style="cursor: pointer"
                        v-if="
                          column.displayType == '01' &&
                          row.items[column.id].value
                        "
                      >
                        {{ row.items[column.id].value }}
                      </span>
                    </span>
                    <span
                      class="font-print-size"
                      v-else-if="column.type == 'COLUMN_TYPE_SCRIPT'"
                      v-html="row.items[column.id].value"
                    ></span>
                  </span>
                </div>
                <!-- {{row.items[column.id].value}} -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script>
import form_searchform from "@/components/form_searchform.vue";
import activity from "@/components/activity.vue";
import mdialog from "@/components/dialog.vue";
import API from "@/api.js";
import Constant from "@/Constant.js";
import Watermark from "@/assets/js/watermark";
import isJSON from "@/assets/js/isJSON.js";
export default {
  name: "view-gridview",
  props: [
    "openParams",
    "view",
    "showtype",
    "isIncludeViewRefresh",
    "isFormPrint",
    "fixationHeight",
    "includeDisplayType",
  ],
  components: {
    form_searchform,
    activity,
    mdialog,
  },
  data: function () {
    return {
      Constant,
      rowdatas: {},
      status: {}, //存放编辑状态
      currentPage: 1,
      tableData: [],
      tableHeight:
        document.documentElement.clientHeight - 55 - 15 - 45 - 50 - 18 - 20 - 2, // 55: 按钮   15：padding  45：tabs(padding-top)  50: header 18:table的padding 20:padding-bottom 2: border
      row_count: 0,
      dataList: [],
      formdata: "",
      newBuild: "",
      currentFormData: [],
      selectDocId: [],
      allFormdata: [],
      newBuildDocId: [],
      isZomm: true,
      viewGridviewZomm: {
        position: "fixed",
        top: "93px",
        left: "225px",
        zIndex: "2000",
        backgroundColor: "#fff",
      },
      tdWidth: "",
      subDocuments: [],
      totalColumnWidth: "", //网格视图所有视图列都有设置列宽的总和
      activityBtns: [],
    };
  },
  computed: {
    pagesize() {
      return this.view.data ? this.view.data.page_lines : 0;
    },

    listenSaveSubDocments() {
      return this.$store.state.saveSubDocments;
    },

  },
  watch: {
    listenSaveSubDocments(newVal){ //如果是包含元素打开标签页，返回或者关闭页签时刷新视图
      let op = this.openParams;
      if(Object.values(newVal).length > 0 && newVal.docId === op.docId) {
        let subDoc = this.setSaveDoc() || []
        if(subDoc && subDoc.length > 0) {
          this.$store.commit("SET_SUBDOCUMENTS_DATA", {
              sourceDocId: op.docId,
              currentViewFormId: subDoc[0].formId,
              saveData: subDoc
          })
        }
        // if(afd && afd.length > 0) {
        //   afd.forEach(item => {
        //     let bfd = this.buildFormData(true, item.data)
        //     formId = bfd.formId
        //     let saveData = {
        //       edit: true,
        //       formId: bfd.formId,
        //       id: bfd.id,
        //       items: bfd.items
        //     }
        //     if(op.parentId) {
        //       saveData.parentId = op.parentId
        //     }
        //     if(op.isRelate) {
        //       saveData.isRelate = "true"
        //     }
        //     subDoc.push(saveData)
        //   });
        //   this.$store.commit("SET_SUBDOCUMENTS_DATA", {
        //     sourceDocId: op.docId,
        //     currentViewFormId: formId,
        //     saveData: subDoc
        //   })
        // }
      }
    },
  },
  created() {
    let view = this.view;
    if (view.activities && view.activities.length > 0) {
      let arr = [];
      let iType = this.includeDisplayType;
      if (
        iType == Constant.PermissionType_READONLY ||
        iType == Constant.PermissionType_DISABLED
      ) {
        //只读状态下。某些按钮隐藏
        view.activities.forEach((el) => {
          if (
            el.type != 34
          ) {
            arr.push(el);
          }
        });
        this.activityBtns = arr;
      } else {
        this.activityBtns = view.activities;
      }
    }
    let columns = JSON.parse(JSON.stringify(view.columns));
    let count = 0; //网格视图有设置视图列宽度的个数
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].width) {
        count = count + 1;
      }
    }
    if (count == columns.length) {
      //只有当网格所有的视图列的宽度都有设置宽度时totalColumnWidth才会有值
      this.totalColumnWidth = Number(this.totalColumnWidth);
      for (let x = 0; x < columns.length; x++) {
        this.totalColumnWidth =
          this.totalColumnWidth + Number(columns[x].width);
      }
      this.totalColumnWidth = this.totalColumnWidth + 100 + 50 + "px"; //100是操作的宽度，50是打勾的宽度
    }
    columns.forEach((el, i) => {
      if (el.hiddenColumn) {
        columns.splice(i, 1);
        i--;
      }
    });
    let activities = JSON.parse(JSON.stringify(view.activities));
    activities.forEach((el, i) => {
      if (el.type == 18) {
        activities.splice(i, 1);
        i--;
      }
    });
    this.view.columns = columns;
    this.view.activities = activities;
    // let id = "delegate_" + this.openParams.actionContent;
    let id = "formTemplate_" + this.openParams.docId;
    this.$nextTick(() => {
      let dom = document.getElementById(id);
      if (dom) {
        let totalWidth = dom.clientWidth - 40;
        let averageWidth = Math.floor(totalWidth / this.view.columns.length);
        this.tdWidth = averageWidth > 130 ? averageWidth : 130;
      }
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    checkbox(row) {
      if (row.row.isSum) {
        //当前页小计
        return "mycell isSum";
      }
      if (row.row.isTotal) {
        //总计
        return "mycell isTotal";
      }
    },
    onRowClick(row) {
      console.log(100);
      if (!row.isTotal && !row.isSum) {
        this.doEdit(row, this.view.columns, row.index);
      }
    },
    //视图列类型-操作
    template(val) {
      return {
        methods: {
          // calctextJump: this.calctextJump,
        },
        template: "<div>" + val + "</div>",
      };
    },
    previewFile(item) {
      let url = obpmConfig.obpmFilePath + item.path;
      window.open(url);
    },

    downloadFile(file) {
      //列表文件下载
      // let link = document.createElement('a')
      // link.style.display = 'none'
      // link.href = this.obpmConfig.obpmFilePath +
      // "/runtime/file/download?filename="+ file.name +
      // "&filepath=" + file.path;
      // link.setAttribute('download', file.name);
      // link.click();
      let link = document.createElement("a");
      link.style.display = "none";

      let op = obpmConfig.obpmFilePath;
      let statiContextPath = obpmConfig.statiContextPath;
      if (statiContextPath) {
        //5.0 trunk
        op = obpmConfig.contextPath;
      }
      link.href =
        op +
        "/runtime/file/download?filename=" +
        file.name +
        "&filepath=" +
        file.path;
      link.setAttribute("download", file.name);
      link.click();
    },

    handlePreview(file) {
      this.$api.getenvironment({
        onSucess: (res) => {
          if (res.data.errcode === 0) {
            if (res.data.data === true) {
              let realName =
                file.path.split("/")[file.path.split("/").length - 1];
              let isEdit = "edit";
              let waterMark = "";
              let openWaterMark = false;
              let curEditUserId = this.$store.state.myProfile.id;
              let userName = this.$store.state.myProfile.name;
              let showTrackRevisions = false;
              let selectEditPlug = "tray";
              let cp = obpmConfig.obpmFilePath;
              sessionStorage.setItem("obpmContextPath", cp);
              let statiContextPath = obpmConfig.statiContextPath;
              let pdfPath = "";
              if (statiContextPath) {
                //5.0 trunk
                pdfPath = obpmConfig.statiContextPath;
              } else {
                //4.4 stable
                pdfPath = cp;
              }
              let url =
                pdfPath +
                "/portal/vue/pdf/pdfviewer.html?action=" +
                isEdit +
                "&path=" +
                file.path +
                "&name=" +
                realName +
                "&showName=" +
                file.name +
                "&waterMark=" +
                waterMark +
                "&openWaterMark=" +
                openWaterMark +
                "&curEditUserId=" +
                curEditUserId +
                "&userName=" +
                userName +
                "&showTrackRevisions=" +
                showTrackRevisions +
                "&selectEditPlug=" +
                selectEditPlug;
              let URL = encodeURI(url);
              window.open(URL);
            }
          }
        },
      });
    },
    /**
      点击文件直接预览
     */
    handleFileClick(flie) {
      let flieType = flie.name
        .substring(flie.name.lastIndexOf("."))
        .toLowerCase();
      const imgType = this.isImgType(flieType);
      if (imgType) {
        this.isShowImg = true;
        this.addHtml = "<img src=" + obpmConfig.obpmFilePath + flie.path + ">";
      } else {
        this.handlePreview(flie);
      }
    },

    /**
     * 判断是否是图片类型
     */
    isImgType(extName) {
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

    isJson(str) {
      return isJSON(str);
    },

    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property][0] === value;
    },

    getIconMapping(val, keyVal) {
      let valObj = JSON.parse(val);
      for (let i = 0; i < valObj.length; i++) {
        if (valObj[i].key == keyVal) {
          return valObj[i].key;
        }
      }
    },

    //视图列按钮操作
    buttonClick(column, row) {
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
      switch (
        type //type为操作类型
      ) {
        case "00":
          this.$api.beforescript(this.openParams.appId, parentView, id, data, {
            onSucess: (res) => {
              if (res.data.errcode == 0) {
                if (res.data.data) {
                  let resData = res.data.data;
                  if (!resData.type) {
                  } else if (resData.type == 32) {
                    this.$confirm(`${resData.content}`, this.$t("tip"), {
                      confirmButtonText: this.$t("msg.confirm"),
                      cancelButtonText: this.$t("btns.cancel"),
                      type: "warning",
                    })
                      .then(() => {
                        let arr = [];
                        arr.push(docId);
                        this.$api.batchRemoveDocuments(
                          this.openParams.appId,
                          arr,
                          {
                            onSucess: (res) => {
                              this.getData();
                            },
                          }
                        );
                      })
                      .catch(() => {});
                  }
                } else {
                  this.$confirm(this.$t("msg.deldata"), this.$t("tip"), {
                    confirmButtonText: this.$t("msg.confirm"),
                    cancelButtonText: this.$t("btns.cancel"),
                    type: "warning",
                  })
                    .then(() => {
                      let arr = [];
                      arr.push(docId);
                      this.$api.batchRemoveDocuments(
                        this.openParams.appId,
                        arr,
                        {
                          onSucess: (res) => {
                            this.getData();
                          },
                        }
                      );
                    })
                    .catch(() => {});
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
            actionContent: column.templateForm,
            _select: docId,
            name,
            refreshId: this.openParams.id,
          };
          if (this.showtype === "include" || this.showtype === "tab") {
            this.toTab(params);
          } else {
            this.$emit("add-tab", params);
          }
          break;
        case "04":
          this.$api.runActionScript(
            this.openParams.appId,
            parentView,
            id,
            data,
            {
              onSucess: (res) => {
                if (res.data.errcode == 0) {
                  if (res.data.data) {
                    let data = res.data.data;
                    if (data.type == "1") {
                      this.$message(data.content);
                    }
                    if (!data.type) {
                      this.$message(data);
                    }
                  } else {
                    this.$emit("updateView");
                    this.$message({
                      showClose: true,
                      message: this.$t("success"),
                      type: "success",
                    });
                  }
                }
              },
            }
          );
          break;
        case "05":
          let emptyParams = "";
          let arr = [];
          if (jumpMapping) {
            let map = jumpMapping.split(";");
            if (map.length > 0) {
              for (let i = 0; i < map.length; i++) {
                let currentObj = map[i].split(":");
                let obj = {};
                for (let key in row) {
                  if (currentObj[1] === key) {
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
            title: "",
            type: 277,
          };
          this.$parent.openForm(params, emptyParams);
          break;
      }
    },

    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
      if (rowIndex % 2 != 0) {
        return "table-row-color";
      } else {
        return "";
      }
    },

    onClickZoom() {
      let el = document.getElementById("mainHomeContent");
      let delegateWidth = el.getBoundingClientRect().width - 16,
        delegateHeight = el.getBoundingClientRect().height - 40;
      this.viewGridviewZomm.width = delegateWidth + "px";
      this.viewGridviewZomm.height = delegateHeight + "px";
      this.isZomm = !this.isZomm;
    },

    setSubDocuments() {
      let editRow = [];
      if (this.newBuildDocId && this.newBuildDocId.length > 0) {
        //（this.newBuildDocId的数组有问题，未去重）该方法判断如果不是新建的行数据，那么编辑确定后行数据放到editRow数组中
        for (let i = 0; i < this.newBuildDocId.length; i++) {
          for (let j = 0; j < this.tableData.length; j++) {
            if (this.newBuildDocId[i] === this.tableData[j].docId) {
              editRow.push(this.tableData[j]);
            }
          }
        }
      }
      for (let i = 0; i < editRow.length; i++) {
        //判断原有的行数据编辑后，赋予到this.dataList中，改变值，新建的数据不用赋予到this.dataList
        for (let j = 0; j < this.dataList.length; j++) {
          if (editRow[i].docId === this.dataList[j].id) {
            for (let key in editRow[i]) {
              for (let el in this.dataList[j].items) {
                if (key === el) {
                  this.dataList[j].items[el].value = editRow[i][key][0];
                }
              }
            }
          }
        }
      }
      // for (let i = 0; i < this.tableData.length; i++) {  //当table有数据，对数据编辑时，新的数据给旧的数据
      //   for (let j = 0; j < this.dataList.length; j++) {
      //     if (this.tableData[i].docId === this.dataList[j].id) {
      //       for (let key in this.tableData[i]) {
      //         for (let el in this.dataList[j].items) {
      //           if (key === el) {
      //             this.dataList[j].items[el].value = this.tableData[i][key][0];
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      let arr = [];
      for (let i = 0; i < this.dataList.length; i++) {
        let obj = JSON.parse(JSON.stringify(this.dataList[i]));
        obj.items = {};
        for (let j = 0; j < this.view.columns.length; j++) {
          for (let key in this.dataList[i].items) {
            if (key == this.view.columns[j].id) {
              // obj.items[this.view.columns[j].name] = this.dataList[i].items[
              //   key
              // ].value;
              obj.items[this.dataList[i].items[key].name] =
                this.dataList[i].items[key].value;
            }
          }
        }
        arr.push(obj);
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id) {
          arr[i].edit = true;
          arr[i].isRelate = this.openParams.isRelate.toString();
          delete arr[i].isRunningBack;
          arr[i].parentId = this.openParams.parentId; //2020-10-22,执行前脚本错误，注释这里
        } else {
          arr.splice(i, 1);
          i--;
        }
      }
      return arr;
    },

    getData(page) {
      this.getViewData(page).then((response) => {
        // response.data.data.forEach((item,index) => { //网格视图不显示后台配置好的汇总（当前页小计，总计）属性
        //   if(item.isSum) {
        //     response.data.data.splice(index,1)
        //   }
        // })
        let docs = response.data.data;
        this.dataList = response.data.data;
        this.row_count = response.data.row_count;
        let tds = [];
        if (docs.length > 0) {
          docs.forEach((doc, index) => {
            let rows = {};
            let newBuild = {};
            rows.formId = doc.formId;
            rows.docId = doc.id;
            if (doc.isSum) {
              rows.isSum = doc.isSum;
            }
            if (doc.isTotal) {
              rows.isTotal = doc.isTotal;
            }

            newBuild.formId = doc.formId;
            newBuild.docId = doc.id;
            for (var key in doc.items) {
              let items = doc.items[key];
              //rows[key] = items.value;
              rows[key] = [];
              rows[key].push(items.value);
              newBuild[key] = [];
              newBuild[key].push("");
            }
            if (!doc.isSum && !doc.isTotal) {
              this.newBuild = newBuild;
            }
            tds.push(rows);
          });
        } else {
          let newBuild = {};
          for (let i = 0; i < this.view.columns.length; i++) {
            newBuild[this.view.columns[i].id] = [];
            newBuild[this.view.columns[i].id].push("");
          }
          this.newBuild = newBuild;
        }
        if (!this.newBuild) {
          //如果是有总计
          let newBuild = {};
          for (let i = 0; i < this.view.columns.length; i++) {
            newBuild[this.view.columns[i].id] = [];
            newBuild[this.view.columns[i].id].push("");
          }
          this.newBuild = newBuild;
        }
        let columns = this.view.columns;
        columns.forEach((el) => {
          let filtersList = [];
          docs.forEach((items) => {
            for (let key in items.items) {
              if (key == el.id) {
                let obj = {};
                obj.text = items.items[key].value;
                obj.value = items.items[key].value;
                filtersList.push(obj);
              }
            }
          });
          filtersList = this.deteleObject(filtersList);

          el.filtersList = filtersList;
        });
        this.tableData = tds;
        this.$nextTick(() => {
          if (this.view.showWaterMark === true) {
            if (this.view.waterMarkText) {
              //判断是否显示水印
              let val = this.view.waterMarkText;
              let id = "view_" + this.view.id;
              Watermark.set(val, id);
            }
          }
        });
      });
    },

    //模拟数据请求
    getViewData(page) {
      let openParams = this.openParams;
      let treeData = "";
      let treeName = "";
      let searchData = {};
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
      } else if (this.openParams && this.openParams.parentId) {
        //包含元素时
        return new Promise((resolve) => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.openParams.parentId,
              isRelate: this.openParams.isRelate,
              currpage: page ? page : this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 2000,
              searchWord: "",
            },
            {},
            {
              onSucess: (response) => {
                let viewData = response.data;
                resolve(viewData);
              },
            }
          );
        });
      } else {
        if (openParams.queryString) {
          searchData = this.setParams(openParams.queryString, searchData);
        }
        let urlParams = openParams.urlParams;
        if (urlParams) {
          searchData = this.setParams(urlParams, searchData);
        }
        if (openParams.exparams) {
          searchData = this.setParams(openParams.exparams, searchData);
        }
        if (openParams.formParams) {
          searchData = this.setParams(openParams.formParams, searchData);
        }
        return new Promise((resolve) => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.parentId ? this.parentId : "",
              currpage: page ? page : this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 2000,
              searchWord: "",
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

    setParams(params, obj) {
      params = params.replace(/^(\s|&)+|(\s|&)+$/g, "");
      let list = params.split("&");
      for (let i = 0; i < list.length; i++) {
        let p = list[i].split("=");
        let isJson = this.isJSON(p[1]);
        if (isJson) {
          obj[p[0]] = encodeURI(p[1]); //encodeURIComponent(p[1])
        } else {
          obj[p[0]] = p[1] ? p[1] : "";
        }
      }
      return obj;
    },

    isJSON(str) {
      //判断是json字符串
      if (typeof str == "string") {
        try {
          let obj = JSON.parse(str);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
    },

    onPageChang(ev) {
      let page = ev;
      this.getData(page);
      //this.$refs.searchform.onSearchClick();
    },

    onSearch(searchData) {
      this.$parent.initView({
        appId: this.openParams.appId,
        viewId: this.openParams.actionContent,
        data: searchData,
        exparams: {
          currpage: this.currentPage,
          lines: this.pagesize,
        },
      });
    },

    //进入编辑状态
    doEdit(row, column, index, isNewBuild) {
      if (!isNewBuild) {
        // let newBuildDocId = {};
        // newBuildDocId.docId = row.docId;
        this.newBuildDocId.push(row.docId);
      }

      let op = this.openParams
      let objParams = {}
      if(op.isRelate === true || op.isRelate === 'true') { //包含原素或者标签也新建可能会携带isRelate和parentId，需要传到后台
        objParams.isRelate = 'true'
      }else {
        objParams.isRelate = op.isRelate
      }
      if(op.parentId) {
        objParams.parentId = op.parentId
      }

      API.getForm(
        op.appId,
        this.view.relatedForm ? this.view.relatedForm : row.formId,
        row.docId,
        objParams,
        {
          onSucess: (response) => {
            let fields, formdata;
            if (row.data) {
              fields = row.data.fields;
              formdata = row.data;
              this.formdata = formdata;
            } else {
              fields = response.data.data.fields;
              formdata = response.data.data;
              this.formdata = formdata;
              if (isNewBuild) {
                let obj = {};
                const loopOpe = (fields) => {
                  for (let i = 0; i < fields.length; i++) {
                    for (let j = 0; j < this.view.columns.length; j++) {
                      if (fields[i].divId === this.view.columns[j].fieldId) {
                        obj[this.view.columns[j].id] = fields[i];
                      }
                      if (fields[i].tabs && fields[i].tabs.length > 0) {
                        fields[i].tabs.forEach((tab) => {
                          if (tab.fields) {
                            loopOpe(tab.fields);
                          }
                        });
                      }
                    }
                  }
                };
                loopOpe(formdata.fields);
                let newRow = {
                  id: row.docId,
                  edit: true,
                  // formId: row.formId,
                  formId: formdata.fields[0].formId,
                  items: obj,
                  formName: this.$t("view.view_type"),
                };
                this.dataList.push(newRow);
              }
            }
            let eachLine = {
              docId: row.docId,
              data: this.formdata,
            };
            if (isNewBuild) {
              eachLine.isNewBuild = true;
            }
            if (this.allFormdata.length > 0) {
              //每次编辑或者新建把formdata放进这里
              let result = this.allFormdata.some((item) => {
                if (item.docId === eachLine.docId) {
                  return true;
                }
              });
              if (result) {
                for (let i = 0; i < this.allFormdata.length; i++) {
                  if (this.allFormdata[i].docIds === eachLine.docId) {
                    this.allFormdata[i].data = eachLine.data;
                  }
                }
              } else {
                this.allFormdata.push(eachLine);
              }
            } else {
              this.allFormdata.push(eachLine);
            }
            let docId = "";

            const loopOpe = (fields) => {
              for (let item in row) {
                for (let i = 0; i < column.length; i++) {
                  if (item == column[i].id) {
                    //this.view.columns[i].control = formdata;
                    let controlName = row.docId + "_" + column[i].fieldName;
                    fields.forEach((fld) => {
                      let template = "";
                      //网格视图的表单的样式在这里写个class，通过class去_view.scss的.gridview-box里面添加样式
                      if (fld.formField == "InputField") {
                        template =
                          "<div class='gridview-InputField-control'><o-input id='" + fld.id + "'></o-input></div>";
                      } else if (fld.formField == "RadioField") {
                        template =
                          "<div class='gridview-radio-control'><o-radio id='" +
                          fld.id +
                          "'></o-radio></div>";
                      } else if (fld.formField == "CheckboxField") {
                        template =
                          "<div class='gridview-checkbox-control'><o-checkbox id='" +
                          fld.id +
                          "'></o-checkbox></div>";
                      } else if (fld.formField == "SelectField") {
                        template =
                          "<div class='gridview-SelectField-control'><o-select id='" +
                          fld.id +
                          "'></o-select></div>";
                      } else if (fld.formField == "IncludeField") {
                        template =
                          "<div><o-include id='" +
                          fld.id +
                          "'></o-include></div>";
                      } else if (fld.formField == "TextareaField") {
                        template =
                          "<div class='gridview-TextareaField-control'><o-textarea id='" +
                          fld.id +
                          "'></o-textarea></div>";
                      } else if (fld.formField == "DateField") {
                        template =
                          "<div class='gridview-DateField-control'><o-date-picker id='" +
                          fld.id +
                          "'></o-date-picker></div>";
                      } else if (fld.formField == "UserField") {
                        template =
                          "<div class='gridview-UserField-control'><o-user-select id='" +
                          fld.id +
                          "'></o-user-select></div>";
                      } else if (fld.formField == "DepartmentField") {
                        template =
                          "<div><o-dept-select id='" +
                          fld.id +
                          "'></o-dept-select></div>";
                      } else if (fld.formField == "ImageUploadField") {
                        template =
                          "<div class='gridview-image-control'><o-image-upload id='" +
                          fld.id +
                          "'></o-image-upload></div>";
                      } else if (fld.formField == "AttachmentUploadField") {
                        template =
                          "<div><o-file-upload id='" +
                          fld.id +
                          "'></o-file-upload></div>";
                      } else if (fld.formField == "QRCodeField") {
                        template =
                          "<div><o-qrcode id='" +
                          fld.id +
                          "'></o-qrcode></div>";
                      } else if (fld.formField == "TreeDepartmentField") {
                        template =
                          "<div><o-dept-tree-select id='" +
                          fld.id +
                          "'></o-dept-tree-select></div>";
                      } else if (fld.formField == "SelectAboutField") {
                        template =
                          "<div class='gridview-SelectAboutField-control'><o-select-about id='" +
                          fld.id +
                          "'></o-select-about></div>";
                      } else if (fld.formField == "HTMLEditorField") {
                        template =
                          "<div><o-html id='" + fld.id + "'></o-html></div>";
                      } else if (fld.formField == "SurveyField") {
                        template =
                          "<div><o-survey id='" +
                          fld.id +
                          "'></o-survey></div>";
                      } else if (fld.formField == "FlowHistoryField") {
                        template =
                          "<div><o-flow-history id='" +
                          fld.id +
                          "'></o-flow-history></div>";
                      } else if (fld.formField == "ButtonField") {
                        template =
                          "<div><o-button id='" +
                          fld.id +
                          "'></o-button></div>";
                      } else if (fld.formField == "ViewDialogField") {
                        template =
                          "<div><o-view-dialog id='" +
                          fld.id +
                          "'></o-view-dialog></div>";
                      } else if (fld.formField == "TabField") {
                        template =
                          "<div><o-tab id='" + fld.id + "'></o-tab></div>";
                      } else if (fld.formField == "GenericWordField") {
                        template =
                          "<div><o-word id='" + fld.id + "'></o-word></div>";
                      } else if (fld.formField == "WeixinGpsField") {
                        template =
                          "<div><o-gps id='" + fld.id + "'></o-gps></div>";
                      } else if (fld.formField == "CalctextField") {
                        template =
                          "<div><o-calctext id='" +
                          fld.id +
                          "'></o-calctext></div>";
                      } else if (fld.formField == "FlowReminderHistoryField") {
                        template =
                          "<div><o-flow-reminder-history id='" +
                          fld.id +
                          "'></o-flow-reminder-history></div>";
                      } else if (fld.formField == "OnLineTakePhotoField") {
                        template =
                          "<div class='gridview-photo-control'><o-photo id='" +
                          fld.id +
                          "'></o-photo></div>";
                      } else if (fld.formField == "SuggestField") {
                        template =
                          "<div><o-suggest id='" +
                          fld.id +
                          "'></o-suggest></div>";
                      } else if (fld.formField == "NoField") {
                        template =
                          "<div><o-coding id='" +
                          fld.id +
                          "'></o-coding></div>";
                      }

                      if (fld.formField != "IncludeField") {
                        if (controlName == fld.id) {
                          let temp = {
                            methods: {
                              findField(controlName) {
                                if (controlName == fld.id) {
                                  return fld;
                                }
                                return {
                                  id: fld.id,
                                  displayType: Constant.PermissionType_HIDDEN,
                                  hiddenValue: "",
                                };
                              },
                              refresh: this.refresh,
                              checkData: this.checkData,
                              getAllFields: this.getAllFields,
                            },
                            template: template,
                          };
                          if (!this.tableData[index][item][1]) {
                            this.tableData[index][item][1] = temp;
                          }
                        }
                      }
                      if (fld.tabs && fld.tabs.length) {
                        fld.tabs.forEach((tab) => {
                          if (tab.fields) {
                            loopOpe(tab.fields);
                          }
                        });
                      }
                    });
                  }
                }
              }
            };
            loopOpe(fields);
            this.$set(this.status, row.docId, 1);
          },
        }
      );
    },

    //确定记录
    doConfirm(row, column) {
      let buildData = "";
      let op = this.openParams;
      let appId = this.openParams.appId,
        id = this.openParams.parentId,
        viewId = this.view.id;
      for (let i = 0; i < this.allFormdata.length; i++) {
        if (row.docId === this.allFormdata[i].docId) {
          buildData = this.allFormdata[i].data;
        }
      }
      let jsonData = this.buildFormData(true, buildData);
      this.$api.setGridView(appId, viewId, id, jsonData, {
        onSucess: (response) => {
          if (response.data.errcode == 0) {
            let showtype = this.showtype;
            if (showtype && (showtype == "include" || showtype == "tab")) {
              for (let i = 0; i < this.allFormdata.length; i++) {
                if (row.docId === this.allFormdata[i].docId) {
                  buildData = this.allFormdata[i].data;
                }
              }
              let jsonData = this.buildFormData("isInclude", buildData);
              if (op.isRelate === true) {
                jsonData.isRelate = "true";
              }
              const loopOpe = (fields) => {
                for (let i = 0; i < fields.length; i++) {
                  for (let j = 0; j < column.length; j++) {
                    if (column[j].fieldId == fields[i].divId) {
                      if (fields[i].formField === "DateField") {
                        row[column[j].id][0] = this.writeCurrentDate(
                          fields[i].value,
                          fields[i].dateFormat
                        );
                      } else if (fields[i].formField === "SelectField") {
                        //某些控件有显示值，给显示显示值（未完善），编辑数据保存时，显示值保存到了后台（错了）
                        let options = fields[i].options;
                        for (let z = 0; z < options.length; z++) {
                          if (options[z].value === fields[i].value) {
                            // row[column[j].id].push(options[z].option);
                            row[column[j].id][2] = options[z].option
                          }
                        }
                        row[column[j].id][0] = fields[i].value;
                      } else if (fields[i].formField === "DepartmentField") {
                        let valArr = "";
                        let value = fields[i].value;
                        let deptName = "";
                        if (value) {
                          valArr = value.split(";");
                        }
                        if (valArr && valArr.length > 0) {
                          let data = fields[i].options;
                          valArr.forEach((item) => {
                            data.forEach((el) => {
                              if (item == el.value) {
                                deptName += el.option + ";";
                              }
                            });
                          });
                        }
                        deptName = deptName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                        row[column[j].id][0] = deptName;
                      } else if (
                        fields[i].formField === "TreeDepartmentField"
                      ) {
                        let valArr = "";
                        let value = fields[i].value;
                        let deptName = "";
                        if (value) {
                          valArr = value.split(";");
                        }
                        if (valArr && valArr.length > 0) {
                          let data = fields[i].data;
                          valArr.forEach((item) => {
                            data.forEach((el) => {
                              if (item == el.key) {
                                deptName += el.label + ";";
                              }
                            });
                          });
                        }
                        deptName = deptName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                        row[column[j].id][0] = deptName;
                      } else if (fields[i].formField === "UserField") {
                        let valArr = "";
                        let value = fields[i].value;
                        let userName = "";
                        if (value) {
                          valArr = value.split(";");
                        }
                        if (valArr && valArr.length > 0) {
                          let data = fields[i].data;
                          valArr.forEach((item) => {
                            data.forEach((el) => {
                              if (item == el.id) {
                                userName += el.name + ";";
                              }
                            });
                          });
                        }
                        userName = userName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                        row[column[j].id][0] = userName;
                      } else {
                        row[column[j].id][0] = fields[i].value;
                      }
                    }
                  }
                  if (fields[i].tabs && fields[i].tabs.length > 0) {
                    fields[i].tabs.forEach((tab) => {
                      if (tab.fields) {
                        loopOpe(tab.fields);
                      }
                    });
                  }
                }
              };
              loopOpe(buildData.fields);
              this.$set(this.status, row.docId, 0);
              this.$api.refreshView(jsonData, {
                onSucess: (res) => {
                  if (res.data.errcode === 0) {
                    let obj = {};
                    obj.data = this.setSubDocuments();
                    obj.isRefresh = this.isIncludeViewRefresh;
                    this.$store.commit("saveSubDocuments", obj);
                  }
                },
              });
              //this.$set(this.status, row.docId, 0);
            } else {
              let allFormdata = this.allFormdata;
              let formdata = "";
              for (let z = 0; z < allFormdata.length; z++) {
                if (row.docId === allFormdata[z].docId) {
                  formdata = allFormdata[z].data;
                  break;
                }
              }
              for (let i = 0; i < formdata.fields.length; i++) {
                for (let j = 0; j < column.length; j++) {
                  if (column[j].fieldId == formdata.fields[i].divId) {
                    if (formdata.fields[i].formField === "DateField") {
                      row[column[j].id][0] = this.writeCurrentDate(
                        formdata.fields[i].value,
                        formdata.fields[i].dateFormat
                      );
                    } else if (formdata.fields[i].formField === "SelectField") {
                      let options = formdata.fields[i].options;
                      for (let z = 0; z < options.length; z++) {
                        if (options[z].value === formdata.fields[i].value) {
                          row[column[j].id][2] = options[z].option////row[column[j].id].push(options[z].option);
                        }
                      }
                      row[column[j].id][0] = formdata.fields[i].value;
                    } else if (
                      formdata.fields[i].formField === "DepartmentField"
                    ) {
                      let valArr = "";
                      let value = formdata.fields[i].value;
                      let deptName = "";
                      if (value) {
                        valArr = value.split(";");
                      }
                      if (valArr && valArr.length > 0) {
                        let data = formdata.fields[i].options;
                        valArr.forEach((item) => {
                          data.forEach((el) => {
                            if (item == el.value) {
                              deptName += el.option + ";";
                            }
                          });
                        });
                      }
                      deptName = deptName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                      row[column[j].id][0] = deptName;
                    } else if (
                      formdata.fields[i].formField === "TreeDepartmentField"
                    ) {
                      let valArr = "";
                      let value = formdata.fields[i].value;
                      let deptName = "";
                      if (value) {
                        valArr = value.split(";");
                      }
                      if (valArr && valArr.length > 0) {
                        let data = formdata.fields[i].data;
                        valArr.forEach((item) => {
                          data.forEach((el) => {
                            if (item == el.key) {
                              deptName += el.label + ";";
                            }
                          });
                        });
                      }
                      deptName = deptName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                      row[column[j].id][0] = deptName;
                    } else if (formdata.fields[i].formField === "UserField") {
                      let valArr = "";
                      let value = formdata.fields[i].value;
                      let userName = "";
                      if (value) {
                        valArr = value.split(";");
                      }
                      if (valArr && valArr.length > 0) {
                        let data = formdata.fields[i].data;
                        valArr.forEach((item) => {
                          data.forEach((el) => {
                            if (item == el.id) {
                              userName += el.name + ";";
                            }
                          });
                        });
                      }
                      userName = userName.replace(/^(\s|;)+|(\s|;)+$/g, "");
                      row[column[j].id][0] = userName;
                    } else {
                      row[column[j].id][0] = formdata.fields[i].value;
                    }
                    this.$set(this.status, row.docId, 0);
                  }
                }
              }
              /*
                下面那些实在没办法，先这样写了。
              */
              row.data = formdata;
              let obj = {
                docId: row.docId,
                data: formdata,
              };
              this.currentFormData.push(obj);
            }
          } else if (response.data.errcode == 4001) {
            let promptData = "";
            let errcode = response.data.errcode;
            let errmsg = response.data.errmsg;
            let errorsList = response.data.errors;
            if (errorsList && errorsList.length > 0) {
              errorsList.forEach((item) => {
                promptData += item.errmsg + "<br>";
              });
            }
            this.promptBox(errcode, errmsg, promptData);
          }
        },
      });
    },

    getAllFields() {
      return this.formdata.fields;
    },

    //执行脚本前
    runBeforeAction(act) {
      let op = this.openParams;
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: "",
        templateForm: this.view.templateForm,
        viewId: op.actionContent,
        _selects: this.selectDocId.length > 0 ? this.selectDocId : [],
      };
      if (op.parentId) {
        formData.parentId = op.parentId;
        formData.isRelate = op.isRelate;
      }
      let divId = act.id;
      this.$api.runBeforeActionScript(
        this.openParams.appId,
        divId,
        formData,
        act.type,
        "", //treedocid
        "", //flowType
        {
          onSucess: (response) => {
            if (response.data.data) {
              //如果有数据返回，结束下一步
              let resData = response.data.data;
              let errmsg = response.data.data.content;
              if (!resData.type) {
                //没有type值，但是有返回数据，把数据放进document
                if (resData.changedField) {
                  this.$notify.success({
                    title: resData.content,
                    message: "",
                  });
                }
              } else if (resData.type == 1) {
                this.$notify.success({
                  title: errmsg,
                  message: "",
                });
              } else if (resData.type == 16) {
                this.$notify.error({
                  title: errmsg,
                  message: "",
                });
              } else if (resData.type == 32) {
                this.$confirm(`${errmsg}`, this.$t("tip"), {
                  confirmButtonText: this.$t("msg.confirm"),
                  cancelButtonText: this.$t("btns.cancel"),
                  type: "warning",
                })
                  .then(() => {
                    switch (act.type) {
                      case 1: //载入视图
                        this.getTemplate(act);
                        break;
                      case 2: //新建表单
                        this.doCreate(act);
                        break;
                      case 3: //删除数据
                        for (let i = 0; i < this.selectDocId.length; i++) {
                          for (let j = 0; j < this.dataList.length; j++) {
                            if (this.selectDocId[i] == this.dataList[j].id) {
                              this.dataList[j].delete = true;
                            }
                          }
                        }
                        for (let i = 0; i < this.selectDocId.length; i++) {
                          for (let j = 0; j < this.tableData.length; j++) {
                            if (
                              this.selectDocId[i] == this.tableData[j].docId
                            ) {
                              this.tableData.splice(j, 1);
                              j--;
                            }
                          }
                        }
                        let obj = {};
                        obj.data = this.setSubDocuments();
                        obj.isRefresh = this.isIncludeViewRefresh;
                        this.$store.commit("saveSubDocuments", obj);
                        break;
                      case 34:
                        this.doSave(act);
                        break;
                      default:
                        this.getTemplate(act);
                        break;
                    }
                  })
                  .catch(() => {});
              }
            } else {
              if (act.type == 2) {
                this.doCreate(act);
              } else if (act.type == 3) {
                for (let i = 0; i < this.selectDocId.length; i++) {
                  for (let j = 0; j < this.dataList.length; j++) {
                    if (this.selectDocId[i] == this.dataList[j].id) {
                      this.dataList[j].delete = true;
                    }
                  }
                }
                for (let i = 0; i < this.selectDocId.length; i++) {
                  for (let j = 0; j < this.tableData.length; j++) {
                    if (this.selectDocId[i] == this.tableData[j].docId) {
                      this.tableData.splice(j, 1);
                      j--;
                    }
                  }
                }
                let obj = {};
                obj.data = this.setSubDocuments();
                obj.isRefresh = this.isIncludeViewRefresh;
                this.$store.commit("saveSubDocuments", obj);
              } else if (act.type == 34) {
                this.doSave(act);
              } else {
                this.getTemplate(act);
              }
            }
          },
        }
      );
    },

    //执行脚本后
    runAfterAction(act, docIds) {
      let op = this.openParams;
      let formData = {
        docId: "",
        document: {},
        formId: this.view.relatedForm,
        parentId: "",
        templateForm: "",
        viewId: this.openParams.actionContent,
        _selects: docIds && docIds.length > 0 ? docIds : [],
      };

      let appId = this.openParams.appId;
      let divId = act.id;
      let docId = "";
      let parentId = "";
      let _templateForm = "";
      let _ = "";
      if (op.parentId) {
        formData.parentId = op.parentId;
        formData.isRelate = op.isRelate;
        parentId = op.parentId;
      }
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
        "", //treedocid
        {
          onSucess: (response) => {
            if (response.data.errcode == 0) {
              if (act.type == 34) {
                // this.getData();
                this.$parent.updateView()
              }

              if (response.data.data) {
                let errmsg = response.data.data.content.content;
                this.$notify({
                  title: errmsg,
                  message: "",
                  type: "warning",
                });
              } else {
                if (act.type == 20) {
                  this.popupVisible = false;
                }
              }

              if (act.type == 2) {
                //新建， 针对最外层直接保存
                let _afd = this.allFormdata;
                let _dl = this.dataList;
                let view = this.view;
                let op = this.openParams;
                this.$store.commit("SET_SUBDOCUMENTS_DATA", {
                  _afd,
                  _dl,
                  view,
                  op,
                });
              }
            }
          },
        }
      );
    },

    setSaveDoc(){
            //针对直接保存包含元素，单点击确定的勾后也行
      let _afd = this.allFormdata;
      let _dl = this.dataList;

      if (_afd && _afd.length > 0) {
        for (let i = 0; i < _afd.length; i++) {
          for (let j = 0; j < _dl.length; j++) {
            if (_afd[i].docId == _dl[j].id) {
              let fields = _afd[i].data.fields
              let items = _dl[j].items
              _dl[j].edit = true
              for (let key in items) {
                for (let z = 0; z < fields.length; z++) {
                  if (items[key].id == fields[z].id) {
                    items[key].value = fields[z].value
                  }
                }
              }
            }
          }
        }
      }

      let arr = [];
      let dataList = this.dataList;
      if(dataList.length >= 1) { 
        for(let x = 0; x < dataList.length; x++) { //网格视图当前页小计和总计不保存
          if(dataList[x].isSum || dataList[x].isTotal) {
            dataList.splice(x--,1);  //x要--
          }
        }
      }
      let view = this.view;
      let op = this.openParams;
     
      for (let i = 0; i < dataList.length; i++) {
        let obj = JSON.parse(JSON.stringify(dataList[i]));
        if (op.parentId) {
          obj.parentId = op.parentId;
        }
        if (op.isRelate === true) {
          obj.isRelate = "true";
        }
        obj.items = {};
        if(obj.edit || obj["delete"]) {
          for (let j = 0; j < view.columns.length; j++) {
            for (let key in dataList[i].items) {
              if (key == view.columns[j].id) {
                obj.items[dataList[i].items[key].name] =
                  dataList[i].items[key].value;
                if (dataList[i].delete) {
                  delete dataList[i].edit;
                  delete dataList[i].isRelate;
                  delete dataList[i].isRunningBack;
                  delete dataList[i].parentId;
                  continue;
                } else {
                  if (dataList[i].edit) {
                    obj.edit = true;
                  } 
                }
              }
            }
          }
          arr.push(obj);
        }
      }
      if(arr && arr.length > 0) {
        arr.forEach(item => {
          if(item["delete"] && item.edit) {
            delete item.edit
          }
        })
      }
      return arr
    },

    doSave(act) {
      let jsonData = {};
      jsonData.data = this.setSaveDoc();
      if (!this.showtype) {
        //普通视图删除后保存
        arr.forEach((el) => {
          if (el.delete) {
            delete el.edit;
            el.items = {};
          }
        });
      }

      this.$api.saveGridview(this.openParams.appId, jsonData, {
        onSucess: (res) => {
          if (res.data.errcode === 0) {
            this.$notify({
              title: res.data.errmsg,
              message: "",
              type: "success",
            });
            this.runAfterAction(act);
          } else if (res.data.errcode === 4001) {
            let promptData = "";
            let errcode = res.data.errcode;
            let errmsg = res.data.errmsg;
            let errorsList = res.data.errors;
            if (errorsList && errorsList.length > 0) {
              errorsList.forEach((item) => {
                promptData += item.errmsg + "<br>";
              });
            }
            this.promptBox(errcode, errmsg, promptData);
          }
        },
      });
    },

    //获取视图模板
    getTemplate(act) {
      this.$emit("gridviewTem", act);
      // let op = this.openParams;
      // let appId = op.appId;
      // let viewId = act.onActionView;
      // let exparams = {};
      // let st = this.showtype;
      // if((st && st == 'tab') || (st && st == 'include')) { //如果是控件选项卡或包含元素
      //   exparams.parentId = op.parentId;
      //   exparams.isRelate = op.isRelate;
      // }
      // this.$api.getViewTemplate(appId, viewId, exparams, {
      //   onSucess: response => {
      //     if(response.data.errcode == 0) {
      //       this.runAfterAction(act, []);
      //     }
      //   }
      // })
    },

    //返回成功或失败时的提示框
    promptBox(errcode, errmsg, title) {
      let that = this;
      let p = new Promise(function (resolve) {
        if (errcode == 4001) {
          that.$toastr.e({
            closeButton: true,
            title: errmsg,
            msg: title,
            clickClose: true, //Disable click to close
            timeout: 3000, // 3 sec
            type: "error", //error, warning, success, info
            preventDuplicates: true,
          });
        } else if (errcode == 0) {
          that.$toastr.s({
            closeButton: true,
            msg: errmsg,
            clickClose: true,
            timeout: 2000,
            type: "success",
            preventDuplicates: true,
          });
          resolve("成功");
        }
      });
      return p;
    },

    handleSelectionChange(val) {
      let docIds = [];
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          docIds.push(val[i].docId);
        }
      } else {
        docIds = [];
      }
      this.selectDocId = docIds;
      this.$emit("getDocIds", docIds);
    },

    onAction(act) {
      //绑定视图的处理事件
      let activityType = act.type;
      switch (act.type) {
        case 1: //载入视图
          this.runBeforeAction(act);
          break;
        case 2: //创建
          this.runBeforeAction(act);
          break;
        case 3: //删除
          if (this.selectDocId.length <= 0) {
            this.$message({
              message: this.$t("msg.least_one_data"),
              type: "warning",
            });
          } else {
            this.runBeforeAction(act);
          }
          // this.doRemove(act);
          break;
        case 4: //保存并启动流程
          break;
        case 5: //流程处理
          this.$parent.flowHandle();
          break;
        case 8: //关闭窗口
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 10: //返回
          this.doBack();
          //this.$parent.goBack();
          break;
        case 11: //保存并返回
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 13: //无
          break;
        case 14: //网页打印(表单)
        case 15: //网页打印含历史
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 16: //导出excel
          this.$parent.runBeforeAction(act, "", "", activityType);
          break;
        case 19: //保存草稿不校检
          //this.$parent.saveDraft();
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 18: //清空所有数据
          break;
        case 20: //批量提交
          this.$parent.showSubmitPanel(act, this.selectDocId);
          break;
        case 21: //保存并复制
        case 25: //PDF导出
        case 26: //文件下载
          this.$parent.runBeforeAction(act);
          break;
        case 27: //导入excel
          this.$parent.runBeforeAction(act, "", "", activityType);
          break;
        case 28: //电子签章
          break;
        case 29: //批量签章
          break;
        case 33: //流程启动
          break;
        case 34: //保存
          this.runBeforeAction(act);
          break;
        case 36: //网页打印(视图)
          this.$parent.runBeforeAction(act);
          // this.$emit("action",act);
          break;
        case 37: //邮件短信分享
          break;
        case 42: //保存并新建
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 43: //跳转
          this.$parent.runBeforeAction(act);
          break;
        case 45: //归档
          this.$parent.runBeforeAction(act.id, "", "", activityType);
          break;
        case 46: //签章
          break;
        case 47: //回退流程
          break;
        case 48: //催办流程
          break;
        case 49: //挂起流程
          break;
        case 50: //恢复流程
          break;
        case 51: //回撤流程
          break;
        case 52: //终止流程
          break;
        case 53: //编辑流程审批人
          break;
        case 54: //调整流程
          break;
        case 55: //点评
          break;
        case 56: //补签
          break;
        case 57: //加签主办
          break;
        case 58: //加签协办
        default:
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

    reloadListView() {
      this.getData();
    },

    checkData(value, fieldId) { //method哪里注释了，因为每一行buildFormData()的数据都不一样，有空再改了
      if (value) {
        let allFormdata = this.allFormdata
        let haveRow = false
        let index = ''
        let data
        if(allFormdata && allFormdata.length > 0) {
          for(let i=0; i<allFormdata.length; i++) {
            if(fieldId == allFormdata[i].docId) {
              index = i
              haveRow = true
              break
            }
          }
        }
        if(haveRow) {
          data = this.buildFormData(true, allFormdata[index].data)
        }else {
          data = this.buildFormData()
        }
        return data;
        // let data = this.buildFormData();
        // return data;
      }
    },

    refresh(fieldId) {
      let fieldid = fieldId.replace(/\"/g, "")
      let idArr = fieldid.split("_")
      let currentDocId = idArr[0] + "__" + idArr[2]
      let allFormdata = this.allFormdata
      let haveRow = false
      let index = ''
      let fd = ''
      if(allFormdata && allFormdata.length > 0) {
        for(let i=0; i<allFormdata.length; i++) {
          if(currentDocId == allFormdata[i].docId) {
            index = i
            haveRow = true
            break
          }
        }
      }
      let formdata = ''
      if(haveRow) {
        fd = this.buildFormData(true, allFormdata[index].data)
        formdata = allFormdata[index].data
      }else {
        fd = this.buildFormData()
        formdata = formdata
      }
      //刷新方法
      let data = {
        document: fd,
        formId: this.view.relatedForm,
        docId: fd.id,
        parentId: "",
        templateForm: "",
        viewId: "",
        applicationId: fd.applicationId,
        id: fd.id,
      };
      API.refreshForm(fieldId, data, {
        onSucess: (response) => {
          let fields = response.data.data
          let keys = Object.keys(fields)
          keys.forEach((key) => {
            let field = fields[key];
            formdata.fields.forEach((f, i) => {
              if (field.id == f.id) {
                formdata.fields[i].value = field.value //只能更新value，而不能简单做对象替换，field.value绑定在组件v-model上，如果直接替换只是数组内存指针简单变更
                formdata.fields[i].options = field.options
                formdata.fields[i].tabs = field.tabs
                //如果为选择类型field，则options也要在这里替换.....
                formdata.fields[i].displayType = field.displayType
              }
            })
          })
        },
      });
    },

    buildFormData(val, buildData) {
      let formDataFields = "";
      if (val == "isInclude" || val) {
        formDataFields = buildData.fields
      } else {
        formDataFields = this.formdata.fields
      }
      let items = {}
      if(formDataFields){
        const loopOpe = fields => {
          for (let i = 0; i < fields.length; i++) {
            let fld = fields[i]
            if (
              fld.name &&
              fld.value != undefined &&
              fld.formField != "ButtonField" && 
              fld.displayType != undefined
            ) {
              if(fld.textType =="hidden" && fld.value ) {
                items[fld.name] = fld.value;
              }else if(fld.textType !="hidden"){
                items[fld.name] = fld.value
              }
              if(fld.textType =="hidden" && !fld.value) {
                if(fld.isUpdatedValue) { //这里针对视图选择框 隐藏并且没值时，但有选过值，也要把这个属性传到后台
                  items[fld.name] = ''
                }
              }
            }
            if(fld.addInTtems) {
              items[fld.name] = fld.value
            }
            if(fld.tabs && fld.tabs.length>0) {
              fld.tabs.forEach(tab => {
                if(tab.fields) {
                  loopOpe(tab.fields)
                }
              })
            }
          }
        }
        loopOpe(formDataFields)
      }

      // for (let i = 0; i < formDataFields.length; i++) {
      //   let fld = formDataFields[i];
      //   //items[fld.name] = fld.value;
      //   if (
      //     fld.name &&
      //     fld.value != undefined &&
      //     fld.formField != "ButtonField" &&
      //     fld.displayType != undefined
      //   ) {
      //     if (fld.textType == "hidden" && fld.value) {
      //       items[fld.name] = fld.value;
      //     } else if (fld.textType != "hidden") {
      //       items[fld.name] = fld.value;
      //     }
      //   }
      //   if (fld.tabs && fld.tabs.length > 0) {
      //     for (let j = 0; j < fld.tabs.length; j++) {
      //       if (fld.tabs[j].fields && fld.tabs[j].fields.length > 0) {
      //         for (let y = 0; y < fld.tabs[j].fields.length; y++) {
      //           let tabVal = fld.tabs[j].fields[y];
      //           if (
      //             tabVal.name &&
      //             tabVal.value != undefined &&
      //             tabVal.formField != "ButtonField" &&
      //             tabVal.displayType != undefined
      //           ) {
      //             if (tabVal.textType == "hidden" && tabVal.value) {
      //               items[tabVal.name] = tabVal.value;
      //             } else if (tabVal.textType != "hidden") {
      //               items[tabVal.name] = tabVal.value;
      //             }
      //             //items[tabVal.name] = tabVal.value;
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      return {
        applicationId: this.openParams.appId,
        formId: formDataFields[0].formId,
        id: formDataFields[0].docId,
        items: items,
        parentId: this.openParams.parentId ? this.openParams.parentId : "",
        sign: "",
        subDocuments: [],
        versions: "0",
      };
    },

    writeCurrentDate(val, dateFormat) {
      if (val) {
        let now = new Date(val);
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let date = now.getDate();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();

        month = month < 10 ? "0" + month : month;
        date = date < 10 ? "0" + date : date;
        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        second = second < 10 ? "0" + second : second;
        if (dateFormat == "HH:mm:ss") {
          return val; //hour+":"+minute+":"+second;
        } else if (dateFormat == "yyyy-MM-dd HH:mm:ss") {
          return (
            year +
            "-" +
            month +
            "-" +
            date +
            " " +
            hour +
            ":" +
            minute +
            ":" +
            second
          );
        } else if (dateFormat == "yyyy-MM-dd HH:mm") {
          return year + "-" + month + "-" + date + " " + hour + ":" + minute;
        } else if (dateFormat == "yyyy-MM-dd") {
          return year + "-" + month + "-" + date;
        } else if (dateFormat == "yyyy-MM") {
          return year + "-" + month;
        } else if (dateFormat == "yyyy") {
          return year;
        }
        // return year + "-" + month + "-" + date + " "; //hour+":"+minute+":"+second;
      } else {
        return "";
      }
    },

    //取消记录
    doCancel(row, column) {
      let allFormdata = this.allFormdata;
      let formdata = "";
      for (let z = 0; z < allFormdata.length; z++) {
        if (row.docId === allFormdata[z].docId) {
          formdata = allFormdata[z].data;
          break;
        }
      }
      for (let i = 0; i < formdata.fields.length; i++) {
        for (let j = 0; j < column.length; j++) {
          if (column[j].fieldId == formdata.fields[i].divId) {
            formdata.fields[i].value = row[column[j].id][0];
          }
        }
      }
      this.$set(this.status, row.docId, 0);
      // let af = allFormdata;
      // let td = this.tableData;
      // for(let i=0; i<af.length; i++) {
      //   for(let j=0; j<td.length; j++) {
      //     if(af[i].docId == td[j].docId && af[i].isNewBuild) {
      //       td.splice(j, 1); //新建点取消后把一行删除掉
      //       j--;
      //     }
      //   }
      // }
    },

    //新建记录
    doCreate(act) {
      let op = this.openParams
      let view = this.view
      let obj = {}
      if(op.isRelate === true || op.isRelate === 'true') { //包含原素或者标签也新建可能会携带isRelate和parentId，需要传到后台
        obj.isRelate = 'true'
      }else {
        obj.isRelate = op.isRelate
      }
      if(op.parentId) {
        obj.parentId = op.parentId
      }

      API.getDocumentEmpty(
        this.openParams.appId,
        view.relatedForm,
        obj,
        {
          onSucess: (response) => {
            let rows = {};
            rows.formId = view.relatedForm;
            rows.docId = response.data.data.id;
            let obj = JSON.parse(JSON.stringify(this.newBuild))
              ? JSON.parse(JSON.stringify(this.newBuild))
              : { formId: this.view.relatedForm };
            obj.docId = rows.docId;
            // this.tableData.push(obj);
            // let index = this.tableData.length - 1;
            this.tableData.unshift(obj);
            let index = 0;
            let isNewBuild = true;
            this.doEdit(obj, view.columns, index, isNewBuild);
            this.runAfterAction(act);
          },
        }
      );
    },

    //删除记录
    doRemove(row, index) {
      let dataList = this.dataList;
      dataList.forEach((el) => {
        if (el.id == row.docId) {
          el.delete = true;
        }
      });
      // this.dataList[index].delete = true;
      // for (let i = 0; i < this.selectDocId.length; i++) {
      //   for (let j = 0; j < this.tableData.length; j++) {
      //     if (this.selectDocId[i] == this.tableData[j].docId) {
      //       this.tableData.splice(j, 1);
      //       j--;
      //     }
      //   }
      // }
      // let obj = {};
      // obj.data = this.setSubDocuments();
      // obj.isRefresh = this.isIncludeViewRefresh;
      // this.$store.commit("saveSubDocuments", obj);
      this.tableData.splice(index, 1);
    },

    //以下的方法都是listview的方法
    viewFieldPath(value, field) {
      if (value && field == "ImageUploadField") {
        return obpmConfig.obpmFilePath + value.path;
      } else if (
        value &&
        (field == "AttachmentUploadField" || field == "NullField")
      ) {
        if (value instanceof Array) {
          return value;
        } else {
          let arr = JSON.parse(value);
          return arr;
        }
      }
    },

    regReplace(value) {
      if (value) {
        return value.replace(/&#37;/g, "%");
      }
    },

    //获取路径（默认obpm）
    setDefaultPath() {
      return obpmConfig.obpmFilePath;
    },

    //视图列设置默认图标显示
    setDefaultIcon(value, isLogo, keyVal) {
      let statiContextPath = obpmConfig.statiContextPath;
      let path = "";
      if (isLogo) {
        path = this.setDefaultPath() + "/uploads/lib/icon/" + value;
      } else {
        let valueObject = JSON.parse(value);
        if (valueObject) {
          for (let i = 0; i < valueObject.length; i++) {
            if (valueObject[i].key == keyVal) {
              if (statiContextPath) {
                //5.0
                path = this.setDefaultPath() + valueObject[i].value;
              } else {
                path =
                  this.setDefaultPath() +
                  "/uploads/lib/icon" +
                  valueObject[i].value;
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

    deteleObject(obj) {//去除数组中的重复对象   
      let uniques = [];
      let stringify = {};
      for (var i = 0; i < obj.length; i++) {
        let keys = Object.keys(obj[i]);
        keys.sort(function (a, b) {
          return Number(a) - Number(b);
        });
        let str = "";
        for (var j = 0; j < keys.length; j++) {
          str += JSON.stringify(keys[j]);
          str += JSON.stringify(obj[i][keys[j]]);
        }
        if (!stringify.hasOwnProperty(str)) {
          uniques.push(obj[i]);
          stringify[str] = true;
        }
      }
      uniques = uniques;
      return uniques;
    },
  },
};
</script>

<style lang="scss">
/* 根据条件隐藏多选框 */
.mycell .el-checkbox__input {
  display: none;
}
.mycell div {
  text-overflow: unset !important;
}
// .isSum .cell .el-checkbox:before {
//   content: '当前页\A \00A0小计'; //换行\A  空格\00A0
//   white-space: pre;
// }
// .isTotal .cell .el-checkbox:before {
//   content: '总计';
//   white-space: pre;
// }
</style>