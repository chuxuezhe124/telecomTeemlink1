<template>
  <div name="DepartmentKmSettings">
    <div>
      <el-dialog
        width="30%"
        :title="$t('department.selection')"
        :visible.sync="deptSelectVisiblve"
        append-to-body>
        <div>
          <department-select-box 
            :deptSelectVisiblve="deptSelectVisiblve"
            @oncheckedKeys="oncheckedKeys"
          ></department-select-box>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel" size="mini">{{$t("btns.cancel")}}</el-button>
          <el-button type="primary" v-if="!editVisible" @click="handleSettingsOk" size="mini">{{$t("btns.determine")}}</el-button>
        </div>
      </el-dialog>
        <el-dialog
        width="30%"
        :title="$t('btns.edit')"
        :visible.sync="editVisible"
        append-to-body>
        <div>
          <el-form label-position="right" label-width="80px">
            <el-form-item :label="$t('department.name')">
              <el-input v-model="params.name" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :label="$t('form.sort_number')">
              <el-input-number v-model="params.orderNo" controls-position="right" :min="1" :max="10000"></el-input-number>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel" size="mini">{{$t("btns.cancel")}}</el-button>
          <el-button type="primary" v-if="editVisible" @click="handleEditOk" size="mini">{{$t("btns.determine")}}</el-button>
        </div>
      </el-dialog>
      <div>
        <el-button type="primary" @click="handleShow" size="mini">{{$t("btns.create")}}</el-button>
        <el-button type="danger" v-if="this.multipleSelection.length > 0" @click="showDeleteMessageBox"  size="mini">{{$t("btns.delete")}}</el-button>
      </div>
      <el-table
        ref="multipleTable"
        :data="params.data"
        style="width: 100%"
        height="370"
        size="mini"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('department.name')">
        </el-table-column>
        <el-table-column
          prop="orderNo"
          :label="$t('form.sort_number')"
          width="80">
        </el-table-column>
        <el-table-column
          prop="address"
          :label="$t('form.operation')"
          width="160"
          align="center">
            <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">{{$t("btns.edit")}}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="showDeleteMessageBox(scope.$index, scope.row)">{{$t("btns.delete")}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          right
          background
          layout="prev, pager, next"
          :page-size="params.linesPerPage"
          :total="params.rowCount"
          @current-change="handleCurrentChange"
          :current-page.sync="params.pageNo">
        </el-pagination>
     </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "DepartmentKmSettings",
  props: [
    "visible",
  ],
  data () {
    return {
      deptSelectVisiblve: false,
      editVisible: false,
      params:{
        id: "",
        name: "",
        type: "",
        orderNo: 1,
        domainId: "",
        ownerId: "",
        data: [],
        pageNo: 1,
        linesPerPage: 15
      },
      deptIds: "",
      multipleSelection: [],
      multipleSelectionKeys: [],
      pageSize: 10000
    }
  },
  computed: {
    deptVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
  },
  mounted() {
    this.getdisksData();
  },
  
  methods: {
    /**
     * 部门KM列表
     */
    getdisksData(currentPage) {
      if(currentPage){
        this.params.linesPerPage = currentPage.linesPerPage;
        this.params.pageNo = currentPage.pageNo;
      }
      API.getdisksData(this.params,{
        onSucess: resp => {
          this.params = resp.data.data;
          this.params.data = resp.data.data.datas;
        } 
      })
    },
    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let currentPage = {
        pageNo: val,
        linesPerPage: this.params.linesPerPage
      }
      this.getdisksData(currentPage);
    },

    /**
     * 显示新建弹出框
     */
    handleShow(){
      this.editVisible = false;
      this.deptSelectVisiblve = true;
    },

    /**
     * 获取选中部门节点id
     */
    oncheckedKeys(value){
      this.deptIds = value;
    },

    /**
     * 确定新建部门网盘
     */
    handleSettingsOk(){
      let checkedKeys = []
      if(this.deptIds.length > 0){
        this.deptIds.map((e) => {
          let id = {};
          id = e.id;
          checkedKeys.push(id);
        })
      }
    if(checkedKeys.length===0){
    this.$message({
      type: 'warning',
      message:this.$t('msg.select_exis_department')
      });
    }
    else{
      API.createDeptDisks(checkedKeys, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.getdisksData();
            this.handleCancel();
          }
        },    
      })
    }
    },

    /**
     * 勾选行时响应
     */
    handleSelectionChange(val){
      let multipleSelectionKeys = [];
      if(val.length){
        val.map((e) => {
          let id = {};
          id = e.id;
          multipleSelectionKeys.push(id);
        })
      }
      this.multipleSelectionKeys = multipleSelectionKeys;
      this.multipleSelection = val;
    },

    /**
     * 批量删除部门网盘
     */
    showDeleteMessageBox(index, row){
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        API.deleteDeptDisks(row != undefined ? [row.id] : this.multipleSelectionKeys, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              this.getdisksData();
              this.$message({
                type: 'success',
                message: this.$t('msg.es')
              });
            }
          }
        })
      }).catch(() => {
        this.$refs.multipleTable.clearSelection();
        this.$message({
          type: 'info',
          message: this.$t('msg.cancel_del')
        });
      });
    },

    /**
     * 编辑部门网盘
     */
    handleEdit(index, row){
      this.params = {
        ...this.params,
        id: row.id,
        name: row.name,
        type: row.type,
        orderNo: row.orderNo,
        domainId: row.domainId,
        ownerId: row.ownerId,
      }
      this.deptSelectVisiblve = false;
      this.editVisible = true;
    },

    /**
     * 确定编辑专委会
     */
    handleEditOk(){
      let data = this.params;
      API.handleEditDeptDisk(data, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let params = {
              ...this.params,
              id: "",
              name: "",
              type: "",
              orderNo: 1,
              domainId: "",
              ownerId: "",
            }
            this.getdisksData();
            this.handleCancel();
            this.params = params;
          }
        } 
      })
    },

    /**
     * 隐藏新建或编辑专委会弹出框
     */
    handleCancel(){
      let params = {
        ...this.params,
        id: "",
        name: "",
        type: "",
        orderNo: 1,
        domainId: "",
        ownerId: "",
      }
      this.getdisksData();
      this.params = params;
      this.deptSelectVisiblve = false;
      this.editVisible = false;
    },
  }
}
</script>
