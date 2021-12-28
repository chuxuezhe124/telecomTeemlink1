<template>
  <div name="tab">
    <div>
        <el-dialog
          width="31%"
          :title="$t('label_category')"
          :visible.sync="innerVisible"
          append-to-body
          >
          <el-form :label-position="labelPosition" label-width="60px">
            <el-form-item :label="$t('tabs.definition')">
              <el-input
                type="textarea"
                :rows="3"
                v-model="inputLabel"
                clearable
                :placeholder="$t('placeholder.text_label')"
                >
              </el-input>
              </el-form-item>
              <!-- <el-form-item label="父级:">
                <el-select v-model="selectValue" placeholder="" size="small">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                    >
                  </el-option>
                </el-select>
              </el-form-item> -->
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="innerVisible = false" size="mini">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="confirmLabel" size="mini">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
        <el-dialog
          width="31%"
          :title="$t('Edit_label')"
          :visible.sync="editVisible"
          append-to-body
          >
          <el-form :label-position="labelPosition" label-width="60px">
            <el-form-item :label="$t('tabs.definition')">
              <el-input
                v-model.trim="tag.name"
                clearable
                :placeholder="$t('placeholder.text_label')"
                >
              </el-input>
              </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editVisible = false" size="mini">{{$t('btns.cancel')}}</el-button>
            <el-button type="primary" @click="handleEditOk" size="mini">{{$t('btns.determine')}}</el-button>
          </span>
        </el-dialog>
      <div>
        <el-button type="primary" @click="innerVisible = true" size="mini">{{$t('btns.create_label')}}</el-button>
        <el-button type="danger" v-show="isShow" size="mini" @click="deleteLabel">{{$t('btns.delete')}}</el-button>
      </div>
      <el-tag
        v-for="tag in data"
        :key="tag.id"
        closable
        @close="deleteLabel(tag.id)"
        type="">
        <span @click="editTag(tag)">{{tag.name}}</span>
      </el-tag>
      <!-- <el-tree 
        ref="tree"
        :data="data" 
        :props="props" 
        :load="loadNode"
        @node-click="handleNodeClick" 
        @check-change="handleCheckChange"
        show-checkbox 
        lazy>
      </el-tree> -->
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "tab",
  mounted() {
    this.getDeptTree();
  },
  data () {
    return {
      innerVisible: false,
      editVisible: false,
      data: [],
      options: [],
      selectValue: '',
      inputLabel: '',
      isShow: false,
      labelPosition:'left',
      props: {
        children: 'Children',
        label: 'name'
      },
      tag: {
        Children: [],
        id: "",
        name: "",
        parentId: ""
      }
    }
  },
  methods: {
    //二级树的懒加载
    loadNode (node, resolve) {
      if (node.level === 0) {
          return resolve(this.data);
        }
      if (node.level > 1) return resolve([]);
      let childrenData;
      API.getLabelTreeView({
        onSucess: resp => {
          if(resp && resp.data){
            let treeData = resp.data.data;
            for(let i=0;i<treeData.length;i++){
              if(node.data.name == treeData[i].name){
                childrenData = treeData[i].Children;
                resolve(treeData[i].Children);
              }
            }
          } 
          resolve(childrenData);
        }
      });
    },
    //获取标签树
    getDeptTree() {
      API.getLabelTreeView({
        onSucess: resp => {
          if(resp && resp.data){
            this.data = resp.data.data;
            this.options = resp.data.data;
          }
        } 
      });
    },
    //确定添加或修改标签
    confirmLabel() {
      let dataJson = {};
      let value = this.inputLabel.replace(/^\s*|\s*$/g,'').split(/[(\r\n)\r\n]+/);
      if(this.inputLabel && value!=""){
        dataJson.name = value;
        dataJson.parentId = this.selectValue;
        API.getLabelTreeAdd(dataJson,{
          onSucess: resp => {
            if (resp.data.errcode == 0) {
              this.inputLabel = '';
              this.selectValue = '';
              this.getDeptTree();
            }
          },
           onError: error =>{
          this.$message({
            type: 'warning',
            message: error.response.data.errmsg
          });
        } 
        });
        this.innerVisible = false
      }else{
        this.$message({
          message: this.$t('msg.Label_name_noempty'),
          type: 'warning'
        });
      }
    },
    //删除标签
    deleteLabel(id) {
      this.$confirm(this.$t('placeholder.delete_all'),this.$t('msg.tip'), {
          confirmButtonText: this.$t('msg.delete'),
          cancelButtonText: this.$t('msg.cancel'),
          type: 'warning'
        }).then(() => {
          // let dataJson = [];
          // let data = this.$refs.tree.getCheckedNodes();
          // dataJson.push(data[0].id);
          API.getLabelTreeDelete([id],{
            onSucess: resp => {
              if (resp.data.errcode == 0) {
                this.inputLabel = '';
                this.selectValue = '';
                this.isShow = false
                this.getDeptTree();
                this.$message({
                  type: 'success',
                  message: this.$t('msg.es')
                });
              }
            } 
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('msg.cancel_del')
          });          
        });
    },
    //获取树的数据
    handleNodeClick(data) {
      this.innerVisible = true;
      this.inputLabel = data.name;
      this.selectValue = data.parentId
    },
    //判断删除按钮是否显示
    handleCheckChange(data, checked, indeterminate){
      console.log(data, checked, indeterminate);
      checked ? this.isShow=true : this.isShow = false;
    },

    //编辑标签
    editTag(e){
      let tag = {
        Children: e.Children,
        id: e.id,
        name: e.name,
        parentId: e.parentId
      }
      this.tag = tag;
      this.editVisible = true;
    },

    //确定编辑标签
    handleEditOk(){
      let tag = this.tag;
      API.getLabelTreeEdit(tag, {
        onSucess: resp => {
          if(resp.data.errcode == 0){
            this.getDeptTree();
            this.editVisible = false;
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

  }
}
</script>
