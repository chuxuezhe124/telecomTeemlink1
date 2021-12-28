<template>
  <div class="collapse-btns-box">
    <el-dropdown size="medium" type="primary" trigger="click">
      <div class="btn el-dropdown-link">
        更多<i class="el-icon-caret-bottom el-icon--right"></i>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item 
          v-for="info in collapseButtons" 
          :key="info.id"
          :disabled="info.readonly"
          @click.native="onAction(info)"
        >
         <i v-if="info.icon && JSON.parse(info.icon).type=='font'" :class="[info.icon?JSON.parse(info.icon).icon:'']"/>
        <i 
          v-else-if="info.icon && JSON.parse(info.icon).type=='img'" 
          :class="[info.icon?JSON.parse(info.icon).icon:'']" 
          height="14">
          <img style="height:14px;" :src="path +JSON.parse(info.icon).icon" />
        </i>
        <i v-else :class="activeColor(info).btnIcon"></i>
        {{info.name.replace(/__/g, "")}}
      </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  props: [
    "collapseButtons",
  ],
  data: function() {
    return {
      path:window.location.origin + '/obpm/uploads/lib/icon',
      isShowBtn: true,//是否显示按钮
    }
  },
  computed: {
    
  },

  created(){
    
  },

  methods: {
    activeColor(info) {
      let data = {
        bg:'', //背景色
        btnIcon: '', //图标
        bd:'' //边框颜色
      }
      let currentColor = '';
      if(info.colorType) {
	    // warning success danger primary info default 为视图按钮的颜色
        if(info.colorType == 'warning') {
          currentColor = "#ec971f";
        }else if (info.colorType == "success") {
          currentColor = "#449d44"; 
        } else if (info.colorType == "danger") {
          currentColor = "#d9534e"; 
        }else if (info.colorType == "primary") {
          currentColor = "#337ab7"; 
        }else if(info.colorType == "info") {
          currentColor = "#5bc0de";
        }else if(info.colorType == "default") {
          currentColor = "";
        }else {
          currentColor = info.colorType;
        }
      }
      switch(info.type) {
        case 1: //载入视图
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 2: //创建
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'createBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 3: //删除
          data = {
            bg: currentColor?currentColor:'#d9534f',
            btnIcon: 'deleteBtnicon',
            bd: currentColor?currentColor:'#d9534f',
          };
          return data;
        case 4: //保存并启动流程
          break;
        case 5: //流程处理
          data = {
            bg: currentColor?currentColor:'linear-gradient(90deg, #40D0FF 0%, #409EFF 100%)',
            btnIcon: 'submitflowicon',
            // bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 8: //关闭窗口
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 10: //返回
          data = {
            bg: currentColor?currentColor:'#fff',
            btnIcon: 'backBtnicon',
            bd: currentColor?currentColor:'#ccc',
            fc:'#000',
          };
          return data;
        case 11: //保存并返回
          // data = {
          //   bg: currentColor?currentColor:'#337ab7',
          //   btnIcon: 'queryBtnicon',
          //   bd: currentColor?currentColor:'#337ab7',
          // };
          data = {
            bg: currentColor?currentColor:'linear-gradient(90deg, #40D0FF 0%, #409EFF 100%)',
            btnIcon: 'submitflowicon',
          };
          return data;
        case 13: //无
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#5bc0de',
          };
          return data;
        case 14: //网页打印(表单)
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#5bc0de',
          };
          return data;
        case 15: //网页打印含历史
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 16: //导出excel
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'exportToExcelBtnicon',
            bd: currentColor?currentColor:'#5bc0de',
          };
          return data;
        case 19: //保存草稿不校检
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 18: //清空所有数据
          data = {
            bg: currentColor?currentColor:'#d9534f',
            btnIcon: 'clearAllBtnicon',
            bd: currentColor?currentColor:'#d9534f',
          };
          return data;
        case 20: //批量提交
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'batchApproveBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 21: //保存并复制
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 25: //PDF导出
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 26: //文件下载
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'fileDownloadBtnicon',
            bd: currentColor?currentColor:'#5bc0de',
          };
          return data;
        case 27: //导入excel
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'excelImportBtnicon',
            bd: currentColor?currentColor:'#5bc0de',
          };
          return data;
        case 28: //电子签章
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 29: //批量签章
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'batchSignatureBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 33: //流程启动
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 34: //保存
           data = {
            bg: currentColor?currentColor:'linear-gradient(90deg, #7AD34F 0%, #67C23A 100%)',
            btnIcon: 'saveBtnicon',
            // bd: currentColor?currentColor:'#5cb85c'
          };
          return data;
        case 36: //网页打印(视图)
          data = {
            bg: currentColor?currentColor:'#5bc0de',
            btnIcon: 'printViewBtnicon',
            bd: currentColor?currentColor:'#5bc0de'
          };
          return data;
        case 37: //邮件短信分享
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 42: //保存并新建
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 43: //跳转
          data = {
            bg: currentColor?currentColor:'#f0ad4e',
            btnIcon: 'jumpToBtnicon',
            bd: currentColor?currentColor:'#f0ad4e'
          };
          return data;
        case 45: //归档
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 46: //签章
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 47: //回退流程
          data = {
            bg: currentColor?currentColor:'#ec971f',
            btnIcon: 'regressesflowicon',
            bd: currentColor?currentColor:'#ec971f',
          };
          return data;
        case 48: //催办流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 49: //挂起流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 50: //恢复流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 51: //回撤流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 52: //终止流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 53: //编辑流程审批人
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 54: //调整流程
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 55: //点评
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 56: //补签
          data = {
            bg: currentColor?currentColor:'#337ab7',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#337ab7',
          };
          return data;
        case 57: //加签主办
        case 58: //加签协办
          data = {
            bg: currentColor?currentColor:'#31b0d5',
            btnIcon: 'queryBtnicon',
            bd: currentColor?currentColor:'#31b0d5',
          };
          return data;
        case 0: //流程处理在流程的表单权限里设置了隐藏，type返回0
          this.isShowBtn = false
        default:
          break;
      }
      return '';
    },

    onAction(act) {
      let activityType = act.type;
      if(this.isBlockClick) return
      switch (act.type) {
        case 1: //载入视图
          this.$emit("action",act);
          break;
        case 2: //创建
          this.$emit("action",act);
          break;
        case 3: //删除
          this.$emit("action",act);
          break;
        case 4: //保存并启动流程
          act.flowType = '1';
          this.$emit("action",act);
          break;
        case 5: //流程处理
          act.flowType = '80';
          this.$parent.flowHandle(act);
          break;
        case 8: //关闭窗口
          this.$parent.runBeforeAction(this.info.id, '', '', activityType);
          break;
        case 10: //返回
          this.$emit("action",act);
          break;
        case 11: //保存并返回
          this.$emit("action",act);
          break;
        case 13: //无
          this.$emit("action",act);
          break;
        case 14: //网页打印(表单)
          this.$emit("action",act);
          break;
        case 15: //网页打印含历史
          this.$parent.runBeforeAction(act.id, '', '', activityType);
          break;
        case 16: //导出excel
          this.$emit("action",act);
          break;
        case 19: //保存草稿不校检
          this.$parent.runBeforeAction(act.id, '', '', activityType);
          break;
        case 18: //清空所有数据
          this.$emit("action",act);
          break;
        case 20: //批量提交
          act.flowType = '80';
          this.$emit("action",act);
          break;
        case 21: //保存并复制
          this.$emit("action",act);
          break;
        case 25: //PDF导出
          this.$emit("action",act);
          break;
        case 26: //文件下载
          this.$emit("action",act); 
          break;
        case 27: //导入excel
          this.$emit("action",act);
          break;
        case 28: //电子签章
          this.$emit("action",act);
          break;
        case 29: //批量签章
          this.$emit("action",act);
          break;
        case 30: //自定义打印
          this.$emit("action",act);
          break;
        case 33: //流程启动
          act.flowType = '1';
          this.$emit("action",act);
          break;
        case 34: //保存
          this.$emit("action",act);
          break;
        case 36: //网页
          this.$emit("action",act);
          break;
        case 37: //邮件短信分享
          this.$emit("action",act);
          break;
        case 42: //保存并新建
          this.$emit("action",act);
          break;
        case 43: //跳转
          this.$emit("action",act);
          break;
        case 45: //归档
          this.$parent.runBeforeAction(act.id, '', '', activityType);
          break;
        case 46: //签章
          this.$emit("action",act);
          break;
        case 47: //回退流程
          this.$parent.flowHandle(act);
          break;
        case 48: //催办流程
          this.$emit("action",act);
          break;
        case 49: //挂起流程
          act.flowType = '88';
          this.$emit("action", act);
          break;
        case 50: //恢复流程
          act.flowType = '89';
          this.$emit("action", act);
          break;
        case 51: //回撤流程
          act.flowType = '85';
          this.$emit("action", act);
          break;
        case 52: //终止流程
          act.flowType = '8';
          this.$emit("action", act);
          break;
        case 53: //编辑流程审批人
          this.$emit("action", act);
          break;
        case 54: //调整流程
          break;
        case 55: //点评
          this.$emit("action", act);
          break;
        case 56: //补签
          this.$emit("action", act);
          break;
        case 57: //加签主办
          this.$emit("action", act);
          break;
        case 58: //加签协办
          this.$emit("action", act);
          break;
        default:
          break;
      }
    }
  }
};
</script>

