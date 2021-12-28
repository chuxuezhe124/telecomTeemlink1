<template>
  <div class="openTab">
    <div class="content-left">
      <div class="content-search">
        <el-row>
          <el-col :span="24">
            <div class="grid-content">
              <div>
                <img src="@/assets/images/logoIndex.png" class="logo"/>
              </div>
              <div class="logo-heard">
                <div class="logo-title">{{$t("knowledge_management")}}</div>
                <div class="logo-endTitle">Knowledge document management</div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-input
              :placeholder="$t('placeholder.content')"
              suffix-icon="el-icon-search"
              class="grid-search"
              v-model="searchFile">
            </el-input>
          </el-col>
        </el-row>
        <el-row class="card-row">
          <el-col>
            <div class="cardIcon" @click="locationHash('searchFile')">
              <img src="@/assets/images/icon_zljs.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.data_retrieval")}}</div>
            </div>
          </el-col>
          <el-col>
            <div class="cardIcon" @click="locationHash('personKm')">
              <img src="@/assets/images/icon_yg.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.staff")}}</div>
            </div>
          </el-col>
          <el-col>
            <div class="cardIcon" @click="locationHash('departmentKm')">
              <img src="@/assets/images/icon_bm.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.department")}}</div>
            </div>
          </el-col>
          <el-col>
            <div class="cardIcon" @click="locationHash('teamKm')">
              <img src="@/assets/images/icon_td.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.data_retrieval")}}</div>
            </div>
          </el-col>
          <el-col>
            <div class="cardIcon" @click="locationHash('knowledgeMap')">
              <img src="@/assets/images/icon_zswd.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.knowledge_topics")}}</div>
            </div>
          </el-col>
          <el-col>
            <div class="cardIcon" @click="locationHash('admin')">
              <img src="@/assets/images/processCenter.png" class="imgContent"/>
              <div class="card-name">{{$t("menu.administrators")}}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="content-new">
        <div class="new-heard">
          <div>
            <img src="@/assets/images/icon_new.png"/>
            <span class="new-title">{{$t("file.new")}}</span>
          </div>
          <div class="more">
            <span @click="addTab('personKm')">{{$t("more")}}</span>
            <i class="el-icon-d-arrow-right"></i>
          </div>
        </div>
        <div class="new-content">
          <el-table
            :data="newDataList.datas"
            :show-header="false"
            @row-click="RowClick"
            size="mini"
            style="width: 100%">
            <el-table-column
              type="index">
            </el-table-column>
            <el-table-column
              prop="name"
              :label="$t('tabs.name')"
              min-width="60%">
            </el-table-column>
            <el-table-column
              prop="creator"
              :label="$t('tabs.uploader')"
              min-width="20%">
            </el-table-column>
            <el-table-column
              prop="createDate"
              :label="$t('tabs.time')"
              min-width="20%">
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="content-hot">
        <div class="hot-heard">
          <div>
            <img src="@/assets/images/icon_hot.png"/>
            <span class="hot-title">{{$t("file.hottest")}}</span>
          </div>
          <div class="more">
            <span>{{$t("more")}}</span>
            <i class="el-icon-d-arrow-right"></i>
          </div>
        </div>
        <div class="hot-content">
          <el-table
            :data="hotDataList.datas"
            :show-header="false"
            size="mini"
            @row-click="RowClick"
            style="width: 100%">
            <el-table-column
              type="index">
            </el-table-column>
            <el-table-column
              prop="name"
              :label="$t('tabs.name')"
              min-width="60%">
            </el-table-column>
            <el-table-column
              prop="creator"
              :label="$t('tabs.uploader')"
              min-width="20%">
            </el-table-column>
            <el-table-column
              prop="createDate"
              :label="$t('tabs.time')"
              min-width="20%">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="content-right">
      <div class="content-upload">
        <div class="upload-heard">{{$t("my.uploads")}}</div>
        <div class="upload-mytotal">
          <el-row class="upload-row">
            <el-col :span="2" class="upload-num" v-for="item in myRowOption" :key="item.id">{{item}}</el-col>
          </el-row>
        </div>
        <div class="upload-total">
          <div class="upload-num">
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{departmentRow}}</div>
              <div class="department-num" :class="[$store.state.isEnglish ? 'text-en' : 'text']" >{{$t("file.total_department")}}</div>
            </div>
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{teamRow}}</div>
              <div class="team-num " :class="[$store.state.isEnglish ? 'text-en' : 'text']">{{$t("file.total_team")}}</div>
            </div>
            <div class="department">
              <div :class="[$store.state.isEnglish ? 'num-en' : 'num']">{{myPendRow}}</div>
              <div class="myPend-num" :class="[$store.state.isEnglish ? 'text-en' : 'text']">{{$t("my.to_do_list")}}</div>
            </div>
          </div>
        </div>
        <div class="button">
          <el-button type="primary">{{$t("file.upload_document")}}</el-button>
        </div>
      </div>
      <!-- 我的日志 -->
      <div class="myLog">
        <div class="log-heard">
          <div>
            <img src="@/assets/images/iocn_rz.png"/>
            <span class="log-title">{{$t("my.log")}}</span>
          </div>
          <div class="more">
            <span>{{$t("more")}}</span>
            <i class="el-icon-d-arrow-right"></i>
          </div>
        </div>
        <div class="log-content">
          <el-table
            :data="logDataList.datas"
            :show-header="false"
            size="mini"
            style="width: 100%">
            <el-table-column
              prop="createDate"
              :label="$t('tabs.time')"
              min-width="18%">
            </el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <div>{{$t("you_downloaded")}}{{scope.row.resourceName}}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 我的排名 -->
      <div class="ranking">
        <div class="ranking-heard">
          <div>
            <img src="@/assets/images/iocn_pm.png"/>
            <span class="ranking-title">{{$t("my.rank")}}</span>
          </div>
          <div class="more">
            <span>{{$t("more")}}</span>
            <i class="el-icon-d-arrow-right"></i>
          </div>
        </div>
        <div class="ranking-content">
          <div class="rankingList">
            <div class="rankingList_show two">
              <div class="rankingList_img"><img src="@/assets/images/icon_two.png" class="img"/></div>
              <div class="rankingList_user"><img src="@/assets/images/face.jpg" class="user"/></div>
              <div class="rankingList_name">{{allUserFile.two.name}}</div>
              <div class="rankingList_total">{{$t("total_upload")}}{{allUserFile.two.count}}</div>
            </div>
            <div class="rankingList_show one">
              <div class="rankingList_img"><img src="@/assets/images/icon_one.png" class="img"/></div>
              <div class="rankingList_user"><img src="@/assets/images/face.jpg" class="user"/></div>
              <div class="rankingList_name">{{allUserFile.one.name}}</div>
                <div class="rankingList_total">{{$t("total_upload")}}{{allUserFile.one.count}}</div>
            </div>
            <div class="rankingList_show three">
              <div class="rankingList_img"><img src="@/assets/images/icon_three.png" class="img"/></div>
              <div class="rankingList_user"><img src="@/assets/images/face.jpg" class="user"/></div>
              <div class="rankingList_name">{{allUserFile.three.name}}</div>
                <div class="rankingList_total">{{$t("total_upload")}}{{allUserFile.three.count}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/api.js"

export default {
  name: "openTab",
  props:[
    'tab'
  ],
  data(){
    return{

    }
  },
  mounted(){
    let tab = this.tab[0]
    // if(tab.id == '1'){
    //   this.$router.push({  
    //     name: tab.name,
    //   })
    // }
  },
  methods:{

  },

}
</script>