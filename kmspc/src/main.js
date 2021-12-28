import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import API from "@/api.js";

import i18n from './i18n'
Vue.use(i18n);

Vue.config.productionTip = false

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/style/kms.scss';

import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);
import echarts from 'echarts'
Vue.prototype.$echarts = echarts;
Vue.prototype.$api= API;
Vue.use(ElementUI);

import { Promise } from 'core-js';

import DepartmentSelectBox from "@/components/shared/DepartmentSelectBox.vue";
import ImpowerDeptSelect from "@/components/shared/ImpowerDeptSelect.vue";
import ApplicationAuthority from "@/components/shared/ApplicationAuthority.vue";
import NewKnowledgeHTML from "@/components/shared/NewKnowledgeHTML.vue";
import VueUeditorWrap from "vue-ueditor-wrap" // ES6 Module

Vue.component('vue-ueditor-wrap', VueUeditorWrap)
Vue.component("department-select-box", DepartmentSelectBox);
Vue.component("impower-dept-select", ImpowerDeptSelect);
Vue.component("application-authority", ApplicationAuthority);
Vue.component("new-Knowledge-HTM", NewKnowledgeHTML);
//获取并设置appid到根组件
let p2 =  new Promise(resolve => {
  API.getMyProfile(
    {
      onSucess: resp => {
        resolve(resp.data.data);
      } 
    }
  )
});

Promise.all([p2]).then(function (result) {
  new Vue(
 
    {
    data: { appid: result[0].appid, user: result[1], name: result[0].name },
    i18n,
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
});






