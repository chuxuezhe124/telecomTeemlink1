<template>
  <div class="label-category">
    <el-dialog
      :title="$t('label_category')"
      :visible.sync="visible_"
      width="80%">
       <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in tagData" :label="item.categoryName" :name="String(index)" :key="index"></el-tab-pane>
      </el-tabs>
       <el-table
        :data="tagListData.datas"
        :height="clientHeight"
        style="width: 100%">
        <el-table-column
          prop="name"
          :label="$t('tabs.definition')">
          <template slot-scope="scope">
            <a @click="onClickPreview(scope.row)">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('tabs.creator')"
          width="180">
        </el-table-column>
        <el-table-column
          prop="lastModifyDate"
          :label="$t('tabs.update_time')"
           width="180">
        </el-table-column>
         <el-table-column
          prop="categorys"
          :label="$t('tabs.label')">
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          right
          background
          layout="prev, pager, next"
          :page-size="tagListData.linesPerPage"
          :total="tagListData.rowCount"
          @current-change="handleCurrentChange"
          :current-page.sync="tagListData.pageNo">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import API from "@/api.js";
import {getPreviewUrl} from "@/utils/utils.js";
export default {
  name: 'labelcategory',
  props: [
    "visible",
  ],
   data () {
    return {
      activeName: "0",
      params:{
        categoryName: "",
        userIds: "",
        beginTime: "",
        endTime: "",
        linesPerPage: 10,
        pageNo: 1
      },
      tagData: [],
      tagListData: {},
      clientHeight: "",
    }
  },
  computed: {
    visible_: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    }
  },
  watch:{
    visible_(){
      this.getTagCategory();
    }
  },
  mounted(){
    this.getTagCategory();
  },

  methods: {
    /**
     * 获取标签类别
     */
    async getTagCategory (){
      // 33底部授权信息
      this.clientHeight = `${document.documentElement.clientHeight}`- 280 - 33+'px';
      const tagData = (await API.getTagCategory()).data;
      if(tagData.data){
        this.getKmsFilesList(tagData.data[0]);
        this.tagData = tagData.data;
      }
    },
    /**
     * 点击页签获取列表数据
     */
    async getKmsFilesList(data){
      let params = {
        ...this.params,
        categoryName: data.categoryName
      }
      const result = (await API.getKmsFilesList(params)).data;
      if(result.errcode == 0){
        this.tagListData = result.data;
        this.params = params;
      }
    },

    /**
     * 刷新列表数据
     */
    async refreshFilesList(params){
      const result = (await API.getKmsFilesList(params)).data;
      if(result.errcode == 0){
        this.tagListData = result.data;
        this.params = params;
      }
    },

    /**
     * 切换页签
     */
    handleClick(tab){
      let activeKeyData = this.tagData[tab.name];
      this.getKmsFilesList(activeKeyData);
    },

    /**
     * 当前页改变时会触发
     */
    handleCurrentChange(val) {
      let params = {
        ...this.params,
        pageNo: val ? val : this.params.pageNo,
      };
     this.refreshFilesList(params);
    },

    //预览文件
    onClickPreview(record){
      const preview_params={
        'id' : record.id,  //文件id
        'diskId' : record.diskId
      }
      let preview_url = getPreviewUrl(preview_params);
      let url = kmsconfig.kmsFilePath;
      url += "/asset";
      url += preview_url.substring(1);
      window.open().location.href = url;
    }
  }

}
</script>