<template>
  <div :id="id">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    
    <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <div class="view-listview-print">
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            :label="$t('label.number')"
            type="index"
            width="50">
          </el-table-column>
          <el-table-column
            prop="nodeName"
            :label="$t('label.approval_node')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="userName"
            :label="$t('label.reminder_people')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="auditorName"
            :label="$t('label.reminder_time')"
            align="center"
            >
            <template slot-scope="scope">
              {{scope.row.processTime | writeCurrentDate}}
            </template>
          </el-table-column>
          <el-table-column
            prop="content"
            :label="$t('label.content')"
            align="center"
            >
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!--只读-->
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            type="index"
            width="50">
          </el-table-column>
          <el-table-column
            prop="startNodeName"
            :label="$t('label.approval_node')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="targetNodeName"
            :label="$t('label.gold_approval_node')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="auditorName"
            :label="$t('label.transactors')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop=""
            :label="$t('label.sign_off_act')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop=""
            :label="$t('label.sign_off_comments')"
            align="center"
            >
            <!-- 图片的显示 -->
            <template   slot-scope="scope">   
              {{scope.row.attitude}}         
              <img :src="scope.row.signatureImageDate" style="height:32px;">
            </template>        
          </el-table-column>
          <el-table-column
            prop="processtime"
            :label="$t('processing_time')"
            align="center"
            >
          </el-table-column>
        </el-table>
        
      </template>
      <template v-else>
        <!-- 只读（控件模式） -->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            :label="$t('label.number')"
            type="index"
            width="50">
          </el-table-column>
          <el-table-column
            prop="nodeName"
            :label="$t('label.node_name')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="userName"
            :label="$t('label.reminder_people')"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="auditorName"
            :label="$t('label.reminder_time')"
            align="center"
            >
            <template slot-scope="scope">
              {{scope.row.processTime | writeCurrentDate}}
            </template>
          </el-table-column>
          <el-table-column
            prop="content"
            :label="$t('label.content')"
            align="center"
            >
          </el-table-column>
        </el-table>
      </template>
    </template>

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div>
        <img :src="flowPhoto" v-if="field.showMode =='textAndDiagram'">
      </div>
      <!-- 可编辑 -->
      <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          prop="startNodeName"
          :label="$t('label.approval_node')"
          align="center"
          >
        </el-table-column>
        <el-table-column
          prop="targetNodeName"
          :label="$t('label.gold_approval_node')"
          align="center"
          >
        </el-table-column>
        <el-table-column
          prop="auditorName"
          :label="$t('label.transactors')"
          align="center"
          >
        </el-table-column>
        <el-table-column
          prop=""
          :label="$t('label.sign_off_act')"
          align="center"
          >
          
        </el-table-column>
        <el-table-column
          prop=""
          :label="$t('label.sign_off_comments')"
          align="center"
          >
          <!-- 图片的显示 -->
          <template   slot-scope="scope">   
            {{scope.row.attitude}}      
            <img :src="scope.row.signatureImageDate" style="height:32px;">
          </template>        
        </el-table-column>
        <el-table-column
          prop="processtime"
          :label="$t('label.processing_time')"
          align="center"
          >
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>

import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-reminder-history",
  props: ["id"],
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      if(formData.flowDiagram) {
        let cp = obpmConfig.obpmFilePath;
        formData.flowDiagramPath = cp + formData.flowDiagram;
      }
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):'';
      }
      return formData;
    },
  },
  data: function() {
    return {
      Constant,
      tableData:[],
      flowPhoto:'',
    };
  },
  mounted(){
    this.getFlowHistory();
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },
  methods: {
    getFlowHistory(){
      console.log("this.fleld---->",this.field);
      let appId = this.$root.appid
      let docId = this.field.docId;
      this.$api.getRemindHistorys(
        appId,
        docId,
        {
          onSucess: response => {
            this.tableData = response.data.data;
            this.$forceUpdate();
          }
        }
      );

      // this.$api.getbillflow(
      //   this.field.flowDiagram,
      //   {
      //     onSucess: res => {
      //        
      //       //this.flowPhoto = 'data:image/png;base64,' + response.data
      //       let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
      //       let url = window.URL.createObjectURL(blob);
      //       this.flowPhoto = url;
      //       console.log("url---->",url)
      //       //window.location.href = url;

      //     }
      //   }
      
      // )

    }
  },
  
  filters: {
    writeCurrentDate(val){
      let now = new Date(val);
      let year=now.getFullYear(); 
      let month=now.getMonth()+1; 
      let date=now.getDate(); 
      let hour=now.getHours(); 
      let minute=now.getMinutes(); 
      let second=now.getSeconds(); 
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    }
  }
}
</script>

<style>

</style>