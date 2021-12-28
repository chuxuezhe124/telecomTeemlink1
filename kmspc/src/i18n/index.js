import {getCookie} from '@/utils/utils'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import locale from 'element-ui/lib/locale';
import zh from './zh'
import en from './en'
import cn from './cn'
import fr from './fr'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import twLocale from 'element-ui/lib/locale/lang/zh-TW'
import frLocale from 'element-ui/lib/locale/lang/fr'

Vue.use(VueI18n)

const messages = {
  en: Object.assign(en, enLocale),
  cn: Object.assign(zh, zhLocale),
  tw: Object.assign(cn, twLocale),
  fr: Object.assign(fr, frLocale),
}

const i18n = new VueI18n({
  locale: getCookie('USERLANGUAGE') || 'cn', // 语言标识
  messages ,
})

//为了实现element插件的多语言切换[组件中的语言才会修改]
locale.i18n((key, value) => i18n.t(key, value))

export default i18n