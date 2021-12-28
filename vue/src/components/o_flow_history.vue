<template>
  <div :id="id">
    <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
      <!-- 隐藏 TODO:注意，隐藏时不应该有hidden的field存在，有安全问题，以后要改过来：Jarod -->
      <span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
    </template>
    
     <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
      <!-- 显示流程图 -->
      <div v-if="field.showMode =='diagram'">
        <img :src="field.flowDiagramPath"/>
      </div>
      <div class="view-listview-print" v-else-if="field.showMode =='textAndDiagram'">
        <div v-if="field.showMode =='textAndDiagram'">
          <img :src="field.flowDiagramPath"/>
        </div>
        <table border="0" id="viewTable" style="min-width:100%;">
          <thead>
            <tr>
              <td>{{$t('label.approval_node')}}</td>
              <td>{{$t('label.gold_approval_node')}}</td>
              <td>{{$t('label.transactors')}}</td>
              <td>{{$t('label.sign_off_act')}}</td>
              <td>{{$t('label.sign_off_comments')}}</td>
              <td>{{$t('label.processing_time')}}</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{item.startNodeName}}</td>
              <td>{{item.targetNodeName}}</td>
              <td>{{item.auditorName}}</td>
              <td>{{item.flowOperation}}</td>
              <td>{{item.attitude}}</td>
              <td>{{item.processtime}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="view-listview-print" v-else>
        <table border="0" id="viewTable" style="min-width:100%;">
          <thead>
            <tr>
              <td>{{$t('label.approval_node')}}</td>
              <td>{{$t('label.gold_approval_node')}}</td>
              <td>{{$t('label.transactors')}}</td>
              <td>{{$t('label.sign_off_act')}}</td>
              <td>{{$t('label.sign_off_comments')}}</td>
              <td>{{$t('label.processing_time')}}</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{item.startNodeName}}</td>
              <td>{{item.targetNodeName}}</td>
              <td>{{item.auditorName}}</td>
              <td>{{item.flowOperation}}</td>
              <td>{{item.attitude}}</td>
              <td>{{item.processtime}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!--只读-->
    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <div v-if="field.showMode == 'text'">
        <template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
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
        <template v-else>
        <!-- 只读（控件模式） -->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
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
            prop="flowOperation"
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
       <div v-else-if="field.showMode == 'diagram'">
        <div>
          <img :src="field.flowDiagramPath"/>
        </div>
      </div>
      <div v-else-if="field.showMode == 'textAndDiagram'">
        <div>
           <img :src="field.flowDiagramPath">
        </div>
          <template v-if="field.readOnlyShowValOnly">
            <!-- 只读（文本模式） -->
            <el-table
              :data="tableData"
              border
              style="width: 100%">
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
          <template v-else>
            <!-- 只读（控件模式） -->
            <el-table
              :data="tableData"
              border
              style="width: 100%">
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
                prop="flowOperation"
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

    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
      <div v-if="field.showMode == 'text'">
        <el-table
          :data="tableData"
          border
          style="width: 100%">
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
            prop="flowOperation"
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
      </div>
      <div v-else-if="field.showMode == 'diagram'">
        <div>  
          <img :src="field.flowDiagramPath"/>
        </div> 
      </div>
      <div v-else-if="field.showMode == 'textAndDiagram'">
        <div> 
          <img :src="field.flowDiagramPath">
        </div>
        <!-- 可编辑 -->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
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
            prop="flowOperation"
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
      </div>
    </template>
  </div>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-flow-history",
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
      let appId = this.$root.appid;
      let docId = this.field.docId;
      let content = ''
      this.$api.getFlowHistorys(
        appId,
        docId,
        content,
        {
          onSucess: response => {
              this.tableData = response.data.data;
              let tableData = this.tableData;
              for(let i=0;i<tableData.length;i++){
                switch (tableData[i].flowOperation) { 
                  case "8": 
                    tableData[i].flowOperation = this.$t('view.stop'); 
                    break; 
                  case "81":  
                    tableData[i].flowOperation = this.$t('flow.back'); 
                    break; 
                  case "85":
                    tableData[i].flowOperation = this.$t('flow.recall');
                    break; 
                  case "88": 
                    tableData[i].flowOperation = this.$t('flow.handup');  
                    break; 
                  case "89":
                    tableData[i].flowOperation = this.$t('flow.recover'); 
                    break; 
                  case "91":
                    tableData[i].flowOperation = this.$t('flow.countersign');
                    break; 
                  default: 
                    tableData[i].flowOperation = this.$t('flow.circulation');  
                    break;
                }
              }   
              this.tableData = tableData;
              this.$forceUpdate();
          }
        }
      );
    }
  },
  data: function() {
    return {
      Constant,
      tableData:[],
      flowPhoto:'',
      flowOperation:'',
    };
  }
}
</script>

<style scoped>

</style>