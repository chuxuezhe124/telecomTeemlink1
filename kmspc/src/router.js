import Vue from 'vue';
import Router from 'vue-router';
import HomePage from './views/HomePage.vue';
import admin from './views/admin/admin.vue';
import personKm from './views/personKm/personKm.vue';
import departmentKm from './views/departmentKm/DepartmentKm.vue';
import teamKm from './views/teamKm/teamKm.vue';
import stagekm from './views/teamKm/StageKm.vue';
import knowledgeMap from './views/committeeKm/KnowledgeMap.vue';
import knowledgePreview from './components/committeeKm/KnowledgePreview.vue'
import newKnowledgeMap from './views/committeeKm/NewKnowledgeMap.vue'
import searchFile from './views/searchFile/SearchFile.vue'

import knowledgeCommunity from './components/software/softWare.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'homepage',     //首页
      component: HomePage,
    },
    {
      path: '/admin',
      name: 'admin',     //管理员入口
      component: admin,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/personKm',
      name: 'personKm',     //员工km入口
      component: personKm,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/departmentKm',
      name: 'departmentKm',     //部门km入口
      component: departmentKm,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/stagekm',
      name: 'stagekm',     //团队km入口
      component: stagekm,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/teamKm',
      name: 'teamKm',     //团队阶段
      component: teamKm,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/knowledgeMap',
      name: 'knowledgeMap',     //知识地图入口
      component: knowledgeMap,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      },
    },
    {
      path: '/knowledgePreview',
      name: 'knowledgePreview',     //知识地图预览界面
      component: knowledgePreview,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/newKnowledgeMap',
      name: 'newKnowledgeMap',     //新建知识地图入口
      component: newKnowledgeMap,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/searchFile',
      name: 'searchFile',     //资料检索入口
      component: searchFile,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
    {
      path: '/knowledgeCommunity',
      name: 'knowledgeCommunity',     //资料检索入口
      component: knowledgeCommunity,
      meta: {
        keepAlive: true,//此组件需要被缓存
        title: "",
      }
    },
   
    // {
    //   path: '/personal',
    //   name: 'personal',     //个人设置入口
    //   component: personal,
    //   meta: {
    //     keepAlive: true,//此组件需要被缓存
    //     title: "",
    //   }
    // },
  ],
})
