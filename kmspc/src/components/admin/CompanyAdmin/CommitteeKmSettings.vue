<template>
  <div name="CommitteeKmSettings">
    <div>
      <div>
        <el-dialog
          width="30%"
          :title="editVisible ? $t('Committee.edit') : $t('Committee.creat')"
          :visible.sync="visiblve"
          append-to-body>
          <div>
            <el-form label-position="right" label-width="80px">
              <el-form-item :label="$t('form.name')">
                <el-input v-model="params.name" :placeholder="$t('placeholder.name')" size="mini"></el-input>
              </el-form-item>
              <el-form-item :label="$t('form.sort_number')">
                <el-input-number v-model="params.orderNo" controls-position="right" :min="1" :max="10000" size="mini"></el-input-number>
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel" size="mini">{{$t("btns.cancel")}}</el-button>
            <el-button type="primary" v-if="!editVisible" @click="handleSettingsOk" size="mini">{{$t("btns.determine")}}</el-button>
            <el-button type="primary" v-if="editVisible" @click="handleEditOk" size="mini">{{$t("btns.determine")}}</el-button>
          </div>
        </el-dialog>
        <div>
          <el-button type="primary" @click="handleShow" size="mini">{{$t('btns.newly_build')}}</el-button>
          <el-button type="danger" v-if="this.multipleSelection.length > 0" @click="showDeleteMessageBox"  size="mini">{{$t("btns.delete")}}</el-button>
        </div>
        <el-table
          ref="multipleTable"
          :data="params.data.datas"
          style="width: 100%;"
          height="370"
          size="mini"
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
           :label="$t('form.name')">
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
            :page-size="params.data.linesPerPage"
            :total="params.data.rowCount"
            @current-change="handleCurrentChange"
            :current-page.sync="params.pageNo">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "CommitteeKmSettings",
  props: [
    "visible",
  ],
  data () {
    return {
      visiblve: false,
      editVisible: false,
      params:{
        id: "",
        name: "",
        orderNo: 1,
        domainId: "",
        data: [],
        pageNo: 1,
        linesPerPage: 15
      },
      multipleSelection: [],
      multipleSelectionKeys: []
    }
  },
  computed: {
    committeedialog: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
  },
  mounted() {
    this.getCommitteeKmData(this.params);
  },
  
  methods: {
    /**
     * 查询专委会列表
     */
    getCommitteeKmData(e) {
      API.getCommitteeKmData(e, {
        onSucess: resp => {
          this.params.data = resp.data.data;
        } 
      })
    },

    /**
     * 显示新建弹出框
     */
    handleShow(){
      this.editVisible = false;
      this.visiblve = true;
    },

    /**
     * 确定新建专委会
     */
    handleSettingsOk(){
      let data = {
        name: this.params.name,
        orderNo: this.params.orderNo
      }
      API.createCommittee(data, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let params = {
              ...this.params,
              id: "",
              name: "",
              orderNo: 1,
              pageNo: 1,
              linesPerPage: 15
            }
            this.getCommitteeKmData(params);
            this.handleCancel();
          }
        },
         onError: error =>{
          this.$message({
            type: 'warning',
            message: error.response.data.errmsg
            });
        }

      })
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
     * 批量删除专委会
     */
    showDeleteMessageBox(index, row){
      this.$confirm(this.$t('msg.delConfirm'), this.$t('msg.tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('msg.cancel'),
        type: 'warning',
      }).then(() => {
        API.deleteCommittee(row != undefined ? [row.id] : this.multipleSelectionKeys, {
          onSucess: resp => {
            if(resp.data.errcode == 0){
              let params = {
                pageNo: this.params.pageNo,
                linesPerPage: this.params.linesPerPage
              }
              this.getCommitteeKmData(params);
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
     * 编辑专委会
     */
    handleEdit(index, row){
      this.params = {
        ...this.params,
        id: row.id,
        name: row.name,
        orderNo: row.orderNo,
      }
      this.visiblve = true;
      this.editVisible = true;
    },

    /**
     * 确定编辑专委会
     */
    handleEditOk(){
      let data = {
        id: this.params.id,
        name: this.params.name,
        orderNo: this.params.orderNo
      }
      API.editCommittee(data, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            let params = {
              ...this.params,
              id: "",
              name: "",
              orderNo: 1,
              data: [],
              pageNo: 1,
              linesPerPage: 15
            }
            this.getCommitteeKmData(params);
            this.handleCancel();
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
        orderNo: 1,
        pageNo: 1,
        linesPerPage: 15
      }
      this.params = params;
      this.visiblve = false;
      this.editVisible = false;
      
    },

    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let currentPage = {
        pageNo: val,
        linesPerPage: this.params.linesPerPage
      }
      this.getCommitteeKmData(currentPage);
    }
  }
}
</script>
