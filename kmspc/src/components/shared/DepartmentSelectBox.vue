<template>
  <div class="dept-select-box" v-loading="loading">
    <div class="search-tree">
      <el-input
        size="mini"
        :placeholder="$t('placeholder.enter_department_name')"
        v-model="filterText"
      >
      </el-input>
    </div>
    <div class="dept-tree">
      <el-tree
        :props="props"
        class="filter-tree"
        :data="data"
        node-key="id"
        show-checkbox
        :default-checked-keys="
          impowerParams != undefined && impowerParams.targetId != undefined
            ? impowerParams.targetId
            : []
        "
        :filter-node-method="filterNode"
        @check="getCheckedNodes"
        ref="tree"
      >
            <span class="smallfont custom-tree-node" slot-scope="{ node, data }">
          <span 
          :title="data.name" 
          class="textTree" 
          :style="{width: treeWidth + 'px', fontWeight: treeId == data.id ? 'bolder': 'normal'}">
          <i :class='getTreeImg(node)' style="color:#409EFF;padding-right:5px;"></i>
            {{data.name}}
                </span>
                <div>
                  <span @click="addModules(data.id)">
                    <i class="addModule el-icon-plus d-none" style="position:absolute;right:20px;line-height:5px;color:#409EFF;padding-right:8px;"></i>
                  </span>
                  <span @click="delectModules(data.id)">
                    <i class="delModule el-icon-delete d-none" style="position:absolute;right:10px;line-height:5px;color:#409EFF;"></i>
                  </span>
                </div>
              </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "department-select-box",
  props: [
    'deptSelectVisiblve',
    'impowerParams'
  ],
  data(){
    return{
      filterText: "",
      data: [],
      checkedKeys: [],
      props: {
        children: 'children',
        label:"name"
      },
      loading: true
    }
  },

  mounted() {
    this.getDepartmentsData();
  }, 

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    deptSelectVisiblve(){
      this.getDepartmentsData();
    }
  },

  methods: {
        getTreeImg(node){
      let className="";
      if(node.isLeaf){
        className='el-icon-document'
      }else if(!node.expanded){
        className='el-icon-folder';
      }else{
        className='el-icon-folder-opened'
      }
      return className;
    },
    getDepartmentsData(){
      API.getDepartmentsData({
        onSucess: resp => {
          let listdata=resp.data.data;
          let treedata=[];
          for(let i=0;i<listdata.length;i++){
              let item=listdata[i]
            if(item.level===1){  
              treedata.push(this.completeSubmenus(item,listdata))
            }
          }
          this.data = treedata;
          this.loading = false;
        }
      })
    }, 

    /**
     * 获取选中节点id
     */
    getCheckedNodes(data, info) {
      this.checkedKeys = info.checkedNodes;
      this.$emit('oncheckedKeys', info.checkedNodes)
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    /**
     * 把列表结构的数据装换为树形结构
     */
    completeSubmenus(menu, menuList) {
     const children = []
     // 1.筛选出符合条件的子菜单
     for (const item of menuList) {
       if (item.parentId === menu.id) {
            children.push(item)
        }
      }
  // 2.如果子菜单存在,则封装属性
  if (children.length > 0) {
    // 递归封装子菜单中的子子菜单
    for (const submenu of children) {
      this.completeSubmenus(submenu, menuList)
    }
    menu.children = children
  }
  // 3.返回封装后的menu对象
  return menu
}
  },
}
</script>