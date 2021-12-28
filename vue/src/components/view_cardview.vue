<template>
  <div class="obpm-cardview">
    <template slot="empty">
      <p>{{ emptyData }}</p>
    </template>
    <div v-for="(item, index) in CardData" :key="item.docId">
      <div
        v-if="item.hasChildren"
        class="cardview_box bgimg"
        @click="load($event, index)"
        :parentName="item.parentName"
        :data-docid="item.docId"
      >
        {{item[firstLine] }}
        <span :class="{ 'select':item.select }"></span>
      </div>
      <div
        v-else
        class="child_box"
        @click="checkedNode($event, index)"
        :parentName="item.parentName"
        :data-docid="item.docId"
      >
        {{ item[firstLine] }}
        <span :class="{'child_select':item.childrenSelect }"></span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "view-cardview",
  props: ["view", "openParams", "showtype", "toTab","clearCheckboxVal"],
  watch: {},
  computed: {},

  mounted() {
    this.getData();
    this.firstLine = this.view.columns[0].id;
  },

  data: function () {
    return {
      selectNode: false,
      firstLine: "",
      checkedAll: [],
      currentPage: 1,
      CardData: [],//当前页面展示的节点
      row_count: 0,
      loading: true,
      emptyData: "",
      selectNodeId:[],//存储选中的节点的docid集合
      parentcheck:[],//存储选中的节点的父节点的路径进行匹配集合
    };
  },
  methods: {
    checkedNode(e, index) {
      let selectedElement=this.CardData[index]//被点击的节点的数据
      let id = e.target.getAttribute("data-docid");
      let isSelected = true;
      this.checkedAll.map((item, index) => {
        if (item.docId == id) {     
          isSelected = false;
          this.checkedAll.splice(index, 1);
          
        }
      });
      if (isSelected) {
        //判断是选中还是取消选中
        this.checkedAll.push(selectedElement);
        this.selectNodeId.push(selectedElement.docId)
        this.parentcheck.push(selectedElement.parentName)
        //存储被选中字节点的父节点路径  aa/bb aa aa/bb
        selectedElement.childrenSelect = true; //表示选中
        // this.$emit('selectNum',this.checkedAll)
      } 
      else {  
        if(this.selectNodeId.length==1){
          this.selectNodeId=[];        
        }else{
           this.selectNodeId.splice(this.selectNodeId.indexOf(selectedElement.docId),1);
        }

        if(this.parentcheck.length==1){
           this.parentcheck=[];
        }else{
        this.parentcheck.splice(this.parentcheck.indexOf(selectedElement.docId),1)
        }
         selectedElement.childrenSelect = false;
      }
     this.$emit("getDocIds",this.selectNodeId);
 
    },
    getData(page) {
      this.getViewData(page).then((response) => {
        let docs = response.data.data;
        this.dataList = response.data.data;
        this.row_count = response.data.row_count;
        let tds = [];
        if (docs) {
          docs.forEach((doc) => {
            let rows = {};
            rows.formId = doc.formId;
            rows.docId = doc.id;
            for (var key in doc.items) {
              let items = doc.items[key];
              rows[key] = items.value;
            }
        if (doc.hasChild) {
            rows.hasChildren = true;
            rows.select=false;
            }
            else{
                rows.childrenSelect=false;
                }
        if (doc.parentName) {
              rows.parentName = doc.parentName;
            }
            tds.push(rows);
          });
          if (tds.length == 0) {
            this.emptyData = this.$t("nodata");
          }
          this.loading = false;
          this.CardData = tds;
          console.log("this.tableData---->", this.CardData);
        }
      });
    },
    getViewData(page) {
      let treeData = "";
      let treeName = "";
      if (this.parentId) {
        //树形视图
        return new Promise((resolve) => {
          this.$api.getTreeViewData(
            //树形视接口
            this.openParams.appId,
            this.openParams.actionContent,
            {
              parentId: this.parentId ? this.parentId : "",
            },
            treeData,
            treeName,
            {
              onSucess: (response) => {
                let treeViewData = response.data;
                resolve(treeViewData);
              },
            }
          );
        });
      } else if (this.openParams && this.openParams.parentId) {
        //包含元素时
        return new Promise((resolve) => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.openParams.parentId,
              isRelate: this.openParams.isRelate,
              currpage: page ? page : this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 10,
              searchWord: "",
            },
            {},
            {
              onSucess: (response) => {
                let viewData = response.data;
                resolve(viewData);
              },
            }
          );
        });
      } else {
        return new Promise((resolve) => {
          this.$api.getViewData(
            //普通视图接口
            this.openParams.appId,
            this.view.id,
            {
              parentId: this.parentId ? this.parentId : "",
              currpage: page ? page : this.currentPage,
              lines: this.view.data ? this.view.data.page_lines : 10,
              searchWord: "",
            },
            {},
            {
              onSucess: (response) => {
                let viewData = response.data;
                resolve(viewData);
              },
            }
          );
        });
      }
    },
    returnPrevious() {
      let parentName = this.CardData[0].parentName;
      let name = "";
      if (parentName.indexOf("\\") >= 0 && parentName.split("\\").length > 1) {
        if(parentName.split("\\").length!==2){
          for (var i = 0; i < parentName.split("\\").length - 2; i++) {
 
          if (name) {
            name = name + "\\" + parentName.split("\\")[i];
          } else {
            name = parentName.split("\\")[i];
          }
        }
        }
        else{
            this.$emit("cardBackSign",false);
        }
      }
      if(name){
        // name=encodeURIComponent(name + "\\")
        name=name+'\\'
      }
        this.updateCardContent(name)
    },
    //点击折叠节点触发的事件
    load(e, index) {
      let xuanzhong = this.CardData[index].parentName;
      if (xuanzhong.indexOf("\\") === -1) {
        //只在最上层触发函数，出现返回按钮
        this.$emit("cardBackSign", true); //触发父组件的方法，点击出现返回按钮在，不是最高节点的方法
      }
      //
      let parentName=this.CardData[index].parentName + '\\';
      this.updateCardContent(parentName)

    },
    //接受父节点的名称，用来更新视图
    updateCardContent(parentName){     
    let that = this;
      let params = {
        viewId: this.openParams.actionContent,
        opentarget: "detail",
        containTitle: this.view.name,
      };
         let appId = this.openParams.appId;
        this.$api.getCollapsedviewTemplate(appId, params, {
        onSucess: (res) => {
          if (res.data.data) {
            that.$api.getViewData(
              //普通视图接口
              that.$root.appid,
              that.openParams.actionContent,
              {
                currpage: that.currentPage,
                lines: 10,
                parentParam: encodeURIComponent(
                    parentName
                ),
              },
              {},
              {
                onSucess: (response) => {
                  let docs = response.data.data.data;
                  let tds = [];
                  if (docs) {
                    docs.forEach((doc) => {
                      let rows = {};
                      rows.formId = doc.formId;
                      rows.docId = doc.id;
                      for (let key in doc.items) {
                        let items = doc.items[key];
                        rows[key] = items.value;
                      }
                      if (doc.hasChild) {
                        rows.hasChildren = true;
                        rows.select=false;
                      }
                      else{
                        rows.childrenSelect=false;
                      }
                      if (doc.parentName) {
                        rows.parentName = doc.parentName;
                      }

                      tds.push(rows);
                    });

                    this.echoProcessing(tds)

                  }
                },
              }
            );
          }
        },
      });  
    },
    //更新Carddata的内容，为选中的节点赋予元素
    echoProcessing(tds){
          this.$nextTick(() => {
                    if(this.checkedAll.length){//没有选中的元素的时候都不加上样式
                        tds.map(item=>{
                        if(this.selectNodeId.indexOf(item.docId)>=0){//存储已经选中的卡片，加上样式
                          item.childrenSelect=true;     
                         }//parrmainr这个元素的前面的 haschail都 加上selet样式 
                        if(item.hasChildren){
                          this.parentcheck.map(check=>{
                            let a=item.parentName + '\\';
                           if(a.split("\\").length == 1 && check.split("\\")[0] ==item.parentName) {
                            item.select=true;
                           }
                           else if(a.split("\\").length !== 1 && check.indexOf(item.parentName)>=0 ){
                             item.select=true;
                           }
                          })
                        }
                      }) 
                    }else{
                      tds.map(item=>{
                        if(item.hasChildren){
                         item.select=false;
                        }
                        else{
                           item.childrenSelect=false;   
                        }
                      })
                    }

                      this.CardData = tds;
                    });
                    this.$forceUpdate()
    }
  },
  watch:{
      clearCheckboxVal() {
      if (this.clearCheckboxVal) {
        
        this.checkedAll=[];
        this.selectNodeId=[];
        this.parentcheck=[];
        this.echoProcessing(this.CardData)
      }
    },
  }
};
</script>