import { createI18n } from 'vue-i18n'
import zh from "./zh.json"
import en from "./en.json"
const i18n = createI18n({
    // something vue-i18n options here ...
    legacy: false,
    locale: sessionStorage.getItem('lang') || 'en',
    messages: {
        en: en,
        zh: zh
    }
})
export default i18n
export const t = i18n.global.t

//在普通js中使用方式如下
// import { t } from "@/i18n"
// t("appName")

//在vue模板中使用
//<template>
//    <div>{{ $t("appName") }}</div>
//</template>
