<template>
  <div class="dept-select-box"
  v-loading="loading">
    <div class="search-tree">
      <el-input
        size="mini"
        :placeholder="$t('placeholder.enter_department_name')"
        v-model="filterText">
      </el-input>
    </div>
    <div class="dept-tree">
      <el-tree
        :props='props'
        class="filter-tree"
        :data="data"
        node-key="id"
        ref="tree"
        :filter-node-method="filterNode"
        @node-click="getCheckedNodes">
      </el-tree>
    </div>
  </div>
</template>

<script>
import API from "@/api.js";
export default {
  name: "impower-dept-select",
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
    this.getDepartmentsData(this.params);
  }, 

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },

  methods: {
    getDepartmentsData(){
      API.getDepartmentsData({
        onSucess: resp => {
          this.data = resp.data.data;
          this.loading = false;
        }
      })
    }, 

    /**
     * 获取选中节点id
     */
    getCheckedNodes(data) {
      this.checkedKeys =data;
      this.$emit('oncheckedKeys', data)
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    }
  },
}
</script>