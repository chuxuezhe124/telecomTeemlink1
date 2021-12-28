<template>
  <div>
    <el-dialog
      :title="$t('title.add_tags')"
      :visible.sync="categorySettingsModalParams.visible"
      width="450px"
      :before-close="handleCategoryDialogClose">
      <div class="category-select">
        <el-form label-width="120px">
          <el-form-item :label="$t('form.label_classification')">
            <el-select 
              v-model="categorySettingsModalParams.labelCate" 
              filterable 
              multiple 
              :placeholder="$t('select')">
              <el-option
                v-for="item in categorySettingsModalParams.categoryData"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCategoryDialogClose">{{$t('btns.cancel')}}</el-button>
        <el-button type="primary" @click="handleCategoryOk">{{$t('btns.determine')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: 'labelcategorydialog',
  props: [
    'categorySettingsModalParams',
  ],
  methods: {

    /**
     * 取消添加标签对话框
     */
    handleCategoryDialogClose(){
      this.$emit('handleCategoryDialogClose');
    },

     /**
     *  确定移动
     */
    async handleCategoryOk(){
      let fileId = this.categorySettingsModalParams.fileId;
      let categoryData = this.categorySettingsModalParams.categoryData;
      let labelCate = this.categorySettingsModalParams.labelCate;
      console.log(labelCate)
      let categorySettingsValue = "";
      let categorySettingsArr = [];
      for(let i=0;i<categoryData.length;i++){
        for(let y=0;y<labelCate.length;y++){
          if(labelCate[y] == categoryData[i].id || labelCate[y] == categoryData[i].name){
            let categorySettingsJson = {};
            categorySettingsJson.categoryName = categoryData[i].name;
            categorySettingsJson.categoryId = categoryData[i].id;
            categorySettingsJson.isAuto = false
            categorySettingsArr.push(categorySettingsJson);
          }
        }
      }
      if(!fileId){
        this.$emit('handleCategoryOk', this.categorySettingsModalParams.labelCate);
      }else{
        let arr = [];
        let json = {};
        let result;
        //单个贴标签
        if(typeof(fileId) == "string"){
          json.fileId = fileId;
          json.categorys = categorySettingsArr;
          result= (await API.onePasteConfirm(json));
        }else{  //批量贴标签
          for(let z=0;z<fileId.length;z++){
            let json = {
              fileId : fileId[z],
              categorys : categorySettingsArr
            };
            arr.push(json);
          }
          result= (await API.pasteConfirm(arr));
        }
        if(result.errcode == 500){
          this.$message({
            type: 'warning',
            message: result.errmsg
          });
        }
        this.$emit('handleCategoryDialogClose');
        this.$emit('handleCategoryOk');
      }
    }
    
  }
}
</script>