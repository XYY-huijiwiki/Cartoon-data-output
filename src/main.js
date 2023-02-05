import { createApp } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';

// 配置国际化插件
const i18n = createI18n({
    legacy: false,
    fallbackLocale: 'zh',
});

let app = createApp(App);
app.use(i18n);
app.mount('#cartoon-data-output');
